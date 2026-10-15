import React, { useState, useEffect } from 'react';
import { GameEngine } from '../game/engine';
import { Heart, Zap, Clock, Disc, Sparkles, Pause, AlertTriangle } from 'lucide-react';

interface HUDProps {
  engine: GameEngine;
  onPauseClick: () => void;
  isTouchDevice: boolean;
}

export const HUD: React.FC<HUDProps> = ({ engine, onPauseClick }) => {
  // Real-time animation frame ticker to keep HUD synchronized with 60fps simulation
  const [, setTick] = useState<number>(0);

  useEffect(() => {
    let animId: number;
    const update = () => {
      setTick((prev) => (prev + 1) % 1000000);
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, []);

  const player = engine.player;
  const currentSector = engine.currentSectorDef;

  const coresCollected = engine.collectibles.filter(
    (c) => c.type === 'core' && c.collected
  ).length;
  const totalCores = currentSector.requiredCores;

  const shardsCollected = engine.collectibles.filter(
    (c) => c.type === 'shard' && c.collected
  ).length;

  const dashCooldownFraction = Math.max(
    0,
    player.dashCooldownTimer / 2.0
  );
  const pulseMaxCd = engine.getPulseCooldownDuration();
  const pulseCooldownFraction = Math.max(
    0,
    player.pulseCooldownTimer / pulseMaxCd
  );

  const isLowTime = !engine.isTutorial && engine.remainingTime <= 15;
  const isCriticalTime = !engine.isTutorial && engine.remainingTime <= 10;
  const isRecentlyDamaged = player.invulnerabilityTimer > 0.65;

  return (
    <div
      className={`absolute inset-0 pointer-events-none p-3 flex flex-col justify-between text-white font-cyber select-none transition-colors duration-150 ${
        isRecentlyDamaged ? 'bg-red-500/15 ring-4 ring-inset ring-red-500/60' : ''
      }`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full">
        {/* Left: Sector & Health */}
        <div
          className={`flex flex-col gap-1.5 backdrop-blur-xs px-3.5 py-2 rounded-xl pointer-events-auto shadow-lg shadow-black/40 transition-all ${
            isRecentlyDamaged
              ? 'bg-red-950/90 border-2 border-red-500 scale-105'
              : 'bg-[#080C18]/85 border border-[#00E5FF]/30'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#00E5FF] font-semibold">
              {engine.isTutorial ? 'TRAINING' : `SECTOR 0${engine.currentSectorIndex}`}
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-200 font-medium truncate max-w-[150px] sm:max-w-none">
              {currentSector.name.split('—')[1] || currentSector.name}
            </span>
          </div>

          {/* Hearts container with real-time health indicator */}
          <div
            className="flex items-center gap-1.5"
            aria-label={`Health: ${player.health} of ${player.maxHealth}`}
          >
            {Array.from({ length: player.maxHealth }).map((_, i) => {
              const hasHeart = i < player.health;
              return (
                <div key={i} className="relative">
                  <Heart
                    className={`w-5 h-5 transition-all duration-200 ${
                      hasHeart
                        ? isRecentlyDamaged
                          ? 'text-white fill-white scale-125 animate-ping'
                          : 'text-[#FF5A75] fill-[#FF5A75] drop-shadow-[0_0_8px_rgba(255,90,117,0.8)]'
                        : 'text-slate-700 fill-slate-900/60 opacity-40'
                    }`}
                  />
                  {hasHeart && isRecentlyDamaged && (
                    <Heart className="absolute inset-0 w-5 h-5 text-[#FF5A75] fill-[#FF5A75]" />
                  )}
                </div>
              );
            })}
            <span className="text-xs font-mono-numbers font-bold text-slate-300 ml-1">
              {player.health}/{player.maxHealth}
            </span>
          </div>
        </div>

        {/* Center: Real-time Countdown Timer */}
        {!engine.isTutorial ? (
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-xs shadow-lg transition-all ${
              isCriticalTime
                ? 'bg-red-600/30 border-red-500 text-red-400 scale-105 animate-bounce shadow-red-500/50'
                : isLowTime
                ? 'bg-[#FF5A75]/20 border-[#FF5A75] text-[#FF5A75] animate-pulse shadow-[#FF5A75]/30'
                : 'bg-[#080C18]/85 border-[#00E5FF]/30 text-white'
            }`}
          >
            {isLowTime ? (
              <AlertTriangle className="w-5 h-5 text-[#FF5A75] animate-spin-slow" />
            ) : (
              <Clock className="w-5 h-5 text-[#00E5FF]" />
            )}
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 -mb-1">
                TIME LIMIT
              </span>
              <span className="text-2xl font-mono-numbers font-bold tracking-tight">
                {Math.ceil(engine.remainingTime)}s
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-[#080C18]/85 border border-[#9B5CFF]/40 px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-lg">
            <span className="text-xs font-bold text-[#9B5CFF] tracking-wider uppercase">
              PRACTICE MODE (NO TIME LIMIT)
            </span>
          </div>
        )}

        {/* Right: Score, Objectives & Pause */}
        <div className="flex items-center gap-2">
          {/* Objectives readout */}
          <div className="flex flex-col items-end gap-1 bg-[#080C18]/85 border border-[#00E5FF]/30 backdrop-blur-xs px-3.5 py-1.5 rounded-xl shadow-lg shadow-black/40">
            <div className="flex items-center gap-3">
              {/* Cores */}
              <div
                className={`flex items-center gap-1.5 ${
                  coresCollected >= totalCores
                    ? 'text-[#00E5FF] font-extrabold'
                    : 'text-[#FFD166]'
                }`}
                title="Energy Cores"
              >
                <Disc className="w-4 h-4 animate-spin-slow" />
                <span className="text-sm font-mono-numbers font-bold">
                  {coresCollected}/{totalCores}
                </span>
              </div>

              {/* Shards */}
              <div className="flex items-center gap-1 text-[#FFD166]" title="Optional Shards">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-xs font-mono-numbers font-semibold">
                  {shardsCollected}/10
                </span>
              </div>
            </div>

            {/* Run score */}
            <div className="text-xs font-mono-numbers text-slate-300">
              SCORE: <span className="text-[#00E5FF] font-bold">{engine.runScore}</span>
            </div>
          </div>

          {/* Pause Button */}
          <button
            onClick={onPauseClick}
            aria-label="Pause game"
            className="pointer-events-auto bg-[#080C18]/90 hover:bg-[#00E5FF]/20 active:scale-95 border border-[#00E5FF]/40 text-[#00E5FF] p-2.5 rounded-xl shadow-lg cursor-pointer transition-all"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Ability Cooldown HUD (Desktop keyboard cues) */}
      <div className="flex items-center justify-center gap-4 mb-1">
        {/* Dash ability badge */}
        <div className="bg-[#080C18]/85 border border-[#00E5FF]/30 backdrop-blur-xs px-3.5 py-1.5 rounded-xl flex items-center gap-2.5 shadow-md">
          <div className="relative w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden">
            <Zap className={`w-4 h-4 ${player.dashCooldownTimer <= 0 ? 'text-[#00E5FF]' : 'text-slate-500'}`} />
            {dashCooldownFraction > 0 && (
              <div
                className="absolute inset-x-0 bottom-0 bg-[#00E5FF]/40 transition-all duration-75"
                style={{ height: `${dashCooldownFraction * 100}%` }}
              />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-200">DASH</span>
              <kbd className="text-[10px] bg-slate-800 text-slate-300 px-1 rounded border border-slate-700">
                SPACE
              </kbd>
            </div>
            <span className="text-[10px] font-mono-numbers text-slate-400">
              {player.dashCooldownTimer <= 0 ? 'READY' : `${player.dashCooldownTimer.toFixed(1)}s`}
            </span>
          </div>
        </div>

        {/* Time Pulse ability badge */}
        <div className="bg-[#080C18]/85 border border-[#9B5CFF]/30 backdrop-blur-xs px-3.5 py-1.5 rounded-xl flex items-center gap-2.5 shadow-md">
          <div className="relative w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden">
            <Clock
              className={`w-4 h-4 ${
                player.pulseActiveTimer > 0
                  ? 'text-[#00E5FF] animate-spin'
                  : player.pulseCooldownTimer <= 0
                  ? 'text-[#9B5CFF]'
                  : 'text-slate-500'
              }`}
            />
            {pulseCooldownFraction > 0 && (
              <div
                className="absolute inset-x-0 bottom-0 bg-[#9B5CFF]/40 transition-all duration-75"
                style={{ height: `${pulseCooldownFraction * 100}%` }}
              />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-200">TIME PULSE</span>
              <kbd className="text-[10px] bg-slate-800 text-slate-300 px-1 rounded border border-slate-700">
                Q
              </kbd>
            </div>
            <span className="text-[10px] font-mono-numbers text-slate-400">
              {player.pulseActiveTimer > 0
                ? `ACTIVE (${player.pulseActiveTimer.toFixed(1)}s)`
                : player.pulseCooldownTimer <= 0
                ? 'READY'
                : `${player.pulseCooldownTimer.toFixed(1)}s`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
