// @ts-nocheck — screen logic ported from the GIRS prototype; types are added as the screen is reworked.
/* Home: sample voyages, B/Ls and D&D containers (generated per location and date), formatting,
   and the .xlsx writer used for follow-up attachments. Plain TypeScript, no React dependency. */
import { USER } from '../../app/session/user';
import '../../lib/legacy/girsDocs.js';

export const USER_NAME = USER.name;

export const HM_TODAY = '2026-11-20';

export const HM_HUB = {
  SIN: ['Singapore', 'SGSIN', 'SG', 11],
  NSA: ['India', 'INNSA', 'IN', 7],
  LCH: ['Thailand', 'THLCH', 'TH', 5],
  PKG: ['Malaysia', 'MYPKG', 'MY', 6],
  JED: ['Saudi Arabia', 'SAJED', 'SA', 4],
  ZLO: ['Mexico', 'MXZLO', 'MX', 3],
};

export const HM_CCY = {
  SG: 'SGD',
  NZ: 'NZD',
  MY: 'MYR',
  CN: 'CNY',
  IN: 'INR',
  TH: 'THB',
  SA: 'SAR',
  MX: 'MXN',
  AE: 'AED',
  ID: 'IDR',
  VN: 'VND',
  KR: 'KRW',
  JP: 'JPY',
  AU: 'AUD',
  HK: 'HKD',
  LK: 'LKR',
  BD: 'BDT',
};

export const HM_PORTS = [
  'NZAKL',
  'CNSHA',
  'INNSA',
  'MYPKG',
  'THLCH',
  'SAJED',
  'AEJEA',
  'IDJKT',
  'VNSGN',
  'KRPUS',
  'JPTYO',
  'AUSYD',
  'HKHKG',
  'LKCMB',
  'BDCGP',
  'CNNGB',
  'SGSIN',
];

export const HM_VSL = [
  ['CMA CGM LEKKI', 'LK', 'NZS'],
  ['KOTA LEMBAH', 'KL', 'NZS'],
  ['NORFOLK', 'NF', 'NZS'],
  ['KOTA PEMIMPIN', 'KP', 'IAX'],
  ['KOTA SEJATI', 'KS', 'CNS'],
  ['KOTA MAKMUR', 'KM', 'RGX'],
  ['KOTA GEMILANG', 'KG', 'RSS'],
  ['KOTA HAKIM', 'KH', 'IAX'],
  ['KOTA CAHAYA', 'KC', 'MCS'],
  ['CMA CGM KAURI', 'KR', 'NZS'],
  ['KOTA PERDANA', 'PD', 'KCX'],
  ['KOTA RAKYAT', 'RK', 'CNS'],
  ['KOTA SATRIA', 'ST', 'RGX'],
  ['KOTA LAYANG', 'LY', 'IDS'],
  ['KOTA NASRAT', 'NS', 'RSS'],
  ['KOTA JUBAH', 'JB', 'KCX'],
];

export const HM_CUST = [
  'Straits Harbour Logistics',
  'Meridian Agro Exports',
  'Andaman Bay Traders',
  'Kinabalu Home Furnishings',
  'Orchid Lane Polymers',
  'Southern Cross Timber',
  'Harbourline Foods',
  'Pacific Rim Textiles',
  'Lion City Electronics',
  'Tasman Dairy Co-op',
  'Mekong Rice Traders',
  'Coral Sea Chemicals',
];

export const HM_MISS = ['Charges', 'Billing party', 'Customer tax ID', 'Cargo / EDI message'];

export const HM_BLST = {
  inv: ['Invoiced', 'done'],
  ready: ['Ready to generate', 'ok'],
  roe: ['ROE not received', 'warn'],
  nod: ['Data not received', 'warn'],
  hold: ['Split-payer unconfirmed', 'warn'],
};
// fixed figures from the client scenario (PDF): invoiced, ready, roe missing, data not received, split-payer

export const HM_LOC = {
  SGSIN: ['SGD', 1.3412, 'SG-SR-9', 'ZR-INTL'],
  INNSA: ['INR', 84.12, 'IN-GST-18', 'ZR-INTL'],
  MYPKG: ['MYR', 4.471, 'MY-SST-8', 'ZR-INTL'],
  THLCH: ['THB', 34.25, 'TH-VAT-7', 'ZR-INTL'],
  SAJED: ['SAR', 3.75, 'SA-VAT-15', 'ZR-INTL'],
  MXZLO: ['MXN', 17.1, 'MX-IVA-16', 'ZR-INTL'],
};

