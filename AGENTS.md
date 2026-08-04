# Metric Quest agent instructions

Read `docs/AI_WORKFLOW.md` and `docs/architecture.md` before editing product code.

- Work in small, reviewable changes. Inspect the current tree and relevant source data before edits.
- Treat `SQL Databases/` as source material: never modify it. Use an approved copy or minimized derivative for browser delivery.
- The app is browser-only. Do not add accounts, servers, telemetry, external AI calls, or network-dependent query execution without explicit approval.
- Grade an executed result table, never SQL strings. Preserve the runner boundary; do not make validation a bypass for execution.
- Keep learner interactions keyboard-operable with semantic controls, visible focus, readable result tables, and feedback that does not rely on color.
- Verify reference SQL against an approved local dataset before adding or changing a mission.
- Run `npm run check` before handoff when Node dependencies are available. Report any check that could not run and why.

