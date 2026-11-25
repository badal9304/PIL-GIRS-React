import type { InvoiceDocInput, ReceiptDocInput } from '../lib/documents';
import type { AddedCharge, Invoice, InvoiceChanges, ReadyCharge, ReadyCheck, ReadyEdit, ReadyItem } from './invoice';
import { CHARGE_NAMES, INVOICE_CUSTOMERS, LOCATIONS, USD_RATES } from './reference';

/** Invoice rules: amounts, statuses shown in the list, search, documents, and the Ready-to-invoice review. */

/** An invoice as shown in the Invoice List: status after GIRS changes plus the derived statuses. */
export type InvoiceView = Invoice & {
  /** Payment status. */
  pay: string;
  /** Invoice Status (Unpaid / Paid / Receipted / Reconciled / Cancelled). */
  st2: InvoiceListStatus;
  /** e-Invoice status. */
  einv: 'Active' | 'Cancelled';
  /** GFS status. */
  gfs: 'Pending' | 'Posted';
  /** Country code. */
  ctry: string;
};

export type InvoiceListStatus = 'Unpaid' | 'Paid' | 'Receipted' | 'Reconciled' | 'Cancelled';

/** Columns of the invoice table (key, heading). */
export const INVOICE_COLUMNS = [
  ['st2', 'Invoice Status'],
  ['einv', 'e-Invoice'],
  ['gfs', 'GFS Status'],
  ['pay', 'Payment Status'],
  ['party', 'Customer (Billing Party)'],
  ['cust', 'Customer Code'],
  ['type', 'Invoice Type'],
  ['bkg', 'Booking No.'],
  ['bl', 'B/L No.'],
  ['cntr', 'Container No.'],
  ['vvd', 'Vessel/Voyage'],
  ['chg', 'Charge Code'],
  ['camt', 'Charge Amount'],
  ['amt', 'Invoice Amount'],
  ['cur', 'Currency'],
  ['roe', 'ROE'],
  ['tax', 'Tax Code'],
  ['due', 'Due Date'],
  ['gov', 'Govt. Reference'],
  ['files', 'PDF/JSON Link'],
  ['audit', 'Audit ID'],
] as const;
export type InvoiceColumn = (typeof INVOICE_COLUMNS)[number][0];
export const DEFAULT_COLUMNS: InvoiceColumn[] = ['st2', 'einv', 'gfs', 'party', 'type', 'bl', 'vvd', 'amt', 'cur', 'due'];
export const isInvoiceColumn = (v: unknown): v is InvoiceColumn => INVOICE_COLUMNS.some((c) => c[0] === v);

/** The six checks of a B/L before invoicing. */
export const READY_CHECKS = ['Customer', 'Billing Party', 'Charges', 'Currency/ROE', 'Tax Configuration', 'B/L Data'] as const;

export const STATUS_TONE: Readonly<Record<string, string>> = {
  Draft: 'var(--muted)',
  'Pending validation': 'var(--warn)',
  Generated: 'var(--accent2)',
  Sent: 'var(--accent2)',
  Accepted: 'var(--ok)',
  Paid: 'var(--ok)',
  Rejected: 'var(--bad)',
  Credited: 'var(--ai)',
  Cancelled: 'var(--muted)',
};

export const READY_PILL: Readonly<Record<string, string>> = {
  Ready: 'background:var(--okbg);color:var(--ok)',
  Warning: 'background:var(--warnbg);color:var(--warn)',
  Blocked: 'background:var(--badbg);color:var(--bad)',
};

export const formatMoney = (n: number | string): string =>
  Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const dateGb = (d: Date): string => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
export const todayText = (): string => dateGb(new Date());
export const inDaysText = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return dateGb(d);
};
export const stampNow = (): string => {
  const d = new Date();
  return todayText() + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
};

/** Total of the lines in the invoice currency (first line's currency). */
export function mainAmount(i: Invoice): number {
  const c = i.lines[0][2];
  return i.lines.filter((l) => l[2] === c).reduce((a, l) => a + l[1], 0);
}

/** Tax rate in % from a tax code. */
export function taxRate(t: string | undefined): number {
  if (!t || t === '—' || /^ZR/.test(t)) return 0;
  const m = String(t).match(/-(\d+(?:\.\d+)?)$/);
  return m ? Number(m[1]) : 0;
}

