export type TimelineEntry = {
  /** Unique, sortable id used for anchors (e.g. "2023"). */
  id: string;
  /** Display label for the era, e.g. "2016–2022". */
  years: string;
  title: string;
  subtitle?: string;
  description: string;
  /** Path under /public, e.g. "/posters/boh-2023.jpeg". */
  poster?: string;
  status?: 'past' | 'upcoming';
};

function isStr(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}

export function validateTimeline(data: unknown): TimelineEntry[] {
  if (!Array.isArray(data)) throw new Error('timeline must be an array');
  return data.map((e, i) => {
    const bad = (field: string) => new Error(`timeline entry ${i}: invalid "${field}"`);
    if (typeof e !== 'object' || e === null) throw bad('entry');
    const o = e as Record<string, unknown>;
    for (const f of ['id', 'years', 'title', 'description']) if (!isStr(o[f])) throw bad(f);
    if (o.subtitle !== undefined && !isStr(o.subtitle)) throw bad('subtitle');
    if (o.poster !== undefined && !isStr(o.poster)) throw bad('poster');
    if (o.status !== undefined && o.status !== 'past' && o.status !== 'upcoming') throw bad('status');
    return o as TimelineEntry;
  });
}
