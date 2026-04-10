const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)vidget_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function req(method: string, path: string, body?: any) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    req('POST', '/api/auth/login', { email, password }),
  me: () => req('GET', '/api/auth/me'),

  // Posts
  getPosts: () => req('GET', '/api/admin/posts'),
  createPost: (data: any) => req('POST', '/api/admin/posts', data),
  updatePost: (id: number, data: any) => req('PUT', `/api/admin/posts/${id}`, data),
  deletePost: (id: number) => req('DELETE', `/api/admin/posts/${id}`),

  // Ads
  getAds: () => req('GET', '/api/admin/ads'),
  createAd: (data: any) => req('POST', '/api/admin/ads', data),
  updateAd: (id: number, data: any) => req('PUT', `/api/admin/ads/${id}`, data),
  deleteAd: (id: number) => req('DELETE', `/api/admin/ads/${id}`),

  // Messages
  getMessages: () => req('GET', '/api/admin/messages'),
  markRead: (id: number) => req('PATCH', `/api/admin/messages/${id}/read`),

  // Newsletter
  getSubscribers: () => req('GET', '/api/admin/newsletter'),
};
