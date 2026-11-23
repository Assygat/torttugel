/** Прогресті браузердің localStorage-іне сақтау (сервер қажет емес). */
export type LevelOrder = 'sequential' | 'random';

export interface Progress {
  /** деңгей id → ең жоғары ұпай */
  completed: Record<number, number>;
  /** соңғы ойналған деңгейдің индексі */
  lastIndex: number;
  order: LevelOrder;
}

const KEY = 'tort-toptau:v1';
const EMPTY: Progress = { completed: {}, lastIndex: 0, order: 'sequential' };

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const data = JSON.parse(raw) as Partial<Progress>;
    return {
      completed: data.completed && typeof data.completed === 'object' ? data.completed : {},
      lastIndex: Number.isInteger(data.lastIndex) ? (data.lastIndex as number) : 0,
      order: data.order === 'random' ? 'random' : 'sequential',
    };
  } catch {
    return { ...EMPTY };
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* жеке режимде сақтау мүмкін болмаса — ойын бәрібір жұмыс істейді */
  }
}
