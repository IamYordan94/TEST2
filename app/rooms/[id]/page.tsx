"use client";

import { useEffect, useMemo, useState } from 'react';
import { lastLetter, validateWord } from '@/lib/dictionary/service';
import { totalScoreForWord } from '@/lib/scoring';
import { createRealtimeClient } from '@/lib/ablyClient';
import { getOrCreateGuestUserId } from '@/lib/profile';

type Props = { params: { id: string } };

export default function RoomPage({ params }: Props) {
  const [userId, setUserId] = useState<string>('');
  const [ready, setReady] = useState(false);
  const [peers, setPeers] = useState<Array<{ userId: string; ready: boolean }>>([]);
  const [state, setState] = useState<{ startAtMs?: number; endAtMs?: number; suddenStartsAtMs?: number; bannedLetter?: string; seed?: string } | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [input, setInput] = useState('');
  const [used, setUsed] = useState<Set<string>>(new Set());
  const [expectedStart, setExpectedStart] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    let channel: any;
    (async () => {
      const uid = await getOrCreateGuestUserId();
      if (!mounted) return;
      setUserId(uid);
      const client = await createRealtimeClient();
      if (!mounted) return;
      channel = client.channels.get(`rooms:${params.id}`);
      channel.presence.subscribe('enter', updatePresence);
      channel.presence.subscribe('update', updatePresence);
      channel.presence.subscribe('leave', updatePresence);
      channel.presence.enter({ userId, ready: false });
      channel.subscribe('state', (msg: any) => {
        const data = msg.data;
        setState({ startAtMs: data.startAtMs, endAtMs: data.endAtMs, suddenStartsAtMs: data.sudden?.startsAtMs, bannedLetter: data.sudden?.bannedLetter, seed: data.seed });
        // reset local chain on new match
        setUsed(new Set(data.seed ? [data.seed] : []));
        setExpectedStart(data.seed ? lastLetter(data.seed) : '');
        setScore(0);
        setMessage('');
      });
      refresh();
      async function refresh() {
        const members = await channel.presence.get();
        const list = members.map((m: any) => ({ userId: m.data.userId, ready: m.data.ready }));
        setPeers(list);
      }
      async function updatePresence() {
        await refresh();
      }
    })();
    return () => {
      mounted = false;
      try { channel?.presence.leave(); } catch {}
    };
  }, [params.id]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  async function toggleReady() {
    setReady((r) => !r);
    try {
      const client = await createRealtimeClient();
      const channel = client.channels.get(`rooms:${params.id}`);
      await channel.presence.update({ userId, ready: !ready });
    } catch {}
  }

  async function startMatch() {
    await fetch('/api/rooms/start', { method: 'POST', body: JSON.stringify({ roomId: params.id }) });
  }

  const hasStarted = state?.startAtMs ? now >= state.startAtMs : false;
  const hasEnded = state?.endAtMs ? now >= state.endAtMs : false;
  const suddenActive = state?.suddenStartsAtMs ? now >= state.suddenStartsAtMs : false;
  const readyCount = peers.filter((p) => p.ready).length;
  const canStart = readyCount >= 2 && !state?.startAtMs;

  const preCountdown = state?.startAtMs ? Math.max(0, Math.ceil((state.startAtMs - now) / 1000)) : null;
  const timeLeft = state?.endAtMs ? Math.max(0, Math.ceil((state.endAtMs - now) / 1000)) : null;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasStarted || hasEnded) return;
    const word = input.trim();
    const res = validateWord({ word, expectedStart, usedWords: used, bannedLetter: suddenActive ? state?.bannedLetter : undefined });
    if (!res.ok) {
      setMessage(reasonToCopy(res.reason));
      return;
    }
    const nextScore = score + totalScoreForWord({ word, validWordsCountBefore: used.size, suddenActive });
    const nextUsed = new Set(used);
    nextUsed.add(word);
    setUsed(nextUsed);
    setExpectedStart(lastLetter(word));
    setScore(nextScore);
    setInput('');
    setMessage('✓');
  }

  useEffect(() => {
    if (!hasEnded || !state?.seed || !userId) return;
    const controller = new AbortController();
    (async () => {
      try {
        await fetch('/api/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, mode: 'duel', value: score, seed: state.seed, endAtMs: state.endAtMs, signature: '' }),
          signal: controller.signal,
        });
      } catch {}
    })();
    return () => controller.abort();
  }, [hasEnded, score, state?.seed, state?.endAtMs, userId]);

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Room {params.id}</h1>
      <div className="flex items-center gap-3">
        <button onClick={toggleReady} className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-500">
          {ready ? 'Unready' : 'Ready'}
        </button>
        <span className="text-sm text-neutral-400">Share this URL with your opponent</span>
      </div>
      <div>
        <button onClick={startMatch} disabled={!canStart} className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500 disabled:opacity-50">Start match</button>
        <div className="text-sm text-neutral-400 mt-1">{readyCount} ready</div>
      </div>
      {state?.startAtMs && (
        <div className="rounded-lg border border-neutral-800 p-4 space-y-1">
          <div className="text-sm text-neutral-400">Match</div>
          <div className="text-neutral-200">Starts: {new Date(state.startAtMs).toLocaleTimeString()}</div>
          <div className="text-neutral-200">Ends: {new Date(state.endAtMs!).toLocaleTimeString()}</div>
          {state.suddenStartsAtMs && (
            <div className="text-neutral-200">Sudden starts: {new Date(state.suddenStartsAtMs).toLocaleTimeString()} (ban: {state.bannedLetter})</div>
          )}
          <div className="text-neutral-200">Now: {new Date(now).toLocaleTimeString()} ({hasStarted ? (hasEnded ? 'ended' : 'live') : 'waiting'})</div>
          {!hasStarted && preCountdown !== null && (
            <div className="text-neutral-300">Starting in {preCountdown}s</div>
          )}
          {hasStarted && !hasEnded && timeLeft !== null && (
            <div className="text-neutral-300">Time left {timeLeft}s</div>
          )}
        </div>
      )}
      {state?.seed && (
        <div className="rounded-lg border border-neutral-800 p-4 space-y-4">
          {hasStarted && !hasEnded && suddenActive && state.bannedLetter && (
            <div className="rounded-md border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-300">Sudden mechanic active — avoid "{state.bannedLetter}"</div>
          )}
          <div className="text-sm text-neutral-400">Seed</div>
          <div className="text-xl font-medium">{state.seed}</div>
          <div className="text-sm text-neutral-300">Score: <span className="font-semibold text-neutral-100">{score}</span></div>
          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!hasStarted || hasEnded}
              className="flex-1 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 outline-none disabled:opacity-50 focus:border-neutral-600"
              placeholder={hasStarted ? (expectedStart ? `Starts with "${expectedStart}"${suddenActive && state.bannedLetter ? `, avoid "${state.bannedLetter}"` : ''}` : 'Enter word') : 'Waiting for start...'}
            />
            <button disabled={!hasStarted || hasEnded} className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-50">Enter</button>
          </form>
          {message && <div className="text-sm text-neutral-400">{message}</div>}
          <div>
            <div className="text-sm text-neutral-400 mb-1">Used words</div>
            <div className="flex flex-wrap gap-2">
              {[...used].map((w) => (
                <span key={w} className="rounded border border-neutral-800 px-2 py-1 text-xs text-neutral-300">{w}</span>
              ))}
            </div>
          </div>
        </div>
      )}
      {hasEnded && (
        <div className="flex items-center gap-3">
          <button onClick={startMatch} className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500">Rematch</button>
          <span className="text-sm text-neutral-400">Match ended. Start another when both are ready.</span>
        </div>
      )}
      <div className="rounded-lg border border-neutral-800 p-4">
        <div className="text-sm text-neutral-400 mb-2">Players</div>
        <ul className="space-y-2">
          {peers.map((p) => (
            <li key={p.userId} className="flex items-center justify-between">
              <span className="text-neutral-200">{p.userId}</span>
              <span className={`text-xs ${p.ready ? 'text-green-400' : 'text-neutral-500'}`}>{p.ready ? 'ready' : 'not ready'}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

