'use client';

import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '@/compositions/app-header';
import {
  Banner,
  Button,
  Card,
  Checkbox,
  Combobox,
  Count,
  Dialog,
  EmptyState,
  FilterChips,
  IconButton,
  Pager,
  SearchField,
  SegmentedControl,
  SelectField,
  SidePanel,
  StatusTag,
  Tabs,
  TextField,
  TextLink,
  ScreenHeader,
  ScreenTemplate,
  type ComboOption,
} from '@/shared/ui';

/* Developer reference for the React UI kit. Mirrors ui-kit.html in the prototype; not in the menu. Sample values only. */

const CUSTOMERS: ComboOption[] = [
  { value: 'SG-604553', code: 'SG-604553', label: 'Orchid Lane Polymers (SG)' },
  { value: 'IN-338120', code: 'IN-338120', label: 'Orchid Lane Polymers (IN)' },
  { value: 'SG-118204', code: 'SG-118204', label: 'Meridian Agro Exports' },
];

function Section({ title, note, children }: { title: string; note: string; children: ReactNode }): ReactNode {
  return (
    <Card title={title}>
      <div className="px-4 pb-4 flex flex-col gap-3">
        <p className="m-0 text-[13px] text-muted">{note}</p>
        <div className="flex flex-wrap items-start gap-3">{children}</div>
      </div>
    </Card>
  );
}

