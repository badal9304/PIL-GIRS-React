// @ts-nocheck — screen logic ported from the GIRS prototype; types are added as the screen is reworked.
/* Customer master: field definitions, options and sample records. */

export const KIT_M = {
  key: 'CustomerMaster',
  noun: 'customer',
  newLabel: 'Create new Customer',
  copyLabel: 'Copy as new customer code',
  danger: 'delete',
  readonly: false,
  def_: 'k2',
  opts: {
    'Registration / Tax ID': ['0105561012345', '200912345W', '201534567D', '201812345K', '27AABCO1234F1Z5'],
    'Credit terms': ['Cash · pay before invoice', 'Net 15 days', 'Net 30 days', 'Net 45 days'],
    'Sanction / Blacklist': ['Blacklisted', 'Not listed', 'Sanctioned'],
    'Parent customer group': [
      'Andaman Bay Traders',
      'Kinabalu Home Furnishings',
      'Meridian Agro Exports',
      'Orchid Lane Polymers',
      'Straits Harbour Logistics',
    ],
    'Invoicing arrangement': ['Default · on customer-code grouping', 'Split · on customer-code grouping'],
    'Document / data delivery': ['PDF', 'PDF, JSON'],
  },
  recs: [],
  contracts: {
    'SG-100231': 2,
    'MY-200417': 1,
    'IN-300552': 0,
    'SG-100874': 1,
    'CN-400129': 1,
    'TH-500318': 1,
    'SG-101066': 1,
    'MY-200903': 1,
    'IN-300781': 1,
    'CN-400566': 0,
  },
};

