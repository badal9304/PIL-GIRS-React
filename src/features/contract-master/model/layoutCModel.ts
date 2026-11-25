import type { ChangeEvent } from 'react';
import { adminFeeText, formatAmount, validityState, validityText, type Contract, type ContractDirectory } from '@/entities/contract';
import { renderMasterKit, type KitOverlay } from '@/shared/lib/master-kit/masterKit';
import { ScreenModel, type ScreenContext } from '@/shared/lib/screenModel';
import type { ContractActions } from '../api/changeRequest';
import { CONTRACT_KIT_META, contractKitRecord, contractSections } from './contractKit';
import { APPROVAL_STYLE, VALIDITY_CHIP } from './contractStyles';

/** Contract Master, layout C ("Tabs"): contracts grouped by customer, the selected one in tabs. */
export interface ContractCState {
  q: string;
  /** Approval status filter. */
  fSt: string;
  fLane: string;
  /** Validity filter (In force / Upcoming / Expired). */
  fVal: string;
  sel: string;
  tab: 'rates' | 'fee' | 'vers' | 'det';
  open: Readonly<Record<string, boolean>>;
  kit: KitOverlay;
}

export class ContractMasterCModel extends ScreenModel<ContractCState, ContractCVals, ContractDirectory, ContractActions> {
  constructor() {
    super({ q: '', fSt: '', fLane: '', fVal: '', sel: 'k1', tab: 'rates', open: { 'SG-100231': true }, kit: null });
  }

  protected renderVals(): ContractCVals {
    return contractCVals(this.state, this.data, this.context());
  }
}

const kvl = (rows: ReadonlyArray<readonly [string, string]>) => rows.map(([l, v]) => ({ l, v }));

