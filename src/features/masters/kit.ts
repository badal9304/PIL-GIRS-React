// @ts-nocheck — screen logic ported from the GIRS prototype; types are added as the screen is reworked.
/* Master-data kit shared by Customer, Contract and Charge master screens:
   current record, record history popup and downloads, create / edit drawer, confirmations and requests. */

export function KIT_VALS(self, s, v, KIT_M, KIT_CM) {
  const M = KIT_M,
    k = s.__k || null;
  const set = (o) => self.setState(o);
  const close = () => set({ __k: null });
  try {
    window.__kitClose = close;
    if (!window.__kitEsc) {
      window.__kitEsc = 1;
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && window.__kitClose) window.__kitClose();
      });
    }
  } catch (e) {}
  const isCust = M.key === 'CustomerMaster';
  const LS = 'girs.cust.v1';
  const load = () => {
    let x = {};
    try {
      x = JSON.parse(localStorage.getItem(LS) || '{}') || {};
    } catch (e) {}
    ['add', 'del'].forEach((n) => {
      x[n] = x[n] || [];
    });
    ['groups', 'gedit', 'edit'].forEach((n) => {
      x[n] = x[n] || {};
    });
    return x;
  };
  const store = (x) => {
    try {
      localStorage.setItem(LS, JSON.stringify(x));
    } catch (e) {}
  };
  const toast = (t) => set({ __toast: t });
  const reqNo = () => 'REQ-' + String(Date.now()).slice(-6);
  const CM = isCust ? KIT_CM() : null;

  // ---------------------------------------------------------------- current record
  let cur = null,
    cc = null;
  if (isCust) {
    cc = CM.C.find((x) => x.id === s.sel) || CM.C.find((x) => x.id === M.def_) || CM.C[0] || null;
    if (cc) cur = { id: cc.id, code: cc.code, title: cc.name, st: CM.ST[cc.st].t, hist: null, nContracts: M.contracts[cc.code] || 0 };
  } else {
    cur = M.recs.find((x) => x.id === s.sel) || M.recs.find((x) => x.id === M.def_) || M.recs[0] || null;
  }
  const noun = M.noun,
    Noun = noun.charAt(0).toUpperCase() + noun.slice(1);

  // ---------------------------------------------------------------- history popup + downloads
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const H = cur && cur.hist;
  const hTitle = H ? H.title + ' · ' + cur.code : '';
  const hFile = H ? (M.key + '-' + cur.code + '-' + H.title).replace(/[^A-Za-z0-9]+/g, '-').toLowerCase() : '';
  const hDoc = () =>
    '<!doctype html><html><head><meta charset="utf-8"><title>' +
    esc(hTitle) +
    '</title><style>body{font-family:"IBM Plex Sans",Arial,sans-serif;font-size:12px;color:var(--ink);margin:28px}h1{font-size:16px;margin:0 0 4px}p{color:var(--muted);margin:0 0 16px}table{border-collapse:collapse;width:100%}th,td{border:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}th{background:var(--sub)}</style></head><body><h1>' +
    esc(hTitle) +
    '</h1><p>' +
    esc(cur.title) +
    ' · exported ' +
    esc(new Date().toLocaleString()) +
    '</p><table><thead><tr>' +
    H.cols.map((c) => '<th>' + esc(c) + '</th>').join('') +
    '</tr></thead><tbody>' +
    H.rows.map((r) => '<tr>' + r.map((c) => '<td>' + esc(c) + '</td>').join('') + '</tr>').join('') +
    '</tbody></table></body></html>';
  const dl = (ext, mime, data, label) => {
    try {
      const b = new Blob([data], { type: mime });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b);
      a.download = hFile + '.' + ext;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(a.href);
        a.remove();
      }, 1000);
      toast(H.title + ' for ' + cur.code + ' downloaded as ' + label + '.');
    } catch (e) {
      toast('Download is not available in this preview.');
    }
  };
  const printDoc = (label) => {
    let w = null;
    try {
      w = window.open('', '_blank');
    } catch (e) {}
    if (!w) {
      toast('Allow pop-ups for this site to ' + label + '.');
      return;
    }
    w.document.write(hDoc());
    w.document.close();
    w.focus();
    setTimeout(() => {
      try {
        w.print();
      } catch (e) {}
    }, 300);
  };
  const hist = H
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
            '﻿' +
              [H.cols]
                .concat(H.rows)
                .map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(','))
                .join('\r\n'),
            'CSV',
          ),
        xls: () => dl('xls', 'application/vnd.ms-excel', hDoc(), 'Excel'),
        pdf: () => printDoc('save as PDF'),
        print: () => printDoc('print'),
      }
    : null;

  // ---------------------------------------------------------------- forms
  const SYS = /status|^Version$|^Approval|^LMS CMD reference$/i;
  const genSecs = (rec) => {
    const seen = {};
    return rec.secs
      .map(([t, kv]) => [
        t,
        kv.filter(([l, val]) => {
          if (seen[l] || /^\[/.test(val) || SYS.test(l)) return false;
          seen[l] = 1;
          return true;
        }),
      ])
      .filter((x) => x[1].length);
  };
  const allCodes = isCust ? CM.C.map((x) => x.code.toUpperCase()) : M.recs.map((x) => x.code.toUpperCase());
  const PFX = { SG: 'SG-1', MY: 'MY-2', IN: 'IN-3', CN: 'CN-4', TH: 'TH-5' };
  const suggest = (ctry) => {
    if (!ctry) return '';
    const p = ctry + '-';
    const nums = CM.C.filter((x) => x.code.indexOf(p) === 0)
      .map((x) => +x.code.slice(3))
      .filter((n) => !isNaN(n));
    const base = nums.length ? Math.max.apply(null, nums) + 1 : +(PFX[ctry] ? PFX[ctry].slice(3) + '00001' : '100001');
    return p + String(base).padStart(6, '0');
  };
  const nextRef = () => {
    const n = CM.C.map((x) => +String(x.ref).replace(/\D/g, '')).filter((x) => !isNaN(x));
    return 'CMD-' + String((n.length ? Math.max.apply(null, n) : 70000) + 137).padStart(7, '0');
  };
  const gOf = (gid) => CM.G[gid] || {};

  const custVals = (c, mode) => {
    const g = c ? gOf(c.g) : {};
    if (!c)
      return {
        ctry: '',
        code: '',
        auto: true,
        name: '',
        g: '',
        gname: '',
        legal: '',
        tax: '',
        terms: '',
        arr: 'Default',
        json: 'PDF, JSON',
        email: '',
        addr: '',
        st: 'ok',
      };
    const base = {
      g: c.g,
      gname: '',
      legal: g.legal,
      tax: g.tax,
      terms: g.terms,
      arr: g.arr,
      json: (g.json != null ? g.json : c.g !== 'gC') ? 'PDF, JSON' : 'PDF',
      st: c.st,
    };
    if (mode === 'copy')
      return Object.assign(base, { ctry: '', code: '', auto: true, name: c.name.replace(/ \([A-Z]{2}\)$/, ''), email: '', addr: '' });
    return Object.assign(base, { ctry: c.ctry, code: c.code, auto: false, name: c.name, email: c.email, addr: c.addr });
  };

  const open = (mode) => {
    if (isCust) set({ __k: { m: 'form', mode, vals: custVals(mode === 'new' ? null : cc, mode), tried: false } });
    else {
      const vals = {};
      if (mode !== 'new')
        genSecs(cur).forEach(([, kv]) =>
          kv.forEach(([l, val]) => {
            vals[l] = val;
          }),
        );
      if (mode === 'copy') {
        const f = genSecs(cur)[0][1][0][0];
        vals[f] = '';
      }
      set({ __k: { m: 'form', mode, vals, tried: false, orig: Object.assign({}, vals) } });
    }
  };

  const custValidate = (V, mode) => {
    const e = {};
    const req = (key, msg) => {
      if (!String(V[key] || '').trim()) e[key] = msg || 'Required';
    };
    if (mode !== 'edit') {
      req('ctry', 'Select a country');
      req('code');
      const code = String(V.code || '')
        .trim()
        .toUpperCase();
      if (code && !/^[A-Z]{2}-\d{6}$/.test(code)) e.code = 'Use the format CC-000000, e.g. SG-100232';
      else if (code && V.ctry && code.slice(0, 2) !== V.ctry) e.code = 'Code must start with the country code ' + V.ctry;
      else if (code && allCodes.indexOf(code) >= 0) e.code = 'Customer code ' + code + ' already exists';
      req('g', 'Select a parent customer group');
      if (V.g === '__new') {
        req('gname');
        const gn = String(V.gname || '')
          .trim()
          .toLowerCase();
        if (gn && Object.keys(CM.G).some((x) => CM.G[x].name.toLowerCase() === gn))
          e.gname = 'A parent group with this name already exists — select it instead';
      }
    }
    req('name');
    req('legal');
    req('tax');
    const tax = String(V.tax || '')
      .trim()
      .toLowerCase();
    if (tax && (mode !== 'edit' ? V.g === '__new' : true)) {
      const other = Object.keys(CM.G).find((x) => x !== V.g && String(CM.G[x].tax).toLowerCase() === tax);
      if (other) e.tax = 'Tax ID belongs to parent group ' + CM.G[other].name + ' — select that group';
    }
    req('terms', 'Select credit terms');
    req('arr');
    req('json');
    req('email');
    if (V.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(V.email).trim())) e.email = 'Enter a valid email address';
    req('addr');
    if (V.addr && String(V.addr).trim().length < 10) e.addr = 'Enter the full address';
    return e;
  };

  let form = null;
  if (k && k.m === 'form') {
    const V = k.vals,
      mode = k.mode,
      tried = k.tried;
    const setV = (key, val, extra) => set({ __k: Object.assign({}, k, { vals: Object.assign({}, V, { [key]: val }, extra || {}) }) });
    let secs = [],
      errs = {},
      note = '',
      foot = '',
      cta = 'Save',
      title = '',
      sub = '',
      submit = null;
    const F = (key, label, o) => {
      o = o || {};
      const err = tried ? errs[key] || '' : '';
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
        type: o.type || 'text',
        v: o.ro ? (o.show != null ? o.show : V[key] || '—') : V[key] == null ? '' : V[key],
        ph: o.ph || '',
        opts: o.opts ? [{ v: '', t: o.ph || 'Select…' }].concat(o.opts.map((x) => (typeof x === 'string' ? { v: x, t: x } : x))) : [],
        on: o.on || ((e) => setV(key, e.target.value)),
        err,
        hasErr: !!err,
        hint: o.hint || '',
        hasHint: !!o.hint && !err,
      };
    };
    if (isCust) {
      errs = custValidate(V, mode);
      const isNewG = V.g === '__new',
        exG = V.g && !isNewG ? gOf(V.g) : null;
      const members = V.g ? CM.C.filter((x) => x.g === V.g).length : 0;
      const gro = mode !== 'edit' && !!exG; // group-level fields come from the selected group
      const gHint =
        mode === 'edit'
          ? 'Applies to all ' + members + ' customer code' + (members === 1 ? '' : 's') + ' in ' + (exG ? exG.name : 'this group')
          : gro
            ? 'From parent customer group ' + exG.name
            : '';
      const groups = Object.keys(CM.G)
        .map((x) => ({ v: x, t: CM.G[x].name }))
        .concat([{ v: '__new', t: '+ Create new parent group' }]);
      const ctrys = Object.keys(CM.CN).map((x) => ({ v: x, t: CM.CN[x] + ' (' + x + ')' }));
      const pickC = (e) => {
        const c = e.target.value;
        setV('ctry', c, V.auto || !V.code ? { code: suggest(c), auto: true } : {});
      };
      const pickG = (e) => {
        const g = e.target.value;
        const G0 = CM.G[g];
        setV(
          'g',
          g,
          G0
            ? {
                legal: G0.legal,
                tax: G0.tax,
                terms: G0.terms,
                arr: G0.arr,
                json: (G0.json != null ? G0.json : g !== 'gC') ? 'PDF, JSON' : 'PDF',
                gname: '',
              }
            : { legal: '', tax: '', terms: '', arr: 'Default', json: 'PDF, JSON' },
        );
      };
      const terms = Object.keys(CM.G)
        .map((x) => CM.G[x].terms)
        .filter((x, i, a) => x && a.indexOf(x) === i);
      const ST = [
        { v: 'ok', t: 'Not listed' },
        { v: 'sanc', t: 'Sanctioned' },
        { v: 'black', t: 'Blacklisted' },
      ];
      const idF =
        mode === 'edit'
          ? [
              F('code', 'Customer code', { ro: true }),
              F('ctry', 'Country', { ro: true, show: CM.CN[V.ctry] }),
              F('name', 'Customer name', { req: true, wide: true }),
              F('g', 'Parent customer group', { ro: true, show: exG ? exG.name : '—', wide: true }),
            ]
          : [
              F('ctry', 'Country', { req: true, opts: ctrys, on: pickC, ph: 'Select country' }),
              F('code', 'Customer code', {
                req: true,
                ph: 'e.g. SG-100232',
                on: (e) => setV('code', e.target.value.toUpperCase(), { auto: false }),
                hint: V.auto && V.code ? 'Next free code for ' + CM.CN[V.ctry] + ' — you can change it' : 'Format CC-000000',
              }),
              F('name', 'Customer name', { req: true, wide: true, ph: 'e.g. Straits Harbour Logistics (VN)' }),
              F('g', 'Parent customer group', {
                req: true,
                wide: true,
                opts: groups,
                on: pickG,
                ph: 'Select parent group',
                hint: 'Customer codes of one legal entity share a parent group',
              }),
            ].concat(isNewG ? [F('gname', 'Parent group name', { req: true, wide: true })] : []);
      idF.push(
        F('legal', 'Legal entity name', { req: true, wide: true, ro: gro, hint: gro ? gHint : '' }),
        F('tax', 'Registration / Tax ID', { req: true, ro: gro, hint: gro ? gHint : '' }),
        F('ref', 'LMS CMD reference', { ro: true, show: mode === 'edit' ? cc.ref : 'Assigned when the customer is created' }),
      );
      secs = [
        ['Identity', idF],
        [
          'Contact',
          [
            F('email', 'Email', { req: true, wide: true, type: 'email', ph: 'name@company.com' }),
            F('addr', 'Address details', { req: true, wide: true, area: true }),
          ],
        ],
        [
          'Terms & compliance',
          [
            F('terms', 'Credit terms', { req: true, opts: terms, ro: gro, hint: gro || mode === 'edit' ? gHint : '' }),
            F('st', 'Sanction / Blacklist', { req: true, opts: ST }),
          ],
        ],
        [
          'Billing configuration & distribution',
          [
            F('arr', 'Invoicing arrangement', {
              req: true,
              opts: ['Default', 'Split'],
              ro: gro,
              hint: gro || mode === 'edit' ? gHint : '',
            }),
            F('json', 'Document / data delivery', { req: true, opts: ['PDF, JSON', 'PDF'], ro: gro }),
            F('dto', 'Delivery to', { ro: true, show: V.email || 'Same as email', wide: true }),
          ],
        ],
      ];
      title = mode === 'edit' ? 'Edit customer · ' + cc.code : mode === 'copy' ? 'Copy as new customer code' : 'Create new Customer';
      sub = mode === 'edit' ? cc.name : mode === 'copy' ? 'From ' + cc.code + ' · ' + cc.name : 'Add a customer code to Customer Master';
      cta = mode === 'edit' ? 'Save changes' : 'Create customer';
      foot = '* Required';
      submit = () => {
        if (Object.keys(errs).length) {
          set({ __k: Object.assign({}, k, { tried: true }) });
          return;
        }
        const x = load();
        const t = (f) => String(V[f] || '').trim();
        const gfields = { legal: t('legal'), tax: t('tax'), terms: V.terms, arr: V.arr, json: V.json === 'PDF, JSON' };
        if (mode === 'edit') {
          const ce = { name: t('name'), email: t('email'), addr: t('addr'), st: V.st };
          const ai = x.add.findIndex((a) => a.id === cc.id);
          if (ai >= 0) x.add[ai] = Object.assign({}, x.add[ai], ce);
          else x.edit[cc.id] = Object.assign({}, x.edit[cc.id] || {}, ce);
          if (x.groups[cc.g]) x.groups[cc.g] = Object.assign({}, x.groups[cc.g], gfields);
          else x.gedit[cc.g] = Object.assign({}, x.gedit[cc.g] || {}, gfields);
          store(x);
          set({ __k: null, __toast: 'Customer ' + cc.code + ' · ' + t('name') + ' updated.' });
          return;
        }
        let gid = V.g,
          gname = '';
        if (gid === '__new') {
          gid = 'ug' + Date.now().toString(36);
          gname = t('gname');
          x.groups[gid] = Object.assign({ name: gname }, gfields);
        } else gname = gOf(gid).name;
        const id = 'uc' + Date.now().toString(36),
          code = t('code').toUpperCase();
        x.add.push({ id, code, name: t('name'), g: gid, ctry: V.ctry, st: V.st, ref: nextRef(), addr: t('addr'), email: t('email') });
        store(x);
        set({
          __k: null,
          sel: id,
          selCode: '',
          q: '',
          fs: '',
          fc: '',
          show: 'all',
          open: Object.assign({}, s.open || {}, { [gid]: true, [gname]: true }),
          __toast: 'Customer ' + code + ' · ' + t('name') + ' created.',
        });
      };
    } else {
      const base = genSecs(cur);
      const first = base[0][1][0][0];
      base.forEach(([, kv]) =>
        kv.forEach(([l], i) => {
          if ((i < 2 && kv === base[0][1]) || M.opts[l]) {
            if (!String(V[l] || '').trim()) errs[l] = 'Required';
          }
        }),
      );
      if (mode !== 'edit') {
        const code = String(V[first] || '')
          .trim()
          .toUpperCase();
        if (code && allCodes.indexOf(code) >= 0) errs[first] = first + ' ' + code + ' already exists';
      }
      secs = base.map(([t, kv]) => [
        t,
        kv.map(([l], i) =>
          F(l, l, {
            req: (kv === base[0][1] && i < 2) || !!M.opts[l],
            opts: M.opts[l],
            ro: mode === 'edit' && l === first,
            wide: String(V[l] || '').length > 46,
          }),
        ),
      ]);
      const changed = mode === 'edit' ? Object.keys(V).filter((l) => V[l] !== k.orig[l]) : [];
      title = mode === 'edit' ? 'Edit ' + noun + ' · ' + cur.code : mode === 'copy' ? M.copyLabel || 'Copy' : M.newLabel || 'New ' + noun;
      sub = mode === 'new' ? 'New record in ' + M.key.replace(/([a-z])([A-Z])/g, '$1 $2') : cur.title;
      note =
        M.key === 'ContractMaster' && mode === 'edit'
          ? 'Saving creates a new contract version. It applies after approval.'
          : 'Changes to master data go to the approvals inbox before they apply.';
      cta = 'Submit for approval';
      foot = '* Required';
      submit = () => {
        if (Object.keys(errs).length) {
          set({ __k: Object.assign({}, k, { tried: true }) });
          return;
        }
        if (mode === 'edit' && !changed.length) {
          set({ __k: Object.assign({}, k, { tried: true, noChange: true }) });
          return;
        }
        const r = reqNo(),
          code = String(V[first] || '').trim();
        set({
          __k: null,
          __toast:
            (mode === 'edit'
              ? Noun + ' ' + cur.code + ': ' + changed.length + ' change' + (changed.length === 1 ? '' : 's')
              : 'New ' + noun + ' ' + code) +
            ' submitted for approval · ' +
            r +
            '.',
        });
      };
    }
    const nErr = Object.keys(errs).length;
    form = {
      title,
      sub,
      secs: secs.map(([t, f]) => ({ title: t, fields: f })),
      note,
      hasNote: !!note,
      cta,
      foot,
      submit,
      hasErr: tried && (nErr > 0 || !!k.noChange),
      errText: k.noChange && !nErr ? 'Nothing has changed yet.' : 'Fix ' + nErr + ' field' + (nErr === 1 ? '' : 's') + ' marked below.',
    };
  }

  // ---------------------------------------------------------------- delete / deactivate
  let dangerLabel = '',
    dangerDis = false,
    dangerTip = '',
    dangerNote = '';
  if (cur && M.danger === 'delete') {
    dangerLabel = 'Delete';
    dangerTip = 'Delete ' + noun + ' ' + cur.code;
  } else if (cur && M.danger === 'toggle') {
    dangerLabel = cur.st === 'Inactive' ? 'Activate' : 'Deactivate';
    dangerTip = dangerLabel + ' ' + noun + ' ' + cur.code;
  }
  let conf = null;
  if (k && k.m === 'confirm' && cur) {
    const isDel = M.danger === 'delete';
    const act = isDel ? 'Delete' : dangerLabel;
    conf = {
      title: act + ' ' + noun + ' ' + cur.code + '?',
      sub: cur.title,
      reason: k.reason || '',
      hasErr: !!k.tried && !String(k.reason || '').trim(),
      onReason: (e) => set({ __k: Object.assign({}, k, { reason: e.target.value }) }),
      text: isCust
        ? 'The customer code is removed from Customer Master.' +
          (cur.nContracts ? ' It has ' + cur.nContracts + ' contract' + (cur.nContracts === 1 ? '' : 's') + '.' : '')
        : isDel
          ? 'The contract is removed. This request goes to the approvals inbox.'
          : act === 'Deactivate'
            ? 'The ' +
              noun +
              ' can no longer be used on new invoices. Existing invoices are not changed. This request goes to the approvals inbox.'
            : 'The ' + noun + ' becomes available again. This request goes to the approvals inbox.',
      cta: isCust ? 'Delete customer' : 'Submit ' + act.toLowerCase(),
      ok: () => {
        if (!String(k.reason || '').trim()) {
          set({ __k: Object.assign({}, k, { tried: true }) });
          return;
        }
        if (isCust) {
          const x = load();
          const ai = x.add.findIndex((a) => a.id === cur.id);
          if (ai >= 0) x.add.splice(ai, 1);
          else if (x.del.indexOf(cur.id) < 0) x.del.push(cur.id);
          store(x);
          const nxt = CM.C.find((c) => c.id !== cur.id);
          set({ __k: null, sel: nxt ? nxt.id : '', __toast: 'Customer ' + cur.code + ' · ' + cur.title + ' deleted.' });
          return;
        }
        set({ __k: null, __toast: act + ' request for ' + noun + ' ' + cur.code + ' submitted for approval · ' + reqNo() + '.' });
      },
    };
  }

  const ro = M.readonly;
  return {
    isHist: !!(k && k.m === 'hist' && hist),
    isForm: !!form,
    isConfirm: !!conf,
    close,
    hist: hist || {},
    form: form || {},
    conf: conf || {},
    hasHist: !!hist,
    histLabel: H ? H.title : '',
    openHist: () => set({ __k: { m: 'hist' } }),
    canEdit: !ro && !!cur,
    edit: () => open('edit'),
    hasMore: !ro && !!cur && (!!M.copyLabel || !!hist || !!M.danger),
    onlyHist: ro && !!hist,
    menuOpen: !!(k && k.m === 'menu'),
    toggleMenu: () => set({ __k: k && k.m === 'menu' ? null : { m: 'menu' } }),
    dangerMenu: dangerLabel + ' ' + noun,
    dangerNote,
    canCopy: !ro && !!cur && !!M.copyLabel,
    copy: () => open('copy'),
    copyShort: 'Copy',
    copyLabel: M.copyLabel || '',
    hasDanger: !ro && !!cur && !!M.danger,
    danger: () => set({ __k: { m: 'confirm', reason: '' } }),
    dangerLabel,
    dangerDis,
    dangerTip,
    create: () => open('new'),
  };
}
