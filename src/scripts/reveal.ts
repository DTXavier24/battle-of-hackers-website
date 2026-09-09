/**
 * Adds `is-visible` to each matched element the first time it scrolls into
 * view. Falls back to showing everything when IntersectionObserver is absent.
 */
export function initReveal(selector = '.reveal') {
  const els = document.querySelectorAll<HTMLElement>(selector);
  if (!('IntersectionObserver' in window)) {
    els.forEach((e) => e.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      }
    },
    { threshold: 0.2 },
  );
  els.forEach((e) => io.observe(e));
}
