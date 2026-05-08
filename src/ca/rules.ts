// Outer-totalistic rule definitions in B/S notation, keyed by countdown digit.
// Each rule lists the neighbor counts that cause birth (B) or survival (S).

export type Rule = {
  name: string;
  birth: number[];
  survive: number[];
  // Density (0..1) for the random soup that re-seeds the grid when this rule activates.
  seedDensity: number;
  // Some rules churn through cells; we slow tick rate for slower rules to keep visuals legible.
  ticksPerSecond: number;
};

export const RULES: Record<number, Rule> = {
  10: { name: "Conway", birth: [3], survive: [2, 3], seedDensity: 0.18, ticksPerSecond: 12 },
  9: { name: "HighLife", birth: [3, 6], survive: [2, 3], seedDensity: 0.2, ticksPerSecond: 14 },
  8: { name: "Day & Night", birth: [3, 6, 7, 8], survive: [3, 4, 6, 7, 8], seedDensity: 0.42, ticksPerSecond: 12 },
  7: { name: "2x2", birth: [3, 6], survive: [1, 2, 5], seedDensity: 0.22, ticksPerSecond: 14 },
  6: { name: "Seeds", birth: [2], survive: [], seedDensity: 0.08, ticksPerSecond: 18 },
  5: { name: "Diamoeba", birth: [3, 5, 6, 7, 8], survive: [5, 6, 7, 8], seedDensity: 0.48, ticksPerSecond: 10 },
  4: { name: "Maze", birth: [3], survive: [1, 2, 3, 4, 5], seedDensity: 0.05, ticksPerSecond: 14 },
  3: { name: "Replicator", birth: [1, 3, 5, 7], survive: [1, 3, 5, 7], seedDensity: 0.02, ticksPerSecond: 14 },
  2: { name: "Anneal", birth: [4, 6, 7, 8], survive: [3, 5, 6, 7, 8], seedDensity: 0.5, ticksPerSecond: 10 },
  1: { name: "Life Without Death", birth: [3], survive: [0, 1, 2, 3, 4, 5, 6, 7, 8], seedDensity: 0.04, ticksPerSecond: 16 },
};
