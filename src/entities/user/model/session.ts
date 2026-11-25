import { z } from 'zod';

/** A login of the signed-in user: role at an agency. One person can hold several. */
export const loginSchema = z.object({ role: z.string(), agency: z.string(), code: z.string() });
export type Login = z.infer<typeof loginSchema>;

export const sessionDtoSchema = z.object({
  user: z.object({ name: z.string().min(1), initials: z.string().min(1).max(3) }),
  logins: z.array(loginSchema).min(1),
});
export type SessionDto = z.infer<typeof sessionDtoSchema>;

export interface Session {
  name: string;
  firstName: string;
  initials: string;
  logins: Login[];
}

export const toSession = (dto: SessionDto): Session => ({
  name: dto.user.name,
  firstName: dto.user.name.split(' ')[0] ?? dto.user.name,
  initials: dto.user.initials,
  logins: dto.logins,
});

/** Used until the session loads (and by framework-free screen logic that only needs the name). */
export const FALLBACK_SESSION: Session = toSession({
  user: { name: 'Daniel Tan', initials: 'DT' },
  logins: [
    { role: 'Billing Executive', agency: 'Singapore · SIN', code: 'SIN' },
    { role: 'Team Lead', agency: 'Malaysia · PKG', code: 'PKG' },
  ],
});
