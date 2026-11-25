import { documentTranslator } from '@/shared/lib/documentI18n';

/**
 * Document models: one model per document, drawn by two renderers (screen paper and PDF).
 * Invoice layout follows the client's Proforma / Tax Invoice sample; sample values (bank account, external B/L,
 * vessel) are derived from the invoice number so they are the same every time the document opens.
 */

export type Pair = readonly [string, string];

export interface DocCustomer {
  code?: string;
  name?: string;
  tax?: string;
  addr?: string;
}

export interface InvoiceDocLine {
  code: string;
  name?: string;
  amt: number;
  cur: string;
  /** Rate of exchange, or "—". */
  roe: string;
  /** Tax code ("SG-SR-9", "ZR-INTL", "—"). */
  tax: string;
}

/** What a screen passes to show or download an invoice / credit note. */
export interface InvoiceDocInput {
  kind?: 'invoice' | 'credit';
  no: string;
  type: string;
  status: string;
  pay?: string;
  date: string;
  due: string;
  bkg?: string;
  bl?: string;
  cntr?: string;
  vvd?: string;
  port?: string;
  gov?: string;
  audit?: string;
  /** Original invoice of a credit note. */
  orig?: string;
  cust: DocCustomer;
  lines: InvoiceDocLine[];
}

export interface ReceiptDocInput {
  no?: string;
  date?: string;
  inv?: string;
  bl?: string;
  port?: string;
  cur?: string;
  amt?: number;
  items?: { inv?: string; bl?: string; cur: string; amt: number }[];
  cust?: DocCustomer;
}

export interface InvoiceRow {
  head: string;
  qty: string;
  uom: string;
  unit: string;
  cur: string;
  ex: string;
  dp: string;
  da: string;
  net: string;
  ta: string;
  tax: string;
  incl: string;
  date: string;
}

export type Badge = 'PAID' | 'UN-PAID' | 'CANCELLED';
export type Stamp = 'DRAFT' | 'CANCELLED' | 'CREDITED' | 'PAID';
export type Orientation = 'p' | 'l';

export interface InvoiceDocModel {
  kind: 'invoice' | 'credit';
  no: string;
  file: string;
  title: string;
  /** QR payload (tax invoices only). */
  qr: string;
  txn: string;
  badge: Badge | '';
  from: string[];
  to: string[];
  strip: Pair[];
  details: Pair[];
  ship: Pair[];
  cols: string[];
  keys: (keyof InvoiceRow)[];
  right_: (0 | 1)[];
  rows: InvoiceRow[];
  totals: Pair[];
  grandLabel: string;
  words: string;
  bank: Pair[];
  issued: string;
  disclaimer: string;
  stamp2: string;
  orient: Orientation;
}

export interface ReceiptDocModel {
  kind: 'receipt';
  title: string;
  no: string;
  file: string;
  from: string;
  stamp: Stamp | '';
  meta: Pair[];
  billTo: { title: string; name: string; lines: string[] };
  ship: { title: string; rows: Pair[] } | null;
  cols: string[];
  align: ('l' | 'r')[];
  widths: number[];
  rows: string[][];
  totals: { cur: string; rows: Pair[]; total: string; label: string }[];
  notes: string[];
  footer: string;
}

export type DocModel = InvoiceDocModel | ReceiptDocModel;

// ---------------------------------------------------------------- helpers
const COUNTRY: Readonly<Record<string, string>> = { SG: 'Singapore', MY: 'Malaysia', IN: 'India', TH: 'Thailand' };

export const fmt = (n: number): string => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const esc = (s: unknown): string =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);

/** Tax rate in % from a tax code ("SG-SR-9" -> 9, "ZR-INTL" -> 0, "—" -> null). */
export function rateOf(code: string | undefined): number | null {
  if (!code || code === '—') return null;
  if (/^(ZR|Zero)/i.test(code)) return 0;
  const m = String(code).match(/-(\d+(?:\.\d+)?)$/);
  return m ? Number(m[1]) : null;
}

const entityOf = (port: string | undefined): string => {
  const c = String(port ?? '').slice(0, 2);
  return COUNTRY[c] ? 'PIL ' + COUNTRY[c] : 'PIL';
};

/** Translates document text (documents follow the app language). */
export const T = (str: string): string => documentTranslator().t(str);
export const docLang = (): string => documentTranslator().lang;

