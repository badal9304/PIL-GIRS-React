// @ts-nocheck — screen logic ported from the GIRS prototype; types are added as the screen is reworked.
/* Customer master, layout C — view-model. */
import { ViewModel } from '../../../lib/viewModel';
import { KIT_VALS } from '../kit';
import { KIT_M, KIT_CM } from './customerData';

export class GirsPage extends ViewModel {
  constructor(p) {
    super(p);
    this.state = { sel: 'k2', q: '', open: { gA: true, gE: true }, tab: '1' };
  }
  renderVals() {
    const s = this.state;
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
    const q = (s.q || '').trim().toLowerCase();
    const gids = Object.keys(G);
    const tree = gids
      .map((gid) => {
        const kids = C.filter((c) => c.g === gid && (!q || (G[gid].name + ' ' + c.code + ' ' + c.name).toLowerCase().indexOf(q) >= 0));
        const open = !!q || !!s.open[gid];
        return {
          gid,
          name: G[gid].name,
          n: String(kids.length),
          open: open ? 'true' : 'false',
          isOpen: open,
          rot: open ? '90deg' : '0deg',
          hide: kids.length === 0,
          toggle: () => this.setState({ open: { ...s.open, [gid]: !s.open[gid] } }),
          kids: kids.map((c) => {
            const on = s.sel === c.id;
            return {
              code: c.code,
              ctry: CN[c.ctry],
              flag: ST[c.st].flag,
              st: ST[c.st].t,
              cur: on ? 'true' : 'false',
              sel: on ? 'background:var(--tint);color:var(--accent2);font-weight:500;box-shadow:inset 3px 0 0 var(--accent)' : '',
              pick: () => this.setState({ sel: c.id, open: { ...s.open, [gid]: true } }),
            };
          }),
        };
      })
      .filter((g) => !g.hide);
    const c = C.find((x) => x.id === s.sel) || C[0];
    const g = G[c.g];
    const P = parties(c);
    const T = [
      ['1', 'Customer details', ''],
      ['2', 'Billing party details', String(P.length)],
      ['3', 'Billing configuration', ''],
      ['4', 'Customer distribution', ''],
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
    const yes = 'background:var(--tint);color:var(--accent2)',
      no = 'background:var(--line2);color:var(--muted4);text-decoration:line-through';
    return {
      q: s.q,
      onQ: (e) => this.setState({ q: e.target.value }),
      tree,
      groupCount: gids.length,
      tabs,
      tab1: s.tab === '1',
      tab2: s.tab === '2',
      tab3: s.tab === '3',
      tab4: s.tab === '4',
      grp: { name: g.name, legal: g.legal, tax: g.tax, n: String(C.filter((x) => x.g === c.g).length), arr: g.arr, arrChip: ARR[g.arr] },
      c: {
        ini: initials(c.name),
        flag: ST[c.st].flag,
        name: c.name,
        code: c.code,
        ctryName: CN[c.ctry],
        ref: c.ref,
        tax: g.tax,
        terms: g.terms,
        email: c.email,
        addr: c.addr,
        st: ST[c.st].t,
        chip: ST[c.st].chip,
        defParty: c.name,
      },
      parties: P,
      pdfChip: yes,
      jsonChip: jsonOn(c) ? yes : no,
    };
  }
}

export class CustomerMasterLayoutCModel extends GirsPage {
  renderVals() {
    const v = super.renderVals();
    return { ...v, kit: KIT_VALS(this, this.state, v, KIT_M, KIT_CM) };
  }
}
