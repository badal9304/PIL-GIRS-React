import { addDays, daysBetween, formatDate, toDate, toIso } from '@/shared/lib/dates';
import { formatInt, formatUsdShort } from '@/shared/lib/format';
import { seededRandom } from '@/shared/lib/random';

/** Reference data of voyage invoicing (locations, vessels, customers, charges, D&D tariffs) and helpers. */

/** Business date of the sample data. */
export const TODAY = '2026-11-20';

/** Hub -> [country, port, country code, voyages per day]. */
export const HUBS: Readonly<Record<string, readonly [string, string, string, number]>> = {
  SIN: ['Singapore', 'SGSIN', 'SG', 11],
  NSA: ['India', 'INNSA', 'IN', 7],
  LCH: ['Thailand', 'THLCH', 'TH', 5],
  PKG: ['Malaysia', 'MYPKG', 'MY', 6],
  JED: ['Saudi Arabia', 'SAJED', 'SA', 4],
  ZLO: ['Mexico', 'MXZLO', 'MX', 3],
};
export const hubOf = (hub: string): readonly [string, string, string, number] => HUBS[hub] ?? HUBS.SIN ?? ['Singapore', 'SGSIN', 'SG', 11];

/** Country -> local currency. */
export const CURRENCY_OF: Readonly<Record<string, string>> = {
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

export const PORTS: readonly string[] = [
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

/** Vessel name, code, service. */
export const VESSELS: readonly (readonly [string, string, string])[] = [
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

export const CUSTOMERS: readonly string[] = [
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

/** What is missing when B/L data was not received. */
export const MISSING_DATA: readonly string[] = ['Charges', 'Billing party', 'Customer tax ID', 'Cargo / EDI message'];

/** B/L state -> [label, tone]. */
export const BL_STATUS: Readonly<Record<string, readonly [string, string]>> = {
  inv: ['Invoiced', 'neutral'],
  ready: ['Ready to generate', 'ok'],
  roe: ['ROE not received', 'warn'],
  nod: ['Data not received', 'warn'],
  hold: ['Split-payer unconfirmed', 'warn'],
};

/** Port -> [currency, ROE to USD, standard tax code, freight tax code]. */
export const LOCATIONS: Readonly<Record<string, readonly [string, number, string, string]>> = {
  SGSIN: ['SGD', 1.3412, 'SG-SR-9', 'ZR-INTL'],
  INNSA: ['INR', 84.12, 'IN-GST-18', 'ZR-INTL'],
  MYPKG: ['MYR', 4.471, 'MY-SST-8', 'ZR-INTL'],
  THLCH: ['THB', 34.25, 'TH-VAT-7', 'ZR-INTL'],
  SAJED: ['SAR', 3.75, 'SA-VAT-15', 'ZR-INTL'],
  MXZLO: ['MXN', 17.1, 'MX-IVA-16', 'ZR-INTL'],
};

/** Charge code -> name. */
export const CHARGES: Readonly<Record<string, string>> = {
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

export const UOMS: readonly string[] = ['CNTR', 'BL', 'TEU', 'Day'];

export const CITIES: Readonly<Record<string, string>> = {
  SG: 'Singapore 609',
  IN: 'Navi Mumbai 400 7',
  MY: 'Port Klang 420',
  TH: 'Chonburi 20',
  SA: 'Jeddah 21',
  MX: 'Manzanillo 28',
};

export const STREETS: readonly string[] = [
  'Pioneer Road',
  'Jurong Port Road',
  'Tuas South Avenue 1',
  'Harbour Front Walk',
  'Logistics Park Drive',
  'Industrial Estate Road',
  'Free Zone Boulevard',
  'Container Terminal Way',
];

export interface DirectoryCustomer {
  code: string;
  name: string;
  addr: string;
}

/** Customer directory of a country (code, name, address); the same every time. */
export const customerDirectory = (cc: string): DirectoryCustomer[] =>
  CUSTOMERS.map((n, j) => {
    const r = seededRandom(cc + n);
    r();
    return {
      code: cc + '-' + (100000 + Math.floor(r() * 899999)),
      name: n + ' (' + cc + ')',
      addr: 10 + Math.floor(r() * 90) + ' ' + STREETS[j % STREETS.length] + ', ' + (CITIES[cc] ?? '') + String(10 + Math.floor(r() * 89)),
    };
  });

/** Fixed voyages of the client scenario: [voyage, direction, other port, B/Ls, avg amount, B/L state]. */
export const FIXED_VOYAGES: Readonly<
  Record<string, readonly (readonly [string, 'E' | 'I', string, number, number, readonly [number, number, number, number, number]])[]>
> = {
  SGSIN: [
    ['0LK5SS', 'E', 'NZAKL', 1000, 1850, [0, 935, 25, 40, 0]],
    ['1KP8RR', 'I', 'INNSA', 520, 620, [310, 154, 30, 20, 6]],
  ],
};

export const fmtN = formatInt;
export const fmtUsd = formatUsdShort;
export { toDate, toIso, addDays, daysBetween, formatDate };

/** D&D tariff slabs per size: [days, rate per day]. */
export const DD_SLABS: Readonly<Record<string, readonly (readonly [number, number])[]>> = {
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

/** D&D status -> [label, tone]. */
export const DD_STATUS: Readonly<Record<string, readonly [string, string]>> = {
  ready: ['Ready to invoice', 'ok'],
  roe: ['ROE not received', 'warn'],
  tariff: ['D&D tariff missing', 'warn'],
  milestone: ['Milestone conflict', 'warn'],
  waiver: ['Waiver approval pending', 'warn'],
  out: ['With customer', 'info'],
  invoiced: ['Invoiced', 'neutral'],
};

/** D&D blocker -> [owner, action]. */
export const DD_REASONS: Readonly<Record<string, readonly [string, string]>> = {
  roe: ['Treasury · ROE feed', 'Request ROE'],
  tariff: ['Pricing · tariff set-up', 'Request tariff'],
  milestone: ['Equipment control · LMS', 'Raise LMS check'],
  waiver: ['Credit control · approver', 'Chase approval'],
};

/** D&D charge for days over the free time, by slab. */
export function ddCharge(sz: string, over: number): { amt: number; txt: string } {
  let left = over;
  let amt = 0;
  const parts: string[] = [];
  (DD_SLABS[sz] ?? [[99, 50]]).forEach(([d, r]) => {
    const n = Math.min(left, d);
    if (n > 0) {
      amt += n * r;
      parts.push(n + ' d × ' + r);
      left -= n;
    }
  });
  return { amt, txt: parts.join(' + ') };
}
