/**
 * FAIL FRENZY PREMIUM v4.0 - Game Engine with Premium Asset Rendering
 * Full sprite-based rendering with neon effects overlay
 */

import { GameEngine, Entity, GameState } from '../engine/GameEngine';
import { NeonRenderer } from '../engine/NeonRenderer';
import { PhysicsSystem } from '../engine/PhysicsSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { ComboSystem } from '../systems/ComboSystem';
import { DifficultySystem } from '../systems/DifficultySystem';
import { ParticleSystem } from '../systems/ParticleSystem';
import { PowerUpSystem, PowerUp } from '../systems/PowerUpSystem';
import { AssetLoader } from './AssetLoader';

export interface GameMode {
  name: string;
  description: string;
  duration?: number;
  seed?: number;
  difficulty: number;
}

export class FailFrenzyGame {
  private engine: GameEngine;
  private renderer: NeonRenderer;
  private physics: PhysicsSystem;
  
  // Premium systems
  private audio: AudioSystem;
  private combo: ComboSystem;
  private difficulty: DifficultySystem;
  private particles: ParticleSystem;
  private powerups: PowerUpSystem;
  
  // Asset loader
  private assets: AssetLoader;
  
  private player: Entity | null;
  private obstacles: Entity[];
  private collectibles: Entity[];
  private activePowerUps: PowerUp[];
  
  private mode: GameMode;
  private spawnTimer: number;
  private powerUpSpawnTimer: number;
  private nearMissDistance: number = 50;
  
  // Visual state
  private screenFlash: { color: string; alpha: number } | null = null;
  private backgroundPulse: number = 0;
  private difficultyLabel: string = 'EASY';
  private showDifficultyLabel: number = 0;
  
  // Hit effects
  private hitEffects: Array<{ x: number; y: number; alpha: number; scale: number; rotation: number }> = [];
  
  // localStorage
  private highScores: Map<string, number> = new Map();
  
  constructor(canvasId: string, mode: GameMode, assets: AssetLoader) {
    this.assets = assets;
    
    this.engine = new GameEngine(canvasId, {
      width: 800,
      height: 600,
      fps: 60,
      backgroundColor: '#050818',
      debug: false,
    });
    
    this.renderer = new NeonRenderer(
      this.engine['ctx'],
      this.engine['config'].width,
      this.engine['config'].height
    );
    
    this.physics = new PhysicsSystem({ x: 0, y: 0 }, 0.98);
    
    // Initialize premium systems
    this.audio = new AudioSystem();
    this.audio.init();
    this.combo = new ComboSystem();
    this.difficulty = new DifficultySystem({
      baseSpeed: 200,
      maxSpeed: 550,
      baseSpawnRate: 2.0,
      minSpawnRate: 0.4,
    });
    this.particles = new ParticleSystem(800);
    this.powerups = new PowerUpSystem();
    
    this.player = null;
    this.obstacles = [];
    this.collectibles = [];
    this.activePowerUps = [];
    
    this.mode = mode;
    this.spawnTimer = 0;
    this.powerUpSpawnTimer = 0;
    
    this.loadHighScores();
    this.init();
  }
  
