
/**
 * Simple Sound Service using Web Audio API to avoid external asset dependencies
 */
class SoundService {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1) {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Playful "pop" sound for selection
  playSelect() {
    this.playTone(600, 'sine', 0.1, 0.05);
  }

  // Success "chirp" for correct/submit
  playSuccess() {
    this.playTone(800, 'sine', 0.1, 0.1);
    setTimeout(() => this.playTone(1000, 'sine', 0.1, 0.1), 50);
  }

  // Warning tone for timeout
  playWarning() {
    this.playTone(400, 'triangle', 0.3, 0.1);
    setTimeout(() => this.playTone(300, 'triangle', 0.3, 0.1), 100);
  }

  // Completion fanfare
  playFanfare() {
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.4, 0.1), i * 150);
    });
  }
}

export const soundService = new SoundService();
