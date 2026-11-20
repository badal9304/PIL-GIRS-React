import { describe, expect, it } from 'vitest';
import { routeOf } from '../app/navigation';

// homeData loads the shared invoice-document helper, which registers itself on window
(globalThis as unknown as { window: unknown }).window ??= globalThis;
const { hmDay, hmXlsx, HM_TODAY } = await import('../features/home/homeData');

describe('Home data', () => {
  it('generates the same voyages for a port and date every time', () => {
    const a = hmDay('SGSIN', HM_TODAY).map((v: { no: string }) => v.no);
    const b = hmDay('SGSIN', HM_TODAY).map((v: { no: string }) => v.no);
    expect(a).toEqual(b);
    expect(a).toContain('0LK5SSE');
  });
  it('only lists voyages that load or discharge at the port', () => {
    for (const v of hmDay('INNSA', '2026-11-18') as { pol: string; pod: string }[]) expect([v.pol, v.pod]).toContain('INNSA');
  });
  it('writes a zip-based .xlsx', async () => {
    const blob = hmXlsx('Test', ['A', 'B'], [['x', 1]]);
    const head = new Uint8Array(await blob.arrayBuffer()).slice(0, 2);
    expect(String.fromCharCode(...head)).toBe('PK');
  });
});

describe('Home route', () => {
  it('is where the prototype start page (index.html) goes', () => {
    expect(routeOf('index.html')).toBe('/home');
    expect(routeOf('operations-cockpit.html')).toBe('/operations/cockpit');
  });
});
