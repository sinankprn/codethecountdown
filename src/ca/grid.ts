import type { Rule } from "./rules";

export type Grid = {
  cols: number;
  rows: number;
  cells: Uint8Array; // 1 alive, 0 dead
  next: Uint8Array;
  age: Uint16Array; // generations alive (0 if dead)
  ghost: Uint8Array; // 0..255 fading death glow per cell
};

export function makeGrid(cols: number, rows: number): Grid {
  return {
    cols,
    rows,
    cells: new Uint8Array(cols * rows),
    next: new Uint8Array(cols * rows),
    age: new Uint16Array(cols * rows),
    ghost: new Uint8Array(cols * rows),
  };
}

export function seedRandom(grid: Grid, density: number): void {
  const { cells, age, ghost } = grid;
  for (let i = 0; i < cells.length; i++) {
    const alive = Math.random() < density ? 1 : 0;
    cells[i] = alive;
    age[i] = alive;
    ghost[i] = 0;
  }
}

export function clearGrid(grid: Grid): void {
  grid.cells.fill(0);
  grid.next.fill(0);
  grid.age.fill(0);
  grid.ghost.fill(0);
}

// Stamp a 2D pattern (rows of strings: '#' alive, '.' dead) at (cx, cy) center.
export function stamp(grid: Grid, pattern: string[], cx: number, cy: number): void {
  const h = pattern.length;
  const w = Math.max(...pattern.map((r) => r.length));
  const x0 = cx - Math.floor(w / 2);
  const y0 = cy - Math.floor(h / 2);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < pattern[y].length; x++) {
      if (pattern[y][x] === "#") {
        const xx = x0 + x;
        const yy = y0 + y;
        if (xx >= 0 && xx < grid.cols && yy >= 0 && yy < grid.rows) {
          const idx = yy * grid.cols + xx;
          grid.cells[idx] = 1;
          grid.age[idx] = 1;
        }
      }
    }
  }
}

// Returns array of newly-born cell indices for the audio engine.
export function tick(grid: Grid, rule: Rule): number[] {
  const { cols, rows, cells, next, age, ghost } = grid;
  const births: number[] = [];

  // Pre-compute birth/survive lookup tables (8 neighbors max → 9 entries 0..8)
  const bTable = new Uint8Array(9);
  const sTable = new Uint8Array(9);
  for (const b of rule.birth) bTable[b] = 1;
  for (const s of rule.survive) sTable[s] = 1;

  for (let y = 0; y < rows; y++) {
    const yUp = y === 0 ? rows - 1 : y - 1;
    const yDn = y === rows - 1 ? 0 : y + 1;
    const rowU = yUp * cols;
    const rowM = y * cols;
    const rowD = yDn * cols;
    for (let x = 0; x < cols; x++) {
      const xL = x === 0 ? cols - 1 : x - 1;
      const xR = x === cols - 1 ? 0 : x + 1;
      const n =
        cells[rowU + xL] + cells[rowU + x] + cells[rowU + xR] +
        cells[rowM + xL] + cells[rowM + xR] +
        cells[rowD + xL] + cells[rowD + x] + cells[rowD + xR];

      const idx = rowM + x;
      const alive = cells[idx];
      let nextAlive = 0;
      if (alive) {
        nextAlive = sTable[n];
      } else {
        nextAlive = bTable[n];
      }

      next[idx] = nextAlive;
      if (nextAlive) {
        if (alive) {
          age[idx] = Math.min(age[idx] + 1, 65535);
        } else {
          age[idx] = 1;
          births.push(idx);
        }
        ghost[idx] = 0;
      } else {
        if (alive) {
          ghost[idx] = 220; // fade glow on death
        }
        age[idx] = 0;
      }
    }
  }

  // Decay ghost trails
  for (let i = 0; i < ghost.length; i++) {
    if (!next[i] && ghost[i] > 0) ghost[i] = ghost[i] > 18 ? ghost[i] - 18 : 0;
  }

  // swap buffers
  grid.cells = next;
  grid.next = cells;
  return births;
}
