import crypto from 'node:crypto';
import { handleUpload } from '@vercel/blob/client';

function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || !b.length) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const expected = process.env.ADMIN_PASSWORD || '';
        let provided = String(req.headers['x-admin-password'] || '');
        if (!provided && clientPayload) {
          try {
            const parsed = JSON.parse(clientPayload);
            provided = String(parsed.password || '');
          } catch (_) {}
        }
        if (!expected || !safeCompare(provided, expected)) {
          throw new Error('Unauthorized admin upload');
        }

        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'video/mp4',
            'video/quicktime',
            'video/webm',
          ],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50 MB max for short studio clips
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });

    return res.status(200).json(jsonResponse);
  } catch (err) {
    const status = err && String(err.message).includes('Unauthorized') ? 401 : 400;
    return res.status(status).json({ error: err.message || 'Upload token error' });
  }
}
