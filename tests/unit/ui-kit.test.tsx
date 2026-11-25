import { describe, expect, it } from 'vitest';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { createI18n } from '@/core/config/i18n';
import { Banner, Button, Pager, SegmentedControl, StatusTag, TextField } from '@/shared/ui';

const i18n = createI18n();
const html = (el: ReactElement) => renderToStaticMarkup(<I18nextProvider i18n={i18n}>{el}</I18nextProvider>);

describe('UI kit components emit the approved classes', () => {
  it('button variants', () => {
    expect(
      html(
        <Button variant="primary" size="sm">
          Go
        </Button>,
      ),
    ).toContain('class="btn btn-primary btn-sm"');
  });
  it('status tag tone and direction dot', () => {
    expect(
      html(
        <StatusTag tone="warn" dir="E">
          Export
        </StatusTag>,
      ),
    ).toContain('class="chip t-warn dot-e"');
  });
  it('blocking banner is an alert and cannot be dismissed', () => {
    const out = html(
      <Banner tone="block" onDismiss={() => undefined}>
        Stop
      </Banner>,
    );
    expect(out).toContain('role="alert"');
    expect(out).not.toContain('Dismiss');
  });
  it('field error is linked to the input', () => {
    const out = html(<TextField label="Unit Price" error="Enter a unit price." />);
    expect(out).toContain('class="input bad"');
    expect(out).toMatch(/aria-describedby="([^"]+)".*id="\1"/);
  });
  it('segmented control is a radio group', () => {
    const out = html(
      <SegmentedControl
        label="Dir"
        value="E"
        onChange={() => undefined}
        items={[
          { value: 'A', label: 'All' },
          { value: 'E', label: 'Export' },
        ]}
      />,
    );
    expect(out).toContain('role="radiogroup"');
    expect(out.match(/aria-checked="true"/g)).toHaveLength(1);
  });
  it('pager range and disabled ends', () => {
    const out = html(<Pager page={1} pageSize={25} total={243} noun="voyages" onPage={() => undefined} />);
    expect(out).toContain('Showing 1–25 of 243 voyages');
    expect(out).toMatch(/aria-label="First page" disabled/);
  });
});
