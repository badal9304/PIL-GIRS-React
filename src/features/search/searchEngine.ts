/**
 * Global search: one index over screens, invoices, B/Ls ready to invoice, bookings, containers,
 * vessel/voyages, customers, charge codes and master data. Results link with prototype-style hrefs
 * ("invoice-list-v2.html?q=…") that the router resolves (see navigation.routeOf).
 */
export type GroupKey = 'screen' | 'inv' | 'rdy' | 'bkg' | 'cntr' | 'vvd' | 'cust' | 'chg' | 'master';
export type IconKey = GroupKey | 'recent' | 'enq';

export interface SearchItem {
  g: GroupKey | 'enq';
  main: string;
  sub?: string;
  hay?: string;
  href: string;
  tag?: string;
  more?: boolean;
  enq?: boolean;
  recent?: boolean;
}

export interface SearchGroup {
  head: string;
  n: number;
  best: number;
  items: SearchItem[];
  more: SearchItem | null;
}

interface RawIndex {
  screens?: string[][];
  inv?: string[][];
  rdy?: string[][];
  cust?: string[][];
  chg?: string[][];
  master?: string[][];
}

const MAX: Record<GroupKey, number> = { screen: 5, inv: 5, rdy: 5, bkg: 3, cntr: 3, vvd: 3, cust: 4, chg: 4, master: 5 };
export const GROUPS: [GroupKey, string][] = [
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

/** Extra words people use for a screen, so "tax", "gst", "fx" or "aging" find the right page. */
const ALIAS: Record<string, string> = {
  'tax-setup.html': 'gst vat tax code rate',
  'exchange-rate-master.html': 'fx roe rate of exchange currency rate',
  'soa-aging.html': 'statement of account ageing aging overdue',
  'receipting.html': 'receipt payment collection',
  'credit-note-list.html': 'cn credit note refund',
  'credit-notes.html': 'cn credit note refund',
  'enquiry.html': 'enquiry monitoring track',
  'invoice-list-v2.html': 'invoices ready to invoice generate',
  'manual-invoice.html': 'manual misc invoice',
  'einvoice-exceptions.html': 'e-invoice einvoice irn',
  'dar-console.html': 'dar daily activity report',
  'month-end.html': 'close period month end',
  'reconciliation.html': 'reconcile bank gfs',
};

const norm = (s: unknown) => String(s || '').toLowerCase();
const enc = encodeURIComponent;

let index: SearchItem[] | null = null;

/** Loads the index on first use (kept out of the main bundle). */
export async function loadIndex(): Promise<SearchItem[]> {
  if (index) return index;
  const raw = (await import('./searchIndex.json')).default as RawIndex;
  index = build(raw);
  return index;
}

function build(D: RawIndex): SearchItem[] {
  const R: SearchItem[] = (D.screens || []).map((x) => ({
    g: 'screen',
    main: x[1],
    sub: x[2] || 'Screen',
    hay: x[1] + ' ' + x[2] + ' ' + (ALIAS[x[0]] || ''),
    href: x[0],
  }));
  const uniq = (g: GroupKey, list: string[][], href: (k: string) => string) => {
    const c: Record<string, { n: number; sub: string }> = {};
    list.forEach((x) => {
      if (!x[0]) return;
      (c[x[0]] = c[x[0]] || { n: 0, sub: x[1] }).n++;
    });
    Object.keys(c).forEach((k) =>
      R.push({
        g,
        main: k,
        sub: c[k].n + (c[k].n === 1 ? ' invoice' : ' invoices') + (c[k].sub ? ' · ' + c[k].sub : ''),
        hay: k,
        href: href(k),
      }),
    );
  };
  const inv = D.inv || [];
  inv.forEach((i) =>
    R.push({
      g: 'inv',
      main: i[0],
      sub: [i[1], i[4], i[2], i[7], i[8]].filter(Boolean).join(' · '),
      hay: i.join(' '),
      tag: i[10],
      href: 'invoice-list-v2.html?q=' + enc(i[0]) + '&open=' + enc(i[0]),
    }),
  );
  (D.rdy || []).forEach((r) =>
    R.push({
      g: 'rdy',
      main: r[1],
      sub: [r[3], r[5], r[2]].filter(Boolean).join(' · '),
      hay: r.slice(1).join(' '),
      tag: r[6],
      href: 'invoice-list-v2.html?rv=' + enc(r[0]),
    }),
  );
  const toList = (k: string) => 'invoice-list-v2.html?q=' + enc(k);
  uniq('bkg', inv.map((i) => [i[3], i[4]]).concat((D.rdy || []).map((r) => [r[2], r[3]])), toList);
  uniq(
    'cntr',
    inv.map((i) => [i[5], i[4]]),
    toList,
  );
  uniq(
    'vvd',
    inv.map((i) => [i[6], '']),
    toList,
  );
  (D.cust || []).forEach((c) =>
    R.push({
      g: 'cust',
      main: c[1],
      sub: c[0] + (c[2] ? ' · ' + c[2] : ''),
      hay: c.join(' '),
      href: 'customer-master.html?q=' + enc(c[0]),
    }),
  );
  (D.chg || []).forEach((c) => R.push({ g: 'chg', main: c[0], sub: c[1], hay: c.join(' '), href: 'charge-master.html?q=' + enc(c[0]) }));
  (D.master || []).forEach((m) => {
    if (m[0] === 'charge-master.html' && (D.chg || []).some((c) => c[0] === m[2])) return;
    R.push({
      g: 'master',
      main: m[3] + (m[2] && m[2] !== m[3] ? '  ' + m[2] : ''),
      sub: m[1] + (m[4] ? ' · ' + m[4] : ''),
      hay: m.slice(1).join(' '),
      href: m[0] + '?q=' + enc(m[2]),
    });
  });
  return R;
}

/** Every token must match; plain words match the start of a word, codes and numbers match anywhere. */
function score(main: string, hay: string, toks: string[], full: string) {
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

export function recentItems(): SearchItem[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

export function remember(it: SearchItem) {
  try {
    const r = recentItems().filter((x) => x.href !== it.href);
    r.unshift({ g: it.g, main: it.main, sub: it.sub, href: it.href });
    localStorage.setItem(RECENT_KEY, JSON.stringify(r.slice(0, 6)));
  } catch {
    /* ignore */
  }
}

export function clearRecent() {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {
    /* ignore */
  }
}
