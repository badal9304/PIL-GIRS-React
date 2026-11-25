'use client';

import { Fragment, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/compositions/app-header';
import { ExportMenu } from '@/compositions/export-menu';
import { MasterKitOverlays } from '@/compositions/master-record';
import type { ContractCVals } from '@/features/contract-master';
import { usePhrase } from '@/shared/hooks/usePhrase';
import { aria, b, clk, s, sx } from '@/shared/lib/bindings';
import { AppLink, ScreenTemplate } from '@/shared/ui';

/* Contract master, layout C.
   Markup ported from the GIRS prototype; values and handlers come from the screen model (v). */
export function ContractMasterLayoutCView({ v }: { v: ContractCVals }): ReactNode {
  const { t } = useTranslation('masters');
  const { tx, tp } = usePhrase();
  return (
    <ScreenTemplate
      topBar={<AppHeader />}
      header={
        <div className="ghead py-2 px-5 min-h-14 flex-none flex flex-wrap items-center justify-between gap-y-2 gap-x-6 bg-surface border-b border-b-line box-border">
          <div className="min-w-0">
            <h1 className="m-0 text-[17px] font-semibold leading-[22px]">{t('Contract Master')}</h1>
            <p className="m-0 text-[12px] leading-[16px] text-muted">
              {t('Customer-specific rates, tax set-up and configurable admin fee per contract')}
            </p>
          </div>
          <div className="gright gap-2.5 flex flex-wrap items-center justify-end ms-auto">
            <nav className="gap-2 flex items-center" aria-label={t('Layout options')}>
              <span className="text-[12px] text-muted">{t('Layout')}</span>
              <div className="p-0.5 gap-0.5 flex rounded-[6px] bg-neutral">
                <AppLink
                  className="lay rec"
                  href="contract-master-c.html"
                  aria-current="page"
                  title={t('Recommended \u00b7 present to client first')}
                >
                  <span className="recst" aria-hidden="true">
                    {t('★')}
                  </span>
                  {t('C · Tabs')}
                </AppLink>
                <AppLink className="lay rec" href="contract-master-d.html" title={t('Recommended \u00b7 present to client first')}>
                  <span className="recst" aria-hidden="true">
                    {t('★')}
                  </span>
                  {t('D · Overview')}
                </AppLink>
              </div>
            </nav>
            <span className="chip bg-warnbg text-warn h-8 rounded-[6px]">{t('Sample values')}</span>
            <button className="btn btn-primary" onClick={clk(v.kit?.create)}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              {t('New contract')}
            </button>
            <ExportMenu />
          </div>
        </div>
      }
      overlays={<MasterKitOverlays kit={v.kit} />}
    >
      <div className="r-wrap gap-4 flex-auto min-h-0 flex items-stretch">
        <section className="card r-col flex-[0_0_380px] min-w-0 overflow-hidden flex flex-col">
          <div className="p-4 gap-3 flex flex-col border-b border-b-line">
            <input
              className="input w-full"
              placeholder={t('Search contract no., customer or trade lane')}
              value={s(v.q)}
              aria-label={t('Search contracts')}
              onChange={v.onQ}
            />
            <div className="seg" role="radiogroup" aria-label={t('Approval status')}>
              {(v.segs || []).map((g, $index) => (
                <Fragment key={$index}>
                  <button role="radio" aria-checked={aria(g?.on)} onClick={clk(g?.pick)}>
                    {tx(s(g?.label))}
                  </button>
                </Fragment>
              ))}
            </div>
          </div>
          <div className="pt-3 pb-1 px-4 text-[12px] text-muted">{tx(`${s(v.cusCount)} customers · ${s(v.countText)}`)}</div>
          <nav className="pt-0 pb-3 px-2 flex-auto overflow-auto" aria-label={t('Contracts by customer')}>
            {(v.groups || []).map((g, $index) => (
              <Fragment key={$index}>
                <div>
                  <button className="gbtn" aria-expanded={aria(g?.ax)} onClick={clk(g?.tg)}>
                    <svg
                      className="flex-none [transition:transform_.15s]"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={sx(`transform: rotate(${s(g?.rot)})`)}
                    >
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                    <span className="flex-auto min-w-0 flex flex-col">
                      <span className="font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{tx(s(g?.name))}</span>
                      <span className="mono text-[12px] text-muted">{tx(s(g?.code))}</span>
                    </span>
                    <span className="mono text-[12px] font-medium text-muted">{tx(s(g?.n))}</span>
                  </button>
                  {g?.open ? (
                    <>
                      {(g?.rows || []).map((r, $index) => (
                        <Fragment key={$index}>
                          {' '}
                          <button className="cbtn" aria-current={aria(r?.on)} style={sx(s(r?.sel))} onClick={clk(r?.pick)}>
                            <span className="flex-auto min-w-0 flex flex-col">
                              <span className="mono">{tx(s(r?.no))}</span>
                              <span className="text-[12px] text-muted font-normal">{tx(`${s(r?.lane)} · ${s(r?.ver)}`)}</span>
                            </span>{' '}
                            <span className="flex-none w-2 h-2 rounded-full" title={tp(s(r?.st))} style={sx(`background: ${s(r?.dot)}`)} />
                          </button>{' '}
                        </Fragment>
                      ))}
                    </>
                  ) : null}
                </div>
              </Fragment>
            ))}
            {v.empty ? (
              <>
                <div className="py-8 px-4 text-center text-muted">{t('No contracts match')}</div>
              </>
            ) : null}
          </nav>
        </section>
        <section className="card flex-auto min-w-0 overflow-hidden flex flex-col">
          <div className="r-wrap pt-5.5 pb-4.5 px-7 gap-4 flex items-center">
            <div className="gap-1 flex-auto min-w-0 flex flex-col">
              <div className="gap-2.5 flex items-center">
                <h2 className="mono m-0 text-[22px] font-semibold leading-[28px]">{tx(s(v.h?.no))}</h2>
                <span className="chip" style={sx(s(v.h?.stChip))}>
                  {tx(s(v.h?.st))}
                </span>
                <span className="chip" style={sx(s(v.h?.vChip))}>
                  {tx(s(v.h?.vst))}
                </span>
              </div>
              <div className="text-[13px] text-muted">
                {tx(`${s(v.h?.cusName)} ·`)} <span className="mono">{tx(s(v.h?.cus))}</span> {tx(`· Version ${s(v.h?.ver)}`)}
              </div>
            </div>
            <span className="kbar" role="group" aria-label={t('Record actions')}>
              {v.kit?.canEdit ? (
                <>
                  <button className="btn btn-sm btn-primary" onClick={clk(v.kit?.edit)}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                    </svg>
                    {t('Edit')}
                  </button>
                </>
              ) : null}
              {v.kit?.hasMore ? (
                <>
                  <span className="kmore">
                    <button
                      className="btn btn-sm kmorebtn"
                      aria-haspopup="menu"
                      aria-expanded={aria(v.kit?.menuOpen)}
                      onClick={clk(v.kit?.toggleMenu)}
                    >
                      {t('More')}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    {v.kit?.menuOpen ? (
                      <>
                        <button className="kmback" tabIndex={-1} aria-label={t('Close menu')} onClick={clk(v.kit?.close)} />
                        <div className="kmenu" role="menu" aria-label={t('More actions')}>
                          {v.kit?.canCopy ? (
                            <>
                              <button className="kmi" role="menuitem" onClick={clk(v.kit?.copy)}>
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <rect x="9" y="9" width="12" height="12" rx="2" />
                                  <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
                                </svg>
                                <span className="kmt">
                                  <span>{tx(s(v.kit?.copyLabel))}</span>
                                </span>
                              </button>
                            </>
                          ) : null}
                          {v.kit?.hasHist ? (
                            <>
                              <button className="kmi" role="menuitem" onClick={clk(v.kit?.openHist)}>
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                                  <path d="M3 3v5h5" />
                                  <path d="M12 7v5l3 2" />
                                </svg>
                                <span className="kmt">
                                  <span>{tx(s(v.kit?.histLabel))}</span>
                                  <small>{t('View and download · PDF, Excel, CSV')}</small>
                                </span>
                              </button>
                            </>
                          ) : null}
                          {v.kit?.hasDanger ? (
                            <>
                              <div className="ksep" role="separator" />
                            </>
                          ) : null}
                          {v.kit?.hasDanger ? (
                            <>
                              <button className="kmi kmi-d" role="menuitem" disabled={b(v.kit?.dangerDis)} onClick={clk(v.kit?.danger)}>
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <path d="M3 6h18" />
                                  <path d="M8 6V4h8v2" />
                                  <path d="M6 6l1 14h10l1-14" />
                                </svg>
                                <span className="kmt">
                                  <span>{tx(s(v.kit?.dangerMenu))}</span>
                                  {v.kit?.dangerDis ? (
                                    <>
                                      <small>{tx(s(v.kit?.dangerNote))}</small>
                                    </>
                                  ) : null}
                                </span>
                              </button>
                            </>
                          ) : null}
                        </div>
                      </>
                    ) : null}
                  </span>
                </>
              ) : null}
              {v.kit?.onlyHist ? (
                <>
                  <button className="btn btn-sm" onClick={clk(v.kit?.openHist)}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                      <path d="M3 3v5h5" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                    {tx(s(v.kit?.histLabel))}
                  </button>
                </>
              ) : null}
            </span>
          </div>
          <div className="pt-0 pb-5 px-7 flex">
            <div className="fact">
              <span className="l">{t('Validity')}</span>
              <span className="v">{tx(s(v.h?.valid))}</span>
            </div>
            <div className="fact">
              <span className="l">{t('Trade lane')}</span>
              <span className="v">{tx(s(v.h?.lane))}</span>
            </div>
            <div className="fact">
              <span className="l">{t('Payment terms')}</span>
              <span className="v">{tx(s(v.h?.terms))}</span>
            </div>
            <div className="fact">
              <span className="l">{t('Tax applicability')}</span>
              <span className="v">{tx(s(v.h?.tax))}</span>
            </div>
            <div className="fact">
              <span className="l">{t('Admin fee')}</span>
              <span className="v" style={sx(`color: ${s(v.h?.admFg)}`)}>
                {tx(s(v.h?.adm))}
              </span>
            </div>
          </div>
          <div className="r-wrap py-0 px-7 gap-7 flex border-b border-b-line" role="tablist" aria-label={t('Contract sections')}>
            {(v.tabs || []).map((t, $index) => (
              <Fragment key={$index}>
                <button
                  className="tab"
                  role="tab"
                  aria-selected={aria(t?.on)}
                  style={sx(`color: ${s(t?.fg)}; box-shadow: inset 0 -2px 0 ${s(t?.line)}`)}
                  onClick={clk(t?.pick)}
                >
                  {tx(s(t?.label))}
                  <span className="mono text-[12px] text-muted">{tx(s(t?.count))}</span>
                </button>
              </Fragment>
            ))}
          </div>
          <div className="py-6 px-7 flex-auto overflow-auto" role="tabpanel">
            {v.tRates ? (
              <>
                <div className="max-w-225">
                  <h3 className="sech">{t('Customer-specific rates')}</h3>
                  <table className="rt">
                    <thead>
                      <tr>
                        <th>{t('Charge code')}</th>
                        <th>{t('Charge name')}</th>
                        <th className="num">{t('Rate')}</th>
                        <th>{t('Currency')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(v.rl || []).map((r, $index) => (
                        <Fragment key={$index}>
                          <tr>
                            <td className="mono font-medium">{tx(s(r?.code))}</td>
                            <td>{tx(s(r?.name))}</td>
                            <td className="mono num">{tx(s(r?.rate))}</td>
                            <td className="mono">{tx(s(r?.ccy))}</td>
                          </tr>
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}
            {v.tFee ? (
              <>
                <div className="r-g2 gap-12 grid grid-cols-[1fr_1fr] max-w-275">
                  <div>
                    <h3 className="sech">{t('Admin fee')}</h3>
                    <div className="kv2">
                      {(v.akv || []).map((k, $index) => (
                        <Fragment key={$index}>
                          <div>
                            <span className="l">{tx(s(k?.l))}</span>
                            <span className="v">{tx(s(k?.v))}</span>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="sech">{t('Tax set-up')}</h3>
                    <div className="kv2">
                      {(v.tkv || []).map((k, $index) => (
                        <Fragment key={$index}>
                          <div>
                            <span className="l">{tx(s(k?.l))}</span>
                            <span className="v">{tx(s(k?.v))}</span>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
            {v.tVers ? (
              <>
                <div className="max-w-190">
                  <h3 className="sech">{t('Version history')}</h3>
                  {(v.vl || []).map((v, $index) => (
                    <Fragment key={$index}>
                      <div className="tl">
                        <div className="gap-2 flex items-center font-medium">
                          <span className="mono">{tx(s(v.v))}</span>
                          <span className="chip" style={sx(`${s(v.chip)}; height: 20px; padding: 0 8px`)}>
                            {tx(s(v.st))}
                          </span>
                          {v.cur ? (
                            <>
                              <span className="text-[12px] text-accent">{t('Current')}</span>
                            </>
                          ) : null}
                        </div>
                        <div className="text-[13px] mt-0.5">{tx(s(v.what))}</div>
                        <div className="text-[12px] text-muted">{tx(`${s(v.by)} · ${s(v.at)}`)}</div>
                      </div>
                    </Fragment>
                  ))}
                </div>
              </>
            ) : null}
            {v.tDet ? (
              <>
                <div className="max-w-225">
                  <h3 className="sech">{t('Contract details')}</h3>
                  <div className="kv2">
                    {(v.dkv || []).map((k, $index) => (
                      <Fragment key={$index}>
                        <div>
                          <span className="l">{tx(s(k?.l))}</span>
                          <span className="v">{tx(s(k?.v))}</span>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </ScreenTemplate>
  );
}