  private init(): void {
    this.createPlayer();
    this.engine.addSystem(this.updateGameLogic.bind(this));
    this.engine.addSystem(this.renderGame.bind(this));
    this.setupInputHandlers();
    
    if (this.mode.seed !== undefined) {
      this.seedRandom(this.mode.seed);
    }
    
    this.engine.setState({
      mode: this.getModeType(),
      seed: this.mode.seed,
    });
    
    // Setup combo callbacks
    this.combo.onCombo((level, count) => {
      if (count > 0 && count % 10 === 0) {
        this.screenFlash = { color: this.combo.getLevelColor(), alpha: 0.3 };
        this.audio.playCombo(count);
      }
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
      x: 120,
      y: 300,
      width: 48,
      height: 48,
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      alive: true,
      color: NeonRenderer.COLORS.CYAN,
      components: new Map<string, any>([
        ['maxSpeed', 500],
        ['collisionShape', 'circle'],
        ['mass', 1],
        ['invincible', false],
        ['ghost', false],
      ]),
    };
    this.engine.addEntity(this.player);
  }
  
  private setupInputHandlers(): void {
    let isPressed = false;
    let targetY = 300;
    let targetX = 120;
    
    this.engine.on('input', (data: any) => {
      if (!this.player || this.engine.getState().isGameOver) return;
      
      if (data.type === 'touchstart' || data.type === 'mousedown') {
        isPressed = true;
        targetY = data.y;
        targetX = data.x;
      } else if (data.type === 'touchmove' || data.type === 'mousemove') {
        if (isPressed) {
          targetY = data.y;
          targetX = data.x;
        }
      } else if (data.type === 'touchend' || data.type === 'mouseup') {
        isPressed = false;
      }
      
      if (isPressed && this.player) {
        // Smooth follow for both axes on mobile
        this.player.y += (targetY - this.player.y) * 0.15;
        this.player.x += (targetX - this.player.x) * 0.08;
      }
    });
    
    this.engine.on('keyboard', (data: any) => {
      if (!this.player) return;
      
      const speed = 12;
      if (data.type === 'keydown') {
        switch (data.key) {
          case 'ArrowUp': case 'w': case 'z':
            this.player.velocity.y = -speed;
            break;
          case 'ArrowDown': case 's':
            this.player.velocity.y = speed;
            break;
          case 'ArrowLeft': case 'a': case 'q':
            this.player.velocity.x = -speed;
            break;
          case 'ArrowRight': case 'd':
            this.player.velocity.x = speed;
            break;
          case ' ':
            if (this.engine.getState().isGameOver) {
              this.restart();
            }
            break;
          case 'Escape':
            if (this.engine.getState().isPaused) {
              this.engine.resume();
            } else {
              this.engine.pause();
            }
            break;
        }
      }
    });
  }
  
  private updateGameLogic(dt: number): void {
    const state = this.engine.getState();
    if (state.isGameOver) return;
    
    // Time trial check
    if (this.mode.duration && state.time >= this.mode.duration) {
      this.gameOver(true);
      return;
    }
    
    // Update all systems
    this.difficulty.progressTime(dt);
    this.combo.update(dt);
    this.particles.update(dt);
    this.powerups.update(dt);
    
    // Check difficulty label change
    const newLabel = this.difficulty.getDifficultyLabel();
    if (newLabel !== this.difficultyLabel) {
      this.difficultyLabel = newLabel;
      this.showDifficultyLabel = 2.0;
      this.screenFlash = { color: this.difficulty.getDifficultyColor(), alpha: 0.2 };
    }
    if (this.showDifficultyLabel > 0) this.showDifficultyLabel -= dt;
    
    // Update screen flash
    if (this.screenFlash) {
      this.screenFlash.alpha -= dt * 2;
      if (this.screenFlash.alpha <= 0) this.screenFlash = null;
    }
    
    // Update hit effects
    for (let i = this.hitEffects.length - 1; i >= 0; i--) {
      const fx = this.hitEffects[i];
      fx.alpha -= dt * 3;
      fx.scale += dt * 4;
      fx.rotation += dt * 5;
      if (fx.alpha <= 0) this.hitEffects.splice(i, 1);
    }
    
    // Background pulse
    this.backgroundPulse = Math.sin(state.time * 2) * 0.03;
    
    // Spawn obstacles
    this.spawnTimer += dt;
    const spawnInterval = this.difficulty.getSpawnInterval();
    if (this.spawnTimer >= spawnInterval) {
      this.spawnObstacle();
      this.spawnTimer = 0;
    }
    
    // Spawn power-ups
    this.powerUpSpawnTimer += dt;
    if (this.powerUpSpawnTimer >= 8 + Math.random() * 7) {
      this.spawnPowerUp();
      this.powerUpSpawnTimer = 0;
    }
    
    // Update entities
    if (this.player) this.updatePlayer(dt);
    this.updateObstacles(dt);
    this.updateCollectibles(dt);
    this.checkCollisions();
    this.constrainPlayer();
    
    // Sync score
    this.engine.setState({ score: this.combo.getScore() });
  }
  
  private updatePlayer(dt: number): void {
    if (!this.player) return;
    
    this.player.velocity.x *= 0.88;
    this.player.velocity.y *= 0.88;
    
    // Pulse effect based on combo
    const comboState = this.combo.getState();
    const pulseIntensity = 0.05 + comboState.current * 0.002;
    this.player.scale = 1 + Math.sin(this.engine.getState().time * 4) * pulseIntensity;
    
    // Player trail
    if (Math.abs(this.player.velocity.x) > 1 || Math.abs(this.player.velocity.y) > 1) {
      this.particles.trail(this.player.x, this.player.y, this.player.color);
    }
  }
  
  private updateObstacles(dt: number): void {
    const speed = this.difficulty.getObstacleSpeed();
    
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.x -= speed * dt;
      obstacle.rotation += dt * 2;
      
      // Sine wave movement for some obstacles
      const moveType = obstacle.components.get('moveType');
      if (moveType === 'sine') {
        obstacle.y += Math.sin(this.engine.getState().time * 3 + i) * 1.5;
      }
      
      if (obstacle.x < -100) {
        this.engine.removeEntity(obstacle.id);
        this.obstacles.splice(i, 1);
        
        // Check near miss
        if (this.player) {
          const dist = Math.abs(this.player.y - obstacle.y);
          if (dist < this.nearMissDistance) {
            this.combo.addScore('nearMiss', this.player.x + 40, this.player.y);
            this.difficulty.recordDodge();
            this.audio.playDodge();
            this.particles.sparkle(this.player.x, this.player.y, NeonRenderer.COLORS.YELLOW);
          } else {
            this.combo.addScore('dodge', this.player.x + 40, this.player.y);
            this.difficulty.recordDodge();
            this.audio.playDodge();
          }
        }
      }
    }
  }
  
