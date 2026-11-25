import type { Invoice, InvoiceLine, InvoiceStatus, InvoiceType, ReadyCharge, ReadyCheck, ReadyItem, ReadyStatus } from '../model/invoice';
import { INVOICE_CUSTOMERS, LOCATIONS } from '../model/reference';

/** Sample invoices and B/Ls ready to invoice (until the ERP / LMS APIs are connected). */
const SEED_INVOICES: Invoice[] = [
  {
    no: 'SINOF2602401',
    type: 'Freight',
    bkg: 'SINB2610231',
    bl: 'BL-SG-24001',
    cntr: 'PILU1000016',
    vvd: 'Vessel 01 / 012E',
    party: 'Straits Harbour Logistics (SG)',
    cust: 'SG-100231',
    status: 'Sent',
    due: '20 Nov 2026',
    gov: '—',
    files: 'PDF · JSON',
    date: '06 Nov 2026',
    port: 'SGSIN',
    lines: [
      ['OFT', 1850.0, 'USD', '1.3412', 'SG-SR-9', 'AUD-26-104812'],
      ['BAF', 320.0, 'USD', '1.3412', 'SG-SR-9', 'AUD-26-104813'],
      ['THC-O', 305.0, 'SGD', '—', 'SG-SR-9', 'AUD-26-104814'],
    ],
  },
  {
    no: 'SINOF2602405',
    type: 'Freight',
    bkg: 'SINB2610244',
    bl: 'BL-SG-24006',
    cntr: 'PILU3000014',
    vvd: 'Vessel 01 / 012E',
    party: 'Meridian Agro Exports (SG)',
    cust: 'SG-100874',
    status: 'Paid',
    due: '17 Nov 2026',
    gov: '—',
    files: 'PDF · JSON',
    date: '03 Nov 2026',
    port: 'SGSIN',
    lines: [['OFT', 3200.0, 'USD', '1.3412', 'ZR-INTL', 'AUD-26-104820']],
  },
  {
    no: 'SINOF2600118PRF',
    type: 'Proforma',
    bkg: 'SINB2610252',
    bl: 'BL-SG-24002',
    cntr: 'PILU5000019',
    vvd: 'Vessel 01 / 012E',
    party: 'Kinabalu Home Furnishings (SG)',
    cust: 'SG-101066',
    status: 'Draft',
    due: '—',
    gov: '—',
    files: 'PDF',
    date: '10 Nov 2026',
    port: 'SGSIN',
    lines: [['OFT', 2100.0, 'USD', '1.3412', 'ZR-INTL', 'AUD-26-104835']],
  },
  {
    no: 'SINOD2602150',
    type: 'DET / DEM',
    bkg: 'SINB2609870',
    bl: 'BL-SG-24004',
    cntr: 'PILU4000021',
    vvd: 'Vessel 03 / 108N',
    party: 'Straits Harbour Logistics (MY)',
    cust: 'MY-200417',
    status: 'Credited',
    due: '12 Nov 2026',
    gov: '—',
    files: 'PDF · JSON',
    date: '29 Oct 2026',
    port: 'SGSIN',
    lines: [['DEM', 4200.0, 'SGD', '—', 'SG-SR-9', 'AUD-26-103977']],
  },
  {
    no: 'NSAOF2601044',
    type: 'Freight',
    bkg: 'NSAB2610118',
    bl: 'BL-IN-24005',
    cntr: 'PILU2000013',
    vvd: 'Vessel 04 / 021S',
    party: 'Straits Harbour Logistics (IN)',
    cust: 'IN-300552',
    status: 'Accepted',
    due: '18 Nov 2026',
    gov: 'IRN 7c1f…a92e',
    files: 'PDF · JSON',
    date: '04 Nov 2026',
    port: 'INNSA',
    lines: [
      ['OFT', 980.0, 'USD', '84.1200', 'IN-GST-18', 'AUD-26-104402'],
      ['DOC', 220.0, 'INR', '—', 'IN-GST-18', 'AUD-26-104403'],
    ],
  },
  {
    no: 'NSAOF2601051',
    type: 'Freight',
    bkg: 'NSAB2610126',
    bl: 'BL-IN-24008',
    cntr: 'PILU2000027',
    vvd: 'Vessel 04 / 021S',
    party: 'Orchid Lane Polymers (IN)',
    cust: 'IN-300781',
    status: 'Rejected',
    due: '21 Nov 2026',
    gov: 'IRP error 2150',
    files: 'PDF',
    date: '07 Nov 2026',
    port: 'INNSA',
    lines: [['OFT', 1500.0, 'USD', '84.1200', 'IN-GST-18', 'AUD-26-104451']],
  },
  {
    no: 'PKGOF2600917',
    type: 'Freight',
    bkg: 'PKGB2610064',
    bl: 'BL-MY-24003',
    cntr: 'PILU6000011',
    vvd: 'Vessel 02 / 044W',
    party: 'Kinabalu Home Furnishings (MY)',
    cust: 'MY-200903',
    status: 'Generated',
    due: '24 Nov 2026',
    gov: 'MyInvois 3F8K…Q2LM',
    files: 'PDF · JSON',
    date: '10 Nov 2026',
    port: 'MYPKG',
    lines: [['OFT', 1650.0, 'USD', '4.4710', 'MY-SST-8', 'AUD-26-104510']],
  },
  {
    no: 'LCHOD2600233',
    type: 'DET / DEM',
    bkg: 'LCHB2609551',
    bl: 'BL-TH-24002',
    cntr: 'PILU7000018',
    vvd: 'Vessel 05 / 077E',
    party: 'Andaman Bay Traders (TH)',
    cust: 'TH-500318',
    status: 'Pending validation',
    due: '—',
    gov: '—',
    files: '—',
    date: '11 Nov 2026',
    port: 'THLCH',
    lines: [['DET', 960.0, 'THB', '—', 'TH-VAT-7', 'AUD-26-104588']],
  },
  {
    no: 'SINMI2600042',
    type: 'MISC',
    bkg: 'SINB2610231',
    bl: 'BL-SG-24001',
    cntr: 'PILU1000016',
    vvd: 'Vessel 01 / 012E',
    party: 'Straits Harbour Logistics (SG)',
    cust: 'SG-100231',
    status: 'Cancelled',
    due: '—',
    gov: '—',
    files: 'PDF',
    date: '05 Nov 2026',
    port: 'SGSIN',
    lines: [['SEAL', 15.0, 'SGD', '—', 'SG-SR-9', 'AUD-26-104601']],
  },
];

