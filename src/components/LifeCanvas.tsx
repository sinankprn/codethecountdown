import { useEffect, useRef } from "react";
import { RULES, type Rule } from "../ca/rules";
import { type Grid, makeGrid, seedRandom, tick, clearGrid, stamp } from "../ca/grid";
import { R_PENTOMINO } from "../ca/seedPatterns";
import { bus } from "../hooks/useEventBus";
import "./LifeCanvas.css";

const TARGET_COLS = 180;
// If population dips below this fraction of total cells when a digit changes,
// reseed. Otherwise the running pattern is preserved across rule swaps —
// which produces wilder, more organic transitions than reseeding every second.
const RESEED_BELOW = 0.015;

type Props = {
  digit: number;
  phase: "running" | "bigbang" | "settled";
  running: boolean;
  runKey: number;
};

function colorForAge(age: number): [number, number, number] {
  if (age <= 1) return [66, 133, 244];     // IO blue
  if (age <= 3) return [52, 168, 83];      // green
  if (age <= 8) return [251, 188, 4];      // yellow
  return [234, 67, 53];                    // red
}

function population(grid: Grid): number {
  let n = 0;
  const cells = grid.cells;
  for (let i = 0; i < cells.length; i++) n += cells[i];
  return n;
}

export function LifeCanvas({ digit, phase, running, runKey }: Props) {
  const sharpRef = useRef<HTMLCanvasElement>(null);
  const bloomRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<Grid | null>(null);
  const ruleRef = useRef<Rule>(RULES[10]);
  const lastDigitRef = useRef<number>(digit);
  const phaseRef = useRef<string>(phase);
  const tickAccRef = useRef<number>(0);
  const settledAtRef = useRef<number>(0);
  const reducedMotionRef = useRef<boolean>(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { reducedMotionRef.current = mq.matches; };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Resize / build grid for the current viewport.
  useEffect(() => {
    const onResize = () => {
      const sharp = sharpRef.current;
      const bloom = bloomRef.current;
      if (!sharp || !bloom) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cell = Math.max(4, Math.floor(w / TARGET_COLS));
      const cols = Math.floor(w / cell);
      const rows = Math.floor(h / cell);
      sharp.width = cols * cell;
      sharp.height = rows * cell;
      sharp.style.width = `${cols * cell}px`;
      sharp.style.height = `${rows * cell}px`;
      bloom.width = Math.max(1, Math.floor((cols * cell) / 4));
      bloom.height = Math.max(1, Math.floor((rows * cell) / 4));
      bloom.style.width = `${cols * cell}px`;
      bloom.style.height = `${rows * cell}px`;

      const old = gridRef.current;
      const grid = makeGrid(cols, rows);
      if (old) {
        const c = Math.min(old.cols, cols);
        const r = Math.min(old.rows, rows);
        for (let y = 0; y < r; y++) {
          for (let x = 0; x < c; x++) {
            grid.cells[y * cols + x] = old.cells[y * old.cols + x];
            grid.age[y * cols + x] = old.age[y * old.cols + x];
          }
        }
      } else {
        seedRandom(grid, RULES[10].seedDensity);
      }
      gridRef.current = grid;
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Restart wipes the grid and reseeds Conway.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (runKey === 0) return; // first mount handled by resize seed
    clearGrid(grid);
    seedRandom(grid, RULES[10].seedDensity);
    ruleRef.current = RULES[10];
    phaseRef.current = "running";
    settledAtRef.current = 0;
  }, [runKey]);

  // React to digit / phase changes.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    if (phase === "bigbang" && phaseRef.current !== "bigbang") {
      clearGrid(grid);
      const cx = Math.floor(grid.cols / 2);
      const cy = Math.floor(grid.rows / 2);
      // Dense methuselah cluster — many R-pentominoes seeded close together
      // produce an explosive cascade rather than evenly-distributed colonies.
      const offsets: [number, number][] = [
        [0, 0], [-6, -4], [6, -4], [-4, 6], [4, 6], [-10, 0], [10, 0],
        [-14, -8], [14, -8], [-14, 8], [14, 8],
        [-22, -2], [22, -2], [0, -16], [0, 16],
        [-28, -12], [28, -12], [-28, 12], [28, 12],
        [-36, 0], [36, 0], [0, -24], [0, 24],
      ];
      for (const [dx, dy] of offsets) stamp(grid, R_PENTOMINO, cx + dx, cy + dy);
      // Plus a high-density random burst in a wide central oval for chaos energy.
      const burstW = Math.floor(grid.cols * 0.5);
      const burstH = Math.floor(grid.rows * 0.55);
      for (let i = 0; i < 1200; i++) {
        const ang = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * 0.5;
        const sx = cx + Math.floor(Math.cos(ang) * r * burstW);
        const sy = cy + Math.floor(Math.sin(ang) * r * burstH);
        if (sx >= 0 && sx < grid.cols && sy >= 0 && sy < grid.rows) {
          const idx = sy * grid.cols + sx;
          if (!grid.cells[idx]) {
            grid.cells[idx] = 1;
            grid.age[idx] = 1;
          }
        }
      }
      ruleRef.current = RULES[10];
      bus.emit("bigbang", undefined as unknown as void);
    } else if (phase === "settled" && phaseRef.current !== "settled") {
      // The typographic I/O wordmark is the focal point during settled phase.
      // The grid becomes atmospheric: a dense forest of background still-lifes
      // that surrounds (but never overlaps) the wordmark.
      clearGrid(grid);
      const cx = Math.floor(grid.cols / 2);
      const cy = Math.floor(grid.rows / 2);
      const stamps: string[][] = [
        ["##", "##"],                          // block
        [".##.", "#..#", ".##."],              // beehive
        [".##.", "#..#", ".#.#", "..#."],      // loaf
        ["##.", "#.#", ".#."],                 // boat
        [".#.", "#.#", ".#."],                 // tub
      ];
      // Reserve a wide rectangle in the middle for the typographic wordmark.
      const reserveW = Math.floor(grid.cols * 0.5);
      const reserveH = Math.floor(grid.rows * 0.55);
      let placed = 0;
      let attempts = 0;
      while (placed < 140 && attempts < 600) {
        attempts++;
        const sx = Math.floor(Math.random() * grid.cols);
        const sy = Math.floor(Math.random() * grid.rows);
        const dx = sx - cx;
        const dy = sy - cy;
        if (Math.abs(dx) < reserveW / 2 && Math.abs(dy) < reserveH / 2) continue;
        const pat = stamps[Math.floor(Math.random() * stamps.length)];
        stamp(grid, pat, sx, sy);
        placed++;
      }
      settledAtRef.current = performance.now();
    } else if (phase === "running" && digit !== lastDigitRef.current) {
      const rule = RULES[digit] ?? RULES[10];
      ruleRef.current = rule;
      // Smart reseed: keep the existing pattern if there's still meaningful life;
      // only reseed when the field has died (most rules collapse fast).
      if (digit !== 10) {
        const total = grid.cols * grid.rows;
        const pop = population(grid);
        if (pop / total < RESEED_BELOW) {
          seedRandom(grid, rule.seedDensity);
        }
      }
      bus.emit("digit", digit);
    }
    lastDigitRef.current = digit;
    phaseRef.current = phase;
  }, [digit, phase]);

  // Animation loop.
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let prev = performance.now();
    const loop = (now: number) => {
      const dt = now - prev;
      prev = now;
      const grid = gridRef.current;
      const sharp = sharpRef.current;
      const bloom = bloomRef.current;
      if (grid && sharp && bloom) {
        const shouldTick = !reducedMotionRef.current;
        const tps = phaseRef.current === "bigbang" ? 70 : ruleRef.current.ticksPerSecond;
        let ticked = false;
        if (shouldTick) {
          tickAccRef.current += dt;
          const interval = 1000 / tps;
          while (tickAccRef.current >= interval) {
            const births = tick(grid, ruleRef.current);
            tickAccRef.current -= interval;
            ticked = true;
            if (births.length) {
              bus.emit("births", { indices: births, cols: grid.cols, rows: grid.rows });
            }
          }
        }
        if (ticked || phaseRef.current === "bigbang" || phaseRef.current === "settled") {
          render(sharp, bloom, grid);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  return (
    <div className="life">
      <canvas ref={bloomRef} className="life__bloom" />
      <canvas ref={sharpRef} className="life__sharp" />
    </div>
  );
}

function render(sharp: HTMLCanvasElement, bloom: HTMLCanvasElement, grid: Grid) {
  const ctx = sharp.getContext("2d", { alpha: true })!;
  const bctx = bloom.getContext("2d", { alpha: true })!;
  const cell = sharp.width / grid.cols;

  ctx.clearRect(0, 0, sharp.width, sharp.height);
  bctx.clearRect(0, 0, bloom.width, bloom.height);

  const r = Math.max(1, cell * 0.42);

  // Death ghosts.
  for (let i = 0; i < grid.ghost.length; i++) {
    const g = grid.ghost[i];
    if (!g) continue;
    const x = (i % grid.cols) * cell + cell / 2;
    const y = Math.floor(i / grid.cols) * cell + cell / 2;
    ctx.fillStyle = `rgba(234, 67, 53, ${(g / 255) * 0.35})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Live cells.
  for (let i = 0; i < grid.cells.length; i++) {
    if (!grid.cells[i]) continue;
    const age = grid.age[i];
    const [cr, cg, cb] = colorForAge(age);
    const x = (i % grid.cols) * cell + cell / 2;
    const y = Math.floor(i / grid.cols) * cell + cell / 2;
    ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, 0.95)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  bctx.drawImage(sharp, 0, 0, bloom.width, bloom.height);
}
