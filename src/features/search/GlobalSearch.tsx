import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../../i18n/context';
import { useSettings } from '../../app/providers/contexts';
import { navigateTo } from '../../lib/appBridge';
import { writeStore } from '../../lib/storage';
import { clearRecent, highlight, loadIndex, recentItems, remember, search, type IconKey, type SearchItem } from './searchEngine';
import './GlobalSearch.css';

const ICON: Record<IconKey, string[]> = {
  screen: ['M4 5h16v14H4z', 'M4 9h16'],
  inv: ['M7 3h7l5 5v13H7z', 'M14 3v5h5M10 13h6M10 17h6'],
  rdy: ['M5 12l4 4 10-10'],
  cust: ['M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6'],
  bkg: ['M6 3h12v18l-6-4-6 4z'],
  cntr: ['M3 7h18v10H3z', 'M7 7v10M11 7v10M15 7v10'],
  vvd: ['M3 17l2 3h14l2-3M5 17V9h14v8M12 9V4'],
  chg: ['M4 7h16M4 12h10M4 17h7'],
  master: ['M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3'],
  recent: ['M12 8v4l3 2'],
  enq: ['M20 20l-4-4'],
};
const CIRCLE: Partial<Record<IconKey, [number, number, number]>> = { cust: [12, 8, 4], recent: [12, 12, 8], enq: [11, 11, 7] };

