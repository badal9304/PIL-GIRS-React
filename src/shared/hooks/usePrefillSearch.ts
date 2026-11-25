'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * When a global-search result opens a screen with ?q=, put the value into that screen's own
 * search box (master screens etc.). The Invoice List reads ?q= itself.
 */
export function usePrefillSearch(): void {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  useEffect(() => {
    const v = new URLSearchParams(search).get('q');
    if (!v || pathname.startsWith('/invoicing/invoice-list')) return;
    let tries = 0;
    const timer = window.setInterval(() => {
      const f = Array.from(document.querySelectorAll('input')).find(
        (x) => x.id !== 'gq' && x.offsetParent && /search/i.test((x.getAttribute('aria-label') || '') + ' ' + (x.placeholder || '')),
      );
      if (f || ++tries > 20) {
        window.clearInterval(timer);
        if (f) {
          // set through the native setter so React sees the change
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(f, v);
          f.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [pathname, search]);
}
