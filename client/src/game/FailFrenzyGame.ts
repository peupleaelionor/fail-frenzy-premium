/**
 * FAIL FRENZY - Main Game Implementation
 * Premium game loop with 4 modes: Classic, Time Trial, Infinite, Seeds
 */

import { GameEngine, Entity, GameState } from '../engine/GameEngine';
import { NeonRenderer } from '../engine/NeonRenderer';
import { PhysicsSystem } from '../engine/PhysicsSystem';

export interface GameMode {
  name: string;
  description: string;
  duration?: number; // Time Trial only
  seed?: number; // Seeds mode only
  difficulty: number;
}

export class FailFrenzyGame {
  private engine: GameEngine;
  private renderer: NeonRenderer;
  private physics: PhysicsSystem;
  
  private player: Entity | null;
  private obstacles: Entity[];
  private collectibles: Entity[];
  
  private mode: GameMode;
  private difficulty: number;
  private spawnTimer: number;
  private comboTimer: number;
  
  // Patterns & sequences
  private obstaclePatterns: Array<Array<{ x: number; y: number; type: string }>>;
  private currentPattern: number;
  
  // Audio hooks
  private audioHooks: Map<string, () => void>;
  
  constructor(canvasId: string, mode: GameMode) {
    this.engine = new GameEngine(canvasId, {
      width: 800,
      height: 600,
      fps: 60,
      backgroundColor: '#0a0e27',
      debug: false,
    });
    
    this.renderer = new NeonRenderer(
      this.engine['ctx'],
      this.engine['config'].width,
      this.engine['config'].height
    );
    
    this.physics = new PhysicsSystem({ x: 0, y: 0 }, 0.98);
    
    this.player = null;
    this.obstacles = [];
    this.collectibles = [];
    
    this.mode = mode;
    this.difficulty = mode.difficulty || 1;
    this.spawnTimer = 0;
    this.comboTimer = 0;
    
    this.currentPattern = 0;
    this.obstaclePatterns = this.generateObstaclePatterns();
    
    this.audioHooks = new Map();
    
    this.init();
  }
  
  private init(): void {
    // Create player
    this.createPlayer();
    
    // Setup systems
    this.engine.addSystem(this.updateGameLogic.bind(this));
    this.engine.addSystem(this.renderGame.bind(this));
    
    // Setup input handlers
    this.setupInputHandlers();
    
    // Set initial game state based on mode
    if (this.mode.seed !== undefined) {
      this.seedRandom(this.mode.seed);
    }
    
    this.engine.setState({
      mode: this.getModeType(),
      seed: this.mode.seed,
    });
  }
  
  private getModeType(): 'classic' | 'time-trial' | 'infinite' | 'seed' {
    const name = this.mode.name.toLowerCase();
    if (name.includes('time')) return 'time-trial';
    if (name.includes('infinite')) return 'infinite';
    if (name.includes('seed')) return 'seed';
    return 'classic';
  }
  
  private createPlayer(): void {
    this.player = {
      id: 'player',
      type: 'player',
      x: 100,
      y: 300,
      width: 30,
      height: 30,
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      alive: true,
      color: NeonRenderer.COLORS.CYAN,
      components: new Map([
        ['maxSpeed', 500],
        ['collisionShape', 'circle'],
        ['mass', 1],
      ]),
    };
    
    this.engine.addEntity(this.player);
  }
  
  private setupInputHandlers(): void {
    let isPressed = false;
    let startY = 0;
    
    this.engine.on('input', (data: any) => {
      if (!this.player) return;
      
      if (data.type === 'touchstart' || data.type === 'mousedown') {
        isPressed = true;
        startY = data.y;
      } else if (data.type === 'touchmove' || data.type === 'mousemove') {
        if (isPressed) {
          const targetY = data.y;
          this.player.y += (targetY - this.player.y) * 0.1;
        }
      } else if (data.type === 'touchend' || data.type === 'mouseup') {
        isPressed = false;
      }
    });
    
    this.engine.on('keyboard', (data: any) => {
      if (!this.player) return;
      
      const speed = 10;
      if (data.type === 'keydown') {
        switch (data.key) {
          case 'ArrowUp':
          case 'w':
            this.player.velocity.y = -speed;
            break;
          case 'ArrowDown':
          case 's':
            this.player.velocity.y = speed;
            break;
          case 'ArrowLeft':
          case 'a':
            this.player.velocity.x = -speed;
            break;
          case 'ArrowRight':
          case 'd':
            this.player.velocity.x = speed;
            break;
          case ' ':
            if (this.engine.getState().isGameOver) {
              this.restart();
            }
            break;
        }
      }
    });
  }
  
