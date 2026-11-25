import Link from 'next/link';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { routeOf } from '../../lib/routing';

/** Link that accepts app routes or prototype file names ("receipting.html") and routes inside the app. */
export function AppLink({ href = '', ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>): ReactNode {
  if (!href || /^(https?:|mailto:|tel:|#|blob:|data:)/.test(href)) return <a href={href || undefined} {...rest} />;
  return <Link href={routeOf(href)} {...rest} />;
}
