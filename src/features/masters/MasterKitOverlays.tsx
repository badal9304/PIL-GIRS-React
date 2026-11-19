import { Fragment } from 'react';
import { useI18n } from '../../i18n/context';
import { a, clk, s } from '../../lib/view';

/* Dialogs and drawers of the master-data kit (record history, create / edit drawer, confirmation),
   shared by every master screen. Values come from the screen view-model (v.kit). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function MasterKitOverlays({ v }: { v: any }) {
  const { t, tx } = useI18n();
  return (
    <>
      {v.kit?.isHist ? (
        <>
          {' '}
          <button className="kback" aria-label={t('Close')} onClick={clk(v.kit?.close)} />
          <div className="kmodal" role="dialog" aria-modal="true" aria-labelledby="khist-t">
            <div className="khead">
              <div className="flex-auto min-w-0">
                <h2 id="khist-t">{tx(s(v.kit?.hist?.title))}</h2>
                <p>{tx(s(v.kit?.hist?.sub))}</p>
              </div>
              <button className="btn btn-sm kib" aria-label={t('Close')} onClick={clk(v.kit?.close)}>
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
            </div>
            <div className="ktool">
              <span className="flex-auto">{tx(s(v.kit?.hist?.count))}</span> <span>{tx('Download')}</span>{' '}
              <button className="btn btn-sm" onClick={clk(v.kit?.hist?.pdf)}>
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
                  <path d="M12 4v11" />
                  <path d="M7 10l5 5 5-5" />
                  <path d="M4 20h16" />
                </svg>
                {tx('PDF')}
              </button>{' '}
              <button className="btn btn-sm" onClick={clk(v.kit?.hist?.xls)}>
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
                  <path d="M12 4v11" />
                  <path d="M7 10l5 5 5-5" />
                  <path d="M4 20h16" />
                </svg>
                {tx('Excel')}
              </button>{' '}
              <button className="btn btn-sm" onClick={clk(v.kit?.hist?.csv)}>
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
                  <path d="M12 4v11" />
                  <path d="M7 10l5 5 5-5" />
                  <path d="M4 20h16" />
                </svg>
                {tx('CSV')}
              </button>{' '}
              <button className="btn btn-sm" onClick={clk(v.kit?.hist?.print)}>
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
                  <path d="M6 9V3h12v6" />
                  <rect x="3" y="9" width="18" height="8" rx="2" />
                  <path d="M6 14h12v7H6z" />
                </svg>
                {tx('Print')}
              </button>
            </div>
            <div className="kbody p-0">
              <table className="ktbl">
                <thead>
                  <tr>
                    {(v.kit?.hist?.cols || []).map((c: any, $index: number) => (
                      <Fragment key={$index}>
                        <th>{tx(s(c))}</th>
                      </Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(v.kit?.hist?.rows || []).map((r: any, $index: number) => (
                    <Fragment key={$index}>
                      <tr>
                        {(r || []).map((c: any, $index: number) => (
                          <Fragment key={$index}>
                            <td>{tx(s(c))}</td>
                          </Fragment>
                        ))}
                      </tr>
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
      {v.kit?.isForm ? (
        <>
          {' '}
          <button className="kback" aria-label={t('Close')} onClick={clk(v.kit?.close)} />
          <aside className="kdrawer" role="dialog" aria-modal="true" aria-labelledby="kform-t">
            <div className="khead">
              <div className="flex-auto min-w-0">
                <h2 id="kform-t">{tx(s(v.kit?.form?.title))}</h2>
                <p>{tx(s(v.kit?.form?.sub))}</p>
              </div>
              <button className="btn btn-sm kib" aria-label={t('Close')} onClick={clk(v.kit?.close)}>
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
            </div>
            <div className="kbody">
              {v.kit?.form?.hasNote ? (
                <>
                  <div className="kbanner">{tx(s(v.kit?.form?.note))}</div>
                </>
              ) : null}
              {v.kit?.form?.hasErr ? (
                <>
                  <div className="kbanner err" role="alert">
                    {tx(s(v.kit?.form?.errText))}
                  </div>
                </>
              ) : null}
              {(v.kit?.form?.secs || []).map((g: any, $index: number) => (
                <Fragment key={$index}>
                  <fieldset className="kfs">
                    <legend>{tx(s(g?.title))}</legend>
                    <div className="kgrid">
                      {(g?.fields || []).map((f: any, $index: number) => (
                        <Fragment key={$index}>
                          {' '}
                          <label className={a(f?.cls)}>
                            <span className="kl">
                              {tx(s(f?.label))}
                              {f?.req ? (
                                <>
                                  <b aria-hidden="true">{tx('*')}</b>
                                </>
                              ) : null}
                            </span>
                            {f?.isText ? (
                              <>
                                <input
                                  className="input"
                                  type={a(f?.type)}
                                  value={s(f?.v)}
                                  placeholder={t(s(f?.ph))}
                                  aria-required={a(f?.reqA)}
                                  aria-invalid={a(f?.bad)}
                                  onChange={f?.on}
                                />
                              </>
                            ) : null}
                            {f?.isArea ? (
                              <>
                                <textarea
                                  className="input"
                                  rows={3}
                                  value={s(f?.v)}
                                  placeholder={a(f?.ph)}
                                  aria-required={a(f?.reqA)}
                                  aria-invalid={a(f?.bad)}
                                  onChange={f?.on}
                                />
                              </>
                            ) : null}
                            {f?.isSel ? (
                              <>
                                <span className="relative block">
                                  <select
                                    className="select"
                                    value={s(f?.v)}
                                    aria-required={a(f?.reqA)}
                                    aria-invalid={a(f?.bad)}
                                    onChange={f?.on}
                                  >
                                    {(f?.opts || []).map((o: any, $index: number) => (
                                      <Fragment key={$index}>
                                        <option value={a(o?.v)}>{tx(s(o?.t))}</option>
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
                                </span>
                              </>
                            ) : null}
                            {f?.isRO ? (
                              <>
                                <span className="kro">{tx(s(f?.v))}</span>
                              </>
                            ) : null}
                            {f?.hasErr ? (
                              <>
                                <span className="ke">{tx(s(f?.err))}</span>
                              </>
                            ) : null}
                            {f?.hasHint ? (
                              <>
                                <span className="kh">{tx(s(f?.hint))}</span>
                              </>
                            ) : null}
                          </label>{' '}
                        </Fragment>
                      ))}
                    </div>
                  </fieldset>
                </Fragment>
              ))}
            </div>
            <div className="kfoot">
              <span className="flex-auto text-[12px] text-muted">{tx(s(v.kit?.form?.foot))}</span>{' '}
              <button className="btn" onClick={clk(v.kit?.close)}>
                {tx('Cancel')}
              </button>{' '}
              <button className="btn btn-primary" onClick={clk(v.kit?.form?.submit)}>
                {tx(s(v.kit?.form?.cta))}
              </button>
            </div>
          </aside>
        </>
      ) : null}
      {v.kit?.isConfirm ? (
        <>
          {' '}
          <button className="kback" aria-label={t('Close')} onClick={clk(v.kit?.close)} />
          <div className="kmodal sm" role="alertdialog" aria-modal="true" aria-labelledby="kconf-t">
            <div className="khead">
              <div className="flex-auto min-w-0">
                <h2 id="kconf-t">{tx(s(v.kit?.conf?.title))}</h2>
                <p>{tx(s(v.kit?.conf?.sub))}</p>
              </div>
            </div>
            <div className="kbody">
              <p className="mt-0 mb-3.5 mx-0 text-[13px] leading-[20px]">{tx(s(v.kit?.conf?.text))}</p>
              <label className="kf">
                <span className="kl">
                  {tx('Reason')}
                  <b aria-hidden="true">{tx('*')}</b>
                </span>
                <textarea
                  className="input"
                  rows={3}
                  value={s(v.kit?.conf?.reason)}
                  placeholder="Why is this needed?"
                  aria-required="true"
                  onChange={v.kit?.conf?.onReason}
                />
                {v.kit?.conf?.hasErr ? (
                  <>
                    <span className="ke">{tx('Enter a reason')}</span>
                  </>
                ) : null}
              </label>
            </div>
            <div className="kfoot">
              <button className="btn" onClick={clk(v.kit?.close)}>
                {tx('Cancel')}
              </button>{' '}
              <button className="btn kbtn-danger" onClick={clk(v.kit?.conf?.ok)}>
                {tx(s(v.kit?.conf?.cta))}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