// ---------------------------------------------------------------- receipt
function groupTotals(items: { cur: string; amt: number }[]): ReceiptDocModel['totals'] {
  const per: Record<string, number> = {};
  const order: string[] = [];
  items.forEach((x) => {
    if (!(x.cur in per)) {
      per[x.cur] = 0;
      order.push(x.cur);
    }
    per[x.cur] = (per[x.cur] ?? 0) + x.amt;
  });
  return order.map((c) => ({ cur: c, rows: [], total: fmt(per[c] ?? 0), label: 'Total received' }));
}

export function receiptModel(rc: ReceiptDocInput): ReceiptDocModel {
  const c = rc.cust ?? {};
  const items = rc.items ?? [{ inv: rc.inv, bl: rc.bl, cur: rc.cur ?? '', amt: rc.amt ?? 0 }];
  return {
    kind: 'receipt',
    title: 'RECEIPT',
    no: rc.no ?? '',
    file: 'Receipt-' + (rc.inv || rc.no || '').replace(/[^A-Za-z0-9-]/g, ''),
    from: entityOf(rc.port),
    stamp: 'PAID',
    meta: [
      ['Receipt No.', rc.no || '—'],
      ['Receipt Date', rc.date || '—'],
      ['Currency', rc.cur || '—'],
      ['Amount Received', fmt(rc.amt ?? 0)],
    ],
    billTo: {
      title: 'Received from',
      name: c.name || '—',
      lines: [c.code ? 'Customer Code ' + c.code : '', c.tax ? 'Tax ID ' + c.tax : '', c.addr ?? ''].filter(Boolean),
    },
    ship: null,
    cols: ['#', 'Invoice No.', 'B/L No.', 'Cur.', 'Amount received'],
    align: ['l', 'l', 'l', 'l', 'r'],
    widths: [24, 150, 150, 60, 131],
    rows: items.map((x, n) => [String(n + 1), x.inv || '—', x.bl || '—', x.cur, fmt(x.amt)]),
    totals: groupTotals(items),
    notes: [],
    footer: 'Generated by GIRS · ' + entityOf(rc.port),
  };
}

// ---------------------------------------------------------------- invoice
const PORT: Readonly<Record<string, string>> = { SGSIN: 'SINGAPORE', MYPKG: 'PORT KLANG', INNSA: 'NHAVA SHEVA', THLCH: 'LAEM CHABANG' };
const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function words999(n: number): string {
  let s = '';
  if (n >= 100) {
    s += ONES[Math.floor(n / 100)] + ' Hundred';
    n %= 100;
    if (n) s += ' and ';
  }
  if (n >= 20) {
    s += TENS[Math.floor(n / 10)];
    if (n % 10) s += '-' + ONES[n % 10];
  } else if (n) s += ONES[n];
  return s;
}

/** Amount in words ("One Thousand Two Hundred and Cents Fifty"). */
export function inWords(x: number): string {
  let whole = Math.floor(x + 1e-9);
  const cents = Math.round((x - whole) * 100);
  const parts: string[] = [];
  const units: [number, string][] = [
    [1e9, 'Billion'],
    [1e6, 'Million'],
    [1e3, 'Thousand'],
  ];
  if (!whole) parts.push('Zero');
  units.forEach(([u, name]) => {
    if (whole >= u) {
      parts.push(words999(Math.floor(whole / u)) + ' ' + name);
      whole %= u;
    }
  });
  if (whole) parts.push(words999(whole));
  return parts.join(' ') + (cents ? ' and Cents ' + words999(cents) : '');
}

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "06 Nov 2026" -> "6-Nov-26" */
function dShort(s: string | undefined): string {
  if (!s || s === '—') return s || '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.getDate() + '-' + MON[d.getMonth()] + '-' + String(d.getFullYear()).slice(-2);
}

const pad2 = (n: number): string => ('0' + n).slice(-2);
const nowStamp = (): string => {
  const d = new Date();
  return pad2(d.getDate()) + '-' + MON[d.getMonth()] + '-' + d.getFullYear() + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
};
const ph = (v: string | undefined, p: string): string => (v && v !== '—' ? v : p);

function hsh(x: string): number {
  let h = 7;
  for (let i = 0; i < x.length; i++) h = (h * 31 + x.charCodeAt(i)) % 1000003;
  return h;
}