  private updateGameLogic(dt: number): void {
    const state = this.engine.getState();
    
    // Check game over
    if (state.isGameOver) return;
    
    // Check time limit (Time Trial mode)
    if (this.mode.duration && state.time >= this.mode.duration) {
      this.gameOver(true); // Success
      return;
    }
    
    // Update difficulty
    this.difficulty = 1 + Math.floor(state.time / 30) * 0.2;
    
    // Spawn obstacles
    this.spawnTimer += dt;
    const spawnInterval = Math.max(0.5, 2 - this.difficulty * 0.3);
    
    if (this.spawnTimer >= spawnInterval) {
      this.spawnObstacle();
      this.spawnTimer = 0;
    }
    
    // Update combo timer
    if (state.combo > 0) {
      this.comboTimer += dt;
      if (this.comboTimer >= 5) {
        this.engine.setState({ combo: 0 });
        this.comboTimer = 0;
      }
    }
    
    // Update entities
    if (this.player) {
      this.updatePlayer(dt);
    }
    
    this.updateObstacles(dt);
    this.updateCollectibles(dt);
    
    // Check collisions
    this.checkCollisions();
    
    // Keep player in bounds
    this.constrainPlayer();
  }
  
  private updatePlayer(dt: number): void {
    if (!this.player) return;
    
    // Smooth movement
    this.player.velocity.x *= 0.9;
    this.player.velocity.y *= 0.9;
    
    // Pulse effect
    this.player.scale = 1 + Math.sin(this.engine.getState().time * 4) * 0.1;
  }
  
