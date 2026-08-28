#!/usr/bin/env python3
"""Находит рамки экранов в перенесённом блоке: узлы с фиксированной шириной."""
import json, re, sys, pathlib
sys.path.insert(0, 'tools')
from extract_screen import children, inner

def walk(node, depth=0, path=()):
    m = re.match(r'<div style=\{\{([^}]*)\}\}', node)
    if m:
        st = m.group(1)
        w = re.search(r'width: "(\d+)px"', st)
        if w and int(w.group(1)) >= 320:
            txt = ' '.join(re.sub(r'<[^>]+>', ' ', node).split())[:72]
            print(f'{"  "*depth}путь {".".join(map(str,path)) or "—"}  w={w.group(1)}  '
                  f'len={len(node)}  {txt}')
            return
    if depth > 5: return
    for i, c in enumerate(children(inner(node))):
        walk(c, depth + 1, path + (i,))

if __name__ == '__main__':
    d = json.loads(pathlib.Path(f'tools/out/{sys.argv[1]}.json').read_text(encoding='utf-8'))
    walk(d['blocks'][int(sys.argv[2])])
