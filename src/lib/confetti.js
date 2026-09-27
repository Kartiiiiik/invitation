// canvas-confetti is loaded on first use (a separate small file), so it never delays the page.
let lib = null;
const load = () => (lib ??= import('canvas-confetti').then((m) => m.default));

export function confetti(opts) {
  load().then((fire) => fire(opts)).catch(() => {});
}

/** Start fetching early (e.g. when a section with confetti comes near) so the first burst is instant. */
export const prefetchConfetti = () => { load().catch(() => {}); };
