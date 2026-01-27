/**
 * FAIL FRENZY - Neon Glitch Pop Renderer
 * Premium rendering system with glow, scanlines, chromatic aberration
 */

export interface NeonStyle {
  glowIntensity: number;
  glowColor: string;
  scanlineOpacity: number;
  chromaticAberration: number;
  bloomStrength: number;
}

export class NeonRenderer {
  private ctx: CanvasRenderingContext2D;
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private style: NeonStyle;
  
  // Neon colors
  public static COLORS = {
    CYAN: '#00ffff',
    MAGENTA: '#ff00ff',
    YELLOW: '#ffff00',
    GREEN: '#00ff00',
    ORANGE: '#ff6600',
    BLUE: '#0066ff',
    RED: '#ff0066',
  };
  
  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    
    // Create offscreen canvas for post-processing
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d')!;
    
    this.style = {
      glowIntensity: 10,
      glowColor: NeonRenderer.COLORS.CYAN,
      scanlineOpacity: 0.1,
      chromaticAberration: 2,
      bloomStrength: 0.5,
    };
  }
  
  // Draw neon line with glow
  public drawNeonLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    width: number = 2
  ): void {
    const ctx = this.ctx;
    
    // Outer glow
    ctx.save();
    ctx.shadowBlur = this.style.glowIntensity * 2;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = width + 4;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
    
    // Inner glow
    ctx.save();
    ctx.shadowBlur = this.style.glowIntensity;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = width + 2;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
    
    // Core line
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }
  
  // Draw neon circle with glow
  public drawNeonCircle(
    x: number,
    y: number,
    radius: number,
    color: string,
    fill: boolean = false
  ): void {
    const ctx = this.ctx;
    
    // Outer glow
    ctx.save();
    ctx.shadowBlur = this.style.glowIntensity * 2;
    ctx.shadowColor = color;
    
    if (fill) {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    
    // Inner glow
    ctx.save();
    ctx.shadowBlur = this.style.glowIntensity;
    ctx.shadowColor = color;
    
    if (fill) {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    
    // Core
    ctx.save();
    if (fill) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  
  // Draw neon rectangle with glow
  public drawNeonRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    fill: boolean = false
  ): void {
    const ctx = this.ctx;
    
    // Outer glow
    ctx.save();
    ctx.shadowBlur = this.style.glowIntensity * 2;
    ctx.shadowColor = color;
    
    if (fill) {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(x - 2, y - 2, width + 4, height + 4);
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.globalAlpha = 0.3;
      ctx.strokeRect(x, y, width, height);
    }
    ctx.restore();
    
    // Inner glow
    ctx.save();
    ctx.shadowBlur = this.style.glowIntensity;
    ctx.shadowColor = color;
    
    if (fill) {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(x - 1, y - 1, width + 2, height + 2);
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      ctx.strokeRect(x, y, width, height);
    }
    ctx.restore();
    
    // Core
    ctx.save();
    if (fill) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, width, height);
    } else {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
    }
    ctx.restore();
  }
  
  // Draw neon text with glow
  public drawNeonText(
    text: string,
    x: number,
    y: number,
    color: string,
    font: string = '24px "Press Start 2P"'
  ): void {
    const ctx = this.ctx;
    
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Outer glow
    ctx.save();
    ctx.shadowBlur = this.style.glowIntensity * 2;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.3;
    ctx.fillText(text, x, y);
    ctx.restore();
    
    // Inner glow
    ctx.save();
    ctx.shadowBlur = this.style.glowIntensity;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.fillText(text, x, y);
    ctx.restore();
    
    // Core text
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x, y);
    ctx.restore();
  }
  
  // Draw glitch effect
  public drawGlitch(
    x: number,
    y: number,
    width: number,
    height: number,
    intensity: number = 0.5
  ): void {
    const ctx = this.ctx;
    const slices = Math.floor(Math.random() * 5) + 3;
    
    for (let i = 0; i < slices; i++) {
      if (Math.random() > intensity) continue;
      
      const sliceY = y + (height / slices) * i;
      const sliceHeight = height / slices;
      const offset = (Math.random() - 0.5) * 20;
      
      try {
        const imageData = ctx.getImageData(x, sliceY, width, sliceHeight);
        ctx.putImageData(imageData, x + offset, sliceY);
      } catch (e) {
        // Ignore security errors for cross-origin images
      }
      
      // Add color distortion
      if (Math.random() > 0.5) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = Math.random() > 0.5 ? NeonRenderer.COLORS.CYAN : NeonRenderer.COLORS.MAGENTA;
        ctx.fillRect(x + offset, sliceY, width, sliceHeight);
        ctx.restore();
      }
    }
  }
  
  // Draw scanlines overlay
  public drawScanlines(): void {
    const ctx = this.ctx;
    const lineHeight = 2;
    
    ctx.save();
    ctx.globalAlpha = this.style.scanlineOpacity;
    ctx.fillStyle = '#000000';
    
    for (let y = 0; y < this.height; y += lineHeight * 2) {
      ctx.fillRect(0, y, this.width, lineHeight);
    }
    
    ctx.restore();
  }
  
  // Draw particle with trail
  public drawParticle(
    x: number,
    y: number,
    size: number,
    color: string,
    alpha: number = 1,
    trail: boolean = false
  ): void {
    const ctx = this.ctx;
    
    if (trail) {
      // Draw trail
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'transparent');
      
      ctx.save();
      ctx.globalAlpha = alpha * 0.3;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    // Draw particle
    ctx.save();
    ctx.shadowBlur = this.style.glowIntensity;
    ctx.shadowColor = color;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  
  // Draw grid background
  public drawGrid(cellSize: number = 50, color: string = NeonRenderer.COLORS.CYAN): void {
    const ctx = this.ctx;
    
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.1;
    
    // Vertical lines
    for (let x = 0; x < this.width; x += cellSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < this.height; y += cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
    
    ctx.restore();
  }
  
  // Apply chromatic aberration effect
  public applyChromaticAberration(intensity: number = 2): void {
    if (intensity <= 0) return;
    
    const ctx = this.ctx;
    
    try {
      // Get current image data
      const imageData = ctx.getImageData(0, 0, this.width, this.height);
      const data = imageData.data;
      
      // Create temporary arrays for each channel
      const redChannel = new Uint8ClampedArray(data.length / 4);
      const greenChannel = new Uint8ClampedArray(data.length / 4);
      const blueChannel = new Uint8ClampedArray(data.length / 4);
      
      // Extract channels
      for (let i = 0; i < data.length; i += 4) {
        const idx = i / 4;
        redChannel[idx] = data[i];
        greenChannel[idx] = data[i + 1];
        blueChannel[idx] = data[i + 2];
      }
      
      // Apply offset to red and blue channels
      const offset = Math.floor(intensity);
      
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const idx = y * this.width + x;
          const pixelIdx = idx * 4;
          
          // Red channel offset left
          const redIdx = y * this.width + Math.max(0, x - offset);
          data[pixelIdx] = redChannel[redIdx];
          
          // Green channel no offset
          data[pixelIdx + 1] = greenChannel[idx];
          
          // Blue channel offset right
          const blueIdx = y * this.width + Math.min(this.width - 1, x + offset);
          data[pixelIdx + 2] = blueChannel[blueIdx];
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    } catch (e) {
      // Ignore errors
    }
  }
  
  // Set neon style
  public setStyle(style: Partial<NeonStyle>): void {
    this.style = { ...this.style, ...style };
  }
  
  // Get random neon color
  public static getRandomColor(): string {
    const colors = Object.values(NeonRenderer.COLORS);
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
