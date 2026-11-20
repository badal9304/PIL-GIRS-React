import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SideNav } from './SideNav';
import { ShellContext } from './ShellContext';
import { useSettings, useToast, useToastMessage } from '../providers/contexts';
import { useI18n } from '../../i18n/context';
import { useViewportFit } from '../../hooks/useViewportFit';
import { useTruncationTooltip } from '../../hooks/useTruncationTooltip';
import { usePrefillSearch } from '../../hooks/usePrefillSearch';
import { registerNavigate } from '../../lib/appBridge';

/** Style scope of the screen that is open (screen stylesheets are scoped under these classes). */
function pageClass(pathname: string) {
  if (pathname.startsWith('/home')) return 'pg-home';
  if (pathname.startsWith('/invoicing/invoice-list')) return 'pg-invoices';
  const m = /^\/system-master\/(customer|contract|charge)-master\/(layout-c|layout-d)/.exec(pathname);
  if (m) return `pg-${m[1]}-${m[2] === 'layout-d' ? 'd' : 'c'}`;
  return 'pg-placeholder';
}

/** App frame: brand bar, side navigation, content column and toast. Desktop layout (1920px canvas fitted to the window). */
export function AppShell() {
  const { theme } = useSettings();
  const { zoom, height } = useViewportFit();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null);

  useTruncationTooltip();
  usePrefillSearch();
  useEffect(() => registerNavigate((to) => navigate(to)), [navigate]);

  const shell = useMemo(() => ({ overlayRoot }), [overlayRoot]);

  return (
    <ShellContext.Provider value={shell}>
      <div
        className={`theme groot ${pageClass(pathname)} min-h-0 flex flex-col bg-bg text-ink font-sans`}
        data-theme={theme}
        style={{ zoom, height: Math.round(height) + 'px' }}
      >
        <div aria-hidden="true" className="h-0.75 bg-brand flex-none" />
        <div className="flex-auto min-h-0 flex">
          <SideNav />
          <div className="gcontent flex-auto min-w-0 flex flex-col overflow-y-auto">
            <Outlet />
          </div>
        </div>
        <div ref={setOverlayRoot} className="contents" />
        <Toast />
      </div>
    </ShellContext.Provider>
  );
}

/** Bottom-right status message. Its own component so a toast re-renders only itself, not the shell and screen. */
function Toast() {
  const { tx } = useI18n();
  const { close } = useToast();
  const message = useToastMessage();
  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed bottom-5 end-5 z-60 flex items-center gap-3 max-w-130 min-h-11 pr-2 pl-4 rounded-[8px] bg-ink text-bg shadow-[0_8px_24px_rgba(0,0,0,.25)] box-border"
    >
      {tx(message)}
      <button className="btn btn-sm" onClick={close}>
        {tx('Close')}
      </button>
    </div>
  );
}
