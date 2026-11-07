# Decision log

Confirmed on 6 November 2026 unless noted otherwise.

| ID | Decision | Basis |
| --- | --- | --- |
| D01 | Public landing page plus role-specific portals | User requirement |
| D02 | Roles are admin, manager and photographer | User requirement |
| D03 | Multiple branches or booths | User confirmation |
| D04 | Physical output includes reprints; rejected originals are waste | User confirmation |
| D05 | Commission percentage is individually editable for managers and photographers | User confirmation |
| D06 | Commission uses daily sales of the branch where the person works | User confirmation |
| D07 | Minimum/base pay is added to commission | User confirmation; no earnings-floor interpretation |
| D08 | Fixed-rate pay is daily | User confirmation |
| D09 | Weekly and twice-monthly calendars are configurable; presets include 15/30 and 5/20 | User confirmation |
| D10 | Loss-making daily results stay visible and do not cap earned pay | User confirmation |
| D11 | Admin settings are structured and database-backed, with effective dates/audit | Proposed engineering design supporting the user's request for dynamic settings |
| D12 | Approved payroll retains historical snapshots | Proposed engineering design for reproducibility |
| D13 | One application and one business database initially | Proposed architecture; no multi-company SaaS requirement yet |
| D14 | GitHub owner is foxcyloxcy | User instruction |
| D15 | Use the existing `foxcyloxcy/payple-payroll-people--management` repository, preserving its public visibility | User supplied the repository URL; supersedes the proposed new repository |

## Configurable setup decisions

Do not ask the owner for a permanent universal employee percentage: admin enters individual rates in the product. Setup must still specify basic/minimum pay units, sales adjustment treatment, earning cutoffs, schedule exceptions, split-branch work rules, fixed-daily commission on/off, attendance method and statutory feature coverage.

Gross versus net sales is not yet selected. PHP/Asia-Manila are proposed defaults from the confirmed Philippine operations. No branch-specific statutory wage rate has been selected.

## Implementation decisions — 7 November 2026

| ID | Decision | Reason / limit |
| --- | --- | --- |
| D16 | First hosted release uses Vinext/React, a Worker and D1/Drizzle | Supported persistent hosting with one TypeScript app; PostgreSQL remains an earlier proposal, not the deployed database |
| D17 | Hosted authentication is verified Sign in with ChatGPT | Preserve the hosting identity integration; admin assigns membership/roles. No separate password system is claimed |
| D18 | Review deployment remains owner-private; synthetic demo is separately namespaced | Allows safe role exploration without a live role chooser. Review first-owner bootstrap before wider sharing |
| D19 | Initial base/minimum/fixed calculations are daily; gross earnings only | Monthly conversion and statutory net payroll require explicit rules and further validation |
| D20 | Use role paths on the supplied hosted origin first | Actual role subdomains require an owned domain, DNS and cross-subdomain sign-in configuration |
| D21 | Aggregate D1 row plus optimistic revision for first-release atomicity | Normalize append-heavy records before larger production scale; capacity limits are documented |
| D22 | Current assignment changes are effective immediately; historical attendance retains its branch | Future-dated assignment scheduling and split-branch days require a separate workflow |
| D23 | Payday calendar presets do not infer earning cutoffs | Admin explicitly chooses the earning window for each gross draft; holiday shifting is not automated |
