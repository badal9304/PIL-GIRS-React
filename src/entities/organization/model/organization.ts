/** Working locations (hubs) and legal entities a user can work in. Reference data shown in the app header. */
export interface Hub {
  code: string;
  /** English label, also the translation key. */
  label: string;
}

export const HUBS: readonly Hub[] = [
  { code: 'SIN', label: 'Singapore · SIN' },
  { code: 'NSA', label: 'India · NSA' },
  { code: 'LCH', label: 'Thailand · LCH' },
  { code: 'PKG', label: 'Malaysia · PKG' },
  { code: 'JED', label: 'Saudi Arabia · JED' },
  { code: 'ZLO', label: 'Mexico · ZLO' },
];

export const ENTITIES: readonly string[] = ['PIL', 'MELL', 'MSC'];

/** Count shown on the approvals bell (sample value until the approvals service is connected). */
export const PENDING_APPROVALS = 10;
