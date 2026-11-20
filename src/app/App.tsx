import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider, type RouteObject } from 'react-router-dom';
import { AppShell } from './shell/AppShell';
import { DEFAULT_PATH, SCREENS } from './navigation';
import { DesignUnderProcess } from '../components/DesignUnderProcess';
import { SettingsProvider } from './providers/SettingsProvider';
import { ToastProvider } from './providers/ToastProvider';
import { I18nProvider } from '../i18n/I18nProvider';

const HomePage = lazy(() => import('../features/home/HomePage'));
const UiKitPage = lazy(() => import('../features/ui-kit/UiKitPage'));
const InvoiceListPage = lazy(() => import('../features/invoices/InvoiceListPage'));
const CustomerMasterLayoutC = lazy(() => import('../features/masters/customer/CustomerMasterLayoutC'));
const CustomerMasterLayoutD = lazy(() => import('../features/masters/customer/CustomerMasterLayoutD'));
const ContractMasterLayoutC = lazy(() => import('../features/masters/contract/ContractMasterLayoutC'));
const ContractMasterLayoutD = lazy(() => import('../features/masters/contract/ContractMasterLayoutD'));
const ChargeMasterLayoutC = lazy(() => import('../features/masters/charge/ChargeMasterLayoutC'));
const ChargeMasterLayoutD = lazy(() => import('../features/masters/charge/ChargeMasterLayoutD'));

const masterRoutes = (path: string, LayoutC: React.ComponentType, LayoutD: React.ComponentType): RouteObject[] => [
  { path, element: <Navigate to={path + '/layout-c'} replace /> },
  { path: path + '/layout-c', element: <LayoutC /> },
  { path: path + '/layout-d', element: <LayoutD /> },
];

const built: RouteObject[] = [
  { path: '/home', element: <HomePage /> },
  { path: '/ui-kit', element: <UiKitPage /> },
  { path: '/invoicing/invoice-list', element: <InvoiceListPage /> },
  ...masterRoutes('/system-master/customer-master', CustomerMasterLayoutC, CustomerMasterLayoutD),
  ...masterRoutes('/system-master/contract-master', ContractMasterLayoutC, ContractMasterLayoutD),
  ...masterRoutes('/system-master/charge-master', ChargeMasterLayoutC, ChargeMasterLayoutD),
];

const placeholders: RouteObject[] = SCREENS.filter((s) => !s.ready).map((s) => ({
  path: s.path,
  element: <DesignUnderProcess screen={s} />,
}));

const router = createBrowserRouter(
  [
    {
      element: (
        <Suspense fallback={null}>
          <AppShell />
        </Suspense>
      ),
      children: [
        { index: true, element: <Navigate to="/home" replace /> },
        ...built,
        ...placeholders,
        { path: '*', element: <Navigate to={DEFAULT_PATH} replace /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
);

export function App() {
  return (
    <SettingsProvider>
      <I18nProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </I18nProvider>
    </SettingsProvider>
  );
}
