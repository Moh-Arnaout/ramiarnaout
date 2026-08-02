import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { existsSync, unlink } from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';
import fallbackPortfolioData from './data/projects.json' with { type: 'json' };

// Import your custom config modules
import upload from './config/cloudinary.js';
import supabase from './config/supabase.js';

// Recreate __dirname and __filename for ES Module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../client/dist')));

// Helper: Safely parse JSON inputs from FormData text fields
function safeJsonParse(data, fallback = []) {
  if (!data) return fallback;
  if (Array.isArray(data)) return data;
  try {
    return JSON.parse(data);
  } catch (e) {
    return [data];
  }
}

function normalizeUploadedFile(file) {
  return {
    url: file.path || file.secure_url || '',
    publicId: file.public_id || file.filename || '',
    resourceType: file.resource_type || (file.mimetype && file.mimetype.startsWith('video') ? 'video' : 'image')
  };
}

// Data Normalization / Serialization Helpers for Supabase Mapping
function normalizeCategoryRow(category) {
  if (!category) return null;
  return {
    id: category.id,
    name: category.name,
    image: category.image || '/uploads/logo.png',
    imagePublicId: category.image_public_id || category.imagePublicId || '',
    imageResourceType: category.image_resource_type || category.imageResourceType || 'image',
    imagePosition: category.image_position || category.imagePosition || '50% 50%'
  };
}

function serializeCategoryRow({ id, name, image, imagePublicId, imageResourceType, imagePosition }) {
  return {
    id,
    name,
    image: image || '/uploads/logo.png',
    image_public_id: imagePublicId || '',
    image_resource_type: imageResourceType || 'image',
    image_position: imagePosition || '50% 50%'
  };
}

function normalizeProjectRow(project) {
  if (!project) return null;
  return {
    id: project.id,
    title: project.title,
    description: project.description || '',
    category: project.category || '',
    date: project.date || '',
    location: project.location || '',
    images: project.images || [],
    imagePublicIds: project.image_public_ids || [],
    imageResourceTypes: project.image_resource_types || [],
    mainImage: project.main_image || '/uploads/logo.png',
    mainImagePublicId: project.main_image_public_id || '',
    mainImageResourceType: project.main_image_resource_type || 'image',
    imagePositions: project.image_positions || []
  };
}

function serializeProjectRow({
  id, title, description, category, date, location, images,
  imagePublicIds, imageResourceTypes, mainImage, mainImagePublicId,
  mainImageResourceType, imagePositions
}) {
  return {
    id,
    title,
    description: description || '',
    category: category || '',
    date: date || '',
    location: location || '',
    images: images || [],
    image_public_ids: imagePublicIds || [],
    image_resource_types: imageResourceTypes || [],
    main_image: mainImage || '/uploads/logo.png',
    main_image_public_id: mainImagePublicId || '',
    main_image_resource_type: mainImageResourceType || 'image',
    image_positions: imagePositions || []
  };
}

function normalizeAwardRow(award) {
  if (!award) return null;
  return {
    id: award.id,
    project: award.project,
    year: award.year,
    location: award.location || '',
    award: award.award || '',
    office: award.office || '',
    image: award.image || '',
    imagePublicId: award.image_public_id || award.imagePublicId || '',
    imageResourceType: award.image_resource_type || award.imageResourceType || 'image',
    imagePosition: award.image_position || award.imagePosition || '50% 50%'
  };
}

function serializeAwardRow({ id, project, year, location, award, office, image, imagePublicId, imageResourceType, imagePosition }) {
  return {
    id,
    project,
    year,
    location: location || '',
    award: award || '',
    office: office || '',
    image: image || '',
    image_public_id: imagePublicId || '',
    image_resource_type: imageResourceType || 'image',
    image_position: imagePosition || '50% 50%'
  };
}

function ensureSupabase(res) {
  if (supabase) {
    return true;
  }

  res.status(503).json({
    error: 'Database configuration is unavailable in this deployment. Set Supabase environment variables to enable updates.'
  });
  return false;
}

async function removeStoredMedia({ url, publicId, resourceType }) {
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType || 'image' });
      return;
    } catch (err) {
      console.error('Error deleting Cloudinary asset:', err);
    }
  }

  if (url && url.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, 'public', url);
    try {
      await unlink(filePath);
    } catch (err) {
      // Ignore missing local files
    }
  }
}

// ==========================================
// 1. CATEGORIES API
// ==========================================

