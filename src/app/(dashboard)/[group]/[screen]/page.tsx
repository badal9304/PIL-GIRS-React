import { notFound } from 'next/navigation';
import { SCREENS } from '@/shared/constants/screens';
import { PlaceholderView } from '@/views/placeholder';

/** Screens in the menu whose design is not built yet. */
const pending = SCREENS.filter((s) => !s.ready);

export const dynamicParams = false;

export function generateStaticParams(): { group: string; screen: string }[] {
  return pending.map((s) => {
    const [, group, screen] = s.path.split('/');
    return { group, screen };
  });
}

export default async function PendingScreenPage({ params }: { params: Promise<{ group: string; screen: string }> }) {
  const { group, screen } = await params;
  const match = pending.find((s) => s.path === `/${group}/${screen}`);
  if (!match) notFound();
  return <PlaceholderView screen={match} />;
}
