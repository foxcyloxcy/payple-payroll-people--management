# Payple — Payroll & People Management

Planning foundation for a Philippine photography business with multiple branches or booths.

## Current status

Requirements, architecture and admin-settings contracts are prepared. The website, API, database, authentication, payroll engine and deployment are **not implemented yet**. Configuration examples are synthetic and are not production payroll settings.

## Product

- Public landing page and staff login.
- Admin portal at `admin.<domain>`, manager portal at `manager.<domain>`, and proposed photographer portal at `staff.<domain>`.
- Physical print counts, waste, reprints and daily branch sales.
- Attendance, dated branch assignments and transparent branch results.
- Per-person branch-sales commission percentages.
- Basic/minimum base pay plus commission, or fixed daily pay with an explicit commission setting.
- Weekly or configurable twice-monthly payroll, including 15/30 and 5/20 examples.
- Admin-editable settings, impact previews, effective dates, audit history and protected finalized payroll.

## Read these first

| Document | Purpose |
| --- | --- |
| [Product plan](docs/product-plan.md) | Full requirements, permissions, workflows, data model and milestones |
| [Admin settings](docs/admin-settings.md) | What admin can edit and how rules are published |
| [Architecture](docs/architecture.md) | Proposed application/modules, data ownership and request flows |
| [Decisions](docs/decisions.md) | Confirmed choices and remaining setup decisions |
| [Progress](docs/progress.md) | What exists, what is pending and next implementation work |
| [Example settings](config/examples/company.json) | Synthetic draft illustrating configurable plans and calendars |
| [Settings schema](config/schema/settings.schema.json) | Initial structural contract, not a full business-rule validator |

## Proposed stack and build sequence

One Next.js/TypeScript application, PostgreSQL, server-side permissions and a mature authentication library. Serve role portals through explicit host routing. Database migrations and runtime tooling will be added with implementation.

1. Implement identities, locations, role/record permissions and portal routing.
2. Implement versioned settings, employee compensation and work assignments with previews.
3. Implement daily sales/production reporting, waste/reprint records and admin review.
4. Implement attendance and correction review.
5. Implement payroll calculations and calendars against agreed independent examples.
6. Pilot, reconcile results, verify recovery, then deploy for live use.

## Configuration versus source control

GitHub stores code, documentation, migrations, tests and synthetic fixtures. Live settings, employee details, attendance, payroll and audit events belong in the application database/private storage. Changing an admin setting must not require a deployment.

Selected repository: [foxcyloxcy/payple-payroll-people--management](https://github.com/foxcyloxcy/payple-payroll-people--management). The user supplied this existing public repository. Preserve its visibility. Record publication through its commit history and verify the branch head before reporting a push.

## Running the application

There is no runnable application yet. Do not invent setup commands, working URLs or deployment claims. Continue from [Progress](docs/progress.md).
