# AI workflow and verification

## Working agreement

1. Read `AGENTS.md`, this document, `docs/architecture.md`, and the relevant source files before editing.
2. Assign one owner to each bounded change. Do not edit the same feature concurrently from separate tools.
3. Keep source datasets in `SQL Databases/` immutable. Inspect with read-only commands only.
4. Use AI-generated SQL as a hypothesis, not as evidence. Execute a reference query locally before encoding expected results.
5. In handoffs, list changed files, checks run, checks unavailable, user-visible behavior, and remaining risks.

## Git workflow

This repository is shared between Codex and Claude Code sessions, so branch discipline replaces relying on memory of who touched what.

1. Never commit directly to `main`. At the start of a session, create a new branch off `main` (e.g. `codex/<short-topic>` or `claude/<short-topic>`).
2. Do all of that session's work on its own branch, committing as normal.
3. When the work is ready, do not merge or push to `main` yourself. Summarize what happened — changed files, checks run and their results, checks that could not run and why, user-visible behavior, and remaining risks or placeholders — and explicitly ask the user to approve the merge.
4. Only merge (or push to `main`) after the user gives that approval.

## Required project checks

After dependencies are installed, run these from the repository root:

```text
npm run lint
npm run typecheck
npm run test
npm run build
# or: npm run check
```

Do not claim a check passed when its runtime or dependencies are unavailable.

## Course-data release gate

The original course databases are instructional source material, not automatic public assets. Before a public deployment, explicitly approve either:

- a licensed and reviewed copy of the dataset; or
- a minimized derivative containing only necessary tables/columns/rows, with sensitive or unnecessary course material removed.

Record the decision, dataset provenance, and minimization method in the release handoff. Do not publish a source database by default.

