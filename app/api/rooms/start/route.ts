import { NextRequest } from 'next/server';
import { createAblyRest } from '@/lib/ably';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { roomId } = await req.json();
    if (!roomId) return new Response('Bad Request', { status: 400 });
    const rest = createAblyRest();
    const channel = rest.channels.get(`rooms:${roomId}`);
    const now = Date.now();
    const startAtMs = now + 3000; // 3s countdown
    const endAtMs = startAtMs + 90_000;
    const seed = crypto.randomBytes(8).toString('hex');
    const bannedLetter = String.fromCharCode('a'.charCodeAt(0) + Math.floor(Math.random() * 26));
    await channel.publish('state', {
      type: 'state',
      seed,
      startAtMs,
      endAtMs,
      sudden: { startsAtMs: endAtMs - 30_000, bannedLetter },
    });
    return Response.json({ ok: true, startAtMs, endAtMs });
  } catch (e) {
    return new Response('Failed to start match', { status: 500 });
  }
}

