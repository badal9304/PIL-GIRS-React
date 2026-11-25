import { adminFeeText, formatAmount, validityState, validityText, type Contract, type ContractDirectory } from '@/entities/contract';
import {
  initialDetailState,
  kv,
  renderMasterDetail,
  type DetailConfig,
  type DetailRecord,
  type DetailState,
} from '@/shared/lib/master-detail/masterDetail';
import { renderMasterKit, type KitOverlay } from '@/shared/lib/master-kit/masterKit';
import { ScreenModel, type ScreenContext } from '@/shared/lib/screenModel';
import type { ContractActions } from '../api/changeRequest';
import { CONTRACT_KIT_META, contractKitRecord, contractSections } from './contractKit';
import { VALIDITY_CHIP } from './contractStyles';

/** Contract Master, layout D ("Overview"). */
export type ContractDState = DetailState & { kit: KitOverlay };

const HANDOFF = 'ContractMasterD';
/** Sections shown in monospace / full width in the overview. */
const MONO = new Set(['Contract no.', 'Customer code', 'Version', 'Amount', 'Tax code']);
const WIDE = new Set(['Customer', 'Reason', 'Tax description']);

/** A contract as an overview record. */
export function contractDetailRecord(dir: ContractDirectory, c: Contract): DetailRecord {
  const vs = validityState(c);
  return {
    id: c.id,
    code: c.no,
    title: c.cusName,
    group: c.cusName,
    st: c.st,
    search: [c.no, c.cus, c.cusName, c.lane].join(' '),
    sub: c.cus + ' · ' + c.lane + ' · Version v' + c.ver,
    chips: [[vs, VALIDITY_CHIP[vs]]],
    alert: '',
    facts: [
      ['Validity', validityText(c), 0],
      ['Trade lane', c.lane, 0],
      ['Payment terms', c.terms, 0],
      ['Tax', c.tax + ' · ' + c.taxCode, 0],
      ['Admin fee', adminFeeText(c), 0],
      ['Rates', String(c.rates.length), 1],
    ],
    sections: contractSections(dir, c).map(([t, rows]) => [t, rows.map(([l, v]) => kv(l, v, MONO.has(l), WIDE.has(l)))] as const),
    tables: [
      {
        title: 'Customer-specific rates · ' + c.rates.length,
        headers: ['Charge code', 'Charge name', 'Rate', 'Currency'],
        rows: c.rates.map((r) => [r.code, r.name, formatAmount(r.rate), r.ccy]),
        mono: [0, 2, 3],
        link: 'charge-master-d.html',
        linkKey: 'ChargeMasterD',
      },
    ],
    railTitle: 'Version history · ' + c.vers.length,
    railNote: '',
    rail: c.vers.map((v) => ['v' + v.n + ' · ' + v.st, v.what, v.by + ' · ' + v.at, v.n === c.ver ? 1 : 0] as const),
  };
}

export function contractDetailConfig(dir: ContractDirectory): DetailConfig {
  return {
    recs: dir.contracts.map((c) => contractDetailRecord(dir, c)),
    smap: {
      Approved: ['background:var(--okbg);color:var(--ok)', 'var(--okbar)'],
      'Pending approval': ['background:var(--warnbg);color:var(--warn)', 'var(--warnbar)'],
      Draft: ['background:var(--neutral);color:var(--muted2)', 'var(--muted4)'],
      Rejected: ['background:var(--badbg);color:var(--bad)', 'var(--badbar)'],
    },
    segLabels: { 'Pending approval': 'Pending' },
    groupLabel: 'Customer',
    nouns: 'contracts',
  };
}

export class ContractMasterDModel extends ScreenModel<ContractDState, ContractDVals, ContractDirectory, ContractActions> {
  constructor() {
    super({ ...initialDetailState(HANDOFF, 'k1'), kit: null });
  }

  protected renderVals(): ContractDVals {
    return contractDVals(this.state, this.data, this.context());
  }
}

export function contractDVals(s: ContractDState, dir: ContractDirectory, ctx: ScreenContext<ContractDState, ContractActions>) {
  const detail = renderMasterDetail(s, contractDetailConfig(dir), ctx.set);
  const current = dir.contracts.find((c) => c.id === detail.selectedId);
  return {
    ...detail,
    kit: renderMasterKit({
      overlay: s.kit,
      setOverlay: (kit) => ctx.set({ kit }),
      toast: ctx.toast,
      meta: CONTRACT_KIT_META,
      current: current ? contractKitRecord(dir, current) : null,
      allCodes: dir.contracts.map((c) => c.no.toUpperCase()),
      requestChange: ctx.actions.requestChange,
    }),
  };
}

export type ContractDVals = ReturnType<typeof contractDVals>;
