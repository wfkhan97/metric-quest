# Architecture

## Product boundary

Metric Quest is a static React + TypeScript application. SQL executes in the learner's browser with `sql.js`, against the supplied local `SQL Databases/iTunes.sqlite` asset. The application sends no query text, results, progress, or course data to a server.

```text
React UI -> mission definitions -> browser-local SQLite runner -> executed result table
                                              |                         |
                                              v                         v
                                        localStorage progress <- result-based validator
```

## Grading contract

Mission validation receives a typed result table returned by the runner. It compares normalized column labels, values, numeric precision, and (unless a mission says otherwise) unordered rows to an expected table. It must not compare SQL text and it must not mark an unexecuted query correct.

The runner allows one read-only `SELECT`, `WITH`, or `EXPLAIN SELECT` query and returns clear loading, syntax, schema, and runtime errors. Each query receives a new in-memory database created from cached source bytes, so no query state persists. Later temporary-table or view exercises need a separately approved isolated execution design.

## Progress contract

The browser stores completed mission IDs, earned points, badges, and a schema version in `localStorage`. Progress is private to that browser, replay-safe, and must tolerate corrupt or outdated saved data by falling back safely.

## Current foundation

`src/lib/grading.ts` compares executed tables with normalized column labels, numeric precision, values, and optional row order. `src/lib/sqlRunner.ts` owns browser-local loading and read-only execution. `src/lib/missions.ts` contains only M1.1, M2.1, M3.1, and M8.1; `src/lib/progress.ts` owns versioned local progress.
