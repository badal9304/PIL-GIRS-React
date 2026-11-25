# GIRS front end — working agreement

Act as a principal frontend engineer. Write production-ready, strictly typed, maintainable code for this Next.js 16
(App Router) + React 19 + TypeScript + Tailwind CSS + react-i18next app. README.md describes the stack and structure.

## Non-negotiables

- **TypeScript**: `strict`, zero `any`, no `@ts-nocheck` / `@ts-ignore`; explicit return types on exported functions.
  `tests/unit/architecture.test.ts` fails on violations.
- **Zod** at every boundary: API responses (`shared/api` `serve()` / `getJson()`), data read from browser storage.
- **Server state** in TanStack Query: keys `entities/<x>/api/<x>.keys.ts`, read queries `<x>.queries.ts`, API
  functions `<x>.api.ts`; mutations in `features/<x>/api/` (optimistic updates through `onMutate` when the screen must
  react at once). Never copy server data into Redux.
- **Client UI state** in Redux Toolkit only when it is app-wide (preferences, toast). Slices live in the owning
  feature / entity `model/` and are combined in `core/store/rootReducer.ts`. Screen interaction state lives in the
  screen's `ScreenModel` (framework-free, unit-testable); the view is a pure function of its values.
- **i18n**: every user-facing string goes through `t('English text')` (typed keys, namespace per area: common, home,
  invoices, masters, search, uikit) or, for text composed at runtime, `usePhrase().tx`. After adding text run
  `npm run i18n:build`; add translations of new text to `tools/i18n/extra-<lang>.json`.
- **Accessibility**: keyboard reachable, labelled controls, dialogs trap focus and close on Escape, live regions for
  status. Loading and error states use `ScreenLoadState`.

## Layers (Feature-Sliced)

`app → core → views → compositions → features → entities → shared` — import only downward; slices of a layer do not
import each other (compose them one layer up); import other slices through `index.ts`; `app/` only routes.
Every slice exposes its public API in `index.ts`. ESLint enforces this.

## Deployment constraints

Static export to GitHub Pages (`/<repo>/` for main, `/<repo>/preview/` for preview): no `middleware.ts`, no
`app/api` route handlers, no runtime server rendering. Data needing a backend goes through the entity API layer,
which is sample data today. Pages with search params wrap `useSearchParams` in `Suspense`.

## Before you finish

`npm run typecheck && npm run lint && npm test && npm run build` must pass.
