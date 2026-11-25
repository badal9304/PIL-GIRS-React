import { describe, expect, it } from 'vitest';
import { fetchChargeDirectory } from '@/entities/charge';
import { fetchContractDirectory } from '@/entities/contract';
import { CHARGE_KIT_META, chargeDetailRecord, chargeKitRecord } from '@/features/charge-master';
import detailFixture from '../fixtures/prototype/charge-detail.json';
import kitFixture from '../fixtures/prototype/charge-kit.json';

/** Derived records must match what the HTML prototype showed. */
describe('Charge Master records', async () => {
  const data = { charges: await fetchChargeDirectory(), contracts: await fetchContractDirectory() };

  it('overview records (incl. contracts using each charge) equal the prototype', () => {
    const got = data.charges.charges.map((h) => {
      const r = chargeDetailRecord(data, h);
      return { ...r, tables: r.tables.map((t) => [t.title, t.headers, t.rows, t.mono, t.link, t.linkKey]) };
    });
    const want = detailFixture.recs.map(({ comb: _comb, ...r }) => r);
    expect(got).toEqual(want);
  });

  it('kit records (form sections, audit trail) equal the prototype', () => {
    const got = data.charges.charges.map((h) => chargeKitRecord(data.charges, h));
    expect(got).toEqual(kitFixture.recs.map(({ nContracts: _n, ...r }) => r));
    expect(CHARGE_KIT_META.opts).toEqual(kitFixture.opts);
  });
});
