import React, { useRef, useState, useEffect } from 'react';
import { Zap, Clock } from 'lucide-react';
import { GameEngine } from '../game/engine';

interface TouchControlsProps {
  onMoveChange: (x: number, y: number) => void;
  onDashTrigger: () => void;
  onPulseTrigger: () => void;
  engine: GameEngine;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMoveChange,
  onDashTrigger,
  onPulseTrigger,
  engine,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [joystickActive, setJoystickActive] = useState(false);
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0 });
  const activePointerId = useRef<number | null>(null);

  const player = engine.player;
  const isDashReady = player.dashCooldownTimer <= 0;
  const isPulseReady = player.pulseCooldownTimer <= 0 && player.pulseActiveTimer <= 0;

  // Joystick pointer handling
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (activePointerId.current !== null) return;

    activePointerId.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setJoystickActive(true);
    updateJoystick(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    updateJoystick(e.clientX, e.clientY);
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    activePointerId.current = null;
    setJoystickActive(false);
    setKnobOffset({ x: 0, y: 0 });
    onMoveChange(0, 0);
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = rect.width / 2 - 16;

    let nx = 0;
    let ny = 0;

    if (dist > 5) {
      const angle = Math.atan2(dy, dx);
      const clampedDist = Math.min(dist, maxRadius);
      nx = Math.cos(angle) * (clampedDist / maxRadius);
      ny = Math.sin(angle) * (clampedDist / maxRadius);

      setKnobOffset({
        x: Math.cos(angle) * clampedDist,
        y: Math.sin(angle) * clampedDist,
      });
    } else {
      setKnobOffset({ x: 0, y: 0 });
    }

    onMoveChange(nx, ny);
  };

  // Reset when window blurs or orientation changes
  useEffect(() => {
    const handleReset = () => {
      activePointerId.current = null;
      setJoystickActive(false);
      setKnobOffset({ x: 0, y: 0 });
      onMoveChange(0, 0);
    };

    window.addEventListener('blur', handleReset);
    window.addEventListener('orientationchange', handleReset);
    return () => {
      window.removeEventListener('blur', handleReset);
      window.removeEventListener('orientationchange', handleReset);
    };
  }, [onMoveChange]);

  return (
    <div className="w-full flex items-center justify-between px-6 py-3 select-none touch-control pointer-events-auto bg-[#080C18]/95 border-t border-slate-800">
      {/* Joystick (Min 48px touch target: base is 112px) */}
      <div
        ref={joystickBaseRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrCancel}
        onPointerCancel={handlePointerUpOrCancel}
        className="relative w-28 h-28 rounded-full bg-slate-900/90 border-2 border-[#00E5FF]/40 shadow-inner flex items-center justify-center cursor-pointer touch-none"
        aria-label="Virtual Movement Joystick"
      >
        {/* Inner track marks */}
        <div className="w-16 h-16 rounded-full border border-slate-700/50 pointer-events-none" />

        {/* Joystick Knob */}
        <div
          className={`absolute w-12 h-12 rounded-full transition-colors pointer-events-none shadow-md ${
            joystickActive
              ? 'bg-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.8)]'
              : 'bg-slate-700 border border-slate-500'
          }`}
          style={{
            transform: `translate(${knobOffset.x}px, ${knobOffset.y}px)`,
          }}
        />
      </div>

      {/* Action Buttons (Dash & Pulse, each at least 64px touch target) */}
      <div className="flex items-center gap-4">
        {/* Time Pulse Touch Button */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            onPulseTrigger();
          }}
          disabled={!isPulseReady}
          className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 transition-transform active:scale-90 cursor-pointer shadow-lg ${
            isPulseReady
              ? 'bg-[#9B5CFF]/20 border-[#9B5CFF] text-[#9B5CFF] shadow-[0_0_14px_rgba(155,92,255,0.4)]'
              : 'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
          }`}
          aria-label="Time Pulse Button"
        >
          <Clock className="w-6 h-6 mb-0.5" />
          <span className="text-[10px] font-bold tracking-tight">PULSE</span>
        </button>

        {/* Dash Touch Button */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            onDashTrigger();
          }}
          disabled={!isDashReady}
          className={`w-18 h-18 rounded-2xl flex flex-col items-center justify-center border-2 transition-transform active:scale-90 cursor-pointer shadow-lg ${
            isDashReady
              ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] shadow-[0_0_16px_rgba(0,229,255,0.5)]'
              : 'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
          }`}
          aria-label="Dash Ability Button"
        >
          <Zap className="w-7 h-7 mb-0.5" />
          <span className="text-xs font-bold tracking-tight">DASH</span>
        </button>
      </div>
    </div>
  );
};
