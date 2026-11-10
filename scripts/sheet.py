# Folha de contato rotulada: uv run --with pillow python3 scripts/sheet.py saida.jpg colunas arq1.jpg arq2.jpg ...
import sys
from PIL import Image, ImageDraw

out, cols, files = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
ims = [Image.open(f).convert("RGB") for f in files]
w, h = ims[0].size
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w, rows * h), "black")
d = ImageDraw.Draw(sheet)
for i, (im, f) in enumerate(zip(ims, files)):
    x, y = (i % cols) * w, (i // cols) * h
    sheet.paste(im, (x, y))
    label = f.rsplit("_", 1)[-1].rsplit(".", 1)[0]
    d.rectangle([x, y, x + 150, y + 30], fill=(0, 0, 0))
    d.text((x + 6, y + 6), f"f{label} {int(label) / 30:.1f}s", fill=(255, 220, 0))
sheet.save(out, quality=88)
print(out, sheet.size)
