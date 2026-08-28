#!/usr/bin/env python3
"""
Вытаскивает подразметку одного экрана из перенесённого блока.

Блок в хендоффе устроен как «подпись сценария + рамка экрана». В продукт идёт
только рамка: подписи — это оформление канвы, а не интерфейс.
"""
import json, re, sys, pathlib

VOID = {'br','img','input','meta','link','path','circle','rect','line','polyline',
        'polygon','ellipse','use','stop','source','ImageSlot'}

def children(jsx: str):
    """Верхнеуровневые дети фрагмента с их границами."""
    depth, kids, start = 0, [], None
    for m in re.finditer(r'<(/?)([A-Za-z][A-Za-z0-9-]*)((?:[^<>"\']|"[^"]*"|\'[^\']*\')*?)(/?)>', jsx):
        close, tag, _, self = m.groups()
        if tag in VOID or self: continue
        if close:
            depth -= 1
            if depth == 0: kids.append((start, m.end()))
        else:
            if depth == 0: start = m.start()
            depth += 1
    return [jsx[a:b] for a, b in kids]

def inner(jsx: str) -> str:
    m = re.match(r'\s*<[A-Za-z][A-Za-z0-9-]*(?:[^<>"\']|"[^"]*"|\'[^\']*\')*?>', jsx)
    return jsx[m.end():jsx.rfind('</')] if m else jsx

if __name__ == '__main__':
    src, block, path = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
    data = json.loads(pathlib.Path(f'tools/out/{src}.json').read_text(encoding='utf-8'))
    node = data['blocks'][block]
    for step in path:
        node = children(inner(node))[int(step)]
    print(node)
