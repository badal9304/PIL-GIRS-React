// @ts-nocheck — screen logic ported from the GIRS prototype; types are added as the screen is reworked.
/* Home view-model: Voyage Invoicing (date navigation, workload ribbon, voyages table, voyage panel,
   Ready-to-invoice popup, follow-up mail with Excel attachment) and D&D Billing.
   The working location and entity come from the top bar (state.__hub, state.__ent). */
import { ViewModel } from '../../lib/viewModel';
import {
  USER_NAME,
  HM_TODAY,
  HM_HUB,
  HM_CCY,
  HM_PORTS,
  HM_VSL,
  HM_CUST,
  HM_MISS,
  HM_BLST,
  HM_LOC,
  HM_CHG,
  HM_UOM,
  HM_CITY,
  HM_STREET,
  hmDir,
  HM_FIX,
  hmN,
  hmUsd,
  hmD,
  hmIso,
  hmAdd,
  hmDiff,
  hmFmt,
  hmRnd,
  hmTime,
  HM_CACHE,
  hmDay,
  HM_SLAB,
  HM_DDST,
  HM_DDR,
  hmSlab,
  hmDD,
  hmXlsx,
  hmDownload,
  hmSize,
} from './homeData';

export class GirsPage extends ViewModel {
  constructor(p) {
    super(p);
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem('girs.home') || '{}') || {};
    } catch (e) {}
    this.state = {
      tab: 'voy',
      from: HM_TODAY,
      to: HM_TODAY,
      view: 'range',
      win: hmAdd(HM_TODAY, -6),
      cal: false,
      dir: 'all',
      stf: 'all',
      q: '',
      sort: 'urgency',
      sdir: 1,
      grp: true,
      pg: 1,
      psz: 25,
      sel: {},
      gen: saved.gen || {},
      blGen: saved.blGen || {},
      ri: null,
      decl: false,
      mail: null,
      mailPrev: false,
      riEd: saved.riEd || {},
      riCu: null,
      riSug: null,
      fu: saved.fu || {},
      roeReq: saved.roeReq || {},
      roeSet: saved.roeSet || {},
      ddGen: saved.ddGen || {},
      ddAct: saved.ddAct || {},
      drw: '',
      drwF: '',
      drwQ: '',
      drwPg: 1,
      confirm: null,
      rateFor: '',
      rateVal: '',
      done: null,
      alertOff: false,
      ddF: 'all',
      ddQ: '',
      ddPg: 1,
    };
    try {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (this.state.mail) return this.setState({ mail: null });
          if (this.state.riCu || this.state.riSug) return this.setState({ riCu: null, riSug: null });
          if (this.state.ri) return this.setState({ ri: null, decl: false });
          this.setState({ drw: '', confirm: null, rateFor: '', cal: false });
        }
      });
    } catch (e) {}
  }
  save(patch) {
    const s = Object.assign({}, this.state, patch);
    try {
      localStorage.setItem(
        'girs.home',
        JSON.stringify({
          gen: s.gen,
          blGen: s.blGen,
          riEd: s.riEd,
          fu: s.fu,
          roeReq: s.roeReq,
          roeSet: s.roeSet,
          ddGen: s.ddGen,
          ddAct: s.ddAct,
        }),
      );
    } catch (e) {}
    this.setState(patch);
  }
  renderVals() {
    const s = this.state,
      self = this;
    const hub = s.__hub || 'SIN',
      [cty, port, cc] = HM_HUB[hub] || HM_HUB.SIN,
      ent = s.__ent || 'PIL';
    const hr = (() => {
      try {
        return new Date().getHours();
      } catch (e) {
        return 9;
      }
    })();
    const greet =
      (hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening') +
      ', ' +
      (typeof USER_NAME === 'string' ? USER_NAME.split(' ')[0] : 'Daniel');

    const live = (v) => {
      const bulk = s.gen[v.id] || 0,
        ind = Object.keys((s.blGen || {})[v.id] || {}),
        roeOk = !!s.roeSet[v.pair];
      let [inv, ready, roe, nod, hold] = v.st;
      if (roeOk && v.date <= HM_TODAY) {
        ready += roe;
        roe = 0;
      }
      const ready0 = ready,
        inv0 = inv,
        g = Math.min(ready0, bulk + ind.length);
      ready = ready0 - g;
      inv += g;
      const notDue = v.date > HM_TODAY,
        blocked = roe + nod + hold,
        open = notDue ? 0 : v.bls - inv;
      const late = v.date < HM_TODAY && open > 0;
      const status = notDue ? 'notdue' : open === 0 ? 'done' : ready ? 'ready' : 'blocked';
      return Object.assign({}, v, {
        ready0,
        inv0,
        bulk,
        ind,
        inv,
        ready,
        roe,
        nod,
        hold,
        blocked,
        open,
        notDue,
        late,
        status,
        overdueBy: late ? hmDiff(v.date, HM_TODAY) : 0,
      });
    };
    const day = (d) =>
      hmDay(port, d)
        .filter((v) => v.ent === ent)
        .map(live);
    const tally = (vs, k) => vs.reduce((a, v) => a + v[k], 0);
    // overdue = past 14 days with open invoices
    const overdue = [];
    for (let i = 1; i <= 14; i++)
      day(hmAdd(HM_TODAY, -i)).forEach((v) => {
        if (v.late) overdue.push(v);
      });

    // ---------- ribbon (14 days, movable)
    const span =
      s.view === 'overdue'
        ? []
        : (() => {
            const a = [];
            for (let d = s.from; d <= s.to; d = hmAdd(d, 1)) a.push(d);
            return a;
          })();
    const rib = [];
    for (let i = 0; i < 14; i++) rib.push(hmAdd(s.win, i));
    const ribData = rib.map((d) => {
      const vs = day(d),
        E = Math.max(1, tally(vs, 'bls'));
      return {
        d,
        vs,
        open: d > HM_TODAY ? tally(vs, 'bls') : tally(vs, 'open'),
        sI: 'width: ' + (tally(vs, 'inv') / E) * 100 + '%',
        sR: 'width: ' + (d > HM_TODAY ? 0 : tally(vs, 'ready') / E) * 100 + '%',
        sB: 'width: ' + (d > HM_TODAY ? 0 : tally(vs, 'blocked') / E) * 100 + '%',
      };
    });
    const ribMax = Math.max(1, ...ribData.map((x) => x.open));
    const ribbon = ribData.map(({ d, vs, open, sI, sR, sB }) => {
      const inR = s.view === 'range' && d >= s.from && d <= s.to,
        late = vs.some((v) => v.late),
        fut = d > HM_TODAY,
        wk = [0, 6].includes(hmD(d).getDay());
      return {
        w: d === HM_TODAY ? 'Today' : hmFmt(d, { weekday: 'short' }),
        d: hmFmt(d, { day: 'numeric', month: 'short' }),
        n: vs.length + (vs.length === 1 ? ' voyage' : ' voyages'),
        open: fut ? 'Not due' : open ? hmN(open) + ' open' : 'All invoiced',
        cls:
          'hm-rd' +
          (inR ? ' on' : '') +
          (d === HM_TODAY ? ' today' : '') +
          (late ? ' late' : '') +
          (fut ? ' fut' : '') +
          (wk ? ' wk' : '') +
          (inR && d === s.from ? ' first' : '') +
          (inR && d === s.to ? ' last' : ''),
        sI,
        sR,
        sB,
        bar: '',
        barC: 'hm-rb' + (fut ? ' fut' : late ? ' late' : open ? '' : ' done'),
        cur: inR ? 'true' : 'false',
        aria:
          hmFmt(d, { weekday: 'long', day: 'numeric', month: 'long' }) +
          ', ' +
          vs.length +
          ' voyages, ' +
          (fut ? 'not due' : hmN(open) + ' invoices open'),
        pick: (e) => {
          if (e && e.shiftKey && s.view === 'range') {
            const a = d < s.from ? d : s.from,
              b = d < s.from ? s.to : d;
            self.setState({ from: a, to: b, pg: 1, sel: {} });
          } else self.setState({ view: 'range', from: d, to: d, pg: 1, sel: {} });
        },
      };
    });
    const setRange = (a, b, keep) =>
      self.setState({
        view: 'range',
        from: a,
        to: b,
        win: hmAdd(a, -Math.max(0, Math.min(6, 13 - hmDiff(a, b)))),
        pg: 1,
        sel: {},
        cal: !!keep,
      });
    const step = s.view === 'range' ? hmDiff(s.from, s.to) + 1 : 1;
    const rangeL =
      s.view === 'overdue'
        ? 'Overdue · last 14 days'
        : s.from === s.to
          ? (s.from === HM_TODAY ? 'Today, ' : '') + hmFmt(s.from, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
          : hmFmt(s.from) + ' – ' + hmFmt(s.to, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    const nav = {
      label: rangeL,
      cal: s.cal,
      toggleCal: () => self.setState({ cal: !s.cal }),
      closeCal: () => self.setState({ cal: false }),
      prev: () =>
        s.view === 'overdue' ? setRange(hmAdd(HM_TODAY, -1), hmAdd(HM_TODAY, -1)) : setRange(hmAdd(s.from, -step), hmAdd(s.to, -step)),
      next: () => (s.view === 'overdue' ? setRange(HM_TODAY, HM_TODAY) : setRange(hmAdd(s.from, step), hmAdd(s.to, step))),
      prevL: step > 1 ? 'Previous ' + step + ' days' : 'Previous day',
      nextL: step > 1 ? 'Next ' + step + ' days' : 'Next day',
      today: () => setRange(HM_TODAY, HM_TODAY),
      isToday: s.view === 'range' && s.from === HM_TODAY && s.to === HM_TODAY,
      winPrev: () => self.setState({ win: hmAdd(s.win, -7) }),
      winNext: () => self.setState({ win: hmAdd(s.win, 7) }),
      winL: hmFmt(rib[0], { day: 'numeric', month: 'short' }) + ' – ' + hmFmt(rib[13], { day: 'numeric', month: 'short', year: 'numeric' }),
      from: s.view === 'range' ? s.from : HM_TODAY,
      to: s.view === 'range' ? s.to : HM_TODAY,
      onFrom: (e) => {
        const v = e.target.value;
        if (v) setRange(v, v > s.to ? v : s.to, true);
      },
      onTo: (e) => {
        const v = e.target.value;
        if (v) setRange(v < s.from ? v : s.from, v, true);
      },
      presets: [
        ['Today', HM_TODAY, HM_TODAY],
        ['Yesterday', hmAdd(HM_TODAY, -1), hmAdd(HM_TODAY, -1)],
        ['Tomorrow', hmAdd(HM_TODAY, 1), hmAdd(HM_TODAY, 1)],
        ['Last 7 days', hmAdd(HM_TODAY, -6), HM_TODAY],
        ['Next 7 days', HM_TODAY, hmAdd(HM_TODAY, 6)],
        ['This week', hmAdd(HM_TODAY, -((hmD(HM_TODAY).getDay() + 6) % 7)), hmAdd(HM_TODAY, 6 - ((hmD(HM_TODAY).getDay() + 6) % 7))],
        ['This month', HM_TODAY.slice(0, 8) + '01', hmIso(new Date(hmD(HM_TODAY).getFullYear(), hmD(HM_TODAY).getMonth() + 1, 0))],
      ].map(([l, a, b]) => ({ l, cur: s.view === 'range' && s.from === a && s.to === b ? 'true' : 'false', pick: () => setRange(a, b) })),
      ovN: String(overdue.length),
      ovOpen: hmN(tally(overdue, 'open')),
      ovOn: s.view === 'overdue' ? 'true' : 'false',
      ovCls: 'hm-ov' + (overdue.length ? '' : ' none') + (s.view === 'overdue' ? ' on' : ''),
      ovGo: () => self.setState({ view: 'overdue', pg: 1, sel: {}, cal: false }),
    };

    // ---------- scope + filters
    const scopeAll = s.view === 'overdue' ? overdue : [].concat(...span.slice(0, 62).map(day));
    const q = s.q.trim().toUpperCase();
    const byDirQ = scopeAll.filter(
      (v) =>
        (s.dir === 'all' || v.dir === s.dir) &&
        (!q || (v.no + ' ' + v.vessel + ' ' + v.svc + ' ' + v.pol + ' ' + v.pod).toUpperCase().includes(q)),
    );
    const inSt = (v, k) => k === 'all' || (k === 'ready' ? v.ready > 0 : k === 'blocked' ? v.blocked > 0 && !v.notDue : v.status === k);
    const stCount = (k) => byDirQ.filter((v) => inSt(v, k)).length;
    const filtered = byDirQ.filter((v) => inSt(v, s.stf));
    const urg = (v) => (v.late ? 0 : v.status === 'blocked' ? 1 : v.status === 'ready' ? 2 : v.status === 'notdue' ? 3 : 4);
    const keyf = {
      urgency: (v) => urg(v) * 1e7 - v.open,
      date: (v) => hmD(v.date).getTime(),
      no: (v) => v.no,
      vessel: (v) => v.vessel,
      exp: (v) => v.bls,
      ready: (v) => v.ready,
      blocked: (v) => v.blocked,
      inv: (v) => v.inv / v.bls,
    };
    const kf = keyf[s.sort] || keyf.urgency;
    const sorted = filtered.slice().sort((a, b) => {
      if (s.grp && span.length > 1 && a.date !== b.date) return a.date < b.date ? -1 : 1;
      const x = kf(a),
        y = kf(b);
      return (x < y ? -1 : x > y ? 1 : 0) * s.sdir || (a.no < b.no ? -1 : 1);
    });
    const size = s.psz,
      pages = Math.max(1, Math.ceil(sorted.length / size)),
      pn = Math.min(s.pg, pages),
      off = (pn - 1) * size;
    const pageRows = sorted.slice(off, off + size);
    const go = (v) => () => self.setState({ pg: v });
    const pager = {
      text: sorted.length
        ? 'Showing ' + (off + 1) + '–' + Math.min(off + size, sorted.length) + ' of ' + hmN(sorted.length) + ' voyages'
        : 'No voyages',
      pos: pn + ' / ' + pages,
      firstDis: pn <= 1,
      prevDis: pn <= 1,
      nextDis: pn >= pages,
      lastDis: pn >= pages,
      first: go(1),
      prev: go(pn - 1),
      next: go(pn + 1),
      last: go(pages),
      size: String(size),
      onSize: (e) => self.setState({ psz: parseInt(e.target.value, 10), pg: 1 }),
    };
    const selIds = Object.keys(s.sel).filter((k) => s.sel[k]);
    const toggle = (id) => self.setState({ sel: Object.assign({}, s.sel, { [id]: !s.sel[id] }) });
    const allOn = pageRows.length && pageRows.every((v) => s.sel[v.id]);
    const sortBy = (k) => () =>
      self.setState({
        sort: k,
        sdir: s.sort === k ? -s.sdir : k === 'urgency' || k === 'date' || k === 'no' || k === 'vessel' ? 1 : -1,
        pg: 1,
      });
    const th = (k, l, cls) => ({
      l,
      cls: (cls || '') + ' hm-sth',
      on: sortBy(k),
      aria: s.sort === k ? (s.sdir > 0 ? 'ascending' : 'descending') : 'none',
      ic: s.sort === k ? (s.sdir > 0 ? '↑' : '↓') : '',
    });
    const cols = {
      no: th('no', 'Voyage No.', 'c-no'),
      vessel: th('vessel', 'Vessel'),
      date: th('date', 'ETD / ETA'),
      due: th('urgency', 'Invoice due'),
      inv: th('inv', 'Invoiced'),
      ready: th('ready', 'Ready', 'r'),
      blocked: th('blocked', 'Blocked', 'r'),
    };
    const row = (v) => {
      const due = v.notDue
        ? { l: 'Not due', c: 'hm-due nd' }
        : v.late
          ? { l: 'Overdue ' + v.overdueBy + (v.overdueBy === 1 ? ' day' : ' days'), c: 'hm-due late' }
          : v.open
            ? v.date === HM_TODAY
              ? { l: 'Due today', c: 'hm-due today' }
              : { l: 'Open', c: 'hm-due today' }
            : { l: 'Complete', c: 'hm-due ok' };
      const why = [v.roe ? 'ROE ' + hmN(v.roe) : '', v.nod ? 'Data ' + hmN(v.nod) : '', v.hold ? 'Split ' + hmN(v.hold) : '']
        .filter(Boolean)
        .join(' · ');
      return {
        id: v.id,
        no: v.no,
        vessel: v.vessel,
        svc: v.svc,
        typeL: v.dir === 'E' ? 'Export' : 'Import',
        typeC: 'chip t-neutral dot-' + v.dir.toLowerCase(),
        route: v.pol + ' → ' + v.pod,
        date: (v.dir === 'E' ? 'ETD ' : 'ETA ') + hmFmt(v.date, { day: 'numeric', month: 'short' }),
        dueL: due.l,
        dueC: due.c,
        invL: v.notDue ? '— / ' + hmN(v.bls) : hmN(v.inv) + ' / ' + hmN(v.bls),
        bI: 'width: ' + (v.inv / v.bls) * 100 + '%',
        bR: 'width: ' + (v.ready / v.bls) * 100 + '%',
        bB: 'width: ' + (v.notDue ? 0 : v.blocked / v.bls) * 100 + '%',
        ready: v.notDue ? '—' : hmN(v.ready),
        readyC: v.ready ? 'r' : 'r mu',
        blocked: v.notDue ? '—' : hmN(v.blocked),
        blockedC: v.blocked && !v.notDue ? 'r hm-wn' : 'r mu',
        why,
        on: !!s.sel[v.id],
        chk: () => toggle(v.id),
        chkL: 'Select ' + v.no,
        cls: s.sel[v.id] ? 'on' : '',
        canGen: v.ready > 0,
        genL: 'Generate ' + hmN(v.ready),
        noGen: !v.ready,
        noGenL: v.notDue ? 'Awaiting LMS' : v.open ? 'Blocked' : 'Done',
        open: () => self.setState({ drw: v.id, drwF: v.blocked && !v.ready ? 'blocked' : '', drwQ: '', drwPg: 1 }),
        openL: 'Open voyage ' + v.no,
        gen: () => self.setState({ confirm: { kind: 'voy', ids: [v.id] } }),
      };
    };
    const groups = [];
    const multi = s.grp && span.length > 1;
    pageRows.forEach((v) => {
      const g = multi ? v.date : 'all';
      let G = groups.find((x) => x.k === g);
      if (!G) {
        G = { k: g, rows: [] };
        groups.push(G);
      }
      G.rows.push(row(v));
    });
    const grouped = groups.map((G) => {
      const vs = sorted.filter((v) => v.date === G.k);
      return {
        show: multi,
        l: multi ? (G.k === HM_TODAY ? 'Today · ' : '') + hmFmt(G.k, { weekday: 'long', day: 'numeric', month: 'short' }) : '',
        m: multi
          ? vs.length +
            (vs.length === 1 ? ' voyage' : ' voyages') +
            (G.k > HM_TODAY ? ' · not due' : ' · ' + hmN(tally(vs, 'open')) + ' open')
          : '',
        rows: G.rows,
      };
    });

    // ---------- summary (scope after direction / search filter)
    const S = byDirQ,
      E = tally(S, 'bls'),
      I = tally(S, 'inv'),
      R = tally(S, 'ready'),
      B = tally(
        S.filter((v) => !v.notDue),
        'blocked',
      ),
      W = tally(
        S.filter((v) => v.notDue),
        'bls',
      );
    const pc = (n) => 'width: ' + (E ? (n / E) * 100 : 0) + '%';
    const glance = {
      stats: [
        ['Expected', hmN(E), ''],
        ['Invoiced', hmN(I), 'inv'],
        ['Ready', hmN(R), 'rdy'],
        ['Blocked', hmN(B), 'blk'],
      ]
        .concat(W ? [['Not due yet', hmN(W), 'nd']] : [])
        .map(([l, v, k]) => ({ l, v, k: 'hm-dot ' + k, has: !!k })),
      bI: pc(I),
      bR: pc(R),
      bB: pc(B),
      bW: pc(W),
      pct: E ? Math.round((I / E) * 100) + '% invoiced' : '',
      voy: hmN(S.length) + (S.length === 1 ? ' voyage' : ' voyages'),
    };

    const pool0 = scopeAll.concat(overdue);
    // ---------- B/L enumeration (same order as the voyage panel)
    const blSeq = (v) => {
      const q2 = [];
      const push = (k, n) => {
        for (let j = 0; j < n; j++) q2.push(k);
      };
      if (v.notDue) return q2;
      push('roe', v.roe);
      push('nod', v.nod);
      push('hold', v.hold);
      const r0 = q2.length;
      push('ready', v.ready0);
      push('inv', v.inv0);
      v.ind.forEach((j) => {
        if (q2[+j] === 'ready') q2[+j] = 'inv';
      });
      let b = v.bulk;
      for (let j = r0 + v.ready0 - 1; j >= r0 && b > 0; j--)
        if (q2[j] === 'ready') {
          q2[j] = 'inv';
          b--;
        }
      return q2;
    };
    const blRow = (v, i) => {
      const r = hmRnd(v.id + i);
      r();
      const ctr = 1 + Math.floor(r() * 3);
      return {
        bl: v.here.slice(2) + v.no.slice(0, 6) + String(i + 1).padStart(4, '0'),
        cust: HM_CUST[Math.floor(hmRnd(v.id + i)() * HM_CUST.length)],
        ctr,
        amt: Math.round(v.avg * (0.6 + r() * 0.8) * 100) / 100,
      };
    };
    const MAILR = {
      nod: {
        l: 'Data not received from LMS',
        to: 'Port Agency · Documentation <docs.' + port.toLowerCase() + '@pilship.com>',
        file: 'Missing_LMS_data',
        extra: ['Missing data'],
      },
      roe: {
        l: 'ROE not received',
        to: 'Treasury · ROE desk <treasury.roe@pilship.com>',
        file: 'ROE_request',
        extra: ['Currency pair', 'Rate date'],
      },
      hold: {
        l: 'Split-payer unconfirmed',
        to: 'Customer Service <cs.' + port.toLowerCase() + '@pilship.com>',
        file: 'Split_payer_confirmation',
        extra: ['Issue'],
      },
    };
    const mailRows = (m) => {
      const vs = m.ids.map((id) => pool0.find((v) => v.id === id)).filter(Boolean);
      const out = [];
      vs.forEach((v) =>
        blSeq(v).forEach((k, i) => {
          if (k !== m.reason || (m.pair && v.pair !== m.pair)) return;
          const b = blRow(v, i),
            d = hmFmt(v.date, { day: '2-digit', month: 'short', year: 'numeric' });
          out.push(
            [v.no, v.vessel, v.dir === 'E' ? 'Export' : 'Import', v.pol, v.pod, d, b.bl, b.cust, b.ctr, b.amt].concat(
              m.reason === 'nod'
                ? [HM_MISS[i % HM_MISS.length]]
                : m.reason === 'roe'
                  ? [v.pair, d]
                  : ['Second payer and share not confirmed'],
            ),
          );
        }),
      );
      return { vs, rows: out };
    };
    const openMail = (reason, vs, opt) => {
      const o = opt || {},
        R = MAILR[reason],
        m0 = { reason, ids: vs.map((v) => v.id), pair: o.pair || '' },
        mr = mailRows(m0);
      const n = mr.rows.length,
        amt = mr.rows.reduce((a, r) => a + r[9], 0),
        nos = vs.map((v) => v.no);
      const voyL = nos.length > 6 ? nos.slice(0, 6).join(', ') + ' and ' + (nos.length - 6) + ' more' : nos.join(', ');
      const sign =
        '\n\nRegards,\n' + (typeof USER_NAME === 'string' ? USER_NAME : 'Daniel Tan') + '\nBilling Executive · ' + cty + ' (' + port + ')';
      const sub =
        reason === 'nod'
          ? 'Missing B/L data from LMS — ' + hmN(n) + ' B/Ls on hold · ' + port + ' · ' + (o.scope || rangeL)
          : reason === 'roe'
            ? 'ROE request — ' +
              o.pair +
              ' for ' +
              hmFmt(HM_TODAY, { day: 'numeric', month: 'short', year: 'numeric' }) +
              ' · ' +
              hmN(n) +
              ' invoices waiting'
            : 'Split-payer confirmation needed — ' + hmN(n) + ' B/Ls · ' + port;
      const body =
        reason === 'nod'
          ? 'Hello team,\n\nThe B/Ls in the attached sheet are blocked from invoicing at ' +
            port +
            ' because their data has not been received from LMS. The missing item is listed against each B/L.\n\nVoyages: ' +
            voyL +
            '\nB/Ls: ' +
            hmN(n) +
            ' · Amount on hold: ' +
            hmUsd(amt) +
            '\n\nPlease complete the data in LMS and resend it, or reply with an expected date.' +
            sign
          : reason === 'roe'
            ? 'Hello Treasury,\n\nThe daily rate of exchange for ' +
              o.pair +
              ' has not been received in GIRS. ' +
              hmN(n) +
              ' invoices on the voyages below cannot be generated until the rate is available. Details are in the attached sheet.\n\nVoyages: ' +
              voyL +
              '\nAmount on hold: ' +
              hmUsd(amt) +
              '\n\nPlease publish the rate or reply with the approved rate so it can be entered manually.' +
              sign
            : 'Hello team,\n\nThe B/Ls in the attached sheet have a split payer that is not confirmed. Please confirm the second payer and the share for each B/L so the invoices can be generated.\n\nVoyages: ' +
              voyL +
              '\nB/Ls: ' +
              hmN(n) +
              ' · Amount on hold: ' +
              hmUsd(amt) +
              sign;
      const file = R.file + '_' + port + '_' + HM_TODAY.replace(/-/g, '') + '.xlsx';
      const blob = hmXlsx(
        R.l,
        ['Voyage No.', 'Vessel', 'Direction', 'POL', 'POD', 'ETD / ETA', 'B/L No.', 'Billing party', 'Containers', 'Amount (USD)'].concat(
          R.extra,
        ),
        mr.rows,
      );
      self.setState({
        mail: Object.assign(m0, {
          to: R.to,
          cc: (typeof USER_NAME === 'string' ? USER_NAME.toLowerCase().replace(/\s+/g, '.') : 'daniel.tan') + '@pilship.com',
          sub,
          body,
          file,
          size: hmSize(blob.size),
          n,
          keys: o.keys || [],
        }),
        mailPrev: false,
      });
    };

    // ---------- reasons (rail)
    const due = S.filter((v) => !v.notDue);
    const reasons = [];
    const nodV = due.filter((v) => v.nod);
    if (nodV.length) {
      const key = 'nod:' + port + ':' + rangeL,
        sent = s.fu[key];
      reasons.push({
        r: 'Data not received from LMS',
        own: 'Port agency · Documentation',
        n: hmN(tally(nodV, 'nod')),
        v: nodV.length + (nodV.length === 1 ? ' voyage' : ' voyages'),
        amt: hmUsd(nodV.reduce((a, v) => a + v.nod * v.avg, 0)),
        st: sent ? 'Follow-up sent ' + sent : '',
        hasSt: !!sent,
        act: sent ? 'Remind' : 'Send follow-up',
        go: () => openMail('nod', nodV, { keys: [['fu', key]] }),
      });
    }
    const pairs = {};
    due
      .filter((v) => v.roe)
      .forEach((v) => {
        (pairs[v.pair] = pairs[v.pair] || []).push(v);
      });
    Object.keys(pairs).forEach((pr) => {
      const vs = pairs[pr],
        req = s.roeReq[pr];
      reasons.push({
        r: 'ROE not received · ' + pr,
        own: 'Treasury · ROE feed',
        n: hmN(tally(vs, 'roe')),
        v: vs.length + (vs.length === 1 ? ' voyage' : ' voyages'),
        amt: hmUsd(vs.reduce((a, v) => a + v.roe * v.avg, 0)),
        st: req ? 'Requested ' + req : '',
        hasSt: !!req,
        act: req ? 'Enter rate' : 'Request ROE',
        go: () => (req ? self.setState({ rateFor: pr, rateVal: '' }) : openMail('roe', vs, { pair: pr, keys: [['roeReq', pr]] })),
      });
    });
    const holdV = due.filter((v) => v.hold);
    if (holdV.length) {
      const key = 'hold:' + port + ':' + rangeL,
        sent = s.fu[key];
      reasons.push({
        r: 'Split-payer unconfirmed',
        own: 'Customer service',
        n: hmN(tally(holdV, 'hold')),
        v: holdV.length + (holdV.length === 1 ? ' voyage' : ' voyages'),
        amt: hmUsd(holdV.reduce((a, v) => a + v.hold * v.avg, 0)),
        st: sent ? 'Follow-up sent ' + sent : '',
        hasSt: !!sent,
        act: sent ? 'Remind' : 'Send follow-up',
        go: () => openMail('hold', holdV, { keys: [['fu', key]] }),
      });
    }

    // ---------- bulk
    const selV = scopeAll.filter((v) => s.sel[v.id]);
    const bulk = {
      show: selIds.length > 0,
      n: selV.length + (selV.length === 1 ? ' voyage selected' : ' voyages selected'),
      ready: tally(selV, 'ready'),
      genL: 'Generate ' + hmN(tally(selV, 'ready')) + ' ready',
      genDis: !tally(selV, 'ready'),
      gen: () => self.setState({ confirm: { kind: 'voy', ids: selV.filter((v) => v.ready).map((v) => v.id) } }),
      fu: () =>
        openMail(
          'nod',
          selV.filter((v) => v.nod),
          { scope: selV.length + ' selected voyages' },
        ),
      fuDis: !tally(selV, 'nod'),
      exp: () => self.setState({ __toast: 'Export to Excel prepared — ' + selV.length + ' voyages.' }),
      clear: () => self.setState({ sel: {} }),
    };

    // ---------- voyage panel
    let drw = { show: false, bls: [], reasons: [], filters: [] };
    const dv = s.drw ? scopeAll.find((v) => v.id === s.drw) || overdue.find((v) => v.id === s.drw) : null;
    if (dv) {
      const seq = [];
      const push = (k, n) => {
        for (let i = 0; i < n; i++) seq.push(k);
      };
      if (!dv.notDue) {
        push('roe', dv.roe);
        push('nod', dv.nod);
        push('hold', dv.hold);
        const r0 = seq.length;
        push('ready', dv.ready0);
        push('inv', dv.inv0);
        dv.ind.forEach((i) => {
          if (seq[+i] === 'ready') seq[+i] = 'inv';
        });
        let b = dv.bulk;
        for (let j = r0 + dv.ready0 - 1; j >= r0 && b > 0; j--)
          if (seq[j] === 'ready') {
            seq[j] = 'inv';
            b--;
          }
      }
      const dq = s.drwQ.trim().toUpperCase();
      const want = (k) => !s.drwF || (s.drwF === 'blocked' ? ['roe', 'nod', 'hold'].includes(k) : k === s.drwF);
      const blno = (i) => dv.here.slice(2) + dv.no.slice(0, 6) + String(i + 1).padStart(4, '0');
      const custOf = (i) => HM_CUST[Math.floor(hmRnd(dv.id + i)() * HM_CUST.length)];
      const idx = [];
      seq.forEach((k, i) => {
        if (want(k) && (!dq || (blno(i) + ' ' + custOf(i)).toUpperCase().includes(dq))) idx.push(i);
      });
      const dps = 50,
        dpages = Math.max(1, Math.ceil(idx.length / dps)),
        dpn = Math.min(s.drwPg, dpages);
      const dgo = (v) => () => self.setState({ drwPg: v });
      drw = {
        show: true,
        no: dv.no,
        vessel: dv.vessel,
        svc: dv.svc,
        typeL: dv.dir === 'E' ? 'Export' : 'Import',
        typeC: 'chip t-neutral dot-' + dv.dir.toLowerCase(),
        route: dv.pol + ' → ' + dv.pod,
        date: (dv.dir === 'E' ? 'ETD ' : 'ETA ') + hmFmt(dv.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
        stats: [
          ['Expected', hmN(dv.bls)],
          ['Invoiced', hmN(dv.inv)],
          ['Ready', hmN(dv.ready)],
          ['Blocked', hmN(dv.notDue ? 0 : dv.blocked)],
        ].map(([l, v]) => ({ l, v })),
        bI: 'width: ' + (dv.inv / dv.bls) * 100 + '%',
        bR: 'width: ' + (dv.ready / dv.bls) * 100 + '%',
        bB: 'width: ' + (dv.notDue ? 0 : dv.blocked / dv.bls) * 100 + '%',
        reasons: [
          ['nod', 'Data not received from LMS', 'Port agency'],
          ['roe', 'ROE not received · ' + dv.pair, 'Treasury'],
          ['hold', 'Split-payer unconfirmed', 'Customer service'],
        ]
          .filter(([k]) => dv[k] > 0 && !dv.notDue)
          .map(([k, l, o]) => {
            const key = 'v:' + dv.id + ':' + k,
              sent = k === 'roe' ? s.roeReq[dv.pair] : s.fu[key];
            return {
              l,
              o,
              n: hmN(dv[k]),
              st: sent ? (k === 'roe' ? 'Requested ' : 'Sent ') + sent : '',
              hasSt: !!sent,
              act: k === 'roe' ? (sent ? 'Enter rate' : 'Request ROE') : sent ? 'Remind' : 'Send follow-up',
              go: () =>
                k === 'roe' && sent
                  ? self.setState({ rateFor: dv.pair, rateVal: '' })
                  : openMail(k, [dv], {
                      pair: k === 'roe' ? dv.pair : '',
                      scope: 'voyage ' + dv.no,
                      keys: k === 'roe' ? [['roeReq', dv.pair]] : [['fu', key]],
                    }),
            };
          }),
        hasReasons: dv.blocked > 0 && !dv.notDue,
        filters: [
          ['', 'All', dv.notDue ? 0 : dv.bls],
          ['ready', 'Ready', dv.ready],
          ['blocked', 'Blocked', dv.notDue ? 0 : dv.blocked],
          ['inv', 'Invoiced', dv.inv],
        ].map(([k, l, n]) => ({ l, n: hmN(n), cur: s.drwF === k ? 'true' : 'false', pick: () => self.setState({ drwF: k, drwPg: 1 }) })),
        q: s.drwQ,
        onQ: (e) => self.setState({ drwQ: e.target.value, drwPg: 1 }),
        bls: idx.slice((dpn - 1) * dps, dpn * dps).map((i, n, pageIdx) => {
          const k = seq[i],
            r = hmRnd(dv.id + i);
          r();
          return {
            open: () => self.setState({ ri: { vid: dv.id, list: pageIdx.slice(), i: n }, decl: false }),
            openL: 'Open B/L ' + blno(i) + ' — ' + HM_BLST[k][0],
            bl: blno(i),
            cust: custOf(i),
            ctr: String(1 + Math.floor(r() * 3)),
            amt: hmUsd(dv.avg * (0.6 + r() * 0.8)),
            st: HM_BLST[k][0],
            stC: 'chip t-' + HM_BLST[k][1],
            note:
              k === 'nod'
                ? 'Missing: ' + HM_MISS[i % HM_MISS.length]
                : k === 'roe'
                  ? dv.pair + ' for ' + hmFmt(dv.date, { day: 'numeric', month: 'short' })
                  : k === 'hold'
                    ? 'Second payer not confirmed'
                    : k === 'inv'
                      ? 'INV-' + dv.here.slice(0, 2) + '-' + dv.no + '-' + String(i + 1).padStart(4, '0')
                      : '',
          };
        }),
        noBls: !idx.length,
        noBlsL: dv.notDue ? 'LMS sends B/L data for this voyage at cut-off. Nothing to do yet.' : 'No B/Ls match.',
        pg: {
          text: idx.length ? (dpn - 1) * dps + 1 + '–' + Math.min(dpn * dps, idx.length) + ' of ' + hmN(idx.length) : '',
          pos: dpn + ' / ' + dpages,
          prevDis: dpn <= 1,
          nextDis: dpn >= dpages,
          prev: dgo(dpn - 1),
          next: dgo(dpn + 1),
          show: dpages > 1,
        },
        canGen: dv.ready > 0,
        genL: 'Generate ' + hmN(dv.ready) + ' ready',
        gen: () => self.setState({ confirm: { kind: 'voy', ids: [dv.id] } }),
        list: 'invoice-list-v2.html?q=' + dv.no,
        close: () => self.setState({ drw: '' }),
      };
    }

    // ---------- Ready to invoice (one B/L)
    let ri = { show: false, errs: [], strip: [], fromL: [], details: [], ship: [], lines: [], bank: [], totals: [] };
    if (s.ri && dv && s.ri.vid === dv.id) {
      const seq2 = [];
      const push2 = (k, n) => {
        for (let j = 0; j < n; j++) seq2.push(k);
      };
      push2('roe', dv.roe);
      push2('nod', dv.nod);
      push2('hold', dv.hold);
      const r0 = seq2.length;
      push2('ready', dv.ready0);
      push2('inv', dv.inv0);
      dv.ind.forEach((j) => {
        if (seq2[+j] === 'ready') seq2[+j] = 'inv';
      });
      let bb = dv.bulk;
      for (let j = r0 + dv.ready0 - 1; j >= r0 && bb > 0; j--)
        if (seq2[j] === 'ready') {
          seq2[j] = 'inv';
          bb--;
        }
      const L = s.ri.list,
        pos = Math.min(s.ri.i, L.length - 1),
        i = L[pos],
        k = seq2[i] || 'ready';
      const loc = HM_LOC[dv.here] || ['USD', 1, 'VAT-0', 'ZR-INTL'];
      const r = hmRnd(dv.id + i);
      r();
      const cust = HM_CUST[Math.floor(hmRnd(dv.id + i)() * HM_CUST.length)],
        ctr = 1 + Math.floor(r() * 3),
        amt = dv.avg * (0.6 + r() * 0.8);
      const bl = dv.here.slice(2) + dv.no.slice(0, 6) + String(i + 1).padStart(4, '0');
      const roeTxt = k === 'roe' ? '' : String(1 / loc[1]); // local → USD multiplier
      const lines = (
        dv.dir === 'E'
          ? [
              ['OFT', 'Ocean Freight', amt * 0.7, 'USD', '—', loc[3]],
              ['BAF', 'Bunker Adjustment Factor', amt * 0.12, 'USD', '—', loc[3]],
              ['THC', 'Terminal Handling Charge (Origin)', amt * 0.12 * loc[1], loc[0], roeTxt, loc[2]],
              ['DOC', 'Documentation Fee', 45 * loc[1], loc[0], roeTxt, loc[2]],
              ['SEAL', 'Seal Fee', 12 * ctr * loc[1], loc[0], roeTxt, loc[2]],
            ]
          : [
              ['OFT', 'Ocean Freight (Collect)', amt * 0.68, 'USD', '—', loc[3]],
              ['THC', 'Terminal Handling Charge (Destination)', amt * 0.14 * loc[1], loc[0], roeTxt, loc[2]],
              ['DO', 'Delivery Order Fee', 60 * loc[1], loc[0], roeTxt, loc[2]],
              ['CLN', 'Container Cleaning', 25 * ctr * loc[1], loc[0], roeTxt, loc[2]],
            ]
      ).map(([code, name, a, cur, roe, tax]) => ({ code, name, amt: Math.round(a * 100) / 100, cur, roe, tax }));
      const cc2 = dv.here.slice(0, 2),
        dir = hmDir(cc2),
        key = dv.id + '#' + i;
      const dflt = dir.find((c) => c.name.indexOf(cust) === 0) || dir[0];
      const ed = Object.assign({ cust: dflt.code, add: [] }, (s.riEd || {})[key] || {});
      const putEd = (p) => self.save({ riEd: Object.assign({}, s.riEd, { [key]: Object.assign({}, ed, p) }) });
      const cu = dir.find((c) => c.code === ed.cust) || null;
      const rate = (tax) => {
        const m2 = String(tax).match(/-(\d+(?:\.\d+)?)$/);
        return /^ZR/.test(tax) ? 0 : m2 ? Number(m2[1]) : 0;
      };
      const okAdd = (a) =>
        !!a.code &&
        parseFloat(a.qty) > 0 &&
        !!a.uom &&
        !!a.cur &&
        String(a.unit).trim() !== '' &&
        parseFloat(String(a.unit).replace(/,/g, '')) >= 0;
      const addLines = ed.add.filter(okAdd).map((a) => ({
        code: a.code,
        name: HM_CHG[a.code],
        amt: parseFloat(a.qty) * parseFloat(String(a.unit).replace(/,/g, '')),
        cur: a.cur,
        roe: a.cur === 'USD' ? '—' : roeTxt,
        tax: a.cur === 'USD' ? loc[3] : loc[2],
      }));
      const due = hmAdd(HM_TODAY, 14);
      const m =
        window.GirsDocs && GirsDocs.model
          ? GirsDocs.model({
              no: bl,
              type: 'Freight',
              status: 'Ready',
              date: HM_TODAY,
              due,
              bl,
              cntr: String(ctr) + ' × 40HC',
              vvd: '',
              port: dv.here,
              cust: { code: ed.cust, name: cu ? cu.name : '', tax: '', addr: cu ? cu.addr : '' },
              lines: lines.concat(addLines),
            })
          : null;
      const custCode = ed.cust;
      const kv = (a) => a.map(([kk, v]) => ({ k: kk, v }));
      const errs =
        k === 'roe'
          ? [
              {
                area: 'Exchange rate',
                text:
                  dv.pair +
                  ' rate for ' +
                  hmFmt(dv.date, { day: 'numeric', month: 'short', year: 'numeric' }) +
                  ' not received from Treasury — local charges cannot be converted.',
              },
            ]
          : k === 'nod'
            ? [{ area: 'LMS data', text: HM_MISS[i % HM_MISS.length] + ' not received from LMS for this B/L.' }]
            : k === 'hold'
              ? [{ area: 'Billing party', text: 'Split-payer not confirmed — second payer and share are missing.' }]
              : [];
      if (!cu) errs.push({ area: 'Customer', text: 'Select a customer from the list for “To”.' });
      if (ed.add.some((a) => !okAdd(a)))
        errs.push({
          area: 'Charges',
          text: 'Complete or remove the added charge — charge head, quantity, UOM, unit price and currency are required.',
        });
      // To — type-ahead
      const cs = s.riCu,
        qq = cs
          ? String(cs.q || '')
              .trim()
              .toLowerCase()
          : '';
      const cOpts = cs ? dir.filter((c) => !qq || c.name.toLowerCase().includes(qq) || c.code.toLowerCase().includes(qq)) : [];
      const cHi = cs ? Math.min(cs.hi || 0, cOpts.length - 1) : -1;
      const pickCu = (code) => {
        self.setState({ riCu: null });
        putEd({ cust: code });
      };
      const toBox = {
        val: cs ? cs.q : cu ? cu.name : '',
        cls: cu || cs ? '' : 'bad',
        open: !!cs,
        exp: cs ? 'true' : 'false',
        act: cHi >= 0 ? 'hm-cu-' + cHi : '',
        none: !!cs && !cOpts.length,
        addr: cu ? cu.addr : '—',
        code: cu ? cu.code : '—',
        opts: cOpts.map((c, n) => ({
          id: 'hm-cu-' + n,
          code: c.code,
          name: c.name,
          on: n === cHi ? 'true' : 'false',
          pick: (e) => {
            e.preventDefault();
            pickCu(c.code);
          },
        })),
        onQ: (e) => self.setState({ riCu: { q: e.target.value, hi: 0 } }),
        onFocus: () => self.setState({ riCu: { q: '', hi: 0 } }),
        onBlur: () =>
          setTimeout(() => {
            if (self.state.riCu) self.setState({ riCu: null });
          }, 150),
        onKey: (e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const n = cOpts.length || 1;
            self.setState({ riCu: { q: cs ? cs.q : '', hi: cs ? (cHi + (e.key === 'ArrowDown' ? 1 : n - 1)) % n : 0 } });
          } else if (e.key === 'Enter' && cs && cOpts[cHi]) {
            e.preventDefault();
            pickCu(cOpts[cHi].code);
          }
        },
      };
      // added charge rows (editable)
      const curs = ['USD'].concat(loc[0] !== 'USD' ? [loc[0]] : []);
      const addRows = ed.add.map((a, j) => {
        const upd = (p) => putEd({ add: ed.add.map((y, n) => (n === j ? Object.assign({}, y, p) : y)) });
        const ok = okAdd(a),
          q = parseFloat(a.qty),
          u = parseFloat(String(a.unit).replace(/,/g, '')),
          ex = ok ? q * u : null,
          rt = rate(a.cur === 'USD' ? loc[3] : loc[2]),
          tx = ex == null ? null : Math.round(ex * rt) / 100;
        const sg = s.riSug && s.riSug.i === j ? s.riSug : null,
          sq = sg
            ? String(a.q || '')
                .trim()
                .toLowerCase()
            : '';
        const opts = sg
          ? Object.keys(HM_CHG)
              .filter((c) => !sq || c.toLowerCase().includes(sq) || HM_CHG[c].toLowerCase().includes(sq))
              .slice(0, 8)
          : [];
        const hi = sg ? Math.min(sg.hi, opts.length - 1) : -1;
        const pick = (c) => {
          self.setState({ riSug: null });
          upd({
            code: c,
            q: HM_CHG[c],
            cur: a.cur || (/OFT|BAF|LSS/.test(c) ? 'USD' : loc[0]),
            uom: a.uom || (/DOC|DO$/.test(c) ? 'BL' : /DEM|DET/.test(c) ? 'Day' : 'CNTR'),
          });
        };
        const fmt2 = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const t = a.t || {},
          bad = (v, f) => (!ok && t[f] && !v ? 'bad' : '');
        return {
          edit: true,
          cls: 'add',
          lid: 'hm-cs-' + j,
          q: a.q || '',
          sug: !!sg,
          sugA: sg ? 'true' : 'false',
          none: !!sg && !opts.length,
          act: hi >= 0 ? 'hm-co-' + j + '-' + hi : '',
          hErr: !ok && t.q && !a.code && !sg ? 'bad' : '',
          opts: opts.map((c, n) => ({
            id: 'hm-co-' + j + '-' + n,
            code: c,
            name: HM_CHG[c],
            on: n === hi ? 'true' : 'false',
            pick: (e) => {
              e.preventDefault();
              pick(c);
            },
          })),
          onQ: (e) => {
            const v = e.target.value;
            self.save({
              riSug: { i: j, hi: 0 },
              riEd: Object.assign({}, s.riEd, {
                [key]: Object.assign({}, ed, {
                  add: ed.add.map((y, n) =>
                    n === j
                      ? Object.assign({}, y, { q: v, code: HM_CHG[y.code] === v ? y.code : '', t: Object.assign({}, t, { q: 1 }) })
                      : y,
                  ),
                }),
              }),
            });
          },
          onFocus: () => self.setState({ riSug: { i: j, hi: 0 } }),
          onBlur: () =>
            setTimeout(() => {
              if (self.state.riSug && self.state.riSug.i === j) self.setState({ riSug: null });
            }, 150),
          onKey: (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
              const n = opts.length || 1;
              self.setState({ riSug: { i: j, hi: sg ? (hi + (e.key === 'ArrowDown' ? 1 : n - 1)) % n : 0 } });
            } else if (e.key === 'Enter' && sg && opts[hi]) {
              e.preventDefault();
              pick(opts[hi]);
            }
          },
          qty: a.qty,
          uom: a.uom,
          unit: a.unit,
          cur: a.cur,
          uoms: HM_UOM,
          curs,
          qErr: bad(q > 0, 'qty'),
          uErr: bad(a.uom, 'uom'),
          pErr: bad(String(a.unit).trim() !== '' && u >= 0, 'unit'),
          cErr: bad(a.cur, 'cur'),
          onQty: (e) => upd({ qty: e.target.value, t: Object.assign({}, t, { qty: 1 }) }),
          onUom: (e) => upd({ uom: e.target.value, t: Object.assign({}, t, { uom: 1 }) }),
          onUnit: (e) => upd({ unit: e.target.value, t: Object.assign({}, t, { unit: 1 }) }),
          onCur: (e) => upd({ cur: e.target.value, t: Object.assign({}, t, { cur: 1 }) }),
          del: () => putEd({ add: ed.add.filter((y, n) => n !== j) }),
          ex: ex == null ? '—' : fmt2(ex),
          ta: ex == null ? '—' : rt + '%',
          tax: tx == null ? '—' : fmt2(tx),
          inc: ex == null ? '—' : fmt2(ex + tx),
        };
      });
      const addCharge = () => putEd({ add: ed.add.concat([{ code: '', q: '', qty: '1', uom: '', unit: '', cur: '', t: {} }]) });
      const done = k === 'inv';
      const go = (d) => () => self.setState({ ri: Object.assign({}, s.ri, { i: pos + d }), decl: false });
      const gen = () => {
        const bg = JSON.parse(JSON.stringify(s.blGen || {}));
        bg[dv.id] = Object.assign({}, bg[dv.id] || {}, { [i]: 1 });
        const nextIdx = L.findIndex((x, n) => n > pos && seq2[x] === 'ready');
        self.save({
          blGen: bg,
          decl: false,
          ri: nextIdx >= 0 ? Object.assign({}, s.ri, { i: nextIdx }) : null,
          __toast: 'Invoice ' + bl + ' generated' + (nextIdx >= 0 ? ' · next ready B/L opened' : '') + '.',
        });
      };
      ri = {
        show: true,
        bl,
        title: done ? 'INVOICE' : 'READY TO INVOICE',
        hasErr: errs.length > 0,
        noErr: !errs.length,
        errs,
        done,
        notDone: !done,
        errTitle:
          errs.length === 1
            ? '1 error to resolve before generating the invoice'
            : errs.length + ' errors to resolve before generating the invoice',
        txn: m ? m.txn : 'B/L Released',
        strip: m
          ? kv(
              done
                ? [['Invoice No.', 'INV-' + dv.here.slice(0, 2) + '-' + dv.no + '-' + String(i + 1).padStart(4, '0')]].concat(
                    m.strip.slice(1),
                  )
                : m.strip.slice(1),
            )
          : [],
        from0: m ? m.from[0] : '',
        fromL: m ? m.from.slice(1) : [],
        cust: cu ? cu.name : '—',
        custCode,
        details: m ? kv(m.details.map((d) => (d[0] === 'Customer Code' ? [d[0], custCode] : d))) : [],
        ship: kv([
          ['Voyage', dv.no + '  ' + hmFmt(dv.date, { day: 'numeric', month: 'short', year: '2-digit' }) + '  ' + dv.vessel],
          ['BL Id/Number', bl],
          ['Loaded', dv.pol],
          ['Discharge', dv.pod],
          ['Service', dv.svc],
          ['Containers', ctr + ' × 40HC'],
        ]),
        lines: (m
          ? m.rows.slice(0, lines.length).map((l) => ({
              edit: false,
              ro: true,
              cls: '',
              head: l.head,
              qty: l.qty,
              uom: l.uom,
              unit: l.unit,
              cur: l.cur,
              ex: l.ex,
              ta: l.ta,
              tax: l.tax,
              inc: l.incl,
            }))
          : []
        ).concat(done ? [] : addRows),
        to: toBox,
        addCharge,
        canAdd: !done,
        bank: m ? kv(m.bank) : [],
        totals: m
          ? m.totals.map(([kk, v], n, a) => ({ k: n === a.length - 1 ? m.grandLabel : kk, v, cls: n === a.length - 1 ? 'g' : '' }))
          : [],
        words: m ? m.words : '',
        head: dv.vessel + ' · ' + dv.no + ' · ' + (dv.dir === 'E' ? 'Export' : 'Import'),
        pos: pos + 1 + ' / ' + L.length,
        first: pos <= 0,
        last: pos >= L.length - 1,
        prev: go(-1),
        next: go(1),
        decl: s.decl,
        toggleDecl: () => self.setState({ decl: !s.decl }),
        genDis: !!errs.length || !s.decl || done,
        gen,
        hint: done
          ? 'This B/L is already invoiced.'
          : errs.length
            ? 'Resolve the errors to generate this invoice.'
            : !s.decl
              ? 'Confirm the declaration to generate.'
              : '',
        stLabel: HM_BLST[k][0],
        stC: 'chip t-' + HM_BLST[k][1],
        list: 'invoice-list-v2.html?q=' + bl,
        close: () => self.setState({ ri: null, decl: false }),
      };
    }

    // ---------- confirm / rate
    const pool = scopeAll.concat(overdue);
    let cf = { show: false };
    if (s.confirm && s.confirm.kind === 'voy') {
      const vs = pool.filter((v, i, a) => s.confirm.ids.includes(v.id) && v.ready && a.findIndex((x) => x.id === v.id) === i);
      const n = tally(vs, 'ready');
      cf = {
        show: true,
        title: 'Generate ' + hmN(n) + (n === 1 ? ' invoice?' : ' invoices?'),
        rows: [
          [
            'Voyages',
            vs.length > 4
              ? vs
                  .slice(0, 4)
                  .map((v) => v.no)
                  .join(', ') +
                ' and ' +
                (vs.length - 4) +
                ' more'
              : vs.map((v) => v.no).join(', '),
          ],
          ['Invoice date', 'ETD for export, ETA for import'],
          ['Billing parties', hmN(Math.min(n, 6 + vs.length * 4))],
          ['Total amount', hmUsd(vs.reduce((a, v) => a + v.ready * v.avg, 0))],
        ].map(([l, v]) => ({ l, v })),
        note: 'Only B/Ls with complete LMS data and a rate of exchange are included. Blocked B/Ls stay here until they are cleared.',
        cancel: () => self.setState({ confirm: null }),
        ok: () => {
          const g = Object.assign({}, s.gen);
          vs.forEach((v) => {
            g[v.id] = (g[v.id] || 0) + v.ready;
          });
          self.save({
            gen: g,
            confirm: null,
            sel: {},
            done: { n: hmN(n), q: vs.length === 1 ? vs[0].no : '', nos: vs.length === 1 ? 'voyage ' + vs[0].no : vs.length + ' voyages' },
          });
        },
      };
    }
    if (s.confirm && s.confirm.kind === 'dd') {
      const cs = s.confirm.cns;
      cf = {
        show: true,
        title: 'Generate D&D invoices for ' + cs.length + (cs.length === 1 ? ' container?' : ' containers?'),
        rows: [
          ['B/Ls', String(s.confirm.bls)],
          ['Invoice per', 'B/L — containers on the same B/L share one invoice'],
          ['Total amount', s.confirm.amt],
        ].map(([l, v]) => ({ l, v })),
        note: 'Charges use the D&D tariff slabs and the gate-out / return dates received from LMS.',
        cancel: () => self.setState({ confirm: null }),
        ok: () => {
          const g = Object.assign({}, s.ddGen);
          cs.forEach((c) => {
            g[c] = 1;
          });
          self.save({
            ddGen: g,
            confirm: null,
            __toast: 'D&D invoices generated for ' + cs.length + (cs.length === 1 ? ' container.' : ' containers.'),
          });
        },
      };
    }
    let rate = { show: false };
    if (s.rateFor) {
      const vs = due.filter((v) => v.pair === s.rateFor && v.roe);
      rate = {
        show: true,
        pair: s.rateFor,
        val: s.rateVal,
        on: (e) => self.setState({ rateVal: e.target.value }),
        date: hmFmt(HM_TODAY, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
        info: 'Clears ' + hmN(tally(vs, 'roe')) + ' blocked invoices on ' + vs.length + (vs.length === 1 ? ' voyage.' : ' voyages.'),
        cancel: () => self.setState({ rateFor: '' }),
        ok: () => {
          const r = parseFloat(s.rateVal);
          if (!(r > 0)) return self.setState({ __toast: 'Enter the rate received from Treasury.' });
          self.save({
            roeSet: Object.assign({}, s.roeSet, { [s.rateFor]: r }),
            rateFor: '',
            __toast: 'Rate ' + r + ' applied for ' + s.rateFor + '. ' + hmN(tally(vs, 'roe')) + ' invoices are now ready.',
          });
        },
      };
    }

    // ---------- D&D
    const dd = hmDD(cc).map((c) => {
      const end = c.back || HM_TODAY,
        used = hmDiff(c.out, end),
        over = Math.max(0, used - c.free),
        sl = hmSlab(c.sz, over);
      return Object.assign({}, c, {
        used,
        over,
        amt: c.st === 'tariff' ? 0 : sl.amt,
        slab: sl.txt,
        status: s.ddGen[c.cn] ? 'invoiced' : c.st,
      });
    });
    const isBlk = (c) => ['roe', 'tariff', 'milestone', 'waiver'].includes(c.status);
    const am = (cs) => hmUsd(cs.reduce((a, c) => a + c.amt, 0));
    const dOut = dd.filter((c) => c.status === 'out'),
      dReady = dd.filter((c) => c.status === 'ready'),
      dBlk = dd.filter(isBlk),
      dInv = dd.filter((c) => c.status === 'invoiced');
    const ddq = s.ddQ.trim().toUpperCase();
    const ddF = dd.filter(
      (c) =>
        (s.ddF === 'all' || (s.ddF === 'blocked' ? isBlk(c) : c.status === s.ddF)) &&
        (!ddq || (c.cn + ' ' + c.bl + ' ' + c.cust).toUpperCase().includes(ddq)),
    );
    const ddSorted = ddF
      .slice()
      .sort(
        (a, b) =>
          (isBlk(a) === isBlk(b) ? 0 : isBlk(a) ? -1 : 1) ||
          (a.status === 'ready' ? -1 : 0) - (b.status === 'ready' ? -1 : 0) ||
          b.over - a.over,
      );
    const dps = s.psz,
      dpgs = Math.max(1, Math.ceil(ddSorted.length / dps)),
      dpn = Math.min(s.ddPg, dpgs),
      doff = (dpn - 1) * dps;
    const dgo = (v) => () => self.setState({ ddPg: v });
    const ddRs = {};
    dBlk.forEach((c) => {
      (ddRs[c.status] = ddRs[c.status] || []).push(c);
    });
    const genBL = (bl) => {
      const cs = dd.filter((x) => x.bl === bl && x.status === 'ready');
      self.setState({ confirm: { kind: 'dd', cns: cs.map((x) => x.cn), bls: 1, amt: am(cs) } });
    };

    const voyOpenToday = tally(day(HM_TODAY), 'open') + tally(overdue, 'open');
    return {
      greet,
      ctx: cty + ' (' + port + ') · ' + ent + ' · LMS data received 2 min ago',
      tabs: {
        voy: s.tab === 'voy',
        dd: s.tab === 'dd',
        voyA: s.tab === 'voy' ? 'true' : 'false',
        ddA: s.tab === 'dd' ? 'true' : 'false',
        voyN: hmN(voyOpenToday) + ' open',
        ddN: dReady.length + dBlk.length + ' to bill',
        toVoy: () => self.setState({ tab: 'voy' }),
        toDd: () => self.setState({ tab: 'dd' }),
      },
      alert: !s.alertOff && s.tab === 'voy' && !Object.keys(s.roeSet).length && day(HM_TODAY).some((v) => v.roe),
      alertOff: () => self.setState({ alertOff: true }),
      done: s.done
        ? {
            show: true,
            txt: s.done.n + ' invoices generated for ' + s.done.nos + '.',
            href: 'invoice-list-v2.html' + (s.done.q ? '?q=' + s.done.q : ''),
            close: () => self.setState({ done: null }),
          }
        : { show: false },
      nav,
      ribbon,
      dirs: [
        ['all', 'All'],
        ['E', 'Export'],
        ['I', 'Import'],
      ].map(([k, l]) => ({ l, cur: s.dir === k ? 'true' : 'false', pick: () => self.setState({ dir: k, pg: 1 }) })),
      stfs: [
        ['all', 'All voyages'],
        ['ready', 'Ready to generate'],
        ['blocked', 'With blockers'],
        ['done', 'Complete'],
        ['notdue', 'Not due'],
      ].map(([k, l]) => ({ l, n: hmN(stCount(k)), cur: s.stf === k ? 'true' : 'false', pick: () => self.setState({ stf: k, pg: 1 }) })),
      q: s.q,
      onQ: (e) => self.setState({ q: e.target.value, pg: 1 }),
      grpOn: s.grp,
      grpShow: span.length > 1,
      grpT: () => self.setState({ grp: !s.grp }),
      cols,
      grouped,
      noRows: !sorted.length,
      noRowsL: q
        ? 'No voyage matches “' + s.q + '”.'
        : s.view === 'overdue'
          ? 'Nothing overdue. Every past voyage is fully invoiced.'
          : 'No voyages match these filters.',
      allOn: !!allOn,
      allT: () => {
        const n = Object.assign({}, s.sel);
        pageRows.forEach((v) => {
          n[v.id] = !allOn;
        });
        self.setState({ sel: n });
      },
      pager,
      bulk,
      glance,
      reasons,
      noReasons: !reasons.length,
      rangeL,
      genAllL: 'Generate all ready (' + hmN(R) + ')',
      genAllDis: !R,
      genAll: () => self.setState({ confirm: { kind: 'voy', ids: S.filter((v) => v.ready).map((v) => v.id) } }),
      drw,
      cf,
      rate,
      ri,
      mail: (() => {
        const m = s.mail;
        if (!m) return { show: false, prev: [], heads: [] };
        const R = MAILR[m.reason],
          mr = mailRows(m),
          heads = [
            'Voyage No.',
            'Vessel',
            'Direction',
            'POL',
            'POD',
            'ETD / ETA',
            'B/L No.',
            'Billing party',
            'Containers',
            'Amount (USD)',
          ].concat(R.extra);
        const put = (k) => (e) => self.setState({ mail: Object.assign({}, m, { [k]: e.target.value }) });
        return {
          show: true,
          title: m.reason === 'roe' ? 'Request ROE' : 'Send follow-up',
          reason: R.l,
          to: m.to,
          cc: m.cc,
          sub: m.sub,
          body: m.body,
          onTo: put('to'),
          onCc: put('cc'),
          onSub: put('sub'),
          onBody: put('body'),
          file: m.file,
          meta: hmN(mr.rows.length) + ' B/Ls · ' + heads.length + ' columns · ' + m.size,
          prevOn: s.mailPrev,
          prevL: s.mailPrev ? 'Hide preview' : 'Preview',
          togglePrev: () => self.setState({ mailPrev: !s.mailPrev }),
          heads: heads.map((h) => ({ h })),
          prev: mr.rows.slice(0, 8).map((r) => ({
            cells: r.map((v) => ({
              v:
                typeof v === 'number' && v % 1
                  ? v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : String(v),
            })),
          })),
          more: mr.rows.length > 8 ? '+ ' + hmN(mr.rows.length - 8) + ' more rows in the file' : '',
          download: () => hmDownload(hmXlsx(R.l, heads, mr.rows), m.file),
          cancel: () => self.setState({ mail: null }),
          send: () => {
            if (!String(m.to).trim()) return self.setState({ __toast: 'Add at least one recipient.' });
            const t = hmTime(),
              patch = {
                mail: null,
                __toast:
                  (m.reason === 'roe' ? 'ROE request' : 'Follow-up') +
                  ' sent to ' +
                  String(m.to).replace(/\s*<.*$/, '') +
                  ' with ' +
                  m.file +
                  ' (' +
                  hmN(mr.rows.length) +
                  ' B/Ls).',
              };
            const fu = Object.assign({}, s.fu),
              rq = Object.assign({}, s.roeReq);
            (m.keys || []).forEach(([store, k]) => {
              if (store === 'fu') fu[k] = t;
              else rq[k] = t;
            });
            if (m.reason === 'roe' && m.pair) rq[m.pair] = t;
            self.save(Object.assign(patch, { fu, roeReq: rq }));
          },
        };
      })(),
      dd: {
        sum: [
          ['With customers', String(dOut.length), am(dOut) + ' building up', 'nd'],
          ['Ready to invoice', String(dReady.length), am(dReady), 'rdy'],
          ['Blocked', String(dBlk.length), am(dBlk.filter((c) => c.status !== 'tariff')) + ' + tariff pending', 'blk'],
          ['Invoiced this month', String(dInv.length), am(dInv), 'inv'],
        ].map(([l, v, sub, k]) => ({ l, v, sub, k: 'hm-dot ' + k })),
        reasons: Object.keys(ddRs).map((k) => {
          const done = s.ddAct[k];
          return {
            r: HM_DDST[k][0],
            own: HM_DDR[k][0],
            n: ddRs[k].length + (ddRs[k].length === 1 ? ' container' : ' containers'),
            amt: k === 'tariff' ? 'Amount unknown' : am(ddRs[k]),
            st: done ? 'Sent ' + done : '',
            hasSt: !!done,
            act: done ? 'Remind' : HM_DDR[k][1],
            go: () =>
              self.save({ ddAct: Object.assign({}, s.ddAct, { [k]: hmTime() }), __toast: HM_DDR[k][1] + ' sent to ' + HM_DDR[k][0] + '.' }),
          };
        }),
        fil: [
          ['all', 'All', dd.length],
          ['ready', 'Ready', dReady.length],
          ['blocked', 'Blocked', dBlk.length],
          ['out', 'With customer', dOut.length],
          ['invoiced', 'Invoiced', dInv.length],
        ].map(([k, l, n]) => ({ l, n: String(n), cur: s.ddF === k ? 'true' : 'false', pick: () => self.setState({ ddF: k, ddPg: 1 }) })),
        q: s.ddQ,
        onQ: (e) => self.setState({ ddQ: e.target.value, ddPg: 1 }),
        rows: ddSorted.slice(doff, doff + dps).map((c) => ({
          cn: c.cn,
          sz: c.sz,
          cust: c.cust,
          bl: c.bl,
          typeL: c.dir === 'E' ? 'Export' : 'Import',
          typeC: 'chip t-neutral dot-' + c.dir.toLowerCase(),
          type: c.type,
          out: hmFmt(c.out, { day: 'numeric', month: 'short' }),
          back: c.back ? hmFmt(c.back, { day: 'numeric', month: 'short' }) : 'Not returned',
          backC: c.back ? '' : 'mu',
          days: c.used + ' / ' + c.free,
          over: String(c.over),
          overC: c.over ? 'r hm-wn' : 'r mu',
          amt: c.status === 'tariff' ? '—' : c.amt ? hmUsd(c.amt) : '—',
          slab: c.status === 'tariff' ? 'No tariff for ' + c.sz : c.over ? c.slab : 'Within free time',
          stL: HM_DDST[c.status][0],
          stC: 'chip t-' + HM_DDST[c.status][1],
          canGen: c.status === 'ready',
          noGen: c.status !== 'ready',
          noGenL: c.status === 'out' ? 'Bill on return' : c.status === 'invoiced' ? 'Done' : 'Blocked',
          gen: () => genBL(c.bl),
        })),
        empty: !ddSorted.length,
        pg: {
          text: ddSorted.length
            ? 'Showing ' + (doff + 1) + '–' + Math.min(doff + dps, ddSorted.length) + ' of ' + ddSorted.length + ' containers'
            : 'No containers',
          pos: dpn + ' / ' + dpgs,
          firstDis: dpn <= 1,
          prevDis: dpn <= 1,
          nextDis: dpn >= dpgs,
          lastDis: dpn >= dpgs,
          first: dgo(1),
          prev: dgo(dpn - 1),
          next: dgo(dpn + 1),
          last: dgo(dpgs),
          size: String(dps),
          onSize: (e) => self.setState({ psz: parseInt(e.target.value, 10), ddPg: 1 }),
        },
        genL: 'Generate all ready (' + dReady.length + ')',
        genDis: !dReady.length,
        gen: () =>
          self.setState({
            confirm: { kind: 'dd', cns: dReady.map((c) => c.cn), bls: new Set(dReady.map((c) => c.bl)).size, amt: am(dReady) },
          }),
      },
    };
  }
}

export { GirsPage as HomeModel };
