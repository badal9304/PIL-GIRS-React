import type { CustomerDirectory } from '../model/customer';

/** Sample LMS Customer Master Data (until the LMS CMD API is connected). */
const ADDRESS: Record<string, [string, string]> = {
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

const ROWS: [id: string, code: string, name: string, group: string, ctry: string, st: 'ok' | 'sanc' | 'black'][] = [
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
];

export const CUSTOMER_SEED: CustomerDirectory = {
  groups: {
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
  },
  customers: ROWS.map(([id, code, name, g, ctry, st], i) => ({
    id,
    code,
    name,
    g,
    ctry,
    st,
    ref: 'CMD-' + String(70412 + i * 137).padStart(7, '0'),
    addr: ADDRESS[id]?.[0] ?? '',
    email: ADDRESS[id]?.[1] ?? '',
  })),
  contracts: {
    'SG-100231': [
      ['CT-26-00012', 'Intra-Asia · SG–IN', '1 Jan 2026 – 31 Dec 2026', 'Approved'],
      ['CT-26-00065', 'Asia–Middle East', '1 Jul 2026 – 30 Jun 2027', 'Approved'],
    ],
    'MY-200417': [['CT-26-00019', 'Intra-Asia · MY–CN', '1 Jan 2026 – 31 Dec 2026', 'Approved']],
    'IN-300552': [],
    'SG-100874': [['CT-26-00027', 'Asia–Middle East', '1 Dec 2026 – 30 Nov 2027', 'Pending approval']],
    'CN-400129': [['CT-26-00031', 'Intra-Asia · CN–SG', '1 Feb 2026 – 31 Jan 2027', 'Approved']],
    'TH-500318': [['CT-25-00088', 'Intra-Asia · TH–IN', '1 Jul 2025 – 30 Jun 2026', 'Approved']],
    'SG-101066': [['CT-26-00044', 'Asia–East Africa', '1 Jan 2027 – 31 Dec 2027', 'Draft']],
    'MY-200903': [['CT-26-00052', 'Intra-Asia · MY–IN', '1 Apr 2026 – 31 Mar 2027', 'Pending approval']],
    'IN-300781': [['CT-26-00060', 'Asia–West Africa', '1 Oct 2026 – 30 Sep 2027', 'Rejected']],
    'CN-400566': [],
  },
};
