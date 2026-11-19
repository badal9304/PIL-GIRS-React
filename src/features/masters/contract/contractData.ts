// @ts-nocheck — screen logic ported from the GIRS prototype; types are added as the screen is reworked.
/* Contract master: field definitions, options and sample records. */

export const KIT_M = {
  key: 'ContractMaster',
  noun: 'contract',
  newLabel: 'New contract',
  copyLabel: 'Copy as new contract',
  danger: 'delete',
  readonly: false,
  def_: 'k1',
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
  recs: [
    {
      id: 'k1',
      code: 'CT-26-00012',
      title: 'Straits Harbour Logistics (SG)',
      st: 'Approved',
      secs: [
        [
          'Contract details',
          [
            ['Contract no.', 'CT-26-00012'],
            ['Customer code', 'SG-100231'],
            ['Customer', 'Straits Harbour Logistics (SG)'],
            ['Trade lane', 'Intra-Asia · SG–IN'],
            ['Validity', '1 Jan 2026 – 31 Dec 2026'],
            ['Payment terms', 'Net 30 days'],
            ['Version', 'v3'],
          ],
        ],
        [
          'Admin fee',
          [
            ['Admin fee', 'Applied'],
            ['Amount', 'SGD 25.00'],
            ['Applies to', 'DD invoices'],
            ['Charged', 'Per invoice · automatically'],
            ['Required by', 'PIL Singapore'],
          ],
        ],
        [
          'Tax set-up',
          [
            ['Tax applicability', 'Taxable'],
            ['Tax code', 'SG-SR-9'],
            ['Tax description', 'Singapore GST 9%'],
          ],
        ],
      ],
      hist: {
        title: 'Version history',
        cols: ['Version', 'Change', 'By', 'Date & time'],
        rows: [
          ['v3 · Approved', 'BAF rate 240 → 220 USD', 'Wei Ling Tan', '2 Jun 2026 11:05'],
          ['v2 · Approved', 'Admin fee added · SGD 25 per DD invoice', 'Wei Ling Tan', '14 Mar 2026 16:40'],
          ['v1 · Approved', 'Contract created', 'Daniel Tan', '18 Dec 2025 10:12'],
        ],
      },
      nContracts: 0,
    },
    {
      id: 'k2',
      code: 'CT-26-00019',
      title: 'Straits Harbour Logistics (MY)',
      st: 'Approved',
      secs: [
        [
          'Contract details',
          [
            ['Contract no.', 'CT-26-00019'],
            ['Customer code', 'MY-200417'],
            ['Customer', 'Straits Harbour Logistics (MY)'],
            ['Trade lane', 'Intra-Asia · MY–CN'],
            ['Validity', '1 Jan 2026 – 31 Dec 2026'],
            ['Payment terms', 'Net 30 days'],
            ['Version', 'v2'],
          ],
        ],
        [
          'Admin fee',
          [
            ['Admin fee', 'Applied'],
            ['Amount', 'MYR 80.00'],
            ['Applies to', 'DD invoices'],
            ['Charged', 'Per invoice · automatically'],
            ['Required by', 'PIL Malaysia'],
          ],
        ],
        [
          'Tax set-up',
          [
            ['Tax applicability', 'Taxable'],
            ['Tax code', 'MY-SST-8'],
            ['Tax description', 'Malaysia SST 8%'],
          ],
        ],
      ],
      hist: {
        title: 'Version history',
        cols: ['Version', 'Change', 'By', 'Date & time'],
        rows: [
          ['v2 · Approved', 'THC-O rate 620 → 650 MYR', 'Aisyah Rahman', '20 Apr 2026 09:30'],
          ['v1 · Approved', 'Contract created', 'Aisyah Rahman', '22 Dec 2025 14:00'],
        ],
      },
      nContracts: 0,
    },
    {
      id: 'k9',
      code: 'CT-26-00065',
      title: 'Straits Harbour Logistics (SG)',
      st: 'Approved',
      secs: [
        [
          'Contract details',
          [
            ['Contract no.', 'CT-26-00065'],
            ['Customer code', 'SG-100231'],
            ['Customer', 'Straits Harbour Logistics (SG)'],
            ['Trade lane', 'Asia–Middle East'],
            ['Validity', '1 Jul 2026 – 30 Jun 2027'],
            ['Payment terms', 'Net 30 days'],
            ['Version', 'v1'],
          ],
        ],
        [
          'Admin fee',
          [
            ['Admin fee', 'Applied'],
            ['Amount', 'SGD 25.00'],
            ['Applies to', 'DD invoices'],
            ['Charged', 'Per invoice · automatically'],
            ['Required by', 'PIL Singapore'],
          ],
        ],
        [
          'Tax set-up',
          [
            ['Tax applicability', 'Zero-rated'],
            ['Tax code', 'ZR-INTL'],
            ['Tax description', 'Zero-rated · international transport'],
          ],
        ],
      ],
      hist: {
        title: 'Version history',
        cols: ['Version', 'Change', 'By', 'Date & time'],
        rows: [['v1 · Approved', 'Contract created', 'Daniel Tan', '12 Jun 2026 15:20']],
      },
      nContracts: 0,
    },
    {
      id: 'k3',
      code: 'CT-26-00027',
      title: 'Meridian Agro Exports (SG)',
      st: 'Pending approval',
      secs: [
        [
          'Contract details',
          [
            ['Contract no.', 'CT-26-00027'],
            ['Customer code', 'SG-100874'],
            ['Customer', 'Meridian Agro Exports (SG)'],
            ['Trade lane', 'Asia–Middle East'],
            ['Validity', '1 Dec 2026 – 30 Nov 2027'],
            ['Payment terms', 'Net 45 days'],
            ['Version', 'v1'],
          ],
        ],
        [
          'Admin fee',
          [
            ['Admin fee', 'Not applied'],
            ['Reason', 'Not required for PIL Singapore'],
            ['Applies to', 'DD invoices'],
          ],
        ],
        [
          'Tax set-up',
          [
            ['Tax applicability', 'Zero-rated'],
            ['Tax code', 'ZR-INTL'],
            ['Tax description', 'Zero-rated · international transport'],
          ],
        ],
      ],
      hist: {
        title: 'Version history',
        cols: ['Version', 'Change', 'By', 'Date & time'],
        rows: [['v1 · Pending approval', 'Contract created · sent for approval', 'Daniel Tan', '6 Nov 2026 17:45']],
      },
      nContracts: 0,
    },
    {
      id: 'k4',
      code: 'CT-26-00031',
      title: 'Meridian Agro Exports (CN)',
      st: 'Approved',
      secs: [
        [
          'Contract details',
          [
            ['Contract no.', 'CT-26-00031'],
            ['Customer code', 'CN-400129'],
            ['Customer', 'Meridian Agro Exports (CN)'],
            ['Trade lane', 'Intra-Asia · CN–SG'],
            ['Validity', '1 Feb 2026 – 31 Jan 2027'],
            ['Payment terms', 'Net 45 days'],
            ['Version', 'v4'],
          ],
        ],
        [
          'Admin fee',
          [
            ['Admin fee', 'Not applied'],
            ['Reason', 'Not required for PIL China'],
            ['Applies to', 'DD invoices'],
          ],
        ],
        [
          'Tax set-up',
          [
            ['Tax applicability', 'Taxable'],
            ['Tax code', 'CN-VAT-6'],
            ['Tax description', 'China VAT 6%'],
          ],
        ],
      ],
      hist: {
        title: 'Version history',
        cols: ['Version', 'Change', 'By', 'Date & time'],
        rows: [
          ['v4 · Approved', 'Validity extended to 31 Jan 2027', 'Li Na', '30 Sep 2026 10:10'],
          ['v3 · Approved', 'OFT rate 700 → 680 USD', 'Li Na', '12 Jul 2026 12:00'],
          ['v2 · Approved', 'DEM rate added', 'Li Na', '3 Apr 2026 09:15'],
          ['v1 · Approved', 'Contract created', 'Li Na', '20 Jan 2026 16:30'],
        ],
      },
      nContracts: 0,
    },
    {
      id: 'k5',
      code: 'CT-25-00088',
      title: 'Andaman Bay Traders (TH)',
      st: 'Approved',
      secs: [
        [
          'Contract details',
          [
            ['Contract no.', 'CT-25-00088'],
            ['Customer code', 'TH-500318'],
            ['Customer', 'Andaman Bay Traders (TH)'],
            ['Trade lane', 'Intra-Asia · TH–IN'],
            ['Validity', '1 Jul 2025 – 30 Jun 2026'],
            ['Payment terms', 'Cash · pay before invoice'],
            ['Version', 'v2'],
          ],
        ],
        [
          'Admin fee',
          [
            ['Admin fee', 'Applied'],
            ['Amount', 'THB 500.00'],
            ['Applies to', 'DD invoices'],
            ['Charged', 'Per invoice · automatically'],
            ['Required by', 'PIL Thailand'],
          ],
        ],
        [
          'Tax set-up',
          [
            ['Tax applicability', 'Taxable'],
            ['Tax code', 'TH-VAT-7'],
            ['Tax description', 'Thailand VAT 7%'],
          ],
        ],
      ],
      hist: {
        title: 'Version history',
        cols: ['Version', 'Change', 'By', 'Date & time'],
        rows: [
          ['v2 · Approved', 'Admin fee added · THB 500 per DD invoice', 'Somchai P.', '5 Nov 2025 11:00'],
          ['v1 · Approved', 'Contract created', 'Somchai P.', '20 Jun 2025 10:00'],
        ],
      },
      nContracts: 0,
    },
    {
      id: 'k6',
      code: 'CT-26-00044',
      title: 'Kinabalu Home Furnishings (SG)',
      st: 'Draft',
      secs: [
        [
          'Contract details',
          [
            ['Contract no.', 'CT-26-00044'],
            ['Customer code', 'SG-101066'],
            ['Customer', 'Kinabalu Home Furnishings (SG)'],
            ['Trade lane', 'Asia–East Africa'],
            ['Validity', '1 Jan 2027 – 31 Dec 2027'],
            ['Payment terms', 'Net 30 days'],
            ['Version', 'v1'],
          ],
        ],
        [
          'Admin fee',
          [
            ['Admin fee', 'Applied'],
            ['Amount', 'SGD 25.00'],
            ['Applies to', 'DD invoices'],
            ['Charged', 'Per invoice · automatically'],
            ['Required by', 'PIL Singapore'],
          ],
        ],
        [
          'Tax set-up',
          [
            ['Tax applicability', 'Zero-rated'],
            ['Tax code', 'ZR-INTL'],
            ['Tax description', 'Zero-rated · international transport'],
          ],
        ],
      ],
      hist: {
        title: 'Version history',
        cols: ['Version', 'Change', 'By', 'Date & time'],
        rows: [['v1 · Draft', 'Draft created', 'Daniel Tan', '10 Nov 2026 15:05']],
      },
      nContracts: 0,
    },
    {
      id: 'k7',
      code: 'CT-26-00052',
      title: 'Kinabalu Home Furnishings (MY)',
      st: 'Pending approval',
      secs: [
        [
          'Contract details',
          [
            ['Contract no.', 'CT-26-00052'],
            ['Customer code', 'MY-200903'],
            ['Customer', 'Kinabalu Home Furnishings (MY)'],
            ['Trade lane', 'Intra-Asia · MY–IN'],
            ['Validity', '1 Apr 2026 – 31 Mar 2027'],
            ['Payment terms', 'Net 30 days'],
            ['Version', 'v3'],
          ],
        ],
        [
          'Admin fee',
          [
            ['Admin fee', 'Applied'],
            ['Amount', 'MYR 80.00'],
            ['Applies to', 'DD invoices'],
            ['Charged', 'Per invoice · automatically'],
            ['Required by', 'PIL Malaysia'],
          ],
        ],
        [
          'Tax set-up',
          [
            ['Tax applicability', 'Taxable'],
            ['Tax code', 'MY-SST-8'],
            ['Tax description', 'Malaysia SST 8%'],
          ],
        ],
      ],
      hist: {
        title: 'Version history',
        cols: ['Version', 'Change', 'By', 'Date & time'],
        rows: [
          ['v3 · Pending approval', 'OFT rate 740 → 760 USD', 'Aisyah Rahman', '8 Nov 2026 10:20'],
          ['v2 · Approved', 'DET rate added', 'Aisyah Rahman', '14 Jul 2026 13:45'],
          ['v1 · Approved', 'Contract created', 'Aisyah Rahman', '20 Mar 2026 09:00'],
        ],
      },
      nContracts: 0,
    },
    {
      id: 'k8',
      code: 'CT-26-00060',
      title: 'Orchid Lane Polymers (IN)',
      st: 'Rejected',
      secs: [
        [
          'Contract details',
          [
            ['Contract no.', 'CT-26-00060'],
            ['Customer code', 'IN-300781'],
            ['Customer', 'Orchid Lane Polymers (IN)'],
            ['Trade lane', 'Asia–West Africa'],
            ['Validity', '1 Oct 2026 – 30 Sep 2027'],
            ['Payment terms', 'Net 15 days'],
            ['Version', 'v1'],
          ],
        ],
        [
          'Admin fee',
          [
            ['Admin fee', 'Applied'],
            ['Amount', 'INR 1,500.00'],
            ['Applies to', 'DD invoices'],
            ['Charged', 'Per invoice · automatically'],
            ['Required by', 'PIL India'],
          ],
        ],
        [
          'Tax set-up',
          [
            ['Tax applicability', 'Taxable'],
            ['Tax code', 'IN-GST-18'],
            ['Tax description', 'India GST 18%'],
          ],
        ],
      ],
      hist: {
        title: 'Version history',
        cols: ['Version', 'Change', 'By', 'Date & time'],
        rows: [['v1 · Rejected', 'Rejected · returned for revision', 'Priya Nair', '28 Sep 2026 18:10']],
      },
      nContracts: 0,
    },
  ],
  contracts: {},
};
