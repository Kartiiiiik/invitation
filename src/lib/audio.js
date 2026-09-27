// Audio: background music + short sound effects.
// Every file is optional. Missing effects fall back to a synthesised sound,
// and missing music just hides the toggle.

let ctx = null;
const sfx = {};
let music = null;
let musicWanted = true;

function audioCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/** Must be called from inside a user gesture (the gate tap). */
export function unlockAudio() {
  audioCtx();
}

export function preloadSfx(map) {
  for (const [name, src] of Object.entries(map || {})) {
    const a = new Audio();
    a.preload = 'auto';
    a.addEventListener('error', () => (a.dataset.failed = '1'), { once: true });
    a.src = src;
    sfx[name] = a;
  }
}

export function playSfx(name, opts = {}) {
  const { volume = 0.8 } = opts;
  const a = sfx[name];
  const fallback = () => synth[name]?.(opts);
  if (!a || a.dataset.failed) return fallback();
  a.currentTime = 0;
  a.volume = volume;
  a.play().catch(fallback);
}

// ── Synthesised fallbacks ────────────────────────────────────────────────────
const synth = {
  // Temple bell: inharmonic sine partials with long exponential decay.
  bell() {
    const c = audioCtx();
    if (!c) return;
    const t = c.currentTime;
    const out = c.createGain();
    out.gain.value = 0.42;
    out.connect(c.destination);
    const base = 588;
    const partials = [
      [0.5, 0.22, 4.8],
      [1, 1, 4.2],
      [1.004, 0.6, 4.2], // slight detune = shimmering beat
      [2.0, 0.45, 3.0],
      [2.76, 0.32, 2.4],
      [5.4, 0.16, 1.4],
      [8.93, 0.08, 0.8],
    ];
    for (const [ratio, gain, decay] of partials) {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'sine';
      o.frequency.value = base * ratio;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + decay + 0.05);
    }
  },
};

function noise(c, seconds) {
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * seconds), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  return src;
}

function env(c, node, t, peak, decay) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  node.connect(g).connect(c.destination);
  return g;
}

Object.assign(synth, {
  // Balloon pop: short filtered noise crack
  pop() {
    const c = audioCtx();
    if (!c) return;
    const t = c.currentTime;
    const n = noise(c, 0.12);
    const f = c.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 0.8;
    n.connect(f);
    env(c, f, t, 0.9, 0.09);
    n.start(t);
  },
  // Dhol bass side ("dhaa"): pitch-dropping sine + thud. `when`/`level` let the loop schedule it.
  dhaa({ when, level = 1 } = {}) {
    const c = audioCtx();
    if (!c) return;
    const t = when ?? c.currentTime;
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(52, t + 0.35);
    env(c, o, t, 1 * level, 0.55);
    o.start(t); o.stop(t + 0.6);
    const n = noise(c, 0.05);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 900;
    n.connect(lp);
    env(c, lp, t, 0.5 * level, 0.05);
    n.start(t);
  },
  // Dhol treble side ("tin"): bright slap
  tin({ when, level = 1 } = {}) {
    const c = audioCtx();
    if (!c) return;
    const t = when ?? c.currentTime;
    const o = c.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(520, t);
    o.frequency.exponentialRampToValueAtTime(330, t + 0.12);
    env(c, o, t, 0.45 * level, 0.16);
    o.start(t); o.stop(t + 0.2);
    const n = noise(c, 0.08);
    const hp = c.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 2500;
    n.connect(hp);
    env(c, hp, t, 0.35 * level, 0.07);
    n.start(t);
  },
  // Wax seal cracking: a dry snap plus a soft thump
  crack() {
    const c = audioCtx();
    if (!c) return;
    const t = c.currentTime;
    const n = noise(c, 0.09);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 3200; bp.Q.value = 1.4;
    n.connect(bp);
    env(c, bp, t, 0.8, 0.06);
    n.start(t);
    const n2 = noise(c, 0.05);
    const bp2 = c.createBiquadFilter();
    bp2.type = 'bandpass'; bp2.frequency.value = 1900; bp2.Q.value = 2;
    n2.connect(bp2);
    env(c, bp2, t + 0.035, 0.5, 0.04);
    n2.start(t + 0.035);
    const o = c.createOscillator();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(60, t + 0.12);
    env(c, o, t, 0.35, 0.14);
    o.start(t); o.stop(t + 0.16);
  },
  // Little rising sparkle for "found it!"
  sparkle() {
    const c = audioCtx();
    if (!c) return;
    [0, 4, 7, 12, 16].forEach((semi, i) => {
      const t = c.currentTime + i * 0.07;
      const o = c.createOscillator();
      o.type = 'sine'; o.frequency.value = 880 * Math.pow(2, semi / 12);
      env(c, o, t, 0.18, 0.5);
      o.start(t); o.stop(t + 0.55);
    });
  },
});

