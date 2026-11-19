#!/usr/bin/env python3
"""CSS declarations -> Tailwind CSS v4 utility classes (exact values, no rounding).

to_classes([('display', 'flex'), ('gap', '12px')]) -> ['flex', 'gap-3']
Returns None when the declarations cannot be expressed safely as independent utilities
(for example a shorthand and a longhand for the same side), so the caller keeps them as CSS.
"""
import re

TOKENS = set()  # GIRS colour tokens (filled by load_tokens)


def load_tokens(names):
    TOKENS.update(names)


SIDES = ['top', 'right', 'bottom', 'left']


def arb(v):
    """Value for an arbitrary [..] class: spaces become underscores."""
    v = v.strip().replace('_', '\\_')
    return re.sub(r'\s+', '_', v)


def prop_class(p, v):
    return '[%s:%s]' % (p, arb(v))


def num(n):
    s = ('%f' % n).rstrip('0').rstrip('.')
    return s


def space(v, allow_auto=True, frac=True):
    """Spacing / sizing value -> Tailwind suffix (without sign handling)."""
    v = v.strip()
    if v in ('0', '0px'):
        return '0'
    if v == 'auto' and allow_auto:
        return 'auto'
    if v == '100%' and frac:
        return 'full'
    if v == '50%' and frac:
        return '1/2'
    if v == '1px':
        return 'px'
    m = re.fullmatch(r'(\d+(?:\.\d+)?)px', v)
    if m:
        n = float(m.group(1))
        q = n / 4
        if abs(q * 4 - round(q * 4)) < 1e-9:  # multiple of 0.25
            return num(q)
    return '[' + arb(v) + ']'


def signed(prefix, v, **kw):
    v = v.strip()
    neg = v.startswith('-') and v != '-'
    s = space(v[1:] if neg else v, **kw)
    return ('-' if neg else '') + prefix + '-' + s


def color(v):
    v = v.strip()
    m = re.fullmatch(r'var\(--([a-z0-9]+)\)', v)
    if m and m.group(1) in TOKENS:
        return m.group(1)
    if v in ('transparent', 'currentColor', 'currentcolor', 'inherit'):
        return {'currentcolor': 'current', 'currentColor': 'current'}.get(v, v)
    if v in ('#fff', '#ffffff', 'white'):
        return 'white'
    return '[' + arb(v) + ']'


def border_parts(v):
    """'1px solid var(--line)' -> (width, style, color)."""
    v = v.strip()
    if v in ('0', 'none', '0px'):
        return ('0', None, None)
    w = s = c = None
    for part in re.findall(r'var\([^)]*\)|rgba?\([^)]*\)|\S+', v):
        if re.fullmatch(r'\d+(\.\d+)?px|0', part):
            w = part
        elif part in ('solid', 'dashed', 'dotted', 'double', 'none'):
            s = part
        else:
            c = part
    return (w, s, c)


def expand(decls):
    """Shorthands -> longhands. Returns ordered dict-like list or None on conflicts."""
    out = {}
    order = []

    def put(k, v):
        if k in out:
            raise ValueError('dup ' + k)
        out[k] = v
        order.append(k)

    try:
        for p, v in decls:
            p = p.strip().lower()
            v = v.strip()
            if p in ('padding', 'margin'):
                vals = v.split()
                if len(vals) == 1:
                    vals = vals * 4
                elif len(vals) == 2:
                    vals = [vals[0], vals[1], vals[0], vals[1]]
                elif len(vals) == 3:
                    vals = [vals[0], vals[1], vals[2], vals[1]]
                for side, val in zip(SIDES, vals):
                    put('%s-%s' % (p, side), val)
            elif p in ('padding-inline', 'margin-inline', 'padding-block', 'margin-block'):
                vals = v.split()
                a, b = (vals[0], vals[1] if len(vals) > 1 else vals[0])
                base, axis = p.split('-')
                if axis == 'inline':
                    put('%s-inline-start' % base, a)
                    put('%s-inline-end' % base, b)
                else:
                    put('%s-top' % base, a)
                    put('%s-bottom' % base, b)
            elif p == 'inset':
                vals = v.split()
                if len(vals) != 1:
                    return None
                for side in SIDES:
                    put(side, vals[0])
            elif p == 'gap':
                vals = v.split()
                put('row-gap', vals[0])
                put('column-gap', vals[1] if len(vals) > 1 else vals[0])
            elif p == 'background' and re.fullmatch(r'var\(--[a-z0-9]+\)|#[0-9a-fA-F]{3,8}|transparent|white|rgba?\([^)]*\)', v):
                put('background-color', v)
            else:
                put(p, v)
    except ValueError:
        return None
    # physical vs logical on the same axis is order-dependent: keep as CSS
    for base in ('padding', 'margin'):
        phys = any('%s-%s' % (base, s) in out for s in ('left', 'right'))
        logi = any('%s-inline-%s' % (base, s) in out for s in ('start', 'end'))
        if phys and logi:
            return None
    if any(k.startswith('border') and k != 'border-radius' for k in out) and 'border' in out and len([k for k in out if k.startswith('border') and k != 'border-radius']) > 1:
        return None
    return [(k, out[k]) for k in order]


