import { z } from 'zod';

/**
 * Global search index: screens, invoices, B/Ls ready to invoice, customers, charge codes and master data, as
 * published by GIRS. Bookings, containers and vessel/voyages are derived from invoices and B/Ls. Result links
 * use prototype-style hrefs ("invoice-list-v2.html?q=…") that the router resolves (shared/lib/routing).
 */
const rows = z.array(z.array(z.string())).optional();
export const searchIndexDtoSchema = z.object({ screens: rows, inv: rows, rdy: rows, cust: rows, chg: rows, master: rows });
export type SearchIndexDto = z.infer<typeof searchIndexDtoSchema>;

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
  key: GroupKey;
  /** English heading. */
  head: string;
  n: number;
  best: number;
  items: SearchItem[];
  more: SearchItem | null;
}

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

const enc = encodeURIComponent;

/** Turns the index DTO into search items (screens, invoices, B/Ls, bookings, containers, voyages, customers, charges, masters). */
export function toSearchItems(D: SearchIndexDto): SearchItem[] {
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
