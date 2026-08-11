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
  const rawPath = event.path || event.rawPath || '/';
  const pathname = rawPath.replace(/\/+$/, '') || '/';

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