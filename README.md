# Payple — People, prints & payroll

A working first release for Philippine photography teams with multiple branches or booths.

## What works

- Responsive landing page, sign-in entry, and admin/manager/photographer workspaces.
- Isolated sample workspace with fictional records and three explorable roles.
- Persistent branch and employee records, current branch/role assignments and account deactivation.
- Daily branch sales and physical-print reports, including usable originals, replacements and waste.
- Draft/submitted/returned/approved report workflow; branch scopes checked on the server.
- Time in/out, reviewed workdays and protected self-approval/cross-branch rules.
- Individual daily base/minimum/fixed-pay amounts and branch-sales commission percentages with effective-dated versions.
- Weekly and twice-monthly payday calendars, including 15/30 and 5/20 with short-month fallback.
- Gross-earnings preparation, immutable approval snapshots, duplicate-period prevention, per-person published statements and CSV export.
- Daily after-pay balances, including negative results; no cap of earned pay to branch sales.
- Persistent D1 storage with optimistic revision checks, change audit and same-origin mutation protection.

## Run and check

Requires Node.js 22.13 or newer. The committed lockfile specifies the dependencies.

```sh
npm ci
npm run check
npm test
npm run build
```

Before opening a local database-backed preview, apply the generated migration using the commands in [development](docs/development.md). `npm run dev` runs the app with local bindings. Hosted sign-in is platform-managed; the portable starter provides loopback-only development auth. See [runtime starter](docs/runtime-starter.md).

The optional `npm run test:http` script targets a directly reachable local preview and never sends real identity headers. The managed preview runs in a separate network namespace here, so that script was not able to connect from the executor; browser tests verified persistent operations instead.

## Access and data

The review deployment is private. Its first authenticated owner opens an empty live workspace. Employees added by an admin match verified sign-in emails and bind to stable identities. This hosted version uses Sign in with ChatGPT; it does not implement separate staff passwords. Manager and photographer access is checked for every API operation, and outgoing records are scoped. The role selector exists only for synthetic demo data in a separate database namespace.

Live settings and payroll records belong in the database, not Git. `.env`, local state, private exports and credentials are ignored. The source lives in [foxcyloxcy/payple-payroll-people--management](https://github.com/foxcyloxcy/payple-payroll-people--management).

## Boundaries before live payroll

This is **gross-earnings management**, not a complete statutory payroll engine. Withholding tax, SSS/PhilHealth/Pag-IBIG, statutory benefit/holiday/overtime calculations, bank disbursement, PDF payslips, historical correction workflows and automated holiday payday shifts are not implemented. Payroll cutoff periods are explicit when preparing a draft, not inferred from paydays. Basic/minimum amounts use a daily basis in this release.

Role paths `/admin`, `/manager` and `/staff` work on the hosted origin. Actual custom subdomains need a business domain, hosting/DNS configuration and a verified cross-subdomain sign-in setup; entering a domain in Settings records the intended domain only.

See [progress](docs/progress.md), [architecture](docs/architecture.md), [admin settings](docs/admin-settings.md), [product plan](docs/product-plan.md) and [decisions](docs/decisions.md).
