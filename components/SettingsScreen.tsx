
import React from 'react';

interface Props {
    musicVolume: number;
    sfxVolume: number;
    onMusicChange: (val: number) => void;
    onSfxChange: (val: number) => void;
    onBack: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ musicVolume, sfxVolume, onMusicChange, onSfxChange, onBack }) => {
  return (
    <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center text-white relative overflow-hidden">
        {/* Background Deco */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#020617_100%)]"></div>
        
        <div className="z-10 w-full max-w-md p-8 bg-slate-800/50 border border-slate-700 rounded-xl backdrop-blur-sm shadow-2xl">
            <h2 className="text-3xl mb-8 font-bold tracking-widest text-center text-blue-400 uppercase">Настройки</h2>
            
            <div className="space-y-8">
                {/* Music Volume */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold uppercase text-slate-400">
                        <span>Громкость музыки</span>
                        <span>{Math.round(musicVolume * 100)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.05"
                        value={musicVolume}
                        onChange={(e) => onMusicChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                {/* SFX Volume */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold uppercase text-slate-400">
                        <span>Громкость звуков</span>
                        <span>{Math.round(sfxVolume * 100)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.05"
                        value={sfxVolume}
                        onChange={(e) => onSfxChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                </div>
            </div>

            <div className="mt-12 flex justify-center">
                <button 
                    onClick={onBack} 
                    className="px-8 py-3 border border-slate-600 rounded hover:bg-slate-700 hover:border-slate-500 transition-all uppercase tracking-widest font-bold"
                >
                    Назад
                </button>
            </div>
        </div>
    </div>
  );
};
