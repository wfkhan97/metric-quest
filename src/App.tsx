import { useState } from 'react';
import { AvatarCreatorView } from './components/AvatarCreatorView';
import { CutsceneView } from './components/CutsceneView';
import { HomeView } from './components/HomeView';
import { MissionView } from './components/MissionView';
import { SectorTransitionView } from './components/SectorTransitionView';
import { openingBeat, sectorBeats, type Beat } from './content/beats';
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

  function proceedToMission(mission: Mission, progressSnapshot: Progress) {
    if (!progressSnapshot.avatar) {
      setPendingMission(mission);
      setAvatarMode('onboarding');
      setView('avatar');
      return;
    }
    enterMissionWithTransitionCheck(mission, progressSnapshot);
  }

  function handleSelectMission(mission: Mission) {
    if (!hasSeenOpening(progress)) {
      setPendingMission(mission);
      setPendingBeat(openingBeat);
      setCutsceneSkippable(false);
      setView('cutscene');
      return;
    }
    proceedToMission(mission, progress);
  }

  function handleReplayOpening() {
    setPendingMission(null);
    setPendingBeat(openingBeat);
    setCutsceneSkippable(true);
    setView('cutscene');
  }

  function handleCutsceneFinish() {
    const beat = pendingBeat;
    setPendingBeat(null);
    if (beat?.id === 'opening') {
      const nextProgress = markOpeningSeen(progress);
      handleProgressChange(nextProgress);
      if (pendingMission) {
        const mission = pendingMission;
        setPendingMission(null);
        proceedToMission(mission, nextProgress);
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
      enterMissionWithTransitionCheck(pendingMission, nextProgress);
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
    return <CutsceneView beat={pendingBeat} skippable={cutsceneSkippable} onFinish={handleCutsceneFinish} />;
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
