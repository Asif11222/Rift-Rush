import { Obstacle, SectorDefinition } from '../types/game';

export const ARENA_WIDTH = 960;
export const ARENA_HEIGHT = 600;
export const PLAYER_RADIUS = 14;

// Tutorial safe practice arena
export const TUTORIAL_SECTOR: SectorDefinition = {
  sectorNumber: 0,
  name: 'Sector 0: Simulation Grid',
  tagline: 'Courier training & systems diagnostic',
  requiredCores: 1,
  countdownSeconds: 999,
  chaserSpeed: 0,
  playerStart: { x: 120, y: 300 },
  portalPos: { x: 840, y: 300 },
  obstacles: [
    // Top & bottom perimeter inner pillars
    { x: 300, y: 100, w: 60, h: 140 },
    { x: 300, y: 360, w: 60, h: 140 },
    { x: 620, y: 100, w: 60, h: 140 },
    { x: 620, y: 360, w: 60, h: 140 },
  ],
  cores: [{ x: 480, y: 300 }],
  shards: [
    { x: 220, y: 200 },
    { x: 220, y: 400 },
    { x: 480, y: 160 },
    { x: 480, y: 440 },
    { x: 720, y: 200 },
    { x: 720, y: 400 },
  ],
  chaserSpawns: [],
  patrolDrones: [],
  laserLanes: [],
};

// Sector 1: Neon Docks
// 3 required cores, 90s countdown, 2 chasers (speed 100). Open routes, wide passages (>= 70 units).
export const SECTOR_1: SectorDefinition = {
  sectorNumber: 1,
  name: 'Sector 1 — Neon Docks',
  tagline: 'Cargo bay telemetry collapsed. Retrieve docking cores.',
  requiredCores: 3,
  countdownSeconds: 90,
  chaserSpeed: 100,
  playerStart: { x: 100, y: 300 },
  portalPos: { x: 860, y: 300 },
  obstacles: [
    // Center divider blocks leaving wide corridors (> 90 units)
    { x: 260, y: 120, w: 80, h: 120 },
    { x: 260, y: 360, w: 80, h: 120 },
    { x: 460, y: 220, w: 80, h: 160 },
    { x: 640, y: 120, w: 80, h: 120 },
    { x: 640, y: 360, w: 80, h: 120 },
  ],
  cores: [
    { x: 300, y: 300 },
    { x: 500, y: 120 },
    { x: 680, y: 300 },
  ],
  shards: [
    { x: 160, y: 160 },
    { x: 160, y: 440 },
    { x: 380, y: 160 },
    { x: 380, y: 440 },
    { x: 500, y: 480 },
    { x: 580, y: 220 },
    { x: 580, y: 380 },
    { x: 760, y: 160 },
    { x: 760, y: 440 },
    { x: 860, y: 160 },
  ],
  chaserSpawns: [
    { x: 780, y: 100 },
    { x: 780, y: 500 },
  ],
  patrolDrones: [],
  laserLanes: [],
};

// Sector 2: Circuit Bazaar
// 4 required cores, 100s, 2 chasers (speed 110), 2 patrol drones (speed 120).
// Market block layout with passages >= 64 units.
export const SECTOR_2: SectorDefinition = {
  sectorNumber: 2,
  name: 'Sector 2 — Circuit Bazaar',
  tagline: 'High-density trading terminals. Heavy automated drone sweeps.',
  requiredCores: 4,
  countdownSeconds: 100,
  chaserSpeed: 110,
  playerStart: { x: 90, y: 90 },
  portalPos: { x: 860, y: 510 },
  obstacles: [
    { x: 200, y: 80, w: 100, h: 140 },
    { x: 200, y: 380, w: 100, h: 140 },
    { x: 420, y: 140, w: 120, h: 120 },
    { x: 420, y: 340, w: 120, h: 120 },
    { x: 660, y: 80, w: 100, h: 140 },
    { x: 660, y: 380, w: 100, h: 140 },
  ],
  cores: [
    { x: 130, y: 500 },
    { x: 360, y: 300 },
    { x: 600, y: 300 },
    { x: 830, y: 100 },
  ],
  shards: [
    { x: 90, y: 280 },
    { x: 250, y: 290 },
    { x: 360, y: 100 },
    { x: 360, y: 500 },
    { x: 480, y: 60 },
    { x: 480, y: 540 },
    { x: 600, y: 100 },
    { x: 600, y: 500 },
    { x: 720, y: 290 },
    { x: 870, y: 300 },
  ],
  chaserSpawns: [
    { x: 480, y: 300 },
    { x: 840, y: 200 },
  ],
  patrolDrones: [
    {
      waypoints: [
        { x: 140, y: 280 },
        { x: 360, y: 280 },
        { x: 360, y: 440 },
        { x: 140, y: 440 },
      ],
    },
    {
      waypoints: [
        { x: 600, y: 160 },
        { x: 820, y: 160 },
        { x: 820, y: 320 },
        { x: 600, y: 320 },
      ],
    },
  ],
  laserLanes: [],
};

