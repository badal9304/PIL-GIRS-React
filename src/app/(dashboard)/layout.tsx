import type { ReactNode } from 'react';
import { AppLayout } from '@/views/app-layout';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
