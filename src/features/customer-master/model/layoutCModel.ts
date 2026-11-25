import type { ChangeEvent } from 'react';
import { COUNTRIES, SANCTION_LABEL, deliversJson, isCountryCode, type Customer, type CustomerDirectory } from '@/entities/customer';
import type { KitOverlay } from '@/shared/lib/master-kit/masterKit';
import { ScreenModel, type ScreenContext } from '@/shared/lib/screenModel';
import type { CustomerActions } from '../api/customerMutations';
import { renderCustomerKit } from './customerKit';
import { ARRANGEMENT_STYLE, SANCTION_STYLE, initials } from './customerStyles';

/** Customer Master, layout C ("Groups"): parent groups with their customer codes, and the selected code in tabs. */
export interface CustomerCState {
  sel: string;
  q: string;
  open: Readonly<Record<string, boolean>>;
  tab: '1' | '2' | '3' | '4';
  kit: KitOverlay;
}

const countryName = (c: string): string => (isCountryCode(c) ? COUNTRIES[c] : c);

export class CustomerMasterCModel extends ScreenModel<CustomerCState, CustomerCVals, CustomerDirectory, CustomerActions> {
  constructor() {
    super({ sel: 'k2', q: '', open: { gA: true, gE: true }, tab: '1', kit: null });
  }

  protected renderVals(): CustomerCVals {
    return customerCVals(this.state, this.data, this.context());
  }
}

/** Values of layout C for the state and directory. */
export function customerCVals(s: CustomerCState, dir: CustomerDirectory, ctx: ScreenContext<CustomerCState, CustomerActions>) {
  const C = dir.customers;
  const G = dir.groups;
  const parties = (c: Customer) =>
    C.filter((x) => x.g === c.g).map((x, i) => ({
      ctry: countryName(x.ctry),
      name: x.name,
      code: x.code,
      isDef: x.id === c.id,
      def: x.id === c.id ? 'Default' : '',
      src: x.id === c.id ? (i % 2 ? 'LMS CMD' : 'Customer nomination · [Third-party platform]') : '',
    }));
  const q = s.q.trim().toLowerCase();
  const gids = Object.keys(G);
  const tree = gids
    .map((gid) => {
      const g = G[gid]!;
      const kids = C.filter((c) => c.g === gid && (!q || (g.name + ' ' + c.code + ' ' + c.name).toLowerCase().includes(q)));
      const open = !!q || !!s.open[gid];
      return {
        gid,
        name: g.name,
        n: String(kids.length),
        open: open ? ('true' as const) : ('false' as const),
        isOpen: open,
        rot: open ? '90deg' : '0deg',
        hide: kids.length === 0,
        toggle: () => ctx.set({ open: { ...s.open, [gid]: !s.open[gid] } }),
        kids: kids.map((c) => {
          const on = s.sel === c.id;
          return {
            code: c.code,
            ctry: countryName(c.ctry),
            flag: SANCTION_STYLE[c.st].flag,
            st: SANCTION_LABEL[c.st],
            cur: on ? ('true' as const) : ('false' as const),
            sel: on ? 'background:var(--tint);color:var(--accent2);font-weight:500;box-shadow:inset 3px 0 0 var(--accent)' : '',
            pick: () => ctx.set({ sel: c.id, open: { ...s.open, [gid]: true } }),
          };
        }),
      };
    })
    .filter((g) => !g.hide);
  const c = C.find((x) => x.id === s.sel) ?? C[0] ?? null;
  const g = c ? G[c.g] : undefined;
  const P = c ? parties(c) : [];
  const T: [CustomerCState['tab'], string, string][] = [
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
      on: on ? ('true' as const) : ('false' as const),
      fg: on ? 'var(--accent)' : 'var(--muted)',
      line: on ? 'var(--accent)' : 'transparent',
      pick: () => ctx.set({ tab: k }),
    };
  });
  const yes = 'background:var(--tint);color:var(--accent2)';
  const no = 'background:var(--line2);color:var(--muted4);text-decoration:line-through';
  return {
    q: s.q,
    onQ: (e: ChangeEvent<HTMLInputElement>) => ctx.set({ q: e.target.value }),
    tree,
    groupCount: gids.length,
    tabs,
    tab1: s.tab === '1',
    tab2: s.tab === '2',
    tab3: s.tab === '3',
    tab4: s.tab === '4',
    hasRecord: !!c && !!g,
    grp: {
      name: g?.name ?? '',
      legal: g?.legal ?? '',
      tax: g?.tax ?? '',
      n: c ? String(C.filter((x) => x.g === c.g).length) : '0',
      arr: g?.arr ?? 'Default',
      arrChip: ARRANGEMENT_STYLE[g?.arr ?? 'Default'],
    },
    c: {
      ini: c ? initials(c.name) : '',
      flag: c ? SANCTION_STYLE[c.st].flag : false,
      name: c?.name ?? '',
      code: c?.code ?? '',
      ctryName: c ? countryName(c.ctry) : '',
      ref: c?.ref ?? '',
      tax: g?.tax ?? '',
      terms: g?.terms ?? '',
      email: c?.email ?? '',
      addr: c?.addr ?? '',
      st: c ? SANCTION_LABEL[c.st] : '',
      chip: c ? SANCTION_STYLE[c.st].chip : '',
      defParty: c?.name ?? '',
    },
    parties: P,
    pdfChip: yes,
    jsonChip: c && deliversJson(dir, c) ? yes : no,
    kit: renderCustomerKit({
      dir,
      current: c,
      overlay: s.kit,
      actions: ctx.actions,
      setOverlay: (kit) => ctx.set({ kit }),
      toast: ctx.toast,
      onCreated: (created) => ctx.set({ sel: created.id, q: '', open: { ...s.open, [created.g]: true } }),
      onDeleted: (next) => ctx.set({ sel: next?.id ?? '' }),
    }),
  };
}

export type CustomerCVals = ReturnType<typeof customerCVals>;
