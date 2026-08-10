import { useState } from 'react';
import { AvatarCreatorView } from './components/AvatarCreatorView';
import { CutsceneView } from './components/CutsceneView';
import { HomeView } from './components/HomeView';
import { MissionView } from './components/MissionView';
import { SectorTransitionView } from './components/SectorTransitionView';
import { mainframePullBeat, openingBeat, sectorBeats, type Beat } from './content/beats';
import { chapterNumber, chapters } from './content/chapters';
import { missions, type Mission } from './lib/missions';
import {
  hasSeenOpening,
  hasSeenSector,
  loadProgress,
  markOpeningSeen,
  markSectorSeen,
  saveProgress,
  setAvatar,
  type AvatarConfig,
  type Progress,
} from './lib/progress';

type View = 'home' | 'avatar' | 'cutscene' | 'sector-transition' | 'mission';

export function App() {
  const [view, setView] = useState<View>('home');
  const [activeMissionId, setActiveMissionId] = useState<Mission['id']>(missions[0].id);
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [pendingMission, setPendingMission] = useState<Mission | null>(null);
  const [pendingBeat, setPendingBeat] = useState<Beat | null>(null);
  const [cutsceneSkippable, setCutsceneSkippable] = useState(false);
  const [avatarMode, setAvatarMode] = useState<'onboarding' | 'edit'>('onboarding');

  function goToMission(mission: Mission) {
    setActiveMissionId(mission.id);
    setView('mission');
  }

  function handleProgressChange(next: Progress) {
    setProgress(next);
    saveProgress(next);
  }

  // P6.2: switching/creating/deleting a save slot already persists the new
  // active slot in src/lib/progress.ts — this just syncs the state that
  // lives here, without re-persisting (which would only bump timestamps).
  function handleActiveProgressChange(next: Progress) {
    setProgress(next);
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
  function proceedPastAvatar(mission: Mission, progressSnapshot: Progress) {
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
    enterMissionWithTransitionCheck(mission, progressSnapshot);
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

  function handleCutsceneFinish() {
    const beat = pendingBeat;
    setPendingBeat(null);
    if (beat?.id === 'mainframe-pull') {
      setPendingBeat(openingBeat);
      setView('cutscene');
      return;
    }
    if (beat?.id === 'opening') {
      const nextProgress = markOpeningSeen(progress);
      handleProgressChange(nextProgress);
      if (pendingMission) {
        const mission = pendingMission;
        setPendingMission(null);
        // Avatar is already set by this point (proceedPastAvatar only
        // reaches the opening beat once it is), so continue straight into
        // the normal sector-transition/mission-entry check.
        enterMissionWithTransitionCheck(mission, nextProgress);
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
    if (pendingMission) {
      proceedPastAvatar(pendingMission, nextProgress);
    } else {
      setView('home');
    }
  }

  function handleAvatarCancel() {
    setPendingMission(null);
    setView('home');
  }

  function handleSectorTransitionContinue() {
    if (!pendingMission) {
      setView('home');
      return;
    }
    const mission = pendingMission;
    handleProgressChange(markSectorSeen(progress, chapterNumber(mission)));
    setPendingMission(null);
    goToMission(mission);
  }

  if (view === 'avatar') {
    return (
      <AvatarCreatorView
        initialAvatar={progress.avatar}
        mode={avatarMode}
        onConfirm={handleAvatarConfirm}
        onCancel={avatarMode === 'edit' ? handleAvatarCancel : undefined}
      />
    );
  }

  if (view === 'cutscene' && pendingBeat) {
    return (
      <CutsceneView
        key={pendingBeat.id}
        beat={pendingBeat}
        avatar={progress.avatar}
        skippable={cutsceneSkippable}
        onFinish={handleCutsceneFinish}
      />
    );
  }

  if (view === 'sector-transition' && pendingMission) {
    const sectorTitle = chapters.find((chapter) => chapter.number === chapterNumber(pendingMission))?.title ?? pendingMission.chapter;
    return (
      <SectorTransitionView
        chapterNumber={chapterNumber(pendingMission)}
        sectorTitle={sectorTitle}
        avatar={progress.avatar}
        onContinue={handleSectorTransitionContinue}
      />
    );
  }

  if (view === 'home') {
    return (
      <HomeView
        missions={missions}
        progress={progress}
        onSelectMission={handleSelectMission}
        onEditAvatar={handleEditAvatar}
        onReplayOpening={hasSeenOpening(progress) ? handleReplayOpening : undefined}
        onActiveProgressChange={handleActiveProgressChange}
      />
    );
  }

  const activeMission = missions.find((candidate) => candidate.id === activeMissionId) ?? missions[0];

  return (
    <MissionView
      key={activeMission.id}
      mission={activeMission}
      missions={missions}
      progress={progress}
      onProgressChange={handleProgressChange}
      onSelectMission={handleSelectMission}
      onBackToHome={() => setView('home')}
    />
  );
}