export function hashOf(s: string): number {
  let h = 0;
  for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 9973;
  return h;
}

/** Invoice Status shown in the list. */
export function listStatus(i: Invoice): InvoiceListStatus {
  if (i.status === 'Cancelled' || i.status === 'Credited') return 'Cancelled';
  if (i.status === 'Paid') return (['Paid', 'Receipted', 'Reconciled'] as const)[hashOf(i.no) % 3] ?? 'Paid';
  return 'Unpaid';
}

/** Payment status, including proforma settlement. */
export function paymentStatus(i: Invoice, prf?: 'converted' | 'transferred'): string {
  if (i.type === 'Proforma') {
    if (prf === 'converted') return 'Moved to final invoice';
    if (prf === 'transferred') return 'Held as credit balance';
    if (i.status === 'Cancelled') return 'Cancelled';
    return hashOf(i.no) % 3 === 0 ? 'Proforma · paid' : 'Proforma · unpaid';
  }
  if (i.status === 'Paid') return 'Paid';
  if (i.status === 'Credited') return 'Credited';
  if (i.status === 'Cancelled') return 'Cancelled';
  if (['Generated', 'Sent', 'Accepted'].includes(i.status)) return hashOf(i.no) % 4 === 0 ? 'Partially paid' : 'Unpaid';
  return 'Not billed yet';
}

/** The invoice list after GIRS changes (generated invoices first). */
export function invoiceViews(invoices: readonly Invoice[], d: InvoiceChanges): InvoiceView[] {
  return [...d.gen, ...invoices].map((i) => {
    const o: Invoice = { ...i, status: d.st[i.no] ?? i.status };
    const st2 = listStatus(o);
    return {
      ...o,
      pay: paymentStatus(o, d.prf[i.no]),
      st2,
      einv: st2 === 'Cancelled' ? 'Cancelled' : 'Active',
      gfs: st2 === 'Unpaid' ? 'Pending' : 'Posted',
      ctry: LOCATIONS[o.port]?.[1] ?? String(o.port).slice(0, 2),
    };
  });
}

/** Ready items not yet invoiced, with review edits applied. */
export function readyViews(ready: readonly ReadyItem[], d: InvoiceChanges): ReadyItem[] {
  return ready.filter((r) => !d.done.includes(r.id)).map((r) => withEdits(r, d.rdy[r.id]));
}

export const hasJson = (i: Invoice): boolean => String(i.files).includes('JSON');

export const asList = <T>(v: T | readonly T[] | null | undefined): T[] => (Array.isArray(v) ? [...(v as T[])] : v ? [v as T] : []);

/** True when no value is selected, or `x` is one of them. */
export const inFilter = <T>(v: T | readonly T[] | null | undefined, x: T): boolean => {
  const a = asList(v);
  return !a.length || a.includes(x);
};

