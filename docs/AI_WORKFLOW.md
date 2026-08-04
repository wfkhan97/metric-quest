# AI workflow and verification

## Working agreement

1. Read `AGENTS.md`, this document, `docs/architecture.md`, and the relevant source files before editing.
2. Assign one owner to each bounded change. Do not edit the same feature concurrently from separate tools.
3. Keep source datasets in `SQL Databases/` immutable. Inspect with read-only commands only.
4. Use AI-generated SQL as a hypothesis, not as evidence. Execute a reference query locally before encoding expected results.
5. In handoffs, list changed files, checks run, checks unavailable, user-visible behavior, and remaining risks.

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

