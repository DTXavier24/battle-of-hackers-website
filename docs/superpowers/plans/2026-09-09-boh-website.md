# APU Battle of Hackers Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static single-page event site with hero, host, scroll-revealed history timeline, side-rail navigation, and footer.

**Architecture:** Astro 5 static site. Content lives in `src/data/`; components in `src/components/` are presentational. Two tiny vanilla scripts (rail active state, scroll reveal) use IntersectionObserver. A Vitest test validates the timeline JSON so bad edits fail the build.

**Tech Stack:** Astro 5, Tailwind CSS 4 (`@tailwindcss/vite`), TypeScript strict, Vitest, Node 24.

**Spec:** `docs/superpowers/specs/2026-09-09-boh-website-design.md`

## Global Constraints

- Static output only; no client framework; no backend.
- Palette tokens exactly: `--bg #050607`, `--bg-2 #0B0E12`, `--cyan #48E0E0`, `--red #F05C55`, `--fg #F4F6F8`, `--fg-muted #8A94A0`.
- The 2026 poster (`images/IBOH 2026.jpg`) is never copied to `public/` or shown.
- All motion respects `prefers-reduced-motion: reduce`.
- Placeholder copy is marked with an HTML/JSON comment or `PLACEHOLDER` so the club can find it.
- Every commit ends with the session attribution trailer.

---

### Task 1: Scaffold project, tokens, base layout

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `src/styles/global.css`, `src/layouts/Base.astro`, `src/pages/index.astro`

**Interfaces:**
- Produces: `Base.astro` with props `{ title: string; description: string }`, a default slot, and a named `rail` slot.

- [ ] **Step 1: Create package.json and install**

```json
{
  "name": "battle-of-hackers-website",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run"
  }
}
```

Run: `npm install astro @tailwindcss/vite tailwindcss` then `npm install -D @astrojs/check typescript vitest`

- [ ] **Step 2: astro.config.mjs, tsconfig.json, .gitignore**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  output: 'static',
  vite: { plugins: [tailwindcss()] },
});
```

```json
// tsconfig.json
{ "extends": "astro/tsconfigs/strict", "include": [".astro/types.d.ts", "**/*"], "exclude": ["dist"] }
```

`.gitignore` contains `node_modules/`, `dist/`, `.astro/`.

- [ ] **Step 3: global.css with tokens, fonts, texture, reveal keyframes**

```css
@import "tailwindcss";
@theme {
  --color-bg: #050607; --color-bg-2: #0B0E12;
  --color-cyan: #48E0E0; --color-red: #F05C55;
  --color-fg: #F4F6F8; --color-fg-muted: #8A94A0;
  --font-display: "Chakra Petch", "Arial Narrow", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --font-sans: "Inter", system-ui, sans-serif;
}
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
body { background: var(--color-bg); color: var(--color-fg); font-family: var(--font-sans); }
.reveal { opacity: 0; transform: translateY(24px); transition: opacity .6s ease, transform .6s ease; }
.reveal.is-visible { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; transition: none; } }
```

- [ ] **Step 4: Base.astro and a placeholder index.astro**

Base.astro loads Google Fonts (Chakra Petch 600/700, JetBrains Mono 400/500, Inter 400/500), imports global.css, renders `<slot name="rail" />` then `<main><slot /></main>`.

- [ ] **Step 5: Verify build**

Run: `npm run build`. Expected: `dist/index.html` exists, no errors.

- [ ] **Step 6: Commit** `chore: scaffold astro site with tokens and base layout`

---

### Task 2: Timeline data + schema + test

**Files:**
- Create: `src/data/timeline.schema.ts`, `src/data/timeline.json`, `tests/timeline.test.ts`, `vitest.config.ts`
- Copy: `images/BOH2022.png` to `public/posters/boh-2022.png`; `images/BOH 2023.jpeg` to `public/posters/boh-2023.jpeg`; `images/BOH2024.jpeg` to `public/posters/iboh-2024.jpeg`; `images/IBOH 2025.jpeg` to `public/posters/iboh-2025.jpeg`

**Interfaces:**
- Produces: `type TimelineEntry`, `validateTimeline(data: unknown): TimelineEntry[]` (throws `Error` naming entry index and field on failure), and `timeline.json` as `TimelineEntry[]`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/timeline.test.ts
import { describe, it, expect } from 'vitest';
import { validateTimeline } from '../src/data/timeline.schema';
import data from '../src/data/timeline.json';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

describe('timeline.json', () => {
  it('validates against the schema', () => {
    expect(() => validateTimeline(data)).not.toThrow();
  });
  it('has unique ids in chronological order', () => {
    const ids = validateTimeline(data).map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(ids);
  });
  it('references posters that exist under public/', () => {
    for (const e of validateTimeline(data)) {
      if (e.poster) expect(existsSync(join('public', e.poster))).toBe(true);
    }
  });
  it('rejects a malformed entry', () => {
    expect(() => validateTimeline([{ id: 'x' }])).toThrow(/entry 0/);
  });
});
```

