#!/usr/bin/env python3
"""
Перенос разметки из хендоффа Claude Design (.dc.html) в JSX.

Разметка переносится дословно. Меняется только то, без чего JSX не соберётся:
имена атрибутов, инлайновый style в объект, самозакрытие пустых тегов.
Пиксели, порядок свойств, селекторы и вложенность не трогаются — любая правка
здесь превращается в расхождение, которое потом ищут глазами.

В конце скрипт УТВЕРЖДАЕТ, что непереписанного не осталось: если хоть один
style= или дефисный атрибут дожил до вывода, это ошибка переноса, а не мелочь.
"""
import re, sys, json, pathlib, html as htmllib

CUSTOM = {'image-slot': 'ImageSlot'}

VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param',
        'source','track','wbr','path','circle','rect','line','polyline','polygon',
        'ellipse','stop','use'}

ATTR = {
    'class':'className','for':'htmlFor','tabindex':'tabIndex','colspan':'colSpan',
    'rowspan':'rowSpan','maxlength':'maxLength','minlength':'minLength',
    'autocomplete':'autoComplete','readonly':'readOnly','contenteditable':'contentEditable',
    'srcset':'srcSet','viewbox':'viewBox','stroke-width':'strokeWidth',
    'stroke-linecap':'strokeLinecap','stroke-linejoin':'strokeLinejoin',
    'stroke-dasharray':'strokeDasharray','stroke-dashoffset':'strokeDashoffset',
    'fill-rule':'fillRule','clip-rule':'clipRule','clip-path':'clipPath',
    'stop-color':'stopColor','stop-opacity':'stopOpacity','xlink:href':'xlinkHref',
    'playsinline':'playsInline','autoplay':'autoPlay','crossorigin':'crossOrigin',
    'preload':'preload','datetime':'dateTime','enctype':'encType','novalidate':'noValidate',
    'accept-charset':'acceptCharset','http-equiv':'httpEquiv','srclang':'srcLang',
    'cellpadding':'cellPadding','cellspacing':'cellSpacing','usemap':'useMap',
    'shape-rendering':'shapeRendering','text-anchor':'textAnchor',
    'dominant-baseline':'dominantBaseline','font-family':'fontFamily',
    'font-size':'fontSize','font-weight':'fontWeight','letter-spacing':'letterSpacing',
}
UNMAPPED: set = set()      # имена атрибутов, которым не нашлось JSX-эквивалента
SUBS: list = []            # подстановки {{ }} из циклов — требуют ручного порта
HANDLERS: list = []        # инлайновые onclick и прочие — переносятся руками

BOOL = {'mini','muted','loop','autoPlay','playsInline','controls','open','disabled','checked',
        'selected','required','readOnly','multiple','defer','async','hidden','noValidate'}

def split_decls(css: str):
    """Режет объявления по ';' в обход скобок: url(a;b) и gradient(...) не ломаются."""
    out, buf, depth, quote = [], '', 0, None
    for ch in css:
        if quote:
            buf += ch
            if ch == quote: quote = None
            continue
        if ch in '"\'': quote = ch; buf += ch; continue
        if ch == '(': depth += 1
        elif ch == ')': depth -= 1
        if ch == ';' and depth == 0:
            out.append(buf); buf = ''
        else: buf += ch
    if buf.strip(): out.append(buf)
    return out

def css_prop(name: str) -> str:
    name = name.strip()
    if name.startswith('--'): return name          # кастомные свойства как есть
    if name.startswith('-'):                        # -webkit-… → WebkitFoo
        parts = name.lstrip('-').split('-')
        return parts[0].capitalize() + ''.join(p.capitalize() for p in parts[1:])
    parts = name.split('-')
    return parts[0] + ''.join(p.capitalize() for p in parts[1:])

def style_to_obj(css: str) -> str:
    pairs = []
    for d in split_decls(css):
        if ':' not in d: continue
        k, v = d.split(':', 1)
        k, v = css_prop(k), v.strip()
        key = f"'{k}'" if (k.startswith('--') or not re.fullmatch(r'[A-Za-z][A-Za-z0-9]*', k)) else k
        pairs.append(f"{key}: {json.dumps(v, ensure_ascii=False)}")
    return '{ ' + ', '.join(pairs) + ' }'

