import { describe, expect, it } from 'vitest';
import { highlight, loadIndex, search } from '../features/search/searchEngine';

describe('global search', () => {
  it('finds an invoice by number and ranks the exact hit first', async () => {
    const idx = await loadIndex();
    const r = search(idx, 'SINOF2602401');
    expect(r.groups[0].head).toBe('Invoices');
    expect(r.groups[0].items[0].main).toBe('SINOF2602401');
  });
  it('matches plain words at the start of a word only', async () => {
    const idx = await loadIndex();
    const paid = search(idx, 'paid').groups.find((g) => g.head === 'Invoices');
    expect(paid?.items.every((i) => i.tag !== 'Unpaid')).toBe(true);
  });
  it('finds screens by alias', async () => {
    const idx = await loadIndex();
    const screens = search(idx, 'gst').groups.find((g) => g.head === 'Screens');
    expect(screens?.items.map((i) => i.main)).toContain('Tax Set-up');
  });
  it('highlights matched tokens', () => {
    expect(highlight('Straits Harbour', ['har'])).toEqual([
      { text: 'Straits ', hit: false },
      { text: 'Har', hit: true },
      { text: 'bour', hit: false },
    ]);
  });
});
