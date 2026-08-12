import { useState } from 'react';
import { AvatarCreatorView } from './components/AvatarCreatorView';
import { CreditsButton } from './components/CreditsButton';
import { CutsceneView } from './components/CutsceneView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomeView } from './components/HomeView';
import { MissionView } from './components/MissionView';
import { SectorTransitionView } from './components/SectorTransitionView';
import { TitleScreen } from './components/TitleScreen';
import { mainframePullBeat, mentorIntroBeat, openingBeat, sectorBeats, terminalOrientationBeat, type Beat } from './content/beats';
import { chapterNumber, chapters } from './content/chapters';
import { sectorPrimerBeats } from './content/primers';
import { missions, type Mission } from './lib/missions';
import {
  hasSeenOpening,
  hasSeenTutorial,
  hasSeenSector,
  hasSeenMentorIntro,
  hasSeenPrimer,
  hasProgressPersistenceFailure,
  isLearnSqlModeOn,
  loadProgress,
  markMentorIntroSeen,
  markOpeningSeen,
  markPrimerSeen,
  markSectorSeen,
  markTutorialSeen,
  resetActiveSave,
  saveProgress,
  setAvatar,
  toggleLearnSqlMode,
  type AvatarConfig,
  type Progress,
} from './lib/progress';

type View = 'title' | 'home' | 'avatar' | 'cutscene' | 'sector-transition' | 'mission';

const musicMuteStorageKey = 'metric-quest-music-muted-v1';

function loadMusicMuted(): boolean {
  try {
    return localStorage.getItem(musicMuteStorageKey) === 'true';
  } catch {
    return false;
  }
}

