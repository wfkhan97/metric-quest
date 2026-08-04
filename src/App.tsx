import { useState } from 'react';
import { HomeView } from './components/HomeView';
import { MissionView } from './components/MissionView';
import { missions, type Mission } from './lib/missions';
import { loadProgress, saveProgress, type Progress } from './lib/progress';

type View = 'home' | 'mission';

export function App() {
  const [view, setView] = useState<View>('home');
  const [activeMissionId, setActiveMissionId] = useState<Mission['id']>(missions[0].id);
  const [progress, setProgress] = useState<Progress>(loadProgress);

  function goToMission(mission: Mission) {
    setActiveMissionId(mission.id);
    setView('mission');
  }

  function handleProgressChange(next: Progress) {
    setProgress(next);
    saveProgress(next);
  }

  if (view === 'home') {
    return <HomeView missions={missions} progress={progress} onSelectMission={goToMission} />;
  }

  const activeMission = missions.find((candidate) => candidate.id === activeMissionId) ?? missions[0];

  return (
    <MissionView
      key={activeMission.id}
      mission={activeMission}
      missions={missions}
      progress={progress}
      onProgressChange={handleProgressChange}
      onSelectMission={goToMission}
      onBackToHome={() => setView('home')}
    />
  );
}
