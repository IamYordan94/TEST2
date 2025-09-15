import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Lightweight query to validate connection
    const ping = await prisma.$queryRawUnsafe('SELECT 1 as ok');
    // Verify at least one model exists by counting scores (table created by migration)
    const count = await prisma.score.count().catch(() => -1);
    return Response.json({ ok: true, ping, scoreTableReachable: count !== -1, scoreCount: count });
  } catch (e: any) {
    return Response.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}

