import { Fragment } from 'react';
import { Page } from '../../app/shell/Page';
import { AppLink } from '../../components/AppLink';
import { useI18n } from '../../i18n/context';
import { a, b, clk, s, sx } from '../../lib/view';

/* Home: the landing workspace of a port / office user.
   Markup ported from the GIRS prototype; values and handlers come from the screen view-model (v). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function HomeView({ v }: { v: any }) {
  const { t, tx } = useI18n();
  return (
    <Page
      mainClassName="pt-0 px-5 pb-6"
      header={
        <div className="ghead py-2 px-5 min-h-14 flex-none flex flex-wrap items-center justify-between gap-y-2 gap-x-6 bg-surface border-b border-b-line box-border">
          <div className="min-w-0">
            <h1 className="m-0 text-[17px] font-semibold leading-[22px]">{tx(s(v.greet))}</h1>
            <p className="mt-0.5 mb-0 mx-0 text-[13px] leading-[18px] text-muted">{tx(s(v.ctx))}</p>
          </div>
        </div>
      }
      overlays={
        <>
          {v.drw?.show ? (
            <>
              {' '}
              <button className="scrim z-200" tabIndex={-1} aria-label={t('Close')} onClick={clk(v.drw?.close)} />
              <aside className="panel z-201" role="dialog" aria-modal="true" aria-labelledby="hm-dt">
                <div className="panel-h">
                  <div className="hm-dhi">
                    <div className="hm-dtl">
                      <span className="cm2-code mono">{tx(s(v.drw?.no))}</span>
                      <h2 id="hm-dt">{tx(s(v.drw?.vessel))}</h2>
                      <span className={a(v.drw?.typeC)}>{tx(s(v.drw?.typeL))}</span>
                      <span className="mu">{tx(s(v.drw?.svc))}</span>
                    </div>
                    <p>
                      <span className="mono">{tx(s(v.drw?.route))}</span> {tx(`· ${s(v.drw?.date)}`)}
                    </p>
                  </div>
                  <button className="btn btn-icon btn-sm" aria-label={t('Close')} onClick={clk(v.drw?.close)}>
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
                <div className="panel-b">
                  <div className="hm-ds4">
                    {(v.drw?.stats || []).map((t: any, $index: number) => (
                      <Fragment key={$index}>
                        <div>
                          <span>{tx(s(t?.l))}</span>
                          <b>{tx(s(t?.v))}</b>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                  <div className="hm-stk lg" aria-hidden="true">
                    <i className="inv" style={sx(s(v.drw?.bI))} />
                    <i className="rdy" style={sx(s(v.drw?.bR))} />
                    <i className="blk" style={sx(s(v.drw?.bB))} />
                  </div>
                  {v.drw?.hasReasons ? (
                    <>
                      <div className="hm-dsec">
                        <h3>{tx('Blocked because')}</h3>
                        <ul className="hm-rl">
                          {(v.drw?.reasons || []).map((x: any, $index: number) => (
                            <Fragment key={$index}>
                              <li>
                                <span>{tx(s(x?.l))}</span>
                                <span className="mu">{tx(s(x?.o))}</span>
                                <b>{tx(s(x?.n))}</b>
                                <span className="hm-rla">
                                  {x?.hasSt ? (
                                    <>
                                      <span className="hm-fs">{tx(s(x?.st))}</span>
                                    </>
                                  ) : null}
                                  <button className="btn btn-sm" onClick={clk(x?.go)}>
                                    {tx(s(x?.act))}
                                  </button>
                                </span>
                              </li>
                            </Fragment>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : null}
                  <div className="hm-dsec">
                    <div className="hm-dsh">
                      <h3>{tx('B/Ls')}</h3>
                      <div className="seg sm" role="group" aria-label={t('Filter B/Ls')}>
                        {(v.drw?.filters || []).map((f: any, $index: number) => (
                          <Fragment key={$index}>
                            <button aria-pressed={a(f?.cur)} onClick={clk(f?.pick)}>
                              {tx(s(f?.l))}
                              <span>{tx(s(f?.n))}</span>
                            </button>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                    <div className="search wide">
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
                        <circle cx="11" cy="11" r="7" />
                        <path d="M20 20l-4-4" />
                      </svg>
                      <input
                        className="input"
                        placeholder={t('Search B/L no. or billing party')}
                        aria-label={t('Search B/Ls')}
                        value={s(v.drw?.q)}
                        autoComplete="off"
                        spellCheck="false"
                        onChange={v.drw?.onQ}
                      />
                    </div>
                    <table className="lst hm-blt">
                      <thead>
                        <tr>
                          <th scope="col">{tx('B/L No.')}</th>
                          <th scope="col">{tx('Billing party')}</th>
                          <th scope="col" className="r">
                            {tx('Ctr')}
                          </th>
                          <th scope="col" className="r">
                            {tx('Amount')}
                          </th>
                          <th scope="col">{tx('Status')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(v.drw?.bls || []).map((b: any, $index: number) => (
                          <Fragment key={$index}>
                            <tr className="hm-blr" onClick={clk(b?.open)}>
                              <td>
                                <button className="lnk mono" aria-label={t(s(b?.openL))} onClick={clk(b?.open)}>
                                  {tx(s(b?.bl))}
                                </button>
                              </td>
                              <td>{tx(s(b?.cust))}</td>
                              <td className="r">{tx(s(b?.ctr))}</td>
                              <td className="r">{tx(s(b?.amt))}</td>
                              <td>
                                <span className={a(b?.stC)}>{tx(s(b?.st))}</span>
                                <small className="hm-sub">{tx(s(b?.note))}</small>
                              </td>
                            </tr>
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                    {v.drw?.noBls ? (
                      <>
                        <div className="empty">{tx(s(v.drw?.noBlsL))}</div>
                      </>
                    ) : null}
                    {v.drw?.pg?.show ? (
                      <>
                        <div className="pager hm-pp">
                          <span>{tx(s(v.drw?.pg?.text))}</span>
                          <button
                            className="btn btn-sm pbtn"
                            aria-label={t('Previous page')}
                            disabled={b(v.drw?.pg?.prevDis)}
                            onClick={clk(v.drw?.pg?.prev)}
                          >
                            {tx('‹')}
                          </button>
                          <span className="mono">{tx(s(v.drw?.pg?.pos))}</span>
                          <button
                            className="btn btn-sm pbtn"
                            aria-label={t('Next page')}
                            disabled={b(v.drw?.pg?.nextDis)}
                            onClick={clk(v.drw?.pg?.next)}
                          >
                            {tx('›')}
                          </button>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="panel-f">
                  <AppLink className="btn me-auto no-underline" href={a(v.drw?.list)}>
                    {tx('Open in Invoice List')}
                  </AppLink>{' '}
                  <button className="btn" onClick={clk(v.drw?.close)}>
                    {tx('Close')}
                  </button>
                  {v.drw?.canGen ? (
                    <>
                      <button className="btn btn-primary" onClick={clk(v.drw?.gen)}>
                        {tx(s(v.drw?.genL))}
                      </button>
                    </>
                  ) : null}
                </div>
              </aside>
            </>
          ) : null}
          {v.ri?.show ? (
            <>
              {' '}
              <button className="scrim z-215" tabIndex={-1} aria-label={t('Close')} onClick={clk(v.ri?.close)} />
              <div className="dlg doc dim hm-rim z-216" role="dialog" aria-modal="true" aria-labelledby="hm-rit">
                <div className="dh">
                  <span className="cm2-code mono">{tx(s(v.ri?.bl))}</span>
                  <div className="hm-rih">
                    <h2 id="hm-rit">{tx('Ready to invoice')}</h2>
                    <span>{tx(s(v.ri?.head))}</span>
                  </div>
                  <span className={a(v.ri?.stC)}>{tx(s(v.ri?.stLabel))}</span>{' '}
                  <span className="hm-rinav">
                    <button className="btn btn-sm" disabled={b(v.ri?.first)} onClick={clk(v.ri?.prev)}>
                      {tx('Previous')}
                    </button>
                    <span className="mono">{tx(s(v.ri?.pos))}</span>
                    <button className="btn btn-sm" disabled={b(v.ri?.last)} onClick={clk(v.ri?.next)}>
                      {tx('Next')}
                    </button>
                  </span>{' '}
                  <button className="btn btn-icon btn-sm" aria-label={t('Close')} onClick={clk(v.ri?.close)}>
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
                <div className="hm-rib2">
                  <section className="ri" aria-label={t('Ready to invoice')}>
                    <div className="ri-hd">
                      <h1>
                        {tx(s(v.ri?.title))}
                        {v.ri?.hasErr ? (
                          <>
                            {' '}
                            <span className="ri-err">{tx('(Error)')}</span>
                          </>
                        ) : null}
                      </h1>
                      <div className="ri-sub">
                        <span className="mu">{tx('Transaction Name:')}</span> <b>{tx(s(v.ri?.txn))}</b>
                      </div>
                    </div>
                    {v.ri?.hasErr ? (
                      <>
                        <div className="ri-errs" role="alert">
                          <b>{tx(s(v.ri?.errTitle))}</b>
                          <ul>
                            {(v.ri?.errs || []).map((e: any, $index: number) => (
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
                      {(v.ri?.strip || []).map((x: any, $index: number) => (
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
                        <div className="n">{tx(s(v.ri?.from0))}</div>
                        {(v.ri?.fromL || []).map((l: any, $index: number) => (
                          <Fragment key={$index}>
                            <div className="l">{tx(s(l))}</div>
                          </Fragment>
                        ))}
                      </div>
                      <div>
                        <label className="k" htmlFor="hm-cust">
                          {tx('To')}
                        </label>
                        {v.ri?.notDone ? (
                          <>
                            <div className="ri-cb mt-1.5 max-w-90">
                              <input
                                id="hm-cust"
                                className={`input ${s(v.ri?.to?.cls)} w-full font-semibold`}
                                role="combobox"
                                aria-autocomplete="list"
                                aria-expanded={a(v.ri?.to?.exp)}
                                aria-controls="hm-cust-l"
                                aria-activedescendant={a(v.ri?.to?.act)}
                                placeholder={t('Search customer name or code')}
                                value={s(v.ri?.to?.val)}
                                autoComplete="off"
                                spellCheck="false"
                                onChange={v.ri?.to?.onQ}
                                onFocus={v.ri?.to?.onFocus}
                                onBlur={v.ri?.to?.onBlur}
                                onKeyDown={v.ri?.to?.onKey}
                              />
                              {v.ri?.to?.open ? (
                                <>
                                  <ul className="ri-sug" role="listbox" id="hm-cust-l">
                                    {(v.ri?.to?.opts || []).map((o: any, $index: number) => (
                                      <Fragment key={$index}>
                                        <li role="option" id={a(o?.id)} aria-selected={a(o?.on)} onMouseDown={o?.pick}>
                                          <span className="mono">{tx(s(o?.code))}</span>
                                          {tx(s(o?.name))}
                                        </li>
                                      </Fragment>
                                    ))}
                                    {v.ri?.to?.none ? (
                                      <>
                                        <li className="none">{tx('No customer matches')}</li>
                                      </>
                                    ) : null}
                                  </ul>
                                </>
                              ) : null}
                            </div>
                          </>
                        ) : null}
                        {v.ri?.done ? (
                          <>
                            <div className="n">{tx(s(v.ri?.cust))}</div>
                          </>
                        ) : null}
                        <div className="l mt-1.5">{tx(s(v.ri?.to?.addr))}</div>
                      </div>
                      <div>
                        <div className="k">{tx('Customer & payment')}</div>
                        <div className="ri-kv">
                          {(v.ri?.details || []).map((x: any, $index: number) => (
                            <Fragment key={$index}>
                              <span>{tx(s(x?.k))}</span>
                              <span>{tx(s(x?.v))}</span>
                            </Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="ri-ship">
                      {(v.ri?.ship || []).map((x: any, $index: number) => (
                        <Fragment key={$index}>
                          <div>
                            <div className="k">{tx(s(x?.k))}</div>
                            <div className="v">{tx(s(x?.v))}</div>
                          </div>
                        </Fragment>
                      ))}
                    </div>
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
                          <th>
                            <span className="sr-only">{tx('Remove')}</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(v.ri?.lines || []).map((l: any, $index: number) => (
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
                                        aria-expanded={a(l?.sugA)}
                                        aria-controls={a(l?.lid)}
                                        aria-activedescendant={a(l?.act)}
                                        aria-label={t('Charge head')}
                                        placeholder={t('Search charge')}
                                        value={s(l?.q)}
                                        autoComplete="off"
                                        spellCheck="false"
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
                                                <li className="none">{tx('No charge matches')}</li>
                                              </>
                                            ) : null}
                                          </ul>
                                        </>
                                      ) : null}
                                    </div>
                                  </>
                                ) : null}
                                {l?.ro ? <>{tx(s(l?.head))}</> : null}
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
                                        <option value="">{tx('Select')}</option>
                                        {(l?.uoms || []).map((o: any, $index: number) => (
                                          <Fragment key={$index}>
                                            <option value={a(o)}>{tx(s(o))}</option>
                                          </Fragment>
                                        ))}
                                      </select>
                                      <svg
                                        className="absolute end-2 top-1/2 -mt-2 pointer-events-none text-muted"
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
                                        <option value="">{tx('Select')}</option>
                                        {(l?.curs || []).map((o: any, $index: number) => (
                                          <Fragment key={$index}>
                                            <option value={a(o)}>{tx(s(o))}</option>
                                          </Fragment>
                                        ))}
                                      </select>
                                      <svg
                                        className="absolute end-2 top-1/2 -mt-2 pointer-events-none text-muted"
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
                              <td className="r">{tx(s(l?.ta))}</td>
                              <td className="r">{tx(s(l?.tax))}</td>
                              <td className="r">{tx(s(l?.inc))}</td>
                              <td className="r w-11">
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
                    {v.ri?.canAdd ? (
                      <>
                        <div className="mt-3">
                          <button className="btn btn-sm" onClick={clk(v.ri?.addCharge)}>
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
                      </>
                    ) : null}
                    <div className="ri-bt">
                      <div>
                        <div className="k">{tx('Bank details')}</div>
                        <div className="ri-kv">
                          {(v.ri?.bank || []).map((x: any, $index: number) => (
                            <Fragment key={$index}>
                              <span>{tx(s(x?.k))}</span>
                              <span>{tx(s(x?.v))}</span>
                            </Fragment>
                          ))}
                        </div>
                      </div>
                      <div className="ri-tot">
                        {(v.ri?.totals || []).map((t: any, $index: number) => (
                          <Fragment key={$index}>
                            <div className={a(t?.cls)}>
                              <span>{tx(s(t?.k))}</span>
                              <span>{tx(s(t?.v))}</span>
                            </div>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                    <div className="ri-words">{tx(s(v.ri?.words))}</div>
                  </section>
                </div>
                <div className="df hm-rif">
                  {v.ri?.notDone ? (
                    <>
                      <label className="hm-decl">
                        <input
                          type="checkbox"
                          className="cbx"
                          checked={b(v.ri?.decl)}
                          disabled={b(v.ri?.hasErr)}
                          onChange={v.ri?.toggleDecl}
                        />
                        <span>
                          <b>{tx('Declaration:')}</b> {tx('I have reviewed the charges, party and tax details for this B/L.')}
                        </span>
                      </label>
                    </>
                  ) : null}
                  <span className="hm-rihint">{tx(s(v.ri?.hint))}</span>{' '}
                  <AppLink className="btn no-underline" href={a(v.ri?.list)}>
                    {tx('Open in Invoice List')}
                  </AppLink>{' '}
                  <button className="btn" onClick={clk(v.ri?.close)}>
                    {tx('Close')}
                  </button>
                  {v.ri?.notDone ? (
                    <>
                      <button className="btn btn-primary" disabled={b(v.ri?.genDis)} onClick={clk(v.ri?.gen)}>
                        {tx('Generate invoice')}
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
          {v.mail?.show ? (
            <>
              {' '}
              <button className="scrim z-225" tabIndex={-1} aria-label={t('Close')} onClick={clk(v.mail?.cancel)} />
              <div className="dlg wide dim hm-mail z-226" role="dialog" aria-modal="true" aria-labelledby="hm-mt">
                <div className="dh">
                  <div className="hm-rih">
                    <h2 id="hm-mt">{tx(s(v.mail?.title))}</h2>
                    <span>{tx(s(v.mail?.reason))}</span>
                  </div>
                  <button className="btn btn-icon btn-sm" aria-label={t('Close')} onClick={clk(v.mail?.cancel)}>
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
                <div className="hm-mb">
                  <div className="hm-mf">
                    <label htmlFor="hm-mto">{tx('To')}</label>
                    <input
                      id="hm-mto"
                      className="input"
                      value={s(v.mail?.to)}
                      autoComplete="off"
                      spellCheck="false"
                      onChange={v.mail?.onTo}
                    />
                  </div>
                  <div className="hm-mf">
                    <label htmlFor="hm-mcc">{tx('Cc')}</label>
                    <input
                      id="hm-mcc"
                      className="input"
                      value={s(v.mail?.cc)}
                      autoComplete="off"
                      spellCheck="false"
                      onChange={v.mail?.onCc}
                    />
                  </div>
                  <div className="hm-mf">
                    <label htmlFor="hm-msu">{tx('Subject')}</label>
                    <input id="hm-msu" className="input" value={s(v.mail?.sub)} autoComplete="off" onChange={v.mail?.onSub} />
                  </div>
                  <div className="hm-att">
                    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
                      <rect x="4" y="2" width="22" height="28" rx="3" fill="#1D6F42" />
                      <path d="M10 11l4 5-4 5M18 11l-4 5 4 5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                    <div className="hm-atn">
                      <b>{tx(s(v.mail?.file))}</b>
                      <span>{tx(s(v.mail?.meta))}</span>
                    </div>
                    <button className="btn btn-sm" aria-expanded={a(v.mail?.prevOn)} onClick={clk(v.mail?.togglePrev)}>
                      {tx(s(v.mail?.prevL))}
                    </button>{' '}
                    <button className="btn btn-sm" onClick={clk(v.mail?.download)}>
                      {tx('Download')}
                    </button>
                  </div>
                  {v.mail?.prevOn ? (
                    <>
                      <div className="hm-xp">
                        <table className="hm-xpt">
                          <thead>
                            <tr>
                              <th />
                              {(v.mail?.heads || []).map((h: any, $index: number) => (
                                <Fragment key={$index}>
                                  <th>{tx(s(h?.h))}</th>
                                </Fragment>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(v.mail?.prev || []).map((r: any, $index: number) => (
                              <Fragment key={$index}>
                                <tr>
                                  <td className="hm-xn" />
                                  {(r?.cells || []).map((c: any, $index: number) => (
                                    <Fragment key={$index}>
                                      <td>{tx(s(c?.v))}</td>
                                    </Fragment>
                                  ))}
                                </tr>
                              </Fragment>
                            ))}
                          </tbody>
                        </table>
                        <p>{tx(s(v.mail?.more))}</p>
                      </div>
                    </>
                  ) : null}
                  <label className="sr-only" htmlFor="hm-mbd">
                    {tx('Message')}
                  </label>
                  <textarea id="hm-mbd" className="input hm-mbd" value={s(v.mail?.body)} onChange={v.mail?.onBody} />
                </div>
                <div className="df">
                  <span className="hm-rihint">{tx('Sent from GIRS · a copy is kept in the audit trail')}</span>
                  <button className="btn" onClick={clk(v.mail?.cancel)}>
                    {tx('Cancel')}
                  </button>
                  <button className="btn btn-primary" onClick={clk(v.mail?.send)}>
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
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                    {tx('Send')}
                  </button>
                </div>
              </div>
            </>
          ) : null}
          {v.cf?.show ? (
            <>
              {' '}
              <button className="scrim z-210" tabIndex={-1} aria-label={t('Close')} onClick={clk(v.cf?.cancel)} />
              <div className="dlg dim hm-cfm z-211" role="dialog" aria-modal="true" aria-labelledby="hm-ct">
                <div className="dh">
                  <h2 id="hm-ct">{tx(s(v.cf?.title))}</h2>
                </div>
                <div className="db">
                  <dl className="hm-dl">
                    {(v.cf?.rows || []).map((r: any, $index: number) => (
                      <Fragment key={$index}>
                        <dt>{tx(s(r?.l))}</dt>
                        <dd>{tx(s(r?.v))}</dd>
                      </Fragment>
                    ))}
                  </dl>
                  <p className="hm-cn">{tx(s(v.cf?.note))}</p>
                </div>
                <div className="df">
                  <button className="btn" onClick={clk(v.cf?.cancel)}>
                    {tx('Cancel')}
                  </button>
                  <button className="btn btn-primary" onClick={clk(v.cf?.ok)}>
                    {tx('Generate')}
                  </button>
                </div>
              </div>
            </>
          ) : null}
          {v.rate?.show ? (
            <>
              {' '}
              <button className="scrim z-210" tabIndex={-1} aria-label={t('Close')} onClick={clk(v.rate?.cancel)} />
              <div className="dlg dim hm-cfm z-211" role="dialog" aria-modal="true" aria-labelledby="hm-rt">
                <div className="dh">
                  <h2 id="hm-rt">{tx('Enter rate of exchange')}</h2>
                </div>
                <div className="db">
                  <dl className="hm-dl">
                    <dt>{tx('Currency pair')}</dt>
                    <dd>{tx(s(v.rate?.pair))}</dd>
                    <dt>{tx('Rate date')}</dt>
                    <dd>{tx(s(v.rate?.date))}</dd>
                  </dl>{' '}
                  <label className="lbl" htmlFor="hm-rv">
                    {tx('Rate received from Treasury')}
                  </label>{' '}
                  <input
                    id="hm-rv"
                    className="input"
                    inputMode="decimal"
                    placeholder={t('e.g. 1.6842')}
                    value={s(v.rate?.val)}
                    autoComplete="off"
                    onChange={v.rate?.on}
                  />
                  <p className="hm-cn">{tx(`${s(v.rate?.info)} Entering a rate manually is recorded in the audit trail.`)}</p>
                </div>
                <div className="df">
                  <button className="btn" onClick={clk(v.rate?.cancel)}>
                    {tx('Cancel')}
                  </button>
                  <button className="btn btn-primary" onClick={clk(v.rate?.ok)}>
                    {tx('Apply rate')}
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </>
      }
    >
      <div className="tabs hm-tabs" role="tablist" aria-label={t('Home')}>
        <button className="tabb" role="tab" id="hm-t1" aria-controls="hm-p1" aria-selected={a(v.tabs?.voyA)} onClick={clk(v.tabs?.toVoy)}>
          {tx('Voyage Invoicing')}
          <span className="count">{tx(s(v.tabs?.voyN))}</span>
        </button>{' '}
        <button className="tabb" role="tab" id="hm-t2" aria-controls="hm-p2" aria-selected={a(v.tabs?.ddA)} onClick={clk(v.tabs?.toDd)}>
          {tx('D&D Billing')}
          <span className="count">{tx(s(v.tabs?.ddN))}</span>
        </button>
      </div>
      {v.done?.show ? (
        <>
          <div className="banner b-ok" role="status">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M8 12l3 3 5-6" />
            </svg>
            <span>{tx(s(v.done?.txt))}</span>
            <AppLink className="lnk" href={a(v.done?.href)}>
              {tx('View in Invoice List')}
            </AppLink>
            <button className="btn btn-icon btn-sm x" aria-label={t('Dismiss')} onClick={clk(v.done?.close)}>
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
        </>
      ) : null}
      {v.tabs?.voy ? (
        <>
          <div id="hm-p1" role="tabpanel" aria-labelledby="hm-t1" className="hm-panel">
            {v.alert ? (
              <>
                <div className="banner b-warn" role="status">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
                  </svg>
                  <span>
                    <b>{tx('Daily ROE feed not received.')}</b>{' '}
                    {tx('Invoices that need a rate of exchange are blocked. Request the rate from Treasury under “Blocked by reason”.')}
                  </span>
                  <button className="btn btn-icon btn-sm x" aria-label={t('Dismiss')} onClick={clk(v.alertOff)}>
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
              </>
            ) : null}
            <div className="hm-nav">
              <div className="hm-dn">
                <button className="btn btn-icon" aria-label={t(s(v.nav?.prevL))} title={t(s(v.nav?.prevL))} onClick={clk(v.nav?.prev)}>
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
                </button>
                <div className="hm-dp">
                  <button className="hm-dpb" aria-haspopup="dialog" aria-expanded={a(v.nav?.cal)} onClick={clk(v.nav?.toggleCal)}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="5" width="18" height="16" rx="2" />
                      <path d="M3 10h18M8 3v4M16 3v4" />
                    </svg>
                    <span>{tx(s(v.nav?.label))}</span>
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
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {v.nav?.cal ? (
                    <>
                      <div className="hm-cal" role="dialog" aria-label={t('Choose dates')}>
                        <ul className="hm-pre">
                          {(v.nav?.presets || []).map((p: any, $index: number) => (
                            <Fragment key={$index}>
                              <li>
                                <button aria-pressed={a(p?.cur)} onClick={clk(p?.pick)}>
                                  {tx(s(p?.l))}
                                </button>
                              </li>
                            </Fragment>
                          ))}
                        </ul>
                        <div className="hm-cust">
                          <span className="hm-ch">{tx('Custom range')}</span>{' '}
                          <label className="lbl" htmlFor="hm-from">
                            {tx('From')}
                          </label>
                          <input id="hm-from" type="date" className="input" value={s(v.nav?.from)} onChange={v.nav?.onFrom} />{' '}
                          <label className="lbl" htmlFor="hm-to">
                            {tx('To')}
                          </label>
                          <input id="hm-to" type="date" className="input" value={s(v.nav?.to)} onChange={v.nav?.onTo} />
                          <p>{tx('Tip: Shift-click a day in the strip to select a range.')}</p>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
                <button className="btn btn-icon" aria-label={t(s(v.nav?.nextL))} title={t(s(v.nav?.nextL))} onClick={clk(v.nav?.next)}>
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
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>{' '}
                <button className="btn btn-sm" disabled={b(v.nav?.isToday)} onClick={clk(v.nav?.today)}>
                  {tx('Today')}
                </button>
              </div>
              <button className={a(v.nav?.ovCls)} aria-pressed={a(v.nav?.ovOn)} onClick={clk(v.nav?.ovGo)}>
                <span className="hm-ovd" aria-hidden="true" />
                <b>{tx(s(v.nav?.ovN))}</b>
                <span>{tx('overdue voyages')}</span>
                <span className="mu">{tx(`· ${s(v.nav?.ovOpen)} invoices open`)}</span>
              </button>
            </div>
            <div className="hm-rib card">
              <button className="hm-ra" aria-label={t('Previous week')} title={t('Previous week')} onClick={clk(v.nav?.winPrev)}>
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
              </button>
              <div className="hm-rds" role="group" aria-label={t('Workload by day')}>
                {(v.ribbon || []).map((d: any, $index: number) => (
                  <Fragment key={$index}>
                    {' '}
                    <button className={a(d?.cls)} aria-pressed={a(d?.cur)} aria-label={t(s(d?.aria))} onClick={clk(d?.pick)}>
                      <span className="hm-rw">{tx(s(d?.w))}</span>
                      <b>{tx(s(d?.d))}</b>
                      <span className="mu text-[11px]">{tx(s(d?.n))}</span>{' '}
                      <span className="hm-stk hm-rs">
                        <i className="inv" style={sx(s(d?.sI))} />
                        <i className="rdy" style={sx(s(d?.sR))} />
                        <i className="blk" style={sx(s(d?.sB))} />
                      </span>{' '}
                      <small>{tx(s(d?.open))}</small>
                    </button>{' '}
                  </Fragment>
                ))}
              </div>
              <button className="hm-ra" aria-label={t('Next week')} title={t('Next week')} onClick={clk(v.nav?.winNext)}>
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
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
            <div className="hm-grid">
              <section className="card hm-main" aria-labelledby="hm-vt">
                {v.bulk?.show ? (
                  <>
                    <div className="hm-bulk">
                      <b>{tx(s(v.bulk?.n))}</b>{' '}
                      <button className="btn btn-sm btn-primary" disabled={b(v.bulk?.genDis)} onClick={clk(v.bulk?.gen)}>
                        {tx(s(v.bulk?.genL))}
                      </button>{' '}
                      <button className="btn btn-sm" disabled={b(v.bulk?.fuDis)} onClick={clk(v.bulk?.fu)}>
                        {tx('Send follow-up')}
                      </button>{' '}
                      <button className="btn btn-sm" onClick={clk(v.bulk?.exp)}>
                        {tx('Export to Excel')}
                      </button>{' '}
                      <button className="btn btn-sm hm-nx" onClick={clk(v.bulk?.clear)}>
                        {tx('Clear selection')}
                      </button>
                    </div>
                  </>
                ) : null}
                <div className="hm-th">
                  <h2 className="card-title" id="hm-vt">
                    {tx('Voyages')}
                  </h2>
                  <div className="seg" role="group" aria-label={t('Direction')}>
                    {(v.dirs || []).map((x: any, $index: number) => (
                      <Fragment key={$index}>
                        <button aria-pressed={a(x?.cur)} onClick={clk(x?.pick)}>
                          {tx(s(x?.l))}
                        </button>
                      </Fragment>
                    ))}
                  </div>
                  <div className="search">
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
                      <circle cx="11" cy="11" r="7" />
                      <path d="M20 20l-4-4" />
                    </svg>
                    <input
                      className="input"
                      placeholder={t('Voyage no., vessel, service or port')}
                      aria-label={t('Search voyages')}
                      value={s(v.q)}
                      autoComplete="off"
                      spellCheck="false"
                      onChange={v.onQ}
                    />
                  </div>
                </div>
                <div className="chips" role="group" aria-label={t('Status')}>
                  {(v.stfs || []).map((f: any, $index: number) => (
                    <Fragment key={$index}>
                      <button className="chipb" aria-pressed={a(f?.cur)} onClick={clk(f?.pick)}>
                        {tx(s(f?.l))}
                        <span>{tx(s(f?.n))}</span>
                      </button>
                    </Fragment>
                  ))}
                  {v.grpShow ? (
                    <>
                      <label className="cm2-ck hm-gt">
                        <input type="checkbox" className="cbx" checked={b(v.grpOn)} onChange={v.grpT} />
                        <span>{tx('Group by date')}</span>
                      </label>
                    </>
                  ) : null}
                </div>
                <div className="hm-tw">
                  <table className="lst hm-vtab">
                    <thead>
                      <tr>
                        <th scope="col" className="hm-cb">
                          <input
                            type="checkbox"
                            className="cbx"
                            aria-label={t('Select all on this page')}
                            checked={b(v.allOn)}
                            onChange={v.allT}
                          />
                        </th>
                        <th scope="col" className={a(v.cols?.no?.cls)} aria-sort={a(v.cols?.no?.aria)}>
                          <button className="hm-sb" onClick={clk(v.cols?.no?.on)}>
                            {tx(s(v.cols?.no?.l))}
                            <span aria-hidden="true">{tx(s(v.cols?.no?.ic))}</span>
                          </button>
                        </th>
                        <th scope="col" className={a(v.cols?.vessel?.cls)} aria-sort={a(v.cols?.vessel?.aria)}>
                          <button className="hm-sb" onClick={clk(v.cols?.vessel?.on)}>
                            {tx(s(v.cols?.vessel?.l))}
                            <span aria-hidden="true">{tx(s(v.cols?.vessel?.ic))}</span>
                          </button>
                        </th>
                        <th scope="col">{tx('Route')}</th>
                        <th scope="col" className={a(v.cols?.date?.cls)} aria-sort={a(v.cols?.date?.aria)}>
                          <button className="hm-sb" onClick={clk(v.cols?.date?.on)}>
                            {tx(s(v.cols?.date?.l))}
                            <span aria-hidden="true">{tx(s(v.cols?.date?.ic))}</span>
                          </button>
                        </th>
                        <th scope="col" className={a(v.cols?.due?.cls)} aria-sort={a(v.cols?.due?.aria)}>
                          <button className="hm-sb" onClick={clk(v.cols?.due?.on)}>
                            {tx(s(v.cols?.due?.l))}
                            <span aria-hidden="true">{tx(s(v.cols?.due?.ic))}</span>
                          </button>
                        </th>
                        <th scope="col" className={`${s(v.cols?.inv?.cls)} w-37.5`} aria-sort={a(v.cols?.inv?.aria)}>
                          <button className="hm-sb" onClick={clk(v.cols?.inv?.on)}>
                            {tx(s(v.cols?.inv?.l))}
                            <span aria-hidden="true">{tx(s(v.cols?.inv?.ic))}</span>
                          </button>
                        </th>
                        <th scope="col" className={a(v.cols?.ready?.cls)} aria-sort={a(v.cols?.ready?.aria)}>
                          <button className="hm-sb" onClick={clk(v.cols?.ready?.on)}>
                            {tx(s(v.cols?.ready?.l))}
                            <span aria-hidden="true">{tx(s(v.cols?.ready?.ic))}</span>
                          </button>
                        </th>
                        <th scope="col" className={a(v.cols?.blocked?.cls)} aria-sort={a(v.cols?.blocked?.aria)}>
                          <button className="hm-sb" onClick={clk(v.cols?.blocked?.on)}>
                            {tx(s(v.cols?.blocked?.l))}
                            <span aria-hidden="true">{tx(s(v.cols?.blocked?.ic))}</span>
                          </button>
                        </th>
                        <th scope="col" className="c-act">
                          {tx('Action')}
                        </th>
                      </tr>
                    </thead>
                    {(v.grouped || []).map((g: any, $index: number) => (
                      <Fragment key={$index}>
                        <tbody>
                          {g?.show ? (
                            <>
                              <tr className="hm-gh">
                                <th colSpan={10} scope="rowgroup">
                                  <b>{tx(s(g?.l))}</b>
                                  <span>{tx(s(g?.m))}</span>
                                </th>
                              </tr>
                            </>
                          ) : null}
                          {(g?.rows || []).map((r: any, $index: number) => (
                            <Fragment key={$index}>
                              <tr className={a(r?.cls)}>
                                <td className="hm-cb">
                                  <input type="checkbox" className="cbx" aria-label={t(s(r?.chkL))} checked={b(r?.on)} onChange={r?.chk} />
                                </td>
                                <td className="c-no">
                                  <button className="lnk mono" aria-label={t(s(r?.openL))} onClick={clk(r?.open)}>
                                    {tx(s(r?.no))}
                                  </button>
                                  <small className="hm-sub">
                                    <span className={a(r?.typeC)}>{tx(s(r?.typeL))}</span>
                                  </small>
                                </td>
                                <td>
                                  {tx(s(r?.vessel))}
                                  <small className="hm-sub">{tx(s(r?.svc))}</small>
                                </td>
                                <td className="mono">{tx(s(r?.route))}</td>
                                <td>{tx(s(r?.date))}</td>
                                <td>
                                  <span className={a(r?.dueC)}>{tx(s(r?.dueL))}</span>
                                </td>
                                <td>
                                  <span className="hm-iv">{tx(s(r?.invL))}</span>
                                  <span className="hm-stk">
                                    <i className="inv" style={sx(s(r?.bI))} />
                                    <i className="rdy" style={sx(s(r?.bR))} />
                                    <i className="blk" style={sx(s(r?.bB))} />
                                  </span>
                                </td>
                                <td className={a(r?.readyC)}>{tx(s(r?.ready))}</td>
                                <td className={a(r?.blockedC)}>
                                  {tx(s(r?.blocked))}
                                  <small className="hm-sub">{tx(s(r?.why))}</small>
                                </td>
                                <td className="c-act">
                                  {r?.canGen ? (
                                    <>
                                      <button className="btn btn-sm" onClick={clk(r?.gen)}>
                                        {tx(s(r?.genL))}
                                      </button>
                                    </>
                                  ) : null}
                                  {r?.noGen ? (
                                    <>
                                      <button className="lnk hm-vw" onClick={clk(r?.open)}>
                                        {tx(s(r?.noGenL))}
                                      </button>
                                    </>
                                  ) : null}
                                </td>
                              </tr>
                            </Fragment>
                          ))}
                        </tbody>
                      </Fragment>
                    ))}
                  </table>
                  {v.noRows ? (
                    <>
                      <div className="empty">{tx(s(v.noRowsL))}</div>
                    </>
                  ) : null}
                </div>
                <div className="pager" role="navigation" aria-label={t('Pages')}>
                  <span>{tx(s(v.pager?.text))}</span>
                  <span className="gap-1.5 ms-auto inline-flex items-center">
                    <span className="mu text-[12px]">{tx('Rows per page')}</span>
                    <div className="relative">
                      <select
                        className="select select-sm w-19"
                        aria-label={t('Rows per page')}
                        value={s(v.pager?.size)}
                        onChange={v.pager?.onSize}
                      >
                        <option value="25">{tx('25')}</option>
                        <option value="50">{tx('50')}</option>
                        <option value="100">{tx('100')}</option>
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
                      disabled={b(v.pager?.firstDis)}
                      onClick={clk(v.pager?.first)}
                    >
                      {tx('«')}
                    </button>
                    <button
                      className="btn btn-sm pbtn"
                      aria-label={t('Previous page')}
                      disabled={b(v.pager?.prevDis)}
                      onClick={clk(v.pager?.prev)}
                    >
                      {tx('‹')}
                    </button>
                    <span className="mono text-[13px] min-w-16 text-center">{tx(s(v.pager?.pos))}</span>
                    <button
                      className="btn btn-sm pbtn"
                      aria-label={t('Next page')}
                      disabled={b(v.pager?.nextDis)}
                      onClick={clk(v.pager?.next)}
                    >
                      {tx('›')}
                    </button>
                    <button
                      className="btn btn-sm pbtn"
                      aria-label={t('Last page')}
                      disabled={b(v.pager?.lastDis)}
                      onClick={clk(v.pager?.last)}
                    >
                      {tx('»')}
                    </button>
                  </span>
                </div>
              </section>
              <aside className="hm-rail" aria-label={t('Summary')}>
                <section className="card hm-gl" aria-labelledby="hm-ag">
                  <div className="hm-rh">
                    <h2 id="hm-ag">{tx('At a glance')}</h2>
                    <span>{tx(`${s(v.rangeL)} · ${s(v.glance?.voy)}`)}</span>
                  </div>
                  <ul className="hm-gll">
                    {(v.glance?.stats || []).map((t: any, $index: number) => (
                      <Fragment key={$index}>
                        <li>
                          <span>
                            {t?.has ? (
                              <>
                                <i className={a(t?.k)} />
                              </>
                            ) : null}
                            {tx(s(t?.l))}
                          </span>
                          <b>{tx(s(t?.v))}</b>
                        </li>
                      </Fragment>
                    ))}
                  </ul>
                  <div className="hm-stk lg" aria-hidden="true">
                    <i className="inv" style={sx(s(v.glance?.bI))} />
                    <i className="rdy" style={sx(s(v.glance?.bR))} />
                    <i className="blk" style={sx(s(v.glance?.bB))} />
                    <i className="nd" style={sx(s(v.glance?.bW))} />
                  </div>
                  <p className="hm-pct">{tx(s(v.glance?.pct))}</p>
                  <button className="btn btn-primary hm-full" disabled={b(v.genAllDis)} onClick={clk(v.genAll)}>
                    {tx(s(v.genAllL))}
                  </button>
                </section>
                <section className="card" aria-labelledby="hm-br">
                  <div className="hm-rh">
                    <h2 id="hm-br">{tx('Blocked by reason')}</h2>
                  </div>
                  <ul className="hm-rsn">
                    {(v.reasons || []).map((b: any, $index: number) => (
                      <Fragment key={$index}>
                        <li>
                          <div className="hm-rt">
                            <b>{tx(s(b?.r))}</b>
                            <span>{tx(s(b?.n))}</span>
                          </div>
                          <div className="hm-rm">{tx(`${s(b?.v)} · ${s(b?.amt)} · ${s(b?.own)}`)}</div>
                          <div className="hm-ra2">
                            {b?.hasSt ? (
                              <>
                                <span className="hm-fs">{tx(s(b?.st))}</span>
                              </>
                            ) : null}
                            <button className="btn btn-sm" onClick={clk(b?.go)}>
                              {tx(s(b?.act))}
                            </button>
                          </div>
                        </li>
                      </Fragment>
                    ))}
                  </ul>
                  {v.noReasons ? (
                    <>
                      <div className="empty">{tx('Nothing blocked in this range.')}</div>
                    </>
                  ) : null}
                </section>
              </aside>
            </div>
          </div>
        </>
      ) : null}
      {v.tabs?.dd ? (
        <>
          <div id="hm-p2" role="tabpanel" aria-labelledby="hm-t2" className="hm-panel">
            <div className="hm-grid">
              <section className="card hm-main" aria-labelledby="hm-dc">
                <div className="hm-th">
                  <h2 className="card-title" id="hm-dc">
                    {tx('Containers · Detention & Demurrage')}
                  </h2>
                  <div className="search">
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
                      <circle cx="11" cy="11" r="7" />
                      <path d="M20 20l-4-4" />
                    </svg>
                    <input
                      className="input"
                      placeholder={t('Container, B/L or customer')}
                      aria-label={t('Search containers')}
                      value={s(v.dd?.q)}
                      autoComplete="off"
                      spellCheck="false"
                      onChange={v.dd?.onQ}
                    />
                  </div>
                </div>
                <div className="chips" role="group" aria-label={t('Status')}>
                  {(v.dd?.fil || []).map((f: any, $index: number) => (
                    <Fragment key={$index}>
                      <button className="chipb" aria-pressed={a(f?.cur)} onClick={clk(f?.pick)}>
                        {tx(s(f?.l))}
                        <span>{tx(s(f?.n))}</span>
                      </button>
                    </Fragment>
                  ))}
                </div>
                <div className="hm-tw">
                  <table className="lst hm-vtab">
                    <thead>
                      <tr>
                        <th scope="col" className="c-no">
                          {tx('Container')}
                        </th>
                        <th scope="col">{tx('Customer')}</th>
                        <th scope="col">{tx('B/L')}</th>
                        <th scope="col">{tx('Gate-out')}</th>
                        <th scope="col">{tx('Returned')}</th>
                        <th scope="col" className="r">
                          {tx('Days used / free')}
                        </th>
                        <th scope="col" className="r">
                          {tx('Over')}
                        </th>
                        <th scope="col" className="r">
                          {tx('Amount')}
                        </th>
                        <th scope="col">{tx('Status')}</th>
                        <th scope="col" className="c-act">
                          {tx('Action')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(v.dd?.rows || []).map((c: any, $index: number) => (
                        <Fragment key={$index}>
                          <tr>
                            <td className="c-no">
                              <span className="mono">{tx(s(c?.cn))}</span>
                              <small className="hm-sub">{tx(`${s(c?.sz)} · ${s(c?.typeL)}`)}</small>
                            </td>
                            <td>
                              {tx(s(c?.cust))}
                              <small className="hm-sub">{tx(s(c?.type))}</small>
                            </td>
                            <td className="mono">{tx(s(c?.bl))}</td>
                            <td>{tx(s(c?.out))}</td>
                            <td className={a(c?.backC)}>{tx(s(c?.back))}</td>
                            <td className="r">{tx(s(c?.days))}</td>
                            <td className={a(c?.overC)}>{tx(s(c?.over))}</td>
                            <td className="r">
                              {tx(s(c?.amt))}
                              <small className="hm-sub">{tx(s(c?.slab))}</small>
                            </td>
                            <td>
                              <span className={a(c?.stC)}>{tx(s(c?.stL))}</span>
                            </td>
                            <td className="c-act">
                              {c?.canGen ? (
                                <>
                                  <button className="btn btn-sm" onClick={clk(c?.gen)}>
                                    {tx('Generate')}
                                  </button>
                                </>
                              ) : null}
                              {c?.noGen ? (
                                <>
                                  <span className="hm-na">{tx(s(c?.noGenL))}</span>
                                </>
                              ) : null}
                            </td>
                          </tr>
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                  {v.dd?.empty ? (
                    <>
                      <div className="empty">{tx('No containers match.')}</div>
                    </>
                  ) : null}
                </div>
                <div className="pager" role="navigation" aria-label={t('Pages')}>
                  <span>{tx(s(v.dd?.pg?.text))}</span>
                  <span className="gap-1.5 ms-auto inline-flex items-center">
                    <span className="mu text-[12px]">{tx('Rows per page')}</span>
                    <div className="relative">
                      <select
                        className="select select-sm w-19"
                        aria-label={t('Rows per page')}
                        value={s(v.dd?.pg?.size)}
                        onChange={v.dd?.pg?.onSize}
                      >
                        <option value="25">{tx('25')}</option>
                        <option value="50">{tx('50')}</option>
                        <option value="100">{tx('100')}</option>
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
                      disabled={b(v.dd?.pg?.firstDis)}
                      onClick={clk(v.dd?.pg?.first)}
                    >
                      {tx('«')}
                    </button>
                    <button
                      className="btn btn-sm pbtn"
                      aria-label={t('Previous page')}
                      disabled={b(v.dd?.pg?.prevDis)}
                      onClick={clk(v.dd?.pg?.prev)}
                    >
                      {tx('‹')}
                    </button>
                    <span className="mono text-[13px] min-w-16 text-center">{tx(s(v.dd?.pg?.pos))}</span>
                    <button
                      className="btn btn-sm pbtn"
                      aria-label={t('Next page')}
                      disabled={b(v.dd?.pg?.nextDis)}
                      onClick={clk(v.dd?.pg?.next)}
                    >
                      {tx('›')}
                    </button>
                    <button
                      className="btn btn-sm pbtn"
                      aria-label={t('Last page')}
                      disabled={b(v.dd?.pg?.lastDis)}
                      onClick={clk(v.dd?.pg?.last)}
                    >
                      {tx('»')}
                    </button>
                  </span>
                </div>
              </section>
              <aside className="hm-rail" aria-label={t('D&D summary')}>
                <section className="card hm-gl" aria-labelledby="hm-dg">
                  <div className="hm-rh">
                    <h2 id="hm-dg">{tx('At a glance')}</h2>
                    <span>{tx('From LMS gate-out and return dates')}</span>
                  </div>
                  <ul className="hm-gll">
                    {(v.dd?.sum || []).map((t: any, $index: number) => (
                      <Fragment key={$index}>
                        <li>
                          <span>
                            <i className={a(t?.k)} />
                            {tx(s(t?.l))}
                          </span>
                          <b>{tx(s(t?.v))}</b>
                          <small>{tx(s(t?.sub))}</small>
                        </li>
                      </Fragment>
                    ))}
                  </ul>
                  <button className="btn btn-primary hm-full" disabled={b(v.dd?.genDis)} onClick={clk(v.dd?.gen)}>
                    {tx(s(v.dd?.genL))}
                  </button>
                </section>
                <section className="card" aria-labelledby="hm-db">
                  <div className="hm-rh">
                    <h2 id="hm-db">{tx('Blocked by reason')}</h2>
                  </div>
                  <ul className="hm-rsn">
                    {(v.dd?.reasons || []).map((b: any, $index: number) => (
                      <Fragment key={$index}>
                        <li>
                          <div className="hm-rt">
                            <b>{tx(s(b?.r))}</b>
                            <span>{tx(s(b?.n))}</span>
                          </div>
                          <div className="hm-rm">{tx(`${s(b?.amt)} · ${s(b?.own)}`)}</div>
                          <div className="hm-ra2">
                            {b?.hasSt ? (
                              <>
                                <span className="hm-fs">{tx(s(b?.st))}</span>
                              </>
                            ) : null}
                            <button className="btn btn-sm" onClick={clk(b?.go)}>
                              {tx(s(b?.act))}
                            </button>
                          </div>
                        </li>
                      </Fragment>
                    ))}
                  </ul>
                </section>
              </aside>
            </div>
          </div>
        </>
      ) : null}
    </Page>
  );
}