const SEED_READY: ReadyItem[] = [
  {
    id: 'r1',
    bl: 'BL-SG-24011',
    bkg: 'SINB2610301',
    cust: 'SG-100231',
    port: 'SGSIN',
    type: 'Freight',
    cntr: 'PILU1000102',
    vvd: 'Vessel 06 / 031E',
    status: 'Ready',
    msg: '',
    checks: [
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['ok', 'Available'],
    ],
    charges: [
      ['OFT', 1, 'CNTR', 7000.0, 'ZR-INTL', 0],
      ['THC-O', 1, 'BL', 750.0, 'SG-SR-9', 9],
      ['DOC', 1, 'BL', 250.0, 'SG-SR-9', 9],
    ],
  },
  {
    id: 'r2',
    bl: 'BL-SG-24012',
    bkg: 'SINB2610302',
    cust: 'SG-100874',
    port: 'SGSIN',
    type: 'Freight',
    cntr: 'PILU1000117',
    vvd: 'Vessel 06 / 031E',
    status: 'Warning',
    msg: 'Charge THC-DST has no tax classification',
    checks: [
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['warn', '1 charge requires confirmation'],
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['ok', 'Available'],
    ],
    charges: [
      ['OFT', 1, 'CNTR', 2100.0, 'ZR-INTL', 0],
      ['THC-DST', 1, 'CNTR', 200.0, '—', 0],
    ],
  },
  {
    id: 'r3',
    bl: 'BL-SG-24013',
    bkg: 'SINB2610303',
    cust: 'SG-101066',
    port: 'SGSIN',
    type: 'Freight',
    cntr: 'PILU1000125',
    vvd: 'Vessel 06 / 031E',
    status: 'Blocked',
    msg: 'Billing party SG-101066 has no active billing-party record',
    checks: [
      ['ok', 'Available'],
      ['block', 'Not found in Customer Master'],
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['ok', 'Available'],
    ],
    charges: [
      ['OFT', 1, 'CNTR', 6200.0, 'ZR-INTL', 0],
      ['THC-O', 1, 'BL', 500.0, 'SG-SR-9', 9],
      ['DOC', 1, 'BL', 250.0, 'SG-SR-9', 9],
    ],
  },
  {
    id: 'r4',
    bl: 'BL-SG-24014',
    bkg: 'SINB2610304',
    cust: 'SG-100231',
    port: 'SGSIN',
    type: 'Freight',
    cntr: 'PILU1000133',
    vvd: 'Vessel 06 / 031E',
    status: 'Ready',
    msg: '',
    checks: [
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['ok', 'Available'],
    ],
    charges: [
      ['OFT', 1, 'CNTR', 3400.0, 'ZR-INTL', 0],
      ['BAF', 1, 'CNTR', 420.0, 'ZR-INTL', 0],
      ['THC-O', 1, 'BL', 320.0, 'SG-SR-9', 9],
    ],
  },
  {
    id: 'r5',
    bl: 'BL-SG-24015',
    bkg: 'SINB2610305',
    cust: 'SG-100874',
    port: 'SGSIN',
    type: 'DET / DEM',
    cntr: 'PILU1000148',
    vvd: 'Vessel 03 / 108N',
    status: 'Ready',
    msg: '',
    checks: [
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['ok', 'Available'],
    ],
    charges: [['DEM', 6, 'DAY', 120.0, 'SG-SR-9', 9]],
  },
  {
    id: 'r6',
    bl: 'BL-SG-24016',
    bkg: 'SINB2610306',
    cust: 'SG-101066',
    port: 'SGSIN',
    type: 'Freight',
    cntr: 'PILU1000156',
    vvd: 'Vessel 06 / 031E',
    status: 'Warning',
    msg: 'ROE USD/SGD 1.3412 is more than 1 day old',
    checks: [
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['warn', 'Rate dated 11 Nov 2026'],
      ['ok', 'Available'],
      ['ok', 'Available'],
    ],
    charges: [
      ['OFT', 1, 'CNTR', 2850.0, 'ZR-INTL', 0],
      ['LSS', 1, 'CNTR', 180.0, 'ZR-INTL', 0],
    ],
  },
  {
    id: 'r7',
    bl: 'BL-SG-24017',
    bkg: 'SINB2610307',
    cust: 'SG-100231',
    port: 'SGSIN',
    type: 'MISC',
    cntr: 'PILU1000164',
    vvd: 'Vessel 06 / 031E',
    status: 'Blocked',
    msg: 'No tax code mapped for SEAL at SGSIN',
    checks: [
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['block', 'Tax code missing'],
      ['ok', 'Available'],
    ],
    charges: [['SEAL', 2, 'EA', 15.0, '—', 0]],
  },
  {
    id: 'r8',
    bl: 'BL-SG-24018',
    bkg: 'SINB2610308',
    cust: 'SG-100874',
    port: 'SGSIN',
    type: 'Freight',
    cntr: 'PILU1000171',
    vvd: 'Vessel 06 / 031E',
    status: 'Ready',
    msg: '',
    checks: [
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['ok', 'Available'],
      ['ok', 'Available'],
    ],
    charges: [
      ['OFT', 1, 'CNTR', 4100.0, 'ZR-INTL', 0],
      ['DOC', 1, 'BL', 250.0, 'SG-SR-9', 9],
    ],
  },
];

