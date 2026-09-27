import { gsap } from 'gsap';
import { $, reducedMotion, vibrate, placeHotspots } from '../lib/utils.js';
import { unlockAudio, playSfx, startMusic } from '../lib/audio.js';

/**
 * Section 1: Ganesh opening card. Scrolling stays locked until it parts.
 *
 * - With the gatefold (`waitForGatefold`): no button. The gatefold tap already unlocked
 *   audio; `reveal()` plays the intro, then a swipe up / scroll / tap / key parts the card.
 * - Without it: the card has its own "Tap to open" button, which unlocks audio.
 */
export function initGate({ musicSrc, onOpen, waitForGatefold = false }) {
  const gate = $('#gate');
  const btn = $('#gateOpen');
  const swipe = $('.gate__swipe', gate);
  const greeting = $('.gate__for', gate);
  const blessing = $('.gate__blessing', gate);
  const bottom = $('.gate__bottom', gate);
  const burst = $('.gate__burst', gate);
  const halves = gate.querySelectorAll('.gate__half'); // one full Ganesh image
  let opened = false;

  history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  placeHotspots(gate);
  // Let GSAP own the centring transform so the scale-in doesn't fight the CSS one.
  gsap.set(blessing, { xPercent: -50, x: 0 });

  if (waitForGatefold) {
    btn.remove();
    greeting.remove(); // the gatefold already greeted the guest
    swipe.hidden = false;
  }
  const trigger = waitForGatefold ? swipe : btn;

  // Intro: blessing fades + scales in, then the bottom row rises.
  const intro = gsap.timeline({ paused: true });
  if (reducedMotion) {
    intro.from([blessing, bottom], { autoAlpha: 0, duration: 0.8, stagger: 0.3 });
  } else {
    intro
      .from(halves, { scale: waitForGatefold ? 0.94 : 1.08, duration: waitForGatefold ? 1.8 : 2.4, ease: 'power2.out' }, 0)
      .from(blessing, { autoAlpha: 0, scale: 0.8, filter: 'blur(6px)', duration: 1.6, ease: 'expo.out' }, 0.4)
      .from(bottom, { autoAlpha: 0, y: 24, duration: 1.2, ease: 'power2.out' }, 1.2);
  }

  // (the paused intro's from() tweens already hold the start state until reveal)
  if (!waitForGatefold) {
    intro.delay(0.3).play();
    btn.focus({ preventScroll: true });
    btn.addEventListener('click', () => {
      btn.disabled = true;
      unlockAudio();
      startMusic(musicSrc, $('#musicToggle'), { silent: true });
      open();
    }, { once: true });
  }

  /** Called by the gatefold as its doors swing open. */
  function reveal() {
    intro.play(0);
    armSwipe();
  }

  // Swipe up, scroll, arrow keys or a tap anywhere parts the Ganesh card.
  function armSwipe() {
    let startY = null;
    const go = () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      gate.removeEventListener('touchstart', onStart);
      gate.removeEventListener('touchmove', onMove);
      gate.removeEventListener('click', go);
      open();
    };
    const onWheel = (e) => e.deltaY > 8 && go();
    const onKey = (e) => ['ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key) && (e.preventDefault(), go());
    const onStart = (e) => (startY = e.touches[0].clientY);
    const onMove = (e) => startY !== null && startY - e.touches[0].clientY > 30 && go();
    // Small delay so the tap that opened the doors doesn't also part the card
    setTimeout(() => {
      window.addEventListener('wheel', onWheel, { passive: true });
      window.addEventListener('keydown', onKey);
      gate.addEventListener('touchstart', onStart, { passive: true });
      gate.addEventListener('touchmove', onMove, { passive: true });
      gate.addEventListener('click', go);
    }, 900);
  }

  function finish() {
    gate.classList.add('is-gone');
    gate.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('is-locked');
    window.scrollTo(0, 0);
    onOpen?.();
  }

  function open() {
    if (opened) return;
    opened = true;
    playSfx('bell');
    vibrate(25);
    intro.progress(1);
    // CSS keyframes would override GSAP's opacity, so stop the glow loop first.
    gsap.set('.gate__painted-flame', { animation: 'none' });
    if (reducedMotion) {
      gsap.to(gate, { autoAlpha: 0, duration: 0.8, onComplete: finish });
      return;
    }

    // Burst grows from the button / swipe hint until it covers the screen.
    const g = gate.getBoundingClientRect();
    const b = trigger.getBoundingClientRect();
    const cx = b.left + b.width / 2 - g.left;
    const cy = b.top + b.height / 2 - g.top;
    gsap.set(burst, { left: cx, top: cy, bottom: 'auto' });
    const cover = (Math.hypot(Math.max(cx, g.width - cx), Math.max(cy, g.height - cy)) * 2.4) / 40;

    gsap.timeline({ onComplete: finish })
      .to(trigger, { scale: 0.9, duration: 0.15, ease: 'power2.in' })
      .to([bottom, blessing, '.gate__painted-flame', '.gate__vignette'], { autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, '<0.1')
      .to(burst, { opacity: 1, scale: cover * 0.35, duration: 0.7, ease: 'power2.out' }, '<')
      .to(burst, { scale: cover, duration: 0.6, ease: 'power2.in' })
      // The whole Ganesh card gently zooms and fades through the golden light (no split)
      .to(halves, { scale: 1.06, autoAlpha: 0, duration: 1.3, ease: 'power2.inOut' }, '-=0.25')
      .to(burst, { opacity: 0, duration: 1.1, ease: 'power2.out' }, '<0.15')
      .to(gate, { backgroundColor: 'rgba(0,0,0,0)', duration: 0.4 }, '<');
  }

  return { reveal };
}