ATTR_RE = re.compile(r'([:@\w-]+)(?:\s*=\s*("([^"]*)"|\'([^\']*)\'|([^\s>]+)))?')

SUB_RE = re.compile(r'\{\{\s*(.*?)\s*\}\}')

def mark_subs(val: str, where: str) -> str:
    def sub(m):
        SUBS.append((where, m.group(1)))
        return f'@@DC:{m.group(1)}@@'
    return SUB_RE.sub(sub, val)

def conv_attrs(raw: str) -> str:
    out = []
    for m in ATTR_RE.finditer(raw):
        name = m.group(1)
        val = m.group(3) if m.group(3) is not None else (
              m.group(4) if m.group(4) is not None else m.group(5))
        if name.startswith('xmlns'): continue
        # Подсказки авторского инструмента: тот же слой, что <x-dc> и {{ }}.
        if name.startswith('hint-placeholder'): continue
        # Инлайновые обработчики — это логика, а не разметка. Механически
        # их переносить нельзя: строка в onClick React не примет. Отмечаем
        # и называем, чтобы порт был сознательным, а не потерянным.
        if re.fullmatch(r'on[A-Za-z]+', name):
            HANDLERS.append((name, (val or '')[:60])); continue
        if val is not None and '{{' in val:
            val = mark_subs(val, name)
        if name == 'style' and val is not None:
            out.append(f'style={{{style_to_obj(val)}}}'); continue
        jsx = ATTR.get(name, ATTR.get(name.lower(), name))
        if val is None:
            out.append(f'{jsx}={{true}}' if jsx in BOOL else f'{jsx}')
            continue
        if jsx in BOOL and val in ('', jsx, name):
            out.append(f'{jsx}={{true}}'); continue
        if name.startswith('data-') or name.startswith('aria-'):
            out.append(f'{name}={json.dumps(val, ensure_ascii=False)}'); continue
        if '-' in jsx: UNMAPPED.add(name)
        out.append(f'{jsx}={json.dumps(val, ensure_ascii=False)}')
    return (' ' + ' '.join(out)) if out else ''

def unwrap_authoring(frag: str) -> str:
    """
    Разворачивает теги авторского инструмента, сохраняя их содержимое.

    README: «теги <x-dc>, <sc-if>, <sc-for>, <dc-import> переносить не нужно;
    всё, что внутри них, — обычная вёрстка и обычное состояние компонента».
    Условие не выбрасывается, а остаётся комментарием: иначе состояние экрана
    теряется молча, и потом непонятно, почему блок нарисован дважды.
    """
    def sub(m):
        tag, attrs, inner = m.group(1), m.group(2), m.group(3)
        expr = re.search(r'(?:value|each|of)\s*=\s*"\{\{\s*(.*?)\s*\}\}"', attrs)
        note = f'{{/* {tag}: {expr.group(1)} */}}' if expr else f'{{/* {tag} */}}'
        return note + inner
    prev = None
    while prev != frag:
        prev = frag
        frag = re.sub(r'<(sc-if|sc-for|dc-import)\b([^>]*)>(.*?)</\1>', sub, frag, flags=re.S)
    return frag

def to_jsx(frag: str) -> str:
    frag = re.sub(r'<!--.*?-->', '', frag, flags=re.S)
    frag = re.sub(r'assets/renders/', '/renders/', frag)
    frag = re.sub(r'(?<![\w/])assets/', '/renders/', frag)
    frag = unwrap_authoring(frag)
    out, i = [], 0
    for m in re.finditer(r'<(/?)([A-Za-z][A-Za-z0-9-]*)((?:[^<>"\']|"[^"]*"|\'[^\']*\')*?)(/?)>', frag):
        text = frag[i:m.start()]
        if text:
            t = htmllib.unescape(text)
            if '{{' in t: t = mark_subs(t, 'текст')
            t = t.replace('{', '&#123;').replace('}', '&#125;')
            out.append(t)
        i = m.end()
        close, tag, attrs, self = m.groups()
        if tag.lower() in CUSTOM:
            # Кастомный элемент всегда самозакрывается: содержимого у него нет.
            if close: continue
            out.append(f'<{CUSTOM[tag.lower()]}{conv_attrs(attrs)} />')
            continue
        if close: out.append(f'</{tag}>')
        elif tag.lower() in VOID or self: out.append(f'<{tag}{conv_attrs(attrs)} />')
        else: out.append(f'<{tag}{conv_attrs(attrs)}>')
    tail = frag[i:]
    if tail:
        t = htmllib.unescape(tail)
        if '{{' in t: t = mark_subs(t, 'текст')
        out.append(t.replace('{', '&#123;').replace('}', '&#125;'))
    return ''.join(out)

