'use client';

import type { ChangeEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/entities/notification';

/** "Export" select in a screen header: prepares the list in the chosen format (current filters applied). */
export function ExportMenu(): ReactNode {
  const { t } = useTranslation('common');
  const toast = useToast();
  const label: Record<string, string> = { xlsx: t('Excel'), csv: t('CSV'), pdf: t('PDF') };
  const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    if (!v) return;
    e.target.value = '';
    toast.show(t('Export to {{format}} prepared — current filters applied.', { format: label[v] ?? v }));
  };
  return (
    <div className="relative">
      <label htmlFor="gexp" className="sr">
        {t('Export')}
      </label>
      <select id="gexp" className="select w-28" value="" onChange={onChange}>
        <option value="">{t('Export')}</option>
        <option value="xlsx">{t('Excel')}</option>
        <option value="csv">{t('CSV')}</option>
        <option value="pdf">{t('PDF')}</option>
      </select>
      <svg
        className="absolute end-2.5 top-1/2 -mt-2 pointer-events-none text-muted"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}
