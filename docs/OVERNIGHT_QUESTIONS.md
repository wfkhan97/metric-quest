# Overnight session — open questions for the product owner

Append-only, one entry per ambiguity or product-level decision point hit
during unattended work. **Never guess on a product decision** — add an
entry here (with the best-effort default taken, if any, and which
branch/commit it's on) and move to the next thing. Implementation-detail
judgment calls (naming, exact spacing, which of two reasonable test
inputs to use) don't need an entry unless genuinely uncertain — use
judgment, note it briefly in the relevant commit message, and move on.

Read every entry here before doing anything else in the morning — this
is the punch list.

---

### Standing / already-known (not new tonight, restated so nothing is
silently attempted)

1. **Between-sector story beats** — `src/content/beats.ts`'s
   `sectorBeats` is empty. Whether every sector transition gets an
   authored beat, or only some (and if so which), is an open product
   question already on record in `docs/BACKLOG.md` item 4. Not decided
   tonight, not authored tonight.
2. **P5.5 — the new "pulled into the mainframe" cutscene.** Still
   waiting on your script (copy, panel count, tone). Not started.
3. **Item 3 — AI tutor (Monet.gg integration).** Still waiting on an
   explicit approval decision before any implementation, per `AGENTS.md`.
   Not prototyped.
4. **Item 7 — avatar sprite transparency fix.** Still waiting on you to
   run the Claude Design re-export prompt in `docs/GAME_DESIGN_BRIEF.md`
   §B Step 1c. Not agent-fixable.
5. **Item 8 — multi-save/profile state.** Explicitly deferred by your
   own prior direction. Not built.

### Suggestions surfaced tonight, not acted on (need your call)

*(Component-level React tests are not currently possible without adding
a new dependency — no `@testing-library/react` or DOM-simulation library
in `package.json` today. If you want component/interaction tests (not
just the pure-logic unit tests added tonight in `src/lib/`), that's a
tooling decision worth its own conversation, not something to add
unannounced overnight.)*

### 2026-08-10 — Avatar color picker is now dead code in the running UI

`src/components/AvatarCreatorView.tsx` only renders its "Choose a color"
`<fieldset>` (and thus lets a player actually pick from `colorOptions`)
when `!hasImageSprite` — i.e. only for a sprite that has no real art yet.
Found during tonight's Lane C accessibility audit: every one of the 12
sprites in `src/lib/avatarOptions.ts` now has a real `imageUrl` (confirmed
by this session's own `src/lib/avatarOptions.test.ts`), so `hasImageSprite`
is always `true` today and that fieldset never renders. `colorOptions`,
`getColorOption`, and `AvatarConfig.colorId` still exist and are still
read (e.g. `defaultAvatar.colorId`, `AvatarPreview`'s `colorId` prop), but
a player can no longer actually choose a color through the UI.

Not fixed tonight — this is a product call, not an accessibility bug (the
fieldset's absence isn't a keyboard/color-feedback defect, it correctly
never renders), and removing dead code here means deciding whether
recoloring is meant to come back for some future placeholder sprite or is
gone for good now that real art shipped for all 12. Best-effort default if
no correction is given: leave as-is — it's harmless dead code, not a
regression, and deleting `colorOptions` would also mean deciding what
happens to the `colorId` field already saved in existing players'
`AvatarConfig` records.

### 2026-08-12 — All five "standing / already-known" items above are resolved

A documentation-accuracy pass found every item in the "standing /
already-known" list at the top of this file is now stale — each has
since shipped, verified directly against `main`, not appended as a new
question:

1. **Between-sector story beats** — `sectorBeats` is no longer empty;
   Sector 8 has an authored entrance beat and there's a post-campaign
   finale beat. See `docs/BACKLOG.md`'s design asset tracker, "Sector
   8/9 confrontation cinematic" row (shipped 2026-08-12).
2. **P5.5 cutscene** — shipped 2026-08-10, see
   `docs/CUTSCENE_P5_5_MAINFRAME_INTRO.md`.
3. **Item 3, AI tutor** — built and merged to `main`, gated off for the
   current release (`.vercelignore` excludes `api/`). See
   `docs/BACKLOG.md` item 3.
4. **Item 7, avatar sprite transparency** — fully fixed 2026-08-10, all
   12 sprites re-exported and verified. See `docs/BACKLOG.md` item 7.
5. **Item 8, multi-save/profile state** — shipped 2026-08-10. See
   `docs/BACKLOG.md` item 8.

Not itself a new question — recorded here per this file's own
append-only convention, so a reader who starts at the top isn't misled
by a "punch list" whose items are all long since closed. Current status
for any of these lives in `docs/BACKLOG.md`, not here.

<!-- Append new entries below this line, most recent last. -->

### 2026-08-18 — AI tutor provider direction changed

The product owner replaced the dormant Monet.gg OAuth plan with a planned
game-owned Moonshot API integration. This is recorded as a considered-and-
set-aside option, not an implementation failure, in `docs/BACKLOG.md` item
3. The Moonshot route remains blocked on a tutor-specific quality/cost model
selection and a new implementation/release go-ahead; leave the current tutor
disabled and `api/` excluded from deployment until then.
