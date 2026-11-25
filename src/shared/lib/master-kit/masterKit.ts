import type { ChangeEvent } from 'react';
import { downloadBlob } from '../download';
import { escapeHtml } from '../format';

/**
 * Record actions shared by the master-data screens: record history (popup, PDF / Excel / CSV / print), the create /
 * edit / copy form, the delete or (de)activate confirmation, and the "More" menu.
 * By default changes are sent as approval requests (`requestChange`); a screen can supply its own form and
 * confirmation (Customer Master creates, edits and deletes customer codes directly).
 */

export type FormMode = 'new' | 'edit' | 'copy';

export type KitOverlay =
  | null
  | { m: 'menu' }
  | { m: 'hist' }
  | { m: 'confirm'; reason: string; tried: boolean }
  | {
      m: 'form';
      mode: FormMode;
      vals: Readonly<Record<string, string>>;
      /** Code was suggested by the screen (replaced when the country changes). */
      auto: boolean;
      tried: boolean;
      noChange: boolean;
      orig: Readonly<Record<string, string>>;
    };

export type FormOverlay = Extract<KitOverlay, { m: 'form' }>;

export interface KitHistory {
  title: string;
  cols: readonly string[];
  rows: ReadonlyArray<readonly string[]>;
}

/** label / value pairs per section, as shown in the record. */
export type KitSections = ReadonlyArray<readonly [title: string, kv: ReadonlyArray<readonly [label: string, value: string]>]>;

export interface KitRecord {
  id: string;
  code: string;
  title: string;
  st: string;
  hist: KitHistory | null;
  secs: KitSections;
}

export interface KitMeta {
  /** Screen key ("ContractMaster"). */
  key: string;
  noun: string;
  newLabel: string;
  copyLabel: string;
  danger: 'delete' | 'toggle' | '';
  readonly: boolean;
  /** Options of select fields, by field label. */
  opts: Readonly<Record<string, readonly string[]>>;
}

export interface ChangeRequest {
  screen: string;
  kind: 'new' | 'edit' | 'copy' | 'delete' | 'activate' | 'deactivate';
  code: string;
  changes: Readonly<Record<string, string>>;
  reason?: string;
}

export interface KitOption {
  v: string;
  t: string;
}

export interface KitField {
  label: string;
  req: boolean;
  reqA: 'true' | 'false';
  cls: string;
  bad: 'true' | 'false';
  isText: boolean;
  isArea: boolean;
  isSel: boolean;
  isRO: boolean;
  type: string;
  v: string;
  ph: string;
  opts: KitOption[];
  on: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  err: string;
  hasErr: boolean;
  hint: string;
  hasHint: boolean;
}

export interface FieldOptions {
  req?: boolean;
  ro?: boolean;
  /** Value shown when read-only. */
  show?: string;
  wide?: boolean;
  area?: boolean;
  type?: string;
  ph?: string;
  hint?: string;
  opts?: ReadonlyArray<string | KitOption>;
  on?: KitField['on'];
}

/** A form the screen builds itself (fields, validation, submit). */
export interface CustomForm {
  title: string;
  sub: string;
  cta: string;
  foot: string;
  note: string;
  secs: ReadonlyArray<readonly [string, KitField[]]>;
  errs: Readonly<Record<string, string>>;
  submit: () => void;
}

export interface FormContext {
  overlay: FormOverlay;
  /** Sets a value (and optional related values). */
  setV: (key: string, val: string, extra?: Readonly<Record<string, string>>, auto?: boolean) => void;
  field: (key: string, label: string, errs: Readonly<Record<string, string>>, o?: FieldOptions) => KitField;
}

export interface CustomConfirm {
  text: string;
  cta: string;
  /** Called with the reason once it is filled in. */
  ok: (reason: string) => void;
}

export interface KitInput {
  overlay: KitOverlay;
  setOverlay: (o: KitOverlay) => void;
  toast: (message: string) => void;
  meta: KitMeta;
  current: KitRecord | null;
  allCodes: readonly string[];
  /** Sends a change to the approvals inbox; resolves with the request number. */
  requestChange: (req: ChangeRequest) => Promise<string>;
  /** Screen-specific form (replaces the approval-request form). */
  customForm?: (ctx: FormContext) => CustomForm;
  /** Values the form opens with, per mode (custom forms). */
  customValues?: (mode: FormMode) => Readonly<Record<string, string>>;
  customConfirm?: (cur: KitRecord) => CustomConfirm;
}

