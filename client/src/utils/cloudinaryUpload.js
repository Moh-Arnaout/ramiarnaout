/**
 * Upload a file directly to Cloudinary from the browser.
 * Gets a short-lived signature from our backend, then POSTs
 * the file directly to Cloudinary's upload API.
 *
 * @param {File} file - The File object to upload
 * @param {string} backendUrl - Base URL of our backend (e.g. '')
 * @returns {{ url: string, publicId: string, resourceType: string }}
 */
export async function uploadToCloudinary(file, backendUrl) {
  // 1. Get a signed upload token from our server
  const sigRes = await fetch(`${backendUrl}/api/cloudinary-signature`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!sigRes.ok) {
    const err = await sigRes.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to get upload signature');
  }

  const { signature, timestamp, apiKey, cloudName, folder } = await sigRes.json();

  // 2. Determine resource type
  const isVideo = file.type?.startsWith('video');
  const resourceType = isVideo ? 'video' : 'image';

  // 3. Build multipart form and POST directly to Cloudinary
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', apiKey);
  form.append('timestamp', timestamp);
  form.append('signature', signature);
  form.append('folder', folder);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  const uploadRes = await fetch(uploadUrl, { method: 'POST', body: form });

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Cloudinary upload failed');
  }

  const result = await uploadRes.json();
  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType
  };
}

/**
 * Upload multiple files to Cloudinary in parallel.
 * @param {File[]} files
 * @param {string} backendUrl
 * @returns {Array<{ url, publicId, resourceType }>}
 */
export async function uploadFilesToCloudinary(files, backendUrl) {
  if (!files || files.length === 0) return [];
  return Promise.all(files.map(f => uploadToCloudinary(f, backendUrl)));
}
