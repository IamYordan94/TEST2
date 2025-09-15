import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { rateLimit } from '@/lib/anticheat/ratelimit';
import { verifyMatchSignature } from '@/lib/anticheat/signing';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local';
  const rl = rateLimit(`score:${ip}`, 10, 60_000);
  if (rl.ok === false) return new Response('Too Many Requests', { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } });

  const body = await req.json().catch(() => null);
  if (!body) return new Response('Bad Request', { status: 400 });
  const { userId, mode, value, seed, endAtMs, signature } = body as { userId: string; mode: 'endless' | 'duel'; value: number; seed: string; endAtMs: number; signature: string };
  if (!userId || !mode || typeof value !== 'number' || !seed || typeof endAtMs !== 'number' || !signature) return new Response('Bad Request', { status: 400 });

  const secret = process.env.MATCH_SIGNING_SECRET ?? '';
  if (secret !== '' || process.env.VERCEL === '1') {
    const ok = verifyMatchSignature({ userId, mode, value, seed, endAtMs, signature }, secret);
    if (!ok) return new Response('Invalid signature', { status: 400 });
  }

  await prisma.score.create({ data: { userId, mode, value } });
  return Response.json({ ok: true });
}

