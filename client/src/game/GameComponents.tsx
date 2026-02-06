/**
 * FAIL FRENZY v2.0 - React Game Components
 * Premium UI with full integration
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FailFrenzyGame, GameMode } from './FailFrenzyGame';
import { GameState } from '../engine/GameEngine';

interface GameCanvasProps {
  mode: GameMode;
  onScoreUpdate?: (score: number) => void;
  onGameOver?: (score: number, fails: number, time: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ mode, onScoreUpdate, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<FailFrenzyGame | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create game instance - audio is handled internally
    const game = new FailFrenzyGame('game-canvas', mode);
    gameRef.current = game;
    game.start();

    // Update state periodically
    const stateInterval = setInterval(() => {
      const state = game.getState();
      setGameState(state);

      if (onScoreUpdate) {
        onScoreUpdate(state.score);
      }

      if (state.isGameOver && onGameOver) {
        onGameOver(state.score, state.fails, state.time);
      }
    }, 100);

    return () => {
      clearInterval(stateInterval);
      game.destroy();
    };
  }, [mode]);

  const handlePause = useCallback(() => {
    if (!gameRef.current) return;
    if (isPaused) {
      gameRef.current.resume();
    } else {
      gameRef.current.pause();
    }
    setIsPaused(!isPaused);
  }, [isPaused]);

  const handleRestart = useCallback(() => {
    if (!gameRef.current) return;
    gameRef.current.restart();
    setIsPaused(false);
  }, []);

  return (
    <div className="game-canvas-container relative w-full max-w-[800px] mx-auto">
      <canvas
        id="game-canvas"
        ref={canvasRef}
        className="w-full aspect-[4/3] border-2 border-cyan-400 rounded-xl shadow-[0_0_30px_rgba(0,255,255,0.4)] bg-[#0a0e27]"
        style={{ imageRendering: 'auto' }}
      />

      {/* Floating controls */}
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        <button
          onClick={handlePause}
          className="px-3 py-1.5 text-xs font-bold bg-black/60 border border-cyan-400/60 rounded-lg text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all backdrop-blur-sm"
        >
          {isPaused ? '▶ PLAY' : '⏸ PAUSE'}
        </button>
        <button
          onClick={handleRestart}
          className="px-3 py-1.5 text-xs font-bold bg-black/60 border border-pink-400/60 rounded-lg text-pink-400 hover:bg-pink-500/20 hover:border-pink-400 transition-all backdrop-blur-sm"
        >
          ↻ RESTART
        </button>
      </div>

      {/* Pause overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/85 flex items-center justify-center rounded-xl backdrop-blur-sm z-20">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-cyan-400 mb-6 animate-pulse" style={{ textShadow: '0 0 30px rgba(0,255,255,0.8)' }}>
              PAUSED
            </h2>
            <button
              onClick={handlePause}
              className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-lg rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-[0_0_20px_rgba(0,255,255,0.5)]"
            >
              ▶ RESUME
            </button>
          </div>
        </div>
      )}

      {/* Stats bar below canvas */}
      {gameState && (
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          <div className="bg-black/40 border border-cyan-400/30 rounded-lg p-2">
            <div className="text-cyan-400 text-[10px] font-bold tracking-wider">SCORE</div>
            <div className="text-lg font-bold text-white" style={{ textShadow: '0 0 10px rgba(0,255,255,0.5)' }}>{gameState.score}</div>
          </div>
          <div className="bg-black/40 border border-pink-400/30 rounded-lg p-2">
            <div className="text-pink-400 text-[10px] font-bold tracking-wider">FAILS</div>
            <div className="text-lg font-bold text-white" style={{ textShadow: '0 0 10px rgba(255,0,102,0.5)' }}>{gameState.fails}</div>
          </div>
          <div className="bg-black/40 border border-yellow-400/30 rounded-lg p-2">
            <div className="text-yellow-400 text-[10px] font-bold tracking-wider">COMBO</div>
            <div className="text-lg font-bold text-white" style={{ textShadow: '0 0 10px rgba(255,255,0,0.5)' }}>x{gameState.combo}</div>
          </div>
          <div className="bg-black/40 border border-green-400/30 rounded-lg p-2">
            <div className="text-green-400 text-[10px] font-bold tracking-wider">TIME</div>
            <div className="text-lg font-bold text-white" style={{ textShadow: '0 0 10px rgba(0,255,0,0.5)' }}>{gameState.time.toFixed(1)}s</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Game mode selector component
interface GameModeSelectorProps {
  onModeSelect: (mode: GameMode) => void;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({ onModeSelect }) => {
  const modes: (GameMode & { icon: string; gradient: string })[] = [
    {
      name: 'Classic',
      description: '3 lives, progressive difficulty. Survive as long as possible!',
      difficulty: 1,
      icon: '🎮',
      gradient: 'from-cyan-500/20 to-blue-600/20',
    },
    {
      name: 'Time Trial',
      description: 'Race against time! Survive for 60 seconds.',
      duration: 60,
      difficulty: 1.5,
      icon: '⏱️',
      gradient: 'from-green-500/20 to-emerald-600/20',
    },
    {
      name: 'Infinite',
      description: 'No game over. How high can you score?',
      difficulty: 1,
      icon: '♾️',
      gradient: 'from-purple-500/20 to-pink-600/20',
    },
    {
      name: 'Seeds',
      description: 'Reproducible challenge. Share your seed with friends!',
      seed: Math.floor(Date.now() / 1000),
      difficulty: 1.2,
      icon: '🌱',
      gradient: 'from-yellow-500/20 to-orange-600/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 max-w-3xl mx-auto">
      {modes.map((mode) => (
        <button
          key={mode.name}
          onClick={() => onModeSelect(mode)}
          className={`group relative bg-gradient-to-br ${mode.gradient} border-2 border-cyan-400/40 rounded-xl p-5 sm:p-6 hover:border-cyan-400 hover:shadow-[0_0_40px_rgba(0,255,255,0.3)] transition-all duration-300 text-left`}
        >
          <div className="text-3xl mb-3">{mode.icon}</div>
          <h3 className="text-xl sm:text-2xl font-bold text-cyan-400 group-hover:text-white mb-2 transition-colors">
            {mode.name}
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm mb-4 leading-relaxed">
            {mode.description}
          </p>
          <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs">
            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-400/30">
              Difficulty: {mode.difficulty}x
            </span>
            {mode.duration && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-400/30">
                {mode.duration}s
              </span>
            )}
            {mode.seed && (
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-400/30">
                Seed: {mode.seed}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

// Main game page component
export const GamePage: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [highScore, setHighScore] = useState(() => {
    try {
      const data = localStorage.getItem('failfrenzy_highscores');
      if (data) {
        const parsed = JSON.parse(data);
        return Math.max(0, ...Object.values(parsed).map(Number));
      }
    } catch {}
    return 0;
  });
  const [lastScore, setLastScore] = useState<{ score: number; fails: number; time: number } | null>(null);

  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);
    setLastScore(null);
  };

  const handleGameOver = (score: number, fails: number, time: number) => {
    setLastScore({ score, fails, time });
    if (score > highScore) {
      setHighScore(score);
    }
  };

  const handleBackToMenu = () => {
    setSelectedMode(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] text-white overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-cyan-400/30 bg-black/60 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            <span className="text-cyan-400" style={{ textShadow: '0 0 20px rgba(0,255,255,0.6)' }}>FAIL</span>
            <span className="text-pink-500 ml-1" style={{ textShadow: '0 0 20px rgba(255,0,102,0.6)' }}>FRENZY</span>
          </h1>
          <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-400/40 rounded-lg">
              Best: <span className="font-bold text-cyan-400">{highScore}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 py-6 sm:py-8">
        {!selectedMode ? (
          <>
            <div className="text-center mb-6 sm:mb-10">
              <h2 className="text-3xl sm:text-5xl font-black mb-3 sm:mb-4 tracking-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-pink-500 bg-clip-text text-transparent">
                  SELECT MODE
                </span>
              </h2>
              <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
                Choose your challenge and master the art of failing forward
              </p>
            </div>
            <GameModeSelector onModeSelect={handleModeSelect} />
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={handleBackToMenu}
                className="px-4 py-2 bg-black/40 border border-gray-700 rounded-lg hover:border-cyan-400 transition-all text-sm text-gray-400 hover:text-cyan-400"
              >
                ← Menu
              </button>
              <div className="text-right">
                <h2 className="text-xl sm:text-2xl font-bold text-cyan-400">
                  {selectedMode.name}
                </h2>
                <p className="text-gray-500 text-xs">{selectedMode.description}</p>
              </div>
            </div>

            <GameCanvas
              mode={selectedMode}
              onGameOver={handleGameOver}
            />

            {lastScore && (
              <div className="mt-6 text-center">
                <div className="inline-block bg-gradient-to-r from-cyan-500/10 to-pink-500/10 border-2 border-cyan-400/50 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-2xl font-bold text-pink-400 mb-4" style={{ textShadow: '0 0 20px rgba(255,0,102,0.5)' }}>
                    GAME OVER
                  </h3>
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-gray-500 text-xs">SCORE</div>
                      <div className="text-2xl sm:text-3xl font-bold text-white">{lastScore.score}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">FAILS</div>
                      <div className="text-2xl sm:text-3xl font-bold text-white">{lastScore.fails}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">TIME</div>
                      <div className="text-2xl sm:text-3xl font-bold text-white">{lastScore.time.toFixed(1)}s</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMode({ ...selectedMode })}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all text-sm"
                  >
                    PLAY AGAIN
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cyan-400/20 bg-black/40 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-4 text-center text-gray-600 text-xs">
          <p>FAIL FRENZY v2.0.0 — Premium Edition</p>
        </div>
      </footer>
    </div>
  );
};
