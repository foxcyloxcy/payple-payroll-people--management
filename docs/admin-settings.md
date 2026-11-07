# Admin-editable settings specification

Status: design contract, not an implemented admin interface.

## Confirmed business rules

Each manager or photographer has an individually configurable commission percentage of daily sales at the branch where they work. Minimum/base pay is added to commission. Fixed rate is daily. Branch results may be negative; payroll is not limited to revenue. Weekly and configurable twice-monthly schedules must be supported.

## Settings screens

| Screen | Admin can edit | Required preview/validation |
| --- | --- | --- |
| Company | Display name, timezone/currency defaults, settings templates | Explain effect on new records; preserve existing histories |
| Branches | Branch/booth details, city/province, operating status, assigned managers | Scope and historical assignment checks |
| Employee compensation | Plan, base amount/unit, fixed daily amount, commission on/off, percentage, schedule, effective date | Compare sample earnings and identify affected draft periods |
| Branch work assignments | Employee, branch, dates, workday/shift and exceptions | Flag missing or conflicting branch eligibility |
| Sales rules | Gross/net/collected basis, treatment of discounts, refunds and taxes | Reconcile a sample source sale to the commission amount |
| Payroll schedules | Weekly weekday or two monthly day rules, cutoff windows, payout lag, short-month/weekend/holiday policy | Preview calendar and validate payment gaps, period coverage and duplicates |
| Attendance | Clocking method, work schedules, breaks, partial-day and correction rules | Show how a sample workday becomes payable units |
| Reporting | Default date range, location scope, provisional/approved views, available cost categories | Distinguish sales, payroll, costs and result |

## Example employee form

The admin selects an employee, then a pay plan:

- **Basic plus commission:** base amount, base unit, attendance conversion, commission percentage, assigned schedule.
- **Minimum base plus commission:** minimum base amount/unit and percentage; the base is additive, not an earnings-floor top-up.
- **Fixed daily:** daily amount and an explicit commission toggle; if enabled, show the individual percentage.

Common fields: effective-from date, optional end date, reason, branch-assignment history and resolved configuration source. Plan templates can prefill fields; an admin's explicit employee values are stored as an employee version.

## Calculations and transparency

For each approved eligible employee workday:

1. Resolve the branch actually worked on that earning date.
2. Read the approved branch daily sales and the applicable sales-policy version.
3. Resolve the employee's percentage effective on that date.
4. Calculate daily commission from the eligible branch sales amount and percentage.
5. Add earned base pay under the selected arrangement.
6. Aggregate daily earnings into the selected payroll period, then show other applicable earnings/deductions separately.

Illustrative example: branch eligible sales PHP 1,000; manager minimum base PHP 600 plus 10% = PHP 700; photographer base PHP 500 plus 10% = PHP 600. Total ordinary earnings are PHP 1,300 and sales less those earnings is **negative PHP 300**. Preserve both employees' earnings. This is an after-pay balance, not full profit/loss unless all relevant costs are included. These values are synthetic and do not establish a lawful wage rate.

Accrue compensation to earning dates. Paying a two-week payroll today must not assign every day's labor cost to today.

## Configuration storage and precedence

Company templates provide defaults. Branch templates can specialize applicable defaults. Employee compensation versions contain explicit overrides. Show the final resolved value and its source rather than silently merging ambiguous values. A payroll schedule is assigned explicitly; a branch's schedule must not override a personal assignment without a versioned change.

Store at least:

| Record | Main fields |
| --- | --- |
| Configuration version | ID, type, schema version, scope, structured payload, state, effective dates, creator/reason |
| Pay arrangement version | Employee, plan type, amount/unit, commission flag/percentage, schedule, effective dates |
| Work assignment | Employee, actual branch, business date/time range, approval state, source attendance |
| Sales policy version | Branch/company scope, sales basis and adjustment treatment, effective dates |
| Schedule version | Frequency, day rules, cutoffs, exception policy, effective dates |
| Publication/audit event | Before/after values, actor, timestamp, reason, effective date, preview reference |
| Payroll snapshot | Exact source revisions, assignment, amount/rate versions, schedule, rounding and calculated lines |

## Publish workflow

**Draft → Validate → Preview → Publish with effective date → Retain history.**

- Only an authorized admin may change pay settings. Recheck permission server-side for reads and writes.
- Use typed forms with supported operators/fields. Do not execute arbitrary formulas, JavaScript or SQL supplied through settings.
- Validate percentages, exact monetary values, effective-date overlaps, required assignments, sales revisions and schedule rules.
- Structural JSON-schema validation is only the first layer. Add cross-record and business validation in the server.
- Display sample daily earnings, total affected draft earnings and a calendar before publication.
- Use optimistic concurrency to reject edits based on stale versions.
- A new setting does not mutate an already approved payroll snapshot. Past corrections require reviewed adjustment entries.
- Record every publication, deactivation and adjustment with the reason and actor.

## Calendar behavior

- Weekly: choose a weekday and earning cutoff window.
- Twice monthly: choose two ordered monthly payday rules; support 15/30 and 5/20.
- Day 30 is different from `last_day`. With the chosen short-month rule, February day 30 resolves to February 28/29.
- Define earning cutoffs independently from the paydays. The 5th/20th schedule alone does not specify which dates are being paid.
- Define weekend/holiday movement before activation. Validate the resulting dates and payment intervals across at least a leap year and an ordinary year, including schedule transitions.
- Confirm applicable statutory timing/coverage against the official references in the product plan. A syntactically valid schedule is not proof of legal compliance.

## Branch and sales edge cases

- A later transfer must not move historical commission to the new branch.
- Multiple employees at the same branch can each earn their own percentage of that branch's sales; these percentages are not pool shares.
- For split-branch days, admin must select a supported rule and preview it. Options can include primary branch, approved time-based allocation, or explicit branch-day fractions. Do not adopt one silently.
- Missing attendance/assignment/sales needs an exception state and review. Do not silently replace unknown input with zero.
- The sales basis must define discounts, refunds, unpaid sales and taxes. Changes must be effective-dated and reconciled.
- Waste and free replacements never create sales solely from physical count. They do not automatically create employee deductions.
- Business losses and negative *net sales from refunds* are different cases. The latter needs an explicit adjustment policy; allowing losses is not permission to create arbitrary negative commissions.

## Setup still needed

Actual business/domain and branch details, employee rates, basic/minimum amount units, sales adjustments policy, cutoff windows, fixed-daily commission choice, split-branch rule, attendance method and statutory module coverage. These become admin setup choices; they do not require custom code for every employee.

## Implementation status — 7 November 2026

Implemented: daily pay amounts and individual percentages; additive basic/minimum plans; fixed daily plans with a zero or positive commission; version publication and illustrative preview; weekly/twice-monthly calendars; current employee branch/role assignment and deactivation; company display name and intended domain field. Changes are persisted and audited, with finalized earnings snapshots protected.

First-release restrictions: base units are daily; assignment changes apply now; missing-punch/break/split-day corrections are not automated; earning cutoffs are selected for each gross draft; calendar exceptions do not auto-shift holidays; changing gross/net policy after existing reports requires a reviewed migration. Domain settings do not perform DNS provisioning. These limits are visible where they affect an admin decision and documented in the README.
