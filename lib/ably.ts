import Ably from 'ably/promises';

export function createAblyRest() {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) throw new Error('ABLY_API_KEY missing');
  return new Ably.Rest(apiKey);
}

