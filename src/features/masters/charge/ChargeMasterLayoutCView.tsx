import { Fragment } from 'react';
import { Page } from '../../../app/shell/Page';
import { AppLink } from '../../../components/AppLink';
import { useI18n } from '../../../i18n/context';
import { a, b, clk, s, sx } from '../../../lib/view';
import { MasterKitOverlays } from '../MasterKitOverlays';

/* Charge master, layout C.
   Markup ported from the GIRS prototype; values and handlers come from the screen view-model (v). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ChargeMasterLayoutCView({ v }: { v: any }) {
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
            <h1 style={{ margin: '0', fontSize: '17px', fontWeight: '600', lineHeight: '22px' }}>{tx('Charge Master')}</h1>
            <p style={{ margin: '0', fontSize: '12px', lineHeight: '16px', color: 'var(--muted)' }}>
              {tx('Charge codes, categories, applicability, tax mapping and LMS charge-code alignment')}
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
                  href="charge-master-c.html"
                  aria-current="page"
                  title={t('Recommended \u00b7 present to client first')}
                >
                  <span className="recst" aria-hidden="true">
                    {tx('★')}
                  </span>
                  {tx('C · Tabs')}
                </AppLink>
                <AppLink className="lay rec" href="charge-master-d.html" title={t('Recommended \u00b7 present to client first')}>
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
              {tx('New charge')}
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
              placeholder={t('Search charge code, name or LMS code')}
              value={s(v.q)}
              aria-label={t('Search charges')}
              onChange={v.onQ}
            />
            <div className="r-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                role="radiogroup"
                aria-label={t('Active status')}
                style={{ display: 'flex', gap: '2px', padding: '2px', borderRadius: '6px', background: 'var(--neutral)' }}
              >
                {(v.segs || []).map((g: any, $index: number) => (
                  <Fragment key={$index}>
                    <button
                      className="seg"
                      role="radio"
                      aria-checked={a(g?.on)}
                      style={sx(`height: 28px; background: ${s(g?.bg)}; color: ${s(g?.fg)}; box-shadow: ${s(g?.sh)}`)}
                      onClick={clk(g?.pick)}
                    >
                      {tx(s(g?.label))}
                    </button>
                  </Fragment>
                ))}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{tx(s(v.countText))}</span>
            </div>
          </div>
          <div role="listbox" aria-label={t('Charges')} style={{ flex: '1 1 auto', overflow: 'auto' }}>
            <div style={{ padding: '12px 16px 4px', fontSize: '12px', color: 'var(--muted)' }}>
              {tx(`${s(v.catCount)} charge categories`)}
            </div>
            <div style={{ padding: '0 8px 12px' }}>
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
                      <span style={{ flex: '1 1 auto' }}>{tx(s(g?.name))}</span>
                      {g?.hasOff ? (
                        <>
                          <span
                            title={t('Contains inactive charges')}
                            style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '500' }}
                          >
                            {tx(s(g?.offTxt))}
                          </span>
                        </>
                      ) : null}
                      <span
                        className="mono"
                        style={{ fontSize: '12px', fontWeight: '500', color: 'var(--muted)', minWidth: '16px', textAlign: 'end' }}
                      >
                        {tx(s(g?.n))}
                      </span>
                    </button>
                    {g?.open ? (
                      <>
                        {(g?.rows || []).map((r: any, $index: number) => (
                          <Fragment key={$index}>
                            {' '}
                            <button className="cbtn" role="option" aria-selected={a(r?.on)} style={sx(s(r?.sel))} onClick={clk(r?.pick)}>
                              <span className="mono r-col" style={{ flex: '0 0 52px' }}>
                                {tx(s(r?.code))}
                              </span>{' '}
                              <span
                                style={sx(
                                  `flex: 1 1 auto; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: ${s(r?.fg)}`,
                                )}
                              >
                                {tx(s(r?.name))}
                              </span>
                              {r?.off ? (
                                <>
                                  <span
                                    title={t('Inactive')}
                                    style={{ flex: 'none', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--muted4)' }}
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
            </div>
            {v.empty ? (
              <>
                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--muted)' }}>
                  {tx('No charge matches your search')}
                </div>
              </>
            ) : null}
          </div>
        </section>
        <section className="card" style={{ flex: '1 1 auto', minWidth: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="r-wrap" style={{ padding: '24px 28px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              className="mono"
              aria-hidden="true"
              style={{
                minWidth: '56px',
                height: '56px',
                padding: '0 10px',
                borderRadius: '12px',
                background: 'var(--tint)',
                color: 'var(--accent2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                fontWeight: '600',
                boxSizing: 'border-box',
              }}
            >
              {tx(s(v.c?.code))}
            </div>
            <div style={{ flex: '1 1 auto', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: '0', fontSize: '22px', fontWeight: '600', lineHeight: '28px' }}>{tx(s(v.c?.name))}</h2>
                <span className="chip" style={sx(s(v.c?.stChip))}>
                  {tx(s(v.c?.st))}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{tx(`${s(v.c?.cat)} · Effective ${s(v.c?.eff)}`)}</div>
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
          <div style={{ display: 'flex', padding: '0 28px 20px' }}>
            <div className="fact">
              <span className="l">{tx('Origin / Destination')}</span>
              <span className="v">{tx(s(v.c?.app))}</span>
            </div>
            <div className="fact">
              <span className="l">{tx('Port / Country')}</span>
              <span className="v">{tx(s(v.c?.where))}</span>
            </div>
            <div className="fact">
              <span className="l">{tx('Tax code')}</span>
              <span className="v mono">{tx(s(v.c?.tax))}</span>
            </div>
            <div className="fact">
              <span className="l">{tx('Currency')}</span>
              <span className="v mono">{tx(s(v.c?.ccy))}</span>
            </div>
            <div className="fact">
              <span className="l">{tx('LMS mapping')}</span>
              <span className="v mono" style={sx(`color: ${s(v.c?.lmsFg)}`)}>
                {tx(s(v.c?.lms))}
              </span>
            </div>
          </div>
          <div
            className="r-wrap"
            role="tablist"
            aria-label={t('Charge sections')}
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
            {(v.panel || []).map((x: any, $index: number) => (
              <Fragment key={$index}>
                <div style={{ maxWidth: '760px', marginBottom: '28px' }}>
                  <h3 className="sech">{tx(s(x?.title))}</h3>
                  {x?.isKv ? (
                    <>
                      <div className="kv2">
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
                  {x?.isList ? (
                    <>
                      {(x?.items || []).map((i: any, $index: number) => (
                        <Fragment key={$index}>
                          <div className="mini">
                            <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span className="ph">{tx(s(i?.a))}</span>
                              <span style={{ fontSize: '12px' }} className="ph">
                                {tx(s(i?.b))}
                              </span>
                            </span>
                          </div>
                        </Fragment>
                      ))}
                    </>
                  ) : null}
                  {x?.isAudit ? (
                    <>
                      {(x?.items || []).map((i: any, $index: number) => (
                        <Fragment key={$index}>
                          <div className="tl">
                            <div style={{ fontWeight: '500' }}>{tx(s(i?.a))}</div>
                            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{tx(`${s(i?.b)} · ${s(i?.c)}`)}</div>
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
    </Page>
  );
}
