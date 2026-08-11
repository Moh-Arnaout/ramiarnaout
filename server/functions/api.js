import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let fallbackData = { categories: [], projects: [], awards: [] };

try {
  fallbackData = JSON.parse(
    readFileSync(path.join(__dirname, '..', 'data', 'projects.json'), 'utf8')
  );
} catch (err) {
  console.warn('Fallback data unavailable:', err.message);
}

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    },
    body: JSON.stringify(payload),
  };
}

export async function handler(event = {}) {
  const pathname = (event.path || '/').replace(/\/+$/, '') || '/';

  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { ok: true });
  }

  if (event.httpMethod === 'GET') {
    if (pathname === '/api/categories') {
      return jsonResponse(200, fallbackData.categories || []);
    }
    if (pathname === '/api/projects') {
      return jsonResponse(200, fallbackData.projects || []);
    }
    if (pathname === '/api/awards') {
      return jsonResponse(200, fallbackData.awards || []);
    }
  }

  return jsonResponse(404, { error: 'Not found' });
}

export default handler;