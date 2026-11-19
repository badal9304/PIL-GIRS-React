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
            <h1 style={{ margin: '0', fontSize: '17px', fontWeight: '600', lineHeight: '22px' }}>{tx('Customer Master')}</h1>
            <p style={{ margin: '0', fontSize: '12px', lineHeight: '16px', color: 'var(--muted)' }}>
              {tx('CMD set-up · customer codes grouped at parent / legal-entity level · sourced from LMS Customer Master Data')}
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
            <nav aria-label={t('Layout options')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{tx('Layout')}</span>
              <div style={{ display: 'flex', gap: '2px', padding: '2px', borderRadius: '6px', background: 'var(--neutral)' }}>
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
            <span className="chip" style={{ background: 'var(--warnbg)', color: 'var(--warn)', height: '32px', borderRadius: '6px' }}>
              {tx('Sample values')}
            </span>
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
          </div>
        </div>
      }
      overlays={<MasterKitOverlays v={v} />}
    >
      <div className="r-wrap" style={{ flex: '1 1 auto', minHeight: '0', display: 'flex', gap: '16px', alignItems: 'stretch' }}>
        <section
          className="card r-col"
          style={{ flex: '0 0 340px', minWidth: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid var(--line)' }}>
            <input
              className="input"
              style={{ width: '100%' }}
              placeholder={t('Search group, code or name')}
              value={s(v.q)}
              aria-label={t('Search customers')}
              onChange={v.onQ}
            />
          </div>
          <div style={{ padding: '12px 16px 4px', fontSize: '12px', color: 'var(--muted)' }}>
            {tx(`${s(v.groupCount)} parent customer groups`)}
          </div>
          <nav aria-label={t('Customer groups')} style={{ flex: '1 1 auto', overflow: 'auto', padding: '0 8px 12px' }}>
            {(v.tree || []).map((g: any, $index: number) => (
              <Fragment key={$index}>
                <div>
                  <button className="gbtn" aria-expanded={a(g?.open)} onClick={clk(g?.toggle)}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={sx(`transform: rotate(${s(g?.rot)}); transition: transform .15s`)}
                    >
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                    <span style={{ flex: '1 1 auto' }}>{tx(s(g?.name))}</span>
                    <span className="mono" style={{ fontSize: '12px', fontWeight: '500', color: 'var(--muted)' }}>
                      {tx(s(g?.n))}
                    </span>
                  </button>
                  {g?.isOpen ? (
                    <>
                      {(g?.kids || []).map((k: any, $index: number) => (
                        <Fragment key={$index}>
                          {' '}
                          <button className="cbtn" aria-current={a(k?.cur)} style={sx(s(k?.sel))} onClick={clk(k?.pick)}>
                            <span className="mono" style={{ flex: '0 0 auto' }}>
                              {tx(s(k?.code))}
                            </span>
                            <span style={{ flex: '1 1 auto', color: 'var(--muted)' }}>{tx(s(k?.ctry))}</span>
                            {k?.flag ? (
                              <>
                                <span className="sr">{tx(s(k?.st))}</span>
                              </>
                            ) : null}
                            {k?.flag ? (
                              <>
                                <span
                                  style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--badbar)' }}
                                  title={t(s(k?.st))}
                                />
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
        <div style={{ flex: '1 1 auto', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <section
            className="card"
            style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '40px', background: 'var(--hover2)' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '0' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{tx('Parent customer group')}</span>
              <span style={{ fontSize: '16px', fontWeight: '600' }}>{tx(s(v.grp?.name))}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{tx('Legal entity name')}</span>
              <span>{tx(s(v.grp?.legal))}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{tx('Registration / Tax ID')}</span>
              <span className="mono">{tx(s(v.grp?.tax))}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{tx('Customer codes')}</span>
              <span className="mono">{tx(s(v.grp?.n))}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{tx('Invoicing arrangement')}</span>
              <span>
                <span className="chip" style={sx(s(v.grp?.arrChip))}>
                  {tx(s(v.grp?.arr))}
                </span>
              </span>
            </div>
            <span style={{ marginInlineStart: 'auto', fontSize: '12px', color: 'var(--muted)', maxWidth: '260px', textAlign: 'end' }}>
              {tx('Grouping drives invoicing, reporting and credit management')}
            </span>
          </section>
          <section
            className="card"
            style={{ flex: '1 1 auto', minHeight: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            <div className="r-wrap" style={{ padding: '20px 28px 18px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                aria-hidden="true"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  background: 'var(--tint)',
                  color: 'var(--accent2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: '600',
                  flex: '0 0 auto',
                }}
              >
                {tx(s(v.c?.ini))}
              </div>
              <div style={{ flex: '1 1 auto', minWidth: '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ margin: '0', fontSize: '20px', fontWeight: '600', lineHeight: '28px' }}>{tx(s(v.c?.name))}</h2>
                  <span className="chip" style={sx(s(v.c?.chip))}>
                    {tx(s(v.c?.st))}
                  </span>
                </div>
                <div style={{ marginTop: '2px', fontSize: '13px', color: 'var(--muted)' }}>
                  <span className="mono" style={{ color: 'var(--ink)' }}>
                    {tx(s(v.c?.code))}
                  </span>{' '}
                  {tx(`· ${s(v.c?.ctryName)} · LMS CMD ref`)} <span className="mono">{tx(s(v.c?.ref))}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '32px', flex: '0 0 auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{tx('Credit terms')}</span>
                  <span style={{ fontWeight: '500' }}>{tx(s(v.c?.terms))}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{tx('Default billing party')}</span>
                  <span style={{ fontWeight: '500' }}>{tx(s(v.c?.defParty))}</span>
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
                  role="status"
                  style={{
                    margin: '0 28px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    minHeight: '40px',
                    padding: '0 14px',
                    borderRadius: '8px',
                    background: 'var(--badbg)',
                    border: '1px solid var(--badbd)',
                    color: 'var(--bad)',
                    fontWeight: '500',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v6M12 16.5v.5" />
                  </svg>
                  {tx(`Sanction / Blacklist status: ${s(v.c?.st)}`)}
                </div>
              </>
            ) : null}
            <div
              className="r-wrap"
              role="tablist"
              aria-label={t('Customer sections')}
              style={{ display: 'flex', gap: '28px', padding: '0 28px', borderBottom: '1px solid var(--line)' }}
            >
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
                    <span className="mono" style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {tx(s(t?.count))}
                    </span>
                  </button>{' '}
                </Fragment>
              ))}
            </div>
            <div role="tabpanel" style={{ flex: '1 1 auto', overflow: 'auto', padding: '24px 28px' }}>
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
                  <div className="card" style={{ overflow: 'hidden' }}>
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
                                    <span className="chip" style={{ background: 'var(--tint)', color: 'var(--accent2)' }}>
                                      {tx('Default')}
                                    </span>
                                  </>
                                ) : null}
                              </td>
                              <td style={{ color: 'var(--muted)' }}>{tx(s(b?.src))}</td>
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
                      <span className="v" style={{ display: 'flex', gap: '6px' }}>
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
