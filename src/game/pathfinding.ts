import { ARENA_HEIGHT, ARENA_WIDTH, checkCircleRectCollision } from './levels';
import { Obstacle } from '../types/game';

const CELL_SIZE = 30;
const COLS = Math.floor(ARENA_WIDTH / CELL_SIZE); // 32
const ROWS = Math.floor(ARENA_HEIGHT / CELL_SIZE); // 20
const ENEMY_RADIUS = 13;
const INFLATED_PADDING = ENEMY_RADIUS + 3;

export class NavGrid {
  private blocked: boolean[][];
  private obstacles: Obstacle[];

  constructor(obstacles: Obstacle[]) {
    this.obstacles = obstacles;
    this.blocked = Array.from({ length: COLS }, () => Array(ROWS).fill(false));
    this.bake();
  }

  private bake(): void {
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const cx = c * CELL_SIZE + CELL_SIZE / 2;
        const cy = r * CELL_SIZE + CELL_SIZE / 2;

        if (
          cx - INFLATED_PADDING < 0 ||
          cx + INFLATED_PADDING > ARENA_WIDTH ||
          cy - INFLATED_PADDING < 0 ||
          cy + INFLATED_PADDING > ARENA_HEIGHT
        ) {
          this.blocked[c][r] = true;
          continue;
        }

        for (const obs of this.obstacles) {
          if (checkCircleRectCollision(cx, cy, INFLATED_PADDING, obs)) {
            this.blocked[c][r] = true;
            break;
          }
        }
      }
    }
  }

  public isCellBlocked(c: number, r: number): boolean {
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return true;
    return this.blocked[c][r];
  }

  // Fast line-of-sight check between two points against obstacles
  public hasLineOfSight(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    radius: number = ENEMY_RADIUS
  ): boolean {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) return true;

    const steps = Math.ceil(dist / (CELL_SIZE / 2));
    const stepX = dx / steps;
    const stepY = dy / steps;

    for (let i = 1; i < steps; i++) {
      const cx = x1 + stepX * i;
      const cy = y1 + stepY * i;

      if (
        cx - radius < 0 ||
        cx + radius > ARENA_WIDTH ||
        cy - radius < 0 ||
        cy + radius > ARENA_HEIGHT
      ) {
        return false;
      }

      for (const obs of this.obstacles) {
        if (checkCircleRectCollision(cx, cy, radius, obs)) {
          return false;
        }
      }
    }

    return true;
  }

  // A* pathfinding from start to goal
  public findPath(
    startX: number,
    startY: number,
    goalX: number,
    goalY: number
  ): { x: number; y: number }[] {
    let startC = Math.floor(startX / CELL_SIZE);
    let startR = Math.floor(startY / CELL_SIZE);
    let goalC = Math.floor(goalX / CELL_SIZE);
    let goalR = Math.floor(goalY / CELL_SIZE);

    startC = Math.max(0, Math.min(COLS - 1, startC));
    startR = Math.max(0, Math.min(ROWS - 1, startR));
    goalC = Math.max(0, Math.min(COLS - 1, goalC));
    goalR = Math.max(0, Math.min(ROWS - 1, goalR));

    // If goal cell is inside an obstacle, find nearest unblocked neighbor
    if (this.blocked[goalC][goalR]) {
      let found = false;
      for (let d = 1; d <= 2 && !found; d++) {
        for (let dc = -d; dc <= d && !found; dc++) {
          for (let dr = -d; dr <= d && !found; dr++) {
            const nc = goalC + dc;
            const nr = goalR + dr;
            if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && !this.blocked[nc][nr]) {
              goalC = nc;
              goalR = nr;
              found = true;
            }
          }
        }
      }
      if (!found) return [];
    }

    // If start is blocked, find nearest unblocked
    if (this.blocked[startC][startR]) {
      let found = false;
      for (let d = 1; d <= 2 && !found; d++) {
        for (let dc = -d; dc <= d && !found; dc++) {
          for (let dr = -d; dr <= d && !found; dr++) {
            const nc = startC + dc;
            const nr = startR + dr;
            if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && !this.blocked[nc][nr]) {
              startC = nc;
              startR = nr;
              found = true;
            }
          }
        }
      }
      if (!found) return [];
    }

    if (startC === goalC && startR === goalR) {
      return [{ x: goalX, y: goalY }];
    }

    interface Node {
      c: number;
      r: number;
      g: number;
      h: number;
      f: number;
      parent: Node | null;
    }

    const openList: Node[] = [];
    const closed = new Uint8Array(COLS * ROWS);

    const startNode: Node = {
      c: startC,
      r: startR,
      g: 0,
      h: Math.hypot(goalC - startC, goalR - startR),
      f: 0,
      parent: null,
    };
    startNode.f = startNode.g + startNode.h;
    openList.push(startNode);

    const DIRS = [
      { dc: 1, dr: 0, cost: 1 },
      { dc: -1, dr: 0, cost: 1 },
      { dc: 0, dr: 1, cost: 1 },
      { dc: 0, dr: -1, cost: 1 },
      { dc: 1, dr: 1, cost: 1.414 },
      { dc: -1, dr: 1, cost: 1.414 },
      { dc: 1, dr: -1, cost: 1.414 },
      { dc: -1, dr: -1, cost: 1.414 },
    ];

    let count = 0;
    const MAX_SEARCH_STEPS = 300; // Fast bounded search

    while (openList.length > 0 && count++ < MAX_SEARCH_STEPS) {
      // Find lowest f
      let bestIdx = 0;
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].f < openList[bestIdx].f) {
          bestIdx = i;
        }
      }

      const current = openList.splice(bestIdx, 1)[0];
      const idx = current.c * ROWS + current.r;

      if (current.c === goalC && current.r === goalR) {
        // Reconstruct path
        const waypoints: { x: number; y: number }[] = [];
        let curr: Node | null = current;
        while (curr) {
          waypoints.push({
            x: curr.c * CELL_SIZE + CELL_SIZE / 2,
            y: curr.r * CELL_SIZE + CELL_SIZE / 2,
          });
          curr = curr.parent;
        }
        waypoints.reverse();
        // Replace last waypoint with exact goal coordinates
        if (waypoints.length > 0) {
          waypoints[waypoints.length - 1] = { x: goalX, y: goalY };
        }
        // Remove start point if too close
        if (
          waypoints.length > 1 &&
          Math.hypot(waypoints[0].x - startX, waypoints[0].y - startY) < CELL_SIZE / 2
        ) {
          waypoints.shift();
        }
        return waypoints;
      }

      closed[idx] = 1;

      for (const d of DIRS) {
        const nc = current.c + d.dc;
        const nr = current.r + d.dr;

        if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) continue;
        if (this.blocked[nc][nr]) continue;

        // Diagonal corner cutting check
        if (d.dc !== 0 && d.dr !== 0) {
          if (this.blocked[current.c + d.dc][current.r] || this.blocked[current.c][current.r + d.dr]) {
            continue;
          }
        }

        const nIdx = nc * ROWS + nr;
        if (closed[nIdx]) continue;

        const g = current.g + d.cost;
        const h = Math.hypot(goalC - nc, goalR - nr);
        const f = g + h;

        const existing = openList.find((n) => n.c === nc && n.r === nr);
        if (existing) {
          if (g < existing.g) {
            existing.g = g;
            existing.f = f;
            existing.parent = current;
          }
        } else {
          openList.push({
            c: nc,
            r: nr,
            g,
            h,
            f,
            parent: current,
          });
        }
      }
    }

    // Fallback direct goal if search budget exceeded
    return [{ x: goalX, y: goalY }];
  }
}
