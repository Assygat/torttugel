import { useCallback, useEffect, useState } from 'react';
import { levels } from './data/levels';
import { GameScreen, type GameResult } from './components/GameScreen';
import { RulesDialog } from './components/RulesDialog';
import { StartScreen } from './components/StartScreen';
import { WinScreen } from './components/WinScreen';
import { loadProgress, saveProgress, type LevelOrder, type Progress } from './game/storage';

type Screen = 'start' | 'game' | 'win';

function pickNextIndex(current: number, progress: Progress): number {
  const n = levels.length;
  if (progress.order === 'sequential') return (current + 1) % n;
  const others = levels.map((_, i) => i).filter((i) => i !== current);
  const fresh = others.filter((i) => progress.completed[levels[i].id] === undefined);
  const pool = fresh.length ? fresh : others;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function App() {
  const [progress, setProgress] = useState<Progress>(() => {
    const p = loadProgress();
    return { ...p, lastIndex: p.lastIndex >= 0 && p.lastIndex < levels.length ? p.lastIndex : 0 };
  });
  const [screen, setScreen] = useState<Screen>('start');
  const [index, setIndex] = useState(progress.lastIndex);
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen, index, round]);

  const level = levels[index];

  const startLevel = useCallback((i: number) => {
    setIndex(i);
    setRound((r) => r + 1);
    setResult(null);
    setScreen('game');
    setProgress((p) => ({ ...p, lastIndex: i }));
  }, []);

  const handleWin = useCallback(
    (r: GameResult) => {
      setResult(r);
      setScreen('win');
      setProgress((p) => {
        const prevBest = p.completed[level.id] ?? -1;
        const completed = { ...p.completed, [level.id]: Math.max(prevBest, r.score) };
        const updated = { ...p, completed };
        return { ...updated, lastIndex: pickNextIndex(index, updated) };
      });
    },
    [index, level.id],
  );

  const newGame = useCallback(() => startLevel(pickNextIndex(index, progress)), [index, progress, startLevel]);
  const setOrder = (order: LevelOrder) => setProgress((p) => ({ ...p, order }));

  return (
    <div className="app">
      {screen === 'start' && (
        <StartScreen
          levels={levels}
          progress={progress}
          onStart={() => startLevel(progress.lastIndex)}
          onPickLevel={startLevel}
          onShowRules={() => setRulesOpen(true)}
          onOrderChange={setOrder}
        />
      )}

      {screen === 'game' && (
        <GameScreen
          key={`${index}-${round}`}
          level={level}
          totalLevels={levels.length}
          onWin={handleWin}
          onNewGame={newGame}
          onHome={() => setScreen('start')}
          onShowRules={() => setRulesOpen(true)}
        />
      )}

      {screen === 'win' && result && (
        <WinScreen
          level={level}
          result={result}
          bestScore={progress.completed[level.id] ?? result.score}
          onPlayAgain={() => startLevel(progress.lastIndex)}
          onReplay={() => startLevel(index)}
          onHome={() => setScreen('start')}
        />
      )}

      <RulesDialog open={rulesOpen} onClose={() => setRulesOpen(false)} />

      <footer className="footer">Төрт топтау · қазақ тілі сабағына арналған сөздік ойыны</footer>
    </div>
  );
}
