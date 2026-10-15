import React, { useState } from 'react';
import { X, Volume2, VolumeX, Eye, Sparkles, Trash2, AlertCircle } from 'lucide-react';
import { gameStorage } from '../storage/gameStorage';
import { soundManager } from '../audio/soundManager';
import { PlayerSettings } from '../types/game';

interface SettingsModalProps {
  onClose: () => void;
  onSettingsUpdated: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  onSettingsUpdated,
}) => {
  const [settings, setSettings] = useState<PlayerSettings>(() => gameStorage.getState().settings);
  const [confirmReset, setConfirmReset] = useState(false);

  const updateSetting = <K extends keyof PlayerSettings>(key: K, value: PlayerSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    gameStorage.setSettings({ [key]: value });
    soundManager.updateVolumes();
    onSettingsUpdated();
  };

  const handleResetProgress = () => {
    gameStorage.resetProgress();
    setConfirmReset(false);
    onSettingsUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-[#080C18] border border-[#00E5FF]/40 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-extrabold uppercase text-white tracking-wide">
              SETTINGS
            </h2>
            <p className="text-xs text-slate-400">Audio, Visuals & Preferences</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings options */}
        <div className="flex flex-col gap-5 py-5 text-sm text-slate-300">
          {/* Mute Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {settings.muted ? (
                <VolumeX className="w-5 h-5 text-slate-500" />
              ) : (
                <Volume2 className="w-5 h-5 text-[#00E5FF]" />
              )}
              <span className="font-semibold text-white">Mute All Audio</span>
            </div>
            <button
              onClick={() => updateSetting('muted', !settings.muted)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.muted ? 'bg-[#00E5FF]' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                  settings.muted ? 'translate-x-6.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* SFX Volume */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-white">Sound Effects Volume</span>
              <span className="font-mono-numbers text-[#00E5FF]">
                {Math.round(settings.sfxVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              disabled={settings.muted}
              onChange={(e) => updateSetting('sfxVolume', parseFloat(e.target.value))}
              className="accent-[#00E5FF] cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Music Volume */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-white">Ambient Music Volume</span>
              <span className="font-mono-numbers text-[#00E5FF]">
                {Math.round(settings.musicVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              disabled={settings.muted}
              onChange={(e) => updateSetting('musicVolume', parseFloat(e.target.value))}
              className="accent-[#00E5FF] cursor-pointer disabled:opacity-50"
            />
          </div>

          <div className="h-px bg-slate-800 my-1" />

          {/* High Contrast Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Eye className="w-5 h-5 text-[#FFD166]" />
              <div className="flex flex-col">
                <span className="font-semibold text-white">High Contrast Mode</span>
                <span className="text-[11px] text-slate-400">
                  Enhanced outlines & hazard patterns
                </span>
              </div>
            </div>
            <button
              onClick={() => updateSetting('highContrast', !settings.highContrast)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.highContrast ? 'bg-[#FFD166]' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-slate-950 transition-transform transform absolute top-0.5 ${
                  settings.highContrast ? 'translate-x-6.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Reduced Motion Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-[#9B5CFF]" />
              <div className="flex flex-col">
                <span className="font-semibold text-white">Reduced Motion</span>
                <span className="text-[11px] text-slate-400">
                  Disables screen shakes & pulse warps
                </span>
              </div>
            </div>
            <button
              onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.reducedMotion ? 'bg-[#9B5CFF]' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                  settings.reducedMotion ? 'translate-x-6.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-slate-800 my-1" />

          {/* Reset Saved Progress */}
          {confirmReset ? (
            <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-4 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Confirm Reset: All high scores & unlocked skins will be wiped!</span>
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetProgress}
                  className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-bold text-white cursor-pointer"
                >
                  Yes, Reset All
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-red-500/15 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset Saved Progress</span>
            </button>
          )}
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full mt-2 py-3 rounded-2xl bg-[#00E5FF] hover:bg-[#38BDF8] text-slate-950 font-extrabold text-sm uppercase tracking-wider cursor-pointer transition-all"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
};
