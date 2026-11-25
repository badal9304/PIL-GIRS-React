import { effectiveText, whereText, type Charge, type ChargeDirectory } from '@/entities/charge';
import { formatAmount, type ContractDirectory } from '@/entities/contract';
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
import type { ChargeActions } from '../api/changeRequest';
import { CHARGE_KIT_META, auditNewestFirst, chargeKitRecord, chargeSections, chargeStatus } from './chargeKit';

/** Charge Master, layout D ("Overview"). Also lists the contracts that price each charge. */
export type ChargeDState = DetailState & { kit: KitOverlay };

export interface ChargeScreenData {
  charges: ChargeDirectory;
  contracts: ContractDirectory;
}

const HANDOFF = 'ChargeMasterD';
const MONO = new Set(['Charge code', 'Tax code', 'Currency']);
const WIDE = new Set(['Port', 'Tax description', 'Rules using this charge']);

/** A charge as an overview record. */
export function chargeDetailRecord(data: ChargeScreenData, h: Charge): DetailRecord {
  const dir = data.charges;
  const using = data.contracts.contracts.flatMap((c) =>
    c.rates.filter((r) => r.code === h.code).map((r) => [c.no, c.cusName, formatAmount(r.rate), r.ccy]),
  );
  const audit = auditNewestFirst(h);
  return {
    id: h.id,
    code: h.code,
    title: h.name,
    group: h.cat,
    st: chargeStatus(h),
    search: [h.code, h.name, h.lms, h.cat].join(' '),
    sub: h.cat + ' · Effective ' + effectiveText(h),
    chips: [],
    alert: '',
    facts: [
      ['Origin / Destination', h.app, 0],
      ['Port / Country', whereText(dir, h), 0],
      ['Tax code', h.tax, 1],
      ['Currency', h.ccy, 1],
      ['LMS mapping', h.lms || 'Not mapped', 1],
    ],
    sections: chargeSections(dir, h).map(
      ([t, rows]) =>
        [
          t,
          rows.map(([l, v]) =>
            l === 'LMS charge code' && !h.lms
              ? kv(l, v, false, false, true)
              : kv(l, v, MONO.has(l) || l === 'LMS charge code', WIDE.has(l), l === 'Rules using this charge'),
          ),
        ] as const,
    ),
    tables: [
      {
        title: 'Contracts using this charge · ' + using.length,
        headers: ['Contract no.', 'Customer', 'Rate', 'Currency'],
        rows: using,
        mono: [0, 2, 3],
        link: 'contract-master-d.html',
        linkKey: 'ContractMasterD',
      },
    ],
    railTitle: 'Audit trail · ' + audit.length,
    railNote: '',
    rail: audit.map((x) => [x.a, x.b, x.c, 0] as const),
  };
}

export function chargeDetailConfig(data: ChargeScreenData): DetailConfig {
  return {
    recs: data.charges.charges.map((h) => chargeDetailRecord(data, h)),
    smap: {
      Active: ['background:var(--okbg);color:var(--ok)', 'var(--okbar)'],
      Inactive: ['background:var(--neutral);color:var(--muted2)', 'var(--muted4)'],
    },
    segLabels: {},
    groupLabel: 'Category',
    nouns: 'charges',
  };
}

export class ChargeMasterDModel extends ScreenModel<ChargeDState, ChargeDVals, ChargeScreenData, ChargeActions> {
  constructor() {
    super({ ...initialDetailState(HANDOFF, 'h4'), kit: null });
  }

  protected renderVals(): ChargeDVals {
    return chargeDVals(this.state, this.data, this.context());
  }
}

export function chargeDVals(s: ChargeDState, data: ChargeScreenData, ctx: ScreenContext<ChargeDState, ChargeActions>) {
  const detail = renderMasterDetail(s, chargeDetailConfig(data), ctx.set);
  const current = data.charges.charges.find((h) => h.id === detail.selectedId);
  return {
    ...detail,
    kit: renderMasterKit({
      overlay: s.kit,
      setOverlay: (kit) => ctx.set({ kit }),
      toast: ctx.toast,
      meta: CHARGE_KIT_META,
      current: current ? chargeKitRecord(data.charges, current) : null,
      allCodes: data.charges.charges.map((h) => h.code.toUpperCase()),
      requestChange: ctx.actions.requestChange,
    }),
  };
}

export type ChargeDVals = ReturnType<typeof chargeDVals>;
