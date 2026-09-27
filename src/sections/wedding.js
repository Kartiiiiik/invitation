// Wedding: the grandest section. Mandap glow + petal shower, names inside a varmala that draws on,
// then the date, time and venue, with fireworks in the sky while the section is on screen.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { invite, coupleNames } from '../invite.config.js';
import { $, $$, reducedMotion } from '../lib/utils.js';
import { createFireworks } from '../lib/fireworks.js';

const BEADS = 26;
const GARLAND = 'M150 8C238 8 292 38 292 72C292 108 238 136 150 136C62 136 8 108 8 72C8 38 62 8 150 8Z';

export function initWedding(section, ev, { petals }) {
  const card = $('.ecard', section);
  const fx = $('.scene__fx', section);
  fx.innerHTML = '<div class="mandap-glow"></div><div class="mandap-rays"></div>';

  // Fireworks in the evening sky above the arch, only while the Wedding is on screen
  if (!reducedMotion) {
    const canvas = document.createElement('canvas');
    canvas.className = 'fireworks';
    canvas.setAttribute('aria-hidden', 'true');
    section.insertBefore(canvas, $('.zone', section));
    const fw = createFireworks(canvas, { skyTop: 0.06, skyBottom: 0.4, launchFrom: 0.62 });
    ScrollTrigger.create({
      trigger: section, start: 'top 60%', end: 'bottom 40%',
      onToggle: (st) => (st.isActive ? fw.start() : fw.stop()),
    });
  }

  const [a, b] = coupleNames();
  $('.ecard__slot', card).innerHTML = `
    <div class="wed-names">
      <svg class="varmala" viewBox="0 0 300 144" aria-hidden="true">
        <path class="varmala__thread" d="${GARLAND}" />
        <g class="varmala__beads"></g>
      </svg>
      <p class="wed-names__text"><span></span> <em>&amp;</em> <span></span></p>
    </div>`;
  const nameSpans = $$('.wed-names__text span', card);
  nameSpans[0].textContent = a;
  nameSpans[1].textContent = b;

  // Beads spaced along the garland: marigold, rose and jasmine
  const thread = $('.varmala__thread', card);
  const beadsG = $('.varmala__beads', card);
  const len = thread.getTotalLength();
  const colors = ['#f2a516', '#c8242f', '#f2a516', '#fffaf0'];
  beadsG.innerHTML = Array.from({ length: BEADS }, (_, i) => {
    const p = thread.getPointAtLength((i / BEADS) * len);
    const r = i % 4 === 3 ? 3.4 : 5.2;
    return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r}" fill="${colors[i % 4]}" />`;
  }).join('');

  if (reducedMotion) {
    gsap.set(fx, { autoAlpha: 1 });
    return;
  }

  const beads = $$('circle', beadsG);
  gsap.set(fx, { autoAlpha: 0 });
  gsap.set(beads, { scale: 0, transformOrigin: '50% 50%' });
  gsap.set(thread, { strokeDasharray: len, strokeDashoffset: len });

  const tl = gsap.timeline({ paused: true })
    .to(fx, { autoAlpha: 1, duration: 2.2, ease: 'power2.out' })
    .from($('.mandap-glow', fx), { scale: 0.4, duration: 2.6, ease: 'expo.out' }, 0)
    .call(() => petals?.burst(50), null, 0.4)
    .from(card, { autoAlpha: 0, y: 30, duration: 1.4, ease: 'expo.out' }, 0.3)
    .from($$('.ecard__title, .ecard__tagline, .ecard__divider', card), { autoAlpha: 0, y: 14, duration: 1.1, ease: 'power2.out', stagger: 0.18 }, 0.6)
    .from($('.wed-names__text', card), { autoAlpha: 0, scale: 0.9, filter: 'blur(4px)', duration: 1.4, ease: 'power2.out' }, 1.1)
    .to(thread, { strokeDashoffset: 0, duration: 2, ease: 'power1.inOut' }, 1.3)
    .to(beads, { scale: 1, duration: 0.45, ease: 'back.out(3)', stagger: 0.06 }, 1.6)
    .from($$('.meta', card), { autoAlpha: 0, y: 12, duration: 0.9, ease: 'power2.out', stagger: 0.12 }, 2.2);

  ScrollTrigger.create({ trigger: section, start: 'top 55%', once: true, onEnter: () => tl.play() });
}
