/**
 * FAIL FRENZY - Premium Audio System
 * Web Audio API with procedural sound generation
 */

export class AudioSystem {
  private context: AudioContext;
  private masterGain: GainNode;
  private soundCache: Map<string, AudioBuffer>;
  private musicSource: AudioBufferSourceNode | null;
  private volume: number;
  private musicVolume: number;
  private sfxVolume: number;
  private enabled: boolean;
  
  constructor() {
    this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
    
    this.soundCache = new Map();
    this.musicSource = null;
    
    this.volume = 0.7;
    this.musicVolume = 0.5;
    this.sfxVolume = 0.8;
    this.enabled = true;
    
    this.updateVolume();
  }
  
  // Update master volume
  private updateVolume(): void {
    this.masterGain.gain.value = this.volume;
  }
  
  // Create oscillator node
  private createOscillator(
    type: OscillatorType,
    frequency: number,
    duration: number
  ): AudioBufferSourceNode {
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    
    gainNode.gain.setValueAtTime(this.sfxVolume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.context.currentTime + duration
    );
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    return oscillator as any;
  }
  
  // Play fail sound (deep bass hit)
  public playFail(): void {
    if (!this.enabled) return;
    
    const now = this.context.currentTime;
    
    // Bass hit
    const bass = this.context.createOscillator();
    const bassGain = this.context.createGain();
    bass.type = 'sine';
    bass.frequency.setValueAtTime(100, now);
    bass.frequency.exponentialRampToValueAtTime(20, now + 0.3);
    
    bassGain.gain.setValueAtTime(this.sfxVolume, now);
    bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    bass.connect(bassGain);
    bassGain.connect(this.masterGain);
    
    bass.start(now);
    bass.stop(now + 0.3);
    
    // Noise burst
    const noise = this.createNoiseBuffer(0.1);
    const noiseSource = this.context.createBufferSource();
    const noiseGain = this.context.createGain();
    
    noiseSource.buffer = noise;
    noiseGain.gain.setValueAtTime(this.sfxVolume * 0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    noiseSource.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    
    noiseSource.start(now);
  }
  
  // Play collect sound (bright chime)
  public playCollect(): void {
    if (!this.enabled) return;
    
    const now = this.context.currentTime;
    const frequencies = [523.25, 659.25, 783.99]; // C, E, G
    
    frequencies.forEach((freq, i) => {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const delay = i * 0.05;
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.5, now + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.3);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(now + delay);
      osc.stop(now + delay + 0.3);
    });
  }
  
  // Play dodge sound (swoosh)
  public playDodge(): void {
    if (!this.enabled) return;
    
    const now = this.context.currentTime;
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    
    gain.gain.setValueAtTime(this.sfxVolume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.15);
  }
  
  // Play combo sound (ascending notes)
  public playCombo(comboCount: number): void {
    if (!this.enabled) return;
    
    const now = this.context.currentTime;
    const baseFreq = 440 * Math.pow(2, comboCount / 12);
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'square';
    osc.frequency.value = baseFreq;
    
    gain.gain.setValueAtTime(this.sfxVolume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.2);
  }
  
  // Play game over sound (descending)
  public playGameOver(): void {
    if (!this.enabled) return;
    
    const now = this.context.currentTime;
    const frequencies = [523.25, 493.88, 440, 392]; // C, B, A, G
    
    frequencies.forEach((freq, i) => {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      
      osc.type = 'triangle';
      osc.frequency.value = freq;
      
      const delay = i * 0.15;
      gain.gain.setValueAtTime(this.sfxVolume * 0.4, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.4);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(now + delay);
      osc.stop(now + delay + 0.4);
    });
  }
  
  // Play success sound (victory fanfare)
  public playSuccess(): void {
    if (!this.enabled) return;
    
    const now = this.context.currentTime;
    const melody = [
      { freq: 523.25, duration: 0.15 }, // C
      { freq: 659.25, duration: 0.15 }, // E
      { freq: 783.99, duration: 0.15 }, // G
      { freq: 1046.5, duration: 0.4 },  // C (high)
    ];
    
    let time = now;
    melody.forEach(note => {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = note.freq;
      
      gain.gain.setValueAtTime(this.sfxVolume * 0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + note.duration);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(time);
      osc.stop(time + note.duration);
      
      time += note.duration;
    });
  }
  
  // Play background music (procedural ambient)
  public playBackgroundMusic(): void {
    if (!this.enabled || this.musicSource) return;
    
    const duration = 60; // 60 seconds loop
    const buffer = this.createMusicBuffer(duration);
    
    this.musicSource = this.context.createBufferSource();
    const musicGain = this.context.createGain();
    
    this.musicSource.buffer = buffer;
    this.musicSource.loop = true;
    musicGain.gain.value = this.musicVolume;
    
    this.musicSource.connect(musicGain);
    musicGain.connect(this.masterGain);
    
    this.musicSource.start(0);
  }
  
  // Stop background music
  public stopBackgroundMusic(): void {
    if (this.musicSource) {
      this.musicSource.stop();
      this.musicSource = null;
    }
  }
  
  // Create noise buffer
  private createNoiseBuffer(duration: number): AudioBuffer {
    const sampleRate = this.context.sampleRate;
    const bufferSize = sampleRate * duration;
    const buffer = this.context.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
  }
  
  // Create procedural music buffer
  private createMusicBuffer(duration: number): AudioBuffer {
    const sampleRate = this.context.sampleRate;
    const bufferSize = sampleRate * duration;
    const buffer = this.context.createBuffer(2, bufferSize, sampleRate);
    
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    // Generate ambient pad
    const frequencies = [130.81, 164.81, 196.00, 261.63]; // C3, E3, G3, C4
    
    for (let i = 0; i < bufferSize; i++) {
      let sample = 0;
      const t = i / sampleRate;
      
      frequencies.forEach(freq => {
        sample += Math.sin(2 * Math.PI * freq * t) * 0.1;
        sample += Math.sin(2 * Math.PI * freq * 2 * t) * 0.05; // Harmonic
      });
      
      // Add subtle modulation
      sample *= 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.2 * t);
      
      leftChannel[i] = sample;
      rightChannel[i] = sample * 0.9; // Slight stereo
    }
    
    return buffer;
  }
  
  // Volume controls
  public setMasterVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.updateVolume();
  }
  
  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
  }
  
  public setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }
  
  public getMasterVolume(): number {
    return this.volume;
  }
  
  public getMusicVolume(): number {
    return this.musicVolume;
  }
  
  public getSFXVolume(): number {
    return this.sfxVolume;
  }
  
  // Enable/disable audio
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled && this.musicSource) {
      this.stopBackgroundMusic();
    }
  }
  
  public isEnabled(): boolean {
    return this.enabled;
  }
  
  // Resume audio context (required for user interaction)
  public async resume(): Promise<void> {
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
  }
}

// Singleton instance
export const audioSystem = new AudioSystem();