function seededLcg(seed: number): () => number {
  let x = seed;
  return () => {
    x = (x * 1103515245 + 12345) % 2147483648;
    return x / 2147483648;
  };
}

/** Customer -> port of the generated invoices. */
const POOL: Readonly<Record<string, string>> = {
  'SG-100231': 'SGSIN',
  'SG-100874': 'SGSIN',
  'SG-101066': 'SGSIN',
  'MY-200417': 'MYPKG',
  'MY-200903': 'MYPKG',
  'IN-300552': 'INNSA',
  'IN-300781': 'INNSA',
  'TH-500318': 'THLCH',
};

/** Sample invoices (seeded, the same on every load). */
function generateInvoices(n: number): Invoice[] {
  const r = seededLcg(20261113);
  const pick = <T>(a: readonly T[]): T => a[Math.floor(r() * a.length)] as T;
  const amt = (lo: number, hi: number): number => Math.round((lo + r() * (hi - lo)) / 5) * 5;
  const hex = (k: number): string => Array.from({ length: k }, () => '0123456789abcdef'[Math.floor(r() * 16)]).join('');
  const ST: [InvoiceStatus, number][] = [
    ['Sent', 22],
    ['Paid', 30],
    ['Accepted', 14],
    ['Generated', 10],
    ['Draft', 4],
    ['Pending validation', 5],
    ['Rejected', 4],
    ['Credited', 6],
    ['Cancelled', 5],
  ];
  const tot = ST.reduce((a, x) => a + x[1], 0);
  const stPick = (): InvoiceStatus => {
    let v = r() * tot;
    for (const [k, w] of ST) {
      if ((v -= w) < 0) return k;
    }
    return 'Sent';
  };
  const fmt = (x: Date): string => x.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const custs = Object.keys(POOL);
  const out: Invoice[] = [];
  for (let k = 0; k < n; k++) {
    const cust = pick(custs);
    const port = POOL[cust] ?? 'SGSIN';
    const L = LOCATIONS[port] ?? (['SIN', 'SG', 'SGD', '1.3412', 'SG-SR-9', 'ZR-INTL'] as const);
    const tr = r();
    const type: InvoiceType = tr < 0.62 ? 'Freight' : tr < 0.84 ? 'DET / DEM' : tr < 0.95 ? 'MISC' : 'Proforma';
    const code = type === 'DET / DEM' ? 'OD' : type === 'MISC' ? 'MI' : 'OF';
    const no = L[0] + code + String(2601000 + k * 3 + Math.floor(r() * 3)).slice(-7) + (type === 'Proforma' ? 'PRF' : '');
    const day = 1 + Math.floor(r() * 43);
    const d = new Date(2026, 9, day);
    const due = new Date(2026, 9, day + 14);
    const status: InvoiceStatus = type === 'Proforma' ? 'Draft' : stPick();
    const lines: [string, number, string, string, string][] = [];
    if (type === 'Freight' || type === 'Proforma') {
      lines.push(['OFT', amt(600, 7200), 'USD', L[3], L[5]]);
      if (r() < 0.5) lines.push(['BAF', amt(120, 640), 'USD', L[3], L[5]]);
      if (r() < 0.6) lines.push(['THC-O', amt(180, 820), L[2], '—', L[4]]);
      if (r() < 0.3) lines.push(['DOC', amt(60, 260), L[2], '—', L[4]]);
    } else if (type === 'DET / DEM') lines.push([r() < 0.5 ? 'DEM' : 'DET', amt(240, 6400), L[2], '—', L[4]]);
    else lines.push([r() < 0.6 ? 'SEAL' : 'DOC', amt(15, 120), L[2], '—', L[4]]);
    const aud = 110000 + k * 4;
    const withAudit: InvoiceLine[] = lines.map((l, j) => [...l, 'AUD-26-' + (aud + j)]);
    const live = ['Sent', 'Paid', 'Accepted', 'Credited'].includes(status);
    const gov =
      L[1] === 'IN'
        ? live
          ? 'IRN ' + hex(4) + '…' + hex(4)
          : status === 'Rejected'
            ? 'IRP error ' + pick(['2150', '2172', '2283'])
            : '—'
        : L[1] === 'MY'
          ? live || status === 'Generated'
            ? 'MyInvois ' + hex(4).toUpperCase() + '…' + hex(4).toUpperCase()
            : status === 'Rejected'
              ? 'MyInvois rejected'
              : '—'
          : '—';
    out.push({
      no,
      type,
      bkg: L[0] + 'B' + (2608000 + k),
      bl: 'BL-' + L[1] + '-' + (25000 + k),
      cntr: 'PILU' + (1100000 + k * 7),
      vvd: 'Vessel 0' + (1 + Math.floor(r() * 6)) + ' / 0' + (10 + Math.floor(r() * 89)) + pick(['E', 'W', 'N', 'S']),
      party: INVOICE_CUSTOMERS[cust]?.name ?? cust,
      cust,
      status,
      due: ['Draft', 'Pending validation'].includes(status) ? '—' : fmt(due),
      gov,
      files: status === 'Pending validation' ? '—' : status === 'Draft' ? 'PDF' : 'PDF · JSON',
      date: fmt(d),
      port,
      lines: withAudit,
    });
  }
  return out;
}

