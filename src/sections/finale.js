// Closing screen: monogram in a ring of petals, hashtag, final soft petal fall.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, reducedMotion } from '../lib/utils.js';

export function initFinale(petals) {
  const root = $('#finale');
  $('.ring-petals', root).innerHTML = Array.from({ length: 16 }, (_, i) =>
    `<ellipse cx="0" cy="-86" rx="5" ry="10" transform="rotate(${i * 22.5})" />`).join('');

  // Petals thicken as the guest reaches the end
  if (petals) {
    ScrollTrigger.create({
      trigger: root, start: 'top 60%',
      onEnter: () => { petals.setDensity(1); petals.burst(30); },
      onLeaveBack: () => petals.setDensity(0.6),
    });
  }

  if (reducedMotion) return;
  gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 60%', once: true } })
    .from($('.finale__ring', root), { rotation: -90, scale: 0.6, autoAlpha: 0, duration: 2, ease: 'expo.out', transformOrigin: '50% 50%' })
    .from($$('.ring-petals ellipse', root), { scale: 0, svgOrigin: '0 0', duration: 0.6, ease: 'back.out(3)', stagger: 0.04 }, 0.4)
    .from($('.finale__monogram', root), { scale: 0.5, autoAlpha: 0, filter: 'blur(8px)', duration: 1.6, ease: 'expo.out' }, 0.5)
    .from($$('.finale__title, .finale__names, .finale__hashtag', root), { y: 16, autoAlpha: 0, duration: 1, ease: 'power2.out', stagger: 0.18 }, 1.1);
}
