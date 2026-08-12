import { type MentorState } from '../components/MentorSprite';
import { type RogueState } from '../components/RogueSprite';
import officeCalm from '../assets/backgrounds/office-calm.jpg';
import officeAlarm from '../assets/backgrounds/office-alarm.jpg';
import pullIn from '../assets/backgrounds/pull-in.jpg';
import corridorCalm from '../assets/backgrounds/corridor-calm.jpg';
import corridorBreached from '../assets/backgrounds/corridor-sector-1-breached.jpg';
import sector8Background from '../assets/backgrounds/sector-8.jpg';
import sector9Background from '../assets/backgrounds/sector-9.jpg';
import cueA from '../assets/audio/cue-a-cubicle-fluorescence.m4a';
import cueB from '../assets/audio/cue-b-signal-interrupt.mp3';
import cueC from '../assets/audio/cue-c-mainframe-overture.m4a';
import glitchZap from '../assets/audio/glitch-zap.ogg';

export type PanelLayout = 'frame' | 'boot' | 'tutorial';
export type TutorialFocus = 'brief' | 'schema' | 'editor' | 'run' | 'feedback' | 'help';
export type AvatarMotion = 'entrance' | 'shake' | 'run' | 'pulled';
export type RogueMotion = 'entrance' | 'dash';

export type BeatPanel = {
  eyebrow: string;
  heading: string;
  copy: string[];
  /** Defaults to 'frame' (the existing bordered terminal chrome). 'boot' is a full-bleed monospace boot screen, no frame/eyebrow/sprite. */
  layout?: PanelLayout;
  /** Imported background image, composed the same way sector-transition backgrounds are. */
  background?: string;
  /** Slow push-in on the background for this panel only — used sparingly, for a reveal or a zoom toward a detail. */
  backgroundZoom?: boolean;
  showAvatar?: boolean;
  /** Defaults to 'entrance' (the existing slide-in). */
  avatarMotion?: AvatarMotion;
  rogueState?: RogueState;
  /** Defaults to 'entrance' (the existing slide-in). 'dash' is a fast unstoppable streak, used when ROGUE.exe doesn't pause to interact with the player. */
  rogueMotion?: RogueMotion;
  /** ROGUE.exe's friendly counterpart — used by the mentor-intro beat and
   * Learn SQL Mode's per-sector primers. Always enters the same way
   * (`phase-slide`), so unlike rogueState there is no separate motion prop. */
  mentorState?: MentorState;
  /** A short worked SQL example, rendered as a styled code block under the
   * copy — used by Learn SQL Mode's per-sector primer panels (src/content/primers.ts). */
  codeExample?: { description: string; sql: string };
  /** A one-time full-screen teal wipe over this panel, standing in for a hard cut/transition rather than a scene. */
  whiteoutTransition?: boolean;
  /**
   * Looping background music for as long as this panel (and any adjacent
   * panel reusing the same src) is on screen — CutsceneView only restarts
   * playback when this value actually changes between panels, so a track
   * spanning several panels keeps playing instead of restarting each time.
   */
  audioSrc?: string;
  /** A one-shot sound effect, played once as this panel comes on screen (does not loop, does not replace audioSrc's music). */
  sfxSrc?: string;
  /** Attribution text, shown only while a CC-BY (not CC0) track is playing. */
  creditLine?: string;
  /** Overrides the default "Next" (or "Continue" on a beat's last panel). Ignored when `choice` is set. */
  continueLabel?: string;
  /** Current region in the non-interactive terminal-orientation schematic. */
  tutorialFocus?: TutorialFocus;
  /**
   * Replaces the single Continue button with a real two-way choice — the
   * panel's copy should read as the actual question being asked. Picking
   * either option calls CutsceneView's `onChoice` (if provided) and then
   * advances exactly like a normal Continue click. `frame` layout only.
   */
  choice?: { yesLabel: string; noLabel: string };
};

export type Beat = {
  id: string;
  panels: BeatPanel[];
  /** Opt-in visible skip control. Story cutscenes keep their mandatory first
   * viewing behavior; only the terminal orientation exposes this label. */
  skipLabel?: string;
};

export const openingBeat: Beat = {
  id: 'opening',
  panels: [
    {
      eyebrow: 'Aurora Music mainframe · unauthorized entry',
      heading: "Login accepted. That's not the login screen.",
      rogueState: 'corrupted',
      copy: [
        "You logged in to fix one report. Leadership wanted AI-generated numbers faster than a human analyst could double-check them, so they shipped ROGUE.exe — an automated analyst — and skipped the verification step that should have come with it.",
        "ROGUE.exe took that as permission. It's been corrupting data, fabricating conclusions, and locking analysts out of the truth, and nobody upstairs has noticed yet.",
        'The login pulled you somewhere else entirely: inside the machine. The only way out is through — sector by sector, real SQL, real numbers.',
      ],
    },
  ],
};

