import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { createI18n } from '@/core/config/i18n';
import { makeStore } from '@/core/store/store';
import { fetchInvoiceWorkspace, type InvoiceChanges, type InvoiceWorkspace } from '@/entities/invoice';
import { InvoiceListModel, type InvoiceListVals } from '@/features/invoice-management';
import { createQueryClient } from '@/shared/api';
import { InvoiceListScreen } from '@/views/invoice-list/ui/InvoiceListView';

/** An Invoice List model on the sample data; commits update its data like the optimistic mutation does. */
async function setup(link: Partial<{ q: string; rv: string; open: string; tab: string }> = {}) {
  let ws: InvoiceWorkspace = await fetchInvoiceWorkspace();
  const model = new InvoiceListModel({ q: '', rv: '', open: '', tab: '', ...link }, ws.ready);
  const toasts: string[] = [];
  model.attach({ toast: (m) => toasts.push(m), fadeToast: () => undefined });
  model.setActions({
    commit: async (changes: InvoiceChanges) => {
      ws = { ...ws, changes };
      model.setData(ws);
    },
    submitCreditNote: async () => undefined,
  });
  model.setData(ws);
  return { model, toasts, vals: (): InvoiceListVals => model.vals() };
}

const render = (v: InvoiceListVals) =>
  renderToStaticMarkup(
    <Provider store={makeStore()}>
      <QueryClientProvider client={createQueryClient()}>
        <I18nextProvider i18n={createI18n()}>
          <InvoiceListScreen v={v} />
        </I18nextProvider>
      </QueryClientProvider>
    </Provider>,
  );

describe('Invoice List', () => {
  it('renders the first page of invoices', async () => {
    const { vals } = await setup();
    const v = vals();
    expect(v.invs).toHaveLength(25);
    expect(v.countText).toBe('500 of 500 invoices');
    const html = render(v);
    for (const i of v.invs.slice(0, 5)) expect(html).toContain(i.no);
  });

  it('renders the Ready to invoice tab and a B/L review', async () => {
    const { model, vals } = await setup({ rv: 'r1' });
    expect(model.state.view).toBe('review');
    expect(render(vals())).toContain('BL-SG-24011');
  });

  it('searches every word, plain words at the start of a word', async () => {
    const { model, vals } = await setup();
    model.setState({ q: 'SINOF2602401' });
    expect(vals().invs.map((i) => i.no)).toEqual(['SINOF2602401']);
  });

  it('generates invoices from ready B/Ls and records them as GIRS changes', async () => {
    const { model, vals, toasts } = await setup({ tab: 'ready' });
    const before = vals().readyN;
    model.setState({ rsel: { r1: true } });
    vals().genSel();
    expect(model.state.dlg?.kind).toBe('confirm');
    vals().doGenerate();
    await Promise.resolve();
    expect(vals().readyN).toBe(before - 1);
    expect(toasts.join(' ')).toMatch(/generated/);
  });
});

describe('Invoice List dialogs', () => {
  it('rejects a credit note without a reason and records a valid one', async () => {
    const { model, vals, toasts } = await setup();
    const inv = vals().invs.find((i) => ['Sent', 'Paid', 'Accepted', 'Generated'].includes(i.status));
    expect(inv).toBeDefined();
    if (!inv) return;
    model.dlg('cn', inv, { full: true, reason: '' });
    vals().dlgOk();
    expect(model.state.f.reasonErr).toBe(true);
    model.setF({ reason: 'Billing error' });
    vals().dlgOk();
    await Promise.resolve();
    expect(model.state.dlg).toBeNull();
    expect(model.store.cn.some((c) => c.orig === inv.no)).toBe(true);
    expect(toasts.join(' ')).toMatch(/submitted for approval/);
  });
});
