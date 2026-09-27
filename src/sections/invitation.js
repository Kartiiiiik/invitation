import { gsap } from 'gsap';
import { $, $$, reducedMotion, placeZones } from '../lib/utils.js';
import { invite } from '../invite.config.js';
import { setInk, inkTween } from '../lib/ink.js';

/** Section 2: the invitation. Fills text now; `play()` runs once the gate opens. */
export function initInvitation() {
  const root = $('#invitation');
  const people = invite.namesOrder.map((k) => invite[k]);
  placeZones(root);

  $('[data-bind="familyMessage"]', root).textContent = invite.familyMessage;
  $$('[data-name]', root).forEach((el) => (el.textContent = people[+el.dataset.name].name));
  $$('[data-family]', root).forEach((el) => {
    const p = people[+el.dataset.family];
    $('.family__label', el).textContent = p.grandparentsLabel || '';
    $('.family__grandparents', el).textContent = p.grandparents || '';
    $('.family__parents', el).textContent = p.parents || '';
  });

  // Eight-petal bloom behind the ampersand
  const petals = $('.bloom-petals', root);
  petals.innerHTML = Array.from({ length: 8 }, (_, i) =>
    `<ellipse cx="0" cy="-24" rx="9" ry="20" transform="rotate(${i * 45})"/>`
  ).join('') + '<circle r="5"/>';

  const greeting = $('.invite__greeting', root);
  const message = $('.invite__message', root);
  const names = $$('.invite__name', root);
  const ampChar = $('.invite__amp-char', root);
  const bloom = $$('.bloom-petals > *', root);
  const parents = $('.invite__families', root);
  const hint = $('.invite__scroll', root);

  // Names are "written" with a soft-edged ink wipe (mask moves left → right).
  gsap.set([greeting, message, parents, hint, ampChar], { autoAlpha: 0 });
  gsap.set(names, { autoAlpha: 0 });
  gsap.set(bloom, { scale: 0, svgOrigin: '0 0' });

  return {
    play() {
      if (reducedMotion) {
        gsap.to([greeting, message, ...names, ampChar, parents, hint], { autoAlpha: 1, duration: 0.8, stagger: 0.15 });
        gsap.set(bloom, { scale: 1 });
        return;
      }
      names.forEach((n) => setInk(n, 0));
      gsap.timeline({ delay: 0.2 })
        .to(greeting, { autoAlpha: 1, y: 0, duration: 1.2, ease: 'power2.out', startAt: { y: 14 } })
        .to(message, { autoAlpha: 1, y: 0, duration: 1.2, ease: 'power2.out', startAt: { y: 14 } }, '-=0.7')
        .add(inkTween(names[0], 1.6), '-=0.3')
        .to(bloom, { scale: 1, duration: 0.9, ease: 'back.out(1.8)', stagger: { each: 0.05, from: 'random' } }, '-=0.25')
        .to(ampChar, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.9, ease: 'back.out(2)', startAt: { scale: 0.2, rotate: -25 } }, '<0.1')
        .add(inkTween(names[1], 1.4), '-=0.4')
        .to(parents, { autoAlpha: 1, y: 0, duration: 1, ease: 'power2.out', startAt: { y: 10 } }, '-=0.3')
        .to(hint, { autoAlpha: 1, duration: 1 }, '+=0.2');
    },
  };
}
