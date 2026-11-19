// @ts-nocheck — screen logic ported from the GIRS prototype; types are added as the screen is reworked.
/* Invoice List: sample data (seeded generators), formatting and invoice rules.
   Everything here is plain TypeScript with no React dependency. */
import { navigateTo, currentLegacyPage } from '../../lib/appBridge';
import '../../lib/legacy/girsDocs.js';
import '../../lib/legacy/girsCtx.js';

export const IV_SEED = [
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

export const IV_CUST = {
  'SG-100231': {
    name: 'Straits Harbour Logistics (SG)',
    tax: 'UEN 201812345K',
    addr: '21 Pioneer Road, #04-02, Singapore 628491',
    mail: 'ap@straitsharbour.sg',
  },
  'SG-100874': {
    name: 'Meridian Agro Exports (SG)',
    tax: 'UEN 199904417M',
    addr: '8 Jurong Port Road, Singapore 619088',
    mail: 'finance@meridianagro.sg',
  },
  'SG-101066': {
    name: 'Kinabalu Home Furnishings (SG)',
    tax: 'UEN 201533018D',
    addr: '60 Tuas South Ave 1, Singapore 637611',
    mail: 'billing@kinabaluhome.sg',
  },
  'MY-200417': {
    name: 'Straits Harbour Logistics (MY)',
    tax: 'C20811047090',
    addr: 'Lot 12, Jalan Pelabuhan, 42000 Port Klang',
    mail: 'ap@straitsharbour.my',
  },
  'IN-300552': {
    name: 'Straits Harbour Logistics (IN)',
    tax: 'GSTIN 27AAGCS4412L1Z5',
    addr: 'Plot 7, JNPT Road, Navi Mumbai 400707',
    mail: 'ap@straitsharbour.in',
  },
  'IN-300781': {
    name: 'Orchid Lane Polymers (IN)',
    tax: 'GSTIN 24AACCO9021P1ZK',
    addr: 'Survey 118, Vapi GIDC, Gujarat 396195',
    mail: 'accounts@orchidlane.in',
  },
  'MY-200903': {
    name: 'Kinabalu Home Furnishings (MY)',
    tax: 'C21003391080',
    addr: 'No. 3, Jalan Perigi, 81700 Pasir Gudang',
    mail: 'billing@kinabaluhome.my',
  },
  'TH-500318': {
    name: 'Andaman Bay Traders (TH)',
    tax: 'TIN 0105559013374',
    addr: '88 Moo 3, Laem Chabang, Chonburi 20230',
    mail: 'ar@andamanbay.co.th',
  },
};

export const IV_CHG = {
  MISC: 'Miscellaneous Charge',
  OFT: 'Ocean Freight',
  BAF: 'Bunker Adjustment Factor',
  'THC-O': 'Origin THC',
  'THC-DST': 'Destination THC',
  DOC: 'Documentation',
  DEM: 'Demurrage',
  DET: 'Detention',
  SEAL: 'Seal Fee',
  LSS: 'Low Sulphur Surcharge',
};

export const IV_READY = [
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

export function ivRand(seed) {
  let x = seed;
  return () => {
    x = (x * 1103515245 + 12345) % 2147483648;
    return x / 2147483648;
  };
}

export const IV_POOL = {
  'SG-100231': 'SGSIN',
  'SG-100874': 'SGSIN',
  'SG-101066': 'SGSIN',
  'MY-200417': 'MYPKG',
  'MY-200903': 'MYPKG',
  'IN-300552': 'INNSA',
  'IN-300781': 'INNSA',
  'TH-500318': 'THLCH',
};

export const IV_LOC = {
  SGSIN: ['SIN', 'SG', 'SGD', '1.3412', 'SG-SR-9', 'ZR-INTL'],
  MYPKG: ['PKG', 'MY', 'MYR', '4.4710', 'MY-SST-8', 'MY-SST-8'],
  INNSA: ['NSA', 'IN', 'INR', '84.1200', 'IN-GST-18', 'IN-GST-18'],
  THLCH: ['LCH', 'TH', 'THB', '34.2500', 'TH-VAT-7', 'TH-VAT-7'],
};

export function ivGen(n) {
  const r = ivRand(20261113),
    pick = (a) => a[Math.floor(r() * a.length)],
    amt = (lo, hi) => Math.round((lo + r() * (hi - lo)) / 5) * 5;
  const hex = (k) => Array.from({ length: k }, () => '0123456789abcdef'[Math.floor(r() * 16)]).join('');
  const ST = [
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
  const tot = ST.reduce((a, x) => a + x[1], 0),
    stPick = () => {
      let v = r() * tot;
      for (const [k, w] of ST) {
        if ((v -= w) < 0) return k;
      }
      return 'Sent';
    };
  const fmt = (x) => x.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const custs = Object.keys(IV_POOL),
    out = [];
  for (let k = 0; k < n; k++) {
    const cust = pick(custs),
      port = IV_POOL[cust],
      L = IV_LOC[port];
    const tr = r(),
      type = tr < 0.62 ? 'Freight' : tr < 0.84 ? 'DET / DEM' : tr < 0.95 ? 'MISC' : 'Proforma';
    const code = type === 'DET / DEM' ? 'OD' : type === 'MISC' ? 'MI' : 'OF';
    const no = L[0] + code + String(2601000 + k * 3 + Math.floor(r() * 3)).slice(-7) + (type === 'Proforma' ? 'PRF' : '');
    const day = 1 + Math.floor(r() * 43),
      d = new Date(2026, 9, day),
      due = new Date(2026, 9, day + 14);
    const status = type === 'Proforma' ? 'Draft' : stPick();
    const lines = [];
    if (type === 'Freight' || type === 'Proforma') {
      lines.push(['OFT', amt(600, 7200), 'USD', L[3], L[5]]);
      if (r() < 0.5) lines.push(['BAF', amt(120, 640), 'USD', L[3], L[5]]);
      if (r() < 0.6) lines.push(['THC-O', amt(180, 820), L[2], '—', L[4]]);
      if (r() < 0.3) lines.push(['DOC', amt(60, 260), L[2], '—', L[4]]);
    } else if (type === 'DET / DEM') lines.push([r() < 0.5 ? 'DEM' : 'DET', amt(240, 6400), L[2], '—', L[4]]);
    else lines.push([r() < 0.6 ? 'SEAL' : 'DOC', amt(15, 120), L[2], '—', L[4]]);
    const aud = 110000 + k * 4;
    lines.forEach((l, j) => l.push('AUD-26-' + (aud + j)));
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
      party: (IV_CUST[cust] || {}).name,
      cust,
      status,
      due: ['Draft', 'Pending validation'].includes(status) ? '—' : fmt(due),
      gov,
      files: status === 'Pending validation' ? '—' : status === 'Draft' ? 'PDF' : 'PDF · JSON',
      date: fmt(d),
      port,
      lines,
    });
  }
  return out;
}

export function ivGenReady(n) {
  const r = ivRand(77001),
    pick = (a) => a[Math.floor(r() * a.length)],
    amt = (lo, hi) => Math.round((lo + r() * (hi - lo)) / 5) * 5;
  const OK = ['ok', 'Available'],
    out = [];
  const W = [
    ['Charge THC-DST has no tax classification', 2, '1 charge requires confirmation', 'dst'],
    ['ROE USD/SGD 1.3412 is more than 1 day old', 3, 'Rate dated 11 Nov 2026'],
    ['Container count differs from the B/L by 1', 5, 'Container count mismatch'],
  ];
  const B = [
    ['Billing party has no active billing-party record', 1, 'Not found in Customer Master'],
    ['No tax code mapped for SEAL at SGSIN', 4, 'Tax code missing', 'seal'],
  ];
  for (let k = 0; k < n; k++) {
    const v = r(),
      status = v < 0.78 ? 'Ready' : v < 0.93 ? 'Warning' : 'Blocked';
    const rule = status === 'Warning' ? pick(W) : status === 'Blocked' ? pick(B) : null;
    const checks = [OK, OK, OK, OK, OK, OK].map((c) => c.slice());
    if (rule) checks[rule[1]] = [status === 'Warning' ? 'warn' : 'block', rule[2]];
    const t = r(),
      type = rule && rule[3] === 'seal' ? 'MISC' : t < 0.7 ? 'Freight' : t < 0.9 ? 'DET / DEM' : 'MISC';
    let charges;
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

export const IV_RDY = IV_READY.concat(ivGenReady(52));

export const IV_COLS = [
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
];

export const IV_COLS_DEF = ['st2', 'einv', 'gfs', 'party', 'type', 'bl', 'vvd', 'amt', 'cur', 'due'];

export function ivColsLoad() {
  try {
    const v = JSON.parse(localStorage.getItem('girs.inv.cols') || 'null');
    if (Array.isArray(v)) return v.filter((k) => IV_COLS.some((c) => c[0] === k));
  } catch (e) {}
  return IV_COLS_DEF.slice();
}

export const IV_ALL = IV_SEED.concat(ivGen(491));

export const IV_CHECKS = ['Customer', 'Billing Party', 'Charges', 'Currency/ROE', 'Tax Configuration', 'B/L Data'];

export const IV_LINK = {
  'CreditNoteList.dc.html': 'credit-note-list.html',
  'SOADashboard.dc.html': 'soa-aging.html',
  'Receipting.dc.html': 'receipting.html',
  'CashAppWorkbench.dc.html': 'cashapp-workbench.html',
  'ManualInvoice.dc.html': 'manual-invoice.html',
  'InvoiceGenerate.dc.html': 'invoice-generate.html',
  'InvoiceListB.dc.html': 'invoice-list-b.html',
  'InvoiceListC.dc.html': 'invoice-list-c.html',
  'InvoiceListD.dc.html': 'invoice-list-d.html',
  'InvoiceList.dc.html': 'invoice-list-v2.html',
};

export const IV_TONE = {
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

export const IV_PILL = {
  Ready: 'background:var(--okbg);color:var(--ok)',
  Warning: 'background:var(--warnbg);color:var(--warn)',
  Blocked: 'background:var(--badbg);color:var(--bad)',
};

export const IV_FX = { USD: { SGD: 1.3412, INR: 84.12, MYR: 4.471, THB: 34.25 } };

export function ivGo(page, q) {
  let href = page;
  try {
    if (!/\.dc\.html$/.test(location.pathname)) href = IV_LINK[page] || page;
  } catch (e) {}
  if (q) href += '?q=' + encodeURIComponent(q);
  try {
    navigateTo(href);
  } catch (e) {}
}
// Hand-off to another screen with this invoice pre-selected (see girs-ctx.js)

export function ivAct(i, page, act, label) {
  try {
    const cur = i.lines[0][2],
      usd = i.lines.reduce((a, l) => a + (l[2] === 'USD' ? l[1] : l[1] / ((IV_FX.USD || {})[l[2]] || 1)), 0);
    let back = 'invoice-list-v2.html';
    try {
      back = currentLegacyPage() || back;
    } catch (e) {}
    window.GirsCtx.put({
      page,
      act,
      label,
      inv: i.no,
      bl: i.bl,
      bkg: i.bkg,
      cust: i.cust,
      party: i.party,
      cur,
      amt: ivMain(i),
      usd: Math.round(usd * 100) / 100,
      date: i.date,
      due: i.due,
      status: i.status,
      type: i.type,
      port: i.port,
      fromName: 'Invoice List',
      back,
    });
  } catch (e) {}
  try {
    navigateTo(page + '?q=' + encodeURIComponent(act === 'soa' ? i.cust : act === 'manual' ? i.bl : i.no));
  } catch (e) {}
}

export function ivLoad() {
  try {
    return JSON.parse(localStorage.getItem('girs.inv.v1') || '{}') || {};
  } catch (e) {
    return {};
  }
}

export function ivSave(d) {
  try {
    localStorage.setItem('girs.inv.v1', JSON.stringify(d));
  } catch (e) {}
}

export function ivFmt(n) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function ivToday() {
  const d = new Date();
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function ivPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function ivStamp() {
  const d = new Date();
  return ivToday() + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

export function ivFile(name, text, type) {
  try {
    const b = new Blob([text], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (e) {}
}

export function ivMain(i) {
  const c = i.lines[0][2];
  return i.lines.filter((l) => l[2] === c).reduce((a, l) => a + l[1], 0);
}

export function ivRate(t) {
  if (!t || t === '—') return 0;
  if (/^ZR/.test(t)) return 0;
  const m = String(t).match(/-(\d+(?:\.\d+)?)$/);
  return m ? Number(m[1]) : 0;
}

export function ivDocData(i) {
  const c = IV_CUST[i.cust] || {};
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
    cust: { code: i.cust, name: c.name || i.party, tax: c.tax, addr: c.addr },
    lines: i.lines.map((l) => ({ code: l[0], name: IV_CHG[l[0]] || l[0], amt: l[1], cur: l[2], roe: l[3], tax: l[4] })),
  };
}

export function ivRcptData(i) {
  const per = {},
    order = [];
  i.lines.forEach((l) => {
    if (!(l[2] in per)) {
      per[l[2]] = 0;
      order.push(l[2]);
    }
    per[l[2]] += l[1] + Math.round(l[1] * ivRate(l[4])) / 100;
  });
  const c = IV_CUST[i.cust] || {};
  return {
    no: '[Receipt no.]',
    date: i.due,
    inv: i.no,
    bl: i.bl,
    port: i.port,
    cur: order[0],
    amt: per[order[0]],
    items: order.map((cur) => ({ inv: i.no, bl: i.bl, cur, amt: per[cur] })),
    cust: { code: i.cust, name: c.name || i.party, tax: c.tax, addr: c.addr },
  };
}

export function ivHasJson(i) {
  return String(i.files).indexOf('JSON') >= 0;
}

export function ivArr(v) {
  return Array.isArray(v) ? v : v ? [v] : [];
}

export function ivIn(v, x) {
  const a = ivArr(v);
  return !a.length || a.includes(x);
}
// Invoice List statuses: Invoice Status (Unpaid / Paid / Receipted / Reconciled / Cancelled), e-Invoice, GFS Status

export function ivSt2(i) {
  if (i.status === 'Cancelled' || i.status === 'Credited') return 'Cancelled';
  if (i.status === 'Paid') return ['Paid', 'Receipted', 'Reconciled'][ivHash(i.no) % 3];
  return 'Unpaid';
}
// Search: every word typed must match; plain words match the start of a word ("paid" finds Paid, not Unpaid), codes and numbers match anywhere

export function ivMatch(h, q) {
  const t = String(q || '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (!t.length) return true;
  const w = h.split(/[^a-z0-9]+/);
  return t.every((k) => (/[^a-z]/.test(k) ? h.includes(k) : w.some((x) => x.startsWith(k))));
}
// Search text for v2: every value shown in the table (plus booking, container, customer code)

export function ivHay(i) {
  const amt = ivMain(i),
    cur = i.lines[0][2];
  return [i.no, i.st2, i.einv, i.gfs, i.party, i.cust, i.type, i.bl, i.vvd, ivFmt(amt), String(amt), cur, i.due, i.bkg, i.cntr]
    .concat(i.lines.map((l) => l[0] + ' ' + l[2]))
    .join(' | ')
    .toLowerCase();
}

export function ivChip2(v) {
  const M = {
    Unpaid: 'background:var(--warnbg);color:var(--warn)',
    Paid: 'background:var(--okbg);color:var(--ok)',
    Receipted: 'background:var(--tint);color:var(--accent2)',
    Reconciled: 'background:var(--goldbg, #FFF4D6);color:var(--gold, #8A5A00)',
    Cancelled: 'background:var(--badbg);color:var(--bad)',
    Active: 'background:var(--okbg);color:var(--ok)',
    Pending: 'background:var(--warnbg);color:var(--warn)',
    Posted: 'background:var(--okbg);color:var(--ok)',
  };
  return M[v] || 'background:var(--neutral);color:var(--muted)';
}

export function ivHash(s) {
  let h = 0;
  for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 9973;
  return h;
}

export function ivPayPill(p) {
  const M = {
    Paid: 'background:var(--okbg);color:var(--ok)',
    'Proforma · paid': 'background:var(--okbg);color:var(--ok)',
    'Moved to final invoice': 'background:var(--okbg);color:var(--ok)',
    Unpaid: 'background:var(--warnbg);color:var(--warn)',
    'Partially paid': 'background:var(--tint);color:var(--accent2)',
    'Held as credit balance': 'background:var(--tint);color:var(--accent2)',
  };
  return M[p] || 'background:var(--neutral);color:var(--muted)';
}
// Payment status (from the former Invoices Hub): Unpaid / Partially paid / Paid, proforma payment, credited

export function ivPay(i, prf) {
  if (i.type === 'Proforma') {
    if (prf === 'converted') return 'Moved to final invoice';
    if (prf === 'transferred') return 'Held as credit balance';
    if (i.status === 'Cancelled') return 'Cancelled';
    return ivHash(i.no) % 3 === 0 ? 'Proforma · paid' : 'Proforma · unpaid';
  }
  if (i.status === 'Paid') return 'Paid';
  if (i.status === 'Credited') return 'Credited';
  if (i.status === 'Cancelled') return 'Cancelled';
  if (['Generated', 'Sent', 'Accepted'].includes(i.status)) return ivHash(i.no) % 4 === 0 ? 'Partially paid' : 'Unpaid';
  return 'Not billed yet';
}
// Distribution channels (from the former Invoices Hub)

export function ivDist(i) {
  const sent = ['Sent', 'Accepted', 'Paid', 'Credited'].includes(i.status),
    gen = sent || i.status === 'Generated',
    cc = String(i.port || '').slice(0, 2);
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

export function ivView(i, toast) {
  try {
    window.GirsDocs.invoice(ivDocData(i), { json: ivHasJson(i) ? ivDocData(i) : null, onDone: toast });
  } catch (e) {}
}

export function ivPdf(i, toast) {
  try {
    window.GirsDocs.invoicePdf(ivDocData(i));
    toast(i.no + '.pdf downloaded');
  } catch (e) {}
}

export function ivJsonDl(i, toast) {
  try {
    window.GirsDocs.json('Invoice-' + i.no, ivDocData(i));
    toast(i.no + '.json downloaded');
  } catch (e) {}
}

export function ivDownload(i, toast) {
  ivPdf(i, toast);
  if (ivHasJson(i))
    setTimeout(() => {
      try {
        window.GirsDocs.json('Invoice-' + i.no, ivDocData(i));
      } catch (e) {}
      toast(i.no + ' downloaded as PDF and JSON');
    }, 500);
}

export function ivReceipt(i, toast) {
  try {
    window.GirsDocs.receipt(ivRcptData(i), { onDone: toast });
  } catch (e) {}
}

export function ivReadyCalc(r) {
  const cur = 'USD';
  const lines = r.charges.map(([code, qty, uom, unit, tax, rate, lc], n) => {
    const lcur = lc || cur,
      k = lcur === cur ? 1 : 1 / ((IV_FX.USD || {})[lcur] || 1);
    const ex = qty * unit,
      tx = Math.round(ex * rate) / 100;
    return { n: n + 1, code, name: IV_CHG[code] || code, qty, uom, unit, cur: lcur, k, ex, tax, rate, tx, inc: ex + tx };
  });
  const ex = lines.reduce((a, l) => a + l.ex * l.k, 0),
    tx = lines.reduce((a, l) => a + l.tx * l.k, 0);
  return { lines, ex, tx, inc: ex + tx, cur };
}
// Ready to invoice edits: { cust, add: [{ qty, uom, unit, cur }], fixed }

export function ivStdTax(r) {
  const code = (IV_LOC[r.port] || IV_LOC.SGSIN)[4],
    m = String(code).match(/-(\d+(?:\.\d+)?)$/);
  return [code, m ? Number(m[1]) : 0];
}

export function ivMainTax(r) {
  const m = r.charges.find((c) => c[5] > 0);
  return m ? [m[4], m[5]] : ivStdTax(r);
}

export function ivAddOk(a) {
  const q = parseFloat(a.qty),
    u = parseFloat(String(a.unit).replace(/,/g, ''));
  return !!a.code && q > 0 && !!a.uom && !!a.cur && String(a.unit).trim() !== '' && u >= 0;
}

export function ivRdyErrs(r, ed) {
  ed = ed || {};
  const out = [];
  let first = true;
  if (!ed.fixed)
    r.checks.forEach(([k, t], n) => {
      if (k === 'ok') return;
      if (n < 2 && ed.cust && ed.cust !== r.cust) return;
      out.push({ area: n < 2 ? 'Customer' : n === 2 || n === 5 ? 'Charges' : 'Tax', text: first && r.msg ? r.msg : t });
      first = false;
    });
  (ed.add || []).forEach((a, i) => {
    if (!ivAddOk(a))
      out.push({ area: 'Charges', text: 'Added charge ' + (i + 1) + ': enter Charge head, Quantity, UOM, Unit Price and Currency' });
  });
  return out;
}

export function ivRdyEff(r, ed) {
  if (!ed) return r;
  const o = Object.assign({}, r),
    mt = ivMainTax(r);
  if (ed.cust) o.cust = ed.cust;
  const st = ivStdTax(r);
  o.charges = r.charges
    .map((c) => (ed.fixed && c[4] === '—' ? [c[0], c[1], c[2], c[3], st[0], st[1]] : c))
    .concat(
      (ed.add || [])
        .filter(ivAddOk)
        .map((a) => [a.code, parseFloat(a.qty), a.uom, parseFloat(String(a.unit).replace(/,/g, '')), mt[0], mt[1], a.cur]),
    );
  if (!ivRdyErrs(r, Object.assign({}, ed, { add: [] })).length) {
    o.status = 'Ready';
    o.msg = '';
    o.checks = r.checks.map(() => ['ok', 'Available']);
  }
  return o;
}
