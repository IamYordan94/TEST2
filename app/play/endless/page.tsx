"use client";

import { useMemo, useState } from 'react';
import { pickSeedWord, validateWord, lastLetter } from '@/lib/dictionary/service';
import { totalScoreForWord } from '@/lib/scoring';

export default function EndlessPage() {
  const seed = useMemo(() => pickSeedWord(), []);
  const [used, setUsed] = useState<Set<string>>(new Set([seed]));
  const [expectedStart, setExpectedStart] = useState<string>(lastLetter(seed));
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState<string>('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const word = input.trim();
    const res = validateWord({ word, expectedStart, usedWords: used });
    if (!res.ok) {
      setMessage(reasonToCopy(res.reason));
      return;
    }
    const nextScore = score + totalScoreForWord({ word, validWordsCountBefore: used.size - 0 });
    const nextUsed = new Set(used);
    nextUsed.add(word);
    setUsed(nextUsed);
    setExpectedStart(lastLetter(word));
    setScore(nextScore);
    setInput('');
    setMessage('Nice!');
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Endless</h1>
        <p className="text-neutral-300">Start with seed word below. Each new word must start with the last letter of the previous one.</p>
      </div>
      <div className="rounded-lg border border-neutral-800 p-4">
        <div className="text-sm text-neutral-400">Seed</div>
        <div className="text-xl font-medium">{seed}</div>
      </div>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 outline-none focus:border-neutral-600"
          placeholder={`Starts with "${expectedStart}"`}
        />
        <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-500">Enter</button>
      </form>
      <div className="text-sm text-neutral-300">Score: <span className="font-semibold text-neutral-100">{score}</span></div>
      {message && <div className="text-sm text-neutral-400">{message}</div>}
      <div>
        <div className="text-sm text-neutral-400 mb-1">Used words</div>
        <div className="flex flex-wrap gap-2">
          {[...used].map((w) => (
            <span key={w} className="rounded border border-neutral-800 px-2 py-1 text-xs text-neutral-300">{w}</span>
          ))}
        </div>
      </div>
    </main>
  );
}

function reasonToCopy(reason: string): string {
  switch (reason) {
    case 'non_lowercase':
      return 'Use lowercase letters only';
    case 'non_letters':
      return 'Letters a-z only';
    case 'too_short':
      return 'Word too short (min 2)';
    case 'duplicate':
      return 'Already used';
    case 'not_in_dictionary':
      return 'Not in dictionary';
    case 'wrong_start_letter':
      return 'Wrong starting letter';
    case 'plural_guard':
      return 'Plural not allowed when singular exists';
    case 'banned_letter':
      return 'Contains banned letter';
    default:
      return 'Invalid word';
  }
}

