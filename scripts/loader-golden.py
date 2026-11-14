"""The /hero start loader's golden-half images (public/assets/loader/bulged/g-*.webp).

Each source (ref/loader-sources) is aligned so its golden spiral lands on one fixed spiral — an upright
golden rectangle, big square on top, the eye low on the right — then bulged, in one resampling pass.

  frame      the reel's frame at 2x: 253 x 400 px (131.56 x 208 CSS px); the rectangle 237.33 x 384 at
             (8, 8); the spiral's eye at (179.74, 285.87) — 71.04% / 71.47% of the frame
  extension  the golden half zooms from 0.88 to 1 about that eye (start-loader.css), so each image
             covers the frame scaled up 1/0.88 about the eye: 288 x 455 px, the frame at (24.51, 38.98)
             inside it (CSS: 149.76 x 236.6 at -12.75, -20.27 — StartLoader / start-loader.css)
  bulge      in the frame's -1..1 coordinates, radius rho goes to rho * (1 + 0.08 * (1 - rho^2 / 2)):
             the centre 8% larger, the corners in place (the spiral overlay is warped the same, in
             StartLoader's bulge())

Two kinds of alignment:
  corners    the Zoomcast Figma images (194:2), which carry their own drawn golden rectangle: its TL, TR
             and BL corners in source px
  fit        the Wikimedia Commons images (public domain / CC0): the spiral's centre (fraction of the
             source's width / height), the rectangle's width (fraction of the source's width), rotation
             (degrees) and mirroring, fitted by eye against the overlay

Run from the project root: python3 scripts/loader-golden.py
"""
import math
import cv2
import numpy as np

SRC = 'ref/loader-sources'
OUT = 'public/assets/loader/bulged'
PHI = (1 + 5 ** 0.5) / 2
FW, FH, M, RH = 253, 400, 8, 384
RW = RH / PHI
EYE = np.array([M + 0.72363 * RW, M + 1.17081 * RW])
S0 = 0.88                       # the golden half's starting zoom
F = 1 / S0
T = EYE * (F - 1)               # the frame's corner inside the extended image
EW, EH = 288, 455               # the extended image (>= 253F x 400F)
K = 0.08                        # the bulge

CORNERS = {  # TL, TR, BL of the drawn golden rectangle, in source px (crop: use only this part)
    'black':   ('figma/blackboard.png', [(46, 47), (698, 47), (46, 1106)], None),
    'eiffel':  ('figma/eiffel.png', [(15, 148), (480, 148), (15, 902)], None),
    'birds':   ('figma/birds.png', [(238, 258), (493, 258), (238, 670)], None),
    'solar':   ('figma/solar.png', [(570, 457), (573, 175), (115, 450)], None),
    'begonia': ('figma/begonia.png', [(87, 75), (305, 75), (87, 432)], None),
    # the collage's lower-right panel only, inside its border, so the margin never reaches its gutters
    'mona':    ('figma/mona-collage.png', [(18, -3), (528, -3), (18, 820)], (620, 518, 1168, 1342)),
}
FIT = {  # eye (x, y as fractions), rectangle width (fraction of source width), rotation, mirror
    'katrina':  ('commons/katrina.jpg', (0.62, 0.39), 0.5, 0, False),
    'm51':      ('commons/m51.jpg', (0.39, 0.46), 0.27, 0, False),
    'pearl':    ('commons/pearl.jpg', (0.5, 0.53), 0.45, 0, False),
    'nautilus': ('commons/nautilus.jpg', (0.35, 0.635), 0.64, 0, True),
    'fern':     ('commons/fern.jpg', (0.455, 0.47), 0.5, 0, False),
    'ear':      ('commons/ear.jpg', (0.45, 0.48), 0.6, 0, True),
    'stairs':   ('commons/stairs.jpg', (0.52, 0.78), 0.4, 0, False),
    'snail':    ('commons/snail.jpg', (0.475, 0.70), 0.11, 0, False),
    'ammonite': ('commons/ammonite.jpg', (0.77, 0.52), 0.2, 0, False),
    'venus':    ('commons/venus.jpg', (0.5, 0.52), 0.3, 0, False),
}


