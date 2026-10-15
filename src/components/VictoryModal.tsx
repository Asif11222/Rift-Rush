import React from 'react';
import { VictoryDetails } from '../types/game';
import { Trophy, Sparkles, RotateCcw, Home, Palette } from 'lucide-react';
import { SKINS_DATA } from '../storage/gameStorage';

interface VictoryModalProps {
  details: VictoryDetails;
  onPlayAgain: () => void;
  onMainMenu: () => void;
  onOpenSkins: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  details,
  onPlayAgain,
  onMainMenu,
  onOpenSkins,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-[#080C18] border border-[#FFD166]/60 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(255,209,102,0.3)] flex flex-col items-center text-center max-h-[92vh] overflow-y-auto">
        {/* Trophy icon */}
        <div className="w-16 h-16 rounded-3xl bg-[#FFD166]/10 border-2 border-[#FFD166] flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(255,209,102,0.5)]">
          <Trophy className="w-9 h-9 text-[#FFD166]" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD166]/10 text-[#FFD166] text-xs font-bold uppercase tracking-widest mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ALL 5 SECTORS SURVIVED</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-tight glow-gold mb-1">
          DIMENSION ESCAPED!
        </h2>
        <p className="text-xs text-slate-300 mb-5">
          Nova successfully delivered all dimensional cores through the singularity.
        </p>

        {/* Final stats */}
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-4 flex items-center justify-around font-mono-numbers">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase text-slate-400 font-bold">
              FINAL SCORE
            </span>
            <span className="text-3xl font-extrabold text-[#00E5FF] glow-cyan">
              {details.finalScore.toLocaleString()}
            </span>
          </div>

          <div className="h-10 w-px bg-slate-800" />

          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase text-slate-400 font-bold">
              RUN DURATION
            </span>
            <span className="text-2xl font-extrabold text-[#FFD166]">
              {formatTime(details.totalTimeSeconds)}
            </span>
          </div>
        </div>

        {/* Unlocked Skins Alert */}
        {details.newlyUnlockedSkins.length > 0 && (
          <div className="w-full bg-[#9B5CFF]/15 border border-[#9B5CFF]/60 rounded-2xl p-3.5 mb-4 flex items-center justify-between text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#9B5CFF]/20 flex items-center justify-center">
                <Palette className="w-5 h-5 text-[#9B5CFF]" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#9B5CFF]">
                  NEW SKIN UNLOCKED!
                </span>
                <p className="text-sm font-bold text-white">
                  {SKINS_DATA[details.newlyUnlockedSkins[0]]?.name || 'White Comet'}
                </p>
              </div>
            </div>
            <button
              onClick={onOpenSkins}
              className="text-xs font-bold text-slate-950 bg-[#00E5FF] px-3 py-1.5 rounded-xl cursor-pointer hover:bg-[#38BDF8]"
            >
              Equip
            </button>
          </div>
        )}

        {/* Sector breakdown list */}
        <div className="w-full bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3 mb-6 flex flex-col gap-1.5 font-mono-numbers text-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold text-left mb-1">
            Sector Scores Summary:
          </span>
          {details.breakdowns.map((b) => (
            <div key={b.sectorNumber} className="flex justify-between items-center text-slate-300 py-0.5">
              <span className="truncate max-w-[200px]">
                {b.sectorName.split('—')[0]}
              </span>
              <span className="font-bold text-[#FFD166]">
                +{b.sectorTotal} PTS
              </span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3.5 rounded-2xl bg-[#00E5FF] hover:bg-[#38BDF8] text-slate-950 font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-[#00E5FF]/25 active:scale-98"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={onMainMenu}
            className="flex-1 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
