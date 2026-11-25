import type { ChangeEvent } from 'react';
import { readJson, removeStore, writeJson } from '../storage';
import { z } from 'zod';

/**
 * "Overview" layout (D) of a master-data screen: a grouped, filterable record list on the left and the selected
 * record on the right (header, key facts, collapsible sections and related tables, optional side rail).
 * Domain-agnostic: each master screen maps its records to `DetailRecord`.
 */

/** label, value, mono, wide, muted */
export type DetailKv = readonly [label: string, value: string, mono: 0 | 1, wide: 0 | 1, muted: 0 | 1];

export interface DetailTable {
  title: string;
  headers: readonly string[];
  rows: ReadonlyArray<readonly string[]>;
  /** Column indexes shown in monospace. */
  mono: readonly number[];
  /** Screen the first column links to (prototype file name or route), and its hand-off key. */
  link?: string;
  linkKey?: string;
}

export interface DetailRecord {
  id: string;
  code: string;
  title: string;
  group: string;
  st: string;
  search: string;
  sub: string;
  chips: ReadonlyArray<readonly [label: string, style: string]>;
  alert: string;
  facts: ReadonlyArray<readonly [label: string, value: string, mono: 0 | 1]>;
  sections: ReadonlyArray<readonly [title: string, kv: readonly DetailKv[]]>;
  tables: readonly DetailTable[];
  railTitle: string;
  railNote: string;
  /** title, line 2, line 3, current */
  rail: ReadonlyArray<readonly [string, string, string, 0 | 1]>;
}

export interface DetailConfig {
  recs: readonly DetailRecord[];
  /** Status -> [chip style, dot colour]. Also the status filter segments. */
  smap: Readonly<Record<string, readonly [string, string]>>;
  segLabels: Readonly<Record<string, string>>;
  groupLabel: string;
  /** Plural noun for the count ("customer codes"). */
  nouns: string;
}

export interface DetailState {
  q: string;
  /** Status filter ('' = all). */
  fs: string;
  sel: string;
  /** Record code handed over from another screen, selected once. */
  selCode: string;
  selDone: boolean;
  /** Open list groups (null = the selected record's group). */
  open: Readonly<Record<string, boolean>> | null;
  /** Open sections (null = the first two). */
  op: Readonly<Record<string, boolean>> | null;
}

export const kv = (l: string, v: string, mono?: boolean, wide?: boolean, muted?: boolean): DetailKv => [
  l,
  v,
  mono ? 1 : 0,
  wide ? 1 : 0,
  muted ? 1 : 0,
];

// ---------------------------------------------------------------- hand-off between overview screens
const HANDOFF_KEY = 'girs.dsel';
const handoffSchema = z.object({ p: z.string(), c: z.string() });

/** Selects record `code` when overview screen `target` opens next. */
export function handOffSelection(target: string, code: string): void {
  writeJson(HANDOFF_KEY, { p: target, c: code });
}

/** Record code handed to `target` (taken once), or ''. */
export function takeHandOff(target: string): string {
  const x = readJson(HANDOFF_KEY, handoffSchema.nullable(), null);
  if (!x || x.p !== target) return '';
  removeStore(HANDOFF_KEY);
  return x.c;
}

export function initialDetailState(target: string, defaultSel: string): DetailState {
  return { q: '', fs: '', sel: defaultSel, selCode: takeHandOff(target), selDone: false, open: null, op: null };
}

