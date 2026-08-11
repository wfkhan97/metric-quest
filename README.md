# Metric Quest

Metric Quest is a browser-only SQL game for Tech MBA students. On day one at Aurora Music, the player gets pulled into the company mainframe: a rogue analyst AI has corrupted the database, and the only way out is to restore it sector by sector by writing real SQL. Learners read a mission brief, write a read-only SQL query, run it locally against a bundled SQLite dataset, and get feedback based on the executed result — never on the SQL text itself.

This is a presentation layer over a real SQL curriculum, not a re-skinned quiz: every "battle" is a genuine business question, graded on the real executed result. See [docs/GAME_DESIGN_BRIEF.md](docs/GAME_DESIGN_BRIEF.md) for the full narrative, world, and visual-asset brief, and [METRIC_QUEST_CODEX_CLAUDE_PLAYBOOK.md](METRIC_QUEST_CODEX_CLAUDE_PLAYBOOK.md) for what is built versus what is next.

## Quick start

```bash
npm install
npm run dev
```

The app is a static React + TypeScript site. It runs entirely in the browser via `sql.js`; there is no backend, and no query text, results, or progress ever leaves the browser (progress is saved to `localStorage`).

## Scripts

```bash
npm run dev        # start the Vite dev server
npm run lint        # eslint, zero warnings allowed
npm run typecheck   # tsc --noEmit
npm run test        # vitest run
npm run build       # typecheck + production build
npm run check       # lint + test + typecheck + build
```

Run `npm run check` before handing off any change.

## Deployment

> **Course-data release gate — resolved 2026-08-10.** Per the release gate
> in [docs/AI_WORKFLOW.md](docs/AI_WORKFLOW.md), the product owner approved
> shipping the minimized 5-table derivative (`Customer`, `Genre`, `Invoice`,
> `InvoiceLine`, `Track`; `src/assets/data/iTunes.min.sqlite`, verified
> against all 25 missions) rather than the full `SQL Databases/iTunes.sqlite`
> reference copy. [`src/lib/sqlRunner.ts`](src/lib/sqlRunner.ts) loads the
> derivative today, not the full file — see
> [docs/BACKLOG.md](docs/BACKLOG.md) item 10 for the full decision record
> and provenance. **What's still open is only whether/where to actually
> deploy** — that decision itself hasn't been made yet; nothing has been
> published publicly as of this writing.

Metric Quest is a fully static site with no server-side component: `npm run build` produces `dist/`, and that directory is the entire deployable artifact.

```bash
npm run build   # runs typecheck, then vite build
# deployable output: dist/
```

**Vercel.** This repo includes a [`vercel.json`](vercel.json) that pins the build command (`npm run build`) and output directory (`dist`) explicitly rather than relying on auto-detection, and `package.json` pins `"engines": {"node": "22.x"}` so the build uses a confirmed Vercel-supported Node LTS instead of whatever the platform's default happens to be. To deploy:

1. Import the repository into a new Vercel project — `vercel.json` is picked up automatically, no manual framework/build/output configuration needed.
2. Install command: leave the default (Vercel detects `pnpm-lock.yaml` and uses `pnpm install` automatically).
3. No environment variables are required — the app has no backend, no accounts, and calls no external API at runtime.

Any static host that can serve a prebuilt `dist/` directory (Netlify, GitHub Pages, Cloudflare Pages, S3 + CloudFront, etc.) works the same way: run `npm run build` and publish `dist/`.

## Project structure

```text
src/
  App.tsx              # thin router between TitleScreen, HomeView, AvatarCreatorView, CutsceneView, SectorTransitionView, and MissionView
  components/          # TitleScreen, HomeView, MissionView, CutsceneView, AvatarCreatorView, SectorTransitionView, ChapterMap, ProgressBar, SchemaExplorer, ResultTable, GlossaryPanel, SaveSlotPanel
  content/chapters.ts  # static curriculum outline (chapter titles for the chapter map)
  content/beats.ts     # cutscene beat/panel data (opening + mainframe-pull intro)
  lib/
    grading.ts         # compares executed result tables (not SQL text)
    sqlRunner.ts        # browser-local, read-only SQLite execution
    missions.ts         # mission content and expected results
    progress.ts         # versioned localStorage progress, multi-save slots
```

See [docs/architecture.md](docs/architecture.md) for the full product boundary, grading contract, and progress contract.

## Course data

Only `SQL Databases/iTunes.sqlite` — the dataset the app actually loads — is tracked in this repository. The rest of `SQL Databases/` is instructional source material and is intentionally excluded; see the data-release gate in [docs/AI_WORKFLOW.md](docs/AI_WORKFLOW.md) before adding more of it or deploying publicly.

## Working on this project

This repo is worked on from both Codex and Claude Code sessions. Read [AGENTS.md](AGENTS.md) or [CLAUDE.md](CLAUDE.md) (whichever applies) and [docs/AI_WORKFLOW.md](docs/AI_WORKFLOW.md) before making changes — in short: create a new branch for each session's work, never commit straight to `main`, and ask for approval before merging.
