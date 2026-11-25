import type { ApprovalStatus, ValidityState } from '@/entities/contract';

/** Presentation of validity and approval status (chips, list dots). */
export const VALIDITY_CHIP: Readonly<Record<ValidityState, string>> = {
  Expired: 'background:var(--neutral);color:var(--muted2)',
  Upcoming: 'background:var(--tint);color:var(--accent2)',
  'In force': 'background:var(--okbg);color:var(--ok)',
};

export const APPROVAL_STYLE: Readonly<Record<ApprovalStatus, { chip: string; dot: string }>> = {
  Approved: { chip: 'background:var(--okbg);color:var(--ok)', dot: 'var(--okbar)' },
  'Pending approval': { chip: 'background:var(--warnbg);color:var(--warn)', dot: 'var(--warnbar)' },
  Draft: { chip: 'background:var(--neutral);color:var(--muted2)', dot: 'var(--muted4)' },
  Rejected: { chip: 'background:var(--badbg);color:var(--bad)', dot: 'var(--badbar)' },
};
