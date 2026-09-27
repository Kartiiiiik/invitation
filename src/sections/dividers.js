// Gold lotus divider between sections, so neighbouring artworks never run into each other.
// The countdown strip is already a cream band with gold rules, so it gets no divider around it.
import { $$ } from '../lib/utils.js';

const SVG = `
  <svg viewBox="0 0 300 40" aria-hidden="true">
    <path class="line line--l" d="M122 20H18" />
    <path class="line line--r" d="M178 20H282" />
    <path class="line line--thin line--l" d="M116 25H44" />
    <path class="line line--thin line--r" d="M184 25H256" />
    <circle class="dot" cx="12" cy="20" r="2" /><circle class="dot" cx="288" cy="20" r="2" />
    <circle class="dot" cx="38" cy="25" r="1.2" /><circle class="dot" cx="262" cy="25" r="1.2" />
    <g transform="translate(150 24)"><g class="lotus">
      <path class="petal petal--rose" d="M0 0C-4-6-4-14 0-20C4-14 4-6 0 0Z" />
      <path class="petal" d="M0 0C-7-3-12-10-12-17C-6-14-2-8 0 0Z" />
      <path class="petal" d="M0 0C7-3 12-10 12-17C6-14 2-8 0 0Z" />
      <path class="petal" d="M0 0C-9 0-17-4-21-10C-13-10-5-6 0 0Z" />
      <path class="petal" d="M0 0C9 0 17-4 21-10C13-10 5-6 0 0Z" />
      <ellipse class="bud" cx="0" cy="1.5" rx="10" ry="2.2" />
    </g></g>
  </svg>`;

export function insertDividers() {
  const sections = $$('main section');
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      }), { rootMargin: '0px 0px -8% 0px' })
    : null;

  sections.forEach((section, i) => {
    const prev = sections[i - 1];
    if (!prev) return;
    if (section.classList.contains('band') || prev.classList.contains('band')) return;
    const div = document.createElement('div');
    div.className = 'divider';
    div.setAttribute('aria-hidden', 'true');
    div.innerHTML = SVG;
    section.before(div);
    // Lines grow outward from the lotus as the divider scrolls into view (CSS, see .divider.is-in)
    if (io) io.observe(div); else div.classList.add('is-in');
  });
}
