import { useId, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from './cx';

export type ComboOption = { value: string; label: string; code?: string };

type ComboboxProps = {
  label?: ReactNode;
  /** Required when there is no visible label. */
  ariaLabel?: string;
  options: ComboOption[];
  /** Text in the box; the screen owns it so a typed value can be kept even if nothing is picked. */
  value: string;
  onInput: (text: string) => void;
  onPick: (opt: ComboOption) => void;
  placeholder?: string;
  error?: ReactNode;
  className?: string;
  /** Most matches listed at once. */
  limit?: number;
};

/** Type-ahead: search by name or code; arrow keys move, Enter picks, Esc closes. */
export function Combobox({ label, ariaLabel, options, value, onInput, onPick, placeholder, error, className, limit = 8 }: ComboboxProps) {
  const id = useId();
  const listId = id + '-list';
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const q = value.trim().toLowerCase();
  const matches = (
    q ? options.filter((o) => o.label.toLowerCase().includes(q) || (o.code ?? '').toLowerCase().includes(q)) : options
  ).slice(0, limit);
  const shown = open && matches.length > 0;
  const at = Math.min(active, matches.length - 1);

  const pick = (o: ComboOption) => {
    onPick(o);
    setOpen(false);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, matches.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && shown) {
      e.preventDefault();
      pick(matches[at]);
    } else if (e.key === 'Escape' && shown) {
      e.stopPropagation();
      setOpen(false);
    }
  };

  return (
    <div className={cx('fld', className)}>
      {label ? (
        <label className="lbl" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <div className="combo">
        <input
          id={id}
          className={cx('input', !!error && 'bad', 'w-full')}
          role="combobox"
          aria-label={label ? undefined : ariaLabel}
          aria-expanded={shown}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={shown ? `${id}-o${at}` : undefined}
          aria-invalid={error ? true : undefined}
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onInput(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKey}
        />
        {shown ? (
          <ul className="ri-sug" role="listbox" id={listId}>
            {matches.map((o, i) => (
              <li
                key={o.value}
                id={`${id}-o${i}`}
                role="option"
                aria-selected={i === at}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(o);
                }}
                onMouseEnter={() => setActive(i)}
              >
                {o.code ? <span className="mono">{o.code}</span> : null}
                {o.label}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {error ? <span className="fld-err">{error}</span> : null}
    </div>
  );
}
