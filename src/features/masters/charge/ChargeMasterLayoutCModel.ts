// @ts-nocheck — screen logic ported from the GIRS prototype; types are added as the screen is reworked.
/* Charge master, layout C — view-model. */
import { ViewModel } from '../../../lib/viewModel';
import { KIT_VALS } from '../kit';
import { KIT_M } from './chargeData';

export class GirsPage extends ViewModel {
  constructor(p) {
    super(p);
    this.state = { q: '', fCat: '', fApp: '', fCtry: '', fSt: 'all', sel: 'h4', tab: 'ov', open: { 'Origin local charges': true } };
  }
  renderVals() {
    const s = this.state;
    const A = (a, b, c) => ({ a, b, c });
    const sync = A('Created from LMS charge-code sync', 'System · LMS', '02 Jan 2026 06:00');
    const mk = (id, code, name, cat, app, ctry, port, tax, ccy, from, to, lms, active, extra, base) => ({
      id,
      code,
      name,
      cat,
      app,
      ctry,
      port,
      tax,
      ccy,
      from,
      to,
      lms,
      active,
      audit: (base || [sync]).concat(extra || []),
    });
    const H = [
      mk('h1', 'OFT', 'Ocean Freight', 'Freight', 'Both', 'ALL', 'ALL', 'ZR-INTL', 'USD', '2026-01-01', '', 'LMS-OFT', true),
      mk('h2', 'BAF', 'Bunker Adjustment Factor', 'Surcharge', 'Both', 'ALL', 'ALL', 'ZR-INTL', 'USD', '2026-01-01', '', 'LMS-BAF', true, [
        A('Effective from changed 1 Oct 2025 → 1 Jan 2026', 'Wei Ling Tan', '15 Dec 2025 10:12'),
      ]),
      mk('h3', 'LSS', 'Low Sulphur Surcharge', 'Surcharge', 'Both', 'ALL', 'ALL', 'ZR-INTL', 'USD', '2026-01-01', '', 'LMS-LSS', true),
      mk(
        'h4',
        'THC-O',
        'Terminal Handling · Origin',
        'Origin local charges',
        'Origin',
        'SG',
        'SGSIN',
        'SG-SR-9',
        'SGD',
        '2026-01-01',
        '',
        'LMS-THO',
        true,
        [A('Tax code changed SG-SR-8 → SG-SR-9', 'Wei Ling Tan', '20 Dec 2025 09:30')],
      ),
      mk(
        'h5',
        'THC-D',
        'Terminal Handling · Destination',
        'Destination local charges',
        'Destination',
        'IN',
        'INNSA',
        'IN-GST-18',
        'INR',
        '2026-01-01',
        '',
        'LMS-THD',
        true,
      ),
      mk(
        'h6',
        'DOC',
        'Documentation Fee',
        'Origin local charges',
        'Origin',
        'MY',
        'MYPKG',
        'MY-SST-8',
        'MYR',
        '2026-01-01',
        '',
        'LMS-DOC',
        true,
      ),
      mk(
        'h7',
        'BLF',
        'Bill of Lading Fee',
        'Origin local charges',
        'Origin',
        'CN',
        'CNSHA',
        'CN-VAT-6',
        'CNY',
        '2026-01-01',
        '',
        'LMS-BLF',
        true,
      ),
      mk('h8', 'SEAL', 'Seal Fee', 'Origin local charges', 'Origin', 'TH', 'THLCH', 'TH-VAT-7', 'THB', '2026-01-01', '', 'LMS-SEL', true),
      mk(
        'h9',
        'DEM',
        'Demurrage',
        'Demurrage & Detention',
        'Destination',
        'SG',
        'SGSIN',
        'SG-SR-9',
        'SGD',
        '2026-01-01',
        '',
        'LMS-DEM',
        true,
      ),
      mk('h10', 'DET', 'Detention', 'Demurrage & Detention', 'Both', 'IN', 'INNSA', 'IN-GST-18', 'INR', '2026-01-01', '', 'LMS-DET', true),
      mk(
        'h11',
        'CLN',
        'Container Cleaning Fee',
        'Ancillary (MISC)',
        'Destination',
        'SG',
        'SGSIN',
        'SG-SR-9',
        'SGD',
        '2026-03-01',
        '',
        '',
        true,
        [],
        [A('Created in GIRS', 'Wei Ling Tan', '24 Feb 2026 14:20')],
      ),
      mk(
        'h12',
        'AMD',
        'B/L Amendment Fee',
        'Ancillary (MISC)',
        'Both',
        'SG',
        'ALL',
        'SG-SR-9',
        'SGD',
        '2026-03-01',
        '',
        '',
        true,
        [],
        [A('Created in GIRS', 'Wei Ling Tan', '24 Feb 2026 14:26')],
      ),
      mk(
        'h13',
        'PSS',
        'Peak Season Surcharge',
        'Surcharge',
        'Origin',
        'CN',
        'CNSHA',
        'ZR-INTL',
        'USD',
        '2026-06-01',
        '2026-09-30',
        'LMS-PSS',
        false,
        [A('Deactivated · season ended', 'Wei Ling Tan', '1 Oct 2026 08:05')],
      ),
      mk(
        'h14',
        'EBS',
        'Emergency Bunker Surcharge',
        'Surcharge',
        'Both',
        'ALL',
        'ALL',
        'ZR-INTL',
        'USD',
        '2025-04-01',
        '2025-12-31',
        'LMS-EBS',
        false,
        [A('Deactivated', 'Wei Ling Tan', '2 Jan 2026 09:00')],
      ),
    ];
    const CN = { SG: 'Singapore', MY: 'Malaysia', IN: 'India', CN: 'China', TH: 'Thailand', ALL: 'All countries' };
    const PORTS = {
      SGSIN: ['SG', 'Singapore'],
      MYPKG: ['MY', 'Port Klang'],
      INNSA: ['IN', 'Nhava Sheva'],
      CNSHA: ['CN', 'Shanghai'],
      THLCH: ['TH', 'Laem Chabang'],
    };
    const TAX = {
      'ZR-INTL': 'Zero-rated · international transport',
      'SG-SR-9': 'Singapore GST 9%',
      'MY-SST-8': 'Malaysia SST 8%',
      'IN-GST-18': 'India GST 18%',
      'CN-VAT-6': 'China VAT 6%',
      'TH-VAT-7': 'Thailand VAT 7%',
    };
    const CATS = ['Freight', 'Surcharge', 'Origin local charges', 'Destination local charges', 'Demurrage & Detention', 'Ancillary (MISC)'];
    const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fd = (iso) => {
      if (!iso) return 'Open-ended';
      const p = iso.split('-');
      return +p[2] + ' ' + M[+p[1] - 1] + ' ' + p[0];
    };
    const portTxt = (h) => (h.port === 'ALL' ? 'All ports' : h.port + ' · ' + PORTS[h.port][1]);
    const where = (h) =>
      portTxt(h) + (h.ctry === 'ALL' ? '' : h.port !== 'ALL' && PORTS[h.port][1] === CN[h.ctry] ? '' : ', ' + CN[h.ctry]);
    const whereS = (h) => (h.port === 'ALL' ? (h.ctry === 'ALL' ? 'All' : 'All ports · ' + h.ctry) : h.port + ' · ' + h.ctry);
    const eff = (h) => fd(h.from) + ' – ' + (h.to ? fd(h.to) : 'open');
    const stOf = (h) =>
      h.active
        ? { t: 'Active', chip: 'background:var(--okbg);color:var(--ok)', dot: 'var(--okbar)', fg: 'var(--ink)' }
        : { t: 'Inactive', chip: 'background:var(--neutral);color:var(--muted2)', dot: 'var(--muted4)', fg: 'var(--muted)' };
    const MONO = 'font-family:var(--mono,ui-monospace,monospace)';
    const kv = (l, v, opt) => Object.assign({ l, v, cls: '', st: '' }, opt || {});
    const SECTIONS = (h) => [
      [
        's1',
        'Charge details',
        h.name + ' · ' + h.cat,
        {
          isKv: true,
          kv: [
            kv('Charge code', h.code, { st: MONO }),
            kv('Charge name', h.name),
            kv('Charge category', h.cat),
            kv('Active status', stOf(h).t),
            kv('Effective from', fd(h.from)),
            kv('Effective to', fd(h.to)),
          ],
        },
      ],
      [
        's2',
        'Applicability',
        h.app + ' · ' + where(h),
        { isKv: true, kv: [kv('Origin / Destination', h.app), kv('Country', CN[h.ctry]), kv('Port', portTxt(h), { cls: 'full' })] },
      ],
      [
        's3',
        'Country / Tax / Currency setup',
        h.tax + ' · ' + h.ccy,
        {
          isKv: true,
          kv: [
            kv('Tax code', h.tax, { st: MONO }),
            kv('Currency', h.ccy, { st: MONO }),
            kv('Tax description', TAX[h.tax], { cls: 'full' }),
          ],
        },
      ],
      [
        's4',
        'LMS mapping',
        h.lms ? 'Mapped to ' + h.lms : 'Not mapped · GIRS only',
        {
          isKv: true,
          kv: [
            kv('LMS charge code', h.lms || 'Not mapped', { st: h.lms ? MONO : 'color:var(--muted4)' }),
            kv('Mapping', h.lms ? 'Aligned with LMS charge code' : 'Charge maintained in GIRS only'),
          ],
        },
      ],
      [
        's5',
        'Business rules',
        '[Business rules using this charge]',
        { isList: true, items: [{ a: '[Business rule]', b: '[Rule description]', c: '' }] },
      ],
    ];
    const q = (s.q || '').trim().toLowerCase();
    const list = H.filter(
      (h) =>
        (!q || (h.code + ' ' + h.name + ' ' + h.lms).toLowerCase().indexOf(q) >= 0) &&
        (!s.fCat || h.cat === s.fCat) &&
        (!s.fApp || h.app === s.fApp) &&
        (!s.fCtry || h.ctry === s.fCtry) &&
        (s.fSt === 'all' || (s.fSt === 'on') === h.active),
    );
    const segs = [
      ['all', 'All'],
      ['on', 'Active'],
      ['off', 'Inactive'],
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
    const F = {
      q: s.q,
      fCat: s.fCat,
      fApp: s.fApp,
      fCtry: s.fCtry,
      segs,
      onQ: (e) => this.setState({ q: e.target.value }),
      onCat: (e) => this.setState({ fCat: e.target.value }),
      onApp: (e) => this.setState({ fApp: e.target.value }),
      onCtry: (e) => this.setState({ fCtry: e.target.value }),
      filtered: !!(s.q || s.fCat || s.fApp || s.fCtry || s.fSt !== 'all'),
      clear: () => this.setState({ q: '', fCat: '', fApp: '', fCtry: '', fSt: 'all' }),
      empty: list.length === 0,
      countText: list.length + ' of ' + H.length + ' charges',
    };

    const groups = CATS.map((cat) => {
      const L = list.filter((h) => h.cat === cat);
      const open = !!q || !!s.open[cat];
      const off = L.filter((h) => !h.active).length;
      return {
        name: cat,
        n: String(L.length),
        hide: L.length === 0,
        open,
        ax: open ? 'true' : 'false',
        rot: open ? '90deg' : '0deg',
        hasOff: off > 0 && s.fSt === 'all',
        offTxt: off + ' inactive',
        tg: () => this.setState({ open: Object.assign({}, s.open, { [cat]: !s.open[cat] }) }),
        rows: L.map((h) => {
          const on = s.sel === h.id;
          return {
            code: h.code,
            name: h.name,
            off: !h.active,
            fg: h.active ? 'var(--ink)' : 'var(--muted)',
            on: on ? 'true' : 'false',
            sel: on ? 'background:var(--tint);color:var(--accent2);font-weight:500;box-shadow:inset 3px 0 0 var(--accent)' : '',
            pick: () => this.setState({ sel: h.id }),
          };
        }),
      };
    }).filter((g) => !g.hide);
    const h = H.find((x) => x.id === s.sel) || H[0];
    const S = {};
    SECTIONS(h).forEach(([k, title, sum, body]) => {
      S[k] = Object.assign({ title, isKv: false, isList: false, isAudit: false, kv: [], items: [] }, body);
    });
    const T = [
      ['ov', 'Overview', '', ['s1', 's2']],
      ['tx', 'Tax & currency', '', ['s3']],
      ['lm', 'LMS mapping', '', ['s4']],
      ['br', 'Business rules', '', ['s5']],
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
    const cur = T.find((t) => t[0] === s.tab) || T[0];
    const st = stOf(h);
    return Object.assign(F, {
      groups,
      catCount: groups.length,
      tabs,
      panel: cur[3].map((k) => S[k]),
      c: {
        code: h.code,
        name: h.name,
        cat: h.cat,
        eff: eff(h),
        app: h.app,
        where: where(h),
        tax: h.tax,
        ccy: h.ccy,
        lms: h.lms || 'Not mapped',
        lmsFg: h.lms ? 'var(--ink)' : 'var(--muted4)',
        st: st.t,
        stChip: st.chip,
      },
    });
  }
}

export class ChargeMasterLayoutCModel extends GirsPage {
  renderVals() {
    const v = super.renderVals();
    return { ...v, kit: KIT_VALS(this, this.state, v, KIT_M, undefined) };
  }
}
