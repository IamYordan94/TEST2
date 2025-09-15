import Ably from 'ably/promises';

export async function createRealtimeClient() {
  const res = await fetch('/api/ably/token', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to get Ably token');
  const { tokenRequest } = await res.json();
  const client = new Ably.Realtime.Promise({ authCallback: (_tokenParams, callback) => callback(null, tokenRequest) });
  return client;
}


