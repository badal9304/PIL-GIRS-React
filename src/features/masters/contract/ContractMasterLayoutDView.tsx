import { Fragment } from 'react';
import { Page } from '../../../app/shell/Page';
import { AppLink } from '../../../components/AppLink';
import { useI18n } from '../../../i18n/context';
import { a, b, clk, s, sx } from '../../../lib/view';
import { MasterKitOverlays } from '../MasterKitOverlays';

/* Contract master, layout D.
   Markup ported from the GIRS prototype; values and handlers come from the screen view-model (v). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ContractMasterLayoutDView({ v }: { v: any }) {
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
                <AppLink className="lay rec" href="contract-master-c.html" title={t('Recommended \u00b7 present to client first')}>
                  <span className="recst" aria-hidden="true">
                    {tx('★')}
                  </span>
                  {tx('C · Tabs')}
                </AppLink>
                <AppLink
                  className="lay rec"
                  href="contract-master-d.html"
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
          style={{ flex: '0 0 340px', minWidth: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', borderBottom: '1px solid var(--line)' }}>
            <input
              className="input"
              style={{ width: '100%' }}
              placeholder={t('Search contract no., customer or trade lane')}
              value={s(v.q)}
              aria-label={t('Search')}
              onChange={v.onQ}
            />
            <div className="r-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div
                role="radiogroup"
                aria-label={t('Status')}
                style={{
                  display: 'flex',
                  gap: '2px',
                  padding: '2px',
                  borderRadius: '6px',
                  background: 'var(--neutral)',
                  minWidth: '0',
                  overflow: 'hidden',
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
          </div>
          <div
            className="r-wrap"
            style={{ padding: '10px 14px 4px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)' }}
          >
            <span>{tx(s(v.gCount))}</span>
            <span>{tx(s(v.countText))}</span>
          </div>
          <nav aria-label={t(s(v.gLabel))} style={{ flex: '1 1 auto', overflow: 'auto', padding: '0 6px 12px' }}>
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
                    <span style={{ flex: '1 1 auto', minWidth: '0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tx(s(g?.name))}
                    </span>
                    <span className="mono" style={{ fontSize: '12px', fontWeight: '500', color: 'var(--muted)' }}>
                      {tx(s(g?.n))}
                    </span>
                  </button>
                  {g?.open ? (
                    <>
                      {(g?.rows || []).map((x: any, $index: number) => (
                        <Fragment key={$index}>
                          {' '}
                          <button className="cbtn" aria-current={a(x?.on)} style={sx(s(x?.sel))} onClick={clk(x?.pick)}>
                            <span style={{ flex: '1 1 auto', minWidth: '0', display: 'flex', flexDirection: 'column' }}>
                              <span
                                className="mono"
                                style={{ fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                              >
                                {tx(s(x?.code))}
                              </span>
                              <span
                                style={{
                                  fontSize: '12px',
                                  color: 'var(--muted)',
                                  fontWeight: '400',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {tx(s(x?.title))}
                              </span>
                            </span>{' '}
                            <span
                              title={t(s(x?.st))}
                              style={sx(`flex: none; width: 8px; height: 8px; border-radius: 50%; background: ${s(x?.dot)}`)}
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
                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--muted)' }}>{tx('No records match')}</div>
              </>
            ) : null}
          </nav>
        </section>
        <section
          className="card"
          aria-label={t('Overview')}
          style={{ flex: '1 1 auto', minWidth: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          <div className="r-wrap" style={{ padding: '18px 24px 16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span
              className="mono"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '52px',
                height: '52px',
                padding: '0 12px',
                boxSizing: 'border-box',
                borderRadius: '12px',
                background: 'var(--tint)',
                color: 'var(--accent2)',
                fontSize: '14px',
                fontWeight: '600',
                flex: 'none',
              }}
            >
              {tx(s(v.h?.code))}
            </span>
            <div style={{ flex: '1 1 auto', minWidth: '0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: '0', fontSize: '20px', fontWeight: '600', lineHeight: '28px' }}>{tx(s(v.h?.title))}</h2>
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
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{tx(s(v.h?.sub))}</div>
            </div>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 'none' }}>
              <button className="btn btn-sm btn-icon" disabled={b(v.noPrev)} aria-label={t('Previous record')} onClick={clk(v.prev)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </button>
              <span className="mono" style={{ minWidth: '60px', textAlign: 'center', fontSize: '12px', color: 'var(--muted)' }}>
                {tx(s(v.pos))}
              </span>
              <button className="btn btn-sm btn-icon" disabled={b(v.noNext)} aria-label={t('Next record')} onClick={clk(v.next)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
              <span className="kbar" style={{ marginInlineStart: '4px' }} role="group" aria-label={t('Record actions')}>
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
                role="status"
                style={{
                  margin: '0 24px 14px',
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
          <div style={{ flex: '1 1 auto', overflow: 'auto', padding: '16px 24px 24px' }}>
            <div style={sx(`display: grid; grid-template-columns: ${s(v.railCols)}; gap: 16px; align-items: start`)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-2px' }}>
                  <button className="lnk" onClick={clk(v.allT)}>
                    {tx(s(v.allL))}
                  </button>
                </div>
                {(v.secs || []).map((x: any, $index: number) => (
                  <Fragment key={$index}>
                    <div className="ac">
                      <h3 style={{ margin: '0' }}>
                        <button className="ach" aria-expanded={a(x?.ax)} onClick={clk(x?.tg)}>
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
                            style={sx(`flex: none; transform: rotate(${s(x?.rot)}); transition: transform .15s`)}
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
                                    <div style={{ padding: '14px 20px', color: 'var(--muted4)', fontSize: '13px' }}>{tx('None')}</div>
                                  </>
                                ) : null}
                              </>
                            ) : null}
                            {x?.isTl ? (
                              <>
                                <div style={{ padding: '16px 20px' }}>
                                  {x?.hasNote ? (
                                    <>
                                      <div
                                        style={{
                                          marginBottom: '14px',
                                          padding: '10px 12px',
                                          borderRadius: '8px',
                                          background: 'var(--hover2)',
                                          fontSize: '12px',
                                          color: 'var(--muted)',
                                        }}
                                      >
                                        {tx(s(x?.note))}
                                      </div>
                                    </>
                                  ) : null}
                                  {(x?.tl || []).map((i: any, $index: number) => (
                                    <Fragment key={$index}>
                                      <div className={a(i?.cls)}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline', flexWrap: 'wrap' }}>
                                          <span style={sx(`font-size: 13px; font-weight: 500; color: ${s(i?.fg)}`)}>{tx(s(i?.a))}</span>
                                          <span style={{ fontSize: '13px' }}>{tx(s(i?.b))}</span>
                                          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{tx(s(i?.c))}</span>
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
                  <aside className="sc" style={{ position: 'sticky', top: '0' }} aria-label={t(s(v.h?.railTitle))}>
                    <h3>
                      <span className="dot" />
                      {tx(s(v.h?.railTitle))}
                    </h3>
                    <div style={{ padding: '16px' }}>
                      {v.h?.hasNote ? (
                        <>
                          <div
                            style={{
                              marginBottom: '14px',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              background: 'var(--hover2)',
                              fontSize: '12px',
                              color: 'var(--muted)',
                            }}
                          >
                            {tx(s(v.h?.railNote))}
                          </div>
                        </>
                      ) : null}
                      {(v.h?.rail || []).map((i: any, $index: number) => (
                        <Fragment key={$index}>
                          <div className={a(i?.cls)}>
                            <div style={sx(`font-size: 13px; font-weight: 500; color: ${s(i?.fg)}`)}>{tx(s(i?.a))}</div>
                            <div style={{ fontSize: '13px', marginTop: '1px' }}>{tx(s(i?.b))}</div>
                            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '1px' }}>{tx(s(i?.c))}</div>
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
