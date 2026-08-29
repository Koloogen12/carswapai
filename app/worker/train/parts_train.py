"""
Дообучение сегментации частей автомобиля.

ЛИЦЕНЗИЯ — причина, по которой здесь torchvision, а не ultralytics.
Ultralytics распространяется по AGPL-3.0: она обязывает открыть исходники
сервиса, доступного по сети, и авторы считают производными в том числе веса,
обученные их кодом. Для коммерческой SaaS это неприемлемо, а их коммерческая
лицензия — отдельные деньги. torchvision под BSD-3 такого не требует.
Побочная выгода: архитектура та же, что уже стоит на силуэте, и в боевой
образ не приезжает вторая библиотека.

ЧТО ОБУЧАЕМ. Backbone заморожен: COCO уже знает автомобили, и переучивать
признаки на трёх тысячах кадров — только портить. Учим головы детекции и
масок на 23 класса. Это на порядок быстрее и устойчивее к переобучению.

ДАННЫЕ. carparts-seg, разметка полигонами в формате YOLO. Боковых стёкол в
разметке нет — есть лобовое и заднее. Это не мешает: стекло мы получаем как
остаток силуэта после крашеных панелей, колёс, фар и зеркал, и такой остаток
как раз включает боковые окна.
"""
from __future__ import annotations

import argparse
import pathlib
import sys
import time

import numpy as np
import torch
import torch.utils.data
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
NAMES = ['back_bumper', 'back_door', 'back_glass', 'back_left_door', 'back_left_light',
         'back_light', 'back_right_door', 'back_right_light', 'front_bumper',
         'front_door', 'front_glass', 'front_left_door', 'front_left_light',
         'front_light', 'front_right_door', 'front_right_light', 'hood',
         'left_mirror', 'object', 'right_mirror', 'tailgate', 'trunk', 'wheel']
NUM_CLASSES = len(NAMES) + 1          # +1 — фон, его требует Mask R-CNN


