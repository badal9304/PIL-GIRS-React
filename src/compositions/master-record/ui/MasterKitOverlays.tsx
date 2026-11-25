'use client';

import { Fragment, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { usePhrase } from '@/shared/hooks/usePhrase';
import { a, aria, clk, s } from '@/shared/lib/bindings';
import type { MasterKitVals } from '@/shared/lib/master-kit/masterKit';

/* Dialogs and drawers of the master-data kit (record history, create / edit drawer, confirmation),
   shared by every master screen. Values come from the screen model (vals.kit). */
export function MasterKitOverlays({ kit }: { kit: MasterKitVals }): ReactNode {
  const { t } = useTranslation('masters');
  const { tx, tp } = usePhrase();
  return (
    <>
      {kit.isHist ? (
        <>
          {' '}
          <button className="ov" aria-label={t('Close')} onClick={clk(kit.close)} />
          <div className="dlg wide" role="dialog" aria-modal="true" aria-labelledby="khist-t">
            <div className="dh">
              <div className="flex-auto min-w-0">
                <h2 id="khist-t">{tx(s(kit.hist?.title))}</h2>
                <p>{tx(s(kit.hist?.sub))}</p>
              </div>
              <button className="btn btn-sm kib" aria-label={t('Close')} onClick={clk(kit.close)}>
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
              <span className="flex-auto">{tx(s(kit.hist?.count))}</span> <span>{t('Download')}</span>{' '}
              <button className="btn btn-sm" onClick={clk(kit.hist?.pdf)}>
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
                {t('PDF')}
              </button>{' '}
              <button className="btn btn-sm" onClick={clk(kit.hist?.xls)}>
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
                {t('Excel')}
              </button>{' '}
              <button className="btn btn-sm" onClick={clk(kit.hist?.csv)}>
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
                {t('CSV')}
              </button>{' '}
              <button className="btn btn-sm" onClick={clk(kit.hist?.print)}>
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
                {t('Print')}
              </button>
            </div>
            <div className="db p-0">
              <table className="ktbl">
                <thead>
                  <tr>
                    {(kit.hist?.cols || []).map((c, $index) => (
                      <Fragment key={$index}>
                        <th>{tx(s(c))}</th>
                      </Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(kit.hist?.rows || []).map((r, $index) => (
                    <Fragment key={$index}>
                      <tr>
                        {(r || []).map((c, $index) => (
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
      {kit.isForm ? (
        <>
          {' '}
          <button className="ov" aria-label={t('Close')} onClick={clk(kit.close)} />
          <aside className="dlg wide" role="dialog" aria-modal="true" aria-labelledby="kform-t">
            <div className="dh">
              <div className="flex-auto min-w-0">
                <h2 id="kform-t">{tx(s(kit.form?.title))}</h2>
                <p>{tx(s(kit.form?.sub))}</p>
              </div>
              <button className="btn btn-sm kib" aria-label={t('Close')} onClick={clk(kit.close)}>
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
            <div className="db">
              {kit.form?.hasNote ? (
                <>
                  <div className="banner b-info">{tx(s(kit.form?.note))}</div>
                </>
              ) : null}
              {kit.form?.hasErr ? (
                <>
                  <div className="banner b-block" role="alert">
                    {tx(s(kit.form?.errText))}
                  </div>
                </>
              ) : null}
              {(kit.form?.secs || []).map((g, $index) => (
                <Fragment key={$index}>
                  <fieldset className="kfs">
                    <legend>{tx(s(g?.title))}</legend>
                    <div className="kgrid">
                      {(g?.fields || []).map((f, $index) => (
                        <Fragment key={$index}>
                          {' '}
                          <label className={a(f?.cls)}>
                            <span className="kl">
                              {tx(s(f?.label))}
                              {f?.req ? (
                                <>
                                  <b aria-hidden="true">{t('*')}</b>
                                </>
                              ) : null}
                            </span>
                            {f?.isText ? (
                              <>
                                <input
                                  className="input"
                                  type={a(f?.type)}
                                  value={s(f?.v)}
                                  placeholder={tp(s(f?.ph))}
                                  aria-required={aria(f?.reqA)}
                                  aria-invalid={aria(f?.bad)}
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
                                  aria-required={aria(f?.reqA)}
                                  aria-invalid={aria(f?.bad)}
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
                                    aria-required={aria(f?.reqA)}
                                    aria-invalid={aria(f?.bad)}
                                    onChange={f?.on}
                                  >
                                    {(f?.opts || []).map((o, $index) => (
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
            <div className="df">
              <span className="flex-auto text-[12px] text-muted">{tx(s(kit.form?.foot))}</span>{' '}
              <button className="btn" onClick={clk(kit.close)}>
                {t('Cancel')}
              </button>{' '}
              <button className="btn btn-primary" onClick={clk(kit.form?.submit)}>
                {tx(s(kit.form?.cta))}
              </button>
            </div>
          </aside>
        </>
      ) : null}
      {kit.isConfirm ? (
        <>
          {' '}
          <button className="ov" aria-label={t('Close')} onClick={clk(kit.close)} />
          <div className="dlg" role="alertdialog" aria-modal="true" aria-labelledby="kconf-t">
            <div className="dh">
              <div className="flex-auto min-w-0">
                <h2 id="kconf-t">{tx(s(kit.conf?.title))}</h2>
                <p>{tx(s(kit.conf?.sub))}</p>
              </div>
            </div>
            <div className="db">
              <p className="mt-0 mb-3.5 mx-0 text-[13px] leading-[20px]">{tx(s(kit.conf?.text))}</p>
              <label className="kf">
                <span className="kl">
                  {t('Reason')}
                  <b aria-hidden="true">{t('*')}</b>
                </span>
                <textarea
                  className="input"
                  rows={3}
                  value={s(kit.conf?.reason)}
                  placeholder={t('Why is this needed?')}
                  aria-required="true"
                  onChange={kit.conf?.onReason}
                />
                {kit.conf?.hasErr ? (
                  <>
                    <span className="ke">{t('Enter a reason')}</span>
                  </>
                ) : null}
              </label>
            </div>
            <div className="df">
              <button className="btn" onClick={clk(kit.close)}>
                {t('Cancel')}
              </button>{' '}
              <button className="btn kbtn-danger" onClick={clk(kit.conf?.ok)}>
                {tx(s(kit.conf?.cta))}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
