# Metric Quest: Codex + Claude Code Playbook

This is the operating guide for building Metric Quest over three weeks. The
product plan and mission curriculum should live beside this file when available.

## The important mode clarification

You do **not** need to paste every prompt into one Goal Mode turn.

Use one Goal Mode objective per milestone, then send the implementation prompts
as ordinary follow-up messages, one at a time:

```text
Build and verify Metric Quest's Week 1 vertical slice: an accessible browser
SQL game with a local SQLite runner, result-based validation, saved progress,
points/badges, and the first four approved missions.
```

After Prompt 1 finishes, review the diff and checks, then send Prompt 2 in the
same active goal. Select Goal Mode again only when you start a new milestone or
the previous goal is complete. You do not need a separate goal for each feature.

Use Plan Mode when you want analysis without edits:

- before a major architecture decision;
- before changing the SQL execution or safety boundary;
- before comparing two UI designs;
- before a release audit where you want findings rather than fixes.

Approve the plan, then return to Goal Mode for implementation. Plan Mode is not
needed for every bounded coding prompt.

## Repository setup

Create a Git repository and keep these durable files at its root or in `docs/`:

```text
AGENTS.md                 Codex/project workflow rules
CLAUDE.md                 Claude Code project memory
docs/AI_WORKFLOW.md       shared rules and verification commands
docs/product-plan.md      product and architecture decisions
docs/mission-curriculum.md source of truth for mission content
```

Keep shared decisions in `docs/AI_WORKFLOW.md`; do not duplicate the entire
curriculum in both `AGENTS.md` and `CLAUDE.md`.

## How to divide the work

Use Codex as the default owner for SQLite behavior, data inspection, mission
correctness, validators, tests, and release audits. Use Claude Code as the
default owner for component implementation, layout, learner-facing interaction,
and accessibility polish. Either tool can do either kind of work; the key rule
is one named owner per bounded change.

Never have both tools edit the same feature simultaneously. Finish a task,
review the diff, run checks, and commit before handing the repository to the
other tool.

## Claude Code practices to use

1. Run Claude Code from the repository root so it can inspect the project.
2. Run `/init` once to create project memory, then keep `CLAUDE.md` short and
   specific. Reference `docs/AI_WORKFLOW.md` rather than copying everything.
3. For architecture or design questions, start a read-only planning session:

   ```text
   claude --permission-mode plan
   ```

   Ask Claude to inspect the repository, identify risks, and propose a plan.
   Do not ask it to implement until you approve the plan.
4. For implementation, use normal permission prompts or a bounded edit mode.
   Review commands and diffs. Do not use a permission bypass for this project.
5. Keep related follow-ups in the same session with `claude -c` or
   `claude --continue`. Start a fresh session when ownership or scope changes.
6. Ask for tests after every edit and require a handoff summary.
7. Let Claude inspect the repository rather than pasting the whole codebase into
   the prompt.

## The prompt shape to use every time

Each request should contain five pieces:

```text
Context: read these files and inspect the current implementation.
Bounded task: change only this feature.
Constraints: preserve these contracts and safety rules.
Acceptance criteria: these behaviors/tests must pass.
Handoff: report changed files, checks run, decisions, and remaining risk.
```

## Week 1: foundation and vertical slice

Send these as separate follow-ups inside the Week 1 Goal.

### Prompt 1 - Codex: inspect and scaffold

```text
Read the current repository before editing. We are building Metric Quest, an
accessible browser SQL game for Tech MBA students using a local SQLite music
retailer dataset.

Create a React + TypeScript project foundation and durable instructions. Add
AGENTS.md, CLAUDE.md, docs/AI_WORKFLOW.md, and docs/architecture.md. Document
the browser-only SQLite boundary, result-based grading, local progress, the
required test/typecheck/lint/build commands, and the rule that course data must
be approved or minimized before public deployment.

Do not build the full UI or curriculum yet. Inspect any supplied iTunes
database without modifying it. Add one smoke test. Show the proposed file
structure first, then implement it. Run all available checks and provide a
handoff summary.
```

### Prompt 2 - Claude Code: shell and onboarding

```text
Read README.md, CLAUDE.md, docs/AI_WORKFLOW.md, docs/architecture.md, and the
existing source tree. Implement only the learner-facing shell for Metric Quest.

Create an accessible home/onboarding view and mission view with Aurora Music
business context, chapter map, progress bar, points/badges, business brief,
schema explorer placeholder, SQL editor placeholder, results area, hints, and
feedback. Use a high-contrast navy/cream/teal visual system. Support keyboard
navigation, visible focus, readable tables, and 320px through desktop widths.

Do not change database or mission-validation logic. Run the existing checks and
report changed files, manual accessibility checks, and remaining placeholders.
```

### Prompt 3 - Codex: SQLite runner

```text
Inspect the existing shell and documentation. Implement the browser-only SQLite
runner using sql.js or an equivalent browser-safe package. Load an approved
local copy or minimized derivative of iTunes.sqlite without modifying the
original course file.

Return typed columns and serializable rows, map syntax/runtime errors to plain
language, and reset database state when a mission starts. Initially allow only
read-only SELECT queries; reject writes with a clear explanation. Keep the
interface extensible for later isolated temporary-table/view missions.

Add tests for successful execution, syntax errors, and blocked writes. Run
typecheck, lint, tests, and build. Provide a handoff.
```

### Prompt 4 - Claude Code: first mission

```text
Read the mission curriculum and current query-runner interfaces. Implement the
complete learner flow for M1.1 Priority invoices: business brief, starter SQL,
two hints, schema visibility, Run Query, result table, specific error feedback,
success lesson, points, local progress, and the Revenue Scout badge.

Do not compare SQL strings. Use the existing result-validation contract. Do not
reveal the solution unless the player requests it. Do not change the SQLite
runner. Test the keyboard path and run all project checks. Provide a handoff.
```

