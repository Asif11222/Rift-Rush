import { GameEngine } from './engine';
import { ARENA_HEIGHT, ARENA_WIDTH } from './levels';
import { SKINS_DATA } from '../storage/gameStorage';
import { SkinId } from '../types/game';

export interface RenderOptions {
  skinId: SkinId;
  highContrast: boolean;
  reducedMotion: boolean;
  shakeOffset: { x: number; y: number };
}

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private animTime: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(engine: GameEngine, options: RenderOptions): void {
    const ctx = this.ctx;
    this.animTime += 0.016;

    ctx.save();

    // Apply camera shake if enabled
    if (!options.reducedMotion && (options.shakeOffset.x !== 0 || options.shakeOffset.y !== 0)) {
      ctx.translate(options.shakeOffset.x, options.shakeOffset.y);
    }

    // 1. Background arena
    this.renderBackground(options);

    // 2. Obstacles / Walls
    this.renderObstacles(engine, options);

    // 3. Patrol Drone Paths
    this.renderPatrolPaths(engine, options);

    // 4. Laser Lanes
    this.renderLaserLanes(engine, options);

    // 5. Portal
    this.renderPortal(engine, options);

    // 6. Collectibles (Cores & Shards)
    this.renderCollectibles(engine, options);

    // 7. Enemies (Chasers & Patrol Drones)
    this.renderEnemies(engine, options);

    // 8. Player Nova & Dash Trails
    this.renderPlayer(engine, options);

    // 9. Time Pulse Vignette / Distortion
    if (engine.player.pulseActiveTimer > 0) {
      this.renderPulseEffect(engine, options);
    }

    // 10. Locked Portal Warning Overlay
    if (engine.lockedPortalNoticeTimer > 0) {
      this.renderLockedPortalNotice(engine);
    }

    ctx.restore();
  }

  private renderBackground(options: RenderOptions): void {
    const ctx = this.ctx;

    // Deep space-void backdrop
    ctx.fillStyle = options.highContrast ? '#040710' : '#080C18';
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

    // Subtle isometric/orthogonal sci-fi grid
    const gridSize = 40;
    ctx.strokeStyle = options.highContrast
      ? 'rgba(0, 229, 255, 0.14)'
      : 'rgba(0, 229, 255, 0.06)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (let x = 0; x <= ARENA_WIDTH; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ARENA_HEIGHT);
    }
    for (let y = 0; y <= ARENA_HEIGHT; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(ARENA_WIDTH, y);
    }
    ctx.stroke();

    // Arena Outer Boundary
    ctx.strokeStyle = options.highContrast ? '#00E5FF' : 'rgba(0, 229, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, ARENA_WIDTH - 3, ARENA_HEIGHT - 3);

    // Outer corner indicators
    const cornerSize = 16;
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(4, 4 + cornerSize);
    ctx.lineTo(4, 4);
    ctx.lineTo(4 + cornerSize, 4);
    // Top-right
    ctx.moveTo(ARENA_WIDTH - 4 - cornerSize, 4);
    ctx.lineTo(ARENA_WIDTH - 4, 4);
    ctx.lineTo(ARENA_WIDTH - 4, 4 + cornerSize);
    // Bottom-left
    ctx.moveTo(4, ARENA_HEIGHT - 4 - cornerSize);
    ctx.lineTo(4, ARENA_HEIGHT - 4);
    ctx.lineTo(4 + cornerSize, ARENA_HEIGHT - 4);
    // Bottom-right
    ctx.moveTo(ARENA_WIDTH - 4 - cornerSize, ARENA_HEIGHT - 4);
    ctx.lineTo(ARENA_WIDTH - 4, ARENA_HEIGHT - 4);
    ctx.lineTo(ARENA_WIDTH - 4, ARENA_HEIGHT - 4 - cornerSize);
    ctx.stroke();
  }

  private renderObstacles(engine: GameEngine, options: RenderOptions): void {
    const ctx = this.ctx;

    for (const obs of engine.obstacles) {
      // Base pillar fill
      ctx.fillStyle = options.highContrast ? '#111827' : '#0F172A';
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

      // Border glow
      ctx.strokeStyle = options.highContrast
        ? '#38BDF8'
        : 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(obs.x + 1, obs.y + 1, obs.w - 2, obs.h - 2);

      // Tech circuit line inside obstacle
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(obs.x + 8, obs.y + 8);
      ctx.lineTo(obs.x + obs.w - 8, obs.y + obs.h - 8);
      ctx.moveTo(obs.x + obs.w - 8, obs.y + 8);
      ctx.lineTo(obs.x + 8, obs.y + obs.h - 8);
      ctx.stroke();

      // Corner accent dots
      ctx.fillStyle = '#00E5FF';
      ctx.fillRect(obs.x + 3, obs.y + 3, 2, 2);
      ctx.fillRect(obs.x + obs.w - 5, obs.y + 3, 2, 2);
      ctx.fillRect(obs.x + 3, obs.y + obs.h - 5, 2, 2);
      ctx.fillRect(obs.x + obs.w - 5, obs.y + obs.h - 5, 2, 2);
    }
  }

  private renderPatrolPaths(engine: GameEngine, options: RenderOptions): void {
    const ctx = this.ctx;

    for (const drone of engine.patrolDrones) {
      if (drone.waypoints.length < 2) continue;

      ctx.save();
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = options.highContrast
        ? 'rgba(155, 92, 255, 0.5)'
        : 'rgba(155, 92, 255, 0.25)';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(drone.waypoints[0].x, drone.waypoints[0].y);
      for (let i = 1; i < drone.waypoints.length; i++) {
        ctx.lineTo(drone.waypoints[i].x, drone.waypoints[i].y);
      }
      ctx.closePath();
      ctx.stroke();

      // Draw small waypoint nodes
      ctx.setLineDash([]);
      for (const pt of drone.waypoints) {
        ctx.fillStyle = 'rgba(155, 92, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderLaserLanes(engine: GameEngine, options: RenderOptions): void {
    const ctx = this.ctx;

    for (const lane of engine.laserLanes) {
      // Terminal emitters
      ctx.fillStyle = '#475569';
      ctx.fillRect(lane.x1 - 6, lane.y1 - 6, 12, 12);
      ctx.fillRect(lane.x2 - 6, lane.y2 - 6, 12, 12);

      if (lane.state === 'inactive') {
        // Faint safe line
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 90, 117, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lane.x1, lane.y1);
        ctx.lineTo(lane.x2, lane.y2);
        ctx.stroke();
        ctx.restore();
      } else if (lane.state === 'warning') {
        // Warning: Dashed amber/red lane with flashing rate
        const flash = Math.sin(this.animTime * 18) > 0;
        ctx.save();
        ctx.setLineDash([8, 6]);
        ctx.strokeStyle = flash
          ? (options.highContrast ? '#FFD166' : 'rgba(255, 209, 102, 0.9)')
          : 'rgba(255, 90, 117, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(lane.x1, lane.y1);
        ctx.lineTo(lane.x2, lane.y2);
        ctx.stroke();

        // Warning emitter indicator
        ctx.fillStyle = '#FFD166';
        ctx.beginPath();
        ctx.arc(lane.x1, lane.y1, 4, 0, Math.PI * 2);
        ctx.arc(lane.x2, lane.y2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (lane.state === 'active') {
        // Active beam: Lethal solid red/neon beam
        ctx.save();
        // Outer glow
        ctx.strokeStyle = options.highContrast
          ? 'rgba(255, 90, 117, 0.8)'
          : 'rgba(255, 90, 117, 0.5)';
        ctx.lineWidth = lane.thickness + 6;
        ctx.beginPath();
        ctx.moveTo(lane.x1, lane.y1);
        ctx.lineTo(lane.x2, lane.y2);
        ctx.stroke();

        // Inner hot core
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = lane.thickness / 2;
        ctx.beginPath();
        ctx.moveTo(lane.x1, lane.y1);
        ctx.lineTo(lane.x2, lane.y2);
        ctx.stroke();

        // Lethal emitter flare
        ctx.fillStyle = '#FF5A75';
        ctx.beginPath();
        ctx.arc(lane.x1, lane.y1, 7, 0, Math.PI * 2);
        ctx.arc(lane.x2, lane.y2, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  private renderPortal(engine: GameEngine, options: RenderOptions): void {
    const ctx = this.ctx;
    const p = engine.portal;

    ctx.save();
    ctx.translate(p.x, p.y);

    if (p.unlocked) {
      // UNLOCKED: Rotating dimensional vortex
      const rot = this.animTime * 2.5;
      const pulse = 1 + Math.sin(this.animTime * 6) * 0.08;

      // Outer aura
      const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, p.radius * 1.5);
      grad.addColorStop(0, 'rgba(0, 229, 255, 0.8)');
      grad.addColorStop(0.6, 'rgba(155, 92, 255, 0.4)');
      grad.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Spinning spiral vortex rings
      ctx.rotate(rot);
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.strokeStyle = i % 2 === 0 ? '#00E5FF' : '#9B5CFF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, (p.radius - 2) * pulse, 0, Math.PI * 0.6);
        ctx.stroke();
      }

      // Bright event horizon center
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 8 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // "ESCAPE" text above portal
      ctx.rotate(-rot);
      ctx.fillStyle = '#00E5FF';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('EXTRACTION', 0, -p.radius - 8);

      // Route guide particles towards portal
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 12 + Math.sin(this.animTime * 8) * 4, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // LOCKED: Dormant mechanical portal ring
      ctx.strokeStyle = options.highContrast
        ? 'rgba(255, 90, 117, 0.9)'
        : 'rgba(255, 90, 117, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner lock symbol
      ctx.fillStyle = '#FF5A75';
      ctx.fillRect(-6, -2, 12, 8);
      ctx.strokeStyle = '#FF5A75';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -2, 4, Math.PI, 0);
      ctx.stroke();

      // Status text
      ctx.fillStyle = 'rgba(255, 90, 117, 0.85)';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LOCKED', 0, p.radius + 14);
    }

    ctx.restore();
  }

  private renderCollectibles(engine: GameEngine, options: RenderOptions): void {
    const ctx = this.ctx;

    for (const c of engine.collectibles) {
      if (c.collected) continue;

      ctx.save();
      ctx.translate(c.x, c.y);

      if (c.type === 'core') {
        // ENERGY CORE: Pulsing, rotating golden energy matrix
        const pulse = 1 + Math.sin(this.animTime * 5 + c.pulsePhase) * 0.12;
        const rot = this.animTime * 1.8 + c.pulsePhase;

        // Aura
        ctx.fillStyle = options.highContrast
          ? 'rgba(255, 209, 102, 0.35)'
          : 'rgba(255, 209, 102, 0.2)';
        ctx.beginPath();
        ctx.arc(0, 0, c.radius * 1.6 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Outer rotating ring
        ctx.rotate(rot);
        ctx.strokeStyle = '#FFD166';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, c.radius * pulse, 0, Math.PI * 1.5);
        ctx.stroke();

        // Inner glowing core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        // "CORE" label in high contrast
        if (options.highContrast) {
          ctx.rotate(-rot);
          ctx.fillStyle = '#FFD166';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('CORE', 0, c.radius + 10);
        }
      } else {
        // OPTIONAL SHARD: Faceted crystal diamond
        const floatOffset = Math.sin(this.animTime * 4 + c.pulsePhase) * 2;
        const rot = this.animTime * 1.2;

        ctx.translate(0, floatOffset);
        ctx.rotate(rot);

        ctx.fillStyle = '#FFD166';
        ctx.strokeStyle = '#FFAA00';
        ctx.lineWidth = 1.5;

        // Diamond polygon
        ctx.beginPath();
        ctx.moveTo(0, -c.radius);
        ctx.lineTo(c.radius * 0.7, 0);
        ctx.lineTo(0, c.radius);
        ctx.lineTo(-c.radius * 0.7, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  private renderEnemies(engine: GameEngine, options: RenderOptions): void {
    const ctx = this.ctx;

    // 1. Chasers: Aggressive hunter-seekers
    for (const chaser of engine.chasers) {
      ctx.save();
      ctx.translate(chaser.x, chaser.y);
      ctx.rotate(chaser.angle);

      // Warning perimeter in high contrast
      if (options.highContrast) {
        ctx.strokeStyle = '#FF5A75';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, chaser.radius + 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Predator wedge hull
      ctx.fillStyle = '#FF5A75';
      ctx.strokeStyle = '#991B1B';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(chaser.radius, 0);
      ctx.lineTo(-chaser.radius, chaser.radius * 0.8);
      ctx.lineTo(-chaser.radius * 0.5, 0);
      ctx.lineTo(-chaser.radius, -chaser.radius * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing hunter eye
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(chaser.radius * 0.2, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 2. Patrol Drones: Surveillance automata
    for (const drone of engine.patrolDrones) {
      ctx.save();
      ctx.translate(drone.x, drone.y);
      const rot = this.animTime * 2.5;

      // Outer hexagonal rotor ring
      ctx.rotate(rot);
      ctx.strokeStyle = options.highContrast ? '#C084FC' : '#9B5CFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const sides = 6;
      for (let i = 0; i < sides; i++) {
        const a = (i * Math.PI * 2) / sides;
        const px = Math.cos(a) * drone.radius;
        const py = Math.sin(a) * drone.radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      // Inner scanner eye
      ctx.rotate(-rot);
      ctx.fillStyle = '#E879F9';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  private renderPlayer(engine: GameEngine, options: RenderOptions): void {
    const ctx = this.ctx;
    const player = engine.player;
    const skin = SKINS_DATA[options.skinId] || SKINS_DATA.cyan;

    // 1. Render Dash Trails
    for (const tr of player.trail) {
      ctx.save();
      ctx.fillStyle = skin.trailColor;
      ctx.globalAlpha = tr.alpha;
      ctx.beginPath();
      ctx.arc(tr.x, tr.y, tr.radius * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Invulnerability flicker
    const isInvulnerable = player.invulnerabilityTimer > 0;
    if (isInvulnerable) {
      const flicker = Math.floor(player.invulnerabilityTimer * 20) % 2 === 0;
      if (flicker) {
        // Draw protective energy shield ring instead of player sprite
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 3. Player Nova Sprite
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.facingAngle);

    // Dashing halo
    if (player.isDashing) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Outer suit chassis (circle)
    ctx.fillStyle = skin.primaryColor;
    ctx.strokeStyle = skin.secondaryColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Directional courier thruster / pack (behind)
    ctx.fillStyle = skin.secondaryColor;
    ctx.fillRect(-player.radius - 3, -4, 4, 8);

    // Directional visor (front)
    ctx.fillStyle = skin.visorColor;
    ctx.beginPath();
    ctx.arc(player.radius * 0.45, 0, player.radius * 0.45, -Math.PI / 3, Math.PI / 3);
    ctx.lineTo(player.radius * 0.2, 0);
    ctx.closePath();
    ctx.fill();

    // High contrast border
    if (options.highContrast) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 1, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    // 4. In-world health pips above Nova
    const pipWidth = 6;
    const pipSpacing = 3;
    const totalW = player.maxHealth * pipWidth + (player.maxHealth - 1) * pipSpacing;
    const startX = player.x - totalW / 2;
    const pipY = player.y - player.radius - 12;

    for (let i = 0; i < player.maxHealth; i++) {
      const px = startX + i * (pipWidth + pipSpacing);
      const isAlive = i < player.health;

      ctx.fillStyle = isAlive ? '#FF5A75' : '#334155';
      ctx.strokeStyle = isAlive ? '#FF8FA3' : '#1E293B';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.arc(px + pipWidth / 2, pipY, pipWidth / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // 5. Impact flash on damage
    if (player.invulnerabilityTimer > 0.7) {
      // Red flash vignette across screen
      ctx.save();
      ctx.fillStyle = 'rgba(255, 90, 117, 0.22)';
      ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

      // Expanding red damage ring from player
      const waveRadius = (1 - (player.invulnerabilityTimer - 0.7) / 0.3) * 45;
      ctx.strokeStyle = 'rgba(255, 90, 117, 0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius + waveRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  private renderPulseEffect(engine: GameEngine, options: RenderOptions): void {
    const ctx = this.ctx;
    const progress = engine.player.pulseActiveTimer / 2.5;

    ctx.save();
    // Chrono-distortion edge vignette
    const grad = ctx.createRadialGradient(
      ARENA_WIDTH / 2,
      ARENA_HEIGHT / 2,
      200,
      ARENA_WIDTH / 2,
      ARENA_HEIGHT / 2,
      Math.hypot(ARENA_WIDTH, ARENA_HEIGHT) / 2
    );
    grad.addColorStop(0, 'rgba(0, 229, 255, 0)');
    grad.addColorStop(0.85, 'rgba(155, 92, 255, 0.15)');
    grad.addColorStop(1, options.highContrast ? 'rgba(0, 229, 255, 0.4)' : 'rgba(0, 229, 255, 0.25)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

    // Subtle ripple ring expanding
    if (!options.reducedMotion) {
      const rippleRadius = ((1 - progress) * 800) % 500;
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(engine.player.x, engine.player.y, rippleRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderLockedPortalNotice(engine: GameEngine): void {
    const ctx = this.ctx;
    const p = engine.portal;
    const coresRemaining =
      engine.currentSectorDef.requiredCores -
      engine.collectibles.filter((c) => c.type === 'core' && c.collected).length;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#FF5A75';
    ctx.lineWidth = 2;

    const boxW = 200;
    const boxH = 36;
    const boxX = p.x - boxW / 2;
    const boxY = p.y - p.radius - 50;

    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = '#FF5A75';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`PORTAL LOCKED`, p.x, boxY + 15);

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '10px sans-serif';
    ctx.fillText(`COLLECT ${coresRemaining} MORE CORE${coresRemaining > 1 ? 'S' : ''}`, p.x, boxY + 28);

    ctx.restore();
  }
}
