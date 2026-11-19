// @ts-nocheck — screen logic ported from the GIRS prototype; types are added as the screen is reworked.
/* Invoice List view-model: tabs (Ready to invoice / Invoices), filters, search, sort, column choice,
   pagination, row actions, dialogs and the Ready-to-invoice review screen. */
import { ViewModel } from '../../lib/viewModel';
import { getZoom } from '../../lib/appBridge';
import {
  IV_SEED,
  IV_CUST,
  IV_CHG,
  IV_READY,
  ivRand,
  IV_POOL,
  IV_LOC,
  ivGen,
  ivGenReady,
  IV_RDY,
  IV_COLS,
  IV_COLS_DEF,
  ivColsLoad,
  IV_ALL,
  IV_CHECKS,
  IV_LINK,
  IV_TONE,
  IV_PILL,
  IV_FX,
  ivGo,
  ivAct,
  ivLoad,
  ivSave,
  ivFmt,
  ivToday,
  ivPlus,
  ivStamp,
  ivFile,
  ivMain,
  ivRate,
  ivDocData,
  ivRcptData,
  ivHasJson,
  ivArr,
  ivIn,
  ivSt2,
  ivMatch,
  ivHay,
  ivChip2,
  ivHash,
  ivPayPill,
  ivPay,
  ivDist,
  ivView,
  ivPdf,
  ivJsonDl,
  ivDownload,
  ivReceipt,
  ivReadyCalc,
  ivStdTax,
  ivMainTax,
  ivAddOk,
  ivRdyErrs,
  ivRdyEff,
} from './invoiceData';