// Sector 3: Echo Foundry
// 4 required cores, 105s, 3 chasers (speed 120), 2 patrol drones (speed 120), 1 laser lane.
export const SECTOR_3: SectorDefinition = {
  sectorNumber: 3,
  name: 'Sector 3 — Echo Foundry',
  tagline: 'Molten plasma conduits active. Beware timed containment lasers.',
  requiredCores: 4,
  countdownSeconds: 105,
  chaserSpeed: 120,
  playerStart: { x: 100, y: 500 },
  portalPos: { x: 860, y: 100 },
  obstacles: [
    { x: 180, y: 160, w: 90, h: 220 },
    { x: 350, y: 70, w: 80, h: 180 },
    { x: 350, y: 350, w: 80, h: 180 },
    { x: 540, y: 160, w: 90, h: 220 },
    { x: 710, y: 70, w: 80, h: 180 },
    { x: 710, y: 350, w: 80, h: 180 },
  ],
  cores: [
    { x: 100, y: 100 },
    { x: 270, y: 460 },
    { x: 450, y: 300 },
    { x: 630, y: 120 },
  ],
  shards: [
    { x: 100, y: 300 },
    { x: 260, y: 90 },
    { x: 450, y: 140 },
    { x: 450, y: 460 },
    { x: 540, y: 70 },
    { x: 540, y: 530 },
    { x: 630, y: 480 },
    { x: 800, y: 300 },
    { x: 860, y: 460 },
    { x: 860, y: 280 },
  ],
  chaserSpawns: [
    { x: 450, y: 90 },
    { x: 630, y: 300 },
    { x: 860, y: 350 },
  ],
  patrolDrones: [
    {
      waypoints: [
        { x: 100, y: 200 },
        { x: 100, y: 380 },
        { x: 270, y: 380 },
        { x: 270, y: 200 },
      ],
    },
    {
      waypoints: [
        { x: 720, y: 280 },
        { x: 860, y: 280 },
        { x: 860, y: 420 },
        { x: 720, y: 420 },
      ],
    },
  ],
  laserLanes: [
    // Vertical beam through center corridor between obstacles, 3s off, 1s warn, 1s on
    {
      x1: 490,
      y1: 50,
      x2: 490,
      y2: 550,
      initialOffset: 0,
    },
  ],
};

// Sector 4: Prism Vault
// 5 required cores, 110s, 3 chasers (speed 130), 3 patrol drones (speed 120), 2 laser lanes.
export const SECTOR_4: SectorDefinition = {
  sectorNumber: 4,
  name: 'Sector 4 — Prism Vault',
  tagline: 'Reflective optical labyrinth. Timed laser grids and high-speed interception.',
  requiredCores: 5,
  countdownSeconds: 110,
  chaserSpeed: 130,
  playerStart: { x: 100, y: 300 },
  portalPos: { x: 860, y: 300 },
  obstacles: [
    // Maze-like prisms with passage width >= 64
    { x: 180, y: 80, w: 90, h: 140 },
    { x: 180, y: 380, w: 90, h: 140 },
    { x: 340, y: 180, w: 80, h: 240 },
    { x: 500, y: 80, w: 80, h: 140 },
    { x: 500, y: 380, w: 80, h: 140 },
    { x: 650, y: 180, w: 80, h: 240 },
  ],
  cores: [
    { x: 130, y: 100 },
    { x: 130, y: 500 },
    { x: 420, y: 300 },
    { x: 760, y: 100 },
    { x: 760, y: 500 },
  ],
  shards: [
    { x: 260, y: 260 },
    { x: 260, y: 340 },
    { x: 340, y: 90 },
    { x: 340, y: 510 },
    { x: 500, y: 260 },
    { x: 500, y: 340 },
    { x: 590, y: 120 },
    { x: 590, y: 480 },
    { x: 740, y: 300 },
    { x: 860, y: 140 },
  ],
  chaserSpawns: [
    { x: 420, y: 100 },
    { x: 420, y: 500 },
    { x: 820, y: 420 },
  ],
  patrolDrones: [
    {
      waypoints: [
        { x: 110, y: 180 },
        { x: 260, y: 180 },
        { x: 260, y: 80 },
        { x: 110, y: 80 },
      ],
    },
    {
      waypoints: [
        { x: 500, y: 250 },
        { x: 600, y: 250 },
        { x: 600, y: 350 },
        { x: 500, y: 350 },
      ],
    },
    {
      waypoints: [
        { x: 770, y: 200 },
        { x: 880, y: 200 },
        { x: 880, y: 400 },
        { x: 770, y: 400 },
      ],
    },
  ],
  laserLanes: [
    // Staggered lasers
    {
      x1: 280,
      y1: 60,
      x2: 280,
      y2: 540,
      initialOffset: 0,
    },
    {
      x1: 600,
      y1: 60,
      x2: 600,
      y2: 540,
      initialOffset: 2.5, // 2.5s offset ensures alternating safe crossing window
    },
  ],
};

