"use client";

import { useRouter } from 'next/navigation';

export default function DuelPage() {
  const router = useRouter();
  function createRoom() {
    const id = Math.random().toString(36).slice(2, 8);
    router.push(`/rooms/${id}`);
  }
  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Timed Duel</h1>
      <p className="text-neutral-300">Create a private room and share the URL with a friend.</p>
      <button onClick={createRoom} className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-500">Create room</button>
    </main>
  );
}

