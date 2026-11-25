import {
  COUNTRIES,
  SANCTION_LABEL,
  deliversJson,
  isCountryCode,
  type Customer,
  type CustomerDirectory,
  type InvoicingArrangement,
  type SanctionStatus,
} from '@/entities/customer';
import type { CustomConfirm, CustomForm, FormContext, FormMode, KitOverlay, KitRecord } from '@/shared/lib/master-kit/masterKit';
import type { CustomerActions } from '../api/customerMutations';

/** Customer Master record actions: create / edit / copy a customer code and delete it (applied directly). */

const NEW_GROUP = '__new';
const CODE_PREFIX: Readonly<Record<string, string>> = { SG: 'SG-1', MY: 'MY-2', IN: 'IN-3', CN: 'CN-4', TH: 'TH-5' };
const isSanction = (v: string): v is SanctionStatus => v === 'ok' || v === 'sanc' || v === 'black';
const isArrangement = (v: string): v is InvoicingArrangement => v === 'Default' || v === 'Split';

export interface CustomerKitContext {
  dir: CustomerDirectory;
  current: Customer | null;
  actions: CustomerActions;
  setOverlay: (o: KitOverlay) => void;
  toast: (m: string) => void;
  /** Called after a customer was created (select it, open its group). */
  onCreated: (c: Customer, groupName: string) => void;
  /** Called after the current customer was deleted, with the customer to select next. */
  onDeleted: (next: Customer | undefined) => void;
}

/** Next free customer code for a country ("SG-100232"). */
export function suggestCode(dir: CustomerDirectory, ctry: string): string {
  if (!ctry) return '';
  const p = ctry + '-';
  const nums = dir.customers
    .filter((x) => x.code.startsWith(p))
    .map((x) => Number(x.code.slice(3)))
    .filter((n) => !Number.isNaN(n));
  const base = nums.length ? Math.max(...nums) + 1 : Number((CODE_PREFIX[ctry] ?? 'XX-1').slice(3) + '00001');
  return p + String(base).padStart(6, '0');
}

/** Values the form opens with. */
export function customerFormValues(dir: CustomerDirectory, c: Customer | null, mode: FormMode): Record<string, string> {
  if (!c || mode === 'new')
    return {
      ctry: '',
      code: '',
      name: '',
      g: '',
      gname: '',
      legal: '',
      tax: '',
      terms: '',
      arr: 'Default',
      json: 'PDF, JSON',
      email: '',
      addr: '',
      st: 'ok',
    };
  const g = dir.groups[c.g];
  const base = {
    g: c.g,
    gname: '',
    legal: g?.legal ?? '',
    tax: g?.tax ?? '',
    terms: g?.terms ?? '',
    arr: g?.arr ?? 'Default',
    json: deliversJson(dir, c) ? 'PDF, JSON' : 'PDF',
    st: c.st,
  };
  if (mode === 'copy') return { ...base, ctry: '', code: '', name: c.name.replace(/ \([A-Z]{2}\)$/, ''), email: '', addr: '' };
  return { ...base, ctry: c.ctry, code: c.code, name: c.name, email: c.email, addr: c.addr };
}

/** Validation errors by field key. */
export function validateCustomer(dir: CustomerDirectory, V: Readonly<Record<string, string>>, mode: FormMode): Record<string, string> {
  const e: Record<string, string> = {};
  const val = (key: string) => String(V[key] ?? '').trim();
  const req = (key: string, msg = 'Required') => {
    if (!val(key)) e[key] = msg;
  };
  if (mode !== 'edit') {
    req('ctry', 'Select a country');
    req('code');
    const code = val('code').toUpperCase();
    if (code && !/^[A-Z]{2}-\d{6}$/.test(code)) e.code = 'Use the format CC-000000, e.g. SG-100232';
    else if (code && V.ctry && code.slice(0, 2) !== V.ctry) e.code = 'Code must start with the country code ' + V.ctry;
    else if (code && dir.customers.some((x) => x.code.toUpperCase() === code)) e.code = 'Customer code ' + code + ' already exists';
    req('g', 'Select a parent customer group');
    if (V.g === NEW_GROUP) {
      req('gname');
      const gn = val('gname').toLowerCase();
      if (gn && Object.values(dir.groups).some((g) => g.name.toLowerCase() === gn))
        e.gname = 'A parent group with this name already exists — select it instead';
    }
  }
  req('name');
  req('legal');
  req('tax');
  const tax = val('tax').toLowerCase();
  if (tax && (mode !== 'edit' ? V.g === NEW_GROUP : true)) {
    const other = Object.entries(dir.groups).find(([id, g]) => id !== V.g && g.tax.toLowerCase() === tax);
    if (other) e.tax = 'Tax ID belongs to parent group ' + other[1].name + ' — select that group';
  }
  req('terms', 'Select credit terms');
  req('arr');
  req('json');
  req('email');
  if (V.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val('email'))) e.email = 'Enter a valid email address';
  req('addr');
  if (V.addr && val('addr').length < 10) e.addr = 'Enter the full address';
  return e;
}

