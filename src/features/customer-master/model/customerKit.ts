import type { Customer, CustomerDirectory } from '@/entities/customer';
import { renderMasterKit, type KitOverlay } from '@/shared/lib/master-kit/masterKit';
import type { CustomerActions } from '../api/customerMutations';
import {
  CUSTOMER_KIT_META,
  customerConfirm,
  customerForm,
  customerFormValues,
  customerKitRecord,
  type CustomerKitContext,
} from './customerForm';

/** Record actions of a Customer Master screen for the selected customer. */
export function renderCustomerKit(args: {
  dir: CustomerDirectory;
  current: Customer | null;
  overlay: KitOverlay;
  actions: CustomerActions;
  setOverlay: (o: KitOverlay) => void;
  toast: (m: string) => void;
  onCreated: CustomerKitContext['onCreated'];
  onDeleted: CustomerKitContext['onDeleted'];
}) {
  const ctx: CustomerKitContext = {
    dir: args.dir,
    current: args.current,
    actions: args.actions,
    setOverlay: args.setOverlay,
    toast: args.toast,
    onCreated: args.onCreated,
    onDeleted: args.onDeleted,
  };
  return renderMasterKit({
    overlay: args.overlay,
    setOverlay: args.setOverlay,
    toast: args.toast,
    meta: CUSTOMER_KIT_META,
    current: args.current ? customerKitRecord(args.current) : null,
    allCodes: args.dir.customers.map((x) => x.code.toUpperCase()),
    requestChange: () => Promise.reject(new Error('Customer changes apply directly.')),
    customValues: (mode) => customerFormValues(args.dir, args.current, mode),
    customForm: (form) => customerForm(ctx, form),
    customConfirm: (cur) => customerConfirm(ctx, cur),
  });
}
