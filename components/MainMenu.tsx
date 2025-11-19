import React from 'react';

interface Props {
    onStart: () => void;
    onEditTeam: () => void;
    onSettings: () => void;
    teamCount: number;
}

export const MainMenu: React.FC<Props> = ({ onStart, onEditTeam, onSettings, teamCount }) => {
  return (
    <div className="w-full h-screen bg-[#0f172a] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#020617_100%)]"></div>
        <div className="absolute inset-0 opacity-10" 
               style={{ 
                   backgroundImage: 'linear-gradient(45deg, #334155 1px, transparent 1px)', 
                   backgroundSize: '30px 30px'
               }}>
        </div>

        <div className="z-10 text-center mb-16 relative">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-600 mb-4 filter drop-shadow-lg">
                HERO TACTICS
            </h1>
            <div className="text-xl md:text-2xl text-slate-400 tracking-[1em] uppercase font-light pl-4">
                Битва 3 на 3
            </div>
        </div>

        <div className="z-10 flex flex-col gap-6 w-72">
            <MenuButton onClick={onStart} disabled={teamCount === 0} primary>
                Начать бой
            </MenuButton>
            {teamCount === 0 && <div className="text-red-500 text-xs text-center -mt-4">Выберите команду перед боем</div>}
            
            <MenuButton onClick={onEditTeam}>
                Изменить команду
            </MenuButton>
            
            <MenuButton onClick={onSettings}>
                Настройки
            </MenuButton>
        </div>

        {/* Footer */}
        <div className="absolute bottom-8 text-slate-600 text-xs uppercase tracking-widest">
            v0.2.0 - Alpha Build
        </div>
    </div>
  );
};

const MenuButton: React.FC<{ children: React.ReactNode, onClick: () => void, primary?: boolean, disabled?: boolean }> = ({ children, onClick, primary, disabled }) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        className={`
            py-4 px-6 rounded text-lg font-bold uppercase tracking-widest transition-all duration-300 transform
            ${disabled 
                ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-600' 
                : primary 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:scale-105' 
                    : 'bg-transparent border border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-400 hover:scale-105'
            }
        `}
    >
        {children}
    </button>
);