/** The customer create / edit / copy form. */
export function customerForm(ctx: CustomerKitContext, form: FormContext): CustomForm {
  const { dir, current: cc, actions, setOverlay, toast } = ctx;
  const k = form.overlay;
  const V = k.vals;
  const mode = k.mode;
  const errs = validateCustomer(dir, V, mode);
  const F = (key: string, label: string, o?: Parameters<FormContext['field']>[3]) => form.field(key, label, errs, o);
  const isNewG = V.g === NEW_GROUP;
  const exG = V.g && !isNewG ? dir.groups[V.g] : undefined;
  const members = V.g ? dir.customers.filter((x) => x.g === V.g).length : 0;
  const gro = mode !== 'edit' && !!exG; // group-level fields come from the selected group
  const gHint =
    mode === 'edit'
      ? 'Applies to all ' + members + ' customer code' + (members === 1 ? '' : 's') + ' in ' + (exG ? exG.name : 'this group')
      : gro && exG
        ? 'From parent customer group ' + exG.name
        : '';
  const groups = Object.entries(dir.groups)
    .map(([v, g]) => ({ v, t: g.name }))
    .concat([{ v: NEW_GROUP, t: '+ Create new parent group' }]);
  const countries = Object.entries(COUNTRIES).map(([v, name]) => ({ v, t: name + ' (' + v + ')' }));
  const countryName = (c: string) => (isCountryCode(c) ? COUNTRIES[c] : c);
  const terms = Object.values(dir.groups)
    .map((g) => g.terms)
    .filter((x, i, a) => x && a.indexOf(x) === i);
  const sanctions = (Object.keys(SANCTION_LABEL) as SanctionStatus[]).map((v) => ({ v, t: SANCTION_LABEL[v] }));

  const identity =
    mode === 'edit'
      ? [
          F('code', 'Customer code', { ro: true }),
          F('ctry', 'Country', { ro: true, show: countryName(V.ctry ?? '') }),
          F('name', 'Customer name', { req: true, wide: true }),
          F('g', 'Parent customer group', { ro: true, show: exG ? exG.name : '—', wide: true }),
        ]
      : [
          F('ctry', 'Country', {
            req: true,
            opts: countries,
            ph: 'Select country',
            on: (e) => {
              const c = e.target.value;
              form.setV('ctry', c, k.auto || !V.code ? { code: suggestCode(dir, c) } : {}, k.auto || !V.code);
            },
          }),
          F('code', 'Customer code', {
            req: true,
            ph: 'e.g. SG-100232',
            on: (e) => form.setV('code', e.target.value.toUpperCase(), {}, false),
            hint: k.auto && V.code ? 'Next free code for ' + countryName(V.ctry ?? '') + ' — you can change it' : 'Format CC-000000',
          }),
          F('name', 'Customer name', { req: true, wide: true, ph: 'e.g. Straits Harbour Logistics (VN)' }),
          F('g', 'Parent customer group', {
            req: true,
            wide: true,
            opts: groups,
            ph: 'Select parent group',
            hint: 'Customer codes of one legal entity share a parent group',
            on: (e) => {
              const g = e.target.value;
              const G0 = dir.groups[g];
              form.setV(
                'g',
                g,
                G0
                  ? {
                      legal: G0.legal,
                      tax: G0.tax,
                      terms: G0.terms,
                      arr: G0.arr,
                      json: (G0.json ?? g !== 'gC') ? 'PDF, JSON' : 'PDF',
                      gname: '',
                    }
                  : { legal: '', tax: '', terms: '', arr: 'Default', json: 'PDF, JSON' },
              );
            },
          }),
          ...(isNewG ? [F('gname', 'Parent group name', { req: true, wide: true })] : []),
        ];
  identity.push(
    F('legal', 'Legal entity name', { req: true, wide: true, ro: gro, hint: gro ? gHint : '' }),
    F('tax', 'Registration / Tax ID', { req: true, ro: gro, hint: gro ? gHint : '' }),
    F('ref', 'LMS CMD reference', { ro: true, show: mode === 'edit' && cc ? cc.ref : 'Assigned when the customer is created' }),
  );

  const submit = () => {
    if (Object.keys(errs).length) return setOverlay({ ...k, tried: true });
    const t = (f: string) => String(V[f] ?? '').trim();
    const st = V.st ?? 'ok';
    const arr = V.arr ?? 'Default';
    if (!isSanction(st) || !isArrangement(arr)) return setOverlay({ ...k, tried: true });
    const groupFields = { legal: t('legal'), tax: t('tax'), terms: V.terms ?? '', arr, json: V.json === 'PDF, JSON' };
    if (mode === 'edit' && cc) {
      actions
        .update({ id: cc.id, customer: { name: t('name'), email: t('email'), addr: t('addr'), st }, groupFields })
        .then(() => {
          setOverlay(null);
          toast('Customer ' + cc.code + ' · ' + t('name') + ' updated.');
        })
        .catch((e: unknown) => toast(e instanceof Error ? e.message : 'The customer could not be saved.'));
      return;
    }
    const groupName = isNewG ? t('gname') : (dir.groups[V.g ?? '']?.name ?? '');
    actions
      .create({
        code: t('code').toUpperCase(),
        name: t('name'),
        ctry: V.ctry ?? '',
        st,
        addr: t('addr'),
        email: t('email'),
        group: isNewG ? { newName: groupName } : { id: V.g ?? '' },
        groupFields,
      })
      .then((created) => {
        setOverlay(null);
        ctx.onCreated(created, groupName);
        toast('Customer ' + created.code + ' · ' + created.name + ' created.');
      })
      .catch((e: unknown) => toast(e instanceof Error ? e.message : 'The customer could not be created.'));
  };

  return {
    secs: [
      ['Identity', identity],
      [
        'Contact',
        [
          F('email', 'Email', { req: true, wide: true, type: 'email', ph: 'name@company.com' }),
          F('addr', 'Address details', { req: true, wide: true, area: true }),
        ],
      ],
      [
        'Terms & compliance',
        [
          F('terms', 'Credit terms', { req: true, opts: terms, ro: gro, hint: gro || mode === 'edit' ? gHint : '' }),
          F('st', 'Sanction / Blacklist', { req: true, opts: sanctions }),
        ],
      ],
      [
        'Billing configuration & distribution',
        [
          F('arr', 'Invoicing arrangement', { req: true, opts: ['Default', 'Split'], ro: gro, hint: gro || mode === 'edit' ? gHint : '' }),
          F('json', 'Document / data delivery', { req: true, opts: ['PDF, JSON', 'PDF'], ro: gro }),
          F('dto', 'Delivery to', { ro: true, show: V.email || 'Same as email', wide: true }),
        ],
      ],
    ],
    errs,
    title: mode === 'edit' && cc ? 'Edit customer · ' + cc.code : mode === 'copy' ? 'Copy as new customer code' : 'Create new Customer',
    sub:
      mode === 'edit' && cc
        ? cc.name
        : mode === 'copy' && cc
          ? 'From ' + cc.code + ' · ' + cc.name
          : 'Add a customer code to Customer Master',
    cta: mode === 'edit' ? 'Save changes' : 'Create customer',
    foot: '* Required',
    note: '',
    submit,
  };
}

