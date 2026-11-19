import type { AnchorHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { routeOf } from '../app/navigation';

/** Link that accepts app routes or prototype file names ("receipting.html") and routes inside the app. */
export function AppLink({ href = '', ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (!href || /^(https?:|mailto:|tel:|#|blob:|data:)/.test(href)) return <a href={href || undefined} {...rest} />;
  return <Link to={routeOf(href)} {...rest} />;
}
