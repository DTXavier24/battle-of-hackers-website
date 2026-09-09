# APU Battle of Hackers — Event Website Design

Date: 2026-09-09
Status: approved in chat, implementation starting

## Purpose

A single-page, information-only website for the annual Battle of Hackers CTF
run by FSEC-SS (APU Forensic & Cybersecurity Research Centre Student Section).
The site presents the event, the host, and the event's history. It does not
handle registration, scoring, or challenges; the CTFd instance will be linked
from the "Join CTF" button shortly before the 2026 competition.

## Stack

- Astro 5, static output (`output: 'static'`), TypeScript strict.
- Tailwind CSS 4 via `@tailwindcss/vite`.
- No client UI framework. One small vanilla script handles side-rail active
  state and scroll reveal using `IntersectionObserver`.
- Google Fonts loaded via `<link>`; every face has a system fallback.
- Vitest for the single data-validation test.
- Hosting later: Cloudflare Pages (or GitHub Pages). Nothing in the code depends
  on the host. Domain not yet available; no deploy config in this round.

## Visual direction

Follow the 2026 poster palette:

| Token        | Value     | Use                                  |
| ------------ | --------- | ------------------------------------ |
| `--bg`       | `#050607` | page background                      |
| `--bg-2`     | `#0B0E12` | cards, rail                          |
| `--cyan`     | `#48E0E0` | primary accent, active states, lines |
| `--red`      | `#F05C55` | secondary accent, "incoming" badge   |
| `--fg`       | `#F4F6F8` | body text                            |
| `--fg-muted` | `#8A94A0` | secondary text                       |

Type: a condensed display face for headings (e.g. Chakra Petch or Orbitron),
a monospace face for labels/dates (e.g. JetBrains Mono), and a clean sans for
body. Subtle dot-grid or scanline texture on the background is allowed, kept
low-contrast. Glitch/offset treatment on the hero title echoes the poster.

The 2026 poster image itself is NOT displayed on the site in this round.

## Page structure

One route, `/`. Four regions in order; the first three are side-rail tabs.

### 1. Hero (`#home`, tab "Home")

- Full viewport height.
- Eyebrow: "FSEC-SS × APU presents".
- Headline: "APU Battle of Hackers".
- Two-sentence summary (placeholder copy, marked for replacement).
- Chips: date "14 Nov 2026", "Hybrid", "APU Campus".
- Primary button "Join CTF". Rendered as a real `<button disabled>` with a
  "Coming soon" hint when `site.ctfUrl` is `null`; becomes an `<a>` to that URL
  when set. No other logic.

### 2. Host (`#host`, tab "Host")

- Full name: APU Forensic & Cybersecurity Research Centre Student Section
  (FSEC-SS).
- One paragraph on who they are (placeholder copy).
- Mission as three or four short points (placeholder copy).
- Logo slot: `public/logos/fsec-ss.png` if present, otherwise a text mark.

### 3. History timeline (`#history`, tab "History")

Scroll-driven vertical timeline. A central line on desktop with cards
alternating left/right; a left-edge line with stacked cards on mobile. Each
card reveals (translate + fade) when it enters the viewport. Users with
`prefers-reduced-motion` get no animation.

Entries (top to bottom) come from `src/data/timeline.json`:

| id   | years     | title                                     | poster                     |
| ---- | --------- | ----------------------------------------- | -------------------------- |
| 2016 | 2016–2022 | Battle of Hackers (Internal CTF)          | `/posters/boh-2022.png`    |
| 2023 | 2023      | ASEAN Battle of Hackers                   | `/posters/boh-2023.jpeg`   |
| 2024 | 2024      | International Battle of Hackers           | `/posters/iboh-2024.jpeg`  |
| 2025 | 2025      | International Battle of Hackers           | `/posters/iboh-2025.jpeg`  |
| 2026 | 2026      | International Battle of Hackers           | none, `status: "upcoming"` |

Each entry has a one- or two-sentence description (placeholder where facts
are unknown; known facts from posters are used: dates, categories, taglines).
The 2026 entry shows a pulsing "Incoming" badge and a styled placeholder tile
instead of a poster.

Schema:

```ts
type TimelineEntry = {
  id: string;            // unique, used for anchors
  years: string;         // display label, e.g. "2016–2022"
  title: string;
  subtitle?: string;     // e.g. "Return of the Legends"
  description: string;
  poster?: string;       // path under /public
  status?: "past" | "upcoming"; // default "past"
};
```

### 4. Footer

FSEC-SS and APU text marks (logos if files are provided), social links from
`site.socials`, copyright line.

## Side rail navigation

- Fixed, right edge, vertically centred, `z-index` above content.
- Three items: Home, Host, History. Each is an anchor link.
- Active item is set by an `IntersectionObserver` on the three sections
  (threshold ~0.5). Active state: cyan label + marker bar.
- Below 768px width the labels hide and only three dots remain.
- Clicking scrolls smoothly (`scroll-behavior: smooth` on `html`), disabled
  under reduced motion.

## Files

```
astro.config.mjs
package.json
tsconfig.json
public/
  posters/boh-2022.png, boh-2023.jpeg, iboh-2024.jpeg, iboh-2025.jpeg
  logos/            (empty slot for fsec-ss.png, apu.png)
src/
  styles/global.css          tokens, fonts, texture, reveal keyframes
  data/site.ts               ctfUrl, event date/venue, socials
  data/timeline.json         entries above
  data/timeline.schema.ts    TS type + runtime validate()
  layouts/Base.astro         <head>, fonts, global.css, SideRail slot
  components/SideRail.astro
  components/Hero.astro
  components/Host.astro
  components/Timeline.astro
  components/TimelineEntry.astro
  components/Footer.astro
  scripts/rail.ts            active-section observer
  scripts/reveal.ts          scroll reveal observer
  pages/index.astro
tests/timeline.test.ts       validates timeline.json against schema
```

The original `images/` folder is kept as the source archive; the site serves
copies from `public/posters/`. `IBOH 2026.jpg` is not copied.

## Error handling

- `validate()` in `timeline.schema.ts` throws on a malformed entry; it runs at
  build time (imported by `Timeline.astro`) and in the test, so a bad edit
  fails `astro build` rather than rendering an empty card.
- Missing poster file: the `<img>` has `alt` text and a fixed aspect-ratio
  box so layout does not collapse.

## Verification

- `npm run check` (`astro check`) passes.
- `npm run test` (Vitest) passes.
- `npm run build` produces `dist/` with no warnings about missing assets.
- Manual browser check: rail highlights correct section while scrolling,
  Join CTF is disabled and labelled, timeline cards reveal, layout holds at
  375px and 1440px widths, no horizontal scroll.

## Out of scope

Sponsors section, registration, countdown, CTF platform, analytics, hosting
and domain configuration, CMS.
