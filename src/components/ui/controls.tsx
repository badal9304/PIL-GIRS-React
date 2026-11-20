import { useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cx } from './cx';

/* Buttons, fields and form controls from the approved UI kit (ui-kit.html).
   They only emit the standard classes in styles/ui.css and styles/base.css, so a screen
   built with them looks the same as one written in the prototype markup. */

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

type FieldProps = { label: ReactNode; error?: ReactNode; className?: string; children: (ids: { id: string; errId?: string }) => ReactNode };

/** Label above, control, short reason under it when invalid. */
export function Field({ label, error, className, children }: FieldProps) {
  const id = useId();
  const errId = error ? id + '-err' : undefined;
  return (
    <div className={cx('fld', className)}>
      <label className="lbl" htmlFor={id}>
        {label}
      </label>
      {children({ id, errId })}
      {error ? (
        <span className="fld-err" id={errId}>
          {error}
        </span>
      ) : null}
    </div>
  );
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & { label: ReactNode; error?: ReactNode; fieldClassName?: string };

/** 36px text input. Grey when `readOnly`; red border plus reason when `error` is set. */
export function TextField({ label, error, fieldClassName, className, ...rest }: TextFieldProps) {
  return (
    <Field label={label} error={error} className={fieldClassName}>
      {({ id, errId }) => (
        <input
          id={id}
          className={cx('input', !!error && 'bad', className)}
          aria-invalid={error ? true : undefined}
          aria-describedby={errId}
          {...rest}
        />
      )}
    </Field>
  );
}

export const Chevron = () => (
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

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  options: ReadonlyArray<string | { value: string; label: ReactNode }>;
  size?: 'sm' | 'md';
  invalid?: boolean;
  wrapClassName?: string;
};

/** Native select with the kit chevron. For short fixed lists; use Combobox for long ones. */
export function Select({ options, size = 'md', invalid, wrapClassName, className, ...rest }: SelectProps) {
  return (
    <div className={cx('sel', wrapClassName)}>
      <select
        className={cx('select', size === 'sm' && 'select-sm', invalid && 'bad', className)}
        aria-invalid={invalid || undefined}
        {...rest}
      >
        {options.map((o) =>
          typeof o === 'string' ? (
            <option key={o} value={o}>
              {o}
            </option>
          ) : (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ),
        )}
      </select>
      <Chevron />
    </div>
  );
}

export function SelectField({
  label,
  error,
  fieldClassName,
  ...rest
}: Omit<SelectProps, 'id'> & { label: ReactNode; error?: ReactNode; fieldClassName?: string }) {
  return (
    <Field label={label} error={error} className={fieldClassName}>
      {({ id, errId }) => <Select id={id} invalid={!!error} aria-describedby={errId} {...rest} />}
    </Field>
  );
}

/** Filters the list it sits above. `label` names what is searched for screen readers. */
export function SearchField({ label, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className={cx('search', className)}>
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
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4-4" />
      </svg>
      <input type="search" className="input" aria-label={label} {...rest} />
    </div>
  );
}

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
