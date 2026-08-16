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

export const handler = async (event = {}) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  const rawPath = event.path || event.rawPath || event.url || '/';
  const cleanPath = rawPath.replace('/.netlify/functions/api', '').replace(/\/+$/, '') || '/';
  const path = cleanPath.startsWith('/api') ? cleanPath.replace('/api', '') || '/' : cleanPath;
  const method = event.httpMethod || 'GET';

  try {
    if (method === 'GET') {
      if (path === '/categories' || path === '/') {
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

      if (path === '/projects') {
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

      if (path === '/awards') {
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