function Icon({ k }: { k: IconKey }) {
  const c = CIRCLE[k];
  return (
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
      {c ? <circle cx={c[0]} cy={c[1]} r={c[2]} /> : null}
      {ICON[k].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/**
 * Search box in the top bar. Finds screens, invoices, B/Ls, bookings, containers, vessel/voyages,
 * customers, charge codes and master data. Ctrl/⌘+K or "/" focuses it; ↑ ↓ move, Enter opens, Esc closes.
 */
export function GlobalSearch({ placeholder }: { placeholder: string }) {
  const { t, tx } = useI18n();
  const { theme } = useSettings();
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState<SearchItem[] | null>(null);
  const [act, setAct] = useState(-1);
  const [recentVersion, setRecentVersion] = useState(0);
  const [pos, setPos] = useState({ left: 0, top: 0, width: 560, maxHeight: 400 });

  const place = useCallback(() => {
    const el = input.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const w = Math.max(r.width, 560);
    setPos({
      left: Math.min(r.left, window.innerWidth - w - 12),
      top: r.bottom + 6,
      width: w,
      maxHeight: Math.max(240, window.innerHeight - r.bottom - 24),
    });
  }, []);

  const show = useCallback(() => {
    setOpen(true);
    place();
    loadIndex().then(setIdx);
  }, [place]);

  // view: recent searches when empty, grouped results while typing
  const view = useMemo(() => {
    const query = q.trim();
    if (!query) return { kind: 'recent' as const, items: recentItems().map((r) => ({ ...r, recent: true })) };
    if (!idx) return { kind: 'loading' as const, items: [] as SearchItem[] };
    const r = search(idx, q);
    const items: SearchItem[] = [];
    r.groups.forEach((g) => {
      items.push(...g.items);
      if (g.more) items.push(g.more);
    });
    const enq: SearchItem = { g: 'enq', main: 'Search “' + query + '” in Enquiry & Monitoring', href: 'enquiry.html', enq: true };
    items.push(enq);
    return { kind: 'results' as const, groups: r.groups, toks: r.toks, items, enq };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, idx, recentVersion]);

  useEffect(() => setAct(view.items.length && q.trim() ? 0 : -1), [view, q]);

  // keep the panel next to the box while scrolling / resizing
  useEffect(() => {
    if (!open) return;
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, place]);

  // Ctrl/⌘+K or "/" from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
      if (((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) || (e.key === '/' && !typing)) {
        e.preventDefault();
        input.current?.focus();
        input.current?.select();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const panelRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (act < 0) return;
    panelRef.current?.querySelector(`[data-i="${act}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [act]);

  const go = (it?: SearchItem) => {
    if (!it) return;
    if (it.enq) writeStore('girs.find', q.trim());
    if (!it.more && !it.enq) remember(it);
    setOpen(false);
    input.current?.blur();
    navigateTo(it.href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const n = view.items.length;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) show();
      if (!n) return;
      setAct((a) => (a + (e.key === 'ArrowDown' ? 1 : n - 1) + (a < 0 && e.key === 'ArrowUp' ? 1 : 0)) % n);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (act >= 0) go(view.items[act]);
      else if (q.trim()) go({ g: 'enq', main: '', href: 'enquiry.html', enq: true });
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault();
        setOpen(false);
      } else input.current?.blur();
    }
  };

  let n = -1;
  const row = (it: SearchItem, toks?: string[]) => {
    n++;
    const i = n;
    const parts = (text: string) =>
      (toks ? highlight(text, toks) : [{ text, hit: false }]).map((p, k) =>
        p.hit ? <mark key={k}>{p.text}</mark> : <span key={k}>{p.text}</span>,
      );
    const main = tx(it.main);
    return (
      <a
        key={'r' + i}
        className="gs-row"
        role="option"
        id={'gs-o-' + i}
        href={it.href}
        data-i={i}
        aria-selected={i === act ? 'true' : 'false'}
        onMouseMove={() => i !== act && setAct(i)}
        onClick={(e) => {
          e.preventDefault();
          go(it);
        }}
      >
        <span className="gs-ic">
          <Icon k={it.g === 'enq' ? 'enq' : it.recent ? 'recent' : (it.g as IconKey)} />
        </span>
        <span className="gs-tx">
          <span className={'gs-m' + (it.more ? ' gs-more' : '')}>{toks ? parts(it.main) : main}</span>
          {it.sub ? <span className="gs-s">{toks ? parts(it.sub) : tx(it.sub)}</span> : null}
        </span>
        {it.tag ? <span className={'gs-tag gs-' + it.tag.toLowerCase()}>{tx(it.tag)}</span> : null}
      </a>
    );
  };

  const panel = (
    <div
      id="gs-panel"
      ref={panelRef}
      role="listbox"
      aria-label={t('Search results')}
      className="theme gs-panel"
      data-theme={theme}
      style={{ left: pos.left, top: pos.top, width: pos.width, maxHeight: pos.maxHeight }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {view.kind === 'recent' ? (
        <>
          {view.items.length ? (
            <div className="gs-h">
              {tx('Recent')}
              <button
                type="button"
                className="gs-clear"
                aria-label={t('Clear recent searches')}
                title={t('Clear recent searches')}
                onClick={() => {
                  clearRecent();
                  setRecentVersion((x) => x + 1);
                }}
              >
                {tx('Clear')}
              </button>
            </div>
          ) : null}
          {view.items.map((r) => row(r))}
          <div className="gs-tip">
            {tx(
              'Search invoice no., B/L, booking, container, vessel/voyage, customer, charge code, port, tax code, currency or any screen.',
            )}
          </div>
        </>
      ) : view.kind === 'loading' ? (
        <div className="gs-tip">{tx('Loading…')}</div>
      ) : (
        <>
          {view.groups.map((g) => (
            <div key={g.head} style={{ display: 'contents' }}>
              <div className="gs-h">
                {tx(g.head)}
                <span>{g.n}</span>
              </div>
              {g.items.map((it) => row(it, view.toks))}
              {g.more ? row(g.more) : null}
            </div>
          ))}
          {!view.groups.length ? <div className="gs-empty">{tx('No results for “' + q.trim() + '”')}</div> : null}
          <div className="gs-sep" />
          {row(view.enq)}
        </>
      )}
      <div className="gs-foot">
        <span>
          <kbd>↑</kbd>
          <kbd>↓</kbd> {tx('move')}
        </span>
        <span>
          <kbd>Enter</kbd> {tx('open')}
        </span>
        <span>
          <kbd>Esc</kbd> {tx('close')}
        </span>
        <span style={{ marginInlineStart: 'auto' }}>
          <kbd>Ctrl</kbd>
          <kbd>K</kbd> {tx('search from anywhere')}
        </span>
      </div>
    </div>
  );

  return (
    <div className="gsearch">
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
        style={{ position: 'absolute', insetInlineStart: '12px', top: '10px', color: 'var(--muted)' }}
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4-4" />
      </svg>
      <label htmlFor="gq" className="sr">
        {tx('Search')}
      </label>
      <input
        id="gq"
        ref={input}
        className="input"
        placeholder={t(placeholder)}
        autoComplete="off"
        spellCheck={false}
        role="combobox"
        aria-autocomplete="list"
        aria-controls="gs-panel"
        aria-expanded={open ? 'true' : 'false'}
        aria-activedescendant={open && act >= 0 ? 'gs-o-' + act : undefined}
        value={q}
        onFocus={show}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onChange={(e) => {
          setQ(e.target.value);
          if (!open) show();
        }}
        onKeyDown={onKeyDown}
      />
      {open ? createPortal(panel, document.body) : null}
    </div>
  );
}
