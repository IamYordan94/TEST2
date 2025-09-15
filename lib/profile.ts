export async function getOrCreateGuestUserId(): Promise<string> {
  if (typeof window === 'undefined') return 'server';
  const key = 'wcc_user_id';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const res = await fetch('/api/profile', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to create profile');
  const json = await res.json();
  localStorage.setItem(key, json.userId);
  return json.userId;
}

