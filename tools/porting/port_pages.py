#!/usr/bin/env python3
"""One-off port of the prototype screens (Invoice List; Customer / Contract / Charge master, layouts C and D)
into React: view-model classes (screen logic) + TSX views (markup). Run from the repo root:
    python3 tools/port_pages.py /path/to/PIL---GIRS
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(__file__))
import tpl2jsx  # noqa: E402
import css2tw  # noqa: E402

# GIRS colour tokens available as Tailwind colours (see src/styles/tailwind.css)
css2tw.load_tokens(re.findall(r'--color-([a-z0-9]+):', open(os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'styles', 'tailwind.css')).read()))

SRC = sys.argv[1] if len(sys.argv) > 1 else '../PIL---GIRS'
ROOT = os.path.join(os.path.dirname(__file__), '..', '..', 'src')
NS = '{http://www.w3.org/1999/xhtml}'
DECL = re.compile(r'^(?:const|function|class|let) ([A-Za-z_$][\w$]*)', re.M)
SHELL_DECLS = {'USER_NAME', 'GIRS_LANGS', 'LOGINS', 'Component'}
HEAD = '// @ts-nocheck — screen logic ported from the GIRS prototype; types are added as the screen is reworked.\n'


def write(path, text):
    p = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w').write(text)


def read(name):
    s = open(os.path.join(SRC, name + '.html')).read()
    tpl = s[s.find('</helmet>') + 9:s.find('</script>')]
    lg = s[s.find('id="logic">') + 11:]
    lg = lg[:lg.find('</script>')]
    return tpl, lg


def decls(lg):
    d = [(m.start(), m.group(1)) for m in DECL.finditer(lg)]
    return [(n, lg[p:(d[i + 1][0] if i + 1 < len(d) else len(lg))]) for i, (p, n) in enumerate(d)]


def fix_logic(code):
    code = re.sub(r'parseFloat\(this\.state\.__z \|\| 1\) \|\| 1', 'getZoom()', code)
    code = code.replace('this.state.__z', 'getZoom()')
    code = re.sub(r'window\.location\.href = ([^;]+);', r'navigateTo(\1);', code)
    code = code.replace("location.pathname.split('/').pop()", 'currentLegacyPage()')
    code = code.replace('class GirsPage extends DCLogic', 'export class GirsPage extends ViewModel')
    return code


def export_decl(chunk):
    return re.sub(r'^(const|function|class|let) ', r'export \1 ', chunk, count=1)


# ------------------------------------------------------------------ templates
def split_template(tpl, kit=False):
    if kit:
        tpl = tpl.replace('{{shell.kit.', '{{kit.')
        # only layouts C and D are built
        tpl = re.sub(r'<a class="lay"[^>]*href="[a-z-]+-master(-b)?\.html"[^>]*>[^<]*</a>', '', tpl)
    root = tpl2jsx.parse(tpl)[0]
    ghead = [e for e in root.iter() if 'ghead' in e.attrib.get('class', '').split()][0]
    main = root.find('.//' + NS + 'main')
    extras = [c for c in root if not (c.tag == NS + 'sc-if' and 'hasToast' in c.attrib.get('value', ''))][2:]
    return ghead, main, extras


def jsx_children(conv, el, ind):
    kids = conv.children(el, 'main', False, False, ind)
    return '\n'.join(('  ' * ind) + k for k in kids if k.strip())


def imports(code, up):
    """Import lines for the helpers the generated markup actually uses."""
    out = []
    if 'Fragment' in code:
        out.append("import { Fragment } from 'react';")
    if '<Page' in code:
        out.append("import { Page } from '%sapp/shell/Page';" % up)
    if '<AppLink' in code:
        out.append("import { AppLink } from '%scomponents/AppLink';" % up)
    if re.search(r'\b(tx|t)\(', code):
        out.append("import { useI18n } from '%si18n/context';" % up)
    helpers = [h for h in ('a', 'b', 'clk', 's', 'sx') if re.search(r'\b%s\(' % h, code)]
    if helpers:
        out.append("import { %s } from '%slib/view';" % (', '.join(helpers), up))
    return '\n'.join(out)


def i18n_line(code):
    used = [n for n in ('t', 'tx') if re.search(r'\b%s\(' % n, code)]
    return ('  const { %s } = useI18n();\n' % ', '.join(used)) if used else ''


COMPONENT = """%(imp)s

