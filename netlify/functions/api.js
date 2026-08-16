import crypto from 'crypto';
import fallbackPortfolioData from '../../server/data/projectsData.js';
import supabase from '../../server/config/supabase.js';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

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
    category: (category && String(category).trim()) ? String(category).trim() : null,
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

export const handler = async (event = {}) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  const rawPath = event.path || event.rawPath || event.url || '/';
  const cleanPath = rawPath.replace('/.netlify/functions/api', '').replace(/\/+$/, '') || '/';
  const path = cleanPath.startsWith('/api') ? cleanPath.replace('/api', '') || '/' : cleanPath;
  const method = event.httpMethod || 'GET';

  let body = {};
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      body = {};
    }
  }

  try {
    // ----------------------------------------------------
    // CATEGORIES
    // ----------------------------------------------------
    if (path === '/categories' || path === '/') {
      if (method === 'GET') {
        let categories = (fallbackPortfolioData.categories || []).map(normalizeCategoryRow);
        if (supabase) {
          try {
            const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
            if (!error && data && data.length) {
              categories = data.map(normalizeCategoryRow);
            }
          } catch (e) {
            console.warn('Supabase categories error:', e.message);
          }
        }
        return { statusCode: 200, headers, body: JSON.stringify(categories) };
      }

      if (method === 'POST') {
        if (!supabase) {
          return { statusCode: 503, headers, body: JSON.stringify({ error: 'Database configuration unavailable on Netlify serverless environment.' }) };
        }
        const { name, imagePosition, image } = body;
        let id = name?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `cat-${Date.now()}`;
        const newCat = serializeCategoryRow({ id, name, image, imagePosition });
        const { data, error } = await supabase.from('categories').insert([newCat]).select().single();
        if (error) return { statusCode: 400, headers, body: JSON.stringify({ error: error.message }) };
        return { statusCode: 201, headers, body: JSON.stringify(normalizeCategoryRow(data)) };
      }
    }

    if (path.startsWith('/categories/')) {
      const id = path.replace('/categories/', '');
      if (method === 'PUT') {
        if (!supabase) {
          return { statusCode: 503, headers, body: JSON.stringify({ error: 'Database configuration unavailable on Netlify serverless environment.' }) };
        }
        const { name, imagePosition, image } = body;
        const updated = serializeCategoryRow({ id, name, image, imagePosition });
        const { data, error } = await supabase.from('categories').update(updated).eq('id', id).select().single();
        if (error) return { statusCode: 400, headers, body: JSON.stringify({ error: error.message }) };
        return { statusCode: 200, headers, body: JSON.stringify(normalizeCategoryRow(data)) };
      }

      if (method === 'DELETE') {
        if (!supabase) {
          return { statusCode: 503, headers, body: JSON.stringify({ error: 'Database configuration unavailable on Netlify serverless environment.' }) };
        }
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) return { statusCode: 400, headers, body: JSON.stringify({ error: error.message }) };
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Category deleted successfully' }) };
      }
    }

    // ----------------------------------------------------
    // PROJECTS
    // ----------------------------------------------------
    if (path === '/projects') {
      if (method === 'GET') {
        let projects = (fallbackPortfolioData.projects || []).map(normalizeProjectRow);
        if (supabase) {
          try {
            const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
            if (!error && data && data.length) {
              projects = data.map(normalizeProjectRow);
            }
          } catch (e) {
            console.warn('Supabase projects error:', e.message);
          }
        }
        return { statusCode: 200, headers, body: JSON.stringify(projects) };
      }

      if (method === 'POST') {
        if (!supabase) {
          return { statusCode: 503, headers, body: JSON.stringify({ error: 'Database configuration unavailable on Netlify serverless environment.' }) };
        }
        const id = crypto.randomBytes(8).toString('hex');
        const newProj = serializeProjectRow({ ...body, id });
        const { data, error } = await supabase.from('projects').insert([newProj]).select().single();
        if (error) return { statusCode: 400, headers, body: JSON.stringify({ error: error.message }) };
        return { statusCode: 201, headers, body: JSON.stringify(normalizeProjectRow(data)) };
      }
    }

    if (path.startsWith('/projects/')) {
      const id = path.replace('/projects/', '');
      if (method === 'PUT') {
        if (!supabase) {
          return { statusCode: 503, headers, body: JSON.stringify({ error: 'Database configuration unavailable on Netlify serverless environment.' }) };
        }
        const updatedProj = serializeProjectRow({ ...body, id });
        const { data, error } = await supabase.from('projects').update(updatedProj).eq('id', id).select().single();
        if (error) return { statusCode: 400, headers, body: JSON.stringify({ error: error.message }) };
        return { statusCode: 200, headers, body: JSON.stringify(normalizeProjectRow(data)) };
      }

      if (method === 'DELETE') {
        if (!supabase) {
          return { statusCode: 503, headers, body: JSON.stringify({ error: 'Database configuration unavailable on Netlify serverless environment.' }) };
        }
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) return { statusCode: 400, headers, body: JSON.stringify({ error: error.message }) };
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Project deleted successfully' }) };
      }
    }

    // ----------------------------------------------------
    // AWARDS
    // ----------------------------------------------------
    if (path === '/awards') {
      if (method === 'GET') {
        let awards = (fallbackPortfolioData.awards || []).map(normalizeAwardRow);
        if (supabase) {
          try {
            const { data, error } = await supabase.from('awards').select('*').order('created_at', { ascending: false });
            if (!error && data && data.length) {
              awards = data.map(normalizeAwardRow);
            }
          } catch (e) {
            console.warn('Supabase awards error:', e.message);
          }
        }
        return { statusCode: 200, headers, body: JSON.stringify(awards) };
      }

      if (method === 'POST') {
        if (!supabase) {
          return { statusCode: 503, headers, body: JSON.stringify({ error: 'Database configuration unavailable on Netlify serverless environment.' }) };
        }
        const id = crypto.randomBytes(8).toString('hex');
        const newAward = serializeAwardRow({ ...body, id });
        const { data, error } = await supabase.from('awards').insert([newAward]).select().single();
        if (error) return { statusCode: 400, headers, body: JSON.stringify({ error: error.message }) };
        return { statusCode: 201, headers, body: JSON.stringify(normalizeAwardRow(data)) };
      }
    }

    if (path.startsWith('/awards/')) {
      const id = path.replace('/awards/', '');
      if (method === 'PUT') {
        if (!supabase) {
          return { statusCode: 503, headers, body: JSON.stringify({ error: 'Database configuration unavailable on Netlify serverless environment.' }) };
        }
        const updatedAward = serializeAwardRow({ ...body, id });
        const { data, error } = await supabase.from('awards').update(updatedAward).eq('id', id).select().single();
        if (error) return { statusCode: 400, headers, body: JSON.stringify({ error: error.message }) };
        return { statusCode: 200, headers, body: JSON.stringify(normalizeAwardRow(data)) };
      }

      if (method === 'DELETE') {
        if (!supabase) {
          return { statusCode: 503, headers, body: JSON.stringify({ error: 'Database configuration unavailable on Netlify serverless environment.' }) };
        }
        const { error } = await supabase.from('awards').delete().eq('id', id);
        if (error) return { statusCode: 400, headers, body: JSON.stringify({ error: error.message }) };
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Award deleted successfully' }) };
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint not found', path, method })
    };
  } catch (error) {
    console.error('API Function Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message })
    };
  }
};

export default handler;
