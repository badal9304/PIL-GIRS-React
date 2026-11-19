import { Fragment } from 'react';
import { Page } from '../../app/shell/Page';
import { AppLink } from '../../components/AppLink';
import { useI18n } from '../../i18n/context';
import { a, b, clk, s, sx } from '../../lib/view';

/* Invoice List screen.
   Markup ported from the GIRS prototype; values and handlers come from the screen view-model (v). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function InvoiceListView({ v }: { v: any }) {
  const { t, tx } = useI18n();
  return (
    <Page
      header={
        <div
          className="ghead"
          style={{
            minHeight: '56px',
            flex: 'none',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px 24px',
            padding: '8px 20px',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--line)',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ minWidth: '0' }}>
            <h1 style={{ margin: '0', fontSize: '17px', fontWeight: '600', lineHeight: '22px' }}>{tx('Invoice List')}</h1>
            <p style={{ margin: '0', fontSize: '12px', lineHeight: '16px', color: 'var(--muted)' }}>
              {tx('Rule-driven invoicing automation using LMS booking, B/L and container data')}
            </p>
          </div>
          <div
            className="gright"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              marginInlineStart: 'auto',
            }}
          >
            <span className="chip" style={{ background: 'var(--warnbg)', color: 'var(--warn)', height: '32px', borderRadius: '6px' }}>
              {tx('Sample values')}
            </span>
            <div style={{ position: 'relative' }}>
              <label htmlFor="gexp" className="sr">
                {tx('Export')}
              </label>
              <select id="gexp" className="select" value="" style={{ width: '112px' }} onChange={v.shell?.exp}>
                <option value="">{tx('Export')}</option>
                <option value="xlsx">{tx('Excel')}</option>
                <option value="csv">{tx('CSV')}</option>
                <option value="pdf">{tx('PDF')}</option>
              </select>
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
                style={{
                  position: 'absolute',
                  insetInlineEnd: '10px',
                  top: '50%',
                  marginTop: '-8px',
                  pointerEvents: 'none',
                  color: 'var(--muted)',
                }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
            <AppLink href="credit-notes.html" className="btn" style={{ textDecoration: 'none' }}>
              {tx('Raise credit note')}
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
              {tx('Manual invoice')}
            </button>
          </div>
        </div>
      }
    >
      <div className="tabs" role="tablist" aria-label={t('Invoice List views')}>
        {(v.tabs || []).map((t: any, $index: number) => (
          <Fragment key={$index}>
            <button className="tabb" role="tab" aria-selected={a(t?.on)} onClick={clk(t?.pick)}>
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
              className="input r-w ph-trunc"
              style={{ width: '260px', flex: 'none' }}
              placeholder={t('Search any value in the table')}
              title={t(
                'Search any value in the table: invoice no., status, e-Invoice, GFS status, customer, invoice type, B/L, vessel/voyage, amount, currency, due date',
              )}
              value={s(v.q)}
              aria-label={t('Search invoices')}
              onChange={v.onQ}
            />
            <div className="ftb-p">
              {(v.fsel || []).map((x: any, $index: number) => (
                <Fragment key={$index}>
                  <div className="fq">
                    <button
                      className="fq-b"
                      aria-haspopup="listbox"
                      aria-expanded={a(x?.openA)}
                      aria-label={t(s(x?.aria))}
                      title={t(s(x?.tip))}
                      style={sx(s(x?.bst))}
                      onClick={clk(x?.toggle)}
                    >
                      <span className="fq-t">{tx(s(x?.text))}</span>
                      {x?.hasN ? (
                        <>
                          <span className="msel-n">{tx(s(x?.n))}</span>
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
                        <div className="msel-p" role="listbox" aria-multiselectable="true" aria-label={t(s(x?.label))}>
                          {(x?.items || []).map((o: any, $index: number) => (
                            <Fragment key={$index}>
                              <label className="msel-o" role="option" aria-selected={a(o?.on)}>
                                <input type="checkbox" checked={b(o?.on)} onChange={o?.flip} />
                                <span>{tx(s(o?.v))}</span>
                                <span className="mono mu">{tx(s(o?.n))}</span>
                              </label>
                            </Fragment>
                          ))}
                          <div className="msel-f">
                            <button className="btn btn-sm" disabled={b(x?.none)} onClick={clk(x?.clear)}>
                              {tx('Clear')}
                            </button>
                            <button className="btn btn-sm btn-primary" onClick={clk(x?.done)}>
                              {tx('Done')}
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
                  <button className="lnk" style={{ whiteSpace: 'nowrap', height: '32px' }} onClick={clk(v.clearF)}>
                    {tx('Clear all')}
                  </button>
                </>
              ) : null}
            </div>
            <div style={{ position: 'relative', flex: 'none' }}>
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
                style={{
                  position: 'absolute',
                  insetInlineStart: '10px',
                  top: '50%',
                  marginTop: '-8px',
                  pointerEvents: 'none',
                  color: 'var(--muted)',
                }}
              >
                <path d="M7 4v16M4 17l3 3 3-3M17 20V4M14 7l3-3 3 3" />
              </svg>
              <select
                className="select r-w"
                style={{ width: '180px', paddingInlineStart: '34px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                aria-label={t('Sort')}
                title={t('Sort')}
                value={s(v.sortSel?.val)}
                onChange={v.sortSel?.on}
              >
                {(v.sortSel?.opts || []).map((o: any, $index: number) => (
                  <Fragment key={$index}>
                    <option value={a(o?.v)}>{tx(s(o?.label))}</option>
                  </Fragment>
                ))}
              </select>
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
                style={{
                  position: 'absolute',
                  insetInlineEnd: '10px',
                  top: '50%',
                  marginTop: '-8px',
                  pointerEvents: 'none',
                  color: 'var(--muted)',
                }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
            <div className="fq" style={{ flex: 'none' }}>
              <button
                className="btn cols-b"
                aria-haspopup="dialog"
                aria-expanded={a(v.colsOpen)}
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
                <span>{tx('Columns')}</span>
                <span className="msel-n">{tx(s(v.colsN))}</span>
              </button>
              {v.colsOpen ? (
                <>
                  <button className="mback" tabIndex={-1} aria-label={t('Close columns')} onClick={clk(v.colsCancel)} />
                  <div className="msel-p cols-p" role="dialog" aria-label={t('Columns')}>
                    <div className="cols-h">
                      <span>{tx('Columns')}</span>
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
                          <span style={{ fontWeight: '600' }}>{tx('Select all')}</span>
                        </label>
                      </>
                    ) : null}
                    <div className="cols-l">
                      {(v.colsList || []).map((c: any, $index: number) => (
                        <Fragment key={$index}>
                          <label className="msel-o" title={t(s(c?.tip))}>
                            <input type="checkbox" checked={b(c?.on)} disabled={b(c?.lock)} onChange={c?.flip} />
                            <span>{tx(s(c?.label))}</span>
                          </label>
                        </Fragment>
                      ))}
                      {v.colsNone ? (
                        <>
                          <div className="mu" style={{ padding: '16px', fontSize: '13px', textAlign: 'center' }}>
                            {tx('No columns match')}
                          </div>
                        </>
                      ) : null}
                    </div>
                    <div className="msel-f">
                      <button className="btn btn-sm" disabled={b(v.colsIsDef)} onClick={clk(v.colsReset)}>
                        {tx('Reset to default')}
                      </button>
                      <button className="btn btn-sm btn-primary" onClick={clk(v.colsDone)}>
                        {tx('Done')}
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
                  {tx('Download PDF / JSON')}
                </button>{' '}
                <button className="btn btn-sm" onClick={clk(v.bulkMail)}>
                  {tx('e-Mail / Post')}
                </button>{' '}
                <button className="btn btn-sm" style={{ marginInlineStart: 'auto' }} onClick={clk(v.clearSel)}>
                  {tx('Clear selection')}
                </button>
              </div>
            </>
          ) : null}
          <section className="card" style={{ flex: '1 1 auto', minHeight: '0', overflow: 'auto' }}>
            <table className="lst">
              <thead style={{ position: 'sticky', top: '0', zIndex: '2' }}>
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
                  <th className="c-no">{tx('Invoice No.')}</th>
                  {v.cv?.st2 ? (
                    <>
                      <th>{tx('Invoice Status')}</th>
                    </>
                  ) : null}
                  {v.cv?.einv ? (
                    <>
                      <th>{tx('e-Invoice')}</th>
                    </>
                  ) : null}
                  {v.cv?.gfs ? (
                    <>
                      <th>{tx('GFS Status')}</th>
                    </>
                  ) : null}
                  {v.cv?.pay ? (
                    <>
                      <th>{tx('Payment Status')}</th>
                    </>
                  ) : null}
                  {v.cv?.party ? (
                    <>
                      <th>{tx('Customer (Billing Party)')}</th>
                    </>
                  ) : null}
                  {v.cv?.cust ? (
                    <>
                      <th>{tx('Customer Code')}</th>
                    </>
                  ) : null}
                  {v.cv?.type ? (
                    <>
                      <th>{tx('Invoice Type')}</th>
                    </>
                  ) : null}
                  {v.cv?.bkg ? (
                    <>
                      <th>{tx('Booking No.')}</th>
                    </>
                  ) : null}
                  {v.cv?.bl ? (
                    <>
                      <th>{tx('B/L No.')}</th>
                    </>
                  ) : null}
                  {v.cv?.cntr ? (
                    <>
                      <th>{tx('Container No.')}</th>
                    </>
                  ) : null}
                  {v.cv?.vvd ? (
                    <>
                      <th>{tx('Vessel/Voyage')}</th>
                    </>
                  ) : null}
                  {v.cv?.chg ? (
                    <>
                      <th>{tx('Charge Code')}</th>
                    </>
                  ) : null}
                  {v.cv?.camt ? (
                    <>
                      <th className="num">{tx('Charge Amount')}</th>
                    </>
                  ) : null}
                  {v.cv?.amt ? (
                    <>
                      <th className="num">{tx('Invoice Amount')}</th>
                    </>
                  ) : null}
                  {v.cv?.cur ? (
                    <>
                      <th>{tx('Currency')}</th>
                    </>
                  ) : null}
                  {v.cv?.roe ? (
                    <>
                      <th>{tx('ROE')}</th>
                    </>
                  ) : null}
                  {v.cv?.tax ? (
                    <>
                      <th>{tx('Tax Code')}</th>
                    </>
                  ) : null}
                  {v.cv?.due ? (
                    <>
                      <th>{tx('Due Date')}</th>
                    </>
                  ) : null}
                  {v.cv?.gov ? (
                    <>
                      <th>{tx('Govt. Reference')}</th>
                    </>
                  ) : null}
                  {v.cv?.files ? (
                    <>
                      <th>{tx('PDF/JSON Link')}</th>
                    </>
                  ) : null}
                  {v.cv?.audit ? (
                    <>
                      <th>{tx('Audit ID')}</th>
                    </>
                  ) : null}
                  <th className="c-act" style={{ width: '72px' }}>
                    {tx('Action')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(v.invs || []).map((i: any, $index: number) => (
                  <Fragment key={$index}>
                    <tr className={`grp ${s(i?.rowCls)}`}>
                      <td className="c-sel">
                        <input
                          type="checkbox"
                          className="cbx"
                          aria-label={t(`Select ${s(i?.no)}`)}
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
                            <span className="pill" style={sx(s(i?.st2Pill))}>
                              {tx(s(i?.st2))}
                            </span>
                          </td>
                        </>
                      ) : null}
                      {v.cv?.einv ? (
                        <>
                          <td>
                            <span className="pill" style={sx(s(i?.einvPill))}>
                              {tx(s(i?.einv))}
                            </span>
                          </td>
                        </>
                      ) : null}
                      {v.cv?.gfs ? (
                        <>
                          <td>
                            <span className="pill" style={sx(s(i?.gfsPill))}>
                              {tx(s(i?.gfs))}
                            </span>
                          </td>
                        </>
                      ) : null}
                      {v.cv?.pay ? (
                        <>
                          <td>
                            <span className="pill" style={sx(s(i?.payPill))}>
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
                              {(i?.amts || []).map((a: any, $index: number) => (
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
                          <td className="mono num" style={{ fontWeight: '600' }}>
                            {tx(s(i?.amtMain))}
                          </td>
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
                                  {tx('PDF')}
                                </button>
                              </>
                            ) : null}
                            {i?.hasJson ? (
                              <>
                                <span className="mu" style={{ padding: '0 6px' }}>
                                  {tx('·')}
                                </span>
                                <button className="lnk" onClick={clk(i?.json)}>
                                  {tx('JSON')}
                                </button>
                              </>
                            ) : null}
                            {i?.noFile ? (
                              <>
                                <span className="mu">{tx('—')}</span>
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
                          aria-label={t(`Actions for ${s(i?.no)}`)}
                          aria-haspopup="menu"
                          aria-expanded={a(i?.menuOpen)}
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
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>{tx('No invoices match these filters')}</div>
              </>
            ) : null}
          </section>
          <div className="pager" role="navigation" aria-label={t('Pages')}>
            <span>{tx(s(v.pInv?.text))}</span>
            <span style={{ marginInlineStart: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span className="mu" style={{ fontSize: '12px' }}>
                {tx('Rows per page')}
              </span>
              <div style={{ position: 'relative' }}>
                <select
                  className="select select-sm"
                  style={{ width: '76px' }}
                  aria-label={t('Rows per page')}
                  value={s(v.pInv?.size)}
                  onChange={v.pInv?.onSize}
                >
                  {(v.pInv?.sizes || []).map((z: any, $index: number) => (
                    <Fragment key={$index}>
                      <option value={a(z)}>{tx(s(z))}</option>
                    </Fragment>
                  ))}
                </select>
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
                  style={{
                    position: 'absolute',
                    insetInlineEnd: '10px',
                    top: '50%',
                    marginTop: '-8px',
                    pointerEvents: 'none',
                    color: 'var(--muted)',
                  }}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
              <button className="btn btn-sm pbtn" aria-label={t('First page')} disabled={b(v.pInv?.firstDis)} onClick={clk(v.pInv?.first)}>
                {tx('«')}
              </button>
              <button className="btn btn-sm pbtn" aria-label={t('Previous page')} disabled={b(v.pInv?.prevDis)} onClick={clk(v.pInv?.prev)}>
                {tx('‹')}
              </button>
              <span className="mono" style={{ fontSize: '13px', minWidth: '64px', textAlign: 'center' }}>
                {tx(s(v.pInv?.pos))}
              </span>
              <button className="btn btn-sm pbtn" aria-label={t('Next page')} disabled={b(v.pInv?.nextDis)} onClick={clk(v.pInv?.next)}>
                {tx('›')}
              </button>
              <button className="btn btn-sm pbtn" aria-label={t('Last page')} disabled={b(v.pInv?.lastDis)} onClick={clk(v.pInv?.last)}>
                {tx('»')}
              </button>
            </span>
          </div>
        </>
      ) : null}
      {v.tabReady ? (
        <>
          {v.readyListOn ? (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                <label className="flab">
                  {tx('Period')}
                  <input className="input r-w" type="date" value={s(v.period)} style={{ width: '180px' }} onChange={v.onPeriod} />
                </label>
                <label className="flab">
                  {tx('Port')}
                  <div style={{ position: 'relative' }}>
                    <select className="select r-w" value={s(v.rPort)} style={{ width: '200px' }} onChange={v.onPort}>
                      <option value="">{tx('All ports')}</option>
                      {(v.ports || []).map((o: any, $index: number) => (
                        <Fragment key={$index}>
                          <option value={a(o)}>{tx(s(o))}</option>
                        </Fragment>
                      ))}
                    </select>
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
                      style={{
                        position: 'absolute',
                        insetInlineEnd: '10px',
                        top: '50%',
                        marginTop: '-8px',
                        pointerEvents: 'none',
                        color: 'var(--muted)',
                      }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </label>
                <label className="flab">
                  {tx('Process')}
                  <div style={{ position: 'relative' }}>
                    <select className="select r-w" value={s(v.rProc)} style={{ width: '200px' }} onChange={v.onProc}>
                      <option value="">{tx('All')}</option>
                      {(v.procs || []).map((o: any, $index: number) => (
                        <Fragment key={$index}>
                          <option value={a(o)}>{tx(s(o))}</option>
                        </Fragment>
                      ))}
                    </select>
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
                      style={{
                        position: 'absolute',
                        insetInlineEnd: '10px',
                        top: '50%',
                        marginTop: '-8px',
                        pointerEvents: 'none',
                        color: 'var(--muted)',
                      }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </label>
                {v.rFiltered ? (
                  <>
                    <button className="lnk" style={{ height: '36px' }} onClick={clk(v.resetR)}>
                      {tx('Reset filters')}
                    </button>
                  </>
                ) : null}
                <span
                  style={{
                    marginInlineStart: 'auto',
                    fontSize: '13px',
                    color: 'var(--muted)',
                    height: '36px',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  {tx('Country and entity follow the selection in the top bar')}
                </span>
              </div>
              <div className="r-wrap" style={{ display: 'flex', gap: '16px' }}>
                {(v.kpis || []).map((k: any, $index: number) => (
                  <Fragment key={$index}>
                    <button className="kpi" aria-pressed={a(k?.on)} onClick={clk(k?.pick)}>
                      <span className="kl">
                        <i style={sx(`width: 8px; height: 8px; border-radius: 50%; background: ${s(k?.color)}`)} />
                        {tx(s(k?.label))}
                      </span>
                      <span className="kv mono">{tx(s(k?.n))}</span>
                    </button>
                  </Fragment>
                ))}
              </div>
              <section className="card" style={{ flex: '1 1 auto', minHeight: '0', overflow: 'auto' }}>
                <table className="lst">
                  <thead style={{ position: 'sticky', top: '0', zIndex: '2' }}>
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
                      <th>{tx('B/L No.')}</th>
                      <th>{tx('Booking')}</th>
                      <th>{tx('Customer')}</th>
                      <th>{tx('Port')}</th>
                      <th>{tx('Process')}</th>
                      <th className="num">{tx('Amount')}</th>
                      <th>{tx('Status')}</th>
                      <th style={{ width: '48px' }}>
                        <span className="sr">{tx('Details')}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(v.ready || []).map((r: any, $index: number) => (
                      <Fragment key={$index}>
                        <tr className={`grp ${s(r?.rowCls)}`}>
                          <td className="c-sel">
                            <input
                              type="checkbox"
                              className="cbx"
                              aria-label={t(`Select ${s(r?.bl)}`)}
                              checked={b(r?.on)}
                              disabled={b(r?.lock)}
                              title={t(s(r?.lockTip))}
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
                            {tx(s(r?.name))}{' '}
                            <span className="mono mu" style={{ fontSize: '12px' }}>
                              {tx(s(r?.cust))}
                            </span>
                          </td>
                          <td>{tx(s(r?.port))}</td>
                          <td>{tx(s(r?.type))}</td>
                          <td className="mono num" style={{ fontWeight: '600' }}>
                            {tx(`${s(r?.amt)} ${s(r?.cur)}`)}
                          </td>
                          <td>
                            <span className="pill" style={sx(s(r?.pill))}>
                              {tx(s(r?.status))}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="ex"
                              style={{ margin: '0' }}
                              aria-expanded={a(r?.open)}
                              aria-label={t(`Validation of ${s(r?.bl)}`)}
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
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: '1 1 auto', minWidth: '0' }}>
                                    {r?.hasMsg ? (
                                      <>
                                        <div className={`banner ${s(r?.bcls)}`}>{tx(`${s(r?.status)}: ${s(r?.msg)}`)}</div>
                                      </>
                                    ) : null}
                                    <div className="chk">
                                      {(r?.checks || []).map((c: any, $index: number) => (
                                        <Fragment key={$index}>
                                          <span style={{ fontWeight: '500' }}>{tx(s(c?.k))}</span>
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
                                  <button className="btn btn-primary" style={{ flex: 'none' }} onClick={clk(r?.review)}>
                                    {tx('Open details')}
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
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>{tx(s(v.readyEmptyText))}</div>
                  </>
                ) : null}
              </section>
              <div className="pager" role="navigation" aria-label={t('Pages')}>
                <span>{tx(s(v.pRdy?.text))}</span>
                <span style={{ marginInlineStart: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span className="mu" style={{ fontSize: '12px' }}>
                    {tx('Rows per page')}
                  </span>
                  <div style={{ position: 'relative' }}>
                    <select
                      className="select select-sm"
                      style={{ width: '76px' }}
                      aria-label={t('Rows per page')}
                      value={s(v.pRdy?.size)}
                      onChange={v.pRdy?.onSize}
                    >
                      {(v.pRdy?.sizes || []).map((z: any, $index: number) => (
                        <Fragment key={$index}>
                          <option value={a(z)}>{tx(s(z))}</option>
                        </Fragment>
                      ))}
                    </select>
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
                      style={{
                        position: 'absolute',
                        insetInlineEnd: '10px',
                        top: '50%',
                        marginTop: '-8px',
                        pointerEvents: 'none',
                        color: 'var(--muted)',
                      }}
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
                    {tx('«')}
                  </button>
                  <button
                    className="btn btn-sm pbtn"
                    aria-label={t('Previous page')}
                    disabled={b(v.pRdy?.prevDis)}
                    onClick={clk(v.pRdy?.prev)}
                  >
                    {tx('‹')}
                  </button>
                  <span className="mono" style={{ fontSize: '13px', minWidth: '64px', textAlign: 'center' }}>
                    {tx(s(v.pRdy?.pos))}
                  </span>
                  <button className="btn btn-sm pbtn" aria-label={t('Next page')} disabled={b(v.pRdy?.nextDis)} onClick={clk(v.pRdy?.next)}>
                    {tx('›')}
                  </button>
                  <button className="btn btn-sm pbtn" aria-label={t('Last page')} disabled={b(v.pRdy?.lastDis)} onClick={clk(v.pRdy?.last)}>
                    {tx('»')}
                  </button>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button className="btn" disabled={b(v.noRSel)} onClick={clk(v.reviewSel)}>
                  {tx('Review selected')}
                  {v.hasRSel ? <> {tx(`(${s(v.rSelN)})`)}</> : null}
                </button>
                <button className="btn btn-primary" disabled={b(v.genDis)} onClick={clk(v.genSel)}>
                  {tx('Generate')}
                  {v.hasRSel ? <> {tx(`(${s(v.rSelN)})`)}</> : null}
                </button>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{tx(s(v.genHint))}</span>
              </div>
            </>
          ) : null}
          {v.inReview ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  {tx('Back to Ready to invoice')}
                </button>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  {tx('Final validation and preview before invoice creation')}
                </span>
                <span style={{ marginInlineStart: 'auto', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                  <button className="lnk" onClick={clk(v.viewRoe)}>
                    {tx('View ROE')}
                  </button>
                  <button className="btn btn-sm" onClick={clk(v.viewSrc)}>
                    {tx('View source charges')}
                  </button>
                  <button className="btn btn-sm" onClick={clk(v.viewCtx)}>
                    {tx('View audit context')}
                  </button>
                </span>
                {v.rvMany ? (
                  <>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <button className="btn btn-sm" disabled={b(v.rvFirst)} onClick={clk(v.rvPrev)}>
                        {tx('Previous')}
                      </button>
                      <span className="mono" style={{ fontSize: '13px' }}>
                        {tx(s(v.rvPos))}
                      </span>
                      <button className="btn btn-sm" disabled={b(v.rvLast)} onClick={clk(v.rvNext)}>
                        {tx('Next')}
                      </button>
                    </span>
                  </>
                ) : null}
              </div>
              <div style={{ flex: '1 1 auto', minHeight: '0', overflow: 'auto' }}>
                <section className="card ri" aria-label={t('Ready to invoice')}>
                  <div className="ri-hd">
                    <h1>
                      {tx('READY TO INVOICE')}
                      {v.rv?.hasErr ? (
                        <>
                          {' '}
                          <span className="ri-err">{tx('(Error)')}</span>
                        </>
                      ) : null}
                    </h1>
                    <div className="ri-sub">
                      <span className="mu">{tx('Transaction Name:')}</span> <b>{tx(s(v.rv?.txn))}</b>
                    </div>
                  </div>
                  {v.rv?.hasErr ? (
                    <>
                      <div className="ri-errs" role="alert">
                        <b>{tx(s(v.rv?.errTitle))}</b>
                        <ul>
                          {(v.rv?.errs || []).map((e: any, $index: number) => (
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
                    {(v.rv?.strip || []).map((x: any, $index: number) => (
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
                      <div className="k">{tx('From')}</div>
                      <div className="n">{tx(s(v.rv?.from0))}</div>
                      {(v.rv?.fromL || []).map((l: any, $index: number) => (
                        <Fragment key={$index}>
                          <div className="l">{tx(s(l))}</div>
                        </Fragment>
                      ))}
                    </div>
                    <div>
                      <label className="k" htmlFor="ri-cust">
                        {tx('To')}
                      </label>
                      <div className="ri-cb" style={{ marginTop: '6px', maxWidth: '360px' }}>
                        <input
                          id="ri-cust"
                          className={`input ${s(v.rv?.custCls)}`}
                          style={{ width: '100%', fontWeight: '600' }}
                          role="combobox"
                          aria-autocomplete="list"
                          aria-expanded={a(v.rv?.cuA)}
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
                              {(v.rv?.cuOpts || []).map((o: any, $index: number) => (
                                <Fragment key={$index}>
                                  <li role="option" id={a(o?.id)} aria-selected={a(o?.on)} onMouseDown={o?.pick}>
                                    <span className="mono">{tx(s(o?.code))}</span>
                                    {tx(s(o?.name))}
                                  </li>
                                </Fragment>
                              ))}
                              {v.rv?.cuNone ? (
                                <>
                                  <li className="none" role="option" aria-disabled="true">
                                    {tx('No matching customer')}
                                  </li>
                                </>
                              ) : null}
                            </ul>
                          </>
                        ) : null}
                      </div>
                      <div className="l" style={{ marginTop: '6px' }}>
                        {tx(s(v.rv?.addr))}
                      </div>
                    </div>
                    <div>
                      <div className="k">{tx('Customer & payment')}</div>
                      <div className="ri-kv">
                        {(v.rv?.details || []).map((x: any, $index: number) => (
                          <Fragment key={$index}>
                            <span>{tx(s(x?.k))}</span>
                            <span>{tx(s(x?.v))}</span>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="ri-ship">
                    {(v.rv?.ship || []).map((x: any, $index: number) => (
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
                          <th>{tx('Charge head')}</th>
                          <th className="r">{tx('Quantity')}</th>
                          <th>{tx('UOM')}</th>
                          <th className="r">{tx('Unit Price')}</th>
                          <th>{tx('Currency')}</th>
                          <th className="r">{tx('Total excluding Tax')}</th>
                          <th className="r">{tx('Tax applicability')}</th>
                          <th className="r">{tx('Tax Amount')}</th>
                          <th className="r">{tx('Total Incl Tax')}</th>
                          <th aria-label={t('Row actions')} />
                        </tr>
                      </thead>
                      <tbody>
                        {(v.rv?.lines || []).map((l: any, $index: number) => (
                          <Fragment key={$index}>
                            <tr className={a(l?.cls)}>
                              <td className="w">
                                {l?.edit ? (
                                  <>
                                    <div className="ri-cb">
                                      <input
                                        className={`input ri-in ${s(l?.hErr)}`}
                                        style={{ width: '100%' }}
                                        role="combobox"
                                        aria-autocomplete="list"
                                        aria-expanded={a(l?.sugA)}
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
                                            {(l?.opts || []).map((o: any, $index: number) => (
                                              <Fragment key={$index}>
                                                <li role="option" id={a(o?.id)} aria-selected={a(o?.on)} onMouseDown={o?.pick}>
                                                  <span className="mono">{tx(s(o?.code))}</span>
                                                  {tx(s(o?.name))}
                                                </li>
                                              </Fragment>
                                            ))}
                                            {l?.none ? (
                                              <>
                                                <li className="none" role="option" aria-disabled="true">
                                                  {tx('No matching charge head')}
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
                                      className={`input ri-in num ${s(l?.qErr)}`}
                                      style={{ width: '72px' }}
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
                                    <div style={{ position: 'relative', width: '96px' }}>
                                      <select
                                        className={`select ri-in ${s(l?.uErr)}`}
                                        style={{ width: '100%' }}
                                        value={s(l?.uom)}
                                        aria-label={t('UOM')}
                                        onChange={l?.onUom}
                                      >
                                        <option value="">{tx('Select')}</option>
                                        {(v.rv?.uoms || []).map((o: any, $index: number) => (
                                          <Fragment key={$index}>
                                            <option value={a(o)}>{tx(s(o))}</option>
                                          </Fragment>
                                        ))}
                                      </select>
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
                                        style={{
                                          position: 'absolute',
                                          insetInlineEnd: '10px',
                                          top: '50%',
                                          marginTop: '-8px',
                                          pointerEvents: 'none',
                                          color: 'var(--muted)',
                                        }}
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
                                      className={`input ri-in num ${s(l?.pErr)}`}
                                      style={{ width: '104px' }}
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
                                    <div style={{ position: 'relative', width: '96px' }}>
                                      <select
                                        className={`select ri-in ${s(l?.cErr)}`}
                                        style={{ width: '100%' }}
                                        value={s(l?.cur)}
                                        aria-label={t('Currency')}
                                        onChange={l?.onCur}
                                      >
                                        <option value="">{tx('Select')}</option>
                                        {(v.rv?.curs || []).map((o: any, $index: number) => (
                                          <Fragment key={$index}>
                                            <option value={a(o)}>{tx(s(o))}</option>
                                          </Fragment>
                                        ))}
                                      </select>
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
                                        style={{
                                          position: 'absolute',
                                          insetInlineEnd: '10px',
                                          top: '50%',
                                          marginTop: '-8px',
                                          pointerEvents: 'none',
                                          color: 'var(--muted)',
                                        }}
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
                  <div style={{ marginTop: '12px' }}>
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
                      {tx('Add charges')}
                    </button>
                  </div>
                  <div className="ri-bt">
                    <div>
                      <div className="k">{tx('Bank details')}</div>
                      <div className="ri-kv">
                        {(v.rv?.bank || []).map((x: any, $index: number) => (
                          <Fragment key={$index}>
                            <span>{tx(s(x?.k))}</span>
                            <span>{tx(s(x?.v))}</span>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                    <div className="ri-tot">
                      {(v.rv?.totals || []).map((t: any, $index: number) => (
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '4px' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <input type="checkbox" className="cbx" checked={b(v.decl)} disabled={b(v.rv?.hasErr)} onChange={v.toggleDecl} />
                  <span>
                    <b style={{ color: 'var(--accent2)' }}>{tx('Declaration:')}</b>{' '}
                    {tx('I confirm the customer, charges, currency and tax details.')}
                  </span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button className="btn" onClick={clk(v.rvCancel)}>
                    {tx('Cancel')}
                  </button>
                  <button className="btn" onClick={clk(v.rvSave)}>
                    {tx('Save')}
                  </button>
                  <button className="btn" disabled={b(v.rv?.noErr)} onClick={clk(v.rvResolve)}>
                    {tx('Resolve errors')}
                  </button>
                  <button className="btn btn-primary" disabled={b(v.rvGenDis)} onClick={clk(v.rvGenerate)}>
                    {tx('Generate invoice')}
                  </button>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{tx(s(v.rvHint))}</span>
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
            {(v.menuItems || []).map((m: any, $index: number) => (
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
          <div className={`dlg ${s(v.dlgCls)}`} role="dialog" aria-modal="true" aria-label={t(s(v.dlgTitle))}>
            {v.dConf ? (
              <>
                <div className="db conf" style={{ padding: '32px 40px 8px' }}>
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
                  <h2 style={{ margin: '4px 0 0', fontSize: '22px', lineHeight: '28px' }}>{tx(s(v.dlgTitle))}</h2>
                  <p style={{ margin: '0', color: 'var(--muted)', fontSize: '14px' }}>
                    {tx(s(v.confText))}
                    <br />
                    {tx('No approval workflow applies to invoice generation.')}
                  </p>
                  <div style={{ alignSelf: 'stretch', height: '1px', background: 'var(--line2)', margin: '8px 0' }} />
                  <div style={{ alignSelf: 'stretch', textAlign: 'start', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '14px' }}>{tx('Where applicable:')}</span>
                    <ul>
                      <li>{tx('The invoice will be submitted for e-invoice processing.')}</li>
                      <li>{tx('The invoice will be sent to configured customer channels.')}</li>
                      <li>{tx('The invoice will be posted to GFS.')}</li>
                    </ul>
                  </div>
                </div>
                <div className="df" style={{ justifyContent: 'center', background: 'var(--surface)', border: '0', paddingBottom: '28px' }}>
                  <button className="btn" onClick={clk(v.closeDlg)}>
                    {tx('Back')}
                  </button>
                  <button className="btn btn-primary" onClick={clk(v.doGenerate)}>
                    {tx('Generate')}
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
                    {tx('Close')}
                  </button>
                </div>
                <div className="db">
                  {v.dDetails ? (
                    <>
                      <div className="kv3">
                        {(v.det?.fields || []).map((f: any, $index: number) => (
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
                            <th>{tx('Charge Code')}</th>
                            <th className="num">{tx('Charge Amount')}</th>
                            <th>{tx('Currency')}</th>
                            <th>{tx('ROE')}</th>
                            <th>{tx('Tax Code')}</th>
                            <th>{tx('Audit ID')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(v.det?.lines || []).map((l: any, $index: number) => (
                            <Fragment key={$index}>
                              <tr>
                                <td className="mono">
                                  {tx(s(l?.chg))}{' '}
                                  <span className="mu" style={{ fontFamily: 'inherit' }}>
                                    {tx(`· ${s(l?.name)}`)}
                                  </span>
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
                        {(v.prf?.rows || []).map((r: any, $index: number) => (
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
                            {(v.gen?.kv || []).map((f: any, $index: number) => (
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
                            {(v.gen?.fields || []).map((x: any, $index: number) => (
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
                                      <div style={{ position: 'relative' }}>
                                        <select className="select" value={s(x?.val)} onChange={x?.on}>
                                          {x?.hasPh ? (
                                            <>
                                              <option value="">{tx(s(x?.ph))}</option>
                                            </>
                                          ) : null}
                                          {(x?.opts || []).map((o: any, $index: number) => (
                                            <Fragment key={$index}>
                                              <option value={a(o?.v)}>{tx(s(o?.label))}</option>
                                            </Fragment>
                                          ))}
                                        </select>
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
                                          style={{
                                            position: 'absolute',
                                            insetInlineEnd: '10px',
                                            top: '50%',
                                            marginTop: '-8px',
                                            pointerEvents: 'none',
                                            color: 'var(--muted)',
                                          }}
                                        >
                                          <path d="M6 9l6 6 6-6" />
                                        </svg>
                                      </div>
                                    </>
                                  ) : null}
                                  {x?.isText ? (
                                    <>
                                      <textarea
                                        className="input"
                                        style={{ height: '72px', paddingTop: '8px', resize: 'vertical' }}
                                        value={s(x?.val)}
                                        onChange={x?.on}
                                      />
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
                          <span
                            className="l"
                            style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              letterSpacing: '.05em',
                              color: 'var(--muted)',
                            }}
                          >
                            {tx(s(v.gen?.tblTitle))}
                          </span>
                          <table className="at ctab">
                            <thead>
                              <tr>
                                {(v.gen?.cols || []).map((c: any, $index: number) => (
                                  <Fragment key={$index}>
                                    <th className={a(c?.cls)}>{tx(s(c?.v))}</th>
                                  </Fragment>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {(v.gen?.rows || []).map((r: any, $index: number) => (
                                <Fragment key={$index}>
                                  <tr>
                                    {(r?.cells || []).map((c: any, $index: number) => (
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
                            {(v.tbl?.cols || []).map((c: any, $index: number) => (
                              <Fragment key={$index}>
                                <th>{tx(s(c))}</th>
                              </Fragment>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(v.tbl?.rows || []).map((r: any, $index: number) => (
                            <Fragment key={$index}>
                              <tr>
                                {(r?.cells || []).map((c: any, $index: number) => (
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
                        {tx('Channel')}
                        <div className="seg" role="group" aria-label={t('Channel')}>
                          {(v.chans || []).map((c: any, $index: number) => (
                            <Fragment key={$index}>
                              <button aria-pressed={a(c?.on)} onClick={clk(c?.pick)}>
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
                        {tx('Message')} <span className="hint">{tx('Optional')}</span>
                        <textarea
                          className="input"
                          style={{ height: '80px', paddingTop: '8px', resize: 'vertical' }}
                          value={s(v.f?.msg)}
                          onChange={v.f?.onMsg}
                        />
                      </label>{' '}
                      <span className="mu">{tx(`Attachments: ${s(v.attach)}`)}</span>{' '}
                    </>
                  ) : null}
                  {v.dCn ? (
                    <>
                      <div className="g2">
                        <div className="fld">
                          {tx('Credit Type')}
                          <div className="seg" role="group" aria-label={t('Credit Type')}>
                            {(v.ctypes || []).map((c: any, $index: number) => (
                              <Fragment key={$index}>
                                <button aria-pressed={a(c?.on)} onClick={clk(c?.pick)}>
                                  {tx(s(c?.label))}
                                </button>
                              </Fragment>
                            ))}
                          </div>
                        </div>
                        <label className="fld">
                          {tx('Reason Code')}
                          <div style={{ position: 'relative' }}>
                            <select className="select" value={s(v.f?.reason)} onChange={v.f?.onReason}>
                              <option value="">{tx('Select reason')}</option>
                              {(v.reasons || []).map((o: any, $index: number) => (
                                <Fragment key={$index}>
                                  <option value={a(o)}>{tx(s(o))}</option>
                                </Fragment>
                              ))}
                            </select>
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
                              style={{
                                position: 'absolute',
                                insetInlineEnd: '10px',
                                top: '50%',
                                marginTop: '-8px',
                                pointerEvents: 'none',
                                color: 'var(--muted)',
                              }}
                            >
                              <path d="M6 9l6 6 6-6" />
                            </svg>
                          </div>
                          {v.f?.reasonErr ? (
                            <>
                              <span className="err">{tx('Choose a reason code')}</span>
                            </>
                          ) : null}
                        </label>{' '}
                        <label className="fld">
                          {tx('Credit Amount')}
                          <input className="input mono" value={s(v.f?.amount)} disabled={b(v.f?.full)} onChange={v.f?.onAmount} />
                          <span className="hint">{tx(s(v.amountHint))}</span>
                          {v.f?.amountErr ? (
                            <>
                              <span className="err">{tx(s(v.f?.amountErrText))}</span>
                            </>
                          ) : null}
                        </label>{' '}
                        <label className="fld">
                          {tx('FCA/DAR Reference')} <span className="hint">{tx('Required for FCA approval and DAR waiver')}</span>
                          <input className="input mono" value={s(v.f?.ref)} onChange={v.f?.onRef} />
                          {v.f?.refErr ? (
                            <>
                              <span className="err">{tx('Enter the FCA or DAR reference')}</span>
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
                        {tx('Reason')}
                        <textarea
                          className="input"
                          style={{ height: '80px', paddingTop: '8px', resize: 'vertical' }}
                          value={s(v.f?.why)}
                          onChange={v.f?.onWhy}
                        />
                        {v.f?.whyErr ? (
                          <>
                            <span className="err">{tx('A reason is required')}</span>
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
                        {tx('All actions')}
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
                            {tx('Cancel proforma')}
                          </button>
                        </>
                      ) : null}
                      {v.prf?.canPaid ? (
                        <>
                          <button className="btn" onClick={clk(v.prf?.transfer)}>
                            {tx('Booking cancelled · transfer payment')}
                          </button>
                          <button className="btn btn-primary" onClick={clk(v.prf?.convert)}>
                            {tx('Convert to final + debit note')}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </>
                ) : null}
                {v.dlgDl ? (
                  <>
                    <div className="df">
                      <span className="mu" style={{ marginInlineEnd: 'auto' }}>
                        {tx('Download')}
                      </span>
                      <button className="btn btn-sm" onClick={clk(v.dl?.pdf)}>
                        {tx('PDF')}
                      </button>
                      <button className="btn btn-sm" onClick={clk(v.dl?.xls)}>
                        {tx('Excel')}
                      </button>
                      <button className="btn btn-sm" onClick={clk(v.dl?.csv)}>
                        {tx('CSV')}
                      </button>
                    </div>
                  </>
                ) : null}
                {v.dlgAct ? (
                  <>
                    <div className="df">
                      <button className="btn" onClick={clk(v.closeDlg)}>
                        {tx('Cancel')}
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
    </Page>
  );
}
