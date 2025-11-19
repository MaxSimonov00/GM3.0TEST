
import React from 'react';
import { TurnSnapshot, Unit, HeroArchetype } from '../types';

interface Props {
  timeline: TurnSnapshot[];
  units: Unit[];
}

export const ActionTimeline: React.FC<Props> = ({ timeline, units }) => {
  
  const getIcon = (archetype: HeroArchetype) => {
     switch(archetype) {
         case HeroArchetype.ATTACKER: return '⚔️';
         case HeroArchetype.TANK: return '🛡️';
         case HeroArchetype.DEFENDER: return '🏰';
         case HeroArchetype.SPEEDSTER: return '⚡';
         default: return '?';
     }
  };

  return (
    // Added top-20 to sit below header, and h-[calc(100%-5rem)] to fit remaining space
    <div className="w-20 bg-slate-900/80 border-l border-slate-700 flex flex-col items-center py-4 absolute right-0 top-20 bottom-0 z-10 backdrop-blur-sm">
      <h3 className="text-xs font-bold tracking-widest text-slate-500 mb-4 uppercase rotate-90 whitespace-nowrap mt-8">ОЧЕРЕДЬ</h3>
      <div className="flex flex-col gap-3 w-full items-center overflow-y-auto no-scrollbar pb-4">
        {timeline.map((snap, idx) => {
          const unit = units.find(u => u.id === snap.unitId);
          if (!unit) return null;

          const isFirst = idx === 0;
          const sizeClass = isFirst ? 'w-12 h-12 text-lg ring-2 ring-yellow-400' : 'w-10 h-10 text-sm opacity-80';
          const bgClass = snap.isPlayer ? 'bg-blue-900 border-blue-500' : 'bg-red-900 border-red-500';

          return (
            <div key={`${snap.unitId}-${idx}`} className="relative group">
              <div className={`${sizeClass} ${bgClass} rounded-md border flex items-center justify-center shadow-lg transition-all duration-300`}>
                 <span>{getIcon(unit.archetype)}</span>
              </div>
              {isFirst && (
                <div className="absolute -left-3 top-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
              )}
              {/* Tooltip */}
              <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  {unit.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
