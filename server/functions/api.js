import { existsSync, readFileSync } from 'fs';
import path from 'path';

function resolveDataFile() {
  const cwd = process.cwd();
  const candidates = [
    path.resolve(cwd, 'server', 'data', 'projects.json'),
    path.resolve(cwd, 'data', 'projects.json'),
    path.resolve(cwd, '..', 'server', 'data', 'projects.json'),
    path.resolve(cwd, '..', 'data', 'projects.json'),
    path.resolve('/var/task', 'server', 'data', 'projects.json'),
    path.resolve('/var/task', 'data', 'projects.json')
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return path.resolve(cwd, 'server', 'data', 'projects.json');
}

let fallbackData = { categories: [], projects: [], awards: [] };

try {
  const dataFile = resolveDataFile();
  fallbackData = JSON.parse(readFileSync(dataFile, 'utf8'));
} catch (error) {
  console.warn('Fallback data unavailable:', error.message);
}

function jsonResponse(statusCode, payload) {
  return new Response(JSON.stringify(payload), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    }
  });
}

export async function handler(event = {}) {
  const rawPath = event.path || event.rawPath || event.url || '/';
  const pathname = rawPath.replace(/\/+$/, '') || '/';
  const normalizedPath = pathname.startsWith('/.netlify/functions/api')
    ? pathname.replace('/.netlify/functions/api', '') || '/'
    : pathname;
  const routePath = normalizedPath.startsWith('/api') ? normalizedPath : `/api${normalizedPath}`;

  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { ok: true });
  }

  if (event.httpMethod === 'GET') {
    if (routePath === '/api/categories') {
      return jsonResponse(200, fallbackData.categories || []);
    }
    if (routePath === '/api/projects') {
      return jsonResponse(200, fallbackData.projects || []);
    }
    if (routePath === '/api/awards') {
      return jsonResponse(200, fallbackData.awards || []);
    }
  }

  return jsonResponse(404, { error: 'Not found', path: routePath });
}

export default handler;