/** Signed-in user and the logins (role · agency) available to them. Sample values until IAM is connected. */
export interface Login {
  role: string;
  agency: string;
  code: string;
}

export const USER = { name: 'Daniel Tan', initials: 'DT' };

export const LOGINS: Login[] = [
  { role: 'Billing Executive', agency: 'Singapore · SIN', code: 'SIN' },
  { role: 'Team Lead', agency: 'Malaysia · PKG', code: 'PKG' },
];
