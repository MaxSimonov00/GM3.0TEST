import React, { useState } from 'react';
import { Unit } from '../types';
import { HeroAvatar } from './HeroAvatar';

interface Props {
  roster: Unit[];
  currentTeam: Unit[];
  onTeamChange: (newTeam: Unit[]) => void;
  onBack: () => void;
}

export const TeamBuilder: React.FC<Props> = ({ roster, currentTeam, onTeamChange, onBack }) => {
  const [viewedUnit, setViewedUnit] = useState<Unit | null>(currentTeam[0] || roster[0] || null);

  const handleAddToTeam = (unit: Unit) => {
    if (currentTeam.length >= 3) return;
    if (currentTeam.find(u => u.id === unit.id)) return;
    onTeamChange([...currentTeam, unit]);
  };

  const handleRemoveFromTeam = (unitId: string) => {
    onTeamChange(currentTeam.filter(u => u.id !== unitId));
  };

  const isInTeam = viewedUnit ? currentTeam.some(u => u.id === viewedUnit.id) : false;

  return (
    <div className="w-full h-screen bg-slate-900 text-white p-8 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold tracking-widest text-blue-400 uppercase">Управление отрядом</h2>
        <button onClick={onBack} className="px-6 py-2 border border-slate-600 hover:bg-slate-800 rounded transition-colors text-sm uppercase tracking-wider">
          Назад
        </button>
      </div>

      <div className="flex flex-1 gap-8 overflow-hidden">
        {/* Left Column: Team Slots & Roster */}
        <div className="flex-[2] flex flex-col gap-8 overflow-hidden">
          
          {/* Active Squad Slots */}
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h3 className="text-slate-400 text-sm font-bold uppercase mb-4">Активный отряд ({currentTeam.length}/3)</h3>
            <div className="flex gap-4">
              {[0, 1, 2].map((slotIdx) => {
                const unit = currentTeam[slotIdx];
                return (
                  <div 
                    key={`slot-${slotIdx}`} 
                    className={`relative w-1/3 h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-all
                        ${unit ? 'border-blue-500 bg-blue-900/20' : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800'}`}
                    onClick={() => unit && setViewedUnit(unit)}
                  >
                    {unit ? (
                      <div className="flex flex-col items-center">
                        <div className="scale-50 -mb-4">
                            <HeroAvatar unit={unit} isActive={false} isTargetable={false} animationState="idle" onClick={() => {}} />
                        </div>
                        <span className="text-sm font-bold mt-2">{unit.name}</span>
                        <button 
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs hover:bg-red-400"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFromTeam(unit.id);
                            }}
                        >
                            X
                        </button>
                      </div>
                    ) : (
                       <span className="text-slate-600 font-bold uppercase text-xs">Пусто</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Roster List */}
          <div className="flex-1 bg-slate-800/30 rounded-xl border border-slate-700 p-6 overflow-hidden flex flex-col">
             <h3 className="text-slate-400 text-sm font-bold uppercase mb-4">Казарма (Доступные герои)</h3>
             <div className="grid grid-cols-4 gap-4 overflow-y-auto pr-2 pb-20">
                {roster.filter(r => !currentTeam.find(t => t.id === r.id)).map(unit => (
                    <div 
                        key={unit.id}
                        onClick={() => setViewedUnit(unit)}
                        className={`aspect-square bg-slate-900 border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors
                            ${viewedUnit?.id === unit.id ? 'border-yellow-500 ring-2 ring-yellow-500/20' : 'border-slate-700'}`}
                    >
                         <div className="font-bold text-2xl mb-1">
                             {unit.archetype === 'ATTACKER' ? '⚔️' : 
                              unit.archetype === 'TANK' ? '🛡️' :
                              unit.archetype === 'DEFENDER' ? '🏰' : '⚡'}
                         </div>
                         <div className="text-[10px] text-center px-1 truncate w-full text-slate-300">{unit.name}</div>
                    </div>
                ))}
             </div>
          </div>

        </div>

        {/* Right Column: Unit Preview */}
        <div className="flex-1 bg-slate-950 border-l border-slate-800 -my-8 -mr-8 p-8 flex flex-col relative">
           {viewedUnit ? (
               <>
                  <div className="flex-1 flex flex-col items-center justify-center relative">
                      <div className="scale-150 transform translate-y-4">
                        <HeroAvatar unit={viewedUnit} isActive={false} isTargetable={false} animationState="idle" onClick={() => {}} />
                      </div>
                      <div className="mt-12 text-center">
                          <h2 className="text-2xl font-bold text-white">{viewedUnit.name}</h2>
                          <div className="text-blue-400 font-mono text-sm mt-1">{viewedUnit.archetype} CLASS</div>
                      </div>
                  </div>

                  <div className="space-y-4 mb-8">
                      <StatBar label="Здоровье" val={viewedUnit.stats.maxHp} max={2000} color="bg-green-500" />
                      <StatBar label="Атака" val={viewedUnit.stats.attack} max={250} color="bg-red-500" />
                      <StatBar label="Защита" val={viewedUnit.stats.defense} max={150} color="bg-blue-500" />
                      <StatBar label="Скорость" val={viewedUnit.stats.speed} max={250} color="bg-yellow-500" />
                  </div>

                  <div className="h-16">
                    {isInTeam ? (
                        <button 
                            onClick={() => handleRemoveFromTeam(viewedUnit.id)}
                            className="w-full py-4 bg-red-900/50 border border-red-500 text-red-200 font-bold rounded hover:bg-red-900 transition-colors uppercase tracking-widest"
                        >
                            Убрать из отряда
                        </button>
                    ) : (
                        <button 
                            onClick={() => handleAddToTeam(viewedUnit)}
                            disabled={currentTeam.length >= 3}
                            className={`w-full py-4 font-bold rounded border uppercase tracking-widest transition-colors
                                ${currentTeam.length >= 3 
                                    ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed' 
                                    : 'bg-blue-600 text-white border-blue-400 hover:bg-blue-500'}`}
                        >
                            {currentTeam.length >= 3 ? 'Отряд полон' : 'Взять в отряд'}
                        </button>
                    )}
                  </div>
               </>
           ) : (
               <div className="flex items-center justify-center h-full text-slate-600">
                   Выберите героя для просмотра
               </div>
           )}
        </div>
      </div>
    </div>
  );
};

const StatBar: React.FC<{ label: string, val: number, max: number, color: string }> = ({ label, val, max, color }) => {
    const percent = Math.min(100, (val / max) * 100);
    return (
        <div>
            <div className="flex justify-between text-xs uppercase font-bold text-slate-500 mb-1">
                <span>{label}</span>
                <span>{val}</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${percent}%` }}></div>
            </div>
        </div>
    )
}