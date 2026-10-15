import React, { useState } from 'react';
import { Play, BookOpen, Trophy, Palette, Settings, Sparkles, ShieldAlert } from 'lucide-react';
import { gameStorage, SKINS_DATA } from '../storage/gameStorage';
import { SkinId } from '../types/game';

interface HomeScreenProps {
  onPlay: () => void;
  onPracticeTutorial: () => void;
  onOpenHowToPlay: () => void;
  onOpenScores: () => void;
  onOpenSkins: () => void;
  onOpenSettings: () => void;
  selectedSkin: SkinId;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onPlay,
  onPracticeTutorial,
  onOpenHowToPlay,
  onOpenScores,
  onOpenSkins,
  onOpenSettings,
  selectedSkin,
}) => {
  const [nickname, setNickname] = useState(() => gameStorage.getState().nickname);
  const personalBest = gameStorage.getState().personalBestScore;
  const currentSkin = SKINS_DATA[selectedSkin] || SKINS_DATA.cyan;

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(0, 16);
    setNickname(val);
    gameStorage.setNickname(val);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 overflow-hidden z-10 select-none">
      {/* Top Bar with Profile & Storage Notice */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        {/* Nickname input */}
        <div className="flex items-center gap-2 bg-[#0F172A]/80 border border-slate-700/80 px-3.5 py-2 rounded-xl backdrop-blur-md shadow-md">
          <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">
            AGENT:
          </span>
          <input
            type="text"
            value={nickname}
            onChange={handleNicknameChange}
            placeholder="Guest"
            maxLength={16}
            aria-label="Player Nickname"
            className="bg-transparent border-b border-transparent focus:border-[#00E5FF] outline-hidden text-sm font-semibold text-[#00E5FF] w-28 sm:w-36 transition-colors"
          />
        </div>

        {/* Selected Skin preview badge */}
        <button
          onClick={onOpenSkins}
          className="flex items-center gap-2 bg-[#0F172A]/80 hover:bg-[#0F172A] border border-slate-700 px-3.5 py-2 rounded-xl cursor-pointer transition-all active:scale-95 backdrop-blur-md shadow-md"
        >
          <div
            className="w-3.5 h-3.5 rounded-full shadow-[0_0_8px_currentColor]"
            style={{ backgroundColor: currentSkin.primaryColor, color: currentSkin.primaryColor }}
          />
          <span className="text-xs font-semibold text-slate-200">
            {currentSkin.name}
          </span>
        </button>
      </div>

      {/* Hero Centerpiece: Title Lockup & Play CTA */}
      <div className="flex flex-col items-center text-center my-auto max-w-2xl">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-semibold uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Dimension Collapse Imminent</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white uppercase drop-shadow-[0_0_24px_rgba(0,229,255,0.4)]">
          RIFT <span className="text-[#00E5FF]">RUSH</span>
        </h1>
        <p className="text-lg sm:text-2xl font-bold text-slate-300 tracking-wide mt-1 mb-3">
          Escape the Collapse
        </p>

        {/* Tagline */}
        <p className="text-sm sm:text-base text-slate-400 font-medium italic mb-6">
          “Grab the cores. Bend time. Get out.”
        </p>

        {/* Best Score readout */}
        <div className="mb-7 px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-sm font-mono-numbers">
          {personalBest > 0 ? (
            <span className="text-slate-300">
              PERSONAL BEST:{' '}
              <span className="text-[#FFD166] font-bold text-base glow-gold">
                {personalBest.toLocaleString()} PTS
              </span>
            </span>
          ) : (
            <span className="text-slate-400">No runs yet — begin your escape</span>
          )}
        </div>

        {/* Action Buttons: Start Run & Practice Tutorial */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
          {/* Primary Play Button (Starts Sector 1 directly) */}
          <button
            onClick={onPlay}
            className="flex-1 w-full group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#0099FF] text-slate-950 font-extrabold text-xl tracking-wider uppercase shadow-[0_0_30px_rgba(0,229,255,0.6)] hover:shadow-[0_0_45px_rgba(0,229,255,0.9)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-6 h-6 fill-slate-950" />
            <span>START RUN</span>
          </button>

          {/* Practice Tutorial Button */}
          <button
            onClick={onPracticeTutorial}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-[#9B5CFF] text-[#9B5CFF] font-bold text-sm uppercase tracking-wider transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>TUTORIAL</span>
          </button>
        </div>

        {/* Flat control-hint line */}
        <p className="text-xs text-slate-400 mt-4 tracking-wider">
          WASD Move · Space Dash · Q Time Pulse · Esc Pause
        </p>
      </div>

      {/* Secondary Navigation Buttons */}
      <div className="w-full max-w-xl grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={onOpenHowToPlay}
          className="flex items-center justify-center gap-2 bg-[#0F172A]/70 hover:bg-[#00E5FF]/15 border border-slate-800 hover:border-[#00E5FF]/50 text-slate-200 hover:text-[#00E5FF] py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>How to Play</span>
        </button>

        <button
          onClick={onOpenScores}
          className="flex items-center justify-center gap-2 bg-[#0F172A]/70 hover:bg-[#FFD166]/15 border border-slate-800 hover:border-[#FFD166]/50 text-slate-200 hover:text-[#FFD166] py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          <Trophy className="w-4 h-4" />
          <span>Local Scores</span>
        </button>

        <button
          onClick={onOpenSkins}
          className="flex items-center justify-center gap-2 bg-[#0F172A]/70 hover:bg-[#9B5CFF]/15 border border-slate-800 hover:border-[#9B5CFF]/50 text-slate-200 hover:text-[#9B5CFF] py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          <Palette className="w-4 h-4" />
          <span>Skins</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="flex items-center justify-center gap-2 bg-[#0F172A]/70 hover:bg-slate-700/50 border border-slate-800 text-slate-200 py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* Storage fallback indicator if localStorage disabled */}
      {!gameStorage.isStorageAvailable && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-400">
          <ShieldAlert className="w-4 h-4" />
          <span>Browser storage unavailable — running in temporary memory mode.</span>
        </div>
      )}
    </div>
  );
};
