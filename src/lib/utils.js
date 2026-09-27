export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Slow connection or Data Saver: load the small images and lighten effects.
const conn = navigator.connection || {};
export const slowNet = conn.saveData === true || /(^|slow-)2g|3g/.test(conn.effectiveType || '');

// Rough "low-end device" check used to cap particles.
export const lowEnd = slowNet ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
  (navigator.deviceMemory && navigator.deviceMemory <= 3);

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function vibrate(pattern) {
  try { navigator.vibrate?.(pattern); } catch { /* unsupported */ }
}

/** Guest name from ?to=…, stripped to plain text. Always rendered via textContent. */
export function guestName(fallback = 'Family & Friends') {
  const raw = new URLSearchParams(location.search).get('to') || '';
  const clean = raw
    .replace(/[\u0000-\u001f\u007f<>{}\[\]\\`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
  return clean || fallback;
}

/**
 * Converts a point given as % of an image's natural size into px inside the
 * image's box, honouring object-fit (cover or contain) and object-position.
 */
export function mapCoverPoint(img, xPct, yPct) {
  const nw = img.naturalWidth || +img.getAttribute('width');
  const nh = img.naturalHeight || +img.getAttribute('height');
  const bw = img.clientWidth;
  const bh = img.clientHeight;
  const style = getComputedStyle(img);
  const scale = (style.objectFit === 'contain' ? Math.min : Math.max)(bw / nw, bh / nh);
  const dw = nw * scale;
  const dh = nh * scale;
  const [px, py] = style.objectPosition.split(' ').map((v) => parseFloat(v) / 100);
  return {
    x: (bw - dw) * (isNaN(px) ? 0.5 : px) + (xPct / 100) * dw,
    y: (bh - dh) * (isNaN(py) ? 0.5 : py) + (yPct / 100) * dh,
    scale,
  };
}

/**
 * Places `.zone[data-zone="x1 y1 x2 y2"]` (image %, from ASSET_NOTES.md) over the
 * artwork's empty area, then shrinks its `.zone__inner` to fit if the content is taller.
 */
export function placeZones(root) {
  const img = root.querySelector('img.art');
  const zones = [...root.querySelectorAll('.zone[data-zone]')];
  if (!img || !zones.length) return;
  const gutter = 14;
  const place = () => {
    const W = root.clientWidth;
    const H = root.clientHeight;
    for (const zone of zones) {
      const [x1, y1, x2, y2] = zone.dataset.zone.split(' ').map(Number);
      const a = mapCoverPoint(img, x1, y1);
      const b = mapCoverPoint(img, x2, y2);
      const left = Math.max(gutter, a.x);
      const right = Math.min(W - gutter, b.x);
      const top = Math.max(gutter, a.y);
      const bottom = Math.min(H - gutter, b.y);
      Object.assign(zone.style, {
        left: `${left}px`, top: `${top}px`,
        width: `${right - left}px`, height: `${bottom - top}px`,
      });
      fit(zone);
    }
  };
  const fit = (zone) => {
    const inner = zone.querySelector('.zone__inner');
    if (!inner) return;
    // Shrink if too tall, or if a no-wrap line (date/time) is wider than the zone
    const wide = Math.max(inner.scrollWidth, ...[...inner.querySelectorAll('.meta')].map((m) => m.scrollWidth));
    const k = Math.min(1, zone.clientHeight / inner.offsetHeight, zone.clientWidth / wide);
    inner.style.transform = k < 0.995 ? `scale(${k.toFixed(3)})` : '';
  };
  if (img.complete) place();
  else img.addEventListener('load', place, { once: true });
  const ro = new ResizeObserver(place);
  ro.observe(root);
  zones.forEach((z) => z.querySelector('.zone__inner') && ro.observe(z.querySelector('.zone__inner')));
}

/** Positions every .hotspot[data-art-x][data-art-y] inside `root` onto its artwork. */
export function placeHotspots(root) {
  const img = root.querySelector('img.art');
  if (!img) return;
  const place = () => {
    root.querySelectorAll('.hotspot[data-art-x]').forEach((el) => {
      const { x, y } = mapCoverPoint(img, +el.dataset.artX, +el.dataset.artY);
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
    });
  };
  if (img.complete) place();
  else img.addEventListener('load', place, { once: true });
  new ResizeObserver(place).observe(img);
}

/**
 * Responsive image attributes for a background: 480w for 1x phones, 800w for 2x.
 * On slow connections only the 480w file is offered.
 */
export const ART_SIZES = '(max-width: 480px) 100vw, 480px';
export function artSrc(name) {
  const small = `/assets/img/${name}-480.webp`;
  const big = `/assets/img/${name}.webp`;
  return slowNet
    ? { src: small, srcset: '' }
    : { src: big, srcset: `${small} 480w, ${big} 800w` };
}

/** Fades each artwork in once it has loaded (the blurred placeholder shows until then). */
export function fadeInArt(root = document) {
  root.querySelectorAll('img.art--full:not(.is-loaded)').forEach((img) => {
    const done = () => img.classList.add('is-loaded');
    if (img.complete && img.naturalWidth) done();
    else {
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    }
  });
}