export function KIT_CM() {
  const G = {
    gA: {
      name: 'Straits Harbour Logistics',
      legal: 'Straits Harbour Logistics Pte. Ltd.',
      arr: 'Split',
      tax: '201812345K',
      terms: 'Net 30 days',
    },
    gB: {
      name: 'Meridian Agro Exports',
      legal: 'Meridian Agro Exports Pte. Ltd.',
      arr: 'Default',
      tax: '201534567D',
      terms: 'Net 45 days',
    },
    gC: {
      name: 'Andaman Bay Traders',
      legal: 'Andaman Bay Traders Co., Ltd.',
      arr: 'Default',
      tax: '0105561012345',
      terms: 'Cash · pay before invoice',
    },
    gD: {
      name: 'Kinabalu Home Furnishings',
      legal: 'Kinabalu Home Furnishings Pte. Ltd.',
      arr: 'Split',
      tax: '200912345W',
      terms: 'Net 30 days',
    },
    gE: {
      name: 'Orchid Lane Polymers',
      legal: 'Orchid Lane Polymers Pvt. Ltd.',
      arr: 'Default',
      tax: '27AABCO1234F1Z5',
      terms: 'Net 15 days',
    },
  };
  const CN = { SG: 'Singapore', MY: 'Malaysia', IN: 'India', CN: 'China', TH: 'Thailand' };
  const AD = {
    k1: ['10 Pasir Panjang Road, #12-01 Mapletree Business City, Singapore 117438', 'ar.sg@straitsharbour.example'],
    k2: ['Level 15, Menara Hap Seng, Jalan P. Ramlee, 50250 Kuala Lumpur, Malaysia', 'ar.my@straitsharbour.example'],
    k3: ['Unit 704, Raheja Centre, Nariman Point, Mumbai 400021, India', 'ar.in@straitsharbour.example'],
    k4: ['80 Robinson Road, #09-02, Singapore 068898', 'billing@meridianagro.example'],
    k5: ['Room 1802, 1000 Lujiazui Ring Road, Pudong, Shanghai 200120, China', 'billing.cn@meridianagro.example'],
    k6: ['88 Sathorn Nua Road, Silom, Bang Rak, Bangkok 10500, Thailand', 'accounts@andamanbay.example'],
    k7: ['2 Jurong East Street 21, #04-15, Singapore 609601', 'finance@kinabaluhome.example'],
    k8: ['Lot 3, Jalan Kemajuan, Seksyen 13, 46200 Petaling Jaya, Selangor, Malaysia', 'finance.my@kinabaluhome.example'],
    k9: ['Plot 45, MIDC Industrial Area, Andheri East, Mumbai 400093, India', 'ap@orchidlanepoly.example'],
    k10: ['No. 66 Huangpu Avenue West, Tianhe, Guangzhou 510620, China', 'ap.cn@orchidlanepoly.example'],
  };
  const C = [
    ['k1', 'SG-100231', 'Straits Harbour Logistics (SG)', 'gA', 'SG', 'ok'],
    ['k2', 'MY-200417', 'Straits Harbour Logistics (MY)', 'gA', 'MY', 'ok'],
    ['k3', 'IN-300552', 'Straits Harbour Logistics (IN)', 'gA', 'IN', 'ok'],
    ['k4', 'SG-100874', 'Meridian Agro Exports (SG)', 'gB', 'SG', 'ok'],
    ['k5', 'CN-400129', 'Meridian Agro Exports (CN)', 'gB', 'CN', 'ok'],
    ['k6', 'TH-500318', 'Andaman Bay Traders (TH)', 'gC', 'TH', 'sanc'],
    ['k7', 'SG-101066', 'Kinabalu Home Furnishings (SG)', 'gD', 'SG', 'ok'],
    ['k8', 'MY-200903', 'Kinabalu Home Furnishings (MY)', 'gD', 'MY', 'ok'],
    ['k9', 'IN-300781', 'Orchid Lane Polymers (IN)', 'gE', 'IN', 'black'],
    ['k10', 'CN-400566', 'Orchid Lane Polymers (CN)', 'gE', 'CN', 'black'],
  ].map((r, i) => ({
    id: r[0],
    code: r[1],
    name: r[2],
    g: r[3],
    ctry: r[4],
    st: r[5],
    ref: 'CMD-' + String(70412 + i * 137).padStart(7, '0'),
    addr: AD[r[0]][0],
    email: AD[r[0]][1],
  }));
  // Customers created / edited / deleted in the prototype (Create new Customer, Edit, Copy, Delete) — kept in this browser
  const CX = (() => {
    try {
      return JSON.parse(localStorage.getItem('girs.cust.v1') || '{}') || {};
    } catch (e) {
      return {};
    }
  })();
  Object.keys(CX.groups || {}).forEach((k) => {
    G[k] = Object.assign({}, CX.groups[k]);
  });
  Object.keys(CX.gedit || {}).forEach((k) => {
    if (G[k]) G[k] = Object.assign({}, G[k], CX.gedit[k]);
  });
  (CX.add || []).forEach((x) => C.push(Object.assign({}, x)));
  C.forEach((x) => {
    const e = (CX.edit || {})[x.id];
    if (e) Object.assign(x, e);
  });
  for (let i = C.length - 1; i >= 0; i--) if ((CX.del || []).indexOf(C[i].id) >= 0) C.splice(i, 1);
  const ST = {
    ok: { t: 'Not listed', chip: 'background:var(--okbg);color:var(--ok)', dot: 'var(--okbar)', flag: false },
    sanc: { t: 'Sanctioned', chip: 'background:var(--badbg);color:var(--bad)', dot: 'var(--badbar)', flag: true },
    black: { t: 'Blacklisted', chip: 'background:var(--badbg);color:var(--bad)', dot: 'var(--badbar)', flag: true },
  };
  const ARR = { Split: 'background:var(--aibg);color:var(--ai)', Default: 'background:var(--neutral);color:var(--muted2)' };
  const initials = (n) =>
    n
      .replace(/[\[\]]/g, '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  const parties = (c) =>
    C.filter((x) => x.g === c.g).map((x, i) => ({
      ctry: CN[x.ctry],
      name: x.name,
      code: x.code,
      isDef: x.id === c.id,
      def: x.id === c.id ? 'Default' : '',
      src: x.id === c.id ? (i % 2 ? 'LMS CMD' : 'Customer nomination · [Third-party platform]') : '',
    }));
  const jsonOn = (c) => (G[c.g] && G[c.g].json != null ? G[c.g].json : c.g !== 'gC');

  return { G, C, CN, ST };
}
