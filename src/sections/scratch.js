import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { confetti, prefetchConfetti } from '../lib/confetti.js';
import { $, $$, reducedMotion, vibrate } from '../lib/utils.js';

const CLEAR_AT = 0.55; // auto-reveal once 55% of the foil is gone (the pre-scratched streak counts)

// A streak already scratched off each circle, so guests see what to do and get a peek underneath.
// Points are fractions of the circle's size; each card gets a slightly different mark.
const TEASERS = [
  [[0.22, 0.66], [0.4, 0.44], [0.52, 0.6]],
  [[0.2, 0.44], [0.36, 0.6], [0.5, 0.46], [0.62, 0.58]],
  [[0.46, 0.4], [0.62, 0.58], [0.78, 0.46]],
];

/** Section 3: three round gold-foil scratch cards → 02 / December / 2026. */
export function initScratch() {
  const root = $('#date');
  const cards = $$('.scard', root);
  const save = $('.scratch__save', root);
  let revealedCount = 0;

  cards.forEach((card, i) => createScratchCard(card, TEASERS[i % TEASERS.length], onReveal));

  function onReveal() {
    revealedCount++;
    if (revealedCount === cards.length) celebrate();
  }

  function celebrate() {
    vibrate([30, 60, 30]);
    gsap.fromTo(save, { autoAlpha: 0, scale: 0.85, y: 10 }, { autoAlpha: 1, scale: 1, y: 0, duration: 1.4, ease: 'expo.out', delay: 0.2 });
    if (reducedMotion) return;
    const colors = ['#f2a516', '#ffc94a', '#c8242f', '#c9973b', '#f1d58a'];
    const base = { colors, ticks: 260, gravity: 0.9, scalar: 1.05, disableForReducedMotion: true, zIndex: 60 };
    confetti({ ...base, particleCount: 90, spread: 70, origin: { x: 0.5, y: 0.55 } });
    setTimeout(() => {
      confetti({ ...base, particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.7 } });
      confetti({ ...base, particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } });
    }, 250);
  }

  // Fetch the confetti code as this section approaches, so the first burst is instant
  ScrollTrigger.create({ trigger: root, start: 'top bottom', once: true, onEnter: prefetchConfetti });

  if (!reducedMotion) {
    gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 65%', once: true } })
      .from('.scratch__title', { autoAlpha: 0, y: 24, duration: 1.2, ease: 'expo.out' })
      .from(cards, { autoAlpha: 0, y: 30, scale: 0.85, duration: 1, ease: 'back.out(1.6)', stagger: 0.14 }, '-=0.7');
  }
  ScrollTrigger.refresh();
}

function createScratchCard(card, teaser, onReveal) {
  const canvas = $('.scard__foil', card);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  let dpr = 1, S = 0, total = 0;
  let revealed = false;
  let drawing = false;
  let last = null;
  let lastBuzz = 0;
  let checkQueued = false;

  const circle = () => {
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, S / 2 - 0.5, 0, Math.PI * 2);
  };

  function paintFoil() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    S = Math.round(canvas.clientWidth * dpr);
    if (!S) return;
    canvas.width = canvas.height = S;

    ctx.globalCompositeOperation = 'source-over';
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Gold foil: metallic gradient + fine sparkle speckle
    const g = ctx.createLinearGradient(0, 0, S, S);
    g.addColorStop(0, '#8f6420');
    g.addColorStop(0.2, '#e7c26a');
    g.addColorStop(0.38, '#fff1bf');
    g.addColorStop(0.52, '#c9973b');
    g.addColorStop(0.72, '#f1d58a');
    g.addColorStop(1, '#9a6b22');
    circle();
    ctx.fillStyle = g;
    ctx.fill();

    ctx.save();
    ctx.clip();
    for (let i = 0; i < 320; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,240,0.55)' : 'rgba(110,70,15,0.25)';
      ctx.fillRect(Math.random() * S, Math.random() * S, 1.2 * dpr, 1.2 * dpr);
    }
    // Embossed inner ring
    ctx.strokeStyle = 'rgba(255,248,220,0.6)';
    ctx.lineWidth = 1.3 * dpr;
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, S / 2 - 7 * dpr, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(122,20,36,0.6)';
    ctx.font = `600 ${Math.round(S * 0.105)}px Cinzel, serif`;
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH', S / 2, S * 0.3);
    ctx.restore();

    // Measure the untouched foil, then carve this card's teaser streak
    total = countOpaque();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.lineWidth = S * 0.13;
    ctx.beginPath();
    teaser.forEach(([x, y], i) => (i ? ctx.lineTo(x * S, y * S) : ctx.moveTo(x * S, y * S)));
    ctx.stroke();
    last = null;
  }

  // Samples every 4th pixel's alpha. Returns number of opaque samples.
  function countOpaque() {
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let n = 0;
    for (let i = 3; i < data.length; i += 16) if (data[i] > 128) n++;
    return n;
  }

  function scratch(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.lineWidth = 26 * dpr;
    ctx.beginPath();
    ctx.moveTo(last ? last.x : x, last ? last.y : y);
    ctx.lineTo(x, y);
    ctx.stroke();
    last = { x, y };

    const now = performance.now();
    if (now - lastBuzz > 90) { vibrate(6); lastBuzz = now; }
    if (!checkQueued) {
      checkQueued = true;
      setTimeout(check, 120);
    }
  }

  function check() {
    checkQueued = false;
    if (revealed || !total) return;
    if (1 - countOpaque() / total >= CLEAR_AT) reveal();
  }

  function point(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr };
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (revealed) return;
    drawing = true;
    last = null;
    canvas.setPointerCapture(e.pointerId);
    const p = point(e);
    scratch(p.x, p.y);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drawing || revealed) return;
    // Coalesced events give smooth strokes on fast swipes
    const evs = e.getCoalescedEvents?.() || [e];
    for (const ev of evs) { const p = point(ev); scratch(p.x, p.y); }
  });
  const end = () => { drawing = false; last = null; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  function reveal() {
    if (revealed) return;
    revealed = true;
    card.classList.add('is-revealed');
    canvas.style.pointerEvents = 'none';
    vibrate(35);
    gsap.to(canvas, { autoAlpha: 0, scale: 1.08, duration: 0.6, ease: 'power2.out' });
    onReveal();
  }

  // Wait for Cinzel so "SCRATCH" renders in the right font; repaint on resize (before any scratching).
  (document.fonts?.ready || Promise.resolve()).then(paintFoil);
  let lastW = 0;
  new ResizeObserver(() => {
    if (revealed || canvas.clientWidth === lastW) return;
    lastW = canvas.clientWidth;
    paintFoil();
  }).observe(canvas);
}
