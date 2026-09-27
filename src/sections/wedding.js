// Wedding: the grandest section. The date is the title ("2 December"), then the programme
// (Baraat Swagat · 5 PM, Reception · 8 PM). The venue is on the last page. Mandap glow + petal shower on entry,
// fireworks in the sky while the section is on screen.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, reducedMotion } from '../lib/utils.js';
import { parseDate } from '../lib/calendar.js';
import { createFireworks } from '../lib/fireworks.js';

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

  // Title: the date ("2nd December", one line); screen readers hear "Wedding, 2nd December"
  const d = parseDate(ev.date);
  const title = $('.ecard__title', card);
  const ordinal = (n) => n + ([, 'st', 'nd', 'rd'][(n % 100 >> 3) ^ 1 && n % 10] || 'th'); // 1st 2nd 3rd 4th… 11th
  const dayMonth = d
    ? `${ordinal(d.d)} ${new Date(Date.UTC(d.y, d.m - 1, 1)).toLocaleDateString('en-GB', { month: 'long', timeZone: 'UTC' })}`
    : ev.title;
  title.innerHTML = '<span class="sr-only"></span><span class="wed-date"></span>';
  $('.sr-only', title).textContent = `${ev.title}, `;
  $('.wed-date', title).textContent = dayMonth;

  // Programme: one name + time pair per entry
  const slot = $('.ecard__slot', card);
  slot.innerHTML = '<div class="wed-programme"></div>';
  const list = $('.wed-programme', slot);
  (ev.programme || []).forEach((item) => {
    const row = document.createElement('div');
    row.className = 'wed-prog';
    row.innerHTML = '<p class="wed-prog__name"></p><p class="wed-prog__time"></p>';
    $('.wed-prog__name', row).textContent = item.name;
    $('.wed-prog__time', row).textContent = item.time;
    list.append(row);
  });

  // Date and time are shown above, and the venue is on the last page
  $$('.meta', card).forEach((el) => el.remove());

  if (reducedMotion) {
    gsap.set(fx, { autoAlpha: 1 });
    return;
  }

  gsap.set(fx, { autoAlpha: 0 });
  const tl = gsap.timeline({ paused: true })
    .to(fx, { autoAlpha: 1, duration: 2.2, ease: 'power2.out' })
    .from($('.mandap-glow', fx), { scale: 0.4, duration: 2.6, ease: 'expo.out' }, 0)
    .call(() => petals?.burst(50), null, 0.4)
    .from($('.wed-date', card), { autoAlpha: 0, y: 16, scale: 0.94, duration: 1.4, ease: 'expo.out' }, 0.5)
    .from($$('.ecard__divider', card), { autoAlpha: 0, scaleX: 0.3, duration: 1, ease: 'power2.out', stagger: 0.5 }, 0.9)
    .from($$('.wed-prog', card), { autoAlpha: 0, y: 14, duration: 1, ease: 'power2.out', stagger: 0.25 }, 1.1);

  ScrollTrigger.create({ trigger: section, start: 'top 55%', once: true, onEnter: () => tl.play() });
}
