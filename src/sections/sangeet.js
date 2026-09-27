// Sangeet: disco-light sweep, beat pulse on the text, a dhol beat playing in the background
// while the section is on screen, and a "dance floor opens" marquee.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { invite } from '../invite.config.js';
import { $, $$, reducedMotion } from '../lib/utils.js';
import { startDhol, stopDhol } from '../lib/audio.js';
import { formatDate } from '../lib/calendar.js';

export function initSangeet(section, ev) {
  const card = $('.ecard', section);
  const fx = $('.scene__fx', section);
  fx.innerHTML = '<div class="disco"><i></i><i></i><i></i><i></i></div>';

  const marqueeText = `${invite.copy.sangeetMarquee.replace('{time}', ev.time)}  ✦  ${ev.title} · ${formatDate(ev.date)}  ✦  `;
  section.insertAdjacentHTML('beforeend', `<div class="marquee" aria-hidden="true"><div class="marquee__track"><span></span><span></span></div></div>`);
  $$('.marquee__track span', section).forEach((s) => (s.textContent = marqueeText.repeat(3)));

  // Lights, beat pulse and the dhol run only while the Sangeet is on screen
  ScrollTrigger.create({
    trigger: section, start: 'top 60%', end: 'bottom 40%',
    onToggle: (s) => {
      section.classList.toggle('is-live', s.isActive);
      if (s.isActive) startDhol(invite.sfx.dhol);
      else stopDhol();
    },
  });

  if (reducedMotion) return;
  gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 55%', once: true } })
    .from(fx, { autoAlpha: 0, duration: 1.2 })
    .from($$('.ecard__title, .ecard__tagline, .ecard__divider, .meta', card), { autoAlpha: 0, y: 14, duration: 0.8, ease: 'power2.out', stagger: 0.1 }, 0.3);
}
