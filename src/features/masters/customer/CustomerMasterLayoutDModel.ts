// @ts-nocheck — screen logic ported from the GIRS prototype; types are added as the screen is reworked.
/* Customer master, layout D — view-model. */
import { ViewModel } from '../../../lib/viewModel';
import { KIT_VALS } from '../kit';
import { KIT_M, KIT_CM } from './customerData';

export class GirsPage extends ViewModel {
  constructor(p) {
    super(p);
    let sc = '';
    try {
      const x = JSON.parse(localStorage.getItem('girs.dsel') || 'null');
      if (x && x.p === 'CustomerMasterD') {
        sc = x.c;
        localStorage.removeItem('girs.dsel');
      }
    } catch (e) {}
    this.state = { q: '', fs: '', sel: 'k2', selCode: sc, open: null, op: null };
  }
  renderVals() {
    const s = this.state;
    const D = {
      recs: [],
      smap: {
        'Not listed': ['background:var(--okbg);color:var(--ok)', 'var(--okbar)'],
        Sanctioned: ['background:var(--badbg);color:var(--bad)', 'var(--badbar)'],
        Blacklisted: ['background:var(--badbg);color:var(--bad)', 'var(--badbar)'],
      },
      segLabels: { 'Not listed': 'Not listed' },
      groupLabel: 'Parent customer group',
      nouns: 'customer codes',
    };
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

    const CTR = {
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
    };

    const GREY = 'background:var(--neutral);color:var(--muted2)';
    const KV = (l, v, mono, wide, muted) => [l, v, mono ? 1 : 0, wide ? 1 : 0, muted ? 1 : 0];
    const toD = (c) => {
      const g = G[c.g],
        st = ST[c.st],
        P = parties(c),
        mem = C.filter((x) => x.g === c.g),
        dp = c.name,
        js = jsonOn(c);
      const kr = CTR[c.code] || [];
      const recD = {
        id: c.id,
        code: c.code,
        title: c.name,
        group: g.name,
        st: st.t,
        search: [c.code, c.name, g.name, g.legal, g.tax].join(' '),
        sub: g.legal + ' · ' + CN[c.ctry],
        chips: [[g.arr + ' invoicing', g.arr === 'Split' ? 'background:var(--aibg);color:var(--ai)' : GREY]],
        alert: st.flag ? 'Sanction / Blacklist status: ' + st.t : '',
        facts: [
          ['Legal entity', g.legal, 0],
          ['Parent group', g.name, 0],
          ['Credit terms', g.terms, 0],
          ['Invoicing', g.arr, 0],
          ['Default billing party', dp, 0],
          ['LMS CMD ref', c.ref, 1],
        ],
        sections: [
          [
            'Identity',
            [
              KV('Customer code', c.code, true),
              KV('Customer name', c.name),
              KV('Legal entity name', g.legal, false, true),
              KV('Registration / Tax ID', g.tax, true),
              KV('LMS CMD reference', c.ref, true),
            ],
          ],
          ['Contact', [KV('Email', c.email, false, true), KV('Address details', c.addr, false, true)]],
          [
            'Terms & compliance',
            [KV('Credit terms', g.terms), KV('Sanction / Blacklist', st.t), KV('Parent customer group', g.name, false, true)],
          ],
          [
            'Billing configuration & distribution',
            [
              KV('Invoicing arrangement', g.arr + ' · on customer-code grouping', false, true),
              KV('Default billing party', dp, false, true),
              KV('Document / data delivery', js ? 'PDF, JSON' : 'PDF'),
              KV('Delivery to', c.email),
              KV('Customer-specific rules', '[Customer-specific billing configuration]', false, true, true),
            ],
          ],
        ],
        tables: [
          [
            'Billing party details · country-wise',
            ['Country', 'Billing party', 'Customer code', 'Default', 'Default set by'],
            P.map((p) => [p.ctry, p.name, p.code, p.isDef ? 'Default' : '—', p.src || '—']),
            [2],
            '',
            '',
          ],
          [
            'Contracts · ' + kr.length,
            ['Contract no.', 'Trade lane', 'Validity', 'Approval'],
            kr,
            [0],
            'ContractMasterD.dc.html',
            'ContractMasterD',
          ],
        ],
        railTitle: 'Customer group · ' + mem.length + (mem.length === 1 ? ' code' : ' codes'),
        railNote: 'Same legal entity and tax ID',
        rail: mem.map((x) => [x.code + ' · ' + CN[x.ctry], x.name, ST[x.st].t, x.id === c.id ? 1 : 0]),
      };
      recD.comb = recD.sections.reduce((n, x) => n + x[1].length, 0) <= 14;
      return recD;
    };
    D.recs = C.map(toD);
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

export class CustomerMasterLayoutDModel extends GirsPage {
  renderVals() {
    const v = super.renderVals();
    return { ...v, kit: KIT_VALS(this, this.state, v, KIT_M, KIT_CM) };
  }
}
