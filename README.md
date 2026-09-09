# Battle of Hackers Website

Single-page information site for APU's annual Battle of Hackers CTF, run by FSEC-SS.
Static build with Astro and Tailwind. No backend.

## Develop

```bash
npm install
npm run dev      # local server with hot reload
npm run build    # static output in dist/
npm run preview  # serve dist/ locally
npm run check    # type-check .astro and .ts files
npm test         # validates src/data/timeline.json
```

## Common edits

**Enable the Join CTF button.** Set `ctfUrl` in `src/data/site.ts` to the CTFd URL.
While it is `null` the button renders disabled with a "Coming soon" note.

**Event details, socials.** Edit `src/data/site.ts`.

**Add a year to the timeline.** Drop the poster in `public/posters/` and append an
entry to `src/data/timeline.json`:

```json
{
  "id": "2027",
  "years": "2027",
  "title": "International Battle of Hackers",
  "subtitle": "Optional tagline",
  "description": "One or two sentences.",
  "poster": "/posters/iboh-2027.jpg"
}
```

Set `"status": "upcoming"` and omit `poster` for a future edition. `npm test`
catches malformed entries and missing poster files.

**Logos.** Put `fsec-ss.png` and `apu.png` in `public/logos/`. The host section and
footer pick them up automatically and fall back to text marks otherwise.

**Copy to replace.** Search the source for `PLACEHOLDER` to find draft text.

## Structure

```
src/data/        site config, timeline data and its schema
src/components/  Hero, Host, Timeline, TimelineEntry, SideRail, Footer
src/scripts/     rail active-section observer, scroll reveal
src/styles/      design tokens and shared utilities
images/          original poster files (source archive, not served)
public/posters/  posters served by the site
```

## Hosting

The build is plain static files. Cloudflare Pages or GitHub Pages will serve `dist/`
once a domain is available. Build command `npm run build`, output directory `dist`.
