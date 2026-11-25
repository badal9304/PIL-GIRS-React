/* Invoice List view-model: tabs (Ready to invoice / Invoices), filters, search, sort, column choice,
   pagination, row actions, dialogs and the Ready-to-invoice review screen. */
import type { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
import {
  CHARGE_NAMES,
  INVOICE_COLUMNS,
  DEFAULT_COLUMNS,
  READY_CHECKS,
  STATUS_TONE,
  READY_PILL,
  USD_RATES,
  INVOICE_CUSTOMERS,
  LOCATIONS,
  formatMoney,
  todayText,
  inDaysText,
  stampNow,
  mainAmount,
  invoiceDocData,
  hasJson,
  asList,
  inFilter,
  matchesSearch,
  searchText,
  statusChip,
  paymentPill,
  distribution,
  readyTotals,
  mainTax,
  addedChargeOk,
  readyErrors,
  withEdits,
  invoiceViews,
  readyViews,
  invoiceModel,
  invoiceDocuments,
  type InvoiceChanges,
  type InvoiceView,
  type InvoiceWorkspace,
  invoiceTypeSchema,
  type AddedCharge,
  type CreditNote,
  type InvoiceLine,
  type ReadyEdit,
  type ReadyItem,
} from '@/entities/invoice';
import { getZoom } from '@/shared/lib/navigationBridge';
import { ScreenModel, type StateUpdate } from '@/shared/lib/screenModel';
import type { InvoiceActions } from '../api/invoiceMutations';
import {
  downloadInvoice,
  downloadJson,
  downloadPdf,
  goTo,
  loadColumns,
  saveColumns,
  saveTextFile,
  viewInvoice,
  viewReceipt,
} from '../lib/invoiceActions';

/** Change of a text box, select or text area. */
type FieldEvent = ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

/** Text fields of the row-action dialogs (refund, manual invoice, send, credit note, …). */
export type DialogTextKey =
  'reason' | 'ch' | 'type' | 'to' | 'amount' | 'why' | 'ref' | 'note' | 'cur' | 'chg' | 'bl' | 'msg' | 'amountErrText';

/** Values typed in a dialog, and which fields show an error. */
export type DialogForm = Partial<Record<DialogTextKey, string>> & { full?: boolean } & { [error: `${string}Err`]: boolean | undefined };

export type DialogKind = string;

export interface InvoiceListState {
  tab: 'inv' | 'ready';
  view: 'list' | 'review';
  /** Review of B/Ls: ids and the one shown. */
  rv: { ids: string[]; i: number } | null;
  q: string;
  /** Filters being chosen in the panel (applied on Done). */
  fd: Readonly<Record<string, readonly string[]>> | null;
  fo: string[];
  fpt: string[];
  fs: string[];
  fe: string[];
  fg: string[];
  fp: string[];
  ft: string[];
  fc: string[];
  fopen: string | null;
  sel: Readonly<Record<string, boolean>>;
  exp: Readonly<Record<string, boolean>>;
  menu: { no: string; pos: { x: number; y: number; up?: boolean } } | null;
  dlg: { kind: DialogKind; no?: string | null; ids?: string[] } | null;
  f: DialogForm;
  cols: string[];
  colsOpen: boolean;
  colsDraft: string[] | null;
  colsQ: string;
  period: string;
  rPort: string;
  rProc: string;
  rKpi: string;
  rsel: Readonly<Record<string, boolean>>;
  rexp: Readonly<Record<string, boolean>>;
  decl: boolean;
  pg: Readonly<Record<string, number>>;
  psz: Readonly<Record<string, number>>;
  sort: string;
  dview: string;
  /** Charge-head suggestions open on added charge i (hi = highlighted option). */
  riSug: { i: number; hi: number } | null;
  /** Billing-customer picker in the review. */
  riCu: { q: string; hi: number } | null;
  /** Edits of the B/L under review. */
  rvEd: ReadyEdit | null;
  /** Values being chosen in an open column filter. */
  fdv: string[] | null;
  /** Status group (simple layouts). */
  grp: string;
  /** Invoice shown in the detail pane (simple layouts). */
  cur: string;
}

/** Deep links from global search: ?q=, ?rv=<ready id> (opens that B/L's review), ?open=<invoice no>, ?tab=ready. */
export interface InvoiceListLink {
  q: string;
  rv: string;
  open: string;
  tab: string;
}

export class InvoiceListModel extends ScreenModel<InvoiceListState, InvoiceListVals, InvoiceWorkspace, InvoiceActions> {
  private readonly openOnMount: string;

  constructor(link: InvoiceListLink, ready: readonly ReadyItem[]) {
    const rvOk = !!link.rv && ready.some((r) => r.id === link.rv);
    super({
      tab: rvOk || link.tab === 'ready' ? 'ready' : 'inv',
      view: rvOk ? 'review' : 'list',
      rv: rvOk ? { ids: [link.rv], i: 0 } : null,
      q: link.q,
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
      cols: loadColumns(),
      colsOpen: false,
      colsDraft: null,
      colsQ: '',
      period: '',
      rPort: '',
      rProc: '',
      rKpi: '',
      rsel: {},
      rexp: {},
      decl: false,
      pg: {},
      psz: {},
      sort: 'new',
      dview: 'cards',
      riSug: null,
      riCu: null,
      rvEd: null,
      fdv: null,
      grp: 'all',
      cur: '',
    });
    this.openOnMount = link.open;
  }

  override mount(): void {
    if (!this.openOnMount) return;
    const i = this.invoices().find((x) => x.no === this.openOnMount);
    if (i) window.setTimeout(() => viewInvoice(i), 50);
  }

  /** The GIRS change-log. */
  get store(): InvoiceChanges {
    return this.data.changes;
  }

  get ready(): readonly ReadyItem[] {
    return this.data.ready;
  }

  /** Sends a credit note request (Credit Note List). */
  submitCreditNote(cn: Parameters<InvoiceActions['submitCreditNote']>[0]): Promise<void> {
    return this.actions.submitCreditNote(cn);
  }

  /** Changes the change-log (saved through the commit action), then updates the screen state. */
  put(mut: (d: InvoiceChanges) => void, extra?: StateUpdate<InvoiceListState> | (() => StateUpdate<InvoiceListState>)): void {
    const d = structuredClone(this.store);
    mut(d);
    this.run(() => this.actions.commit(d), 'The change could not be saved.');
    const patch = typeof extra === 'function' ? extra() : (extra ?? {});
    this.setState(patch);
    if (patch.__toast) this.fade(patch.__toast);
  }

  /** Adds an activity entry for an invoice. */
  ev(d: InvoiceChanges, no: string, what: string): void {
    (d.ev[no] = d.ev[no] ?? []).push([stampNow(), what, 'Daniel Tan']);
  }

  invoices(): InvoiceView[] {
    return invoiceViews(this.data.invoices, this.store);
  }

  readyList(): ReadyItem[] {
    return readyViews(this.data.ready, this.store);
  }

  openMenu(no: string, e: MouseEvent<HTMLElement>): void {
    const z = getZoom();
    const b = e.currentTarget.getBoundingClientRect();
    const vh = window.innerHeight / z;
    const top = b.bottom / z + 4;
    const h = 580;
    const pos = { x: Math.max(8, b.right / z - 264), y: top + h > vh ? Math.max(8, b.top / z - h - 4) : top };
    this.setState({ menu: this.state.menu && this.state.menu.no === no ? null : { no, pos } });
  }

  dlg(kind: DialogKind, inv?: { no: string } | null, f?: DialogForm): void {
    this.setState({ menu: null, dlg: { kind, no: inv ? inv.no : null }, f: f ?? {} });
  }

  setF(patch: DialogForm): void {
    this.setState({ f: { ...this.state.f, ...patch } });
  }

  /** Activity of an invoice: system events, then events recorded in GIRS. */
  audit(inv: InvoiceView): [string, string, string][] {
    const base: [string, string, string][] = [
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
    return base.concat(this.store.ev[inv.no] ?? []);
  }

  protected renderVals(): InvoiceListVals {
    return invoiceListVals(this);
  }
}

/** What the Invoice List values need from the model. */
export interface InvoiceListHost {
  readonly state: InvoiceListState;
  readonly store: InvoiceChanges;
  readonly ready: readonly ReadyItem[];
  setState: (u: StateUpdate<InvoiceListState>) => void;
  put: InvoiceListModel['put'];
  ev: InvoiceListModel['ev'];
  invoices: () => InvoiceView[];
  readyList: () => ReadyItem[];
  openMenu: InvoiceListModel['openMenu'];
  dlg: InvoiceListModel['dlg'];
  setF: InvoiceListModel['setF'];
  audit: InvoiceListModel['audit'];
  toast: (m: string) => void;
  fade: (m: string) => void;
  submitCreditNote: InvoiceActions['submitCreditNote'];
}

export interface DialogKv {
  k: string;
  v: string;
  st: string;
}

export interface DialogCell {
  v: string;
  cls: string;
}

export interface DialogRow {
  cells: DialogCell[];
  st: string;
}

export interface DialogOption {
  v: string;
  label: string;
}

/** A field of a dialog form. */
export interface DialogField {
  label: string;
  val: string;
  on: (e: FieldEvent) => void;
  isInput: boolean;
  isSelect: boolean;
  isText: boolean;
  cls: string;
  span: string;
  hasHint: boolean;
  hint: string;
  hasPh: boolean;
  ph: string;
  opts: DialogOption[];
  hasErr: boolean;
  err: string;
}

/** Invoice details dialog. */
export interface DetailsDialog {
  fields: DialogKv[];
  lines: { chg: string; name: string; amt: string; cur: string; roe: string; tax: string; audit: string }[];
  showPrim: boolean;
  prim: string;
  primRun: () => void;
  openMenu: ((e: MouseEvent<HTMLElement>) => void) | null;
}

export interface TableDialog {
  cols: string[];
  rows: { cells: DialogCell[] }[];
}

export interface Downloads {
  csv?: () => void;
  xls?: () => void;
  pdf?: () => void;
}

export interface ProformaDialog {
  rows: { k: string; v: string }[];
  note?: string;
  noteCls?: string;
  canPaid?: boolean;
  canCancel?: boolean;
  convert?: () => void;
  transfer?: () => void;
  cancel?: () => void;
}

/** Payment, refund, credit note, SOA and manual-invoice dialogs: key facts, form fields, a table, a note. */
export interface GeneralDialog {
  kv: DialogKv[];
  fields: DialogField[];
  rows: DialogRow[];
  cols: DialogCell[];
  note: string;
  noteCls: string;
  tblTitle: string;
  empty: boolean;
  emptyText: string;
  hasKv: boolean;
  hasForm: boolean;
  hasTbl: boolean;
  hasNote: boolean;
}

/** Dialog form update for one text field (clears its error). */
function textPatch(key: DialogTextKey, value: string): DialogForm {
  const p: DialogForm = {};
  p[key] = value;
  p[`${key}Err`] = false;
  return p;
}

/** A charge line in the review table (LMS charges read-only, added charges editable). */
export interface ReviewLine {
  cls: string;
  edit: boolean;
  ro: boolean;
  name: string;
  qty: number | string;
  uom: string;
  unit: number | string;
  cur: string;
  ex: string;
  taxApp: string;
  taxSt: string;
  tax: string;
  inc: string;
  q?: string;
  lid?: string;
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

/** An action in the row menu. */
export interface MenuItem {
  label: string;
  run: () => void;
  dis: boolean;
  note: string;
  hasNote: boolean;
  cls: string;
  sep: boolean;
}

export type FilterKey = 'fo' | 'fpt' | 'fs' | 'fe' | 'fg' | 'ft' | 'fc';

/** State update setting one filter. */
function filterPatch(k: FilterKey, v: string[]): Partial<Record<FilterKey, string[]>> {
  const p: Partial<Record<FilterKey, string[]>> = {};
  p[k] = v;
  return p;
}

/** Values of the Invoice List screen. */
export function invoiceListVals(self: InvoiceListHost) {
  const s = self.state;
  const store = self.store;
  // Layout variants of the prototype; this screen is layout A.
  const isA: boolean = true;
  const isB: boolean = false;
  const isG: boolean = false;
  const isD: boolean = false;
  const toast = (t: string) => {
    self.toast(t);
    self.fade(t);
  };
  const pager = <T>(key: string, arr: readonly T[], sizes: number[]) => {
    const size = s.psz[key] || sizes[0] || 25,
      pages = Math.max(1, Math.ceil(arr.length / size)),
      n = Math.min(s.pg[key] || 1, pages),
      from = (n - 1) * size;
    const go = (v: number) => () => self.setState({ pg: { ...s.pg, [key]: v }, menu: null });
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
        onSize: (e: FieldEvent) =>
          self.setState({
            psz: { ...s.psz, [key]: parseInt(e.target.value, 10) },
            pg: { ...s.pg, [key]: 1 },
          }),
      },
    };
  };
  const toUsd = (l: InvoiceLine) => (l[2] === 'USD' ? l[1] : l[1] / (USD_RATES[l[2]] || 1));
  const dt = (x: string) => {
    const t = Date.parse(x);
    return isNaN(t) ? Infinity : t;
  };
  const SORTS = [
    ['new', 'Newest first'],
    ['due', 'Due date, soonest'],
    ['amt', 'Amount, highest'],
    ['no', 'Invoice No.'],
  ] as const;
  const SORTERS: Record<string, (a: InvoiceView, b: InvoiceView) => number> = {
    new: (a, b) => dt(b.date) - dt(a.date),
    due: (a, b) => dt(a.due) - dt(b.due),
    amt: (a, b) => b.lines.reduce((x, l) => x + toUsd(l), 0) - a.lines.reduce((x, l) => x + toUsd(l), 0),
    no: (a, b) => (a.no < b.no ? -1 : 1),
  };
  const sorter = SORTERS[s.sort] ?? (() => 0);
  const colsSave = (arr: readonly string[]): string[] => {
    const v: string[] = INVOICE_COLUMNS.map((c) => c[0]).filter((k) => arr.includes(k));
    saveColumns(v);
    return v;
  };
  const cv: Record<string, boolean> = {};
  INVOICE_COLUMNS.forEach(([k]) => {
    cv[k] = s.cols.includes(k);
  });
  const dr = s.colsDraft || s.cols;
  const cdv: Record<string, boolean> = {};
  INVOICE_COLUMNS.forEach(([k]) => {
    cdv[k] = dr.includes(k);
  });
  const colsSet = (arr: string[]) => self.setState({ colsDraft: arr });
  const colsAll = INVOICE_COLUMNS.every(([k]) => cdv[k]);
  const colsList: { label: string; on: boolean; lock: boolean; tip: string; flip: () => void }[] = [
    { label: 'Invoice No.', on: true, lock: true, tip: 'Always shown', flip: () => undefined },
    ...INVOICE_COLUMNS.map(([k, label]) => ({
      label,
      on: !!cdv[k],
      lock: false,
      tip: label,
      flip: () => colsSet(cdv[k] ? dr.filter((x) => x !== k) : dr.concat([k])),
    })),
    { label: 'Action', on: true, lock: true, tip: 'Always shown', flip: () => undefined },
  ];
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
    colsOnQ: (e: FieldEvent) => self.setState({ colsQ: e.target.value }),
    colsClrQ: () => {
      self.setState({ colsQ: '' });
      setTimeout(() => {
        const q = document.querySelector<HTMLInputElement>('.cols-q');
        if (q) q.focus();
      }, 30);
    },
    colsAll,
    colsOpen: !!s.colsOpen,
    colsN: s.cols.length + 2 + ' of ' + (INVOICE_COLUMNS.length + 2),
    colsDN: dr.length + 2 + ' of ' + (INVOICE_COLUMNS.length + 2),
    colsIsDef: dr.length === DEFAULT_COLUMNS.length && DEFAULT_COLUMNS.every((k) => dr.includes(k)),
    colsToggle: () => {
      self.setState({ colsOpen: !s.colsOpen, colsQ: '', colsDraft: s.colsOpen ? null : s.cols.slice(), fopen: null, menu: null });
      if (!s.colsOpen)
        setTimeout(() => {
          const q = document.querySelector<HTMLInputElement>('.cols-q');
          if (q) q.focus();
        }, 30);
    },
    colsCancel: () => self.setState({ colsOpen: false, colsDraft: null, colsQ: '' }),
    colsDone: () => self.setState({ cols: colsSave(dr), colsOpen: false, colsDraft: null, colsQ: '' }),
    colsAllFlip: () => colsSet(colsAll ? [] : INVOICE_COLUMNS.map((c) => c[0])),
    colsReset: () => colsSet([...DEFAULT_COLUMNS]),
  };
  const sortSel = {
    val: s.sort,
    opts: SORTS.map(([v, label]) => ({ v, label })),
    on: (e: FieldEvent) => self.setState({ sort: e.target.value, pg: {} }),
  };
  // ---------------- invoices
  const INV = self.invoices();
  const byNo: Record<string, InvoiceView> = {};
  INV.forEach((i) => {
    byNo[i.no] = i;
  });
  const q = s.q.trim().toLowerCase();
  const shown = INV.filter(
    (i) =>
      (!q || matchesSearch(searchText(i), q)) &&
      inFilter(s.fo, i.ctry) &&
      inFilter(s.fpt, i.port) &&
      inFilter(s.fs, i.st2) &&
      inFilter(s.fe, i.einv) &&
      inFilter(s.fg, i.gfs) &&
      inFilter(s.ft, i.type) &&
      (!asList(s.fc).length || i.lines.some((l) => asList(s.fc).includes(l[2]))),
  );
  const uniq = <T>(a: readonly T[]): T[] => a.filter((v, n) => a.indexOf(v) === n);
  // Filters panel (v2): choices are staged in s.fd and applied only on Done
  const FKEYS: readonly FilterKey[] = ['fo', 'fpt', 'fs', 'fe', 'fg', 'ft', 'fc'];
  const allCurrencies = uniq(INV.flatMap((i) => i.lines.map((l) => l[2])));
  const FDEF: readonly (readonly [string, FilterKey, readonly string[]])[] = [
    ['Country', 'fo', uniq(INV.map((i) => i.ctry))],
    ['Port', 'fpt', uniq(INV.map((i) => i.port))],
    ['Invoice Status', 'fs', ['Unpaid', 'Paid', 'Receipted', 'Reconciled', 'Cancelled']],
    ['e-Invoice', 'fe', ['Active', 'Cancelled']],
    ['GFS Status', 'fg', ['Pending', 'Posted']],
    ['Invoice Type', 'ft', uniq(INV.map((i) => i.type))],
    ['Currency', 'fc', allCurrencies],
  ];
  const FFIELD: Readonly<Record<Exclude<FilterKey, 'fc'>, 'ctry' | 'port' | 'st2' | 'einv' | 'gfs' | 'type'>> = {
    fo: 'ctry',
    fpt: 'port',
    fs: 'st2',
    fe: 'einv',
    fg: 'gfs',
    ft: 'type',
  };
  const fieldOf = (i: InvoiceView, k: FilterKey): string => (k === 'fc' ? '' : i[FFIELD[k]]);
  const fMatch = (i: InvoiceView, src: Readonly<Record<string, readonly string[]>>) =>
    inFilter(src.fo, i.ctry) &&
    inFilter(src.fpt, i.port) &&
    inFilter(src.fs, i.st2) &&
    inFilter(src.fe, i.einv) &&
    inFilter(src.fg, i.gfs) &&
    inFilter(src.ft, i.type) &&
    (!asList(src.fc).length || i.lines.some((l) => asList(src.fc).includes(l[2])));
  const fApplied: Record<FilterKey, string[]> = { fo: s.fo, fpt: s.fpt, fs: s.fs, fe: s.fe, fg: s.fg, ft: s.ft, fc: s.fc };
  const fd: Readonly<Record<string, readonly string[]>> = s.fd || fApplied;
  const fOpen = !!s.fd;
  const fCnt = (k: FilterKey, v: string) => INV.filter((i) => (k === 'fc' ? i.lines.some((l) => l[2] === v) : fieldOf(i, k) === v)).length;
  const nApplied = FKEYS.reduce((a, k) => a + fApplied[k].length, 0);
  const nDraft = FKEYS.reduce((a, k) => a + asList(fd[k]).length, 0);
  const fp = {
    open: fOpen,
    openA: fOpen ? 'true' : 'false',
    n: nApplied,
    hasN: nApplied > 0,
    btnSt: nApplied ? 'border-color:var(--accent);color:var(--accent2)' : '',
    noDraft: !nDraft,
    toggle: () => self.setState({ fd: fOpen ? null : { ...fApplied }, menu: null }),
    cancel: () => self.setState({ fd: null }),
    clear: () => self.setState({ fd: Object.fromEntries(FKEYS.map((k) => [k, []])) }),
    done: () => {
      const up: Partial<InvoiceListState> = { fd: null, pg: {} };
      FKEYS.forEach((k) => Object.assign(up, filterPatch(k, asList(fd[k]))));
      self.setState(up);
    },
    preview: fOpen ? INV.filter((i) => fMatch(i, fd)).length.toLocaleString('en-US') + ' invoices match' : '',
    groups: !fOpen
      ? []
      : FDEF.map(([label, k, opts]) => {
          const cur = asList(fd[k]);
          return {
            label,
            n: cur.length,
            hasN: cur.length > 0,
            items: opts.map((v) => ({
              v,
              n: fCnt(k, v).toLocaleString('en-US'),
              on: cur.includes(v),
              flip: () => self.setState({ fd: { ...fd, [k]: cur.includes(v) ? cur.filter((x) => x !== v) : cur.concat([v]) } }),
            })),
          };
        }),
    chips: FDEF.flatMap(([label, k]) =>
      fApplied[k].map((v) => ({
        label: label + ': ' + v,
        rm: () =>
          self.setState({
            ...filterPatch(
              k,
              fApplied[k].filter((x) => x !== v),
            ),
            pg: {},
          }),
      })),
    ),
  };
  const fsel = FDEF.map(([label, k, opts]) => {
    const applied = fApplied[k];
    const open = s.fopen === k;
    const cur = open && s.fdv ? s.fdv : applied;
    const cnt = (v: string) => fCnt(k, v);
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
      done: () => self.setState({ ...filterPatch(k, [...(s.fdv || applied)]), fopen: null, fdv: null, pg: {} }),
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
    const per: Record<string, number> = {};
    i.lines.forEach((l) => {
      per[l[2]] = (per[l[2]] || 0) + l[1];
    });
    const roe = i.lines.find((l) => l[3] !== '—')?.[3] ?? '—';
    const files = i.status === 'Cancelled' && i.files === '—' ? '—' : i.files;
    return Object.assign({}, i, {
      payPill: paymentPill(i.pay),
      st2: i.st2,
      st2Pill: statusChip(i.st2),
      einv: i.einv,
      einvPill: statusChip(i.einv),
      gfs: i.gfs,
      gfsPill: statusChip(i.gfs),
      amtMain: formatMoney(mainAmount(i)),
      curMain: i.lines[0][2],
      on: !!s.sel[i.no],
      rowCls: s.sel[i.no] ? 'on' : '',
      open: !!s.exp[i.no],
      toggle: () => self.setState({ sel: { ...s.sel, [i.no]: !s.sel[i.no] } }),
      expand: () => self.setState({ exp: { ...s.exp, [i.no]: !s.exp[i.no] } }),
      details: () => viewInvoice(i, toast),
      chg: i.lines.length === 1 ? i.lines[0][0] : i.lines.length + ' charges',
      amts: Object.keys(per).map((c) => ({ v: formatMoney(per[c] ?? 0), c })),
      roe,
      roeSt: roe === '—' ? 'color:var(--muted)' : '',
      tax: uniq(i.lines.map((l) => l[4])).join(', '),
      audit: i.lines[0][5],
      stc: STATUS_TONE[i.status] || 'var(--muted)',
      dueSt: i.due === '—' ? 'color:var(--muted)' : '',
      govSt: i.gov === '—' ? 'color:var(--muted)' : /error/.test(i.gov) ? 'color:var(--bad)' : '',
      hasPdf: files.indexOf('PDF') >= 0,
      hasJson: files.indexOf('JSON') >= 0,
      noFile: files === '—',
      pdf: () => downloadPdf(i, toast),
      json: () => downloadJson(i, toast),
      menuOpen: !!(s.menu && s.menu.no === i.no),
      openMenu: (e: MouseEvent<HTMLElement>) => self.openMenu(i.no, e),
      lines: i.lines.map((l, n) => ({
        n: n + 1,
        chg: l[0],
        name: CHARGE_NAMES[l[0]] || l[0],
        amt: formatMoney(l[1]),
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
  const itemsFor = (i: InvoiceView): MenuItem[] => {
    const st = i.status;
    const paid = st === 'Paid',
      live = !['Draft', 'Pending validation', 'Cancelled'].includes(st);
    const cnOk = ['Generated', 'Sent', 'Accepted', 'Paid'].includes(st);
    const cancelOk = ['Draft', 'Pending validation', 'Generated', 'Sent', 'Rejected'].includes(st);
    const hasCn = st === 'Credited' || store.cn.some((c) => c.orig === i.no);
    const close = (fn: () => void) => () => {
      self.setState({ menu: null });
      fn();
    };
    const it = (label: string, run: () => void, dis?: boolean, note?: string, extra?: Partial<MenuItem>): MenuItem => ({
      label,
      run: dis ? () => undefined : run,
      dis: !!dis,
      note: dis ? (note ?? '') : '',
      hasNote: !!(dis && note),
      cls: '',
      sep: false,
      ...extra,
    });
    return [
      it(
        'View invoice',
        close(() => viewInvoice(i, toast)),
        i.files === '—',
        'The invoice is created after validation',
      ),
      it('View invoice details', () => self.dlg('details', i)),
      it('View credit note', () => self.dlg('cnv', i), !hasCn, 'No credit note for this invoice'),
      it('View SOA', () => self.dlg('soa', i)),
      it(
        'Download PDF / JSON',
        close(() => downloadInvoice(i, toast)),
        i.files === '—',
        'Files are created after validation',
      ),
      it(
        'e-Mail / Post',
        () => self.dlg('mail', i, { ch: 'email', to: INVOICE_CUSTOMERS[i.cust]?.mail ?? '', msg: '' }),
        !live,
        'Available once the invoice is generated',
        { sep: true },
      ),
      it(
        'Request credit note',
        () => self.dlg('cn', i, { full: true, amount: formatMoney(mainAmount(i)), reason: '', ref: '' }),
        !cnOk,
        st === 'Credited' ? 'Already fully credited' : 'Only for generated, sent, accepted or paid invoices',
      ),
      it(
        'Request refund',
        () => self.dlg('refund', i, { amount: formatMoney(mainAmount(i)), reason: '', note: '' }),
        !paid,
        'Only for paid invoices',
      ),
      it('View payment', () => self.dlg('pay', i), !paid, 'No payment received yet'),
      it(
        'View receipt',
        close(() => viewReceipt(i, toast)),
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
    ].filter((m): m is MenuItem => m !== null);
  };
  const PRIMARY: Readonly<Record<string, string>> = {
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
  const primaryOf = (i: InvoiceView): MenuItem => {
    const items = itemsFor(i);
    return (
      items.find((m) => m.label === PRIMARY[i.status]) ??
      items[0] ?? { label: '', run: () => undefined, dis: true, note: '', hasNote: false, cls: '', sep: false }
    );
  };
  let menuItems: MenuItem[] = [];
  let menuPos = '';
  const menuInv = s.menu ? byNo[s.menu.no] : undefined;
  if (s.menu && menuInv) {
    menuItems = itemsFor(menuInv);
    menuPos = 'left:' + s.menu.pos.x + 'px;top:' + s.menu.pos.y + 'px';
  }
  // ---------------- simple layouts (C, D)
  const GROUPS: readonly (readonly [string, string, readonly string[] | null, string])[] = [
    ['all', 'All invoices', null, 'Every invoice'],
    ['attention', 'Needs attention', ['Rejected', 'Pending validation'], 'Rejected by the tax portal or still in validation'],
    ['draft', 'Draft', ['Draft'], 'Proformas and drafts not yet issued'],
    ['open', 'Unpaid', ['Generated', 'Sent', 'Accepted'], 'Generated, sent or accepted with no payment yet'],
    ['part', 'Partially paid', [], 'Part of the amount received; balance outstanding'],
    ['paid', 'Paid', ['Paid'], 'Payment received'],
    ['closed', 'Credited / cancelled', ['Credited', 'Cancelled'], 'Reversed by credit note or cancelled'],
  ];
  const gOfS = (st: string) => GROUPS.find((g) => g[2]?.includes(st))?.[0];
  const gOf = (i: InvoiceView) => (i.pay === 'Partially paid' ? 'part' : gOfS(i.status));
  const grp = s.grp || 'all';
  const qOnly = INV.filter((i) => !q || matchesSearch(searchText(i), q));
  const gShown = qOnly.filter((i) => grp === 'all' || gOf(i) === grp).sort(sorter);
  const dRows = s.dview === 'rows';
  const PQ = pager(isD ? (dRows ? 'dr' : 'dc') : 'cq', gShown, isD ? (dRows ? [25, 50, 100] : [12, 24, 48]) : [20, 50, 100]);
  const PILLC: Readonly<Record<string, string>> = {
    'var(--muted)': 'var(--neutral)',
    'var(--warn)': 'var(--warnbg)',
    'var(--accent2)': 'var(--tint)',
    'var(--ok)': 'var(--okbg)',
    'var(--bad)': 'var(--badbg)',
    'var(--ai)': 'var(--aibg)',
  };
  const totalOf = (i: InvoiceView) => {
    const per: Record<string, number> = {};
    i.lines.forEach((l) => {
      per[l[2]] = (per[l[2]] || 0) + l[1];
    });
    const ks = Object.keys(per);
    const k0 = ks[0] ?? '';
    return {
      main: formatMoney(per[k0] ?? 0) + ' ' + k0,
      extra: ks
        .slice(1)
        .map((c) => '+ ' + formatMoney(per[c] ?? 0) + ' ' + c)
        .join(' '),
    };
  };
  const groups = GROUPS.map(([k, label, , hint]) => ({
    k,
    label,
    hint,
    n: qOnly.filter((i) => k === 'all' || gOf(i) === k).length,
    on: grp === k && s.tab === 'inv' ? 'true' : 'false',
    warnCls: k === 'attention' ? 'w' : '',
    pick: () => self.setState({ grp: k, tab: 'inv', view: 'list', menu: null, pg: {} }),
  }));
  const curNo = s.cur && gShown.some((i) => i.no === s.cur) ? s.cur : PQ.rows[0]?.no;
  const cards = PQ.rows.map((i) => {
    const stc = STATUS_TONE[i.status] || 'var(--muted)',
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
      payPill: paymentPill(i.pay),
      pill: 'background:' + (PILLC[stc] || 'var(--neutral)') + ';color:' + stc,
      total: t.main,
      extra: t.extra,
      hasExtra: !!t.extra,
      sel: i.no === curNo ? 'true' : 'false',
      dueSt: i.due === '—' ? 'color:var(--muted)' : '',
      lines: i.lines.length === 1 ? '1 charge' : i.lines.length + ' charges',
      pick: () => self.setState({ cur: i.no }),
      open: () => viewInvoice(i, toast),
      prim: pr.label,
      primRun: pr.run,
      primDis: pr.dis,
      menuOpen: !!(s.menu && s.menu.no === i.no),
      openMenu: (e: MouseEvent<HTMLElement>) => self.openMenu(i.no, e),
    };
  });
  let dv = null;
  const curInv = curNo ? byNo[curNo] : undefined;
  if (curInv) {
    const i = curInv,
      stc = STATUS_TONE[i.status] || 'var(--muted)',
      t = totalOf(i),
      pr = primaryOf(i),
      its = itemsFor(i);
    const dlIt = its.find((m) => m.label === 'Download PDF / JSON'),
      mailIt = its.find((m) => m.label === 'e-Mail / Post');
    const sec = [dlIt, mailIt, its.find((m) => m.label === 'Request credit note')]
      .filter((m): m is MenuItem => !!m && m.label !== pr.label && !m.dis)
      .slice(0, 2);
    const F = (k: string, v: string, mono?: number) => ({ k, v, cls: mono ? 'mono' : '', st: v === '—' ? 'color:var(--muted)' : '' });
    dv = {
      no: i.no,
      view: () => viewInvoice(i, toast),
      status: i.status,
      pay: i.pay,
      payPill: paymentPill(i.pay),
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
      openMenu: (e: MouseEvent<HTMLElement>) => self.openMenu(i.no, e),
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
      lines: i.lines.map((l) => ({ chg: l[0], name: CHARGE_NAMES[l[0]] || l[0], amt: formatMoney(l[1]), cur: l[2], roe: l[3], tax: l[4] })),
    };
  }
  const gNow = GROUPS.find((g) => g[0] === grp);
  // ---------------- ready list
  const READY = self.readyList();
  const ports = uniq(self.ready.map((r) => r.port)),
    procs = uniq(self.ready.map((r) => r.type));
  const base = READY.filter((r) => (!s.rPort || r.port === s.rPort) && (!s.rProc || r.type === s.rProc));
  const rAll = base.filter((r) => !s.rKpi || r.status === s.rKpi);
  const PR = pager('rdy', rAll, [25, 50, 100]);
  const ready = PR.rows.map((r) => {
    const c = readyTotals(r),
      cu = INVOICE_CUSTOMERS[r.cust];
    const lock = r.status === 'Blocked';
    return {
      ...r,
      name: cu?.name ?? r.cust,
      amt: formatMoney(c.inc),
      cur: c.cur,
      pill: READY_PILL[r.status] ?? '',
      on: !!s.rsel[r.id],
      lock,
      lockTip: lock ? 'Blocked B/Ls cannot be generated' : '',
      rowCls: s.rsel[r.id] ? 'on' : '',
      open: !!s.rexp[r.id],
      hasMsg: !!r.msg,
      bcls: r.status === 'Blocked' ? 'b-block' : 'b-warn',
      toggle: () => self.setState({ rsel: { ...s.rsel, [r.id]: !s.rsel[r.id] } }),
      expand: () => self.setState({ rexp: { ...s.rexp, [r.id]: !s.rexp[r.id] } }),
      review: () => self.setState({ view: 'review', rv: { ids: [r.id], i: 0 }, decl: false }),
      checks: r.checks.map(([k, v], n) => ({
        k: READY_CHECKS[n],
        v,
        ok: k === 'ok',
        warn: k === 'warn',
        block: k === 'block',
        color: k === 'ok' ? 'var(--muted2)' : k === 'warn' ? 'var(--warn)' : 'var(--bad)',
      })),
    };
  });
  const rSel = READY.filter((r) => s.rsel[r.id] && r.status !== 'Blocked');
  const selectable = ready.filter((r) => !r.lock);
  const rAllOn = selectable.length > 0 && selectable.every((r) => s.rsel[r.id]);
  const warnSel = rSel.filter((r) => r.status === 'Warning').length;
  const kpis = (
    [
      ['Ready', 'var(--ok)'],
      ['Warning', 'var(--warnbar)'],
      ['Blocked', 'var(--bad)'],
    ] as const
  ).map(([k, color]) => ({
    label: k,
    color,
    n: base.filter((r) => r.status === k).length,
    on: s.rKpi === k ? 'true' : 'false',
    pick: () => self.setState({ rKpi: s.rKpi === k ? '' : k, pg: {} }),
  }));
  // ---------------- review
  const rvIds = s.rv ? s.rv.ids.filter((id) => READY.some((r) => r.id === id)) : [];
  const rvAt = s.rv ? rvIds[Math.min(s.rv.i, rvIds.length - 1)] : undefined;
  const cur = rvAt ? READY.find((r) => r.id === rvAt) : undefined;
  const orig = cur ? self.ready.find((y) => y.id === cur.id) : undefined;
  const ed: ReadyEdit | null = cur
    ? s.rvEd && s.rvEd.id === cur.id
      ? s.rvEd
      : { id: cur.id, ...structuredClone(store.rdy[cur.id] ?? { cust: '', add: [], fixed: false }) }
    : null;
  const reviewOf = (cur: ReadyItem, orig: ReadyItem, ed: ReadyEdit) => {
    const setEd = (p: Partial<ReadyEdit>) => self.setState({ rvEd: { ...ed, ...p } });
    const eff = withEdits(orig, ed),
      c = readyTotals(eff),
      cu = INVOICE_CUSTOMERS[eff.cust],
      errs = readyErrors(orig, ed),
      mt = mainTax(orig);
    const loc = LOCATIONS[orig.port] ?? (['SIN', 'SG', 'SGD', '1.3412', 'SG-SR-9', 'ZR-INTL'] as const),
      nOrig = orig.charges.length;
    const m = invoiceModel({
      no: loc[0] + 'OF' + String(orig.bl).replace(/\D/g, ''),
      type: orig.type,
      status: 'Ready',
      date: todayText(),
      due: inDaysText(14),
      bkg: orig.bkg,
      bl: orig.bl,
      cntr: orig.cntr,
      vvd: orig.vvd,
      port: orig.port,
      cust: { code: eff.cust, name: cu?.name, tax: cu?.tax, addr: cu?.addr },
      lines: c.lines.map((l) => ({
        code: l.code,
        name: l.name,
        amt: l.ex,
        cur: l.cur,
        roe: l.cur === c.cur ? '—' : String(l.k),
        tax: l.tax,
      })),
    });
    const kv = (a: ReadonlyArray<readonly [string, string]>) => a.map(([k, v]) => ({ k, v }));
    const fx = (a: AddedCharge): number | null => {
      const u = parseFloat(String(a.unit).replace(/,/g, '')),
        q = parseFloat(String(a.qty));
      return addedChargeOk(a) ? q * u : null;
    };
    const addRows = ed.add.map((a, i): ReviewLine => {
      const ex = fx(a),
        tx = ex == null ? null : Math.round(ex * mt[1]) / 100,
        ok = addedChargeOk(a);
      const upd = (p: Partial<AddedCharge>) => setEd({ add: ed.add.map((y, j) => (j === i ? { ...y, ...p } : y)) });
      const bad = (v: unknown, t: string) => (!ok && a.t?.[t] && !v ? 'bad' : '');
      const sg = s.riSug && s.riSug.i === i ? s.riSug : null,
        qq = String(a.q || '')
          .trim()
          .toLowerCase();
      const opts = !sg
        ? []
        : Object.keys(CHARGE_NAMES)
            .filter((k) => !qq || k.toLowerCase().includes(qq) || (CHARGE_NAMES[k] ?? '').toLowerCase().includes(qq))
            .slice(0, 8);
      const pick = (k: string) =>
        self.setState({
          riSug: null,
          rvEd: { ...ed, add: ed.add.map((y, j) => (j === i ? { ...y, code: k, q: CHARGE_NAMES[k] ?? k } : y)) },
        });
      const hi = sg ? Math.min(sg.hi, opts.length - 1) : -1;
      return {
        cls: 'add',
        edit: true,
        ro: false,
        name: a.code ? (CHARGE_NAMES[a.code] ?? a.code) : '',
        q: a.q || '',
        lid: 'ri-sug-' + i,
        sug: !!sg,
        sugA: sg ? 'true' : 'false',
        none: !!sg && !opts.length,
        act: hi >= 0 ? 'ri-o-' + i + '-' + hi : '',
        hErr: !ok && a.t?.q && !a.code && !sg ? 'bad' : '',
        opts: opts.map((k, n) => ({
          id: 'ri-o-' + i + '-' + n,
          code: k,
          name: CHARGE_NAMES[k] ?? k,
          on: n === hi ? 'true' : 'false',
          pick: (e: MouseEvent<HTMLElement>) => {
            e.preventDefault();
            pick(k);
          },
        })),
        onQ: (e: FieldEvent) =>
          self.setState({
            riSug: { i, hi: 0 },
            rvEd: {
              ...ed,
              add: ed.add.map((y, j) =>
                j === i ? { ...y, q: e.target.value, code: CHARGE_NAMES[y.code] === e.target.value ? y.code : '', t: { ...y.t, q: 1 } } : y,
              ),
            },
          }),
        onFocus: () => self.setState({ riSug: { i, hi: 0 } }),
        onBlur: () =>
          window.setTimeout(() => {
            if (self.state.riSug && self.state.riSug.i === i) self.setState({ riSug: null });
          }, 120),
        onKey: (e: KeyboardEvent<HTMLElement>) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const n = opts.length || 1;
            self.setState({ riSug: { i, hi: sg ? (hi + (e.key === 'ArrowDown' ? 1 : n - 1)) % n : 0 } });
          } else if (e.key === 'Enter' && sg && opts[hi]) {
            e.preventDefault();
            pick(opts[hi] ?? '');
          } else if (e.key === 'Escape') self.setState({ riSug: null });
        },
        qty: a.qty,
        uom: a.uom,
        unit: a.unit,
        cur: a.cur,
        qErr: bad(parseFloat(String(a.qty)) > 0, 'qty'),
        uErr: bad(a.uom, 'uom'),
        pErr: bad(String(a.unit).trim() !== '' && parseFloat(String(a.unit).replace(/,/g, '')) >= 0, 'unit'),
        cErr: bad(a.cur, 'cur'),
        onQty: (e: FieldEvent) => upd({ qty: e.target.value, t: { ...a.t, qty: 1 } }),
        onUom: (e: FieldEvent) => upd({ uom: e.target.value, t: { ...a.t, uom: 1 } }),
        onUnit: (e: FieldEvent) => upd({ unit: e.target.value, t: { ...a.t, unit: 1 } }),
        onCur: (e: FieldEvent) => upd({ cur: e.target.value, t: { ...a.t, cur: 1 } }),
        del: () => setEd({ add: ed.add.filter((_, j) => j !== i) }),
        ex: ex == null ? '—' : formatMoney(ex),
        taxApp: mt[0] === '—' ? '—' : mt[1] + '%',
        taxSt: '',
        tax: tx == null ? '—' : formatMoney(tx),
        inc: ex == null ? '—' : formatMoney(ex + (tx ?? 0)),
      };
    });
    const custErr = errs.some((e) => e.area === 'Customer');
    const rvVals = {
      bl: cur.bl,
      cur: c.cur,
      hasErr: errs.length > 0,
      noErr: errs.length === 0,
      errs,
      errTitle:
        errs.length === 1
          ? '1 error to resolve before generating the invoice'
          : errs.length + ' errors to resolve before generating the invoice',
      txn: m.txn,
      strip: kv(m.strip.slice(1)),
      from0: m.from[0] ?? '',
      fromL: m.from.slice(1),
      cust: eff.cust,
      custCls: custErr ? 'bad' : '',
      addr: cu?.addr || '—',
      // To: type-ahead customer search (same pattern as Charge head)
      ...(() => {
        const cs = s.riCu,
          open = !!cs,
          qq = cs
            ? String(cs.q || '')
                .trim()
                .toLowerCase()
            : '';
        const keys = Object.keys(INVOICE_CUSTOMERS)
          .filter((k) => k.slice(0, 2) === loc[1])
          .filter((k) => !qq || k.toLowerCase().includes(qq) || (INVOICE_CUSTOMERS[k]?.name ?? '').toLowerCase().includes(qq));
        const hi = cs ? Math.min(cs.hi || 0, keys.length - 1) : -1;
        const pick = (k: string) => self.setState({ riCu: null, rvEd: { ...ed, cust: k } });
        return {
          cuQ: cs ? cs.q : cu?.name || eff.cust,
          cuOpen: open,
          cuA: open ? 'true' : 'false',
          cuNone: open && !keys.length,
          cuAct: hi >= 0 ? 'ri-cu-' + hi : '',
          cuOpts: keys.map((k, n) => ({
            id: 'ri-cu-' + n,
            code: k,
            name: INVOICE_CUSTOMERS[k]?.name ?? k,
            on: n === hi ? 'true' : 'false',
            pick: (e: MouseEvent<HTMLElement>) => {
              e.preventDefault();
              pick(k);
            },
          })),
          cuOnQ: (e: FieldEvent) => self.setState({ riCu: { q: e.target.value, hi: 0 } }),
          cuFocus: () => {
            self.setState({ riCu: { q: '', hi: Math.max(0, keys.indexOf(eff.cust)) } });
          },
          cuBlur: () =>
            window.setTimeout(() => {
              if (self.state.riCu) self.setState({ riCu: null });
            }, 120),
          cuKey: (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
              const n = keys.length || 1;
              self.setState({ riCu: { q: cs ? cs.q : '', hi: cs ? (hi + (e.key === 'ArrowDown' ? 1 : n - 1)) % n : 0 } });
            } else if (e.key === 'Enter' && open && keys[hi]) {
              e.preventDefault();
              pick(keys[hi] ?? '');
              e.currentTarget.blur();
            } else if (e.key === 'Escape') {
              self.setState({ riCu: null });
              e.currentTarget.blur();
            }
          },
        };
      })(),
      custOpts: Object.keys(INVOICE_CUSTOMERS)
        .filter((k) => k.slice(0, 2) === loc[1])
        .map((k) => ({ v: k, label: INVOICE_CUSTOMERS[k]?.name ?? k })),
      details: kv(m.details),
      ship: kv(m.ship),
      bank: kv(m.bank),
      words: m.words,
      uoms: ['CNTR', 'BL', 'Day', 'EA'],
      curs: c.cur === loc[2] ? [c.cur] : [c.cur, loc[2]],
      lines: c.lines
        .slice(0, nOrig)
        .map((l): ReviewLine => ({
          cls: '',
          edit: false,
          ro: true,
          name: l.name,
          qty: l.qty,
          uom: l.uom,
          unit: formatMoney(l.unit),
          cur: l.cur,
          ex: formatMoney(l.ex),
          taxApp: l.tax === '—' ? 'Not classified' : l.rate + '%',
          taxSt: l.tax === '—' ? 'color:var(--bad);font-weight:600' : '',
          tax: formatMoney(l.tx),
          inc: formatMoney(l.inc),
        }))
        .concat(addRows),
      addCharge: () => {
        self.setState({
          riSug: { i: ed.add.length, hi: 0 },
          rvEd: { ...ed, add: ed.add.concat([{ code: '', q: '', qty: '', uom: '', unit: '', cur: c.cur }]) },
        });
        window.setTimeout(() => {
          const l = document.querySelectorAll<HTMLInputElement>('.ri-tbl tr.add input[role=combobox]');
          l[l.length - 1]?.focus();
        }, 30);
      },
      totals: (
        [
          ['Total excluding Tax', formatMoney(c.ex) + ' ' + c.cur, ''],
          ['Tax Amount', formatMoney(c.tx) + ' ' + c.cur, ''],
          ['Invoice Total', formatMoney(c.inc) + ' ' + c.cur, 'g'],
        ] as const
      ).map(([k, v, cls]) => ({ k, v, cls })),
    };
    return {
      rv: rvVals,
      genDis: errs.length > 0 || !s.decl,
      hint: errs.length ? 'Resolve the errors to enable Generate invoice' : !s.decl ? 'Tick the declaration to generate' : '',
    };
  };
  const review = cur && orig && ed ? reviewOf(cur, orig, ed) : null;
  const rv = review?.rv ?? null;
  const rvGenDis = review ? review.genDis : true;
  const rvHint = review?.hint ?? '';
  const steps: string[] = [];
  // ---------------- dialogs
  const d = s.dlg;
  const f: DialogForm = s.f;
  const di = d && d.no ? byNo[d.no] : undefined;
  let dlgTitle = '';
  let dlgSub = '';
  let dlgCls = '';
  const det: DetailsDialog = { fields: [], lines: [], showPrim: false, prim: '', primRun: () => undefined, openMenu: null };
  let tbl: TableDialog = { cols: [], rows: [] };
  let okLabel = '';
  let okCls = 'btn-primary';
  let dlgOk: () => void = () => undefined;
  let dl: Downloads = {};
  let prf: ProformaDialog = { rows: [] };
  const gen: GeneralDialog = {
    kv: [],
    fields: [],
    rows: [],
    cols: [],
    note: '',
    noteCls: '',
    tblTitle: '',
    empty: false,
    emptyText: '',
    hasKv: false,
    hasForm: false,
    hasTbl: false,
    hasNote: false,
  };
  const tableOf = (cols: string[], rows: ReadonlyArray<readonly string[]>): TableDialog => ({
    cols,
    rows: rows.map((r) => ({ cells: r.map((v, n) => ({ v, cls: n === 0 ? 'mono' : '' })) })),
  });
  const dlFor = (name: string, cols: readonly string[], rows: ReadonlyArray<readonly string[]>): Downloads => {
    const esc = (v: string) => '"' + String(v).replace(/"/g, '""') + '"';
    const csv = '﻿' + [cols, ...rows].map((r) => r.map(esc).join(',')).join('\r\n');
    const html =
      '<table border="1"><tr>' +
      cols.map((c) => '<th>' + c + '</th>').join('') +
      '</tr>' +
      rows.map((r) => '<tr>' + r.map((v) => '<td>' + v + '</td>').join('') + '</tr>').join('') +
      '</table>';
    return {
      csv: () => {
        saveTextFile(name + '.csv', csv, 'text/csv;charset=utf-8');
        toast(name + '.csv downloaded');
      },
      xls: () => {
        saveTextFile(name + '.xls', '<html><meta charset="utf-8">' + html + '</html>', 'application/vnd.ms-excel');
        toast(name + '.xls downloaded');
      },
      pdf: () => {
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
        toast('Print dialog opened · save as PDF');
      },
    };
  };
  if (d) {
    if (d.kind === 'details' && di) {
      dlgTitle = di.no;
      dlgSub = di.type + ' invoice · ' + di.party;
      dlgCls = 'wide';
      det.fields = (
        [
          ['Invoice Type', di.type],
          ['Booking No.', di.bkg],
          ['B/L No.', di.bl],
          ['Container No.', di.cntr],
          ['Voyage/VVD', di.vvd],
          ['Billing Party', di.party],
          ['Customer Code', di.cust],
          ['Invoice Status', di.status, 'color:' + (STATUS_TONE[di.status] || 'var(--ink)')],
          ['Payment Status', di.pay],
          ['Due Date', di.due],
          ['Govt. Reference', di.gov],
          ['PDF/JSON Link', di.files],
          ['Audit ID', di.lines[0][5]],
        ] as [string, string, string?][]
      ).map(([k, v, st]) => ({ k, v, st: st ?? '' }));
      det.lines = di.lines.map((l) => ({
        chg: l[0],
        name: CHARGE_NAMES[l[0]] || l[0],
        amt: formatMoney(l[1]),
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
        window.setTimeout(() => pr.run(), 0);
      };
      det.openMenu = (e: MouseEvent<HTMLElement>) => self.openMenu(di.no, e);
    } else if (d.kind === 'dist' && di) {
      dlgTitle = 'Distribution · ' + di.no;
      dlgSub = 'Where the invoice was sent · ' + di.party;
      const rows = distribution(di);
      tbl = tableOf(['Channel', 'Status'], rows);
      tbl.rows.forEach((r) => {
        const first = r.cells[0];
        if (first) first.cls = '';
      });
      dl = dlFor('Distribution ' + di.no, ['Channel', 'Status'], rows);
    } else if (d.kind === 'prf' && di) {
      dlgTitle = 'Proforma lifecycle · ' + di.no;
      dlgSub = di.party;
      const done = store.prf[di.no],
        paid = di.pay === 'Proforma · paid',
        amt = Object.entries(
          di.lines.reduce<Record<string, number>>((a, l) => {
            a[l[2]] = (a[l[2]] || 0) + l[1];
            return a;
          }, {}),
        )
          .map(([c, v]) => c + ' ' + formatMoney(v))
          .join(' + ');
      prf = {
        rows: (
          [
            ['Validity', '[n] days · until [Date]'],
            ['Proforma amount', amt],
            ['Payment', di.pay],
            ['Final BDR from LMS', done === 'converted' ? 'Final invoice raised' : '[Final BDR amount]'],
          ] as const
        ).map(([k, v]) => ({ k, v })),
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
      const totals: Record<string, number> = {};
      di.lines.forEach((l) => {
        totals[l[2]] = (totals[l[2]] || 0) + l[1];
      });
      const totText = Object.keys(totals)
        .map((c) => c + ' ' + formatMoney(totals[c] ?? 0))
        .join(' + ');
      const KV = (a: ReadonlyArray<readonly [string, string, string?]>): DialogKv[] => a.map(([k, v, st]) => ({ k, v, st: st ?? '' }));
      const TB = (cols: string[], rows: DialogRow[], right?: number[]) => ({
        cols: cols.map((v, n) => ({ v, cls: (right ?? []).includes(n) ? 'num' : '' })),
        rows,
      });
      const C = (v: string, cls?: string): DialogCell => ({ v, cls: cls ?? '' });
      const fld = (label: string, key: DialogTextKey, o?: Partial<DialogField>): DialogField =>
        Object.assign(
          {
            label,
            val: f[key] ?? '',
            on: (e: FieldEvent) => self.setF(textPatch(key, e.target.value)),
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
            hasErr: !!f[`${key}Err`],
            err: o?.err || 'Required',
          },
          o ?? {},
        );
      const sel = (label: string, key: DialogTextKey, opts: ReadonlyArray<string | DialogOption>, o?: Partial<DialogField>): DialogField =>
        fld(label, key, { isInput: false, isSelect: true, opts: opts.map((v) => (typeof v === 'string' ? { v, label: v } : v)), ...o });
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
            hint: di.lines[0][2] + ' · up to ' + formatMoney(totals[di.lines[0][2]] ?? 0),
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
                'Refund requested · ' + di.lines[0][2] + ' ' + formatMoney(amt) + ' · ' + f.reason + (f.note ? ' · ' + f.note : ''),
              ),
            { dlg: null, __toast: 'Refund request for ' + di.no + ' submitted · routed to the refund workflow' },
          );
        };
      } else if (d.kind === 'cnv') {
        dlgTitle = 'Credit note · ' + di.no;
        dlgSub = di.party;
        dlgCls = 'wide';
        let cns: Pick<CreditNote, 'no' | 'ctype' | 'reason' | 'amount' | 'cur' | 'appr'>[] = store.cn.filter((c) => c.orig === di.no);
        if (!cns.length && di.status === 'Credited')
          cns = [
            {
              no: '[Credit note no.]',
              ctype: 'Full',
              reason: '[Reason]',
              amount: totals[di.lines[0][2]] ?? 0,
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
              cells: [C(c.no, 'mono'), C(c.ctype), C(c.reason), C(formatMoney(c.amount), 'mono num'), C(c.cur, 'mono'), C(c.appr)],
              st: '',
            })),
            [3],
          ),
        );
        gen.empty = !cns.length;
        gen.emptyText = 'No credit note for this invoice.';
      } else if (d.kind === 'soa') {
        const cu = INVOICE_CUSTOMERS[di.cust];
        dlgTitle = 'Statement of account · ' + (cu?.name || di.party);
        dlgSub = 'Customer ' + di.cust + ' · open invoices';
        dlgCls = 'wide';
        const now = Date.parse('17 Nov 2026');
        const open = INV.filter((x) => x.cust === di.cust && ['Unpaid', 'Partially paid'].includes(x.pay)).sort(
          (a, b) => (Date.parse(a.due) || 0) - (Date.parse(b.due) || 0),
        );
        const bucket = (dd: number) =>
          dd <= 0 ? 'Current' : dd <= 30 ? '1–30 days' : dd <= 60 ? '31–60 days' : dd <= 90 ? '61–90 days' : '90+ days';
        const byCur: Record<string, number> = {};
        let overdue = 0;
        const rows = open.map((x) => {
          const days = Math.round((now - (Date.parse(x.due) || now)) / 864e5);
          if (days > 0) overdue++;
          const c = x.lines[0][2],
            a = mainAmount(x);
          byCur[c] = (byCur[c] || 0) + a;
          return {
            cells: [
              C(x.no, 'mono'),
              C(x.type),
              C(x.due),
              C(days > 0 ? String(days) : '—', 'mono num'),
              C(bucket(days)),
              C(formatMoney(a), 'mono num'),
              C(c, 'mono'),
              C(x.pay),
            ],
            st: x.no === di.no ? 'background:var(--tint)' : '',
          };
        });
        gen.kv = KV([
          ['Customer', cu?.name || di.party],
          ['Customer Code', di.cust],
          ['Open invoices', String(open.length)],
          ['Overdue', String(overdue), overdue ? 'color:var(--warn)' : ''],
          [
            'Outstanding',
            Object.keys(byCur)
              .map((c) => c + ' ' + formatMoney(byCur[c] ?? 0))
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
            Object.keys(CHARGE_NAMES).map((k) => ({ v: k, label: k + ' · ' + CHARGE_NAMES[k] })),
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
          const parsedType = invoiceTypeSchema.safeParse(f.type);
          const type = parsedType.success ? parsedType.data : 'MISC';
          self.put(
            (x) => {
              const code = f.type === 'DET / DEM' ? 'OD' : f.type === 'MISC' ? 'MI' : 'OF';
              newNo = di.no.slice(0, 3) + code + String(2609500 + (x.gen.length + 1) * 7).slice(-7) + (f.type === 'Proforma' ? 'PRF' : '');
              x.gen.unshift({
                no: newNo,
                type,
                bkg: di.bkg,
                bl: (f.bl ?? '').trim(),
                cntr: di.cntr,
                vvd: di.vvd,
                party: di.party,
                cust: di.cust,
                status: 'Draft',
                due: '—',
                gov: '—',
                files: '—',
                date: todayText(),
                port: di.port,
                lines: [
                  [
                    f.chg ?? '',
                    amt,
                    f.cur ?? '',
                    f.cur === 'USD' ? di.lines[0][3] : '—',
                    di.lines[0][4],
                    'AUD-26-' + String(106000 + x.gen.length),
                  ],
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
      const rows = self.audit(di);
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
          .map((no) => [no, byNo[no]?.party ?? '', INVOICE_CUSTOMERS[byNo[no]?.cust ?? '']?.mail || 'Post'])
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
        const tot = mainAmount(di),
          amt = parseFloat(String(f.amount || '').replace(/,/g, ''));
        const needRef = ['FCA approval', 'DAR waiver'].includes(f.reason ?? '');
        const err = {
          reasonErr: !f.reason,
          amountErr: !f.full && (!(amt > 0) || amt > tot),
          amountErrText: !(amt > 0) ? 'Enter an amount above zero' : 'Cannot exceed the invoice amount ' + formatMoney(tot),
          refErr: needRef && !(f.ref || '').trim(),
        };
        if (err.reasonErr || err.amountErr || err.refErr) {
          self.setF(err);
          return;
        }
        const cnNo = di.no.slice(0, 5) + '260' + String(1000 + Math.floor(Math.random() * 8999)) + 'CR';
        const per = di.lines[0];
        const RATES: Readonly<Record<string, number>> = { 'SG-SR-9': 9, 'IN-GST-18': 18, 'MY-SST-8': 8, 'TH-VAT-7': 7 };
        const rate = RATES[per[4]] ?? 0;
        const camt = f.full ? tot : amt;
        const cn: CreditNote = {
          no: cnNo,
          orig: di.no,
          ctype: f.full ? 'Full' : 'Partial',
          ref: (f.ref || '').trim() || '—',
          reason: f.reason ?? '',
          amount: camt,
          cur: per[2],
          taxrev: per[4] + ' · ' + per[2] + ' ' + formatMoney((camt * rate) / 100),
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
        void self.submitCreditNote(cn);
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
            self.ev(x, di.no, 'Cancelled · ' + (f.why ?? '').trim());
          },
          { dlg: null, __toast: di.no + ' cancelled' },
        );
      };
    } else if (d.kind === 'roe' && cur) {
      dlgTitle = 'Rate of exchange · ' + cur.bl;
      dlgSub = 'Rates used for this invoice';
      tbl = tableOf(
        ['Pair', 'Rate', 'Type', 'Source', 'Rate date'],
        [['USD/SGD', '1.3412', 'Billing ROE', 'LMS · Exchange Rate Master', cur.id === 'r6' ? '11 Nov 2026' : todayText()]],
      );
    } else if (d.kind === 'src' && cur) {
      dlgTitle = 'Source charges · ' + cur.bl;
      dlgSub = 'As received from LMS for booking ' + cur.bkg;
      dlgCls = 'wide';
      tbl = tableOf(
        ['Charge Code', 'Description', 'Qty', 'UOM', 'Rate', 'Currency', 'Source'],
        cur.charges.map((c, n) => [
          c[0],
          CHARGE_NAMES[c[0]] || c[0],
          String(c[1]),
          c[2],
          formatMoney(c[3]),
          'USD',
          'LMS charge line ' + (n + 1),
        ]),
      );
    } else if (d.kind === 'ctx' && cur) {
      dlgTitle = 'Audit context · ' + cur.bl;
      dlgSub = 'How this B/L reached Ready to invoice';
      dlgCls = 'wide';
      const rows = [
        [todayText() + ' 05:40', 'B/L data received from LMS · ' + cur.bkg, 'LMS'],
        [todayText() + ' 05:45', 'Charges rated · ' + cur.charges.length + ' lines', 'GIRS rule engine'],
        [todayText() + ' 05:46', 'Billing party and currency rules applied', 'GIRS rule engine'],
        [todayText() + ' 05:47', 'Pre-generation validation · ' + cur.status + (cur.msg ? ' · ' + cur.msg : ''), 'GIRS rule engine'],
      ];
      tbl = tableOf(['When', 'Event', 'By'], rows);
      dl = dlFor('Audit context ' + cur.bl, ['When', 'Event', 'By'], rows);
    } else if (d.kind === 'confirm') {
      const ids = d.ids || [];
      dlgTitle = ids.length > 1 ? 'Generate ' + ids.length + ' invoices?' : 'Generate invoice?';
    }
  }
  const doGenerate = () => {
    const ids = d?.ids ?? [];
    const made: string[] = [];
    const more = s.view === 'review' && rvIds.filter((id) => !ids.includes(id)).length > 0;
    self.put(
      (x) => {
        x.done = (x.done || []).concat(ids);
        x.gen = x.gen || [];
        ids.forEach((id) => {
          const r0 = self.ready.find((y) => y.id === id);
          if (!r0) return;
          const r = withEdits(r0, s.view === 'review' && ed && ed.id === id ? ed : x.rdy[id]),
            c = readyTotals(r),
            cu = INVOICE_CUSTOMERS[r.cust];
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
            party: cu?.name ?? r.cust,
            cust: r.cust,
            status: 'Generated',
            due: inDaysText(14),
            gov: '—',
            files: 'PDF · JSON',
            date: todayText(),
            port: r.port,
            lines: c.lines.map((l, n): InvoiceLine => [
              l.code,
              l.inc,
              l.cur,
              l.cur === 'USD' ? '—' : String(USD_RATES[l.cur] || 1),
              l.tax === '—' ? 'SG-SR-9' : l.tax,
              'AUD-26-' + (aud + n),
            ]),
          });
          delete x.rdy[id];
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
  const diCust = di ? INVOICE_CUSTOMERS[di.cust] : undefined;
  const chans = (
    [
      ['email', 'e-Mail'],
      ['post', 'Post'],
    ] as const
  ).map(([k, label]) => ({
    label,
    on: (f.ch || 'email') === k ? 'true' : 'false',
    pick: () =>
      self.setF({
        ch: k,
        toErr: false,
        to: k === 'post' ? diCust?.addr || '' : diCust?.mail || '',
      }),
  }));
  const ctypes = (
    [
      ['Full', true],
      ['Partial', false],
    ] as const
  ).map(([label, full]) => ({
    label,
    on: !!f.full === full ? 'true' : 'false',
    pick: () => self.setF({ full, amountErr: false, amount: full && di ? formatMoney(mainAmount(di)) : '' }),
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
    stop: (e: MouseEvent<HTMLElement>) => e.stopPropagation(),
    gLabel: gNow?.[1] ?? '',
    gHint: gNow?.[3] ?? '',
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
    tabs: (
      [
        ['ready', 'Ready to invoice', READY.length],
        ['inv', 'Invoices', INV.length],
      ] as const
    ).map(([k, label, n]) => ({ label, n, on: s.tab === k ? 'true' : 'false', pick: () => self.setState({ tab: k, menu: null }) })),
    manual: () => goTo('ManualInvoice.dc.html'),
    goGenerate: () => goTo('InvoiceGenerate.dc.html'),
    goList: () => goTo('InvoiceListB.dc.html'),
    q: s.q,
    onQ: (e: FieldEvent) => self.setState({ q: e.target.value, pg: {} }),
    fsel,
    fp,
    closeFs: () => self.setState({ fopen: null, fdv: null }),
    filtered: !!(s.q || FKEYS.some((k) => fApplied[k].length)),
    clearF: () => self.setState({ q: '', fo: [], fpt: [], fs: [], fe: [], fg: [], ft: [], fc: [], fopen: null, fd: null, pg: {} }),
    countText: shown.length + ' of ' + INV.length + ' invoices',
    invs,
    invEmpty: invs.length === 0,
    allOn,
    toggleAll: () => self.setState({ sel: { ...s.sel, ...Object.fromEntries(PI.rows.map((i) => [i.no, !allOn])) } }),
    pInv: PI.p,
    sortSel,
    ...colsUi,
    canSelAll: allOn && selNos.length < shown.length,
    selAllText: 'Select all ' + shown.length.toLocaleString('en-US') + ' matching invoices',
    selAll: () => self.setState({ sel: Object.fromEntries(shown.map((i) => [i.no, true])) }),
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
        invoiceDocuments.invoicePdf(L.map(invoiceDocData), 'Invoices-' + L.length);
      } catch (e) {
        toast('The PDF could not be created: ' + (e instanceof Error ? e.message : String(e)));
        return;
      }
      const J = L.filter(hasJson);
      if (J.length) window.setTimeout(() => invoiceDocuments.json('Invoices-' + J.length, J.map(invoiceDocData)), 500);
      toast(
        L.length +
          ' invoice' +
          (L.length === 1 ? '' : 's') +
          ' downloaded as one PDF' +
          (L.some(hasJson) ? ' and JSON' : '') +
          (L.length < selNos.length ? ' · ' + (selNos.length - L.length) + ' skipped (no files yet)' : ''),
      );
    },
    bulkMail: () => self.setState({ dlg: { kind: 'bulkmail' }, f: {} }),
    menuOn: menuItems.length > 0,
    menuItems,
    menuPos,
    closeMenu: () => self.setState({ menu: null }),
    period: s.period,
    onPeriod: (e: FieldEvent) => self.setState({ period: e.target.value }),
    ports,
    procs,
    rPort: s.rPort,
    rProc: s.rProc,
    onPort: (e: FieldEvent) => self.setState({ rPort: e.target.value, pg: {} }),
    onProc: (e: FieldEvent) => self.setState({ rProc: e.target.value, pg: {} }),
    rFiltered: !!(s.period || s.rPort || s.rProc || s.rKpi),
    resetR: () => self.setState({ period: '', rPort: '', rProc: '', rKpi: '' }),
    kpis,
    ready,
    pRdy: PR.p,
    readyEmpty: ready.length === 0,
    readyEmptyText: READY.length ? 'No B/Ls match these filters' : 'All B/Ls are invoiced. New B/Ls arrive with the next LMS batch run.',
    rAllOn,
    rToggleAll: () => self.setState({ rsel: { ...s.rsel, ...Object.fromEntries(selectable.map((r) => [r.id, !rAllOn])) } }),
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
      ed &&
      self.setState({
        rvEd: {
          ...ed,
          fixed: true,
          add: ed.add.map((a) =>
            addedChargeOk(a)
              ? a
              : {
                  code: a.code || 'MISC',
                  q: a.code ? a.q : CHARGE_NAMES.MISC,
                  qty: parseFloat(String(a.qty)) > 0 ? a.qty : '1',
                  uom: a.uom || 'CNTR',
                  unit: String(a.unit).trim() !== '' && parseFloat(String(a.unit)) >= 0 ? a.unit : '0.00',
                  cur: a.cur || 'USD',
                },
          ),
        },
        __toast: 'All errors resolved',
      }),
    rvMany: rvIds.length > 1,
    rvPos: (s.rv ? Math.min(s.rv.i, rvIds.length - 1) + 1 : 0) + ' of ' + rvIds.length,
    rvFirst: !s.rv || s.rv.i <= 0,
    rvLast: !s.rv || s.rv.i >= rvIds.length - 1,
    rvPrev: () => s.rv && self.setState({ rv: { ...s.rv, i: s.rv.i - 1 }, decl: false }),
    rvNext: () => s.rv && self.setState({ rv: { ...s.rv, i: s.rv.i + 1 }, decl: false }),
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
      d && d.kind === 'confirm' && (d.ids ?? []).length > 1
        ? 'These ' + (d.ids ?? []).length + ' invoices will be created immediately.'
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
    amountHint: di ? 'Invoice amount ' + formatMoney(mainAmount(di)) + ' ' + di.lines[0][2] : '',
    cancelText: di
      ? 'The invoice is cancelled in GIRS and the status flows back to LMS.' +
        (di.gov !== '—' ? ' The e-invoice ' + di.gov + ' is cancelled at the tax portal.' : '')
      : '',
    f: Object.assign({}, f, {
      onTo: (e: FieldEvent) => self.setF({ to: e.target.value, toErr: false }),
      onMsg: (e: FieldEvent) => self.setF({ msg: e.target.value }),
      toErrText: f.ch === 'post' ? 'Enter a postal address' : 'Enter a valid e-mail address',
      onReason: (e: FieldEvent) => self.setF({ reason: e.target.value, reasonErr: false, refErr: false }),
      onAmount: (e: FieldEvent) => self.setF({ amount: e.target.value, amountErr: false }),
      onRef: (e: FieldEvent) => self.setF({ ref: e.target.value, refErr: false }),
      onWhy: (e: FieldEvent) => self.setF({ why: e.target.value, whyErr: false }),
    }),
  };
}

export type InvoiceListVals = ReturnType<typeof invoiceListVals>;
