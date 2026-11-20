import { Fragment } from 'react';
import { Page } from '../../../app/shell/Page';
import { AppLink } from '../../../components/AppLink';
import { useI18n } from '../../../i18n/context';
import { a, b, clk, s, sx } from '../../../lib/view';
import { MasterKitOverlays } from '../MasterKitOverlays';

/* Customer master, layout D.
   Markup ported from the GIRS prototype; values and handlers come from the screen view-model (v). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CustomerMasterLayoutDView({ v }: { v: any }) {
  const { t, tx } = useI18n();
  return (
    <Page
      header={
        <div className="ghead py-2 px-5 min-h-14 flex-none flex flex-wrap items-center justify-between gap-y-2 gap-x-6 bg-surface border-b border-b-line box-border">
          <div className="min-w-0">
            <h1 className="m-0 text-[17px] font-semibold leading-[22px]">{tx('Customer Master')}</h1>
            <p className="m-0 text-[12px] leading-[16px] text-muted">
              {tx('CMD set-up · all parties to be invoiced come from Customer Master Data in LMS')}
            </p>
          </div>
          <div className="gright gap-2.5 flex flex-wrap items-center justify-end ms-auto">
            <nav className="gap-2 flex items-center" aria-label={t('Layout options')}>
              <span className="text-[12px] text-muted">{tx('Layout')}</span>
              <div className="p-0.5 gap-0.5 flex rounded-[6px] bg-neutral">
                <AppLink className="lay rec" href="customer-master-c.html" title={t('Recommended \u00b7 present to client first')}>
                  <span className="recst" aria-hidden="true">
                    {tx('★')}
                  </span>
                  {tx('C · Groups')}
                </AppLink>
                <AppLink
                  className="lay rec"
                  href="customer-master-d.html"
                  aria-current="page"
                  title={t('Recommended \u00b7 present to client first')}
                >
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
          <div className="p-3.5 gap-2.5 flex flex-col border-b border-b-line">
            <input
              className="input w-full"
              placeholder={t('Search customer code, name or tax ID')}
              value={s(v.q)}
              aria-label={t('Search')}
              onChange={v.onQ}
            />
            <div className="r-wrap gap-2 flex items-center justify-between">
              <div className="seg" role="radiogroup" aria-label={t('Status')}>
                {(v.segs || []).map((g: any, $index: number) => (
                  <Fragment key={$index}>
                    <button role="radio" aria-checked={a(g?.on)} onClick={clk(g?.pick)}>
                      {tx(s(g?.label))}
                    </button>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
          <div className="r-wrap pt-2.5 pb-1 px-3.5 flex justify-between text-[12px] text-muted">
            <span>{tx(s(v.gCount))}</span>
            <span>{tx(s(v.countText))}</span>
          </div>
          <nav className="pt-0 pb-3 px-1.5 flex-auto overflow-auto" aria-label={t(s(v.gLabel))}>
            {(v.groups || []).map((g: any, $index: number) => (
              <Fragment key={$index}>
                <div>
                  <button className="gbtn" aria-expanded={a(g?.ax)} onClick={clk(g?.tg)}>
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
                    <span className="flex-auto min-w-0 whitespace-nowrap overflow-hidden text-ellipsis">{tx(s(g?.name))}</span>
                    <span className="mono text-[12px] font-medium text-muted">{tx(s(g?.n))}</span>
                  </button>
                  {g?.open ? (
                    <>
                      {(g?.rows || []).map((x: any, $index: number) => (
                        <Fragment key={$index}>
                          {' '}
                          <button className="cbtn" aria-current={a(x?.on)} style={sx(s(x?.sel))} onClick={clk(x?.pick)}>
                            <span className="flex-auto min-w-0 flex flex-col">
                              <span className="mono font-medium whitespace-nowrap overflow-hidden text-ellipsis">{tx(s(x?.code))}</span>
                              <span className="text-[12px] text-muted font-normal whitespace-nowrap overflow-hidden text-ellipsis">
                                {tx(s(x?.title))}
                              </span>
                            </span>{' '}
                            <span className="flex-none w-2 h-2 rounded-full" title={t(s(x?.st))} style={sx(`background: ${s(x?.dot)}`)} />
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
                <div className="py-8 px-4 text-center text-muted">{tx('No records match')}</div>
              </>
            ) : null}
          </nav>
        </section>
        <section className="card flex-auto min-w-0 overflow-hidden flex flex-col" aria-label={t('Overview')}>
          <div className="r-wrap pt-4.5 pb-4 px-6 gap-4 flex items-center">
            <span className="mono py-0 px-3 inline-flex items-center justify-center min-w-13 h-13 box-border rounded-[12px] bg-tint text-accent2 text-[14px] font-semibold flex-none">
              {tx(s(v.h?.code))}
            </span>
            <div className="gap-1 flex-auto min-w-0 flex flex-col">
              <div className="gap-2 flex items-center flex-wrap">
                <h2 className="m-0 text-[20px] font-semibold leading-[28px]">{tx(s(v.h?.title))}</h2>
                <span className="chip" style={sx(s(v.h?.chip))}>
                  {tx(s(v.h?.st))}
                </span>
                {(v.h?.chips || []).map((c: any, $index: number) => (
                  <Fragment key={$index}>
                    <span className="chip" style={sx(s(c?.s))}>
                      {tx(s(c?.t))}
                    </span>
                  </Fragment>
                ))}
              </div>
              <div className="text-[13px] text-muted">{tx(s(v.h?.sub))}</div>
            </div>
            <span className="gap-1.5 flex items-center flex-none">
              <button className="btn btn-sm btn-icon" disabled={b(v.noPrev)} aria-label={t('Previous record')} onClick={clk(v.prev)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </button>
              <span className="mono min-w-15 text-center text-[12px] text-muted">{tx(s(v.pos))}</span>
              <button className="btn btn-sm btn-icon" disabled={b(v.noNext)} aria-label={t('Next record')} onClick={clk(v.next)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
              <span className="kbar ms-1" role="group" aria-label={t('Record actions')}>
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
            </span>
          </div>
          {v.h?.hasAlert ? (
            <>
              <div
                className="py-0 px-3.5 mt-0 mb-3.5 mx-6 gap-2.5 flex items-center min-h-10 rounded-[8px] bg-badbg border border-badbd text-bad font-medium"
                role="status"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v6M12 16.5v.5" />
                </svg>
                {tx(s(v.h?.alert))}
              </div>
            </>
          ) : null}
          <div className="facts">
            {(v.h?.facts || []).map((f: any, $index: number) => (
              <Fragment key={$index}>
                <div className="fct">
                  <span className="l">{tx(s(f?.l))}</span>
                  <span className="v" style={sx(s(f?.st))} title={t(s(f?.v))}>
                    {tx(s(f?.v))}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
          <div className="pt-4 pb-6 px-6 flex-auto overflow-auto">
            <div className="gap-4 grid items-start" style={sx(`grid-template-columns: ${s(v.railCols)}`)}>
              <div className="gap-3 flex flex-col min-w-0">
                <div className="flex justify-end -mb-0.5">
                  <button className="lnk" onClick={clk(v.allT)}>
                    {tx(s(v.allL))}
                  </button>
                </div>
                {(v.secs || []).map((x: any, $index: number) => (
                  <Fragment key={$index}>
                    <div className="ac">
                      <h3 className="m-0">
                        <button className="ach" aria-expanded={a(x?.ax)} onClick={clk(x?.tg)}>
                          <svg
                            className="flex-none [transition:transform_.15s]"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            style={sx(`transform: rotate(${s(x?.rot)})`)}
                          >
                            <path d="M9 6l6 6-6 6" />
                          </svg>{' '}
                          <span className="act">{tx(s(x?.t))}</span>
                          {x?.hasN ? (
                            <>
                              <span className="acn mono">{tx(s(x?.n))}</span>
                            </>
                          ) : null}
                          <span className="acs">{tx(s(x?.sum))}</span>
                        </button>
                      </h3>
                      {x?.open ? (
                        <>
                          <div className="acb">
                            {x?.isKv ? (
                              <>
                                <div className="kg4">
                                  {(x?.kv || []).map((k: any, $index: number) => (
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
                            {x?.isTbl ? (
                              <>
                                <table className="ot rel">
                                  <thead>
                                    <tr>
                                      {(x?.h || []).map((c: any, $index: number) => (
                                        <Fragment key={$index}>
                                          <th style={sx(s(c?.st))}>{tx(s(c?.v))}</th>
                                        </Fragment>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(x?.rows || []).map((r: any, $index: number) => (
                                      <Fragment key={$index}>
                                        <tr style={sx(s(r?.rs))}>
                                          {(r?.cells || []).map((c: any, $index: number) => (
                                            <Fragment key={$index}>
                                              <td className={a(c?.cls)} style={sx(s(c?.st))}>
                                                {c?.isLink ? (
                                                  <>
                                                    <AppLink className="rlink" href={a(c?.href)} onClick={clk(c?.go)}>
                                                      {tx(s(c?.v))}
                                                    </AppLink>
                                                  </>
                                                ) : null}
                                                {c?.isChip ? (
                                                  <>
                                                    <span className="chip" style={sx(s(c?.chip))}>
                                                      {tx(s(c?.v))}
                                                    </span>
                                                  </>
                                                ) : null}
                                                {c?.isText ? <>{tx(s(c?.v))}</> : null}
                                              </td>
                                            </Fragment>
                                          ))}
                                        </tr>
                                      </Fragment>
                                    ))}
                                  </tbody>
                                </table>
                                {x?.empty ? (
                                  <>
                                    <div className="py-3.5 px-5 text-muted4 text-[13px]">{tx('None')}</div>
                                  </>
                                ) : null}
                              </>
                            ) : null}
                            {x?.isTl ? (
                              <>
                                <div className="py-4 px-5">
                                  {x?.hasNote ? (
                                    <>
                                      <div className="py-2.5 px-3 mb-3.5 rounded-[8px] bg-hover2 text-[12px] text-muted">
                                        {tx(s(x?.note))}
                                      </div>
                                    </>
                                  ) : null}
                                  {(x?.tl || []).map((i: any, $index: number) => (
                                    <Fragment key={$index}>
                                      <div className={a(i?.cls)}>
                                        <div className="gap-3 flex items-baseline flex-wrap">
                                          <span className="text-[13px] font-medium" style={sx(`color: ${s(i?.fg)}`)}>
                                            {tx(s(i?.a))}
                                          </span>
                                          <span className="text-[13px]">{tx(s(i?.b))}</span>
                                          <span className="text-[12px] text-muted">{tx(s(i?.c))}</span>
                                        </div>
                                      </div>
                                    </Fragment>
                                  ))}
                                </div>
                              </>
                            ) : null}
                          </div>
                        </>
                      ) : null}
                    </div>
                  </Fragment>
                ))}
              </div>
              {v.h?.hasRail ? (
                <>
                  <aside className="sc sticky top-0" aria-label={t(s(v.h?.railTitle))}>
                    <h3>
                      <span className="dot" />
                      {tx(s(v.h?.railTitle))}
                    </h3>
                    <div className="p-4">
                      {v.h?.hasNote ? (
                        <>
                          <div className="py-2.5 px-3 mb-3.5 rounded-[8px] bg-hover2 text-[12px] text-muted">{tx(s(v.h?.railNote))}</div>
                        </>
                      ) : null}
                      {(v.h?.rail || []).map((i: any, $index: number) => (
                        <Fragment key={$index}>
                          <div className={a(i?.cls)}>
                            <div className="text-[13px] font-medium" style={sx(`color: ${s(i?.fg)}`)}>
                              {tx(s(i?.a))}
                            </div>
                            <div className="text-[13px] mt-px">{tx(s(i?.b))}</div>
                            <div className="text-[12px] text-muted mt-px">{tx(s(i?.c))}</div>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </aside>
                </>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </Page>
  );
}
