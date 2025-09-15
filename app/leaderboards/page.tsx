"use client";

import { useEffect, useState } from 'react';

type Item = { userId: string; value: number; occurredAt: string };

export default function LeaderboardsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [mode, setMode] = useState<'endless' | 'duel'>('duel');
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/leaderboards?mode=${mode}&limit=50`, { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      setItems(json.items ?? []);
    })();
  }, [mode]);
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Daily Leaderboards</h1>
      <div className="flex gap-2">
        <button onClick={() => setMode('duel')} className={`rounded-md px-3 py-1 text-sm ${mode === 'duel' ? 'bg-neutral-800' : 'bg-neutral-900 hover:bg-neutral-800'}`}>Duel</button>
        <button onClick={() => setMode('endless')} className={`rounded-md px-3 py-1 text-sm ${mode === 'endless' ? 'bg-neutral-800' : 'bg-neutral-900 hover:bg-neutral-800'}`}>Endless</button>
      </div>
      <div className="rounded-lg border border-neutral-800">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-300">
            <tr>
              <th className="px-3 py-2 text-left font-medium">#</th>
              <th className="px-3 py-2 text-left font-medium">Player</th>
              <th className="px-3 py-2 text-left font-medium">Score</th>
              <th className="px-3 py-2 text-left font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={`${it.userId}-${it.occurredAt}`} className="border-t border-neutral-800">
                <td className="px-3 py-2 text-neutral-400">{idx + 1}</td>
                <td className="px-3 py-2">{it.userId}</td>
                <td className="px-3 py-2 font-medium">{it.value}</td>
                <td className="px-3 py-2 text-neutral-400">{new Date(it.occurredAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

