/** Бір сөз және оның қысқаша түсіндірмесі */
export interface WordEntry {
  word: string;
  explanation: string;
}

/** Бір деңгейдегі бір топ (санат): дәл 4 сөз */
export interface Category {
  id: string;
  category: string;
  words: WordEntry[];
}

export type Difficulty = 'Жеңіл' | 'Орташа' | 'Күрделі';

/** Бір ойын деңгейі: дәл 4 топ, барлығы 16 сөз */
export interface Level {
  id: number;
  difficulty: Difficulty;
  categories: Category[];
}
