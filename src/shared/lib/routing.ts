import { DEFAULT_PATH, NAV, SCREENS, type NavGroup } from '../constants/screens';

/** Resolves a link written for the prototype ("customer-master-d.html?q=x") to an app route. */
export function routeOf(href: string): string {
  if (!href || /^(https?:|mailto:|tel:|#)/.test(href)) return href;
  if (href.startsWith('/')) return href;
  const [file, query = ''] = href.split('?');
  const name = file.split('/').pop() || '';
  const screen = SCREENS.find((s) => s.legacy.includes(name));
  if (!screen) return DEFAULT_PATH;
  let path = screen.path;
  if (/^(customer|contract|charge)-master/.test(name)) path += /-d\.html$/.test(name) ? '/layout-d' : '/layout-c';
  return path + (query ? '?' + query : '');
}

/** Route without the trailing slash added by the static export ("/home/" -> "/home"). */
export function normalizePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

/** Prototype file name of a route (the reverse of routeOf; used for "back" links). */
export function legacyOf(rawPath: string): string {
  const pathname = normalizePath(rawPath);
  const screen = SCREENS.find((s) => pathname.startsWith(s.path));
  if (!screen) return 'invoice-list-v2.html';
  if (screen.id.endsWith('-master') && screen.ready) return screen.id + (pathname.endsWith('/layout-d') ? '-d' : '-c') + '.html';
  return screen.legacy[0];
}

/** Menu group of the screen open at `pathname`. */
export function groupOf(rawPath: string): NavGroup | undefined {
  const pathname = normalizePath(rawPath);
  return NAV.find((g) => g.screens.some((s) => pathname.startsWith(s.path)));
}
