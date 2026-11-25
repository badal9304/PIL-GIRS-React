import { serve } from '@/shared/api';
import { sessionDtoSchema, toSession, type Session } from '../model/session';

/** Signed-in user and their logins (role · agency). Sample values until LMS IAM is connected. */
export async function fetchSession(): Promise<Session> {
  const dto = await serve('iam/session', sessionDtoSchema, () => ({
    user: { name: 'Daniel Tan', initials: 'DT' },
    logins: [
      { role: 'Billing Executive', agency: 'Singapore · SIN', code: 'SIN' },
      { role: 'Team Lead', agency: 'Malaysia · PKG', code: 'PKG' },
    ],
  }));
  return toSession(dto);
}
