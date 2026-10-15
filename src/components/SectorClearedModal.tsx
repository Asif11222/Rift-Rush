import React, { useState } from 'react';
import { SectorClearBreakdown, UpgradeOption, UpgradeType } from '../types/game';
import { CheckCircle2, ChevronRight, Zap, Shield, Clock } from 'lucide-react';

interface SectorClearedModalProps {
  breakdown: SectorClearBreakdown;
  availableUpgrades: UpgradeOption[];
  onSelectUpgradeAndProceed: (upgrade: UpgradeType | null) => void;
}

export const SectorClearedModal: React.FC<SectorClearedModalProps> = ({
  breakdown,
  availableUpgrades,
  onSelectUpgradeAndProceed,
}) => {
  const [selectedUpgrade, setSelectedUpgrade] = useState<UpgradeType | null>(
    availableUpgrades.length > 0 ? availableUpgrades[0].type : null
  );

  const getUpgradeIcon = (type: UpgradeType) => {
    switch (type) {
      case 'swiftBoots':
        return <Zap className="w-5 h-5 text-[#00E5FF]" />;
      case 'reinforcedSuit':
        return <Shield className="w-5 h-5 text-[#FF5A75]" />;
      case 'pulseCapacitor':
        return <Clock className="w-5 h-5 text-[#9B5CFF]" />;
    }
  };

  const isSector5 = breakdown.sectorNumber === 5;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-[#080C18] border border-[#00E5FF]/50 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/40 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-[#00E5FF]" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-[#00E5FF] font-semibold">
              SECTOR EXTRACTED
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {breakdown.sectorName}
            </h2>
          </div>
        </div>

        {/* Score Breakdown Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 my-4 flex flex-col gap-2 font-mono-numbers">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Required Cores Extracted:</span>
            <span className="text-white font-bold">+{breakdown.corePoints}</span>
          </div>
          {breakdown.shardPoints > 0 && (
            <div className="flex justify-between text-xs text-slate-300">
              <span>Optional Shards Bonus:</span>
              <span className="text-[#FFD166] font-bold">+{breakdown.shardPoints}</span>
            </div>
          )}
          <div className="flex justify-between text-xs text-slate-300">
            <span>Extraction Bonus:</span>
            <span className="text-[#00E5FF] font-bold">+{breakdown.extractionBonus}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-300">
            <span>Time Bonus ({Math.floor(breakdown.remainingSeconds)}s × 5):</span>
            <span className="text-[#00E5FF] font-bold">+{breakdown.timeBonus}</span>
          </div>
          {breakdown.noDamageBonus > 0 && (
            <div className="flex justify-between text-xs text-[#00E5FF]">
              <span>Clean Extraction (No Damage):</span>
              <span className="font-bold">+{breakdown.noDamageBonus}</span>
            </div>
          )}

          <div className="border-t border-slate-700/60 pt-2.5 mt-1 flex justify-between items-center text-sm font-bold">
            <span className="text-slate-200">SECTOR TOTAL:</span>
            <span className="text-[#FFD166] text-base glow-gold">
              +{breakdown.sectorTotal} PTS
            </span>
          </div>

          <div className="flex justify-between items-center text-sm font-bold border-t border-slate-800/80 pt-2">
            <span className="text-slate-400">RUN SCORE:</span>
            <span className="text-[#00E5FF] text-lg glow-cyan">
              {breakdown.cumulativeTotal} PTS
            </span>
          </div>
        </div>

        {/* Upgrade Selection (For Sectors 1-4) */}
        {!isSector5 && availableUpgrades.length > 0 && (
          <div className="mb-5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-300">
                CHOOSE ONE RUN UPGRADE
              </span>
              <span className="text-[11px] text-slate-500 font-mono-numbers">
                1 OF {availableUpgrades.length} AVAILABLE
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {availableUpgrades.map((upgrade) => {
                const isSelected = selectedUpgrade === upgrade.type;
                return (
                  <div
                    key={upgrade.type}
                    onClick={() => setSelectedUpgrade(upgrade.type)}
                    className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#00E5FF]/15 border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.25)]'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-800">
                        {getUpgradeIcon(upgrade.type)}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-bold text-white">
                          {upgrade.title}
                        </span>
                        <span className="text-xs text-slate-400">
                          {upgrade.description}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono-numbers font-semibold text-[#00E5FF] bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                        {upgrade.bonusText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Next Sector CTA */}
        <button
          onClick={() => onSelectUpgradeAndProceed(selectedUpgrade)}
          className="w-full py-4 rounded-2xl bg-[#00E5FF] hover:bg-[#38BDF8] text-slate-950 font-extrabold text-lg uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-[#00E5FF]/30 active:scale-98"
        >
          <span>NEXT SECTOR</span>
          <ChevronRight className="w-5 h-5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
