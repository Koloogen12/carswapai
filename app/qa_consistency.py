#!/usr/bin/env python3
"""
QA: связность интерфейса.

Проверяет, на чём построен каждый экран. В приложении не должно быть двух
дизайн-языков одновременно: либо разметка из хендоффа, либо самодельные
компоненты. Смешение и выглядит как «кривое и несвязное».
"""
import re, pathlib, sys

APP = pathlib.Path('src/app')
PORTED = {'@/screens/', '@/design/'}
INVENTED = {'@/components/ui', '@/components/product', '@/components/shell'}

rows = []
for p in sorted(APP.rglob('page.tsx')):
    route = '/' + str(p.parent.relative_to(APP)).replace('(app)/', '')
    route = '/' if route == '/.' else route
    seen = set()
    stack = [p]
    while stack:
        f = stack.pop()
        if not f.exists(): continue
        src = f.read_text(encoding='utf-8')
        for m in re.finditer(r"from '(@/[^']+|\./[^']+)'", src):
            mod = m.group(1)
            seen.add(mod)
            if mod.startswith('./'):
                cand = f.parent / (mod[2:] + '.tsx')
                if cand.exists() and cand not in stack: stack.append(cand)
    ported = sum(1 for s in seen if any(s.startswith(x) for x in PORTED))
    invented = sum(1 for s in seen if any(s.startswith(x) for x in INVENTED))
    rows.append((route, ported, invented))

bad = [r for r in rows if r[2] > 0]
print(f'{"маршрут":46s} {"хендофф":>8s} {"самодел":>8s}')
for route, a, b in rows:
    mark = '  ← смешение' if b else ''
    print(f'{route:46s} {a:8d} {b:8d}{mark}')
print()
if bad:
    print(f'ПРОВАЛ: {len(bad)} из {len(rows)} экранов построены на самодельных компонентах,')
    print('        а не на перенесённой разметке. Приложение говорит двумя языками.')
    sys.exit(1)
print(f'ok · все {len(rows)} экранов на одной разметке')
