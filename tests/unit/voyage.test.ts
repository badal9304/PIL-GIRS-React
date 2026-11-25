import { describe, expect, it } from 'vitest';
import { TODAY, fetchVoyageMonth, generateDay } from '@/entities/voyage';
import { requiredMonths } from '@/features/voyage-invoicing';
import { routeOf } from '@/shared/lib/routing';
import { buildXlsx } from '@/shared/lib/xlsx';

describe('Voyage data', () => {
  it('generates the same voyages for a port and date every time', () => {
    const a = generateDay('SGSIN', TODAY).map((v) => v.no);
    expect(generateDay('SGSIN', TODAY).map((v) => v.no)).toEqual(a);
    expect(a).toContain('0LK5SSE');
  });
  it('only lists voyages that load or discharge at the port', () => {
    for (const v of generateDay('INNSA', '2026-11-18')) expect([v.pol, v.pod]).toContain('INNSA');
  });
  it('serves a whole month through the validated API', async () => {
    const month = await fetchVoyageMonth('SGSIN', '2026-11');
    expect(Object.keys(month)).toHaveLength(30);
    expect(month[TODAY]?.map((v) => v.no)).toEqual(generateDay('SGSIN', TODAY).map((v) => v.no));
  });
  it('asks for the months the view shows', () => {
    expect(requiredMonths({ win: '2026-11-14', view: 'range', from: TODAY, to: TODAY })).toEqual(['2026-11']);
    expect(requiredMonths({ win: '2026-11-25', view: 'overdue', from: TODAY, to: TODAY })).toEqual(['2026-11', '2026-12']);
    expect(requiredMonths({ win: '2026-10-01', view: 'range', from: '2026-12-30', to: '2027-01-02' })).toEqual([
      '2026-10',
      '2026-11',
      '2026-12',
      '2027-01',
    ]);
  });
  it('writes a zip-based .xlsx', async () => {
    const blob = buildXlsx('Test', ['A', 'B'], [['x', 1]]);
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