/** Delete confirmation for the current customer code. */
export function customerConfirm(ctx: CustomerKitContext, cur: KitRecord): CustomConfirm {
  const n = ctx.dir.contracts[cur.code]?.length ?? 0;
  return {
    text: 'The customer code is removed from Customer Master.' + (n ? ' It has ' + n + ' contract' + (n === 1 ? '' : 's') + '.' : ''),
    cta: 'Delete customer',
    ok: () => {
      ctx.actions
        .remove(cur.id)
        .then(() => {
          ctx.setOverlay(null);
          ctx.onDeleted(ctx.dir.customers.find((c) => c.id !== cur.id));
          ctx.toast('Customer ' + cur.code + ' · ' + cur.title + ' deleted.');
        })
        .catch((e: unknown) => ctx.toast(e instanceof Error ? e.message : 'The customer could not be deleted.'));
    },
  };
}

/** Kit record of a customer code (customers have no history popup). */
export const customerKitRecord = (c: Customer): KitRecord => ({
  id: c.id,
  code: c.code,
  title: c.name,
  st: SANCTION_LABEL[c.st],
  hist: null,
  secs: [],
});

/** Fixed metadata of the Customer Master kit. */
export const CUSTOMER_KIT_META = {
  key: 'CustomerMaster',
  noun: 'customer',
  newLabel: 'Create new Customer',
  copyLabel: 'Copy as new customer code',
  danger: 'delete',
  readonly: false,
  opts: {},
} as const;
