const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:5000';

export interface VideoInfo {
  title: string;
  duration: number;
  thumbnail: string;
  platform: string;
  formats: VideoFormat[];
  uploader?: string;
  view_count?: number;
}

export interface VideoFormat {
  format_id: string;
  quality: string;
  ext: string;
  filesize?: number;
  vcodec?: string;
  acodec?: string;
  type: 'video' | 'audio' | 'video_only';
}

export interface DownloadRequest {
  url: string;
  format_id: string;
  browser_id: string;
}

export async function analyzeVideo(url: string): Promise<VideoInfo> {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getDownloadUrl(req: DownloadRequest): Promise<{ download_url: string }> {
  const res = await fetch(`${API_BASE}/api/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function likePost(postId: string, browserId: string): Promise<{ likes: number }> {
  const res = await fetch(`${API_BASE}/api/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ post_id: postId, browser_id: browserId }),
  });
  if (!res.ok) throw new Error('Like failed');
  return res.json();
}

export async function subscribeNewsletter(email: string, lang: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, lang }),
  });
  if (!res.ok) throw new Error('Subscribe failed');
}

export async function submitContact(data: { name: string; email: string; message: string }): Promise<void> {
  const res = await fetch(`${API_BASE}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Submit failed');
}

export async function fetchBlogPosts(lang: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/blog?lang=${lang}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchBlogPost(slug: string, lang: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/blog/${slug}?lang=${lang}`);
  if (!res.ok) throw new Error('Post not found');
  return res.json();
}
