import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/context';
import { GlobalSearch } from '../../features/search/GlobalSearch';
import { useSettings } from '../providers/contexts';
import { useShell } from './ShellContext';
import { UserMenu } from './UserMenu';
import { ENTITIES, HUBS, PENDING_APPROVALS } from './context';
import { routeOf } from '../navigation';

const chevron = (
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
    style={{ position: 'absolute', insetInlineEnd: '10px', top: '50%', marginTop: '-8px', pointerEvents: 'none', color: 'var(--muted)' }}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/** Top bar: menu (narrow screens), global search, working location, entity, fiscal period, approvals and profile. */
export function TopBar() {
  const { t, tx } = useI18n();
  const { hub, setHub, entity, setEntity } = useSettings();
  const { drawerOpen, setDrawerOpen } = useShell();
  const pending = `${PENDING_APPROVALS} pending approvals`;

  return (
    <div
      className="gtop"
      style={{
        height: '52px',
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '0 20px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--line2)',
        boxSizing: 'border-box',
      }}
    >
      <button
        className="btn btn-icon gmenu"
        aria-label={t('Open menu')}
        aria-controls="gside"
        aria-expanded={drawerOpen ? 'true' : 'false'}
        onClick={() => setDrawerOpen(!drawerOpen)}
      >
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
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <GlobalSearch placeholder="Search anything: invoice, B/L, customer, container, screen…  (Ctrl K)" />
      <div className="grow" />
      <div className="gctx" style={{ position: 'relative' }}>
        <label htmlFor="ghub" className="sr">
          {tx('Hub')}
        </label>
        <select id="ghub" className="select select-sm" value={hub} onChange={(e) => setHub(e.target.value)} style={{ width: '148px' }}>
          {HUBS.map(([v, l]) => (
            <option key={v} value={v}>
              {tx(l)}
            </option>
          ))}
        </select>
        {chevron}
      </div>
      <div className="gctx" style={{ position: 'relative' }}>
        <label htmlFor="gent" className="sr">
          {tx('Entity')}
        </label>
        <select
          id="gent"
          className="select select-sm"
          value={entity}
          onChange={(e) => setEntity(e.target.value)}
          style={{ width: '100px' }}
        >
          {ENTITIES.map((v) => (
            <option key={v} value={v}>
              {tx(v)}
            </option>
          ))}
        </select>
        {chevron}
      </div>
      <span className="chip gperiod" style={{ background: 'var(--okbg)', color: 'var(--ok)', height: '32px', borderRadius: '6px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--okdot)' }} />
        {tx('Period [Fiscal period] · Open')}
      </span>
      <Link
        to={routeOf('approvals-inbox.html')}
        className="btn btn-icon"
        aria-label={t(pending)}
        title={t(pending)}
        style={{ position: 'relative', textDecoration: 'none' }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
        </svg>
        <span
          className="mono"
          style={{
            position: 'absolute',
            top: '-6px',
            insetInlineEnd: '-6px',
            minWidth: '18px',
            height: '18px',
            padding: '0 4px',
            borderRadius: '9px',
            background: 'var(--brand)',
            color: 'var(--onaccent)',
            fontSize: '12px',
            lineHeight: '18px',
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
        >
          {PENDING_APPROVALS}
        </span>
      </Link>
      <UserMenu />
    </div>
  );
}