DISPLAY = {'flex': 'flex', 'grid': 'grid', 'inline-flex': 'inline-flex', 'inline-grid': 'inline-grid', 'block': 'block',
           'inline-block': 'inline-block', 'inline': 'inline', 'none': 'hidden', 'contents': 'contents', 'table': 'table',
           '-webkit-box': '[display:-webkit-box]'}
ALIGN = {'center': 'center', 'flex-start': 'start', 'start': 'start', 'flex-end': 'end', 'end': 'end', 'baseline': 'baseline', 'stretch': 'stretch'}
JUSTIFY = {'center': 'center', 'space-between': 'between', 'space-around': 'around', 'space-evenly': 'evenly', 'flex-start': 'start',
           'start': 'start', 'flex-end': 'end', 'end': 'end', 'stretch': 'stretch'}
WEIGHT = {'400': 'normal', '500': 'medium', '600': 'semibold', '700': 'bold', 'normal': 'normal', 'bold': 'bold', '300': 'light'}


def one(p, v):
    """Single longhand -> list of classes."""
    V = v.strip()
    if V.endswith('!important') or p.startswith('-') or p in ('all', 'font', 'content', 'appearance') or re.search(r"['\"]", V):
        return None
    pad = {'padding-top': 'pt', 'padding-right': 'pr', 'padding-bottom': 'pb', 'padding-left': 'pl',
           'padding-inline-start': 'ps', 'padding-inline-end': 'pe',
           'margin-top': 'mt', 'margin-right': 'mr', 'margin-bottom': 'mb', 'margin-left': 'ml',
           'margin-inline-start': 'ms', 'margin-inline-end': 'me'}
    if p in pad:
        return [signed(pad[p], V, frac=False)]
    size = {'width': 'w', 'height': 'h', 'min-width': 'min-w', 'min-height': 'min-h', 'max-width': 'max-w', 'max-height': 'max-h'}
    if p in size:
        if V in ('fit-content', 'max-content', 'min-content'):
            return ['%s-%s' % (size[p], V.split('-')[0])]
        if V == 'none' and p.startswith('max'):
            return ['%s-none' % size[p]]
        return ['%s-%s' % (size[p], space(V))]
    pos = {'top': 'top', 'right': 'right', 'bottom': 'bottom', 'left': 'left', 'inset-inline-start': 'start', 'inset-inline-end': 'end'}
    if p in pos:
        return [signed(pos[p], V)]
    if p == 'row-gap':
        return ['gap-y-' + space(V, frac=False)]
    if p == 'column-gap':
        return ['gap-x-' + space(V, frac=False)]
    if p == 'display' and V in DISPLAY:
        return [DISPLAY[V]]
    if p == 'flex-direction':
        return {'column': ['flex-col'], 'row': ['flex-row'], 'column-reverse': ['flex-col-reverse'], 'row-reverse': ['flex-row-reverse']}.get(V)
    if p == 'flex-wrap':
        return {'wrap': ['flex-wrap'], 'nowrap': ['flex-nowrap']}.get(V)
    if p == 'flex':
        return [{'none': 'flex-none', '1 1 auto': 'flex-auto', '1': 'flex-1', '0 1 auto': 'flex-initial'}.get(V, 'flex-[' + arb(V) + ']')]
    if p == 'flex-shrink':
        return ['shrink-0' if V == '0' else 'shrink']
    if p == 'flex-grow':
        return ['grow-0' if V == '0' else 'grow']
    if p == 'align-items' and V in ALIGN:
        return ['items-' + ALIGN[V]]
    if p == 'align-self' and V in ALIGN:
        return ['self-' + ALIGN[V]]
    if p == 'justify-content' and V in JUSTIFY:
        return ['justify-' + JUSTIFY[V]]
    if p == 'position' and V in ('relative', 'absolute', 'fixed', 'sticky', 'static'):
        return [V]
    if p == 'z-index' and re.fullmatch(r'-?\d+', V):
        return [('-' if V.startswith('-') else '') + 'z-' + V.lstrip('-')]
    if p in ('overflow', 'overflow-x', 'overflow-y') and V in ('auto', 'hidden', 'visible', 'scroll', 'clip'):
        return [p + '-' + V]
    if p == 'white-space':
        return [{'nowrap': 'whitespace-nowrap', 'normal': 'whitespace-normal', 'pre-wrap': 'whitespace-pre-wrap', 'pre': 'whitespace-pre', 'pre-line': 'whitespace-pre-line'}.get(V, prop_class(p, V))]
    if p == 'text-overflow':
        return [{'ellipsis': 'text-ellipsis', 'clip': 'text-clip'}.get(V, prop_class(p, V))]
    if p == 'text-align':
        return ['text-' + {'right': 'right', 'left': 'left', 'center': 'center', 'start': 'start', 'end': 'end', 'justify': 'justify'}[V]] if V in ('right', 'left', 'center', 'start', 'end', 'justify') else None
    if p == 'vertical-align' and V in ('middle', 'top', 'bottom', 'baseline', 'text-top', 'text-bottom', 'sub', 'super'):
        return ['align-' + V]
    if p == 'font-size':
        return ['text-[' + arb(V) + ']'] if re.fullmatch(r'[\d.]+(px|em|rem)', V) else [prop_class(p, V)]
    if p == 'font-weight' and V in WEIGHT:
        return ['font-' + WEIGHT[V]]
    if p == 'line-height':
        return ['leading-none'] if V == '1' else ['leading-[' + arb(V) + ']']
    if p == 'letter-spacing':
        return ['tracking-[' + arb(V) + ']']
    if p == 'text-transform':
        return [{'uppercase': 'uppercase', 'lowercase': 'lowercase', 'capitalize': 'capitalize', 'none': 'normal-case'}.get(V, prop_class(p, V))]
    if p == 'font-style' and V in ('italic', 'normal'):
        return ['italic' if V == 'italic' else 'not-italic']
    if p == 'font-family':
        if V.startswith("'IBM Plex Sans'") or V.startswith('"IBM Plex Sans"'):
            return ['font-sans']
        if 'IBM Plex Mono' in V:
            return ['font-mono']
        return [prop_class(p, V)]
    if p == 'font-variant-numeric' and V == 'tabular-nums':
        return ['tabular-nums']
    if p == 'color':
        return ['text-' + color(V)]
    if p == 'background-color':
        return ['bg-' + color(V)]
    if p == 'border-radius':
        if V == '50%' or V == '999px' or V == '9999px':
            return ['rounded-full']
        if V in ('0', '0px'):
            return ['rounded-none']
        if len(V.split()) == 1:
            return ['rounded-[' + arb(V) + ']']
        return [prop_class(p, V)]
    side = {'border': '', 'border-top': '-t', 'border-bottom': '-b', 'border-left': '-l', 'border-right': '-r',
            'border-inline-start': '-s', 'border-inline-end': '-e', 'border-block': '-y', 'border-inline': '-x'}
    if p in side:
        w, st, c = border_parts(V)
        sfx = side[p]
        if w == '0':
            return ['border%s-0' % sfx]
        out = []
        out.append('border' + sfx if w in (None, '1px') else 'border%s-[%s]' % (sfx, w))
        if st and st != 'solid':
            if sfx:
                return None  # per-side styles are not utilities
            out.append('border-' + st)
        if c:
            out.append('border%s-%s' % (sfx, color(c)))
        return out
    if p == 'border-color':
        return ['border-' + color(V)] if len(V.split()) == 1 or V.startswith('var(') else [prop_class(p, V)]
    if p == 'border-width':
        return ['border' if V == '1px' else 'border-[' + arb(V) + ']'] if len(V.split()) == 1 else [prop_class(p, V)]
    if p == 'border-style' and V in ('solid', 'dashed', 'dotted', 'none'):
        return ['border-' + V]
    if p == 'box-sizing':
        return ['box-border' if V == 'border-box' else 'box-content']
    if p == 'box-shadow':
        return ['shadow-none'] if V == 'none' else ['shadow-[' + arb(V) + ']']
    if p == 'cursor':
        return ['cursor-' + V] if re.fullmatch(r'[a-z-]+', V) else [prop_class(p, V)]
    if p == 'pointer-events' and V in ('none', 'auto'):
        return ['pointer-events-' + V]
    if p == 'opacity':
        try:
            f = float(V)
            pct = f * 100
            return ['opacity-' + num(pct)] if abs(pct - round(pct)) < 1e-9 else ['opacity-[' + V + ']']
        except ValueError:
            return [prop_class(p, V)]
    if p == 'object-fit' and V in ('cover', 'contain', 'fill', 'none'):
        return ['object-' + V]
    if p == 'object-position':
        return [{'left center': 'object-left', 'center': 'object-center', 'top': 'object-top'}.get(V, 'object-[' + arb(V) + ']')]
    if p == 'grid-template-columns':
        return ['grid-cols-[' + arb(V) + ']']
    if p == 'grid-column':
        return ['col-[' + arb(V) + ']']
    if p == 'text-decoration':
        return [{'none': 'no-underline', 'underline': 'underline'}.get(V, prop_class(p, V))]
    if p == 'list-style':
        return ['list-none'] if V == 'none' else [prop_class(p, V)]
    if p == 'resize' and V in ('none', 'vertical', 'horizontal', 'both'):
        return ['resize-none' if V == 'none' else ('resize-y' if V == 'vertical' else 'resize-x' if V == 'horizontal' else 'resize')]
    if p == 'outline' and V in ('none', '0'):
        return ['outline-none']
    if p == 'word-break' and V == 'break-word':
        return [prop_class(p, V)]
    if p == 'order' and re.fullmatch(r'-?\d+', V):
        return ['order-' + V]
    return [prop_class(p, V)]


