'use client';

import { ErrorView } from '@/views/error';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorView error={error} onRetry={reset} />;
}
