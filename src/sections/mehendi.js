// Mehendi: the title is "drawn on" in henna, then each detail line inks in.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, reducedMotion } from '../lib/utils.js';
import { inkTween } from '../lib/ink.js';


export function initMehendi(section, ev) {
  const card = $('.ecard', section);
  const title = $('.ecard__title', card);

  // Title as SVG text so it can be stroke-drawn like a henna cone.
  // A long title like "Mehfil-e-Mehendi" is set on two lines: a smaller lead-in, then the main word big.
  const m = /^(.*[-\s])([^-\s]+)$/.exec(ev.title.trim());
  const [lead, main] = ev.title.length > 11 && m ? [m[1].trim(), m[2]] : ['', ev.title];
  const H = lead ? 136 : 92;
  title.innerHTML = `<span class="sr-only"></span><svg class="henna-title" viewBox="0 0 300 ${H}" aria-hidden="true">
      ${lead ? '<text class="henna-title__lead" x="150" y="44" text-anchor="middle"></text>' : ''}
      <text class="henna-title__main" x="150" y="${lead ? 118 : 68}" text-anchor="middle"></text>
    </svg>`;
  $('.sr-only', title).textContent = ev.title;
  const texts = $$('text', title);
  if (lead) texts[0].textContent = lead;
  texts[texts.length - 1].textContent = main;
  // Each line starts at its design size, then shrinks only if the script font turns out wider than the art
  const sizes = lead ? [48, 92] : [Math.min(84, Math.round(296 / (main.length * 0.38)))];
  texts.forEach((t, i) => (t.style.fontSize = `${sizes[i]}px`));
  (document.fonts?.ready || Promise.resolve()).then(() => {
    texts.forEach((t, i) => {
      const w = t.getComputedTextLength?.() || 0;
      if (w > 290) t.style.fontSize = `${Math.floor(sizes[i] * (290 / w))}px`;
    });
  });
  $('.ecard__divider', card).remove(); // the artwork already has its own henna ornaments

  if (reducedMotion) return;
  const lines = $$('.meta', card);
  gsap.set(lines, { autoAlpha: 0 });
  gsap.set(texts, { strokeDasharray: 2400, strokeDashoffset: 2400, fillOpacity: 0 });

  const tl = gsap.timeline({ paused: true })
    .to(texts, { strokeDashoffset: 0, duration: 2.4, ease: 'power1.inOut', stagger: 0.5 })
    .to(texts, { fillOpacity: 1, duration: 1, ease: 'power1.out', stagger: 0.3 }, '-=0.8');
  lines.forEach((el, i) => tl.add(inkTween(el, 0.9), i === 0 ? '-=0.8' : '-=0.45'));

  ScrollTrigger.create({ trigger: section, start: 'top 55%', once: true, onEnter: () => tl.play() });
}
