import { gsap } from 'gsap';

// "Written on" reveal: a soft-edged mask sweeps left → right, like ink or henna being applied.
export function setInk(el, p) {
  const m = `linear-gradient(90deg, #000 ${p - 14}%, transparent ${p}%)`;
  el.style.webkitMaskImage = m;
  el.style.maskImage = m;
}

export function inkTween(el, duration = 1.4, ease = 'power1.inOut') {
  const s = { p: 0 };
  setInk(el, 0);
  return gsap.to(s, {
    p: 114, duration, ease,
    onStart: () => gsap.set(el, { autoAlpha: 1 }),
    onUpdate: () => setInk(el, s.p),
    onComplete: () => { el.style.webkitMaskImage = el.style.maskImage = 'none'; },
  });
}

/** Stroke-draws every path/circle in an SVG; returns a timeline. */
export function drawSvg(svg, { duration = 2, stagger = 0.15, ease = 'power1.inOut' } = {}) {
  const shapes = [...svg.querySelectorAll('path, circle, ellipse, line, polyline')];
  shapes.forEach((s) => {
    const len = s.getTotalLength?.() || 300;
    s.style.strokeDasharray = `${len}`;
    s.style.strokeDashoffset = `${len}`;
  });
  return gsap.timeline().to(shapes, { strokeDashoffset: 0, duration, ease, stagger });
}
