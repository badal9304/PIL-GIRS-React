import { describe, expect, it } from 'vitest';
import { fetchContractDirectory } from '@/entities/contract';
import { CONTRACT_KIT_META, contractDetailRecord, contractKitRecord } from '@/features/contract-master';
import detailFixture from '../fixtures/prototype/contract-detail.json';
import kitFixture from '../fixtures/prototype/contract-kit.json';

/** Derived records must match what the HTML prototype showed. */
describe('Contract Master records', async () => {
  const dir = await fetchContractDirectory();

  it('overview records equal the prototype', () => {
    const got = dir.contracts.map((c) => {
      const r = contractDetailRecord(dir, c);
      return { ...r, tables: r.tables.map((t) => [t.title, t.headers, t.rows, t.mono, t.link, t.linkKey]) };
    });
    const want = detailFixture.recs.map(({ comb: _comb, ...r }) => ({
      ...r,
      tables: r.tables.map((t) => [t[0], t[1], t[2], t[3], t[4] === 'ChargeMasterD.dc.html' ? 'charge-master-d.html' : t[4], t[5]]),
    }));
    expect(got).toEqual(want);
  });

  it('kit records (form sections, version history) equal the prototype', () => {
    const got = dir.contracts.map((c) => contractKitRecord(dir, c));
    const want = kitFixture.recs.map(({ nContracts: _n, ...r }) => r);
    expect(got).toEqual(want);
    expect(CONTRACT_KIT_META.opts).toEqual(kitFixture.opts);
  });
});