def to_classes(decls):
    """List of (property, value) -> list of classes, or None if it must stay CSS."""
    ex = expand(decls)
    if ex is None:
        return None
    d = dict(ex)
    out = []
    # padding / margin grouping
    for base, pre in (('padding', 'p'), ('margin', 'm')):
        t, r, b_, l = (d.get('%s-%s' % (base, s)) for s in SIDES)
        sides = [t, r, b_, l]
        if all(x is not None for x in sides):
            for s_ in SIDES:
                d.pop('%s-%s' % (base, s_))
            if t == r == b_ == l:
                out.append(signed(pre, t, frac=False))
            else:
                if t == b_:
                    out.append(signed(pre + 'y', t, frac=False))
                else:
                    out += [signed(pre + 't', t, frac=False), signed(pre + 'b', b_, frac=False)]
                if l == r:
                    out.append(signed(pre + 'x', l, frac=False))
                else:
                    out += [signed(pre + 'r', r, frac=False), signed(pre + 'l', l, frac=False)]
        s_, e_ = d.get('%s-inline-start' % base), d.get('%s-inline-end' % base)
        if s_ is not None and s_ == e_:
            d.pop('%s-inline-start' % base)
            d.pop('%s-inline-end' % base)
            out.append(signed(pre + 'x', s_, frac=False))
    if all(d.get(s) is not None for s in SIDES) and len({d[s] for s in SIDES}) == 1:
        v = d[SIDES[0]]
        for s in SIDES:
            d.pop(s)
        out.append(signed('inset', v))
    if 'row-gap' in d and 'column-gap' in d and d['row-gap'] == d['column-gap']:
        out.append('gap-' + space(d.pop('row-gap'), frac=False))
        d.pop('column-gap')
    for p, v in ex:
        if p not in d:
            continue
        c = one(p, d[p])
        if c is None:
            return None
        out += c
    # two utilities that set the same property would depend on Tailwind's ordering
    if len(out) != len(set(out)):
        return None
    return out
