import type { CommonKey } from '../types/i18nKeys';

/**
 * The GIRS screen catalogue: menu groups, screens and their routes. `ready` screens are built; the rest show the
 * "Design under process" page. `legacy` lists the HTML prototype file names, so links written by ported screen
 * logic and the search index ("customer-master-d.html?q=x") resolve to app routes (see lib/routing).
 */
export interface Screen {
  id: string;
  /** English label; also the translation key (common namespace). */
  label: CommonKey;
  path: string;
  legacy: string[];
  ready?: boolean;
}

export type NavIcon = 'operations' | 'invoicing' | 'receivables' | 'control' | 'system-master' | 'industry-master';

export interface NavGroup {
  id: string;
  label: CommonKey;
  icon: NavIcon;
  screens: Screen[];
}

export const NAV: readonly NavGroup[] = [
  {
    id: 'g0',
    label: 'Operations',
    icon: 'operations',
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
    icon: 'invoicing',
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
    icon: 'receivables',
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
    icon: 'control',
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
    icon: 'system-master',
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
    icon: 'industry-master',
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

export const SCREENS: readonly Screen[] = [HOME, ...NAV.flatMap((g) => g.screens)];
/** Where unknown links go (as in the prototype). */
export const DEFAULT_PATH = '/invoicing/invoice-list';

/** Layouts of the System Master screens. */
export const MASTER_LAYOUTS = ['layout-c', 'layout-d'] as const;
export type MasterLayout = (typeof MASTER_LAYOUTS)[number];

/** System Master screens built with layouts C and D. */
export const MASTER_SCREENS = ['customer-master', 'contract-master', 'charge-master'] as const;
export type MasterScreen = (typeof MASTER_SCREENS)[number];
