import React, { useState, useEffect } from 'react';
import { GameEngine } from '../game/engine';
import { ArrowRight, FastForward, CheckCircle2 } from 'lucide-react';

interface TutorialOverlayProps {
  engine: GameEngine;
  onSkip: () => void;
  onStartRun: () => void;
  isTouchDevice: boolean;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  engine,
  onSkip,
  onStartRun,
  isTouchDevice,
}) => {
  // Steps:
  // 1. Move Nova
  // 2. Collect the core
  // 3. Practice Dash
  // 4. Activate Time Pulse
  // 5. Enter the unlocked Portal
  const [currentStep, setCurrentStep] = useState(1);

  const hasCore = engine.collectibles.some((c) => c.type === 'core' && c.collected);
  const portalUnlocked = engine.portal.unlocked;

  useEffect(() => {
    if (portalUnlocked) {
      setCurrentStep(5);
    } else if (engine.player.pulseActiveTimer > 0) {
      setCurrentStep(4);
    } else if (engine.player.isDashing) {
      setCurrentStep(3);
    } else if (hasCore) {
      setCurrentStep(3);
    } else if (Math.hypot(engine.player.vx, engine.player.vy) > 10) {
      if (currentStep === 1) {
        setCurrentStep(2);
      }
    }
  }, [hasCore, portalUnlocked, engine.player.pulseActiveTimer, engine.player.isDashing, engine.player.vx, engine.player.vy, currentStep]);

  const stepsInfo = [
    {
      title: '1. MOVEMENT & NAVIGATION',
      instruction: isTouchDevice
        ? 'Drag the Virtual Joystick at bottom-left to guide Nova.'
        : 'Use WASD or Arrow keys to steer Nova across the grid.',
    },
    {
      title: '2. COLLECT ENERGY CORES',
      instruction: 'Reach the pulsing golden Core in the center to retrieve its dimensional charge.',
    },
    {
      title: '3. EVASION DASH',
      instruction: isTouchDevice
        ? 'Tap the DASH button at bottom-right to burst forward and dodge through danger.'
        : 'Press SPACE to Dash at 3x speed with complete invulnerability.',
    },
    {
      title: '4. TIME PULSE CHRONOSHIFT',
      instruction: isTouchDevice
        ? 'Tap the PULSE button at bottom-right to slow enemies and hazards down to 40% speed.'
        : 'Press Q to activate Time Pulse. Nova moves at normal speed while threats slow down.',
    },
    {
      title: '5. ENTER EXTRACTION PORTAL',
      instruction: 'With all cores collected, the dimensional portal is unlocked! Step into the vortex to finish.',
    },
  ];

  const currentInfo = stepsInfo[currentStep - 1] || stepsInfo[0];

  return (
    <div className="absolute top-16 inset-x-0 flex flex-col items-center pointer-events-none z-20 px-4">
      <div className="bg-[#080C18]/90 border border-[#00E5FF]/40 backdrop-blur-md px-5 py-3.5 rounded-2xl max-w-xl w-full shadow-2xl flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#00E5FF] tracking-wider uppercase">
              COURIER PROTOCOL
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-300 font-mono-numbers">
              STEP {currentStep} / 5
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSkip}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Skip
            </button>
            <button
              onClick={onStartRun}
              className="flex items-center gap-1.5 text-xs text-slate-950 font-extrabold px-3 py-1.5 rounded-lg bg-[#00E5FF] hover:bg-[#38BDF8] shadow-md transition-all cursor-pointer"
            >
              <span>Start Run (Sector 1)</span>
              <FastForward className="w-3.5 h-3.5 fill-slate-950" />
            </button>
          </div>
        </div>

        {/* Practice Mode Notice */}
        <div className="bg-[#9B5CFF]/15 border border-[#9B5CFF]/40 rounded-xl px-2.5 py-1 flex items-center justify-between text-[11px] text-[#9B5CFF]">
          <span>💡 Safe Practice Area: Damage & Time Limit are disabled in this tutorial.</span>
        </div>

        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {portalUnlocked && <CheckCircle2 className="w-4 h-4 text-[#00E5FF]" />}
            {currentInfo.title}
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {currentInfo.instruction}
          </p>
        </div>
      </div>
    </div>
  );
};
