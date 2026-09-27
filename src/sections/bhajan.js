// Bhajan Sandhya: calm, devotional. The text fades in slowly under a warm diya-like glow.
import { gsap } from 'gsap';
import { $, $$, reducedMotion } from '../lib/utils.js';

export function initBhajan(section) {
  const card = $('.ecard', section);
  const glow = $('.scene__fx', section);

  if (reducedMotion) return;
  gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 55%', once: true } })
    .from(glow, { autoAlpha: 0, duration: 2.4, ease: 'power1.inOut' }, 0)
    .from($$('.ecard__blessing, .ecard__title, .ecard__tagline, .ecard__divider, .meta', card), {
      autoAlpha: 0, y: 16, duration: 1.6, ease: 'power2.out', stagger: 0.3,
    }, 0.2);
}
