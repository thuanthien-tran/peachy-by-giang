import crypto from 'node:crypto';
import { list, put, del } from '@vercel/blob';

const POSTS_PATH = 'journal/posts.json';

function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || !b.length) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function checkAuth(req) {
  const expected = process.env.ADMIN_PASSWORD || '';
  if (!expected) {
    return { ok: false, status: 503, error: 'ADMIN_PASSWORD is not configured in Vercel Environment Variables.' };
  }
  const provided = String(req.headers['x-admin-password'] || '');
  if (!safeCompare(provided, expected)) {
    return { ok: false, status: 401, error: 'Incorrect admin password.' };
  }
  return { ok: true };
}

async function readPostsFromBlob() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { configured: false, posts: [] };
  }
  const { blobs } = await list({ prefix: POSTS_PATH, limit: 5 });
  const manifest = blobs.find((b) => b.pathname === POSTS_PATH) || blobs[0];
  if (!manifest) {
    return { configured: true, posts: [] };
  }
  const resp = await fetch(`${manifest.url}?t=${Date.now()}`, { cache: 'no-store' });
  if (!resp.ok) {
    return { configured: true, posts: [] };
  }
  const data = await resp.json();
  return { configured: true, posts: Array.isArray(data) ? data : [] };
}

async function savePostsToBlob(posts) {
  await put(POSTS_PATH, JSON.stringify(posts, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') {
      const { configured, posts } = await readPostsFromBlob();
      return res.status(200).json({ ok: true, configured, posts });
    }

    const auth = checkAuth(req);
    if (!auth.ok) {
      return res.status(auth.status).json({ ok: false, error: auth.error });
    }

    if (req.method === 'POST' && req.query && req.query.action === 'verify') {
      return res.status(200).json({
        ok: true,
        blobConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(503).json({
        ok: false,
        error: 'BLOB_READ_WRITE_TOKEN is not configured. Connect a Vercel Blob store in your Vercel Dashboard.',
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const mediaUrl = String(body.mediaUrl || '').trim();
      const mediaType = body.mediaType === 'video' ? 'video' : 'image';
      const captionVi = String(body.captionVi || '').trim().slice(0, 600);
      const captionEn = String(body.captionEn || '').trim().slice(0, 600);
      const tag = String(body.tag || 'Studio Note').trim().slice(0, 32);
      const date = String(body.date || new Date().toISOString().slice(0, 10)).trim().slice(0, 20);

      if (!mediaUrl || (!captionVi && !captionEn)) {
        return res.status(400).json({ ok: false, error: 'Media URL and at least one caption are required.' });
      }

      const { posts } = await readPostsFromBlob();
      const newPost = {
        id: `post_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        mediaUrl,
        mediaType,
        captionVi: captionVi || captionEn,
        captionEn: captionEn || captionVi,
        tag,
        date,
        createdAt: new Date().toISOString(),
      };

      const updated = [newPost, ...posts];
      await savePostsToBlob(updated);
      return res.status(201).json({ ok: true, post: newPost, posts: updated });
    }

    if (req.method === 'DELETE') {
      const id = String((req.query && req.query.id) || '').trim();
      if (!id) {
        return res.status(400).json({ ok: false, error: 'Missing post id.' });
      }
      const { posts } = await readPostsFromBlob();
      const target = posts.find((p) => p.id === id);
      const updated = posts.filter((p) => p.id !== id);
      await savePostsToBlob(updated);

      if (target && target.mediaUrl && target.mediaUrl.includes('.public.blob.vercel-storage.com')) {
        try {
          await del(target.mediaUrl);
        } catch (_) {}
      }

      return res.status(200).json({ ok: true, posts: updated });
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  } catch (err) {
    console.error('[api/journal]', err);
    return res.status(500).json({ ok: false, error: err.message || 'Internal server error.' });
  }
}
