import {
  ChaserEnemy,
  Collectible,
  GameOverDetails,
  InputState,
  LaserLane,
  Obstacle,
  PatrolEnemy,
  Player,
  Portal,
  SectorClearBreakdown,
  SectorDefinition,
  UpgradeCounts,
  UpgradeType,
} from '../types/game';
import {
  ALL_SECTORS,
  ARENA_HEIGHT,
  ARENA_WIDTH,
  checkCircleRectCollision,
  PLAYER_RADIUS,
  TUTORIAL_SECTOR,
} from './levels';
import { NavGrid } from './pathfinding';
import { soundManager } from '../audio/soundManager';

export interface GameEngineCallbacks {
  onSectorCleared: (breakdown: SectorClearBreakdown) => void;
  onGameOver: (details: GameOverDetails) => void;
  onVictory: (
    finalScore: number,
    totalTime: number,
    breakdowns: SectorClearBreakdown[]
  ) => void;
  onLockedPortalTouch?: () => void;
  onScreenShake?: (intensity: number) => void;
}

export class GameEngine {
  public currentSectorIndex: number = 1; // 0 = tutorial, 1..5 = sectors
  public currentSectorDef: SectorDefinition = ALL_SECTORS[0];
  public navGrid: NavGrid | null = null;

  public player: Player;
  public obstacles: Obstacle[] = [];
  public collectibles: Collectible[] = [];
  public chasers: ChaserEnemy[] = [];
  public patrolDrones: PatrolEnemy[] = [];
  public laserLanes: LaserLane[] = [];
  public portal: Portal;

  public remainingTime: number = 90;
  public isRunning: boolean = false;
  public isPaused: boolean = false;
  public isTutorial: boolean = false;

  // Scoring
  public runScore: number = 0;
  public sectorScore: number = 0;
  public takenDamageThisSector: boolean = false;
  public sectorClearBreakdowns: SectorClearBreakdown[] = [];
  public totalActivePlayTime: number = 0;

  // Upgrades
  public upgrades: UpgradeCounts = {
    swiftBoots: 0,
    reinforcedSuit: 0,
    pulseCapacitor: 0,
  };

  public callbacks: GameEngineCallbacks;
  public lockedPortalNoticeTimer: number = 0;
  private resultTriggered: boolean = false;
  private dashTrailSpawnTimer: number = 0;

  constructor(callbacks: GameEngineCallbacks) {
    this.callbacks = callbacks;
    this.player = this.createDefaultPlayer();
    this.portal = { x: 800, y: 300, radius: 26, unlocked: false };
  }

  private createDefaultPlayer(): Player {
    const maxHearts = 3 + this.upgrades.reinforcedSuit;
    const baseSpeed = 220;
    const speedMultiplier = 1 + this.upgrades.swiftBoots * 0.08;

    return {
      x: 100,
      y: 300,
      vx: 0,
      vy: 0,
      radius: PLAYER_RADIUS,
      facingAngle: 0,
      health: maxHearts,
      maxHealth: maxHearts,
      baseSpeed,
      currentSpeed: baseSpeed * speedMultiplier,
      invulnerabilityTimer: 0,
      isDashing: false,
      dashDurationTimer: 0,
      dashCooldownTimer: 0,
      pulseActiveTimer: 0,
      pulseCooldownTimer: 0,
      trail: [],
    };
  }

  public getPulseCooldownDuration(): number {
    return Math.max(6, 10 - this.upgrades.pulseCapacitor * 2);
  }

  public startRun(): void {
    this.runScore = 0;
    this.sectorClearBreakdowns = [];
    this.totalActivePlayTime = 0;
    this.upgrades = {
      swiftBoots: 0,
      reinforcedSuit: 0,
      pulseCapacitor: 0,
    };
    this.loadSector(1);
  }

  public startTutorial(): void {
    this.runScore = 0;
    this.sectorClearBreakdowns = [];
    this.totalActivePlayTime = 0;
    this.upgrades = {
      swiftBoots: 0,
      reinforcedSuit: 0,
      pulseCapacitor: 0,
    };
    this.loadSector(0);
  }

