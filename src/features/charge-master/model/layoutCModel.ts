import type { ChangeEvent } from 'react';
import {
  CHARGE_CATEGORIES,
  effectiveText,
  formatChargeDate,
  portText,
  whereText,
  type Charge,
  type ChargeDirectory,
} from '@/entities/charge';
import { renderMasterKit, type KitOverlay } from '@/shared/lib/master-kit/masterKit';
import { ScreenModel, type ScreenContext } from '@/shared/lib/screenModel';
import type { ChargeActions } from '../api/changeRequest';
import { CHARGE_KIT_META, chargeKitRecord, chargeStatus } from './chargeKit';
import type { ChargeScreenData } from './layoutDModel';

/** Charge Master, layout C ("Tabs"): charges grouped by category, the selected one in tabs. */
export interface ChargeCState {
  q: string;
  fCat: string;
  fApp: string;
  fCtry: string;
  /** all / on (active) / off (inactive) */
  fSt: 'all' | 'on' | 'off';
  sel: string;
  tab: 'ov' | 'tx' | 'lm' | 'br';
  open: Readonly<Record<string, boolean>>;
  kit: KitOverlay;
}

export class ChargeMasterCModel extends ScreenModel<ChargeCState, ChargeCVals, ChargeScreenData, ChargeActions> {
  constructor() {
    super({ q: '', fCat: '', fApp: '', fCtry: '', fSt: 'all', sel: 'h4', tab: 'ov', open: { 'Origin local charges': true }, kit: null });
  }

  protected renderVals(): ChargeCVals {
    return chargeCVals(this.state, this.data, this.context());
  }
}

const MONO = 'font-family:var(--mono,ui-monospace,monospace)';

interface PanelKv {
  l: string;
  v: string;
  cls: string;
  st: string;
}

interface PanelSection {
  title: string;
  isKv: boolean;
  isList: boolean;
  isAudit: boolean;
  kv: PanelKv[];
  items: { a: string; b: string; c: string }[];
}

const kv = (l: string, v: string, opt?: Partial<Pick<PanelKv, 'cls' | 'st'>>): PanelKv => ({ l, v, cls: '', st: '', ...opt });

const STATUS_STYLE = {
  Active: { chip: 'background:var(--okbg);color:var(--ok)', dot: 'var(--okbar)', fg: 'var(--ink)' },
  Inactive: { chip: 'background:var(--neutral);color:var(--muted2)', dot: 'var(--muted4)', fg: 'var(--muted)' },
} as const;

/** The five sections of a charge, by key. */
function sections(dir: ChargeDirectory, h: Charge): Record<'s1' | 's2' | 's3' | 's4' | 's5', PanelSection> {
  const sec = (title: string, body: Partial<PanelSection>): PanelSection => ({
    title,
    isKv: false,
    isList: false,
    isAudit: false,
    kv: [],
    items: [],
    ...body,
  });
  return {
    s1: sec('Charge details', {
      isKv: true,
      kv: [
        kv('Charge code', h.code, { st: MONO }),
        kv('Charge name', h.name),
        kv('Charge category', h.cat),
        kv('Active status', chargeStatus(h)),
        kv('Effective from', formatChargeDate(h.from)),
        kv('Effective to', formatChargeDate(h.to)),
      ],
    }),
    s2: sec('Applicability', {
      isKv: true,
      kv: [
        kv('Origin / Destination', h.app),
        kv('Country', dir.countries[h.ctry] ?? h.ctry),
        kv('Port', portText(dir, h), { cls: 'full' }),
      ],
    }),
    s3: sec('Country / Tax / Currency setup', {
      isKv: true,
      kv: [
        kv('Tax code', h.tax, { st: MONO }),
        kv('Currency', h.ccy, { st: MONO }),
        kv('Tax description', dir.taxDescriptions[h.tax] ?? '', { cls: 'full' }),
      ],
    }),
    s4: sec('LMS mapping', {
      isKv: true,
      kv: [
        kv('LMS charge code', h.lms || 'Not mapped', { st: h.lms ? MONO : 'color:var(--muted4)' }),
        kv('Mapping', h.lms ? 'Aligned with LMS charge code' : 'Charge maintained in GIRS only'),
      ],
    }),
    s5: sec('Business rules', { isList: true, items: [{ a: '[Business rule]', b: '[Rule description]', c: '' }] }),
  };
}

const TABS = [
  ['ov', 'Overview', ['s1', 's2']],
  ['tx', 'Tax & currency', ['s3']],
  ['lm', 'LMS mapping', ['s4']],
  ['br', 'Business rules', ['s5']],
] as const;

