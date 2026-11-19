#!/usr/bin/env python3
"""Converts a GIRS prototype template (x-dc-template markup) into React JSX.

Used once to port the prototype screens into this project; the generated views are then
kept and maintained as normal TSX. Rules:
  {{path}}            -> v.path (or a loop variable)
  <sc-for list as>    -> {list.map((as, $index) => ...)}
  <sc-if value>       -> {value ? ... : null}
  text / title / placeholder / aria-label -> passed through the i18n helpers (tx / t)
  style="a: b"        -> style objects (static) or sx(`...`) for dynamic strings
"""
import re
import sys
import json
import xml.etree.ElementTree as ET
import css2tw

VOID = re.compile(r'<(input|img|br|hr|meta|link|source|col|wbr)(\s[^<>]*?)?\s*/?>')
HOLE = re.compile(r'\{\{\s*([^}]+?)\s*\}\}')
WHOLE = re.compile(r'^\{\{\s*([^}]+?)\s*\}\}$')
NS = '{http://www.w3.org/1999/xhtml}'

ATTR_MAP = {'class': 'className', 'for': 'htmlFor', 'tabindex': 'tabIndex', 'readonly': 'readOnly', 'maxlength': 'maxLength',
            'colspan': 'colSpan', 'rowspan': 'rowSpan', 'autocomplete': 'autoComplete', 'spellcheck': 'spellCheck',
            'inputmode': 'inputMode', 'autofocus': 'autoFocus', 'viewbox': 'viewBox'}
TRANSLATED_ATTRS = ('title', 'placeholder', 'aria-label')
NO_WS_PARENTS = {'table', 'thead', 'tbody', 'tfoot', 'tr', 'select', 'ul', 'ol', 'colgroup', 'svg', 'g'}
INLINE_PARENTS = {'span', 'a', 'b', 'i', 'small', 'strong', 'em', 'label', 'sc-if', 'sc-for', 'mark', 'kbd'}
NO_TRANSLATE_TAGS = {'textarea', 'code', 'script', 'style'}


def camel(name):
    if name.startswith('--'):
        return name
    if name.startswith('-ms-'):
        name = 'ms-' + name[4:]
    elif name.startswith('-'):
        name = name[1:]
        return re.sub(r'-([a-z])', lambda m: m.group(1).upper(), name[0].upper() + name[1:])
    return re.sub(r'-([a-z])', lambda m: m.group(1).upper(), name)


def split_decls(css):
    out, buf, depth, q = [], '', 0, None
    for ch in css:
        if q:
            buf += ch
            if ch == q:
                q = None
            continue
        if ch in '"\'':
            q = ch
        elif ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
        elif ch == ';' and depth == 0:
            out.append(buf)
            buf = ''
            continue
        buf += ch
    out.append(buf)
    return [d.strip() for d in out if d.strip()]


