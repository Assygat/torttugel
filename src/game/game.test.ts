import { describe, expect, it } from 'vitest';
import { levels } from '../data/levels';
import { validateLevels } from '../data/validate';
import { buildTiles, evaluateGuess, pickHint, shuffle, computeScore, MAX_HINTS_PER_CATEGORY } from './logic';
import { reducer, type GameState } from './useGame';

const fresh = (levelIndex: number): GameState => {
  const level = levels[levelIndex];
  return {
    level,
    tiles: buildTiles(level),
    solved: [],
    selected: [],
    attempts: 0,
    mistakes: 0,
    hinted: [],
    guesses: [],
    feedback: null,
    anim: null,
  };
};

describe('сөздік қоры', () => {
  it('валидатор қате таппайды', () => {
    expect(validateLevels(levels)).toEqual([]);
  });

  it('кемінде 16 деңгей, әрқайсында 4×4 бірегей сөз', () => {
    expect(levels.length).toBeGreaterThanOrEqual(16);
    for (const l of levels) {
      expect(l.categories).toHaveLength(4);
      for (const c of l.categories) expect(c.words).toHaveLength(4);
      const words = l.categories.flatMap((c) => c.words.map((w) => w.word.toLowerCase()));
      expect(new Set(words).size).toBe(16);
    }
  });

  it('валидатор қайталанған сөзді және латын әрпін ұстайды', () => {
    const broken = structuredClone(levels);
    broken[0].categories[0].words[0].word = broken[0].categories[1].words[0].word;
    broken[1].categories[0].words[0].word = 'Oпа'; // латын O
    broken[2].categories[0].words.pop();
    const errors = validateLevels(broken);
    expect(errors.some((e) => e.includes('қайталанған'))).toBe(true);
    expect(errors.some((e) => e.includes('латын'))).toBe(true);
    expect(errors.some((e) => e.includes('4 сөз'))).toBe(true);
  });
});

describe('ойын логикасы', () => {
  it('араластыру барлық элементті сақтайды', () => {
    const arr = Array.from({ length: 16 }, (_, i) => i);
    expect([...shuffle(arr)].sort((a, b) => a - b)).toEqual(arr);
  });

  it('дұрыс, қате және «бір сөз қате» таңдауды ажыратады', () => {
    const tiles = buildTiles(levels[0]);
    const [a, b] = levels[0].categories;
    const right = a.words.map((w) => w.word);
    expect(evaluateGuess(tiles, right)).toMatchObject({ correct: true, categoryId: a.id });
    const oneAway = [...right.slice(0, 3), b.words[0].word];
    expect(evaluateGuess(tiles, oneAway)).toMatchObject({ correct: false, bestOverlap: 3 });
  });

  it('көмек бір топтан 2 сөзден артық ашпайды және шешілген топты ұсынбайды', () => {
    const tiles = buildTiles(levels[0]);
    const solvedId = levels[0].categories[0].id;
    const hinted: string[] = [];
    for (let i = 0; i < 20; i++) {
      const t = pickHint(tiles, [solvedId], hinted);
      if (!t) break;
      expect(t.categoryId).not.toBe(solvedId);
      hinted.push(t.word);
    }
    const perCat = new Map<string, number>();
    for (const w of hinted) {
      const id = tiles.find((t) => t.word === w)!.categoryId;
      perCat.set(id, (perCat.get(id) ?? 0) + 1);
    }
    for (const n of perCat.values()) expect(n).toBeLessThanOrEqual(MAX_HINTS_PER_CATEGORY);
    // алғашқы 3 көмек әртүрлі топтардан
    const firstThree = hinted.slice(0, 3).map((w) => tiles.find((t) => t.word === w)!.categoryId);
    expect(new Set(firstThree).size).toBe(3);
  });

  it('ұпай теріс болмайды', () => {
    expect(computeScore(0, 10, 3)).toBe(0);
    expect(computeScore(4, 1, 1)).toBe(400 - 15 - 25);
  });
});

describe('толық ойын барысы — барлық 16 деңгей', () => {
  levels.forEach((level, idx) => {
    it(`${level.id}-деңгей: қате әрекет, қайталау, сосын 4 топ та табылады`, () => {
      let s = fresh(idx);
      const [c1, c2] = level.categories;

      // қате таңдау
      const wrong = [c1.words[0], c1.words[1], c2.words[0], c2.words[1]].map((w) => w.word);
      for (const w of wrong) s = reducer(s, { type: 'toggle', word: w });
      s = reducer(s, { type: 'submit' });
      expect(s.feedback?.title).toBe('Қайта көріңіз!');
      expect(s.mistakes).toBe(1);
      s = reducer(s, { type: 'endAnim' });

      // сол таңдауды қайта жіберу әрекет санын арттырмайды
      s = reducer(s, { type: 'submit' });
      expect(s.attempts).toBe(1);
      expect(s.feedback?.kind).toBe('repeat');

      // 5-ші сөзді таңдауға болмайды; қайта басқанда таңдау алынады
      s = reducer(s, { type: 'toggle', word: c1.words[2].word });
      expect(s.selected).toHaveLength(4);
      s = reducer(s, { type: 'toggle', word: wrong[0] });
      expect(s.selected).toHaveLength(3);
      s = reducer(s, { type: 'clear' });

      // барлық топтарды табу
      for (const cat of level.categories) {
        for (const w of cat.words) s = reducer(s, { type: 'toggle', word: w.word });
        s = reducer(s, { type: 'submit' });
        expect(s.anim).toBe('correct');
        expect(s.feedback?.detail).toBe(cat.category);
        s = reducer(s, { type: 'commitSolve' });
        expect(s.solved).toContain(cat.id);
        expect(s.selected).toEqual([]);
      }
      expect(s.solved).toHaveLength(4);
      expect(s.attempts).toBe(5);
      expect(computeScore(s.solved.length, s.mistakes, s.hinted.length)).toBe(385);
    });
  });
});