### Prompt 5 - Codex: validator

```text
Inspect M1.1, the mission model, and the current runner. Implement a reusable
result-table validator. Normalize column-name case, NULL/number/string values,
and numeric precision safely. Preserve row order only for order-sensitive
missions. Return actionable mismatch categories: wrong columns, row count,
values, or order.

Add fixtures showing that an equivalent correct query passes and common near
misses fail. Refactor M1.1 to use it. Never accept an unexecuted query or bypass
the SQLite runner. Run the full suite and report examples of pass/fail behavior.
```

### Prompt 6 - Codex: remaining vertical-slice missions

```text
Add and test M2.1 Country revenue, M3.1 Name the high-value customers, and M8.1
Duplicate-customer trap from the approved curriculum. Validate every reference
query against the approved local iTunes data before encoding expected results.

M8.1 must teach why a customer/invoice join can overcount customers and accept
the correct result of 59 unique purchasers. Preserve result-based grading,
hints, points, badges, and beginner-readable explanations. Do not add visual
features. Run tests and provide a handoff.
```

### Prompt 7 - Claude Code: vertical-slice polish

```text
Review the working four-mission vertical slice as a novice Tech MBA learner.
Improve only interaction clarity and accessibility: onboarding, transitions,
hint disclosure, loading/empty/error states, result-table readability, mobile
layout, focus visibility, and non-color feedback. Preserve SQL behavior,
mission content, and validator contracts. Do not add timers or distracting
gamification. Run checks and provide a manual keyboard test checklist.
```

## Week 2: full syllabus

Create a new Goal Mode objective:

```text
Complete and verify Metric Quest's full NBA 6550 SQL learning path using the
approved mission curriculum, with tested result validation and isolated
multi-statement exercises.
```

Then send these separately:

### Prompt 8 - Codex: content batches

```text
Implement the next mission batch from the curriculum. Start with M1.2-M1.4,
M2.2-M2.3, and M3.2-M3.4. Verify every reference query against the approved
database, add expected-result fixtures, and add a test for every mission.
Report any query that needs correction instead of silently changing the
curriculum. Preserve existing accessibility and grading contracts.
```

Repeat the same prompt for each chapter batch rather than asking for the entire
curriculum in one turn.

### Prompt 9 - Codex: advanced SQL safety

```text
Assess whether the current runner can safely support M4.1-M7.2: subqueries,
CTEs, dates, CASE, CAST, UNION, temporary tables, and views. First propose the
smallest safe design for multi-statement missions in read-only/isolated state.
Do not edit until the design is approved.
```

After approving the plan, send:

```text
Implement the approved isolated multi-statement design and the M4.1-M7.2
missions. Reset state at every mission, restrict permitted statements to the
configured exercise, and add tests for both accepted workflows and blocked
unsafe writes. Run all checks and report the security boundary.
```

### Prompt 10 - Claude Code: advanced learning UX

```text
Read the new mission definitions and improve the learner experience for joins,
CTEs, dates, CASE, casts, sets, and views. Add a compact schema relationship
aid, clear multi-statement instructions, and fixed teaching explanations from
mission data. Do not call an external AI API and do not change SQL evaluation or
expected results. Test keyboard and small-screen use and provide a handoff.
```

## Week 3: responsible analysis and release

Create a new Goal Mode objective:

```text
Finish, assess, and release Metric Quest: complete the final AI-verification
and SELECT-framework cases, verify every syllabus topic, and prepare a tested
static deployment.
```

### Prompt 11 - Codex: final cases

```text
Implement M8.2, M8.3, M9.1, and M9.2 exactly as structured in the curriculum.
AI-review cases must expose missing filters, duplicate counts, or unsupported
claims without calling an external model. The final case must capture a
measurable framing choice, validate SQL output, and require a caveat about
inference limits. Add tests for accepted and rejected structured answers and
run the complete suite.
```

### Prompt 12 - Claude Code: release UX review

```text
Perform a release-readiness pass without changing architecture or mission
correctness. Inspect every screen for visual consistency, responsiveness,
keyboard flow, focus visibility, contrast, table readability, and clear wording.
Fix only verified presentation/accessibility issues. Run existing checks and
leave a checklist of anything requiring human review.
```

### Prompt 13 - Codex: final audit and deployment preparation

```text
Audit the current project against the product plan and mission curriculum.
Verify that every syllabus topic has an implemented mission, every reference
query is tested against approved data, grading is result-based, progress works,
and no backend/account/paid API is required for v1.

Run tests, typecheck, lint, and production build. Prepare README instructions
for a static host such as Vercel, including the actual build command and output
directory. Do not publish anything. Report prioritized findings with file and
line references, and fix only clear low-risk defects.
```

## Handoff template

```text
Handoff
- Outcome completed:
- Files changed:
- Checks run and result:
- Decisions made:
- Known limitations or follow-up:
- Recommended next owner: Codex / Claude Code / me
```

## Rule of thumb

If the prompt says “inspect,” “compare,” “propose,” or “audit,” use Plan Mode.
If it says “implement,” “add,” “fix,” or “test and repair,” use Goal Mode when it
belongs to the active milestone. Send one bounded prompt, wait for its handoff,
review the diff, then continue.

### Sources for the Claude Code practices

- [Claude Code CLI reference](https://docs.anthropic.com/en/docs/claude-code/cli-usage)
- [Claude Code common workflows](https://docs.anthropic.com/en/docs/claude-code/common-tasks)
- [Claude Code memory and `CLAUDE.md`](https://docs.anthropic.com/en/docs/claude-code/memory)
