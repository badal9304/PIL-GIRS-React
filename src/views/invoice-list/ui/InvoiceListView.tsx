'use client';

import { Fragment, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/compositions/app-header';
import { ExportMenu } from '@/compositions/export-menu';
import type { InvoiceListVals } from '@/features/invoice-management';
import { usePhrase } from '@/shared/hooks/usePhrase';
import { a, aria, b, clk, s, sx } from '@/shared/lib/bindings';
import { AppLink, ScreenTemplate } from '@/shared/ui';

/* Invoice List screen.
   Markup ported from the GIRS prototype; values and handlers come from the screen model (v). */
export function InvoiceListScreen({ v }: { v: InvoiceListVals }): ReactNode {
  const { t } = useTranslation('invoices');
  const { tx, tp } = usePhrase();
  return (
    <ScreenTemplate
      topBar={<AppHeader />}
      header={
        <div className="ghead py-2 px-5 min-h-14 flex-none flex flex-wrap items-center justify-between gap-y-2 gap-x-6 bg-surface border-b border-b-line box-border">
          <div className="min-w-0">
            <h1 className="m-0 text-[17px] font-semibold leading-[22px]">{t('Invoice List')}</h1>
            <p className="m-0 text-[12px] leading-[16px] text-muted">
              {t('Rule-driven invoicing automation using LMS booking, B/L and container data')}
            </p>
          </div>
          <div className="gright gap-2.5 flex flex-wrap items-center justify-end ms-auto">
            <span className="chip bg-warnbg text-warn h-8 rounded-[6px]">{t('Sample values')}</span>
            <ExportMenu />
            <AppLink href="credit-notes.html" className="btn no-underline">
              {t('Raise credit note')}
            </AppLink>
            <button className="btn btn-primary" onClick={clk(v.manual)}>
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
              {t('Manual invoice')}
            </button>
          </div>
        </div>
      }
    >
      <div className="tabs" role="tablist" aria-label={t('Invoice List views')}>
        {(v.tabs || []).map((t, $index) => (
          <Fragment key={$index}>
            <button className="tabb" role="tab" aria-selected={aria(t?.on)} onClick={clk(t?.pick)}>
              {tx(s(t?.label))}
              <span className="cnt mono">{tx(s(t?.n))}</span>
            </button>
          </Fragment>
        ))}
      </div>
      {v.tabInv ? (
        <>
          <div className="ftb">
            <input
              className="input r-w ph-trunc w-65 flex-none"
              placeholder={t('Search any value in the table')}
              title={tp(
                'Search any value in the table: invoice no., status, e-Invoice, GFS status, customer, invoice type, B/L, vessel/voyage, amount, currency, due date',
              )}
              value={s(v.q)}
              aria-label={t('Search invoices')}
              onChange={v.onQ}
            />
            <div className="ftb-p">
              {(v.fsel || []).map((x, $index) => (
                <Fragment key={$index}>
                  <div className="fq">
                    <button
                      className="fq-b"
                      aria-haspopup="listbox"
                      aria-expanded={aria(x?.openA)}
                      aria-label={tp(s(x?.aria))}
                      title={tp(s(x?.tip))}
                      style={sx(s(x?.bst))}
                      onClick={clk(x?.toggle)}
                    >
                      <span className="fq-t">{tx(s(x?.text))}</span>
                      {x?.hasN ? (
                        <>
                          <span className="count on">{tx(s(x?.n))}</span>
                        </>
                      ) : null}
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
                    {x?.open ? (
                      <>
                        <button className="mback" tabIndex={-1} aria-label={t('Close filter')} onClick={clk(v.closeFs)} />
                        <div className="msel-p" role="listbox" aria-multiselectable="true" aria-label={tp(s(x?.label))}>
                          {(x?.items || []).map((o, $index) => (
                            <Fragment key={$index}>
                              <label className="msel-o" role="option" aria-selected={aria(o?.on)}>
                                <input type="checkbox" checked={b(o?.on)} onChange={o?.flip} />
                                <span>{tx(s(o?.v))}</span>
                                <span className="mono mu">{tx(s(o?.n))}</span>
                              </label>
                            </Fragment>
                          ))}
                          <div className="msel-f">
                            <button className="btn btn-sm" disabled={b(x?.none)} onClick={clk(x?.clear)}>
                              {t('Clear')}
                            </button>
                            <button className="btn btn-sm btn-primary" onClick={clk(x?.done)}>
                              {t('Done')}
                            </button>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                </Fragment>
              ))}
              {v.filtered ? (
                <>
                  <button className="lnk whitespace-nowrap h-8" onClick={clk(v.clearF)}>
                    {t('Clear all')}
                  </button>
                </>
              ) : null}
            </div>
            <div className="relative flex-none">
              <svg
                className="absolute start-2.5 top-1/2 -mt-2 pointer-events-none text-muted"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 4v16M4 17l3 3 3-3M17 20V4M14 7l3-3 3 3" />
              </svg>
              <select
                className="select r-w w-45 ps-8.5 whitespace-nowrap overflow-hidden text-ellipsis"
                aria-label={t('Sort')}
                title={t('Sort')}
                value={s(v.sortSel?.val)}
                onChange={v.sortSel?.on}
              >
                {(v.sortSel?.opts || []).map((o, $index) => (
                  <Fragment key={$index}>
                    <option value={a(o?.v)}>{tx(s(o?.label))}</option>
                  </Fragment>
                ))}
              </select>
              <svg
                className="absolute end-2.5 top-1/2 -mt-2 pointer-events-none text-muted"
                width="16"
                height="16"
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
            </div>
            <div className="fq flex-none">
              <button
                className="btn cols-b"
                aria-haspopup="dialog"
                aria-expanded={aria(v.colsOpen)}
                title={t('Show or hide table columns')}
                onClick={clk(v.colsToggle)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3.5" y="4" width="17" height="16" rx="1.5" />
                  <path d="M9.5 4v16M14.5 4v16" />
                </svg>
                <span>{t('Columns')}</span>
                <span className="count on">{tx(s(v.colsN))}</span>
              </button>
              {v.colsOpen ? (
                <>
                  <button className="mback" tabIndex={-1} aria-label={t('Close columns')} onClick={clk(v.colsCancel)} />
                  <div className="msel-p cols-p" role="dialog" aria-label={t('Columns')}>
                    <div className="cols-h">
                      <span>{t('Columns')}</span>
                      <span className="mu">{tx(s(v.colsDN))}</span>
                    </div>
                    <div className="cols-s">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="11" cy="11" r="7" />
                        <path d="M20 20l-3.5-3.5" />
                      </svg>
                      <input
                        className="input cols-q"
                        placeholder={t('Search columns')}
                        aria-label={t('Search columns')}
                        value={s(v.colsQ)}
                        onChange={v.colsOnQ}
                      />
                      {v.colsHasQ ? (
                        <>
                          <button className="cols-x" aria-label={t('Clear search')} onClick={clk(v.colsClrQ)}>
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              aria-hidden="true"
                            >
                              <path d="M6 6l12 12M18 6L6 18" />
                            </svg>
                          </button>
                        </>
                      ) : null}
                    </div>
                    {v.colsNoQ ? (
                      <>
                        <label className="msel-o">
                          <input type="checkbox" checked={b(v.colsAll)} onChange={v.colsAllFlip} />
                          <span className="font-semibold">{t('Select all')}</span>
                        </label>
                      </>
                    ) : null}
                    <div className="cols-l">
                      {(v.colsList || []).map((c, $index) => (
                        <Fragment key={$index}>
                          <label className="msel-o" title={tp(s(c?.tip))}>
                            <input type="checkbox" checked={b(c?.on)} disabled={b(c?.lock)} onChange={c?.flip} />
                            <span>{tx(s(c?.label))}</span>
                          </label>
                        </Fragment>
                      ))}
                      {v.colsNone ? (
                        <>
                          <div className="mu p-4 text-[13px] text-center">{t('No columns match')}</div>
                        </>
                      ) : null}
                    </div>
                    <div className="msel-f">
                      <button className="btn btn-sm" disabled={b(v.colsIsDef)} onClick={clk(v.colsReset)}>
                        {t('Reset to default')}
                      </button>
                      <button className="btn btn-sm btn-primary" onClick={clk(v.colsDone)}>
                        {t('Done')}
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
          {v.hasSel ? (
            <>
              <div className="bulk" role="region" aria-label={t('Bulk actions')}>
                <span>{tx(s(v.selText))}</span>
                {v.canSelAll ? (
                  <>
                    <button className="lnk" onClick={clk(v.selAll)}>
                      {tx(s(v.selAllText))}
                    </button>
                  </>
                ) : null}
                <button className="btn btn-sm" onClick={clk(v.bulkDownload)}>
                  {t('Download PDF / JSON')}
                </button>{' '}
                <button className="btn btn-sm" onClick={clk(v.bulkMail)}>
                  {t('e-Mail / Post')}
                </button>{' '}
                <button className="btn btn-sm ms-auto" onClick={clk(v.clearSel)}>
                  {t('Clear selection')}
                </button>
              </div>
            </>
          ) : null}
          <section className="card flex-auto min-h-0 overflow-auto">
            <table className="lst">
              <thead className="sticky top-0 z-2">
                <tr>
                  <th className="c-sel">
                    <input
                      type="checkbox"
                      className="cbx"
                      aria-label={t('Select all invoices')}
                      checked={b(v.allOn)}
                      onChange={v.toggleAll}
                    />
                  </th>
                  <th className="c-no">{t('Invoice No.')}</th>
                  {v.cv?.st2 ? (
                    <>
                      <th>{t('Invoice Status')}</th>
                    </>
                  ) : null}
                  {v.cv?.einv ? (
                    <>
                      <th>{t('e-Invoice')}</th>
                    </>
                  ) : null}
                  {v.cv?.gfs ? (
                    <>
                      <th>{t('GFS Status')}</th>
                    </>
                  ) : null}
                  {v.cv?.pay ? (
                    <>
                      <th>{t('Payment Status')}</th>
                    </>
                  ) : null}
                  {v.cv?.party ? (
                    <>
                      <th>{t('Customer (Billing Party)')}</th>
                    </>
                  ) : null}
                  {v.cv?.cust ? (
                    <>
                      <th>{t('Customer Code')}</th>
                    </>
                  ) : null}
                  {v.cv?.type ? (
                    <>
                      <th>{t('Invoice Type')}</th>
                    </>
                  ) : null}
                  {v.cv?.bkg ? (
                    <>
                      <th>{t('Booking No.')}</th>
                    </>
                  ) : null}
                  {v.cv?.bl ? (
                    <>
                      <th>{t('B/L No.')}</th>
                    </>
                  ) : null}
                  {v.cv?.cntr ? (
                    <>
                      <th>{t('Container No.')}</th>
                    </>
                  ) : null}
                  {v.cv?.vvd ? (
                    <>
                      <th>{t('Vessel/Voyage')}</th>
                    </>
                  ) : null}
                  {v.cv?.chg ? (
                    <>
                      <th>{t('Charge Code')}</th>
                    </>
                  ) : null}
                  {v.cv?.camt ? (
                    <>
                      <th className="num">{t('Charge Amount')}</th>
                    </>
                  ) : null}
                  {v.cv?.amt ? (
                    <>
                      <th className="num">{t('Invoice Amount')}</th>
                    </>
                  ) : null}
                  {v.cv?.cur ? (
                    <>
                      <th>{t('Currency')}</th>
                    </>
                  ) : null}
                  {v.cv?.roe ? (
                    <>
                      <th>{t('ROE')}</th>
                    </>
                  ) : null}
                  {v.cv?.tax ? (
                    <>
                      <th>{t('Tax Code')}</th>
                    </>
                  ) : null}
                  {v.cv?.due ? (
                    <>
                      <th>{t('Due Date')}</th>
                    </>
                  ) : null}
                  {v.cv?.gov ? (
                    <>
                      <th>{t('Govt. Reference')}</th>
                    </>
                  ) : null}
                  {v.cv?.files ? (
                    <>
                      <th>{t('PDF/JSON Link')}</th>
                    </>
                  ) : null}
                  {v.cv?.audit ? (
                    <>
                      <th>{t('Audit ID')}</th>
                    </>
                  ) : null}
                  <th className="c-act w-18">{t('Action')}</th>
                </tr>
              </thead>
              <tbody>
                {(v.invs || []).map((i, $index) => (
                  <Fragment key={$index}>
                    <tr className={`grp ${s(i?.rowCls)}`}>
                      <td className="c-sel">
                        <input
                          type="checkbox"
                          className="cbx"
                          aria-label={tp(`Select ${s(i?.no)}`)}
                          checked={b(i?.on)}
                          onChange={i?.toggle}
                        />
                      </td>
                      <td className="c-no">
                        <button className="lnk mono" onClick={clk(i?.details)}>
                          {tx(s(i?.no))}
                        </button>
                      </td>
                      {v.cv?.st2 ? (
                        <>
                          <td>
                            <span className="chip" style={sx(s(i?.st2Pill))}>
                              {tx(s(i?.st2))}
                            </span>
                          </td>
                        </>
                      ) : null}
                      {v.cv?.einv ? (
                        <>
                          <td>
                            <span className="chip" style={sx(s(i?.einvPill))}>
                              {tx(s(i?.einv))}
                            </span>
                          </td>
                        </>
                      ) : null}
                      {v.cv?.gfs ? (
                        <>
                          <td>
                            <span className="chip" style={sx(s(i?.gfsPill))}>
                              {tx(s(i?.gfs))}
                            </span>
                          </td>
                        </>
                      ) : null}
                      {v.cv?.pay ? (
                        <>
                          <td>
                            <span className="chip" style={sx(s(i?.payPill))}>
                              {tx(s(i?.pay))}
                            </span>
                          </td>
                        </>
                      ) : null}
                      {v.cv?.party ? (
                        <>
                          <td>{tx(s(i?.party))}</td>
                        </>
                      ) : null}
                      {v.cv?.cust ? (
                        <>
                          <td className="mono">{tx(s(i?.cust))}</td>
                        </>
                      ) : null}
                      {v.cv?.type ? (
                        <>
                          <td>{tx(s(i?.type))}</td>
                        </>
                      ) : null}
                      {v.cv?.bkg ? (
                        <>
                          <td className="mono">{tx(s(i?.bkg))}</td>
                        </>
                      ) : null}
                      {v.cv?.bl ? (
                        <>
                          <td className="mono">{tx(s(i?.bl))}</td>
                        </>
                      ) : null}
                      {v.cv?.cntr ? (
                        <>
                          <td className="mono">{tx(s(i?.cntr))}</td>
                        </>
                      ) : null}
                      {v.cv?.vvd ? (
                        <>
                          <td>{tx(s(i?.vvd))}</td>
                        </>
                      ) : null}
                      {v.cv?.chg ? (
                        <>
                          <td className="mono">{tx(s(i?.chg))}</td>
                        </>
                      ) : null}
                      {v.cv?.camt ? (
                        <>
                          <td className="mono num">
                            <span className="stack">
                              {(i?.amts || []).map((a, $index) => (
                                <Fragment key={$index}>
                                  <span>{tx(`${s(a?.v)} ${s(a?.c)}`)}</span>
                                </Fragment>
                              ))}
                            </span>
                          </td>
                        </>
                      ) : null}
                      {v.cv?.amt ? (
                        <>
                          <td className="mono num font-semibold">{tx(s(i?.amtMain))}</td>
                        </>
                      ) : null}
                      {v.cv?.cur ? (
                        <>
                          <td className="mono">{tx(s(i?.curMain))}</td>
                        </>
                      ) : null}
                      {v.cv?.roe ? (
                        <>
                          <td className="mono" style={sx(s(i?.roeSt))}>
                            {tx(s(i?.roe))}
                          </td>
                        </>
                      ) : null}
                      {v.cv?.tax ? (
                        <>
                          <td className="mono">{tx(s(i?.tax))}</td>
                        </>
                      ) : null}
                      {v.cv?.due ? (
                        <>
                          <td style={sx(s(i?.dueSt))}>{tx(s(i?.due))}</td>
                        </>
                      ) : null}
                      {v.cv?.gov ? (
                        <>
                          <td className="mono" style={sx(s(i?.govSt))}>
                            {tx(s(i?.gov))}
                          </td>
                        </>
                      ) : null}
                      {v.cv?.files ? (
                        <>
                          <td>
                            {i?.hasPdf ? (
                              <>
                                <button className="lnk" onClick={clk(i?.pdf)}>
                                  {t('PDF')}
                                </button>
                              </>
                            ) : null}
                            {i?.hasJson ? (
                              <>
                                <span className="mu py-0 px-1.5">{t('·')}</span>
                                <button className="lnk" onClick={clk(i?.json)}>
                                  {t('JSON')}
                                </button>
                              </>
                            ) : null}
                            {i?.noFile ? (
                              <>
                                <span className="mu">{t('—')}</span>
                              </>
                            ) : null}
                          </td>
                        </>
                      ) : null}
                      {v.cv?.audit ? (
                        <>
                          <td className="mono">{tx(s(i?.audit))}</td>
                        </>
                      ) : null}
                      <td className="c-act">
                        <button
                          className="dots"
                          aria-label={tp(`Actions for ${s(i?.no)}`)}
                          aria-haspopup="menu"
                          aria-expanded={aria(i?.menuOpen)}
                          onClick={clk(i?.openMenu)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <circle cx="12" cy="5" r="1.8" />
                            <circle cx="12" cy="12" r="1.8" />
                            <circle cx="12" cy="19" r="1.8" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
            {v.invEmpty ? (
              <>
                <div className="p-10 text-center text-muted">{t('No invoices match these filters')}</div>
              </>
            ) : null}
          </section>
          <div className="pager" role="navigation" aria-label={t('Pages')}>
            <span>{tx(s(v.pInv?.text))}</span>
            <span className="gap-1.5 ms-auto inline-flex items-center">
              <span className="mu text-[12px]">{t('Rows per page')}</span>
              <div className="relative">
                <select className="select select-sm w-19" aria-label={t('Rows per page')} value={s(v.pInv?.size)} onChange={v.pInv?.onSize}>
                  {(v.pInv?.sizes || []).map((z, $index) => (
                    <Fragment key={$index}>
                      <option value={a(z)}>{tx(s(z))}</option>
                    </Fragment>
                  ))}
                </select>
                <svg
                  className="absolute end-2.5 top-1/2 -mt-2 pointer-events-none text-muted"
                  width="16"
                  height="16"
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
              </div>
              <button className="btn btn-sm pbtn" aria-label={t('First page')} disabled={b(v.pInv?.firstDis)} onClick={clk(v.pInv?.first)}>
                {t('«')}
              </button>
              <button className="btn btn-sm pbtn" aria-label={t('Previous page')} disabled={b(v.pInv?.prevDis)} onClick={clk(v.pInv?.prev)}>
                {t('‹')}
              </button>
              <span className="mono text-[13px] min-w-16 text-center">{tx(s(v.pInv?.pos))}</span>
              <button className="btn btn-sm pbtn" aria-label={t('Next page')} disabled={b(v.pInv?.nextDis)} onClick={clk(v.pInv?.next)}>
                {t('›')}
              </button>
              <button className="btn btn-sm pbtn" aria-label={t('Last page')} disabled={b(v.pInv?.lastDis)} onClick={clk(v.pInv?.last)}>
                {t('»')}
              </button>
            </span>
          </div>
        </>
      ) : null}
      {v.tabReady ? (
        <>
          {v.readyListOn ? (
            <>
              <div className="gap-3 flex items-end">
                <label className="flab">
                  {t('Period')}
                  <input className="input r-w w-45" type="date" value={s(v.period)} onChange={v.onPeriod} />
                </label>
                <label className="flab">
                  {t('Port')}
                  <div className="relative">
                    <select className="select r-w w-50" value={s(v.rPort)} onChange={v.onPort}>
                      <option value="">{t('All ports')}</option>
                      {(v.ports || []).map((o, $index) => (
                        <Fragment key={$index}>
                          <option value={a(o)}>{tx(s(o))}</option>
                        </Fragment>
                      ))}
                    </select>
                    <svg
                      className="absolute end-2.5 top-1/2 -mt-2 pointer-events-none text-muted"
                      width="16"
                      height="16"
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
                  </div>
                </label>
                <label className="flab">
                  {t('Process')}
                  <div className="relative">
                    <select className="select r-w w-50" value={s(v.rProc)} onChange={v.onProc}>
                      <option value="">{t('All')}</option>
                      {(v.procs || []).map((o, $index) => (
                        <Fragment key={$index}>
                          <option value={a(o)}>{tx(s(o))}</option>
                        </Fragment>
                      ))}
                    </select>
                    <svg
                      className="absolute end-2.5 top-1/2 -mt-2 pointer-events-none text-muted"
                      width="16"
                      height="16"
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
                  </div>
                </label>
                {v.rFiltered ? (
                  <>
                    <button className="lnk h-9" onClick={clk(v.resetR)}>
                      {t('Reset filters')}
                    </button>
                  </>
                ) : null}
                <span className="ms-auto text-[13px] text-muted h-9 inline-flex items-center">
                  {t('Country and entity follow the selection in the top bar')}
                </span>
              </div>
              <div className="r-wrap gap-4 flex">
                {(v.kpis || []).map((k, $index) => (
                  <Fragment key={$index}>
                    <button className="kpi" aria-pressed={aria(k?.on)} onClick={clk(k?.pick)}>
                      <span className="kl">
                        <i className="w-2 h-2 rounded-full" style={sx(`background: ${s(k?.color)}`)} />
                        {tx(s(k?.label))}
                      </span>
                      <span className="kv mono">{tx(s(k?.n))}</span>
                    </button>
                  </Fragment>
                ))}
              </div>
              <section className="card flex-auto min-h-0 overflow-auto">
                <table className="lst">
                  <thead className="sticky top-0 z-2">
                    <tr>
                      <th className="c-sel">
                        <input
                          type="checkbox"
                          className="cbx"
                          aria-label={t('Select all selectable B/Ls')}
                          checked={b(v.rAllOn)}
                          onChange={v.rToggleAll}
                        />
                      </th>
                      <th>{t('B/L No.')}</th>
                      <th>{t('Booking')}</th>
                      <th>{t('Customer')}</th>
                      <th>{t('Port')}</th>
                      <th>{t('Process')}</th>
                      <th className="num">{t('Amount')}</th>
                      <th>{t('Status')}</th>
                      <th className="w-12">
                        <span className="sr">{t('Details')}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(v.ready || []).map((r, $index) => (
                      <Fragment key={$index}>
                        <tr className={`grp ${s(r?.rowCls)}`}>
                          <td className="c-sel">
                            <input
                              type="checkbox"
                              className="cbx"
                              aria-label={tp(`Select ${s(r?.bl)}`)}
                              checked={b(r?.on)}
                              disabled={b(r?.lock)}
                              title={tp(s(r?.lockTip))}
                              onChange={r?.toggle}
                            />
                          </td>
                          <td>
                            <button className="lnk mono" onClick={clk(r?.review)}>
                              {tx(s(r?.bl))}
                            </button>
                          </td>
                          <td className="mono">{tx(s(r?.bkg))}</td>
                          <td>
                            {tx(s(r?.name))} <span className="mono mu text-[12px]">{tx(s(r?.cust))}</span>
                          </td>
                          <td>{tx(s(r?.port))}</td>
                          <td>{tx(s(r?.type))}</td>
                          <td className="mono num font-semibold">{tx(`${s(r?.amt)} ${s(r?.cur)}`)}</td>
                          <td>
                            <span className="chip" style={sx(s(r?.pill))}>
                              {tx(s(r?.status))}
                            </span>
                          </td>
                          <td className="text-center">
                            <button
                              className="ex m-0"
                              aria-expanded={aria(r?.open)}
                              aria-label={tp(`Validation of ${s(r?.bl)}`)}
                              onClick={clk(r?.expand)}
                            >
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
                                <path d="M9 6l6 6-6 6" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                        {r?.open ? (
                          <>
                            <tr className="xrow">
                              <td colSpan={9}>
                                <div className="xbox">
                                  <div className="gap-3 flex flex-col flex-auto min-w-0">
                                    {r?.hasMsg ? (
                                      <>
                                        <div className={`banner ${s(r?.bcls)}`}>{tx(`${s(r?.status)}: ${s(r?.msg)}`)}</div>
                                      </>
                                    ) : null}
                                    <div className="chk">
                                      {(r?.checks || []).map((c, $index) => (
                                        <Fragment key={$index}>
                                          <span className="font-medium">{tx(s(c?.k))}</span>
                                          <span style={sx(`color: ${s(c?.color)}`)}>
                                            {c?.ok ? (
                                              <>
                                                <svg
                                                  width="16"
                                                  height="16"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  aria-hidden="true"
                                                >
                                                  <circle cx="12" cy="12" r="9" />
                                                  <path d="M8 12.5l2.5 2.5L16 9.5" />
                                                </svg>
                                              </>
                                            ) : null}
                                            {c?.warn ? (
                                              <>
                                                <svg
                                                  width="16"
                                                  height="16"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  aria-hidden="true"
                                                >
                                                  <path d="M12 3l9.5 17h-19z" />
                                                  <path d="M12 10v4" />
                                                  <path d="M12 17.5v.01" />
                                                </svg>
                                              </>
                                            ) : null}
                                            {c?.block ? (
                                              <>
                                                <svg
                                                  width="16"
                                                  height="16"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  aria-hidden="true"
                                                >
                                                  <circle cx="12" cy="12" r="9" />
                                                  <path d="M5.6 5.6l12.8 12.8" />
                                                </svg>
                                              </>
                                            ) : null}
                                            {tx(s(c?.v))}
                                          </span>
                                        </Fragment>
                                      ))}
                                    </div>
                                  </div>
                                  <button className="btn btn-primary flex-none" onClick={clk(r?.review)}>
                                    {t('Open details')}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          </>
                        ) : null}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
                {v.readyEmpty ? (
                  <>
                    <div className="p-10 text-center text-muted">{tx(s(v.readyEmptyText))}</div>
                  </>
                ) : null}
              </section>
              <div className="pager" role="navigation" aria-label={t('Pages')}>
                <span>{tx(s(v.pRdy?.text))}</span>
                <span className="gap-1.5 ms-auto inline-flex items-center">
                  <span className="mu text-[12px]">{t('Rows per page')}</span>
                  <div className="relative">
                    <select
                      className="select select-sm w-19"
                      aria-label={t('Rows per page')}
                      value={s(v.pRdy?.size)}
                      onChange={v.pRdy?.onSize}
                    >
                      {(v.pRdy?.sizes || []).map((z, $index) => (
                        <Fragment key={$index}>
                          <option value={a(z)}>{tx(s(z))}</option>
                        </Fragment>
                      ))}
                    </select>
                    <svg
                      className="absolute end-2.5 top-1/2 -mt-2 pointer-events-none text-muted"
                      width="16"
                      height="16"
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
                  </div>
                  <button
                    className="btn btn-sm pbtn"
                    aria-label={t('First page')}
                    disabled={b(v.pRdy?.firstDis)}
                    onClick={clk(v.pRdy?.first)}
                  >
                    {t('«')}
                  </button>
                  <button
                    className="btn btn-sm pbtn"
                    aria-label={t('Previous page')}
                    disabled={b(v.pRdy?.prevDis)}
                    onClick={clk(v.pRdy?.prev)}
                  >
                    {t('‹')}
                  </button>
                  <span className="mono text-[13px] min-w-16 text-center">{tx(s(v.pRdy?.pos))}</span>
                  <button className="btn btn-sm pbtn" aria-label={t('Next page')} disabled={b(v.pRdy?.nextDis)} onClick={clk(v.pRdy?.next)}>
                    {t('›')}
                  </button>
                  <button className="btn btn-sm pbtn" aria-label={t('Last page')} disabled={b(v.pRdy?.lastDis)} onClick={clk(v.pRdy?.last)}>
                    {t('»')}
                  </button>
                </span>
              </div>
              <div className="gap-3 flex items-center">
                <button className="btn" disabled={b(v.noRSel)} onClick={clk(v.reviewSel)}>
                  {t('Review selected')}
                  {v.hasRSel ? <> {tx(`(${s(v.rSelN)})`)}</> : null}
                </button>
                <button className="btn btn-primary" disabled={b(v.genDis)} onClick={clk(v.genSel)}>
                  {t('Generate')}
                  {v.hasRSel ? <> {tx(`(${s(v.rSelN)})`)}</> : null}
                </button>
                <span className="text-[13px] text-muted">{tx(s(v.genHint))}</span>
              </div>
            </>
          ) : null}
          {v.inReview ? (
            <>
              <div className="gap-3 flex items-center">
                <button className="btn btn-sm" onClick={clk(v.backToList)}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M15 6l-6 6 6 6" />
                  </svg>
                  {t('Back to Ready to invoice')}
                </button>
                <span className="text-[13px] text-muted">{t('Final validation and preview before invoice creation')}</span>
                <span className="gap-2.5 ms-auto inline-flex items-center">
                  <button className="lnk" onClick={clk(v.viewRoe)}>
                    {t('View ROE')}
                  </button>
                  <button className="btn btn-sm" onClick={clk(v.viewSrc)}>
                    {t('View source charges')}
                  </button>
                  <button className="btn btn-sm" onClick={clk(v.viewCtx)}>
                    {t('View audit context')}
                  </button>
                </span>
                {v.rvMany ? (
                  <>
                    <span className="gap-2 inline-flex items-center">
                      <button className="btn btn-sm" disabled={b(v.rvFirst)} onClick={clk(v.rvPrev)}>
                        {t('Previous')}
                      </button>
                      <span className="mono text-[13px]">{tx(s(v.rvPos))}</span>
                      <button className="btn btn-sm" disabled={b(v.rvLast)} onClick={clk(v.rvNext)}>
                        {t('Next')}
                      </button>
                    </span>
                  </>
                ) : null}
              </div>
              <div className="flex-auto min-h-0 overflow-auto">
                <section className="card ri" aria-label={t('Ready to invoice')}>
                  <div className="ri-hd">
                    <h1>
                      {t('READY TO INVOICE')}
                      {v.rv?.hasErr ? (
                        <>
                          {' '}
                          <span className="ri-err">{t('(Error)')}</span>
                        </>
                      ) : null}
                    </h1>
                    <div className="ri-sub">
                      <span className="mu">{t('Transaction Name:')}</span> <b>{tx(s(v.rv?.txn))}</b>
                    </div>
                  </div>
                  {v.rv?.hasErr ? (
                    <>
                      <div className="ri-errs" role="alert">
                        <b>{tx(s(v.rv?.errTitle))}</b>
                        <ul>
                          {(v.rv?.errs || []).map((e, $index) => (
                            <Fragment key={$index}>
                              <li>
                                <span className="mu">{tx(`${s(e?.area)} ·`)}</span> {tx(s(e?.text))}
                              </li>
                            </Fragment>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : null}
                  <div className="ri-strip">
                    {(v.rv?.strip || []).map((x, $index) => (
                      <Fragment key={$index}>
                        <div>
                          <div className="k">{tx(s(x?.k))}</div>
                          <div className="v">{tx(s(x?.v))}</div>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                  <div className="ri-parties">
                    <div>
                      <div className="k">{t('From')}</div>
                      <div className="n">{tx(s(v.rv?.from0))}</div>
                      {(v.rv?.fromL || []).map((l, $index) => (
                        <Fragment key={$index}>
                          <div className="l">{tx(s(l))}</div>
                        </Fragment>
                      ))}
                    </div>
                    <div>
                      <label className="k" htmlFor="ri-cust">
                        {t('To')}
                      </label>
                      <div className="ri-cb mt-1.5 max-w-90">
                        <input
                          id="ri-cust"
                          className={`input ${s(v.rv?.custCls)} w-full font-semibold`}
                          role="combobox"
                          aria-autocomplete="list"
                          aria-expanded={aria(v.rv?.cuA)}
                          aria-controls="ri-cust-l"
                          aria-activedescendant={a(v.rv?.cuAct)}
                          aria-label={t('Customer name')}
                          placeholder={t('Search customer')}
                          autoComplete="off"
                          value={s(v.rv?.cuQ)}
                          onChange={v.rv?.cuOnQ}
                          onFocus={v.rv?.cuFocus}
                          onBlur={v.rv?.cuBlur}
                          onKeyDown={v.rv?.cuKey}
                        />
                        {v.rv?.cuOpen ? (
                          <>
                            <ul className="ri-sug" role="listbox" id="ri-cust-l">
                              {(v.rv?.cuOpts || []).map((o, $index) => (
                                <Fragment key={$index}>
                                  <li role="option" id={a(o?.id)} aria-selected={aria(o?.on)} onMouseDown={o?.pick}>
                                    <span className="mono">{tx(s(o?.code))}</span>
                                    {tx(s(o?.name))}
                                  </li>
                                </Fragment>
                              ))}
                              {v.rv?.cuNone ? (
                                <>
                                  <li className="none" role="option" aria-disabled="true" aria-selected="false">
                                    {t('No matching customer')}
                                  </li>
                                </>
                              ) : null}
                            </ul>
                          </>
                        ) : null}
                      </div>
                      <div className="l mt-1.5">{tx(s(v.rv?.addr))}</div>
                    </div>
                    <div>
                      <div className="k">{t('Customer & payment')}</div>
                      <div className="ri-kv">
                        {(v.rv?.details || []).map((x, $index) => (
                          <Fragment key={$index}>
                            <span>{tx(s(x?.k))}</span>
                            <span>{tx(s(x?.v))}</span>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="ri-ship">
                    {(v.rv?.ship || []).map((x, $index) => (
                      <Fragment key={$index}>
                        <div>
                          <div className="k">{tx(s(x?.k))}</div>
                          <div className="v">{tx(s(x?.v))}</div>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                  <div>
                    <table className="ri-tbl">
                      <thead>
                        <tr>
                          <th>{t('Charge head')}</th>
                          <th className="r">{t('Quantity')}</th>
                          <th>{t('UOM')}</th>
                          <th className="r">{t('Unit Price')}</th>
                          <th>{t('Currency')}</th>
                          <th className="r">{t('Total excluding Tax')}</th>
                          <th className="r">{t('Tax applicability')}</th>
                          <th className="r">{t('Tax Amount')}</th>
                          <th className="r">{t('Total Incl Tax')}</th>
                          <th aria-label={t('Row actions')} />
                        </tr>
                      </thead>
                      <tbody>
                        {(v.rv?.lines || []).map((l, $index) => (
                          <Fragment key={$index}>
                            <tr className={a(l?.cls)}>
                              <td className="w">
                                {l?.edit ? (
                                  <>
                                    <div className="ri-cb">
                                      <input
                                        className={`input ri-in ${s(l?.hErr)} w-full`}
                                        role="combobox"
                                        aria-autocomplete="list"
                                        aria-expanded={aria(l?.sugA)}
                                        aria-controls={a(l?.lid)}
                                        aria-activedescendant={a(l?.act)}
                                        aria-label={t('Charge head')}
                                        placeholder={t('Search charge head')}
                                        autoComplete="off"
                                        value={s(l?.q)}
                                        onChange={l?.onQ}
                                        onFocus={l?.onFocus}
                                        onBlur={l?.onBlur}
                                        onKeyDown={l?.onKey}
                                      />
                                      {l?.sug ? (
                                        <>
                                          <ul className="ri-sug" role="listbox" id={a(l?.lid)}>
                                            {(l?.opts || []).map((o, $index) => (
                                              <Fragment key={$index}>
                                                <li role="option" id={a(o?.id)} aria-selected={aria(o?.on)} onMouseDown={o?.pick}>
                                                  <span className="mono">{tx(s(o?.code))}</span>
                                                  {tx(s(o?.name))}
                                                </li>
                                              </Fragment>
                                            ))}
                                            {l?.none ? (
                                              <>
                                                <li className="none" role="option" aria-disabled="true" aria-selected="false">
                                                  {t('No matching charge head')}
                                                </li>
                                              </>
                                            ) : null}
                                          </ul>
                                        </>
                                      ) : null}
                                    </div>
                                  </>
                                ) : null}
                                {l?.ro ? <>{tx(s(l?.name))}</> : null}
                              </td>
                              <td className="r">
                                {l?.edit ? (
                                  <>
                                    <input
                                      className={`input ri-in num ${s(l?.qErr)} w-18`}
                                      value={s(l?.qty)}
                                      aria-label={t('Quantity')}
                                      inputMode="decimal"
                                      onChange={l?.onQty}
                                    />
                                  </>
                                ) : null}
                                {l?.ro ? <>{tx(s(l?.qty))}</> : null}
                              </td>
                              <td>
                                {l?.edit ? (
                                  <>
                                    <div className="relative w-24">
                                      <select
                                        className={`select ri-in ${s(l?.uErr)} w-full`}
                                        value={s(l?.uom)}
                                        aria-label={t('UOM')}
                                        onChange={l?.onUom}
                                      >
                                        <option value="">{t('Select')}</option>
                                        {(v.rv?.uoms || []).map((o, $index) => (
                                          <Fragment key={$index}>
                                            <option value={a(o)}>{tx(s(o))}</option>
                                          </Fragment>
                                        ))}
                                      </select>
                                      <svg
                                        className="absolute end-2.5 top-1/2 -mt-2 pointer-events-none text-muted"
                                        width="16"
                                        height="16"
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
                                    </div>
                                  </>
                                ) : null}
                                {l?.ro ? <>{tx(s(l?.uom))}</> : null}
                              </td>
                              <td className="r">
                                {l?.edit ? (
                                  <>
                                    <input
                                      className={`input ri-in num ${s(l?.pErr)} w-26`}
                                      value={s(l?.unit)}
                                      aria-label={t('Unit Price')}
                                      inputMode="decimal"
                                      onChange={l?.onUnit}
                                    />
                                  </>
                                ) : null}
                                {l?.ro ? <>{tx(s(l?.unit))}</> : null}
                              </td>
                              <td>
                                {l?.edit ? (
                                  <>
                                    <div className="relative w-24">
                                      <select
                                        className={`select ri-in ${s(l?.cErr)} w-full`}
                                        value={s(l?.cur)}
                                        aria-label={t('Currency')}
                                        onChange={l?.onCur}
                                      >
                                        <option value="">{t('Select')}</option>
                                        {(v.rv?.curs || []).map((o, $index) => (
                                          <Fragment key={$index}>
                                            <option value={a(o)}>{tx(s(o))}</option>
                                          </Fragment>
                                        ))}
                                      </select>
                                      <svg
                                        className="absolute end-2.5 top-1/2 -mt-2 pointer-events-none text-muted"
                                        width="16"
                                        height="16"
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
                                    </div>
                                  </>
                                ) : null}
                                {l?.ro ? <>{tx(s(l?.cur))}</> : null}
                              </td>
                              <td className="r">{tx(s(l?.ex))}</td>
                              <td className="r" style={sx(s(l?.taxSt))}>
                                {tx(s(l?.taxApp))}
                              </td>
                              <td className="r">{tx(s(l?.tax))}</td>
                              <td className="r">{tx(s(l?.inc))}</td>
                              <td className="r">
                                {l?.edit ? (
                                  <>
                                    <button
                                      className="btn btn-sm ri-x"
                                      aria-label={t('Remove added charge')}
                                      title={t('Remove')}
                                      onClick={clk(l?.del)}
                                    >
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
                                        <path d="M6 6l12 12M18 6L6 18" />
                                      </svg>
                                    </button>
                                  </>
                                ) : null}
                              </td>
                            </tr>
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3">
                    <button className="btn btn-sm" onClick={clk(v.rv?.addCharge)}>
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
                      {t('Add charges')}
                    </button>
                  </div>
                  <div className="ri-bt">
                    <div>
                      <div className="k">{t('Bank details')}</div>
                      <div className="ri-kv">
                        {(v.rv?.bank || []).map((x, $index) => (
                          <Fragment key={$index}>
                            <span>{tx(s(x?.k))}</span>
                            <span>{tx(s(x?.v))}</span>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                    <div className="ri-tot">
                      {(v.rv?.totals || []).map((t, $index) => (
                        <Fragment key={$index}>
                          <div className={a(t?.cls)}>
                            <span>{tx(s(t?.k))}</span>
                            <span>{tx(s(t?.v))}</span>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                  <div className="ri-words">{tx(s(v.rv?.words))}</div>
                </section>
              </div>
              <div className="gap-3 flex flex-col pt-1">
                <label className="gap-2.5 inline-flex items-center text-[13px]">
                  <input type="checkbox" className="cbx" checked={b(v.decl)} disabled={b(v.rv?.hasErr)} onChange={v.toggleDecl} />
                  <span>
                    <b className="text-accent2">{t('Declaration:')}</b> {t('I confirm the customer, charges, currency and tax details.')}
                  </span>
                </label>
                <div className="gap-3 flex items-center">
                  <button className="btn" onClick={clk(v.rvCancel)}>
                    {t('Cancel')}
                  </button>
                  <button className="btn" onClick={clk(v.rvSave)}>
                    {t('Save')}
                  </button>
                  <button className="btn" disabled={b(v.rv?.noErr)} onClick={clk(v.rvResolve)}>
                    {t('Resolve errors')}
                  </button>
                  <button className="btn btn-primary" disabled={b(v.rvGenDis)} onClick={clk(v.rvGenerate)}>
                    {t('Generate invoice')}
                  </button>
                  <span className="text-[13px] text-muted">{tx(s(v.rvHint))}</span>
                </div>
              </div>
            </>
          ) : null}
        </>
      ) : null}
      {v.menuOn ? (
        <>
          {' '}
          <button className="mback" tabIndex={-1} aria-label={t('Close menu')} onClick={clk(v.closeMenu)} />
          <div className="amenu" role="menu" aria-label={t('Invoice actions')} style={sx(s(v.menuPos))}>
            {(v.menuItems || []).map((m, $index) => (
              <Fragment key={$index}>
                {m?.sep ? (
                  <>
                    <div className="sep" role="separator" />
                  </>
                ) : null}
                <button className={`mi ${s(m?.cls)}`} role="menuitem" disabled={b(m?.dis)} onClick={clk(m?.run)}>
                  <span>{tx(s(m?.label))}</span>
                  {m?.hasNote ? (
                    <>
                      <small>{tx(s(m?.note))}</small>
                    </>
                  ) : null}
                </button>
              </Fragment>
            ))}
          </div>
        </>
      ) : null}
      {v.dlgOn ? (
        <>
          <div className="ov" onClick={clk(v.closeDlg)} />
          <div className={`dlg ${s(v.dlgCls)}`} role="dialog" aria-modal="true" aria-label={tp(s(v.dlgTitle))}>
            {v.dConf ? (
              <>
                <div className="db conf pt-8 pb-2 px-10">
                  <div className="ic">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="5" y="4" width="14" height="17" rx="2" />
                      <path d="M9 4h6v3H9z" />
                      <path d="M9 11h6M9 15h6" />
                    </svg>
                  </div>
                  <h2 className="mt-1 mb-0 mx-0 text-[22px] leading-[28px]">{tx(s(v.dlgTitle))}</h2>
                  <p className="m-0 text-muted text-[14px]">
                    {tx(s(v.confText))}
                    <br />
                    {t('No approval workflow applies to invoice generation.')}
                  </p>
                  <div className="my-2 mx-0 self-stretch h-px bg-line2" />
                  <div className="gap-2 self-stretch text-start flex flex-col">
                    <span className="text-muted text-[14px]">{t('Where applicable:')}</span>
                    <ul>
                      <li>{t('The invoice will be submitted for e-invoice processing.')}</li>
                      <li>{t('The invoice will be sent to configured customer channels.')}</li>
                      <li>{t('The invoice will be posted to GFS.')}</li>
                    </ul>
                  </div>
                </div>
                <div className="df justify-center bg-surface border-0 pb-7">
                  <button className="btn" onClick={clk(v.closeDlg)}>
                    {t('Back')}
                  </button>
                  <button className="btn btn-primary" onClick={clk(v.doGenerate)}>
                    {t('Generate')}
                  </button>
                </div>
              </>
            ) : null}
            {v.dStd ? (
              <>
                <div className="dh">
                  <div>
                    <h2>{tx(s(v.dlgTitle))}</h2>
                    <p>{tx(s(v.dlgSub))}</p>
                  </div>
                  <button className="btn btn-sm" aria-label={t('Close')} onClick={clk(v.closeDlg)}>
                    {t('Close')}
                  </button>
                </div>
                <div className="db">
                  {v.dDetails ? (
                    <>
                      <div className="kv3">
                        {(v.det?.fields || []).map((f, $index) => (
                          <Fragment key={$index}>
                            <div>
                              <span className="l">{tx(s(f?.k))}</span>
                              <span className="v" style={sx(s(f?.st))}>
                                {tx(s(f?.v))}
                              </span>
                            </div>
                          </Fragment>
                        ))}
                      </div>
                      <table className="ctab">
                        <thead>
                          <tr>
                            <th>{t('Charge Code')}</th>
                            <th className="num">{t('Charge Amount')}</th>
                            <th>{t('Currency')}</th>
                            <th>{t('ROE')}</th>
                            <th>{t('Tax Code')}</th>
                            <th>{t('Audit ID')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(v.det?.lines || []).map((l, $index) => (
                            <Fragment key={$index}>
                              <tr>
                                <td className="mono">
                                  {tx(s(l?.chg))} <span className="mu [font-family:inherit]">{tx(`· ${s(l?.name)}`)}</span>
                                </td>
                                <td className="mono num">{tx(s(l?.amt))}</td>
                                <td className="mono">{tx(s(l?.cur))}</td>
                                <td className="mono">{tx(s(l?.roe))}</td>
                                <td className="mono">{tx(s(l?.tax))}</td>
                                <td className="mono">{tx(s(l?.audit))}</td>
                              </tr>
                            </Fragment>
                          ))}
                        </tbody>
                      </table>
                    </>
                  ) : null}
                  {v.dPrf ? (
                    <>
                      <div className="kv3">
                        {(v.prf?.rows || []).map((r, $index) => (
                          <Fragment key={$index}>
                            <div>
                              <span className="l">{tx(s(r?.k))}</span>
                              <span className="v">{tx(s(r?.v))}</span>
                            </div>
                          </Fragment>
                        ))}
                      </div>
                      <div className={`banner ${s(v.prf?.noteCls)}`}>{tx(s(v.prf?.note))}</div>
                    </>
                  ) : null}
                  {v.dGen ? (
                    <>
                      {v.gen?.hasKv ? (
                        <>
                          <div className="kv3">
                            {(v.gen?.kv || []).map((f, $index) => (
                              <Fragment key={$index}>
                                <div>
                                  <span className="l">{tx(s(f?.k))}</span>
                                  <span className="v" style={sx(s(f?.st))}>
                                    {tx(s(f?.v))}
                                  </span>
                                </div>
                              </Fragment>
                            ))}
                          </div>
                        </>
                      ) : null}
                      {v.gen?.hasForm ? (
                        <>
                          <div className="g2">
                            {(v.gen?.fields || []).map((x, $index) => (
                              <Fragment key={$index}>
                                <label className="fld" style={sx(s(x?.span))}>
                                  {tx(s(x?.label))}
                                  {x?.hasHint ? (
                                    <>
                                      {' '}
                                      <span className="hint">{tx(s(x?.hint))}</span>
                                    </>
                                  ) : null}
                                  {x?.isInput ? (
                                    <>
                                      <input className={`input ${s(x?.cls)}`} value={s(x?.val)} onChange={x?.on} />
                                    </>
                                  ) : null}
                                  {x?.isSelect ? (
                                    <>
                                      <div className="relative">
                                        <select className="select" value={s(x?.val)} onChange={x?.on}>
                                          {x?.hasPh ? (
                                            <>
                                              <option value="">{tx(s(x?.ph))}</option>
                                            </>
                                          ) : null}
                                          {(x?.opts || []).map((o, $index) => (
                                            <Fragment key={$index}>
                                              <option value={a(o?.v)}>{tx(s(o?.label))}</option>
                                            </Fragment>
                                          ))}
                                        </select>
                                        <svg
                                          className="absolute end-2.5 top-1/2 -mt-2 pointer-events-none text-muted"
                                          width="16"
                                          height="16"
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
                                      </div>
                                    </>
                                  ) : null}
                                  {x?.isText ? (
                                    <>
                                      <textarea className="input h-18 pt-2 resize-y" value={s(x?.val)} onChange={x?.on} />
                                    </>
                                  ) : null}
                                  {x?.hasErr ? (
                                    <>
                                      <span className="err">{tx(s(x?.err))}</span>
                                    </>
                                  ) : null}
                                </label>
                              </Fragment>
                            ))}
                          </div>
                        </>
                      ) : null}
                      {v.gen?.hasNote ? (
                        <>
                          <div className={`banner ${s(v.gen?.noteCls)}`}>{tx(s(v.gen?.note))}</div>
                        </>
                      ) : null}
                      {v.gen?.hasTbl ? (
                        <>
                          <span className="l text-[12px] font-semibold uppercase tracking-[.05em] text-muted">
                            {tx(s(v.gen?.tblTitle))}
                          </span>
                          <table className="at ctab">
                            <thead>
                              <tr>
                                {(v.gen?.cols || []).map((c, $index) => (
                                  <Fragment key={$index}>
                                    <th className={a(c?.cls)}>{tx(s(c?.v))}</th>
                                  </Fragment>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {(v.gen?.rows || []).map((r, $index) => (
                                <Fragment key={$index}>
                                  <tr>
                                    {(r?.cells || []).map((c, $index) => (
                                      <Fragment key={$index}>
                                        <td className={a(c?.cls)} style={sx(s(r?.st))}>
                                          {tx(s(c?.v))}
                                        </td>
                                      </Fragment>
                                    ))}
                                  </tr>
                                </Fragment>
                              ))}
                            </tbody>
                          </table>
                        </>
                      ) : null}
                      {v.gen?.empty ? (
                        <>
                          <span className="mu">{tx(s(v.gen?.emptyText))}</span>
                        </>
                      ) : null}
                    </>
                  ) : null}
                  {v.dTable ? (
                    <>
                      <table className="at ctab">
                        <thead>
                          <tr>
                            {(v.tbl?.cols || []).map((c, $index) => (
                              <Fragment key={$index}>
                                <th>{tx(s(c))}</th>
                              </Fragment>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(v.tbl?.rows || []).map((r, $index) => (
                            <Fragment key={$index}>
                              <tr>
                                {(r?.cells || []).map((c, $index) => (
                                  <Fragment key={$index}>
                                    <td className={a(c?.cls)}>{tx(s(c?.v))}</td>
                                  </Fragment>
                                ))}
                              </tr>
                            </Fragment>
                          ))}
                        </tbody>
                      </table>
                    </>
                  ) : null}
                  {v.dMail ? (
                    <>
                      <div className="fld">
                        {t('Channel')}
                        <div className="seg" role="group" aria-label={t('Channel')}>
                          {(v.chans || []).map((c, $index) => (
                            <Fragment key={$index}>
                              <button aria-pressed={aria(c?.on)} onClick={clk(c?.pick)}>
                                {tx(s(c?.label))}
                              </button>
                            </Fragment>
                          ))}
                        </div>
                      </div>
                      <label className="fld">
                        {tx(s(v.toLabel))}
                        <input className="input" value={s(v.f?.to)} onChange={v.f?.onTo} />
                        {v.f?.toErr ? (
                          <>
                            <span className="err">{tx(s(v.f?.toErrText))}</span>
                          </>
                        ) : null}
                      </label>{' '}
                      <label className="fld">
                        {t('Message')} <span className="hint">{t('Optional')}</span>
                        <textarea className="input h-20 pt-2 resize-y" value={s(v.f?.msg)} onChange={v.f?.onMsg} />
                      </label>{' '}
                      <span className="mu">{tx(`Attachments: ${s(v.attach)}`)}</span>{' '}
                    </>
                  ) : null}
                  {v.dCn ? (
                    <>
                      <div className="g2">
                        <div className="fld">
                          {t('Credit Type')}
                          <div className="seg" role="group" aria-label={t('Credit Type')}>
                            {(v.ctypes || []).map((c, $index) => (
                              <Fragment key={$index}>
                                <button aria-pressed={aria(c?.on)} onClick={clk(c?.pick)}>
                                  {tx(s(c?.label))}
                                </button>
                              </Fragment>
                            ))}
                          </div>
                        </div>
                        <label className="fld">
                          {t('Reason Code')}
                          <div className="relative">
                            <select className="select" value={s(v.f?.reason)} onChange={v.f?.onReason}>
                              <option value="">{t('Select reason')}</option>
                              {(v.reasons || []).map((o, $index) => (
                                <Fragment key={$index}>
                                  <option value={a(o)}>{tx(s(o))}</option>
                                </Fragment>
                              ))}
                            </select>
                            <svg
                              className="absolute end-2.5 top-1/2 -mt-2 pointer-events-none text-muted"
                              width="16"
                              height="16"
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
                          </div>
                          {v.f?.reasonErr ? (
                            <>
                              <span className="err">{t('Choose a reason code')}</span>
                            </>
                          ) : null}
                        </label>{' '}
                        <label className="fld">
                          {t('Credit Amount')}
                          <input className="input mono" value={s(v.f?.amount)} disabled={b(v.f?.full)} onChange={v.f?.onAmount} />
                          <span className="hint">{tx(s(v.amountHint))}</span>
                          {v.f?.amountErr ? (
                            <>
                              <span className="err">{tx(s(v.f?.amountErrText))}</span>
                            </>
                          ) : null}
                        </label>{' '}
                        <label className="fld">
                          {t('FCA/DAR Reference')} <span className="hint">{t('Required for FCA approval and DAR waiver')}</span>
                          <input className="input mono" value={s(v.f?.ref)} onChange={v.f?.onRef} />
                          {v.f?.refErr ? (
                            <>
                              <span className="err">{t('Enter the FCA or DAR reference')}</span>
                            </>
                          ) : null}
                        </label>
                      </div>
                      <div className="banner b-info">
                        {tx(
                          'Tax is reversed at the same rate as the original invoice. The credit note goes for approval before it is issued.',
                        )}
                      </div>
                    </>
                  ) : null}
                  {v.dCancel ? (
                    <>
                      <div className="banner b-warn">{tx(s(v.cancelText))}</div>
                      <label className="fld">
                        {t('Reason')}
                        <textarea className="input h-20 pt-2 resize-y" value={s(v.f?.why)} onChange={v.f?.onWhy} />
                        {v.f?.whyErr ? (
                          <>
                            <span className="err">{t('A reason is required')}</span>
                          </>
                        ) : null}
                      </label>{' '}
                    </>
                  ) : null}
                </div>
                {v.dDetails ? (
                  <>
                    <div className="df">
                      <button className="btn" aria-haspopup="menu" onClick={clk(v.det?.openMenu)}>
                        {t('All actions')}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <circle cx="12" cy="5" r="1.8" />
                          <circle cx="12" cy="12" r="1.8" />
                          <circle cx="12" cy="19" r="1.8" />
                        </svg>
                      </button>
                      {v.det?.showPrim ? (
                        <>
                          <button className="btn btn-primary" onClick={clk(v.det?.primRun)}>
                            {tx(s(v.det?.prim))}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </>
                ) : null}
                {v.dPrf ? (
                  <>
                    <div className="df">
                      {v.prf?.canCancel ? (
                        <>
                          <button className="btn dbtn-danger" onClick={clk(v.prf?.cancel)}>
                            {t('Cancel proforma')}
                          </button>
                        </>
                      ) : null}
                      {v.prf?.canPaid ? (
                        <>
                          <button className="btn" onClick={clk(v.prf?.transfer)}>
                            {t('Booking cancelled · transfer payment')}
                          </button>
                          <button className="btn btn-primary" onClick={clk(v.prf?.convert)}>
                            {t('Convert to final + debit note')}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </>
                ) : null}
                {v.dlgDl ? (
                  <>
                    <div className="df">
                      <span className="mu me-auto">{t('Download')}</span>
                      <button className="btn btn-sm" onClick={clk(v.dl?.pdf)}>
                        {t('PDF')}
                      </button>
                      <button className="btn btn-sm" onClick={clk(v.dl?.xls)}>
                        {t('Excel')}
                      </button>
                      <button className="btn btn-sm" onClick={clk(v.dl?.csv)}>
                        {t('CSV')}
                      </button>
                    </div>
                  </>
                ) : null}
                {v.dlgAct ? (
                  <>
                    <div className="df">
                      <button className="btn" onClick={clk(v.closeDlg)}>
                        {t('Cancel')}
                      </button>
                      <button className={`btn ${s(v.okCls)}`} onClick={clk(v.dlgOk)}>
                        {tx(s(v.okLabel))}
                      </button>
                    </div>
                  </>
                ) : null}
              </>
            ) : null}
          </div>
        </>
      ) : null}
    </ScreenTemplate>
  );
}
