export function getBrowserId(): string {
  if (typeof localStorage === 'undefined') return 'server';
  let id = localStorage.getItem('vidget_browser_id');
  if (!id) {
    id = 'uid_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('vidget_browser_id', id);
  }
  return id;
}

export function hasLiked(postId: string): boolean {
  if (typeof localStorage === 'undefined') return false;
  const liked = JSON.parse(localStorage.getItem('vidget_likes') || '[]');
  return liked.includes(postId);
}

export function markLiked(postId: string): void {
  if (typeof localStorage === 'undefined') return;
  const liked = JSON.parse(localStorage.getItem('vidget_likes') || '[]');
  if (!liked.includes(postId)) {
    liked.push(postId);
    localStorage.setItem('vidget_likes', JSON.stringify(liked));
  }
}
