'use client';

import { Fragment, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/compositions/app-header';
import { ExportMenu } from '@/compositions/export-menu';
import { MasterKitOverlays } from '@/compositions/master-record';
import type { CustomerCVals } from '@/features/customer-master';
import { usePhrase } from '@/shared/hooks/usePhrase';
import { aria, b, clk, s, sx } from '@/shared/lib/bindings';
import { AppLink, ScreenTemplate } from '@/shared/ui';

/* Customer master, layout C.
   Markup ported from the GIRS prototype; values and handlers come from the screen model (v). */
export function CustomerMasterLayoutCView({ v }: { v: CustomerCVals }): ReactNode {
  const { t } = useTranslation('masters');
  const { tx, tp } = usePhrase();
  return (
    <ScreenTemplate
      topBar={<AppHeader />}
      header={
        <div className="ghead py-2 px-5 min-h-14 flex-none flex flex-wrap items-center justify-between gap-y-2 gap-x-6 bg-surface border-b border-b-line box-border">
          <div className="min-w-0">
            <h1 className="m-0 text-[17px] font-semibold leading-[22px]">{t('Customer Master')}</h1>
            <p className="m-0 text-[12px] leading-[16px] text-muted">
              {t('CMD set-up · customer codes grouped at parent / legal-entity level · sourced from LMS Customer Master Data')}
            </p>
          </div>
          <div className="gright gap-2.5 flex flex-wrap items-center justify-end ms-auto">
            <nav className="gap-2 flex items-center" aria-label={t('Layout options')}>
              <span className="text-[12px] text-muted">{t('Layout')}</span>
              <div className="p-0.5 gap-0.5 flex rounded-[6px] bg-neutral">
                <AppLink
                  className="lay rec"
                  href="customer-master-c.html"
                  aria-current="page"
                  title={t('Recommended \u00b7 present to client first')}
                >
                  <span className="recst" aria-hidden="true">
                    {t('★')}
                  </span>
                  {t('C · Groups')}
                </AppLink>
                <AppLink className="lay rec" href="customer-master-d.html" title={t('Recommended \u00b7 present to client first')}>
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
              {t('Create new Customer')}
            </button>
            <ExportMenu />
          </div>
        </div>
      }
      overlays={<MasterKitOverlays kit={v.kit} />}
    >
      <div className="r-wrap gap-4 flex-auto min-h-0 flex items-stretch">
        <section className="card r-col flex-[0_0_340px] min-w-0 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-b-line">
            <input
              className="input w-full"
              placeholder={t('Search group, code or name')}
              value={s(v.q)}
              aria-label={t('Search customers')}
              onChange={v.onQ}
            />
          </div>
          <div className="pt-3 pb-1 px-4 text-[12px] text-muted">{tx(`${s(v.groupCount)} parent customer groups`)}</div>
          <nav className="pt-0 pb-3 px-2 flex-auto overflow-auto" aria-label={t('Customer groups')}>
            {(v.tree || []).map((g, $index) => (
              <Fragment key={$index}>
                <div>
                  <button className="gbtn" aria-expanded={aria(g?.open)} onClick={clk(g?.toggle)}>
                    <svg
                      className="[transition:transform_.15s]"
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
                    <span className="mono text-[12px] font-medium text-muted">{tx(s(g?.n))}</span>
                  </button>
                  {g?.isOpen ? (
                    <>
                      {(g?.kids || []).map((k, $index) => (
                        <Fragment key={$index}>
                          {' '}
                          <button className="cbtn" aria-current={aria(k?.cur)} style={sx(s(k?.sel))} onClick={clk(k?.pick)}>
                            <span className="mono flex-[0_0_auto]">{tx(s(k?.code))}</span>
                            <span className="flex-auto text-muted">{tx(s(k?.ctry))}</span>
                            {k?.flag ? (
                              <>
                                <span className="sr">{tx(s(k?.st))}</span>
                              </>
                            ) : null}
                            {k?.flag ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-badbar" title={tp(s(k?.st))} />
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
          </nav>
        </section>
        <div className="gap-4 flex-auto min-w-0 flex flex-col">
          <section className="card py-5 px-6 gap-10 flex items-center bg-hover2">
            <div className="gap-0.5 flex flex-col min-w-0">
              <span className="text-[12px] text-muted">{t('Parent customer group')}</span>
              <span className="text-[16px] font-semibold">{tx(s(v.grp?.name))}</span>
            </div>
            <div className="gap-0.5 flex flex-col">
              <span className="text-[12px] text-muted">{t('Legal entity name')}</span>
              <span>{tx(s(v.grp?.legal))}</span>
            </div>
            <div className="gap-0.5 flex flex-col">
              <span className="text-[12px] text-muted">{t('Registration / Tax ID')}</span>
              <span className="mono">{tx(s(v.grp?.tax))}</span>
            </div>
            <div className="gap-0.5 flex flex-col">
              <span className="text-[12px] text-muted">{t('Customer codes')}</span>
              <span className="mono">{tx(s(v.grp?.n))}</span>
            </div>
            <div className="gap-0.5 flex flex-col">
              <span className="text-[12px] text-muted">{t('Invoicing arrangement')}</span>
              <span>
                <span className="chip" style={sx(s(v.grp?.arrChip))}>
                  {tx(s(v.grp?.arr))}
                </span>
              </span>
            </div>
            <span className="ms-auto text-[12px] text-muted max-w-65 text-end">
              {t('Grouping drives invoicing, reporting and credit management')}
            </span>
          </section>
          <section className="card flex-auto min-h-0 flex flex-col overflow-hidden">
            <div className="r-wrap pt-5 pb-4.5 px-7 gap-4 flex items-center">
              <div
                className="w-12 h-12 rounded-[10px] bg-tint text-accent2 flex items-center justify-center text-[16px] font-semibold flex-[0_0_auto]"
                aria-hidden="true"
              >
                {tx(s(v.c?.ini))}
              </div>
              <div className="flex-auto min-w-0">
                <div className="gap-2.5 flex items-center">
                  <h2 className="m-0 text-[20px] font-semibold leading-[28px]">{tx(s(v.c?.name))}</h2>
                  <span className="chip" style={sx(s(v.c?.chip))}>
                    {tx(s(v.c?.st))}
                  </span>
                </div>
                <div className="mt-0.5 text-[13px] text-muted">
                  <span className="mono text-ink">{tx(s(v.c?.code))}</span> {tx(`· ${s(v.c?.ctryName)} · LMS CMD ref`)}{' '}
                  <span className="mono">{tx(s(v.c?.ref))}</span>
                </div>
              </div>
              <div className="gap-8 flex flex-[0_0_auto]">
                <div className="gap-0.5 flex flex-col">
                  <span className="text-[12px] text-muted">{t('Credit terms')}</span>
                  <span className="font-medium">{tx(s(v.c?.terms))}</span>
                </div>
                <div className="gap-0.5 flex flex-col">
                  <span className="text-[12px] text-muted">{t('Default billing party')}</span>
                  <span className="font-medium">{tx(s(v.c?.defParty))}</span>
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
            {v.c?.flag ? (
              <>
                <div
                  className="py-0 px-3.5 mt-0 mb-4 mx-7 gap-2.5 flex items-center min-h-10 rounded-[8px] bg-badbg border border-badbd text-bad font-medium"
                  role="status"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v6M12 16.5v.5" />
                  </svg>
                  {tx(`Sanction / Blacklist status: ${s(v.c?.st)}`)}
                </div>
              </>
            ) : null}
            <div className="r-wrap py-0 px-7 gap-7 flex border-b border-b-line" role="tablist" aria-label={t('Customer sections')}>
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
              {v.tab1 ? (
                <>
                  <div className="cols">
                    <div className="col">
                      <h3 className="sech">{t('Identity')}</h3>
                      <div className="row">
                        <span className="l">{t('Customer code')}</span>
                        <span className="v mono">{tx(s(v.c?.code))}</span>
                      </div>
                      <div className="row">
                        <span className="l">{t('Customer name')}</span>
                        <span className="v">{tx(s(v.c?.name))}</span>
                      </div>
                      <div className="row">
                        <span className="l">{t('Legal entity name')}</span>
                        <span className="v">{tx(s(v.grp?.legal))}</span>
                      </div>
                      <div className="row">
                        <span className="l">{t('Registration / Tax ID')}</span>
                        <span className="v mono">{tx(s(v.c?.tax))}</span>
                      </div>
                      <div className="row">
                        <span className="l">{t('LMS CMD reference')}</span>
                        <span className="v mono">{tx(s(v.c?.ref))}</span>
                      </div>
                    </div>
                    <div className="col">
                      <h3 className="sech">{t('Contact')}</h3>
                      <div className="row">
                        <span className="l">{t('Email')}</span>
                        <span className="v">{tx(s(v.c?.email))}</span>
                      </div>
                      <div className="row">
                        <span className="l">{t('Address details')}</span>
                        <span className="v">{tx(s(v.c?.addr))}</span>
                      </div>
                    </div>
                    <div className="col">
                      <h3 className="sech">{t('Terms & compliance')}</h3>
                      <div className="row">
                        <span className="l">{t('Credit terms')}</span>
                        <span className="v">{tx(s(v.c?.terms))}</span>
                      </div>
                      <div className="row">
                        <span className="l">{t('Parent customer group')}</span>
                        <span className="v">{tx(s(v.grp?.name))}</span>
                      </div>
                      <div className="row">
                        <span className="l">{t('Sanction / Blacklist status')}</span>
                        <span className="v">
                          <span className="chip" style={sx(s(v.c?.chip))}>
                            {tx(s(v.c?.st))}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
              {v.tab2 ? (
                <>
                  <div className="card overflow-hidden">
                    <table>
                      <thead>
                        <tr>
                          <th>{t('Country')}</th>
                          <th>{t('Billing party')}</th>
                          <th>{t('Customer code')}</th>
                          <th>{t('Default')}</th>
                          <th>{t('Default set by')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(v.parties || []).map((b, $index) => (
                          <Fragment key={$index}>
                            <tr>
                              <td>{tx(s(b?.ctry))}</td>
                              <td>{tx(s(b?.name))}</td>
                              <td className="mono">{tx(s(b?.code))}</td>
                              <td>
                                {b?.isDef ? (
                                  <>
                                    <span className="chip bg-tint text-accent2">{t('Default')}</span>
                                  </>
                                ) : null}
                              </td>
                              <td className="text-muted">{tx(s(b?.src))}</td>
                            </tr>
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : null}
              {v.tab3 ? (
                <>
                  <div className="g3">
                    <div>
                      <span className="l">{t('Invoicing arrangement')}</span>
                      <span className="v">
                        <span className="chip" style={sx(s(v.grp?.arrChip))}>
                          {tx(s(v.grp?.arr))}
                        </span>
                      </span>
                    </div>
                    <div>
                      <span className="l">{t('Default billing party')}</span>
                      <span className="v">{tx(s(v.c?.defParty))}</span>
                    </div>
                    <div>
                      <span className="l">{t('Customer-specific rules')}</span>
                      <span className="v ph">{t('[Customer-specific billing configuration]')}</span>
                    </div>
                  </div>
                </>
              ) : null}
              {v.tab4 ? (
                <>
                  <div className="g3">
                    <div>
                      <span className="l">{t('Document / data delivery')}</span>
                      <span className="v gap-1.5 flex">
                        <span className="chip" style={sx(s(v.pdfChip))}>
                          {t('PDF')}
                        </span>
                        <span className="chip" style={sx(s(v.jsonChip))}>
                          {t('JSON')}
                        </span>
                      </span>
                    </div>
                    <div>
                      <span className="l">{t('Delivery to')}</span>
                      <span className="v">{tx(s(v.c?.email))}</span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </ScreenTemplate>
  );
}
