import { describe, expect, it } from 'vitest';
import { createCustomer, customerDirectoryQuery, deleteCustomer, type CustomerDirectory } from '@/entities/customer';
import { CustomerMasterCModel, suggestCode, validateCustomer } from '@/features/customer-master';

const load = async (): Promise<CustomerDirectory> => {
  const q = customerDirectoryQuery();
  if (!q.queryFn) throw new Error('no query function');
  return (q.queryFn as () => Promise<CustomerDirectory>)();
};

describe('Customer Master rules', () => {
  it('suggests the next free code for a country', async () => {
    const dir = await load();
    expect(suggestCode(dir, 'SG')).toBe('SG-101067');
    expect(suggestCode(dir, '')).toBe('');
  });

  it('validates a new customer code', async () => {
    const dir = await load();
    const ok = {
      ctry: 'SG',
      code: 'SG-101067',
      name: 'Test (SG)',
      g: 'gA',
      legal: 'Straits Harbour Logistics Pte. Ltd.',
      tax: '201812345K',
      terms: 'Net 30 days',
      arr: 'Split',
      json: 'PDF, JSON',
      email: 'ap@test.example',
      addr: '1 Harbour Front Walk, Singapore',
      st: 'ok',
    };
    expect(validateCustomer(dir, ok, 'new')).toEqual({});
    expect(validateCustomer(dir, { ...ok, code: 'SG-100231' }, 'new').code).toMatch(/already exists/);
    expect(validateCustomer(dir, { ...ok, code: 'MY-100999' }, 'new').code).toMatch(/must start with the country code SG/);
    expect(validateCustomer(dir, { ...ok, email: 'nope' }, 'new').email).toBe('Enter a valid email address');
    expect(validateCustomer(dir, { ...ok, g: '__new', gname: 'Meridian Agro Exports' }, 'new').gname).toMatch(/already exists/);
  });

  it('creates and deletes customer codes through the API (kept in this browser)', async () => {
    localStorage.clear();
    const created = await createCustomer({
      code: 'SG-101067',
      name: 'Test (SG)',
      ctry: 'SG',
      st: 'ok',
      addr: '1 Harbour Front Walk, Singapore',
      email: 'ap@test.example',
      group: { newName: 'Test Group' },
      groupFields: { legal: 'Test Pte. Ltd.', tax: 'T123', terms: 'Net 30 days', arr: 'Default', json: true },
    });
    let dir = await load();
    expect(dir.customers.some((c) => c.code === 'SG-101067')).toBe(true);
    expect(Object.values(dir.groups).some((g) => g.name === 'Test Group')).toBe(true);
    await expect(
      createCustomer({
        ...{ code: 'SG-101067', name: 'x', ctry: 'SG', st: 'ok', addr: '1 Harbour Front Walk', email: 'a@b.co' },
        group: { id: 'gA' },
        groupFields: { legal: 'x', tax: 'x', terms: 'x', arr: 'Default' },
      }),
    ).rejects.toThrow(/already exists/);
    await deleteCustomer(created.id);
    dir = await load();
    expect(dir.customers.some((c) => c.code === 'SG-101067')).toBe(false);
  });

  it('layout C opens the selected code in its group', async () => {
    const dir = await load();
    const m = new CustomerMasterCModel();
    m.attach({ toast: () => undefined, fadeToast: () => undefined });
    m.setActions({ create: async () => dir.customers[0]!, update: async () => dir.customers[0]!, remove: async () => undefined });
    m.setData(dir);
    const v = m.vals();
    expect(v.c.code).toBe('MY-200417');
    expect(v.tree.find((g) => g.gid === 'gA')?.isOpen).toBe(true);
    m.setState({ q: 'orchid' });
    expect(m.vals().tree.map((g) => g.gid)).toEqual(['gE']);
  });
});
