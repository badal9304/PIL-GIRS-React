'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { AppSidebar } from '@/compositions/app-sidebar';
import { Toast } from '@/entities/notification';
import { useSettings } from '@/features/settings';
import { usePrefillSearch } from '@/shared/hooks/usePrefillSearch';
import { useTruncationTooltip } from '@/shared/hooks/useTruncationTooltip';
import { useViewportFit } from '@/shared/hooks/useViewportFit';
import { registerNavigate } from '@/shared/lib/navigationBridge';
import { normalizePath } from '@/shared/lib/routing';
import { OverlayRootContext } from '@/shared/ui';

/** Style scope of the screen that is open (screen stylesheets are scoped under these classes). */
function pageClass(pathname: string): string {
  if (pathname.startsWith('/home')) return 'pg-home';
  if (pathname.startsWith('/invoicing/invoice-list')) return 'pg-invoices';
  const m = /^\/system-master\/(customer|contract|charge)-master\/(layout-c|layout-d)/.exec(pathname);
  if (m) return `pg-${m[1]}-${m[2] === 'layout-d' ? 'd' : 'c'}`;
  return 'pg-placeholder';
}

/** Copies ?q= from a search result into the opened screen's own search box (needs search params, so suspends). */
function PrefillSearch(): ReactNode {
  usePrefillSearch();
  return null;
}

/** App frame: brand bar, side navigation, content column, overlay root and toast. 1920px canvas fitted to the window. */
export function AppLayout({ children }: { children: ReactNode }): ReactNode {
  const { theme } = useSettings();
  const { zoom, height } = useViewportFit();
  const pathname = normalizePath(usePathname());
  const router = useRouter();
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null);

  useTruncationTooltip();
  useEffect(() => registerNavigate((to) => router.push(to)), [router]);

  return (
    <OverlayRootContext.Provider value={overlayRoot}>
      <div
        className={`theme groot ${pageClass(pathname)} min-h-0 flex flex-col bg-bg text-ink font-sans`}
        data-theme={theme}
        style={{ zoom, height: Math.round(height) + 'px' }}
      >
        <div aria-hidden="true" className="h-0.75 bg-brand flex-none" />
        <div className="flex-auto min-h-0 flex">
          <AppSidebar />
          <div className="gcontent flex-auto min-w-0 flex flex-col overflow-y-auto">{children}</div>
        </div>
        <div ref={setOverlayRoot} className="contents" />
        <Toast />
        <Suspense fallback={null}>
          <PrefillSearch />
        </Suspense>
      </div>
    </OverlayRootContext.Provider>
  );
}
