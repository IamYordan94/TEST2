import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const user = await prisma.user.create({ data: {} });
    const profile = await prisma.profile.create({ data: { userId: user.id } });
    return Response.json({ userId: user.id, profile: { xp: profile.xp, rank: profile.rank } });
  } catch (e) {
    return new Response('Failed to create profile', { status: 500 });
  }
}

