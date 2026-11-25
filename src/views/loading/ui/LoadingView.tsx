import type { ReactNode } from 'react';

/** Route-level loading state (static export: shown only while a screen's code loads). */
export function LoadingView(): ReactNode {
  return <div className="gmain flex-auto" aria-busy="true" />;
}
