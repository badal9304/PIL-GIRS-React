import { COUNTRIES, SANCTION_LABEL, deliversJson, isCountryCode, type Customer, type CustomerDirectory } from '@/entities/customer';
import {
  initialDetailState,
  kv,
  renderMasterDetail,
  type DetailConfig,
  type DetailRecord,
  type DetailState,
} from '@/shared/lib/master-detail/masterDetail';
import type { KitOverlay } from '@/shared/lib/master-kit/masterKit';
import { ScreenModel, type ScreenContext } from '@/shared/lib/screenModel';
import type { CustomerActions } from '../api/customerMutations';
import { renderCustomerKit } from './customerKit';
import { SANCTION_STYLE } from './customerStyles';

/** Customer Master, layout D ("Overview"). */
export type CustomerDState = DetailState & { kit: KitOverlay };

const HANDOFF = 'CustomerMasterD';
const GREY = 'background:var(--neutral);color:var(--muted2)';
const countryName = (c: string): string => (isCountryCode(c) ? COUNTRIES[c] : c);

/** A customer code as an overview record. */
export function customerDetailRecord(dir: CustomerDirectory, c: Customer): DetailRecord {
  const g = dir.groups[c.g] ?? { name: '', legal: '', arr: 'Default' as const, tax: '', terms: '' };
  const st = SANCTION_LABEL[c.st];
  const members = dir.customers.filter((x) => x.g === c.g);
  const parties = members.map((x, i) => [
    countryName(x.ctry),
    x.name,
    x.code,
    x.id === c.id ? 'Default' : '—',
    x.id === c.id ? (i % 2 ? 'LMS CMD' : 'Customer nomination · [Third-party platform]') : '—',
  ]);
  const contracts = dir.contracts[c.code] ?? [];
  return {
    id: c.id,
    code: c.code,
    title: c.name,
    group: g.name,
    st,
    search: [c.code, c.name, g.name, g.legal, g.tax].join(' '),
    sub: g.legal + ' · ' + countryName(c.ctry),
    chips: [[g.arr + ' invoicing', g.arr === 'Split' ? 'background:var(--aibg);color:var(--ai)' : GREY]],
    alert: SANCTION_STYLE[c.st].flag ? 'Sanction / Blacklist status: ' + st : '',
    facts: [
      ['Legal entity', g.legal, 0],
      ['Parent group', g.name, 0],
      ['Credit terms', g.terms, 0],
      ['Invoicing', g.arr, 0],
      ['Default billing party', c.name, 0],
      ['LMS CMD ref', c.ref, 1],
    ],
    sections: [
      [
        'Identity',
        [
          kv('Customer code', c.code, true),
          kv('Customer name', c.name),
          kv('Legal entity name', g.legal, false, true),
          kv('Registration / Tax ID', g.tax, true),
          kv('LMS CMD reference', c.ref, true),
        ],
      ],
      ['Contact', [kv('Email', c.email, false, true), kv('Address details', c.addr, false, true)]],
      [
        'Terms & compliance',
        [kv('Credit terms', g.terms), kv('Sanction / Blacklist', st), kv('Parent customer group', g.name, false, true)],
      ],
      [
        'Billing configuration & distribution',
        [
          kv('Invoicing arrangement', g.arr + ' · on customer-code grouping', false, true),
          kv('Default billing party', c.name, false, true),
          kv('Document / data delivery', deliversJson(dir, c) ? 'PDF, JSON' : 'PDF'),
          kv('Delivery to', c.email),
          kv('Customer-specific rules', '[Customer-specific billing configuration]', false, true, true),
        ],
      ],
    ],
    tables: [
      {
        title: 'Billing party details · country-wise',
        headers: ['Country', 'Billing party', 'Customer code', 'Default', 'Default set by'],
        rows: parties,
        mono: [2],
      },
      {
        title: 'Contracts · ' + contracts.length,
        headers: ['Contract no.', 'Trade lane', 'Validity', 'Approval'],
        rows: contracts,
        mono: [0],
        link: 'contract-master-d.html',
        linkKey: 'ContractMasterD',
      },
    ],
    railTitle: 'Customer group · ' + members.length + (members.length === 1 ? ' code' : ' codes'),
    railNote: 'Same legal entity and tax ID',
    rail: members.map((x) => [x.code + ' · ' + countryName(x.ctry), x.name, SANCTION_LABEL[x.st], x.id === c.id ? 1 : 0] as const),
  };
}

export function customerDetailConfig(dir: CustomerDirectory): DetailConfig {
  return {
    recs: dir.customers.map((c) => customerDetailRecord(dir, c)),
    smap: {
      'Not listed': ['background:var(--okbg);color:var(--ok)', 'var(--okbar)'],
      Sanctioned: ['background:var(--badbg);color:var(--bad)', 'var(--badbar)'],
      Blacklisted: ['background:var(--badbg);color:var(--bad)', 'var(--badbar)'],
    },
    segLabels: { 'Not listed': 'Not listed' },
    groupLabel: 'Parent customer group',
    nouns: 'customer codes',
  };
}

export class CustomerMasterDModel extends ScreenModel<CustomerDState, CustomerDVals, CustomerDirectory, CustomerActions> {
  constructor() {
    super({ ...initialDetailState(HANDOFF, 'k2'), kit: null });
  }

  protected renderVals(): CustomerDVals {
    return customerDVals(this.state, this.data, this.context());
  }
}

export function customerDVals(s: CustomerDState, dir: CustomerDirectory, ctx: ScreenContext<CustomerDState, CustomerActions>) {
  const detail = renderMasterDetail(s, customerDetailConfig(dir), ctx.set);
  const current = dir.customers.find((c) => c.id === detail.selectedId) ?? null;
  return {
    ...detail,
    kit: renderCustomerKit({
      dir,
      current,
      overlay: s.kit,
      actions: ctx.actions,
      setOverlay: (kit) => ctx.set({ kit }),
      toast: ctx.toast,
      onCreated: (created, groupName) =>
        ctx.set({ sel: created.id, selDone: true, q: '', fs: '', open: { ...(s.open ?? {}), [groupName]: true } }),
      onDeleted: (next) => ctx.set({ sel: next?.id ?? '', selDone: true }),
    }),
  };
}

export type CustomerDVals = ReturnType<typeof customerDVals>;
