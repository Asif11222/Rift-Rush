import React, { useState } from 'react';
import { Play, Settings, RotateCcw, Home, AlertTriangle } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onOpenSettings: () => void;
  onRestartRun: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onOpenSettings,
  onRestartRun,
  onMainMenu,
}) => {
  const [confirmingAction, setConfirmingAction] = useState<'restart' | 'menu' | null>(null);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm bg-[#080C18] border border-[#00E5FF]/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Title */}
        <h2 className="text-3xl font-extrabold uppercase tracking-wide text-white drop-shadow-[0_0_12px_rgba(0,229,255,0.4)] mb-1">
          PAUSED
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Simulation time suspended.
        </p>

        {/* Confirmation prompt for abandon */}
        {confirmingAction ? (
          <div className="w-full bg-slate-900/90 border border-amber-500/50 rounded-2xl p-4 mb-4 flex flex-col items-center">
            <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" />
            <h4 className="text-sm font-bold text-white mb-1">
              Abandon Current Run?
            </h4>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Active progress and collected run points will be discarded.
            </p>
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => setConfirmingAction(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmingAction === 'restart') onRestartRun();
                  if (confirmingAction === 'menu') onMainMenu();
                }}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-extrabold text-slate-950 cursor-pointer"
              >
                Confirm Abandon
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-3">
            {/* Resume button */}
            <button
              onClick={onResume}
              className="w-full py-3.5 rounded-2xl bg-[#00E5FF] hover:bg-[#38BDF8] text-slate-950 font-extrabold text-base uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-[#00E5FF]/30 active:scale-98"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>Resume</span>
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            {/* Restart Run */}
            <button
              onClick={() => setConfirmingAction('restart')}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart Run</span>
            </button>

            {/* Main Menu */}
            <button
              onClick={() => setConfirmingAction('menu')}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <Home className="w-4 h-4" />
              <span>Main Menu</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
