import type { ReactNode } from 'react';

/** Screens of GIRS. `ready` screens are built; the rest show the "Design under process" page. */
export interface Screen {
  id: string;
  label: string;
  path: string;
  /** File name of the screen in the HTML prototype (used to resolve links coming from ported logic and search). */
  legacy: string[];
  ready?: boolean;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: ReactNode;
  screens: Screen[];
}

const ic = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

export const NAV: NavGroup[] = [
  {
    id: 'g0',
    label: 'Operations',
    icon: (
      <svg className="size-5.5" {...ic}>
        <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
      </svg>
    ),
    screens: [
      { id: 'cockpit', label: 'Operations Cockpit', path: '/operations/cockpit', legacy: ['operations-cockpit.html'] },
      { id: 'charge-processing', label: 'Charge Processing', path: '/operations/charge-processing', legacy: ['charge-processing.html'] },
      { id: 'dd-engine', label: 'D&D Engine', path: '/operations/dd-engine', legacy: ['dd-engine.html'] },
      {
        id: 'integration-monitor',
        label: 'Integration Monitor',
        path: '/operations/integration-monitor',
        legacy: ['integration-monitor.html'],
      },
      { id: 'document-intake', label: 'Document Intake', path: '/operations/document-intake', legacy: ['document-intake.html'] },
    ],
  },
  {
    id: 'g1',
    label: 'Invoicing',
    icon: (
      <svg className="size-5.5" {...ic}>
        <path d="M5 3h9l5 5v13H5z" />
        <path d="M14 3v5h5M8.5 12.5h7M8.5 16.5h7" />
      </svg>
    ),
    screens: [
      {
        id: 'invoice-list',
        label: 'Invoice List',
        path: '/invoicing/invoice-list',
        legacy: [
          'invoice-list-v2.html',
          'invoice-list.html',
          'invoice-list-b.html',
          'invoice-list-c.html',
          'invoice-list-d.html',
          'invoices-hub.html',
        ],
        ready: true,
      },
      { id: 'split-billing', label: 'Split B/L & Billed-To', path: '/invoicing/split-billing', legacy: ['split-billing.html'] },
      {
        id: 'manual-invoice',
        label: 'Manual & MISC Invoice',
        path: '/invoicing/manual-invoice',
        legacy: ['manual-invoice.html', 'invoice-generate.html'],
      },
      { id: 'invoice-previewer', label: 'Invoice Previewer', path: '/invoicing/invoice-previewer', legacy: ['invoice-previewer.html'] },
      { id: 'credit-notes', label: 'Credit Notes', path: '/invoicing/credit-notes', legacy: ['credit-notes.html'] },
      { id: 'credit-note-list', label: 'Credit Note List', path: '/invoicing/credit-note-list', legacy: ['credit-note-list.html'] },
      { id: 'dar-console', label: 'DAR Console', path: '/invoicing/dar-console', legacy: ['dar-console.html'] },
      {
        id: 'einvoice-exceptions',
        label: 'E-invoice Exceptions',
        path: '/invoicing/einvoice-exceptions',
        legacy: ['einvoice-exceptions.html'],
      },
    ],
  },
  {
    id: 'g2',
    label: 'Receivables',
    icon: (
      <svg className="size-5.5" {...ic}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M6.5 9v6M17.5 9v6" />
      </svg>
    ),
    screens: [
      { id: 'receipting', label: 'Receipting', path: '/receivables/receipting', legacy: ['receipting.html'] },
      { id: 'cashapp-workbench', label: 'CashApp Workbench', path: '/receivables/cashapp-workbench', legacy: ['cashapp-workbench.html'] },
      { id: 'tolerance-coreor', label: 'Tolerance & COREOR', path: '/receivables/tolerance-coreor', legacy: ['tolerance-coreor.html'] },
      { id: 'soa-aging', label: 'SOA & Aging', path: '/receivables/soa-aging', legacy: ['soa-aging.html'] },
      { id: 'credit-management', label: 'Credit Management', path: '/receivables/credit-management', legacy: ['credit-management.html'] },
    ],
  },
  {
    id: 'g3',
    label: 'Control',
    icon: (
      <svg className="size-5.5" {...ic}>
        <path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z" />
        <path d="M8.5 12l2.5 2.5 4.5-4.5" />
      </svg>
    ),
    screens: [
      { id: 'approvals-inbox', label: 'Approvals Inbox', path: '/control/approvals-inbox', legacy: ['approvals-inbox.html'] },
      { id: 'enquiry', label: 'Enquiry & Monitoring', path: '/control/enquiry', legacy: ['enquiry.html'] },
      { id: 'reconciliation', label: 'Reconciliation', path: '/control/reconciliation', legacy: ['reconciliation.html'] },
      { id: 'month-end', label: 'Month-End Close', path: '/control/month-end', legacy: ['month-end.html'] },
      { id: 'reports', label: 'Reports & Analytics', path: '/control/reports', legacy: ['reports.html'] },
    ],
  },
  {
    id: 'g4',
    label: 'System Master',
    icon: (
      <svg className="size-5.5" {...ic}>
        <path d="M3 6h10M17 6h4M3 12h4M11 12h10M3 18h12M19 18h2" />
        <circle cx="15" cy="6" r="2" />
        <circle cx="9" cy="12" r="2" />
        <circle cx="17" cy="18" r="2" />
      </svg>
    ),
    screens: [
      {
        id: 'customer-master',
        label: 'Customer Master',
        path: '/system-master/customer-master',
        legacy: ['customer-master.html', 'customer-master-b.html', 'customer-master-c.html', 'customer-master-d.html'],
        ready: true,
      },
      {
        id: 'contract-master',
        label: 'Contract Master',
        path: '/system-master/contract-master',
        legacy: ['contract-master.html', 'contract-master-b.html', 'contract-master-c.html', 'contract-master-d.html'],
        ready: true,
      },
      {
        id: 'charge-master',
        label: 'Charge Master',
        path: '/system-master/charge-master',
        legacy: ['charge-master.html', 'charge-master-b.html', 'charge-master-c.html', 'charge-master-d.html'],
        ready: true,
      },
    ],
  },
  {
    id: 'g5',
    label: 'Industry Master',
    icon: (
      <svg className="size-5.5" {...ic}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
      </svg>
    ),
    screens: [
      {
        id: 'country-master',
        label: 'Country Master',
        path: '/industry-master/country-master',
        legacy: ['country-master.html', 'country-master-b.html', 'country-master-c.html', 'country-master-d.html'],
      },
      {
        id: 'currency-master',
        label: 'Currency Master',
        path: '/industry-master/currency-master',
        legacy: ['currency-master.html', 'currency-master-b.html', 'currency-master-c.html', 'currency-master-d.html'],
      },
      {
        id: 'city-master',
        label: 'City Master',
        path: '/industry-master/city-master',
        legacy: ['city-master.html', 'city-master-b.html', 'city-master-c.html', 'city-master-d.html'],
      },
      {
        id: 'port-master',
        label: 'Port Master',
        path: '/industry-master/port-master',
        legacy: ['port-master.html', 'port-master-b.html', 'port-master-c.html', 'port-master-d.html'],
      },
      {
        id: 'tax-setup',
        label: 'Tax Set-up',
        path: '/industry-master/tax-setup',
        legacy: ['tax-setup.html', 'tax-setup-b.html', 'tax-setup-c.html', 'tax-setup-d.html'],
      },
      {
        id: 'exchange-rate-master',
        label: 'Exchange Rate Master',
        path: '/industry-master/exchange-rate-master',
        legacy: ['exchange-rate-master.html', 'exchange-rate-master-b.html', 'exchange-rate-master-c.html', 'exchange-rate-master-d.html'],
      },
    ],
  },
];

