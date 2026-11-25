/* Home view-model: Voyage Invoicing (date navigation, workload ribbon, voyages table, voyage panel,
   Ready-to-invoice popup, follow-up mail with Excel attachment) and D&D Billing.
   The working location and entity come from the top bar (state.__hub, state.__ent). */
import type { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
import { invoiceModel } from '@/entities/invoice';
import { FALLBACK_SESSION } from '@/entities/user';
import {
  BL_STATUS,
  CHARGES,
  CUSTOMERS,
  DD_REASONS,
  DD_STATUS,
  LOCATIONS,
  MISSING_DATA,
  TODAY,
  UOMS,
  VOYAGE_CHANGE_KEYS,
  addDays,
  customerDirectory,
  daysBetween,
  ddCharge,
  fmtN,
  fmtUsd,
  formatDate,
  hubOf,
  toDate,
  toIso,
  type AddedBlCharge,
  type BlEdit,
  type DdContainer,
  type Voyage,
  type VoyageChanges,
} from '@/entities/voyage';
import { timeNow } from '@/shared/lib/dates';
import { downloadBlob } from '@/shared/lib/download';
import { formatFileSize } from '@/shared/lib/format';
import { seededRandom } from '@/shared/lib/random';
import { ScreenModel, type StateUpdate } from '@/shared/lib/screenModel';
import { buildXlsx, type XlsxCell } from '@/shared/lib/xlsx';
import type { VoyageActions } from '../api/voyageMutations';

/** Change of a text box, select or text area. */
type FieldEvent = ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

/** Follow-up e-mail being written (reason, voyages, recipients, attachment). */
export interface FollowUpMail {
  reason: 'nod' | 'roe' | 'hold';
  ids: string[];
  pair: string;
  to: string;
  cc: string;
  sub: string;
  body: string;
  file: string;
  size: string;
  n: number;
  /** Change-log entries to stamp when sent: [field, key]. */
  keys: (readonly ['fu' | 'roeReq', string])[];
}

export type VoyageConfirm = { kind: 'voy'; ids: string[] } | { kind: 'dd'; cns: string[]; bls: number; amt: string };

/** Screen state of Home (the actions taken in GIRS are server data: see VoyageChanges). */
export interface VoyageState {
  tab: 'voy' | 'dd';
  from: string;
  to: string;
  view: 'range' | 'overdue';
  /** First day of the 14-day ribbon. */
  win: string;
  cal: boolean;
  dir: string;
  stf: string;
  q: string;
  sort: string;
  sdir: number;
  grp: boolean;
  pg: number;
  psz: number;
  sel: Readonly<Record<string, boolean>>;
  /** B/L review: voyage, B/L indexes, position. */
  ri: { vid: string; list: number[]; i: number } | null;
  decl: boolean;
  mail: FollowUpMail | null;
  mailPrev: boolean;
  riCu: { q: string; hi: number } | null;
  riSug: { i: number; hi: number } | null;
  /** Voyage open in the side panel. */
  drw: string;
  drwF: string;
  drwQ: string;
  drwPg: number;
  confirm: VoyageConfirm | null;
  rateFor: string;
  rateVal: string;
  done: { n: string; q: string; nos: string } | null;
  alertOff: boolean;
  ddF: string;
  ddQ: string;
  ddPg: number;
  /** Working location and entity from the top bar. */
  __hub: string;
  __ent: string;
}

/** Loaded data: voyages per date (for the months shown), D&D containers, actions taken. */
export interface VoyageScreenData {
  days: Readonly<Record<string, readonly Voyage[]>>;
  dd: readonly DdContainer[];
  changes: VoyageChanges;
}

export type SaveUpdate = StateUpdate<VoyageState> & Partial<VoyageChanges>;

const isChangeKey = (k: string): k is keyof VoyageChanges => (VOYAGE_CHANGE_KEYS as readonly string[]).includes(k);

export class VoyageInvoicingModel extends ScreenModel<VoyageState, VoyageVals, VoyageScreenData, VoyageActions> {
  constructor(hub: string, entity: string) {
    super({
      tab: 'voy',
      from: TODAY,
      to: TODAY,
      view: 'range',
      win: addDays(TODAY, -6),
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
      ri: null,
      decl: false,
      mail: null,
      mailPrev: false,
      riCu: null,
      riSug: null,
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
      __hub: hub,
      __ent: entity,
    });
  }

  private readonly onKey = (e: globalThis.KeyboardEvent): void => {
    if (e.key !== 'Escape') return;
    if (this.state.mail) return this.setState({ mail: null });
    if (this.state.riCu || this.state.riSug) return this.setState({ riCu: null, riSug: null });
    if (this.state.ri) return this.setState({ ri: null, decl: false });
    this.setState({ drw: '', confirm: null, rateFor: '', cal: false });
  };

  override mount(): void {
    document.addEventListener('keydown', this.onKey);
  }

  override unmount(): void {
    document.removeEventListener('keydown', this.onKey);
  }

  /** Follows the top-bar location and entity. */
  setContext(hub: string, entity: string): void {
    if (this.state.__hub !== hub || this.state.__ent !== entity) this.state = { ...this.state, __hub: hub, __ent: entity };
  }

  get changes(): VoyageChanges {
    return this.data.changes;
  }

  get ddContainers(): readonly DdContainer[] {
    return this.data.dd;
  }

  /** Voyages on `date` at the working location (empty while that month loads). */
  dayOf(_port: string, date: string): readonly Voyage[] {
    return this.data.days[date] ?? [];
  }

  /** Months ("2026-11") whose voyages the current view needs: ribbon, overdue (14 days back), selected range. */
  requiredMonths(): string[] {
    return requiredMonths(this.state);
  }

  /** Saves actions taken (change-log fields) and updates the screen state with the rest. */
  save(patch: SaveUpdate): void {
    const changes: Partial<VoyageChanges> = {};
    const rest: StateUpdate<VoyageState> = {};
    for (const [k, v] of Object.entries(patch)) {
      if (isChangeKey(k)) Object.assign(changes, { [k]: v });
      else Object.assign(rest, { [k]: v });
    }
    if (Object.keys(changes).length) {
      const next: VoyageChanges = { ...this.changes, ...changes };
      this.run(() => this.actions.commit(next), 'The change could not be saved.');
    }
    this.setState(rest);
  }

  protected renderVals(): VoyageVals {
    return voyageVals(this);
  }
}

/** Months ("2026-11") the view needs: the ribbon, the overdue window (14 days back) and the selected range. */
export function requiredMonths(s: Pick<VoyageState, 'win' | 'view' | 'from' | 'to'>): string[] {
  const dates = [s.win, addDays(s.win, 13), addDays(TODAY, -14), TODAY];
  if (s.view === 'range') dates.push(s.from, s.to < addDays(s.from, 61) ? s.to : addDays(s.from, 61));
  const sorted = dates.map((d) => d.slice(0, 7)).sort();
  const last = sorted[sorted.length - 1] ?? TODAY.slice(0, 7);
  const out: string[] = [];
  for (let m = sorted[0] ?? last; m <= last;) {
    out.push(m);
    const [y, mo] = m.split('-').map(Number);
    const next = new Date(y ?? 2026, mo ?? 1, 1);
    m = next.getFullYear() + '-' + String(next.getMonth() + 1).padStart(2, '0');
  }
  return out;
}

/** What the Home values need from the model. */
export interface VoyageHost {
  readonly state: VoyageState;
  readonly changes: VoyageChanges;
  readonly ddContainers: readonly DdContainer[];
  dayOf: (port: string, date: string) => readonly Voyage[];
  setState: (u: StateUpdate<VoyageState>) => void;
  save: (patch: SaveUpdate) => void;
}

/** A voyage with its invoicing state after the actions taken (bulk / one-by-one generation, ROE entered). */
export type LiveVoyage = Voyage & {
  ready0: number;
  inv0: number;
  bulk: number;
  /** B/L indexes generated one by one. */
  ind: string[];
  inv: number;
  ready: number;
  roe: number;
  nod: number;
  hold: number;
  blocked: number;
  open: number;
  notDue: boolean;
  late: boolean;
  status: 'notdue' | 'done' | 'ready' | 'blocked';
  overdueBy: number;
};

/** A charge line of the B/L review (LMS charges read-only, added charges editable). */
export interface HomeReviewLine {
  edit: boolean;
  ro?: boolean;
  cls: string;
  head?: string;
  qty: number | string;
  uom: string;
  unit: number | string;
  cur: string;
  ex: string;
  ta: string;
  tax: string;
  inc: string;
  lid?: string;
  q?: string;
  sug?: boolean;
  sugA?: 'true' | 'false';
  none?: boolean;
  act?: string;
  hErr?: string;
  opts?: { id: string; code: string; name: string; on: 'true' | 'false'; pick: (e: MouseEvent<HTMLElement>) => void }[];
  onQ?: (e: FieldEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKey?: (e: KeyboardEvent<HTMLElement>) => void;
  uoms?: readonly string[];
  curs?: string[];
  qErr?: string;
  uErr?: string;
  pErr?: string;
  cErr?: string;
  onQty?: (e: FieldEvent) => void;
  onUom?: (e: FieldEvent) => void;
  onUnit?: (e: FieldEvent) => void;
  onCur?: (e: FieldEvent) => void;
  del?: () => void;
}

type BlState = 'roe' | 'nod' | 'hold' | 'ready' | 'inv';

/** A blocker reason in the side rail, with its follow-up action. */
interface Blocker {
  r: string;
  own: string;
  n: string;
  v: string;
  amt: string;
  st: string;
  hasSt: boolean;
  act: string;
  go: () => void;
}

type TallyKey = 'bls' | 'inv' | 'ready' | 'roe' | 'nod' | 'hold' | 'blocked' | 'open';

/** Values of the Home screen. */
export function voyageVals(self: VoyageHost) {
  const s = { ...self.state, ...self.changes };
  const hub = s.__hub || 'SIN';
  const [cty, port] = hubOf(hub);
  const ent = s.__ent || 'PIL';
  const hr = new Date().getHours();
  const greet = (hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening') + ', ' + FALLBACK_SESSION.firstName;

  const live = (v: Voyage): LiveVoyage => {
    const bulk = s.gen[v.id] || 0,
      ind = Object.keys(s.blGen[v.id] ?? {}),
      roeOk = !!s.roeSet[v.pair];
    const [inv0Raw, ready0Raw, roe0, nod, hold] = v.st;
    let inv = inv0Raw;
    let ready = ready0Raw;
    let roe = roe0;
    if (roeOk && v.date <= TODAY) {
      ready += roe;
      roe = 0;
    }
    const ready0 = ready,
      inv0 = inv,
      g = Math.min(ready0, bulk + ind.length);
    ready = ready0 - g;
    inv += g;
    const notDue = v.date > TODAY,
      blocked = roe + nod + hold,
      open = notDue ? 0 : v.bls - inv;
    const late = v.date < TODAY && open > 0;
    const status: LiveVoyage['status'] = notDue ? 'notdue' : open === 0 ? 'done' : ready ? 'ready' : 'blocked';
    return {
      ...v,
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
      overdueBy: late ? daysBetween(v.date, TODAY) : 0,
    };
  };
  const day = (d: string): LiveVoyage[] =>
    self
      .dayOf(port, d)
      .filter((v) => v.ent === ent)
      .map(live);
  const tally = (vs: readonly LiveVoyage[], k: TallyKey) => vs.reduce((a, v) => a + v[k], 0);
  // overdue = past 14 days with open invoices
  const overdue: LiveVoyage[] = [];
  for (let i = 1; i <= 14; i++)
    day(addDays(TODAY, -i)).forEach((v) => {
      if (v.late) overdue.push(v);
    });

  // ---------- ribbon (14 days, movable)
  const span =
    s.view === 'overdue'
      ? []
      : (() => {
          const a = [];
          for (let d = s.from; d <= s.to; d = addDays(d, 1)) a.push(d);
          return a;
        })();
  const rib = [];
  for (let i = 0; i < 14; i++) rib.push(addDays(s.win, i));
  const ribData = rib.map((d) => {
    const vs = day(d),
      E = Math.max(1, tally(vs, 'bls'));
    return {
      d,
      vs,
      open: d > TODAY ? tally(vs, 'bls') : tally(vs, 'open'),
      sI: 'width: ' + (tally(vs, 'inv') / E) * 100 + '%',
      sR: 'width: ' + (d > TODAY ? 0 : tally(vs, 'ready') / E) * 100 + '%',
      sB: 'width: ' + (d > TODAY ? 0 : tally(vs, 'blocked') / E) * 100 + '%',
    };
  });
  const ribbon = ribData.map(({ d, vs, open, sI, sR, sB }) => {
    const inR = s.view === 'range' && d >= s.from && d <= s.to,
      late = vs.some((v) => v.late),
      fut = d > TODAY,
      wk = [0, 6].includes(toDate(d).getDay());
    return {
      w: d === TODAY ? 'Today' : formatDate(d, { weekday: 'short' }),
      d: formatDate(d, { day: 'numeric', month: 'short' }),
      n: vs.length + (vs.length === 1 ? ' voyage' : ' voyages'),
      open: fut ? 'Not due' : open ? fmtN(open) + ' open' : 'All invoiced',
      cls:
        'hm-rd' +
        (inR ? ' on' : '') +
        (d === TODAY ? ' today' : '') +
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
        formatDate(d, { weekday: 'long', day: 'numeric', month: 'long' }) +
        ', ' +
        vs.length +
        ' voyages, ' +
        (fut ? 'not due' : fmtN(open) + ' invoices open'),
      pick: (e: MouseEvent<HTMLElement>) => {
        if (e && e.shiftKey && s.view === 'range') {
          const a = d < s.from ? d : s.from,
            b = d < s.from ? s.to : d;
          self.setState({ from: a, to: b, pg: 1, sel: {} });
        } else self.setState({ view: 'range', from: d, to: d, pg: 1, sel: {} });
      },
    };
  });
  const setRange = (a: string, b: string, keep?: boolean) =>
    self.setState({
      view: 'range',
      from: a,
      to: b,
      win: addDays(a, -Math.max(0, Math.min(6, 13 - daysBetween(a, b)))),
      pg: 1,
      sel: {},
      cal: !!keep,
    });
  const step = s.view === 'range' ? daysBetween(s.from, s.to) + 1 : 1;
  const rangeL =
    s.view === 'overdue'
      ? 'Overdue · last 14 days'
      : s.from === s.to
        ? (s.from === TODAY ? 'Today, ' : '') + formatDate(s.from, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
        : formatDate(s.from) + ' – ' + formatDate(s.to, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const nav = {
    label: rangeL,
    cal: s.cal,
    toggleCal: () => self.setState({ cal: !s.cal }),
    closeCal: () => self.setState({ cal: false }),
    prev: () =>
      s.view === 'overdue' ? setRange(addDays(TODAY, -1), addDays(TODAY, -1)) : setRange(addDays(s.from, -step), addDays(s.to, -step)),
    next: () => (s.view === 'overdue' ? setRange(TODAY, TODAY) : setRange(addDays(s.from, step), addDays(s.to, step))),
    prevL: step > 1 ? 'Previous ' + step + ' days' : 'Previous day',
    nextL: step > 1 ? 'Next ' + step + ' days' : 'Next day',
    today: () => setRange(TODAY, TODAY),
    isToday: s.view === 'range' && s.from === TODAY && s.to === TODAY,
    winPrev: () => self.setState({ win: addDays(s.win, -7) }),
    winNext: () => self.setState({ win: addDays(s.win, 7) }),
    winL:
      formatDate(rib[0], { day: 'numeric', month: 'short' }) +
      ' – ' +
      formatDate(rib[13], { day: 'numeric', month: 'short', year: 'numeric' }),
    from: s.view === 'range' ? s.from : TODAY,
    to: s.view === 'range' ? s.to : TODAY,
    onFrom: (e: FieldEvent) => {
      const v = e.target.value;
      if (v) setRange(v, v > s.to ? v : s.to, true);
    },
    onTo: (e: FieldEvent) => {
      const v = e.target.value;
      if (v) setRange(v < s.from ? v : s.from, v, true);
    },
    presets: (
      [
        ['Today', TODAY, TODAY],
        ['Yesterday', addDays(TODAY, -1), addDays(TODAY, -1)],
        ['Tomorrow', addDays(TODAY, 1), addDays(TODAY, 1)],
        ['Last 7 days', addDays(TODAY, -6), TODAY],
        ['Next 7 days', TODAY, addDays(TODAY, 6)],
        ['This week', addDays(TODAY, -((toDate(TODAY).getDay() + 6) % 7)), addDays(TODAY, 6 - ((toDate(TODAY).getDay() + 6) % 7))],
        ['This month', TODAY.slice(0, 8) + '01', toIso(new Date(toDate(TODAY).getFullYear(), toDate(TODAY).getMonth() + 1, 0))],
      ] as const
    ).map(([l, a, b]) => ({ l, cur: s.view === 'range' && s.from === a && s.to === b ? 'true' : 'false', pick: () => setRange(a, b) })),
    ovN: String(overdue.length),
    ovOpen: fmtN(tally(overdue, 'open')),
    ovOn: s.view === 'overdue' ? 'true' : 'false',
    ovCls: 'hm-ov' + (overdue.length ? '' : ' none') + (s.view === 'overdue' ? ' on' : ''),
    ovGo: () => self.setState({ view: 'overdue', pg: 1, sel: {}, cal: false }),
  };

  // ---------- scope + filters
  const scopeAll: LiveVoyage[] = s.view === 'overdue' ? overdue : span.slice(0, 62).flatMap(day);
  const q = s.q.trim().toUpperCase();
  const byDirQ = scopeAll.filter(
    (v) =>
      (s.dir === 'all' || v.dir === s.dir) &&
      (!q || (v.no + ' ' + v.vessel + ' ' + v.svc + ' ' + v.pol + ' ' + v.pod).toUpperCase().includes(q)),
  );
  const inSt = (v: LiveVoyage, k: string) =>
    k === 'all' || (k === 'ready' ? v.ready > 0 : k === 'blocked' ? v.blocked > 0 && !v.notDue : v.status === k);
  const stCount = (k: string) => byDirQ.filter((v) => inSt(v, k)).length;
  const filtered = byDirQ.filter((v) => inSt(v, s.stf));
  const urg = (v: LiveVoyage) => (v.late ? 0 : v.status === 'blocked' ? 1 : v.status === 'ready' ? 2 : v.status === 'notdue' ? 3 : 4);
  const keyf: Record<string, (v: LiveVoyage) => number | string> = {
    urgency: (v) => urg(v) * 1e7 - v.open,
    date: (v) => toDate(v.date).getTime(),
    no: (v) => v.no,
    vessel: (v) => v.vessel,
    exp: (v) => v.bls,
    ready: (v) => v.ready,
    blocked: (v) => v.blocked,
    inv: (v) => v.inv / v.bls,
  };
  const kf = keyf[s.sort] ?? ((v: LiveVoyage) => urg(v) * 1e7 - v.open);
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
  const go = (v: number) => () => self.setState({ pg: v });
  const pager = {
    text: sorted.length
      ? 'Showing ' + (off + 1) + '–' + Math.min(off + size, sorted.length) + ' of ' + fmtN(sorted.length) + ' voyages'
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
    onSize: (e: FieldEvent) => self.setState({ psz: parseInt(e.target.value, 10), pg: 1 }),
  };
  const selIds = Object.keys(s.sel).filter((k) => s.sel[k]);
  const toggle = (id: string) => self.setState({ sel: { ...s.sel, [id]: !s.sel[id] } });
  const allOn = pageRows.length > 0 && pageRows.every((v) => s.sel[v.id]);
  const sortBy = (k: string) => () =>
    self.setState({
      sort: k,
      sdir: s.sort === k ? -s.sdir : k === 'urgency' || k === 'date' || k === 'no' || k === 'vessel' ? 1 : -1,
      pg: 1,
    });
  const th = (k: string, l: string, cls?: string) => ({
    l,
    cls: (cls || '') + ' hm-sth',
    on: sortBy(k),
    aria: (s.sort === k ? (s.sdir > 0 ? 'ascending' : 'descending') : 'none') as 'ascending' | 'descending' | 'none',
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
  const row = (v: LiveVoyage) => {
    const due = v.notDue
      ? { l: 'Not due', c: 'hm-due nd' }
      : v.late
        ? { l: 'Overdue ' + v.overdueBy + (v.overdueBy === 1 ? ' day' : ' days'), c: 'hm-due late' }
        : v.open
          ? v.date === TODAY
            ? { l: 'Due today', c: 'hm-due today' }
            : { l: 'Open', c: 'hm-due today' }
          : { l: 'Complete', c: 'hm-due ok' };
    const why = [v.roe ? 'ROE ' + fmtN(v.roe) : '', v.nod ? 'Data ' + fmtN(v.nod) : '', v.hold ? 'Split ' + fmtN(v.hold) : '']
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
      date: (v.dir === 'E' ? 'ETD ' : 'ETA ') + formatDate(v.date, { day: 'numeric', month: 'short' }),
      dueL: due.l,
      dueC: due.c,
      invL: v.notDue ? '— / ' + fmtN(v.bls) : fmtN(v.inv) + ' / ' + fmtN(v.bls),
      bI: 'width: ' + (v.inv / v.bls) * 100 + '%',
      bR: 'width: ' + (v.ready / v.bls) * 100 + '%',
      bB: 'width: ' + (v.notDue ? 0 : v.blocked / v.bls) * 100 + '%',
      ready: v.notDue ? '—' : fmtN(v.ready),
      readyC: v.ready ? 'r' : 'r mu',
      blocked: v.notDue ? '—' : fmtN(v.blocked),
      blockedC: v.blocked && !v.notDue ? 'r hm-wn' : 'r mu',
      why,
      on: !!s.sel[v.id],
      chk: () => toggle(v.id),
      chkL: 'Select ' + v.no,
      cls: s.sel[v.id] ? 'on' : '',
      canGen: v.ready > 0,
      genL: 'Generate ' + fmtN(v.ready),
      noGen: !v.ready,
      noGenL: v.notDue ? 'Awaiting LMS' : v.open ? 'Blocked' : 'Done',
      open: () => self.setState({ drw: v.id, drwF: v.blocked && !v.ready ? 'blocked' : '', drwQ: '', drwPg: 1 }),
      openL: 'Open voyage ' + v.no,
      gen: () => self.setState({ confirm: { kind: 'voy', ids: [v.id] } }),
    };
  };
  const groups: { k: string; rows: ReturnType<typeof row>[] }[] = [];
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
      l: multi ? (G.k === TODAY ? 'Today · ' : '') + formatDate(G.k, { weekday: 'long', day: 'numeric', month: 'short' }) : '',
      m: multi
        ? vs.length + (vs.length === 1 ? ' voyage' : ' voyages') + (G.k > TODAY ? ' · not due' : ' · ' + fmtN(tally(vs, 'open')) + ' open')
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
  const pc = (n: number) => 'width: ' + (E ? (n / E) * 100 : 0) + '%';
  const glance = {
    stats: [
      ['Expected', fmtN(E), ''],
      ['Invoiced', fmtN(I), 'inv'],
      ['Ready', fmtN(R), 'rdy'],
      ['Blocked', fmtN(B), 'blk'],
    ]
      .concat(W ? [['Not due yet', fmtN(W), 'nd']] : [])
      .map(([l, v, k]) => ({ l, v, k: 'hm-dot ' + k, has: !!k })),
    bI: pc(I),
    bR: pc(R),
    bB: pc(B),
    bW: pc(W),
    pct: E ? Math.round((I / E) * 100) + '% invoiced' : '',
    voy: fmtN(S.length) + (S.length === 1 ? ' voyage' : ' voyages'),
  };

  const pool0 = scopeAll.concat(overdue);
  // ---------- B/L enumeration (same order as the voyage panel)
  const blSeq = (v: LiveVoyage): BlState[] => {
    const q2: BlState[] = [];
    const push = (k: BlState, n: number) => {
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
  const blRow = (v: LiveVoyage, i: number) => {
    const r = seededRandom(v.id + i);
    r();
    const ctr = 1 + Math.floor(r() * 3);
    return {
      bl: v.here.slice(2) + v.no.slice(0, 6) + String(i + 1).padStart(4, '0'),
      cust: CUSTOMERS[Math.floor(seededRandom(v.id + i)() * CUSTOMERS.length)],
      ctr,
      amt: Math.round(v.avg * (0.6 + r() * 0.8) * 100) / 100,
    };
  };
  const MAILR: Record<FollowUpMail['reason'], { l: string; to: string; file: string; extra: string[] }> = {
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
  const mailRows = (m: Pick<FollowUpMail, 'reason' | 'ids' | 'pair'>) => {
    const vs = m.ids.map((id) => pool0.find((v) => v.id === id)).filter((v): v is LiveVoyage => !!v);
    const out: XlsxCell[][] = [];
    vs.forEach((v) =>
      blSeq(v).forEach((k, i) => {
        if (k !== m.reason || (m.pair && v.pair !== m.pair)) return;
        const b = blRow(v, i),
          d = formatDate(v.date, { day: '2-digit', month: 'short', year: 'numeric' });
        out.push(
          [v.no, v.vessel, v.dir === 'E' ? 'Export' : 'Import', v.pol, v.pod, d, b.bl, b.cust, b.ctr, b.amt].concat(
            m.reason === 'nod'
              ? [MISSING_DATA[i % MISSING_DATA.length]]
              : m.reason === 'roe'
                ? [v.pair, d]
                : ['Second payer and share not confirmed'],
          ),
        );
      }),
    );
    return { vs, rows: out };
  };
  const openMail = (
    reason: FollowUpMail['reason'],
    vs: readonly LiveVoyage[],
    opt?: { pair?: string; keys?: FollowUpMail['keys']; scope?: string },
  ) => {
    const o = opt ?? {},
      R = MAILR[reason],
      m0 = { reason, ids: vs.map((v) => v.id), pair: o.pair || '' },
      mr = mailRows(m0);
    const n = mr.rows.length,
      amt = mr.rows.reduce((a: number, r) => a + Number(r[9] ?? 0), 0),
      nos = vs.map((v) => v.no);
    const voyL = nos.length > 6 ? nos.slice(0, 6).join(', ') + ' and ' + (nos.length - 6) + ' more' : nos.join(', ');
    const sign = '\n\nRegards,\n' + FALLBACK_SESSION.name + '\nBilling Executive · ' + cty + ' (' + port + ')';
    const sub =
      reason === 'nod'
        ? 'Missing B/L data from LMS — ' + fmtN(n) + ' B/Ls on hold · ' + port + ' · ' + (o.scope || rangeL)
        : reason === 'roe'
          ? 'ROE request — ' +
            o.pair +
            ' for ' +
            formatDate(TODAY, { day: 'numeric', month: 'short', year: 'numeric' }) +
            ' · ' +
            fmtN(n) +
            ' invoices waiting'
          : 'Split-payer confirmation needed — ' + fmtN(n) + ' B/Ls · ' + port;
    const body =
      reason === 'nod'
        ? 'Hello team,\n\nThe B/Ls in the attached sheet are blocked from invoicing at ' +
          port +
          ' because their data has not been received from LMS. The missing item is listed against each B/L.\n\nVoyages: ' +
          voyL +
          '\nB/Ls: ' +
          fmtN(n) +
          ' · Amount on hold: ' +
          fmtUsd(amt) +
          '\n\nPlease complete the data in LMS and resend it, or reply with an expected date.' +
          sign
        : reason === 'roe'
          ? 'Hello Treasury,\n\nThe daily rate of exchange for ' +
            o.pair +
            ' has not been received in GIRS. ' +
            fmtN(n) +
            ' invoices on the voyages below cannot be generated until the rate is available. Details are in the attached sheet.\n\nVoyages: ' +
            voyL +
            '\nAmount on hold: ' +
            fmtUsd(amt) +
            '\n\nPlease publish the rate or reply with the approved rate so it can be entered manually.' +
            sign
          : 'Hello team,\n\nThe B/Ls in the attached sheet have a split payer that is not confirmed. Please confirm the second payer and the share for each B/L so the invoices can be generated.\n\nVoyages: ' +
            voyL +
            '\nB/Ls: ' +
            fmtN(n) +
            ' · Amount on hold: ' +
            fmtUsd(amt) +
            sign;
    const file = R.file + '_' + port + '_' + TODAY.replace(/-/g, '') + '.xlsx';
    const blob = buildXlsx(
      R.l,
      ['Voyage No.', 'Vessel', 'Direction', 'POL', 'POD', 'ETD / ETA', 'B/L No.', 'Billing party', 'Containers', 'Amount (USD)'].concat(
        R.extra,
      ),
      mr.rows,
    );
    self.setState({
      mail: Object.assign(m0, {
        to: R.to,
        cc: FALLBACK_SESSION.name.toLowerCase().replace(/\s+/g, '.') + '@pilship.com',
        sub,
        body,
        file,
        size: formatFileSize(blob.size),
        n,
        keys: o.keys || [],
      }),
      mailPrev: false,
    });
  };

  // ---------- reasons (rail)
  const due = S.filter((v) => !v.notDue);
  const reasons: Blocker[] = [];
  const nodV = due.filter((v) => v.nod);
  if (nodV.length) {
    const key = 'nod:' + port + ':' + rangeL,
      sent = s.fu[key];
    reasons.push({
      r: 'Data not received from LMS',
      own: 'Port agency · Documentation',
      n: fmtN(tally(nodV, 'nod')),
      v: nodV.length + (nodV.length === 1 ? ' voyage' : ' voyages'),
      amt: fmtUsd(nodV.reduce((a, v) => a + v.nod * v.avg, 0)),
      st: sent ? 'Follow-up sent ' + sent : '',
      hasSt: !!sent,
      act: sent ? 'Remind' : 'Send follow-up',
      go: () => openMail('nod', nodV, { keys: [['fu', key]] }),
    });
  }
  const pairs: Record<string, LiveVoyage[]> = {};
  due
    .filter((v) => v.roe)
    .forEach((v) => {
      (pairs[v.pair] = pairs[v.pair] || []).push(v);
    });
  Object.keys(pairs).forEach((pr) => {
    const vs = pairs[pr] ?? [],
      req = s.roeReq[pr];
    reasons.push({
      r: 'ROE not received · ' + pr,
      own: 'Treasury · ROE feed',
      n: fmtN(tally(vs, 'roe')),
      v: vs.length + (vs.length === 1 ? ' voyage' : ' voyages'),
      amt: fmtUsd(vs.reduce((a, v) => a + v.roe * v.avg, 0)),
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
      n: fmtN(tally(holdV, 'hold')),
      v: holdV.length + (holdV.length === 1 ? ' voyage' : ' voyages'),
      amt: fmtUsd(holdV.reduce((a, v) => a + v.hold * v.avg, 0)),
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
    genL: 'Generate ' + fmtN(tally(selV, 'ready')) + ' ready',
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
  const dv = s.drw ? (scopeAll.find((v) => v.id === s.drw) ?? overdue.find((v) => v.id === s.drw)) : undefined;
  const drw = !dv
    ? null
    : (() => {
        const seq: BlState[] = [];
        const push = (k: BlState, n: number) => {
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
        const want = (k: BlState) => !s.drwF || (s.drwF === 'blocked' ? ['roe', 'nod', 'hold'].includes(k) : k === s.drwF);
        const blno = (i: number) => dv.here.slice(2) + dv.no.slice(0, 6) + String(i + 1).padStart(4, '0');
        const custOf = (i: number) => CUSTOMERS[Math.floor(seededRandom(dv.id + i)() * CUSTOMERS.length)] ?? '';
        const idx: number[] = [];
        seq.forEach((k, i) => {
          if (want(k) && (!dq || (blno(i) + ' ' + custOf(i)).toUpperCase().includes(dq))) idx.push(i);
        });
        const dps = 50,
          dpages = Math.max(1, Math.ceil(idx.length / dps)),
          dpn = Math.min(s.drwPg, dpages);
        const dgo = (v: number) => () => self.setState({ drwPg: v });
        return {
          show: true,
          no: dv.no,
          vessel: dv.vessel,
          svc: dv.svc,
          typeL: dv.dir === 'E' ? 'Export' : 'Import',
          typeC: 'chip t-neutral dot-' + dv.dir.toLowerCase(),
          route: dv.pol + ' → ' + dv.pod,
          date:
            (dv.dir === 'E' ? 'ETD ' : 'ETA ') + formatDate(dv.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
          stats: (
            [
              ['Expected', fmtN(dv.bls)],
              ['Invoiced', fmtN(dv.inv)],
              ['Ready', fmtN(dv.ready)],
              ['Blocked', fmtN(dv.notDue ? 0 : dv.blocked)],
            ] as const
          ).map(([l, v]) => ({ l, v })),
          bI: 'width: ' + (dv.inv / dv.bls) * 100 + '%',
          bR: 'width: ' + (dv.ready / dv.bls) * 100 + '%',
          bB: 'width: ' + (dv.notDue ? 0 : dv.blocked / dv.bls) * 100 + '%',
          reasons: (
            [
              ['nod', 'Data not received from LMS', 'Port agency'],
              ['roe', 'ROE not received · ' + dv.pair, 'Treasury'],
              ['hold', 'Split-payer unconfirmed', 'Customer service'],
            ] as const
          )
            .filter(([k]) => dv[k] > 0 && !dv.notDue)
            .map(([k, l, o]) => {
              const key = 'v:' + dv.id + ':' + k,
                sent = k === 'roe' ? s.roeReq[dv.pair] : s.fu[key];
              return {
                l,
                o,
                n: fmtN(dv[k]),
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
          filters: (
            [
              ['', 'All', dv.notDue ? 0 : dv.bls],
              ['ready', 'Ready', dv.ready],
              ['blocked', 'Blocked', dv.notDue ? 0 : dv.blocked],
              ['inv', 'Invoiced', dv.inv],
            ] as const
          ).map(([k, l, n]) => ({ l, n: fmtN(n), cur: s.drwF === k ? 'true' : 'false', pick: () => self.setState({ drwF: k, drwPg: 1 }) })),
          q: s.drwQ,
          onQ: (e: FieldEvent) => self.setState({ drwQ: e.target.value, drwPg: 1 }),
          bls: idx.slice((dpn - 1) * dps, dpn * dps).map((i, n, pageIdx) => {
            const k = seq[i] ?? 'ready',
              r = seededRandom(dv.id + i);
            r();
            return {
              open: () => self.setState({ ri: { vid: dv.id, list: pageIdx.slice(), i: n }, decl: false }),
              openL: 'Open B/L ' + blno(i) + ' — ' + (BL_STATUS[k]?.[0] ?? ''),
              bl: blno(i),
              cust: custOf(i),
              ctr: String(1 + Math.floor(r() * 3)),
              amt: fmtUsd(dv.avg * (0.6 + r() * 0.8)),
              st: BL_STATUS[k]?.[0] ?? '',
              stC: 'chip t-' + (BL_STATUS[k]?.[1] ?? 'neutral'),
              note:
                k === 'nod'
                  ? 'Missing: ' + (MISSING_DATA[i % MISSING_DATA.length] ?? '')
                  : k === 'roe'
                    ? dv.pair + ' for ' + formatDate(dv.date, { day: 'numeric', month: 'short' })
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
            text: idx.length ? (dpn - 1) * dps + 1 + '–' + Math.min(dpn * dps, idx.length) + ' of ' + fmtN(idx.length) : '',
            pos: dpn + ' / ' + dpages,
            prevDis: dpn <= 1,
            nextDis: dpn >= dpages,
            prev: dgo(dpn - 1),
            next: dgo(dpn + 1),
            show: dpages > 1,
          },
          canGen: dv.ready > 0,
          genL: 'Generate ' + fmtN(dv.ready) + ' ready',
          gen: () => self.setState({ confirm: { kind: 'voy', ids: [dv.id] } }),
          list: 'invoice-list-v2.html?q=' + dv.no,
          close: () => self.setState({ drw: '' }),
        };
      })();

  // ---------- Ready to invoice (one B/L)
  const riState = s.ri;
  const ri = !(riState && dv && riState.vid === dv.id)
    ? null
    : (() => {
        const seq2: BlState[] = [];
        const push2 = (k: BlState, n: number) => {
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
        const L = riState.list,
          pos = Math.min(riState.i, L.length - 1),
          i = L[pos] ?? 0,
          k = seq2[i] ?? 'ready';
        const loc = LOCATIONS[dv.here] ?? (['USD', 1, 'VAT-0', 'ZR-INTL'] as const);
        const r = seededRandom(dv.id + i);
        r();
        const cust = CUSTOMERS[Math.floor(seededRandom(dv.id + i)() * CUSTOMERS.length)] ?? '',
          ctr = 1 + Math.floor(r() * 3),
          amt = dv.avg * (0.6 + r() * 0.8);
        const bl = dv.here.slice(2) + dv.no.slice(0, 6) + String(i + 1).padStart(4, '0');
        const roeTxt = k === 'roe' ? '' : String(1 / loc[1]); // local → USD multiplier
        const lines = (
          (dv.dir === 'E'
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
              ]) as [string, string, number, string, string, string][]
        ).map(([code, name, a, cur, roe, tax]) => ({ code, name, amt: Math.round(a * 100) / 100, cur, roe, tax }));
        const cc2 = dv.here.slice(0, 2),
          dir = customerDirectory(cc2),
          key = dv.id + '#' + i;
        const dflt = dir.find((c) => c.name.indexOf(cust) === 0) ?? dir[0];
        const ed: BlEdit = s.riEd[key] ?? { cust: dflt?.code ?? '', add: [] };
        const putEd = (p: Partial<BlEdit>) => self.save({ riEd: { ...s.riEd, [key]: { ...ed, ...p } } });
        const cu = dir.find((c) => c.code === ed.cust) ?? null;
        const rate = (tax: string) => {
          const m2 = String(tax).match(/-(\d+(?:\.\d+)?)$/);
          return /^ZR/.test(tax) ? 0 : m2 ? Number(m2[1]) : 0;
        };
        const okAdd = (a: AddedBlCharge) =>
          !!a.code &&
          parseFloat(String(a.qty)) > 0 &&
          !!a.uom &&
          !!a.cur &&
          String(a.unit).trim() !== '' &&
          parseFloat(String(a.unit).replace(/,/g, '')) >= 0;
        const addLines = ed.add.filter(okAdd).map((a) => ({
          code: a.code,
          name: CHARGES[a.code] ?? a.code,
          amt: parseFloat(String(a.qty)) * parseFloat(String(a.unit).replace(/,/g, '')),
          cur: a.cur,
          roe: a.cur === 'USD' ? '—' : roeTxt,
          tax: a.cur === 'USD' ? loc[3] : loc[2],
        }));
        const due = addDays(TODAY, 14);
        const m = invoiceModel({
          no: bl,
          type: 'Freight',
          status: 'Ready',
          date: TODAY,
          due,
          bl,
          cntr: String(ctr) + ' × 40HC',
          vvd: '',
          port: dv.here,
          cust: { code: ed.cust, name: cu ? cu.name : '', tax: '', addr: cu ? cu.addr : '' },
          lines: lines.concat(addLines),
        });
        const custCode = ed.cust;
        const kv = (a: ReadonlyArray<readonly [string, string]>) => a.map(([kk, v]) => ({ k: kk, v }));
        const errs =
          k === 'roe'
            ? [
                {
                  area: 'Exchange rate',
                  text:
                    dv.pair +
                    ' rate for ' +
                    formatDate(dv.date, { day: 'numeric', month: 'short', year: 'numeric' }) +
                    ' not received from Treasury — local charges cannot be converted.',
                },
              ]
            : k === 'nod'
              ? [{ area: 'LMS data', text: MISSING_DATA[i % MISSING_DATA.length] + ' not received from LMS for this B/L.' }]
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
        const pickCu = (code: string) => {
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
            pick: (e: MouseEvent<HTMLElement>) => {
              e.preventDefault();
              pickCu(c.code);
            },
          })),
          onQ: (e: FieldEvent) => self.setState({ riCu: { q: e.target.value, hi: 0 } }),
          onFocus: () => self.setState({ riCu: { q: '', hi: 0 } }),
          onBlur: () =>
            window.setTimeout(() => {
              if (self.state.riCu) self.setState({ riCu: null });
            }, 150),
          onKey: (e: KeyboardEvent<HTMLElement>) => {
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
          const upd = (p: Partial<AddedBlCharge>) => putEd({ add: ed.add.map((y, n) => (n === j ? { ...y, ...p } : y)) });
          const ok = okAdd(a),
            q = parseFloat(String(a.qty)),
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
            ? Object.keys(CHARGES)
                .filter((c) => !sq || c.toLowerCase().includes(sq) || (CHARGES[c] ?? '').toLowerCase().includes(sq))
                .slice(0, 8)
            : [];
          const hi = sg ? Math.min(sg.hi, opts.length - 1) : -1;
          const pick = (c: string) => {
            self.setState({ riSug: null });
            upd({
              code: c,
              q: CHARGES[c] ?? c,
              cur: a.cur || (/OFT|BAF|LSS/.test(c) ? 'USD' : loc[0]),
              uom: a.uom || (/DOC|DO$/.test(c) ? 'BL' : /DEM|DET/.test(c) ? 'Day' : 'CNTR'),
            });
          };
          const fmt2 = (n: number) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          const t = a.t ?? {},
            bad = (v: unknown, f: string) => (!ok && t[f] && !v ? 'bad' : '');
          const line: HomeReviewLine = {
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
              name: CHARGES[c] ?? c,
              on: n === hi ? 'true' : 'false',
              pick: (e: MouseEvent<HTMLElement>) => {
                e.preventDefault();
                pick(c);
              },
            })),
            onQ: (e: FieldEvent) => {
              const v = e.target.value;
              self.save({
                riSug: { i: j, hi: 0 },
                riEd: {
                  ...s.riEd,
                  [key]: {
                    ...ed,
                    add: ed.add.map((y, n) => (n === j ? { ...y, q: v, code: CHARGES[y.code] === v ? y.code : '', t: { ...t, q: 1 } } : y)),
                  },
                },
              });
            },
            onFocus: () => self.setState({ riSug: { i: j, hi: 0 } }),
            onBlur: () =>
              window.setTimeout(() => {
                if (self.state.riSug && self.state.riSug.i === j) self.setState({ riSug: null });
              }, 150),
            onKey: (e: KeyboardEvent<HTMLElement>) => {
              if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const n = opts.length || 1;
                self.setState({ riSug: { i: j, hi: sg ? (hi + (e.key === 'ArrowDown' ? 1 : n - 1)) % n : 0 } });
              } else if (e.key === 'Enter' && sg && opts[hi]) {
                e.preventDefault();
                pick(opts[hi] ?? '');
              }
            },
            qty: a.qty,
            uom: a.uom,
            unit: a.unit,
            cur: a.cur,
            uoms: UOMS,
            curs,
            qErr: bad(q > 0, 'qty'),
            uErr: bad(a.uom, 'uom'),
            pErr: bad(String(a.unit).trim() !== '' && u >= 0, 'unit'),
            cErr: bad(a.cur, 'cur'),
            onQty: (e: FieldEvent) => upd({ qty: e.target.value, t: { ...t, qty: 1 } }),
            onUom: (e: FieldEvent) => upd({ uom: e.target.value, t: { ...t, uom: 1 } }),
            onUnit: (e: FieldEvent) => upd({ unit: e.target.value, t: { ...t, unit: 1 } }),
            onCur: (e: FieldEvent) => upd({ cur: e.target.value, t: { ...t, cur: 1 } }),
            del: () => putEd({ add: ed.add.filter((_, n) => n !== j) }),
            ex: ex == null ? '—' : fmt2(ex),
            ta: ex == null ? '—' : rt + '%',
            tax: tx == null ? '—' : fmt2(tx),
            inc: ex == null ? '—' : fmt2(ex + (tx ?? 0)),
          };
          return line;
        });
        const addCharge = () => putEd({ add: ed.add.concat([{ code: '', q: '', qty: '1', uom: '', unit: '', cur: '', t: {} }]) });
        const done = k === 'inv';
        const go = (d: number) => () => self.setState({ ri: { ...riState, i: pos + d }, decl: false });
        const gen = () => {
          const bg = structuredClone(s.blGen);
          bg[dv.id] = { ...bg[dv.id], [i]: 1 };
          const nextIdx = L.findIndex((x, n) => n > pos && seq2[x] === 'ready');
          self.save({
            blGen: bg,
            decl: false,
            ri: nextIdx >= 0 ? { ...riState, i: nextIdx } : null,
            __toast: 'Invoice ' + bl + ' generated' + (nextIdx >= 0 ? ' · next ready B/L opened' : '') + '.',
          });
        };
        return {
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
                  ? (
                      [['Invoice No.', 'INV-' + dv.here.slice(0, 2) + '-' + dv.no + '-' + String(i + 1).padStart(4, '0')]] as (readonly [
                        string,
                        string,
                      ])[]
                    ).concat(m.strip.slice(1))
                  : m.strip.slice(1),
              )
            : [],
          from0: m ? m.from[0] : '',
          fromL: m ? m.from.slice(1) : [],
          cust: cu ? cu.name : '—',
          custCode,
          details: m ? kv(m.details.map((d) => (d[0] === 'Customer Code' ? [d[0], custCode] : d))) : [],
          ship: kv([
            ['Voyage', dv.no + '  ' + formatDate(dv.date, { day: 'numeric', month: 'short', year: '2-digit' }) + '  ' + dv.vessel],
            ['BL Id/Number', bl],
            ['Loaded', dv.pol],
            ['Discharge', dv.pod],
            ['Service', dv.svc],
            ['Containers', ctr + ' × 40HC'],
          ]),
          lines: (m
            ? m.rows.slice(0, lines.length).map((l): HomeReviewLine => ({
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
          stLabel: BL_STATUS[k][0],
          stC: 'chip t-' + BL_STATUS[k][1],
          list: 'invoice-list-v2.html?q=' + bl,
          close: () => self.setState({ ri: null, decl: false }),
        };
      })();

  // ---------- confirm / rate
  const pool = scopeAll.concat(overdue);
  const noop = () => undefined;
  let cf: { show: boolean; title: string; rows: { l: string; v: string }[]; note: string; cancel: () => void; ok: () => void } = {
    show: false,
    title: '',
    rows: [],
    note: '',
    cancel: noop,
    ok: noop,
  };
  if (s.confirm && s.confirm.kind === 'voy') {
    const ids = s.confirm.ids;
    const vs = pool.filter((v, i, a) => ids.includes(v.id) && v.ready && a.findIndex((x) => x.id === v.id) === i);
    const n = tally(vs, 'ready');
    cf = {
      show: true,
      title: 'Generate ' + fmtN(n) + (n === 1 ? ' invoice?' : ' invoices?'),
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
        ['Billing parties', fmtN(Math.min(n, 6 + vs.length * 4))],
        ['Total amount', fmtUsd(vs.reduce((a, v) => a + v.ready * v.avg, 0))],
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
          done: { n: fmtN(n), q: vs.length === 1 ? vs[0].no : '', nos: vs.length === 1 ? 'voyage ' + vs[0].no : vs.length + ' voyages' },
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
  let rate: {
    show: boolean;
    pair: string;
    val: string;
    on: (e: FieldEvent) => void;
    date: string;
    info: string;
    cancel: () => void;
    ok: () => void;
  } = { show: false, pair: '', val: '', on: noop, date: '', info: '', cancel: noop, ok: noop };
  if (s.rateFor) {
    const vs = due.filter((v) => v.pair === s.rateFor && v.roe);
    rate = {
      show: true,
      pair: s.rateFor,
      val: s.rateVal,
      on: (e: FieldEvent) => self.setState({ rateVal: e.target.value }),
      date: formatDate(TODAY, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
      info: 'Clears ' + fmtN(tally(vs, 'roe')) + ' blocked invoices on ' + vs.length + (vs.length === 1 ? ' voyage.' : ' voyages.'),
      cancel: () => self.setState({ rateFor: '' }),
      ok: () => {
        const r = parseFloat(s.rateVal);
        if (!(r > 0)) return self.setState({ __toast: 'Enter the rate received from Treasury.' });
        self.save({
          roeSet: { ...s.roeSet, [s.rateFor]: r },
          rateFor: '',
          __toast: 'Rate ' + r + ' applied for ' + s.rateFor + '. ' + fmtN(tally(vs, 'roe')) + ' invoices are now ready.',
        });
      },
    };
  }

  // ---------- D&D
  const dd = self.ddContainers.map((c) => {
    const end = c.back || TODAY,
      used = daysBetween(c.out, end),
      over = Math.max(0, used - c.free),
      sl = ddCharge(c.sz, over);
    return {
      ...c,
      used,
      over,
      amt: c.st === 'tariff' ? 0 : sl.amt,
      slab: sl.txt,
      status: s.ddGen[c.cn] ? ('invoiced' as const) : c.st,
    };
  });
  type DdRow = (typeof dd)[number];
  const isBlk = (c: DdRow) => ['roe', 'tariff', 'milestone', 'waiver'].includes(c.status);
  const am = (cs: readonly DdRow[]) => fmtUsd(cs.reduce((a, c) => a + c.amt, 0));
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
  const dgo = (v: number) => () => self.setState({ ddPg: v });
  const ddRs: Record<string, DdRow[]> = {};
  dBlk.forEach((c) => {
    (ddRs[c.status] = ddRs[c.status] || []).push(c);
  });
  const genBL = (bl: string) => {
    const cs = dd.filter((x) => x.bl === bl && x.status === 'ready');
    self.setState({ confirm: { kind: 'dd', cns: cs.map((x) => x.cn), bls: 1, amt: am(cs) } });
  };

  const voyOpenToday = tally(day(TODAY), 'open') + tally(overdue, 'open');
  return {
    greet,
    ctx: cty + ' (' + port + ') · ' + ent + ' · LMS data received 2 min ago',
    tabs: {
      voy: s.tab === 'voy',
      dd: s.tab === 'dd',
      voyA: s.tab === 'voy' ? 'true' : 'false',
      ddA: s.tab === 'dd' ? 'true' : 'false',
      voyN: fmtN(voyOpenToday) + ' open',
      ddN: dReady.length + dBlk.length + ' to bill',
      toVoy: () => self.setState({ tab: 'voy' }),
      toDd: () => self.setState({ tab: 'dd' }),
    },
    alert: !s.alertOff && s.tab === 'voy' && !Object.keys(s.roeSet).length && day(TODAY).some((v) => v.roe),
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
    ].map(([k, l]) => ({ l, n: fmtN(stCount(k)), cur: s.stf === k ? 'true' : 'false', pick: () => self.setState({ stf: k, pg: 1 }) })),
    q: s.q,
    onQ: (e: FieldEvent) => self.setState({ q: e.target.value, pg: 1 }),
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
      self.setState({ sel: { ...s.sel, ...Object.fromEntries(pageRows.map((v) => [v.id, !allOn])) } });
    },
    pager,
    bulk,
    glance,
    reasons,
    noReasons: !reasons.length,
    rangeL,
    genAllL: 'Generate all ready (' + fmtN(R) + ')',
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
      const put = (k: 'to' | 'cc' | 'sub' | 'body') => (e: FieldEvent) => self.setState({ mail: { ...m, [k]: e.target.value } });
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
        meta: fmtN(mr.rows.length) + ' B/Ls · ' + heads.length + ' columns · ' + m.size,
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
        more: mr.rows.length > 8 ? '+ ' + fmtN(mr.rows.length - 8) + ' more rows in the file' : '',
        download: () => downloadBlob(buildXlsx(R.l, heads, mr.rows), m.file),
        cancel: () => self.setState({ mail: null }),
        send: () => {
          if (!String(m.to).trim()) return self.setState({ __toast: 'Add at least one recipient.' });
          const t = timeNow(),
            patch = {
              mail: null,
              __toast:
                (m.reason === 'roe' ? 'ROE request' : 'Follow-up') +
                ' sent to ' +
                String(m.to).replace(/\s*<.*$/, '') +
                ' with ' +
                m.file +
                ' (' +
                fmtN(mr.rows.length) +
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
      reasons: Object.entries(ddRs).map(([k, rows]) => {
        const done = s.ddAct[k];
        const [owner, action] = DD_REASONS[k] ?? ['', ''];
        return {
          r: DD_STATUS[k]?.[0] ?? k,
          own: owner,
          n: rows.length + (rows.length === 1 ? ' container' : ' containers'),
          amt: k === 'tariff' ? 'Amount unknown' : am(rows),
          st: done ? 'Sent ' + done : '',
          hasSt: !!done,
          act: done ? 'Remind' : action,
          go: () => self.save({ ddAct: { ...s.ddAct, [k]: timeNow() }, __toast: action + ' sent to ' + owner + '.' }),
        };
      }),
      fil: (
        [
          ['all', 'All', dd.length],
          ['ready', 'Ready', dReady.length],
          ['blocked', 'Blocked', dBlk.length],
          ['out', 'With customer', dOut.length],
          ['invoiced', 'Invoiced', dInv.length],
        ] as const
      ).map(([k, l, n]) => ({ l, n: String(n), cur: s.ddF === k ? 'true' : 'false', pick: () => self.setState({ ddF: k, ddPg: 1 }) })),
      q: s.ddQ,
      onQ: (e: FieldEvent) => self.setState({ ddQ: e.target.value, ddPg: 1 }),
      rows: ddSorted.slice(doff, doff + dps).map((c) => ({
        cn: c.cn,
        sz: c.sz,
        cust: c.cust,
        bl: c.bl,
        typeL: c.dir === 'E' ? 'Export' : 'Import',
        typeC: 'chip t-neutral dot-' + c.dir.toLowerCase(),
        type: c.type,
        out: formatDate(c.out, { day: 'numeric', month: 'short' }),
        back: c.back ? formatDate(c.back, { day: 'numeric', month: 'short' }) : 'Not returned',
        backC: c.back ? '' : 'mu',
        days: c.used + ' / ' + c.free,
        over: String(c.over),
        overC: c.over ? 'r hm-wn' : 'r mu',
        amt: c.status === 'tariff' ? '—' : c.amt ? fmtUsd(c.amt) : '—',
        slab: c.status === 'tariff' ? 'No tariff for ' + c.sz : c.over ? c.slab : 'Within free time',
        stL: DD_STATUS[c.status][0],
        stC: 'chip t-' + DD_STATUS[c.status][1],
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
        onSize: (e: FieldEvent) => self.setState({ psz: parseInt(e.target.value, 10), ddPg: 1 }),
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

export type VoyageVals = ReturnType<typeof voyageVals>;
