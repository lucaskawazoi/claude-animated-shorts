# Proxy do "movimento por plano" da dissect sem renderizar o vídeo todo: pares de quadros consecutivos amostrados por janela.
#   python3 scripts/motion_proxy.py frames out/frames_mp.txt        -> escreve a lista de quadros (f e f+1) para o render de stills
#   uv run --with pillow --with numpy python3 scripts/motion_proxy.py score out/mp_          -> diferença média por janela + correlação de postos com a régua
import sys

WIN = [(0, 9.85), (9.85, 20.9), (20.9, 22.35), (22.35, 30.4), (30.4, 42.9), (42.9, 50.8), (50.8, 51.7), (51.7, 68.5), (68.5, 77.7), (77.7, 88.7), (88.7, 92.2)]
REF = [0.60, 0.51, 0.67, 0.60, 0.47, 0.51, 0.70, 0.62, 0.53, 0.59, 0.40]  # motion_energy por plano da referência (dissect)
SAMPLES = [[1, 3, 5, 7, 9], [11, 13, 15, 17, 19], [21.0, 21.3, 21.6, 21.9, 22.2], [24, 25.5, 27, 28.5, 29.5], [31, 34, 37, 40, 42],
           [44, 45.5, 47, 48.5, 50], [50.85, 51.05, 51.25, 51.45, 51.6], [54, 57, 60, 63, 66], [70, 72, 74, 76, 69.5], [79, 82, 85, 87.5, 80.5], [89, 90, 91, 91.5, 92]]

if sys.argv[1] == "frames":
    fr = sorted({int(t * 30) + k for w in SAMPLES for t in w for k in (0, 1)})
    open(sys.argv[2], "w").write(",".join(map(str, fr)))
else:
    import numpy as np
    from PIL import Image
    pre = sys.argv[2]
    g = lambda f: np.asarray(Image.open(f"{pre}{f}.jpg").convert("L"), np.float32) / 255
    d = [float(np.mean([np.abs(g(int(t * 30) + 1) - g(int(t * 30))).mean() for t in w])) for w in SAMPLES]
    rk = lambda a: np.argsort(np.argsort(a)).astype(float)
    rho = float(np.corrcoef(rk(d), rk(REF))[0, 1])
    for i, (w, v) in enumerate(zip(WIN, d)): print(f"W{i + 1:<2} {w[0]:5.1f}-{w[1]:5.1f}s  D={v:.4f}  ref={REF[i]:.2f}")
    print(f"correlação de postos (proxy) = {rho:.2f}")
