import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { TopBar } from './TopBar';
import { useShell } from './ShellContext';

interface PageProps {
  /** Screen header (title, subtitle and screen actions), sticky under the top bar. */
  header?: ReactNode;
  /** Dialogs / drawers rendered at the end of the app root (above the shell). */
  overlays?: ReactNode;
  /** Spacing of the main area, when a screen needs its own (e.g. tabs flush under the header). */
  mainClassName?: string;
  children: ReactNode;
}

/** Content column of a screen: sticky top bar + header, then the scrolling main area. */
export function Page({ header, overlays, mainClassName = 'pt-4 px-5 pb-5', children }: PageProps) {
  const { overlayRoot } = useShell();
  return (
    <>
      <div className="sticky top-0 z-20 flex-none">
        <TopBar />
        {header}
      </div>
      <main className={`gmain flex-[1_0_auto] ${mainClassName} flex flex-col gap-4 box-border`}>{children}</main>
      {overlays && overlayRoot ? createPortal(overlays, overlayRoot) : null}
    </>
  );
}

interface HeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

/** Standard screen header row. */
export function PageHeader({ title, subtitle, actions }: HeaderProps) {
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
