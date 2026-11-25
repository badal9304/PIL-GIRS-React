import type { z } from 'zod';

/** localStorage access that never throws (private mode, blocked storage, server rendering). */
export function readStore(key: string): string | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStore(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable: the value lasts for this session only */
  }
}

export function removeStore(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* storage unavailable */
  }
}

/** Reads a JSON value and validates it; returns `fallback` when missing, unreadable or invalid. */
export function readJson<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
  const raw = readStore(key);
  if (!raw) return fallback;
  try {
    const result = schema.safeParse(JSON.parse(raw));
    return result.success ? result.data : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  writeStore(key, JSON.stringify(value));
}
