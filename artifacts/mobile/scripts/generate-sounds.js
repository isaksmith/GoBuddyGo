#!/usr/bin/env node
// Generates synthesized car sound WAV files into assets/sounds/
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "../assets/sounds");
fs.mkdirSync(OUT, { recursive: true });

const SAMPLE_RATE = 22050;

function makeWav(samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  return buf;
}

function env(t, total, attack = 0.05, release = 0.15) {
  if (t < attack) return t / attack;
  if (t > total - release) return (total - t) / release;
  return 1;
}

function save(name, samples) {
  const file = path.join(OUT, name);
  fs.writeFileSync(file, makeWav(samples));
  console.log(`✓ ${name} (${samples.length} samples)`);
}

// 1. VROOM — low growling engine roar (sawtooth + low-pass style)
function vroom() {
  const dur = 1.2;
  const n = Math.floor(dur * SAMPLE_RATE);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const freq = 60 + 30 * Math.sin(Math.PI * t / dur); // slight pitch rise
    const phase = (i * freq / SAMPLE_RATE) % 1;
    const saw = 2 * phase - 1;
    // Add harmonics for growl
    const h2 = Math.sin(2 * Math.PI * freq * 2 * t) * 0.4;
    const h3 = Math.sin(2 * Math.PI * freq * 3 * t) * 0.2;
    s[i] = (saw * 0.5 + h2 + h3) * env(t, dur, 0.05, 0.2) * 0.55;
  }
  return s;
}

// 2. BEEP — classic car horn (two stacked sine waves)
function beep() {
  const dur = 0.6;
  const n = Math.floor(dur * SAMPLE_RATE);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    s[i] = (
      Math.sin(2 * Math.PI * 440 * t) * 0.5 +
      Math.sin(2 * Math.PI * 880 * t) * 0.3
    ) * env(t, dur, 0.01, 0.08) * 0.7;
  }
  return s;
}

// 3. SIREN — alternating high/low police siren
function siren() {
  const dur = 1.5;
  const n = Math.floor(dur * SAMPLE_RATE);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const cycle = 0.6;
    const phase = (t % cycle) / cycle;
    const freq = phase < 0.5 ? 800 + 600 * (phase * 2) : 1400 - 600 * ((phase - 0.5) * 2);
    s[i] = Math.sin(2 * Math.PI * freq * t) * 0.6 * env(t, dur, 0.05, 0.1);
  }
  return s;
}

// 4. ZOOM — rising whoosh
function zoom() {
  const dur = 0.7;
  const n = Math.floor(dur * SAMPLE_RATE);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / dur;
    const freq = 200 + 2000 * progress * progress;
    const noise = (Math.random() * 2 - 1) * 0.15;
    s[i] = (Math.sin(2 * Math.PI * freq * t) * 0.5 + noise) * env(t, dur, 0.02, 0.3);
  }
  return s;
}

// 5. SCREECH — tire squeal (noise band around mid-high freq)
function screech() {
  const dur = 0.9;
  const n = Math.floor(dur * SAMPLE_RATE);
  const s = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const baseFreq = 1200 + 400 * Math.sin(2 * Math.PI * 18 * t);
    phase += baseFreq / SAMPLE_RATE;
    const tone = Math.sin(2 * Math.PI * phase);
    const noise = (Math.random() * 2 - 1) * 0.4;
    s[i] = (tone * 0.5 + noise) * env(t, dur, 0.01, 0.25) * 0.55;
  }
  return s;
}

// 6. REV — engine revving up (increasing pitch)
function rev() {
  const dur = 1.3;
  const n = Math.floor(dur * SAMPLE_RATE);
  const s = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / dur;
    const freq = 80 + 180 * progress * progress;
    phase += freq / SAMPLE_RATE;
    const saw = ((phase % 1) * 2 - 1);
    const h2 = Math.sin(2 * Math.PI * freq * 2 * t) * 0.3;
    s[i] = (saw * 0.5 + h2) * env(t, dur, 0.03, 0.15) * 0.55;
  }
  return s;
}

