import { formatAmount, validityText, type Contract, type ContractDirectory } from '@/entities/contract';
import type { KitMeta, KitRecord, KitSections } from '@/shared/lib/master-kit/masterKit';

/** Contract Master record actions: changes go to the approvals inbox; editing creates a new version. */
export const CONTRACT_KIT_META: KitMeta = {
  key: 'ContractMaster',
  noun: 'contract',
  newLabel: 'New contract',
  copyLabel: 'Copy as new contract',
  danger: 'delete',
  readonly: false,
  opts: {
    Customer: [
      'Andaman Bay Traders (TH)',
      'Kinabalu Home Furnishings (MY)',
      'Kinabalu Home Furnishings (SG)',
      'Meridian Agro Exports (CN)',
      'Meridian Agro Exports (SG)',
      'Orchid Lane Polymers (IN)',
      'Straits Harbour Logistics (MY)',
      'Straits Harbour Logistics (SG)',
    ],
    'Trade lane': [
      'Asia–East Africa',
      'Asia–Middle East',
      'Asia–West Africa',
      'Intra-Asia · CN–SG',
      'Intra-Asia · MY–CN',
      'Intra-Asia · MY–IN',
      'Intra-Asia · SG–IN',
      'Intra-Asia · TH–IN',
    ],
    'Payment terms': ['Cash · pay before invoice', 'Net 15 days', 'Net 30 days', 'Net 45 days'],
    Version: ['v1', 'v2', 'v3', 'v4'],
    'Admin fee': ['Applied', 'Not applied'],
    'Required by': ['PIL India', 'PIL Malaysia', 'PIL Singapore', 'PIL Thailand'],
    'Tax applicability': ['Taxable', 'Zero-rated'],
    Reason: ['Not required for PIL China', 'Not required for PIL Singapore'],
  },
};

/** Contract details, admin fee and tax set-up, as label / value pairs. */
export function contractSections(dir: ContractDirectory, c: Contract): KitSections {
  return [
    [
      'Contract details',
      [
        ['Contract no.', c.no],
        ['Customer code', c.cus],
        ['Customer', c.cusName],
        ['Trade lane', c.lane],
        ['Validity', validityText(c)],
        ['Payment terms', c.terms],
        ['Version', 'v' + c.ver],
      ],
    ],
    [
      'Admin fee',
      c.adm.on
        ? [
            ['Admin fee', 'Applied'],
            ['Amount', c.adm.ccy + ' ' + formatAmount(c.adm.amt)],
            ['Applies to', 'DD invoices'],
            ['Charged', 'Per invoice · automatically'],
            ['Required by', c.adm.ent],
          ]
        : [
            ['Admin fee', 'Not applied'],
            ['Reason', 'Not required for ' + c.adm.ent],
            ['Applies to', 'DD invoices'],
          ],
    ],
    [
      'Tax set-up',
      [
        ['Tax applicability', c.tax],
        ['Tax code', c.taxCode],
        ['Tax description', dir.taxDescriptions[c.taxCode] ?? ''],
      ],
    ],
  ];
}

/** A contract as a kit record (sections for the change form, version history for the popup). */
export const contractKitRecord = (dir: ContractDirectory, c: Contract): KitRecord => ({
  id: c.id,
  code: c.no,
  title: c.cusName,
  st: c.st,
  secs: contractSections(dir, c),
  hist: {
    title: 'Version history',
    cols: ['Version', 'Change', 'By', 'Date & time'],
    rows: c.vers.map((v) => ['v' + v.n + ' · ' + v.st, v.what, v.by, v.at]),
  },
});
