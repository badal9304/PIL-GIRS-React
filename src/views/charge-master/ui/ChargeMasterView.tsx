'use client';

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/compositions/app-header';
import { ExportMenu } from '@/compositions/export-menu';
import { MasterDetailScreen } from '@/compositions/master-record';
import { useChargeMasterC, useChargeMasterD } from '@/features/charge-master';
import type { MasterLayout } from '@/shared/constants/screens';
import { ScreenLoadState } from '@/shared/ui';
import { ChargeMasterLayoutCView } from './ChargeMasterLayoutCView';

function LayoutC(): ReactNode {
  const { t } = useTranslation('masters');
  const { vals, status } = useChargeMasterC();
  if (!vals) return <ScreenLoadState topBar={<AppHeader />} title={t('Charge Master')} status={status} />;
  return <ChargeMasterLayoutCView v={vals} />;
}

function LayoutD(): ReactNode {
  const { t } = useTranslation('masters');
  const { vals, status } = useChargeMasterD();
  if (!vals) return <ScreenLoadState topBar={<AppHeader />} title={t('Charge Master')} status={status} />;
  return (
    <MasterDetailScreen
      v={vals}
      topBar={<AppHeader />}
      exportMenu={<ExportMenu />}
      title={t('Charge Master')}
      subtitle={t('Charge codes, categories, applicability, tax mapping and LMS charge-code alignment')}
      layoutCLabel={t('C · Tabs')}
      createLabel={t('New charge')}
      searchPlaceholder={t('Search charge code, name or LMS code')}
      layoutCHref="charge-master-c.html"
      layoutDHref="charge-master-d.html"
      dangerIcon="power"
    />
  );
}

/** System Master › Charge Master, in layout C (tabs) or D (overview). */
export function ChargeMasterView({ layout }: { layout: MasterLayout }): ReactNode {
  return layout === 'layout-d' ? <LayoutD /> : <LayoutC />;
}
