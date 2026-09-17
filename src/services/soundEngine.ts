/**
 * Web Audio API Engine for BookVibe
 * Provides realistic procedural ambient soundscapes and algorithmic generative music
 * with smooth fade-out / fade-in for sleep timer and inactivity detection.
 */

type PresetType = 'mystic' | 'melancholy' | 'epic' | 'ambient' | 'lofi' | 'tension';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Active ambient nodes
  private ambientSources: Map<string, { source: AudioNode; gain: GainNode; interval?: number }> = new Map();

  // Music sequence generator
  private musicInterval: number | null = null;
  private currentPreset: PresetType = 'ambient';
  private isMusicPlaying = false;
  private isMuted = false;

  // Volumes
  private masterVol = 0.8;
  private musicVol = 0.65;
  private ambientVol = 0.55;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVol, this.ctx.currentTime);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVol, this.ctx.currentTime);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.ambientVol, this.ctx.currentTime);

      this.musicGain.connect(this.masterGain);
      this.ambientGain.connect(this.masterGain);

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Ambient Generators ---

  private createNoiseBuffer(duration = 5): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext missing');
    const sampleRate = this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(2, sampleRate * duration, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    for (let i = 0; i < buffer.length; i++) {
      left[i] = Math.random() * 2 - 1;
      right[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  public startAmbient(type: string, volume = 0.5) {
    this.initContext();
    if (!this.ctx || !this.ambientGain) return;

    this.stopAmbient(type);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 1.2);
    gain.connect(this.ambientGain);

    if (type === 'rain') {
      // Pink/brown filtered noise with slow resonant filter
      const buffer = this.createNoiseBuffer(5);
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter1 = this.ctx.createBiquadFilter();
      filter1.type = 'lowpass';
      filter1.frequency.value = 900;

      const filter2 = this.ctx.createBiquadFilter();
      filter2.type = 'highpass';
      filter2.frequency.value = 180;

      source.connect(filter1);
      filter1.connect(filter2);
      filter2.connect(gain);
      source.start();

      this.ambientSources.set(type, { source, gain });
    } else if (type === 'fireplace') {
      // Filtered noise with periodic crackling pops
      const buffer = this.createNoiseBuffer(4);
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;

      source.connect(filter);
      filter.connect(gain);
      source.start();

      // Random crackles
      const crackleInterval = window.setInterval(() => {
        if (!this.ctx || !this.ambientGain) return;
        if (Math.random() > 0.4) {
          const osc = this.ctx.createOscillator();
          const popGain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(200 + Math.random() * 600, this.ctx.currentTime);
          popGain.gain.setValueAtTime(0.08 + Math.random() * 0.12, this.ctx.currentTime);
          popGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);

          osc.connect(popGain);
          popGain.connect(gain);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.06);
        }
      }, 250);

      this.ambientSources.set(type, { source, gain, interval: crackleInterval });
    } else if (type === 'library') {
      // Warm quiet room tone + subtle drone
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, this.ctx.currentTime);

      const buffer = this.createNoiseBuffer(3);
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 600;
      noiseFilter.Q.value = 2.0;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.value = 0.04;
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(gain);

      const oscGain = this.ctx.createGain();
      oscGain.gain.value = 0.02;
      osc.connect(oscGain);
      oscGain.connect(gain);

      osc.start();
      noise.start();

      this.ambientSources.set(type, { source: osc, gain });
    } else if (type === 'cosmic') {
      // Cosmic drone with deep detuned sines
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(73.42, this.ctx.currentTime); // D2
      osc2.frequency.setValueAtTime(74.0, this.ctx.currentTime); // Detuned D2

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 250;

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);

      osc1.start();
      osc2.start();

      this.ambientSources.set(type, { source: osc1, gain });
    } else if (type === 'cafe') {
      // Mellow warm background sound
      const buffer = this.createNoiseBuffer(4);
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 450;
      filter.Q.value = 1.0;

      source.connect(filter);
      filter.connect(gain);
      source.start();

      this.ambientSources.set(type, { source, gain });
    }
  }

  public stopAmbient(type: string) {
    const item = this.ambientSources.get(type);
    if (!item || !this.ctx) return;

    if (item.interval) {
      clearInterval(item.interval);
    }

    item.gain.gain.setValueAtTime(item.gain.gain.value, this.ctx.currentTime);
    item.gain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);

    setTimeout(() => {
      try {
        if ('stop' in item.source && typeof item.source.stop === 'function') {
          item.source.stop();
        }
        item.gain.disconnect();
      } catch {
        // ignore already stopped
      }
      this.ambientSources.delete(type);
    }, 900);
  }

  public isAmbientActive(type: string): boolean {
    return this.ambientSources.has(type);
  }

  // --- Generative Music Synthesis ---

  private playTone(freq: number, duration: number, preset: PresetType) {
    if (!this.ctx || !this.musicGain) return;

    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    const now = this.ctx.currentTime;

    if (preset === 'mystic') {
      osc.type = 'sine';
      filter.type = 'lowpass';
      filter.frequency.value = 650;
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.18, now + 1.2);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (preset === 'melancholy') {
      osc.type = 'triangle';
      filter.type = 'lowpass';
      filter.frequency.value = 900;
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.2, now + 0.15);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (preset === 'epic') {
      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.value = 450;
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.12, now + 1.5);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (preset === 'lofi') {
      osc.type = 'triangle';
      filter.type = 'lowpass';
      filter.frequency.value = 500;
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.15, now + 0.3);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else if (preset === 'tension') {
      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.value = 220;
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.16, now + 0.8);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } else {
      // ambient default
      osc.type = 'sine';
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.15, now + 0.8);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    }

    osc.frequency.setValueAtTime(freq, now);

    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + duration + 0.1);
  }

  public startMusic(preset: PresetType) {
    this.initContext();
    this.currentPreset = preset;
    this.isMusicPlaying = true;

    if (this.musicInterval) {
      clearInterval(this.musicInterval);
    }

    // Scale notes based on preset mood
    const scales: Record<PresetType, number[]> = {
      mystic: [146.83, 174.61, 220.0, 261.63, 293.66, 349.23, 440.0], // D Dorian
      melancholy: [130.81, 155.56, 196.0, 233.08, 261.63, 311.13, 392.0], // C Minor
      epic: [110.0, 164.81, 220.0, 246.94, 329.63, 440.0, 493.88], // A Aeolian
      ambient: [196.0, 220.0, 261.63, 293.66, 329.63, 392.0, 523.25], // G Pentatonic Major
      lofi: [174.61, 220.0, 261.63, 329.63, 392.0, 440.0, 523.25], // Fmaj9 / Am7
      tension: [73.42, 110.0, 116.54, 146.83, 155.56, 220.0], // D Phrygian
    };

    let step = 0;
    const playNextBar = () => {
      if (!this.isMusicPlaying) return;
      const notes = scales[this.currentPreset] || scales.ambient;

      // Play root chord
      const root = notes[step % notes.length];
      const fifth = notes[(step + 2) % notes.length];
      const octave = root * 2;

      this.playTone(root, 4.5, this.currentPreset);
      setTimeout(() => {
        if (this.isMusicPlaying) {
          this.playTone(fifth, 4.0, this.currentPreset);
        }
      }, 700);

      // Play subtle decorative high tone
      if (Math.random() > 0.3) {
        setTimeout(() => {
          if (this.isMusicPlaying) {
            const highNote = notes[Math.floor(Math.random() * notes.length)] * 1.5;
            this.playTone(highNote, 3.5, this.currentPreset);
          }
        }, 1600);
      }

      step++;
    };

    playNextBar();
    this.musicInterval = window.setInterval(playNextBar, 3800);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public setMusicPreset(preset: PresetType) {
    this.currentPreset = preset;
    if (this.isMusicPlaying) {
      this.startMusic(preset);
    }
  }

  // --- Smooth Fade-Out & Sleep Mode Transition ---

  public smoothFadeOut(durationSeconds = 5, onComplete?: () => void) {
    if (!this.ctx || !this.masterGain) {
      if (onComplete) onComplete();
      return;
    }

    const now = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, now + durationSeconds);

    setTimeout(() => {
      this.stopMusic();
      if (onComplete) onComplete();
    }, durationSeconds * 1000);
  }

  public smoothFadeIn(durationSeconds = 2.5) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(0.001, now);
    this.masterGain.gain.linearRampToValueAtTime(this.masterVol, now + durationSeconds);
  }

  // --- Volume Controls ---

  public setMasterVolume(vol: number) {
    this.masterVol = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.masterVol, this.ctx.currentTime);
    }
  }

  public setMusicVolume(vol: number) {
    this.musicVol = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVol, this.ctx.currentTime);
    }
  }

  public setAmbientVolume(vol: number) {
    this.ambientVol = Math.max(0, Math.min(1, vol));
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.ambientVol, this.ctx.currentTime);
    }
  }

  public getVisualizerData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(32);
    const array = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(array);
    return array;
  }

  public getPlaybackStatus() {
    return {
      isMusicPlaying: this.isMusicPlaying,
      currentPreset: this.currentPreset,
      activeAmbients: Array.from(this.ambientSources.keys()),
      masterVol: this.masterVol,
      musicVol: this.musicVol,
      ambientVol: this.ambientVol,
    };
  }
}

export const soundEngine = new SoundEngine();