/** Every word typed must match; plain words match the start of a word, codes and numbers match anywhere. */
export function matchesSearch(hay: string, q: string): boolean {
  const t = String(q || '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (!t.length) return true;
  const w = hay.split(/[^a-z0-9]+/);
  return t.every((k) => (/[^a-z]/.test(k) ? hay.includes(k) : w.some((x) => x.startsWith(k))));
}

/** Search text: every value shown in the table, plus booking, container and customer code. */
export function searchText(i: InvoiceView): string {
  const amt = mainAmount(i);
  const cur = i.lines[0][2];
  return [i.no, i.st2, i.einv, i.gfs, i.party, i.cust, i.type, i.bl, i.vvd, formatMoney(amt), String(amt), cur, i.due, i.bkg, i.cntr]
    .concat(i.lines.map((l) => l[0] + ' ' + l[2]))
    .join(' | ')
    .toLowerCase();
}

const CHIP: Readonly<Record<string, string>> = {
  Unpaid: 'background:var(--warnbg);color:var(--warn)',
  Paid: 'background:var(--okbg);color:var(--ok)',
  Receipted: 'background:var(--tint);color:var(--accent2)',
  Reconciled: 'background:var(--goldbg, #FFF4D6);color:var(--gold, #8A5A00)',
  Cancelled: 'background:var(--badbg);color:var(--bad)',
  Active: 'background:var(--okbg);color:var(--ok)',
  Pending: 'background:var(--warnbg);color:var(--warn)',
  Posted: 'background:var(--okbg);color:var(--ok)',
};
export const statusChip = (v: string): string => CHIP[v] ?? 'background:var(--neutral);color:var(--muted)';

const PAY_PILL: Readonly<Record<string, string>> = {
  Paid: 'background:var(--okbg);color:var(--ok)',
  'Proforma · paid': 'background:var(--okbg);color:var(--ok)',
  'Moved to final invoice': 'background:var(--okbg);color:var(--ok)',
  Unpaid: 'background:var(--warnbg);color:var(--warn)',
  'Partially paid': 'background:var(--tint);color:var(--accent2)',
  'Held as credit balance': 'background:var(--tint);color:var(--accent2)',
};
export const paymentPill = (p: string): string => PAY_PILL[p] ?? 'background:var(--neutral);color:var(--muted)';

/** Distribution channels and their state. */
export function distribution(i: Invoice): [string, string][] {
  const sent = ['Sent', 'Accepted', 'Paid', 'Credited'].includes(i.status);
  const gen = sent || i.status === 'Generated';
  const cc = String(i.port || '').slice(0, 2);
  const gov =
    i.gov !== '—'
      ? /error|rejected/i.test(i.gov)
        ? 'Rejected · ' + i.gov
        : 'Accepted · ' + i.gov
      : ['IN', 'MY'].includes(cc)
        ? gen
          ? 'Not submitted yet'
          : 'Not generated yet'
        : 'Not required';
  return [
    ['Email to customer-master contacts', sent ? 'Delivered' : gen ? 'Not sent yet' : 'Not generated yet'],
    ['PocketApp / MELL / MSC', sent ? 'Uploaded' : gen ? 'Not uploaded yet' : 'Not generated yet'],
    ['ODeX', 'Not applicable'],
    ['Qwiik / FAM', 'Not applicable'],
    ['Government tax portal', gov],
  ];
}

/** Document fields of an invoice (preview, PDF, JSON). */
export function invoiceDocData(i: Invoice & { st2?: string; pay?: string }): InvoiceDocInput {
  const c = INVOICE_CUSTOMERS[i.cust];
  return {
    no: i.no,
    type: i.type,
    status: i.status,
    pay: i.st2 || i.pay,
    date: i.date,
    due: i.due,
    bkg: i.bkg,
    bl: i.bl,
    cntr: i.cntr,
    vvd: i.vvd,
    port: i.port,
    gov: i.gov,
    audit: i.lines[0][5],
    cust: { code: i.cust, name: c?.name || i.party, tax: c?.tax, addr: c?.addr },
    lines: i.lines.map((l) => ({ code: l[0], name: CHARGE_NAMES[l[0]] ?? l[0], amt: l[1], cur: l[2], roe: l[3], tax: l[4] })),
  };
}

/** Receipt fields (one receipt per invoice, one line per currency). */
export function receiptDocData(i: Invoice): ReceiptDocInput {
  const per: Record<string, number> = {};
  const order: string[] = [];
  i.lines.forEach((l) => {
    if (!(l[2] in per)) {
      per[l[2]] = 0;
      order.push(l[2]);
    }
    per[l[2]] = (per[l[2]] ?? 0) + l[1] + Math.round(l[1] * taxRate(l[4])) / 100;
  });
  const c = INVOICE_CUSTOMERS[i.cust];
  const first = order[0] ?? i.lines[0][2];
  return {
    no: '[Receipt no.]',
    date: i.due,
    inv: i.no,
    bl: i.bl,
    port: i.port,
    cur: first,
    amt: per[first] ?? 0,
    items: order.map((cur) => ({ inv: i.no, bl: i.bl, cur, amt: per[cur] ?? 0 })),
    cust: { code: i.cust, name: c?.name || i.party, tax: c?.tax, addr: c?.addr },
  };
}

/** USD equivalent of an amount in `cur`. */
export const toUsd = (amt: number, cur: string): number => (cur === 'USD' ? amt : amt / (USD_RATES[cur] ?? 1));

// ---------------------------------------------------------------- Ready to invoice

export interface ReadyLine {
  n: number;
  code: string;
  name: string;
  qty: number;
  uom: string;
  unit: number;
  cur: string;
  /** Conversion to USD. */
  k: number;
  ex: number;
  tax: string;
  rate: number;
  tx: number;
  inc: number;
}

/** Lines and totals (USD) of a B/L to invoice. */
export function readyTotals(r: ReadyItem): { lines: ReadyLine[]; ex: number; tx: number; inc: number; cur: 'USD' } {
  const cur = 'USD';
  const lines = r.charges.map((c, n): ReadyLine => {
    const [code, qty, uom, unit, tax, rate] = c;
    const lcur = c[6] || cur;
    const k = lcur === cur ? 1 : 1 / (USD_RATES[lcur] ?? 1);
    const ex = qty * unit;
    const tx = Math.round(ex * rate) / 100;
    return { n: n + 1, code, name: CHARGE_NAMES[code] ?? code, qty, uom, unit, cur: lcur, k, ex, tax, rate, tx, inc: ex + tx };
  });
  const ex = lines.reduce((a, l) => a + l.ex * l.k, 0);
  const tx = lines.reduce((a, l) => a + l.tx * l.k, 0);
  return { lines, ex, tx, inc: ex + tx, cur };
}

/** Standard tax code and rate of the B/L's port. */
export function standardTax(r: ReadyItem): [string, number] {
  const code = (LOCATIONS[r.port] ?? LOCATIONS.SGSIN)?.[4] ?? 'SG-SR-9';
  const m = code.match(/-(\d+(?:\.\d+)?)$/);
  return [code, m ? Number(m[1]) : 0];
}

/** Tax of the B/L's first taxed charge, else the standard tax. */
export function mainTax(r: ReadyItem): [string, number] {
  const m = r.charges.find((c) => c[5] > 0);
  return m ? [m[4], m[5]] : standardTax(r);
}

/** An added charge is complete (head, quantity, UOM, unit price, currency). */
export function addedChargeOk(a: AddedCharge): boolean {
  const q = parseFloat(String(a.qty));
  const u = parseFloat(String(a.unit).replace(/,/g, ''));
  return !!a.code && q > 0 && !!a.uom && !!a.cur && String(a.unit).trim() !== '' && u >= 0;
}

export interface ReadyError {
  area: 'Customer' | 'Charges' | 'Tax';
  text: string;
}

/** What still blocks invoicing a B/L, after the review edits. */
export function readyErrors(r: ReadyItem, ed?: Partial<ReadyEdit>): ReadyError[] {
  const out: ReadyError[] = [];
  let first = true;
  if (!ed?.fixed)
    r.checks.forEach(([k, t]: ReadyCheck, n) => {
      if (k === 'ok') return;
      if (n < 2 && ed?.cust && ed.cust !== r.cust) return;
      out.push({ area: n < 2 ? 'Customer' : n === 2 || n === 5 ? 'Charges' : 'Tax', text: first && r.msg ? r.msg : t });
      first = false;
    });
  (ed?.add ?? []).forEach((a, i) => {
    if (!addedChargeOk(a))
      out.push({ area: 'Charges', text: 'Added charge ' + (i + 1) + ': enter Charge head, Quantity, UOM, Unit Price and Currency' });
  });
  return out;
}

/** The B/L with review edits applied (customer, fixed tax, added charges); Ready when nothing blocks. */
export function withEdits(r: ReadyItem, ed?: ReadyEdit): ReadyItem {
  if (!ed) return r;
  const o: ReadyItem = { ...r };
  const mt = mainTax(r);
  if (ed.cust) o.cust = ed.cust;
  const st = standardTax(r);
  o.charges = r.charges
    .map((c): ReadyCharge => (ed.fixed && c[4] === '—' ? [c[0], c[1], c[2], c[3], st[0], st[1]] : c))
    .concat(
      ed.add
        .filter(addedChargeOk)
        .map((a): ReadyCharge => [
          a.code,
          parseFloat(String(a.qty)),
          a.uom,
          parseFloat(String(a.unit).replace(/,/g, '')),
          mt[0],
          mt[1],
          a.cur,
        ]),
    );
  if (!readyErrors(r, { ...ed, add: [] }).length) {
    o.status = 'Ready';
    o.msg = '';
    o.checks = r.checks.map((): ReadyCheck => ['ok', 'Available']);
  }
  return o;
}
