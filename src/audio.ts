/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let soundEnabled = true;

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function isSoundEnabled() {
  return soundEnabled;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return null;
  return new AudioCtx();
}

/**
 * Play a synthesized sound of tearing paper/foil
 */
export function playTearPack() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const noise = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    // Noise buffer
    const bufferSize = ctx.sampleRate * 0.25; // 0.25 seconds
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    noise.buffer = noiseBuffer;
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
    filter.Q.value = 5.0;

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(1e-4, ctx.currentTime + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + 0.25);
  } catch (e) {
    console.warn('Audio play failure:', e);
  }
}

/**
 * Play a synthesized paper-flipping rustle sound
 */
export function playPageFlip() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const bufferSize = ctx.sampleRate * 0.35; // 0.35 seconds
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.35);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(1e-4, ctx.currentTime + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.warn('Audio play failure:', e);
  }
}

/**
 * Play a sound made when peeling a sticker from its back sheet
 */
export function playPeel() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(1e-4, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.warn('Audio play failure:', e);
  }
}

/**
 * Play a satisfied pop/glue sound when we snap a sticker into its slot
 */
export function playGlue() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // A cute retro synthetic click/pop + a tiny high-pitched chime
    const oscPop = ctx.createOscillator();
    const gainPop = ctx.createGain();

    oscPop.type = 'sine';
    oscPop.frequency.setValueAtTime(150, ctx.currentTime);
    oscPop.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);

    gainPop.gain.setValueAtTime(0.4, ctx.currentTime);
    gainPop.gain.linearRampToValueAtTime(1e-4, ctx.currentTime + 0.08);

    oscPop.connect(gainPop);
    gainPop.connect(ctx.destination);

    oscPop.start();
    oscPop.stop(ctx.currentTime + 0.08);

    // Chime
    const oscChime = ctx.createOscillator();
    const gainChime = ctx.createGain();

    oscChime.type = 'triangle';
    oscChime.frequency.setValueAtTime(800, ctx.currentTime + 0.04);
    oscChime.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);

    gainChime.gain.setValueAtTime(0.0, ctx.currentTime);
    gainChime.gain.setValueAtTime(0.12, ctx.currentTime + 0.04);
    gainChime.gain.linearRampToValueAtTime(1e-4, ctx.currentTime + 0.3);

    oscChime.connect(gainChime);
    gainChime.connect(ctx.destination);

    oscChime.start();
    oscChime.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.warn('Audio play failure:', e);
  }
}

/**
 * Play a low refusal buzzer sound when an invalid glue occurs or a duplicate is rejected
 */
export function playRefuse() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(1e-4, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.warn('Audio play failure:', e);
  }
}

/**
 * Triumph chime melody of complete collection
 */
export function playSuccess() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // Octaves of C major triad
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);

      gain.gain.setValueAtTime(0.0, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + index * 0.1);
      gain.gain.linearRampToValueAtTime(1e-4, ctx.currentTime + index * 0.1 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + index * 0.1 + 0.5);
    });
  } catch (e) {
    console.warn('Audio play failure:', e);
  }
}

/**
 * Play a synthesized Brazilian stadium crowd celebration & goal horns
 */
export function playGoalCrowd() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // 1. Crowd Cheer (White noise passing through resonant bandpass filters)
    const bufferSize = ctx.sampleRate * 3.0; // 3 seconds crowd celebration length
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const crowdNode = ctx.createBufferSource();
    crowdNode.buffer = noiseBuffer;

    const crowdFilter = ctx.createBiquadFilter();
    crowdFilter.type = 'bandpass';
    crowdFilter.frequency.setValueAtTime(550, now);
    crowdFilter.frequency.exponentialRampToValueAtTime(1100, now + 0.25);
    crowdFilter.frequency.exponentialRampToValueAtTime(750, now + 1.4);
    crowdFilter.Q.setValueAtTime(1.2, now);

    const crowdGain = ctx.createGain();
    crowdGain.gain.setValueAtTime(0, now);
    crowdGain.gain.linearRampToValueAtTime(0.35, now + 0.15); // Instant burst!
    crowdGain.gain.exponentialRampToValueAtTime(0.18, now + 1.2);
    crowdGain.gain.linearRampToValueAtTime(1e-4, now + 3.0);

    crowdNode.connect(crowdFilter);
    crowdFilter.connect(crowdGain);
    crowdGain.connect(ctx.destination);
    crowdNode.start(now);
    crowdNode.stop(now + 3.0);

    // 2. Heavy Stadium Drum Kick / Stomp Rumble
    const stompOsc = ctx.createOscillator();
    const stompGain = ctx.createGain();
    stompOsc.type = 'sine';
    stompOsc.frequency.setValueAtTime(110, now);
    stompOsc.frequency.exponentialRampToValueAtTime(25, now + 0.45);

    stompGain.gain.setValueAtTime(0.4, now);
    stompGain.gain.linearRampToValueAtTime(1e-4, now + 0.5);

    stompOsc.connect(stompGain);
    stompGain.connect(ctx.destination);
    stompOsc.start(now);
    stompOsc.stop(now + 0.5);

    // 3. Cheerful Stadium Air Horns (G, C, E triad with LFO vibrato)
    const freqs = [392.00, 523.25, 659.25];
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(14, now); // Vibrato rate 14Hz
      lfoGain.gain.setValueAtTime(20, now); // Dev scale
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(0.06, now + 0.1);
      oscGain.gain.linearRampToValueAtTime(0.06, now + 1.2);
      oscGain.gain.linearRampToValueAtTime(1e-4, now + 1.8);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(ctx.destination);

      lfo.start(now);
      osc.start(now);
      lfo.stop(now + 1.8);
      osc.stop(now + 1.8);
    });

  } catch (e) {
    console.warn('Goal sound failure:', e);
  }
}