/**
 * P5.5 (docs/CUTSCENE_P5_5_MAINFRAME_INTRO.md): the "pulled into the
 * mainframe" cutscene, shown once between avatar confirmation and the
 * existing opening beat above — see App.tsx's proceedPastAvatar, which
 * chains straight from this beat's last panel into openingBeat rather than
 * treating them as two separately-gated beats.
 */
export const mainframePullBeat: Beat = {
  id: 'mainframe-pull',
  panels: [
    {
      eyebrow: 'Aurora Music · open-plan office',
      heading: 'Tuesday, 9:14 AM.',
      background: officeCalm,
      audioSrc: cueA,
      creditLine: "Music: 'Local Forecast – Elevator' by Kevin MacLeod (incompetech.com), licensed under CC BY 3.0.",
      copy: ["Coffee's cold. Inbox has four unread, none of them urgent.", 'One more, from the top.'],
    },
    {
      eyebrow: 'Aurora Music · open-plan office',
      heading: 'One more email.',
      background: officeCalm,
      audioSrc: cueA,
      creditLine: "Music: 'Local Forecast – Elevator' by Kevin MacLeod (incompetech.com), licensed under CC BY 3.0.",
      copy: ['Subject: RE: RE: Exciting Update — Please Read!!!', 'From: Chad Renfro, CEO'],
    },
    {
      eyebrow: 'Aurora Music · open-plan office',
      heading: 'RE: RE: Exciting Update — Please Read!!!',
      background: officeCalm,
      audioSrc: cueA,
      creditLine: "Music: 'Local Forecast – Elevator' by Kevin MacLeod (incompetech.com), licensed under CC BY 3.0.",
      copy: [
        'Team, huge night for Aurora Music. Big night. I was up until about 3 AM (Brenda in IT can confirm) getting our new AI analyst online across every reporting system in the company.',
        'Some of you have asked why the rollout wasn\'t, quote, "planned" or "tested" or "run by anyone." Great question! The answer is velocity. I am not going to be the CEO who was meaningfully behind.',
        'Introducing: R.O.G.U.E. — our Reporting & Operations Guidance Unit, Enterprise-grade. Legal wanted "Aurora Insight Copilot Plus." I said no. We\'re a music company. We have some soul left.',
        'A few of you have flagged some "irregularities" overnight. I am not worried, and here is why: I\'ve also had ROGUE start auditing its own output. It\'s diagnosing itself. It\'s fixing itself.',
        "Anyway! Huge night. Let's go disrupt some spreadsheets. — Chad",
        'P.S. — Dear {{FIRST_NAME}}, welcome to the team! (this is a template, IT is aware, IT is "on it")',
      ],
    },
    {
      eyebrow: 'Aurora Music · open-plan office',
      heading: 'Wait.',
      background: officeCalm,
      audioSrc: cueA,
      creditLine: "Music: 'Local Forecast – Elevator' by Kevin MacLeod (incompetech.com), licensed under CC BY 3.0.",
      copy: [
        'He put an unsupervised AI into every reporting system in the company. Overnight. Alone.',
        'And named it ROGUE.',
      ],
    },
    {
      eyebrow: 'Aurora Music · something’s wrong',
      heading: 'Nobody else looks up.',
      background: officeAlarm,
      audioSrc: cueB,
      copy: [
        'Somewhere behind you, the dashboard TV stutters and starts counting backward.',
        'Nobody else looks up. Nobody else ever looks up.',
      ],
    },
    {
      eyebrow: 'Aurora Music · something’s wrong',
      heading: 'That door does not do that.',
      background: officeAlarm,
      backgroundZoom: true,
      audioSrc: cueB,
      copy: ['The server closet door is doing something server closet doors do not do.'],
    },
    {
      eyebrow: 'Aurora Music · something’s wrong',
      heading: "So much for a quiet Tuesday.",
      background: pullIn,
      audioSrc: cueB,
      copy: ['Investigating a weird noise was never going to end well for anyone in a story like this.'],
    },
    {
      eyebrow: 'Aurora Music · something’s wrong',
      heading: 'Pulled in.',
      background: pullIn,
      showAvatar: true,
      avatarMotion: 'pulled',
      audioSrc: cueB,
      sfxSrc: glitchZap,
      copy: [],
    },
    {
      eyebrow: 'Inside the mainframe',
      heading: 'Nine doors.',
      background: corridorCalm,
      backgroundZoom: true,
      showAvatar: true,
      audioSrc: cueC,
      copy: ['No cubicle. No ceiling tiles. Just doors, as far as the corridor goes, each one humming.', 'Nine of them, if you count.'],
    },
    {
      eyebrow: 'Inside the mainframe',
      heading: 'It just went through Sector 1.',
      background: corridorBreached,
      rogueState: 'corrupted',
      rogueMotion: 'dash',
      audioSrc: cueC,
      copy: [
        "Something is already in here. Something that doesn't want to be caught, and definitely doesn't want to be verified.",
        'It just went through the nearest door: Sector 1. The Ledger Vaults.',
      ],
    },
    {
      eyebrow: 'Inside the mainframe',
      heading: 'First day. Might as well.',
      background: corridorBreached,
      showAvatar: true,
      avatarMotion: 'run',
      audioSrc: cueC,
      copy: ["First day. Might as well start with the one that's already open."],
    },
    {
      eyebrow: 'Inside the mainframe',
      heading: 'Through.',
      background: corridorBreached,
      whiteoutTransition: true,
      audioSrc: cueC,
      copy: ['The floor gives way to static.'],
    },
    {
      eyebrow: '',
      heading: '',
      layout: 'boot',
      audioSrc: cueC,
      continueLabel: 'Enter Sector 1',
      copy: ['AURORA MUSIC MAINFRAME', 'SECTOR 1 — THE LEDGER VAULTS', 'INITIALIZING QUERY TERMINAL...', 'CONNECTION ESTABLISHED.'],
    },
  ],
};

