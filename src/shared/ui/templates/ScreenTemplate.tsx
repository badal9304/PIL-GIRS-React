'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** Element at the end of the app root where screens render dialogs and drawers (provided by the app layout). */
export const OverlayRootContext = createContext<HTMLElement | null>(null);

export const useOverlayRoot = (): HTMLElement | null => useContext(OverlayRootContext);

interface ScreenTemplateProps {
  /** App header (search, location, entity, profile), sticky at the top. */
  topBar: ReactNode;
  /** Screen header (title, subtitle and screen actions), sticky under the top bar. */
  header?: ReactNode;
  /** Dialogs / drawers rendered at the end of the app root (above the shell). */
  overlays?: ReactNode;
  /** Spacing of the main area, when a screen needs its own (e.g. tabs flush under the header). */
  mainClassName?: string;
  children: ReactNode;
}

/** Content column of a screen: sticky top bar + header, then the scrolling main area. */
export function ScreenTemplate({ topBar, header, overlays, mainClassName = 'pt-4 px-5 pb-5', children }: ScreenTemplateProps): ReactNode {
  const overlayRoot = useOverlayRoot();
  return (
    <>
      <div className="sticky top-0 z-20 flex-none">
        {topBar}
        {header}
      </div>
      <main className={`gmain flex-[1_0_auto] ${mainClassName} flex flex-col gap-4 box-border`}>{children}</main>
      {overlays && overlayRoot ? createPortal(overlays, overlayRoot) : null}
    </>
  );
}

interface ScreenHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

/** Standard screen header row. */
export function ScreenHeader({ title, subtitle, actions }: ScreenHeaderProps): ReactNode {
  return (
    <div className="ghead min-h-14 flex-none flex flex-wrap items-center justify-between gap-y-2 gap-x-6 py-2 px-5 bg-surface border-b border-b-line box-border">
      <div className="min-w-0">
        <h1 className="m-0 text-[17px] font-semibold leading-[22px]">{title}</h1>
        {subtitle ? <p className="m-0 text-[12px] leading-[16px] text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="gright flex flex-wrap items-center justify-end gap-2.5 ms-auto">{actions}</div> : null}
    </div>
  );
}
