// Closing screen: the couple's names, hashtag, message and family sign-off, with a final petal fall.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, reducedMotion } from '../lib/utils.js';

export function initFinale(petals) {
  const root = $('#finale');

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
    .from($('.finale__names', root), { scale: 0.9, autoAlpha: 0, duration: 1.6, ease: 'expo.out' })
    .from($$('.finale__hashtag, .finale__divider, .finale__title, .finale__regards', root), { y: 16, autoAlpha: 0, duration: 1, ease: 'power2.out', stagger: 0.25 }, 0.7);
}
