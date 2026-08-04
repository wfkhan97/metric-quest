# Metric Quest: Three-Week Build Plan

## One-line pitch

**Metric Quest** is an accessible SQL game for Tech MBA students, framed as an
8-bit adventure: the player gets pulled into Aurora Music's mainframe to stop
a rogue analyst AI that is corrupting the company's data, restoring each
corrupted "sector" by writing and running real SQL queries. See
`docs/GAME_DESIGN_BRIEF.md` for the full narrative, world, and visual-asset
brief — this pivot changes presentation and copy only; the underlying SQL
loop, grading contract, and syllabus coverage are unchanged.

## Why this is the right build scope

The game has one repeatable loop: read a business brief, inspect a tiny schema,
write and run SQL, receive result-based feedback, and unlock the next clue.
That loop is more valuable than many disconnected mini-games because every new
mission builds on the previous query skills.

Build it as a conventional web app with Codex and Claude Code. The first version
should run entirely in the browser, with `sql.js` and the supplied
`SQL Databases/iTunes.sqlite` file; no account, server, or network connection
is required for play. This makes static Vercel deployment straightforward when
the product is ready.

## Design commitments

- **Beginner first.** Each mission introduces one primary idea and never
  requires unexplained syntax.
- **Result-based grading.** Accept different correct queries by comparing the
  returned columns and rows with the expected result instead of comparing SQL
  text.
- **Motivating, not punitive.** Missions award points, badges mark capabilities,
  hints are always available, progress is saved locally, and players can replay
  a completed mission. No countdown timer is required.
- **Accessible by default, even in the game skin.** All actions work with a
  keyboard; labels, focus states, contrast, readable type, and non-color-only
  feedback are required on every text-heavy learning surface (brief, schema
  explorer, SQL editor, results table, feedback). Decorative screens (avatar
  creator, sector transitions, chapter-map chrome) may carry a pixel-art
  treatment, but never at the cost of that accessibility floor.
- **AI literacy, not AI answer vending.** The AI-verification chapter — now
  the sector where the rogue AI antagonist first appears directly — asks
  players to verify an AI-generated query and conclusion, not just prompt one.

## Narrative and database

The player is a new hire at **Aurora Music**, a digital-music retailer, who
gets pulled into the company mainframe on day one and finds it corrupted by a
rogue analyst AI (working name in `docs/GAME_DESIGN_BRIEF.md`; confirm or
rename before it ships). Each business question is now framed as restoring a
corrupted sector of the mainframe by running real SQL against the real data —
the same sequence of questions still builds toward a final recommendation to
leadership: where is revenue coming from, who are the customers, which
products matter, and what caveats remain. The business logic and expected
results behind every mission do not change; only the in-world framing does.

The supplied `iTunes.sqlite` is a strong first dataset: Lecture 2 explicitly
uses it for the in-class lab, it is compact enough to ship in-browser, and its
sales tables are instantly legible as business analytics. The player should
initially see only these high-value tables:

```text
Customer(CustomerId, FirstName, LastName, Country, SupportRepId)
Invoice(InvoiceId, CustomerId, InvoiceDate, BillingCountry, Total)
InvoiceLine(InvoiceLineId, InvoiceId, TrackId, UnitPrice, Quantity)
Track(TrackId, Name, AlbumId, GenreId, Milliseconds, UnitPrice)
Album(AlbumId, Title, ArtistId)
Artist(ArtistId, Name)
Genre(GenreId, Name)
```

Use the course's `sqlite_fb.sqlite` as an optional introductory dataset for
Lectures 1 and 3, and reserve `yelp_reduced.sqlite` for a later capstone or
Yelp-project extension. Avoid loading the 87 MB Yelp database into the first
browser demo.

## Syllabus coverage map

| Chapter | Mission outcome | Syllabus topics |
| --- | --- | --- |
| 1. Orientation | Find a business and inspect its data | `SELECT`, `FROM`, `WHERE`, `DISTINCT`, `ORDER BY`, `LIMIT` |
| 2. Scoreboard | Report sales and review metrics | aggregation, `GROUP BY`, `HAVING` |
| 3. Customer voice | Identify themes in customer reviews | text data and string functions |
| 4. Connected evidence | Link orders, customers, and businesses | database schemas and joins |
| 5. Analyst workbench | Stage and reuse intermediate analysis | subqueries, temporary tables, CTEs |
| 6. The clock | Analyze orders and reviews over time | dates and times |
| 7. Decision rules | Categorize performance and clean numeric fields | `CASE`, type casting |
| 8. One source of truth | Combine and preserve useful analyses | set operations, views |
| 9. AI analyst review | Detect an unreliable AI analysis | prompting, running, and verifying AI-generated SQL |
| 10. Final briefing | Defend a recommendation | SELECT framework: frame, explore, execute, challenge |

This table predates the finalized 9-chapter structure actually implemented in
`SQL_CASEFILES_MISSION_CURRICULUM.md` and `src/content/chapters.ts` (it does
not have a separate "customer voice / text data" chapter, for example). Treat
the mission curriculum file as authoritative for chapter numbering and
topics; treat `docs/GAME_DESIGN_BRIEF.md` as authoritative for the in-world
"Sector" name attached to each of those 9 chapters.