- [ ] **Step 2: Run** `npm test`. Expected: FAIL, module not found.

- [ ] **Step 3: Implement schema**

```ts
// src/data/timeline.schema.ts
export type TimelineEntry = {
  id: string; years: string; title: string; subtitle?: string;
  description: string; poster?: string; status?: 'past' | 'upcoming';
};
function isStr(v: unknown): v is string { return typeof v === 'string' && v.length > 0; }
export function validateTimeline(data: unknown): TimelineEntry[] {
  if (!Array.isArray(data)) throw new Error('timeline must be an array');
  return data.map((e, i) => {
    const bad = (f: string) => new Error(`timeline entry ${i}: invalid "${f}"`);
    if (typeof e !== 'object' || e === null) throw bad('entry');
    const o = e as Record<string, unknown>;
    for (const f of ['id', 'years', 'title', 'description']) if (!isStr(o[f])) throw bad(f);
    if (o.subtitle !== undefined && !isStr(o.subtitle)) throw bad('subtitle');
    if (o.poster !== undefined && !isStr(o.poster)) throw bad('poster');
    if (o.status !== undefined && o.status !== 'past' && o.status !== 'upcoming') throw bad('status');
    return o as TimelineEntry;
  });
}
```

- [ ] **Step 4: Write timeline.json** with the five entries from the spec table, copy posters, add `vitest.config.ts` with `test.include = ['tests/**/*.test.ts']`.

- [ ] **Step 5: Run** `npm test`. Expected: 4 passed.

- [ ] **Step 6: Commit** `feat: add timeline data with schema validation`

---

### Task 3: Site config + Hero

**Files:**
- Create: `src/data/site.ts`, `src/components/Hero.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Produces: `site` object `{ name, tagline, ctfUrl: string | null, event: { date, mode, venue }, socials: { label, href }[] }`.

- [ ] **Step 1: site.ts** with `ctfUrl: null`, event `{ date: '14 Nov 2026', mode: 'Hybrid', venue: 'APU Campus' }`, socials for Instagram, LinkedIn, Email with PLACEHOLDER hrefs.
- [ ] **Step 2: Hero.astro**: `<section id="home">` min-h-screen; eyebrow, display headline "APU Battle of Hackers" with cyan/red offset text-shadow glitch, summary paragraph (PLACEHOLDER), chips row, button rendered as `<a href>` when `site.ctfUrl` is set, otherwise `<button disabled aria-describedby="ctf-hint">` plus `<p id="ctf-hint">Coming soon. The CTF platform opens closer to the event.</p>`.
- [ ] **Step 3: Render in index.astro; run** `npm run build`. Expected: PASS.
- [ ] **Step 4: Commit** `feat: hero section with disabled Join CTF`

---

### Task 4: Host section

**Files:**
- Create: `src/components/Host.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Host.astro**: `<section id="host">`, two-column on md+: left text (full name, paragraph PLACEHOLDER, mission list of 4 PLACEHOLDER points with cyan markers), right logo slot: if `public/logos/fsec-ss.png` exists at build time (`fs.existsSync`) render `<img>`, else a bordered text mark "FSEC-SS".
- [ ] **Step 2: Build passes. Commit** `feat: host section`