class CarParts(torch.utils.data.Dataset):
    def __init__(self, root: pathlib.Path, split: str, size: int = 640):
        self.imgs = sorted((root / 'images' / split).glob('*.jpg'))
        self.lbls = root / 'labels' / split
        self.size = size

    def __len__(self):
        return len(self.imgs)

    def __getitem__(self, i):
        ip = self.imgs[i]
        img = Image.open(ip).convert('RGB')
        w0, h0 = img.size
        s = self.size / max(w0, h0)
        w, h = max(int(w0 * s), 1), max(int(h0 * s), 1)
        img = img.resize((w, h), Image.BILINEAR)

        boxes, labels, masks = [], [], []
        lp = self.lbls / (ip.stem + '.txt')
        for line in (lp.read_text().splitlines() if lp.exists() else []):
            p = line.split()
            if len(p) < 7:                      # полигон меньше трёх точек — не фигура
                continue
            cls = int(p[0])
            xy = np.asarray(p[1:], dtype=np.float32)
            xy = xy[: len(xy) // 2 * 2].reshape(-1, 2) * np.array([w, h], np.float32)
            x0, y0 = xy.min(0)
            x1, y1 = xy.max(0)
            if x1 - x0 < 2 or y1 - y0 < 2:      # вырожденная рамка обрушит обучение
                continue
            m = Image.new('L', (w, h), 0)
            ImageDraw.Draw(m).polygon([tuple(v) for v in xy], fill=1)
            masks.append(np.asarray(m, dtype=np.uint8))
            boxes.append([x0, y0, x1, y1])
            labels.append(cls + 1)              # 0 занят фоном

        t = torch.from_numpy(np.asarray(img)).permute(2, 0, 1).float() / 255.0
        if not boxes:
            target = {'boxes': torch.zeros((0, 4), dtype=torch.float32),
                      'labels': torch.zeros((0,), dtype=torch.int64),
                      'masks': torch.zeros((0, h, w), dtype=torch.uint8),
                      'image_id': torch.tensor([i])}
        else:
            target = {'boxes': torch.as_tensor(boxes, dtype=torch.float32),
                      'labels': torch.as_tensor(labels, dtype=torch.int64),
                      'masks': torch.as_tensor(np.stack(masks)),
                      'image_id': torch.tensor([i])}
        return t, target


def collate(batch):
    return tuple(zip(*batch))


def build():
    from torchvision.models.detection import (
        maskrcnn_resnet50_fpn_v2, MaskRCNN_ResNet50_FPN_V2_Weights)
    from torchvision.models.detection.faster_rcnn import FastRCNNPredictor
    from torchvision.models.detection.mask_rcnn import MaskRCNNPredictor

    m = maskrcnn_resnet50_fpn_v2(weights=MaskRCNN_ResNet50_FPN_V2_Weights.DEFAULT)
    inf = m.roi_heads.box_predictor.cls_score.in_features
    m.roi_heads.box_predictor = FastRCNNPredictor(inf, NUM_CLASSES)
    inm = m.roi_heads.mask_predictor.conv5_mask.in_channels
    m.roi_heads.mask_predictor = MaskRCNNPredictor(inm, 256, NUM_CLASSES)

    for p in m.backbone.body.parameters():      # признаки COCO оставляем как есть
        p.requires_grad = False
    return m


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--epochs', type=int, default=8)
    ap.add_argument('--batch', type=int, default=4)
    ap.add_argument('--size', type=int, default=640)
    ap.add_argument('--limit', type=int, default=0, help='обрезать выборку — для дымового прогона')
    ap.add_argument('--device', default='mps')
    ap.add_argument('--out', default=str(ROOT / 'models' / 'carparts.pt'))
    a = ap.parse_args()

    root = ROOT / 'datasets' / 'carparts-seg'
    tr = CarParts(root, 'train', a.size)
    va = CarParts(root, 'val', a.size)
    if a.limit:
        tr.imgs = tr.imgs[: a.limit]
        va.imgs = va.imgs[: max(a.limit // 8, 2)]
    print(f'обучение: {len(tr)} кадров, валидация: {len(va)}', flush=True)

    dl = torch.utils.data.DataLoader(tr, batch_size=a.batch, shuffle=True,
                                     collate_fn=collate, num_workers=0)
    dv = torch.utils.data.DataLoader(va, batch_size=a.batch, shuffle=False,
                                     collate_fn=collate, num_workers=0)

    dev = torch.device(a.device)
    m = build().to(dev)
    params = [p for p in m.parameters() if p.requires_grad]
    opt = torch.optim.AdamW(params, lr=1e-4, weight_decay=1e-4)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=a.epochs * len(dl))

    best = float('inf')
    pathlib.Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    for ep in range(1, a.epochs + 1):
        m.train()
        t0, run, n = time.time(), 0.0, 0
        for i, (imgs, tgts) in enumerate(dl, 1):
            imgs = [x.to(dev) for x in imgs]
            tgts = [{k: v.to(dev) for k, v in t.items()} for t in tgts]
            if all(t['boxes'].numel() == 0 for t in tgts):
                continue
            loss = sum(build_loss for build_loss in m(imgs, tgts).values())
            opt.zero_grad(set_to_none=True)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(params, 10.0)
            opt.step()
            sched.step()
            run += float(loss); n += 1
            if i % 50 == 0:
                print(f'  эпоха {ep} · {i}/{len(dl)} · потеря {run / max(n,1):.3f} '
                      f'· {(time.time()-t0)/i:.2f} с/шаг', flush=True)

        # Валидация: Mask R-CNN считает потери только в train-режиме, поэтому
        # веса не обновляем, но режим оставляем — иначе цифры несравнимы.
        vl, vn = 0.0, 0
        with torch.no_grad():
            for imgs, tgts in dv:
                imgs = [x.to(dev) for x in imgs]
                tgts = [{k: v.to(dev) for k, v in t.items()} for t in tgts]
                if all(t['boxes'].numel() == 0 for t in tgts):
                    continue
                vl += float(sum(m(imgs, tgts).values())); vn += 1
        vl /= max(vn, 1)
        mark = ''
        if vl < best:
            best = vl
            torch.save({'model': m.state_dict(), 'names': NAMES, 'size': a.size}, a.out)
            mark = '  ← сохранено'
        print(f'эпоха {ep}/{a.epochs}: обучение {run/max(n,1):.3f} · '
              f'валидация {vl:.3f} · {time.time()-t0:.0f} с{mark}', flush=True)
    print(f'готово, лучшая валидация {best:.3f} → {a.out}', flush=True)


if __name__ == '__main__':
    sys.exit(main())