// ── Sangeet dhol loop ─────────────────────────────────────────────────────────
// Plays `src` (a looping dhol track) if it exists, otherwise a synthesised bhangra
// "chaal" rhythm. Respects the music toggle and pauses while the tab is hidden.
const BPM = 100;
const EIGHTH = 60 / BPM / 2;
// One bar of eighth notes: D = dhaa (bass), t = tin (treble), . = rest
const CHAAL = ['D', '.', '.', 't', 'D', '.', 't', 't'];
let dhol = null;

export function startDhol(src) {
  if (dhol || !musicWanted || document.hidden) return;
  duckMusic(0.2, 600);
  dhol = { file: null, timer: 0, next: 0, step: 0 };
  const synthLoop = () => {
    const c = audioCtx();
    if (!c || !dhol) return;
    dhol.next = c.currentTime + 0.1;
    dhol.timer = setInterval(() => {
      // Schedule a little ahead of time so the beat stays steady
      while (dhol && dhol.next < c.currentTime + 0.2) {
        const hit = CHAAL[dhol.step % CHAAL.length];
        if (hit === 'D') synth.dhaa({ when: dhol.next, level: 0.55 });
        if (hit === 't') synth.tin({ when: dhol.next, level: 0.5 });
        dhol.next += EIGHTH;
        dhol.step++;
      }
    }, 50);
  };
  if (src) {
    const a = new Audio(src);
    a.loop = true;
    a.volume = 0.7;
    dhol.file = a;
    a.play().catch(() => {
      if (!dhol) return;
      dhol.file = null;
      synthLoop();
    });
  } else {
    synthLoop();
  }
}

document.addEventListener('visibilitychange', () => document.hidden && stopDhol());

export function stopDhol() {
  if (!dhol) return;
  clearInterval(dhol.timer);
  dhol.file?.pause();
  dhol = null;
  unduckMusic();
}

// ── Background music ────────────────────────────────────────────────────────
// Volume goes through a Web Audio gain node, because iPhones ignore `audio.volume`
// (that would make fades impossible there). Falls back to `audio.volume` elsewhere.
const MUSIC_LEVEL = 0.55;
let gainNode = null;
let fadedIn = false; // the music stays silent until fadeInMusic() (after the Ganesh card)

/**
 * Must be called from the opening tap (browsers only allow audio after a tap).
 * With `silent: true` the track starts playing at volume 0; call fadeInMusic() later.
 */
export function startMusic(src, toggle, { silent = false } = {}) {
  if (!src || music) return;
  music = new Audio(src);
  music.loop = true;
  music.preload = 'auto';

  const c = audioCtx();
  if (c && c.createMediaElementSource) {
    try {
      gainNode = c.createGain();
      gainNode.gain.value = 0;
      c.createMediaElementSource(music).connect(gainNode).connect(c.destination);
    } catch { gainNode = null; }
  }
  if (!gainNode) music.volume = 0;

  const setPressed = (on) => toggle?.setAttribute('aria-pressed', String(on));

  music
    .play()
    .then(() => {
      if (toggle) toggle.hidden = false;
      setPressed(true);
      if (!silent) fadeInMusic();
    })
    .catch(() => {
      // File missing or blocked: stay silent, keep the toggle hidden.
      music = null;
    });

  toggle?.addEventListener('click', () => {
    if (!music) return;
    musicWanted = music.paused;
    if (musicWanted) {
      audioCtx();
      music.play().catch(() => {});
      fadeTo(fadedIn ? MUSIC_LEVEL : 0, 600);
    } else {
      music.pause();
      stopDhol();
    }
    setPressed(musicWanted);
  });

  // Pause while the tab is hidden (e.g. the guest switches back to WhatsApp).
  document.addEventListener('visibilitychange', () => {
    if (!music) return;
    if (document.hidden) music.pause();
    else if (musicWanted) { audioCtx(); music.play().catch(() => {}); }
  });
}

/** Gently brings the music up (called once the Ganesh card has parted). */
export function fadeInMusic(ms = 3500) {
  fadedIn = true;
  if (music && !music.paused) fadeTo(MUSIC_LEVEL, ms);
}

/** Temporarily lowers the music, e.g. while the dhol plays. */
export function duckMusic(level = 0.15, ms = 300) {
  if (music && !music.paused && fadedIn) fadeTo(level, ms);
}
export function unduckMusic(ms = 800) {
  if (music && !music.paused && fadedIn) fadeTo(MUSIC_LEVEL, ms);
}

function fadeTo(target, ms) {
  if (!music) return;
  if (gainNode) {
    const c = audioCtx();
    const now = c.currentTime;
    const g = gainNode.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(target, now + ms / 1000);
    return;
  }
  const from = music.volume;
  const start = performance.now();
  const step = (t) => {
    if (!music) return;
    const k = Math.min(1, (t - start) / ms);
    music.volume = from + (target - from) * k;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