const VESSEL: Readonly<Record<string, string>> = {
  '01': 'KOTA LAYANG',
  '02': 'KOTA PEKARANG',
  '03': 'KOTA SATRIA',
  '04': 'KOTA CARUM',
  '05': 'KOTA HAKIM',
  '06': 'KOTA LUMAYAN',
};
const OTHER_PORT: Readonly<Record<string, string[]>> = {
  SGSIN: ['SHANGHAI', 'JEBEL ALI', 'MOMBASA', 'NHAVA SHEVA'],
  MYPKG: ['SHANGHAI', 'SINGAPORE', 'JEBEL ALI', 'LAEM CHABANG'],
  INNSA: ['SHANGHAI', 'SINGAPORE', 'JEBEL ALI', 'PORT KLANG'],
  THLCH: ['SHANGHAI', 'SINGAPORE', 'PORT KLANG', 'NHAVA SHEVA'],
};
const BANK: Readonly<Record<string, readonly [string, string]>> = {
  SG: ['DBS Bank Ltd', 'DBSSSGSG'],
  MY: ['Malayan Banking Berhad (Maybank)', 'MBBEMYKL'],
  IN: ['HDFC Bank Ltd', 'HDFCINBB'],
  TH: ['Bangkok Bank Public Company Ltd', 'BKKBTHBK'],
};
const TXN: Readonly<Record<string, string>> = {
  Proforma: 'Booking Created',
  Freight: 'B/L Released',
  'DET / DEM': 'Container Returned',
  MISC: 'Additional Service Requested',
};

function goodsOf(name: string | undefined): string {
  const n = String(name ?? '').toLowerCase();
  if (/polymer/.test(n)) return 'Polymer granules';
  if (/furnish/.test(n)) return 'Home furniture';
  if (/agro/.test(n)) return 'Agricultural produce';
  if (/trader/.test(n)) return 'Rice';
  return 'General cargo';
}

const BL_UNIT: Readonly<Record<string, number>> = { DOC: 1, AMD: 1, SEAL: 0, ADMIN: 1 };

function qtyOf(l: InvoiceDocLine, h: number): [number, string] {
  if (/^(DET|DEM)/.test(l.code)) {
    const d = [2, 3, 4, 5, 6, 8, 10].filter((x) => Math.round(l.amt * 100) % x === 0).pop() ?? 1;
    return [d, 'Day'];
  }
  if (BL_UNIT[l.code] === 1) return [1, 'BL'];
  const n = [3, 2].filter((x) => Math.round(l.amt * 100) % x === 0)[h % 2] ?? 1;
  return [n, 'CNTR'];
}

