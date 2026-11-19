import { Fragment } from 'react';
import { Page } from '../../../app/shell/Page';
import { AppLink } from '../../../components/AppLink';
import { useI18n } from '../../../i18n/context';
import { a, b, clk, s, sx } from '../../../lib/view';
import { MasterKitOverlays } from '../MasterKitOverlays';

/* Contract master, layout C.
   Markup ported from the GIRS prototype; values and handlers come from the screen view-model (v). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ContractMasterLayoutCView({ v }: { v: any }) {
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
            <h1 style={{ margin: '0', fontSize: '17px', fontWeight: '600', lineHeight: '22px' }}>{tx('Contract Master')}</h1>
            <p style={{ margin: '0', fontSize: '12px', lineHeight: '16px', color: 'var(--muted)' }}>
              {tx('Customer-specific rates, tax set-up and configurable admin fee per contract')}
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
                  href="contract-master-c.html"
                  aria-current="page"
                  title={t('Recommended \u00b7 present to client first')}
                >
                  <span className="recst" aria-hidden="true">
                    {tx('★')}
                  </span>
                  {tx('C · Tabs')}
                </AppLink>
                <AppLink className="lay rec" href="contract-master-d.html" title={t('Recommended \u00b7 present to client first')}>
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
              {tx('New contract')}
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
          style={{ flex: '0 0 380px', minWidth: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--line)' }}>
            <input
              className="input"
              style={{ width: '100%' }}
              placeholder={t('Search contract no., customer or trade lane')}
              value={s(v.q)}
              aria-label={t('Search contracts')}
              onChange={v.onQ}
            />
            <div
              role="radiogroup"
              aria-label={t('Approval status')}
              style={{
                display: 'flex',
                gap: '2px',
                padding: '2px',
                borderRadius: '6px',
                background: 'var(--neutral)',
                alignSelf: 'flex-start',
              }}
            >
              {(v.segs || []).map((g: any, $index: number) => (
                <Fragment key={$index}>
                  <button
                    className="seg"
                    role="radio"
                    aria-checked={a(g?.on)}
                    style={sx(`background: ${s(g?.bg)}; color: ${s(g?.fg)}; box-shadow: ${s(g?.sh)}`)}
                    onClick={clk(g?.pick)}
                  >
                    {tx(s(g?.label))}
                  </button>
                </Fragment>
              ))}
            </div>
          </div>
          <div style={{ padding: '12px 16px 4px', fontSize: '12px', color: 'var(--muted)' }}>
            {tx(`${s(v.cusCount)} customers · ${s(v.countText)}`)}
          </div>
          <nav aria-label={t('Contracts by customer')} style={{ flex: '1 1 auto', overflow: 'auto', padding: '0 8px 12px' }}>
            {(v.groups || []).map((g: any, $index: number) => (
              <Fragment key={$index}>
                <div>
                  <button className="gbtn" aria-expanded={a(g?.ax)} onClick={clk(g?.tg)}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={sx(`flex: none; transform: rotate(${s(g?.rot)}); transition: transform .15s`)}
                    >
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                    <span style={{ flex: '1 1 auto', minWidth: '0', display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {tx(s(g?.name))}
                      </span>
                      <span className="mono" style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {tx(s(g?.code))}
                      </span>
                    </span>
                    <span className="mono" style={{ fontSize: '12px', fontWeight: '500', color: 'var(--muted)' }}>
                      {tx(s(g?.n))}
                    </span>
                  </button>
                  {g?.open ? (
                    <>
                      {(g?.rows || []).map((r: any, $index: number) => (
                        <Fragment key={$index}>
                          {' '}
                          <button className="cbtn" aria-current={a(r?.on)} style={sx(s(r?.sel))} onClick={clk(r?.pick)}>
                            <span style={{ flex: '1 1 auto', minWidth: '0', display: 'flex', flexDirection: 'column' }}>
                              <span className="mono">{tx(s(r?.no))}</span>
                              <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '400' }}>
                                {tx(`${s(r?.lane)} · ${s(r?.ver)}`)}
                              </span>
                            </span>{' '}
                            <span
                              title={t(s(r?.st))}
                              style={sx(`flex: none; width: 8px; height: 8px; border-radius: 50%; background: ${s(r?.dot)}`)}
                            />
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
                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--muted)' }}>{tx('No contracts match')}</div>
              </>
            ) : null}
          </nav>
        </section>
        <section className="card" style={{ flex: '1 1 auto', minWidth: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="r-wrap" style={{ padding: '22px 28px 18px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ flex: '1 1 auto', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 className="mono" style={{ margin: '0', fontSize: '22px', fontWeight: '600', lineHeight: '28px' }}>
                  {tx(s(v.h?.no))}
                </h2>
                <span className="chip" style={sx(s(v.h?.stChip))}>
                  {tx(s(v.h?.st))}
                </span>
                <span className="chip" style={sx(s(v.h?.vChip))}>
                  {tx(s(v.h?.vst))}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
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
          <div style={{ display: 'flex', padding: '0 28px 20px' }}>
            <div className="fact">
              <span className="l">{tx('Validity')}</span>
              <span className="v">{tx(s(v.h?.valid))}</span>
            </div>
            <div className="fact">
              <span className="l">{tx('Trade lane')}</span>
              <span className="v">{tx(s(v.h?.lane))}</span>
            </div>
            <div className="fact">
              <span className="l">{tx('Payment terms')}</span>
              <span className="v">{tx(s(v.h?.terms))}</span>
            </div>
            <div className="fact">
              <span className="l">{tx('Tax applicability')}</span>
              <span className="v">{tx(s(v.h?.tax))}</span>
            </div>
            <div className="fact">
              <span className="l">{tx('Admin fee')}</span>
              <span className="v" style={sx(`color: ${s(v.h?.admFg)}`)}>
                {tx(s(v.h?.adm))}
              </span>
            </div>
          </div>
          <div
            className="r-wrap"
            role="tablist"
            aria-label={t('Contract sections')}
            style={{ display: 'flex', gap: '28px', padding: '0 28px', borderBottom: '1px solid var(--line)' }}
          >
            {(v.tabs || []).map((t: any, $index: number) => (
              <Fragment key={$index}>
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
                </button>
              </Fragment>
            ))}
          </div>
          <div role="tabpanel" style={{ flex: '1 1 auto', overflow: 'auto', padding: '24px 28px' }}>
            {v.tRates ? (
              <>
                <div style={{ maxWidth: '900px' }}>
                  <h3 className="sech">{tx('Customer-specific rates')}</h3>
                  <table className="rt">
                    <thead>
                      <tr>
                        <th>{tx('Charge code')}</th>
                        <th>{tx('Charge name')}</th>
                        <th className="num">{tx('Rate')}</th>
                        <th>{tx('Currency')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(v.rl || []).map((r: any, $index: number) => (
                        <Fragment key={$index}>
                          <tr>
                            <td className="mono" style={{ fontWeight: '500' }}>
                              {tx(s(r?.code))}
                            </td>
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
                <div className="r-g2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', maxWidth: '1100px' }}>
                  <div>
                    <h3 className="sech">{tx('Admin fee')}</h3>
                    <div className="kv2">
                      {(v.akv || []).map((k: any, $index: number) => (
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
                    <h3 className="sech">{tx('Tax set-up')}</h3>
                    <div className="kv2">
                      {(v.tkv || []).map((k: any, $index: number) => (
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
                <div style={{ maxWidth: '760px' }}>
                  <h3 className="sech">{tx('Version history')}</h3>
                  {(v.vl || []).map((v: any, $index: number) => (
                    <Fragment key={$index}>
                      <div className="tl">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                          <span className="mono">{tx(s(v.v))}</span>
                          <span className="chip" style={sx(`${s(v.chip)}; height: 20px; padding: 0 8px`)}>
                            {tx(s(v.st))}
                          </span>
                          {v.cur ? (
                            <>
                              <span style={{ fontSize: '12px', color: 'var(--accent)' }}>{tx('Current')}</span>
                            </>
                          ) : null}
                        </div>
                        <div style={{ fontSize: '13px', marginTop: '2px' }}>{tx(s(v.what))}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{tx(`${s(v.by)} · ${s(v.at)}`)}</div>
                      </div>
                    </Fragment>
                  ))}
                </div>
              </>
            ) : null}
            {v.tDet ? (
              <>
                <div style={{ maxWidth: '900px' }}>
                  <h3 className="sech">{tx('Contract details')}</h3>
                  <div className="kv2">
                    {(v.dkv || []).map((k: any, $index: number) => (
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
    </Page>
  );
}
