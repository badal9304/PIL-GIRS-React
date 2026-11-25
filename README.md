# GIRS (PIL) — front end

Next.js 16 (App Router) + React 19 + strict TypeScript front end for GIRS, PIL's invoicing and receivables system. It is
built from the approved HTML prototype ([PIL---GIRS](https://github.com/badal9304/PIL---GIRS)) and keeps its look and
behaviour. Data comes from sample generators behind a typed API layer until the LMS / GIRS services are connected.

**Screens built**

| Menu | Screen | Route |
| --- | --- | --- |
| Home | Voyage Invoicing · D&D Billing | `/home` |
| Invoicing | Invoice List (Ready to invoice · Invoices) | `/invoicing/invoice-list` |
| System Master | Customer Master, layout C / D | `/system-master/customer-master/layout-c`, `/layout-d` |
| System Master | Contract Master, layout C / D | `/system-master/contract-master/layout-c`, `/layout-d` |
| System Master | Charge Master, layout C / D | `/system-master/charge-master/layout-c`, `/layout-d` |
| — | UI kit reference | `/ui-kit` |

Every other menu entry opens a **"Design under process"** page.

## Getting started

Requires Node 20.9 or later.

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Type-check and static export to `dist/` |
| `npm test` | Unit tests (Vitest, jsdom) |
| `npm run lint` | oxlint + ESLint (Next.js rules and the layer rules below) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier |
| `npm run i18n:build` | Regenerate `public/locales` after adding or changing UI text |

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 App Router, static export (`output: 'export'`) for GitHub Pages |
| Language | TypeScript `strict`, no `any`, no `@ts-nocheck` (checked by a test) |
| Server state | TanStack Query v5: query keys and read queries in `entities/*/api`, mutations in `features/*/api` |
| Client UI state | Redux Toolkit: preferences (`features/settings`) and the app toast (`entities/notification`) |
| Screen state | Framework-free screen models (`ScreenModel`) per screen, subscribed with `useSyncExternalStore` |
| Validation | Zod contracts for every API response and for data read from browser storage |
| Styling | Tailwind CSS v4 with the GIRS design tokens (light and dark) and the approved UI kit |
| i18n | i18next + react-i18next, namespaces per area, English text as keys, typed keys |

## Architecture: Feature-Sliced layers

```
src/
  app/            Next.js routing shell only: layouts, pages, error / loading / not-found. Pages render a view.
  core/           App wiring: providers (Redux, TanStack Query, i18next), store, i18n config, global styles.
  views/          One folder per screen: home, invoice-list, customer-, contract-, charge-master, placeholder, ui-kit,
                  app-layout (side menu, content column, toast), error / loading / not-found.
  compositions/   Blocks that combine features: app-header (search, location, entity, profile menu), app-sidebar,
                  master-record (overview layout D and record dialogs shared by the master screens), export-menu.
  features/       User capabilities: voyage-invoicing, invoice-management, customer-, contract-, charge-master,
                  global-search, settings.
  entities/       Domain data and read queries: voyage, invoice (incl. the invoice / receipt document renderer),
                  customer, contract, charge, approval, search-index, user, organization, notification.
  shared/         Domain-agnostic: ui (atoms, molecules, organisms, templates), api (transport, query client),
                  hooks, lib (screen model, master kit, master detail, phrase translator, dates, xlsx …), types.
```

Rules (enforced by ESLint and by `tests/unit/architecture.test.ts`):

- A layer imports only from layers below it: `app → core → views → compositions → features → entities → shared`.
- Slices of one layer do not import each other; they are composed one layer up. Inside a slice, imports are relative.
- Another slice is imported through its `index.ts` only.

### How a screen is built

- **Entity API** (`entities/invoice/api`): `fetchInvoiceWorkspace()` serves the data through `serve()`, which validates it
  with the Zod contract (`entities/invoice/model`). Keys in `invoice.keys.ts`, query options in `invoice.queries.ts`.
- **Feature** (`features/invoice-management`): the screen model (`InvoiceListModel`) holds the screen state and turns
  it plus the query data into view values; mutations (`useInvoiceActions`) save changes with optimistic cache updates.
  `useInvoiceList()` wires query, model and mutations and returns `{ vals, status }`.
- **View** (`views/invoice-list`): shows the loading / error state until the data is there, then renders the screen
  markup from the typed values (`InvoiceListVals`).
- **Route** (`app/(dashboard)/invoicing/invoice-list/page.tsx`): renders the view.

Changes made in GIRS (generated invoices, customer edits, follow-ups, approval requests) are kept in the browser under
the prototype's storage keys until the services exist; swapping a `serve()` for `fetch` keeps the same contracts.

### Translation

- Languages: English, 中文（简体）, العربية (right-to-left), Español; picked in the profile menu and kept per browser.
- UI text is written in English and used as the key: `t('Invoice List')`. Keys are typed (`shared/types/i18next.d.ts`)
  from `public/locales/en/*.json`, which `npm run i18n:build` generates from the code. Translations come from the
  prototype dictionary (`tools/i18n/legacy-*.json`) plus `tools/i18n/extra-*.json` for text added since.
- Text composed at runtime by screen logic ("Showing 1–25 of 243 voyages") goes through the phrase translator
  (`usePhrase().tx`), which matches numbers, one-slot templates and "A · B" / "Label: value" pairs.
- Home's text was never translated in the prototype; it shows in English in every language until translations are added.

### Styling

- `core/styles/tailwind.css`: Tailwind theme and the GIRS colour tokens (`bg-surface`, `text-muted`, `bg-okbg text-ok`
  …) that switch with `data-theme="dark"`. `base.css`: element defaults and shared primitives. `ui.css`: the UI kit.
- Screen styles are scoped with `:where(.pg-…)` so screens never affect each other; `app/globals.css` sets the order.
- The layout is designed at 1920px and scaled to the window, as in the prototype.

## Deployment

Every push to `main` or `preview` runs `.github/workflows/deploy.yml`: lint, test, build, publish to GitHub Pages.
`main` is served at `/<repo>/`, `preview` at `/<repo>/preview/`. Static export means no middleware or API routes.
