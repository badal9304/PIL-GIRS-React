/** Calendar helpers on ISO dates ("2026-11-20"), in local time. */
export type IsoDate = string;

export const toDate = (iso: IsoDate): Date => new Date(iso + 'T00:00:00');

export const toIso = (d: Date): IsoDate =>
  d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

export const addDays = (iso: IsoDate, n: number): IsoDate => {
  const d = toDate(iso);
  d.setDate(d.getDate() + n);
  return toIso(d);
};

/** Whole days from `a` to `b`. */
export const daysBetween = (a: IsoDate, b: IsoDate): number => Math.round((toDate(b).getTime() - toDate(a).getTime()) / 864e5);

export const formatDate = (iso: IsoDate, options?: Intl.DateTimeFormatOptions): string =>
  toDate(iso).toLocaleDateString('en-GB', options ?? { weekday: 'short', day: 'numeric', month: 'short' });

export const timeNow = (): string => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