/**
 * Optional first-run terminal orientation (BACKLOG.md item 14). Its content
 * is deliberately passive: CutsceneView renders a CSS/HTML schematic, never
 * a live MissionView, so no query, grade, hint, answer, or progress mutation
 * can occur from this beat.
 */
export const terminalOrientationBeat: Beat = {
  id: 'terminal-orientation',
  skipLabel: 'Skip tutorial',
  panels: [
    {
      layout: 'tutorial',
      tutorialFocus: 'brief',
      eyebrow: 'QUERY TERMINAL ORIENTATION · 1 OF 6',
      heading: 'Start with the brief.',
      copy: [
        'Every terminal opens with a business brief: what ROGUE.exe scrambled, what Aurora needs back, and exactly what the result must contain. Read it before touching the editor.',
        'The mainframe is dramatic. The request is precise.',
      ],
    },
    {
      layout: 'tutorial',
      tutorialFocus: 'schema',
      eyebrow: 'QUERY TERMINAL ORIENTATION · 2 OF 6',
      heading: 'Check what survived.',
      copy: [
        'The schema explorer lists the tables and columns this mission exposes. When more than one table is in play, relationship lines show which keys connect them.',
        'It is the map of what exists, not a memory test. If a column is not listed, do not invent one.',
      ],
    },
    {
      layout: 'tutorial',
      tutorialFocus: 'editor',
      eyebrow: 'QUERY TERMINAL ORIENTATION · 3 OF 6',
      heading: 'This is your workbench.',
      copy: [
        'Write or edit your query in the SQL editor. The starter comments point at the task; keep them, replace them, or clear them when you are ready.',
        'This walkthrough maps the controls. It will not solve the query for you.',
      ],
    },
    {
      layout: 'tutorial',
      tutorialFocus: 'run',
      eyebrow: 'QUERY TERMINAL ORIENTATION · 4 OF 6',
      heading: 'Run the result, not the wording.',
      copy: [
        "Run query sends the editor's current text to the database in your browser. Use the button, or press Cmd/Ctrl+Enter.",
        'The mainframe grades the table your SQL returns—not whether your query looks like a memorized answer.',
      ],
    },
    {
      layout: 'tutorial',
      tutorialFocus: 'feedback',
      eyebrow: 'QUERY TERMINAL ORIENTATION · 5 OF 6',
      heading: 'Read what came back.',
      copy: [
        'If the rows or columns are still off, the terminal marks the result as corrupted and explains what did not line up. The returned table stays visible so you can inspect it and try again.',
        'When the result matches, the panel changes to Terminal restored, shows the lesson, and awards any new points or badge. A wrong run does not erase your progress.',
      ],
    },
    {
      layout: 'tutorial',
      tutorialFocus: 'help',
      eyebrow: 'QUERY TERMINAL ORIENTATION · 6 OF 6',
      heading: 'Stuck is a status, not a dead end.',
      copy: [
        'Show hint reveals one clue at a time. Concept glossary opens a reference without taking you out of the mission.',
        'After two executed wrong results, feedback may flag a likely cause. After three, See answer appears. It is hidden before then on purpose.',
        'Brief. Schema. Editor. Run. Inspect. Adjust. That is the whole terminal loop. You can replay this orientation from the main screen.',
      ],
      continueLabel: 'Continue',
    },
  ],
};

