import type { Level } from '../types';
import type { LevelOrder, Progress } from '../game/storage';
import { OrnamentCorner, OrnamentDivider } from './Ornament';

interface Props {
  levels: Level[];
  progress: Progress;
  onStart: () => void;
  onPickLevel: (index: number) => void;
  onShowRules: () => void;
  onOrderChange: (order: LevelOrder) => void;
}

const DIFF_CLASS: Record<Level['difficulty'], string> = {
  'Жеңіл': 'easy',
  'Орташа': 'medium',
  'Күрделі': 'hard',
};

export function StartScreen({ levels, progress, onStart, onPickLevel, onShowRules, onOrderChange }: Props) {
  const doneCount = levels.filter((l) => progress.completed[l.id] !== undefined).length;
  const next = levels[progress.lastIndex] ?? levels[0];

  return (
    <main className="start">
      <section className="hero" aria-labelledby="game-title">
        <OrnamentCorner className="corner corner--tl" />
        <OrnamentCorner className="corner corner--tr" />
        <OrnamentCorner className="corner corner--bl" />
        <OrnamentCorner className="corner corner--br" />

        <OrnamentDivider />
        <h1 id="game-title" className="hero__title">ТӨРТ ТОПТАУ</h1>
        <OrnamentDivider />
        <p className="hero__subtitle">Сөздерді мағынасына қарай төрт топқа бөл!</p>

        <div className="hero__tiles" aria-hidden="true">
          <span className="mini mini--1" />
          <span className="mini mini--2" />
          <span className="mini mini--3" />
          <span className="mini mini--4" />
        </div>

        <div className="hero__actions">
          <button type="button" className="btn btn--primary btn--large" onClick={onStart}>
            Ойынды бастау
          </button>
          <button type="button" className="btn btn--ghost btn--large" onClick={onShowRules}>
            Ойын ережесі
          </button>
        </div>
        <p className="hero__next">
          Келесі: <b>{next.id}-деңгей</b> · {next.difficulty}
        </p>
      </section>

      <section className="levels" aria-labelledby="levels-title">
        <div className="levels__head">
          <h2 id="levels-title" className="section-title">Деңгейлер</h2>
          <p className="levels__count">
            Аяқталды: <b>{doneCount}</b> / {levels.length}
          </p>
        </div>

        <div className="level-grid">
          {levels.map((l, i) => {
            const best = progress.completed[l.id];
            const done = best !== undefined;
            return (
              <button
                key={l.id}
                type="button"
                className={`level-chip level-chip--${DIFF_CLASS[l.difficulty]}${done ? ' is-done' : ''}`}
                onClick={() => onPickLevel(i)}
                aria-label={`${l.id}-деңгей, ${l.difficulty}${done ? `, аяқталған, ең жоғары ұпай ${best}` : ''}`}
              >
                <span className="level-chip__num">{l.id}</span>
                <span className="level-chip__diff">{l.difficulty}</span>
                {done && (
                  <span className="level-chip__done" aria-hidden="true">
                    ✓ {best}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="order" role="radiogroup" aria-label="Келесі деңгейдің реті">
          <span className="order__label">«Жаңа ойын» реті:</span>
          {(['sequential', 'random'] as const).map((o) => (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={progress.order === o}
              className={`order__opt${progress.order === o ? ' is-active' : ''}`}
              onClick={() => onOrderChange(o)}
            >
              {o === 'sequential' ? 'Ретімен' : 'Кездейсоқ'}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