/** Sample B/Ls ready to invoice (seeded). */
function generateReady(n: number): ReadyItem[] {
  const r = seededLcg(77001);
  const pick = <T>(a: readonly T[]): T => a[Math.floor(r() * a.length)] as T;
  const amt = (lo: number, hi: number): number => Math.round((lo + r() * (hi - lo)) / 5) * 5;
  const OK: ReadyCheck = ['ok', 'Available'];
  const out: ReadyItem[] = [];
  /** message, check index, check text, special case */
  type Rule = [string, number, string, string?];
  const W: Rule[] = [
    ['Charge THC-DST has no tax classification', 2, '1 charge requires confirmation', 'dst'],
    ['ROE USD/SGD 1.3412 is more than 1 day old', 3, 'Rate dated 11 Nov 2026'],
    ['Container count differs from the B/L by 1', 5, 'Container count mismatch'],
  ];
  const B: Rule[] = [
    ['Billing party has no active billing-party record', 1, 'Not found in Customer Master'],
    ['No tax code mapped for SEAL at SGSIN', 4, 'Tax code missing', 'seal'],
  ];
  for (let k = 0; k < n; k++) {
    const v = r();
    const status: ReadyStatus = v < 0.78 ? 'Ready' : v < 0.93 ? 'Warning' : 'Blocked';
    const rule = status === 'Warning' ? pick(W) : status === 'Blocked' ? pick(B) : null;
    const checks: ReadyCheck[] = [OK, OK, OK, OK, OK, OK].map((c): ReadyCheck => [c[0], c[1]]);
    if (rule) checks[rule[1]] = [status === 'Warning' ? 'warn' : 'block', rule[2]];
    const t = r();
    const type: InvoiceType = rule && rule[3] === 'seal' ? 'MISC' : t < 0.7 ? 'Freight' : t < 0.9 ? 'DET / DEM' : 'MISC';
    let charges: ReadyCharge[];
    if (type === 'Freight') {
      charges = [['OFT', 1, 'CNTR', amt(900, 7500), 'ZR-INTL', 0]];
      if (r() < 0.5) charges.push(['BAF', 1, 'CNTR', amt(120, 600), 'ZR-INTL', 0]);
      charges.push(['THC-O', 1, 'BL', amt(200, 800), 'SG-SR-9', 9]);
      if (r() < 0.5) charges.push(['DOC', 1, 'BL', 250, 'SG-SR-9', 9]);
    } else if (type === 'DET / DEM') charges = [[r() < 0.5 ? 'DEM' : 'DET', 1 + Math.floor(r() * 9), 'DAY', amt(80, 180), 'SG-SR-9', 9]];
    else
      charges = [
        ['SEAL', 1 + Math.floor(r() * 3), 'EA', 15, rule && rule[3] === 'seal' ? '—' : 'SG-SR-9', rule && rule[3] === 'seal' ? 0 : 9],
      ];
    if (rule && rule[3] === 'dst') charges.push(['THC-DST', 1, 'CNTR', amt(150, 320), '—', 0]);
    out.push({
      id: 'g' + k,
      bl: 'BL-SG-' + (24100 + k),
      bkg: 'SINB' + (2610400 + k),
      cust: pick(['SG-100231', 'SG-100874', 'SG-101066']),
      port: 'SGSIN',
      type,
      cntr: 'PILU' + (1200000 + k * 9),
      vvd: 'Vessel 0' + (1 + Math.floor(r() * 6)) + ' / 0' + (10 + Math.floor(r() * 89)) + 'E',
      status,
      msg: rule ? rule[0] : '',
      checks,
      charges,
    });
  }
  return out;
}

export const INVOICE_SEED: Invoice[] = SEED_INVOICES.concat(generateInvoices(491));
export const READY_SEED: ReadyItem[] = SEED_READY.concat(generateReady(52));