def assert_clean(jsx: str, where: str):
    """Утверждает, что после переноса не осталось ничего непереписанного."""
    bad = []
    if re.search(r'\sstyle="', jsx): bad.append('остался инлайновый style="..."')
    if 'class=' in jsx: bad.append('остался class=')
    if re.search(r'</?(x-dc|helmet|sc-if|sc-for|dc-import)\b', jsx):
        bad.append('остался тег авторского инструмента')
    if '&#123;&#123;' in jsx:
        bad.append('осталась подстановка {{ }} в тексте')
    if UNMAPPED:
        bad.append('дефисные атрибуты без JSX-эквивалента: ' + ', '.join(sorted(UNMAPPED)))
    if bad:
        raise SystemExit(f'НЕ ПЕРЕПИСАНО в {where}: ' + '; '.join(bad))

def canvas_of(path: pathlib.Path):
    s = path.read_text(encoding='utf-8')
    body = re.search(r'<x-dc>(.*)</x-dc>', s, re.S)
    if not body: raise SystemExit(f'{path.name}: нет <x-dc>')
    b = body.group(1)
    b = re.sub(r'<helmet.*?</helmet>', '', b, flags=re.S)
    return b.strip()

def canvas_style(canvas: str) -> str:
    """Собственный стиль канвы. Отбивка и gap живут на нём, а не на блоках."""
    m = re.match(r'\s*<div\b([^>]*)>', canvas)
    if not m: return ''
    st = re.search(r'style\s*=\s*"([^"]*)"', m.group(1))
    return style_to_obj(st.group(1)) if st else ''

def blocks_of(canvas: str):
    """Верхнеуровневые дети канвы: чередование блоков экранов и подписей-связок."""
    root = re.search(r'^<div\b[^>]*>(.*)</div>\s*$', canvas, re.S)
    inner = root.group(1) if root else canvas
    depth, kids, start = 0, [], None
    for m in re.finditer(r'<(/?)([A-Za-z][A-Za-z0-9-]*)((?:[^<>"\']|"[^"]*"|\'[^\']*\')*?)(/?)>', inner):
        close, tag, _, self = m.groups()
        if tag.lower() in VOID or self: continue
        if close:
            depth -= 1
            if depth == 0: kids.append(inner[start:m.end()])
        else:
            if depth == 0: start = m.start()
            depth += 1
    return kids

if __name__ == '__main__':
    src = pathlib.Path(sys.argv[1])
    canvas = canvas_of(src)
    blocks = blocks_of(canvas)
    jsx_blocks = []
    for n, b in enumerate(blocks):
        j = to_jsx(b)
        assert_clean(j, f'{src.name} блок {n}')
        jsx_blocks.append(j)
    note = ''
    if SUBS:
        uniq = sorted({e for _, e in SUBS})
        note = (f'  ⚠ ручной порт: {len(SUBS)} подстановок — '
                + ', '.join(uniq[:5]) + ('…' if len(uniq) > 5 else ''))
    if HANDLERS:
        note += f'; {len(HANDLERS)} инлайновых обработчиков'
    print(f'{src.name}: блоков {len(blocks)}, символов JSX '
          f'{sum(len(j) for j in jsx_blocks)}{note}')
    if len(sys.argv) > 2:
        pathlib.Path(sys.argv[2]).write_text(json.dumps(
            {'canvas': canvas_style(canvas), 'blocks': jsx_blocks},
            ensure_ascii=False), encoding='utf-8')
