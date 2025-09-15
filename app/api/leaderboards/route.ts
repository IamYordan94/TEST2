import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode') ?? 'endless';
  const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 100);

  const items = await prisma.score.findMany({
    where: { mode, period: 'daily' },
    orderBy: { value: 'desc' },
    take: limit,
    select: { userId: true, value: true, occurredAt: true },
  });
  return Response.json({ items });
}