// Sector 5: Rift Heart
// 5 required cores, 120s, 4 chasers (speed 140), 3 patrol drones (speed 120), 3 laser lanes.
// Pinnacle challenge combining all mechanics. Clear routes, high adrenaline.
export const SECTOR_5: SectorDefinition = {
  sectorNumber: 5,
  name: 'Sector 5 — Rift Heart',
  tagline: 'Dimensional core singularity destabilizing. Maximum evasion protocol.',
  requiredCores: 5,
  countdownSeconds: 120,
  chaserSpeed: 140,
  playerStart: { x: 80, y: 80 },
  portalPos: { x: 880, y: 520 },
  obstacles: [
    // Four corner bastion pillars + central hub with ample corridors
    { x: 170, y: 160, w: 90, h: 90 },
    { x: 170, y: 350, w: 90, h: 90 },
    { x: 420, y: 110, w: 120, h: 90 },
    { x: 420, y: 400, w: 120, h: 90 },
    { x: 700, y: 160, w: 90, h: 90 },
    { x: 700, y: 350, w: 90, h: 90 },
  ],
  cores: [
    { x: 100, y: 500 },
    { x: 480, y: 300 },
    { x: 860, y: 80 },
    { x: 260, y: 260 },
    { x: 700, y: 280 },
  ],
  shards: [
    { x: 80, y: 280 },
    { x: 290, y: 120 },
    { x: 290, y: 480 },
    { x: 380, y: 260 },
    { x: 380, y: 340 },
    { x: 580, y: 260 },
    { x: 580, y: 340 },
    { x: 670, y: 120 },
    { x: 670, y: 480 },
    { x: 880, y: 300 },
  ],
  chaserSpawns: [
    { x: 480, y: 80 },
    { x: 480, y: 520 },
    { x: 800, y: 220 },
    { x: 800, y: 420 },
  ],
  patrolDrones: [
    {
      waypoints: [
        { x: 120, y: 240 },
        { x: 120, y: 360 },
        { x: 280, y: 360 },
        { x: 280, y: 240 },
      ],
    },
    {
      waypoints: [
        { x: 340, y: 220 },
        { x: 620, y: 220 },
        { x: 620, y: 380 },
        { x: 340, y: 380 },
      ],
    },
    {
      waypoints: [
        { x: 680, y: 80 },
        { x: 840, y: 80 },
        { x: 840, y: 240 },
        { x: 680, y: 240 },
      ],
    },
  ],
  laserLanes: [
    // 3 staggered laser barriers
    {
      x1: 310,
      y1: 40,
      x2: 310,
      y2: 560,
      initialOffset: 0,
    },
    {
      x1: 480,
      y1: 40,
      x2: 480,
      y2: 560,
      initialOffset: 1.7,
    },
    {
      x1: 650,
      y1: 40,
      x2: 650,
      y2: 560,
      initialOffset: 3.4,
    },
  ],
};

export const ALL_SECTORS: SectorDefinition[] = [
  SECTOR_1,
  SECTOR_2,
  SECTOR_3,
  SECTOR_4,
  SECTOR_5,
];