def unbulge(px, py):
    """Extended-image px -> the frame point (2x px) it shows before the bulge."""
    fx, fy = px - T[0], py - T[1]
    u, v = (fx - FW / 2) / (FW / 2), (fy - FH / 2) / (FH / 2)
    ro = np.hypot(u, v)
    g = lambda p: p * (1 + K * (1 - p * p / 2))
    lo, hi = np.zeros_like(ro), np.maximum(ro, 1e-6) * 1.2
    for _ in range(40):
        mid = (lo + hi) / 2
        up = g(mid) < ro
        lo, hi = np.where(up, mid, lo), np.where(up, hi, mid)
    k = np.where(ro > 0, (lo + hi) / 2 / np.maximum(ro, 1e-9), 1)
    return FW / 2 + u * k * (FW / 2), FH / 2 + v * k * (FH / 2)


def canonical_to_source(name):
    """A 2x3 affine: the frame's (unbulged) px -> source px; and the source image."""
    if name in CORNERS:
        f, corners, crop = CORNERS[name]
        img = cv2.imread(f'{SRC}/{f}', cv2.IMREAD_COLOR)
        if crop:
            img = img[crop[1]:crop[3], crop[0]:crop[2]]
        dst = np.float32([(M, M), (M + RW, M), (M, M + RH)])
        return cv2.getAffineTransform(dst, np.float32(corners)), img
    f, eye, wf, rot, mir = FIT[name]
    img = cv2.imread(f'{SRC}/{f}', cv2.IMREAD_COLOR)
    h, w = img.shape[:2]
    s = RW / (wf * w)
    t = math.radians(rot)
    L = s * np.array([[math.cos(t), -math.sin(t)], [math.sin(t), math.cos(t)]]) @ np.array([[-1 if mir else 1, 0], [0, 1]])
    Li = np.linalg.inv(L)
    e = np.array([eye[0] * w, eye[1] * h])
    return np.hstack([Li, (e - Li @ EYE)[:, None]]), img


for name in [*CORNERS, *FIT]:
    A, img = canonical_to_source(name)
    # a source much bigger than the output is shrunk to about its scale first (area-averaged), so the
    # one cubic resample below doesn't alias
    shrink = math.sqrt(abs(np.linalg.det(A[:, :2])))
    if shrink > 1.3:
        img = cv2.resize(img, None, fx=1 / shrink, fy=1 / shrink, interpolation=cv2.INTER_AREA)
        A = A / shrink
    xs, ys = np.meshgrid(np.arange(EW) + 0.5, np.arange(EH) + 0.5)
    qx, qy = unbulge(xs, ys)
    mx = (A[0, 0] * qx + A[0, 1] * qy + A[0, 2] - 0.5).astype(np.float32)
    my = (A[1, 0] * qx + A[1, 1] * qy + A[1, 2] - 0.5).astype(np.float32)
    out = cv2.remap(img, mx, my, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT_101)
    # where the extension reaches past the source, the mirrored edge would copy drawn lines into the
    # margin: there, a soft blur of it instead (feathered), an out-of-focus edge rather than a copy
    h, w = img.shape[:2]
    outside = np.maximum.reduce([-mx, mx - (w - 1), -my, my - (h - 1), np.zeros_like(mx)])
    a = np.clip(outside / 6, 0, 1)[..., None]
    if a.max() > 0:
        soft = cv2.GaussianBlur(out, (0, 0), 7)
        out = (out * (1 - a) + soft * a).round().astype(np.uint8)
    cv2.imwrite(f'{OUT}/g-{name}.webp', out, [cv2.IMWRITE_WEBP_QUALITY, 88])
    print(name, out.shape[1], 'x', out.shape[0])