export const HM_CHG = {
  OFT: 'Ocean Freight',
  BAF: 'Bunker Adjustment Factor',
  LSS: 'Low Sulphur Surcharge',
  'THC-O': 'Origin THC',
  'THC-DST': 'Destination THC',
  DOC: 'Documentation',
  SEAL: 'Seal Fee',
  DO: 'Delivery Order Fee',
  CLN: 'Container Cleaning',
  DEM: 'Demurrage',
  DET: 'Detention',
  MISC: 'Miscellaneous Charge',
};

export const HM_UOM = ['CNTR', 'BL', 'TEU', 'Day'];

export const HM_CITY = {
  SG: 'Singapore 609',
  IN: 'Navi Mumbai 400 7',
  MY: 'Port Klang 420',
  TH: 'Chonburi 20',
  SA: 'Jeddah 21',
  MX: 'Manzanillo 28',
};

export const HM_STREET = [
  'Pioneer Road',
  'Jurong Port Road',
  'Tuas South Avenue 1',
  'Harbour Front Walk',
  'Logistics Park Drive',
  'Industrial Estate Road',
  'Free Zone Boulevard',
  'Container Terminal Way',
];
// customer directory per country (code, name, address)

export const hmDir = (cc) =>
  HM_CUST.map((n, j) => {
    const r = hmRnd(cc + n);
    r();
    return {
      code: cc + '-' + (100000 + Math.floor(r() * 899999)),
      name: n + ' (' + cc + ')',
      addr:
        10 + Math.floor(r() * 90) + ' ' + HM_STREET[j % HM_STREET.length] + ', ' + (HM_CITY[cc] || '') + String(10 + Math.floor(r() * 89)),
    };
  });

export const HM_FIX = {
  SGSIN: [
    ['0LK5SS', 'E', 'NZAKL', 1000, 1850, [0, 935, 25, 40, 0]],
    ['1KP8RR', 'I', 'INNSA', 520, 620, [310, 154, 30, 20, 6]],
  ],
};

export const hmN = (n) => Math.round(n).toLocaleString('en-US');

export const hmUsd = (v) => 'USD ' + (v >= 1e6 ? (v / 1e6).toFixed(2) + 'M' : v >= 1e4 ? (v / 1e3).toFixed(1) + 'K' : hmN(v));

export const hmD = (iso) => new Date(iso + 'T00:00:00');

export const hmIso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

export const hmAdd = (iso, n) => {
  const d = hmD(iso);
  d.setDate(d.getDate() + n);
  return hmIso(d);
};

export const hmDiff = (a, b) => Math.round((hmD(b) - hmD(a)) / 864e5);

export const hmFmt = (iso, o) => hmD(iso).toLocaleDateString('en-GB', o || { weekday: 'short', day: 'numeric', month: 'short' });

export const hmRnd = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
};

