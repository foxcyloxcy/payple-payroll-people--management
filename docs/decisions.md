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