const SYSTEM_FIELD = /status|^Version$|^Approval|^LMS CMD reference$/i;

/** Sections a user can edit: placeholders, system fields and repeated labels are left out. */
export function editableSections(rec: KitRecord): ReadonlyArray<readonly [string, ReadonlyArray<readonly [string, string]>]> {
  const seen = new Set<string>();
  return rec.secs
    .map(
      ([t, kv]) =>
        [
          t,
          kv.filter(([l, val]) => {
            if (seen.has(l) || /^\[/.test(val) || SYSTEM_FIELD.test(l)) return false;
            seen.add(l);
            return true;
          }),
        ] as const,
    )
    .filter((x) => x[1].length > 0);
}

export function renderMasterKit(input: KitInput) {
  const { overlay: k, setOverlay, toast, meta: M, current: cur } = input;
  const close = () => setOverlay(null);
  const noun = M.noun;
  const Noun = noun.charAt(0).toUpperCase() + noun.slice(1);

  // ---------------------------------------------------------------- history popup + downloads
  const H = cur?.hist ?? null;
  const hTitle = H && cur ? H.title + ' · ' + cur.code : '';
  const hFile = H && cur ? (M.key + '-' + cur.code + '-' + H.title).replace(/[^A-Za-z0-9]+/g, '-').toLowerCase() : '';
  const hDoc = (): string =>
    !H || !cur
      ? ''
      : '<!doctype html><html><head><meta charset="utf-8"><title>' +
        escapeHtml(hTitle) +
        '</title><style>body{font-family:"IBM Plex Sans",Arial,sans-serif;font-size:12px;color:#161A21;margin:28px}h1{font-size:16px;margin:0 0 4px}p{color:#5B6472;margin:0 0 16px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #DCE1E8;padding:6px 8px;text-align:left;vertical-align:top}th{background:#F4F6F9}</style></head><body><h1>' +
        escapeHtml(hTitle) +
        '</h1><p>' +
        escapeHtml(cur.title) +
        ' · exported ' +
        escapeHtml(new Date().toLocaleString()) +
        '</p><table><thead><tr>' +
        H.cols.map((c) => '<th>' + escapeHtml(c) + '</th>').join('') +
        '</tr></thead><tbody>' +
        H.rows.map((r) => '<tr>' + r.map((c) => '<td>' + escapeHtml(c) + '</td>').join('') + '</tr>').join('') +
        '</tbody></table></body></html>';
  const dl = (ext: string, mime: string, data: string, label: string) => {
    if (!H || !cur) return;
    downloadBlob(new Blob([data], { type: mime }), hFile + '.' + ext);
    toast(H.title + ' for ' + cur.code + ' downloaded as ' + label + '.');
  };
  const printDoc = (label: string) => {
    const w = window.open('', '_blank');
    if (!w) {
      toast('Allow pop-ups for this site to ' + label + '.');
      return;
    }
    w.document.write(hDoc());
    w.document.close();
    w.focus();
    window.setTimeout(() => w.print(), 300);
  };
  const hist =
    H && cur
      ? {
          title: hTitle,
          sub: cur.title,
          cols: H.cols,
          rows: H.rows,
          count: H.rows.length + (H.rows.length === 1 ? ' entry' : ' entries') + ' · newest first',
          csv: () =>
            dl(
              'csv',
              'text/csv;charset=utf-8',
              '﻿' + [H.cols, ...H.rows].map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\r\n'),
              'CSV',
            ),
          xls: () => dl('xls', 'application/vnd.ms-excel', hDoc(), 'Excel'),
          pdf: () => printDoc('save as PDF'),
          print: () => printDoc('print'),
        }
      : null;

  // ---------------------------------------------------------------- form
  const field = (key: string, label: string, errs: Readonly<Record<string, string>>, o: FieldOptions = {}): KitField => {
    if (k?.m !== 'form') throw new Error('field() outside a form');
    const V = k.vals;
    const err = k.tried ? (errs[key] ?? '') : '';
    const type = o.ro ? 'ro' : o.opts ? 'sel' : o.area ? 'area' : 'text';
    return {
      label,
      req: !!o.req && !o.ro,
      reqA: o.req ? 'true' : 'false',
      cls: 'kf' + (o.wide ? ' w' : '') + (err ? ' bad' : ''),
      bad: err ? 'true' : 'false',
      isText: type === 'text',
      isArea: type === 'area',
      isSel: type === 'sel',
      isRO: type === 'ro',
      type: o.type ?? 'text',
      v: o.ro ? (o.show ?? (V[key] || '—')) : (V[key] ?? ''),
      ph: o.ph ?? '',
      opts: o.opts ? [{ v: '', t: o.ph || 'Select…' }, ...o.opts.map((x) => (typeof x === 'string' ? { v: x, t: x } : x))] : [],
      on: o.on ?? ((e) => setV(key, e.target.value)),
      err,
      hasErr: !!err,
      hint: o.hint ?? '',
      hasHint: !!o.hint && !err,
    };
  };
  const setV = (key: string, val: string, extra?: Readonly<Record<string, string>>, auto?: boolean) => {
    if (k?.m !== 'form') return;
    setOverlay({ ...k, vals: { ...k.vals, [key]: val, ...extra }, auto: auto ?? k.auto });
  };

  const openForm = (mode: FormMode) => {
    let vals: Record<string, string> = {};
    if (input.customValues) vals = { ...input.customValues(mode) };
    else if (cur) {
      if (mode !== 'new') editableSections(cur).forEach(([, kv]) => kv.forEach(([l, val]) => (vals[l] = val)));
      if (mode === 'copy') {
        const first = editableSections(cur)[0]?.[1][0]?.[0];
        if (first) vals[first] = '';
      }
    }
    setOverlay({ m: 'form', mode, vals, auto: mode !== 'edit', tried: false, noChange: false, orig: { ...vals } });
  };

  let form:
    | (Omit<CustomForm, 'secs'> & {
        secs: { title: string; fields: KitField[] }[];
        hasNote: boolean;
        hasErr: boolean;
        errText: string;
      })
    | null = null;
  if (k?.m === 'form') {
    let built: CustomForm;
    if (input.customForm) built = input.customForm({ overlay: k, setV, field });
    else if (cur) {
      const V = k.vals;
      const mode = k.mode;
      const base = editableSections(cur);
      const first = base[0]?.[1][0]?.[0] ?? 'Code';
      const errs: Record<string, string> = {};
      base.forEach(([, kv], si) =>
        kv.forEach(([l], i) => {
          if ((si === 0 && i < 2) || M.opts[l]) {
            if (!String(V[l] ?? '').trim()) errs[l] = 'Required';
          }
        }),
      );
      if (mode !== 'edit') {
        const code = String(V[first] ?? '')
          .trim()
          .toUpperCase();
        if (code && input.allCodes.includes(code)) errs[first] = first + ' ' + code + ' already exists';
      }
      const changed = mode === 'edit' ? Object.keys(V).filter((l) => V[l] !== k.orig[l]) : [];
      built = {
        secs: base.map(([t, kv], si) => [
          t,
          kv.map(([l], i) =>
            field(l, l, errs, {
              req: (si === 0 && i < 2) || !!M.opts[l],
              opts: M.opts[l],
              ro: mode === 'edit' && l === first,
              wide: String(V[l] ?? '').length > 46,
            }),
          ),
        ]),
        errs,
        title: mode === 'edit' ? 'Edit ' + noun + ' · ' + cur.code : mode === 'copy' ? M.copyLabel || 'Copy' : M.newLabel || 'New ' + noun,
        sub: mode === 'new' ? 'New record in ' + M.key.replace(/([a-z])([A-Z])/g, '$1 $2') : cur.title,
        note:
          M.key === 'ContractMaster' && mode === 'edit'
            ? 'Saving creates a new contract version. It applies after approval.'
            : 'Changes to master data go to the approvals inbox before they apply.',
        cta: 'Submit for approval',
        foot: '* Required',
        submit: () => {
          if (Object.keys(errs).length) return setOverlay({ ...k, tried: true });
          if (mode === 'edit' && !changed.length) return setOverlay({ ...k, tried: true, noChange: true });
          const code = String(V[first] ?? '').trim();
          const changes = Object.fromEntries((mode === 'edit' ? changed : Object.keys(V)).map((l) => [l, V[l] ?? '']));
          input
            .requestChange({ screen: M.key, kind: mode, code: mode === 'edit' ? cur.code : code, changes })
            .then((reqNo) => {
              setOverlay(null);
              toast(
                (mode === 'edit'
                  ? Noun + ' ' + cur.code + ': ' + changed.length + ' change' + (changed.length === 1 ? '' : 's')
                  : 'New ' + noun + ' ' + code) +
                  ' submitted for approval · ' +
                  reqNo +
                  '.',
              );
            })
            .catch(() => toast('The request could not be sent. Try again.'));
        },
      };
    } else built = { secs: [], errs: {}, title: '', sub: '', cta: '', foot: '', note: '', submit: close };
    const nErr = Object.keys(built.errs).length;
    form = {
      ...built,
      secs: built.secs.map(([title, fields]) => ({ title, fields })),
      hasNote: !!built.note,
      hasErr: k.tried && (nErr > 0 || k.noChange),
      errText: k.noChange && !nErr ? 'Nothing has changed yet.' : 'Fix ' + nErr + ' field' + (nErr === 1 ? '' : 's') + ' marked below.',
    };
  }

  // ---------------------------------------------------------------- delete / (de)activate
  let dangerLabel = '';
  let dangerTip = '';
  if (cur && M.danger === 'delete') {
    dangerLabel = 'Delete';
    dangerTip = 'Delete ' + noun + ' ' + cur.code;
  } else if (cur && M.danger === 'toggle') {
    dangerLabel = cur.st === 'Inactive' ? 'Activate' : 'Deactivate';
    dangerTip = dangerLabel + ' ' + noun + ' ' + cur.code;
  }
  let conf: {
    title: string;
    sub: string;
    reason: string;
    hasErr: boolean;
    onReason: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    text: string;
    cta: string;
    ok: () => void;
  } | null = null;
  if (k?.m === 'confirm' && cur) {
    const isDel = M.danger === 'delete';
    const act = isDel ? 'Delete' : dangerLabel;
    const custom = input.customConfirm?.(cur);
    conf = {
      title: act + ' ' + noun + ' ' + cur.code + '?',
      sub: cur.title,
      reason: k.reason,
      hasErr: k.tried && !k.reason.trim(),
      onReason: (e) => setOverlay({ ...k, reason: e.target.value }),
      text:
        custom?.text ??
        (isDel
          ? 'The ' + noun + ' is removed. This request goes to the approvals inbox.'
          : act === 'Deactivate'
            ? 'The ' +
              noun +
              ' can no longer be used on new invoices. Existing invoices are not changed. This request goes to the approvals inbox.'
            : 'The ' + noun + ' becomes available again. This request goes to the approvals inbox.'),
      cta: custom?.cta ?? 'Submit ' + act.toLowerCase(),
      ok: () => {
        const reason = k.reason.trim();
        if (!reason) return setOverlay({ ...k, tried: true });
        if (custom) return custom.ok(reason);
        input
          .requestChange({
            screen: M.key,
            kind: isDel ? 'delete' : act === 'Activate' ? 'activate' : 'deactivate',
            code: cur.code,
            changes: {},
            reason,
          })
          .then((reqNo) => {
            setOverlay(null);
            toast(act + ' request for ' + noun + ' ' + cur.code + ' submitted for approval · ' + reqNo + '.');
          })
          .catch(() => toast('The request could not be sent. Try again.'));
      },
    };
  }

  const ro = M.readonly;
  return {
    isHist: k?.m === 'hist' && !!hist,
    isForm: !!form,
    isConfirm: !!conf,
    close,
    hist,
    form,
    conf,
    hasHist: !!hist,
    histLabel: H ? H.title : '',
    openHist: () => setOverlay({ m: 'hist' }),
    canEdit: !ro && !!cur,
    edit: () => openForm('edit'),
    hasMore: !ro && !!cur && (!!M.copyLabel || !!hist || !!M.danger),
    onlyHist: ro && !!hist,
    menuOpen: k?.m === 'menu',
    toggleMenu: () => setOverlay(k?.m === 'menu' ? null : { m: 'menu' }),
    dangerMenu: dangerLabel + ' ' + noun,
    dangerNote: '',
    canCopy: !ro && !!cur && !!M.copyLabel,
    copy: () => openForm('copy'),
    copyLabel: M.copyLabel,
    hasDanger: !ro && !!cur && !!M.danger,
    danger: () => setOverlay({ m: 'confirm', reason: '', tried: false }),
    dangerLabel,
    dangerDis: false,
    dangerTip,
    create: () => openForm('new'),
  };
}

export type MasterKitVals = ReturnType<typeof renderMasterKit>;
