/**
 * Highlights the side-rail link whose section is most visible. Sets
 * `data-active` (for styling) and `aria-current` (for assistive tech).
 */
export function initRail(navSelector = '[data-rail]') {
  const nav = document.querySelector(navSelector);
  if (!nav) return;

  const links = [...nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
  const sections = links
    .map((l) => document.querySelector<HTMLElement>(l.hash))
    .filter((s): s is HTMLElement => s !== null);

  const setActive = (id: string) => {
    for (const l of links) {
      const on = l.hash === `#${id}`;
      l.toggleAttribute('data-active', on);
      if (on) l.setAttribute('aria-current', 'true');
      else l.removeAttribute('aria-current');
    }
  };

  const io = new IntersectionObserver(
    (entries) => {
      const best = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (best) setActive(best.target.id);
    },
    { threshold: [0.25, 0.5, 0.75] },
  );
  sections.forEach((s) => io.observe(s));
  if (sections[0]) setActive(sections[0].id);
}
