# Architecture

## Product boundary

Metric Quest is a static React + TypeScript application. SQL executes in the learner's browser with `sql.js`. The runtime data source is `src/assets/data/iTunes.min.sqlite`, a minimized 5-table derivative (`Customer`, `Genre`, `Invoice`, `InvoiceLine`, `Track`) of the original `SQL Databases/iTunes.sqlite` reference copy — see `docs/BACKLOG.md` item 10 for the release-gate decision and verification. `SQL Databases/` itself is never modified or shipped. The application sends no query text, results, progress, or course data to a server.

```text
React UI -> mission definitions -> browser-local SQLite runner -> executed result table
                                              |                         |
                                              v                         v
                                        localStorage progress <- result-based validator
                                              |
                                              v
                               anonymous aggregate Vercel Analytics events
```

## Grading contract

Mission validation receives a typed result table returned by the runner. It compares normalized column labels, values, numeric precision, and (unless a mission says otherwise) unordered rows to an expected table. It must not compare SQL text and it must not mark an unexecuted query correct.

The runner allows one read-only `SELECT`, `WITH`, or `EXPLAIN SELECT` query by default and returns clear loading, syntax, schema, and runtime errors. Each query receives a new in-memory database created from cached source bytes, so no query state persists. A narrow, opt-in exception (`Mission['allowsTempWorkspace']`, `executeTempWorkspaceQuery` in `sqlRunner.ts`) additionally permits exactly one `CREATE TEMP TABLE|VIEW <name> AS SELECT ...` setup statement followed by one graded read-only statement, for the temp-table and view missions specifically — still no persistent `CREATE TABLE`, `INSERT`, `UPDATE`, `DELETE`, or `DROP`.

When Vercel Custom Events are enabled for the project, `src/lib/analytics.ts` sends only fixed, anonymous aggregate event fields: game starts, mission IDs/sectors, query outcome categories, optional pre-defined mistake-signature IDs, hint/solution use, and broad recovery categories. It never sends SQL text, executed result tables, avatar callsigns, save-slot data, a durable player ID, error text, or stack traces. This instrumentation is observational only: it cannot affect query execution, grading, feedback, or progress.

## Progress contract

The browser stores completed mission IDs, earned points, badges, and a schema version in `localStorage`, wrapped in named, switchable save slots (`metric-quest-saves-v1`, `src/lib/progress.ts`) rather than one implicit save — see `docs/BACKLOG.md` item 8. Progress is private to that browser, replay-safe, and must tolerate corrupt or outdated saved data by falling back safely.

## Current foundation

`src/lib/grading.ts` compares executed tables with normalized column labels, numeric precision, values, and optional row order. `src/lib/sqlRunner.ts` owns browser-local loading and read-only execution. `src/lib/missions.ts` contains the full 32-mission curriculum (M1.1-M9.2, all 9 sectors); `src/lib/progress.ts` owns versioned local progress and save-slot management (`listSaveSlots`, `createNewSave`, `switchActiveSave`, `deleteSave`, `renameSave`, `resetActiveSave`).

`src/App.tsx` is a thin router between `TitleScreen` (first-load Resume/New game gate), `HomeView` (onboarding), `AvatarCreatorView` (one-time/re-editable avatar setup), `CutsceneView` (the opening and mainframe-pull intro beats, data-driven from `src/content/beats.ts`), `SectorTransitionView` (one-time-per-sector interstitial), and `MissionView` (the active mission), all under `src/components/`. Shared presentational pieces (`ChapterMap`, `ProgressBar`, `SchemaExplorer`, `ResultTable`, `GlossaryPanel`, `SaveSlotPanel`) live alongside them. `src/content/chapters.ts` holds the static curriculum outline (all 9 chapter titles) so the chapter map can show "coming soon" for chapters without a mission yet. The UI layer only calls the exported functions of `grading.ts`, `sqlRunner.ts`, `missions.ts`, and `progress.ts` — it does not reimplement or bypass any of that logic.