// ---------------------------------------------------------------- values
const MONO = 'font-family:var(--mono,ui-monospace,monospace)';
const NEUTRAL: readonly [string, string] = ['background:var(--neutral);color:var(--muted2)', 'var(--muted4)'];
const SC: Readonly<Record<string, string>> = {
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
const STATUS_HEADERS = ['Status', 'Approval', 'Sanction / Blacklist'];
const OFF = ['Inactive', 'Expired', 'Rejected', 'Draft'];

export interface DetailCell {
  v: string;
  isChip: boolean;
  chip: string;
  isLink: boolean;
  isText: boolean;
  href: string;
  go: () => void;
  cls: string;
  st: string;
}

export interface DetailSection {
  id: string;
  t: string;
  n: string;
  sum: string;
  isKv: boolean;
  isTbl: boolean;
  isTl: boolean;
  kv: { l: string; v: string; cls: string; st: string }[];
  h: { v: string; st: string }[];
  rows: { rs: string; cells: DetailCell[] }[];
  empty: boolean;
  tl: { a: string; b: string; c: string; cls: string; fg: string }[];
  note: string;
  hasNote: boolean;
  hasN: boolean;
  open: boolean;
  ax: 'true' | 'false';
  rot: string;
  tg: () => void;
}

/** Values of the overview layout for the current state. `set` updates the screen state. */
export function renderMasterDetail(s: DetailState, D: DetailConfig, set: (patch: Partial<DetailState>) => void) {
  const q = s.q.trim().toLowerCase();
  const list = D.recs.filter(
    (r) => (!q || (r.code + ' ' + r.title + ' ' + r.search).toLowerCase().includes(q)) && (!s.fs || r.st === s.fs),
  );
  const stOf = (st: string): readonly [string, string] => D.smap[st] ?? NEUTRAL;
  const segs = ([['', 'All']] as [string, string][])
    .concat(Object.keys(D.smap).map((k): [string, string] => [k, D.segLabels[k] ?? k]))
    .map(([k, label]) => {
      const on = s.fs === k;
      return { label, on: on ? ('true' as const) : ('false' as const), pick: () => set({ fs: k }) };
    });
  const gids = D.recs.map((x) => x.group).filter((v, i, a) => a.indexOf(v) === i);
  const ordered = gids.flatMap((g) => list.filter((x) => x.group === g));
  const handed = s.selCode && !s.selDone ? D.recs.find((x) => x.code === s.selCode) : undefined;
  const r = handed ?? ordered.find((x) => x.id === s.sel) ?? ordered[0] ?? D.recs[0];
  const openM: Readonly<Record<string, boolean>> = s.open ?? (r ? { [r.group]: true } : {});
  const groups = gids
    .map((g) => {
      const L = list.filter((x) => x.group === g);
      const open = !!q || !!s.fs || !!openM[g];
      return {
        name: g,
        n: String(L.length),
        hide: !L.length,
        open,
        ax: open ? ('true' as const) : ('false' as const),
        rot: open ? '90deg' : '0deg',
        tg: () => set({ open: { ...openM, [g]: !openM[g] } }),
        rows: L.map((x) => {
          const on = !!r && x.id === r.id;
          return {
            code: x.code,
            title: x.title,
            st: x.st,
            dot: stOf(x.st)[1],
            on: on ? ('true' as const) : ('false' as const),
            sel: on ? 'background:var(--tint);color:var(--accent2);box-shadow:inset 3px 0 0 var(--accent)' : '',
            pick: () => set({ sel: x.id, selDone: true, open: { ...openM, [g]: true } }),
          };
        }),
      };
    })
    .filter((g) => !g.hide);
  const i = r ? ordered.findIndex((x) => x.id === r.id) : -1;
  const go = (n: number) => {
    const x = ordered[n];
    if (x) set({ sel: x.id, selDone: true, open: { ...openM, [x.group]: true } });
  };

  const header = {
    code: r?.code ?? '',
    title: r?.title ?? '',
    st: r?.st ?? '',
    chip: stOf(r?.st ?? '')[0],
    sub: r?.sub ?? '',
    chips: (r?.chips ?? []).map(([t, st]) => ({ t, s: st })),
    hasAlert: !!r?.alert,
    alert: r?.alert ?? '',
    facts: (r?.facts ?? []).map(([l, v, m]) => ({ l, v, st: m ? MONO : '' })),
    railTitle: r?.railTitle ?? '',
    hasRail: !!r && r.railTitle.startsWith('Customer group'),
    railNote: r?.railNote ?? '',
    hasNote: !!r?.railNote,
    rail: (r?.rail ?? []).map(([a, b, c, cur]) => ({ a, b, c, cls: cur ? 'tl cur' : 'tl', fg: cur ? 'var(--accent2)' : 'var(--ink)' })),
  };

  const base = (id: string, t: string, n: string, sum: string): Omit<DetailSection, 'hasN' | 'open' | 'ax' | 'rot' | 'tg'> => ({
    id,
    t,
    n,
    sum,
    isKv: false,
    isTbl: false,
    isTl: false,
    kv: [],
    h: [],
    rows: [],
    empty: false,
    tl: [],
    note: '',
    hasNote: false,
  });
  const ALL: Omit<DetailSection, 'hasN' | 'open' | 'ax' | 'rot' | 'tg'>[] = [];
  (r?.sections ?? []).forEach(([t, rows], k) =>
    ALL.push({
      ...base(
        's' + k,
        t,
        '',
        rows
          .slice(0, 3)
          .map((x) => x[1])
          .join(' · '),
      ),
      isKv: true,
      kv: rows.map(([l, v, m, w, mu]) => ({ l, v, cls: w ? 'w' : '', st: (m ? MONO : '') + (mu ? ';color:var(--muted4)' : '') })),
    }),
  );
  const rowOff = (hd: readonly string[], row: readonly string[]) =>
    hd.some((h, j) => STATUS_HEADERS.includes(h) && OFF.includes(row[j] ?? ''));
  (r?.tables ?? []).forEach((tb, k) => {
    const p = tb.title.split(' · ');
    const cnt = /^\d+$/.test(p[p.length - 1] ?? '') ? (p.pop() ?? '') : '';
    const sorted = tb.rows
      .map((x, idx) => [x, idx] as const)
      .sort((a, b) => Number(rowOff(tb.headers, a[0])) - Number(rowOff(tb.headers, b[0])) || a[1] - b[1])
      .map((x) => x[0]);
    ALL.push({
      ...base(
        't' + k,
        p.join(' · '),
        cnt,
        tb.rows.length
          ? tb.rows
              .slice(0, 3)
              .map((x) => x[0])
              .join(', ') + (tb.rows.length > 3 ? ' +' + (tb.rows.length - 3) : '')
          : 'None',
      ),
      isTbl: true,
      empty: tb.rows.length === 0,
      h: tb.headers.map((v) => ({ v, st: 'width:' + (100 / tb.headers.length).toFixed(3) + '%' })),
      rows: sorted.map((row) => ({
        rs: rowOff(tb.headers, row) ? 'color:var(--muted4)' : '',
        cells: row.map((v, j): DetailCell => {
          const chip = STATUS_HEADERS.includes(tb.headers[j] ?? '') ? SC[v] : undefined;
          const isLink = j === 0 && !!tb.link && v !== '—';
          return {
            v,
            isChip: !!chip,
            chip: chip ?? '',
            isLink,
            isText: !chip && !isLink,
            href: isLink ? (tb.link ?? '') : '',
            go: () => {
              if (tb.linkKey) handOffSelection(tb.linkKey, v);
            },
            cls: tb.mono.includes(j) ? 'mono' : '',
            st:
              (j === 0 && !isLink ? 'font-weight:500;' : '') +
              (v === '—' || v === 'Not mapped' ? 'color:var(--muted4)' : v === 'Default' ? 'color:var(--accent2);font-weight:600' : ''),
          };
        }),
      })),
    });
  });
  const op: Readonly<Record<string, boolean>> = s.op ?? { s0: true, s1: true };
  const allOpen = ALL.every((x) => op[x.id]);
  const secs: DetailSection[] = ALL.map((x) => ({
    ...x,
    hasN: !!x.n,
    open: !!op[x.id],
    ax: op[x.id] ? 'true' : 'false',
    rot: op[x.id] ? '90deg' : '0deg',
    tg: () => set({ op: { ...op, [x.id]: !op[x.id] } }),
  }));

  return {
    q: s.q,
    onQ: (e: ChangeEvent<HTMLInputElement>) => set({ q: e.target.value }),
    segs,
    groups,
    empty: list.length === 0,
    gLabel: D.groupLabel,
    gCount: groups.length + ' · ' + D.groupLabel.toLowerCase(),
    countText: list.length + ' of ' + D.recs.length + ' ' + D.nouns,
    h: header,
    secs,
    railCols: header.hasRail ? 'minmax(0, 1fr) 340px' : 'minmax(0, 1fr)',
    allL: allOpen ? 'Collapse all' : 'Expand all',
    allT: () => set({ op: Object.fromEntries(ALL.map((x) => [x.id, !allOpen])) }),
    pos: i >= 0 ? i + 1 + ' of ' + ordered.length : '',
    noPrev: i <= 0,
    noNext: i < 0 || i >= ordered.length - 1,
    prev: () => {
      if (i > 0) go(i - 1);
    },
    next: () => {
      if (i >= 0 && i < ordered.length - 1) go(i + 1);
    },
    /** Id of the record shown (for the record actions). */
    selectedId: r?.id ?? '',
  };
}

export type MasterDetailVals = ReturnType<typeof renderMasterDetail>;