**Interpretation note:** The supplied PDF is titled `NBAY6550_Syllabus_S26.pdf`
but its header says Spring 2024. The table above covers every topic in its class
schedule. Course slides or assignments can later tune terminology and examples.

## Release strategy

### Milestone 1 - Vertical slice

1. Opening onboarding and chapter map.
2. A real in-browser SQLite query editor.
3. Four polished missions: SELECT/filter/sort, aggregate/GROUP BY, INNER JOIN,
   and an AI-verification mini-case.
4. Points, one earned badge, result-based validation, useful errors, hints,
   post-success teaching, and saved progress.
5. An end-to-end final case that asks the player to frame and challenge an
   analysis.

### Milestone 2 - Full learning path

- Add every mission in `SQL_CASEFILES_MISSION_CURRICULUM.md` and validate each
  reference query against the bundled database.
- Support multi-statement temporary-table and view exercises safely, resetting
  the database at the beginning of every mission.
- Add the final SELECT-framework briefing and its structured reflection.

### Deliberate non-goals for version 1

Leaderboards, accounts, multiplayer, or an LLM API. These can make a later
release richer, but they do not teach SQL better than a reliable query
runner, clear feedback, and sound learning progression.

Light narrative presentation (avatar creator, decorative sector-transition
scenes, an antagonist) is now in scope per `docs/GAME_DESIGN_BRIEF.md` — the
prior version of this document ruled out "animation" and "gamification"
entirely, which no longer reflects the product direction. The constraint that
still holds is that none of it may compromise the accessible core (contrast,
keyboard operability, readable tables) or the result-based grading contract.
Sound/music is not ruled in or out yet — flag it separately if you want it,
since it raises its own asset and licensing questions.

## Three-week build sequence

| Week | Focus | Definition of done |
| --- | --- | --- |
| 1 | Foundation and vertical slice | App scaffolding, bundled SQLite runner, result validator, local progress, accessible mission UI, and M1.1/M2.1/M3.1/M8.1 work end-to-end. |
| 2 | Complete the course path | Implement the remaining curriculum, including text, joins, subqueries, CTEs, dates, `CASE`, casts, sets, views, and structured AI-review cases. |
| 3 | Learning quality and release | Test every mission, improve feedback and onboarding, complete keyboard/mobile/accessibility checks, rehearse the demo, and deploy a static release. |

Use the first two or three work sessions to establish the foundation. Do not add
new visual flourishes until the vertical slice has tests and a clean playthrough.

## Implementation architecture

```text
React UI
  -> mission definitions (TypeScript/JSON)
  -> query runner (sql.js / SQLite in a web worker)
  -> normalizer + expected-result validator
  -> localStorage progress
```

Recommended components:

```text
AppShell, ChapterMap, MissionBrief, SchemaExplorer, SqlEditor,
QueryResults, HintPanel, FeedbackPanel, SuccessLesson, ProgressStore,
PointsBadgeBar, AvatarCreator, SectorTransition
```

`AvatarCreator` and `SectorTransition` are new, per `docs/GAME_DESIGN_BRIEF.md`
— both are presentation-only additions with their own local-progress fields;
neither touches the runner, validator, or mission data contracts.

Never use `eval`. The app should execute only against its bundled SQLite
database. For a first version, reset the database state when a mission starts;
this avoids accidental cross-mission changes from DDL/DML queries.

## Mission anatomy

Each mission definition needs:

```ts
type Mission = {
  id: string;
  chapter: number;
  title: string;
  concept: string;
  briefing: string;
  successQuestion: string;
  starterSql: string;
  visibleTables: string[];
  hints: string[];
  expectedColumns: string[];
  expectedRows: Array<Array<string | number | null>>;
  explanation: string;
  points: number;
  badge?: { name: string; description: string };
  unlockAfter?: string;
};
```

The evaluator should normalize blank strings, NULL, number precision, column
case, and row order only when the task does not specify `ORDER BY`. Give
feedback about the result, not merely “wrong.”

## Codex + Claude Code workflow

The step-by-step instructions and prompt pack now live in
`METRIC_QUEST_CODEX_CLAUDE_PLAYBOOK.md`. Use it as the operating guide for the
project. The important rule is **one agent, one bounded change, one verified
handoff**: do not have Codex and Claude Code edit the same feature at once.

## Demo script (90 seconds)

1. “Metric Quest teaches SQL through a growing business investigation, not a
   static quiz.”
2. Show the brief, schema explorer, and a simple filter mission.
3. Run a query and show result-based feedback plus a hint.
4. Jump to a join/CTE mission to show the progression.
5. Show the AI verification case: “The game teaches learners to verify AI,
   not just prompt it.”
6. End with the chapter map and explain that content maps to the full NBA 6550
   syllabus.

## Confirmed choices

- Audience: Tech MBA classmates who are SQL beginners.
- Tone: a playful 8-bit adventure (see `docs/GAME_DESIGN_BRIEF.md`) wrapped
  around a business-analytics learning loop — points, badges, and progress
  are real mechanics, and the rogue-AI story motivates the same missions
  rather than replacing them.
- Builder and time: solo; develop deliberately over three weeks.
- Source material: use future class notes to refine the missions; the first
  three decks and supplied databases already inform this version.
