import React from 'react';
import { GameOverDetails } from '../types/game';
import { Skull, Clock, RotateCcw, Home, Lightbulb } from 'lucide-react';

interface GameOverModalProps {
  details: GameOverDetails;
  onTryAgain: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  details,
  onTryAgain,
  onMainMenu,
}) => {
  const isTimeOut = details.reason === 'time';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-[#080C18] border border-[#FF5A75]/50 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col items-center text-center">
        {/* Icon & Title */}
        <div className="w-14 h-14 rounded-2xl bg-[#FF5A75]/10 border border-[#FF5A75]/40 flex items-center justify-center mb-3">
          {isTimeOut ? (
            <Clock className="w-8 h-8 text-[#FF5A75]" />
          ) : (
            <Skull className="w-8 h-8 text-[#FF5A75]" />
          )}
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white glow-red mb-1">
          DIMENSION COLLAPSED
        </h2>

        <p className="text-sm font-semibold text-[#FF5A75] mb-5">
          {isTimeOut
            ? 'Extraction window closed — timeline collapsed before escape.'
            : 'Vanguard suit integrity compromised — all hearts depleted.'}
        </p>

        {/* Stats card */}
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-4 flex items-center justify-around font-mono-numbers">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase text-slate-400 font-bold">
              RUN SCORE
            </span>
            <span className="text-2xl font-extrabold text-[#00E5FF] glow-cyan">
              {details.finalScore}
            </span>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase text-slate-400 font-bold">
              FURTHEST SECTOR
            </span>
            <span className="text-2xl font-extrabold text-[#FFD166] glow-gold">
              0{details.furthestSector} / 05
            </span>
          </div>
        </div>

        {/* Tactical Tip */}
        <div className="w-full bg-slate-900/40 border border-slate-800/80 rounded-2xl p-3.5 mb-6 text-left flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-[#FFD166] shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase text-[#FFD166] tracking-wider">
              TACTICAL TIP
            </span>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              {details.tip}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <button
            onClick={onTryAgain}
            className="flex-1 py-3.5 rounded-2xl bg-[#00E5FF] hover:bg-[#38BDF8] text-slate-950 font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-[#00E5FF]/25 active:scale-98"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>TRY AGAIN</span>
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
