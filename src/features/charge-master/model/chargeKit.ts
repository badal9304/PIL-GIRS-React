import { formatChargeDate, portText, type Charge, type ChargeDirectory } from '@/entities/charge';
import type { KitMeta, KitRecord, KitSections } from '@/shared/lib/master-kit/masterKit';

/** Charge Master record actions: changes and (de)activation go to the approvals inbox. */
export const CHARGE_KIT_META: KitMeta = {
  key: 'ChargeMaster',
  noun: 'charge',
  newLabel: 'New charge',
  copyLabel: 'Copy as new charge',
  danger: 'toggle',
  readonly: false,
  opts: {
    'Charge category': [
      'Ancillary (MISC)',
      'Demurrage & Detention',
      'Destination local charges',
      'Freight',
      'Origin local charges',
      'Surcharge',
    ],
    'Active status': ['Active', 'Inactive'],
    'Origin / Destination': ['Both', 'Destination', 'Origin'],
    Country: ['All countries', 'China', 'India', 'Malaysia', 'Singapore', 'Thailand'],
    Port: ['All ports', 'CNSHA · Shanghai', 'INNSA · Nhava Sheva', 'MYPKG · Port Klang', 'SGSIN · Singapore', 'THLCH · Laem Chabang'],
    Currency: ['CNY', 'INR', 'MYR', 'SGD', 'THB', 'USD'],
    Mapping: ['Aligned with LMS charge code', 'Maintained in GIRS only'],
  },
};

export const chargeStatus = (h: Charge): 'Active' | 'Inactive' => (h.active ? 'Active' : 'Inactive');

/** Charge details, applicability, tax / currency, LMS mapping and business rules, as label / value pairs. */
export function chargeSections(dir: ChargeDirectory, h: Charge): KitSections {
  return [
    [
      'Charge details',
      [
        ['Charge code', h.code],
        ['Charge name', h.name],
        ['Charge category', h.cat],
        ['Active status', chargeStatus(h)],
        ['Effective from', formatChargeDate(h.from)],
        ['Effective to', formatChargeDate(h.to)],
      ],
    ],
    [
      'Applicability',
      [
        ['Origin / Destination', h.app],
        ['Country', dir.countries[h.ctry] ?? h.ctry],
        ['Port', portText(dir, h)],
      ],
    ],
    [
      'Country / Tax / Currency set-up',
      [
        ['Tax code', h.tax],
        ['Currency', h.ccy],
        ['Tax description', dir.taxDescriptions[h.tax] ?? ''],
      ],
    ],
    [
      'LMS mapping',
      [
        ['LMS charge code', h.lms || 'Not mapped'],
        ['Mapping', h.lms ? 'Aligned with LMS charge code' : 'Maintained in GIRS only'],
      ],
    ],
    ['Business rules', [['Rules using this charge', '[Business rules using this charge]']]],
  ];
}

/** Audit trail, newest first. */
export const auditNewestFirst = (h: Charge) => [...h.audit].reverse();

export const chargeKitRecord = (dir: ChargeDirectory, h: Charge): KitRecord => ({
  id: h.id,
  code: h.code,
  title: h.name,
  st: chargeStatus(h),
  secs: chargeSections(dir, h),
  hist: { title: 'Audit trail', cols: ['Change', 'By', 'Date & time'], rows: auditNewestFirst(h).map((x) => [x.a, x.b, x.c]) },
});
