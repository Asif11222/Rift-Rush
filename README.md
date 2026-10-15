# RIFT RUSH: Escape the Collapse

> *“Grab the cores. Bend time. Get out.”*

**RIFT RUSH** is an adrenaline-fueled, single-player 2D top-down arcade escape game built for browser desktop and mobile devices. Players take on the role of **Nova**, an elite energy courier stranded inside a rapidly collapsing dimension. To survive, you must collect all required Energy Cores in each sector, unlock the extraction portal, and escape before the countdown reaches zero.

---

## 1. Quick Start & Setup

The project is built on Vite, React 19, TypeScript, and HTML5 Canvas.

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Compile and build for production
npm run build
```

---

## 2. Controls

### Desktop Keyboard
- **WASD / Arrow Keys**: Directional movement (normalized diagonal speed).
- **Space**: Evasion Dash (3x burst speed for 0.18s, invulnerability, 2.0s cooldown).
- **Q**: Time Pulse (slows enemies and hazards to 40% speed for 2.5s, 10s base cooldown).
- **Escape / P**: Pause or resume game simulation.
- **M**: Mute / unmute audio synthesizer.

### Mobile Touch Controls
- **Virtual Joystick (Bottom Left)**: 360-degree analog steering with touch-pointer tracking.
- **DASH Button (Bottom Right)**: Instant 3x speed burst (>= 48px touch target).
- **PULSE Button (Bottom Right)**: Activates Time Pulse chronoshift.
- **Pause Button (Top Right)**: Suspends simulation.
- Multi-touch enabled: move and trigger abilities simultaneously.

---

## 3. Game Rules & Mechanics

- **Arena Size**: Logical 960 × 600 arena scaled dynamically to viewport while preserving physics.
- **Health**: Starts with 3 hearts. Contact with hazards or enemies costs 1 heart and grants 1.0s damage invulnerability. Reaching 0 hearts causes dimensional collapse.
- **Energy Cores**: Required collectibles that charge and unlock the extraction portal.
- **Optional Shards**: 10 shards per sector offering +10 bonus points each.
- **Portal**: Starts locked. Unlocks automatically once all required cores are collected. Stepping into the unlocked portal completes the sector.
- **Countdown**: Running out of time immediately collapses the sector.

### Scoring Formula
| Action | Points |
|---|---|
| Energy Core | +100 pts |
| Optional Shard | +10 pts |
| Successful Extraction | +500 pts |
| Time Bonus | `floor(remaining seconds) * 5` pts |
| Clean Extraction (No Damage) | +200 pts |

### Run Upgrades
After sectors 1–4, players choose 1 of 3 temporary run upgrades:
1. **Swift Boots**: +8% base movement speed (up to 2 levels = +16%).
2. **Reinforced Suit**: +1 max heart (up to 5 hearts total).
3. **Pulse Capacitor**: Reduces Time Pulse cooldown by 2s (down to 6s minimum).

### Cosmetic Skins
- **Cyan Courier**: Standard issue harness (Unlocked by default).
- **Amber Runner**: High-voltage scavenger suit (Clear Sector 2).
- **Violet Phantom**: Phase-shifted vault plating (Clear Sector 4).
- **White Comet**: Singularity-forged relic (Complete Sector 5 / Win run).

---

## 4. Project Structure

```
├── src/
│   ├── audio/
│   │   └── soundManager.ts      # Web Audio procedural sound synthesizer & ambient music
│   ├── components/
│   │   ├── GameCanvas.tsx       # 60fps RAF loop, auto-pause on blur, input polling
│   │   ├── GameOverModal.tsx    # Defeat breakdown, statistics, tactical tips
│   │   ├── HomeScreen.tsx       # Title lockup, play CTA, nickname input, menu
│   │   ├── HowToPlayModal.tsx   # Gameplay rules, controls reference, tips
│   │   ├── HUD.tsx              # World-matched low-occlusion perimeter telemetry
│   │   ├── LocalScoresModal.tsx # Top 10 genuine run records from localStorage
│   │   ├── PauseModal.tsx       # Pause menu with confirm-abandon safeguards
│   │   ├── SectorClearedModal.tsx # Score breakdown & upgrade picker
│   │   ├── SettingsModal.tsx    # Volume sliders, high contrast, reduced motion
│   │   ├── SkinsModal.tsx       # Cosmetic skin wardrobe and unlock criteria
│   │   ├── TouchControls.tsx    # Mobile virtual joystick and action buttons
│   │   └── TutorialOverlay.tsx  # Step-by-step safe practice guidance
│   ├── game/
│   │   ├── engine.ts            # Fixed-step physics, substepping, ability timers
│   │   ├── levels.ts            # Handcrafted sector definitions & reachability validator
│   │   ├── pathfinding.ts       # NavGrid A* algorithm & line-of-sight for Chasers
│   │   └── renderer.ts          # Vector Canvas 2D graphics, glow, particle trails
│   ├── storage/
│   │   └── gameStorage.ts       # Versioned localStorage with safe in-memory fallback
│   ├── types/
│   │   └── game.ts              # TypeScript interfaces, enums, level models
│   ├── App.tsx                  # Main game state coordinator and modal switcher
│   ├── index.css                # Sci-fi typography and styling resets
│   └── main.tsx                 # React entry point
└── metadata.json                # AI Studio application metadata
```

---

## 5. Difficulty Configuration

Level balance parameters are centralized in `src/game/levels.ts` and `src/game/engine.ts`:
- **Chaser Speed**: Sector 1 (100) -> Sector 2 (110) -> Sector 3 (120) -> Sector 4 (130) -> Sector 5 (140) units/s.
- **Laser Cycle**: 3.0s inactive, 1.0s warning, 1.0s active beam (slowed by 40% under Time Pulse).
- **Countdown Limits**: Sectors 1–5 range from 90s to 120s with ample time for careful path choices.
- **Passages**: Guaranteed minimum width >= 56 units, validated with player collider inflation.
