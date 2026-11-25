import type { ReactNode } from 'react';
import { cx } from '../../lib/cx';

/* Status and count indicators from the approved UI kit. */

export type Tone = 'neutral' | 'info' | 'ok' | 'warn' | 'bad';

/** A record's state. Five tones only; the word always carries the meaning, colour supports it. */
export function StatusTag({
  tone = 'neutral',
  dir,
  mono,
  className,
  children,
}: {
  tone?: Tone;
  dir?: 'E' | 'I';
  mono?: boolean;
  className?: string;
  children: ReactNode;
}): ReactNode {
  return <span className={cx('chip', 't-' + tone, dir && 'dot-' + dir.toLowerCase(), mono && 'mono', className)}>{children}</span>;
}

/** Number next to a label (tabs, filters, selections). `on` for the active one. */
export function Count({ on, children }: { on?: boolean; children: ReactNode }): ReactNode {
  return <span className={cx('count', on && 'on')}>{children}</span>;
}
