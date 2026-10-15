import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import { HomeScreen } from './components/HomeScreen';
import { TutorialOverlay } from './components/TutorialOverlay';
import { PauseModal } from './components/PauseModal';
import { SectorClearedModal } from './components/SectorClearedModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { LocalScoresModal } from './components/LocalScoresModal';
import { SkinsModal } from './components/SkinsModal';
import {
  GameOverDetails,
  ScreenState,
  SectorClearBreakdown,
  SkinId,
  UpgradeType,
  VictoryDetails,
} from './types/game';
import { gameStorage } from './storage/gameStorage';
import { soundManager } from './audio/soundManager';

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('home');
  const [selectedSkin, setSelectedSkin] = useState<SkinId>(() => gameStorage.getState().selectedSkin);

  // Modals
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showScores, setShowScores] = useState<boolean>(false);
  const [showSkins, setShowSkins] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Results
  const [lastClearBreakdown, setLastClearBreakdown] = useState<SectorClearBreakdown | null>(null);
  const [gameOverDetails, setGameOverDetails] = useState<GameOverDetails | null>(null);
  const [victoryDetails, setVictoryDetails] = useState<VictoryDetails | null>(null);

  // Mobile touch controls state
  const [touchMove, setTouchMove] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  // Detect touch device
  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth <= 1024
      );
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  // Initialize GameEngine with callbacks
  const engineRef = useRef<GameEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new GameEngine({
      onSectorCleared: (breakdown) => {
        // Unlock skins based on cleared sectors
        if (breakdown.sectorNumber === 2) {
          gameStorage.unlockSkin('amber');
        } else if (breakdown.sectorNumber === 4) {
          gameStorage.unlockSkin('violet');
        }

        setLastClearBreakdown(breakdown);
        setScreen('sector_cleared');
      },
      onGameOver: (details) => {
        // Save genuine run to local storage
        if (engineRef.current && !engineRef.current.isTutorial) {
          gameStorage.recordRun({
            nickname: gameStorage.getState().nickname,
            score: details.finalScore,
            furthestSector: details.furthestSector,
            victory: false,
            durationSeconds: Math.floor(engineRef.current.totalActivePlayTime),
          });
        }
        setGameOverDetails(details);
        setScreen('game_over');
      },
      onVictory: (finalScore, totalTime, breakdowns) => {
        // Unlock White Comet skin
        const unlockedWhite = gameStorage.unlockSkin('white');
        const newlyUnlocked: SkinId[] = [];
        if (unlockedWhite) newlyUnlocked.push('white');

        // Save genuine victory run
        gameStorage.recordRun({
          nickname: gameStorage.getState().nickname,
          score: finalScore,
          furthestSector: 5,
          victory: true,
          durationSeconds: totalTime,
        });

        setVictoryDetails({
          finalScore,
          totalTimeSeconds: totalTime,
          breakdowns,
          newlyUnlockedSkins: newlyUnlocked,
        });
        setScreen('victory');
      },
    });
  }

  const engine = engineRef.current;

  // Sound user interaction listener
  const handleUserGesture = useCallback(() => {
    soundManager.userInteracted();
  }, []);

  // Play button clicked - begins Sector 1 immediately with active hazards, countdown, and damage
  const handlePlay = () => {
    handleUserGesture();
    engine.startRun();
    setScreen('gameplay');
  };

  const handlePracticeTutorial = () => {
    handleUserGesture();
    engine.startTutorial();
    setScreen('tutorial');
  };

  const handleSkipTutorial = () => {
    gameStorage.setTutorialCompleted();
    engine.startRun();
    setScreen('gameplay');
  };

  const handleStartRunFromTutorial = () => {
    gameStorage.setTutorialCompleted();
    engine.startRun();
    setScreen('gameplay');
  };

  const handlePauseToggle = useCallback(() => {
    if (screen === 'gameplay' || screen === 'tutorial') {
      engine.setPaused(true);
      setScreen('paused');
    } else if (screen === 'paused') {
      engine.setPaused(false);
      setScreen(engine.isTutorial ? 'tutorial' : 'gameplay');
    }
  }, [screen, engine]);

  const handleResume = () => {
    engine.setPaused(false);
    setScreen(engine.isTutorial ? 'tutorial' : 'gameplay');
  };

  const handleRestartRun = () => {
    engine.startRun();
    setScreen('gameplay');
  };

  const handleMainMenu = () => {
    engine.isRunning = false;
    engine.setPaused(false);
    setScreen('home');
  };

  const handleSelectUpgradeAndProceed = (upgrade: UpgradeType | null) => {
    if (upgrade) {
      engine.applyUpgrade(upgrade);
    }

    if (engine.isTutorial) {
      gameStorage.setTutorialCompleted();
      engine.startRun();
      setScreen('gameplay');
      return;
    }

    // Load next sector
    const nextSector = engine.currentSectorIndex + 1;
    if (nextSector <= 5) {
      engine.loadSector(nextSector);
      setScreen('gameplay');
    }
  };

  const handleSelectSkin = (skinId: SkinId) => {
    const success = gameStorage.setSelectedSkin(skinId);
    if (success) {
      setSelectedSkin(skinId);
    }
  };

  // Touch trigger handlers
  const handleTouchDash = () => {
    if (engine.player.dashCooldownTimer <= 0) {
      engine.player.isDashing = true;
      engine.player.dashDurationTimer = 0.18;
      engine.player.dashCooldownTimer = 2.0;
      soundManager.playDash();
    }
  };

  const handleTouchPulse = () => {
    const pulseCdDuration = engine.getPulseCooldownDuration();
    if (
      engine.player.pulseCooldownTimer <= 0 &&
      engine.player.pulseActiveTimer <= 0
    ) {
      engine.player.pulseActiveTimer = 2.5;
      engine.player.pulseCooldownTimer = pulseCdDuration;
      soundManager.playPulse();
      if (engine.callbacks.onScreenShake) {
        engine.callbacks.onScreenShake(4);
      }
    }
  };

  return (
    <div
      onClick={handleUserGesture}
      className="relative w-screen h-screen bg-[#080C18] text-white overflow-hidden flex flex-col font-cyber select-none"
    >
      {/* Background cyber grid & glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,229,255,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* Main Viewport Container */}
      <div className="relative flex-1 w-full h-full flex flex-col items-center justify-center overflow-hidden">
        {screen === 'home' && (
          <HomeScreen
            onPlay={handlePlay}
            onPracticeTutorial={handlePracticeTutorial}
            onOpenHowToPlay={() => setShowHowToPlay(true)}
            onOpenScores={() => setShowScores(true)}
            onOpenSkins={() => setShowSkins(true)}
            onOpenSettings={() => setShowSettings(true)}
            selectedSkin={selectedSkin}
          />
        )}

        {(screen === 'gameplay' ||
          screen === 'tutorial' ||
          screen === 'paused') && (
          <div className="relative w-full h-full flex flex-col">
            {/* Arena Canvas Mount */}
            <div className="relative flex-1 w-full h-full min-h-0 flex items-center justify-center">
              <GameCanvas
                engine={engine}
                skinId={selectedSkin}
                isPaused={screen === 'paused'}
                onPauseToggle={handlePauseToggle}
                touchMove={touchMove}
                onDashRequest={handleTouchDash}
                onPulseRequest={handleTouchPulse}
                isTouchControlActive={isTouchDevice}
              />

              {/* In-Game HUD */}
              <HUD
                engine={engine}
                onPauseClick={handlePauseToggle}
                isTouchDevice={isTouchDevice}
              />

              {/* Tutorial Step-by-Step Guidance */}
              {screen === 'tutorial' && (
                <TutorialOverlay
                  engine={engine}
                  onSkip={handleSkipTutorial}
                  onStartRun={handleStartRunFromTutorial}
                  isTouchDevice={isTouchDevice}
                />
              )}
            </div>

            {/* Mobile Touch Controls Area (Placed cleanly below/outside the arena) */}
            {isTouchDevice && (
              <div className="w-full shrink-0">
                <TouchControls
                  engine={engine}
                  onMoveChange={(x, y) => setTouchMove({ x, y })}
                  onDashTrigger={handleTouchDash}
                  onPulseTrigger={handleTouchPulse}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals & Overlays */}
      {screen === 'paused' && (
        <PauseModal
          onResume={handleResume}
          onOpenSettings={() => setShowSettings(true)}
          onRestartRun={handleRestartRun}
          onMainMenu={handleMainMenu}
        />
      )}

      {screen === 'sector_cleared' && lastClearBreakdown && (
        <SectorClearedModal
          breakdown={lastClearBreakdown}
          availableUpgrades={engine.getAvailableUpgrades()}
          onSelectUpgradeAndProceed={handleSelectUpgradeAndProceed}
        />
      )}

      {screen === 'game_over' && gameOverDetails && (
        <GameOverModal
          details={gameOverDetails}
          onTryAgain={handleRestartRun}
          onMainMenu={handleMainMenu}
        />
      )}

      {screen === 'victory' && victoryDetails && (
        <VictoryModal
          details={victoryDetails}
          onPlayAgain={handleRestartRun}
          onMainMenu={handleMainMenu}
          onOpenSkins={() => {
            setScreen('home');
            setShowSkins(true);
          }}
        />
      )}

      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {showScores && (
        <LocalScoresModal onClose={() => setShowScores(false)} />
      )}

      {showSkins && (
        <SkinsModal
          onClose={() => setShowSkins(false)}
          selectedSkin={selectedSkin}
          onSelectSkin={handleSelectSkin}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSettingsUpdated={() => {
            const state = gameStorage.getState();
            setSelectedSkin(state.selectedSkin);
          }}
        />
      )}
    </div>
  );
}
