import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SideNav } from './SideNav';
import { ShellContext } from './ShellContext';
import { useSettings } from '../providers/contexts';
import { useToast } from '../providers/contexts';
import { useI18n } from '../../i18n/context';
import { useViewportFit } from '../../hooks/useViewportFit';
import { useTruncationTooltip } from '../../hooks/useTruncationTooltip';
import { usePrefillSearch } from '../../hooks/usePrefillSearch';
import { registerNavigate } from '../../lib/appBridge';

/** Style scope of the screen that is open (page styles are scoped under these classes). */
function pageClass(pathname: string) {
  if (pathname.startsWith('/invoicing/invoice-list')) return 'pg-invoices';
  const m = /^\/system-master\/(customer|contract|charge)-master\/(layout-c|layout-d)/.exec(pathname);
  if (m) return `pg-${m[1]}-${m[2] === 'layout-d' ? 'd' : 'c'}`;
  return 'pg-placeholder';
}

/** App frame: brand bar, side navigation, content column and toast. */
export function AppShell() {
  const { theme } = useSettings();
  const { tx } = useI18n();
  const toast = useToast();
  const { zoom, height } = useViewportFit();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // mobile drawer; it closes when another screen opens
  const [drawer, setDrawer] = useState<string | null>(null);
  const drawerOpen = drawer === pathname;
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null);

  useTruncationTooltip();
  usePrefillSearch();
  useEffect(() => registerNavigate((to) => navigate(to)), [navigate]);

  const shell = useMemo(
    () => ({ drawerOpen, setDrawerOpen: (open: boolean) => setDrawer(open ? pathname : null), overlayRoot }),
    [drawerOpen, pathname, overlayRoot],
  );

  return (
    <ShellContext.Provider value={shell}>
      <div
        className={`theme groot ${pageClass(pathname)}`}
        data-theme={theme}
        style={{
          zoom,
          height: Math.round(height) + 'px',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg)',
          color: 'var(--ink)',
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        }}
      >
        <div aria-hidden="true" style={{ height: '3px', background: 'var(--brand)', flex: 'none' }} />
        <div style={{ flex: '1 1 auto', minHeight: 0, display: 'flex' }}>
          {drawerOpen ? <div className="gscrim" onClick={() => setDrawer(null)} aria-hidden="true" /> : null}
          <SideNav drawerOpen={drawerOpen} onCloseDrawer={() => setDrawer(null)} />
          <div className="gcontent" style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <Outlet />
          </div>
        </div>
        <div ref={setOverlayRoot} style={{ display: 'contents' }} />
        {toast.message ? (
          <div
            role="status"
            className="gtoast"
            style={{
              position: 'fixed',
              bottom: '20px',
              insetInlineEnd: '20px',
              zIndex: 60,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              maxWidth: '520px',
              minHeight: '44px',
              padding: '0 8px 0 16px',
              borderRadius: '8px',
              background: 'var(--ink)',
              color: 'var(--bg)',
              boxShadow: '0 8px 24px rgba(0,0,0,.25)',
              boxSizing: 'border-box',
            }}
          >
            {tx(toast.message)}
            <button className="btn btn-sm" onClick={toast.close}>
              {tx('Close')}
            </button>
          </div>
        ) : null}
      </div>
    </ShellContext.Provider>
  );
}
