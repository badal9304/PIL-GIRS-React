import { redirect } from 'next/navigation';
import { MASTER_SCREENS, type MasterScreen } from '@/shared/constants/screens';

export const dynamicParams = false;

export function generateStaticParams(): { master: MasterScreen }[] {
  return MASTER_SCREENS.map((master) => ({ master }));
}

/** A master screen opens in layout C. */
export default async function MasterPage({ params }: { params: Promise<{ master: MasterScreen }> }) {
  const { master } = await params;
  redirect(`/system-master/${master}/layout-c`);
}
