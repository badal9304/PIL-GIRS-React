/** Path prefix the app is served under ("" locally, "/PIL-GIRS-React" on GitHub Pages). */
export const BASE_PATH: string = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** URL of a file in public/ (logos, locale files), including the base path. */
export function publicUrl(path: string): string {
  return BASE_PATH + (path.startsWith('/') ? path : '/' + path);
}
