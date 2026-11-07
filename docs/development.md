# Development and deployment

## Stack

TypeScript, React, Next-compatible Vinext, Cloudflare Worker, D1/Drizzle, Recharts and platform-managed verified sign-in. The hosted implementation uses SQLite/D1 instead of the original proposed PostgreSQL deployment; see D16 in the decision log.

## Local database

After dependency installation, build once to emit `dist/server/wrangler.json`, then apply each pending migration once:

```sh
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_short_apocalypse.sql
npm run dev
```

Keep migration history immutable after application. Future schema changes use `npm run db:generate` and new SQL/journal entries. Hosted publication applies pending schema migrations separately from local preview state. No real employee records are seeded by a migration.

## Hosting

The committed `.openai/hosting.json` retains the exact Site identity and declares `DB`. Use the installed Sites source/build/publish workflow; it emits the Worker artifact and binds hosted D1. The Site is private for owner review. Making it available to staff or adding domains is a separate explicit access/domain configuration task.

Do not expose or store repository write credentials, service tokens, local database files, or employee records. Source-control publishing and application deployment are distinct checks. Keep the matching source commit and build archive together through publication.

## Bounded storage design

`payple_workspaces` stores an atomic JSON aggregate plus revision. Each write validates the operation and actor, then uses compare-and-swap on the revision; a stale client receives 409. This gives consistent report/attendance/settings/payroll changes for the first-release scale. Normalize append-heavy entities and add backup/restore operations before larger production use. Current in-app capacity limits are 1,500 reports and 5,000 audit entries; failed writes do not silently discard audit history.

Demo data is separately namespaced per random HttpOnly cookie. It cannot address the live namespace. Demo role changes do not grant live access. The live namespace requires platform identity and active membership on each request. Keep the Site owner-private during this first-owner bootstrap design; review bootstrap rules before expanding the Site audience.

## Verification

`npm test` covers pure business/permission rules. `npm run check` checks TypeScript. `npm run build` compiles the Worker and client. `tests/http-smoke.mjs` contains local API checks for a directly reachable preview; this managed runner cannot reach the preview daemon's loopback namespace from executor requests. Browser testing covers persistent report submission/approval, time in/out, manager review, effective-date pay publication, gross earnings approval, per-person published statement scoping and 390px layouts.