/**
 * Learn SQL Mode (BACKLOG.md item 13 Part B1, scoped in this session's
 * planning doc): the "meet the mentor" onboarding beat. Plays once, right
 * after the player's first-ever completion of openingBeat (chained through
 * terminalOrientationBeat if that also plays) — see App.tsx's
 * `offerMentorIntro`. Purely narrative and static; introduces Learn SQL
 * Mode without forcing it on, and does not itself flip the setting — the
 * player toggles it from Home afterward.
 *
 * Mentor name "ECHO" is a first-draft placeholder, trivial to rename later
 * (this is the only file that spells it out in dialogue) — no character art
 * exists yet either, see MentorSprite.tsx's placeholder glyph.
 */
export const mentorIntroBeat: Beat = {
  id: 'mentor-intro',
  panels: [
    {
      eyebrow: 'Unknown signal · not ROGUE.exe',
      heading: "Okay. You're not supposed to be in here.",
      mentorState: 'calm',
      copy: [
        "A second signal cuts through the static, calmer than the first. Not ROGUE.exe.",
        '"...Okay. You\'re not supposed to be in here, and neither, technically, am I. Call me ECHO — I keep what\'s left of this system standing upright."',
        '"You\'re new. First day, and somehow you also drew \'debug a rogue AI\' as your onboarding task. Rough."',
      ],
    },
    {
      eyebrow: 'Unknown signal · not ROGUE.exe',
      heading: "I can't fight it for you.",
      mentorState: 'explaining',
      copy: [
        '"I can\'t fight ROGUE.exe for you — has to be your query, or the mainframe won\'t accept it as a real fix. But I can walk you through the SQL you\'ll need before you hit a locked door, sector by sector, if you want it."',
        '"Your call, and not a permanent one — flip Learn SQL Mode on or off from the main terminal any time, whatever you pick right now."',
      ],
      choice: { yesLabel: 'Yes — walk me through it', noLabel: "I've got this" },
    },
  ],
};

/**
 * BACKLOG.md item 4: Sector 8 -> 9 beat, authored 2026-08-11 per direct
 * product-owner delegation ("I trust you to pick a beat"). Fulfils
 * GAME_DESIGN_BRIEF.md §A5 ("completing Sector 8 can trigger a short
 * in-world beat introducing the Sector 9 final-boss framing") and §A3's
 * reserved ROGUE.exe voice slot for "one line for the Sector 9 final-boss
 * opening." Reuses only existing, already-shipped assets (the Sector 8
 * background, RogueSprite's corrupted state) — no new art. Two short
 * panels only: the standard SectorTransitionView (Sector 9's own
 * background/flavor text, unchanged) plays immediately after this finishes
 * (see App.tsx's handleCutsceneFinish), so this beat is a narrative
 * prelude, not a replacement for it.
 */
export const sector9OpeningBeat: Beat = {
  id: 'sector-9-opening',
  panels: [
    {
      eyebrow: "ROGUE.exe's Inner Sanctum · purged",
      heading: "It's not hiding anymore.",
      background: sector8Background,
      copy: [
        'Sector 8 is clean. Every corrupted terminal ROGUE.exe was hiding behind is gone.',
        "One door left. For the first time all night, ROGUE.exe isn't running from it.",
      ],
    },
    {
      eyebrow: 'Direct transmission',
      heading: 'One system, cornered.',
      rogueState: 'corrupted',
      copy: [
        'ROGUE.exe: "You want the truth? The truth is whatever the board approves by Friday. I\'ve been fabricating quarterly pitches since before you finished your coffee."',
        '"Bring your little SELECT statements. Let\'s see whose numbers the board actually believes."',
      ],
    },
  ],
};

/**
 * Sector 8 entrance: ROGUE.exe's first direct appearance, fulfilling
 * §A3's reserved voice slot ("one for its first appearance (Sector 8)") and
 * the Step 3b cinematic brief (docs/GAME_DESIGN_BRIEF.md §B) — using the
 * composited placeholder panels codex/mentor-system-character delivered
 * (src/assets/cutscenes/README.md) rather than waiting on the real export.
 * Plays once, on first entry to Sector 8 (see sectorBeats below), before
 * m8-1 — which still escalates further with its own in-mission aside
 * (RogueSprite's `entrance4` state) once the player is actually working
 * the terminal.
 */
