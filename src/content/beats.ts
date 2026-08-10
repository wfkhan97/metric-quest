import { type RogueState } from '../components/RogueSprite';
import officeCalm from '../assets/backgrounds/office-calm.jpg';
import officeAlarm from '../assets/backgrounds/office-alarm.jpg';
import pullIn from '../assets/backgrounds/pull-in.jpg';
import corridorCalm from '../assets/backgrounds/corridor-calm.jpg';
import corridorBreached from '../assets/backgrounds/corridor-sector-1-breached.jpg';
import cueA from '../assets/audio/cue-a-cubicle-fluorescence.m4a';
import cueB from '../assets/audio/cue-b-signal-interrupt.mp3';
import cueC from '../assets/audio/cue-c-mainframe-overture.m4a';

export type PanelLayout = 'frame' | 'boot';
export type AvatarMotion = 'entrance' | 'shake' | 'run' | 'dissolve';
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
  /** A one-time full-screen teal wipe over this panel, standing in for a hard cut/transition rather than a scene. */
  whiteoutTransition?: boolean;
  /**
   * Looping background music for as long as this panel (and any adjacent
   * panel reusing the same src) is on screen — CutsceneView only restarts
   * playback when this value actually changes between panels, so a track
   * spanning several panels keeps playing instead of restarting each time.
   */
  audioSrc?: string;
  /** Attribution text, shown only while a CC-BY (not CC0) track is playing. */
  creditLine?: string;
  /** Overrides the default "Next" (or "Continue" on a beat's last panel). */
  continueLabel?: string;
};

export type Beat = {
  id: string;
  panels: BeatPanel[];
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
      showAvatar: true,
      audioSrc: cueA,
      creditLine: "Music: 'Local Forecast – Elevator' by Kevin MacLeod (incompetech.com), licensed under CC BY 3.0.",
      copy: ["Coffee's cold. Inbox has four unread, none of them urgent.", 'One more, from the top.'],
    },
    {
      eyebrow: 'Aurora Music · open-plan office',
      heading: 'One more email.',
      background: officeCalm,
      showAvatar: true,
      audioSrc: cueA,
      creditLine: "Music: 'Local Forecast – Elevator' by Kevin MacLeod (incompetech.com), licensed under CC BY 3.0.",
      copy: ['Subject: RE: RE: Exciting Update — Please Read!!!', 'From: Chad Renfro, CEO'],
    },
    {
      eyebrow: 'Aurora Music · open-plan office',
      heading: 'RE: RE: Exciting Update — Please Read!!!',
      background: officeCalm,
      showAvatar: true,
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
      showAvatar: true,
      avatarMotion: 'shake',
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
      showAvatar: true,
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
      showAvatar: true,
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
      avatarMotion: 'dissolve',
      audioSrc: cueB,
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
 * Between-sector beats (docs/BUILD_ORDER.md P2.1): sector number the player
 * is *leaving* -> an optional beat shown before continuing to the next
 * sector-transition screen. A sector with no entry here transitions exactly
 * as it does today — beats are authored incrementally, not all at once.
 */
export const sectorBeats: Partial<Record<number, Beat>> = {};
