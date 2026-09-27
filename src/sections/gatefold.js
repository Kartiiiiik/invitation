// Gatefold intro: two cream card doors held shut by a gold wax seal.
// Tapping the seal cracks it, the doors swing open in 3D, and the Ganesh card is revealed behind.
import '../styles/gatefold.css';
import { gsap } from 'gsap';
import { invite } from '../invite.config.js';
import { $, $$, reducedMotion, vibrate, guestName } from '../lib/utils.js';
import { unlockAudio, playSfx, startMusic } from '../lib/audio.js';

const SEAM = 0.485; // seam position across the screen (left door is slightly narrower)
const RIGHT_DOOR_LEFT = 0.46; // right door starts under the left one, so they overlap
const DOOR_ART = { left: '/assets/door-left.webp', right: '/assets/door-right.webp' };

// ── Vines ─────────────────────────────────────────────────────────────────────
const LEFT_STEMS = [
  'M-5 8C40 30 72 62 60 122S18 212 55 272S112 332 92 402',
  'M60 122C90 110 118 130 140 100',
  'M55 272C85 264 102 290 128 280',
  'M-5 62C22 72 32 96 18 132',
];
const RIGHT_STEMS = [
  'M225 456C180 430 160 390 176 330S216 240 180 180S120 120 140 58',
  'M225 250C200 244 172 262 150 240S120 200 100 214',
  'M176 330C150 330 136 352 110 340',
  'M225 420C190 418 162 440 130 430',
];
const LEAF = 'M0 0C3-5 10-6 15-1C10 3 4 3 0 0Z';

function vineSvg(stems, side, viewBox) {
  const id = `gfGold${side}`;
  return `
    <svg class="gf__vines gf__vines--${side}" viewBox="${viewBox}" aria-hidden="true">
      <defs>
        <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#f6dc93"/><stop offset=".45" stop-color="#c9973b"/><stop offset="1" stop-color="#8f6420"/>
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#${id})" stroke-width="1.3" stroke-linecap="round">
        ${stems.map((d) => `<path class="gf__stem" d="${d}"/>`).join('')}
      </g>
      <g class="gf__leaves" fill="url(#${id})"></g>
    </svg>`;
}

/** Scatters leaves, tendrils and berries along each stem (needs the SVG in the DOM). */
function growLeaves(svg) {
  const g = $('.gf__leaves', svg);
  const out = [];
  $$('.gf__stem', svg).forEach((stem, si) => {
    const len = stem.getTotalLength?.();
    if (!len) return;
    const step = si === 0 ? 26 : 20;
    for (let d = 14, i = 0; d < len - 6; d += step, i++) {
      const p = stem.getPointAtLength(d);
      const q = stem.getPointAtLength(Math.min(len, d + 1));
      const angle = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
      const side = i % 2 ? 1 : -1;
      const s = 0.65 + ((i * 37) % 10) / 22;
      out.push(`<path class="gf__leaf" d="${LEAF}" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${(angle + side * 48).toFixed(1)}) scale(${s.toFixed(2)})"/>`);
      if (i % 4 === 2) out.push(`<circle class="gf__leaf" cx="${(p.x + side * 7).toFixed(1)}" cy="${(p.y - 5).toFixed(1)}" r="1.6"/>`);
    }
  });
  g.innerHTML = out.join('');
}

// ── Wax seal ──────────────────────────────────────────────────────────────────
function blobPath() {
  const pts = [];
  for (let i = 0; i < 90; i++) {
    const t = (i / 90) * Math.PI * 2;
    const r = 90 + 4.5 * Math.sin(5 * t + 0.4) + 3 * Math.sin(9 * t + 1.3) + 2 * Math.sin(14 * t + 2.1);
    pts.push(`${(Math.cos(t) * r).toFixed(1)} ${(Math.sin(t) * r).toFixed(1)}`);
  }
  return `M${pts.join('L')}Z`;
}
const BLOB = blobPath();

function sealHalf(side) {
  const k = `gfSeal${side}`;
  return `
    <div class="gf__seal gf__seal--${side}">
      <div class="gf__seal-art">
        <svg viewBox="-100 -100 200 200" aria-hidden="true">
          <defs>
            <radialGradient id="${k}wax" cx="35%" cy="28%" r="80%">
              <stop offset="0" stop-color="#fff4c4"/><stop offset=".18" stop-color="#f0cf7a"/>
              <stop offset=".45" stop-color="#cfa04a"/><stop offset=".72" stop-color="#a8772c"/><stop offset="1" stop-color="#6e4a16"/>
            </radialGradient>
            <radialGradient id="${k}inner" cx="40%" cy="35%" r="75%">
              <stop offset="0" stop-color="#f3d488"/><stop offset=".55" stop-color="#c39240"/><stop offset="1" stop-color="#8a6020"/>
            </radialGradient>
            <linearGradient id="${k}bevel" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#fff0c0"/><stop offset=".5" stop-color="#c9973b"/><stop offset="1" stop-color="#5e3d10"/>
            </linearGradient>
            <linearGradient id="${k}shine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".65"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
            </linearGradient>
            <clipPath id="${k}clip"><path d="${BLOB}"/></clipPath>
          </defs>
          <path d="${BLOB}" fill="url(#${k}wax)"/>
          <path d="${BLOB}" fill="none" stroke="rgba(255,240,200,.35)" stroke-width="2" transform="scale(.95)"/>
          <circle r="62" fill="url(#${k}inner)"/>
          <circle r="62" fill="none" stroke="url(#${k}bevel)" stroke-width="5"/>
          <circle r="54" fill="none" stroke="rgba(100,64,18,.5)" stroke-width="1" stroke-dasharray="1.5 3"/>
          <g clip-path="url(#${k}clip)"><g transform="skewX(-20)"><rect class="gf__shine" x="-190" y="-110" width="70" height="220" fill="url(#${k}shine)"/></g></g>
        </svg>
        <span class="gf__mono"></span>
      </div>
    </div>`;
}

