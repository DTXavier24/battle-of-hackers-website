import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { validateTimeline } from '../src/data/timeline.schema';
import data from '../src/data/timeline.json';

describe('timeline.json', () => {
  it('validates against the schema', () => {
    expect(() => validateTimeline(data)).not.toThrow();
  });

  it('has unique ids in chronological order', () => {
    const ids = validateTimeline(data).map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(ids);
  });

  it('references posters that exist under public/', () => {
    for (const e of validateTimeline(data)) {
      if (e.poster) expect(existsSync(join('public', e.poster)), e.poster).toBe(true);
    }
  });

  it('does not serve the unreleased main 2026 poster', () => {
    // The "coming soon" teaser is allowed; the full IBOH 2026 poster is not yet.
    expect(existsSync(join('public', 'posters', 'iboh-2026.jpg'))).toBe(false);
    for (const e of validateTimeline(data)) {
      expect(e.poster ?? '').not.toBe('/posters/iboh-2026.jpg');
    }
  });

  it('rejects a malformed entry', () => {
    expect(() => validateTimeline([{ id: 'x' }])).toThrow(/entry 0/);
  });
});
