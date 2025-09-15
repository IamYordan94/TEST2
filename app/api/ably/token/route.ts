import { NextRequest } from 'next/server';
import Ably from 'ably/promises';

export async function GET(_req: NextRequest) {
  try {
    const apiKey = process.env.ABLY_API_KEY;
    if (!apiKey) return new Response('Missing ABLY_API_KEY', { status: 500 });
    const client = new Ably.Rest(apiKey);
    const tokenRequest = await client.auth.createTokenRequest({ clientId: 'guest' });
    return Response.json({ tokenRequest });
  } catch (e) {
    return new Response('Failed to create token', { status: 500 });
  }
}

