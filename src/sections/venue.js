// Section 5: the Nepal → Rajasthan map. A pin drops onto the painted Rajasthan pin.
import { gsap } from 'gsap';
import { $, reducedMotion, placeHotspots } from '../lib/utils.js';

export function initVenue() {
  const root = $('#venue');
  placeHotspots(root);

  const pin = $('.venue__pin', root);
  const ripple = $('.venue__ripple', root);

  if (reducedMotion) return;
  // GSAP owns the anchoring transforms so the drop/scale tweens don't fight the CSS ones
  gsap.set(pin, { x: 0, y: 0, xPercent: -50, yPercent: -100 });
  gsap.set(ripple, { x: 0, y: 0, xPercent: -50, yPercent: -50, autoAlpha: 0 });
  gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 55%', once: true } })
    .from(pin, { y: -260, autoAlpha: 0, duration: 1.3, ease: 'bounce.out' })
    .fromTo(ripple, { autoAlpha: 0.8, scale: 0.2 }, { autoAlpha: 0, scale: 2.4, duration: 1.2, ease: 'power2.out' }, '-=0.35');
}