export function contractCVals(s: ContractCState, dir: ContractDirectory, ctx: ScreenContext<ContractCState, ContractActions>) {
  const K = dir.contracts;
  const q = s.q.trim().toLowerCase();
  const list = K.filter(
    (c) =>
      (!q || (c.no + ' ' + c.cus + ' ' + c.cusName + ' ' + c.lane).toLowerCase().includes(q)) &&
      (!s.fSt || c.st === s.fSt) &&
      (!s.fLane || c.lane === s.fLane) &&
      (!s.fVal || validityState(c) === s.fVal),
  );
  const lanes = K.map((c) => c.lane)
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort();
  const segs = (
    [
      ['', 'All'],
      ['Approved', 'Approved'],
      ['Pending approval', 'Pending'],
      ['Draft', 'Draft'],
      ['Rejected', 'Rejected'],
    ] as const
  ).map(([k, label]) => {
    const on = s.fSt === k;
    return { label, on: on ? ('true' as const) : ('false' as const), pick: () => ctx.set({ fSt: k }) };
  });
  const groups = Object.entries(dir.customers)
    .map(([cu, name]) => {
      const L = list.filter((c) => c.cus === cu);
      const open = !!q || !!s.fSt || !!s.open[cu];
      return {
        code: cu,
        name,
        n: String(L.length),
        hide: !L.length,
        open,
        ax: open ? ('true' as const) : ('false' as const),
        rot: open ? '90deg' : '0deg',
        tg: () => ctx.set({ open: { ...s.open, [cu]: !s.open[cu] } }),
        rows: L.map((c) => {
          const on = s.sel === c.id;
          return {
            no: c.no,
            lane: c.lane,
            ver: 'v' + c.ver,
            st: c.st,
            dot: APPROVAL_STYLE[c.st].dot,
            on: on ? ('true' as const) : ('false' as const),
            sel: on ? 'background:var(--tint);color:var(--accent2);font-weight:500;box-shadow:inset 3px 0 0 var(--accent)' : '',
            pick: () => ctx.set({ sel: c.id }),
          };
        }),
      };
    })
    .filter((g) => !g.hide);
  const c: Contract | undefined = list.find((x) => x.id === s.sel) ?? list[0] ?? K[0];
  const vs = c ? validityState(c) : 'In force';
  const tabs = (
    [
      ['rates', 'Rates', String(c?.rates.length ?? 0)],
      ['fee', 'Admin fee & tax', ''],
      ['det', 'Contract details', ''],
    ] as const
  ).map(([k, label, count]) => {
    const on = s.tab === k;
    return {
      label,
      count,
      on: on ? ('true' as const) : ('false' as const),
      fg: on ? 'var(--accent)' : 'var(--muted)',
      line: on ? 'var(--accent)' : 'transparent',
      pick: () => ctx.set({ tab: k }),
    };
  });
  const secs = c ? contractSections(dir, c) : [];
  return {
    q: s.q,
    fSt: s.fSt,
    fLane: s.fLane,
    fVal: s.fVal,
    laneOpts: lanes,
    onQ: (e: ChangeEvent<HTMLInputElement>) => ctx.set({ q: e.target.value }),
    onSt: (e: ChangeEvent<HTMLSelectElement>) => ctx.set({ fSt: e.target.value }),
    onLane: (e: ChangeEvent<HTMLSelectElement>) => ctx.set({ fLane: e.target.value }),
    onVal: (e: ChangeEvent<HTMLSelectElement>) => ctx.set({ fVal: e.target.value }),
    filtered: !!(s.q || s.fSt || s.fLane || s.fVal),
    clear: () => ctx.set({ q: '', fSt: '', fLane: '', fVal: '' }),
    empty: list.length === 0,
    countText: list.length + ' of ' + K.length + ' contracts',
    segs,
    groups,
    cusCount: groups.length,
    h: {
      no: c?.no ?? '',
      cus: c?.cus ?? '',
      cusName: c?.cusName ?? '',
      lane: c?.lane ?? '',
      valid: c ? validityText(c) : '',
      vst: vs,
      vChip: VALIDITY_CHIP[vs],
      terms: c?.terms ?? '',
      tax: c ? c.tax + ' · ' + c.taxCode : '',
      adm: c ? adminFeeText(c) : '',
      admFg: c?.adm.on ? 'var(--ink)' : 'var(--muted4)',
      ver: 'v' + (c?.ver ?? ''),
      st: c?.st ?? '',
      stChip: c ? APPROVAL_STYLE[c.st].chip : '',
      nRates: String(c?.rates.length ?? 0),
      nVers: String(c?.vers.length ?? 0),
    },
    tabs,
    tRates: s.tab === 'rates',
    tFee: s.tab === 'fee',
    tVers: s.tab === 'vers',
    tDet: s.tab === 'det',
    rl: (c?.rates ?? []).map((r) => ({ code: r.code, name: r.name, rate: formatAmount(r.rate), ccy: r.ccy })),
    vl: (c?.vers ?? []).map((v) => ({
      v: 'v' + v.n,
      what: v.what,
      by: v.by,
      at: v.at,
      st: v.st,
      chip: APPROVAL_STYLE[v.st].chip,
      cur: v.n === c?.ver,
    })),
    akv: kvl(secs[1]?.[1] ?? []).map((x) =>
      x.v === 'Per invoice · automatically' ? { ...x, v: 'Per invoice · applied automatically' } : x,
    ),
    tkv: kvl(secs[2]?.[1] ?? []),
    dkv: c ? [...kvl(secs[0]?.[1] ?? []), { l: 'Approval status', v: c.st }] : [],
    kit: renderMasterKit({
      overlay: s.kit,
      setOverlay: (kit) => ctx.set({ kit }),
      toast: ctx.toast,
      meta: CONTRACT_KIT_META,
      current: c ? contractKitRecord(dir, c) : null,
      allCodes: K.map((x) => x.no.toUpperCase()),
      requestChange: ctx.actions.requestChange,
    }),
  };
}

export type ContractCVals = ReturnType<typeof contractCVals>;
