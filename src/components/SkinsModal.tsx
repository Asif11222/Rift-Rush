import React from 'react';
import { X, Lock, Check, Sparkles } from 'lucide-react';
import { gameStorage, SKINS_DATA } from '../storage/gameStorage';
import { SkinId } from '../types/game';

interface SkinsModalProps {
  onClose: () => void;
  selectedSkin: SkinId;
  onSelectSkin: (skinId: SkinId) => void;
}

export const SkinsModal: React.FC<SkinsModalProps> = ({
  onClose,
  selectedSkin,
  onSelectSkin,
}) => {
  const state = gameStorage.getState();
  const unlockedSkins = state.unlockedSkins;

  const skinList: SkinId[] = ['cyan', 'amber', 'violet', 'white'];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl bg-[#080C18] border border-[#9B5CFF]/40 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-extrabold uppercase text-white tracking-wide">
              COURIER SUIT SKINS
            </h2>
            <p className="text-xs text-[#9B5CFF] font-semibold">
              Cosmetic Hull Chromas & Trail Effects
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

        {/* Skins Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-5">
          {skinList.map((id) => {
            const skin = SKINS_DATA[id];
            const isUnlocked = unlockedSkins.includes(id);
            const isEquipped = selectedSkin === id;

            return (
              <div
                key={id}
                onClick={() => {
                  if (isUnlocked) onSelectSkin(id);
                }}
                className={`p-4 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                  isEquipped
                    ? 'bg-[#00E5FF]/15 border-[#00E5FF] shadow-[0_0_18px_rgba(0,229,255,0.25)]'
                    : isUnlocked
                    ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 cursor-pointer'
                    : 'bg-slate-950/40 border-slate-900/80 opacity-60'
                }`}
              >
                <div>
                  {/* Top swatch and status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white/20 shadow-md flex items-center justify-center"
                        style={{ backgroundColor: skin.primaryColor }}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: skin.secondaryColor }}
                        />
                      </div>
                      <span className="text-sm font-bold text-white">
                        {skin.name}
                      </span>
                    </div>

                    {isEquipped ? (
                      <span className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-wider bg-[#00E5FF]/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>EQUIPPED</span>
                      </span>
                    ) : !isUnlocked ? (
                      <Lock className="w-4 h-4 text-slate-500" />
                    ) : null}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {skin.tagline}
                  </p>
                </div>

                {/* Unlock condition or equip button */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {skin.unlockCondition}
                  </span>

                  {isUnlocked && !isEquipped && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSkin(id);
                      }}
                      className="text-xs font-bold text-white bg-slate-800 hover:bg-[#00E5FF] hover:text-slate-950 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Equip
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Note */}
        <p className="text-[11px] text-slate-500 text-center">
          Skins alter visual appearance and dash trails only. Performance and collision attributes remain balanced.
        </p>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-3 rounded-2xl bg-[#00E5FF] hover:bg-[#38BDF8] text-slate-950 font-extrabold text-sm uppercase tracking-wider cursor-pointer transition-all"
        >
          DONE
        </button>
      </div>
    </div>
  );
};
