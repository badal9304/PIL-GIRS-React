'use client';

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/compositions/app-header';
import { useSettings } from '@/features/settings';
import { useVoyageInvoicing } from '@/features/voyage-invoicing';
import { ScreenLoadState } from '@/shared/ui';
import { HomeScreen } from './HomeView';

/**
 * Home: landing workspace after login. Voyage Invoicing for the working location (exports loading and imports
 * discharging there) and D&D Billing. Location and entity come from the app header.
 */
export function HomeView(): ReactNode {
  const { t } = useTranslation('home');
  const { hub, entity } = useSettings();
  const { vals, status } = useVoyageInvoicing(hub, entity);
  if (!vals) return <ScreenLoadState topBar={<AppHeader />} title={t('Home')} status={status} />;
  return <HomeScreen v={vals} />;
}
