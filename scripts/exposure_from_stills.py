# Curva de exposição sem renderizar o vídeo: quadros soltos SEM exposição (PROPS='{"exposure":false}') a cada ~1 s,
# luma média de cada um (convertida para a faixa limitada do vídeo, como a dissect lê o mp4) contra a curva de brilho
# da referência escalada à nossa duração. Mesmo resultado prático do render em 1/4 por ~1/8 do tempo.
#   python3 scripts/exposure_from_stills.py <prefixo dos stills> <dissecao-da-referencia> <duracao-s> <saida exposure.ts>
import glob, json, re, sys
import numpy as np
from PIL import Image
pre, ref_dir, dur, out = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
files = sorted(glob.glob(pre + '*.jpg'), key=lambda f: int(re.findall(r'(\d+)\.jpg$', f)[0]))
t = np.array([int(re.findall(r'(\d+)\.jpg$', f)[0]) / 30 for f in files])
raw = np.array([float(np.asarray(Image.open(f).convert('L'), np.float32).mean()) / 255 for f in files])
ours = 16 / 255 + raw * 219 / 255
br = json.load(open(f"{ref_dir}/data/timeline.json"))['brightness']
rs, rstep = np.array(br['mean']), br['step_s']
f = dur / (len(rs) * rstep)
# referência suavizada ~1 s (a nossa amostragem é de 1 s)
k = max(1, int(round(1.0 / rstep))); rsm = np.convolve(np.pad(rs, k // 2, mode='edge'), np.ones(k) / k, mode='valid')[:len(rs)]
target = np.interp(t / f, np.arange(len(rs)) * rstep, rsm)
e = np.clip(target / np.maximum(ours, 0.05), 0.6, 1.1)
e = np.convolve(np.pad(e, 1, mode='edge'), np.ones(3) / 3, mode='valid')
grid = np.arange(0, dur + 0.5, 0.25)
g = np.interp(grid, t, e)
print(f"{len(files)} quadros · nosso brilho {ours.mean():.3f} · alvo {target.mean():.3f} · exposição média {g.mean():.3f} (min {g.min():.2f}, max {g.max():.2f})")
open(out, 'w').write("// Curva de exposição por 0,25 s (scripts/exposure_from_stills.py; refazer se câmera ou luz mudarem).\n"
                     f"export const EXPOSURE: number[] = [{','.join(f'{v:.3f}' for v in g)}];\n")