function minusDays(s: string, n: number): string | undefined {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return undefined;
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export function invoiceModel(inv: InvoiceDocInput): InvoiceDocModel {
  const credit = inv.kind === 'credit';
  const sign = credit ? -1 : 1;
  const cust = inv.cust;
  const dir = String(inv.no).charAt(3);
  const port = PORT[inv.port ?? ''] ?? inv.port ?? '';
  const h = hsh(inv.no);
  const cc = String(inv.port || 'SG').slice(0, 2);
  const cur = (inv.lines.find((l) => l.roe === '—' || !l.roe) ?? inv.lines[0])?.cur || 'USD';
  const pay = inv.pay || inv.status || '';
  const badge: Badge =
    /cancel/i.test(pay) || /cancel/i.test(inv.status)
      ? 'CANCELLED'
      : /^(Paid|Receipted|Reconciled|Proforma · paid)$/.test(pay) || inv.status === 'Paid'
        ? 'PAID'
        : 'UN-PAID';
  const other = (OTHER_PORT[inv.port ?? ''] ?? ['SHANGHAI', 'SINGAPORE'])[h % 4] ?? 'SHANGHAI';
  const vm = String(inv.vvd ?? '').match(/Vessel (\d+) \/ (\w+)/);
  const sail = minusDays(inv.date, 4 + (h % 6));
  const bld = minusDays(inv.date, 2 + (h % 3));
  const voyage = vm ? vm[2] + ' ' + dShort(sail) + '  ' + (VESSEL[vm[1] ?? ''] ?? 'KOTA LAYANG') : ph(inv.vvd, '—');
  const extBl = String(inv.port || 'SGSIN').slice(2, 5) + 'SL' + String(60000000 + ((h * 37) % 39999999));
  const bank = BANK[cc] ?? BANK.SG ?? ['', ''];
  const digits = String(cust.code ?? '').replace(/\D/g, '') || String(h);
  const taxInv = !credit && badge === 'PAID';
  const G = { ex: 0, net: 0, tax: 0, incl: 0 };
  const rows: InvoiceRow[] = inv.lines.map((l, i) => {
    const r = rateOf(l.tax);
    const amt = sign * l.amt;
    const tx = r == null ? 0 : Math.round(amt * r) / 100;
    const roe = parseFloat(l.roe);
    const k = l.cur === cur || Number.isNaN(roe) ? 1 : roe;
    const [q, uom] = qtyOf(l, h + i);
    G.ex += amt * k;
    G.net += amt * k;
    G.tax += tx * k;
    G.incl += (amt + tx) * k;
    return {
      head: l.name || l.code,
      qty: String(q),
      uom,
      unit: fmt(amt / q),
      cur: l.cur,
      ex: fmt(amt),
      dp: '0%',
      da: '0.00',
      net: fmt(amt),
      ta: r == null ? '0%' : r + '%',
      tax: fmt(tx),
      incl: fmt(amt + tx),
      date: dShort(inv.date),
    };
  });
  const stamp = nowStamp();
  return {
    kind: credit ? 'credit' : 'invoice',
    no: inv.no,
    file: (credit ? 'Credit-note-' : 'Invoice-') + inv.no,
    title: credit ? 'Credit Note' : taxInv ? 'Tax Invoice' : 'Proforma Invoice',
    qr: taxInv ? 'PIL TAX INVOICE ' + inv.no + ' | ' + dShort(inv.date) + ' | ' + cur + ' ' + fmt(G.incl) : '',
    txn: credit ? 'Credit Note Approved' : (TXN[inv.type] ?? 'B/L Released'),
    badge: credit ? '' : badge,
    from: [
      'Pacific International Lines (China) Ltd. / PIL Logistics',
      'Block 5, PIL Building, No. 18 Gongping Road,',
      'Hongkou District, Shanghai 200082, China',
      'Phone: +86-21-80138801 / +86-21-61235709',
    ],
    to: [ph(cust.name, '—'), ...(cust.addr ? [cust.addr] : [])],
    strip: [
      [credit ? 'Credit Note No.' : 'Invoice No.', inv.no],
      [credit ? 'Credit Note Date' : 'Invoice Date', dShort(inv.date)],
      ['Invoice Due Date', dShort(inv.due)],
      ['Currency', cur],
    ],
    details: [
      ['Customer Code', ph(cust.code, '—')],
      ['Customer Ref', extBl],
      ['Document Type', 'BL'],
      ['Nature of goods', goodsOf(cust.name)],
      ['Mode of Payment', 'Credit / Cash / Bank Transfer'],
      ...(inv.orig ? ([['Against Invoice', inv.orig]] as Pair[]) : []),
      ...(taxInv ? ([['Reference Proforma Inv. No.', String(inv.no).replace(/PRF$/, '') + 'PRF']] as Pair[]) : []),
    ],
    ship: [
      ['Voyage', voyage],
      ['BL Id/Number', String(60000 + (h % 9999)) + ' - ' + ph(inv.bl, '—') + ' Dated ' + dShort(bld)],
      ['Loaded', dir === 'I' ? other : ph(port, '—')],
      ['Discharge', dir === 'I' ? ph(port, '—') : other],
      ['External BL No', extBl],
      ['Container Nos.', ph(inv.cntr, '—')],
    ],
    cols: [
      'Charge head',
      'Quantity',
      'UOM',
      'Unit Price',
      'Currency',
      'Total excluding Tax',
      'Tax applicability',
      'Tax Amount',
      'Total Incl Tax',
    ],
    keys: ['head', 'qty', 'uom', 'unit', 'cur', 'ex', 'ta', 'tax', 'incl'],
    right_: [0, 1, 0, 1, 0, 1, 1, 1, 1],
    rows,
    totals: [
      ['Total excluding Tax', fmt(G.ex) + ' ' + cur],
      ['Tax Amount', fmt(G.tax) + ' ' + cur],
      ['Invoice Total', fmt(G.incl) + ' ' + cur],
    ],
    grandLabel: 'Grand Total (' + cur + ')',
    words: 'Total payable amount - ' + cur + ' ' + inWords(Math.abs(G.incl)) + ' only',
    bank: [
      ['Bank Name', bank[0]],
      ['Virtual Account Number', 'PIL' + cc + digits.slice(-6) + String(h % 1000).padStart(3, '0')],
      ['IBAN', String(10000000 + ((h * 13) % 89999999))],
      ['SWIFT Code', bank[1]],
    ],
    issued: 'Daniel Tan',
    disclaimer: 'Disclaimer: This is a computer generated invoice and further authorization is not required.',
    stamp2: T('Page 1 of 1') + ' · ' + T('Date') + ' ' + (docLang() === 'ar' ? '⁦' + stamp + '⁩' : stamp),
    orient: 'p',
  };
}
