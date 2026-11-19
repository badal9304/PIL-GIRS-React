# GIRS (PIL) — React front end

React 19 + TypeScript + Tailwind CSS v4 front end for GIRS, PIL's invoicing and receivables system. It is built from the approved HTML prototype ([PIL---GIRS](https://github.com/badal9304/PIL---GIRS)) and matches it pixel for pixel.

**Screens built**

| Menu | Screen | Route |
| --- | --- | --- |
| Invoicing | Invoice List (Ready to invoice · Invoices) | `/invoicing/invoice-list` |
| System Master | Customer Master, layout C / D | `/system-master/customer-master/layout-c`, `/layout-d` |
| System Master | Contract Master, layout C / D | `/system-master/contract-master/layout-c`, `/layout-d` |
| System Master | Charge Master, layout C / D | `/system-master/charge-master/layout-c`, `/layout-d` |

Every other menu entry opens a **"Design under process"** page.

**Common features (all screens):** side navigation (expand / collapse, collapsed rail with flyout menus), global search (Ctrl/⌘ K or `/`), working location and entity pickers, profile menu with login switch, language (English, 中文, العربية with right-to-left layout, Español), light / dark appearance, toasts, and full-text tooltips for truncated text. The layout is designed at 1920 px and scales to the window, like the prototype.

## Getting started

Requires Node 20 or later.

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Type-check and production build in `dist/` (plus `404.html` for GitHub Pages routing) |
| `npm run preview` | Serve the production build locally |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | Lint (oxlint) |
| `npm run format` | Format with Prettier |

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`: lint, test, build, and publish to GitHub Pages. In the repository, set **Settings → Pages → Source** to **GitHub Actions** once. The site is published at `https://<owner>.github.io/<repo>/`.

## Project structure

```
src/
  app/
    App.tsx               routes (lazy-loaded screens) and providers
    navigation.tsx        menu sections, screens, routes; maps prototype links to routes
    providers/            settings (theme, language, side panel, hub, entity, login) and toast
    session/              signed-in user and logins (sample values)
    shell/                AppShell, SideNav, TopBar, UserMenu, Page / PageHeader
  components/             AppLink, DesignUnderProcess
  features/
    invoices/             Invoice List: page, view, view-model, data and rules, styles
    masters/              kit.ts (shared master logic), MasterKitOverlays (shared dialogs)
      customer|contract|charge/   layout C and D: page, view, view-model, data, styles
    search/               global search engine, index and panel
  hooks/                  useScreen, useViewportFit, useTruncationTooltip, usePrefillSearch
  i18n/                   translator, provider, locale dictionaries (zh, ar, es)
  lib/                    view-model base, view helpers, storage, app bridge, legacy document renderer
  styles/                 base tokens + shell (light and dark), app styles
tools/porting/            scripts used to port the prototype (markup → TSX, CSS → Tailwind); kept for reference
```

### How a screen is built

Each built screen has four parts:

- **Page** (`InvoiceListPage.tsx`): the route component. It mounts the view-model with `useScreen` and renders the view.
- **View-model** (`InvoiceListModel.ts`): a plain TypeScript class that holds the screen state (filters, selection, dialogs) and computes the values to render in `renderVals()`. It does not depend on React, so the business rules stay testable and easy to move to an API later.
- **View** (`InvoiceListView.tsx`): the TSX markup. It is a pure function of the view-model values and renders inside `<Page header overlays>`.
- **Styles**: layout and spacing are Tailwind utility classes in the TSX. Stateful component styles (tables, chips, drawers, menus) are Tailwind component classes built with `@apply` in the screen's stylesheet (`InvoiceList.css`), scoped with `:where(.pg-invoices)`. `:where()` adds no specificity, so screens never affect each other and the cascade is unchanged. Shared primitives (`.btn`, `.input`, `.select`, `.chip`, `.card`, `.mi` …) are in `src/styles/base.css`. Values computed at runtime by a view-model (positions, status colours) stay as inline styles.

### Tailwind CSS, design tokens and theming

- `src/styles/tailwind.css` is the Tailwind entry: theme and utilities, plus the GIRS colours registered as Tailwind colours. Tailwind's Preflight reset is not used; `base.css` sets the element defaults the design was built on.
- Colours are CSS custom properties (`--ink`, `--surface`, `--accent`, `--ok`, `--warn`, `--bad` …), defined for light mode on `:root, .theme` and for dark mode on `.theme[data-theme=dark]`. They follow IBM Carbon with PIL colours.
- Each token is a Tailwind colour, so `bg-surface`, `text-muted`, `border-line`, `bg-okbg text-ok` switch with the theme automatically. For dark-only tweaks there is a `dark:` variant (`dark:shadow-[…]`), driven by `data-theme="dark"` on the app root.
- Layer order: `theme, base, components, utilities`. Utilities always win over component classes, so a utility on an element overrides the component's default.
- `cx()` (`src/lib/cx.ts`) joins conditional class names. `.unstyled` resets a native button before it is styled with utilities.

### Translation

English is the source language. `useI18n()` returns `t()` for attributes and `tx()` for visible text. Phrases are looked up in `src/i18n/locales/<lang>.json` (exact phrase, numbers as `#`, `{x}` templates, and `A · B` / `Label: value` pairs). Codes, amounts and names are left as they are. In Arabic the document direction is right-to-left, and Latin data runs keep their reading order.

To add a phrase, add it to `dict` in each locale file. To add a language, add a locale file, register it in `LANGUAGES` and `loadLocale` (`src/i18n/translator.ts`), and add it to the profile menu list.

### Data

All data is sample data generated in the browser, and user changes are kept in `localStorage` (same keys as the prototype). The view-models keep their data access in a few functions (`invoices()`, `readyList()`, the master `KIT_M` records), which are the places to connect real APIs.

## Notes for the next steps

- View-models and data modules were ported from the prototype and start with `// @ts-nocheck`. Add types screen by screen as the screens are reworked. The shell, providers, i18n, search and hooks are fully typed (`strict` mode).
- `src/lib/legacy/girsDocs.js` renders the invoice and receipt documents and their PDFs (with QR code), and `girsCtx.js` hands context between screens. Both are kept as plain JS modules from the prototype.
- Master screens keep only layouts C and D. Layouts A and B were dropped.
- Some rules stay as plain CSS inside `@layer components` because they have no exact utility equivalent (CSS variables, `!important`, vendor prefixes, `content` strings).
