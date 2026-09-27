// Section 4: live countdown to the wedding (IST), as plain typography.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { invite, isPlaceholder } from '../invite.config.js';
import { $, $$, reducedMotion } from '../lib/utils.js';

const FALLBACK_TARGET = '2026-12-02T00:00:00+05:30';
// After this moment the page says thank you instead (start of 3 Dec, IST).
const AFTER = new Date('2026-12-03T00:00:00+05:30').getTime();

function target() {
  const t = !isPlaceholder(invite.weddingDate) && Date.parse(invite.weddingDate);
  return Number.isFinite(t) && t ? t : Date.parse(FALLBACK_TARGET);
}

export function initCountdown() {
  const root = $('#countdown');
  const grid = $('.countdown__grid', root);
  const done = $('.countdown__done', root);
  const sr = $('.countdown__sr', root);
  const goal = target();
  let visible = false;

  const units = $$('.flip-unit', root).map((el) => ({ key: el.dataset.unit, value: null, el: $('.roll__v', el) }));

  // Plain numbers that roll: the old value lifts away, the new one rises into place.
  function set(u, v) {
    if (u.value === v) return;
    const first = u.value === null;
    u.value = v;
    if (first || !visible || reducedMotion) {
      u.el.textContent = v;
      return;
    }
    gsap.killTweensOf(u.el);
    gsap.timeline()
      .to(u.el, { yPercent: -45, autoAlpha: 0, duration: 0.22, ease: 'power2.in' })
      .call(() => { u.el.textContent = v; })
      .fromTo(u.el, { yPercent: 45, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.38, ease: 'power2.out' });
  }

  let lastSr = '';
  function tick() {
    const now = Date.now();
    if (now >= goal) {
      grid.hidden = true;
      done.hidden = false;
      done.textContent = now >= AFTER ? invite.copy.countdownAfter : invite.copy.countdownToday;
      return false;
    }
    let s = Math.floor((goal - now) / 1000);
    const parts = { days: Math.floor(s / 86400), hours: Math.floor((s %= 86400) / 3600), minutes: Math.floor((s %= 3600) / 60), seconds: s % 60 };
    units.forEach((u) => set(u, String(parts[u.key]).padStart(2, '0')));
    const text = `${parts.days} days, ${parts.hours} hours and ${parts.minutes} minutes to go.`;
    if (text !== lastSr) sr.textContent = lastSr = text;
    return true;
  }

  if (tick()) {
    const id = setInterval(() => tick() || clearInterval(id), 1000);
  }

  ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top', onToggle: (s) => (visible = s.isActive) });
  if (!reducedMotion) {
    gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 75%', once: true } })
      .from($$('.countdown__eyebrow, .countdown__title', root), { autoAlpha: 0, y: 16, duration: 1.1, ease: 'expo.out', stagger: 0.15 })
      .from($$('.flip-unit', root), { autoAlpha: 0, y: 20, duration: 1, ease: 'expo.out', stagger: 0.1 }, '-=0.7');
  }
}
