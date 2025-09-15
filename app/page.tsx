import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-3xl font-semibold">Word Chain Challenge</h1>
      <p className="text-neutral-300">Chain words quickly. Each new word starts with the last letter of the previous one.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/play/endless" className="rounded-lg border border-neutral-800 p-4 hover:bg-neutral-900">
          <div className="text-xl font-medium">Endless</div>
          <div className="text-sm text-neutral-400">Solo play for high scores</div>
        </Link>
        <Link href="/play/duel" className="rounded-lg border border-neutral-800 p-4 hover:bg-neutral-900">
          <div className="text-xl font-medium">Timed Duel</div>
          <div className="text-sm text-neutral-400">Create a room and challenge a friend</div>
        </Link>
      </div>
      <div>
        <Link href="/leaderboards" className="text-sm text-blue-400 hover:underline">View daily leaderboards →</Link>
      </div>
    </main>
  );
}

