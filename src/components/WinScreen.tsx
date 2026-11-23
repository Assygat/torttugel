import { useEffect, useRef } from 'react';
import type { Level } from '../types';
import { MAX_HINTS } from '../game/logic';
import type { GameResult } from './GameScreen';
import { OrnamentCorner, OrnamentDivider } from './Ornament';

interface Props {
  level: Level;
  result: GameResult;
  bestScore: number;
  onPlayAgain: () => void;
  onReplay: () => void;
  onHome: () => void;
}

function starsFor(r: GameResult): number {
  if (r.mistakes === 0 && r.hintsUsed === 0) return 3;
  if (r.mistakes <= 2) return 2;
  return 1;
}

export function WinScreen({ level, result, bestScore, onPlayAgain, onReplay, onHome }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);
  const stars = starsFor(result);

  return (
    <main className="win">
      <section className="win__card" aria-labelledby="win-title">
        <OrnamentCorner className="corner corner--tl" />
        <OrnamentCorner className="corner corner--tr" />

        <div className="win__stars" aria-label={`${stars} жұлдыз`}>
          {[1, 2, 3].map((n) => (
            <span key={n} className={`star${n <= stars ? ' is-on' : ''}`} aria-hidden="true">
              ★
            </span>
          ))}
        </div>

        <h1 id="win-title" className="win__title" tabIndex={-1} ref={headingRef}>
          Жарайсың! Барлық топты дұрыс таптың!
        </h1>
        <OrnamentDivider className="ornament--small" />

        <div className="win__score">
          <span className="win__score-label">Ұпай</span>
          <span className="win__score-value">{result.score}</span>
          {bestScore > result.score && <span className="win__best">Ең жоғарғы: {bestScore}</span>}
        </div>

        <dl className="win__stats">
          <div><dt>Деңгей</dt><dd>{level.id}</dd></div>
          <div><dt>Әрекет</dt><dd>{result.attempts}</dd></div>
          <div><dt>Қате</dt><dd>{result.mistakes}</dd></div>
          <div><dt>Көмек</dt><dd>{result.hintsUsed} / {MAX_HINTS}</dd></div>
        </dl>

        <div className="win__actions">
          <button type="button" className="btn btn--primary btn--large" onClick={onPlayAgain}>
            Тағы ойнау
          </button>
          <button type="button" className="btn btn--ghost" onClick={onReplay}>
            Осы деңгейді қайталау
          </button>
          <button type="button" className="btn btn--text" onClick={onHome}>
            Басты бет
          </button>
        </div>
      </section>

      <section className="glossary" aria-labelledby="glossary-title">
        <h2 id="glossary-title" className="section-title">Сөздік: осы ойынның сөздері</h2>
        <div className="glossary__groups">
          {result.solvedOrder.map((id, i) => {
            const cat = level.categories.find((c) => c.id === id)!;
            return (
              <article key={id} className={`gloss gloss--${i + 1}`}>
                <h3 className="gloss__title">{cat.category}</h3>
                <dl className="gloss__list">
                  {cat.words.map((w) => (
                    <div key={w.word}>
                      <dt>{w.word}</dt>
                      <dd>{w.explanation}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
