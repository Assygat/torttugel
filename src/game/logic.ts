import type { Level } from '../types';

export interface Tile {
  word: string;
  explanation: string;
  categoryId: string;
}

export const MAX_HINTS = 3;
export const SELECTION_SIZE = 4;
/** Бір топқа берілетін ең көп көмек — топ толық ашылып қалмауы үшін */
export const MAX_HINTS_PER_CATEGORY = 2;

export const POINTS = {
  category: 100,
  mistake: -15,
  hint: -25,
} as const;

export type Rng = () => number;

/** Фишер–Йейтс араластыруы (бастапқы массив өзгермейді) */
export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function buildTiles(level: Level, rng: Rng = Math.random): Tile[] {
  const tiles = level.categories.flatMap((c) =>
    c.words.map((w) => ({ word: w.word, explanation: w.explanation, categoryId: c.id })),
  );
  return shuffle(tiles, rng);
}

export interface GuessResult {
  correct: boolean;
  categoryId: string | null;
  /** Таңдалған сөздердің ең көбі бір топтан нешеуі (3 = «бір сөз қате») */
  bestOverlap: number;
}

export function evaluateGuess(tiles: readonly Tile[], selected: readonly string[]): GuessResult {
  const counts = new Map<string, number>();
  for (const word of selected) {
    const tile = tiles.find((t) => t.word === word);
    if (!tile) continue;
    counts.set(tile.categoryId, (counts.get(tile.categoryId) ?? 0) + 1);
  }
  let bestOverlap = 0;
  let bestId: string | null = null;
  for (const [id, n] of counts) {
    if (n > bestOverlap) {
      bestOverlap = n;
      bestId = id;
    }
  }
  const correct = selected.length === SELECTION_SIZE && bestOverlap === SELECTION_SIZE;
  return { correct, categoryId: correct ? bestId : null, bestOverlap };
}

/** Таңдаудың ретке тәуелсіз кілті — бірдей әрекетті қайталамау үшін */
export const guessKey = (words: readonly string[]) => [...words].sort().join('|');

/**
 * Көмек үшін бір сөз таңдайды: әлі шешілмеген топтардан,
 * ең аз көмек алған топқа басымдық беріп. Бір топтан 2-ден артық сөз ашылмайды.
 */
export function pickHint(
  tiles: readonly Tile[],
  solvedIds: readonly string[],
  hinted: readonly string[],
  rng: Rng = Math.random,
): Tile | null {
  const hintsPerCat = new Map<string, number>();
  for (const word of hinted) {
    const t = tiles.find((x) => x.word === word);
    if (t) hintsPerCat.set(t.categoryId, (hintsPerCat.get(t.categoryId) ?? 0) + 1);
  }
  const candidates = tiles.filter(
    (t) =>
      !solvedIds.includes(t.categoryId) &&
      !hinted.includes(t.word) &&
      (hintsPerCat.get(t.categoryId) ?? 0) < MAX_HINTS_PER_CATEGORY,
  );
  if (!candidates.length) return null;
  const fewest = Math.min(...candidates.map((t) => hintsPerCat.get(t.categoryId) ?? 0));
  const pool = candidates.filter((t) => (hintsPerCat.get(t.categoryId) ?? 0) === fewest);
  return pool[Math.floor(rng() * pool.length)];
}

export function computeScore(solved: number, mistakes: number, hintsUsed: number): number {
  return Math.max(
    0,
    solved * POINTS.category + mistakes * POINTS.mistake + hintsUsed * POINTS.hint,
  );
}
