import type { Level } from '../types';

export const WORDS_PER_CATEGORY = 4;
export const CATEGORIES_PER_LEVEL = 4;
export const MIN_LEVELS = 16;

const LATIN = /[A-Za-z]/;
const DIFFICULTIES = ['Жеңіл', 'Орташа', 'Күрделі'];

const normalize = (s: string) => s.trim().toLocaleLowerCase('kk');

/**
 * Сөздік қорын тексереді. Қате табылса, түсінікті хабарламалар тізімін қайтарады.
 * Бос тізім = бәрі дұрыс.
 */
export function validateLevels(levels: Level[]): string[] {
  const errors: string[] = [];

  if (levels.length < MIN_LEVELS) {
    errors.push(`Деңгей саны кемінде ${MIN_LEVELS} болуы керек, қазір: ${levels.length}`);
  }

  const levelIds = new Set<number>();
  for (const level of levels) {
    const where = `${level.id}-деңгей`;
    if (levelIds.has(level.id)) errors.push(`${where}: id қайталанған`);
    levelIds.add(level.id);

    if (!DIFFICULTIES.includes(level.difficulty)) {
      errors.push(`${where}: қиындық деңгейі дұрыс емес («${level.difficulty}»)`);
    }

    if (level.categories.length !== CATEGORIES_PER_LEVEL) {
      errors.push(`${where}: ${CATEGORIES_PER_LEVEL} топ болуы керек, қазір: ${level.categories.length}`);
    }

    const catIds = new Set<string>();
    const catNames = new Set<string>();
    const words = new Map<string, string>();

    for (const cat of level.categories) {
      const cw = `${where}, «${cat.category}»`;
      if (catIds.has(cat.id)) errors.push(`${cw}: топ id-і қайталанған (${cat.id})`);
      catIds.add(cat.id);
      if (catNames.has(normalize(cat.category))) errors.push(`${cw}: топ атауы қайталанған`);
      catNames.add(normalize(cat.category));
      if (!cat.category.trim()) errors.push(`${where}: топ атауы бос`);
      if (LATIN.test(cat.category)) errors.push(`${cw}: топ атауында латын әрпі бар`);

      if (cat.words.length !== WORDS_PER_CATEGORY) {
        errors.push(`${cw}: ${WORDS_PER_CATEGORY} сөз болуы керек, қазір: ${cat.words.length}`);
      }

      for (const entry of cat.words) {
        const key = normalize(entry.word);
        if (!key) errors.push(`${cw}: бос сөз бар`);
        if (words.has(key)) {
          errors.push(`${where}: «${entry.word}» сөзі қайталанған («${words.get(key)}» және «${cat.category}»)`);
        }
        words.set(key, cat.category);
        if (LATIN.test(entry.word)) errors.push(`${cw}: «${entry.word}» сөзінде латын әрпі бар`);
        if (entry.word !== entry.word.trim()) errors.push(`${cw}: «${entry.word}» басында/соңында бос орын бар`);
        if (!entry.explanation.trim()) errors.push(`${cw}: «${entry.word}» сөзінің түсіндірмесі жоқ`);
        if (LATIN.test(entry.explanation)) {
          errors.push(`${cw}: «${entry.word}» түсіндірмесінде латын әрпі бар`);
        }
      }
    }

    if (words.size !== CATEGORIES_PER_LEVEL * WORDS_PER_CATEGORY) {
      errors.push(`${where}: бірегей сөз саны 16 болуы керек, қазір: ${words.size}`);
    }
  }

  return errors;
}
