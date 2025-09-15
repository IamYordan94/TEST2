App: Word Chain Challenge
1) Clear description (plain words)

A fast, skill-based word game on the web. Players chain words where each new word starts with the last letter of the previous word. Play solo for high scores or go 1v1 in timed duels. It’s for casual players who like quick brainy rounds and competitive folks who want leaderboards.

Main features

Endless (Single Player)

Timed Duel (1v1, 90s) with a 30s sudden mechanic (one random banned letter, rare-letter multipliers double, long-word bonus)

Daily challenge seed

Dictionary validation with simple rules (min length, no duplicates, optional plural guard)

Scoring system (length, rare letters, streaks, duel bonuses)

Leaderboards (daily)

Guest profiles with XP/rank scaffold (no full auth yet)

Anti-cheat scaffolding (rate limiting, signed seeds)

Clean, responsive UI

2) Tech stack hint

Use Next.js (App Router) + TypeScript + TailwindCSS.
Realtime with Ably.
Persistence with Prisma (SQLite locally, easy switch to Postgres in prod).
Testing with Vitest.

3) File/page structure
app/
  layout.tsx                # root layout
  globals.css               # tailwind base + minimal styles
  page.tsx                  # home/landing with mode cards

  play/
    endless/page.tsx        # Endless single-player page
    duel/page.tsx           # Create private duel room (generates link)

  rooms/[id]/page.tsx       # Timed Duel room (90s, realtime UI)

  leaderboards/page.tsx     # Daily leaderboard view

  api/
    ably/token/route.ts     # Ably token endpoint (server)
    daily/route.ts          # Daily seed (deterministic by secret)
    score/route.ts          # Submit score (server-authoritative entry point)
    leaderboards/route.ts   # Read top scores
    profile/route.ts        # Create guest user + profile (returns userId)


Key libs

lib/
  ably.ts                   # Ably client init
  scoring.ts                # All scoring logic
  db.ts                     # Prisma client
  anticheat/
    ratelimit.ts            # simple per-IP limiter
    signing.ts              # HMAC for match seed/signature
  dictionary/
    wordlist.ts             # word list (placeholder; swap for real dataset)
    rules.ts                # min length, banned words, plural heuristic
    service.ts              # hasWord, pickSeedWord, validateWord, lastLetter


Prisma

prisma/schema.prisma
# Models: User, Profile (xp, rank), Match, Score


Tests

tests/scoring.test.ts       # Vitest unit tests for scoring

4) Core functionality to scaffold

Game loops

Endless (single): seed word, per-word timer, validate word, score, streaks.

Duel (timed 1v1, 90s): room presence, ready states, start countdown, shared seed, local scoring, 30s sudden mechanic (ban one random letter; double rare-letter points; +1/letter beyond 8).

Dictionary validation

Lowercase only, letters only, min length 2, no duplicates in the chain.

Plural guard: if word ends with “s” or “es” and singular exists, reject.

Scoring

Base: +2/letter.

Rare letters: Q/Z/X/J = +5 each; K/V/Y = +3 each.

Streak: +10 every 5 valid words (Endless).

Duel timed sudden mechanic: rare letters doubled (Q/Z/X/J +10, K/V/Y +6); long-word bonus +1/letter beyond 8; a random letter becomes banned for the rest of the match.

Leaderboards

API to submit scores (/api/score) and read daily leaders (/api/leaderboards).

Prisma models for Score (mode, value, period=daily).

Profiles (guest only for now)

/api/profile creates a guest user and profile (xp=0, rank=Bronze). Store returned userId in localStorage.

XP/rank scaffolding only; no full auth yet.

Realtime

Ably channel per room: presence, state messages (seed, startAt/endAt, banned letter).

Server endpoint for Ably token (/api/ably/token).

Anti-cheat scaffolding

HMAC-signed seed for matches.

Per-IP rate limiting on write endpoints.

Server-side word validation in future (client currently validates; keep server endpoints ready to verify).

Daily challenge

/api/daily returns deterministic seed from DAILY_SEED_SECRET + YYYY-MM-DD.

Type safety

validateWord returns a discriminated union: { ok: true } | { ok: false; reason: string } so UI can safely show messages.

5) Styling rules

Minimal, modern, dark mode by default.

Use Tailwind utility classes.

Rounded cards, subtle borders, readable contrast.

Responsive: desktop first, comfortable mobile tap targets.

Keep color accents modest; prioritize clarity over flashy gradients.

6) Deployment target

Target Vercel. Include:

next.config.mjs default config OK.

Env vars in Vercel dashboard:

ABLY_API_KEY

DAILY_SEED_SECRET

MATCH_SIGNING_SECRET

DATABASE_URL (SQLite for local, Postgres for prod; add DATABASE_PROVIDER=postgresql for Postgres)

Run npx prisma migrate deploy on build or enable the Prisma integration.

NPM scripts

dev, build, start, test (Vitest).

Local development

- Install deps: `npm install`
- Generate Prisma client: `npx prisma generate`
- Start: `npm run dev`
- Optional: create `.env` with `DATABASE_URL=file:./dev.db`, `DATABASE_PROVIDER=sqlite`, `DAILY_SEED_SECRET=dev`. For local, `MATCH_SIGNING_SECRET` can be omitted.

Deploy (Vercel)

- Set env vars: ABLY_API_KEY, DAILY_SEED_SECRET, MATCH_SIGNING_SECRET (optional for dev), DATABASE_URL, DATABASE_PROVIDER.
- Ensure Prisma migration runs on deploy (`npx prisma migrate deploy` or Prisma integration).

Done criteria

Can play Endless locally.

Can create/join a Duel room and finish a 90s match with the 30s sudden mechanic.

Can create a guest profile and submit a score to daily leaderboard.

Leaderboards page renders top 50 daily scores.