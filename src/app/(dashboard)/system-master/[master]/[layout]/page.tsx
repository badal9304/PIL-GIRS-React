import type { ComponentType } from 'react';
import { MASTER_LAYOUTS, MASTER_SCREENS, type MasterLayout, type MasterScreen } from '@/shared/constants/screens';
import { ChargeMasterView } from '@/views/charge-master';
import { ContractMasterView } from '@/views/contract-master';
import { CustomerMasterView } from '@/views/customer-master';

const VIEWS: Record<MasterScreen, ComponentType<{ layout: MasterLayout }>> = {
  'customer-master': CustomerMasterView,
  'contract-master': ContractMasterView,
  'charge-master': ChargeMasterView,
};

export const dynamicParams = false;

export function generateStaticParams(): { master: MasterScreen; layout: MasterLayout }[] {
  return MASTER_SCREENS.flatMap((master) => MASTER_LAYOUTS.map((layout) => ({ master, layout })));
}

export default async function MasterLayoutPage({ params }: { params: Promise<{ master: MasterScreen; layout: MasterLayout }> }) {
  const { master, layout } = await params;
  const View = VIEWS[master];
  return <View layout={layout} />;
}