app.get('/api/categories', async (req, res) => {
  try {
    if (!supabase) {
      return res.json((fallbackPortfolioData.categories || []).map(normalizeCategoryRow));
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json((data || []).map(normalizeCategoryRow));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch categories' });
  }
});

app.post('/api/categories', upload.single('image'), async (req, res) => {
  let uploadedImage = null;
  try {
    if (!ensureSupabase(res)) return;

    const { name, imagePosition } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    let id = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!id) id = `cat-${Date.now()}`;

    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (existingCategory) {
      return res.status(400).json({ error: `Category "${name}" already exists` });
    }

    uploadedImage = req.file ? normalizeUploadedFile(req.file) : null;
    const imagePath = uploadedImage ? uploadedImage.url : '/uploads/logo.png';

    const newCategory = serializeCategoryRow({
      id,
      name: name.trim(),
      image: imagePath,
      imagePublicId: uploadedImage ? uploadedImage.publicId : '',
      imageResourceType: uploadedImage ? uploadedImage.resourceType : 'image',
      imagePosition: imagePosition || '50% 50%'
    });

    const { data, error } = await supabase
      .from('categories')
      .insert([newCategory])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(normalizeCategoryRow(data));
  } catch (err) {
    console.error('Error creating category:', err);

    if (uploadedImage?.publicId) {
      await removeStoredMedia({
        url: uploadedImage.url,
        publicId: uploadedImage.publicId,
        resourceType: uploadedImage.resourceType
      }).catch(e => console.error('Failed to cleanup orphan upload:', e));
    }

    res.status(500).json({ error: err.message });
  }
});

