// Carnival: bouncy, playful text + balloons floating up that burst into confetti when tapped.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { confetti, prefetchConfetti } from '../lib/confetti.js';
import { $, $$, reducedMotion, vibrate } from '../lib/utils.js';
import { playSfx } from '../lib/audio.js';

const COLORS = ['#e8457c', '#35b6d6', '#f7d23e', '#8a5cf0', '#ff8a3d', '#4fc28a'];
const MAX_ALIVE = 8;

const balloonSvg = (fill, golden) => `
  <svg viewBox="0 0 60 118" aria-hidden="true">
    ${golden ? `<defs><linearGradient id="gold-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1bf"/><stop offset=".45" stop-color="#e2b34f"/><stop offset="1" stop-color="#9a6b22"/></linearGradient></defs>` : ''}
    <path d="M30 2C14 2 4 16 4 32c0 20 16 36 26 40 10-4 26-20 26-40C56 16 46 2 30 2z" fill="${golden ? 'url(#gold-b)' : fill}"/>
    <path d="M26 72l4 6 4-6z" fill="${golden ? '#9a6b22' : fill}"/>
    <path d="M30 78c-5 10 6 18 0 38" stroke="rgba(90,70,90,.55)" stroke-width="1.2" fill="none"/>
    <ellipse cx="19" cy="22" rx="5.5" ry="10" fill="rgba(255,255,255,.4)" transform="rotate(-22 19 22)"/>
    ${golden ? '<text x="30" y="42" text-anchor="middle" font-size="18" fill="#fff8e0">★</text>' : ''}
  </svg>`;

export function initCarnival(section) {
  const card = $('.ecard', section);
  const layer = document.createElement('div');
  layer.className = 'balloons';
  layer.setAttribute('aria-hidden', 'true');
  section.insertBefore(layer, $('.zone', section));

  let alive = 0;
  let spawned = 0;
  let timer = 0;

  function spawn(opts = {}) {
    if (alive >= MAX_ALIVE) return;
    const golden = spawned % 6 === 3; // an occasional golden balloon gives a bigger burst
    const color = COLORS[(Math.random() * COLORS.length) | 0];
    const b = document.createElement('button');
    b.type = 'button';
    b.tabIndex = -1;
    b.className = `balloon${golden ? ' balloon--gold' : ''}`;
    b.innerHTML = balloonSvg(color, golden);
    const H = section.clientHeight;
    const W = section.clientWidth;
    const x = opts.x ?? (0.04 + Math.random() * 0.8) * W;
    b.style.left = `${x}px`;
    layer.append(b);
    alive++;
    spawned++;

    let floatTween = null;
    let swayTween = null;
    if (reducedMotion) {
      gsap.set(b, { y: opts.y ?? H * 0.62 });
      gsap.from(b, { autoAlpha: 0, duration: 0.6 });
    } else {
      const dur = 8 + Math.random() * 4;
      floatTween = gsap.fromTo(b, { y: H + 40 }, { y: -160, duration: dur, ease: 'none', onComplete: () => remove(b) });
      swayTween = gsap.to(b, { x: `+=${14 + Math.random() * 18}`, rotation: gsap.utils.random(-8, 8), duration: 1.4 + Math.random(), ease: 'sine.inOut', yoyo: true, repeat: -1 });
    }

    b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      floatTween?.kill();
      swayTween?.kill();
      pop(b, color, golden);
    }, { once: true });
  }

  function remove(b) {
    if (!b.isConnected) return;
    gsap.killTweensOf(b);
    b.remove();
    alive--;
  }

  function pop(b, color, golden) {
    playSfx('pop');
    vibrate(18);
    const r = b.getBoundingClientRect();
    confetti({
      particleCount: golden ? 90 : 26, spread: golden ? 100 : 65, startVelocity: golden ? 32 : 20,
      ticks: 140, scalar: 0.8, zIndex: 60, disableForReducedMotion: true,
      origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height * 0.3) / innerHeight },
      colors: golden ? ['#f1d58a', '#c9973b', '#fff1bf', '#e8457c'] : [color, '#ffffff', '#f7d23e'],
    });
    gsap.to(b, { scale: 1.6, autoAlpha: 0, duration: 0.18, ease: 'power2.out', onComplete: () => remove(b) });
  }

  function start() {
    if (timer) return;
    if (reducedMotion) {
      // Static row of balloons to pop, no drifting
      const W = section.clientWidth;
      for (let i = 0; i < 5; i++) spawn({ x: W * (0.06 + i * 0.18), y: section.clientHeight * (0.58 + (i % 2) * 0.06) });
      timer = 1;
      return;
    }
    for (let i = 0; i < 4; i++) setTimeout(spawn, i * 350);
    timer = setInterval(spawn, 1100);
  }
  function stop() {
    if (reducedMotion) return;
    clearInterval(timer);
    timer = 0;
  }
  // Fetch the confetti code as this section approaches, so the first burst is instant
  ScrollTrigger.create({ trigger: section, start: 'top bottom', once: true, onEnter: prefetchConfetti });

  ScrollTrigger.create({ trigger: section, start: 'top 70%', end: 'bottom 30%', onToggle: (s) => (s.isActive ? start() : stop()) });

  // Bouncy entrance: the details drop in and wobble
  if (reducedMotion) return;
  gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 60%', once: true } })
    .from(card, { y: -140, rotation: -9, autoAlpha: 0, duration: 1.3, ease: 'elastic.out(1, 0.5)' })
    .from($$('.meta', card), { y: 16, scale: 0.8, autoAlpha: 0, duration: 0.7, ease: 'back.out(2.5)', stagger: 0.1 }, '-=0.7');
}
