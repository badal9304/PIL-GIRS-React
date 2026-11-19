import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/context';
import { GlobalSearch } from '../../features/search/GlobalSearch';
import { useSettings } from '../providers/contexts';
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
    className="absolute end-2.5 top-1/2 -mt-2 pointer-events-none text-muted"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/** Top bar: global search, working location, entity, fiscal period, approvals and profile. */
export function TopBar() {
  const { t, tx } = useI18n();
  const { hub, setHub, entity, setEntity } = useSettings();
  const pending = `${PENDING_APPROVALS} pending approvals`;

  return (
    <div className="h-13 flex-none flex items-center gap-3 px-5 bg-surface border-b border-b-line2 box-border">
      <GlobalSearch placeholder="Search anything: invoice, B/L, customer, container, screen…  (Ctrl K)" />
      <div className="flex-auto" />
      <div className="relative">
        <label htmlFor="ghub" className="sr">
          {tx('Hub')}
        </label>
        <select id="ghub" className="select select-sm w-37" value={hub} onChange={(e) => setHub(e.target.value)}>
          {HUBS.map(([v, l]) => (
            <option key={v} value={v}>
              {tx(l)}
            </option>
          ))}
        </select>
        {chevron}
      </div>
      <div className="relative">
        <label htmlFor="gent" className="sr">
          {tx('Entity')}
        </label>
        <select id="gent" className="select select-sm w-25" value={entity} onChange={(e) => setEntity(e.target.value)}>
          {ENTITIES.map((v) => (
            <option key={v} value={v}>
              {tx(v)}
            </option>
          ))}
        </select>
        {chevron}
      </div>
      <span className="chip bg-okbg text-ok h-8 rounded-[6px]">
        <span className="size-2 rounded-full bg-okdot" />
        {tx('Period [Fiscal period] · Open')}
      </span>
      <Link to={routeOf('approvals-inbox.html')} className="btn btn-icon relative no-underline" aria-label={t(pending)} title={t(pending)}>
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
        <span className="mono absolute -top-1.5 -end-1.5 min-w-4.5 h-4.5 px-1 rounded-[9px] bg-brand text-onaccent text-[12px] leading-[18px] text-center box-border">
          {PENDING_APPROVALS}
        </span>
      </Link>
      <UserMenu />
    </div>
  );
}
