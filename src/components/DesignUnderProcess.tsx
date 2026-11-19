import { Page, PageHeader } from '../app/shell/Page';
import { useI18n } from '../i18n/context';
import type { Screen } from '../app/navigation';

/** Placeholder for screens whose design is not built yet. */
export function DesignUnderProcess({ screen }: { screen: Screen }) {
  const { tx } = useI18n();
  return (
    <Page header={<PageHeader title={tx(screen.label)} />}>
      <section className="card dup" aria-live="polite">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 21h18" />
          <path d="M5 21V10l7-5 7 5v11" />
          <path d="M9 21v-6h6v6" />
        </svg>
        <h2>{tx('Design under process')}</h2>
      </section>
    </Page>
  );
}