export function UiKitView(): ReactNode {
  const { t } = useTranslation('uikit');
  const [chip, setChip] = useState('all');
  const [dir, setDir] = useState('all');
  const [tab, setTab] = useState('voy');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(25);
  const [overlay, setOverlay] = useState<'' | 'dlg' | 'panel'>('');
  const close = () => setOverlay('');

  const overlays =
    overlay === 'dlg' ? (
      <Dialog
        title={t('Generate 1,089 invoices?')}
        onClose={close}
        footer={
          <>
            <Button onClick={close}>{t('Cancel')}</Button>
            <Button variant="primary" onClick={close}>
              {t('Generate')}
            </Button>
          </>
        }
      >
        <p className="m-0 text-[13px]">{t('Voyages 0LK5SSE, 1KP8RRI · USD 1.73M')}</p>
      </Dialog>
    ) : overlay === 'panel' ? (
      <SidePanel
        label={t('Voyage 0LK5SSE')}
        onClose={close}
        header={
          <>
            <StatusTag tone="info" mono>
              {t('0LK5SSE')}
            </StatusTag>
            <b>{t('CMA CGM LEKKI')}</b>
            <StatusTag dir="E">{t('Export')}</StatusTag>
          </>
        }
        footer={
          <>
            <Button onClick={close}>{t('Close')}</Button>
            <Button variant="primary">{t('Generate 935')}</Button>
          </>
        }
      >
        <span className="text-muted">{t('Summary, reasons, B/L list…')}</span>
      </SidePanel>
    ) : null;

  return (
    <ScreenTemplate
      topBar={<AppHeader />}
      header={<ScreenHeader title={t('UI kit')} subtitle={t('Approved components · React')} />}
      overlays={overlays}
    >
      <Section title={t('Button')} note={t('One primary action per area. Small (32px) in tables, toolbars and panels.')}>
        <Button variant="primary">{t('Generate invoice')}</Button>
        <Button>{t('Cancel')}</Button>
        <Button disabled>{t('Disabled')}</Button>
        <Button size="sm" variant="primary">
          {t('Generate 935')}
        </Button>
        <Button size="sm">{t('Send follow-up')}</Button>
        <IconButton label={t('Close')}>×</IconButton>
        <TextLink>{t('Text link')}</TextLink>
      </Section>
      <Section title={t('Fields')} note={t('Label above, 36px high. Read-only is grey; errors show a reason under the field.')}>
        <TextField label={t('Bank Name')} defaultValue="DBS Bank Ltd" fieldClassName="w-60" />
        <TextField label={t('Charge Code')} defaultValue="OFT" readOnly fieldClassName="w-60" />
        <TextField label={t('Unit Price')} error={t('Enter a unit price.')} fieldClassName="w-60" />
        <SelectField label={t('Currency')} options={['USD', 'SGD', 'INR']} fieldClassName="w-40" />
        <Combobox
          label={t('To')}
          options={CUSTOMERS}
          value={to}
          onInput={setTo}
          onPick={(o) => setTo(o.label)}
          placeholder={t('Customer name or code')}
          className="w-80"
        />
      </Section>
      <Section title={t('Search, checkbox')} note={t('Search filters the list it sits above.')}>
        <SearchField label={t('Search voyages')} placeholder={t('Voyage no., vessel, service or port')} className="w-80" />
        <Checkbox label={t('Group by date')} defaultChecked />
        <Checkbox label={t('Disabled')} disabled />
      </Section>
      <Section title={t('Status tag, count')} note={t('Five tones; the word carries the meaning.')}>
        <StatusTag>{t('Draft')}</StatusTag>
        <StatusTag tone="info">{t('With customer')}</StatusTag>
        <StatusTag tone="ok">{t('Invoiced')}</StatusTag>
        <StatusTag tone="warn">{t('ROE not received')}</StatusTag>
        <StatusTag tone="bad">{t('Rejected')}</StatusTag>
        <StatusTag dir="E">{t('Export')}</StatusTag>
        <StatusTag dir="I">{t('Import')}</StatusTag>
        <span>
          {t('Columns')} <Count on>3</Count>
        </span>
      </Section>
      <Section title={t('Inline notification')} note={t('Says what happened and what to do. Blocking messages cannot be dismissed.')}>
        <div className="flex flex-col gap-2 w-full">
          <Banner>{t('LMS data received 2 min ago.')}</Banner>
          <Banner tone="ok" action={<TextLink>{t('View in Invoice List')}</TextLink>}>
            {t('935 invoices generated for voyage 0LK5SSE.')}
          </Banner>
          <Banner tone="warn" onDismiss={() => undefined}>
            <b>{t('Daily ROE feed not received.')}</b> {t('Invoices that need a rate of exchange are blocked.')}
          </Banner>
          <Banner tone="block">
            <b>{t('1 error to resolve before generating the invoice.')}</b> {t('Customer tax ID not received from LMS.')}
          </Banner>
        </div>
      </Section>
      <Section title={t('Filters, segments, tabs')} note={t('Chips filter a list; segments switch views; tabs separate areas.')}>
        <FilterChips
          label={t('Status')}
          value={chip}
          onChange={setChip}
          items={[
            { value: 'all', label: t('All voyages'), count: 13 },
            { value: 'ready', label: t('Ready to generate'), count: 13 },
            { value: 'blk', label: t('With blockers'), count: 10 },
          ]}
        />
        <SegmentedControl
          label={t('Direction')}
          value={dir}
          onChange={setDir}
          items={[
            { value: 'all', label: t('All') },
            { value: 'E', label: t('Export') },
            { value: 'I', label: t('Import') },
          ]}
        />
        <div className="w-full">
          <Tabs
            label={t('Home')}
            idBase="kit"
            value={tab}
            onChange={setTab}
            items={[
              { value: 'voy', label: t('Voyage Invoicing'), count: '1,300' },
              { value: 'dd', label: t('D&D Billing'), count: 56 },
            ]}
          />
        </div>
      </Section>
      <Section title={t('Pager, empty state')} note={t('Pager under every list that can pass 25 rows.')}>
        <div className="w-full">
          <Pager
            page={page}
            pageSize={size}
            total={243}
            noun={t('voyages')}
            onPage={setPage}
            onPageSize={(n) => (setSize(n), setPage(1))}
          />
          <EmptyState
            title={t('No voyages match these filters.')}
            hint={t('Change the date or clear the filters.')}
            action={{ label: t('Clear filters'), onClick: () => undefined }}
          />
        </div>
      </Section>
      <Section title={t('Modal, side panel')} note={t('Esc closes; focus stays inside while open.')}>
        <Button onClick={() => setOverlay('dlg')}>{t('Open modal')}</Button>
        <Button onClick={() => setOverlay('panel')}>{t('Open side panel')}</Button>
      </Section>
    </ScreenTemplate>
  );
}
