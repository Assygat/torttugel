import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { Level } from '../types';
import {
  MAX_HINTS,
  SELECTION_SIZE,
  buildTiles,
  computeScore,
  evaluateGuess,
  guessKey,
  pickHint,
  shuffle,
  type Tile,
} from './logic';

export type FeedbackKind = 'correct' | 'wrong' | 'oneAway' | 'repeat' | 'hint' | 'noHint';

export interface Feedback {
  kind: FeedbackKind;
  title: string;
  detail?: string;
  /** әр хабарламаның бірегей нөмірі — анимацияны қайта іске қосу үшін */
  id: number;
}

export interface GameState {
  level: Level;
  tiles: Tile[];
  solved: string[];
  selected: string[];
  attempts: number;
  mistakes: number;
  hinted: string[];
  guesses: string[];
  feedback: Feedback | null;
  anim: 'correct' | 'wrong' | null;
}

type Action =
  | { type: 'reset'; level: Level; tiles: Tile[] }
  | { type: 'toggle'; word: string }
  | { type: 'clear' }
  | { type: 'shuffle'; tiles: Tile[] }
  | { type: 'submit' }
  | { type: 'commitSolve' }
  | { type: 'endAnim' }
  | { type: 'hint'; word: string | null };

let feedbackSeq = 0;
const fb = (kind: FeedbackKind, title: string, detail?: string): Feedback => ({
  kind,
  title,
  detail,
  id: ++feedbackSeq,
});

function init(level: Level, tiles: Tile[]): GameState {
  return {
    level,
    tiles,
    solved: [],
    selected: [],
    attempts: 0,
    mistakes: 0,
    hinted: [],
    guesses: [],
    feedback: null,
    anim: null,
  };
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'reset':
      return init(action.level, action.tiles);

    case 'toggle': {
      if (state.anim) return state;
      if (state.selected.includes(action.word)) {
        return { ...state, selected: state.selected.filter((w) => w !== action.word) };
      }
      if (state.selected.length >= SELECTION_SIZE) return state;
      return { ...state, selected: [...state.selected, action.word] };
    }

    case 'clear':
      return state.anim ? state : { ...state, selected: [] };

    case 'shuffle':
      return state.anim ? state : { ...state, tiles: action.tiles };

    case 'submit': {
      if (state.anim || state.selected.length !== SELECTION_SIZE) return state;
      const key = guessKey(state.selected);
      if (state.guesses.includes(key)) {
        return {
          ...state,
          feedback: fb('repeat', 'Бұл төрттікті тексеріп қойдыңыз', 'Басқа сөздерді таңдап көріңіз.'),
        };
      }
      const result = evaluateGuess(state.tiles, state.selected);
      const base = { ...state, attempts: state.attempts + 1, guesses: [...state.guesses, key] };
      if (result.correct) {
        const cat = state.level.categories.find((c) => c.id === result.categoryId)!;
        return { ...base, anim: 'correct', feedback: fb('correct', 'Дұрыс!', cat.category) };
      }
      return {
        ...base,
        mistakes: state.mistakes + 1,
        anim: 'wrong',
        feedback:
          result.bestOverlap === SELECTION_SIZE - 1
            ? fb('oneAway', 'Қайта көріңіз!', 'Жақын қалдыңыз — бір сөз ғана басқа топтан.')
            : fb('wrong', 'Қайта көріңіз!', 'Бұл сөздер бір топқа жатпайды.'),
      };
    }

    case 'commitSolve': {
      if (state.anim !== 'correct') return state;
      const first = state.tiles.find((t) => t.word === state.selected[0]);
      if (!first) return { ...state, anim: null };
      return {
        ...state,
        solved: [...state.solved, first.categoryId],
        selected: [],
        anim: null,
      };
    }

    case 'endAnim':
      return { ...state, anim: null };

    case 'hint': {
      if (state.anim) return state;
      if (!action.word) {
        return { ...state, feedback: fb('noHint', 'Көмек қалмады', 'Енді өз күшіңізбен табыңыз!') };
      }
      const tile = state.tiles.find((t) => t.word === action.word)!;
      return {
        ...state,
        hinted: [...state.hinted, tile.word],
        feedback: fb('hint', `«${tile.word}»`, tile.explanation),
      };
    }
  }
}

const CORRECT_MS = 650;
const WRONG_MS = 650;

export function useGame(level: Level) {
  const [state, dispatch] = useReducer(reducer, level, (l) => init(l, buildTiles(l)));
  const timer = useRef<number | undefined>(undefined);

  // Деңгей ауысқанда ойынды жаңадан бастау
  useEffect(() => {
    if (state.level !== level) dispatch({ type: 'reset', level, tiles: buildTiles(level) });
  }, [level, state.level]);

  // Анимация біткен соң күйді жаңарту
  useEffect(() => {
    if (!state.anim) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const ms = reduced ? 150 : state.anim === 'correct' ? CORRECT_MS : WRONG_MS;
    const next = state.anim === 'correct' ? 'commitSolve' : 'endAnim';
    timer.current = window.setTimeout(() => dispatch({ type: next }), ms);
    return () => window.clearTimeout(timer.current);
  }, [state.anim]);

  const hintsLeft = MAX_HINTS - state.hinted.length;
  const won = state.solved.length === state.level.categories.length;
  const score = computeScore(state.solved.length, state.mistakes, state.hinted.length);

  const toggle = useCallback((word: string) => dispatch({ type: 'toggle', word }), []);
  const clear = useCallback(() => dispatch({ type: 'clear' }), []);
  const submit = useCallback(() => dispatch({ type: 'submit' }), []);
  const restart = useCallback(
    () => dispatch({ type: 'reset', level: state.level, tiles: buildTiles(state.level) }),
    [state.level],
  );
  const shuffleTiles = useCallback(() => {
    // тек шешілмеген тақталарды араластырамыз
    const open = state.tiles.filter((t) => !state.solved.includes(t.categoryId));
    const done = state.tiles.filter((t) => state.solved.includes(t.categoryId));
    dispatch({ type: 'shuffle', tiles: [...done, ...shuffle(open)] });
  }, [state.tiles, state.solved]);
  const hint = useCallback(() => {
    const t = hintsLeft > 0 ? pickHint(state.tiles, state.solved, state.hinted) : null;
    dispatch({ type: 'hint', word: t ? t.word : null });
  }, [hintsLeft, state.tiles, state.solved, state.hinted]);

  return { state, hintsLeft, won, score, toggle, clear, submit, restart, shuffleTiles, hint };
}
