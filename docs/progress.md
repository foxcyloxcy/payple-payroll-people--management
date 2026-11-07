# Progress and next work

Updated: 7 November 2026.

## Implemented in the first release

- Full responsive landing page with role explanations, illustrative pay calculator and sign-in/demo entry.
- Admin, manager and photographer views with server-side action/record scoping.
- Verified hosted Sign in with ChatGPT, stable membership binding, private-owner bootstrap, empty live workspace and isolated synthetic demo.
- Persistent D1 records with optimistic concurrency, same-origin JSON writes and audit events.
- Branch creation; employee creation; current branch/role changes; deactivate/reactivate staff accounts.
- Daily net/gross branch sales, discounts/refunds validation, usable originals, reprints and waste.
- Report submission, admin approval/return, author draft editing, date/branch duplicate prevention and CSV export.
- Clock in/out and independent attendance approval; workday captures its actual branch and original business date.
- Daily basic/minimum base plus commission, fixed daily rates, per-person percentages and effective-dated versions.
- Weekly and two-monthly-day calendars with February fallback and long-gap validation.
- Gross-earnings drafts, missing-input exceptions, stale-source detection, overlapping approved-period prevention, locked snapshots and private statements.
- Admin daily after-pay balance reporting; losses remain visible without capping pay.

## Verified

- 25 automated domain/permission tests pass (see `tests/domain.test.ts`).
- TypeScript check and production Worker build pass.
- Browser: submitted 90 usable originals + 10 reprints + 10 waste as 100 usable and 110 physical prints; approved the report.
- Browser: photographer time in/out; manager independently approved that person's workday.
- Browser: admin published PHP 750 daily base + 7.5% commission; the PHP 10,000 sample preview showed PHP 1,500 gross.
- Browser: prepared and locked 5–6 November sample gross earnings; photographer saw only their PHP 1,898.25 published portion, not colleagues' entries.
- 390px iframe layout checks: dashboard, landing, mobile navigation and pay modal; modal width stayed inside the viewport with no horizontal content overflow.
- Local executor HTTP smoke script could not reach the managed preview daemon (connection refused). It is retained for directly reachable standalone previews; no claim that it passed here.

## Deployment and source

Canonical GitHub repository: `foxcyloxcy/payple-payroll-people--management` (existing public visibility preserved). The private review Site identity is tracked in `.openai/hosting.json`. A successful native deployment response and verified GitHub commit establish publication; do not infer a running website from local tests alone.

## Remaining before live payroll / broader staff rollout

Statutory tax/contribution/benefit rules and coverage, automatic overtime/holiday calculations, approved historical adjustments and missing-punch corrections, break/split-day allocation, bank payments, PDF payslips, cutoff automation, non-working-day calendar adjustment, production backup/restore and larger-scale normalized tables.

Custom subdomains require the business's domain/DNS and cross-domain sign-in setup. The first release uses `/admin`, `/manager` and `/staff` paths on the hosted origin. Sharing access with actual staff is separate from adding their employee profiles.

## Next implementation priorities

1. Confirm applicable branches/wage classifications and the statutory payroll scope using current official sources.
2. Add reviewed historical correction/adjustment and partial-day/break allocation workflows.
3. Add explicit cutoff rules, holiday-aware calendars and schedule-change previews.
4. Configure owned domains and broader authenticated staff access when supplied/authorized.
5. Add production backup/restore checks and normalize records before scaling.
