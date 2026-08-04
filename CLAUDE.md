# Metric Quest

Metric Quest is a browser-only SQL game for Tech MBA students investigating fictional Aurora Music business questions. Read `AGENTS.md` and `docs/AI_WORKFLOW.md` first.

Shared constraints: the course database is read-only source material, SQL must run locally in the browser, grading compares executed results rather than query text, and learner progress stays in local storage. Do not create a backend or public deployment bundle of course data without approval/minimization review.

Git workflow: this repo is shared with Codex sessions. Never commit to `main` directly — create a new branch at the start of every session, do the work there, then summarize what changed (files, checks, remaining risks) and ask the user to approve the merge before merging or pushing to `main`. Full detail in `docs/AI_WORKFLOW.md`.

