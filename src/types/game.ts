export type ScreenState =
  | 'home'
  | 'tutorial'
  | 'gameplay'
  | 'paused'
  | 'sector_cleared'
  | 'game_over'
  | 'victory';

export type SkinId = 'cyan' | 'amber' | 'violet' | 'white';

export interface SkinDefinition {
  id: SkinId;
  name: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  trailColor: string;
  visorColor: string;
  unlockCondition: string;
}

export interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: 'core' | 'shard';
  collected: boolean;
  pulsePhase: number;
}

export interface ChaserEnemy {
  id: string;
  type: 'chaser';
  x: number;
  y: number;
  radius: number;
  speed: number;
  angle: number;
  nextWaypoints: { x: number; y: number }[];
  repathTimer: number;
}

export interface PatrolEnemy {
  id: string;
  type: 'patrol';
  x: number;
  y: number;
  radius: number;
  speed: number;
  waypoints: { x: number; y: number }[];
  currentWaypointIndex: number;
}

export interface LaserLane {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
  cycleDuration: number; // 5.0s (3s inactive, 1s warning, 1s active)
  timer: number; // offset / current time in cycle
  warningThreshold: number; // 3.0s
  activeThreshold: number; // 4.0s
  state: 'inactive' | 'warning' | 'active';
}

export interface Portal {
  x: number;
  y: number;
  radius: number;
  unlocked: boolean;
}

export interface PlayerTrailPoint {
  x: number;
  y: number;
  alpha: number;
  radius: number;
  color: string;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  facingAngle: number;
  health: number;
  maxHealth: number;
  baseSpeed: number;
  currentSpeed: number;
  invulnerabilityTimer: number;
  isDashing: boolean;
  dashDurationTimer: number;
  dashCooldownTimer: number;
  pulseActiveTimer: number;
  pulseCooldownTimer: number;
  trail: PlayerTrailPoint[];
}

export interface UpgradeCounts {
  swiftBoots: number; // max 2 (+8% each)
  reinforcedSuit: number; // max 2 (+1 max heart each, up to 5)
  pulseCapacitor: number; // max 2 (-2s cooldown each, min 6s)
}

export type UpgradeType = 'swiftBoots' | 'reinforcedSuit' | 'pulseCapacitor';

export interface UpgradeOption {
  type: UpgradeType;
  title: string;
  description: string;
  currentLevel: number;
  maxLevel: number;
  bonusText: string;
}

export interface SectorDefinition {
  sectorNumber: number;
  name: string;
  tagline: string;
  requiredCores: number;
  countdownSeconds: number;
  chaserSpeed: number;
  playerStart: { x: number; y: number };
  portalPos: { x: number; y: number };
  obstacles: Obstacle[];
  cores: { x: number; y: number }[];
  shards: { x: number; y: number }[];
  chaserSpawns: { x: number; y: number }[];
  patrolDrones: { waypoints: { x: number; y: number }[] }[];
  laserLanes: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    initialOffset: number;
  }[];
}

export interface SectorClearBreakdown {
  sectorNumber: number;
  sectorName: string;
  corePoints: number;
  shardPoints: number;
  extractionBonus: number;
  remainingSeconds: number;
  timeBonus: number;
  noDamageBonus: number;
  sectorTotal: number;
  cumulativeTotal: number;
}

export interface GameOverDetails {
  reason: 'health' | 'time';
  furthestSector: number;
  finalScore: number;
  tip: string;
}

export interface VictoryDetails {
  finalScore: number;
  totalTimeSeconds: number;
  breakdowns: SectorClearBreakdown[];
  newlyUnlockedSkins: SkinId[];
}

export interface RunRecord {
  id: string;
  nickname: string;
  score: number;
  furthestSector: number;
  victory: boolean;
  durationSeconds: number;
  date: string;
}

export interface PlayerSettings {
  sfxVolume: number; // 0 - 1
  musicVolume: number; // 0 - 1
  muted: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

export interface LocalStorageState {
  version: number;
  nickname: string;
  settings: PlayerSettings;
  selectedSkin: SkinId;
  unlockedSkins: SkinId[];
  personalBestScore: number;
  records: RunRecord[];
  hasCompletedTutorial: boolean;
}

export interface InputState {
  moveX: number; // -1 to 1
  moveY: number; // -1 to 1
  dashRequested: boolean;
  pulseRequested: boolean;
}