// ── Module ────────────────────────────────────────────────────────────────────
export function initGatefold({ musicSrc, onReveal }) {
  const root = document.createElement('div');
  root.className = 'gf';
  root.innerHTML = `
    <div class="gf__light" aria-hidden="true"></div>
    <div class="gf__door gf__door--right">
      ${vineSvg(RIGHT_STEMS, 'R', '0 0 220 460')}
      ${sealHalf('R')}
      <div class="gf__shade"></div>
    </div>
    <div class="gf__door gf__door--left">
      ${vineSvg(LEFT_STEMS, 'L', '0 0 200 420')}
      ${sealHalf('L')}
      <div class="gf__shade"></div>
    </div>
    <span class="gf__crack" aria-hidden="true"></span>
    <p class="gf__dear" hidden></p>
    <p class="gf__hint" aria-hidden="true">Tap to open</p>
    <button type="button" class="gf__tap" aria-label="Open the invitation"></button>`;
  document.body.append(root);

  const doors = { left: $('.gf__door--left', root), right: $('.gf__door--right', root) };
  const seals = $$('.gf__seal', root);
  const light = $('.gf__light', root);
  const crack = $('.gf__crack', root);
  const dear = $('.gf__dear', root);
  const hint = $('.gf__hint', root);
  const tap = $('.gf__tap', root);

  $$('.gf__mono', root).forEach((el) => (el.textContent = invite.initials));
  const name = guestName('');
  if (name) {
    dear.textContent = `Dear ${name}`;
    dear.hidden = false;
  }

  // Optional painted door artwork replaces the SVG vines
  for (const side of ['left', 'right']) {
    const img = new Image();
    img.onload = () => {
      doors[side].style.backgroundImage = `url(${DOOR_ART[side]})`;
      doors[side].classList.add('has-art');
    };
    img.src = DOOR_ART[side];
  }

  // Seam + seal positions in px (the right door's seal half is offset by its own left edge)
  const layout = () => {
    const w = root.clientWidth;
    root.style.setProperty('--seam', `${w * SEAM}px`);
    root.style.setProperty('--seam-r', `${w * (SEAM - RIGHT_DOOR_LEFT)}px`);
  };
  layout();
  new ResizeObserver(layout).observe(root);

  $$('.gf__vines', root).forEach(growLeaves);
  tap.focus({ preventScroll: true });

  // Gentle arrival: vines draw in, the seal settles
  if (!reducedMotion) {
    const stems = $$('.gf__stem', root);
    stems.forEach((s) => {
      const len = s.getTotalLength?.() || 400;
      s.style.strokeDasharray = len;
      s.style.strokeDashoffset = len;
    });
    gsap.timeline({ delay: 0.2 })
      .to(stems, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.out', stagger: 0.12 })
      .from($$('.gf__leaf', root), { autoAlpha: 0, duration: 0.8, ease: 'power1.out', stagger: 0.015 }, 0.6)
      .from(seals, { scale: 0.7, autoAlpha: 0, duration: 1.1, ease: 'back.out(1.6)' }, 0.3)
      .from([dear, hint], { autoAlpha: 0, y: 8, duration: 0.9, ease: 'power2.out', stagger: 0.15 }, 0.9);
  }

  tap.addEventListener('click', () => {
    tap.disabled = true;
    unlockAudio();
    startMusic(musicSrc, $('#musicToggle'), { silent: true });
    open();
  }, { once: true });

  function cleanup() {
    root.remove();
  }

  function open() {
    root.classList.add('is-opening');
    if (reducedMotion) {
      playSfx('crack');
      onReveal?.();
      gsap.to(root, { autoAlpha: 0, duration: 0.8, onComplete: cleanup });
      return;
    }
    gsap.timeline({ onComplete: cleanup })
      .to([hint, dear], { autoAlpha: 0, duration: 0.3 }, 0)
      // 1. Seal presses in, a crack flashes down the middle
      .to(seals, { scale: 0.95, duration: 0.16, ease: 'power2.in' }, 0)
      .to(seals, { scale: 1, duration: 0.2, ease: 'power2.out' }, 0.16)
      .call(() => { playSfx('crack'); vibrate([15, 30, 25]); }, null, 0.3)
      .fromTo(crack, { scaleY: 0, autoAlpha: 1 }, { scaleY: 1, duration: 0.16, ease: 'power2.out' }, 0.3)
      .to(crack, { autoAlpha: 0, duration: 0.35 }, 0.5)
      // 2–3. Doors swing open in 3D, each carrying its half of the seal, darkening as they turn
      .to(doors.left, { rotationY: -105, duration: 1.5, ease: 'power3.inOut' }, 0.55)
      .to(doors.right, { rotationY: 105, duration: 1.5, ease: 'power3.inOut' }, 0.65)
      .to($$('.gf__shade', root), { opacity: 0.55, duration: 1.3, ease: 'power2.in' }, 0.6)
      // 4. Warm light spills through the widening gap
      .fromTo(light, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1.3, duration: 1, ease: 'power2.out' }, 0.6)
      .to(light, { opacity: 0, duration: 0.7, ease: 'power1.in' }, 1.6)
      // 5. Ganesh card scales up behind the doors, petals burst out
      .call(() => onReveal?.(), null, 0.6);
  }
}
