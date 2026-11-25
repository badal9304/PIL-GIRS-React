import { queryOptions, useQuery } from '@tanstack/react-query';
import { FALLBACK_SESSION, type Session } from '../model/session';
import { fetchSession } from './user.api';
import { userKeys } from './user.keys';

export const sessionQuery = () => queryOptions({ queryKey: userKeys.session(), queryFn: fetchSession });

/** The signed-in user; the fallback session is shown while it loads. */
export function useSession(): Session {
  const { data } = useQuery(sessionQuery());
  return data ?? FALLBACK_SESSION;
}
