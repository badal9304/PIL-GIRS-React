import { describe, expect, it } from 'vitest';
import { fetchContractDirectory } from '@/entities/contract';
import { CONTRACT_KIT_META, contractKitRecord } from '@/features/contract-master';
import { renderMasterKit, type ChangeRequest, type KitOverlay } from '@/shared/lib/master-kit/masterKit';

/** The record-actions kit sends master-data changes to the approvals inbox. */
describe('Master kit', async () => {
  const dir = await fetchContractDirectory();
  const rec = contractKitRecord(dir, dir.contracts[0]!);

  function kit() {
    let overlay: KitOverlay = null;
    const sent: ChangeRequest[] = [];
    const toasts: string[] = [];
    const render = () =>
      renderMasterKit({
        overlay,
        setOverlay: (o) => (overlay = o),
        toast: (m) => toasts.push(m),
        meta: CONTRACT_KIT_META,
        current: rec,
        allCodes: dir.contracts.map((c) => c.no),
        requestChange: async (r) => {
          sent.push(r);
          return 'REQ-000001';
        },
      });
    return {
      render,
      sent,
      toasts,
      get overlay() {
        return overlay;
      },
    };
  }

  it('asks for a change before submitting an edit', async () => {
    const k = kit();
    k.render().edit();
    k.render().form?.submit();
    expect(k.render().form?.errText).toBe('Nothing has changed yet.');
    expect(k.sent).toHaveLength(0);
  });

  it('submits the changed fields of an edit for approval', async () => {
    const k = kit();
    k.render().edit();
    const terms = k
      .render()
      .form?.secs.flatMap((s) => s.fields)
      .find((f) => f.label === 'Payment terms');
    terms?.on({ target: { value: 'Net 45 days' } } as Parameters<NonNullable<typeof terms>['on']>[0]);
    k.render().form?.submit();
    await Promise.resolve();
    await Promise.resolve();
    expect(k.sent[0]).toMatchObject({
      screen: 'ContractMaster',
      kind: 'edit',
      code: 'CT-26-00012',
      changes: { 'Payment terms': 'Net 45 days' },
    });
    expect(k.toasts[0]).toMatch(/1 change submitted for approval · REQ-000001/);
  });

  it('needs a reason to delete', async () => {
    const k = kit();
    k.render().danger();
    k.render().conf?.ok();
    expect(k.render().conf?.hasErr).toBe(true);
    expect(k.sent).toHaveLength(0);
  });
});