---

### Task 5: Timeline component + reveal script

**Files:**
- Create: `src/components/Timeline.astro`, `src/components/TimelineEntry.astro`, `src/scripts/reveal.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `validateTimeline`, `timeline.json` from Task 2.
- Produces: `initReveal(selector = '.reveal')`, which adds `is-visible` when an element intersects (threshold 0.2) and unobserves after the first hit.

- [ ] **Step 1: reveal.ts**

```ts
export function initReveal(selector = '.reveal') {
  const els = document.querySelectorAll<HTMLElement>(selector);
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('is-visible')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
  }, { threshold: 0.2 });
  els.forEach(e => io.observe(e));
}
```

- [ ] **Step 2: TimelineEntry.astro** props `{ entry: TimelineEntry; index: number }`. Layout: grid with a centre line column on md+; card on the left for even index, right for odd; mobile single column with the line at the left. Card: years in mono cyan, title in display face, subtitle muted, description, poster `<img loading="lazy" width height>` in an `aspect-square` box. If `status === 'upcoming'` render a placeholder tile with a pulsing "Incoming" badge in red (`animate-pulse`, disabled under reduced motion). Card root has class `reveal`.
- [ ] **Step 3: Timeline.astro**: `<section id="history">`, heading, `validateTimeline(data).map(...)`, `<script>` calling `initReveal()`.
- [ ] **Step 4: Build passes; commit** `feat: scroll-revealed history timeline`

---

### Task 6: Side rail

**Files:**
- Create: `src/components/SideRail.astro`, `src/scripts/rail.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Produces: `initRail(navSelector = '[data-rail]')`, which observes sections whose ids match the rail links' hashes and sets `aria-current="true"` and `data-active` on the active link.

- [ ] **Step 1: rail.ts**

```ts
export function initRail(navSelector = '[data-rail]') {
  const nav = document.querySelector(navSelector); if (!nav) return;
  const links = [...nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
  const sections = links.map(l => document.querySelector<HTMLElement>(l.hash)).filter((s): s is HTMLElement => !!s);
  const setActive = (id: string) => links.forEach(l => {
    const on = l.hash === `#${id}`; l.toggleAttribute('data-active', on);
    if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
  });
  const io = new IntersectionObserver((entries) => {
    const vis = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (vis) setActive(vis.target.id);
  }, { threshold: [0.25, 0.5, 0.75] });
  sections.forEach(s => io.observe(s));
  if (sections[0]) setActive(sections[0].id);
}
```

- [ ] **Step 2: SideRail.astro**: `<nav data-rail aria-label="Sections">` fixed right-4 top-1/2 -translate-y-1/2; `<ol>` of three links Home/Host/History; each link has a marker bar (2px wide, grows and turns cyan when `[data-active]`) and a label (hidden below md, visible md+). `<script>` calls `initRail()`.
- [ ] **Step 3: Slot into index.astro via `<SideRail slot="rail" />`. Build passes. Commit** `feat: side rail navigation with active section`

---

### Task 7: Footer, assemble, verify

**Files:**
- Create: `src/components/Footer.astro`
- Modify: `src/pages/index.astro`, `README.md`

- [ ] **Step 1: Footer.astro**: org marks (logos if present, else text), socials from `site.socials`, copyright line with current year, FSEC-SS and Asia Pacific University.
- [ ] **Step 2: index.astro final order: SideRail (rail slot), Hero, Host, Timeline, Footer.**
- [ ] **Step 3: README**: project purpose, `npm run dev/build/test`, how to enable Join CTF (`ctfUrl`), how to add a timeline year, where to drop logos.
- [ ] **Step 4: Run** `npm run check`, `npm test`, `npm run build`. Expected: all PASS.
- [ ] **Step 5: Manual check** in browser at 375px and 1440px: rail highlight, disabled button, reveal, no horizontal scroll.
- [ ] **Step 6: Commit** `feat: footer, readme, assemble page`
