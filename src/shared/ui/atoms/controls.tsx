import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/cx';

/* Buttons and small controls from the approved UI kit. They only emit the standard classes in
   core/styles (ui.css, base.css), so a screen built with them looks the same as the prototype markup. */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** One primary action per area. */
  variant?: 'primary' | 'secondary';
  /** 32px, for tables, toolbars and panels. Default is 36px. */
  size?: 'sm' | 'md';
};

export function Button({ variant = 'secondary', size = 'md', className, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={cx('btn', variant === 'primary' && 'btn-primary', size === 'sm' && 'btn-sm', className)} {...rest} />
  );
}

/** Square icon button. `label` is required because there is no visible text. */
export function IconButton({ label, className, type = 'button', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return <button type={type} className={cx('btn btn-icon', className)} aria-label={label} title={label} {...rest} />;
}

export function TextLink({ className, type = 'button', mono, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { mono?: boolean }) {
  return <button type={type} className={cx('lnk', mono && 'mono', className)} {...rest} />;
}

export const Chevron = (): ReactNode => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export function Checkbox({ label, className, ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label?: ReactNode }) {
  const box = <input type="checkbox" className={cx('cbx', !label && className)} {...rest} />;
  if (!label) return box;
  return (
    <label className={cx('inline-flex items-center gap-2 cursor-pointer', className)}>
      {box}
      {label}
    </label>
  );
}
