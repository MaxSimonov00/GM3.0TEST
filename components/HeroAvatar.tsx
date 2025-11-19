import React from 'react';
import { HeroArchetype, Unit } from '../types';

interface Props {
  unit: Unit;
  isActive: boolean;
  isTargetable: boolean;
  animationState: 'idle' | 'attacking' | 'hit';
  onClick: () => void;
}

export const HeroAvatar: React.FC<Props> = ({ unit, isActive, isTargetable, animationState, onClick }) => {
  const { archetype, isPlayer, isDead } = unit;

  // Цвета
  const primaryColor = isPlayer ? "#60a5fa" : "#f87171"; // blue-400 : red-400
  const secondaryColor = isPlayer ? "#1e40af" : "#991b1b"; // blue-800 : red-800
  const glowColor = isActive ? "drop-shadow(0px 0px 8px rgba(255, 255, 0, 0.6))" : "";

  // Классы анимации контейнера
  let animClass = "animate-breathe"; // По умолчанию дышим
  if (animationState === 'attacking') {
    animClass = isPlayer ? "animate-lunge-right" : "animate-lunge-left";
  } else if (animationState === 'hit') {
    animClass = "animate-shake";
  }

  if (isDead) {
    return (
      <div className="w-32 h-32 flex items-end justify-center opacity-40 grayscale transition-all duration-500">
        {/* Надгробие */}
        <svg viewBox="0 0 100 100" className="w-20 h-20">
            <path d="M20 100 L20 40 Q20 10 50 10 Q80 10 80 40 L80 100 Z" fill="#334155" />
            <path d="M40 40 L60 40 M50 30 L50 60" stroke="#94a3b8" strokeWidth="4" />
        </svg>
      </div>
    );
  }

  // Рендер тела персонажа в зависимости от класса
  const renderCharacter = () => {
    // Общие части тела
    const head = <circle cx="50" cy="30" r="12" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />;
    const body = <path d="M50 42 L50 75" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />;
    const legs = <path d="M50 75 L35 95 M50 75 L65 95" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />;
    
    // Оружие и броня
    switch (archetype) {
      case HeroArchetype.ATTACKER:
        return (
          <g>
             {/* Плащ */}
             <path d="M45 45 Q20 60 25 90" fill="none" stroke={secondaryColor} strokeWidth="4" />
             {legs}
             {body}
             {head}
             {/* Большой меч */}
             <path d="M65 55 L90 20 L95 25 L70 60 Z" fill="#94a3b8" stroke="#0f172a" strokeWidth="1" />
             <line x1="60" y1="65" x2="75" y2="50" stroke="#475569" strokeWidth="4" />
             {/* Руки */}
             <path d="M50 50 L68 58" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" />
          </g>
        );
      case HeroArchetype.TANK:
        return (
            <g>
            {legs}
            {/* Тело шире */}
            <rect x="40" y="45" width="20" height="35" rx="5" fill="#475569" />
            {head}
            {/* Шлем */}
            <path d="M38 28 H62 V18 Q50 10 38 18 Z" fill={secondaryColor} />
            {/* Огромный щит */}
            <rect x="55" y="40" width="30" height="50" rx="4" fill={primaryColor} stroke="#0f172a" strokeWidth="2" />
            <path d="M70 40 V90 M55 65 H85" stroke="#0f172a" strokeWidth="2" opacity="0.3"/>
            {/* Рука держит щит */}
            <path d="M50 50 L65 60" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" />
          </g>
        );
      case HeroArchetype.DEFENDER:
         return (
           <g>
             {/* Аура/Мантия сзади */}
             <path d="M30 40 Q50 20 70 40 L65 90 H35 Z" fill={secondaryColor} opacity="0.8" />
             {legs}
             {body}
             {/* Наплечники */}
             <path d="M35 45 L65 45" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" />
             {head}
             {/* Молот/Булава */}
             <line x1="25" y1="40" x2="25" y2="80" stroke="#475569" strokeWidth="3" />
             <rect x="15" y="30" width="20" height="15" fill="#94a3b8" stroke="#0f172a" strokeWidth="1" />
             {/* Руки */}
             <path d="M50 50 L25 55" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" />
             <path d="M50 50 L65 60" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" />
           </g>
         );
      case HeroArchetype.SPEEDSTER:
        return (
           <g transform="skewX(-10)">
             {/* Шарф */}
             <path d="M50 45 Q70 45 80 35" fill="none" stroke={primaryColor} strokeWidth="4" />
             {legs}
             {body}
             {head}
             {/* Кинжалы */}
             <path d="M20 60 L30 50 L35 70 Z" fill="#e2e8f0" />
             <path d="M80 60 L70 50 L65 70 Z" fill="#e2e8f0" />
             {/* Руки */}
             <path d="M50 50 L30 50" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
             <path d="M50 50 L70 50" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
           </g>
        );
    }
  };

  // Расчет здоровья
  const hpPercent = Math.max(0, (unit.stats.hp / unit.stats.maxHp) * 100);
  
  return (
    <div 
      className={`relative group w-32 h-48 flex flex-col items-center justify-end transition-all duration-300 ${isTargetable ? 'cursor-pointer' : ''}`}
      onClick={() => isTargetable && onClick()}
    >
      {/* Индикатор цели (при наведении) */}
      {isTargetable && (
        <div className="absolute inset-0 bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border-2 border-red-500/30 border-dashed" />
      )}

      {/* Активный маркер (стрелка) */}
      {isActive && (
        <div className="absolute -top-8 animate-bounce text-yellow-400 z-20">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
             <path d="M12 22L2 12h7V2h6v10h7L12 22z" />
           </svg>
        </div>
      )}

      {/* Полоска здоровья */}
      <div className="absolute -top-2 w-24 h-3 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden z-10">
        <div 
          className={`h-full transition-all duration-500 ease-out ${hpPercent < 30 ? 'bg-red-500' : 'bg-green-500'}`}
          style={{ width: `${hpPercent}%` }}
        />
      </div>

      {/* SVG Персонаж */}
      <div className={`w-32 h-32 ${animClass}`} style={{ filter: glowColor }}>
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          {/* Тень */}
          <ellipse cx="50" cy="95" rx="30" ry="5" fill="#000" opacity="0.3" />
          
          {/* Персонаж зеркалится для противника */}
          <g transform={!isPlayer ? "scale(-1, 1) translate(-100, 0)" : ""}>
             {renderCharacter()}
          </g>
        </svg>
      </div>
      
      {/* Имя и статы */}
      <div className="mt-1 text-center bg-slate-900/60 backdrop-blur-sm px-2 rounded border border-slate-700/50">
        <div className={`text-xs font-bold uppercase tracking-wider ${isPlayer ? 'text-blue-200' : 'text-red-200'}`}>
            {unit.name}
        </div>
        <div className="text-[10px] text-yellow-500 font-mono">
           SPEED:{unit.stats.speed}
        </div>
      </div>

    </div>
  );
};