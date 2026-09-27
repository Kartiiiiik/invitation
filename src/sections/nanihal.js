// Nanihal Ki Mithaas: a sweet, gentle entrance with a small shower of petals.
import { gsap } from 'gsap';
import { $, $$, reducedMotion } from '../lib/utils.js';

export function initNanihal(section, ev, { petals }) {
  const card = $('.ecard', section);
  if (reducedMotion) return;
  gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 55%', once: true } })
    .call(() => petals?.burst(18), null, 0)
    .from($('.ecard__title', card), { autoAlpha: 0, y: 20, scale: 0.94, duration: 1.4, ease: 'expo.out' }, 0)
    .from($$('.ecard__divider, .meta', card), { autoAlpha: 0, y: 12, duration: 1, ease: 'power2.out', stagger: 0.2 }, 0.5);
}
