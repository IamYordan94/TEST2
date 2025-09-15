# Deployment (Vercel)

## Environment Variables
- ABLY_API_KEY
- DAILY_SEED_SECRET
- MATCH_SIGNING_SECRET
- DATABASE_URL (SQLite for local; Postgres for prod)
- DATABASE_PROVIDER (sqlite | postgresql)

## Steps
1. Create Vercel project and connect repo.
2. Set env vars in Vercel dashboard (Production + Preview).
3. Build settings: default. Add `npx prisma migrate deploy` as postinstall or enable Prisma integration.
4. Deploy. Confirm APIs:
   - GET /api/daily
   - POST /api/profile
   - POST /api/score
   - GET /api/leaderboards
5. Smoke test Endless locally and on Vercel.

## Rollback
- Use Vercel deployments to revert.

