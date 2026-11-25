'use client';

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/compositions/app-header';
import { ExportMenu } from '@/compositions/export-menu';
import { MasterDetailScreen } from '@/compositions/master-record';
import { useCustomerMasterC, useCustomerMasterD } from '@/features/customer-master';
import type { MasterLayout } from '@/shared/constants/screens';
import { ScreenLoadState } from '@/shared/ui';
import { CustomerMasterLayoutCView } from './CustomerMasterLayoutCView';

function LayoutC(): ReactNode {
  const { t } = useTranslation('masters');
  const { vals, status } = useCustomerMasterC();
  if (!vals) return <ScreenLoadState topBar={<AppHeader />} title={t('Customer Master')} status={status} />;
  return <CustomerMasterLayoutCView v={vals} />;
}

function LayoutD(): ReactNode {
  const { t } = useTranslation('masters');
  const { vals, status } = useCustomerMasterD();
  if (!vals) return <ScreenLoadState topBar={<AppHeader />} title={t('Customer Master')} status={status} />;
  return (
    <MasterDetailScreen
      v={vals}
      topBar={<AppHeader />}
      exportMenu={<ExportMenu />}
      title={t('Customer Master')}
      subtitle={t('CMD set-up · all parties to be invoiced come from Customer Master Data in LMS')}
      layoutCLabel={t('C · Groups')}
      createLabel={t('Create new Customer')}
      searchPlaceholder={t('Search customer code, name or tax ID')}
      layoutCHref="customer-master-c.html"
      layoutDHref="customer-master-d.html"
      dangerIcon="delete"
    />
  );
}

/** System Master › Customer Master, in layout C (groups) or D (overview). */
export function CustomerMasterView({ layout }: { layout: MasterLayout }): ReactNode {
  return layout === 'layout-d' ? <LayoutD /> : <LayoutC />;
}
