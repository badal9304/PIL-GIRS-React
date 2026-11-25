import type { SanctionStatus } from '@/entities/customer';

/** Presentation of sanction status and invoicing arrangement (chip styles, list dots). */
export const SANCTION_STYLE: Readonly<Record<SanctionStatus, { chip: string; dot: string; flag: boolean }>> = {
  ok: { chip: 'background:var(--okbg);color:var(--ok)', dot: 'var(--okbar)', flag: false },
  sanc: { chip: 'background:var(--badbg);color:var(--bad)', dot: 'var(--badbar)', flag: true },
  black: { chip: 'background:var(--badbg);color:var(--bad)', dot: 'var(--badbar)', flag: true },
};

export const ARRANGEMENT_STYLE: Readonly<Record<'Default' | 'Split', string>> = {
  Split: 'background:var(--aibg);color:var(--ai)',
  Default: 'background:var(--neutral);color:var(--muted2)',
};

export const initials = (n: string): string =>
  n
    .replace(/[[\]]/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();