// 7. CRASH — noise burst with decay
function crash() {
  const dur = 0.9;
  const n = Math.floor(dur * SAMPLE_RATE);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const noise = Math.random() * 2 - 1;
    const tone = Math.sin(2 * Math.PI * 120 * t) * 0.5;
    const decay = Math.exp(-t * 6);
    s[i] = (noise * 0.6 + tone * 0.4) * decay * 0.8;
  }
  return s;
}

// 8. THUNK — door slam (low thud)
function thunk() {
  const dur = 0.5;
  const n = Math.floor(dur * SAMPLE_RATE);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const tone = Math.sin(2 * Math.PI * 90 * t) * 0.7;
    const noise = (Math.random() * 2 - 1) * 0.3;
    const decay = Math.exp(-t * 12);
    s[i] = (tone + noise) * decay * 0.8;
  }
  return s;
}

// 9. WIN — happy ascending chime
function win() {
  const notes = [523, 659, 784, 1047];
  const noteDur = 0.18;
  const totalDur = notes.length * noteDur + 0.2;
  const n = Math.floor(totalDur * SAMPLE_RATE);
  const s = new Float32Array(n);
  notes.forEach((freq, idx) => {
    const start = Math.floor(idx * noteDur * SAMPLE_RATE);
    const end = Math.floor((idx * noteDur + noteDur) * SAMPLE_RATE);
    for (let i = start; i < end && i < n; i++) {
      const t = (i - start) / SAMPLE_RATE;
      const tone = Math.sin(2 * Math.PI * freq * t) * 0.6;
      const h2 = Math.sin(2 * Math.PI * freq * 2 * t) * 0.15;
      const e = env(t, noteDur, 0.01, 0.08);
      s[i] += (tone + h2) * e;
    }
  });
  return s;
}

// 10. RUMBLE — low road rumble
function rumble() {
  const dur = 1.0;
  const n = Math.floor(dur * SAMPLE_RATE);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const freq = 45 + 15 * Math.sin(2 * Math.PI * 4 * t);
    const saw = ((i * freq / SAMPLE_RATE) % 1) * 2 - 1;
    const noise = (Math.random() * 2 - 1) * 0.2;
    s[i] = (saw * 0.5 + noise) * env(t, dur, 0.05, 0.2) * 0.5;
  }
  return s;
}

// 11. HONK — deep truck horn
function honk() {
  const dur = 0.8;
  const n = Math.floor(dur * SAMPLE_RATE);
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    s[i] = (
      Math.sin(2 * Math.PI * 220 * t) * 0.5 +
      Math.sin(2 * Math.PI * 275 * t) * 0.35 +
      Math.sin(2 * Math.PI * 330 * t) * 0.2
    ) * env(t, dur, 0.02, 0.12) * 0.65;
  }
  return s;
}

// 12. RACE — race start (rising engine roar)
function race() {
  const dur = 1.5;
  const n = Math.floor(dur * SAMPLE_RATE);
  const s = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / dur;
    const freq = 60 + 200 * progress;
    phase += freq / SAMPLE_RATE;
    const saw = (phase % 1) * 2 - 1;
    const h2 = Math.sin(2 * Math.PI * freq * 2 * t) * 0.35;
    const h3 = Math.sin(2 * Math.PI * freq * 3 * t) * 0.15;
    s[i] = (saw * 0.5 + h2 + h3) * env(t, dur, 0.03, 0.1) * 0.55;
  }
  return s;
}

save("vroom.wav", vroom());
save("beep.wav", beep());
save("siren.wav", siren());
save("zoom.wav", zoom());
save("screech.wav", screech());
save("rev.wav", rev());
save("crash.wav", crash());
save("thunk.wav", thunk());
save("win.wav", win());
save("rumble.wav", rumble());
save("honk.wav", honk());
save("race.wav", race());

console.log("\nAll sounds generated in assets/sounds/");
