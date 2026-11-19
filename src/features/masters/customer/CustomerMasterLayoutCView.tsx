import { Fragment } from 'react';
import { Page } from '../../../app/shell/Page';
import { AppLink } from '../../../components/AppLink';
import { useI18n } from '../../../i18n/context';
import { a, b, clk, s, sx } from '../../../lib/view';
import { MasterKitOverlays } from '../MasterKitOverlays';

/* Customer master, layout C.
   Markup ported from the GIRS prototype; values and handlers come from the screen view-model (v). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CustomerMasterLayoutCView({ v }: { v: any }) {
  const { t, tx } = useI18n();
  return (
    <Page
      header={
        <div className="ghead py-2 px-5 min-h-14 flex-none flex flex-wrap items-center justify-between gap-y-2 gap-x-6 bg-surface border-b border-b-line box-border">
          <div className="min-w-0">
            <h1 className="m-0 text-[17px] font-semibold leading-[22px]">{tx('Customer Master')}</h1>
            <p className="m-0 text-[12px] leading-[16px] text-muted">
              {tx('CMD set-up · customer codes grouped at parent / legal-entity level · sourced from LMS Customer Master Data')}
            </p>
          </div>
          <div className="gright gap-2.5 flex flex-wrap items-center justify-end ms-auto">
            <nav className="gap-2 flex items-center" aria-label={t('Layout options')}>
              <span className="text-[12px] text-muted">{tx('Layout')}</span>
              <div className="p-0.5 gap-0.5 flex rounded-[6px] bg-neutral">
                <AppLink
                  className="lay rec"
                  href="customer-master-c.html"
                  aria-current="page"
                  title={t('Recommended \u00b7 present to client first')}
                >
                  <span className="recst" aria-hidden="true">
                    {tx('★')}
                  </span>
                  {tx('C · Groups')}
                </AppLink>
                <AppLink className="lay rec" href="customer-master-d.html" title={t('Recommended \u00b7 present to client first')}>
                  <span className="recst" aria-hidden="true">
                    {tx('★')}
                  </span>
                  {tx('D · Overview')}
                </AppLink>
              </div>
            </nav>
            <span className="chip bg-warnbg text-warn h-8 rounded-[6px]">{tx('Sample values')}</span>
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
              {tx('Create new Customer')}
            </button>
            <div className="relative">
              <label htmlFor="gexp" className="sr">
                {tx('Export')}
              </label>
              <select id="gexp" className="select w-28" value="" onChange={v.shell?.exp}>
                <option value="">{tx('Export')}</option>
                <option value="xlsx">{tx('Excel')}</option>
                <option value="csv">{tx('CSV')}</option>
                <option value="pdf">{tx('PDF')}</option>
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
          </div>
        </div>
      }
      overlays={<MasterKitOverlays v={v} />}
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
            {(v.tree || []).map((g: any, $index: number) => (
              <Fragment key={$index}>
                <div>
                  <button className="gbtn" aria-expanded={a(g?.open)} onClick={clk(g?.toggle)}>
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
                      {(g?.kids || []).map((k: any, $index: number) => (
                        <Fragment key={$index}>
                          {' '}
                          <button className="cbtn" aria-current={a(k?.cur)} style={sx(s(k?.sel))} onClick={clk(k?.pick)}>
                            <span className="mono flex-[0_0_auto]">{tx(s(k?.code))}</span>
                            <span className="flex-auto text-muted">{tx(s(k?.ctry))}</span>
                            {k?.flag ? (
                              <>
                                <span className="sr">{tx(s(k?.st))}</span>
                              </>
                            ) : null}
                            {k?.flag ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-badbar" title={t(s(k?.st))} />
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
              <span className="text-[12px] text-muted">{tx('Parent customer group')}</span>
              <span className="text-[16px] font-semibold">{tx(s(v.grp?.name))}</span>
            </div>
            <div className="gap-0.5 flex flex-col">
              <span className="text-[12px] text-muted">{tx('Legal entity name')}</span>
              <span>{tx(s(v.grp?.legal))}</span>
            </div>
            <div className="gap-0.5 flex flex-col">
              <span className="text-[12px] text-muted">{tx('Registration / Tax ID')}</span>
              <span className="mono">{tx(s(v.grp?.tax))}</span>
            </div>
            <div className="gap-0.5 flex flex-col">
              <span className="text-[12px] text-muted">{tx('Customer codes')}</span>
              <span className="mono">{tx(s(v.grp?.n))}</span>
            </div>
            <div className="gap-0.5 flex flex-col">
              <span className="text-[12px] text-muted">{tx('Invoicing arrangement')}</span>
              <span>
                <span className="chip" style={sx(s(v.grp?.arrChip))}>
                  {tx(s(v.grp?.arr))}
                </span>
              </span>
            </div>
            <span className="ms-auto text-[12px] text-muted max-w-65 text-end">
              {tx('Grouping drives invoicing, reporting and credit management')}
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
                  <span className="text-[12px] text-muted">{tx('Credit terms')}</span>
                  <span className="font-medium">{tx(s(v.c?.terms))}</span>
                </div>
                <div className="gap-0.5 flex flex-col">
                  <span className="text-[12px] text-muted">{tx('Default billing party')}</span>
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
                      {tx('Edit')}
                    </button>
                  </>
                ) : null}
                {v.kit?.hasMore ? (
                  <>
                    <span className="kmore">
                      <button
                        className="btn btn-sm kmorebtn"
                        aria-haspopup="menu"
                        aria-expanded={a(v.kit?.menuOpen)}
                        onClick={clk(v.kit?.toggleMenu)}
                      >
                        {tx('More')}
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
                                    <small>{tx('View and download · PDF, Excel, CSV')}</small>
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
              {(v.tabs || []).map((t: any, $index: number) => (
                <Fragment key={$index}>
                  {' '}
                  <button
                    className="tab"
                    role="tab"
                    aria-selected={a(t?.on)}
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
                      <h3 className="sech">{tx('Identity')}</h3>
                      <div className="row">
                        <span className="l">{tx('Customer code')}</span>
                        <span className="v mono">{tx(s(v.c?.code))}</span>
                      </div>
                      <div className="row">
                        <span className="l">{tx('Customer name')}</span>
                        <span className="v">{tx(s(v.c?.name))}</span>
                      </div>
                      <div className="row">
                        <span className="l">{tx('Legal entity name')}</span>
                        <span className="v">{tx(s(v.grp?.legal))}</span>
                      </div>
                      <div className="row">
                        <span className="l">{tx('Registration / Tax ID')}</span>
                        <span className="v mono">{tx(s(v.c?.tax))}</span>
                      </div>
                      <div className="row">
                        <span className="l">{tx('LMS CMD reference')}</span>
                        <span className="v mono">{tx(s(v.c?.ref))}</span>
                      </div>
                    </div>
                    <div className="col">
                      <h3 className="sech">{tx('Contact')}</h3>
                      <div className="row">
                        <span className="l">{tx('Email')}</span>
                        <span className="v">{tx(s(v.c?.email))}</span>
                      </div>
                      <div className="row">
                        <span className="l">{tx('Address details')}</span>
                        <span className="v">{tx(s(v.c?.addr))}</span>
                      </div>
                    </div>
                    <div className="col">
                      <h3 className="sech">{tx('Terms & compliance')}</h3>
                      <div className="row">
                        <span className="l">{tx('Credit terms')}</span>
                        <span className="v">{tx(s(v.c?.terms))}</span>
                      </div>
                      <div className="row">
                        <span className="l">{tx('Parent customer group')}</span>
                        <span className="v">{tx(s(v.grp?.name))}</span>
                      </div>
                      <div className="row">
                        <span className="l">{tx('Sanction / Blacklist status')}</span>
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
                          <th>{tx('Country')}</th>
                          <th>{tx('Billing party')}</th>
                          <th>{tx('Customer code')}</th>
                          <th>{tx('Default')}</th>
                          <th>{tx('Default set by')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(v.parties || []).map((b: any, $index: number) => (
                          <Fragment key={$index}>
                            <tr>
                              <td>{tx(s(b?.ctry))}</td>
                              <td>{tx(s(b?.name))}</td>
                              <td className="mono">{tx(s(b?.code))}</td>
                              <td>
                                {b?.isDef ? (
                                  <>
                                    <span className="chip bg-tint text-accent2">{tx('Default')}</span>
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
                      <span className="l">{tx('Invoicing arrangement')}</span>
                      <span className="v">
                        <span className="chip" style={sx(s(v.grp?.arrChip))}>
                          {tx(s(v.grp?.arr))}
                        </span>
                      </span>
                    </div>
                    <div>
                      <span className="l">{tx('Default billing party')}</span>
                      <span className="v">{tx(s(v.c?.defParty))}</span>
                    </div>
                    <div>
                      <span className="l">{tx('Customer-specific rules')}</span>
                      <span className="v ph">{tx('[Customer-specific billing configuration]')}</span>
                    </div>
                  </div>
                </>
              ) : null}
              {v.tab4 ? (
                <>
                  <div className="g3">
                    <div>
                      <span className="l">{tx('Document / data delivery')}</span>
                      <span className="v gap-1.5 flex">
                        <span className="chip" style={sx(s(v.pdfChip))}>
                          {tx('PDF')}
                        </span>
                        <span className="chip" style={sx(s(v.jsonChip))}>
                          {tx('JSON')}
                        </span>
                      </span>
                    </div>
                    <div>
                      <span className="l">{tx('Delivery to')}</span>
                      <span className="v">{tx(s(v.c?.email))}</span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </Page>
  );
}
