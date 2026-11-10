# Curva de exposição a partir da própria medição da dissect (check --json de um render SEM exposição):
# exposição(t) = brilho da referência (escalado à nossa duração) / nosso brilho medido, suavizada ~2,5 s e limitada.
#   python3 scripts/exposure_from_check.py <check.json> <dissecao-da-referencia> <saida exposure.ts> [piso=0.6] [teto=1.1]
import json, sys
import numpy as np
chk, ref_dir, out = sys.argv[1:4]
lo, hi = (float(sys.argv[4]) if len(sys.argv) > 4 else 0.6), (float(sys.argv[5]) if len(sys.argv) > 5 else 1.1)
r = json.load(open(chk)); m = r['render_measure']; f = r['timing']['factor']
ours, step = np.array(m['luma']['mean']), m['luma']['step_s']
br = json.load(open(f"{ref_dir}/data/timeline.json"))['brightness']
rs, rstep = np.array(br['mean']), br['step_s']
t = np.arange(len(ours)) * step
target = np.interp(t / f, np.arange(len(rs)) * rstep, rs)
e = np.clip(target / np.maximum(ours, 0.05), lo, hi)
k = max(1, int(round(2.5 / step))); e = np.convolve(np.pad(e, k // 2, mode='edge'), np.ones(k) / k, mode='valid')[:len(t)]
grid = np.arange(0, m['duration_s'] + 0.5, 0.25)
g = np.interp(grid, t, e)
print(f"nosso brilho {ours.mean():.3f} · alvo {target.mean():.3f} · exposição média {g.mean():.3f} (min {g.min():.2f}, max {g.max():.2f})")
open(out, 'w').write("// Curva de exposição por 0,25 s (scripts/exposure_from_check.py; refazer se câmera ou luz mudarem).\n"
                     f"export const EXPOSURE: number[] = [{','.join(f'{v:.3f}' for v in g)}];\n")
