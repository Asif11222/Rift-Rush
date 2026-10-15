import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '../game/engine';
import { GameRenderer } from '../game/renderer';
import { ARENA_HEIGHT, ARENA_WIDTH } from '../game/levels';
import { InputState, SkinId } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { gameStorage } from '../storage/gameStorage';
import { Smartphone, X } from 'lucide-react';

interface GameCanvasProps {
  engine: GameEngine;
  skinId: SkinId;
  isPaused: boolean;
  onPauseToggle: () => void;
  touchMove: { x: number; y: number };
  onDashRequest: () => void;
  onPulseRequest: () => void;
  isTouchControlActive: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  engine,
  skinId,
  isPaused,
  onPauseToggle,
  touchMove,
  onDashRequest,
  onPulseRequest,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard input state
  const keysDown = useRef<Record<string, boolean>>({});
  const dashRequested = useRef<boolean>(false);
  const pulseRequested = useRef<boolean>(false);

  // Camera shake state
  const shakeIntensity = useRef<number>(0);

  // Landscape suggestion on mobile
  const [showOrientationHint, setShowOrientationHint] = useState<boolean>(false);

  // Expose triggers
  useEffect(() => {
    // When parent triggers dash/pulse via touch
    // Handled directly via engine or input state
  }, []);

  const handleTriggerDash = useCallback(() => {
    dashRequested.current = true;
  }, []);

  const handleTriggerPulse = useCallback(() => {
    pulseRequested.current = true;
  }, []);

  // Sync callbacks with engine
  useEffect(() => {
    engine.callbacks.onScreenShake = (intensity: number) => {
      const settings = gameStorage.getState().settings;
      if (!settings.reducedMotion) {
        shakeIntensity.current = Math.max(shakeIntensity.current, intensity);
      }
    };
  }, [engine]);

  // Check orientation on mobile
  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window !== 'undefined') {
        const isMobile = window.innerWidth <= 768;
        const isPortrait = window.innerHeight > window.innerWidth;
        setShowOrientationHint(isMobile && isPortrait);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Keyboard input listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept typing in input fields (e.g. nickname)
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Prevent scrolling keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      soundManager.userInteracted();

      if (e.code === 'KeyW' || e.code === 'ArrowUp') keysDown.current['up'] = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keysDown.current['down'] = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keysDown.current['left'] = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keysDown.current['right'] = true;

      if (e.code === 'Space') {
        dashRequested.current = true;
      }

      if (e.code === 'KeyQ') {
        pulseRequested.current = true;
      }

      if (e.code === 'Escape' || e.code === 'KeyP') {
        onPauseToggle();
      }

      if (e.code === 'KeyM') {
        const s = gameStorage.getState().settings;
        gameStorage.setSettings({ muted: !s.muted });
        soundManager.updateVolumes();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keysDown.current['up'] = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keysDown.current['down'] = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keysDown.current['left'] = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keysDown.current['right'] = false;
    };

    const handleWindowBlur = () => {
      keysDown.current = {};
      // Auto-pause if active gameplay
      if (engine.isRunning && !engine.isPaused) {
        engine.setPaused(true);
        onPauseToggle();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        keysDown.current = {};
        if (engine.isRunning && !engine.isPaused) {
          engine.setPaused(true);
          onPauseToggle();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [engine, onPauseToggle]);

  // Main 60fps simulation and rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderer = new GameRenderer(ctx);
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Camera shake decay
      let shakeOffsetX = 0;
      let shakeOffsetY = 0;
      if (shakeIntensity.current > 0) {
        shakeOffsetX = (Math.random() * 2 - 1) * shakeIntensity.current;
        shakeOffsetY = (Math.random() * 2 - 1) * shakeIntensity.current;
        shakeIntensity.current = Math.max(0, shakeIntensity.current - rawDt * 18);
      }

      // Gather input
      let moveX = 0;
      let moveY = 0;

      if (keysDown.current['left']) moveX -= 1;
      if (keysDown.current['right']) moveX += 1;
      if (keysDown.current['up']) moveY -= 1;
      if (keysDown.current['down']) moveY += 1;

      // Add touch joystick if active
      if (Math.hypot(touchMove.x, touchMove.y) > 0.05) {
        moveX = touchMove.x;
        moveY = touchMove.y;
      }

      const input: InputState = {
        moveX,
        moveY,
        dashRequested: dashRequested.current,
        pulseRequested: pulseRequested.current,
      };

      // Reset edge-triggered ability flags
      dashRequested.current = false;
      pulseRequested.current = false;

      // Update Engine
      engine.update(rawDt, input);

      // Render
      const settings = gameStorage.getState().settings;
      renderer.render(engine, {
        skinId,
        highContrast: settings.highContrast,
        reducedMotion: settings.reducedMotion,
        shakeOffset: { x: shakeOffsetX, y: shakeOffsetY },
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [engine, skinId, touchMove]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#080C18]"
    >
      {/* Logical Canvas (960 x 600 fixed logical size, scaled responsively) */}
      <canvas
        ref={canvasRef}
        width={ARENA_WIDTH}
        height={ARENA_HEIGHT}
        className="w-full h-auto max-h-full aspect-[960/600] object-contain shadow-2xl block"
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      />

      {/* Mobile Landscape Recommendation Banner */}
      {showOrientationHint && (
        <div className="absolute top-2 inset-x-4 z-40 bg-slate-900/90 border border-[#00E5FF]/40 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs text-slate-200 backdrop-blur-md shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#00E5FF] rotate-90" />
            <span>Landscape mode recommended for wider tactical field.</span>
          </div>
          <button
            onClick={() => setShowOrientationHint(false)}
            className="p-1 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
