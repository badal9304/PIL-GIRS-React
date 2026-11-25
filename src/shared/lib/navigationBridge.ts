import { BASE_PATH } from './basePath';
import { legacyOf, routeOf } from './routing';

/**
 * Bridge between framework-free screen logic (screen models, document helpers) and the router:
 * screen logic calls navigateTo(), the app layout registers the router, and the fitted canvas reports its zoom.
 */
let navigateFn: ((to: string) => void) | null = null;
let zoom = 1;

/** Registers the router's push function; returns an unregister function. */
export function registerNavigate(fn: (to: string) => void): () => void {
  navigateFn = fn;
  return () => {
    if (navigateFn === fn) navigateFn = null;
  };
}

/** Opens a screen. Accepts app routes or prototype file names ("receipting.html?q=…"). */
export function navigateTo(href: string): void {
  const to = routeOf(href);
  if (navigateFn) navigateFn(to);
  else window.location.assign(BASE_PATH + to);
}

/** Prototype file name of the screen that is open now. */
export function currentLegacyPage(): string {
  return legacyOf(window.location.pathname.slice(BASE_PATH.length) || '/');
}

export function setZoom(z: number): void {
  zoom = z;
}

export function getZoom(): number {
  return zoom;
}