class Conv:
    def __init__(self, root_var='v'):
        self.root = root_var
        self.loops = []

    # ---- expressions
    def expr(self, path):
        path = path.strip()
        if path in ('true', 'false', 'null'):
            return path
        if re.fullmatch(r'-?\d+(\.\d+)?', path):
            return path
        parts = path.split('.')
        if parts[0] in self.loops or parts[0] == '$index':
            base, rest = parts[0], parts[1:]
        else:
            base, rest = self.root, parts
        out = base
        for i, p in enumerate(rest):
            # first hop off the root object is always present; deeper hops may be null (runtime lookup tolerated it)
            out += ('.' if (base == self.root and i == 0) else '?.') + p
        return out

    def interp(self, raw):
        """String with holes -> JS template literal (or plain expression when the whole value is one hole)."""
        m = WHOLE.match(raw)
        if m:
            return self.expr(m.group(1)), True
        parts, last = [], 0
        for h in HOLE.finditer(raw):
            parts.append(raw[last:h.start()].replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${'))
            parts.append('${s(' + self.expr(h.group(1)) + ')}')
            last = h.end()
        parts.append(raw[last:].replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${'))
        return '`' + ''.join(parts) + '`', False

    # ---- style
    def style(self, raw):
        if '{{' in raw:
            e, whole = self.interp(raw)
            return '{sx(' + (('s(' + e + ')') if whole else e) + ')}'
        obj = []
        for d in split_decls(raw):
            if ':' not in d:
                continue
            k, val = d.split(':', 1)
            key = k.strip()
            obj.append('%s: %s' % (json.dumps(key) if key.startswith('--') else camel(key), json.dumps(val.strip())))
        return '{{ ' + ', '.join(obj) + ' }}'

    # ---- Tailwind: static declarations become utility classes, runtime values stay inline
    def style_split(self, raw):
        segs = split_decls(raw)
        static, dyn = [], []
        for seg in segs:
            if '{{' in seg:
                dyn.append(seg)
            elif ':' in seg:
                if any(':' not in d.split('{{')[0] for d in dyn):
                    return [], raw  # a whole-style hole before this declaration could override it
                static.append(seg)
        named = {d.split(':', 1)[0].strip() for d in dyn if ':' in d and '{{' not in d.split(':', 1)[0]}
        decls = [(d.split(':', 1)[0].strip(), d.split(':', 1)[1].strip()) for d in static]
        if any(k in named for k, _ in decls):
            return [], raw
        classes = css2tw.to_classes(decls) if decls else []
        if classes is None:
            return [], raw
        return classes, '; '.join(dyn)

    @staticmethod
    def merge_class(raw_class, extra, conv):
        extra_s = ' '.join(extra)
        if raw_class is None:
            return 'className=%s' % json.dumps(extra_s)
        if '{{' not in raw_class:
            return 'className=%s' % json.dumps((raw_class + ' ' + extra_s).strip())
        e, whole = conv.interp(raw_class)
        if whole:
            return 'className={`${s(%s)} %s`}' % (e, extra_s)
        return 'className={%s}' % (e[:-1] + ' ' + extra_s + '`')

    # ---- attributes
    def attrs(self, tag, el, no_tr, svg):
        out = []
        events = {}
        extra_cls = []
        rest_style = None
        if 'style' in el.attrib:
            extra_cls, rest_style = self.style_split(el.attrib['style'])
        for name, raw in el.attrib.items():
            if name == 'class' and extra_cls:
                out.append(self.merge_class(raw, extra_cls, self))
                continue
            if name.startswith('hint-') or name == 'xmlns':
                continue
            if name.startswith('on') and len(name) > 2 and name[2].isupper():
                m = WHOLE.match(raw)
                ev = name
                if ev == 'onInput' and tag in ('input', 'textarea'):
                    ev = 'onChange'
                if name == 'onChange' and tag in ('input', 'textarea') and el.attrib.get('type') not in ('checkbox', 'radio') and 'onInput' in el.attrib:
                    ev = 'onBlur'  # native change on text = commit
                fn = self.expr(m.group(1)) if m else 'undefined'
                events[ev] = 'clk(%s)' % fn if ev == 'onClick' else fn
                continue
            if name == 'style':
                if rest_style:
                    out.append('style=' + self.style(rest_style))
                continue
            if not svg and name in ('checked', 'disabled', 'selected'):
                m = WHOLE.match(raw)
                if m:
                    out.append('%s={b(%s)}' % (name, self.expr(m.group(1))))
                elif raw != 'false':
                    out.append(name)
                continue
            if not svg and name == 'value' and tag in ('input', 'select', 'textarea'):
                if '{{' in raw:
                    e, whole = self.interp(raw)
                    out.append('value={%s}' % (('s(' + e + ')') if whole else e))
                else:
                    out.append('defaultValue=%s' % json.dumps(raw) if tag != 'select' else 'value=%s' % json.dumps(raw))
                continue
            jname = ATTR_MAP.get(name, name)
            if svg and '-' in name and not name.startswith(('aria-', 'data-')):
                jname = camel(name)
            tr = (name in TRANSLATED_ATTRS) and not no_tr
            if '{{' in raw:
                e, whole = self.interp(raw)
                if tr:
                    out.append('%s={t(%s)}' % (jname, ('s(' + e + ')') if whole else e))
                else:
                    out.append('%s={a(%s)}' % (jname, e) if whole else '%s={%s}' % (jname, e))
            else:
                if tr:
                    out.append('%s={t(%s)}' % (jname, json.dumps(raw)))
                elif jname in ('tabIndex', 'rows', 'colSpan', 'rowSpan', 'maxLength', 'minLength', 'cols', 'size') and re.fullmatch(r'-?\d+', raw):
                    out.append('%s={%s}' % (jname, raw))
                else:
                    out.append('%s=%s' % (jname, json.dumps(raw)))
        if extra_cls and 'class' not in el.attrib:
            out.insert(0, self.merge_class(None, extra_cls, self))
        for k, val in events.items():
            out.append('%s={%s}' % (k, val))
        return out

    # ---- nodes
    def text(self, t, parent_tag, no_tr):
        if t is None or t == '':
            return []
        if not t.strip():
            if parent_tag in NO_WS_PARENTS:
                return []
            return ['{" "}'] if ('\n' in t or len(t) > 0) else []
        lead = ' ' if t[0].isspace() else ''
        trail = ' ' if t[-1].isspace() else ''
        body = re.sub(r'\s+', ' ', t).strip()
        res = []
        if lead and parent_tag not in NO_WS_PARENTS:
            res.append('{" "}')
        if '{{' in body:
            e, whole = self.interp(body)
            res.append('{%s}' % (('s(' + e + ')' if no_tr else 'tx(s(' + e + '))') if whole else (e if no_tr else 'tx(' + e + ')')))
        else:
            res.append('{%s}' % (json.dumps(body, ensure_ascii=False) if no_tr else 'tx(' + json.dumps(body, ensure_ascii=False) + ')'))
        if trail and parent_tag not in NO_WS_PARENTS:
            res.append('{" "}')
        return res

    def children(self, el, tag, no_tr, svg, ind):
        kids = list(el)
        st = el.attrib.get('style', '')
        flexy = bool(re.search(r'display:\s*(inline-)?(flex|grid)', st))

        def ws_ok(t, prev, nxt):
            # keep a whitespace-only run only where the browser would render it as a space
            if t is None or t == '' or t.strip():
                return True
            if flexy or tag in NO_WS_PARENTS:
                return False
            if (prev is None or nxt is None) and tag not in INLINE_PARENTS:
                return False  # leading / trailing space of a block box is never rendered
            return not ((prev is not None and self.is_block(prev)) or (nxt is not None and self.is_block(nxt)))

        out = []
        if ws_ok(el.text, None, kids[0] if kids else None):
            out += self.text(el.text, tag, no_tr or svg)
        for i, c in enumerate(kids):
            out.append(self.node(c, no_tr, svg, ind))
            nxt = kids[i + 1] if i + 1 < len(kids) else None
            if ws_ok(c.tail, c, nxt):
                out += self.text(c.tail, tag, no_tr or svg)
        return out

    BLOCK = {'div', 'section', 'aside', 'main', 'nav', 'p', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr',
             'td', 'th', 'fieldset', 'legend', 'form', 'sc-if', 'sc-for', 'option', 'select', 'textarea', 'br'}

    def is_block(self, el):
        return el.tag.split('}')[-1] in self.BLOCK

    def node(self, el, no_tr=False, svg=False, ind=0):
        tag = el.tag.replace(NS, '').split('}')[-1]
        pad = '  ' * ind
        if tag == 'sc-for':
            lst = WHOLE.match(el.attrib.get('list', '')).group(1)
            as_ = el.attrib.get('as', 'item')
            le = self.expr(lst)
            self.loops.append(as_)
            kids = self.children(el, tag, no_tr, svg, ind + 2)
            self.loops.pop()
            body = '\n'.join(pad + '    ' + k for k in kids if k.strip())
            return '{(%s || []).map((%s: any, $index: number) => (\n%s  <Fragment key={$index}>\n%s\n%s  </Fragment>\n%s))}' % (le, as_, pad, body, pad, pad)
        if tag == 'sc-if':
            cond = self.expr(WHOLE.match(el.attrib.get('value', '')).group(1))
            kids = self.children(el, tag, no_tr, svg, ind + 2)
            body = '\n'.join(pad + '    ' + k for k in kids if k.strip())
            return '{%s ? (\n%s  <>\n%s\n%s  </>\n%s) : null}' % (cond, pad, body, pad, pad)
        svg = svg or tag == 'svg'
        no_tr2 = no_tr or el.attrib.get('translate') == 'no' or tag in NO_TRANSLATE_TAGS
        jtag = tag
        attrs = self.attrs(tag, el, no_tr2, svg)
        href = el.attrib.get('href')
        if tag == 'a' and href is not None:
            jtag = 'AppLink'
        if tag == 'textarea':
            # textarea content becomes its value
            txt = (el.text or '')
            if '{{' in txt and not any(x.startswith('value=') for x in attrs):
                e, whole = self.interp(txt.strip())
                attrs.append('value={%s}' % (('s(' + e + ')') if whole else e))
            open_ = '<%s %s />' % (jtag, ' '.join(attrs)) if attrs else '<%s />' % jtag
            return open_
        kids = self.children(el, tag, no_tr2, svg, ind + 1)
        a = (' ' + ' '.join(attrs)) if attrs else ''
        if not [k for k in kids if k.strip()]:
            return '<%s%s />' % (jtag, a)
        if len(kids) == 1 and len(kids[0]) < 60 and '\n' not in kids[0]:
            return '<%s%s>%s</%s>' % (jtag, a, kids[0], jtag)
        body = '\n'.join(pad + '  ' + k for k in kids)
        return '<%s%s>\n%s\n%s</%s>' % (jtag, a, body, pad, jtag)


def parse(tpl):
    x = '<root xmlns="http://www.w3.org/1999/xhtml">' + VOID.sub(lambda m: '<' + m.group(1) + (m.group(2) or '') + '/>', tpl).replace('&nbsp;', '&#160;') + '</root>'
    return ET.fromstring(x)


def to_jsx(nodes, root_var='v'):
    c = Conv(root_var)
    parts = [c.node(n, False, False, 2) for n in nodes]
    return '\n'.join(parts)


if __name__ == '__main__':
    src = open(sys.argv[1]).read()
    print(to_jsx(list(parse(src))))
