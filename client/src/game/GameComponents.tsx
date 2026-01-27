/**
 * FAIL FRENZY - React Game Component
 * Integration with React UI
 */

import React, { useEffect, useRef, useState } from 'react';
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
    
    // Create game instance
    const game = new FailFrenzyGame('game-canvas', mode);
    gameRef.current = game;
    
    // Setup audio hooks (will be connected to Web Audio API)
    game.onAudio('fail', () => playSound('fail'));
    game.onAudio('collect', () => playSound('collect'));
    game.onAudio('dodge', () => playSound('dodge'));
    game.onAudio('gameover', () => playSound('gameover'));
    game.onAudio('success', () => playSound('success'));
    
    // Start game
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
        clearInterval(stateInterval);
      }
    }, 100);
    
    // Cleanup
    return () => {
      clearInterval(stateInterval);
      game.destroy();
    };
  }, [mode]);
  
  const playSound = (type: string) => {
    // Placeholder for Web Audio API integration
    console.log(`Play sound: ${type}`);
  };
  
  const handlePause = () => {
    if (!gameRef.current) return;
    
    if (isPaused) {
      gameRef.current.resume();
    } else {
      gameRef.current.pause();
    }
    
    setIsPaused(!isPaused);
  };
  
  const handleRestart = () => {
    if (!gameRef.current) return;
    gameRef.current.restart();
    setIsPaused(false);
  };
  
  return (
    <div className="game-canvas-container relative">
      <canvas
        id="game-canvas"
        ref={canvasRef}
        className="border-2 border-cyan-400 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.5)]"
      />
      
      {/* Overlay controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={handlePause}
          className="px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded text-cyan-400 hover:bg-cyan-500/40 transition"
        >
          {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
        </button>
        <button
          onClick={handleRestart}
          className="px-4 py-2 bg-magenta-500/20 border border-magenta-400 rounded text-magenta-400 hover:bg-magenta-500/40 transition"
        >
          ↻ RESTART
        </button>
      </div>
      
      {/* Pause overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-cyan-400 mb-4 glitch-text">PAUSED</h2>
            <button
              onClick={handlePause}
              className="px-8 py-4 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition"
            >
              RESUME
            </button>
          </div>
        </div>
      )}
      
      {/* Game state display */}
      {gameState && (
        <div className="mt-4 grid grid-cols-4 gap-4 text-center">
          <div className="bg-cyan-500/10 border border-cyan-400 rounded p-3">
            <div className="text-cyan-400 text-sm">SCORE</div>
            <div className="text-2xl font-bold text-white">{gameState.score}</div>
          </div>
          <div className="bg-magenta-500/10 border border-magenta-400 rounded p-3">
            <div className="text-magenta-400 text-sm">FAILS</div>
            <div className="text-2xl font-bold text-white">{gameState.fails}</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-400 rounded p-3">
            <div className="text-yellow-400 text-sm">COMBO</div>
            <div className="text-2xl font-bold text-white">x{gameState.combo}</div>
          </div>
          <div className="bg-green-500/10 border border-green-400 rounded p-3">
            <div className="text-green-400 text-sm">TIME</div>
            <div className="text-2xl font-bold text-white">{gameState.time.toFixed(1)}s</div>
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
  const modes: GameMode[] = [
    {
      name: 'Classic',
      description: '3 lives, progressive difficulty. Survive as long as possible!',
      difficulty: 1,
    },
    {
      name: 'Time Trial',
      description: 'Race against time! Survive for 60 seconds.',
      duration: 60,
      difficulty: 1.5,
    },
    {
      name: 'Infinite',
      description: 'No game over. How high can you score?',
      difficulty: 1,
    },
    {
      name: 'Seeds',
      description: 'Reproducible challenge. Share your seed with friends!',
      seed: Date.now(),
      difficulty: 1.2,
    },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {modes.map((mode) => (
        <button
          key={mode.name}
          onClick={() => onModeSelect(mode)}
          className="group relative bg-gray-900 border-2 border-cyan-400 rounded-lg p-6 hover:border-magenta-400 hover:shadow-[0_0_30px_rgba(255,0,255,0.5)] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-magenta-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
          
          <h3 className="text-2xl font-bold text-cyan-400 group-hover:text-magenta-400 mb-2 relative z-10">
            {mode.name}
          </h3>
          
          <p className="text-gray-300 text-sm mb-4 relative z-10">
            {mode.description}
          </p>
          
          <div className="flex gap-2 text-xs relative z-10">
            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">
              Difficulty: {mode.difficulty}x
            </span>
            {mode.duration && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
                {mode.duration}s
              </span>
            )}
            {mode.seed && (
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
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
  const [highScore, setHighScore] = useState(0);
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
    <div className="min-h-screen bg-[#0a0e27] text-white">
      {/* Header */}
      <header className="border-b-2 border-cyan-400 bg-black/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            <span className="text-cyan-400">FAIL</span>
            <span className="text-magenta-400 ml-2">FRENZY</span>
          </h1>
          
          <div className="flex gap-4 text-sm">
            <div className="px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded">
              High Score: <span className="font-bold">{highScore}</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {!selectedMode ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4 glitch-text">
                SELECT GAME MODE
              </h2>
              <p className="text-gray-400">
                Choose your challenge and master the art of failing forward!
              </p>
            </div>
            
            <GameModeSelector onModeSelect={handleModeSelect} />
          </>
        ) : (
          <>
            <div className="mb-4">
              <button
                onClick={handleBackToMenu}
                className="px-4 py-2 bg-gray-800 border border-gray-600 rounded hover:border-cyan-400 transition"
              >
                ← Back to Menu
              </button>
            </div>
            
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-cyan-400 mb-2">
                {selectedMode.name} Mode
              </h2>
              <p className="text-gray-400">{selectedMode.description}</p>
            </div>
            
            <div className="flex justify-center">
              <GameCanvas
                mode={selectedMode}
                onGameOver={handleGameOver}
              />
            </div>
            
            {lastScore && (
              <div className="mt-8 text-center">
                <div className="inline-block bg-gradient-to-r from-cyan-500/20 to-magenta-500/20 border-2 border-cyan-400 rounded-lg p-6">
                  <h3 className="text-2xl font-bold text-cyan-400 mb-4">GAME OVER</h3>
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-gray-400 text-sm">SCORE</div>
                      <div className="text-3xl font-bold text-white">{lastScore.score}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">FAILS</div>
                      <div className="text-3xl font-bold text-white">{lastScore.fails}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">TIME</div>
                      <div className="text-3xl font-bold text-white">{lastScore.time.toFixed(1)}s</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t-2 border-cyan-400 bg-black/50 backdrop-blur mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-400 text-sm">
          <p>FAIL FRENZY v1.0.0 - Premium Edition</p>
          <p className="mt-2">Built with Cloudflare Workers • React 19 • Canvas API</p>
        </div>
      </footer>
    </div>
  );
};
