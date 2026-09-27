// Small announcement bubble; also read out by screen readers (aria-live region in index.html).
let timer = 0;

export function toast(message, ms = 3200) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(timer);
  timer = setTimeout(() => el.classList.remove('is-visible'), ms);
}