/* %(doc)s */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function %(name)s({ v }: { v: any }) {
%(i18n)s  return (
%(jsx)s
  );
}
"""


def view_file(name, ghead, main, extras, doc, shared_overlays=None):
    conv = tpl2jsx.Conv('v')
    header = conv.node(ghead, False, False, 3)
    body = jsx_children(conv, main, 3)
    if shared_overlays:
        overlays = '\n      overlays={<%s v={v} />}' % shared_overlays
    elif extras:
        over = '\n'.join('        ' + conv.node(x, False, False, 4) for x in extras)
        overlays = '\n      overlays={\n        <>\n%s\n        </>\n      }' % over
    else:
        overlays = ''
    jsx = '    <Page\n      header={\n        %s\n      }%s\n    >\n%s\n    </Page>' % (header, overlays, body)
    imp = imports(jsx, '%(up)s')
    if shared_overlays:
        imp += "\nimport { %s } from '../%s';" % (shared_overlays, shared_overlays)
    doc = doc + '\n   Markup ported from the GIRS prototype; values and handlers come from the screen view-model (v).'
    return COMPONENT % {'imp': imp, 'name': name, 'doc': doc, 'i18n': i18n_line(jsx), 'jsx': jsx}


def overlays_file(extras):
    conv = tpl2jsx.Conv('v')
    over = '\n'.join('      ' + conv.node(x, False, False, 3) for x in extras)
    jsx = '    <>\n%s\n    </>' % over
    doc = ('Dialogs and drawers of the master-data kit (record history, create / edit drawer, confirmation),\n'
           '   shared by every master screen. Values come from the screen view-model (v.kit).')
    return COMPONENT % {'imp': imports(jsx, '../../'), 'name': 'MasterKitOverlays', 'doc': doc, 'i18n': i18n_line(jsx), 'jsx': jsx}


def finish(text, depth):
    return text.replace('%(up)s', '../' * depth)


# ------------------------------------------------------------------ Invoice List
def port_invoices():
    tpl, lg = read('invoice-list-v2')
    parts = decls(lg)
    data = [c for n, c in parts if n not in SHELL_DECLS and n != 'GirsPage']
    names = [n for n, c in parts if n not in SHELL_DECLS and n != 'GirsPage']
    model = [c for n, c in parts if n == 'GirsPage'][0]
    write('features/invoices/invoiceData.ts', HEAD + '''/* Invoice List: sample data (seeded generators), formatting and invoice rules.
   Everything here is plain TypeScript with no React dependency. */
import { navigateTo, currentLegacyPage } from '../../lib/appBridge';
import '../../lib/legacy/girsDocs.js';
import '../../lib/legacy/girsCtx.js';

''' + '\n'.join(fix_logic(export_decl(c)) for c in data))
    write('features/invoices/InvoiceListModel.ts', HEAD + '''/* Invoice List view-model: tabs (Ready to invoice / Invoices), filters, search, sort, column choice,
   pagination, row actions, dialogs and the Ready-to-invoice review screen. */
import { ViewModel } from '../../lib/viewModel';
import { getZoom } from '../../lib/appBridge';
import {
  %s
} from './invoiceData';

''' % ',\n  '.join(names) + fix_logic(model) + '\nexport { GirsPage as InvoiceListModel };\n')
    ghead, main, extras = split_template(tpl)
    write('features/invoices/InvoiceListView.tsx', finish(view_file('InvoiceListView', ghead, main, extras, 'Invoice List screen.'), 2))


# ------------------------------------------------------------------ masters
MASTERS = [('customer', 'Customer'), ('contract', 'Contract'), ('charge', 'Charge')]
LAYOUTS = [('c', 'LayoutC', 'layout C'), ('d', 'LayoutD', 'layout D')]


def port_masters():
    kit_written = False
    shared = {}
    for key, Name in MASTERS:
        data_names = None
        for lay, Lay, doc in LAYOUTS:
            tpl, lg = read('%s-master-%s' % (key, lay))
            parts = dict(decls(lg))
            if not kit_written:
                kit = parts['KIT_VALS'].replace('function KIT_VALS(self, s, v) {', 'export function KIT_VALS(self, s, v, KIT_M, KIT_CM) {')
                write('features/masters/kit.ts', HEAD + '''/* Master-data kit shared by Customer, Contract and Charge master screens:
   current record, record history popup and downloads, create / edit drawer, confirmations and requests. */

''' + kit)
                kit_written = True
            if data_names is None:
                data_names = [n for n in ('KIT_M', 'KIT_CM') if n in parts]
                write('features/masters/%s/%sData.ts' % (key, key), HEAD + '/* %s master: field definitions, options and sample records. */\n\n' % Name
                      + '\n'.join(export_decl(parts[n]) for n in data_names))
            cls = '%sMaster%sModel' % (Name, Lay)
            model = fix_logic(parts['GirsPage'])
            write('features/masters/%s/%s.ts' % (key, cls), HEAD + '''/* %(Name)s master, %(doc)s — view-model. */
import { ViewModel } from '../../../lib/viewModel';
import { KIT_VALS } from '../kit';
import { %(imports)s } from './%(key)sData';

%(model)s
export class %(cls)s extends GirsPage {
  renderVals() {
    const v = super.renderVals();
    return { ...v, kit: KIT_VALS(this, this.state, v, KIT_M, %(cm)s) };
  }
}
''' % {'Name': Name, 'doc': doc, 'imports': ', '.join(data_names), 'key': key, 'model': model, 'cls': cls, 'cm': 'KIT_CM' if 'KIT_CM' in data_names else 'undefined'})
            ghead, main, extras = split_template(tpl, kit=True)
            ov = overlays_file(extras)
            if not shared.get('ov'):
                shared['ov'] = ov
                write('features/masters/MasterKitOverlays.tsx', ov)
            assert ov == shared['ov'], 'kit overlays differ between master screens'
            view = '%sMaster%sView' % (Name, Lay)
            write('features/masters/%s/%s.tsx' % (key, view), finish(view_file(view, ghead, main, extras, '%s master, %s.' % (Name, doc), 'MasterKitOverlays'), 3))


if __name__ == '__main__':
    port_invoices()
    port_masters()
    print('ported')
