'use client';

import { Fragment, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/compositions/app-header';
import { ExportMenu } from '@/compositions/export-menu';
import { MasterKitOverlays } from '@/compositions/master-record';
import type { ChargeCVals } from '@/features/charge-master';
import { usePhrase } from '@/shared/hooks/usePhrase';
import { a, aria, b, clk, s, sx } from '@/shared/lib/bindings';
import { AppLink, ScreenTemplate } from '@/shared/ui';

/* Charge master, layout C.
   Markup ported from the GIRS prototype; values and handlers come from the screen model (v). */
export function ChargeMasterLayoutCView({ v }: { v: ChargeCVals }): ReactNode {
  const { t } = useTranslation('masters');
  const { tx } = usePhrase();
  return (
    <ScreenTemplate
      topBar={<AppHeader />}
      header={
        <div className="ghead py-2 px-5 min-h-14 flex-none flex flex-wrap items-center justify-between gap-y-2 gap-x-6 bg-surface border-b border-b-line box-border">
          <div className="min-w-0">
            <h1 className="m-0 text-[17px] font-semibold leading-[22px]">{t('Charge Master')}</h1>
            <p className="m-0 text-[12px] leading-[16px] text-muted">
              {t('Charge codes, categories, applicability, tax mapping and LMS charge-code alignment')}
            </p>
          </div>
          <div className="gright gap-2.5 flex flex-wrap items-center justify-end ms-auto">
            <nav className="gap-2 flex items-center" aria-label={t('Layout options')}>
              <span className="text-[12px] text-muted">{t('Layout')}</span>
              <div className="p-0.5 gap-0.5 flex rounded-[6px] bg-neutral">
                <AppLink
                  className="lay rec"
                  href="charge-master-c.html"
                  aria-current="page"
                  title={t('Recommended \u00b7 present to client first')}
                >
                  <span className="recst" aria-hidden="true">
                    {t('★')}
                  </span>
                  {t('C · Tabs')}
                </AppLink>
                <AppLink className="lay rec" href="charge-master-d.html" title={t('Recommended \u00b7 present to client first')}>
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
              {t('New charge')}
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
              placeholder={t('Search charge code, name or LMS code')}
              value={s(v.q)}
              aria-label={t('Search charges')}
              onChange={v.onQ}
            />
            <div className="r-wrap flex items-center justify-between">
              <div className="seg" role="radiogroup" aria-label={t('Active status')}>
                {(v.segs || []).map((g, $index) => (
                  <Fragment key={$index}>
                    <button role="radio" aria-checked={aria(g?.on)} onClick={clk(g?.pick)}>
                      {tx(s(g?.label))}
                    </button>
                  </Fragment>
                ))}
              </div>
              <span className="text-[12px] text-muted">{tx(s(v.countText))}</span>
            </div>
          </div>
          <div className="flex-auto overflow-auto" role="listbox" aria-label={t('Charges')}>
            <div className="pt-3 pb-1 px-4 text-[12px] text-muted">{tx(`${s(v.catCount)} charge categories`)}</div>
            <div className="pt-0 pb-3 px-2">
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
                      <span className="flex-auto">{tx(s(g?.name))}</span>
                      {g?.hasOff ? (
                        <>
                          <span className="text-[12px] text-muted font-medium" title={t('Contains inactive charges')}>
                            {tx(s(g?.offTxt))}
                          </span>
                        </>
                      ) : null}
                      <span className="mono text-[12px] font-medium text-muted min-w-4 text-end">{tx(s(g?.n))}</span>
                    </button>
                    {g?.open ? (
                      <>
                        {(g?.rows || []).map((r, $index) => (
                          <Fragment key={$index}>
                            {' '}
                            <button className="cbtn" role="option" aria-selected={aria(r?.on)} style={sx(s(r?.sel))} onClick={clk(r?.pick)}>
                              <span className="mono r-col flex-[0_0_52px]">{tx(s(r?.code))}</span>{' '}
                              <span
                                className="flex-auto min-w-0 whitespace-nowrap overflow-hidden text-ellipsis"
                                style={sx(`color: ${s(r?.fg)}`)}
                              >
                                {tx(s(r?.name))}
                              </span>
                              {r?.off ? (
                                <>
                                  <span className="flex-none w-2 h-2 rounded-full bg-muted4" title={t('Inactive')} />
                                </>
                              ) : null}
                            </button>{' '}
                          </Fragment>
                        ))}
                      </>
                    ) : null}
                  </div>
                </Fragment>
              ))}
            </div>
            {v.empty ? (
              <>
                <div className="py-8 px-4 text-center text-muted">{t('No charge matches your search')}</div>
              </>
            ) : null}
          </div>
        </section>
        <section className="card flex-auto min-w-0 overflow-hidden flex flex-col">
          <div className="r-wrap pt-6 pb-5 px-7 gap-4 flex items-center">
            <div
              className="mono py-0 px-2.5 min-w-14 h-14 rounded-[12px] bg-tint text-accent2 flex items-center justify-center text-[15px] font-semibold box-border"
              aria-hidden="true"
            >
              {tx(s(v.c?.code))}
            </div>
            <div className="gap-1 flex-auto min-w-0 flex flex-col">
              <div className="gap-2.5 flex items-center">
                <h2 className="m-0 text-[22px] font-semibold leading-[28px]">{tx(s(v.c?.name))}</h2>
                <span className="chip" style={sx(s(v.c?.stChip))}>
                  {tx(s(v.c?.st))}
                </span>
              </div>
              <div className="text-[13px] text-muted">{tx(`${s(v.c?.cat)} · Effective ${s(v.c?.eff)}`)}</div>
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
                                  <path d="M12 3v9" />
                                  <path d="M6.4 6.4a8 8 0 1 0 11.2 0" />
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
              <span className="l">{t('Origin / Destination')}</span>
              <span className="v">{tx(s(v.c?.app))}</span>
            </div>
            <div className="fact">
              <span className="l">{t('Port / Country')}</span>
              <span className="v">{tx(s(v.c?.where))}</span>
            </div>
            <div className="fact">
              <span className="l">{t('Tax code')}</span>
              <span className="v mono">{tx(s(v.c?.tax))}</span>
            </div>
            <div className="fact">
              <span className="l">{t('Currency')}</span>
              <span className="v mono">{tx(s(v.c?.ccy))}</span>
            </div>
            <div className="fact">
              <span className="l">{t('LMS mapping')}</span>
              <span className="v mono" style={sx(`color: ${s(v.c?.lmsFg)}`)}>
                {tx(s(v.c?.lms))}
              </span>
            </div>
          </div>
          <div className="r-wrap py-0 px-7 gap-7 flex border-b border-b-line" role="tablist" aria-label={t('Charge sections')}>
            {(v.tabs || []).map((t, $index) => (
              <Fragment key={$index}>
                {' '}
                <button
                  className="tab"
                  role="tab"
                  aria-selected={aria(t?.on)}
                  style={sx(`color: ${s(t?.fg)}; box-shadow: inset 0 -2px 0 ${s(t?.line)}`)}
                  onClick={clk(t?.pick)}
                >
                  {tx(s(t?.label))}
                  <span className="mono text-[12px] text-muted">{tx(s(t?.count))}</span>
                </button>{' '}
              </Fragment>
            ))}
          </div>
          <div className="py-6 px-7 flex-auto overflow-auto" role="tabpanel">
            {(v.panel || []).map((x, $index) => (
              <Fragment key={$index}>
                <div className="max-w-190 mb-7">
                  <h3 className="sech">{tx(s(x?.title))}</h3>
                  {x?.isKv ? (
                    <>
                      <div className="kv2">
                        {(x?.kv || []).map((k, $index) => (
                          <Fragment key={$index}>
                            <div className={a(k?.cls)}>
                              <span className="l">{tx(s(k?.l))}</span>
                              <span className="v" style={sx(s(k?.st))}>
                                {tx(s(k?.v))}
                              </span>
                            </div>
                          </Fragment>
                        ))}
                      </div>
                    </>
                  ) : null}
                  {x?.isList ? (
                    <>
                      {(x?.items || []).map((i, $index) => (
                        <Fragment key={$index}>
                          <div className="mini">
                            <span className="gap-0.5 flex flex-col">
                              <span className="ph">{tx(s(i?.a))}</span>
                              <span className="ph text-[12px]">{tx(s(i?.b))}</span>
                            </span>
                          </div>
                        </Fragment>
                      ))}
                    </>
                  ) : null}
                  {x?.isAudit ? (
                    <>
                      {(x?.items || []).map((i, $index) => (
                        <Fragment key={$index}>
                          <div className="tl">
                            <div className="font-medium">{tx(s(i?.a))}</div>
                            <div className="text-[12px] text-muted">{tx(`${s(i?.b)} · ${s(i?.c)}`)}</div>
                          </div>
                        </Fragment>
                      ))}
                    </>
                  ) : null}
                </div>
              </Fragment>
            ))}
          </div>
        </section>
      </div>
    </ScreenTemplate>
  );
}
