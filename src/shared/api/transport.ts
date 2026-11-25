import type { z } from 'zod';

/** Typed API failure: the endpoint, and what went wrong (transport or contract). */
export class ApiError extends Error {
  readonly endpoint: string;
  readonly kind: 'network' | 'contract';
  constructor(endpoint: string, kind: 'network' | 'contract', message: string) {
    super(message);
    this.name = 'ApiError';
    this.endpoint = endpoint;
    this.kind = kind;
  }
}

/**
 * Sample-data transport. GIRS has no backend connected yet: endpoints are served by local generators that
 * return the same DTO shapes the LMS / GIRS APIs will. Every response is validated against its Zod contract,
 * so swapping in `fetch` later keeps the same guarantees.
 */
export async function serve<T>(endpoint: string, schema: z.ZodType<T>, produce: () => unknown): Promise<T> {
  let raw: unknown;
  try {
    raw = produce();
  } catch (e) {
    throw new ApiError(endpoint, 'network', e instanceof Error ? e.message : String(e));
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) throw new ApiError(endpoint, 'contract', parsed.error.message);
  return parsed.data;
}

/** GET of a static JSON file under public/ (search index, locale files). */
export async function getJson<T>(url: string, schema: z.ZodType<T>): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch (e) {
    throw new ApiError(url, 'network', e instanceof Error ? e.message : String(e));
  }
  if (!res.ok) throw new ApiError(url, 'network', `HTTP ${res.status}`);
  const parsed = schema.safeParse(await res.json());
  if (!parsed.success) throw new ApiError(url, 'contract', parsed.error.message);
  return parsed.data;
}
