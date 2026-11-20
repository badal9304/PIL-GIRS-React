import { useState, type ReactNode } from 'react';
import { Page, PageHeader } from '../../app/shell/Page';
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
  type ComboOption,
} from '../../components/ui';

/* Developer reference for the React UI kit. Mirrors ui-kit.html in the prototype; not in the menu. */

const CUSTOMERS: ComboOption[] = [
  { value: 'SG-604553', code: 'SG-604553', label: 'Orchid Lane Polymers (SG)' },
  { value: 'IN-338120', code: 'IN-338120', label: 'Orchid Lane Polymers (IN)' },
  { value: 'SG-118204', code: 'SG-118204', label: 'Meridian Agro Exports' },
];

function Section({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <Card title={title}>
      <div className="px-4 pb-4 flex flex-col gap-3">
        <p className="m-0 text-[13px] text-muted">{note}</p>
        <div className="flex flex-wrap items-start gap-3">{children}</div>
      </div>
    </Card>
  );
}

export default function UiKitPage() {
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
        title="Generate 1,089 invoices?"
        onClose={close}
        footer={
          <>
            <Button onClick={close}>Cancel</Button>
            <Button variant="primary" onClick={close}>
              Generate
            </Button>
          </>
        }
      >
        <p className="m-0 text-[13px]">Voyages 0LK5SSE, 1KP8RRI · USD 1.73M</p>
      </Dialog>
    ) : overlay === 'panel' ? (
      <SidePanel
        label="Voyage 0LK5SSE"
        onClose={close}
        header={
          <>
            <StatusTag tone="info" mono>
              0LK5SSE
            </StatusTag>
            <b>CMA CGM LEKKI</b>
            <StatusTag dir="E">Export</StatusTag>
          </>
        }
        footer={
          <>
            <Button onClick={close}>Close</Button>
            <Button variant="primary">Generate 935</Button>
          </>
        }
      >
        <span className="text-muted">Summary, reasons, B/L list…</span>
      </SidePanel>
    ) : null;

  return (
    <Page header={<PageHeader title="UI kit" subtitle="Approved components · React" />} overlays={overlays}>
      <Section title="Button" note="One primary action per area. Small (32px) in tables, toolbars and panels.">
        <Button variant="primary">Generate invoice</Button>
        <Button>Cancel</Button>
        <Button disabled>Disabled</Button>
        <Button size="sm" variant="primary">
          Generate 935
        </Button>
        <Button size="sm">Send follow-up</Button>
        <IconButton label="Close">×</IconButton>
        <TextLink>Text link</TextLink>
      </Section>
      <Section title="Fields" note="Label above, 36px high. Read-only is grey; errors show a reason under the field.">
        <TextField label="Bank Name" defaultValue="DBS Bank Ltd" fieldClassName="w-60" />
        <TextField label="Charge Code" defaultValue="OFT" readOnly fieldClassName="w-60" />
        <TextField label="Unit Price" error="Enter a unit price." fieldClassName="w-60" />
        <SelectField label="Currency" options={['USD', 'SGD', 'INR']} fieldClassName="w-40" />
        <Combobox
          label="To"
          options={CUSTOMERS}
          value={to}
          onInput={setTo}
          onPick={(o) => setTo(o.label)}
          placeholder="Customer name or code"
          className="w-80"
        />
      </Section>
      <Section title="Search, checkbox" note="Search filters the list it sits above.">
        <SearchField label="Search voyages" placeholder="Voyage no., vessel, service or port" className="w-80" />
        <Checkbox label="Group by date" defaultChecked />
        <Checkbox label="Disabled" disabled />
      </Section>
      <Section title="Status tag, count" note="Five tones; the word carries the meaning.">
        <StatusTag>Draft</StatusTag>
        <StatusTag tone="info">With customer</StatusTag>
        <StatusTag tone="ok">Invoiced</StatusTag>
        <StatusTag tone="warn">ROE not received</StatusTag>
        <StatusTag tone="bad">Rejected</StatusTag>
        <StatusTag dir="E">Export</StatusTag>
        <StatusTag dir="I">Import</StatusTag>
        <span>
          Columns <Count on>3</Count>
        </span>
      </Section>
      <Section title="Inline notification" note="Says what happened and what to do. Blocking messages cannot be dismissed.">
        <div className="flex flex-col gap-2 w-full">
          <Banner>LMS data received 2 min ago.</Banner>
          <Banner tone="ok" action={<TextLink>View in Invoice List</TextLink>}>
            935 invoices generated for voyage 0LK5SSE.
          </Banner>
          <Banner tone="warn" onDismiss={() => undefined}>
            <b>Daily ROE feed not received.</b> Invoices that need a rate of exchange are blocked.
          </Banner>
          <Banner tone="block">
            <b>1 error to resolve before generating the invoice.</b> Customer tax ID not received from LMS.
          </Banner>
        </div>
      </Section>
      <Section title="Filters, segments, tabs" note="Chips filter a list; segments switch views; tabs separate areas.">
        <FilterChips
          label="Status"
          value={chip}
          onChange={setChip}
          items={[
            { value: 'all', label: 'All voyages', count: 13 },
            { value: 'ready', label: 'Ready to generate', count: 13 },
            { value: 'blk', label: 'With blockers', count: 10 },
          ]}
        />
        <SegmentedControl
          label="Direction"
          value={dir}
          onChange={setDir}
          items={[
            { value: 'all', label: 'All' },
            { value: 'E', label: 'Export' },
            { value: 'I', label: 'Import' },
          ]}
        />
        <div className="w-full">
          <Tabs
            label="Home"
            idBase="kit"
            value={tab}
            onChange={setTab}
            items={[
              { value: 'voy', label: 'Voyage Invoicing', count: '1,300' },
              { value: 'dd', label: 'D&D Billing', count: 56 },
            ]}
          />
        </div>
      </Section>
      <Section title="Pager, empty state" note="Pager under every list that can pass 25 rows.">
        <div className="w-full">
          <Pager page={page} pageSize={size} total={243} noun="voyages" onPage={setPage} onPageSize={(n) => (setSize(n), setPage(1))} />
          <EmptyState
            title="No voyages match these filters."
            hint="Change the date or clear the filters."
            action={{ label: 'Clear filters', onClick: () => undefined }}
          />
        </div>
      </Section>
      <Section title="Modal, side panel" note="Esc closes; focus stays inside while open.">
        <Button onClick={() => setOverlay('dlg')}>Open modal</Button>
        <Button onClick={() => setOverlay('panel')}>Open side panel</Button>
      </Section>
    </Page>
  );
}
