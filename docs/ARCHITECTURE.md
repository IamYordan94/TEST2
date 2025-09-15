## Word Chain Challenge — Architecture (v1)

### Module / File Map
- `app/layout.tsx`, `app/globals.css`, `app/page.tsx`
- `app/play/endless/page.tsx`
- `app/play/duel/page.tsx`
- `app/rooms/[id]/page.tsx`
- `app/leaderboards/page.tsx`
- `app/api/ably/token/route.ts`
- `app/api/daily/route.ts`
- `app/api/score/route.ts`
- `app/api/leaderboards/route.ts`
- `app/api/profile/route.ts`
- `lib/ably.ts`
- `lib/scoring.ts`
- `lib/db.ts`
- `lib/anticheat/ratelimit.ts`
- `lib/anticheat/signing.ts`
- `lib/dictionary/wordlist.ts`
- `lib/dictionary/rules.ts`
- `lib/dictionary/service.ts`
- `prisma/schema.prisma`
- `tests/scoring.test.ts`

### Core Types (TypeScript)
```ts
export type ValidateOk = { ok: true };
export type ValidateErr = { ok: false; reason: 
  | 'non_lowercase'
  | 'non_letters'
  | 'too_short'
  | 'duplicate'
  | 'not_in_dictionary'
  | 'wrong_start_letter'
  | 'plural_guard'
  | 'banned_letter'
};
export type ValidateResult = ValidateOk | ValidateErr;

export type GameMode = 'endless' | 'duel';

export type SuddenMechanic = {
  startsAtMs: number; // match-relative timestamp when sudden mechanic begins (~60s remaining)
  bannedLetter: string; // single lowercase letter
};

export type MatchStateMessage = {
  type: 'state';
  seed: string; // HMAC-signed seed base
  startAtMs: number; // epoch ms when match starts
  endAtMs: number; // epoch ms when match ends (start + 90_000)
  sudden?: SuddenMechanic;
};

export type PresenceData = {
  userId: string;
  ready: boolean;
};

export type WordEventMessage = {
  type: 'word';
  userId: string;
  word: string;
  scoreDelta: number;
  totalScore: number;
  atMs: number;
};

export type AblyMessage = MatchStateMessage | WordEventMessage;
```

### API Contracts

1) `POST /api/ably/token`
- Request: none (auth optional guest)
- Response: `{ tokenRequest: any }` (proxy from Ably SDK)
- Errors: `500` on failure

2) `GET /api/daily`
- Request: none
- Response: `{ date: string; seed: string }` where seed is deterministic from `DAILY_SEED_SECRET` + `YYYY-MM-DD`
- Errors: `500` on failure

3) `POST /api/profile`
- Request: none (guest creation)
- Response: `{ userId: string; profile: { xp: number; rank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' } }`
- Errors: `500`

4) `POST /api/score`
- Request: `{ userId: string; mode: GameMode; value: number; signature: string }`
  - `signature` is HMAC over `{ userId, mode, value, seed, endAtMs }` with `MATCH_SIGNING_SECRET`
- Response: `{ ok: true }`
- Errors: `400` invalid payload/signature; `429` rate limited; `500`

5) `GET /api/leaderboards?period=daily&mode=endless|duel&limit=50`
- Response: `{ items: Array<{ userId: string; value: number; occurredAt: string }> }`
- Errors: `400` invalid params; `500`

### Realtime (Ably)
- Channel: `rooms:{roomId}`
- Presence data: `PresenceData`
- Messages: `AblyMessage`
- Flow (duel):
  1. Creator enters, sets `ready=false`.
  2. Both players `ready=true` → server computes seed + `startAtMs`, `endAtMs`, picks `bannedLetter` for sudden mechanic and publishes `MatchStateMessage`.
  3. Clients start local timers; after sudden start, apply multipliers and letter ban.

### Validation Rules
- Lowercase only, letters only `[a-z]+`
- Min length 2
- Must start with last letter of previous accepted word (or seed word on first turn)
- No duplicates in current chain
- Plural guard: reject if ends with `s` or `es` and singular exists in dictionary
- During sudden mechanic: reject if word includes the banned letter; apply doubled rare-letter points and +1/letter beyond 8

### Scoring
- Base: `+2` per letter
- Rare letters: `Q/Z/X/J = +5`, `K/V/Y = +3`
- Streak (Endless): `+10` every 5 valid words
- Sudden mechanic (Duel): rare letters doubled; long-word bonus `+1/letter` beyond 8

### Prisma Data Model (overview)
```prisma
model User {
  id       String   @id @default(cuid())
  profiles Profile[]
  scores   Score[]
  matches  Match[]
  createdAt DateTime @default(now())
}

model Profile {
  id        String  @id @default(cuid())
  user      User    @relation(fields: [userId], references: [id])
  userId    String
  xp        Int     @default(0)
  rank      String  @default("Bronze")
  createdAt DateTime @default(now())
}

model Match {
  id        String   @id @default(cuid())
  mode      String
  seed      String
  endAtMs   BigInt
  createdAt DateTime @default(now())
}

model Score {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  mode      String
  value     Int
  period    String   @default("daily")
  occurredAt DateTime @default(now())
}
```

### Rate Limiting & Signing
- Per-IP rate limiting on write endpoints (`/api/score`, `/api/profile`) via memory or KV store adapter
- HMAC signing utilities in `lib/anticheat/signing.ts`

### Acceptance Criteria
- Types compile; endpoints return specified shapes and errors
- Realtime messages conform; clients can parse and act
- Prisma schema migrates locally; can persist and query scores & profiles


