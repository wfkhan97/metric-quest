# Metric Quest agent instructions

Read `docs/AI_WORKFLOW.md`, `docs/architecture.md`, and `docs/GAME_DESIGN_BRIEF.md` before editing product code.

- Narrative pivot: the product is now an 8-bit story (rogue AI corrupting Aurora Music's mainframe) wrapped around the same SQL curriculum. `docs/GAME_DESIGN_BRIEF.md` is the source of truth for tone, world, and copy — read it before writing mission/UI copy or building a new screen (avatar creator, sector transitions). This changes presentation and copy only, never the SQL loop, grading contract, or syllabus coverage.
- Visual assets (pixel art, sprites, illustrations) come from an external design tool, not from agent-generated images. Ship new screens with simple placeholder art (CSS/SVG shapes) until real assets are supplied, and structure components so dropping in final art later is not a rewrite.
- Git workflow: never commit to `main` directly. Create a new branch at the start of every session, do the work there, then summarize what changed and ask the user to approve the merge before merging or pushing to `main`. Full detail in `docs/AI_WORKFLOW.md`.
- Work in small, reviewable changes. Inspect the current tree and relevant source data before edits.
- Treat `SQL Databases/` as source material: never modify it. Use an approved copy or minimized derivative for browser delivery.
- The app is browser-only. Do not add accounts, servers, telemetry, external AI calls, or network-dependent query execution without explicit approval.
- Grade an executed result table, never SQL strings. Preserve the runner boundary; do not make validation a bypass for execution.
- Keep learner interactions keyboard-operable with semantic controls, visible focus, readable result tables, and feedback that does not rely on color — on every text-heavy learning surface (brief, schema explorer, SQL editor, results table, feedback), even inside the retro/pixel-art presentation.
- Verify reference SQL against an approved local dataset before adding or changing a mission.
- Run `npm run check` before handoff when Node dependencies are available. Report any check that could not run and why.

