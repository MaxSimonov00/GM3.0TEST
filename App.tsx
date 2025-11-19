
import React, { useState, useEffect } from 'react';
import { Unit, GameView } from './types';
import { generateUnit, generateRoster } from './utils/gameEngine';
import { BattleArena } from './components/BattleArena';
import { TeamBuilder } from './components/TeamBuilder';
import { MainMenu } from './components/MainMenu';
import { SettingsScreen } from './components/SettingsScreen';
import { audioManager } from './utils/audioManager';

const App: React.FC = () => {
  const [view, setView] = useState<GameView>('MENU');
  
  // Persistent State
  const [roster, setRoster] = useState<Unit[]>([]);
  const [playerTeam, setPlayerTeam] = useState<Unit[]>([]);

  // Audio State
  const [musicVol, setMusicVol] = useState(0.5);
  const [sfxVol, setSfxVol] = useState(0.5);

  // Initialization
  useEffect(() => {
    // Create a roster of 20 recruits
    const initialRoster = generateRoster(20);
    setRoster(initialRoster);
    
    // Default Team: First 3
    setPlayerTeam(initialRoster.slice(0, 3));

    // Инициализация аудио при первом клике
    const handleInteraction = () => {
        audioManager.initialize();
        audioManager.playMusic('MENU'); // Повторная попытка запуска музыки
        audioManager.playSfx('CLICK');
        window.removeEventListener('click', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);

  }, []);

  // Handle View Changes -> Change Music
  useEffect(() => {
    if (view === 'BATTLE') {
        audioManager.playMusic('BATTLE');
    } else {
        audioManager.playMusic('MENU');
    }
  }, [view]);

  const handleVolumeChange = (type: 'MUSIC' | 'SFX', val: number) => {
      if (type === 'MUSIC') {
          setMusicVol(val);
          audioManager.setMusicVolume(val);
      } else {
          setSfxVol(val);
          audioManager.setSfxVolume(val);
      }
  };

  const handleStartBattle = () => {
    if (playerTeam.length === 0) {
        alert("Соберите команду!");
        return;
    }
    audioManager.playSfx('CLICK');
    setView('BATTLE');
  };

  const renderView = () => {
    switch (view) {
        case 'MENU':
            return (
                <MainMenu 
                    onStart={handleStartBattle}
                    onEditTeam={() => {
                        audioManager.playSfx('CLICK');
                        setView('TEAM_SELECT');
                    }}
                    onSettings={() => {
                        audioManager.playSfx('CLICK');
                        setView('SETTINGS');
                    }}
                    teamCount={playerTeam.length}
                />
            );
        case 'TEAM_SELECT':
            return (
                <TeamBuilder 
                    roster={roster}
                    currentTeam={playerTeam}
                    onTeamChange={(team) => {
                        setPlayerTeam(team);
                        audioManager.playSfx('CLICK');
                    }}
                    onBack={() => {
                        audioManager.playSfx('CLICK');
                        setView('MENU');
                    }}
                />
            );
        case 'BATTLE':
            return (
                <BattleArena 
                    playerTeam={playerTeam}
                    onExit={() => {
                        audioManager.playSfx('CLICK');
                        setView('MENU');
                    }}
                />
            );
        case 'SETTINGS':
            return (
                <SettingsScreen 
                    musicVolume={musicVol}
                    sfxVolume={sfxVol}
                    onMusicChange={(v) => handleVolumeChange('MUSIC', v)}
                    onSfxChange={(v) => handleVolumeChange('SFX', v)}
                    onBack={() => {
                        audioManager.playSfx('CLICK');
                        setView('MENU');
                    }}
                />
            );
        default:
            return <div>Error</div>;
    }
  };

  return (
    <div className="font-sans text-slate-200 bg-[#0f172a]">
        {renderView()}
    </div>
  );
};

export default App;
