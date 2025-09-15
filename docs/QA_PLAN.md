# QA Plan

## Dictionary Validation
- lowercase only, letters only, min length 2
- must start with last letter of previous
- no duplicates in chain
- plural guard: reject if ends with s/es and singular exists

## Scoring
- base +2/letter
- rare letters: Q/Z/X/J +5; K/V/Y +3
- streak +10 every 5 valid words (Endless)
- sudden mechanic (Duel): rare doubled; +1/letter beyond 8; banned letter enforced

## Duel Flow
- presence join/leave
- ready toggles; start countdown; state broadcast contains { seed, startAtMs, endAtMs, bannedLetter }
- 90s timer; 30s sudden mechanic kicks in

## Leaderboards
- POST /api/score persists valid entries
- GET /api/leaderboards returns top 50 daily

## Anti-cheat scaffolding
- rate limit returns 429 with Retry-After
- signature verification rejects bad signatures

