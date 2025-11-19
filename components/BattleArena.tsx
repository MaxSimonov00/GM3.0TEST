
import React, { useState, useEffect, useRef } from 'react';
import { Unit, BattleLog, TurnSnapshot } from '../types';
import { ACTION_GOAL } from '../constants';
import { generateUnit, simulateTurnOrder, calculateDamage } from '../utils/gameEngine';
import { audioManager } from '../utils/audioManager';
import { HeroAvatar } from './HeroAvatar';
import { ActionTimeline } from './ActionTimeline';

interface Props {
  playerTeam: Unit[];
  onExit: () => void;
}

export const BattleArena: React.FC<Props> = ({ playerTeam, onExit }) => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [initialEnemies, setInitialEnemies] = useState<Unit[]>([]); // For restart
  
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TurnSnapshot[]>([]);
  const [logs, setLogs] = useState<BattleLog[]>([]);
  const [gameOver, setGameOver] = useState<'PLAYER_WON' | 'ENEMY_WON' | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Animation States
  const [attackingUnitId, setAttackingUnitId] = useState<string | null>(null);
  const [hitUnitId, setHitUnitId] = useState<string | null>(null);

  const logEndRef = useRef<HTMLDivElement>(null);

  // 1. Initialize Game
  useEffect(() => {
    audioManager.playSfx('START');
    initializeBattle();
  }, []); 

  const initializeBattle = (existingEnemies?: Unit[]) => {
      // Reset action gauge for player units
      const readyPlayerTeam = playerTeam.map(u => ({
        ...u,
        isDead: false,
        stats: { ...u.stats, hp: u.stats.maxHp }, // Heal fully
        actionGauge: Math.floor(Math.random() * 3000)
      }));
  
      let enemies: Unit[] = [];
      if (existingEnemies) {
          // Reset existing enemies
          enemies = existingEnemies.map(u => ({
            ...u,
            isDead: false,
            stats: { ...u.stats, hp: u.stats.maxHp },
            actionGauge: Math.floor(Math.random() * 3000)
          }));
      } else {
          // Generate new
          enemies = [
            generateUnit('e1', false),
            generateUnit('e2', false),
            generateUnit('e3', false),
          ];
          setInitialEnemies(enemies);
      }
  
      const initialUnits = [...readyPlayerTeam, ...enemies];
  
      setUnits(initialUnits);
      setLogs([]);
      setGameOver(null);
      setActiveUnitId(null);
      addLog('Битва началась!', 'info');
      setTimeline(simulateTurnOrder(initialUnits));
  };

  // Handle Pause Music
  useEffect(() => {
      if (isPaused) {
          audioManager.pauseMusic();
      } else {
          // Only resume if game is not over
          if (!gameOver) audioManager.resumeMusic();
      }
  }, [isPaused, gameOver]);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (message: string, type: BattleLog['type']) => {
    setLogs(prev => [...prev, { id: Math.random().toString(36), message, type }]);
  };

  // 2. Game Loop
  useEffect(() => {
    if (isPaused || gameOver || units.length === 0 || attackingUnitId || hitUnitId) return;
    if (activeUnitId) return;

    const aliveUnits = units.filter(u => !u.isDead);
    const playerAlive = aliveUnits.some(u => u.isPlayer);
    const enemyAlive = aliveUnits.some(u => !u.isPlayer);
    
    if (!playerAlive) { setGameOver('ENEMY_WON'); return; }
    if (!enemyAlive) { setGameOver('PLAYER_WON'); return; }

    const readyUnits = aliveUnits
      .filter(u => u.actionGauge >= ACTION_GOAL - 0.01)
      .sort((a, b) => b.actionGauge - a.actionGauge);

    if (readyUnits.length > 0) {
      const nextActor = readyUnits[0];
      setActiveUnitId(nextActor.id);
      addLog(`Ход героя ${nextActor.name}!`, 'turn');
      return;
    }

    const tickTimer = setTimeout(() => {
      setUnits(prevUnits => {
        const currentAlive = prevUnits.filter(u => !u.isDead);
        if (currentAlive.length === 0) return prevUnits;

        let minTicks = Infinity;
        currentAlive.forEach(u => {
          const needed = Math.max(0, ACTION_GOAL - u.actionGauge);
          const ticks = needed / u.stats.speed;
          if (ticks < minTicks) minTicks = ticks;
        });

        if (minTicks < 0.001) minTicks = 0.001;

        return prevUnits.map(u => {
          if (u.isDead) return u;
          return { ...u, actionGauge: u.actionGauge + (minTicks * u.stats.speed) };
        });
      });
    }, 30);

    return () => clearTimeout(tickTimer);
  }, [units, activeUnitId, gameOver, attackingUnitId, hitUnitId, isPaused]);


  // 3. AI Logic
  useEffect(() => {
    if (isPaused) return;
    if (activeUnitId && !gameOver && !attackingUnitId) {
      const actor = units.find(u => u.id === activeUnitId);
      
      if (actor && !actor.isPlayer) {
        setIsAutoPlaying(true);
        const timer = setTimeout(() => {
          const alivePlayers = units.filter(u => u.isPlayer && !u.isDead);
          if (alivePlayers.length > 0) {
            const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
            executeAttackSequence(actor.id, target.id);
          } else {
             finishTurn(actor.id);
          }
        }, 800);
        return () => clearTimeout(timer);
      } else {
        setIsAutoPlaying(false);
      }
    }
  }, [activeUnitId, units, gameOver, attackingUnitId, isPaused]);


  // 4. Attack Sequence
  const executeAttackSequence = (attackerId: string, targetId: string) => {
    const attacker = units.find(u => u.id === attackerId);
    const target = units.find(u => u.id === targetId);
    if (!attacker || !target) return;

    setAttackingUnitId(attackerId);
    audioManager.playSfx('ATTACK');

    setTimeout(() => {
        applyDamage(attackerId, targetId);
        setHitUnitId(targetId);
        audioManager.playSfx('HIT');

        setTimeout(() => {
            setAttackingUnitId(null);
            setHitUnitId(null);
            finishTurn(attackerId);
        }, 500);

    }, 300);
  };

  const applyDamage = (attackerId: string, targetId: string) => {
    setUnits(prevUnits => {
        const attacker = prevUnits.find(u => u.id === attackerId);
        const target = prevUnits.find(u => u.id === targetId);
        if (!attacker || !target) return prevUnits;
  
        const damageDealt = calculateDamage(attacker, target);
        const newHp = Math.max(0, target.stats.hp - damageDealt);
        const isDead = newHp === 0;
  
        addLog(`${attacker.name} наносит ${damageDealt} урона по ${target.name}!`, 'damage');
        if (isDead) addLog(`${target.name} погибает!`, 'death');

        return prevUnits.map(u => {
          if (u.id === targetId) {
            return { ...u, stats: { ...u.stats, hp: newHp }, isDead };
          }
          return u;
        });
      });
  };

  const finishTurn = (unitId: string) => {
    setUnits(prev => {
        const nextUnits = prev.map(u => {
            if (u.id === unitId) {
                return { ...u, actionGauge: u.actionGauge - ACTION_GOAL };
            }
            return u;
        });
        setTimeline(simulateTurnOrder(nextUnits));
        return nextUnits;
    });
    setActiveUnitId(null);
  };

  const handleTargetClick = (targetId: string) => {
    if (isPaused || !activeUnitId || isAutoPlaying || gameOver || attackingUnitId) return;

    const actor = units.find(u => u.id === activeUnitId);
    const target = units.find(u => u.id === targetId);

    if (actor?.isPlayer && target && !target.isPlayer) {
      executeAttackSequence(actor.id, target.id);
    }
  };

  const handleRestart = () => {
      setIsPaused(false);
      audioManager.playSfx('START');
      initializeBattle(initialEnemies);
  };

  const activeUnit = units.find(u => u.id === activeUnitId);
  
  return (
    <div className="flex w-full h-screen overflow-hidden relative bg-[#0f172a]">
      
      <div className="flex-1 flex flex-col relative perspective-container">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-slate-900 to-transparent z-20 flex items-start justify-between px-8 py-4">
          <div>
              <h1 className="text-2xl font-bold text-blue-400 tracking-widest font-mono">TACTICS <span className="text-white">ARENA</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="bg-slate-900/80 px-6 py-2 rounded-full border border-slate-700 backdrop-blur">
                {activeUnit ? (
                    <div className={`text-lg font-bold ${activeUnit.isPlayer ? "text-blue-400" : "text-red-400"} animate-pulse`}>
                        ХОД: {activeUnit.name}
                    </div>
                ) : <span className="text-slate-500">ПОДГОТОВКА...</span>}
             </div>

             {/* Pause Button */}
             <button 
                onClick={() => {
                    setIsPaused(true);
                    audioManager.playSfx('CLICK');
                }}
                className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center hover:bg-slate-700 text-white transition-colors"
             >
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                 </svg>
             </button>
          </div>
        </div>

        {/* Arena */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#020617_100%)]"></div>
          
          <div className="absolute inset-0 opacity-20 arena-floor" 
               style={{ 
                   backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', 
                   backgroundSize: '50px 50px',
                   transformOrigin: 'bottom' 
               }}>
          </div>

          <div className="relative z-10 flex w-full max-w-6xl justify-between px-12 md:px-24 items-end h-[60%] pb-24">
              
              {/* Player Team */}
              <div className="flex flex-col-reverse gap-4 md:gap-8 lg:gap-12 items-center transform translate-x-10">
                  {units.filter(u => u.isPlayer).map((u, idx) => (
                      <div key={u.id} style={{ marginLeft: idx * 30 }}>
                          <HeroAvatar 
                            unit={u}
                            isActive={activeUnitId === u.id}
                            isTargetable={false}
                            animationState={
                                attackingUnitId === u.id ? 'attacking' : 
                                hitUnitId === u.id ? 'hit' : 'idle'
                            }
                            onClick={() => {}}
                          />
                      </div>
                  ))}
              </div>

              {/* Enemy Team */}
              <div className="flex flex-col-reverse gap-4 md:gap-8 lg:gap-12 items-center transform -translate-x-10">
                  {units.filter(u => !u.isPlayer).map((u, idx) => (
                      <div key={u.id} style={{ marginRight: idx * 30 }}>
                          <HeroAvatar 
                            unit={u}
                            isActive={activeUnitId === u.id}
                            isTargetable={activeUnit?.isPlayer === true && !u.isDead}
                            animationState={
                                attackingUnitId === u.id ? 'attacking' : 
                                hitUnitId === u.id ? 'hit' : 'idle'
                            }
                            onClick={() => handleTargetClick(u.id)}
                          />
                      </div>
                  ))}
              </div>
          </div>
        </div>

        {/* Bottom Interface */}
        <div className="h-48 bg-slate-950 border-t border-slate-800 flex relative z-20">
            <div className="flex-1 p-4 overflow-hidden flex flex-col">
                <div className="text-xs text-slate-500 mb-2 uppercase font-bold tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Журнал сражения
                </div>
                <div className="flex-1 overflow-y-auto space-y-1 pr-2 font-mono text-sm">
                    {logs.slice().reverse().map(log => (
                        <div key={log.id} className={`py-0.5 border-b border-slate-800/50 ${
                            log.type === 'damage' ? 'text-red-400' : 
                            log.type === 'death' ? 'text-purple-400 font-bold' : 
                            log.type === 'turn' ? 'text-yellow-500' : 
                            'text-slate-400'
                        }`}>
                            <span className="opacity-30 mr-2">[{new Date().toLocaleTimeString().slice(0,-3)}]</span>
                            {log.message}
                        </div>
                    ))}
                    <div ref={logEndRef} />
                </div>
            </div>
            
            <div className="w-1/3 border-l border-slate-800 p-6 flex flex-col justify-center items-center bg-slate-900/50">
                 {activeUnit?.isPlayer && !gameOver ? (
                     <div className="text-center">
                         <div className="text-blue-400 font-bold text-lg mb-2">ВАШ ХОД</div>
                         <div className="text-slate-400 text-sm">Нажмите на противника для атаки</div>
                     </div>
                 ) : (
                     <div className="text-center opacity-50">
                         <div className="text-slate-500 font-bold text-lg">ХОД ПРОТИВНИКА</div>
                         <div className="text-slate-600 text-xs animate-pulse">Ожидание действий...</div>
                     </div>
                 )}
            </div>
        </div>

        {/* Pause Menu Overlay */}
        {isPaused && (
            <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                 <div className="w-80 bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl relative">
                     <button 
                        onClick={() => {
                            setIsPaused(false);
                            audioManager.playSfx('CLICK');
                        }}
                        className="absolute top-4 right-4 text-slate-500 hover:text-white"
                     >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                     </button>

                     <h2 className="text-2xl text-center font-bold text-white mb-8 uppercase tracking-widest">Пауза</h2>
                     
                     <div className="flex flex-col gap-4">
                         <button 
                            onClick={() => {
                                setIsPaused(false);
                                audioManager.playSfx('CLICK');
                            }}
                            className="py-3 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold uppercase tracking-wider"
                         >
                             Продолжить
                         </button>
                         <button 
                            onClick={handleRestart}
                            className="py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded font-bold uppercase tracking-wider"
                         >
                             Рестарт боя
                         </button>
                         <button 
                            onClick={onExit}
                            className="py-3 bg-red-900/50 hover:bg-red-900 border border-red-800 text-red-200 rounded font-bold uppercase tracking-wider"
                         >
                             В меню
                         </button>
                     </div>
                 </div>
            </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center p-12 border-2 border-slate-700 rounded-2xl bg-slate-900 shadow-2xl transform scale-110">
              <h2 className={`text-7xl font-black mb-2 tracking-tighter ${gameOver === 'PLAYER_WON' ? 'text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-600' : 'text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-700'}`}>
                {gameOver === 'PLAYER_WON' ? 'ПОБЕДА' : 'ПОРАЖЕНИЕ'}
              </h2>
              <p className="text-slate-400 mb-8 text-xl font-light uppercase">
                  {gameOver === 'PLAYER_WON' ? 'Вражеский отряд уничтожен' : 'Ваши герои пали'}
              </p>
              <div className="flex gap-4 justify-center">
                 <button 
                    onClick={handleRestart}
                    className="px-8 py-4 border border-white text-white font-bold text-lg rounded hover:bg-white hover:text-black transition-all uppercase tracking-widest"
                  >
                    Рестарт
                  </button>
                  <button 
                    onClick={onExit}
                    className="px-8 py-4 bg-white text-black font-bold text-lg rounded hover:bg-slate-200 transition-all uppercase tracking-widest"
                  >
                    В меню
                  </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ActionTimeline timeline={timeline} units={units} />
    </div>
  );
};
