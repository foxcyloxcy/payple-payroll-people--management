# Progress and next work

Updated: 6 November 2026.

## Prepared

- Product plan through version 0.5 with confirmed business requirements.
- Role/portal and server-side permission design.
- Print, waste, reprint and daily sales definitions.
- Individual branch-sales commission and additive base/minimum pay design.
- Fixed daily rate and editable weekly/twice-monthly calendar design.
- Admin settings screens, publication lifecycle, history, previews and exception handling.
- Proposed architecture, data model, milestones and acceptance scenarios.
- Synthetic draft settings example and initial JSON-schema structural contract.

## Validation performed

The synthetic draft passes the JSON Schema. Eight negative cases were rejected: publishing unresolved policies, negative base amount, percentage above 100%, non-daily fixed rate, disabled commission with a nonzero rate, duplicate monthly paydays, missing weekly weekday, and an invalid effective date. Local Markdown links and the full-plan copy were checked. These are structural checks, not application or payroll runtime tests.

## Not implemented

Landing page, auth, database/schema migrations, actual admin/manager/photographer screens, settings service, payroll engine, attendance, integrations, CI application checks and deployment.

## Repository and initial publication

The user selected the existing public repository `foxcyloxcy/payple-payroll-people--management`. The connected GitHub account has push permission. This foundation commit contains the product plan, architecture, admin-settings specification, decisions, progress, agent instructions, synthetic draft settings, structural schema and ignore rules. The repository history is authoritative for publication. No application or deployment is included.

## Next implementation

1. Provision project tooling and database; document actual local commands.
2. Implement identity, invitations, roles and record permissions, then prove subdomain session behavior.
3. Implement branches, employees and approved dated work assignments.
4. Implement structured configuration drafts, validation, preview and effective-dated publication.
5. Implement daily branch sales and production reports with review.
6. Implement attendance and correction workflows.
7. Implement earnings/calendar/payroll against independently specified examples.
8. Pilot with reconciled records, access tests and a restore rehearsal.

## Outstanding setup

Business name/domain, hosting/budget/target date, branch locations and classifications, actual pay values/units, sales adjustment policy, cutoff windows, attendance requirements, split-branch policy, approvals and statutory module coverage. See `admin-settings.md` for configurable fields.
