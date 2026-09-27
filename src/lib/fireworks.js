// Canvas fireworks: rockets rise from the lower sky and burst into big glowing sparks,
// each burst lighting up the sky with a flash. Runs only between start() and stop();
// pauses automatically while the tab is hidden.
import { lowEnd } from './utils.js';

const PALETTES = [
  ['#fff1bf', '#f1d58a', '#ffd166'],            // gold
  ['#ffd27a', '#f2a516', '#fff6e0'],            // marigold
  ['#ffb3c7', '#ff6fa3', '#fff0f5'],            // rose
  ['#ff8a80', '#ff3b3b', '#ffe0d6'],            // vermilion
  ['#ffffff', '#fff6e0', '#f1d58a'],            // white-gold
  ['#b9f6ff', '#7ee0ff', '#ffffff'],            // silver-blue (contrast against the warm sky)
];
const WILLOW = ['#ffe8a3', '#f5c451', '#d99a2b']; // long drooping golden trails

export function createFireworks(canvas, { skyTop = 0.06, skyBottom = 0.42, launchFrom = 0.62 } = {}) {
  const ctx = canvas.getContext('2d');
  const maxSparks = lowEnd ? 600 : 1400;
  const perBurst = lowEnd ? 70 : 120;
  let W = 0, H = 0, dpr = 1;
  let rockets = [];
  let sparks = [];
  let flashes = [];
  let raf = 0, last = 0, nextLaunch = 0;
  let running = false;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
  }

  function launch() {
    const x = W * (0.14 + Math.random() * 0.72);
    const targetY = H * (skyTop + Math.random() * (skyBottom - skyTop));
    const startY = H * launchFrom;
    const speed = 620 + Math.random() * 220;
    const willow = Math.random() < 0.22;
    rockets.push({
      x, y: startY, px: x, py: startY, vx: (Math.random() - 0.5) * 50, vy: -speed, targetY, willow,
      palette: willow ? WILLOW : PALETTES[(Math.random() * PALETTES.length) | 0],
    });
  }

  function burst(r) {
    const count = Math.min(perBurst, maxSparks - sparks.length);
    const power = (r.willow ? 150 : 200) + Math.random() * 120;
    const ring = !r.willow && Math.random() < 0.3; // some bursts are neat rings, others full peonies
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + Math.random() * 0.15;
      const v = ring ? power : power * (0.3 + Math.random() * 0.7);
      sparks.push({
        x: r.x, y: r.y, px: r.x, py: r.y,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        life: 1,
        decay: r.willow ? 0.28 + Math.random() * 0.15 : 0.4 + Math.random() * 0.35,
        gravity: r.willow ? 150 : 85,
        drag: r.willow ? 2.4 : 1.5,
        color: r.palette[(Math.random() * r.palette.length) | 0],
        size: r.willow ? 1.6 + Math.random() : 2 + Math.random() * 1.6,
      });
    }
    // A flash of light where it bursts
    flashes.push({ x: r.x, y: r.y, life: 1, r: power * 1.1, color: r.palette[0] });
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';

    if (running && now >= nextLaunch) {
      launch();
      const extra = Math.random();
      if (extra < 0.5) setTimeout(() => running && launch(), 160 + Math.random() * 200);
      if (extra < 0.2) setTimeout(() => running && launch(), 380 + Math.random() * 250);
      nextLaunch = now + 520 + Math.random() * 600;
    }

    // Flashes: a soft glow that lights the sky around each burst
    flashes = flashes.filter((f) => {
      f.life -= dt * 2.4;
      if (f.life <= 0) return false;
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
      g.addColorStop(0, `rgba(255, 245, 220, ${0.55 * f.life})`);
      g.addColorStop(0.35, `rgba(255, 210, 140, ${0.22 * f.life})`);
      g.addColorStop(1, 'rgba(255, 200, 120, 0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
      return true;
    });

    // Rockets: a bright streak on the way up
    rockets = rockets.filter((r) => {
      r.px = r.x; r.py = r.y;
      r.x += r.vx * dt;
      r.y += r.vy * dt;
      r.vy += 300 * dt;
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = '#ffdca0';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(r.px, r.py + 18);
      ctx.lineTo(r.x, r.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#fff6e0';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(r.px, r.py + 14);
      ctx.lineTo(r.x, r.y);
      ctx.stroke();
      if (r.y <= r.targetY || r.vy >= -80) { burst(r); return false; }
      return true;
    });

    // Sparks: glow pass + bright core, with gravity, drag and a twinkle as they fade
    sparks = sparks.filter((s) => {
      s.px = s.x; s.py = s.y;
      s.vx *= 1 - s.drag * dt;
      s.vy = s.vy * (1 - s.drag * dt) + s.gravity * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= s.decay * dt;
      if (s.life <= 0) return false;
      const a = Math.min(1, s.life * 1.3);
      ctx.strokeStyle = s.color;
      ctx.globalAlpha = a * 0.28;
      ctx.lineWidth = s.size * 3.2;
      ctx.beginPath();
      ctx.moveTo(s.px, s.py);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
      ctx.globalAlpha = a;
      ctx.lineWidth = s.size;
      ctx.beginPath();
      ctx.moveTo(s.px - (s.x - s.px) * 1.5, s.py - (s.y - s.py) * 1.5); // longer trail
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
      if (s.life < 0.45 && Math.random() < 0.12) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(s.x - 1.5, s.y - 1.5, 3, 3);
      }
      return true;
    });
    ctx.globalAlpha = 1;

    if (running || rockets.length || sparks.length || flashes.length) raf = requestAnimationFrame(frame);
    else { raf = 0; ctx.clearRect(0, 0, W, H); }
  }

  function loop() {
    if (!raf && !document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  resize();
  new ResizeObserver(resize).observe(canvas);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (running) loop();
  });

  return {
    start() {
      if (running) return;
      running = true;
      nextLaunch = performance.now() + 200;
      // Open with a volley of three
      setTimeout(() => { if (running) { launch(); setTimeout(launch, 220); setTimeout(launch, 440); } }, 150);
      loop();
    },
    stop() { running = false; }, // sparks already in the air finish naturally
  };
}
