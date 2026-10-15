import React from 'react';
import { X, Trophy, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { gameStorage } from '../storage/gameStorage';

interface LocalScoresModalProps {
  onClose: () => void;
}

export const LocalScoresModal: React.FC<LocalScoresModalProps> = ({ onClose }) => {
  const state = gameStorage.getState();
  const records = state.records;
  const personalBest = state.personalBestScore;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-2xl bg-[#080C18] border border-[#FFD166]/40 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFD166]/10 border border-[#FFD166]/40 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-[#FFD166]" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold uppercase text-white tracking-wide">
                LOCAL SCORES
              </h2>
              <p className="text-xs text-slate-400">
                Saved locally on this browser • Genuine run archives
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Best Score Banner */}
        <div className="my-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            ALL-TIME PERSONAL BEST
          </span>
          <span className="text-2xl font-mono-numbers font-extrabold text-[#FFD166] glow-gold">
            {personalBest > 0 ? `${personalBest.toLocaleString()} PTS` : 'NO RUNS RECORDED'}
          </span>
        </div>

        {/* Records Table */}
        <div className="w-full overflow-x-auto">
          {records.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Clock className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-400">
                No completed or attempted runs saved yet.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Play a run and reach the extraction portal to set your score!
              </p>
            </div>
          ) : (
            <table className="w-full text-left font-mono-numbers text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Agent</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Furthest</th>
                  <th className="py-2.5 px-3">Result</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {records.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white">
                      {r.nickname}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-[#00E5FF]">
                      {r.score.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      Sector 0{r.furthestSector}
                    </td>
                    <td className="py-3 px-3">
                      {r.victory ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Victory</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#FF5A75] font-semibold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Collapse</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {formatDuration(r.durationSeconds)}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {r.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-slate-500 mt-4 text-center">
          Records are stored strictly in this browser’s local storage.
        </p>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-3 rounded-2xl bg-[#00E5FF] hover:bg-[#38BDF8] text-slate-950 font-extrabold text-sm uppercase tracking-wider cursor-pointer transition-all"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
};
