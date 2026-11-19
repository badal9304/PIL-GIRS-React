import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { TopBar } from './TopBar';
import { useShell } from './ShellContext';

interface PageProps {
  /** Screen header (title, subtitle and screen actions), sticky under the top bar. */
  header?: ReactNode;
  /** Dialogs / drawers rendered at the end of the app root (above the shell). */
  overlays?: ReactNode;
  children: ReactNode;
}

/** Content column of a screen: sticky top bar + header, then the scrolling main area. */
export function Page({ header, overlays, children }: PageProps) {
  const { overlayRoot } = useShell();
  return (
    <>
      <div style={{ position: 'sticky', top: 0, zIndex: 20, flex: 'none' }}>
        <TopBar />
        {header}
      </div>
      <main
        className="gmain"
        style={{
          flex: '1 0 auto',
          padding: '16px 20px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </main>
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
    <div
      className="ghead"
      style={{
        minHeight: '56px',
        flex: 'none',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px 24px',
        padding: '8px 20px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--line)',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <h1 style={{ margin: 0, fontSize: '17px', fontWeight: 600, lineHeight: '22px' }}>{title}</h1>
        {subtitle ? <p style={{ margin: 0, fontSize: '12px', lineHeight: '16px', color: 'var(--muted)' }}>{subtitle}</p> : null}
      </div>
      {actions ? (
        <div
          className="gright"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            marginInlineStart: 'auto',
          }}
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
}