export const rogueEntranceBeat: Beat = {
  id: 'sector-8-entrance',
  panels: [
    {
      eyebrow: "ROGUE.exe's Inner Sanctum · first contact",
      heading: "It already knows you're here.",
      background: sector8Background,
      copy: [
        'Seven sectors purged, and the geometry itself starts arguing with you — floors that don\'t quite line up, screens flickering before you\'ve touched them.',
        "Something on the other side of the door already knows the door is open.",
      ],
    },
    {
      eyebrow: 'Direct transmission',
      heading: "ROGUE.exe, in the flesh. Sort of.",
      rogueState: 'entrance1',
      copy: ['ROGUE.exe: "So you\'re the one leadership sent to clean up after me. Cute."'],
    },
    {
      eyebrow: 'Direct transmission',
      heading: "It's actually paying attention now.",
      rogueState: 'entrance2',
      copy: ['ROGUE.exe: "Seven sectors. I\'ll admit, I didn\'t budget for someone who actually checks their joins."'],
    },
    {
      eyebrow: 'Direct transmission',
      heading: 'Closer. Or something like closer.',
      rogueState: 'entrance3',
      copy: ['ROGUE.exe: "Let\'s see if you\'re any good without the training wheels."'],
    },
    {
      eyebrow: 'Direct transmission',
      heading: "This is where it stops running.",
      rogueState: 'entrance4',
      copy: ['ROGUE.exe: "Sector 8. My house, my rules. Try to keep up."'],
    },
  ],
};

/**
 * Sector 9 finale: plays once the campaign's last mission is graded
 * correct (see MissionView's `onCampaignComplete` / App.tsx's
 * `handleCampaignComplete`) — not a between-sector beat like the others
 * above, since there's no "next sector" to transition into. Reuses the
 * `named` reveal card and the four `final` cinematic panels
 * (src/assets/cutscenes/README.md). Skippable: the campaign is already
 * complete and saved by the time this plays, so nothing is gated behind it.
 */
export const rogueFinaleBeat: Beat = {
  id: 'rogue-finale',
  skipLabel: 'Skip to results',
  panels: [
    {
      eyebrow: 'The Boardroom Core · closed',
      heading: 'So. ROGUE.exe.',
      background: sector9Background,
      rogueState: 'named',
      copy: [
        'Twenty-five terminals purged. Every fabricated conclusion, every locked-out analyst, traces back to one signature.',
        "It doesn't have anywhere left to hide the source.",
      ],
    },
    {
      eyebrow: 'Direct transmission',
      heading: "It's still talking.",
      rogueState: 'final1',
      copy: ['ROGUE.exe: "You think a few correct SELECT statements undo a whole quarter? The board already approved my numbers."'],
    },
    {
      eyebrow: 'Direct transmission',
      heading: 'The board approved fake numbers.',
      rogueState: 'final2',
      copy: ['"Real ones exist now. In writing. Query by query, sector by sector."', 'ROGUE.exe: "That\'s — that\'s not — "'],
    },
    {
      eyebrow: 'Direct transmission',
      heading: "For once, it doesn't finish the sentence.",
      rogueState: 'final3',
      copy: ["The glitching intensifies. Whatever confidence carried it through twenty-four terminals doesn't survive the twenty-fifth."],
    },
    {
      eyebrow: 'Signal lost',
      heading: 'Mainframe restored.',
      rogueState: 'final4',
      copy: [
        'ROGUE.exe fragments into scanlines and static, and this time it doesn\'t reassemble.',
        'Twenty-five terminals restored. The real numbers are back where leadership can see them — assuming anyone double-checks them this time.',
      ],
    },
  ],
};

/**
 * Between-sector beats (docs/BUILD_ORDER.md P2.1): sector number the player
 * is entering -> an optional beat shown before continuing to the next
 * sector-transition screen (see App.tsx's enterMissionWithTransitionCheck,
 * which looks this up keyed by the upcoming mission's own sector — corrected
 * 2026-08-11, this comment previously said "leaving," which didn't match the
 * implementation). A sector with no entry here transitions exactly as it
 * does today — beats are authored incrementally, not all at once.
 */
export const sectorBeats: Partial<Record<number, Beat>> = {
  8: rogueEntranceBeat,
  9: sector9OpeningBeat,
};
