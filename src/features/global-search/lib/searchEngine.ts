import type { GroupKey, SearchGroup, SearchItem } from '@/entities/search-index';
import { readJson, removeStore, writeJson } from '@/shared/lib/storage';
import { z } from 'zod';

/** Ranking, grouping and highlighting of global search results, and the recent-items list. */
const MAX: Record<GroupKey, number> = { screen: 5, inv: 5, rdy: 5, bkg: 3, cntr: 3, vvd: 3, cust: 4, chg: 4, master: 5 };
/** Result groups in display order, with their English heading (translation key). */
export const GROUPS: ReadonlyArray<readonly [GroupKey, string]> = [
  ['screen', 'Screens'],
  ['inv', 'Invoices'],
  ['rdy', 'Ready to invoice'],
  ['cust', 'Customers'],
  ['bkg', 'Bookings'],
  ['cntr', 'Containers'],
  ['vvd', 'Vessel / Voyage'],
  ['chg', 'Charge codes'],
  ['master', 'Master data'],
];

const norm = (s: unknown): string => String(s || '').toLowerCase();
const enc = encodeURIComponent;

/** Every token must match; plain words match the start of a word, codes and numbers match anywhere. */
function score(main: string, hay: string, toks: string[], full: string): number {
  const m = norm(main);
  const h = norm(hay);
  const words = h.split(/[^a-z0-9]+/);
  for (const k of toks) {
    const ok = /[^a-z]/.test(k) ? h.indexOf(k) >= 0 : words.some((w) => w.indexOf(k) === 0);
    if (!ok) return 0;
  }
  if (m === full) return 100;
  if (m.indexOf(full) === 0) return 60;
  if (m.indexOf(full) >= 0) return 35;
  return 10;
}

export function search(all: SearchItem[], query: string): { groups: SearchGroup[]; toks: string[] } {
  const full = norm(query).trim();
  const toks = full.split(/\s+/).filter(Boolean);
  const by: Partial<Record<string, [number, SearchItem][]>> = {};
  all.forEach((it) => {
    const sc = score(it.main, (it.hay || '') + ' ' + (it.sub || ''), toks, full);
    if (sc) (by[it.g] = by[it.g] || []).push([sc, it]);
  });
  const out: SearchGroup[] = [];
  GROUPS.forEach(([key, head]) => {
    const l = (by[key] || []).sort((x, y) => y[0] - x[0]);
    if (!l.length) return;
    out.push({
      key,
      head,
      n: l.length,
      best: l[0][0],
      items: l.slice(0, MAX[key]).map((x) => x[1]),
      more:
        l.length > MAX[key] && key === 'inv'
          ? {
              main: 'Show all ' + l.length + ' ' + head.toLowerCase() + ' in Invoice List',
              href: 'invoice-list-v2.html?q=' + enc(query.trim()),
              g: 'enq',
              more: true,
            }
          : null,
    });
  });
  // a group with an exact hit moves to the top (e.g. typing a full invoice number)
  out.sort((x, y) => Number(y.best >= 100) - Number(x.best >= 100));
  return { groups: out, toks };
}

/** Splits text into plain / highlighted parts for the matched tokens. */
export function highlight(text: string, toks: string[]): { text: string; hit: boolean }[] {
  const t = String(text || '');
  const low = t.toLowerCase();
  const hits: [number, number][] = [];
  toks.forEach((k) => {
    const word = !/[^a-z]/.test(k);
    let i = low.indexOf(k);
    while (k && i >= 0) {
      if (!word || i === 0 || /[^a-z0-9]/.test(low.charAt(i - 1))) hits.push([i, i + k.length]);
      i = low.indexOf(k, i + k.length);
    }
  });
  if (!hits.length) return [{ text: t, hit: false }];
  hits.sort((x, y) => x[0] - y[0]);
  const out: { text: string; hit: boolean }[] = [];
  let p = 0;
  hits.forEach(([s0, e0]) => {
    if (s0 < p) return;
    if (s0 > p) out.push({ text: t.slice(p, s0), hit: false });
    out.push({ text: t.slice(s0, e0), hit: true });
    p = e0;
  });
  if (p < t.length) out.push({ text: t.slice(p), hit: false });
  return out;
}

const RECENT_KEY = 'girs.recent';
const MAX_RECENT = 6;

const recentSchema = z.array(
  z.object({
    g: z.enum(['screen', 'inv', 'rdy', 'bkg', 'cntr', 'vvd', 'cust', 'chg', 'master', 'enq']),
    main: z.string(),
    sub: z.string().optional(),
    href: z.string(),
  }),
);

/** Results the user opened recently (newest first). */
export function recentItems(): SearchItem[] {
  return readJson(RECENT_KEY, recentSchema, []);
}

export function remember(it: SearchItem): void {
  const list = recentItems().filter((x) => x.href !== it.href);
  list.unshift({ g: it.g, main: it.main, sub: it.sub, href: it.href });
  writeJson(RECENT_KEY, list.slice(0, MAX_RECENT));
}

export function clearRecent(): void {
  removeStore(RECENT_KEY);
}