// Helper to check circle-AABB overlap
export function checkCircleRectCollision(
  cx: number,
  cy: number,
  radius: number,
  rect: Obstacle
): boolean {
  const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy < radius * radius;
}

// Reachability validator using BFS on an inflated grid (cell size 20x20)
export function validateSectorReachability(sector: SectorDefinition): {
  valid: boolean;
  unreachableCores: number[];
  portalReachable: boolean;
} {
  const cellSize = 20;
  const cols = Math.floor(ARENA_WIDTH / cellSize);
  const rows = Math.floor(ARENA_HEIGHT / cellSize);
  const inflatedRadius = PLAYER_RADIUS + 4; // safety padding

  // Build grid: false = free, true = blocked
  const grid: boolean[][] = Array.from({ length: cols }, () =>
    Array(rows).fill(false)
  );

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const px = c * cellSize + cellSize / 2;
      const py = r * cellSize + cellSize / 2;

      // Arena boundary check with player radius
      if (
        px - inflatedRadius < 0 ||
        px + inflatedRadius > ARENA_WIDTH ||
        py - inflatedRadius < 0 ||
        py + inflatedRadius > ARENA_HEIGHT
      ) {
        grid[c][r] = true;
        continue;
      }

      // Obstacle check
      for (const obs of sector.obstacles) {
        if (checkCircleRectCollision(px, py, inflatedRadius, obs)) {
          grid[c][r] = true;
          break;
        }
      }
    }
  }

  // BFS from playerStart
  const startCol = Math.floor(sector.playerStart.x / cellSize);
  const startRow = Math.floor(sector.playerStart.y / cellSize);
  const visited: boolean[][] = Array.from({ length: cols }, () =>
    Array(rows).fill(false)
  );

  const queue: [number, number][] = [];
  if (grid[startCol] && !grid[startCol][startRow]) {
    visited[startCol][startRow] = true;
    queue.push([startCol, startRow]);
  } else {
    // If exact start is inside boundary, find nearest free cell
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        const nc = startCol + dc;
        const nr = startRow + dr;
        if (nc >= 0 && nc < cols && nr >= 0 && nr < rows && !grid[nc][nr]) {
          visited[nc][nr] = true;
          queue.push([nc, nr]);
          break;
        }
      }
      if (queue.length > 0) break;
    }
  }

  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  while (queue.length > 0) {
    const [cc, cr] = queue.shift()!;
    for (const [dc, dr] of dirs) {
      const nc = cc + dc;
      const nr = cr + dr;
      if (
        nc >= 0 &&
        nc < cols &&
        nr >= 0 &&
        nr < rows &&
        !grid[nc][nr] &&
        !visited[nc][nr]
      ) {
        visited[nc][nr] = true;
        queue.push([nc, nr]);
      }
    }
  }

  // Check cores
  const unreachableCores: number[] = [];
  sector.cores.forEach((core, idx) => {
    const cCol = Math.floor(core.x / cellSize);
    const cRow = Math.floor(core.y / cellSize);
    let reachable = visited[cCol] && visited[cCol][cRow];
    if (!reachable) {
      // Check 1 cell neighborhood in case core center is near edge of cell
      for (let dc = -1; dc <= 1; dc++) {
        for (let dr = -1; dr <= 1; dr++) {
          const nc = cCol + dc;
          const nr = cRow + dr;
          if (nc >= 0 && nc < cols && nr >= 0 && nr < rows && visited[nc][nr]) {
            reachable = true;
            break;
          }
        }
        if (reachable) break;
      }
    }
    if (!reachable) {
      unreachableCores.push(idx);
    }
  });

  // Check portal
  const pCol = Math.floor(sector.portalPos.x / cellSize);
  const pRow = Math.floor(sector.portalPos.y / cellSize);
  let portalReachable = visited[pCol] && visited[pCol][pRow];
  if (!portalReachable) {
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        const nc = pCol + dc;
        const nr = pRow + dr;
        if (nc >= 0 && nc < cols && nr >= 0 && nr < rows && visited[nc][nr]) {
          portalReachable = true;
          break;
        }
      }
      if (portalReachable) break;
    }
  }

  return {
    valid: unreachableCores.length === 0 && portalReachable,
    unreachableCores,
    portalReachable,
  };
}