export class GirsPage extends ViewModel {
  constructor(p) {
    super(p);
    let q = '';
    try {
      q = new URLSearchParams(location.search).get('q') || '';
    } catch (e) {}
    try {
      const fq = localStorage.getItem('girs.find');
      if (fq) {
        q = fq;
        localStorage.removeItem('girs.find');
      }
    } catch (e) {}
    // deep links from the global search: ?rv=<ready id> opens that B/L's review, ?open=<invoice no> opens the invoice
    let rvId = '',
      tab = 'inv';
    try {
      const P = new URLSearchParams(location.search);
      rvId = P.get('rv') || '';
      this.__open = P.get('open') || '';
      if (P.get('tab') === 'ready') tab = 'ready';
    } catch (e) {}
    const rvOk = rvId && IV_RDY.some((r) => r.id === rvId);
    if (rvOk) tab = 'ready';
    this.state = {
      tab,
      view: rvOk ? 'review' : 'list',
      rv: rvOk ? { ids: [rvId], i: 0 } : null,
      q,
      fd: null,
      fo: [],
      fpt: [],
      fs: [],
      fe: [],
      fg: [],
      fp: [],
      ft: [],
      fc: [],
      fopen: null,
      sel: {},
      exp: {},
      menu: null,
      dlg: null,
      f: {},
      cols: ivColsLoad(),
      colsOpen: false,
      colsDraft: null,
      period: '',
      rPort: '',
      rProc: '',
      rKpi: '',
      rsel: {},
      rexp: {},
      decl: false,
      store: ivLoad(),
      pg: {},
      psz: {},
      sort: 'new',
      dview: 'cards',
    };
  }
  componentDidMount() {
    if (this.__open) {
      const i = this.invoices().find((x) => x.no === this.__open);
      if (i) setTimeout(() => ivView(i), 50);
    }
  }
  put(mut, extra) {
    const d = JSON.parse(JSON.stringify(this.state.store));
    mut(d);
    ivSave(d);
    if (typeof extra === 'function') extra = extra();
    this.setState(Object.assign({ store: d }, extra || {}));
    if (extra && extra.__toast) this.fade(extra.__toast);
  }
  fade(t) {
    try {
      clearTimeout(this.__ft);
      this.__ft = setTimeout(() => {
        if (this.state.__toast === t) this.setState({ __toast: '' });
      }, 5000);
    } catch (e) {}
  }
  ev(d, no, what) {
    d.ev = d.ev || {};
    (d.ev[no] = d.ev[no] || []).push([ivStamp(), what, 'Daniel Tan']);
  }
  invoices() {
    const d = this.state.store;
    const all = (d.gen || []).concat(IV_ALL);
    return all.map((i) => {
      const o = Object.assign({}, i, { status: (d.st && d.st[i.no]) || i.status });
      o.pay = ivPay(o, (d.prf || {})[i.no]);
      o.st2 = ivSt2(o);
      o.einv = o.st2 === 'Cancelled' ? 'Cancelled' : 'Active';
      o.gfs = o.st2 === 'Unpaid' ? 'Pending' : 'Posted';
      o.ctry = (IV_LOC[o.port] || [])[1] || String(o.port).slice(0, 2);
      return o;
    });
  }
  readyList() {
    const d = this.state.store;
    return IV_RDY.filter((r) => !(d.done || []).includes(r.id)).map((r) => ivRdyEff(r, (d.rdy || {})[r.id]));
  }
  openMenu(no, e) {
    let pos = { x: 0, y: 0, up: false };
    try {
      const z = getZoom(),
        b = e.currentTarget.getBoundingClientRect();
      const vh = window.innerHeight / z,
        top = b.bottom / z + 4,
        h = 580;
      pos = { x: Math.max(8, b.right / z - 264), y: top + h > vh ? Math.max(8, b.top / z - h - 4) : top };
    } catch (er) {}
    this.setState({ menu: this.state.menu && this.state.menu.no === no ? null : { no, pos } });
  }
  dlg(kind, inv, f) {
    this.setState({ menu: null, dlg: { kind, no: inv ? inv.no : null }, f: f || {}, __toast: '' });
  }
  setF(patch) {
    this.setState({ f: Object.assign({}, this.state.f, patch) });
  }
  audit(inv) {
    const base = [
      [inv.date + ' 06:00', 'Created by scheduled batch run from LMS booking ' + inv.bkg, 'GIRS rule engine'],
      [inv.date + ' 06:01', 'Pre-generation validation passed', 'GIRS rule engine'],
      [
        inv.date + ' 06:02',
        'Invoice generated · ' + inv.lines.length + ' charge line' + (inv.lines.length === 1 ? '' : 's'),
        'GIRS rule engine',
      ],
    ];
    if (inv.gov !== '—') base.push([inv.date + ' 06:05', 'E-invoice submitted · ' + inv.gov, 'GIRS → tax portal']);
    if (['Sent', 'Accepted', 'Paid', 'Credited'].includes(inv.status))
      base.push([inv.date + ' 06:10', 'Sent to customer channel (e-mail)', 'GIRS']);
    if (inv.status === 'Paid') base.push([inv.due, 'Payment received · status flowed back to LMS', 'Receipting']);
    if (inv.status === 'Credited') base.push([inv.due, 'Fully credited by SINOD2600311CR', 'Credit notes']);
    return base.concat((this.state.store.ev || {})[inv.no] || []);
  }
  renderVals() {
    const s = this.state,
      self = this;
    const isA = 'A' === 'A',
      isB = 'A' === 'B',
      isG = 'A' === 'G',
      isD = 'A' === 'D';
    const toast = (t) => {
      self.setState({ __toast: t });
      self.fade(t);
    };
    const P1 = { pg: {} };
    const pager = (key, arr, sizes) => {
      const size = s.psz[key] || sizes[0],
        pages = Math.max(1, Math.ceil(arr.length / size)),
        n = Math.min(s.pg[key] || 1, pages),
        from = (n - 1) * size;
      const go = (v) => () => self.setState({ pg: Object.assign({}, s.pg, { [key]: v }), menu: null });
      return {
        rows: arr.slice(from, from + size),
        p: {
          text: arr.length
            ? 'Showing ' +
              (from + 1).toLocaleString('en-US') +
              '–' +
              Math.min(from + size, arr.length).toLocaleString('en-US') +
              ' of ' +
              arr.length.toLocaleString('en-US')
            : 'Nothing to show',
          pos: n + ' / ' + pages,
          prevDis: n <= 1,
          nextDis: n >= pages,
          firstDis: n <= 1,
          lastDis: n >= pages,
          prev: go(n - 1),
          next: go(n + 1),
          first: go(1),
          last: go(pages),
          size: String(size),
          sizes: sizes.map(String),
          onSize: (e) =>
            self.setState({
              psz: Object.assign({}, s.psz, { [key]: parseInt(e.target.value, 10) }),
              pg: Object.assign({}, s.pg, { [key]: 1 }),
            }),
        },
      };
    };
    const toUsd = (l) => (l[2] === 'USD' ? l[1] : l[1] / ((IV_FX.USD || {})[l[2]] || 1));
    const dt = (x) => {
      const t = Date.parse(x);
      return isNaN(t) ? Infinity : t;
    };
    const SORTS = [
      ['new', 'Newest first'],
      ['due', 'Due date, soonest'],
      ['amt', 'Amount, highest'],
      ['no', 'Invoice No.'],
    ];
    const sorter =
      {
        new: (a, b) => dt(b.date) - dt(a.date),
        due: (a, b) => dt(a.due) - dt(b.due),
        amt: (a, b) => b.lines.reduce((x, l) => x + toUsd(l), 0) - a.lines.reduce((x, l) => x + toUsd(l), 0),
        no: (a, b) => (a.no < b.no ? -1 : 1),
      }[s.sort] || (() => 0);
    const colsSave = (arr) => {
      const v = IV_COLS.map((c) => c[0]).filter((k) => arr.includes(k));
      try {
        localStorage.setItem('girs.inv.cols', JSON.stringify(v));
      } catch (e) {}
      return v;
    };
    const cv = {};
    IV_COLS.forEach(([k]) => {
      cv[k] = s.cols.includes(k);
    });
    const dr = s.colsDraft || s.cols,
      cdv = {};
    IV_COLS.forEach(([k]) => {
      cdv[k] = dr.includes(k);
    });
    const colsSet = (arr) => self.setState({ colsDraft: arr });
    const colsAll = IV_COLS.every(([k]) => cdv[k]);
    const colsList = [{ label: 'Invoice No.', on: true, lock: true, tip: 'Always shown', flip: () => {} }].concat(
      IV_COLS.map(([k, label]) => ({
        label,
        on: cdv[k],
        lock: false,
        tip: label,
        flip: () => colsSet(cdv[k] ? dr.filter((x) => x !== k) : dr.concat([k])),
      })),
      [{ label: 'Action', on: true, lock: true, tip: 'Always shown', flip: () => {} }],
    );
    const cq = String(s.colsQ || '')
      .trim()
      .toLowerCase();
    const colsShown = cq ? colsList.filter((c) => c.label.toLowerCase().includes(cq)) : colsList;
    const colsUi = {
      cv,
      colsList: colsShown,
      colsQ: s.colsQ || '',
      colsHasQ: !!cq,
      colsNoQ: !cq,
      colsNone: !colsShown.length,
      colsOnQ: (e) => self.setState({ colsQ: e.target.value }),
      colsClrQ: () => {
        self.setState({ colsQ: '' });
        setTimeout(() => {
          const q = document.querySelector('.cols-q');
          if (q) q.focus();
        }, 30);
      },
      colsAll,
      colsOpen: !!s.colsOpen,
      colsN: s.cols.length + 2 + ' of ' + (IV_COLS.length + 2),
      colsDN: dr.length + 2 + ' of ' + (IV_COLS.length + 2),
      colsIsDef: dr.length === IV_COLS_DEF.length && IV_COLS_DEF.every((k) => dr.includes(k)),
      colsToggle: () => {
        self.setState({ colsOpen: !s.colsOpen, colsQ: '', colsDraft: s.colsOpen ? null : s.cols.slice(), fopen: null, menu: null });
        if (!s.colsOpen)
          setTimeout(() => {
            const q = document.querySelector('.cols-q');
            if (q) q.focus();
          }, 30);
      },
      colsCancel: () => self.setState({ colsOpen: false, colsDraft: null, colsQ: '' }),
      colsDone: () => self.setState({ cols: colsSave(dr), colsOpen: false, colsDraft: null, colsQ: '' }),
      colsAllFlip: () => colsSet(colsAll ? [] : IV_COLS.map((c) => c[0])),
      colsReset: () => colsSet(IV_COLS_DEF.slice()),
    };
    const sortSel = {
      val: s.sort,
      opts: SORTS.map(([v, label]) => ({ v, label })),
      on: (e) => self.setState({ sort: e.target.value, pg: {} }),
    };
    // ---------------- invoices
    const INV = this.invoices();
    const byNo = {};
    INV.forEach((i) => {
      byNo[i.no] = i;
    });
    const q = s.q.trim().toLowerCase();
    const shown = INV.filter(
      (i) =>
        (!q || ivMatch(ivHay(i), q)) &&
        ivIn(s.fo, i.ctry) &&
        ivIn(s.fpt, i.port) &&
        ivIn(s.fs, i.st2) &&
        ivIn(s.fe, i.einv) &&
        ivIn(s.fg, i.gfs) &&
        ivIn(s.ft, i.type) &&
        (!ivArr(s.fc).length || i.lines.some((l) => ivArr(s.fc).includes(l[2]))),
    );
    const uniq = (a) => a.filter((v, n) => a.indexOf(v) === n);
    // Filters panel (v2): choices are staged in s.fd and applied only on Done
    const FKEYS = ['fo', 'fpt', 'fs', 'fe', 'fg', 'ft', 'fc'];
    const FDEF = [
      ['Country', 'fo', uniq(INV.map((i) => i.ctry))],
      ['Port', 'fpt', uniq(INV.map((i) => i.port))],
      ['Invoice Status', 'fs', ['Unpaid', 'Paid', 'Receipted', 'Reconciled', 'Cancelled']],
      ['e-Invoice', 'fe', ['Active', 'Cancelled']],
      ['GFS Status', 'fg', ['Pending', 'Posted']],
      ['Invoice Type', 'ft', uniq(INV.map((i) => i.type))],
      ['Currency', 'fc', uniq([].concat(...INV.map((i) => i.lines.map((l) => l[2]))))],
    ];
    const FFIELD = { fo: 'ctry', fpt: 'port', fs: 'st2', fe: 'einv', fg: 'gfs', ft: 'type' };
    const fMatch = (i, src) =>
      ivIn(src.fo, i.ctry) &&
      ivIn(src.fpt, i.port) &&
      ivIn(src.fs, i.st2) &&
      ivIn(src.fe, i.einv) &&
      ivIn(src.fg, i.gfs) &&
      ivIn(src.ft, i.type) &&
      (!ivArr(src.fc).length || i.lines.some((l) => ivArr(src.fc).includes(l[2])));
    const fApplied = {};
    FKEYS.forEach((k) => {
      fApplied[k] = ivArr(s[k]);
    });
    const fd = s.fd || fApplied,
      fOpen = !!s.fd;
    const fCnt = (k, v) => INV.filter((i) => (k === 'fc' ? i.lines.some((l) => l[2] === v) : i[FFIELD[k]] === v)).length;
    const nApplied = FKEYS.reduce((a, k) => a + fApplied[k].length, 0),
      nDraft = FKEYS.reduce((a, k) => a + ivArr(fd[k]).length, 0);
    const fp = {
      open: fOpen,
      openA: fOpen ? 'true' : 'false',
      n: nApplied,
      hasN: nApplied > 0,
      btnSt: nApplied ? 'border-color:var(--accent);color:var(--accent2)' : '',
      noDraft: !nDraft,
      toggle: () => self.setState({ fd: fOpen ? null : Object.assign({}, fApplied), menu: null }),
      cancel: () => self.setState({ fd: null }),
      clear: () => {
        const z = {};
        FKEYS.forEach((k) => {
          z[k] = [];
        });
        self.setState({ fd: z });
      },
      done: () => {
        const up = { fd: null, pg: {} };
        FKEYS.forEach((k) => {
          up[k] = ivArr(fd[k]);
        });
        self.setState(up);
      },
      preview: fOpen ? INV.filter((i) => fMatch(i, fd)).length.toLocaleString('en-US') + ' invoices match' : '',
      groups: !fOpen
        ? []
        : FDEF.map(([label, k, opts]) => {
            const cur = ivArr(fd[k]);
            return {
              label,
              n: cur.length,
              hasN: cur.length > 0,
              items: opts.map((v) => ({
                v,
                n: fCnt(k, v).toLocaleString('en-US'),
                on: cur.includes(v),
                flip: () =>
                  self.setState({ fd: Object.assign({}, fd, { [k]: cur.includes(v) ? cur.filter((x) => x !== v) : cur.concat([v]) }) }),
              })),
            };
          }),
      chips: [].concat(
        ...FDEF.map(([label, k]) =>
          fApplied[k].map((v) => ({
            label: label + ': ' + v,
            rm: () => self.setState({ [k]: fApplied[k].filter((x) => x !== v), pg: {} }),
          })),
        ),
      ),
    };
    const fsel = [
      ['Country', 'fo', uniq(INV.map((i) => i.ctry))],
      ['Port', 'fpt', uniq(INV.map((i) => i.port))],
      ['Invoice Status', 'fs', ['Unpaid', 'Paid', 'Receipted', 'Reconciled', 'Cancelled']],
      ['e-Invoice', 'fe', ['Active', 'Cancelled']],
      ['GFS Status', 'fg', ['Pending', 'Posted']],
      ['Invoice Type', 'ft', uniq(INV.map((i) => i.type))],
      ['Currency', 'fc', uniq([].concat(...INV.map((i) => i.lines.map((l) => l[2]))))],
    ].map(([label, k, opts]) => {
      const applied = ivArr(s[k]),
        open = s.fopen === k,
        cur = open && s.fdv ? s.fdv : applied;
      const cnt = (v) =>
        INV.filter((i) =>
          k === 'fc'
            ? i.lines.some((l) => l[2] === v)
            : i[{ fo: 'ctry', fpt: 'port', fs: 'st2', fe: 'einv', fg: 'gfs', ft: 'type' }[k]] === v,
        ).length;
      return {
        label,
        open,
        openA: open ? 'true' : 'false',
        n: applied.length,
        hasN: applied.length > 0,
        none: !cur.length,
        text: label,
        tip: applied.length ? label + ': ' + applied.join(', ') : label,
        aria: label + ' filter' + (applied.length ? ', ' + applied.join(', ') : ''),
        bst: applied.length ? 'border-color:var(--accent);background:var(--tint);color:var(--accent2)' : '',
        toggle: () => self.setState(open ? { fopen: null, fdv: null } : { fopen: k, fdv: applied.slice(), menu: null }),
        clear: () => self.setState({ fdv: [] }),
        done: () => self.setState({ [k]: (s.fdv || applied).slice(), fopen: null, fdv: null, pg: {} }),
        items: (open ? opts : []).map((v) => ({
          v,
          n: cnt(v).toLocaleString('en-US'),
          on: cur.includes(v),
          flip: () => self.setState({ fdv: cur.includes(v) ? cur.filter((x) => x !== v) : cur.concat([v]) }),
        })),
      };
    });
    shown.sort(sorter);
    const PI = pager('inv', shown, [25, 50, 100]);
    const invs = PI.rows.map((i) => {
      const per = {};
      i.lines.forEach((l) => {
        per[l[2]] = (per[l[2]] || 0) + l[1];
      });
      const roe = (i.lines.find((l) => l[3] !== '—') || ['', '', '', '—'])[3];
      const files = i.status === 'Cancelled' && i.files === '—' ? '—' : i.files;
      return Object.assign({}, i, {
        payPill: ivPayPill(i.pay),
        st2: i.st2,
        st2Pill: ivChip2(i.st2),
        einv: i.einv,
        einvPill: ivChip2(i.einv),
        gfs: i.gfs,
        gfsPill: ivChip2(i.gfs),
        amtMain: ivFmt(ivMain(i)),
        curMain: i.lines[0][2],
        on: !!s.sel[i.no],
        rowCls: s.sel[i.no] ? 'on' : '',
        open: !!s.exp[i.no],
        toggle: () => self.setState({ sel: Object.assign({}, s.sel, { [i.no]: !s.sel[i.no] }) }),
        expand: () => self.setState({ exp: Object.assign({}, s.exp, { [i.no]: !s.exp[i.no] }) }),
        details: () => ivView(i, toast),
        chg: i.lines.length === 1 ? i.lines[0][0] : i.lines.length + ' charges',
        amts: Object.keys(per).map((c) => ({ v: ivFmt(per[c]), c })),
        roe,
        roeSt: roe === '—' ? 'color:var(--muted)' : '',
        tax: uniq(i.lines.map((l) => l[4])).join(', '),
        audit: i.lines[0][5],
        stc: IV_TONE[i.status] || 'var(--muted)',
        dueSt: i.due === '—' ? 'color:var(--muted)' : '',
        govSt: i.gov === '—' ? 'color:var(--muted)' : /error/.test(i.gov) ? 'color:var(--bad)' : '',
        hasPdf: files.indexOf('PDF') >= 0,
        hasJson: files.indexOf('JSON') >= 0,
        noFile: files === '—',
        pdf: () => ivPdf(i, toast),
        json: () => ivJsonDl(i, toast),
        menuOpen: !!(s.menu && s.menu.no === i.no),
        openMenu: (e) => self.openMenu(i.no, e),
        lines: i.lines.map((l, n) => ({
          n: n + 1,
          chg: l[0],
          name: IV_CHG[l[0]] || l[0],
          amt: ivFmt(l[1]),
          cur: l[2],
          roe: l[3],
          roeSt: l[3] === '—' ? 'color:var(--muted)' : '',
          tax: l[4],
          audit: l[5],
        })),
      });
    });
    const selNos = Object.keys(s.sel).filter((k) => s.sel[k] && byNo[k]);
    const allOn = PI.rows.length > 0 && PI.rows.every((i) => s.sel[i.no]);
    // ---------------- row menu
    const itemsFor = (i) => {
      const st = i.status;
      const paid = st === 'Paid',
        live = !['Draft', 'Pending validation', 'Cancelled'].includes(st);
      const cnOk = ['Generated', 'Sent', 'Accepted', 'Paid'].includes(st);
      const cancelOk = ['Draft', 'Pending validation', 'Generated', 'Sent', 'Rejected'].includes(st);
      const hasCn = st === 'Credited' || (s.store.cn || []).some((c) => c.orig === i.no);
      const close = (fn) => () => {
        self.setState({ menu: null });
        fn();
      };
      const it = (label, run, dis, note, extra) =>
        Object.assign(
          { label, run: dis ? () => {} : run, dis: !!dis, note: dis ? note : '', hasNote: !!(dis && note), cls: '', sep: false },
          extra || {},
        );
      return [
        it(
          'View invoice',
          close(() => ivView(i, toast)),
          i.files === '—',
          'The invoice is created after validation',
        ),
        it('View invoice details', () => self.dlg('details', i)),
        it('View credit note', () => self.dlg('cnv', i), !hasCn, 'No credit note for this invoice'),
        it('View SOA', () => self.dlg('soa', i)),
        it(
          'Download PDF / JSON',
          close(() => ivDownload(i, toast)),
          i.files === '—',
          'Files are created after validation',
        ),
        it(
          'e-Mail / Post',
          () => self.dlg('mail', i, { ch: 'email', to: (IV_CUST[i.cust] || {}).mail || '', msg: '' }),
          !live,
          'Available once the invoice is generated',
          { sep: true },
        ),
        it(
          'Request credit note',
          () => self.dlg('cn', i, { full: true, amount: ivFmt(ivMain(i)), reason: '', ref: '' }),
          !cnOk,
          st === 'Credited' ? 'Already fully credited' : 'Only for generated, sent, accepted or paid invoices',
        ),
        it(
          'Request refund',
          () => self.dlg('refund', i, { amount: ivFmt(ivMain(i)), reason: '', note: '' }),
          !paid,
          'Only for paid invoices',
        ),
        it('View payment', () => self.dlg('pay', i), !paid, 'No payment received yet'),
        it(
          'View receipt',
          close(() => ivReceipt(i, toast)),
          !paid,
          'No receipt yet',
        ),
        it(
          'Create manual invoice',
          () =>
            self.dlg('manual', i, { type: 'MISC', reason: 'Ancillary (MISC) charges', bl: i.bl, chg: '', amount: '', cur: i.lines[0][2] }),
          false,
          '',
          { sep: true },
        ),
        it('View audit trail', () => self.dlg('audit', i)),
        it('View distribution', () => self.dlg('dist', i)),
        i.type === 'Proforma' ? it('Proforma lifecycle', () => self.dlg('prf', i)) : null,
        it(
          'Cancel invoice',
          () => self.dlg('cancel', i, { why: '' }),
          !cancelOk,
          st === 'Cancelled'
            ? 'Already cancelled'
            : st === 'Accepted'
              ? 'E-invoice accepted · raise a credit note instead'
              : 'Paid or credited invoices are reversed by credit note',
          { cls: 'd', sep: true },
        ),
      ].filter(Boolean);
    };
    const PRIMARY = {
      Draft: 'View invoice details',
      'Pending validation': 'View audit trail',
      Generated: 'e-Mail / Post',
      Sent: 'Download PDF / JSON',
      Accepted: 'Download PDF / JSON',
      Paid: 'View receipt',
      Rejected: 'View audit trail',
      Credited: 'View credit note',
      Cancelled: 'View audit trail',
    };
    const primaryOf = (i) => itemsFor(i).find((m) => m.label === PRIMARY[i.status]) || itemsFor(i)[0];
    let menuItems = [],
      menuPos = '';
    if (s.menu && byNo[s.menu.no]) {
      menuItems = itemsFor(byNo[s.menu.no]);
      menuPos = 'left:' + s.menu.pos.x + 'px;top:' + s.menu.pos.y + 'px';
    }
    // ---------------- simple layouts (C, D)
    const GROUPS = [
      ['all', 'All invoices', null, 'Every invoice'],
      ['attention', 'Needs attention', ['Rejected', 'Pending validation'], 'Rejected by the tax portal or still in validation'],
      ['draft', 'Draft', ['Draft'], 'Proformas and drafts not yet issued'],
      ['open', 'Unpaid', ['Generated', 'Sent', 'Accepted'], 'Generated, sent or accepted with no payment yet'],
      ['part', 'Partially paid', [], 'Part of the amount received; balance outstanding'],
      ['paid', 'Paid', ['Paid'], 'Payment received'],
      ['closed', 'Credited / cancelled', ['Credited', 'Cancelled'], 'Reversed by credit note or cancelled'],
    ];
    const gOfS = (st) => (GROUPS.find((g) => g[2] && g[2].includes(st)) || [])[0];
    const gOf = (i) => (i.pay === 'Partially paid' ? 'part' : gOfS(i.status));
    const grp = s.grp || 'all';
    const qOnly = INV.filter((i) => !q || ivMatch(ivHay(i), q));
    const gShown = qOnly.filter((i) => grp === 'all' || gOf(i) === grp).sort(sorter);
    const dRows = s.dview === 'rows';
    const PQ = pager(isD ? (dRows ? 'dr' : 'dc') : 'cq', gShown, isD ? (dRows ? [25, 50, 100] : [12, 24, 48]) : [20, 50, 100]);
    const PILLC = {
      'var(--muted)': 'var(--neutral)',
      'var(--warn)': 'var(--warnbg)',
      'var(--accent2)': 'var(--tint)',
      'var(--ok)': 'var(--okbg)',
      'var(--bad)': 'var(--badbg)',
      'var(--ai)': 'var(--aibg)',
    };
    const totalOf = (i) => {
      const per = {};
      i.lines.forEach((l) => {
        per[l[2]] = (per[l[2]] || 0) + l[1];
      });
      const ks = Object.keys(per);
      return {
        main: ivFmt(per[ks[0]]) + ' ' + ks[0],
        extra: ks
          .slice(1)
          .map((c) => '+ ' + ivFmt(per[c]) + ' ' + c)
          .join(' '),
      };
    };
    const groups = GROUPS.map(([k, label, sts, hint]) => ({
      k,
      label,
      hint,
      n: qOnly.filter((i) => k === 'all' || gOf(i) === k).length,
      on: grp === k && s.tab === 'inv' ? 'true' : 'false',
      warnCls: k === 'attention' ? 'w' : '',
      pick: () => self.setState({ grp: k, tab: 'inv', view: 'list', menu: null, pg: {} }),
    }));
    const curNo = s.cur && gShown.some((i) => i.no === s.cur) ? s.cur : (PQ.rows[0] || {}).no;
    const cards = PQ.rows.map((i) => {
      const stc = IV_TONE[i.status] || 'var(--muted)',
        t = totalOf(i),
        pr = primaryOf(i);
      return {
        no: i.no,
        party: i.party,
        cust: i.cust,
        bl: i.bl,
        type: i.type,
        due: i.due,
        status: i.status,
        pay: i.pay,
        payPill: ivPayPill(i.pay),
        pill: 'background:' + (PILLC[stc] || 'var(--neutral)') + ';color:' + stc,
        total: t.main,
        extra: t.extra,
        hasExtra: !!t.extra,
        sel: i.no === curNo ? 'true' : 'false',
        dueSt: i.due === '—' ? 'color:var(--muted)' : '',
        lines: i.lines.length === 1 ? '1 charge' : i.lines.length + ' charges',
        pick: () => self.setState({ cur: i.no }),
        open: () => ivView(i, toast),
        prim: pr.label,
        primRun: pr.run,
        primDis: pr.dis,
        menuOpen: !!(s.menu && s.menu.no === i.no),
        openMenu: (e) => self.openMenu(i.no, e),
      };
    });
    let dv = null;
    if (curNo && byNo[curNo]) {
      const i = byNo[curNo],
        stc = IV_TONE[i.status] || 'var(--muted)',
        t = totalOf(i),
        pr = primaryOf(i),
        its = itemsFor(i);
      const dlIt = its.find((m) => m.label === 'Download PDF / JSON'),
        mailIt = its.find((m) => m.label === 'e-Mail / Post');
      const sec = [dlIt, mailIt, its.find((m) => m.label === 'Request credit note')]
        .filter((m) => m && m.label !== pr.label && !m.dis)
        .slice(0, 2);
      const F = (k, v, mono) => ({ k, v, cls: mono ? 'mono' : '', st: v === '—' ? 'color:var(--muted)' : '' });
      dv = {
        no: i.no,
        view: () => ivView(i, toast),
        status: i.status,
        pay: i.pay,
        payPill: ivPayPill(i.pay),
        pill: 'background:' + (PILLC[stc] || 'var(--neutral)') + ';color:' + stc,
        party: i.party,
        cust: i.cust,
        total: t.main,
        extra: t.extra,
        hasExtra: !!t.extra,
        prim: pr.label,
        primRun: pr.run,
        primDis: pr.dis,
        sec: sec.map((m) => ({ label: m.label, run: m.run })),
        menuOpen: !!(s.menu && s.menu.no === i.no),
        openMenu: (e) => self.openMenu(i.no, e),
        sections: [
          {
            t: 'Invoice',
            f: [
              F('Invoice No.', i.no, 1),
              F('Invoice Type', i.type),
              F('Invoice Status', i.status),
              F('Payment Status', i.pay),
              F('Due Date', i.due),
            ],
          },
          { t: 'Shipment', f: [F('Booking No.', i.bkg, 1), F('B/L No.', i.bl, 1), F('Container No.', i.cntr, 1), F('Voyage/VVD', i.vvd)] },
          { t: 'Billing', f: [F('Billing Party', i.party), F('Customer Code', i.cust, 1)] },
          { t: 'Compliance and files', f: [F('Govt. Reference', i.gov, 1), F('PDF/JSON Link', i.files), F('Audit ID', i.lines[0][5], 1)] },
        ],
        lines: i.lines.map((l) => ({ chg: l[0], name: IV_CHG[l[0]] || l[0], amt: ivFmt(l[1]), cur: l[2], roe: l[3], tax: l[4] })),
      };
    }
    const gNow = GROUPS.find((g) => g[0] === grp);
    // ---------------- ready list
    const READY = this.readyList();
    const ports = uniq(IV_RDY.map((r) => r.port)),
      procs = uniq(IV_RDY.map((r) => r.type));
    const base = READY.filter((r) => (!s.rPort || r.port === s.rPort) && (!s.rProc || r.type === s.rProc));
    const rAll = base.filter((r) => !s.rKpi || r.status === s.rKpi);
    const PR = pager('rdy', rAll, [25, 50, 100]);
    const ready = PR.rows.map((r) => {
      const c = ivReadyCalc(r),
        cu = IV_CUST[r.cust] || {};
      const lock = r.status === 'Blocked';
      return Object.assign({}, r, {
        name: cu.name,
        amt: ivFmt(c.inc),
        cur: c.cur,
        pill: IV_PILL[r.status],
        on: !!s.rsel[r.id],
        lock,
        lockTip: lock ? 'Blocked B/Ls cannot be generated' : '',
        rowCls: s.rsel[r.id] ? 'on' : '',
        open: !!s.rexp[r.id],
        hasMsg: !!r.msg,
        bcls: r.status === 'Blocked' ? 'b-block' : 'b-warn',
        toggle: () => self.setState({ rsel: Object.assign({}, s.rsel, { [r.id]: !s.rsel[r.id] }) }),
        expand: () => self.setState({ rexp: Object.assign({}, s.rexp, { [r.id]: !s.rexp[r.id] }) }),
        review: () => self.setState({ view: 'review', rv: { ids: [r.id], i: 0 }, decl: false, __toast: '' }),
        checks: r.checks.map(([k, v], n) => ({
          k: IV_CHECKS[n],
          v,
          ok: k === 'ok',
          warn: k === 'warn',
          block: k === 'block',
          color: k === 'ok' ? 'var(--muted2)' : k === 'warn' ? 'var(--warn)' : 'var(--bad)',
        })),
      });
    });
    const rSel = READY.filter((r) => s.rsel[r.id] && r.status !== 'Blocked');
    const selectable = ready.filter((r) => !r.lock);
    const rAllOn = selectable.length > 0 && selectable.every((r) => s.rsel[r.id]);
    const warnSel = rSel.filter((r) => r.status === 'Warning').length;
    const kpis = [
      ['Ready', 'var(--ok)'],
      ['Warning', 'var(--warnbar)'],
      ['Blocked', 'var(--bad)'],
    ].map(([k, color]) => ({
      label: k,
      color,
      n: base.filter((r) => r.status === k).length,
      on: s.rKpi === k ? 'true' : 'false',
      pick: () => self.setState({ rKpi: s.rKpi === k ? '' : k, pg: {} }),
    }));
    // ---------------- review
    let rv = {},
      steps = [],
      rvGenDis = true,
      rvHint = '';
    const rvIds = s.rv ? s.rv.ids.filter((id) => READY.some((r) => r.id === id)) : [];
    const cur = s.rv && rvIds.length ? READY.find((r) => r.id === rvIds[Math.min(s.rv.i, rvIds.length - 1)]) : null;
    let ed = null,
      orig = null;
    if (cur) {
      orig = IV_RDY.find((y) => y.id === cur.id);
      ed =
        s.rvEd && s.rvEd.id === cur.id
          ? s.rvEd
          : Object.assign({ id: cur.id, cust: '', add: [], fixed: false }, JSON.parse(JSON.stringify((s.store.rdy || {})[cur.id] || {})));
      const setEd = (p) => self.setState({ rvEd: Object.assign({}, ed, p) });
      const eff = ivRdyEff(orig, ed),
        c = ivReadyCalc(eff),
        cu = IV_CUST[eff.cust] || {},
        errs = ivRdyErrs(orig, ed),
        mt = ivMainTax(orig);
      const loc = IV_LOC[orig.port] || IV_LOC.SGSIN,
        nOrig = orig.charges.length;
      const m =
        window.GirsDocs && GirsDocs.model
          ? GirsDocs.model({
              no: loc[0] + 'OF' + String(orig.bl).replace(/\D/g, ''),
              type: orig.type,
              status: 'Ready',
              date: ivToday(),
              due: ivPlus(14),
              bkg: orig.bkg,
              bl: orig.bl,
              cntr: orig.cntr,
              vvd: orig.vvd,
              port: orig.port,
              cust: { code: eff.cust, name: cu.name, tax: cu.tax, addr: cu.addr },
              lines: c.lines.map((l) => ({
                code: l.code,
                name: l.name,
                amt: l.ex,
                cur: l.cur,
                roe: l.cur === c.cur ? '—' : String(l.k),
                tax: l.tax,
              })),
            })
          : null;
      const kv = (a) => a.map(([k, v]) => ({ k, v }));
      const fx = (a, cur) => {
        const u = parseFloat(String(a.unit).replace(/,/g, '')),
          q = parseFloat(a.qty);
        return ivAddOk(a) ? q * u : null;
      };
      const addRows = ed.add.map((a, i) => {
        const ex = fx(a),
          tx = ex == null ? null : Math.round(ex * mt[1]) / 100,
          ok = ivAddOk(a);
        const upd = (p) => setEd({ add: ed.add.map((y, j) => (j === i ? Object.assign({}, y, p) : y)) });
        const bad = (v, t) => (!ok && (a.t || {})[t] && !v ? 'bad' : '');
        const sg = s.riSug && s.riSug.i === i ? s.riSug : null,
          qq = String(a.q || '')
            .trim()
            .toLowerCase();
        const opts = !sg
          ? []
          : Object.keys(IV_CHG)
              .filter((k) => !qq || k.toLowerCase().includes(qq) || IV_CHG[k].toLowerCase().includes(qq))
              .slice(0, 8);
        const pick = (k) =>
          self.setState({
            riSug: null,
            rvEd: Object.assign({}, ed, { add: ed.add.map((y, j) => (j === i ? Object.assign({}, y, { code: k, q: IV_CHG[k] }) : y)) }),
          });
        const hi = sg ? Math.min(sg.hi, opts.length - 1) : -1;
        return {
          cls: 'add',
          edit: true,
          ro: false,
          name: a.code ? IV_CHG[a.code] : '',
          q: a.q || '',
          lid: 'ri-sug-' + i,
          sug: !!sg,
          sugA: sg ? 'true' : 'false',
          none: !!sg && !opts.length,
          act: hi >= 0 ? 'ri-o-' + i + '-' + hi : '',
          hErr: !ok && (a.t || {}).q && !a.code && !sg ? 'bad' : '',
          opts: opts.map((k, n) => ({
            id: 'ri-o-' + i + '-' + n,
            code: k,
            name: IV_CHG[k],
            on: n === hi ? 'true' : 'false',
            pick: (e) => {
              e.preventDefault();
              pick(k);
            },
          })),
          onQ: (e) =>
            self.setState({
              riSug: { i, hi: 0 },
              rvEd: Object.assign({}, ed, {
                add: ed.add.map((y, j) =>
                  j === i
                    ? Object.assign({}, y, {
                        q: e.target.value,
                        code: IV_CHG[y.code] === e.target.value ? y.code : '',
                        t: Object.assign({}, y.t, { q: 1 }),
                      })
                    : y,
                ),
              }),
            }),
          onFocus: () => self.setState({ riSug: { i, hi: 0 } }),
          onBlur: () =>
            setTimeout(() => {
              if (self.state.riSug && self.state.riSug.i === i) self.setState({ riSug: null });
            }, 120),
          onKey: (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
              const n = opts.length || 1;
              self.setState({ riSug: { i, hi: sg ? (hi + (e.key === 'ArrowDown' ? 1 : n - 1)) % n : 0 } });
            } else if (e.key === 'Enter' && sg && opts[hi]) {
              e.preventDefault();
              pick(opts[hi]);
            } else if (e.key === 'Escape') self.setState({ riSug: null });
          },
          qty: a.qty,
          uom: a.uom,
          unit: a.unit,
          cur: a.cur,
          qErr: bad(parseFloat(a.qty) > 0, 'qty'),
          uErr: bad(a.uom, 'uom'),
          pErr: bad(String(a.unit).trim() !== '' && parseFloat(String(a.unit).replace(/,/g, '')) >= 0, 'unit'),
          cErr: bad(a.cur, 'cur'),
          onQty: (e) => upd({ qty: e.target.value, t: Object.assign({}, a.t, { qty: 1 }) }),
          onUom: (e) => upd({ uom: e.target.value, t: Object.assign({}, a.t, { uom: 1 }) }),
          onUnit: (e) => upd({ unit: e.target.value, t: Object.assign({}, a.t, { unit: 1 }) }),
          onCur: (e) => upd({ cur: e.target.value, t: Object.assign({}, a.t, { cur: 1 }) }),
          del: () => setEd({ add: ed.add.filter((y, j) => j !== i) }),
          ex: ex == null ? '—' : ivFmt(ex),
          taxApp: mt[0] === '—' ? '—' : mt[1] + '%',
          taxSt: '',
          tax: tx == null ? '—' : ivFmt(tx),
          inc: ex == null ? '—' : ivFmt(ex + tx),
        };
      });
      const custErr = errs.some((e) => e.area === 'Customer');
      rv = {
        bl: cur.bl,
        cur: c.cur,
        hasErr: errs.length > 0,
        noErr: errs.length === 0,
        errs,
        errTitle:
          errs.length === 1
            ? '1 error to resolve before generating the invoice'
            : errs.length + ' errors to resolve before generating the invoice',
        txn: m ? m.txn : '',
        strip: m ? kv(m.strip.slice(1)) : [],
        from0: m ? m.from[0] : '',
        fromL: m ? m.from.slice(1) : [],
        cust: eff.cust,
        custCls: custErr ? 'bad' : '',
        addr: cu.addr || '—',
        // To: type-ahead customer search (same pattern as Charge head)
        ...(() => {
          const cs = s.riCu,
            open = !!cs,
            qq = open
              ? String(cs.q || '')
                  .trim()
                  .toLowerCase()
              : '';
          const keys = Object.keys(IV_CUST)
            .filter((k) => k.slice(0, 2) === loc[1])
            .filter((k) => !qq || k.toLowerCase().includes(qq) || IV_CUST[k].name.toLowerCase().includes(qq));
          const hi = open ? Math.min(cs.hi || 0, keys.length - 1) : -1;
          const pick = (k) => self.setState({ riCu: null, rvEd: Object.assign({}, ed, { cust: k }) });
          return {
            cuQ: open ? cs.q : cu.name || eff.cust,
            cuOpen: open,
            cuA: open ? 'true' : 'false',
            cuNone: open && !keys.length,
            cuAct: hi >= 0 ? 'ri-cu-' + hi : '',
            cuOpts: keys.map((k, n) => ({
              id: 'ri-cu-' + n,
              code: k,
              name: IV_CUST[k].name,
              on: n === hi ? 'true' : 'false',
              pick: (e) => {
                e.preventDefault();
                pick(k);
              },
            })),
            cuOnQ: (e) => self.setState({ riCu: { q: e.target.value, hi: 0 } }),
            cuFocus: (e) => {
              self.setState({ riCu: { q: '', hi: Math.max(0, keys.indexOf(eff.cust)) } });
            },
            cuBlur: () =>
              setTimeout(() => {
                if (self.state.riCu) self.setState({ riCu: null });
              }, 120),
            cuKey: (e) => {
              if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const n = keys.length || 1;
                self.setState({ riCu: { q: open ? cs.q : '', hi: open ? (hi + (e.key === 'ArrowDown' ? 1 : n - 1)) % n : 0 } });
              } else if (e.key === 'Enter' && open && keys[hi]) {
                e.preventDefault();
                pick(keys[hi]);
                e.target.blur();
              } else if (e.key === 'Escape') {
                self.setState({ riCu: null });
                e.target.blur();
              }
            },
          };
        })(),
        custOpts: Object.keys(IV_CUST)
          .filter((k) => k.slice(0, 2) === loc[1])
          .map((k) => ({ v: k, label: IV_CUST[k].name })),
        details: m ? kv(m.details) : [],
        ship: m ? kv(m.ship) : [],
        bank: m ? kv(m.bank) : [],
        words: m ? m.words : '',
        uoms: ['CNTR', 'BL', 'Day', 'EA'],
        curs: c.cur === loc[2] ? [c.cur] : [c.cur, loc[2]],
        lines: c.lines
          .slice(0, nOrig)
          .map((l) => ({
            cls: '',
            edit: false,
            ro: true,
            name: l.name,
            qty: l.qty,
            uom: l.uom,
            unit: ivFmt(l.unit),
            cur: l.cur,
            ex: ivFmt(l.ex),
            taxApp: l.tax === '—' ? 'Not classified' : l.rate + '%',
            taxSt: l.tax === '—' ? 'color:var(--bad);font-weight:600' : '',
            tax: ivFmt(l.tx),
            inc: ivFmt(l.inc),
          }))
          .concat(addRows),
        addCharge: () => {
          self.setState({
            riSug: { i: ed.add.length, hi: 0 },
            rvEd: Object.assign({}, ed, { add: ed.add.concat([{ code: '', q: '', qty: '', uom: '', unit: '', cur: c.cur }]) }),
          });
          setTimeout(() => {
            const l = document.querySelectorAll('.ri-tbl tr.add input[role=combobox]');
            if (l.length) l[l.length - 1].focus();
          }, 30);
        },
        totals: [
          ['Total excluding Tax', ivFmt(c.ex) + ' ' + c.cur, ''],
          ['Tax Amount', ivFmt(c.tx) + ' ' + c.cur, ''],
          ['Invoice Total', ivFmt(c.inc) + ' ' + c.cur, 'g'],
        ].map(([k, v, cls]) => ({ k, v, cls })),
      };
      rvGenDis = errs.length > 0 || !s.decl;
      rvHint = errs.length ? 'Resolve the errors to enable Generate invoice' : !s.decl ? 'Tick the declaration to generate' : '';
    }
    // ---------------- dialogs
    const d = s.dlg,
      f = s.f || {};
    const di = d && d.no ? byNo[d.no] : null;
    let dlgTitle = '',
      dlgSub = '',
      dlgCls = '',
      det = { fields: [], lines: [] },
      tbl = { cols: [], rows: [] },
      okLabel = '',
      okCls = 'btn-primary',
      dlgOk = () => {},
      dl = {},
      prf = { rows: [] },
      gen = { kv: [], fields: [], rows: [], cols: [], note: '', noteCls: '', tblTitle: '', empty: false, emptyText: '' };
    const tableOf = (cols, rows) => ({ cols, rows: rows.map((r) => ({ cells: r.map((v, n) => ({ v, cls: n === 0 ? 'mono' : '' })) })) });
    const dlFor = (name, cols, rows) => {
      const esc = (v) => '"' + String(v).replace(/"/g, '""') + '"';
      const csv =
        '﻿' +
        [cols]
          .concat(rows)
          .map((r) => r.map(esc).join(','))
          .join('\r\n');
      const html =
        '<table border="1"><tr>' +
        cols.map((c) => '<th>' + c + '</th>').join('') +
        '</tr>' +
        rows.map((r) => '<tr>' + r.map((v) => '<td>' + v + '</td>').join('') + '</tr>').join('') +
        '</table>';
      return {
        csv: () => {
          ivFile(name + '.csv', csv, 'text/csv;charset=utf-8');
          toast(name + '.csv downloaded');
        },
        xls: () => {
          ivFile(name + '.xls', '<html><meta charset="utf-8">' + html + '</html>', 'application/vnd.ms-excel');
          toast(name + '.xls downloaded');
        },
        pdf: () => {
          try {
            const w = window.open('', '_blank');
            if (w) {
              w.document.write(
                '<title>' +
                  name +
                  '</title><style>body{font:13px sans-serif;padding:24px}td,th{padding:6px 10px;text-align:left}</style><h2>' +
                  name +
                  '</h2>' +
                  html,
              );
              w.document.close();
              w.print();
            }
          } catch (e) {}
          toast('Print dialog opened · save as PDF');
        },
      };
    };
    if (d) {
      if (d.kind === 'details' && di) {
        dlgTitle = di.no;
        dlgSub = di.type + ' invoice · ' + di.party;
        dlgCls = 'wide';
        det.fields = [
          ['Invoice Type', di.type],
          ['Booking No.', di.bkg],
          ['B/L No.', di.bl],
          ['Container No.', di.cntr],
          ['Voyage/VVD', di.vvd],
          ['Billing Party', di.party],
          ['Customer Code', di.cust],
          ['Invoice Status', di.status, 'color:' + (IV_TONE[di.status] || 'var(--ink)')],
          ['Payment Status', di.pay],
          ['Due Date', di.due],
          ['Govt. Reference', di.gov],
          ['PDF/JSON Link', di.files],
          ['Audit ID', di.lines[0][5]],
        ].map(([k, v, st]) => ({ k, v, st: st || '' }));
        det.lines = di.lines.map((l) => ({
          chg: l[0],
          name: IV_CHG[l[0]] || l[0],
          amt: ivFmt(l[1]),
          cur: l[2],
          roe: l[3],
          tax: l[4],
          audit: l[5],
        }));
        const pr = primaryOf(di);
        det.showPrim = pr.label !== 'View invoice details' && !pr.dis;
        det.prim = pr.label;
        det.primRun = () => {
          self.setState({ dlg: null });
          setTimeout(() => pr.run(), 0);
        };
        det.openMenu = (e) => self.openMenu(di.no, e);
      } else if (d.kind === 'dist' && di) {
        dlgTitle = 'Distribution · ' + di.no;
        dlgSub = 'Where the invoice was sent · ' + di.party;
        const rows = ivDist(di);
        tbl = tableOf(['Channel', 'Status'], rows);
        tbl.rows.forEach((r) => {
          r.cells[0].cls = '';
        });
        dl = dlFor('Distribution ' + di.no, ['Channel', 'Status'], rows);
      } else if (d.kind === 'prf' && di) {
        dlgTitle = 'Proforma lifecycle · ' + di.no;
        dlgSub = di.party;
        const done = (s.store.prf || {})[di.no],
          paid = di.pay === 'Proforma · paid',
          amt = Object.entries(
            di.lines.reduce((a, l) => {
              a[l[2]] = (a[l[2]] || 0) + l[1];
              return a;
            }, {}),
          )
            .map(([c, v]) => c + ' ' + ivFmt(v))
            .join(' + ');
        prf = {
          rows: [
            ['Validity', '[n] days · until [Date]'],
            ['Proforma amount', amt],
            ['Payment', di.pay],
            ['Final BDR from LMS', done === 'converted' ? 'Final invoice raised' : '[Final BDR amount]'],
          ].map(([k, v]) => ({ k, v })),
          note:
            done === 'converted'
              ? 'Final invoice raised from the final BDR; the proforma payment was applied and the difference billed by debit note.'
              : done === 'transferred'
                ? 'Booking cancelled after payment. The payment is held as customer credit balance for transfer or refund.'
                : di.status === 'Cancelled'
                  ? 'Proforma cancelled. No credit note is raised for a proforma.'
                  : paid
                    ? 'Customer paid the proforma. When the final BDR is higher, the payment moves to the final invoice and the difference is billed. The original receipt is not voided.'
                    : 'Auto-cancelled at the end of the validity window if not paid.',
          noteCls: done || di.status === 'Cancelled' ? 'b-ok' : paid ? 'b-warn' : 'b-info',
          canPaid: paid && !done && di.status !== 'Cancelled',
          canCancel: !paid && !done && di.status !== 'Cancelled',
          convert: () =>
            self.put(
              (x) => {
                x.prf = x.prf || {};
                x.prf[di.no] = 'converted';
                self.ev(x, di.no, 'Converted to final invoice · proforma payment applied · debit note for the difference');
              },
              { dlg: null, __toast: di.no + ' converted · final invoice and debit note raised' },
            ),
          transfer: () =>
            self.put(
              (x) => {
                x.prf = x.prf || {};
                x.prf[di.no] = 'transferred';
                self.ev(x, di.no, 'Booking cancelled · payment held as customer credit balance');
              },
              { dlg: null, __toast: di.no + ' payment held as customer credit balance' },
            ),
          cancel: () =>
            self.put(
              (x) => {
                x.st = x.st || {};
                x.st[di.no] = 'Cancelled';
                self.ev(x, di.no, 'Proforma cancelled · no credit note raised');
              },
              { dlg: null, __toast: di.no + ' cancelled · no credit note is raised for a proforma' },
            ),
        };
      } else if (['pay', 'refund', 'cnv', 'soa', 'manual'].includes(d.kind) && di) {
        const totals = {};
        di.lines.forEach((l) => {
          totals[l[2]] = (totals[l[2]] || 0) + l[1];
        });
        const totText = Object.keys(totals)
          .map((c) => c + ' ' + ivFmt(totals[c]))
          .join(' + ');
        const KV = (a) => a.map(([k, v, st]) => ({ k, v, st: st || '' }));
        const TB = (cols, rows, right) => ({ cols: cols.map((v, n) => ({ v, cls: (right || []).includes(n) ? 'num' : '' })), rows });
        const C = (v, cls) => ({ v, cls: cls || '' });
        const fld = (label, key, o) =>
          Object.assign(
            {
              label,
              val: f[key] == null ? '' : f[key],
              on: (e) => self.setF({ [key]: e.target.value, [key + 'Err']: false }),
              isInput: true,
              isSelect: false,
              isText: false,
              cls: '',
              span: '',
              hasHint: false,
              hint: '',
              hasPh: false,
              ph: '',
              opts: [],
              hasErr: !!f[key + 'Err'],
              err: (o && o.err) || 'Required',
            },
            o || {},
          );
        const sel = (label, key, opts, o) =>
          fld(
            label,
            key,
            Object.assign(
              { isInput: false, isSelect: true, opts: opts.map((v) => (typeof v === 'string' ? { v, label: v } : v)) },
              o || {},
            ),
          );
        if (d.kind === 'pay') {
          dlgTitle = 'Payment · ' + di.no;
          dlgSub = di.party;
          dlgCls = 'wide';
          gen.kv = KV([
            ['Payment ref.', '[Payment ref.]'],
            ['Source', '[Payment source]'],
            ['Received', di.due],
            ['Amount received', totText],
            ['Matched invoice', di.no],
            ['Payment Status', di.pay, 'color:var(--ok)'],
          ]);
          gen.tblTitle = 'Reconciliation';
          Object.assign(
            gen,
            TB(
              ['Step', 'Status'],
              [
                ['GIRS', 'Receipt created'],
                ['GFS', 'Posted · matched'],
                ['Bank transaction', 'Cleared funds'],
                ['Receipt to customer', 'Emailed'],
              ].map((r) => ({ cells: [C(r[0]), C(r[1])], st: '' })),
            ),
          );
        } else if (d.kind === 'refund') {
          dlgTitle = 'Request refund · ' + di.no;
          dlgSub = di.party;
          okLabel = 'Submit refund request';
          gen.kv = KV([
            ['Payment ref.', '[Payment ref.]'],
            ['Amount paid', totText],
            ['Payment Status', di.pay],
          ]);
          gen.fields = [
            fld('Refund amount', 'amount', {
              cls: 'mono',
              hasHint: true,
              hint: di.lines[0][2] + ' · up to ' + ivFmt(totals[di.lines[0][2]]),
              err: 'Enter an amount up to the amount paid',
            }),
            sel('Reason', 'reason', ['Overpayment', 'Duplicate payment', 'Booking cancelled', 'Other'], {
              hasPh: true,
              ph: 'Select reason',
              err: 'Select a reason',
            }),
            fld('Remarks', 'note', { isInput: false, isText: true, hasHint: true, hint: 'Optional', span: 'grid-column: 1 / -1' }),
          ];
          gen.note = 'The payment is routed to the refund workflow.';
          gen.noteCls = 'b-info';
          dlgOk = () => {
            const amt = parseFloat(String(f.amount || '').replace(/,/g, '')),
              max = totals[di.lines[0][2]];
            const err = { amountErr: !(amt > 0 && amt <= max + 0.001), reasonErr: !f.reason };
            if (err.amountErr || err.reasonErr) {
              self.setF(err);
              return;
            }
            self.put(
              (x) =>
                self.ev(
                  x,
                  di.no,
                  'Refund requested · ' + di.lines[0][2] + ' ' + ivFmt(amt) + ' · ' + f.reason + (f.note ? ' · ' + f.note : ''),
                ),
              { dlg: null, __toast: 'Refund request for ' + di.no + ' submitted · routed to the refund workflow' },
            );
          };
        } else if (d.kind === 'cnv') {
          dlgTitle = 'Credit note · ' + di.no;
          dlgSub = di.party;
          dlgCls = 'wide';
          let cns = (s.store.cn || []).filter((c) => c.orig === di.no);
          if (!cns.length && di.status === 'Credited')
            cns = [
              {
                no: '[Credit note no.]',
                ctype: 'Full',
                reason: '[Reason]',
                amount: totals[di.lines[0][2]],
                cur: di.lines[0][2],
                appr: 'Approved',
              },
            ];
          gen.kv = KV([
            ['Invoice No.', di.no],
            ['Invoice Status', di.status],
            ['Invoice amount', totText],
          ]);
          gen.tblTitle = 'Credit notes against this invoice';
          Object.assign(
            gen,
            TB(
              ['Credit Note No.', 'Credit Type', 'Reason Code', 'Credit Amount', 'Currency', 'Approval Status'],
              cns.map((c) => ({
                cells: [C(c.no, 'mono'), C(c.ctype), C(c.reason), C(ivFmt(c.amount), 'mono num'), C(c.cur, 'mono'), C(c.appr)],
                st: '',
              })),
              [3],
            ),
          );
          gen.empty = !cns.length;
          gen.emptyText = 'No credit note for this invoice.';
        } else if (d.kind === 'soa') {
          const cu = IV_CUST[di.cust] || {};
          dlgTitle = 'Statement of account · ' + (cu.name || di.party);
          dlgSub = 'Customer ' + di.cust + ' · open invoices';
          dlgCls = 'wide';
          const now = Date.parse('17 Nov 2026');
          const open = INV.filter((x) => x.cust === di.cust && ['Unpaid', 'Partially paid'].includes(x.pay)).sort(
            (a, b) => (Date.parse(a.due) || 0) - (Date.parse(b.due) || 0),
          );
          const bucket = (dd) =>
            dd <= 0 ? 'Current' : dd <= 30 ? '1–30 days' : dd <= 60 ? '31–60 days' : dd <= 90 ? '61–90 days' : '90+ days';
          const byCur = {};
          let overdue = 0;
          const rows = open.map((x) => {
            const days = Math.round((now - (Date.parse(x.due) || now)) / 864e5);
            if (days > 0) overdue++;
            const c = x.lines[0][2],
              a = ivMain(x);
            byCur[c] = (byCur[c] || 0) + a;
            return {
              cells: [
                C(x.no, 'mono'),
                C(x.type),
                C(x.due),
                C(days > 0 ? String(days) : '—', 'mono num'),
                C(bucket(days)),
                C(ivFmt(a), 'mono num'),
                C(c, 'mono'),
                C(x.pay),
              ],
              st: x.no === di.no ? 'background:var(--tint)' : '',
            };
          });
          gen.kv = KV([
            ['Customer', cu.name || di.party],
            ['Customer Code', di.cust],
            ['Open invoices', String(open.length)],
            ['Overdue', String(overdue), overdue ? 'color:var(--warn)' : ''],
            [
              'Outstanding',
              Object.keys(byCur)
                .map((c) => c + ' ' + ivFmt(byCur[c]))
                .join(' · ') || '—',
            ],
          ]);
          gen.tblTitle = 'Open invoices';
          Object.assign(
            gen,
            TB(['Invoice No.', 'Invoice Type', 'Due Date', 'Days Overdue', 'Aging', 'Amount', 'Currency', 'Payment Status'], rows, [3, 5]),
          );
          gen.empty = !rows.length;
          gen.emptyText = 'No open invoices for this customer.';
        } else if (d.kind === 'manual') {
          dlgTitle = 'Create manual invoice';
          dlgSub = 'From ' + di.no + ' · ' + di.party;
          okLabel = 'Create draft';
          const curs = uniq(di.lines.map((l) => l[2]).concat(['USD']));
          gen.kv = KV([
            ['Billing Party', di.party],
            ['Customer Code', di.cust],
            ['Booking No.', di.bkg],
          ]);
          gen.fields = [
            sel('Invoice Type', 'type', ['Freight', 'DET / DEM', 'MISC', 'Proforma']),
            sel('Reason', 'reason', [
              'Ancillary (MISC) charges',
              'Single invoice outside the batch',
              'Cancelled booking with applicable charges',
            ]),
            fld('B/L No.', 'bl', { cls: 'mono', err: 'Enter the B/L number' }),
            sel(
              'Charge',
              'chg',
              Object.keys(IV_CHG).map((k) => ({ v: k, label: k + ' · ' + IV_CHG[k] })),
              { hasPh: true, ph: 'Select charge', err: 'Select a charge' },
            ),
            fld('Amount', 'amount', { cls: 'mono', err: 'Enter an amount' }),
            sel('Currency', 'cur', curs),
          ];
          gen.note = 'Created as a draft. Validate it to generate the invoice.';
          gen.noteCls = 'b-info';
          dlgOk = () => {
            const amt = parseFloat(String(f.amount || '').replace(/,/g, ''));
            const err = { blErr: !(f.bl || '').trim(), chgErr: !f.chg, amountErr: !(amt > 0) };
            if (err.blErr || err.chgErr || err.amountErr) {
              self.setF(err);
              return;
            }
            let newNo = '';
            self.put(
              (x) => {
                x.gen = x.gen || [];
                const code = f.type === 'DET / DEM' ? 'OD' : f.type === 'MISC' ? 'MI' : 'OF';
                newNo =
                  di.no.slice(0, 3) + code + String(2609500 + (x.gen.length + 1) * 7).slice(-7) + (f.type === 'Proforma' ? 'PRF' : '');
                x.gen.unshift({
                  no: newNo,
                  type: f.type,
                  bkg: di.bkg,
                  bl: f.bl.trim(),
                  cntr: di.cntr,
                  vvd: di.vvd,
                  party: di.party,
                  cust: di.cust,
                  status: 'Draft',
                  due: '—',
                  gov: '—',
                  files: '—',
                  date: ivToday(),
                  port: di.port,
                  lines: [
                    [f.chg, amt, f.cur, f.cur === 'USD' ? di.lines[0][3] : '—', di.lines[0][4], 'AUD-26-' + String(106000 + x.gen.length)],
                  ],
                });
                self.ev(x, newNo, 'Manual ' + f.type + ' invoice created as draft from ' + di.no + ' · ' + f.reason);
              },
              () => ({ dlg: null, __toast: newNo + ' created as a draft · ' + f.type }),
            );
          };
        }
        gen.hasKv = gen.kv.length > 0;
        gen.hasForm = gen.fields.length > 0;
        gen.hasTbl = gen.rows.length > 0;
        gen.hasNote = !!gen.note;
      } else if (d.kind === 'audit' && di) {
        dlgTitle = 'Audit trail · ' + di.no;
        dlgSub = 'Invoice events, newest last';
        dlgCls = 'wide';
        const rows = this.audit(di);
        tbl = tableOf(['When', 'Event', 'By'], rows);
        dl = dlFor('Audit trail ' + di.no, ['When', 'Event', 'By'], rows);
      } else if (d.kind === 'mail' && di) {
        dlgTitle = 'e-Mail / Post · ' + di.no;
        dlgSub = di.party;
        okLabel = f.ch === 'post' ? 'Queue for post' : 'Send';
        dlgOk = () => {
          if (f.ch !== 'post' && !/^[^\s@]+@[^\s@]+\.[^\s@]+(\s*[,;]\s*[^\s@]+@[^\s@]+\.[^\s@]+)*$/.test((f.to || '').trim())) {
            self.setF({ toErr: true });
            return;
          }
          if (f.ch === 'post' && !(f.to || '').trim()) {
            self.setF({ toErr: true });
            return;
          }
          self.put((x) => self.ev(x, di.no, (f.ch === 'post' ? 'Queued for post to ' : 'e-mailed to ') + f.to), {
            dlg: null,
            __toast: di.no + (f.ch === 'post' ? ' queued for post' : ' sent to ' + f.to),
          });
        };
      } else if (d.kind === 'bulkmail') {
        dlgTitle = 'e-Mail / Post · ' + selNos.length + ' invoices';
        dlgSub = "Each invoice goes to its billing party's configured channel";
        okLabel = 'Send';
        tbl = tableOf(
          ['Invoice No.', 'Billing Party', 'Channel'],
          selNos
            .slice(0, 50)
            .map((no) => [no, byNo[no].party, (IV_CUST[byNo[no].cust] || {}).mail || 'Post'])
            .concat(selNos.length > 50 ? [['+ ' + (selNos.length - 50) + ' more', '', '']] : []),
        );
        dlgOk = () =>
          self.put((x) => selNos.forEach((no) => self.ev(x, no, 'e-mailed to configured channel')), {
            dlg: null,
            sel: {},
            __toast: selNos.length + ' invoices sent to their configured channels',
          });
      } else if (d.kind === 'cn' && di) {
        dlgTitle = 'Request credit note · ' + di.no;
        dlgSub = di.party;
        okLabel = 'Submit for approval';
        dlgOk = () => {
          const tot = ivMain(di),
            amt = parseFloat(String(f.amount || '').replace(/,/g, ''));
          const needRef = ['FCA approval', 'DAR waiver'].includes(f.reason);
          const err = {
            reasonErr: !f.reason,
            amountErr: !f.full && (!(amt > 0) || amt > tot),
            amountErrText: !(amt > 0) ? 'Enter an amount above zero' : 'Cannot exceed the invoice amount ' + ivFmt(tot),
            refErr: needRef && !(f.ref || '').trim(),
          };
          if (err.reasonErr || err.amountErr || err.refErr) {
            self.setF(err);
            return;
          }
          const cnNo = di.no.slice(0, 5) + '260' + String(1000 + Math.floor(Math.random() * 8999)) + 'CR';
          const per = di.lines[0];
          const rate = { 'SG-SR-9': 9, 'IN-GST-18': 18, 'MY-SST-8': 8, 'TH-VAT-7': 7 }[per[4]] || 0;
          const camt = f.full ? tot : amt;
          const cn = {
            no: cnNo,
            orig: di.no,
            ctype: f.full ? 'Full' : 'Partial',
            ref: (f.ref || '').trim() || '—',
            reason: f.reason,
            amount: camt,
            cur: per[2],
            taxrev: per[4] + ' · ' + per[2] + ' ' + ivFmt((camt * rate) / 100),
            appr: 'Pending approval',
            repl: '—',
            gov: '—',
            audit: 'AUD-26-' + String(105000 + Math.floor(Math.random() * 900)),
          };
          self.put(
            (x) => {
              x.cn = (x.cn || []).concat([cn]);
              self.ev(x, di.no, 'Credit note ' + cnNo + ' requested · ' + f.reason);
            },
            { dlg: null, __toast: cnNo + ' submitted for approval · see Credit Note List' },
          );
          try {
            const all = JSON.parse(localStorage.getItem('girs.cn.v1') || '[]');
            all.unshift(cn);
            localStorage.setItem('girs.cn.v1', JSON.stringify(all));
          } catch (e) {}
        };
      } else if (d.kind === 'cancel' && di) {
        dlgTitle = 'Cancel invoice ' + di.no + '?';
        dlgSub = di.party;
        okLabel = 'Cancel invoice';
        okCls = 'dbtn-danger';
        dlgOk = () => {
          if (!(f.why || '').trim()) {
            self.setF({ whyErr: true });
            return;
          }
          self.put(
            (x) => {
              x.st = x.st || {};
              x.st[di.no] = 'Cancelled';
              self.ev(x, di.no, 'Cancelled · ' + f.why.trim());
            },
            { dlg: null, __toast: di.no + ' cancelled' },
          );
        };
      } else if (d.kind === 'roe' && cur) {
        dlgTitle = 'Rate of exchange · ' + cur.bl;
        dlgSub = 'Rates used for this invoice';
        tbl = tableOf(
          ['Pair', 'Rate', 'Type', 'Source', 'Rate date'],
          [['USD/SGD', '1.3412', 'Billing ROE', 'LMS · Exchange Rate Master', cur.id === 'r6' ? '11 Nov 2026' : ivToday()]],
        );
      } else if (d.kind === 'src' && cur) {
        dlgTitle = 'Source charges · ' + cur.bl;
        dlgSub = 'As received from LMS for booking ' + cur.bkg;
        dlgCls = 'wide';
        tbl = tableOf(
          ['Charge Code', 'Description', 'Qty', 'UOM', 'Rate', 'Currency', 'Source'],
          cur.charges.map((c, n) => [c[0], IV_CHG[c[0]] || c[0], String(c[1]), c[2], ivFmt(c[3]), 'USD', 'LMS charge line ' + (n + 1)]),
        );
      } else if (d.kind === 'ctx' && cur) {
        dlgTitle = 'Audit context · ' + cur.bl;
        dlgSub = 'How this B/L reached Ready to invoice';
        dlgCls = 'wide';
        const rows = [
          [ivToday() + ' 05:40', 'B/L data received from LMS · ' + cur.bkg, 'LMS'],
          [ivToday() + ' 05:45', 'Charges rated · ' + cur.charges.length + ' lines', 'GIRS rule engine'],
          [ivToday() + ' 05:46', 'Billing party and currency rules applied', 'GIRS rule engine'],
          [ivToday() + ' 05:47', 'Pre-generation validation · ' + cur.status + (cur.msg ? ' · ' + cur.msg : ''), 'GIRS rule engine'],
        ];
        tbl = tableOf(['When', 'Event', 'By'], rows);
        dl = dlFor('Audit context ' + cur.bl, ['When', 'Event', 'By'], rows);
      } else if (d.kind === 'confirm') {
        const ids = d.ids || [];
        dlgTitle = ids.length > 1 ? 'Generate ' + ids.length + ' invoices?' : 'Generate invoice?';
      }
    }
    const doGenerate = () => {
      const ids = (d && d.ids) || [];
      const made = [];
      const more = s.view === 'review' && rvIds.filter((id) => !ids.includes(id)).length > 0;
      self.put(
        (x) => {
          x.done = (x.done || []).concat(ids);
          x.gen = x.gen || [];
          ids.forEach((id) => {
            const r0 = IV_RDY.find((y) => y.id === id),
              r = ivRdyEff(r0, s.view === 'review' && ed && ed.id === id ? ed : (x.rdy || {})[id]),
              c = ivReadyCalc(r),
              cu = IV_CUST[r.cust] || {};
            const pre = r.type === 'DET / DEM' ? 'SINOD' : r.type === 'MISC' ? 'SINMI' : 'SINOF';
            const no = pre + String(2609000 + (x.gen.length + 1) * 7).slice(-7);
            const aud = 105200 + x.gen.length * 10;
            x.gen.unshift({
              no,
              type: r.type,
              bkg: r.bkg,
              bl: r.bl,
              cntr: r.cntr,
              vvd: r.vvd,
              party: cu.name,
              cust: r.cust,
              status: 'Generated',
              due: ivPlus(14),
              gov: '—',
              files: 'PDF · JSON',
              date: ivToday(),
              port: r.port,
              lines: c.lines.map((l, n) => [
                l.code,
                l.inc,
                l.cur,
                l.cur === 'USD' ? '—' : String((IV_FX.USD || {})[l.cur] || 1),
                l.tax === '—' ? 'SG-SR-9' : l.tax,
                'AUD-26-' + (aud + n),
              ]),
            });
            if (x.rdy) delete x.rdy[id];
            self.ev(x, no, 'Generated by Daniel Tan from Ready to invoice · ' + r.bl);
            made.push(no);
          });
        },
        () => ({
          dlg: null,
          rsel: {},
          decl: false,
          view: more ? 'review' : 'list',
          rv: more ? s.rv : null,
          __toast:
            (made.length > 1 ? made.length + ' invoices generated' : 'Invoice ' + made[0] + ' generated') +
            (more ? ' · next B/L ready to review' : ' · see Invoices'),
        }),
      );
    };
    const chans = [
      ['email', 'e-Mail'],
      ['post', 'Post'],
    ].map(([k, label]) => ({
      label,
      on: (f.ch || 'email') === k ? 'true' : 'false',
      pick: () =>
        self.setF({
          ch: k,
          toErr: false,
          to: k === 'post' ? (IV_CUST[di && di.cust] || {}).addr || '' : (IV_CUST[di && di.cust] || {}).mail || '',
        }),
    }));
    const ctypes = [
      ['Full', true],
      ['Partial', false],
    ].map(([label, full]) => ({
      label,
      on: !!f.full === full ? 'true' : 'false',
      pick: () => self.setF({ full, amountErr: false, amount: full && di ? ivFmt(ivMain(di)) : '' }),
    }));
    const kinds = ['details', 'audit', 'roe', 'src', 'ctx', 'bulkmail', 'dist', 'prf', 'pay', 'cnv', 'soa'];
    return {
      groups,
      cards,
      pQ: PQ.p,
      dCards: !dRows,
      dRows,
      views: [
        ['cards', 'Cards'],
        ['rows', 'Rows'],
      ].map(([k, label]) => ({
        label,
        on: (s.dview || 'cards') === k ? 'true' : 'false',
        pick: () => self.setState({ dview: k, menu: null }),
      })),
      gCount: gShown.length.toLocaleString('en-US') + ' invoice' + (gShown.length === 1 ? '' : 's'),
      cardsEmpty: cards.length === 0,
      dv: dv || {},
      hasDv: !!dv,
      noDv: !dv,
      stop: (e) => {
        try {
          e.stopPropagation();
        } catch (er) {}
      },
      gLabel: gNow[1],
      gHint: gNow[3],
      readyN: READY.length,
      hasReady: READY.length > 0,
      readyOn: s.tab === 'ready' ? 'true' : 'false',
      readySummary: ['Ready', 'Warning', 'Blocked']
        .map((k) => READY.filter((r) => r.status === k).length + ' ' + { Ready: 'ready', Warning: 'need review', Blocked: 'blocked' }[k])
        .join(' · '),
      openReady: () => self.setState({ tab: 'ready', view: 'list', menu: null }),
      backInv: () => self.setState({ tab: 'inv', view: 'list', rv: null }),
      isA,
      isB,
      isG,
      tabReady: s.tab === 'ready',
      tabInv: s.tab === 'inv',
      inList: s.view === 'list',
      inReview: s.view === 'review' && !!cur,
      readyListOn: s.view === 'list' || !cur,
      tabs: [
        ['ready', 'Ready to invoice', READY.length],
        ['inv', 'Invoices', INV.length],
      ].map(([k, label, n]) => ({ label, n, on: s.tab === k ? 'true' : 'false', pick: () => self.setState({ tab: k, menu: null }) })),
      manual: () => ivGo('ManualInvoice.dc.html'),
      goGenerate: () => ivGo('InvoiceGenerate.dc.html'),
      goList: () => ivGo('InvoiceListB.dc.html'),
      q: s.q,
      onQ: (e) => self.setState({ q: e.target.value, pg: {} }),
      fsel,
      fp,
      closeFs: () => self.setState({ fopen: null, fdv: null }),
      filtered: !!(s.q || ['fo', 'fpt', 'fs', 'fe', 'fg', 'ft', 'fc'].some((k) => ivArr(s[k]).length)),
      clearF: () => self.setState({ q: '', fo: [], fpt: [], fs: [], fe: [], fg: [], ft: [], fc: [], fopen: null, fd: null, pg: {} }),
      countText: shown.length + ' of ' + INV.length + ' invoices',
      invs,
      invEmpty: invs.length === 0,
      allOn,
      toggleAll: () => {
        const n = Object.assign({}, s.sel);
        PI.rows.forEach((i) => {
          n[i.no] = !allOn;
        });
        self.setState({ sel: n });
      },
      pInv: PI.p,
      sortSel,
      ...colsUi,
      canSelAll: allOn && selNos.length < shown.length,
      selAllText: 'Select all ' + shown.length.toLocaleString('en-US') + ' matching invoices',
      selAll: () => {
        const n = {};
        shown.forEach((i) => {
          n[i.no] = true;
        });
        self.setState({ sel: n });
      },
      hasSel: selNos.length > 0,
      selText: selNos.length.toLocaleString('en-US') + ' selected',
      clearSel: () => self.setState({ sel: {} }),
      bulkDownload: () => {
        const L = selNos.map((n) => byNo[n]).filter((i) => i.files !== '—');
        if (!L.length) {
          toast('Files are created after validation');
          return;
        }
        try {
          window.GirsDocs.invoicePdf(L.map(ivDocData), 'Invoices-' + L.length);
          const J = L.filter(ivHasJson);
          if (J.length)
            setTimeout(() => {
              try {
                window.GirsDocs.json('Invoices-' + J.length, J.map(ivDocData));
              } catch (e) {}
            }, 500);
        } catch (e) {}
        toast(
          L.length +
            ' invoice' +
            (L.length === 1 ? '' : 's') +
            ' downloaded as one PDF' +
            (L.some(ivHasJson) ? ' and JSON' : '') +
            (L.length < selNos.length ? ' · ' + (selNos.length - L.length) + ' skipped (no files yet)' : ''),
        );
      },
      bulkMail: () => self.setState({ dlg: { kind: 'bulkmail' }, f: {} }),
      menuOn: menuItems.length > 0,
      menuItems,
      menuPos,
      closeMenu: () => self.setState({ menu: null }),
      period: s.period,
      onPeriod: (e) => self.setState({ period: e.target.value }),
      ports,
      procs,
      rPort: s.rPort,
      rProc: s.rProc,
      onPort: (e) => self.setState({ rPort: e.target.value, pg: {} }),
      onProc: (e) => self.setState({ rProc: e.target.value, pg: {} }),
      rFiltered: !!(s.period || s.rPort || s.rProc || s.rKpi),
      resetR: () => self.setState({ period: '', rPort: '', rProc: '', rKpi: '' }),
      kpis,
      ready,
      pRdy: PR.p,
      readyEmpty: ready.length === 0,
      readyEmptyText: READY.length ? 'No B/Ls match these filters' : 'All B/Ls are invoiced. New B/Ls arrive with the next LMS batch run.',
      rAllOn,
      rToggleAll: () => {
        const n = Object.assign({}, s.rsel);
        selectable.forEach((r) => {
          n[r.id] = !rAllOn;
        });
        self.setState({ rsel: n });
      },
      hasRSel: rSel.length > 0,
      noRSel: rSel.length === 0,
      rSelN: rSel.length,
      genDis: rSel.length === 0 || warnSel > 0,
      genHint: warnSel
        ? warnSel + ' selected B/L' + (warnSel === 1 ? ' has' : 's have') + ' warnings · review before generating'
        : rSel.length
          ? ''
          : 'Select Ready B/Ls to generate, or open one to review',
      reviewSel: () => self.setState({ view: 'review', rv: { ids: rSel.map((r) => r.id), i: 0 }, decl: false, __toast: '' }),
      genSel: () => self.setState({ dlg: { kind: 'confirm', ids: rSel.map((r) => r.id) } }),
      backToList: () => self.setState({ view: 'list', rv: null, decl: false, rvEd: null }),
      rvCancel: () => self.setState({ view: 'list', rv: null, decl: false, rvEd: null, __toast: 'Changes discarded' }),
      rvSave: () =>
        cur &&
        self.put(
          (x) => {
            x.rdy = x.rdy || {};
            const e = JSON.parse(JSON.stringify(ed));
            delete e.id;
            x.rdy[cur.id] = e;
          },
          { rvEd: null, __toast: 'Changes saved · ' + cur.bl },
        ),
      rvResolve: () =>
        cur &&
        self.setState({
          rvEd: Object.assign({}, ed, {
            fixed: true,
            add: ed.add.map((a) =>
              ivAddOk(a)
                ? a
                : {
                    code: a.code || 'MISC',
                    q: a.code ? a.q : IV_CHG.MISC,
                    qty: parseFloat(a.qty) > 0 ? a.qty : '1',
                    uom: a.uom || 'CNTR',
                    unit: String(a.unit).trim() !== '' && parseFloat(a.unit) >= 0 ? a.unit : '0.00',
                    cur: a.cur || 'USD',
                  },
            ),
          }),
          __toast: 'All errors resolved',
        }),
      rvMany: rvIds.length > 1,
      rvPos: (s.rv ? Math.min(s.rv.i, rvIds.length - 1) + 1 : 0) + ' of ' + rvIds.length,
      rvFirst: !s.rv || s.rv.i <= 0,
      rvLast: !s.rv || s.rv.i >= rvIds.length - 1,
      rvPrev: () => self.setState({ rv: Object.assign({}, s.rv, { i: s.rv.i - 1 }), decl: false }),
      rvNext: () => self.setState({ rv: Object.assign({}, s.rv, { i: s.rv.i + 1 }), decl: false }),
      steps,
      rv,
      decl: !!s.decl,
      toggleDecl: () => self.setState({ decl: !s.decl }),
      rvGenDis,
      rvHint,
      rvGenerate: () => cur && self.setState({ dlg: { kind: 'confirm', ids: [cur.id] } }),
      viewRoe: () => self.setState({ dlg: { kind: 'roe' } }),
      viewSrc: () => self.setState({ dlg: { kind: 'src' } }),
      viewCtx: () => self.setState({ dlg: { kind: 'ctx' } }),
      dlgOn: !!d,
      dConf: !!d && d.kind === 'confirm',
      dStd: !!d && d.kind !== 'confirm',
      dlgTitle,
      dlgSub,
      dlgCls,
      confText:
        d && d.kind === 'confirm' && (d.ids || []).length > 1
          ? 'These ' + d.ids.length + ' invoices will be created immediately.'
          : 'This invoice will be created immediately.',
      dDetails: !!d && d.kind === 'details',
      dTable: !!d && ['audit', 'dist', 'roe', 'src', 'ctx', 'bulkmail'].includes(d.kind),
      dPrf: !!d && d.kind === 'prf',
      dGen: !!d && ['pay', 'refund', 'cnv', 'soa', 'manual'].includes(d.kind),
      dMail: !!d && d.kind === 'mail',
      dCn: !!d && d.kind === 'cn',
      dCancel: !!d && d.kind === 'cancel',
      dlgDl: !!d && ['audit', 'dist', 'ctx'].includes(d.kind),
      dl,
      dlgAct: (!!d && !kinds.includes(d.kind)) || (!!d && d.kind === 'bulkmail'),
      det,
      tbl,
      prf,
      gen,
      okLabel,
      okCls,
      dlgOk,
      doGenerate,
      closeDlg: () => self.setState({ dlg: null, f: {} }),
      chans,
      ctypes,
      reasons: ['FCA approval', 'DAR waiver', 'Pricing correction', 'Invoice amendment'],
      toLabel: f.ch === 'post' ? 'Postal address' : 'To',
      attach: di ? di.no + '.pdf' + (di.files.indexOf('JSON') >= 0 ? ', ' + di.no + '.json' : '') : '',
      amountHint: di ? 'Invoice amount ' + ivFmt(ivMain(di)) + ' ' + di.lines[0][2] : '',
      cancelText: di
        ? 'The invoice is cancelled in GIRS and the status flows back to LMS.' +
          (di.gov !== '—' ? ' The e-invoice ' + di.gov + ' is cancelled at the tax portal.' : '')
        : '',
      f: Object.assign({}, f, {
        onTo: (e) => self.setF({ to: e.target.value, toErr: false }),
        onMsg: (e) => self.setF({ msg: e.target.value }),
        toErrText: f.ch === 'post' ? 'Enter a postal address' : 'Enter a valid e-mail address',
        onReason: (e) => self.setF({ reason: e.target.value, reasonErr: false, refErr: false }),
        onAmount: (e) => self.setF({ amount: e.target.value, amountErr: false }),
        onRef: (e) => self.setF({ ref: e.target.value, refErr: false }),
        onWhy: (e) => self.setF({ why: e.target.value, whyErr: false }),
      }),
    };
  }
}

export { GirsPage as InvoiceListModel };