export function App() {
  const [view, setView] = useState<View>('title');
  const [activeMissionId, setActiveMissionId] = useState<Mission['id']>(missions[0].id);
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [hasProgressStorageWarning, setHasProgressStorageWarning] = useState(hasProgressPersistenceFailure);
  const [pendingMission, setPendingMission] = useState<Mission | null>(null);
  const [pendingBeat, setPendingBeat] = useState<Beat | null>(null);
  const [cutsceneSkippable, setCutsceneSkippable] = useState(false);
  // True only while terminalOrientationBeat is playing as part of the true
  // first-run onboarding chain (not a manual "Review controls" replay) — the
  // one signal handleCutsceneFinish needs to know whether it's safe to chain
  // into mentorIntroBeat next. See offerMentorIntro below.
  const [isOnboardingChain, setIsOnboardingChain] = useState(false);
  const [avatarMode, setAvatarMode] = useState<'onboarding' | 'edit'>('onboarding');
  const [isMusicMuted, setIsMusicMuted] = useState(loadMusicMuted);

  function toggleMusicMute() {
    setIsMusicMuted((current) => {
      const next = !current;
      try {
        localStorage.setItem(musicMuteStorageKey, String(next));
      } catch {
        // Keep the setting for this session even if storage is unavailable.
      }
      return next;
    });
  }

  function goToMission(mission: Mission) {
    setActiveMissionId(mission.id);
    setView('mission');
  }

  function handleProgressChange(next: Progress) {
    saveProgress(next);
    setProgress(next);
    setHasProgressStorageWarning(hasProgressPersistenceFailure());
  }

  // P6.2: switching/creating/deleting a save slot already persists the new
  // active slot in src/lib/progress.ts — this just syncs the state that
  // lives here, without re-persisting (which would only bump timestamps).
  function handleActiveProgressChange(next: Progress) {
    setProgress(next);
    setHasProgressStorageWarning(hasProgressPersistenceFailure());
  }

  function enterMissionWithTransitionCheck(mission: Mission, progressSnapshot: Progress) {
    const sector = chapterNumber(mission);
    if (!hasSeenSector(progressSnapshot, sector)) {
      const beat = sectorBeats[sector];
      if (beat) {
        setPendingMission(mission);
        setPendingBeat(beat);
        setCutsceneSkippable(false);
        setView('cutscene');
        return;
      }
      setPendingMission(mission);
      setView('sector-transition');
      return;
    }
    setPendingMission(null);
    goToMission(mission);
  }

  // P5.1: avatar creation now gates *before* the opening cutscene (was the
  // other way around) so a new player's first-run order is avatar creator
  // -> opening beat -> mission, not opening beat -> avatar creator. Called
  // once the avatar is already known to be set, either because the player
  // already had one or because handleAvatarConfirm just set it.
  // `mission` is null for the title screen's "New game" path, which enters
  // avatar creation with no specific mission queued up — the opening cutscene
  // still needs to play, it just lands on Home afterward instead of chaining
  // into a mission (see handleCutsceneFinish's own null check on the
  // opening beat).
  function proceedPastAvatar(mission: Mission | null, progressSnapshot: Progress) {
    if (!hasSeenOpening(progressSnapshot)) {
      setPendingMission(mission);
      // P5.5: the "pulled into the mainframe" beat plays first; its last
      // panel chains straight into openingBeat in handleCutsceneFinish
      // below, so the two read as one continuous intro, not two separately
      // gated cutscenes.
      setPendingBeat(mainframePullBeat);
      setCutsceneSkippable(false);
      setView('cutscene');
      return;
    }
    if (mission) {
      enterMissionWithTransitionCheck(mission, progressSnapshot);
    } else {
      setView('home');
    }
  }

  function handleSelectMission(mission: Mission) {
    if (!progress.avatar) {
      setPendingMission(mission);
      setAvatarMode('onboarding');
      setView('avatar');
      return;
    }
    proceedPastAvatar(mission, progress);
  }

  function handleReplayOpening() {
    setPendingMission(null);
    setPendingBeat(mainframePullBeat);
    setCutsceneSkippable(true);
    setView('cutscene');
  }

  function handleReplayTutorial() {
    setPendingMission(null);
    setPendingBeat(terminalOrientationBeat);
    setCutsceneSkippable(true);
    setView('cutscene');
  }

  // Shared tail end of onboarding, reached once neither the terminal
  // orientation nor the mentor intro has anything left to offer.
  function continueAfterOnboarding(progressSnapshot: Progress) {
    if (pendingMission) {
      const mission = pendingMission;
      setPendingMission(null);
      // Avatar is already set by this point (proceedPastAvatar only
      // reaches the opening beat once it is), so continue straight into
      // the normal sector-transition/mission-entry check.
      enterMissionWithTransitionCheck(mission, progressSnapshot);
    } else {
      setView('home');
    }
  }

  // Learn SQL Mode: offers the one-time "meet the mentor" beat. Returns
  // true (and shows the beat) if it hadn't been seen yet, false if the
  // caller should just continue on. Marked seen at trigger time, same
  // refresh-safety reasoning as markTutorialSeen above.
  function offerMentorIntro(progressSnapshot: Progress): boolean {
    if (hasSeenMentorIntro(progressSnapshot)) return false;
    handleProgressChange(markMentorIntroSeen(progressSnapshot));
    setPendingBeat(mentorIntroBeat);
    setCutsceneSkippable(true);
    setView('cutscene');
    return true;
  }

  function handleCutsceneFinish() {
    const beat = pendingBeat;
    setPendingBeat(null);
    if (beat?.id === 'mainframe-pull') {
      setPendingBeat(openingBeat);
      setView('cutscene');
      return;
    }
    if (beat?.id === 'opening') {
      // A replay begins with an already-seen opening. Only the mandatory
      // first completion can offer the orientation or the mentor intro;
      // replaying the story must continue to Home exactly as it did before
      // either of those existed.
      const isFirstOpeningCompletion = !hasSeenOpening(progress);
      let nextProgress = markOpeningSeen(progress);
      if (isFirstOpeningCompletion && !hasSeenTutorial(nextProgress)) {
        // Persist on opening, rather than on panel 6, so a refresh midway
        // through cannot automatically reopen the walkthrough in a loop.
        nextProgress = markTutorialSeen(nextProgress);
        handleProgressChange(nextProgress);
        setIsOnboardingChain(true);
        setPendingBeat(terminalOrientationBeat);
        setCutsceneSkippable(true);
        setView('cutscene');
        return;
      }
      handleProgressChange(nextProgress);
      if (isFirstOpeningCompletion && offerMentorIntro(nextProgress)) return;
      continueAfterOnboarding(nextProgress);
      return;
    }
    if (beat?.id === 'terminal-orientation') {
      // isOnboardingChain is only ever true when this orientation was the
      // one auto-chained from a true first-run 'opening' completion above —
      // a manual "Review controls" replay (handleReplayTutorial) never sets
      // it, so replaying the orientation alone can't also re-trigger the
      // mentor intro.
      const wasOnboardingChain = isOnboardingChain;
      setIsOnboardingChain(false);
      if (wasOnboardingChain && offerMentorIntro(progress)) return;
      continueAfterOnboarding(progress);
      return;
    }
    if (beat?.id === 'mentor-intro') {
      continueAfterOnboarding(progress);
      return;
    }
    if (beat && beat.id.startsWith('sector-primer-')) {
      // Reached either from handleSectorTransitionContinue (pendingMission
      // set — continue into the mission it was queued for) or from Home's
      // "Review SQL primers" replay (pendingMission null — return Home).
      if (pendingMission) {
        const mission = pendingMission;
        setPendingMission(null);
        goToMission(mission);
      } else {
        setView('home');
      }
      return;
    }
    // A between-sector beat finished; continue into the normal sector-transition screen.
    if (pendingMission) {
      setView('sector-transition');
    } else {
      setView('home');
    }
  }

  function handleEditAvatar() {
    setPendingMission(null);
    setAvatarMode('edit');
    setView('avatar');
  }

  function handleAvatarConfirm(avatar: AvatarConfig) {
    const nextProgress = setAvatar(progress, avatar);
    handleProgressChange(nextProgress);
    proceedPastAvatar(pendingMission, nextProgress);
  }

  function handleAvatarCancel() {
    setPendingMission(null);
    setView('home');
  }

  function handleResumeGame() {
    setView('home');
  }

  function handleNewGame() {
    const nextProgress = resetActiveSave();
    setProgress(nextProgress);
    setHasProgressStorageWarning(hasProgressPersistenceFailure());
    setPendingMission(null);
    setPendingBeat(null);
    // Fresh progress has no avatar and hasn't seen the opening yet, so this
    // goes straight into onboarding (avatar creator -> intro cutscene) rather
    // than Home — Home's Incident Brief doesn't make sense to show before
    // the cutscene has told the player what's happened.
    setAvatarMode('onboarding');
    setView('avatar');
  }

  function handleSectorTransitionContinue() {
    if (!pendingMission) {
      setView('home');
      return;
    }
    const mission = pendingMission;
    const sector = chapterNumber(mission);
    const nextProgress = markSectorSeen(progress, sector);
    const primerBeat = sectorPrimerBeats[sector];
    if (isLearnSqlModeOn(nextProgress) && primerBeat && !hasSeenPrimer(nextProgress, sector)) {
      // Marked seen at trigger time, same refresh-safety reasoning as
      // markTutorialSeen — pendingMission stays set so handleCutsceneFinish's
      // 'sector-primer-*' branch knows to continue into this mission after.
      handleProgressChange(markPrimerSeen(nextProgress, sector));
      setPendingBeat(primerBeat);
      setCutsceneSkippable(true);
      setView('cutscene');
      return;
    }
    handleProgressChange(nextProgress);
    setPendingMission(null);
    goToMission(mission);
  }

  function handleToggleLearnSqlMode() {
    handleProgressChange(toggleLearnSqlMode(progress));
  }

  // Home's "Review SQL primers" — replays an already-seen sector primer
  // on demand, same shape as handleReplayOpening/handleReplayTutorial.
  function handleReviewPrimer(sector: number) {
    const beat = sectorPrimerBeats[sector];
    if (!beat) return;
    setPendingMission(null);
    setPendingBeat(beat);
    setCutsceneSkippable(true);
    setView('cutscene');
  }

  let content;

  if (view === 'title') {
    content = (
      <TitleScreen
        progress={progress}
        isMusicMuted={isMusicMuted}
        onToggleMusicMute={toggleMusicMute}
        onResume={handleResumeGame}
        onNewGame={handleNewGame}
      />
    );
  } else if (view === 'avatar') {
    content = (
      <AvatarCreatorView
        initialAvatar={progress.avatar}
        mode={avatarMode}
        onConfirm={handleAvatarConfirm}
        onCancel={avatarMode === 'edit' ? handleAvatarCancel : undefined}
      />
    );
  } else if (view === 'cutscene' && pendingBeat) {
    content = (
      <CutsceneView
        key={pendingBeat.id}
        beat={pendingBeat}
        avatar={progress.avatar}
        skippable={cutsceneSkippable}
        isMusicMuted={isMusicMuted}
        onToggleMusicMute={toggleMusicMute}
        onFinish={handleCutsceneFinish}
      />
    );
  } else if (view === 'sector-transition' && pendingMission) {
    const sectorTitle = chapters.find((chapter) => chapter.number === chapterNumber(pendingMission))?.title ?? pendingMission.chapter;
    content = (
      <SectorTransitionView
        chapterNumber={chapterNumber(pendingMission)}
        sectorTitle={sectorTitle}
        avatar={progress.avatar}
        onContinue={handleSectorTransitionContinue}
      />
    );
  } else if (view === 'home') {
    content = (
      <HomeView
        missions={missions}
        progress={progress}
        onSelectMission={handleSelectMission}
        onEditAvatar={handleEditAvatar}
        onReplayOpening={hasSeenOpening(progress) ? handleReplayOpening : undefined}
        onReplayTutorial={handleReplayTutorial}
        onActiveProgressChange={handleActiveProgressChange}
        learnSqlMode={isLearnSqlModeOn(progress)}
        onToggleLearnSqlMode={handleToggleLearnSqlMode}
        seenPrimerSectors={progress.seenPrimers ?? []}
        onReviewPrimer={handleReviewPrimer}
      />
    );
  } else {
    const activeMission = missions.find((candidate) => candidate.id === activeMissionId) ?? missions[0];
    content = (
      <MissionView
        key={activeMission.id}
        mission={activeMission}
        missions={missions}
        progress={progress}
        isMusicMuted={isMusicMuted}
        onToggleMusicMute={toggleMusicMute}
        onProgressChange={handleProgressChange}
        onSelectMission={handleSelectMission}
        onBackToHome={() => setView('home')}
      />
    );
  }

  return (
    <ErrorBoundary>
      {content}
      {hasProgressStorageWarning && (
        <p className="progress-storage-warning" role="status">
          Progress is available for this session only — this browser is not saving it.
        </p>
      )}
      <CreditsButton />
    </ErrorBoundary>
  );
}
