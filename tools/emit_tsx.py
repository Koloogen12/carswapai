#!/usr/bin/env python3
"""Раскладывает перенесённые блоки в .tsx: по одному файлу на экранный файл хендоффа."""
import json, pathlib, re, sys

SRC = pathlib.Path('tools/out')
DST = pathlib.Path('app/src/design/ported')
DST.mkdir(parents=True, exist_ok=True)

HEADER = """/* СГЕНЕРИРОВАНО tools/port_dc.py из design/design/{src}.dc.html — не править руками.
 * Разметка перенесена дословно: пиксели, порядок свойств и вложенность из хендоффа.
 * Правки вносятся в источник и повторным прогоном конвертера.
 */
/* eslint-disable @next/next/no-img-element, react/no-unknown-property */
import type {{ ReactElement }} from 'react';
import {{ ImageSlot }} from '../ImageSlot';

"""

def ident(name: str) -> str:
    p = re.sub(r'[^a-zA-Z0-9]+', ' ', name).title().replace(' ', '')
    return 'S' + p if p[:1].isdigit() else p

total_files = total_blocks = 0
index = []
for f in sorted(SRC.glob('*.json')):
    name = f.stem
    data = json.loads(f.read_text(encoding='utf-8'))
    blocks, canvas = data['blocks'], data['canvas']
    comp = ident(name)
    body = HEADER.format(src=name)
    names = []
    for i, b in enumerate(blocks):
        fn = f'{comp}Block{i}'
        names.append(fn)
        body += f'export function {fn}(): ReactElement {{\n  return (\n    <>{b}</>\n  );\n}}\n\n'
    body += f'export const {comp}Blocks = [{", ".join(names)}];\n'
    body += f'export const {comp}Canvas = {canvas or "{}"} as React.CSSProperties;\n'
    (DST / f'{name}.tsx').write_text(body, encoding='utf-8')
    index.append((name, comp, len(blocks)))
    total_files += 1; total_blocks += len(blocks)

reg = ["/* СГЕНЕРИРОВАНО tools/emit_tsx.py — реестр перенесённых экранов. */"]
for name, comp, n in index:
    reg.append(f"import {{ {comp}Blocks, {comp}Canvas }} from './{name}';")
reg.append('\nexport const PORTED: Record<string, React.FC[]> = {')
for name, comp, n in index:
    reg.append(f"  {json.dumps(name)}: {comp}Blocks,")
reg.append('};\n')
reg.append('export const CANVAS: Record<string, React.CSSProperties> = {')
for name, comp, n in index:
    reg.append(f"  {json.dumps(name)}: {comp}Canvas,")
reg.append('};\n')
(DST / 'index.ts').write_text('\n'.join(reg), encoding='utf-8')
print(f'файлов {total_files}, блоков {total_blocks}')
