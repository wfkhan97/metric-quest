import { useState } from 'react';
import { AvatarCreatorView } from './components/AvatarCreatorView';
import { HomeView } from './components/HomeView';
import { MissionView } from './components/MissionView';
import { missions, type Mission } from './lib/missions';
import { loadProgress, saveProgress, setAvatar, type AvatarConfig, type Progress } from './lib/progress';

type View = 'home' | 'avatar' | 'mission';

export function App() {
  const [view, setView] = useState<View>('home');
  const [activeMissionId, setActiveMissionId] = useState<Mission['id']>(missions[0].id);
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [pendingMission, setPendingMission] = useState<Mission | null>(null);
  const [avatarMode, setAvatarMode] = useState<'onboarding' | 'edit'>('onboarding');

  function goToMission(mission: Mission) {
    setActiveMissionId(mission.id);
    setView('mission');
  }

  function handleProgressChange(next: Progress) {
    setProgress(next);
    saveProgress(next);
  }

  function handleSelectMission(mission: Mission) {
    if (!progress.avatar) {
      setPendingMission(mission);
      setAvatarMode('onboarding');
      setView('avatar');
      return;
    }
    goToMission(mission);
  }

  function handleEditAvatar() {
    setPendingMission(null);
    setAvatarMode('edit');
    setView('avatar');
  }

  function handleAvatarConfirm(avatar: AvatarConfig) {
    handleProgressChange(setAvatar(progress, avatar));
    if (pendingMission) {
      const mission = pendingMission;
      setPendingMission(null);
      goToMission(mission);
    } else {
      setView('home');
    }
  }

  function handleAvatarCancel() {
    setPendingMission(null);
    setView('home');
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

  if (view === 'home') {
    return <HomeView missions={missions} progress={progress} onSelectMission={handleSelectMission} onEditAvatar={handleEditAvatar} />;
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