/** Home: the landing screen, shown above the menu groups. */
export const HOME: Screen = { id: 'home', label: 'Home', path: '/home', legacy: ['index.html'], ready: true };

export const SCREENS: Screen[] = [HOME, ...NAV.flatMap((g) => g.screens)];
export const DEFAULT_PATH = '/invoicing/invoice-list';

/** Resolves a link written for the prototype ("customer-master-d.html?q=x") to an app route. */
export function routeOf(href: string): string {
  if (!href || /^(https?:|mailto:|tel:|#)/.test(href)) return href;
  if (href.startsWith('/')) return href;
  const [file, query = ''] = href.split('?');
  const name = file.split('/').pop() || '';
  const screen = SCREENS.find((s) => s.legacy.includes(name));
  if (!screen) return DEFAULT_PATH;
  let path = screen.path;
  if (/^(customer|contract|charge)-master/.test(name)) path += /-d\.html$/.test(name) ? '/layout-d' : '/layout-c';
  return path + (query ? '?' + query : '');
}

/** Prototype file name of a route (the reverse of routeOf; used for "back" links). */
export function legacyOf(pathname: string): string {
  const screen = SCREENS.find((s) => pathname.startsWith(s.path));
  if (!screen) return 'invoice-list-v2.html';
  if (screen.id.endsWith('-master') && screen.ready) return screen.id + (pathname.endsWith('/layout-d') ? '-d' : '-c') + '.html';
  return screen.legacy[0];
}

export function groupOf(pathname: string): NavGroup | undefined {
  return NAV.find((g) => g.screens.some((s) => pathname.startsWith(s.path)));
}