  private updateCollectibles(dt: number): void {
    const speed = this.difficulty.getObstacleSpeed();
    
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const collectible = this.collectibles[i];
      collectible.x -= speed * dt;
      collectible.y += Math.sin(this.engine.getState().time * 3 + i) * 1.5;
      collectible.rotation += dt * 3;
      
      if (collectible.x < -100) {
        this.engine.removeEntity(collectible.id);
        this.collectibles.splice(i, 1);
      }
    }
  }
  
  private spawnObstacle(): void {
    const types = ['fire', 'classic', 'fire'];
    const type = types[Math.floor(Math.random() * types.length)];
    const size = 36 + Math.random() * 20;
    const y = 40 + Math.random() * 520;
    const moveType = Math.random() < 0.25 ? 'sine' : 'linear';
    
    const obstacle: Entity = {
      id: `obs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'obstacle',
      x: 850,
      y,
      width: size,
      height: size,
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      rotation: Math.random() * Math.PI,
      scale: 1,
      alive: true,
      color: type === 'fire' ? NeonRenderer.COLORS.ORANGE : NeonRenderer.COLORS.CYAN,
      components: new Map<string, any>([
        ['collisionShape', 'circle'],
        ['obstacleType', type],
        ['moveType', moveType],
      ]),
    };
    
    this.engine.addEntity(obstacle);
    this.obstacles.push(obstacle);
    
    // Collectible chance
    if (Math.random() < 0.2) {
      this.spawnCollectible(y);
    }
  }
  
  private spawnCollectible(avoidY: number): void {
    let y = 50 + Math.random() * 500;
    while (Math.abs(y - avoidY) < 80) {
      y = 50 + Math.random() * 500;
    }
    
    const collectible: Entity = {
      id: `col-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'collectible',
      x: 850,
      y,
      width: 24,
      height: 24,
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      alive: true,
      color: NeonRenderer.COLORS.YELLOW,
      components: new Map<string, any>([['collisionShape', 'circle']]),
    };
    
    this.engine.addEntity(collectible);
    this.collectibles.push(collectible);
  }
  
  private spawnPowerUp(): void {
    const y = 60 + Math.random() * 480;
    const powerUp: Entity = {
      id: `pw-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'powerup',
      x: 850,
      y,
      width: 36,
      height: 36,
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      rotation: 0,
      scale: 1,
      alive: true,
      color: NeonRenderer.COLORS.GREEN,
      components: new Map<string, any>([
        ['collisionShape', 'circle'],
        ['powerType', ['shield', 'slowmo', 'multiplier', 'shrink'][Math.floor(Math.random() * 4)]],
      ]),
    };
    
    this.engine.addEntity(powerUp);
    this.collectibles.push(powerUp);
  }
  
  private checkCollisions(): void {
    if (!this.player) return;
    
    const isInvincible = this.player.components.get('invincible');
    const isGhost = this.player.components.get('ghost');
    
    // Obstacle collisions
    for (const obstacle of this.obstacles) {
      if (this.simpleCollision(this.player, obstacle)) {
        if (!isInvincible && !isGhost) {
          // Spawn hit effect at collision point
          this.spawnHitEffect(
            (this.player.x + obstacle.x) / 2,
            (this.player.y + obstacle.y) / 2
          );
          this.onFail();
          return;
        } else {
          // Destroy obstacle if invincible
          this.spawnHitEffect(obstacle.x, obstacle.y);
          this.particles.explosion(obstacle.x, obstacle.y, obstacle.color);
          this.audio.playFail();
          obstacle.alive = false;
        }
      }
    }
    
    // Collectible collisions
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      if (this.simpleCollision(this.player, col)) {
        if (col.type === 'powerup') {
          this.activatePowerUp(col);
        } else {
          this.collectItem(col);
        }
        this.collectibles.splice(i, 1);
        this.engine.removeEntity(col.id);
      }
    }
    
    // Clean dead obstacles
    this.obstacles = this.obstacles.filter(o => o.alive);
  }
  
  private spawnHitEffect(x: number, y: number): void {
    this.hitEffects.push({
      x,
      y,
      alpha: 1.0,
      scale: 0.5,
      rotation: Math.random() * Math.PI * 2,
    });
  }
  
  private simpleCollision(a: Entity, b: Entity): boolean {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < (a.width / 2 + b.width / 2) * 0.75;
  }
  
  private collectItem(collectible: Entity): void {
    this.combo.addScore('collect', collectible.x, collectible.y);
    this.particles.sparkle(collectible.x, collectible.y, NeonRenderer.COLORS.YELLOW);
    this.audio.playCollect();
  }
  
  private activatePowerUp(powerUp: Entity): void {
    const type = powerUp.components.get('powerType') || 'shield';
    this.combo.addScore('powerup', powerUp.x, powerUp.y);
    this.particles.explosion(powerUp.x, powerUp.y, NeonRenderer.COLORS.GREEN);
    this.audio.playPowerUp();
    this.screenFlash = { color: NeonRenderer.COLORS.GREEN, alpha: 0.25 };
    
    if (type === 'shield' && this.player) {
      this.player.components.set('invincible', true);
      this.player.color = NeonRenderer.COLORS.GREEN;
      setTimeout(() => {
        if (this.player) {
          this.player.components.set('invincible', false);
          this.player.color = NeonRenderer.COLORS.CYAN;
        }
      }, 5000);
    } else if (type === 'slowmo') {
      this.difficulty.setLevel(Math.max(0.1, this.difficulty.getState().level - 0.3));
    } else if (type === 'shrink' && this.player) {
      const origW = this.player.width;
      const origH = this.player.height;
      this.player.width *= 0.6;
      this.player.height *= 0.6;
      setTimeout(() => {
        if (this.player) {
          this.player.width = origW;
          this.player.height = origH;
        }
      }, 6000);
    }
  }
  
  private onFail(): void {
    if (!this.player) return;
    const state = this.engine.getState();
    
    this.engine.setState({ fails: state.fails + 1 });
    this.combo.breakCombo();
    this.difficulty.recordFail();
    
    // Effects
    this.engine.shake(25);
    this.particles.explosion(this.player.x, this.player.y, NeonRenderer.COLORS.RED);
    this.renderer.spawnShockwave(this.player.x, this.player.y, NeonRenderer.COLORS.RED);
    this.audio.playFail();
    this.screenFlash = { color: '#ff0033', alpha: 0.4 };
    
    // Game over check
    const modeType = this.getModeType();
    if (modeType === 'classic' && state.fails >= 2) {
      this.gameOver(false);
    } else if (modeType === 'infinite') {
      this.player.x = 120;
      this.player.y = 300;
    }
  }
  
  private constrainPlayer(): void {
    if (!this.player) return;
    const pad = this.player.width / 2;
    const w = this.engine['config'].width;
    const h = this.engine['config'].height;
    
    this.player.x = Math.max(pad, Math.min(w - pad, this.player.x));
    this.player.y = Math.max(pad, Math.min(h - pad, this.player.y));
  }
  
  // ==================== PREMIUM RENDERING ====================
  
  private renderGame(): void {
    const ctx = this.engine['ctx'];
    const state = this.engine.getState();
    const w = this.engine['config'].width;
    const h = this.engine['config'].height;
    
    // Dynamic background
    this.renderer.update(1/60);
    
    // Draw subtle animated grid
    this.renderBackground(ctx, w, h, state.time);
    
    // Screen flash
    if (this.screenFlash) {
      ctx.save();
      ctx.globalAlpha = this.screenFlash.alpha;
      ctx.fillStyle = this.screenFlash.color;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
    
    // Render obstacles with sprite images
    this.renderObstacles(ctx, state.time);
    
    // Render collectibles
    this.renderCollectibles(ctx, state.time);
    
    // Render player with sprite
    this.renderPlayer(ctx, state.time);
    
    // Render hit effects (spark sprites)
    this.renderHitEffects(ctx);
    
    // Render particles
    this.particles.render(ctx, this.renderer);
    
    // Render shockwaves
    this.renderer.drawShockwaves();
    
    // Render combo floating texts
    this.combo.render(ctx);
    
    // Render scanlines overlay
    this.renderScanlines(ctx, w, h);
    
    // Render UI
    this.renderUI(ctx, state, w, h);
  }
  
  private renderBackground(ctx: CanvasRenderingContext2D, w: number, h: number, time: number): void {
    // Dark gradient base
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#050818');
    bgGrad.addColorStop(0.5, '#0a0e27');
    bgGrad.addColorStop(1, '#050818');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);
    
    // Animated grid
    ctx.save();
    ctx.globalAlpha = 0.06 + this.backgroundPulse;
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 0.5;
    
    const gridSize = 50;
    const offsetX = (time * 20) % gridSize;
    
    for (let x = -offsetX; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
    
    // Horizon glow
    ctx.save();
    const horizonGrad = ctx.createRadialGradient(w / 2, h, 0, w / 2, h, h * 0.8);
    horizonGrad.addColorStop(0, 'rgba(0,240,255,0.04)');
    horizonGrad.addColorStop(0.5, 'rgba(255,0,255,0.02)');
    horizonGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = horizonGrad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
  
  private renderScanlines(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.save();
    ctx.globalAlpha = 0.04;
    for (let y = 0; y < h; y += 3) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, y, w, 1);
    }
    ctx.restore();
  }
  
  private renderObstacles(ctx: CanvasRenderingContext2D, time: number): void {
    for (const obstacle of this.obstacles) {
      const type = obstacle.components.get('obstacleType');
      const imgKey = type === 'fire' ? 'obstacle_fire' : 'obstacle_classic';
      const img = this.assets.get(imgKey);
      
      ctx.save();
      ctx.translate(obstacle.x, obstacle.y);
      ctx.rotate(obstacle.rotation);
      
      const drawSize = obstacle.width * 1.8; // Sprites are bigger than hitbox for visual impact
      const pulse = 1 + Math.sin(time * 3 + obstacle.x * 0.01) * 0.08;
      const finalSize = drawSize * pulse;
      
      if (img) {
        // Glow aura behind sprite
        ctx.save();
        ctx.globalAlpha = 0.3 + Math.sin(time * 4) * 0.1;
        ctx.shadowBlur = 25;
        ctx.shadowColor = obstacle.color;
        ctx.drawImage(img, -finalSize / 2, -finalSize / 2, finalSize, finalSize);
        ctx.restore();
        
        // Main sprite
        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.drawImage(img, -finalSize / 2, -finalSize / 2, finalSize, finalSize);
        ctx.restore();
      } else {
        // Fallback: neon circle
        ctx.shadowBlur = 15;
        ctx.shadowColor = obstacle.color;
        ctx.fillStyle = obstacle.color;
        ctx.beginPath();
        ctx.arc(0, 0, obstacle.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      
      ctx.restore();
    }
  }
  
  private renderCollectibles(ctx: CanvasRenderingContext2D, time: number): void {
    for (const col of this.collectibles) {
      ctx.save();
      ctx.translate(col.x, col.y);
      ctx.rotate(col.rotation);
      ctx.scale(col.scale, col.scale);
      
      if (col.type === 'powerup') {
        // Power-up: use neon glow target sprite
        const img = this.assets.get('powerup_neon');
        const drawSize = col.width * 2.0;
        const pulse = 1 + Math.sin(time * 5) * 0.15;
        const finalSize = drawSize * pulse;
        
        if (img) {
          // Rainbow glow
          ctx.save();
          ctx.globalAlpha = 0.4 + Math.sin(time * 3) * 0.15;
          ctx.shadowBlur = 30;
          ctx.shadowColor = '#ff00ff';
          ctx.drawImage(img, -finalSize / 2, -finalSize / 2, finalSize, finalSize);
          ctx.restore();
          
          // Main sprite
          ctx.drawImage(img, -finalSize / 2, -finalSize / 2, finalSize, finalSize);
          
          // Power type indicator
          const pType = col.components.get('powerType') || '';
          const icon = pType === 'shield' ? 'S' : pType === 'slowmo' ? 'T' : pType === 'multiplier' ? 'X' : '-';
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#fff';
          ctx.fillText(icon, 0, 0);
          ctx.shadowBlur = 0;
        } else {
          // Fallback hexagon
          ctx.shadowBlur = 20;
          ctx.shadowColor = NeonRenderer.COLORS.GREEN;
          ctx.fillStyle = NeonRenderer.COLORS.GREEN;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const x = (col.width / 2) * Math.cos(angle);
            const y = (col.width / 2) * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      } else {
        // Collectible: small glowing star with neon effect
        const pulse = 1 + Math.sin(time * 6 + col.x * 0.1) * 0.2;
        const size = col.width * pulse;
        
        // Glow
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = NeonRenderer.COLORS.YELLOW;
        ctx.fillStyle = NeonRenderer.COLORS.YELLOW;
        
        // Star shape
        const spikes = 5;
        const outerR = size / 2;
        const innerR = size / 4;
        let rot = -Math.PI / 2;
        const step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(Math.cos(rot) * outerR, Math.sin(rot) * outerR);
        for (let i = 0; i < spikes; i++) {
          ctx.lineTo(Math.cos(rot) * outerR, Math.sin(rot) * outerR);
          rot += step;
          ctx.lineTo(Math.cos(rot) * innerR, Math.sin(rot) * innerR);
          rot += step;
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      }
      
      ctx.restore();
    }
  }
  
  private renderPlayer(ctx: CanvasRenderingContext2D, time: number): void {
    if (!this.player) return;
    
    const isInvincible = this.player.components.get('invincible');
    const img = this.assets.get('player');
    
    ctx.save();
    ctx.translate(this.player.x, this.player.y);
    ctx.scale(this.player.scale, this.player.scale);
    
    const drawSize = this.player.width * 2.2;
    
    if (img) {
      // Energy aura
      ctx.save();
      const auraSize = drawSize * (1.3 + Math.sin(time * 4) * 0.1);
      const auraGrad = ctx.createRadialGradient(0, 0, drawSize * 0.2, 0, 0, auraSize / 2);
      auraGrad.addColorStop(0, this.player.color + '40');
      auraGrad.addColorStop(0.6, this.player.color + '15');
      auraGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = auraGrad;
      ctx.fillRect(-auraSize / 2, -auraSize / 2, auraSize, auraSize);
      ctx.restore();
      
      // Shield ring when invincible
      if (isInvincible) {
        ctx.save();
        ctx.globalAlpha = 0.6 + Math.sin(time * 8) * 0.3;
        ctx.strokeStyle = NeonRenderer.COLORS.GREEN;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20;
        ctx.shadowColor = NeonRenderer.COLORS.GREEN;
        ctx.beginPath();
        ctx.arc(0, 0, drawSize / 2 + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      
      // Glow layer
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.shadowBlur = 30;
      ctx.shadowColor = this.player.color;
      ctx.drawImage(img, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
      ctx.restore();
      
      // Main player sprite
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.drawImage(img, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
      ctx.restore();
    } else {
      // Fallback: neon circle
      const glowSize = isInvincible ? 30 : 22;
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
      gradient.addColorStop(0, this.player.color + 'cc');
      gradient.addColorStop(0.5, this.player.color + '44');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(-glowSize, -glowSize, glowSize * 2, glowSize * 2);
      
      ctx.shadowBlur = 20;
      ctx.shadowColor = this.player.color;
      ctx.fillStyle = this.player.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.player.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    
    ctx.restore();
  }
  
  private renderHitEffects(ctx: CanvasRenderingContext2D): void {
    const img = this.assets.get('hit_spark');
    if (!img) return;
    
    for (const fx of this.hitEffects) {
      ctx.save();
      ctx.translate(fx.x, fx.y);
      ctx.rotate(fx.rotation);
      ctx.globalAlpha = fx.alpha;
      
      const size = 80 * fx.scale;
      
      // Glow behind
      ctx.save();
      ctx.shadowBlur = 40;
      ctx.shadowColor = '#00f0ff';
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.restore();
      
      // Main effect
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      
      ctx.restore();
    }
  }
  
  private renderUI(ctx: CanvasRenderingContext2D, state: GameState, w: number, h: number): void {
    // Score (top center)
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = NeonRenderer.COLORS.CYAN;
    ctx.font = 'bold 22px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = NeonRenderer.COLORS.CYAN;
    ctx.fillText(`${state.score}`, w / 2, 35);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#ffffff88';
    ctx.fillText('SCORE', w / 2, 52);
    ctx.shadowBlur = 0;
    ctx.restore();
    
    // Fails / Lives (top left)
    const modeType = this.getModeType();
    if (modeType === 'classic') {
      const maxFails = 3;
      ctx.save();
      ctx.font = '12px monospace';
      ctx.fillStyle = '#ffffff88';
      ctx.fillText('LIVES', 20, 25);
      for (let i = 0; i < maxFails; i++) {
        const alive = i >= state.fails;
        ctx.fillStyle = alive ? NeonRenderer.COLORS.RED : '#333';
        ctx.shadowBlur = alive ? 8 : 0;
        ctx.shadowColor = NeonRenderer.COLORS.RED;
        ctx.beginPath();
        ctx.arc(30 + i * 25, 42, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    }
    
    // Combo meter (top right)
    const comboState = this.combo.getState();
    if (comboState.current > 0) {
      this.combo.renderComboMeter(ctx, w - 180, 15, 160, 20);
      
      ctx.save();
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = this.combo.getLevelColor();
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.combo.getLevelColor();
      ctx.fillText(this.combo.getLevelName(), w - 20, 55);
      ctx.shadowBlur = 0;
      ctx.restore();
    }
    
    // Difficulty label (center, fading)
    if (this.showDifficultyLabel > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, this.showDifficultyLabel);
      ctx.font = 'bold 28px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = this.difficulty.getDifficultyColor();
      ctx.shadowBlur = 20;
      ctx.shadowColor = this.difficulty.getDifficultyColor();
      ctx.fillText(this.difficultyLabel, w / 2, h / 2 - 40);
      ctx.shadowBlur = 0;
      ctx.restore();
    }
    
    // Time (Time Trial)
    if (this.mode.duration) {
      const remaining = Math.max(0, this.mode.duration - state.time);
      ctx.save();
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = remaining < 10 ? NeonRenderer.COLORS.RED : NeonRenderer.COLORS.GREEN;
      ctx.shadowBlur = 8;
      ctx.shadowColor = ctx.fillStyle;
      ctx.fillText(`${remaining.toFixed(1)}s`, w - 20, h - 20);
      ctx.shadowBlur = 0;
      ctx.restore();
    }
    
    // Game Over
    if (state.isGameOver) {
      this.renderGameOver(ctx, state, w, h);
    }
  }
  
  private renderGameOver(ctx: CanvasRenderingContext2D, state: GameState, w: number, h: number): void {
    // Dark overlay
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, w, h);
    
    // Banner image if available
    const bannerImg = this.assets.get('banner_gameover');
    if (bannerImg) {
      ctx.save();
      ctx.globalAlpha = 0.15;
      const bannerH = h * 0.6;
      const bannerW = bannerH * (bannerImg.width / bannerImg.height);
      ctx.drawImage(bannerImg, (w - bannerW) / 2, (h - bannerH) / 2, bannerW, bannerH);
      ctx.restore();
    }
    
    // GAME OVER text
    ctx.shadowBlur = 30;
    ctx.shadowColor = NeonRenderer.COLORS.RED;
    ctx.font = 'bold 40px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = NeonRenderer.COLORS.RED;
    ctx.fillText('GAME OVER', w / 2, h / 2 - 60);
    
    // Stats
    ctx.shadowBlur = 10;
    ctx.shadowColor = NeonRenderer.COLORS.CYAN;
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = NeonRenderer.COLORS.CYAN;
    ctx.fillText(`SCORE: ${state.score}`, w / 2, h / 2);
    
    const stats = this.combo.getStats();
    ctx.font = '14px monospace';
    ctx.fillStyle = NeonRenderer.COLORS.YELLOW;
    ctx.fillText(`MAX COMBO: ${stats.maxCombo}x`, w / 2, h / 2 + 30);
    ctx.fillStyle = NeonRenderer.COLORS.MAGENTA;
    ctx.fillText(`NEAR MISSES: ${stats.nearMisses}`, w / 2, h / 2 + 55);
    
    // High score
    const highScore = this.highScores.get(this.mode.name) || 0;
    if (state.score > highScore) {
      ctx.fillStyle = NeonRenderer.COLORS.GOLD || '#ffd700';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('NEW HIGH SCORE!', w / 2, h / 2 + 85);
    }
    
    // Restart prompt
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#ffffff';
    ctx.font = '14px monospace';
    ctx.fillStyle = '#ffffff';
    const blink = Math.sin(Date.now() / 300) > 0;
    if (blink) {
      ctx.fillText('PRESS SPACE OR TAP TO RESTART', w / 2, h / 2 + 120);
    }
    
    ctx.restore();
  }
  
  private gameOver(success: boolean): void {
    this.engine.setState({ isGameOver: true });
    
    if (success) {
      this.audio.playSuccess();
      if (this.player) this.particles.confetti(this.player.x, this.player.y);
    } else {
      this.audio.playGameOver();
    }
    
    // Save high score
    const score = this.combo.getScore();
    const current = this.highScores.get(this.mode.name) || 0;
    if (score > current) {
      this.highScores.set(this.mode.name, score);
      this.saveHighScores();
    }
  }
  
  private loadHighScores(): void {
    try {
      const data = localStorage.getItem('failfrenzy_highscores');
      if (data) {
        const parsed = JSON.parse(data);
        this.highScores = new Map(Object.entries(parsed));
      }
    } catch (e) { /* ignore */ }
  }
  
  private saveHighScores(): void {
    try {
      const obj: Record<string, number> = {};
      this.highScores.forEach((v, k) => obj[k] = v);
      localStorage.setItem('failfrenzy_highscores', JSON.stringify(obj));
    } catch (e) { /* ignore */ }
  }
  
  private seedRandom(seed: number): void {
    let s = seed;
    Math.random = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }
  
  // Public API
  public start(): void {
    this.engine.start();
    // Audio will be initialized on first user interaction
    const startAudio = () => {
      this.audio.init().then(() => this.audio.startMusic());
      document.removeEventListener('click', startAudio);
      document.removeEventListener('touchstart', startAudio);
      document.removeEventListener('keydown', startAudio);
    };
    document.addEventListener('click', startAudio, { once: true });
    document.addEventListener('touchstart', startAudio, { once: true });
    document.addEventListener('keydown', startAudio, { once: true });
  }
  public stop(): void { this.engine.stop(); this.audio.stopMusic(); }
  public pause(): void { this.engine.pause(); }
  public resume(): void { this.engine.resume(); }
  
  public restart(): void {
    this.engine.reset();
    this.obstacles = [];
    this.collectibles = [];
    this.activePowerUps = [];
    this.hitEffects = [];
    this.spawnTimer = 0;
    this.powerUpSpawnTimer = 0;
    this.combo.reset();
    this.difficulty.reset();
    this.particles.clear();
    this.screenFlash = null;
    this.difficultyLabel = 'EASY';
    this.showDifficultyLabel = 0;
    this.createPlayer();
  }
  
  public getState(): GameState { return this.engine.getState(); }
  public getHighScore(): number { return this.highScores.get(this.mode.name) || 0; }
  
  public destroy(): void {
    this.engine.destroy();
    this.audio.stopMusic();
  }
}
