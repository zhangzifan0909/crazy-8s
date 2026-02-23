
/**
 * Simple Web Audio API service to generate game sound effects without external assets.
 */

class AudioService {
  private ctx: AudioContext | null = null;

  private getCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1) {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }

  playDraw() {
    this.playTone(400, 'sine', 0.1, 0.05);
    setTimeout(() => this.playTone(600, 'sine', 0.1, 0.05), 50);
  }

  playPlay() {
    this.playTone(300, 'triangle', 0.1, 0.1);
  }

  playWin() {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'square', 0.3, 0.05), i * 150);
    });
  }

  playLose() {
    const ctx = this.getCtx();
    [392.00, 349.23, 329.63, 261.63].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sawtooth', 0.4, 0.05), i * 200);
    });
  }
}

export const audioService = new AudioService();