  private updateObstacles(dt: number): void {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      
      // Move left
      obstacle.x -= (200 + this.difficulty * 50) * dt;
      
      // Rotate
      obstacle.rotation += dt * 2;
      
      // Remove if off-screen
      if (obstacle.x < -100) {
        this.engine.removeEntity(obstacle.id);
        this.obstacles.splice(i, 1);
        
        // Award point for dodge
        const state = this.engine.getState();
        this.engine.setState({ score: state.score + 1 });
        this.playAudio('dodge');
      }
    }
  }
  
  private updateCollectibles(dt: number): void {
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const collectible = this.collectibles[i];
      
      // Move left
      collectible.x -= (200 + this.difficulty * 50) * dt;
      
      // Float effect
      collectible.y += Math.sin(this.engine.getState().time * 3 + i) * 2;
      
      // Rotate
      collectible.rotation += dt * 3;
      
      // Remove if off-screen
      if (collectible.x < -100) {
        this.engine.removeEntity(collectible.id);
        this.collectibles.splice(i, 1);
      }
    }
  }
  
  private spawnObstacle(): void {
    // Use pattern in Seeds mode
    if (this.mode.seed !== undefined) {
      this.spawnPatternObstacle();
      return;
    }
    
    // Random spawn
    const types = ['square', 'triangle', 'diamond'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const size = 30 + Math.random() * 20;
    const y = 50 + Math.random() * 500;
    
    const obstacle: Entity = {
      id: `obstacle-${Date.now()}-${Math.random()}`,
      type: 'obstacle',
      x: 900,
      y,
      width: size,
      height: size,
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      alive: true,
      color: NeonRenderer.COLORS.MAGENTA,
      components: new Map([
        ['collisionShape', type === 'square' ? 'aabb' : 'circle'],
        ['obstacleType', type],
      ]),
    };
    
    this.engine.addEntity(obstacle);
    this.obstacles.push(obstacle);
    
    // Spawn collectible occasionally
    if (Math.random() < 0.2) {
      this.spawnCollectible(y);
    }
  }
  
  private spawnPatternObstacle(): void {
    const pattern = this.obstaclePatterns[this.currentPattern % this.obstaclePatterns.length];
    
    for (const pos of pattern) {
      const obstacle: Entity = {
        id: `obstacle-${Date.now()}-${Math.random()}`,
        type: 'obstacle',
        x: 900 + pos.x,
        y: pos.y,
        width: 30,
        height: 30,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        alive: true,
        color: NeonRenderer.COLORS.MAGENTA,
        components: new Map([
          ['collisionShape', 'circle'],
          ['obstacleType', pos.type],
        ]),
      };
      
      this.engine.addEntity(obstacle);
      this.obstacles.push(obstacle);
    }
    
    this.currentPattern++;
  }
  
  private spawnCollectible(y: number): void {
    const collectible: Entity = {
      id: `collectible-${Date.now()}-${Math.random()}`,
      type: 'collectible',
      x: 900,
      y: y + (Math.random() - 0.5) * 100,
      width: 20,
      height: 20,
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      alive: true,
      color: NeonRenderer.COLORS.YELLOW,
      components: new Map([
        ['collisionShape', 'circle'],
      ]),
    };
    
    this.engine.addEntity(collectible);
    this.collectibles.push(collectible);
  }
  
  private checkCollisions(): void {
    if (!this.player) return;
    
    // Check obstacle collisions
    for (const obstacle of this.obstacles) {
      const collision = this.physics.checkEntityCollision(this.player, obstacle);
      if (collision) {
        this.onFail();
        return;
      }
    }
    
    // Check collectible collisions
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const collectible = this.collectibles[i];
      const collision = this.physics.checkEntityCollision(this.player, collectible);
      if (collision) {
        this.collectItem(collectible);
        this.collectibles.splice(i, 1);
        this.engine.removeEntity(collectible.id);
      }
    }
  }
  
  private collectItem(collectible: Entity): void {
    const state = this.engine.getState();
    
    // Increase combo
    this.engine.setState({
      score: state.score + (10 * (state.combo + 1)),
      combo: state.combo + 1,
    });
    this.comboTimer = 0;
    
    // Effects
    this.engine.spawnParticles(collectible.x, collectible.y, 20, collectible.color);
    this.playAudio('collect');
  }
  
  private onFail(): void {
    if (!this.player) return;
    
    const state = this.engine.getState();
    
    // Increase fail count
    this.engine.setState({
      fails: state.fails + 1,
      combo: 0,
    });
    
    // Effects
    this.engine.shake(20);
    this.engine.spawnParticles(this.player.x, this.player.y, 50, NeonRenderer.COLORS.RED);
    this.playAudio('fail');
    
    // Game over check (Classic mode: 3 fails)
    if (this.mode.name.toLowerCase().includes('classic') && state.fails >= 3) {
      this.gameOver(false);
    }
    
    // In Infinite mode, reset position
    if (this.mode.name.toLowerCase().includes('infinite')) {
      this.player.x = 100;
      this.player.y = 300;
    }
  }
  
  private constrainPlayer(): void {
    if (!this.player) return;
    
    const padding = this.player.width / 2;
    const { width, height } = this.engine['config'];
    
    if (this.player.x < padding) this.player.x = padding;
    if (this.player.x > width - padding) this.player.x = width - padding;
    if (this.player.y < padding) this.player.y = padding;
    if (this.player.y > height - padding) this.player.y = height - padding;
  }
  
  private renderGame(): void {
    // Render grid background
    this.renderer.drawGrid(50, NeonRenderer.COLORS.CYAN);
    
    // Render scanlines
    this.renderer.drawScanlines();
    
    // Render entities
    if (this.player) {
      this.renderer.drawNeonCircle(
        this.player.x,
        this.player.y,
        this.player.width / 2,
        this.player.color,
        true
      );
    }
    
    for (const obstacle of this.obstacles) {
      const type = obstacle.components.get('obstacleType');
      if (type === 'square') {
        this.renderer.drawNeonRect(
          obstacle.x - obstacle.width / 2,
          obstacle.y - obstacle.height / 2,
          obstacle.width,
          obstacle.height,
          obstacle.color
        );
      } else {
        this.renderer.drawNeonCircle(
          obstacle.x,
          obstacle.y,
          obstacle.width / 2,
          obstacle.color
        );
      }
    }
    
    for (const collectible of this.collectibles) {
      this.renderer.drawNeonCircle(
        collectible.x,
        collectible.y,
        collectible.width / 2,
        collectible.color,
        true
      );
    }
    
    // Render UI
    this.renderUI();
  }
  
  private renderUI(): void {
    const state = this.engine.getState();
    const ctx = this.engine['ctx'];
    
    // Score
    this.renderer.drawNeonText(
      `SCORE: ${state.score}`,
      400,
      40,
      NeonRenderer.COLORS.CYAN,
      '20px "Press Start 2P"'
    );
    
    // Fails
    if (!this.mode.name.toLowerCase().includes('infinite')) {
      this.renderer.drawNeonText(
        `FAILS: ${state.fails}/3`,
        400,
        80,
        NeonRenderer.COLORS.MAGENTA,
        '16px "Press Start 2P"'
      );
    }
    
    // Combo
    if (state.combo > 0) {
      this.renderer.drawNeonText(
        `COMBO x${state.combo}`,
        400,
        120,
        NeonRenderer.COLORS.YELLOW,
        '18px "Press Start 2P"'
      );
    }
    
    // Time (Time Trial mode)
    if (this.mode.duration) {
      const remaining = Math.max(0, this.mode.duration - state.time);
      this.renderer.drawNeonText(
        `TIME: ${remaining.toFixed(1)}s`,
        400,
        160,
        NeonRenderer.COLORS.GREEN,
        '16px "Press Start 2P"'
      );
    }
    
    // Game Over
    if (state.isGameOver) {
      this.renderer.drawNeonText(
        'GAME OVER',
        400,
        250,
        NeonRenderer.COLORS.RED,
        '32px "Press Start 2P"'
      );
      this.renderer.drawNeonText(
        'Press SPACE to restart',
        400,
        300,
        NeonRenderer.COLORS.WHITE,
        '14px "Press Start 2P"'
      );
    }
  }
  
  private gameOver(success: boolean): void {
    this.engine.setState({ isGameOver: true });
    this.playAudio(success ? 'success' : 'gameover');
    
    // Save score to backend
    this.saveScore();
  }
  
  private async saveScore(): Promise<void> {
    const state = this.engine.getState();
    
    try {
      await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: 'Player',
          score: state.score,
          mode: this.mode.name,
          fails: state.fails,
          time: state.time,
        }),
      });
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  }
  
  private generateObstaclePatterns(): Array<Array<{ x: number; y: number; type: string }>> {
    return [
      // Pattern 1: Horizontal line
      [
        { x: 0, y: 200, type: 'square' },
        { x: 60, y: 200, type: 'square' },
        { x: 120, y: 200, type: 'square' },
      ],
      // Pattern 2: Vertical wave
      [
        { x: 0, y: 150, type: 'circle' },
        { x: 40, y: 250, type: 'circle' },
        { x: 80, y: 350, type: 'circle' },
      ],
      // Pattern 3: Diamond
      [
        { x: 0, y: 300, type: 'diamond' },
        { x: 50, y: 250, type: 'diamond' },
        { x: 50, y: 350, type: 'diamond' },
        { x: 100, y: 300, type: 'diamond' },
      ],
    ];
  }
  
  private seedRandom(seed: number): void {
    // Seeded random for reproducible gameplay
    let random = seed;
    Math.random = () => {
      random = (random * 9301 + 49297) % 233280;
      return random / 233280;
    };
  }
  
  private playAudio(event: string): void {
    const handler = this.audioHooks.get(event);
    if (handler) handler();
  }
  
  public onAudio(event: string, handler: () => void): void {
    this.audioHooks.set(event, handler);
  }
  
  public start(): void {
    this.engine.start();
  }
  
  public stop(): void {
    this.engine.stop();
  }
  
  public pause(): void {
    this.engine.pause();
  }
  
  public resume(): void {
    this.engine.resume();
  }
  
  public restart(): void {
    this.engine.reset();
    this.obstacles = [];
    this.collectibles = [];
    this.spawnTimer = 0;
    this.comboTimer = 0;
    this.currentPattern = 0;
    this.createPlayer();
  }
  
  public getState(): GameState {
    return this.engine.getState();
  }
  
  public destroy(): void {
    this.engine.destroy();
  }
}
