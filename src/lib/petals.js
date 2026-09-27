// Lightweight falling marigold + rose petals on a single canvas.
// Petals are pre-rendered to small sprites, then drawn with a tumble (scaleY) and sway.

const MARIGOLD = ['#f2a516', '#f7b733', '#e8850c', '#ffc94a'];
const ROSE = ['#e48aa6', '#d9587e', '#c8242f', '#f2b5c6'];

function makeSprite(color, kind) {
  const s = kind === 'rose' ? 30 : 24;
  const c = document.createElement('canvas');
  c.width = c.height = s * 2;
  const g = c.getContext('2d');
  g.translate(s, s);
  const grad = g.createRadialGradient(0, -s * 0.2, 1, 0, 0, s);
  grad.addColorStop(0, '#fff6e0');
  grad.addColorStop(0.25, color);
  grad.addColorStop(1, shade(color, -0.25));
  g.fillStyle = grad;
  g.beginPath();
  if (kind === 'rose') {
    // Broad rounded petal with a soft notch at the top
    g.moveTo(0, s * 0.9);
    g.bezierCurveTo(s * 0.95, s * 0.35, s * 0.8, -s * 0.8, s * 0.12, -s * 0.72);
    g.quadraticCurveTo(0, -s * 0.55, -s * 0.12, -s * 0.72);
    g.bezierCurveTo(-s * 0.8, -s * 0.8, -s * 0.95, s * 0.35, 0, s * 0.9);
  } else {
    // Narrow marigold petal with a frilled tip
    g.moveTo(0, s * 0.85);
    g.bezierCurveTo(s * 0.55, s * 0.4, s * 0.55, -s * 0.5, s * 0.35, -s * 0.8);
    g.lineTo(s * 0.18, -s * 0.66);
    g.lineTo(0, -s * 0.86);
    g.lineTo(-s * 0.18, -s * 0.66);
    g.lineTo(-s * 0.35, -s * 0.8);
    g.bezierCurveTo(-s * 0.55, -s * 0.5, -s * 0.55, s * 0.4, 0, s * 0.85);
  }
  g.fill();
  // centre vein
  g.strokeStyle = 'rgba(255,255,255,0.25)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(0, s * 0.7);
  g.lineTo(0, -s * 0.5);
  g.stroke();
  return c;
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v + v * amt)));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

export function createPetals(canvas, { max = 28 } = {}) {
  const ctx = canvas.getContext('2d');
  const sprites = [
    ...MARIGOLD.map((c) => makeSprite(c, 'marigold')),
    ...ROSE.map((c) => makeSprite(c, 'rose')),
  ];
  let W = 0, H = 0, dpr = 1;
  let parts = [];
  let density = 0; // target number of ambient petals
  let raf = 0;
  let last = 0;
  let spawnAcc = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
  }

  function spawn(y = -30, fast = false) {
    const sprite = sprites[(Math.random() * sprites.length) | 0];
    const size = 9 + Math.random() * 9;
    const x = Math.random() * W;
    const p = {
      sprite,
      x,
      baseX: x,
      fast,
      y,
      size,
      vy: (fast ? 90 : 28) + Math.random() * (fast ? 90 : 38),
      swayAmp: 12 + Math.random() * 30,
      swayFreq: 0.5 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 1.6,
      tumble: 1 + Math.random() * 2.5,
      alpha: 0.75 + Math.random() * 0.25,
    };
    parts.push(p);
    return p;
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Ambient spawning trickles in so petals never arrive in a wall.
    const ambient = parts.filter((p) => !p.fast).length;
    if (ambient < density) {
      spawnAcc += dt * Math.max(1.5, density / 6);
      while (spawnAcc >= 1) { spawn(); spawnAcc -= 1; }
    }

    const t = now / 1000;
    parts = parts.filter((p) => p.y < H + 40);
    for (const p of parts) {
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.x = p.baseX + Math.sin(t * p.swayFreq + p.phase) * p.swayAmp;
      const flip = Math.cos(t * p.tumble + p.phase); // 3D-ish tumble
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, 0.25 + Math.abs(flip) * 0.75);
      ctx.drawImage(p.sprite, -p.size, -p.size, p.size * 2, p.size * 2);
      ctx.restore();
    }

    if (parts.length || density) raf = requestAnimationFrame(frame);
    else raf = 0;
  }

  function run() {
    if (!raf && !document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else run();
  });

  return {
    /** Ambient petal count, 0 … 1 of max. */
    setDensity(k) { density = Math.round(max * k); run(); },
    /** A one-off shower of `n` petals. */
    burst(n = 40) {
      for (let i = 0; i < n; i++) spawn(-30 - Math.random() * H * 0.5, true);
      run();
    },
  };
}
