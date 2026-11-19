// @ts-nocheck — screen logic ported from the GIRS prototype; types are added as the screen is reworked.
/* Contract master, layout D — view-model. */
import { ViewModel } from '../../../lib/viewModel';
import { KIT_VALS } from '../kit';
import { KIT_M } from './contractData';

export class GirsPage extends ViewModel {
  constructor(p) {
    super(p);
    let sc = '';
    try {
      const x = JSON.parse(localStorage.getItem('girs.dsel') || 'null');
      if (x && x.p === 'ContractMasterD') {
        sc = x.c;
        localStorage.removeItem('girs.dsel');
      }
    } catch (e) {}
    this.state = { q: '', fs: '', sel: 'k1', selCode: sc, open: null, op: null };
  }
  renderVals() {
    const s = this.state;
    const D = {
      recs: [
        {
          id: 'k1',
          code: 'CT-26-00012',
          title: 'Straits Harbour Logistics (SG)',
          group: 'Straits Harbour Logistics (SG)',
          st: 'Approved',
          search: 'CT-26-00012 SG-100231 Straits Harbour Logistics (SG) Intra-Asia · SG–IN',
          sub: 'SG-100231 · Intra-Asia · SG–IN · Version v3',
          chips: [['In force', 'background:var(--okbg);color:var(--ok)']],
          alert: '',
          facts: [
            ['Validity', '1 Jan 2026 – 31 Dec 2026', 0],
            ['Trade lane', 'Intra-Asia · SG–IN', 0],
            ['Payment terms', 'Net 30 days', 0],
            ['Tax', 'Taxable · SG-SR-9', 0],
            ['Admin fee', 'SGD 25.00 per DD invoice', 0],
            ['Rates', '7', 1],
          ],
          sections: [
            [
              'Contract details',
              [
                ['Contract no.', 'CT-26-00012', 1, 0, 0],
                ['Customer code', 'SG-100231', 1, 0, 0],
                ['Customer', 'Straits Harbour Logistics (SG)', 0, 1, 0],
                ['Trade lane', 'Intra-Asia · SG–IN', 0, 0, 0],
                ['Validity', '1 Jan 2026 – 31 Dec 2026', 0, 0, 0],
                ['Payment terms', 'Net 30 days', 0, 0, 0],
                ['Version', 'v3', 1, 0, 0],
              ],
            ],
            [
              'Admin fee',
              [
                ['Admin fee', 'Applied', 0, 0, 0],
                ['Amount', 'SGD 25.00', 1, 0, 0],
                ['Applies to', 'DD invoices', 0, 0, 0],
                ['Charged', 'Per invoice · automatically', 0, 0, 0],
                ['Required by', 'PIL Singapore', 0, 0, 0],
              ],
            ],
            [
              'Tax set-up',
              [
                ['Tax applicability', 'Taxable', 0, 0, 0],
                ['Tax code', 'SG-SR-9', 1, 0, 0],
                ['Tax description', 'Singapore GST 9%', 0, 1, 0],
              ],
            ],
          ],
          tables: [
            [
              'Customer-specific rates · 7',
              ['Charge code', 'Charge name', 'Rate', 'Currency'],
              [
                ['OFT', 'Ocean Freight', '850.00', 'USD'],
                ['BAF', 'Bunker Adjustment Factor', '220.00', 'USD'],
                ['LSS', 'Low Sulphur Surcharge', '45.00', 'USD'],
                ['THC-O', 'Terminal Handling · Origin', '210.00', 'SGD'],
                ['DOC', 'Documentation Fee', '65.00', 'SGD'],
                ['DEM', 'Demurrage', '95.00', 'SGD'],
                ['DET', 'Detention', '60.00', 'SGD'],
              ],
              [0, 2, 3],
              'charge-master-d.html',
              'ChargeMasterD',
            ],
          ],
          railTitle: 'Version history · 3',
          railNote: '',
          rail: [
            ['v3 · Approved', 'BAF rate 240 → 220 USD', 'Wei Ling Tan · 2 Jun 2026 11:05', 1],
            ['v2 · Approved', 'Admin fee added · SGD 25 per DD invoice', 'Wei Ling Tan · 14 Mar 2026 16:40', 0],
            ['v1 · Approved', 'Contract created', 'Daniel Tan · 18 Dec 2025 10:12', 0],
          ],
          comb: false,
        },
        {
          id: 'k2',
          code: 'CT-26-00019',
          title: 'Straits Harbour Logistics (MY)',
          group: 'Straits Harbour Logistics (MY)',
          st: 'Approved',
          search: 'CT-26-00019 MY-200417 Straits Harbour Logistics (MY) Intra-Asia · MY–CN',
          sub: 'MY-200417 · Intra-Asia · MY–CN · Version v2',
          chips: [['In force', 'background:var(--okbg);color:var(--ok)']],
          alert: '',
          facts: [
            ['Validity', '1 Jan 2026 – 31 Dec 2026', 0],
            ['Trade lane', 'Intra-Asia · MY–CN', 0],
            ['Payment terms', 'Net 30 days', 0],
            ['Tax', 'Taxable · MY-SST-8', 0],
            ['Admin fee', 'MYR 80.00 per DD invoice', 0],
            ['Rates', '5', 1],
          ],
          sections: [
            [
              'Contract details',
              [
                ['Contract no.', 'CT-26-00019', 1, 0, 0],
                ['Customer code', 'MY-200417', 1, 0, 0],
                ['Customer', 'Straits Harbour Logistics (MY)', 0, 1, 0],
                ['Trade lane', 'Intra-Asia · MY–CN', 0, 0, 0],
                ['Validity', '1 Jan 2026 – 31 Dec 2026', 0, 0, 0],
                ['Payment terms', 'Net 30 days', 0, 0, 0],
                ['Version', 'v2', 1, 0, 0],
              ],
            ],
            [
              'Admin fee',
              [
                ['Admin fee', 'Applied', 0, 0, 0],
                ['Amount', 'MYR 80.00', 1, 0, 0],
                ['Applies to', 'DD invoices', 0, 0, 0],
                ['Charged', 'Per invoice · automatically', 0, 0, 0],
                ['Required by', 'PIL Malaysia', 0, 0, 0],
              ],
            ],
            [
              'Tax set-up',
              [
                ['Tax applicability', 'Taxable', 0, 0, 0],
                ['Tax code', 'MY-SST-8', 1, 0, 0],
                ['Tax description', 'Malaysia SST 8%', 0, 1, 0],
              ],
            ],
          ],
          tables: [
            [
              'Customer-specific rates · 5',
              ['Charge code', 'Charge name', 'Rate', 'Currency'],
              [
                ['OFT', 'Ocean Freight', '720.00', 'USD'],
                ['BAF', 'Bunker Adjustment Factor', '210.00', 'USD'],
                ['THC-O', 'Terminal Handling · Origin', '650.00', 'MYR'],
                ['DOC', 'Documentation Fee', '180.00', 'MYR'],
                ['DET', 'Detention', '150.00', 'MYR'],
              ],
              [0, 2, 3],
              'charge-master-d.html',
              'ChargeMasterD',
            ],
          ],
          railTitle: 'Version history · 2',
          railNote: '',
          rail: [
            ['v2 · Approved', 'THC-O rate 620 → 650 MYR', 'Aisyah Rahman · 20 Apr 2026 09:30', 1],
            ['v1 · Approved', 'Contract created', 'Aisyah Rahman · 22 Dec 2025 14:00', 0],
          ],
          comb: false,
        },
        {
          id: 'k9',
          code: 'CT-26-00065',
          title: 'Straits Harbour Logistics (SG)',
          group: 'Straits Harbour Logistics (SG)',
          st: 'Approved',
          search: 'CT-26-00065 SG-100231 Straits Harbour Logistics (SG) Asia–Middle East',
          sub: 'SG-100231 · Asia–Middle East · Version v1',
          chips: [['In force', 'background:var(--okbg);color:var(--ok)']],
          alert: '',
          facts: [
            ['Validity', '1 Jul 2026 – 30 Jun 2027', 0],
            ['Trade lane', 'Asia–Middle East', 0],
            ['Payment terms', 'Net 30 days', 0],
            ['Tax', 'Zero-rated · ZR-INTL', 0],
            ['Admin fee', 'SGD 25.00 per DD invoice', 0],
            ['Rates', '4', 1],
          ],
          sections: [
            [
              'Contract details',
              [
                ['Contract no.', 'CT-26-00065', 1, 0, 0],
                ['Customer code', 'SG-100231', 1, 0, 0],
                ['Customer', 'Straits Harbour Logistics (SG)', 0, 1, 0],
                ['Trade lane', 'Asia–Middle East', 0, 0, 0],
                ['Validity', '1 Jul 2026 – 30 Jun 2027', 0, 0, 0],
                ['Payment terms', 'Net 30 days', 0, 0, 0],
                ['Version', 'v1', 1, 0, 0],
              ],
            ],
            [
              'Admin fee',
              [
                ['Admin fee', 'Applied', 0, 0, 0],
                ['Amount', 'SGD 25.00', 1, 0, 0],
                ['Applies to', 'DD invoices', 0, 0, 0],
                ['Charged', 'Per invoice · automatically', 0, 0, 0],
                ['Required by', 'PIL Singapore', 0, 0, 0],
              ],
            ],
            [
              'Tax set-up',
              [
                ['Tax applicability', 'Zero-rated', 0, 0, 0],
                ['Tax code', 'ZR-INTL', 1, 0, 0],
                ['Tax description', 'Zero-rated · international transport', 0, 1, 0],
              ],
            ],
          ],
          tables: [
            [
              'Customer-specific rates · 4',
              ['Charge code', 'Charge name', 'Rate', 'Currency'],
              [
                ['OFT', 'Ocean Freight', '1,450.00', 'USD'],
                ['BAF', 'Bunker Adjustment Factor', '310.00', 'USD'],
                ['LSS', 'Low Sulphur Surcharge', '60.00', 'USD'],
                ['THC-O', 'Terminal Handling · Origin', '210.00', 'SGD'],
              ],
              [0, 2, 3],
              'charge-master-d.html',
              'ChargeMasterD',
            ],
          ],
          railTitle: 'Version history · 1',
          railNote: '',
          rail: [['v1 · Approved', 'Contract created', 'Daniel Tan · 12 Jun 2026 15:20', 1]],
          comb: false,
        },
        {
          id: 'k3',
          code: 'CT-26-00027',
          title: 'Meridian Agro Exports (SG)',
          group: 'Meridian Agro Exports (SG)',
          st: 'Pending approval',
          search: 'CT-26-00027 SG-100874 Meridian Agro Exports (SG) Asia–Middle East',
          sub: 'SG-100874 · Asia–Middle East · Version v1',
          chips: [['Upcoming', 'background:var(--tint);color:var(--accent2)']],
          alert: '',
          facts: [
            ['Validity', '1 Dec 2026 – 30 Nov 2027', 0],
            ['Trade lane', 'Asia–Middle East', 0],
            ['Payment terms', 'Net 45 days', 0],
            ['Tax', 'Zero-rated · ZR-INTL', 0],
            ['Admin fee', 'Not applied', 0],
            ['Rates', '4', 1],
          ],
          sections: [
            [
              'Contract details',
              [
                ['Contract no.', 'CT-26-00027', 1, 0, 0],
                ['Customer code', 'SG-100874', 1, 0, 0],
                ['Customer', 'Meridian Agro Exports (SG)', 0, 1, 0],
                ['Trade lane', 'Asia–Middle East', 0, 0, 0],
                ['Validity', '1 Dec 2026 – 30 Nov 2027', 0, 0, 0],
                ['Payment terms', 'Net 45 days', 0, 0, 0],
                ['Version', 'v1', 1, 0, 0],
              ],
            ],
            [
              'Admin fee',
              [
                ['Admin fee', 'Not applied', 0, 0, 0],
                ['Reason', 'Not required for PIL Singapore', 0, 1, 0],
                ['Applies to', 'DD invoices', 0, 0, 0],
              ],
            ],
            [
              'Tax set-up',
              [
                ['Tax applicability', 'Zero-rated', 0, 0, 0],
                ['Tax code', 'ZR-INTL', 1, 0, 0],
                ['Tax description', 'Zero-rated · international transport', 0, 1, 0],
              ],
            ],
          ],
          tables: [
            [
              'Customer-specific rates · 4',
              ['Charge code', 'Charge name', 'Rate', 'Currency'],
              [
                ['OFT', 'Ocean Freight', '1,380.00', 'USD'],
                ['BAF', 'Bunker Adjustment Factor', '300.00', 'USD'],
                ['LSS', 'Low Sulphur Surcharge', '60.00', 'USD'],
                ['DOC', 'Documentation Fee', '65.00', 'SGD'],
              ],
              [0, 2, 3],
              'charge-master-d.html',
              'ChargeMasterD',
            ],
          ],
          railTitle: 'Version history · 1',
          railNote: '',
          rail: [['v1 · Pending approval', 'Contract created · sent for approval', 'Daniel Tan · 6 Nov 2026 17:45', 1]],
          comb: true,
        },
        {
          id: 'k4',
          code: 'CT-26-00031',
          title: 'Meridian Agro Exports (CN)',
          group: 'Meridian Agro Exports (CN)',
          st: 'Approved',
          search: 'CT-26-00031 CN-400129 Meridian Agro Exports (CN) Intra-Asia · CN–SG',
          sub: 'CN-400129 · Intra-Asia · CN–SG · Version v4',
          chips: [['In force', 'background:var(--okbg);color:var(--ok)']],
          alert: '',
          facts: [
            ['Validity', '1 Feb 2026 – 31 Jan 2027', 0],
            ['Trade lane', 'Intra-Asia · CN–SG', 0],
            ['Payment terms', 'Net 45 days', 0],
            ['Tax', 'Taxable · CN-VAT-6', 0],
            ['Admin fee', 'Not applied', 0],
            ['Rates', '4', 1],
          ],
          sections: [
            [
              'Contract details',
              [
                ['Contract no.', 'CT-26-00031', 1, 0, 0],
                ['Customer code', 'CN-400129', 1, 0, 0],
                ['Customer', 'Meridian Agro Exports (CN)', 0, 1, 0],
                ['Trade lane', 'Intra-Asia · CN–SG', 0, 0, 0],
                ['Validity', '1 Feb 2026 – 31 Jan 2027', 0, 0, 0],
                ['Payment terms', 'Net 45 days', 0, 0, 0],
                ['Version', 'v4', 1, 0, 0],
              ],
            ],
            [
              'Admin fee',
              [
                ['Admin fee', 'Not applied', 0, 0, 0],
                ['Reason', 'Not required for PIL China', 0, 1, 0],
                ['Applies to', 'DD invoices', 0, 0, 0],
              ],
            ],
            [
              'Tax set-up',
              [
                ['Tax applicability', 'Taxable', 0, 0, 0],
                ['Tax code', 'CN-VAT-6', 1, 0, 0],
                ['Tax description', 'China VAT 6%', 0, 1, 0],
              ],
            ],
          ],
          tables: [
            [
              'Customer-specific rates · 4',
              ['Charge code', 'Charge name', 'Rate', 'Currency'],
              [
                ['OFT', 'Ocean Freight', '680.00', 'USD'],
                ['BAF', 'Bunker Adjustment Factor', '205.00', 'USD'],
                ['BLF', 'Bill of Lading Fee', '450.00', 'CNY'],
                ['DEM', 'Demurrage', '600.00', 'CNY'],
              ],
              [0, 2, 3],
              'charge-master-d.html',
              'ChargeMasterD',
            ],
          ],
          railTitle: 'Version history · 4',
          railNote: '',
          rail: [
            ['v4 · Approved', 'Validity extended to 31 Jan 2027', 'Li Na · 30 Sep 2026 10:10', 1],
            ['v3 · Approved', 'OFT rate 700 → 680 USD', 'Li Na · 12 Jul 2026 12:00', 0],
            ['v2 · Approved', 'DEM rate added', 'Li Na · 3 Apr 2026 09:15', 0],
            ['v1 · Approved', 'Contract created', 'Li Na · 20 Jan 2026 16:30', 0],
          ],
          comb: true,
        },
        {
          id: 'k5',
          code: 'CT-25-00088',
          title: 'Andaman Bay Traders (TH)',
          group: 'Andaman Bay Traders (TH)',
          st: 'Approved',
          search: 'CT-25-00088 TH-500318 Andaman Bay Traders (TH) Intra-Asia · TH–IN',
          sub: 'TH-500318 · Intra-Asia · TH–IN · Version v2',
          chips: [['Expired', 'background:var(--neutral);color:var(--muted2)']],
          alert: '',
          facts: [
            ['Validity', '1 Jul 2025 – 30 Jun 2026', 0],
            ['Trade lane', 'Intra-Asia · TH–IN', 0],
            ['Payment terms', 'Cash · pay before invoice', 0],
            ['Tax', 'Taxable · TH-VAT-7', 0],
            ['Admin fee', 'THB 500.00 per DD invoice', 0],
            ['Rates', '3', 1],
          ],
          sections: [
            [
              'Contract details',
              [
                ['Contract no.', 'CT-25-00088', 1, 0, 0],
                ['Customer code', 'TH-500318', 1, 0, 0],
                ['Customer', 'Andaman Bay Traders (TH)', 0, 1, 0],
                ['Trade lane', 'Intra-Asia · TH–IN', 0, 0, 0],
                ['Validity', '1 Jul 2025 – 30 Jun 2026', 0, 0, 0],
                ['Payment terms', 'Cash · pay before invoice', 0, 0, 0],
                ['Version', 'v2', 1, 0, 0],
              ],
            ],
            [
              'Admin fee',
              [
                ['Admin fee', 'Applied', 0, 0, 0],
                ['Amount', 'THB 500.00', 1, 0, 0],
                ['Applies to', 'DD invoices', 0, 0, 0],
                ['Charged', 'Per invoice · automatically', 0, 0, 0],
                ['Required by', 'PIL Thailand', 0, 0, 0],
              ],
            ],
            [
              'Tax set-up',
              [
                ['Tax applicability', 'Taxable', 0, 0, 0],
                ['Tax code', 'TH-VAT-7', 1, 0, 0],
                ['Tax description', 'Thailand VAT 7%', 0, 1, 0],
              ],
            ],
          ],
          tables: [
            [
              'Customer-specific rates · 3',
              ['Charge code', 'Charge name', 'Rate', 'Currency'],
              [
                ['OFT', 'Ocean Freight', '640.00', 'USD'],
                ['THC-O', 'Terminal Handling · Origin', '3,200.00', 'THB'],
                ['SEAL', 'Seal Fee', '350.00', 'THB'],
              ],
              [0, 2, 3],
              'charge-master-d.html',
              'ChargeMasterD',
            ],
          ],
          railTitle: 'Version history · 2',
          railNote: '',
          rail: [
            ['v2 · Approved', 'Admin fee added · THB 500 per DD invoice', 'Somchai P. · 5 Nov 2025 11:00', 1],
            ['v1 · Approved', 'Contract created', 'Somchai P. · 20 Jun 2025 10:00', 0],
          ],
          comb: false,
        },
        {
          id: 'k6',
          code: 'CT-26-00044',
          title: 'Kinabalu Home Furnishings (SG)',
          group: 'Kinabalu Home Furnishings (SG)',
          st: 'Draft',
          search: 'CT-26-00044 SG-101066 Kinabalu Home Furnishings (SG) Asia–East Africa',
          sub: 'SG-101066 · Asia–East Africa · Version v1',
          chips: [['Upcoming', 'background:var(--tint);color:var(--accent2)']],
          alert: '',
          facts: [
            ['Validity', '1 Jan 2027 – 31 Dec 2027', 0],
            ['Trade lane', 'Asia–East Africa', 0],
            ['Payment terms', 'Net 30 days', 0],
            ['Tax', 'Zero-rated · ZR-INTL', 0],
            ['Admin fee', 'SGD 25.00 per DD invoice', 0],
            ['Rates', '4', 1],
          ],
          sections: [
            [
              'Contract details',
              [
                ['Contract no.', 'CT-26-00044', 1, 0, 0],
                ['Customer code', 'SG-101066', 1, 0, 0],
                ['Customer', 'Kinabalu Home Furnishings (SG)', 0, 1, 0],
                ['Trade lane', 'Asia–East Africa', 0, 0, 0],
                ['Validity', '1 Jan 2027 – 31 Dec 2027', 0, 0, 0],
                ['Payment terms', 'Net 30 days', 0, 0, 0],
                ['Version', 'v1', 1, 0, 0],
              ],
            ],
            [
              'Admin fee',
              [
                ['Admin fee', 'Applied', 0, 0, 0],
                ['Amount', 'SGD 25.00', 1, 0, 0],
                ['Applies to', 'DD invoices', 0, 0, 0],
                ['Charged', 'Per invoice · automatically', 0, 0, 0],
                ['Required by', 'PIL Singapore', 0, 0, 0],
              ],
            ],
            [
              'Tax set-up',
              [
                ['Tax applicability', 'Zero-rated', 0, 0, 0],
                ['Tax code', 'ZR-INTL', 1, 0, 0],
                ['Tax description', 'Zero-rated · international transport', 0, 1, 0],
              ],
            ],
          ],
          tables: [
            [
              'Customer-specific rates · 4',
              ['Charge code', 'Charge name', 'Rate', 'Currency'],
              [
                ['OFT', 'Ocean Freight', '1,650.00', 'USD'],
                ['BAF', 'Bunker Adjustment Factor', '340.00', 'USD'],
                ['THC-O', 'Terminal Handling · Origin', '210.00', 'SGD'],
                ['DOC', 'Documentation Fee', '65.00', 'SGD'],
              ],
              [0, 2, 3],
              'charge-master-d.html',
              'ChargeMasterD',
            ],
          ],
          railTitle: 'Version history · 1',
          railNote: '',
          rail: [['v1 · Draft', 'Draft created', 'Daniel Tan · 10 Nov 2026 15:05', 1]],
          comb: false,
        },
        {
          id: 'k7',
          code: 'CT-26-00052',
          title: 'Kinabalu Home Furnishings (MY)',
          group: 'Kinabalu Home Furnishings (MY)',
          st: 'Pending approval',
          search: 'CT-26-00052 MY-200903 Kinabalu Home Furnishings (MY) Intra-Asia · MY–IN',
          sub: 'MY-200903 · Intra-Asia · MY–IN · Version v3',
          chips: [['In force', 'background:var(--okbg);color:var(--ok)']],
          alert: '',
          facts: [
            ['Validity', '1 Apr 2026 – 31 Mar 2027', 0],
            ['Trade lane', 'Intra-Asia · MY–IN', 0],
            ['Payment terms', 'Net 30 days', 0],
            ['Tax', 'Taxable · MY-SST-8', 0],
            ['Admin fee', 'MYR 80.00 per DD invoice', 0],
            ['Rates', '4', 1],
          ],
          sections: [
            [
              'Contract details',
              [
                ['Contract no.', 'CT-26-00052', 1, 0, 0],
                ['Customer code', 'MY-200903', 1, 0, 0],
                ['Customer', 'Kinabalu Home Furnishings (MY)', 0, 1, 0],
                ['Trade lane', 'Intra-Asia · MY–IN', 0, 0, 0],
                ['Validity', '1 Apr 2026 – 31 Mar 2027', 0, 0, 0],
                ['Payment terms', 'Net 30 days', 0, 0, 0],
                ['Version', 'v3', 1, 0, 0],
              ],
            ],
            [
              'Admin fee',
              [
                ['Admin fee', 'Applied', 0, 0, 0],
                ['Amount', 'MYR 80.00', 1, 0, 0],
                ['Applies to', 'DD invoices', 0, 0, 0],
                ['Charged', 'Per invoice · automatically', 0, 0, 0],
                ['Required by', 'PIL Malaysia', 0, 0, 0],
              ],
            ],
            [
              'Tax set-up',
              [
                ['Tax applicability', 'Taxable', 0, 0, 0],
                ['Tax code', 'MY-SST-8', 1, 0, 0],
                ['Tax description', 'Malaysia SST 8%', 0, 1, 0],
              ],
            ],
          ],
          tables: [
            [
              'Customer-specific rates · 4',
              ['Charge code', 'Charge name', 'Rate', 'Currency'],
              [
                ['OFT', 'Ocean Freight', '760.00', 'USD'],
                ['BAF', 'Bunker Adjustment Factor', '215.00', 'USD'],
                ['THC-O', 'Terminal Handling · Origin', '650.00', 'MYR'],
                ['DET', 'Detention', '150.00', 'MYR'],
              ],
              [0, 2, 3],
              'charge-master-d.html',
              'ChargeMasterD',
            ],
          ],
          railTitle: 'Version history · 3',
          railNote: '',
          rail: [
            ['v3 · Pending approval', 'OFT rate 740 → 760 USD', 'Aisyah Rahman · 8 Nov 2026 10:20', 1],
            ['v2 · Approved', 'DET rate added', 'Aisyah Rahman · 14 Jul 2026 13:45', 0],
            ['v1 · Approved', 'Contract created', 'Aisyah Rahman · 20 Mar 2026 09:00', 0],
          ],
          comb: false,
        },
        {
          id: 'k8',
          code: 'CT-26-00060',
          title: 'Orchid Lane Polymers (IN)',
          group: 'Orchid Lane Polymers (IN)',
          st: 'Rejected',
          search: 'CT-26-00060 IN-300781 Orchid Lane Polymers (IN) Asia–West Africa',
          sub: 'IN-300781 · Asia–West Africa · Version v1',
          chips: [['In force', 'background:var(--okbg);color:var(--ok)']],
          alert: '',
          facts: [
            ['Validity', '1 Oct 2026 – 30 Sep 2027', 0],
            ['Trade lane', 'Asia–West Africa', 0],
            ['Payment terms', 'Net 15 days', 0],
            ['Tax', 'Taxable · IN-GST-18', 0],
            ['Admin fee', 'INR 1,500.00 per DD invoice', 0],
            ['Rates', '4', 1],
          ],
          sections: [
            [
              'Contract details',
              [
                ['Contract no.', 'CT-26-00060', 1, 0, 0],
                ['Customer code', 'IN-300781', 1, 0, 0],
                ['Customer', 'Orchid Lane Polymers (IN)', 0, 1, 0],
                ['Trade lane', 'Asia–West Africa', 0, 0, 0],
                ['Validity', '1 Oct 2026 – 30 Sep 2027', 0, 0, 0],
                ['Payment terms', 'Net 15 days', 0, 0, 0],
                ['Version', 'v1', 1, 0, 0],
              ],
            ],
            [
              'Admin fee',
              [
                ['Admin fee', 'Applied', 0, 0, 0],
                ['Amount', 'INR 1,500.00', 1, 0, 0],
                ['Applies to', 'DD invoices', 0, 0, 0],
                ['Charged', 'Per invoice · automatically', 0, 0, 0],
                ['Required by', 'PIL India', 0, 0, 0],
              ],
            ],
            [
              'Tax set-up',
              [
                ['Tax applicability', 'Taxable', 0, 0, 0],
                ['Tax code', 'IN-GST-18', 1, 0, 0],
                ['Tax description', 'India GST 18%', 0, 1, 0],
              ],
            ],
          ],
          tables: [
            [
              'Customer-specific rates · 4',
              ['Charge code', 'Charge name', 'Rate', 'Currency'],
              [
                ['OFT', 'Ocean Freight', '1,720.00', 'USD'],
                ['BAF', 'Bunker Adjustment Factor', '350.00', 'USD'],
                ['THC-D', 'Terminal Handling · Destination', '9,500.00', 'INR'],
                ['DET', 'Detention', '4,000.00', 'INR'],
              ],
              [0, 2, 3],
              'charge-master-d.html',
              'ChargeMasterD',
            ],
          ],
          railTitle: 'Version history · 1',
          railNote: '',
          rail: [['v1 · Rejected', 'Rejected · returned for revision', 'Priya Nair · 28 Sep 2026 18:10', 1]],
          comb: false,
        },
      ],
      smap: {
        Approved: ['background:var(--okbg);color:var(--ok)', 'var(--okbar)'],
        'Pending approval': ['background:var(--warnbg);color:var(--warn)', 'var(--warnbar)'],
        Draft: ['background:var(--neutral);color:var(--muted2)', 'var(--muted4)'],
        Rejected: ['background:var(--badbg);color:var(--bad)', 'var(--badbar)'],
      },
      segLabels: { 'Pending approval': 'Pending' },
      groupLabel: 'Customer',
      nouns: 'contracts',
    };
    const q = (s.q || '').trim().toLowerCase();
    const list = D.recs.filter(
      (r) => (!q || (r.code + ' ' + r.title + ' ' + r.search).toLowerCase().indexOf(q) >= 0) && (!s.fs || r.st === s.fs),
    );
    const stOf = (st) => D.smap[st] || ['background:var(--neutral);color:var(--muted2)', 'var(--muted4)'];
    const segs = [['', 'All']].concat(Object.keys(D.smap).map((k) => [k, D.segLabels[k] || k])).map(([k, label]) => {
      const on = (s.fs || '') === k;
      return {
        label,
        on: on ? 'true' : 'false',
        bg: on ? 'var(--surface)' : 'transparent',
        fg: on ? 'var(--accent)' : 'var(--muted)',
        sh: on ? '0 1px 2px rgba(22,26,33,.12)' : 'none',
        pick: () => this.setState({ fs: k }),
      };
    });
    const gids = D.recs.map((x) => x.group).filter((v, i, a) => a.indexOf(v) === i);
    const ordered = gids.reduce((a, g) => a.concat(list.filter((x) => x.group === g)), []);
    const r =
      (s.selCode && !s.selDone && D.recs.find((x) => x.code === s.selCode)) ||
      ordered.find((x) => x.id === s.sel) ||
      ordered[0] ||
      D.recs[0];
    if (s.selCode && !s.selDone && r) {
      const id = r.id;
      setTimeout(() => this.setState({ sel: id, selDone: true }), 0);
    }
    const openM = s.open || { [r.group]: true };
    const groups = gids
      .map((g) => {
        const L = list.filter((x) => x.group === g);
        const open = !!q || !!s.fs || !!openM[g];
        return {
          name: g,
          n: String(L.length),
          hide: !L.length,
          open,
          ax: open ? 'true' : 'false',
          rot: open ? '90deg' : '0deg',
          tg: () => this.setState({ open: Object.assign({}, openM, { [g]: !openM[g] }) }),
          rows: L.map((x) => {
            const on = x.id === r.id;
            return {
              code: x.code,
              title: x.title,
              st: x.st,
              dot: stOf(x.st)[1],
              on: on ? 'true' : 'false',
              sel: on ? 'background:var(--tint);color:var(--accent2);box-shadow:inset 3px 0 0 var(--accent)' : '',
              pick: () => this.setState({ sel: x.id, open: Object.assign({}, openM, { [g]: true }) }),
            };
          }),
        };
      })
      .filter((g) => !g.hide);
    const i = ordered.findIndex((x) => x.id === r.id);
    const go = (n) => {
      const x = ordered[n];
      this.setState({ sel: x.id, open: Object.assign({}, openM, { [x.group]: true }) });
    };
    const MONO = 'font-family:var(--mono,ui-monospace,monospace)';
    const RAIL = r.railTitle.indexOf('Customer group') === 0;
    const KVS = (kv) =>
      kv.map(([l, v, m, w, mu]) => ({ l, v, cls: w ? 'w' : '', st: (m ? MONO : '') + (mu ? ';color:var(--muted4)' : '') }));
    const ALL = [];
    r.sections.forEach(([t, kv], k) =>
      ALL.push({
        id: 's' + k,
        t,
        n: '',
        sum: kv
          .slice(0, 3)
          .map((x) => x[1])
          .join(' · '),
        isKv: true,
        kv: KVS(kv),
      }),
    );
    const SC = {
      Active: 'background:var(--okbg);color:var(--ok)',
      Approved: 'background:var(--okbg);color:var(--ok)',
      'Not listed': 'background:var(--okbg);color:var(--ok)',
      'In force': 'background:var(--okbg);color:var(--ok)',
      Inactive: 'background:var(--neutral);color:var(--muted2)',
      Draft: 'background:var(--neutral);color:var(--muted2)',
      Expired: 'background:var(--neutral);color:var(--muted2)',
      'Pending approval': 'background:var(--warnbg);color:var(--warn)',
      Rejected: 'background:var(--badbg);color:var(--bad)',
      Sanctioned: 'background:var(--badbg);color:var(--bad)',
      Blacklisted: 'background:var(--badbg);color:var(--bad)',
    };
    const STH = ['Status', 'Approval', 'Sanction / Blacklist'];
    const NARROW = ['Rate', 'Currency', 'Type', 'O / D', 'Default', 'Terminals / depots', 'UN/LOCODE', 'Status', 'Approval', 'Rate type'];
    const colW = (v, j) =>
      j === 0
        ? '180px'
        : NARROW.indexOf(v) >= 0
          ? v === 'Terminals / depots' || v === 'Rate type' || v === 'UN/LOCODE'
            ? '170px'
            : '140px'
          : 'auto';
    const OFF = ['Inactive', 'Expired', 'Rejected', 'Draft'];
    const rowOff = (hd, row) => hd.some((h, j) => STH.indexOf(h) >= 0 && OFF.indexOf(row[j]) >= 0);
    const sortRows = (hd, rows) =>
      rows
        .map((x, i) => [x, i])
        .sort((a, b) => rowOff(hd, a[0]) - rowOff(hd, b[0]) || a[1] - b[1])
        .map((x) => x[0]);
    r.tables.forEach(([t, hd, rows, mono, link, lkey], k) => {
      const p = t.split(' · ');
      const cnt = /^\d+$/.test(p[p.length - 1]) ? p.pop() : '';
      ALL.push({
        id: 't' + k,
        t: p.join(' · '),
        n: cnt,
        sum: rows.length
          ? rows
              .slice(0, 3)
              .map((x) => x[0])
              .join(', ') + (rows.length > 3 ? ' +' + (rows.length - 3) : '')
          : 'None',
        isTbl: true,
        empty: rows.length === 0,
        h: hd.map((v, j) => ({ v, st: 'width:' + (100 / hd.length).toFixed(3) + '%' })),
        rows: sortRows(hd, rows).map((row) => {
          const off = rowOff(hd, row);
          return {
            rs: off ? 'color:var(--muted4)' : '',
            cells: row.map((v, j) => {
              const isSt = STH.indexOf(hd[j]) >= 0 && SC[v];
              const isLink = j === 0 && !!link && v !== '—';
              return {
                v,
                isChip: !!isSt,
                chip: isSt ? SC[v] : '',
                isLink,
                isText: !isSt && !isLink,
                href: isLink ? link : '',
                go: () => {
                  try {
                    localStorage.setItem('girs.dsel', JSON.stringify({ p: lkey, c: v }));
                  } catch (e) {}
                },
                cls: mono.indexOf(j) >= 0 ? 'mono' : '',
                st:
                  (j === 0 && !isLink ? 'font-weight:500;' : '') +
                  (v === '—' || v === 'Not mapped' ? 'color:var(--muted4)' : v === 'Default' ? 'color:var(--accent2);font-weight:600' : ''),
              };
            }),
          };
        }),
      });
    });
    const op = s.op || { s0: true, s1: true };
    const allOpen = ALL.every((x) => op[x.id]);
    const secs = ALL.map((x) =>
      Object.assign(
        { isKv: false, isTbl: false, isTl: false, kv: [], h: [], rows: [], empty: false, tl: [], note: '', hasNote: false },
        x,
        {
          hasN: !!x.n,
          open: !!op[x.id],
          ax: op[x.id] ? 'true' : 'false',
          rot: op[x.id] ? '90deg' : '0deg',
          tg: () => this.setState({ op: Object.assign({}, op, { [x.id]: !op[x.id] }) }),
        },
      ),
    );
    const sc = stOf(r.st);
    return {
      q: s.q,
      onQ: (e) => this.setState({ q: e.target.value }),
      segs,
      groups,
      empty: list.length === 0,
      gLabel: D.groupLabel,
      gCount: groups.length + ' · ' + D.groupLabel.toLowerCase(),
      countText: list.length + ' of ' + D.recs.length + ' ' + D.nouns,
      h: {
        code: r.code,
        title: r.title,
        st: r.st,
        chip: sc[0],
        sub: r.sub,
        chips: r.chips.map(([t, st]) => ({ t, s: st })),
        hasAlert: !!r.alert,
        alert: r.alert,
        facts: r.facts.map(([l, v, m]) => ({ l, v, st: m ? MONO : '' })),
        railTitle: r.railTitle,
        hasRail: RAIL,
        railNote: r.railNote,
        hasNote: !!r.railNote,
        rail: r.rail.map(([a, b, c, cur]) => ({ a, b, c, cls: cur ? 'tl cur' : 'tl', fg: cur ? 'var(--accent2)' : 'var(--ink)' })),
      },
      secs,
      railCols: RAIL ? 'minmax(0, 1fr) 340px' : 'minmax(0, 1fr)',
      allL: allOpen ? 'Collapse all' : 'Expand all',
      allT: () => {
        const n = {};
        ALL.forEach((x) => {
          n[x.id] = !allOpen;
        });
        this.setState({ op: n });
      },
      pos: i >= 0 ? i + 1 + ' of ' + ordered.length : '',
      noPrev: i <= 0,
      noNext: i < 0 || i >= ordered.length - 1,
      prev: () => {
        if (i > 0) go(i - 1);
      },
      next: () => {
        if (i >= 0 && i < ordered.length - 1) go(i + 1);
      },
    };
  }
}

export class ContractMasterLayoutDModel extends GirsPage {
  renderVals() {
    const v = super.renderVals();
    return { ...v, kit: KIT_VALS(this, this.state, v, KIT_M, undefined) };
  }
}
