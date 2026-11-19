import { legacyOf, routeOf } from '../app/navigation';

/**
 * Bridge between plain TypeScript screen logic (view-models, document helpers) and the React app:
 * routing and the current zoom factor of the fitted 1920px canvas.
 */
let navigateFn: ((to: string) => void) | null = null;
let zoom = 1;

export function registerNavigate(fn: (to: string) => void) {
  navigateFn = fn;
}

/** Opens a screen. Accepts app routes or prototype file names ("receipting.html?q=…"). */
export function navigateTo(href: string) {
  const to = routeOf(href);
  if (navigateFn) navigateFn(to);
  else window.location.assign(import.meta.env.BASE_URL.replace(/\/$/, '') + to);
}

/** Prototype file name of the screen that is open now. */
export function currentLegacyPage(): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return legacyOf(window.location.pathname.slice(base.length) || '/');
}

export function setZoom(z: number) {
  zoom = z;
}

export function getZoom() {
  return zoom;
}
