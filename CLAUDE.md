# Metric Quest

Metric Quest is a browser-only SQL game for Tech MBA students. The player is pulled into Aurora Music's mainframe to stop a rogue analyst AI that is corrupting the company's data, restoring it sector by sector by writing real SQL. Read `AGENTS.md`, `docs/AI_WORKFLOW.md`, and `docs/GAME_DESIGN_BRIEF.md` first — the last one is the source of truth for tone, world, and copy for any narrative/UI work.

Shared constraints: the course database is read-only source material, SQL must run locally in the browser, grading compares executed results rather than query text, and learner progress stays in local storage. Do not create a backend or public deployment bundle of course data without approval/minimization review. The narrative pivot changes presentation and copy only — never the SQL loop, grading contract, or syllabus coverage — and visual/pixel-art assets come from an external design tool, not from agent-generated images; ship placeholder art until real assets land.

Git workflow: this repo is shared with Codex sessions. Never commit to `main` directly — create a new branch at the start of every session, do the work there, then summarize what changed (files, checks, remaining risks) and ask the user to approve the merge before merging or pushing to `main`. Full detail in `docs/AI_WORKFLOW.md`.

