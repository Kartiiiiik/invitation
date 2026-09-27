import './styles/main.css';
import './styles/sections.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { invite, coupleNames } from './invite.config.js';
import { $, $$, guestName, reducedMotion, lowEnd, slowNet, fadeInArt } from './lib/utils.js';
import { preloadSfx, fadeInMusic } from './lib/audio.js';
import { createPetals } from './lib/petals.js';
import { initGate } from './sections/gate.js';
import { initInvitation } from './sections/invitation.js';
import { initScratch } from './sections/scratch.js';
import { initCountdown } from './sections/countdown.js';
import { initVenue } from './sections/venue.js';
import { renderEvents } from './sections/events.js';
import { initFinale } from './sections/finale.js';
import { initGatefold } from './sections/gatefold.js';
import { insertDividers } from './sections/dividers.js';

gsap.registerPlugin(ScrollTrigger);

// Personalised greeting from ?to=… (textContent only, so no HTML injection)
const name = guestName();
$$('[data-greeting-name]').forEach((el) => (el.textContent = name));

// Static text from the config: data-bind="venue.name", data-copy="rsvpTitle", data-couple
$$('[data-bind]').forEach((el) => {
  const value = el.dataset.bind.split('.').reduce((o, k) => o?.[k], invite);
  if (typeof value === 'string') el.textContent = value;
});
$$('[data-copy]').forEach((el) => (el.textContent = invite.copy[el.dataset.copy] ?? ''));
$$('[data-couple]').forEach((el) => (el.textContent = coupleNames().join(' & ')));

// Blurred copy of each artwork fills any space around the full (uncropped) picture
$$('[data-bg]').forEach((el) => el.querySelector('.art--full') && el.style.setProperty('--blur', `url(/assets/img/${el.dataset.bg}-blur.webp)`));

// Slow connection / Data Saver: swap not-yet-loaded backgrounds to the small 480px files
if (slowNet) {
  $$('img.art--full[srcset]').forEach((img) => {
    if (img.complete) return;
    img.removeAttribute('srcset');
    img.src = img.src.replace(/\.webp$/, '-480.webp');
  });
}

// Only the two tiny tap sounds are fetched up front; the dhol loop loads when the Sangeet appears
preloadSfx({ bell: invite.sfx.bell, crack: invite.sfx.crack });

const petals = reducedMotion ? null : createPetals($('#petals'), { max: lowEnd ? 14 : 28 });
const invitation = initInvitation();
initScratch();
initCountdown();
initVenue();
renderEvents({ petals });
insertDividers();
fadeInArt();
pauseOffscreenAnimations();
initFinale(petals);
initBackdropAndPreload();

const gate = initGate({
  musicSrc: invite.music,
  waitForGatefold: invite.showGatefold,
  onOpen() {
    fadeInMusic(); // music (started silently on the opening tap) rises after the Ganesh card
    invitation.play();
    petals?.setDensity(0.6);
    if (!invite.showGatefold) petals?.burst(lowEnd ? 12 : 24);
    $('#couple-names').setAttribute('tabindex', '-1');
    $('#couple-names').focus({ preventScroll: true });
    ScrollTrigger.refresh();
  },
});

if (invite.showGatefold) {
  initGatefold({
    musicSrc: invite.music,
    onReveal() {
      gate.reveal();
      petals?.burst(lowEnd ? 16 : 34); // marigolds burst out as the doors open
    },
  });
}

/**
 * Desktop: cross-fades the blurred side backdrop to the section in view.
 * All: when a section comes into view, starts loading the next section's image.
 */
function initBackdropAndPreload() {
  const layers = $$('.backdrop__layer');
  let active = 0;
  let current = 'ganesh-opening';
  const sections = $$('main [data-bg]');

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const section = entry.target;
      const bg = section.dataset.bg;
      if (bg && bg !== current) {
        current = bg;
        active ^= 1;
        layers[active].style.backgroundImage = `url(/assets/img/${bg}-blur.webp)`;
        layers[active].classList.add('is-active');
        layers[active ^ 1].classList.remove('is-active');
      }
      const next = sections[sections.indexOf(section) + 1];
      next?.querySelector('img[loading="lazy"]')?.setAttribute('loading', 'eager');
    }
  }, { threshold: 0.35 });
  sections.forEach((s) => io.observe(s));
}

/** CSS animations (disco beams, mandap rays, shimmer…) pause while their section is off screen. */
function pauseOffscreenAnimations() {
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.target.classList.toggle('is-offscreen', !e.isIntersecting));
  }, { rootMargin: '100px 0px' });
  $$('main section').forEach((s) => io.observe(s));
}
