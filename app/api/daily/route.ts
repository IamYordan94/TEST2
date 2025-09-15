import { NextRequest } from 'next/server';
import crypto from 'crypto';

export async function GET(_req: NextRequest) {
  const secret = process.env.DAILY_SEED_SECRET;
  if (!secret) return new Response('Missing DAILY_SEED_SECRET', { status: 500 });
  const dateIso = new Date().toISOString().slice(0, 10);
  const seed = crypto.createHmac('sha256', secret).update(dateIso).digest('hex').slice(0, 16);
  return Response.json({ date: dateIso, seed });
}

