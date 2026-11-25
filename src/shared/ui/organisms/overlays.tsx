'use client';

import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { cx } from '../../lib/cx';

/* Modal and side panel from the approved UI kit. Rendered in place (not portalled) so they keep
   the theme variables of the screen; both are position:fixed. */

const FOCUSABLE =
  'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Esc closes, focus moves in on open, stays inside while open and returns on close. */
function useModalFocus(onClose: () => void): { ref: RefObject<HTMLElement | null>; onKeyDown: (e: KeyboardEvent<HTMLElement>) => void } {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const el = ref.current;
    (el?.querySelector<HTMLElement>('[data-autofocus]') ?? el?.querySelector<HTMLElement>(FOCUSABLE) ?? el)?.focus();
    return () => before?.focus?.();
  }, []);
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !ref.current) return;
    const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  return { ref, onKeyDown };
}

const CloseIcon = (): ReactNode => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

type DialogProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  onClose: () => void;
  /** 560 confirm · 880 form or email · 1240 document review · up to 1480 dense forms. */
  size?: 'sm' | 'wide' | 'doc' | 'full';
  footer?: ReactNode;
  /** Text at the start of the footer, before the buttons. */
  footerNote?: ReactNode;
  /** Above the shell (top bar, side nav) and a side panel (201); raise it to stack dialogs. */
  zIndex?: number;
  className?: string;
  children: ReactNode;
};

/** Title is the task or a question; footer has Cancel and one primary action. */
export function Dialog({ title, subtitle, onClose, size = 'sm', footer, footerNote, zIndex = 211, className, children }: DialogProps) {
  const id = useId();
  const { t } = useTranslation('common');
  const { ref, onKeyDown } = useModalFocus(onClose);
  return (
    <>
      <button
        type="button"
        className="scrim"
        aria-hidden="true"
        tabIndex={-1}
        style={zIndex ? { zIndex: zIndex - 1 } : undefined}
        onClick={onClose}
      />
      <div
        ref={ref as RefObject<HTMLDivElement | null>}
        className={cx('dlg dim', size !== 'sm' && size, className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        tabIndex={-1}
        style={zIndex ? { zIndex } : undefined}
        onKeyDown={onKeyDown}
      >
        <div className="dh">
          <div>
            <h2 id={id}>{title}</h2>
            {subtitle ? <small className="text-muted text-[12px]">{subtitle}</small> : null}
          </div>
          <button type="button" className="btn btn-icon ms-auto" aria-label={t('Close')} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="db">{children}</div>
        {footer ? (
          <div className="df">
            {footerNote ? <span className="me-auto text-muted text-[12px]">{footerNote}</span> : null}
            {footer}
          </div>
        ) : null}
      </div>
    </>
  );
}

type SidePanelProps = {
  /** Key, name and status of the row the panel shows. */
  header: ReactNode;
  label: string;
  onClose: () => void;
  footer?: ReactNode;
  zIndex?: number;
  children: ReactNode;
};

/** Details of one row while the list stays in view. Opens from the right, 820px. */
export function SidePanel({ header, label, onClose, footer, zIndex = 201, children }: SidePanelProps) {
  const { t } = useTranslation('common');
  const { ref, onKeyDown } = useModalFocus(onClose);
  return (
    <>
      <button
        type="button"
        className="scrim"
        aria-hidden="true"
        tabIndex={-1}
        style={zIndex ? { zIndex: zIndex - 1 } : undefined}
        onClick={onClose}
      />
      <aside
        ref={ref}
        className="panel"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        style={zIndex ? { zIndex } : undefined}
        onKeyDown={onKeyDown}
      >
        <div className="panel-h">
          <div className="flex flex-wrap items-center gap-3 min-w-0">{header}</div>
          <button type="button" className="btn btn-icon ms-auto" aria-label={t('Close')} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="panel-b">{children}</div>
        {footer ? <div className="panel-f">{footer}</div> : null}
      </aside>
    </>
  );
}
