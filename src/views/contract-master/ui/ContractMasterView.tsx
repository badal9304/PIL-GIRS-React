'use client';

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/compositions/app-header';
import { ExportMenu } from '@/compositions/export-menu';
import { MasterDetailScreen } from '@/compositions/master-record';
import { useContractMasterC, useContractMasterD } from '@/features/contract-master';
import type { MasterLayout } from '@/shared/constants/screens';
import { ScreenLoadState } from '@/shared/ui';
import { ContractMasterLayoutCView } from './ContractMasterLayoutCView';

function LayoutC(): ReactNode {
  const { t } = useTranslation('masters');
  const { vals, status } = useContractMasterC();
  if (!vals) return <ScreenLoadState topBar={<AppHeader />} title={t('Contract Master')} status={status} />;
  return <ContractMasterLayoutCView v={vals} />;
}

function LayoutD(): ReactNode {
  const { t } = useTranslation('masters');
  const { vals, status } = useContractMasterD();
  if (!vals) return <ScreenLoadState topBar={<AppHeader />} title={t('Contract Master')} status={status} />;
  return (
    <MasterDetailScreen
      v={vals}
      topBar={<AppHeader />}
      exportMenu={<ExportMenu />}
      title={t('Contract Master')}
      subtitle={t('Customer-specific rates, tax set-up and configurable admin fee per contract')}
      layoutCLabel={t('C · Tabs')}
      createLabel={t('New contract')}
      searchPlaceholder={t('Search contract no., customer or trade lane')}
      layoutCHref="contract-master-c.html"
      layoutDHref="contract-master-d.html"
      dangerIcon="delete"
    />
  );
}

/** System Master › Contract Master, in layout C (tabs) or D (overview). */
export function ContractMasterView({ layout }: { layout: MasterLayout }): ReactNode {
  return layout === 'layout-d' ? <LayoutD /> : <LayoutC />;
}
