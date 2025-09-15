import * as Ably from 'ably';

export async function createRealtimeClient(): Promise<Ably.Realtime}> {
  const res = await fetch('/api/ably/token', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to get Ably token');
  const { tokenRequest } = await res.json();
  const client = new Ably.Realtime.Promise({ authUrl: undefined, authCallback: (_tokenParams, callback) => callback(null, tokenRequest) });
  return client as unknown as Ably.Realtime;
}

