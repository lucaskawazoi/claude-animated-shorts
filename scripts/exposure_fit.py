# Ajusta a curva de exposição (src/toy/exposure.ts) para a luz do vídeo seguir a curva de brilho da referência medida pela dissect.
# Entrada: stills SEM exposição (PROPS '{"exposure":false}') a cada 0,5 s: out/x_<quadro>.jpg ; a curva de brilho de <dissecao>/data/timeline.json.
# Uso: uv run --with pillow --with numpy python3 scripts/exposure_fit.py <dissecao-da-referencia> <duracao-final-s> [piso=0.55] [teto=1.12]
import json, sys
import numpy as np
from PIL import Image

ref_dir, dur = sys.argv[1], float(sys.argv[2])
lo, hi = float(sys.argv[3]) if len(sys.argv) > 3 else 0.55, float(sys.argv[4]) if len(sys.argv) > 4 else 1.12
br = json.load(open(f"{ref_dir}/data/timeline.json"))["brightness"]
rs, rstep = np.array(br["mean"]), br["step_s"]
f = dur / (len(rs) * rstep)  # a dissect mapeia o tempo da referência × (duração nossa / dela)
frames = [int(x) for x in open("out/frames_x.txt").read().split(",")]
t = np.array([fr / 30 for fr in frames])
raw = np.array([float(np.asarray(Image.open(f"out/x_{fr}.jpg").convert("L"), np.float32).mean()) / 255 for fr in frames])
raw = 16 / 255 + raw * 219 / 255  # luma de vídeo em faixa limitada, como a dissect lê o mp4
target = np.interp(t / f, np.arange(len(rs)) * rstep, rs)
e = np.clip(target / raw, lo, hi)
k = np.ones(5) / 5
es = np.convolve(np.pad(e, 2, mode="edge"), k, mode="valid")  # suaviza ~2,5 s: o brilho é humor, não pisca
grid = np.arange(0, dur + 0.5, 0.25)
out = np.interp(grid, t, es)
print(f"luma crua média {raw.mean():.3f} · alvo {target.mean():.3f} · exposição média {out.mean():.3f} (min {out.min():.2f}, max {out.max():.2f})")
open("src/toy/exposure.ts", "w").write("// Curva de exposição por tempo (gerada por scripts/exposure_fit.py; refazer depois de mudar câmera/luz).\n"
                                       f"export const EXP_STEP = 0.25;\nexport const EXPOSURE: number[] = [{','.join(f'{v:.3f}' for v in out)}];\n")
