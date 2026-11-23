import { useEffect, type CSSProperties } from 'react';
import type { Level } from '../types';
import { MAX_HINTS, SELECTION_SIZE } from '../game/logic';
import { useGame } from '../game/useGame';
import { OrnamentDivider } from './Ornament';

export interface GameResult {
  score: number;
  attempts: number;
  mistakes: number;
  hintsUsed: number;
  /** шешілу реті бойынша топ id-лері (түстерді сәйкестендіру үшін) */
  solvedOrder: string[];
}

interface Props {
  level: Level;
  totalLevels: number;
  onWin: (result: GameResult) => void;
  onNewGame: () => void;
  onHome: () => void;
  onShowRules: () => void;
}

/** Сөздің ең ұзын бөлігінің әріп саны — карточкадағы қаріп өлшемін есептеу үшін */
const longestPart = (word: string) =>
  Math.max(5, Math.ceil(word.length / 1.7), ...word.split(/[\s-]+/).map((p) => p.length));

export function GameScreen({ level, totalLevels, onWin, onNewGame, onHome, onShowRules }: Props) {
  const { state, hintsLeft, won, score, toggle, clear, submit, restart, shuffleTiles, hint } =
    useGame(level);
  const { tiles, solved, selected, attempts, mistakes, hinted, feedback, anim } = state;

  useEffect(() => {
    if (!won) return;
    const t = window.setTimeout(
      () => onWin({ score, attempts, mistakes, hintsUsed: hinted.length, solvedOrder: solved }),
      900,
    );
    return () => window.clearTimeout(t);
  }, [won, score, attempts, mistakes, hinted.length, solved, onWin]);

  const openTiles = tiles.filter((t) => !solved.includes(t.categoryId));
  const progressPct = (solved.length / level.categories.length) * 100;
  const canSubmit = selected.length === SELECTION_SIZE && !anim;

  return (
    <main className="game">
      <header className="game__header">
        <button type="button" className="brand" onClick={onHome} aria-label="Басты бетке оралу">
          <span className="brand__mark" aria-hidden="true">
            <i /><i /><i /><i />
          </span>
          <span className="brand__name">ТӨРТ ТОПТАУ</span>
        </button>
        <div className="game__level">
          <span className="badge">{level.id}-деңгей / {totalLevels}</span>
          <span className={`badge badge--diff badge--${level.difficulty === 'Жеңіл' ? 'easy' : level.difficulty === 'Орташа' ? 'medium' : 'hard'}`}>
            {level.difficulty}
          </span>
          <button type="button" className="icon-btn" onClick={onShowRules} aria-label="Ойын ережесі">
            ?
          </button>
        </div>
      </header>

      <section className="stats" aria-label="Ойын көрсеткіштері">
        <div className="stat">
          <span className="stat__label">Ұпай</span>
          <span className="stat__value">{score}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Топтар</span>
          <span className="stat__value">{solved.length} / {level.categories.length}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Әрекет</span>
          <span className="stat__value">{attempts}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Көмек</span>
          <span className="stat__value">{hintsLeft} / {MAX_HINTS}</span>
        </div>
        <div
          className="progress"
          role="progressbar"
          aria-label="Табылған топтар"
          aria-valuemin={0}
          aria-valuemax={level.categories.length}
          aria-valuenow={solved.length}
        >
          <span className="progress__bar" style={{ width: `${progressPct}%` }} />
        </div>
      </section>

      <p className="game__prompt">
        <span>
          Бір топқа жататын <b>төрт сөзді</b> таңдаңыз
        </span>
        <span className="game__count" aria-live="polite">
          Таңдалды: {selected.length} / {SELECTION_SIZE}
        </span>
      </p>

      <div className="board-wrap">
        <div className="board">
          {solved.map((id, i) => {
            const cat = level.categories.find((c) => c.id === id)!;
            return (
              <div key={id} className={`solved solved--${i + 1}`} role="group" aria-label={`Табылған топ: ${cat.category}`}>
                <p className="solved__title">{cat.category}</p>
                <p className="solved__words">{cat.words.map((w) => w.word).join(' • ')}</p>
              </div>
            );
          })}

          {openTiles.map((t) => {
            const isSel = selected.includes(t.word);
            const isHint = hinted.includes(t.word);
            const cls = [
              'card',
              isSel && 'is-selected',
              isHint && 'is-hinted',
              isSel && anim === 'correct' && 'is-correct',
              isSel && anim === 'wrong' && 'is-wrong',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <button
                key={t.word}
                type="button"
                className={cls}
                style={{ '--len': longestPart(t.word) } as CSSProperties}
                aria-pressed={isSel}
                aria-label={isHint ? `${t.word} (көмек: ${t.explanation})` : t.word}
                onClick={() => toggle(t.word)}
              >
                <span className="card__word">{t.word}</span>
                {isHint && <span className="card__hint" aria-hidden="true">✦</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="feedback-slot" aria-live="polite" aria-atomic="true">
        {feedback && (
          <div key={feedback.id} className={`feedback feedback--${feedback.kind}`} role="status">
            <span className="feedback__title">{feedback.title}</span>
            {feedback.detail && <span className="feedback__detail">{feedback.detail}</span>}
          </div>
        )}
      </div>

      <div className="controls">
        <button type="button" className="btn btn--hint" onClick={hint} disabled={!!anim || won}>
          <span aria-hidden="true">✦</span> Көмек <span className="btn__count">{hintsLeft}</span>
        </button>
        <button type="button" className="btn btn--ghost" onClick={shuffleTiles} disabled={!!anim || won}>
          Араластыру
        </button>
        <button type="button" className="btn btn--ghost" onClick={clear} disabled={!selected.length || !!anim}>
          Таңдауды алу
        </button>
        <button type="button" className="btn btn--primary btn--check" onClick={submit} disabled={!canSubmit}>
          Тексеру
        </button>
      </div>

      {hinted.length > 0 && (
        <section className="hints" aria-labelledby="hints-title">
          <h2 id="hints-title" className="hints__title">Көмектер</h2>
          <ul className="hints__list">
            {hinted.map((w) => {
              const t = tiles.find((x) => x.word === w)!;
              return (
                <li key={w}>
                  <b>{t.word}</b> — {t.explanation}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <OrnamentDivider className="ornament--small ornament--muted" />

      <div className="secondary-actions">
        <button type="button" className="btn btn--text" onClick={restart}>
          Қайта бастау
        </button>
        <button type="button" className="btn btn--text" onClick={onNewGame}>
          Жаңа ойын
        </button>
        <button type="button" className="btn btn--text" onClick={onHome}>
          Басты бет
        </button>
      </div>
    </main>
  );
}