app.put('/api/categories/:id', upload.single('image'), async (req, res) => {
  let uploadedImage = null;
  try {
    if (!ensureSupabase(res)) return;

    const { id } = req.params;
    const { name, imagePosition } = req.body;

    const { data: existingCategory } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    uploadedImage = req.file ? normalizeUploadedFile(req.file) : null;

    const updatedCategory = {
      ...normalizeCategoryRow(existingCategory),
      name: name?.trim() || existingCategory.name,
      image: uploadedImage ? uploadedImage.url : existingCategory.image,
      imagePublicId: uploadedImage ? uploadedImage.publicId : existingCategory.image_public_id,
      imageResourceType: uploadedImage ? uploadedImage.resourceType : existingCategory.image_resource_type,
      imagePosition: imagePosition !== undefined ? imagePosition : existingCategory.image_position
    };

    const { data, error } = await supabase
      .from('categories')
      .update(serializeCategoryRow(updatedCategory))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (uploadedImage && existingCategory.image_public_id) {
      await removeStoredMedia({
        url: existingCategory.image,
        publicId: existingCategory.image_public_id,
        resourceType: existingCategory.image_resource_type
      }).catch(e => console.error('Failed to delete old image:', e));
    }

    res.json(normalizeCategoryRow(data));
  } catch (err) {
    console.error('Error updating category:', err);

    if (uploadedImage?.publicId) {
      await removeStoredMedia({
        url: uploadedImage.url,
        publicId: uploadedImage.publicId,
        resourceType: uploadedImage.resourceType
      }).catch(e => console.error('Failed to cleanup orphan upload:', e));
    }

    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    if (!ensureSupabase(res)) return;

    const { id } = req.params;

    const { data: oldCat } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!oldCat) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Unlink category from any projects that referenced it
    await supabase
      .from('projects')
      .update({ category: '' })
      .eq('category', id);

    if (oldCat.image_public_id) {
      await removeStoredMedia({
        url: oldCat.image,
        publicId: oldCat.image_public_id,
        resourceType: oldCat.image_resource_type
      }).catch(e => console.error('Failed to remove media on deletion:', e));
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. PROJECTS API
// ==========================================

app.get('/api/projects', async (req, res) => {
  try {
    if (!supabase) {
      return res.json((fallbackPortfolioData.projects || []).map(normalizeProjectRow));
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json((data || []).map(normalizeProjectRow));
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', upload.array('images', 10), async (req, res) => {
  let uploadedImages = [];
  try {
    if (!ensureSupabase(res)) return;

    const { title, description, category, date, location, imagePositions } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: 'Title and Category are required fields' });
    }

    const id = crypto.randomBytes(8).toString('hex');
    uploadedImages = req.files ? req.files.map(normalizeUploadedFile) : [];

    const imagePaths = uploadedImages.map(f => f.url);
    const imagePublicIds = uploadedImages.map(f => f.publicId);
    const imageResourceTypes = uploadedImages.map(f => f.resourceType);

    const finalImages = imagePaths.length > 0 ? imagePaths : ['/uploads/logo.png'];
    let parsedImagePositions = safeJsonParse(imagePositions, []);

    while (parsedImagePositions.length < finalImages.length) {
      parsedImagePositions.push('50% 50%');
    }

    const newProject = serializeProjectRow({
      id,
      title: title.trim(),
      description: description || '',
      category,
      date: date || new Date().getFullYear().toString(),
      location: location || '',
      images: finalImages,
      imagePublicIds,
      imageResourceTypes,
      mainImage: finalImages[0],
      mainImagePublicId: imagePublicIds[0] || '',
      mainImageResourceType: imageResourceTypes[0] || 'image',
      imagePositions: parsedImagePositions
    });

    const { data, error } = await supabase
      .from('projects')
      .insert([newProject])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(normalizeProjectRow(data));
  } catch (err) {
    console.error('Error creating project:', err);

    // Rollback uploaded media on DB error
    if (uploadedImages.length > 0) {
      await Promise.all(uploadedImages.map(img =>
        removeStoredMedia({ url: img.url, publicId: img.publicId, resourceType: img.resourceType })
      )).catch(e => console.error('Failed to cleanup orphan uploads:', e));
    }

    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:id', upload.array('images', 10), async (req, res) => {
  let newUploaded = [];
  try {
    if (!ensureSupabase(res)) return;

    const { id } = req.params;
    const { title, description, category, date, location, existingImages, existingImagePublicIds, existingImageResourceTypes, imagePositions } = req.body;

    const { data: oldProject } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!oldProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const parsedExistingImages = safeJsonParse(existingImages, []);
    const parsedExistingPublicIds = safeJsonParse(existingImagePublicIds, []);
    const parsedExistingResourceTypes = safeJsonParse(existingImageResourceTypes, []);

    // Find and delete removed images/videos from Cloudinary
    if (oldProject.image_public_ids) {
      const removedPublicIds = oldProject.image_public_ids.filter(pid => pid && !parsedExistingPublicIds.includes(pid));
      await Promise.all(removedPublicIds.map(pid => {
        const idx = oldProject.image_public_ids.indexOf(pid);
        const resourceType = (oldProject.image_resource_types && oldProject.image_resource_types[idx]) || 'image';
        return removeStoredMedia({ publicId: pid, resourceType });
      }));
    }

    newUploaded = req.files ? req.files.map(normalizeUploadedFile) : [];
    const mergedImages = [...parsedExistingImages, ...newUploaded.map(f => f.url)];
    const mergedPublicIds = [...parsedExistingPublicIds, ...newUploaded.map(f => f.publicId)];
    const mergedResourceTypes = [...parsedExistingResourceTypes, ...newUploaded.map(f => f.resourceType)];

    const mainImage = mergedImages.length > 0 ? mergedImages[0] : '/uploads/logo.png';
    let parsedPositions = safeJsonParse(imagePositions, []);

    while (parsedPositions.length < mergedImages.length) {
      parsedPositions.push('50% 50%');
    }

    const updatedProject = serializeProjectRow({
      id,
      title: title?.trim() || oldProject.title,
      description: description !== undefined ? description : oldProject.description,
      category: category || oldProject.category,
      date: date || oldProject.date,
      location: location || oldProject.location,
      images: mergedImages.length > 0 ? mergedImages : [mainImage],
      imagePublicIds: mergedPublicIds,
      imageResourceTypes: mergedResourceTypes,
      mainImage,
      mainImagePublicId: mergedPublicIds[0] || '',
      mainImageResourceType: mergedResourceTypes[0] || 'image',
      imagePositions: parsedPositions
    });

    const { data, error } = await supabase
      .from('projects')
      .update(updatedProject)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(normalizeProjectRow(data));
  } catch (err) {
    console.error('Error updating project:', err);

    if (newUploaded.length > 0) {
      await Promise.all(newUploaded.map(img =>
        removeStoredMedia({ url: img.url, publicId: img.publicId, resourceType: img.resourceType })
      )).catch(e => console.error('Failed to cleanup orphan uploads:', e));
    }

    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    if (!ensureSupabase(res)) return;

    const { id } = req.params;

    const { data: projectToDelete } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!projectToDelete) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Delete media assets from Cloudinary
    if (projectToDelete.images) {
      await Promise.all(projectToDelete.images.map((img, idx) =>
        removeStoredMedia({
          url: img,
          publicId: projectToDelete.image_public_ids?.[idx],
          resourceType: projectToDelete.image_resource_types?.[idx]
        })
      ));
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. AWARDS API
// ==========================================

app.get('/api/awards', async (req, res) => {
  try {
    if (!supabase) {
      return res.json((fallbackPortfolioData.awards || []).map(normalizeAwardRow));
    }

    const { data, error } = await supabase
      .from('awards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json((data || []).map(normalizeAwardRow));
  } catch (err) {
    console.error('Error fetching awards:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/awards', upload.single('image'), async (req, res) => {
  let uploadedImage = null;
  try {
    if (!ensureSupabase(res)) return;

    const { title, year, location, awardPlace, office, imagePosition } = req.body;
    if (!title || !year) {
      return res.status(400).json({ error: 'Title and Year are required' });
    }

    const id = crypto.randomBytes(8).toString('hex');
    uploadedImage = req.file ? normalizeUploadedFile(req.file) : null;

    const newAward = serializeAwardRow({
      id,
      project: title.trim(),
      year: year.toString(),
      location: location || '',
      award: awardPlace || '',
      office: office || '',
      image: uploadedImage ? uploadedImage.url : '',
      imagePublicId: uploadedImage ? uploadedImage.publicId : '',
      imageResourceType: uploadedImage ? uploadedImage.resourceType : 'image',
      imagePosition: imagePosition || '50% 50%'
    });

    const { data, error } = await supabase
      .from('awards')
      .insert([newAward])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(normalizeAwardRow(data));
  } catch (err) {
    console.error('Error creating award:', err);

    if (uploadedImage?.publicId) {
      await removeStoredMedia({
        url: uploadedImage.url,
        publicId: uploadedImage.publicId,
        resourceType: uploadedImage.resourceType
      }).catch(e => console.error('Failed to cleanup orphan upload:', e));
    }

    res.status(500).json({ error: err.message });
  }
});

app.put('/api/awards/:id', upload.single('image'), async (req, res) => {
  let uploadedImage = null;
  try {
    if (!ensureSupabase(res)) return;

    const { id } = req.params;
    const { title, year, location, awardPlace, office, imagePosition } = req.body;

    const { data: oldAward } = await supabase
      .from('awards')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!oldAward) {
      return res.status(404).json({ error: 'Award not found' });
    }

    uploadedImage = req.file ? normalizeUploadedFile(req.file) : null;

    const updatedAward = serializeAwardRow({
      id,
      project: title?.trim() || oldAward.project,
      year: year || oldAward.year,
      location: location !== undefined ? location : oldAward.location,
      award: awardPlace !== undefined ? awardPlace : oldAward.award,
      office: office !== undefined ? office : oldAward.office,
      image: uploadedImage ? uploadedImage.url : oldAward.image,
      imagePublicId: uploadedImage ? uploadedImage.publicId : oldAward.image_public_id,
      imageResourceType: uploadedImage ? uploadedImage.resourceType : oldAward.image_resource_type,
      imagePosition: imagePosition !== undefined ? imagePosition : oldAward.image_position
    });

    const { data, error } = await supabase
      .from('awards')
      .update(updatedAward)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (uploadedImage && oldAward.image_public_id) {
      await removeStoredMedia({
        url: oldAward.image,
        publicId: oldAward.image_public_id,
        resourceType: oldAward.image_resource_type
      }).catch(e => console.error('Failed to delete old image:', e));
    }

    res.json(normalizeAwardRow(data));
  } catch (err) {
    console.error('Error updating award:', err);

    if (uploadedImage?.publicId) {
      await removeStoredMedia({
        url: uploadedImage.url,
        publicId: uploadedImage.publicId,
        resourceType: uploadedImage.resourceType
      }).catch(e => console.error('Failed to cleanup orphan upload:', e));
    }

    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/awards/:id', async (req, res) => {
  try {
    if (!ensureSupabase(res)) return;

    const { id } = req.params;

    const { data: awardToDelete } = await supabase
      .from('awards')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!awardToDelete) {
      return res.status(404).json({ error: 'Award not found' });
    }

    const { error: deleteError } = await supabase
      .from('awards')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    if (awardToDelete.image_public_id) {
      await removeStoredMedia({
        url: awardToDelete.image,
        publicId: awardToDelete.image_public_id,
        resourceType: awardToDelete.image_resource_type
      }).catch(e => console.error('Failed to delete award image:', e));
    }

    res.json({ message: 'Award deleted successfully' });
  } catch (err) {
    console.error('Error deleting award:', err);
    res.status(500).json({ error: err.message });
  }
});

// SPA Catch-all Route
app.get('/*splat', (req, res) => {
  const clientIndexPath = path.join(__dirname, '../client/dist/index.html');
  if (existsSync(clientIndexPath)) {
    res.sendFile(clientIndexPath);
  } else {
    res.status(404).send('API endpoint not found (or React Build is missing)');
  }
});

// Remove serverless-http from here and just export app
// At the bottom of server/server.js:

// Only run app.listen when NOT on Netlify serverless environment
if (!process.env.NETLIFY && process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Backend local server running on http://localhost:${PORT}`);
  });
}

export default app;