export const hmTime = () => {
  try {
    return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
};

export const HM_CACHE = {};
// Voyages that load (E) or discharge (I) at a port on a date.

export const hmDay = (port, date) => {
  const key = port + date;
  if (HM_CACHE[key]) return HM_CACHE[key];
  const hub = Object.values(HM_HUB).find((h) => h[1] === port) || HM_HUB.SIN,
    rnd = hmRnd(key),
    dow = hmD(date).getDay();
  const n = Math.max(1, Math.round(hub[3] * (dow === 0 || dow === 6 ? 0.55 : 1) * (0.7 + rnd() * 0.6)));
  const age = hmDiff(date, HM_TODAY);
  const list = [];
  const make = (base, dir, other, bls, avg, fixed, vsl) => {
    const r = hmRnd(base + dir + date);
    let st;
    if (fixed) st = fixed.slice();
    else if (age > 0) {
      const left = age > 7 || r() < 0.72 ? 0 : Math.max(1, Math.round(bls * (0.01 + r() * 0.06)));
      const roe = Math.round(left * r() * 0.6),
        hold = r() < 0.15 ? Math.min(left - roe, 1 + Math.round(r() * 4)) : 0,
        ready = Math.round((left - roe - hold) * r() * 0.4);
      st = [bls - left, ready, roe, left - roe - hold - ready, hold];
    } else if (age === 0) {
      const inv = Math.round(bls * r() * 0.55),
        roe = Math.round(bls * r() * 0.04),
        nod = Math.round(bls * r() * 0.06),
        hold = r() < 0.2 ? Math.round(r() * 6) : 0;
      st = [inv, Math.max(0, bls - inv - roe - nod - hold), roe, nod, hold];
    } else st = [0, 0, 0, 0, 0];
    const here = port,
      pol = dir === 'E' ? here : other,
      pod = dir === 'E' ? other : here;
    const ccy = HM_CCY[here.slice(0, 2)] || 'USD';
    const ent = r() < 0.86 ? 'PIL' : r() < 0.7 ? 'MELL' : 'MSC';
    list.push({
      id: base + dir + '@' + date,
      no: base + dir,
      dir,
      vessel: vsl[0],
      svc: vsl[2],
      ent: fixed ? 'PIL' : ent,
      pol,
      pod,
      here,
      other,
      date,
      bls,
      avg,
      st,
      pair: 'USD → ' + ccy,
    });
  };
  if (date === HM_TODAY && HM_FIX[port])
    HM_FIX[port].forEach(([b, dir, other, bls, avg, f]) =>
      make(b, dir, other, bls, avg, f, HM_VSL.find((v) => v[1] === b.slice(1, 3)) || HM_VSL[0]),
    );
  for (let i = 0; i < n; i++) {
    const v = HM_VSL[Math.floor(rnd() * HM_VSL.length)],
      other = HM_PORTS.filter((x) => x !== port)[Math.floor(rnd() * (HM_PORTS.length - 1))];
    const base =
      String(Math.floor(rnd() * 9)) +
      v[1] +
      String(1 + Math.floor(rnd() * 8)) +
      String.fromCharCode(65 + Math.floor(rnd() * 26)) +
      String.fromCharCode(65 + Math.floor(rnd() * 26));
    make(base, rnd() < 0.5 ? 'E' : 'I', other, 120 + Math.round(rnd() * 980), 500 + Math.round(rnd() * 1600), null, v);
  }
  HM_CACHE[key] = list;
  return list;
};

// D&D containers (snapshot)

export const HM_SLAB = {
  '20GP': [
    [5, 25],
    [99, 45],
  ],
  '40HC': [
    [5, 40],
    [99, 75],
  ],
  '40RF': [
    [3, 90],
    [99, 140],
  ],
};

export const HM_DDST = {
  ready: ['Ready to invoice', 'ok'],
  roe: ['ROE not received', 'warn'],
  tariff: ['D&D tariff missing', 'warn'],
  milestone: ['Milestone conflict', 'warn'],
  waiver: ['Waiver approval pending', 'warn'],
  out: ['With customer', 'info'],
  invoiced: ['Invoiced', 'done'],
};

export const HM_DDR = {
  roe: ['Treasury · ROE feed', 'Request ROE'],
  tariff: ['Pricing · tariff set-up', 'Request tariff'],
  milestone: ['Equipment control · LMS', 'Raise LMS check'],
  waiver: ['Credit control · approver', 'Chase approval'],
};

export const hmSlab = (sz, over) => {
  let left = over,
    amt = 0;
  const parts = [];
  (HM_SLAB[sz] || [[99, 50]]).forEach(([d, r]) => {
    const n = Math.min(left, d);
    if (n > 0) {
      amt += n * r;
      parts.push(n + ' d × ' + r);
      left -= n;
    }
  });
  return { amt, txt: parts.join(' + ') };
};

export const hmDD = (cc) => {
  const key = 'dd' + cc;
  if (HM_CACHE[key]) return HM_CACHE[key];
  const rnd = hmRnd(key),
    out = [],
    sizes = ['20GP', '40HC', '40HC', '40RF'],
    pre = ['PCIU', 'PCIU', 'TGHU', 'TCLU'];
  const pickSt = (x) =>
    x < 0.22
      ? 'ready'
      : x < 0.27
        ? 'roe'
        : x < 0.31
          ? 'tariff'
          : x < 0.34
            ? 'milestone'
            : x < 0.38
              ? 'waiver'
              : x < 0.78
                ? 'out'
                : 'invoiced';
  let bl = 23800;
  for (let i = 0; i < 140; i++) {
    if (i % 3 === 0 || rnd() < 0.4) bl += 1 + Math.floor(rnd() * 7);
    const sz = sizes[Math.floor(rnd() * sizes.length)],
      st = pickSt(rnd()),
      gate = hmAdd(HM_TODAY, -(5 + Math.floor(rnd() * 40)));
    const back = st === 'out' ? '' : hmAdd(gate, 6 + Math.floor(rnd() * Math.max(1, hmDiff(gate, HM_TODAY) - 5)));
    out.push({
      cn: pre[i % 4] + ' ' + String(100000 + Math.floor(rnd() * 899999)) + '-' + Math.floor(rnd() * 10),
      sz,
      cust: HM_CUST[Math.floor(rnd() * HM_CUST.length)],
      dir: rnd() < 0.6 ? 'I' : 'E',
      bl: 'BL-' + cc + '-' + bl,
      out: gate,
      back: back > HM_TODAY ? HM_TODAY : back,
      free: sz === '40RF' ? 4 : rnd() < 0.5 ? 5 : 7,
      type: ['Detention', 'Demurrage', 'Combined'][Math.floor(rnd() * 3)],
      st,
    });
  }
  HM_CACHE[key] = out;
  return out;
};

// Minimal .xlsx writer (one sheet, bold header, inline strings / numbers) — stored ZIP, no library.

export const hmXlsx = (sheetName, headers, rows) => {
  const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const col = (n) => {
    let s = '';
    n++;
    while (n) {
      const m = (n - 1) % 26;
      s = String.fromCharCode(65 + m) + s;
      n = Math.floor((n - 1) / 26);
    }
    return s;
  };
  const cell = (v, r, c, st) =>
    typeof v === 'number'
      ? '<c r="' + col(c) + r + '"' + (st ? ' s="' + st + '"' : '') + '><v>' + v + '</v></c>'
      : '<c r="' +
        col(c) +
        r +
        '" t="inlineStr"' +
        (st ? ' s="' + st + '"' : '') +
        '><is><t xml:space="preserve">' +
        esc(v) +
        '</t></is></c>';
  const widths = headers.map((h, c) => Math.min(48, Math.max(String(h).length, ...rows.slice(0, 200).map((r) => String(r[c]).length)) + 2));
  const sheet =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>' +
    widths.map((w, i) => '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>').join('') +
    '</cols><sheetData>' +
    '<row r="1">' +
    headers.map((h, c) => cell(h, 1, c, 1)).join('') +
    '</row>' +
    rows
      .map((r, i) => '<row r="' + (i + 2) + '">' + r.map((v, c) => cell(v, i + 2, c, typeof v === 'number' ? 2 : 0)).join('') + '</row>')
      .join('') +
    '</sheetData><autoFilter ref="A1:' +
    col(headers.length - 1) +
    (rows.length + 1) +
    '"/></worksheet>';
  const files = {
    '[Content_Types].xml':
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
    '_rels/.rels':
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    'xl/workbook.xml':
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="' +
      esc(sheetName.slice(0, 31)) +
      '" sheetId="1" r:id="rId1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels':
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
    'xl/styles.xml':
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0.00"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE8EEF6"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>',
    'xl/worksheets/sheet1.xml': sheet,
  };
  const enc = new TextEncoder();
  const crcT = (() => {
    const t = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  const crc = (b) => {
    let c = 0xffffffff;
    for (let i = 0; i < b.length; i++) c = crcT[(c ^ b[i]) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const parts = [],
    central = [];
  let off = 0;
  const u16 = (v) => [v & 255, (v >>> 8) & 255],
    u32 = (v) => [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255];
  Object.keys(files).forEach((name) => {
    const nm = enc.encode(name),
      data = enc.encode(files[name]),
      c = crc(data);
    const head = [].concat(
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0x21),
      u32(c),
      u32(data.length),
      u32(data.length),
      u16(nm.length),
      u16(0),
    );
    parts.push(new Uint8Array(head), nm, data);
    central.push(
      new Uint8Array(
        [].concat(
          u32(0x02014b50),
          u16(20),
          u16(20),
          u16(0),
          u16(0),
          u16(0),
          u16(0x21),
          u32(c),
          u32(data.length),
          u32(data.length),
          u16(nm.length),
          u16(0),
          u16(0),
          u16(0),
          u16(0),
          u32(0),
          u32(off),
        ),
      ),
      nm,
    );
    off += head.length + nm.length + data.length;
  });
  const cSize = central.reduce((a, b) => a + b.length, 0),
    n = Object.keys(files).length;
  const end = new Uint8Array([].concat(u32(0x06054b50), u16(0), u16(0), u16(n), u16(n), u32(cSize), u32(off), u16(0)));
  return new Blob(parts.concat(central, [end]), { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const hmDownload = (blob, name) => {
  try {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 500);
  } catch (e) {}
};

export const hmSize = (n) => (n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB');
