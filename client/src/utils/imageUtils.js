export function formatImageUrl(url, backendUrl = '') {
  if (!url) return '/uploads/logo.png';
  const cleanUrl = String(url).trim();
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('data:')) {
    return cleanUrl;
  }
  if (cleanUrl.startsWith('/uploads') || cleanUrl.startsWith('/assets') || cleanUrl.startsWith('/')) {
    return backendUrl ? `${backendUrl}${cleanUrl}` : cleanUrl;
  }
  // Cloudinary public ID or filename fallback (e.g. cad2ghjfemmdx73wk3zc.png or rami_arnaout_portfolio/...)
  return `https://res.cloudinary.com/jzexsx0o/image/upload/${cleanUrl}`;
}