  public loadSector(sectorNum: number): void {
    this.currentSectorIndex = sectorNum;
    this.isTutorial = sectorNum === 0;
    this.resultTriggered = false;
    this.takenDamageThisSector = false;
    this.sectorScore = 0;
    this.lockedPortalNoticeTimer = 0;

    const sectorDef = this.isTutorial
      ? TUTORIAL_SECTOR
      : ALL_SECTORS[sectorNum - 1] || ALL_SECTORS[0];
    this.currentSectorDef = sectorDef;

    this.remainingTime = sectorDef.countdownSeconds;
    this.obstacles = [...sectorDef.obstacles];
    this.navGrid = new NavGrid(this.obstacles);

    // Setup player
    const maxHearts = 3 + this.upgrades.reinforcedSuit;
    const speedMultiplier = 1 + this.upgrades.swiftBoots * 0.08;

    this.player = {
      x: sectorDef.playerStart.x,
      y: sectorDef.playerStart.y,
      vx: 0,
      vy: 0,
      radius: PLAYER_RADIUS,
      facingAngle: 0,
      health: maxHearts,
      maxHealth: maxHearts,
      baseSpeed: 220,
      currentSpeed: 220 * speedMultiplier,
      invulnerabilityTimer: 0,
      isDashing: false,
      dashDurationTimer: 0,
      dashCooldownTimer: 0,
      pulseActiveTimer: 0,
      pulseCooldownTimer: 0,
      trail: [],
    };

    // Setup Portal
    this.portal = {
      x: sectorDef.portalPos.x,
      y: sectorDef.portalPos.y,
      radius: 26,
      unlocked: false,
    };

    // Setup Collectibles
    this.collectibles = [];
    sectorDef.cores.forEach((pos, idx) => {
      this.collectibles.push({
        id: `core-${idx}`,
        x: pos.x,
        y: pos.y,
        radius: 12,
        type: 'core',
        collected: false,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    });

    sectorDef.shards.forEach((pos, idx) => {
      this.collectibles.push({
        id: `shard-${idx}`,
        x: pos.x,
        y: pos.y,
        radius: 7,
        type: 'shard',
        collected: false,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    });

    // Setup Chasers
    this.chasers = sectorDef.chaserSpawns.map((pos, idx) => ({
      id: `chaser-${idx}`,
      type: 'chaser',
      x: pos.x,
      y: pos.y,
      radius: 13,
      speed: sectorDef.chaserSpeed,
      angle: 0,
      nextWaypoints: [],
      repathTimer: (idx * 0.08) % 0.3, // Stagger initial path calculations
    }));

    // Setup Patrol Drones
    this.patrolDrones = sectorDef.patrolDrones.map((drone, idx) => ({
      id: `patrol-${idx}`,
      type: 'patrol',
      x: drone.waypoints[0].x,
      y: drone.waypoints[0].y,
      radius: 12,
      speed: 120,
      waypoints: drone.waypoints,
      currentWaypointIndex: 0,
    }));

    // Setup Laser Lanes
    this.laserLanes = sectorDef.laserLanes.map((lane, idx) => ({
      id: `laser-${idx}`,
      x1: lane.x1,
      y1: lane.y1,
      x2: lane.x2,
      y2: lane.y2,
      thickness: 10,
      cycleDuration: 5.0,
      timer: lane.initialOffset % 5.0,
      warningThreshold: 3.0,
      activeThreshold: 4.0,
      state: 'inactive',
    }));

    this.isRunning = true;
    this.isPaused = false;
  }

  public applyUpgrade(upgrade: UpgradeType): void {
    if (upgrade === 'swiftBoots' && this.upgrades.swiftBoots < 2) {
      this.upgrades.swiftBoots++;
    } else if (upgrade === 'reinforcedSuit' && this.upgrades.reinforcedSuit < 2) {
      this.upgrades.reinforcedSuit++;
    } else if (upgrade === 'pulseCapacitor' && this.upgrades.pulseCapacitor < 2) {
      this.upgrades.pulseCapacitor++;
    }
  }

  public getAvailableUpgrades(): {
    type: UpgradeType;
    title: string;
    description: string;
    currentLevel: number;
    maxLevel: number;
    bonusText: string;
  }[] {
    const list: {
      type: UpgradeType;
      title: string;
      description: string;
      currentLevel: number;
      maxLevel: number;
      bonusText: string;
    }[] = [];

    if (this.upgrades.swiftBoots < 2) {
      list.push({
        type: 'swiftBoots',
        title: 'Swift Boots',
        description: '+8% base movement speed',
        currentLevel: this.upgrades.swiftBoots,
        maxLevel: 2,
        bonusText: `Level ${this.upgrades.swiftBoots + 1} / 2 (+${(this.upgrades.swiftBoots + 1) * 8}%)`,
      });
    }

    if (this.upgrades.reinforcedSuit < 2) {
      list.push({
        type: 'reinforcedSuit',
        title: 'Reinforced Suit',
        description: '+1 maximum heart (up to 5)',
        currentLevel: this.upgrades.reinforcedSuit,
        maxLevel: 2,
        bonusText: `Level ${this.upgrades.reinforcedSuit + 1} / 2 (${3 + this.upgrades.reinforcedSuit + 1} Hearts)`,
      });
    }

    if (this.upgrades.pulseCapacitor < 2) {
      list.push({
        type: 'pulseCapacitor',
        title: 'Pulse Capacitor',
        description: '-2s Time Pulse cooldown',
        currentLevel: this.upgrades.pulseCapacitor,
        maxLevel: 2,
        bonusText: `Level ${this.upgrades.pulseCapacitor + 1} / 2 (${10 - (this.upgrades.pulseCapacitor + 1) * 2}s Cooldown)`,
      });
    }

    return list;
  }

  public update(rawDt: number, input: InputState): void {
    if (!this.isRunning || this.isPaused || this.resultTriggered) return;

    // Clamp delta time to avoid large jumps (frame drops or tab switching)
    const dt = Math.min(rawDt, 0.05);
    this.totalActivePlayTime += dt;

    if (this.lockedPortalNoticeTimer > 0) {
      this.lockedPortalNoticeTimer -= dt;
    }

    // Advance sector countdown
    if (!this.isTutorial) {
      this.remainingTime -= dt;
      if (this.remainingTime <= 0) {
        this.remainingTime = 0;
        this.triggerGameOver('time');
        return;
      }
    }

    // Update abilities timers
    this.updateAbilities(dt, input);

    // Update Player Movement & Collisions with substepping
    this.updatePlayerMovement(dt, input);

    // Threat speed factor: Time Pulse slows threats to 40% speed
    const isPulseActive = this.player.pulseActiveTimer > 0;
    const threatSpeedFactor = isPulseActive ? 0.4 : 1.0;
    const threatDt = dt * threatSpeedFactor;

    // Update Laser lanes
    this.updateLaserLanes(threatDt);

    // Update Patrol drones
    this.updatePatrolDrones(threatDt);

    // Update Chasers
    this.updateChasers(threatDt);

    // Check Collectibles
    this.checkCollectiblePickups();

    // Check Hazards and Enemy Damage
    this.checkDamageCollisions();

    // Check Portal Collision
    this.checkPortalCollision();
  }

  private updateAbilities(dt: number, input: InputState): void {
    // Dash timers
    if (this.player.isDashing) {
      this.player.dashDurationTimer -= dt;
      if (this.player.dashDurationTimer <= 0) {
        this.player.isDashing = false;
        this.player.dashDurationTimer = 0;
      }
    }
    if (this.player.dashCooldownTimer > 0) {
      this.player.dashCooldownTimer -= dt;
    }

    // Time Pulse timers
    if (this.player.pulseActiveTimer > 0) {
      this.player.pulseActiveTimer -= dt;
    }
    if (this.player.pulseCooldownTimer > 0) {
      this.player.pulseCooldownTimer -= dt;
    }

    // Invulnerability timer
    if (this.player.invulnerabilityTimer > 0) {
      this.player.invulnerabilityTimer -= dt;
    }

    // Ability Requests: Dash
    if (input.dashRequested && this.player.dashCooldownTimer <= 0) {
      this.player.isDashing = true;
      this.player.dashDurationTimer = 0.18; // 0.18 seconds dash
      this.player.dashCooldownTimer = 2.0; // 2 seconds cooldown
      soundManager.playDash();
    }

    // Ability Requests: Time Pulse
    const pulseCdDuration = this.getPulseCooldownDuration();
    if (
      input.pulseRequested &&
      this.player.pulseCooldownTimer <= 0 &&
      this.player.pulseActiveTimer <= 0
    ) {
      this.player.pulseActiveTimer = 2.5; // 2.5 seconds slow
      this.player.pulseCooldownTimer = pulseCdDuration;
      soundManager.playPulse();
      if (this.callbacks.onScreenShake) {
        this.callbacks.onScreenShake(4);
      }
    }

    // Update Player trail points
    for (let i = this.player.trail.length - 1; i >= 0; i--) {
      this.player.trail[i].alpha -= dt * 3.5;
      if (this.player.trail[i].alpha <= 0) {
        this.player.trail.splice(i, 1);
      }
    }

    this.dashTrailSpawnTimer += dt;
    const trailRate = this.player.isDashing ? 0.025 : 0.07;
    if (
      (this.player.isDashing || Math.hypot(this.player.vx, this.player.vy) > 10) &&
      this.dashTrailSpawnTimer >= trailRate
    ) {
      this.dashTrailSpawnTimer = 0;
      this.player.trail.push({
        x: this.player.x,
        y: this.player.y,
        alpha: this.player.isDashing ? 0.8 : 0.35,
        radius: this.player.radius,
        color: this.player.isDashing ? '#FFFFFF' : '#00E5FF',
      });
    }
  }

  private updatePlayerMovement(dt: number, input: InputState): void {
    let mx = input.moveX;
    let my = input.moveY;

    // Normalize diagonal movement
    const len = Math.hypot(mx, my);
    if (len > 0.01) {
      mx /= len;
      my /= len;
      this.player.facingAngle = Math.atan2(my, mx);
    }

    const currentSpeed =
      this.player.currentSpeed * (this.player.isDashing ? 3.0 : 1.0);

    // Compute desired velocity
    if (this.player.isDashing && len <= 0.01) {
      // Stationary dash moves in last facing direction
      this.player.vx = Math.cos(this.player.facingAngle) * currentSpeed;
      this.player.vy = Math.sin(this.player.facingAngle) * currentSpeed;
    } else {
      this.player.vx = mx * currentSpeed;
      this.player.vy = my * currentSpeed;
    }

    // Substepping: 3 substeps prevent tunneling through walls during high-speed dashes
    const substeps = this.player.isDashing ? 3 : 2;
    const subDt = dt / substeps;

    for (let s = 0; s < substeps; s++) {
      // Move X first
      const nextX = this.player.x + this.player.vx * subDt;
      if (!this.checkPlayerCollision(nextX, this.player.y)) {
        this.player.x = nextX;
      }

      // Move Y second (allows smooth wall sliding)
      const nextY = this.player.y + this.player.vy * subDt;
      if (!this.checkPlayerCollision(this.player.x, nextY)) {
        this.player.y = nextY;
      }
    }

    // Boundary clamping
    this.player.x = Math.max(
      this.player.radius,
      Math.min(ARENA_WIDTH - this.player.radius, this.player.x)
    );
    this.player.y = Math.max(
      this.player.radius,
      Math.min(ARENA_HEIGHT - this.player.radius, this.player.y)
    );
  }

  public checkPlayerCollision(cx: number, cy: number): boolean {
    const r = this.player.radius;

    // Bounds check
    if (
      cx - r < 0 ||
      cx + r > ARENA_WIDTH ||
      cy - r < 0 ||
      cy + r > ARENA_HEIGHT
    ) {
      return true;
    }

    // Obstacles check
    for (const obs of this.obstacles) {
      if (checkCircleRectCollision(cx, cy, r, obs)) {
        return true;
      }
    }

    return false;
  }

  private updateLaserLanes(dt: number): void {
    for (const lane of this.laserLanes) {
      lane.timer = (lane.timer + dt) % lane.cycleDuration;

      const oldState = lane.state;
      if (lane.timer < lane.warningThreshold) {
        lane.state = 'inactive';
      } else if (lane.timer < lane.activeThreshold) {
        lane.state = 'warning';
        if (oldState !== 'warning') {
          soundManager.playLaserWarning();
        }
      } else {
        lane.state = 'active';
        if (oldState !== 'active') {
          soundManager.playLaserBeam();
        }
      }
    }
  }

  private updatePatrolDrones(dt: number): void {
    for (const drone of this.patrolDrones) {
      if (drone.waypoints.length === 0) continue;

      const target = drone.waypoints[drone.currentWaypointIndex];
      const dx = target.x - drone.x;
      const dy = target.y - drone.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 4) {
        drone.currentWaypointIndex =
          (drone.currentWaypointIndex + 1) % drone.waypoints.length;
      } else {
        const moveDist = Math.min(dist, drone.speed * dt);
        drone.x += (dx / dist) * moveDist;
        drone.y += (dy / dist) * moveDist;
      }
    }
  }

  private updateChasers(dt: number): void {
    if (!this.navGrid) return;

    for (const chaser of this.chasers) {
      chaser.repathTimer -= dt;

      // Check direct line of sight to Nova
      const hasLOS = this.navGrid.hasLineOfSight(
        chaser.x,
        chaser.y,
        this.player.x,
        this.player.y,
        chaser.radius
      );

      if (hasLOS) {
        // Direct pursuit
        chaser.nextWaypoints = [{ x: this.player.x, y: this.player.y }];
      } else if (chaser.repathTimer <= 0 || chaser.nextWaypoints.length === 0) {
        // Bounded frequency recalculation
        chaser.repathTimer = 0.28 + Math.random() * 0.08;
        chaser.nextWaypoints = this.navGrid.findPath(
          chaser.x,
          chaser.y,
          this.player.x,
          this.player.y
        );
      }

      // Move along waypoints
      if (chaser.nextWaypoints.length > 0) {
        const target = chaser.nextWaypoints[0];
        const dx = target.x - chaser.x;
        const dy = target.y - chaser.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 8) {
          chaser.nextWaypoints.shift();
        } else {
          const moveStep = Math.min(dist, chaser.speed * dt);
          const nx = chaser.x + (dx / dist) * moveStep;
          const ny = chaser.y + (dy / dist) * moveStep;

          chaser.angle = Math.atan2(dy, dx);

          // Obstacle collision check with sliding for enemies
          let canMoveX = true;
          let canMoveY = true;
          for (const obs of this.obstacles) {
            if (checkCircleRectCollision(nx, chaser.y, chaser.radius, obs)) {
              canMoveX = false;
            }
            if (checkCircleRectCollision(chaser.x, ny, chaser.radius, obs)) {
              canMoveY = false;
            }
          }

          if (canMoveX) chaser.x = nx;
          if (canMoveY) chaser.y = ny;
        }
      }
    }
  }

  private checkCollectiblePickups(): void {
    let newlyCollectedCore = false;

    for (const c of this.collectibles) {
      if (c.collected) continue;

      const distSq =
        (this.player.x - c.x) * (this.player.x - c.x) +
        (this.player.y - c.y) * (this.player.y - c.y);
      const combinedRadius = this.player.radius + c.radius;

      if (distSq <= combinedRadius * combinedRadius) {
        c.collected = true;

        if (c.type === 'core') {
          this.runScore += 100;
          this.sectorScore += 100;
          newlyCollectedCore = true;
          soundManager.playCoreCollect();
        } else if (c.type === 'shard') {
          this.runScore += 10;
          this.sectorScore += 10;
          soundManager.playShardCollect();
        }
      }
    }

    // Check if portal unlocks
    if (newlyCollectedCore) {
      const coresCollected = this.collectibles.filter(
        (c) => c.type === 'core' && c.collected
      ).length;
      if (
        coresCollected >= this.currentSectorDef.requiredCores &&
        !this.portal.unlocked
      ) {
        this.portal.unlocked = true;
        soundManager.playPortalUnlocked();
        if (this.callbacks.onScreenShake) {
          this.callbacks.onScreenShake(6);
        }
      }
    }
  }

  private checkDamageCollisions(): void {
    // If dashing or already invulnerable or tutorial, player is immune
    if (
      this.isTutorial ||
      this.player.isDashing ||
      this.player.invulnerabilityTimer > 0
    ) {
      return;
    }

    let tookDamage = false;

    // Chaser contact
    for (const chaser of this.chasers) {
      const dist = Math.hypot(this.player.x - chaser.x, this.player.y - chaser.y);
      if (dist < this.player.radius + chaser.radius) {
        tookDamage = true;
        break;
      }
    }

    // Patrol drone contact
    if (!tookDamage) {
      for (const drone of this.patrolDrones) {
        const dist = Math.hypot(this.player.x - drone.x, this.player.y - drone.y);
        if (dist < this.player.radius + drone.radius) {
          tookDamage = true;
          break;
        }
      }
    }

    // Laser lanes contact
    if (!tookDamage) {
      for (const lane of this.laserLanes) {
        if (lane.state === 'active') {
          // Distance from circle to line segment
          const dist = this.distToSegment(
            this.player.x,
            this.player.y,
            lane.x1,
            lane.y1,
            lane.x2,
            lane.y2
          );
          if (dist < this.player.radius + lane.thickness / 2) {
            tookDamage = true;
            break;
          }
        }
      }
    }

    if (tookDamage) {
      this.player.health -= 1;
      this.takenDamageThisSector = true;
      this.player.invulnerabilityTimer = 1.0; // 1 second invulnerability
      soundManager.playDamage();

      if (this.callbacks.onScreenShake) {
        this.callbacks.onScreenShake(8);
      }

      if (this.player.health <= 0) {
        this.player.health = 0;
        this.triggerGameOver('health');
      }
    }
  }

  private distToSegment(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  private checkPortalCollision(): void {
    if (this.resultTriggered) return;

    const dist = Math.hypot(
      this.player.x - this.portal.x,
      this.player.y - this.portal.y
    );

    if (dist <= this.player.radius + this.portal.radius) {
      if (this.portal.unlocked) {
        // Successful extraction!
        this.triggerSectorCleared();
      } else {
        // Locked portal feedback
        if (this.lockedPortalNoticeTimer <= 0) {
          this.lockedPortalNoticeTimer = 2.0;
          soundManager.playLockedBuzz();
          if (this.callbacks.onLockedPortalTouch) {
            this.callbacks.onLockedPortalTouch();
          }
        }
      }
    }
  }

  private triggerSectorCleared(): void {
    if (this.resultTriggered) return;
    this.resultTriggered = true;
    this.isRunning = false;
    soundManager.playExtraction();

    if (this.isTutorial) {
      // Complete tutorial
      const breakdown: SectorClearBreakdown = {
        sectorNumber: 0,
        sectorName: 'Simulation Grid',
        corePoints: 100,
        shardPoints: 0,
        extractionBonus: 500,
        remainingSeconds: 999,
        timeBonus: 0,
        noDamageBonus: 0,
        sectorTotal: 600,
        cumulativeTotal: 600,
      };
      this.callbacks.onSectorCleared(breakdown);
      return;
    }

    // Award bonuses
    const extractionBonus = 500;
    const remainingSeconds = Math.max(0, Math.floor(this.remainingTime));
    const timeBonus = remainingSeconds * 5;
    const noDamageBonus = this.takenDamageThisSector ? 0 : 200;

    const sectorBonus = extractionBonus + timeBonus + noDamageBonus;
    this.runScore += sectorBonus;

    const breakdown: SectorClearBreakdown = {
      sectorNumber: this.currentSectorIndex,
      sectorName: this.currentSectorDef.name,
      corePoints: this.currentSectorDef.requiredCores * 100,
      shardPoints: this.sectorScore - this.currentSectorDef.requiredCores * 100,
      extractionBonus,
      remainingSeconds,
      timeBonus,
      noDamageBonus,
      sectorTotal: this.sectorScore + sectorBonus,
      cumulativeTotal: this.runScore,
    };

    this.sectorClearBreakdowns.push(breakdown);

    if (this.currentSectorIndex === 5) {
      // Victory!
      this.callbacks.onVictory(
        this.runScore,
        Math.floor(this.totalActivePlayTime),
        this.sectorClearBreakdowns
      );
    } else {
      this.callbacks.onSectorCleared(breakdown);
    }
  }

  private triggerGameOver(reason: 'health' | 'time'): void {
    if (this.resultTriggered) return;
    this.resultTriggered = true;
    this.isRunning = false;

    const tips = [
      'Use Time Pulse (Q) when entering corridors with laser lanes to slow their cycles.',
      'Dashing grants invulnerability — dash straight through enemy clusters or tight spots.',
      'Cores unlock the portal, but shards provide bonus score if your route permits.',
      'Upgrading Swift Boots helps kite Chasers in later sectors.',
      'Keep moving! Chasers continuously recalculate routes to intercept your position.',
    ];
    const tip = tips[Math.floor(Math.random() * tips.length)];

    this.callbacks.onGameOver({
      reason,
      furthestSector: this.currentSectorIndex,
      finalScore: this.runScore,
      tip,
    });
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
  }
}
