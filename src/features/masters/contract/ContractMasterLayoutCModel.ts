// @ts-nocheck — screen logic ported from the GIRS prototype; types are added as the screen is reworked.
/* Contract master, layout C — view-model. */
import { ViewModel } from '../../../lib/viewModel';
import { KIT_VALS } from '../kit';
import { KIT_M } from './contractData';

export class GirsPage extends ViewModel {
  constructor(p) {
    super(p);
    this.state = { q: '', fSt: '', fLane: '', fVal: '', sel: 'k1', tab: 'rates', open: { 'SG-100231': true } };
  }
  renderVals() {
    const s = this.state;
    const TODAY = '2026-11-11';
    const CUS = {
      'SG-100231': 'Straits Harbour Logistics (SG)',
      'MY-200417': 'Straits Harbour Logistics (MY)',
      'SG-100874': 'Meridian Agro Exports (SG)',
      'CN-400129': 'Meridian Agro Exports (CN)',
      'TH-500318': 'Andaman Bay Traders (TH)',
      'SG-101066': 'Kinabalu Home Furnishings (SG)',
      'MY-200903': 'Kinabalu Home Furnishings (MY)',
      'IN-300781': 'Orchid Lane Polymers (IN)',
    };
    const CHN = {
      OFT: 'Ocean Freight',
      BAF: 'Bunker Adjustment Factor',
      LSS: 'Low Sulphur Surcharge',
      'THC-O': 'Terminal Handling · Origin',
      'THC-D': 'Terminal Handling · Destination',
      DOC: 'Documentation Fee',
      BLF: 'Bill of Lading Fee',
      SEAL: 'Seal Fee',
      DEM: 'Demurrage',
      DET: 'Detention',
    };
    const TAXD = {
      'ZR-INTL': 'Zero-rated · international transport',
      'SG-SR-9': 'Singapore GST 9%',
      'MY-SST-8': 'Malaysia SST 8%',
      'IN-GST-18': 'India GST 18%',
      'CN-VAT-6': 'China VAT 6%',
      'TH-VAT-7': 'Thailand VAT 7%',
    };
    const R = (c, r, y) => ({ code: c, name: CHN[c], rate: r, ccy: y });
    const V = (n, st, what, by, at) => ({ n, st, what, by, at });
    const mkC = (id, no, cus, from, to, lane, terms, tax, taxCode, adm, ver, st, rates, vers) => ({
      id,
      no,
      cus,
      cusName: CUS[cus],
      from,
      to,
      lane,
      terms,
      tax,
      taxCode,
      adm,
      ver,
      st,
      rates,
      vers,
    });
    const K = [
      mkC(
        'k1',
        'CT-26-00012',
        'SG-100231',
        '2026-01-01',
        '2026-12-31',
        'Intra-Asia · SG–IN',
        'Net 30 days',
        'Taxable',
        'SG-SR-9',
        { on: true, amt: 25, ccy: 'SGD', ent: 'PIL Singapore' },
        3,
        'Approved',
        [
          R('OFT', 850, 'USD'),
          R('BAF', 220, 'USD'),
          R('LSS', 45, 'USD'),
          R('THC-O', 210, 'SGD'),
          R('DOC', 65, 'SGD'),
          R('DEM', 95, 'SGD'),
          R('DET', 60, 'SGD'),
        ],
        [
          V(3, 'Approved', 'BAF rate 240 → 220 USD', 'Wei Ling Tan', '2 Jun 2026 11:05'),
          V(2, 'Approved', 'Admin fee added · SGD 25 per DD invoice', 'Wei Ling Tan', '14 Mar 2026 16:40'),
          V(1, 'Approved', 'Contract created', 'Daniel Tan', '18 Dec 2025 10:12'),
        ],
      ),
      mkC(
        'k2',
        'CT-26-00019',
        'MY-200417',
        '2026-01-01',
        '2026-12-31',
        'Intra-Asia · MY–CN',
        'Net 30 days',
        'Taxable',
        'MY-SST-8',
        { on: true, amt: 80, ccy: 'MYR', ent: 'PIL Malaysia' },
        2,
        'Approved',
        [R('OFT', 720, 'USD'), R('BAF', 210, 'USD'), R('THC-O', 650, 'MYR'), R('DOC', 180, 'MYR'), R('DET', 150, 'MYR')],
        [
          V(2, 'Approved', 'THC-O rate 620 → 650 MYR', 'Aisyah Rahman', '20 Apr 2026 09:30'),
          V(1, 'Approved', 'Contract created', 'Aisyah Rahman', '22 Dec 2025 14:00'),
        ],
      ),
      mkC(
        'k9',
        'CT-26-00065',
        'SG-100231',
        '2026-07-01',
        '2027-06-30',
        'Asia–Middle East',
        'Net 30 days',
        'Zero-rated',
        'ZR-INTL',
        { on: true, amt: 25, ccy: 'SGD', ent: 'PIL Singapore' },
        1,
        'Approved',
        [R('OFT', 1450, 'USD'), R('BAF', 310, 'USD'), R('LSS', 60, 'USD'), R('THC-O', 210, 'SGD')],
        [V(1, 'Approved', 'Contract created', 'Daniel Tan', '12 Jun 2026 15:20')],
      ),
      mkC(
        'k3',
        'CT-26-00027',
        'SG-100874',
        '2026-12-01',
        '2027-11-30',
        'Asia–Middle East',
        'Net 45 days',
        'Zero-rated',
        'ZR-INTL',
        { on: false, ent: 'PIL Singapore' },
        1,
        'Pending approval',
        [R('OFT', 1380, 'USD'), R('BAF', 300, 'USD'), R('LSS', 60, 'USD'), R('DOC', 65, 'SGD')],
        [V(1, 'Pending approval', 'Contract created · sent for approval', 'Daniel Tan', '6 Nov 2026 17:45')],
      ),
      mkC(
        'k4',
        'CT-26-00031',
        'CN-400129',
        '2026-02-01',
        '2027-01-31',
        'Intra-Asia · CN–SG',
        'Net 45 days',
        'Taxable',
        'CN-VAT-6',
        { on: false, ent: 'PIL China' },
        4,
        'Approved',
        [R('OFT', 680, 'USD'), R('BAF', 205, 'USD'), R('BLF', 450, 'CNY'), R('DEM', 600, 'CNY')],
        [
          V(4, 'Approved', 'Validity extended to 31 Jan 2027', 'Li Na', '30 Sep 2026 10:10'),
          V(3, 'Approved', 'OFT rate 700 → 680 USD', 'Li Na', '12 Jul 2026 12:00'),
          V(2, 'Approved', 'DEM rate added', 'Li Na', '3 Apr 2026 09:15'),
          V(1, 'Approved', 'Contract created', 'Li Na', '20 Jan 2026 16:30'),
        ],
      ),
      mkC(
        'k5',
        'CT-25-00088',
        'TH-500318',
        '2025-07-01',
        '2026-06-30',
        'Intra-Asia · TH–IN',
        'Cash · pay before invoice',
        'Taxable',
        'TH-VAT-7',
        { on: true, amt: 500, ccy: 'THB', ent: 'PIL Thailand' },
        2,
        'Approved',
        [R('OFT', 640, 'USD'), R('THC-O', 3200, 'THB'), R('SEAL', 350, 'THB')],
        [
          V(2, 'Approved', 'Admin fee added · THB 500 per DD invoice', 'Somchai P.', '5 Nov 2025 11:00'),
          V(1, 'Approved', 'Contract created', 'Somchai P.', '20 Jun 2025 10:00'),
        ],
      ),
      mkC(
        'k6',
        'CT-26-00044',
        'SG-101066',
        '2027-01-01',
        '2027-12-31',
        'Asia–East Africa',
        'Net 30 days',
        'Zero-rated',
        'ZR-INTL',
        { on: true, amt: 25, ccy: 'SGD', ent: 'PIL Singapore' },
        1,
        'Draft',
        [R('OFT', 1650, 'USD'), R('BAF', 340, 'USD'), R('THC-O', 210, 'SGD'), R('DOC', 65, 'SGD')],
        [V(1, 'Draft', 'Draft created', 'Daniel Tan', '10 Nov 2026 15:05')],
      ),
      mkC(
        'k7',
        'CT-26-00052',
        'MY-200903',
        '2026-04-01',
        '2027-03-31',
        'Intra-Asia · MY–IN',
        'Net 30 days',
        'Taxable',
        'MY-SST-8',
        { on: true, amt: 80, ccy: 'MYR', ent: 'PIL Malaysia' },
        3,
        'Pending approval',
        [R('OFT', 760, 'USD'), R('BAF', 215, 'USD'), R('THC-O', 650, 'MYR'), R('DET', 150, 'MYR')],
        [
          V(3, 'Pending approval', 'OFT rate 740 → 760 USD', 'Aisyah Rahman', '8 Nov 2026 10:20'),
          V(2, 'Approved', 'DET rate added', 'Aisyah Rahman', '14 Jul 2026 13:45'),
          V(1, 'Approved', 'Contract created', 'Aisyah Rahman', '20 Mar 2026 09:00'),
        ],
      ),
      mkC(
        'k8',
        'CT-26-00060',
        'IN-300781',
        '2026-10-01',
        '2027-09-30',
        'Asia–West Africa',
        'Net 15 days',
        'Taxable',
        'IN-GST-18',
        { on: true, amt: 1500, ccy: 'INR', ent: 'PIL India' },
        1,
        'Rejected',
        [R('OFT', 1720, 'USD'), R('BAF', 350, 'USD'), R('THC-D', 9500, 'INR'), R('DET', 4000, 'INR')],
        [V(1, 'Rejected', 'Rejected · returned for revision', 'Priya Nair', '28 Sep 2026 18:10')],
      ),
    ];
    const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fd = (iso) => {
      const p = iso.split('-');
      return +p[2] + ' ' + M[+p[1] - 1] + ' ' + p[0];
    };
    const valid = (c) => fd(c.from) + ' – ' + fd(c.to);
    const vstate = (c) =>
      c.to < TODAY
        ? { t: 'Expired', chip: 'background:var(--neutral);color:var(--muted2)' }
        : c.from > TODAY
          ? { t: 'Upcoming', chip: 'background:var(--tint);color:var(--accent2)' }
          : { t: 'In force', chip: 'background:var(--okbg);color:var(--ok)' };
    const AP = {
      Approved: { chip: 'background:var(--okbg);color:var(--ok)', dot: 'var(--okbar)' },
      'Pending approval': { chip: 'background:var(--warnbg);color:var(--warn)', dot: 'var(--warnbar)' },
      Draft: { chip: 'background:var(--neutral);color:var(--muted2)', dot: 'var(--muted4)' },
      Rejected: { chip: 'background:var(--badbg);color:var(--bad)', dot: 'var(--badbar)' },
    };
    const STATUSES = ['Approved', 'Pending approval', 'Draft', 'Rejected'];
    const num = (v) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const admTxt = (c) => (c.adm.on ? c.adm.ccy + ' ' + num(c.adm.amt) + ' per DD invoice' : 'Not applied');
    const taxTxt = (c) => c.tax + ' · ' + c.taxCode;
    const rateRows = (c) => c.rates.map((r) => ({ code: r.code, name: r.name, rate: num(r.rate), ccy: r.ccy }));
    const verRows = (c) =>
      c.vers.map((v) => ({ v: 'v' + v.n, what: v.what, by: v.by, at: v.at, st: v.st, chip: AP[v.st].chip, cur: v.n === c.ver }));
    const admKv = (c) =>
      c.adm.on
        ? [
            ['Admin fee', 'Applied'],
            ['Amount', c.adm.ccy + ' ' + num(c.adm.amt)],
            ['Applies to', 'DD invoices'],
            ['Charged', 'Per invoice · applied automatically'],
            ['Required by', c.adm.ent],
          ]
        : [
            ['Admin fee', 'Not applied'],
            ['Reason', 'Not required for ' + c.adm.ent],
            ['Applies to', 'DD invoices'],
          ];
    const taxKv = (c) => [
      ['Tax applicability', c.tax],
      ['Tax code', c.taxCode],
      ['Tax description', TAXD[c.taxCode]],
    ];
    const q = (s.q || '').trim().toLowerCase();
    const list = K.filter(
      (c) =>
        (!q || (c.no + ' ' + c.cus + ' ' + c.cusName + ' ' + c.lane).toLowerCase().indexOf(q) >= 0) &&
        (!s.fSt || c.st === s.fSt) &&
        (!s.fLane || c.lane === s.fLane) &&
        (!s.fVal || vstate(c).t === s.fVal),
    );
    const LANES = K.map((c) => c.lane)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort();
    const F = {
      q: s.q,
      fSt: s.fSt,
      fLane: s.fLane,
      fVal: s.fVal,
      laneOpts: LANES,
      onQ: (e) => this.setState({ q: e.target.value }),
      onSt: (e) => this.setState({ fSt: e.target.value }),
      onLane: (e) => this.setState({ fLane: e.target.value }),
      onVal: (e) => this.setState({ fVal: e.target.value }),
      filtered: !!(s.q || s.fSt || s.fLane || s.fVal),
      clear: () => this.setState({ q: '', fSt: '', fLane: '', fVal: '' }),
      empty: list.length === 0,
      countText: list.length + ' of ' + K.length + ' contracts',
    };
    const kvl = (a) => a.map(([l, v]) => ({ l, v }));
    const det = (c) =>
      kvl([
        ['Contract no.', c.no],
        ['Customer code', c.cus],
        ['Customer', c.cusName],
        ['Trade lane', c.lane],
        ['Validity', valid(c)],
        ['Payment terms', c.terms],
        ['Version', 'v' + c.ver],
        ['Approval status', c.st],
      ]);

    const segs = [
      ['', 'All'],
      ['Approved', 'Approved'],
      ['Pending approval', 'Pending'],
      ['Draft', 'Draft'],
      ['Rejected', 'Rejected'],
    ].map(([k, label]) => {
      const on = s.fSt === k;
      return {
        label,
        on: on ? 'true' : 'false',
        bg: on ? 'var(--surface)' : 'transparent',
        fg: on ? 'var(--accent)' : 'var(--muted)',
        sh: on ? '0 1px 2px rgba(22,26,33,.12)' : 'none',
        pick: () => this.setState({ fSt: k }),
      };
    });
    const codes = Object.keys(CUS);
    const groups = codes
      .map((cu) => {
        const L = list.filter((c) => c.cus === cu);
        const open = !!q || !!s.fSt || !!s.open[cu];
        return {
          code: cu,
          name: CUS[cu],
          n: String(L.length),
          hide: !L.length,
          open,
          ax: open ? 'true' : 'false',
          rot: open ? '90deg' : '0deg',
          tg: () => this.setState({ open: Object.assign({}, s.open, { [cu]: !s.open[cu] }) }),
          rows: L.map((c) => {
            const on = s.sel === c.id;
            return {
              no: c.no,
              lane: c.lane,
              ver: 'v' + c.ver,
              st: c.st,
              dot: AP[c.st].dot,
              on: on ? 'true' : 'false',
              sel: on ? 'background:var(--tint);color:var(--accent2);font-weight:500;box-shadow:inset 3px 0 0 var(--accent)' : '',
              pick: () => this.setState({ sel: c.id }),
            };
          }),
        };
      })
      .filter((g) => !g.hide);
    const c = list.find((x) => x.id === s.sel) || list[0] || K[0];
    const vs = vstate(c);
    const head = {
      no: c.no,
      cus: c.cus,
      cusName: c.cusName,
      lane: c.lane,
      valid: valid(c),
      vst: vs.t,
      vChip: vs.chip,
      terms: c.terms,
      tax: taxTxt(c),
      adm: admTxt(c),
      admFg: c.adm.on ? 'var(--ink)' : 'var(--muted4)',
      ver: 'v' + c.ver,
      st: c.st,
      stChip: AP[c.st].chip,
      nRates: String(c.rates.length),
      nVers: String(c.vers.length),
    };
    const T = [
      ['rates', 'Rates', String(c.rates.length)],
      ['fee', 'Admin fee & tax', ''],
      ['det', 'Contract details', ''],
    ];
    const tabs = T.map(([k, label, count]) => {
      const on = s.tab === k;
      return {
        label,
        count,
        on: on ? 'true' : 'false',
        fg: on ? 'var(--accent)' : 'var(--muted)',
        line: on ? 'var(--accent)' : 'transparent',
        pick: () => this.setState({ tab: k }),
      };
    });
    return Object.assign(F, {
      segs,
      groups,
      cusCount: groups.length,
      h: head,
      tabs,
      tRates: s.tab === 'rates',
      tFee: s.tab === 'fee',
      tVers: s.tab === 'vers',
      tDet: s.tab === 'det',
      rl: rateRows(c),
      vl: verRows(c),
      akv: kvl(admKv(c)),
      tkv: kvl(taxKv(c)),
      dkv: det(c),
    });
  }
}

export class ContractMasterLayoutCModel extends GirsPage {
  renderVals() {
    const v = super.renderVals();
    return { ...v, kit: KIT_VALS(this, this.state, v, KIT_M, undefined) };
  }
}
