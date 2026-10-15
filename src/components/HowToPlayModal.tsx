import React from 'react';
import { X, Zap, Clock, Disc, Sparkles, Shield, AlertTriangle } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl bg-[#080C18] border border-[#00E5FF]/40 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-extrabold uppercase text-white tracking-wide">
              HOW TO PLAY
            </h2>
            <p className="text-xs text-[#00E5FF] font-semibold">
              RIFT RUSH: Escape the Collapse
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="flex flex-col gap-5 py-4 text-xs text-slate-300 leading-relaxed">
          {/* Mission */}
          <div>
            <h3 className="text-sm font-bold uppercase text-white mb-1.5 flex items-center gap-2">
              <Disc className="w-4 h-4 text-[#FFD166]" />
              <span>THE MISSION</span>
            </h3>
            <p>
              You are <strong className="text-white">Nova</strong>, an energy courier stranded in collapsing dimensions. In each of the 5 sectors, collect every required <strong className="text-[#FFD166]">Energy Core</strong> to unlock the dimensional portal, then extract before the countdown reaches zero.
            </p>
          </div>

          {/* Controls */}
          <div>
            <h3 className="text-sm font-bold uppercase text-white mb-2">CONTROLS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono-numbers">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 uppercase font-bold block mb-1">
                  Desktop Keyboard
                </span>
                <ul className="space-y-1">
                  <li><strong className="text-white">WASD / Arrows:</strong> Move</li>
                  <li><strong className="text-[#00E5FF]">SPACE:</strong> Evasion Dash</li>
                  <li><strong className="text-[#9B5CFF]">Q:</strong> Time Pulse</li>
                  <li><strong className="text-slate-300">ESC / P:</strong> Pause</li>
                  <li><strong className="text-slate-300">M:</strong> Mute / Unmute</li>
                </ul>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 uppercase font-bold block mb-1">
                  Mobile Touch
                </span>
                <ul className="space-y-1">
                  <li><strong className="text-white">Left Joystick:</strong> Directional steering</li>
                  <li><strong className="text-[#00E5FF]">DASH Button:</strong> 3x burst</li>
                  <li><strong className="text-[#9B5CFF]">PULSE Button:</strong> Slow-mo field</li>
                  <li><strong className="text-slate-300">Pause Button:</strong> Top right</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Special Abilities */}
          <div>
            <h3 className="text-sm font-bold uppercase text-white mb-2">ABILITIES</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80">
                <Zap className="w-5 h-5 text-[#00E5FF] shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-bold">Dash (2s cooldown):</span>
                  <p className="mt-0.5">
                    Surge forward at 3x speed for 0.18s with total invulnerability. Dash cannot phase through walls.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80">
                <Clock className="w-5 h-5 text-[#9B5CFF] shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-bold">Time Pulse (10s base cooldown):</span>
                  <p className="mt-0.5">
                    Slows all enemies and hazard cycles to 40% speed for 2.5s. Nova moves at standard speed!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Scoring System */}
          <div>
            <h3 className="text-sm font-bold uppercase text-white mb-2">SCORING FORMULA</h3>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 font-mono-numbers space-y-1">
              <div className="flex justify-between">
                <span>Energy Core:</span>
                <span className="text-[#FFD166] font-bold">+100 pts</span>
              </div>
              <div className="flex justify-between">
                <span>Optional Shard:</span>
                <span className="text-[#FFD166] font-bold">+10 pts</span>
              </div>
              <div className="flex justify-between">
                <span>Successful Extraction:</span>
                <span className="text-[#00E5FF] font-bold">+500 pts</span>
              </div>
              <div className="flex justify-between">
                <span>Time Bonus:</span>
                <span className="text-[#00E5FF] font-bold">Remaining Seconds × 5 pts</span>
              </div>
              <div className="flex justify-between">
                <span>Clean Extraction (No Damage):</span>
                <span className="text-[#00E5FF] font-bold">+200 pts</span>
              </div>
            </div>
          </div>

          {/* Browser Reload Notice */}
          <div className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-amber-300">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider block">Important Note on Runs:</span>
              <p className="mt-0.5 text-xs text-amber-200/90 leading-relaxed">
                Active runs do not survive a page reload. Quitting or reloading opens the home screen while securely retaining your unlocked skins, high scores, and settings.
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-2 py-3 rounded-2xl bg-[#00E5FF] hover:bg-[#38BDF8] text-slate-950 font-extrabold text-sm uppercase tracking-wider cursor-pointer transition-all"
        >
          GOT IT
        </button>
      </div>
    </div>
  );
};
