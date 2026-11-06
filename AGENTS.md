# Project instructions

- This is the Payple photography business management project. The selected repository is `foxcyloxcy/payple-payroll-people--management`; publish project work there.
- Read `README.md`, `docs/progress.md`, `docs/decisions.md` and `docs/admin-settings.md` before changing implementation.
- Keep confirmed functionality and requirements intact. Label assumptions and unresolved policies explicitly.
- Default to one TypeScript application with server-side permission checks; role subdomains alone never authorize a request.
- Business settings are database-backed structured data with versions, effective dates and audit events. Do not hardcode employee rates or ask the user to restate values that admin can configure.
- Commission uses daily sales of the branch actually worked. Minimum/base pay is added to commission. Fixed rates are daily. Branch losses must not cap earned pay.
- Track physical attempts, usable copies, waste and successful reprints without double counting.
- Retain approved payroll snapshots. Corrections use reviewed adjustments; do not silently recalculate finalized payslips.
- Treat Philippine statutory payroll rules as separately sourced and effective-dated; configuration alone is not evidence of compliance.
- Use integer minor units or exact decimals for money and an explicit rounding policy. Use `Asia/Manila` business dates and UTC timestamps.
- Use synthetic examples in version control. Keep employee/payroll records, credentials, exports and real `.env` values out of Git.
- Update `docs/progress.md` when work is completed or blocked, and `docs/decisions.md` when a decision changes.
- Run checks that meaningfully cover changed business rules. Report actual results and remaining limits.
- Commit and publish completed project work to the selected `foxcyloxcy` repository when access is available. Verify the remote commit before claiming a push. Do not deploy or claim a working website merely because documentation was published.