export function chargeCVals(s: ChargeCState, data: ChargeScreenData, ctx: ScreenContext<ChargeCState, ChargeActions>) {
  const dir = data.charges;
  const H = dir.charges;
  const q = s.q.trim().toLowerCase();
  const list = H.filter(
    (h) =>
      (!q || (h.code + ' ' + h.name + ' ' + h.lms).toLowerCase().includes(q)) &&
      (!s.fCat || h.cat === s.fCat) &&
      (!s.fApp || h.app === s.fApp) &&
      (!s.fCtry || h.ctry === s.fCtry) &&
      (s.fSt === 'all' || (s.fSt === 'on') === h.active),
  );
  const segs = (
    [
      ['all', 'All'],
      ['on', 'Active'],
      ['off', 'Inactive'],
    ] as const
  ).map(([k, label]) => {
    const on = s.fSt === k;
    return { label, on: on ? ('true' as const) : ('false' as const), pick: () => ctx.set({ fSt: k }) };
  });
  const groups = CHARGE_CATEGORIES.map((cat) => {
    const L = list.filter((h) => h.cat === cat);
    const open = !!q || !!s.open[cat];
    const off = L.filter((h) => !h.active).length;
    return {
      name: cat,
      n: String(L.length),
      hide: L.length === 0,
      open,
      ax: open ? ('true' as const) : ('false' as const),
      rot: open ? '90deg' : '0deg',
      hasOff: off > 0 && s.fSt === 'all',
      offTxt: off + ' inactive',
      tg: () => ctx.set({ open: { ...s.open, [cat]: !s.open[cat] } }),
      rows: L.map((h) => {
        const on = s.sel === h.id;
        return {
          code: h.code,
          name: h.name,
          off: !h.active,
          fg: h.active ? 'var(--ink)' : 'var(--muted)',
          on: on ? ('true' as const) : ('false' as const),
          sel: on ? 'background:var(--tint);color:var(--accent2);font-weight:500;box-shadow:inset 3px 0 0 var(--accent)' : '',
          pick: () => ctx.set({ sel: h.id }),
        };
      }),
    };
  }).filter((g) => !g.hide);
  const h = H.find((x) => x.id === s.sel) ?? H[0];
  const S = h ? sections(dir, h) : null;
  const tabs = TABS.map(([k, label]) => {
    const on = s.tab === k;
    return {
      label,
      count: '',
      on: on ? ('true' as const) : ('false' as const),
      fg: on ? 'var(--accent)' : 'var(--muted)',
      line: on ? 'var(--accent)' : 'transparent',
      pick: () => ctx.set({ tab: k }),
    };
  });
  const cur = TABS.find((t) => t[0] === s.tab) ?? TABS[0];
  const st = h ? STATUS_STYLE[chargeStatus(h)] : STATUS_STYLE.Active;
  return {
    q: s.q,
    fCat: s.fCat,
    fApp: s.fApp,
    fCtry: s.fCtry,
    segs,
    onQ: (e: ChangeEvent<HTMLInputElement>) => ctx.set({ q: e.target.value }),
    onCat: (e: ChangeEvent<HTMLSelectElement>) => ctx.set({ fCat: e.target.value }),
    onApp: (e: ChangeEvent<HTMLSelectElement>) => ctx.set({ fApp: e.target.value }),
    onCtry: (e: ChangeEvent<HTMLSelectElement>) => ctx.set({ fCtry: e.target.value }),
    filtered: !!(s.q || s.fCat || s.fApp || s.fCtry || s.fSt !== 'all'),
    clear: () => ctx.set({ q: '', fCat: '', fApp: '', fCtry: '', fSt: 'all' }),
    empty: list.length === 0,
    countText: list.length + ' of ' + H.length + ' charges',
    groups,
    catCount: groups.length,
    tabs,
    panel: S ? cur[2].map((k) => S[k]) : [],
    c: {
      code: h?.code ?? '',
      name: h?.name ?? '',
      cat: h?.cat ?? '',
      eff: h ? effectiveText(h) : '',
      app: h?.app ?? '',
      where: h ? whereText(dir, h) : '',
      tax: h?.tax ?? '',
      ccy: h?.ccy ?? '',
      lms: h?.lms || 'Not mapped',
      lmsFg: h?.lms ? 'var(--ink)' : 'var(--muted4)',
      st: h ? chargeStatus(h) : '',
      stChip: st.chip,
    },
    kit: renderMasterKit({
      overlay: s.kit,
      setOverlay: (kit) => ctx.set({ kit }),
      toast: ctx.toast,
      meta: CHARGE_KIT_META,
      current: h ? chargeKitRecord(dir, h) : null,
      allCodes: H.map((x) => x.code.toUpperCase()),
      requestChange: ctx.actions.requestChange,
    }),
  };
}

export type ChargeCVals = ReturnType<typeof chargeCVals>;
