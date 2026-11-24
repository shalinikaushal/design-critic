#!/usr/bin/env python3
"""Dev-only generator for SYNTHETIC screenshot fixtures (requires Pillow). Not used by tests or CI.

Draws a fictional mock app ("Acme Demo") with obviously fake content: no real people, brands or data.
The generated images are committed; run this only when fixtures need to change:

    python3 tools/fixtures/generate.py
    node .cline/skills/design-critic/scripts/ingest-screens.mjs \
        .cline/skills/design-critic/evaluations/fixtures/ingest-basic/screens \
        --provenance synthetic --out .cline/skills/design-critic/evaluations/fixtures/ingest-basic/screens/manifest.json
"""
import os
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(__file__), "..", "..", ".cline", "skills", "design-critic",
                   "evaluations", "fixtures", "ingest-basic", "screens")
W, H = 390, 780
INK, MUTED, BRAND, BG = (24, 28, 36), (110, 116, 128), (30, 90, 200), (255, 255, 255)


def font(size):
    for p in ("/System/Library/Fonts/Helvetica.ttc", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def base(title):
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 64], fill=BRAND)
    d.text((20, 20), title, fill=(255, 255, 255), font=font(22))
    for i, label in enumerate(("Home", "Items", "Settings")):
        x = 20 + i * 120
        d.text((x, H - 40), label, fill=BRAND if i == 0 else MUTED, font=font(14))
    return im, d


def button(d, y, text):
    d.rounded_rectangle([20, y, W - 20, y + 48], radius=8, fill=BRAND)
    d.text((W // 2 - 40, y + 14), text, fill=(255, 255, 255), font=font(16))


def home():
    im, d = base("Acme Demo")
    d.text((20, 90), "Welcome, Sample User", fill=INK, font=font(20))
    d.text((20, 124), "You have 3 sample items.", fill=MUTED, font=font(14))
    for i, name in enumerate(("Item One", "Item Two", "Item Three")):
        y = 170 + i * 80
        d.rounded_rectangle([20, y, W - 20, y + 64], radius=8, outline=(200, 205, 214), width=2)
        d.text((36, y + 20), name, fill=INK, font=font(16))
    button(d, 450, "Add item")
    return im


def detail():
    im, d = base("Item One")
    d.text((20, 90), "Details", fill=INK, font=font(20))
    d.text((20, 128), "This is placeholder text for a synthetic item.", fill=MUTED, font=font(14))
    d.rectangle([20, 170, W - 20, 330], fill=(228, 232, 240))
    button(d, 360, "Save")
    return im


def confirm():
    im, d = base("Saved")
    d.text((20, 120), "Your sample item was saved.", fill=INK, font=font(18))
    button(d, 200, "Back to Home")
    return im


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    home().save(os.path.join(OUT, "01-home.png"), optimize=False)
    detail().save(os.path.join(OUT, "02-detail.jpg"), quality=90)
    confirm().save(os.path.join(OUT, "03-confirm.png"), optimize=False)
    print("wrote 3 synthetic screens to", os.path.normpath(OUT))
