#!/usr/bin/env python3
"""Печатает перенесённый блок с отступами, чтобы разметку можно было читать глазами."""
import json, re, sys, pathlib
data = json.loads(pathlib.Path(f'tools/out/{sys.argv[1]}.json').read_text(encoding='utf-8'))
jsx = data['blocks'][int(sys.argv[2])]
depth = 0; out = []
for tok in re.split(r'(<[^>]*>)', jsx):
    if not tok.strip(): continue
    if tok.startswith('</'):
        depth -= 1; out.append('  ' * depth + tok)
    elif tok.startswith('<') and tok.endswith('/>'):
        out.append('  ' * depth + tok)
    elif tok.startswith('<'):
        out.append('  ' * depth + tok); depth += 1
    else:
        out.append('  ' * depth + '· ' + tok.strip()[:120])
lo = int(sys.argv[3]) if len(sys.argv) > 3 else 0
hi = int(sys.argv[4]) if len(sys.argv) > 4 else 60
for l in out[lo:hi]:
    print(l[:190])
print(f'... всего строк: {len(out)}')
