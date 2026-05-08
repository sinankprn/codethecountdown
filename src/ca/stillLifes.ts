// Stable Conway "still-life" patterns (don't change under B3/S23).
// Used by the Big Bang final composition to spell "I/O" in living cells.

export const BLOCK = [
  "##",
  "##",
];

export const BEEHIVE = [
  ".##.",
  "#..#",
  ".##.",
];

export const LOAF = [
  ".##.",
  "#..#",
  ".#.#",
  "..#.",
];

export const BOAT = [
  "##.",
  "#.#",
  ".#.",
];

export const TUB = [
  ".#.",
  "#.#",
  ".#.",
];

// Pulsar (period-3 oscillator, large + symmetric, looks like fireworks)
export const PULSAR = [
  "..###...###..",
  ".............",
  "#....#.#....#",
  "#....#.#....#",
  "#....#.#....#",
  "..###...###..",
  ".............",
  "..###...###..",
  "#....#.#....#",
  "#....#.#....#",
  "#....#.#....#",
  ".............",
  "..###...###..",
];

// Rough block-letter "I" / "/" / "O" rendered out of still-life building blocks
// with extra padding, so even after a few Conway ticks the structures stay readable.
export const LETTER_I_BLOCKS: { dx: number; dy: number; pattern: string[] }[] = [
  { dx: -2, dy: -8, pattern: BEEHIVE },
  { dx: 0, dy: -3, pattern: BLOCK },
  { dx: 0, dy: 1, pattern: BLOCK },
  { dx: -2, dy: 6, pattern: BEEHIVE },
];

export const LETTER_O_BLOCKS: { dx: number; dy: number; pattern: string[] }[] = [
  { dx: -4, dy: -6, pattern: BEEHIVE },
  { dx: 2, dy: -6, pattern: BEEHIVE },
  { dx: -5, dy: 0, pattern: BLOCK },
  { dx: 4, dy: 0, pattern: BLOCK },
  { dx: -4, dy: 4, pattern: BEEHIVE },
  { dx: 2, dy: 4, pattern: BEEHIVE },
];
