import { useMemo, type ChangeEvent } from 'react';
import { useToast } from '../app/providers/contexts';
import { useViewModel, type ViewModel } from '../lib/viewModel';

const EXPORT_LABEL: Record<string, string> = { xlsx: 'Excel', csv: 'CSV', pdf: 'PDF' };

/**
 * Mounts a screen view-model and returns the values its view renders, plus the shell actions
 * the screen header uses (Export).
 */
export function useScreen<M extends ViewModel>(create: () => M) {
  const toast = useToast();
  const services = useMemo(() => ({ toast: toast.show, fadeToast: toast.fade }), [toast.show, toast.fade]);
  const vm = useViewModel(create, services);
  const shell = useMemo(
    () => ({
      exp: (e: ChangeEvent<HTMLSelectElement>) => {
        const v = e.target.value;
        if (!v) return;
        e.target.value = '';
        toast.show('Export to ' + EXPORT_LABEL[v] + ' prepared — current filters applied.');
      },
    }),
    [toast],
  );
  return { ...vm.renderVals(), shell };
}
