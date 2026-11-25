import { serve } from '@/shared/api';
import { readJson, writeJson } from '@/shared/lib/storage';
import {
  customerChangesSchema,
  customerDirectorySchema,
  type Customer,
  type CustomerChanges,
  type CustomerDirectory,
  type CustomerUpdate,
  type NewCustomerInput,
} from '../model/customer';
import { CUSTOMER_SEED } from './customer.seed';

/**
 * Customer Master API. Reads the LMS directory and applies the changes made in GIRS. Until the CMD API is
 * connected, the LMS side is sample data and GIRS changes are kept in this browser (same key as the prototype).
 */
const CHANGES_KEY = 'girs.cust.v1';
const EMPTY: CustomerChanges = { add: [], del: [], groups: {}, gedit: {}, edit: {} };

const loadChanges = (): CustomerChanges => readJson(CHANGES_KEY, customerChangesSchema, EMPTY);
const saveChanges = (x: CustomerChanges): void => writeJson(CHANGES_KEY, x);

function applyChanges(seed: CustomerDirectory, x: CustomerChanges): CustomerDirectory {
  const groups: CustomerDirectory['groups'] = { ...seed.groups, ...x.groups };
  for (const [gid, patch] of Object.entries(x.gedit)) {
    const g = groups[gid];
    if (g) groups[gid] = { ...g, ...patch };
  }
  const customers = [...seed.customers, ...x.add].map((c) => ({ ...c, ...x.edit[c.id] })).filter((c) => !x.del.includes(c.id));
  return { groups, customers, contracts: seed.contracts };
}

export function fetchCustomerDirectory(): Promise<CustomerDirectory> {
  return serve('cmd/customers', customerDirectorySchema, () => applyChanges(CUSTOMER_SEED, loadChanges()));
}

const nextRef = (dir: CustomerDirectory): string => {
  const n = dir.customers.map((x) => Number(x.ref.replace(/\D/g, ''))).filter((x) => !Number.isNaN(x));
  return 'CMD-' + String((n.length ? Math.max(...n) : 70000) + 137).padStart(7, '0');
};

/** Creates a customer code (and its parent group when new). Resolves with the created customer. */
export async function createCustomer(input: NewCustomerInput): Promise<Customer> {
  const dir = await fetchCustomerDirectory();
  if (dir.customers.some((c) => c.code === input.code)) throw new Error(`Customer code ${input.code} already exists.`);
  const x = loadChanges();
  let gid: string;
  if ('newName' in input.group) {
    gid = 'ug' + Date.now().toString(36);
    x.groups[gid] = { name: input.group.newName, ...input.groupFields };
  } else gid = input.group.id;
  const customer: Customer = {
    id: 'uc' + Date.now().toString(36),
    code: input.code,
    name: input.name,
    g: gid,
    ctry: input.ctry,
    st: input.st,
    ref: nextRef(dir),
    addr: input.addr,
    email: input.email,
  };
  x.add.push(customer);
  saveChanges(x);
  return customer;
}

/** Updates a customer code and the group-level fields shared by its parent group. */
export async function updateCustomer(update: CustomerUpdate): Promise<Customer> {
  const dir = await fetchCustomerDirectory();
  const c = dir.customers.find((x) => x.id === update.id);
  if (!c) throw new Error('This customer no longer exists.');
  const x = loadChanges();
  const ai = x.add.findIndex((a) => a.id === c.id);
  if (ai >= 0) x.add[ai] = { ...x.add[ai]!, ...update.customer };
  else x.edit[c.id] = { ...x.edit[c.id], ...update.customer };
  const ownGroup = x.groups[c.g];
  if (ownGroup) x.groups[c.g] = { ...ownGroup, ...update.groupFields };
  else x.gedit[c.g] = { ...x.gedit[c.g], ...update.groupFields };
  saveChanges(x);
  return { ...c, ...update.customer };
}

/** Removes a customer code. */
export async function deleteCustomer(id: string): Promise<void> {
  const x = loadChanges();
  const ai = x.add.findIndex((a) => a.id === id);
  if (ai >= 0) x.add.splice(ai, 1);
  else if (!x.del.includes(id)) x.del.push(id);
  saveChanges(x);
}
