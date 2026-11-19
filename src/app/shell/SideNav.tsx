import { useEffect, useState, type MouseEvent } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV, groupOf } from '../navigation';
import { useSettings } from '../providers/contexts';
import { useI18n } from '../../i18n/context';
import { HUBS, ENTITIES } from './context';

interface Props {
  drawerOpen: boolean;
  onCloseDrawer: () => void;
}

const chevron = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

/**
 * Left navigation. Expanded: accordion of sections. Collapsed (64px rail): section icons that open
 * their screens in a flyout beside the rail; the rail only expands from the button at the bottom.
 */
export function SideNav({ drawerOpen, onCloseDrawer }: Props) {
  const { t, tx } = useI18n();
  const { sidebarCollapsed: c, setSidebarCollapsed, hub, setHub, entity, setEntity, theme } = useSettings();
  const { pathname } = useLocation();
  const activeGroup = groupOf(pathname)?.id || '';
  // expanded menu: the open section (defaults to the section of the open screen)
  const [accPick, setAcc] = useState<string | null>(null);
  const acc = accPick ?? activeGroup;
  // collapsed rail: flyout of one section; it belongs to the screen it was opened on
  const [flyState, setFly] = useState<{ id: string; top: number; at: string } | null>(null);
  const fly = c && flyState?.at === pathname ? flyState : null;

  // Esc closes the flyout
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFly(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const toggleGroup = (id: string) => (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (c) {
      const top = Math.round(e.currentTarget.getBoundingClientRect().top);
      setFly(fly?.id === id ? null : { id, top, at: pathname });
    } else setAcc(acc === id ? '' : id);
  };

  const hide = c ? { display: 'none' } : undefined;
  const sbLabel = c ? 'Expand side panel' : 'Collapse side panel';

  return (
    <aside
      id="gside"
      className="gside"
      data-drawer={drawerOpen ? 'open' : 'closed'}
      aria-label={t('Side panel')}
      style={{
        flex: 'none',
        width: c ? '64px' : '240px',
        background: 'var(--surface)',
        borderInlineEnd: '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box',
        transition: 'width .18s ease',
      }}
    >
      <div
        style={{
          height: '52px',
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid var(--line2)',
          boxSizing: 'border-box',
          ...(c ? { justifyContent: 'center', padding: 0 } : { padding: '0 20px' }),
        }}
      >
        <span className="glogo" style={{ display: 'inline-flex', borderRadius: '4px', padding: '2px 4px' }}>
          <img
            src={`${import.meta.env.BASE_URL}${theme === 'dark' ? 'pil-logo-dark.png' : 'pil-logo.png'}`}
            alt="PIL"
            style={{
              display: 'block',
              ...(c
                ? { height: '26px', width: '30px', objectFit: 'cover', objectPosition: 'left center' }
                : { height: '26px', width: 'auto' }),
            }}
          />
        </span>
        <span style={{ width: '1px', height: '20px', background: 'var(--line)', ...hide }} />
        <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.04em', color: 'var(--accent)', ...hide }}>GIRS</span>
        <button
          className="btn btn-icon btn-sm gdclose"
          aria-label={t('Close menu')}
          style={{ marginInlineStart: 'auto', width: '32px' }}
          onClick={onCloseDrawer}
        >
          <svg {...chevron}>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {/* hub / entity pickers shown inside the mobile drawer */}
      <div
        className="gdctx"
        style={{ flex: 'none', flexDirection: 'column', gap: '10px', padding: '12px 16px', borderBottom: '1px solid var(--line2)' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 96px', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <label htmlFor="dhub" className="sr">
              {tx('Hub')}
            </label>
            <select id="dhub" className="select select-sm" value={hub} style={{ width: '100%' }} onChange={(e) => setHub(e.target.value)}>
              {HUBS.map(([v, l]) => (
                <option key={v} value={v}>
                  {tx(l)}
                </option>
              ))}
            </select>
          </div>
          <div style={{ position: 'relative' }}>
            <label htmlFor="dent" className="sr">
              {tx('Entity')}
            </label>
            <select
              id="dent"
              className="select select-sm"
              value={entity}
              style={{ width: '100%' }}
              onChange={(e) => setEntity(e.target.value)}
            >
              {ENTITIES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span
            className="chip"
            title={t('Fiscal period')}
            style={{ background: 'var(--okbg)', color: 'var(--ok)', height: '28px', borderRadius: '6px' }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--okdot)' }} />
            {tx('[Fiscal period] · Open')}
          </span>
        </div>
      </div>

      <nav
        aria-label={t('Screens')}
        data-c={c ? 'true' : 'false'}
        style={{
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          padding: '10px 10px 16px',
        }}
      >
        {c && fly ? <div className="ng-bd" aria-hidden="true" onClick={() => setFly(null)} /> : null}
        {NAV.map((g) => {
          const open = c ? fly?.id === g.id : acc === g.id;
          return (
            <div key={g.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                className={'nav-grp' + (g.id === activeGroup ? ' nav-grp-on' : '')}
                aria-expanded={open ? 'true' : 'false'}
                aria-controls={'ng-' + g.id}
                title={t(g.label)}
                style={c ? { justifyContent: 'center', padding: 0 } : undefined}
                onClick={toggleGroup(g.id)}
              >
                {g.icon}
                <span className="ng-l" style={hide}>
                  {tx(g.label)}
                </span>
                <svg className="ng-ch" {...chevron} style={{ transform: `rotate(${open ? '180deg' : '0deg'})`, ...hide }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {open ? (
                <div
                  id={'ng-' + g.id}
                  className={'ng-sub' + (c ? ' ng-fly' : '')}
                  style={c ? { top: (fly?.top || 0) + 'px', maxHeight: `calc(100vh - ${(fly?.top || 0) + 16}px)` } : undefined}
                  role="group"
                  aria-label={t(g.label)}
                >
                  {c ? <div className="ng-fh">{tx(g.label)}</div> : null}
                  {g.screens.map((sc) => (
                    <NavLink
                      key={sc.id}
                      to={sc.path}
                      className={({ isActive }) => 'nav-item' + (isActive ? ' nav-on' : '')}
                      title={t(sc.label)}
                    >
                      {tx(sc.label)}
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="gsbfoot" style={{ flex: 'none', padding: '8px 10px', borderTop: '1px solid var(--line2)' }}>
        <button
          className="sbtoggle"
          aria-expanded={c ? 'false' : 'true'}
          aria-label={t(sbLabel)}
          title={t(sbLabel)}
          style={c ? { justifyContent: 'center', paddingInline: 0 } : undefined}
          onClick={() => setSidebarCollapsed(!c)}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M9 4v16" />
            <path d={c ? 'M14 9l3 3-3 3' : 'M16 15l-3-3 3-3'} />
          </svg>
          <span style={hide}>{tx('Collapse side panel')}</span>
        </button>
      </div>
    </aside>
  );
}
