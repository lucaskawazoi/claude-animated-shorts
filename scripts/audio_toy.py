# Som do explicador de brinquedo: efeitos (UI de jogo + máquinas) e cama musical, tudo sintetizado em código (custo marginal zero).
# Entrada: out/cues.json (âncoras T em segundos, exportadas de src/toy/cues.ts). Saída: out/sfx.wav e out/music.wav (48 kHz estéreo).
# Uso: uv run --with numpy --with scipy python3 scripts/audio_toy.py [dir-de-saida]
import json, sys, wave
import numpy as np
from scipy.signal import butter, lfilter

SR = 48000
OUT = sys.argv[1] if len(sys.argv) > 1 else "out"
C = json.load(open(f"{OUT}/cues.json"))
T, DUR = C["T"], C["DURATION_S"]
N = int(DUR * SR)
rng = np.random.default_rng(11)
SFX = np.zeros((2, N))


def lp(x, fc, o=2): b, a = butter(o, min(fc, SR / 2 - 100) / (SR / 2), "low"); return lfilter(b, a, x)
def hp(x, fc, o=2): b, a = butter(o, fc / (SR / 2), "high"); return lfilter(b, a, x)
def bp(x, lo, hi): b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], "band"); return lfilter(b, a, x)
def tt(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR))
def env(d, a=0.004, dec=0.1): t = tt(d); return np.minimum(t / max(a, 1e-4), 1) * np.exp(-t / dec)
def fade(x, i=0.05, o=0.05):
    n = len(x); e = np.ones(n); a, b = int(i * SR), int(o * SR)
    if a: e[:a] = np.linspace(0, 1, a)
    if b: e[-b:] = np.linspace(1, 0, b)
    return x * e
def sine(f, d): return np.sin(2 * np.pi * f * tt(d))
def sweep(f0, f1, d, shape=np.sin):
    t = tt(d); f = f0 * (f1 / f0) ** (t / d); return shape(2 * np.pi * np.cumsum(f) / SR)
def saw(f, d): return 2 * ((f * tt(d)) % 1) - 1
def square(f, d, duty=0.5): return np.where((f * tt(d)) % 1 < duty, 1.0, -1.0)
def bell(f, d, dec=0.4): t = tt(d); return sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t / (dec / (1 + 0.8 * i))) for i, (m, a) in enumerate([(1, 1), (2.76, 0.5), (5.4, 0.25)]))


def add(x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i < 0: return
    x = x[: N - i]; l, r = g * (1 - max(0, pan)), g * (1 + min(0, pan))
    SFX[0, i : i + len(x)] += x * l; SFX[1, i : i + len(x)] += x * r


# ---------------- interface de jogo ----------------
PILLS = [0.1, T["oitenta"], T["quinhentas"], T["cemT"], T["bagaco"], T["energia"] - 0.3, T["devora"], T["restoAgua"] - 0.1, T["enche"], T["dez"] - 0.2, T["potassio"], T["vende"]]
TITLES = [T["moenda"], T["essaCaldeira"], T["essaDorna"], T["essaDestilaria"], T["essaFert"], T["parabens"]]
ALERTS = [T["p1"], T["p2"], T["p3"], T["p4"]]
REWINDS = [T["d1"], T["d2"], T["d3"], T["d4"]]
for t0 in PILLS: add(sweep(380, 820, 0.09) * env(0.09, 0.002, 0.05), t0, 0.32)
for t0 in TITLES:
    add(bell(1318, 0.9, 0.35) * 0.5, t0, 0.42); add(bell(1976, 0.6, 0.25) * 0.3, t0 + 0.09, 0.35)
    add(hp(noise(0.3), 1500) * np.linspace(0, 1, int(0.3 * SR)) ** 2 * env(0.3, 0.2, 0.2), t0 - 0.12, 0.25)
for t0 in ALERTS:
    for k, f in enumerate([660, 495, 660, 495]):
        add(lp(square(f, 0.11), 3200) * env(0.11, 0.003, 0.08), t0 + k * 0.14, 0.2)
    add(sine(58, 0.5) * env(0.5, 0.002, 0.18), t0, 0.5)
for t0 in REWINDS:
    s = sweep(2600, 260, 0.5, lambda p: 2 * ((p / (2 * np.pi)) % 1) - 1) * np.linspace(1, 0.2, int(0.5 * SR))
    add(lp(s, 5000) * 0.35 + bp(noise(0.5), 800, 5000) * 0.25, t0 - 0.02, 0.4)
    add(sine(120, 0.2) * env(0.2, 0.002, 0.07), t0 + 0.5, 0.3)
add(lp(square(150, 0.4), 800) * (1 + 0.3 * np.sin(2 * np.pi * 9 * tt(0.4))) * env(0.4, 0.004, 0.3), T["garapa"], 0.35)

# ---------------- máquinas ----------------
# caminhão: motor diesel + freio a ar ao parar (início 0 → 10.5 s)
d = 10.6; t = tt(d); f = 46 - 8 * np.clip((t - 6) / 4.4, 0, 1)
eng = (np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.6 + 0.3 * saw(f * 2, d)) * (0.6 + 0.4 * np.sin(2 * np.pi * 13 * t)) + 0.35 * lp(noise(d), 380)
add(fade(eng, 0.3, 0.7) * np.concatenate([np.ones(int(8 * SR)), np.linspace(1, 0.25, len(t) - int(8 * SR))]), 0, 0.33, -0.2)
add(hp(noise(0.7), 2500) * env(0.7, 0.01, 0.25), T["moenda"] - 0.55, 0.28)
# moenda: engrenagens girando + esmagamento
d = T["p1"] - T["moenda"] + 1.5; t = tt(d); p = 0.5 + 0.5 * np.sin(2 * np.pi * 5.5 * t)
mill = lp(square(62, d), 400) * (0.5 + 0.5 * p) + 0.5 * lp(noise(d), 900) * p + 0.12 * bp(noise(d), 2000, 6000) * (rng.random(len(t)) > 0.995)
add(fade(mill, 0.4, 0.6), T["moenda"] - 0.3, 0.3, -0.1)
for k in range(10): add(bp(noise(0.12), 300, 1800) * env(0.12, 0.002, 0.03), T["moenda"] + 1.0 + k * 0.5 + rng.random() * 0.15, 0.2)
add(lp(noise(2.5), 700) * np.linspace(0, 1, int(2.5 * SR)) ** 2, T["bagaco"], 0.15, 0.3)  # pilha crescendo
# caldeira: fogo, vapor, turbina, lâmpada
d = T["d2"] - T["joga"] - 1.2; t = tt(d)
fire = lp(noise(d), 450) * (0.7 + 0.3 * np.sin(2 * np.pi * 7.3 * t) * np.sin(2 * np.pi * 2.1 * t)) + 0.22 * hp(noise(d), 3000) * (rng.random(len(t)) > 0.9993)
add(fade(fire, 0.6, 0.8), T["joga"] + 1.2, 0.34, 0.15)
add(hp(noise(2.2), 4000) * np.linspace(0, 1, int(2.2 * SR)) ** 1.5 * env(2.2, 0.8, 1.4), T["fogo"] + 0.2, 0.18)
d = T["maisCaldo"] - T["turbina"] + 0.5; t = tt(d); fr = np.minimum(120 * (900 / 120) ** np.minimum(t / 1.4, 1), 900)
whine = np.sin(2 * np.pi * np.cumsum(fr) / SR) * 0.5 + 0.25 * saw(fr, d) * 0.5
add(fade(lp(whine, 4200) * (1 + 0.04 * np.sin(2 * np.pi * 6 * t)), 0.2, 0.9), T["turbina"], 0.14, 0.2)
add(bell(1568, 1.2, 0.5) * 0.5, T["energia"], 0.4); add(bell(2093, 0.8, 0.3) * 0.35, T["energia"] + 0.1, 0.3)
add(bp(noise(0.25), 3000, 9000) * env(0.25, 0.003, 0.08), T["energia"] - 0.05, 0.3)
# carro com garapa: engasgos + trombone triste
for k in range(7):
    t0 = T["garapa"] + 0.15 + k * 0.17
    add(lp(noise(0.12), 700) * env(0.12, 0.003, 0.05) + 0.5 * saw(70 - k * 4, 0.12) * env(0.12, 0.003, 0.06), t0, 0.35, -0.1)
for k, f in enumerate([311, 294, 277, 247]):
    add(lp(saw(f, 0.42), 1400) * (1 + 0.05 * np.sin(2 * np.pi * 6 * tt(0.42))) * env(0.42, 0.04, 0.5 if k == 3 else 0.2), T["p2"] - 1.35 + k * 0.33, 0.2)
# dorna: borbulhas (densidade sobe), mordidas da levedura
t0, t1 = T["levedura"], T["p3"]
tb = t0
while tb < t1:
    rate = 5 + 14 * (tb - t0) / (t1 - t0); tb += rng.exponential(1 / rate)
    f = rng.uniform(280, 1100); add(sweep(f, f * 1.9, 0.07) * env(0.07, 0.002, 0.03), tb, 0.16 * rng.uniform(0.5, 1), rng.uniform(-0.3, 0.3))
for k in range(12): add(lp(sine(160 + 25 * (k % 3), 0.07), 600) * env(0.07, 0.002, 0.03), T["devora"] + 0.2 + k * 0.28, 0.16)
# destilaria: ebulição, vapor subindo, gotas de etanol, bomba, vinhaça
d = T["p4"] - T["aquece"]; t = tt(d)
add(fade(lp(noise(d), 500) * (0.6 + 0.4 * np.sin(2 * np.pi * 3.3 * t)), 0.8, 0.6), T["aquece"], 0.22)
add(hp(noise(d - 3), 3500) * np.linspace(0, 1, int((d - 3) * SR)) ** 1.5, T["aquece"] + 1, 0.08)
for k in range(int((T["vinhaca"] - T["viraEtanol"] if "viraEtanol" in T else T["vinhaca"] - T["essaDestilaria"]) / 0.33)):
    add(sine(1900 + 80 * (k % 4), 0.12) * env(0.12, 0.002, 0.04), (T["viraEtanol"] if "viraEtanol" in T else T["essaDestilaria"]) + k * 0.33, 0.14, 0.3)
d = T["vinhaca"] - T["enche"] + 1.0
add(fade(lp(noise(d), 350) * (0.5 + 0.5 * np.sin(2 * np.pi * 2.2 * tt(d))), 0.3, 0.8), T["enche"], 0.22, 0.25)
for k in range(8):
    add(sweep(150, 70, 0.28) * env(0.28, 0.01, 0.16), T["vinhaca"] + k * 0.62, 0.4, -0.1)
# canais + cana crescendo
d = 5.2; t = tt(d)
add(fade(bp(noise(d), 200, 1800) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * t + 1)), 0.5, 0.8), T["canais"], 0.26)
for k in range(3): add(sweep(320, 980, 0.22) * env(0.22, 0.005, 0.14), T["canais"] + 5.2 + k * 0.45, 0.2)
add(bell(1760, 0.7, 0.3) * 0.4, T["canaNova"] + 0.4, 0.25)
# recompensa: moedas, subida de nível, casas acendendo, fanfarra
for k, f in enumerate([1047, 1319, 1568, 2093, 1047, 1319, 1568, 2093]):
    add(bell(f, 0.45, 0.18) * 0.5, T["casas"] + 0.08 * k, 0.32, ((-1) ** k) * 0.25)
for k, f in enumerate([523, 659, 784, 1047]):
    add(lp(saw(f, 0.9), 3500) * env(0.9, 0.01, 0.35), T["casas"] + 0.55, 0.12)
for i in range(8):
    add(bell(900 + 70 * i, 0.3, 0.12) * 0.5, T["casas"] + 0.1 + i * 0.28 + 0.1, 0.22, rng.uniform(-0.3, 0.3))
for k, f in enumerate([392, 494, 587, 784]):
    add(lp(square(f, 1.2, 0.35), 3000) * env(1.2, 0.01, 0.55), T["parabens"], 0.12)
add(bp(noise(1.0), 1500, 9000) * env(1.0, 0.002, 0.3), T["parabens"], 0.18)
# laço: o próximo caminhão chega
d = 2.7; t = tt(d); f = 42
add(fade((np.sin(2 * np.pi * f * t) * 0.6 + 0.3 * saw(f * 2, d)) * (0.6 + 0.4 * np.sin(2 * np.pi * 13 * t)) + 0.3 * lp(noise(d), 380), 1.0, 0.0), DUR - d, 0.25, -0.2)


# ---------------- cama musical: marimba + baixo + chocalho, 112 bpm, Lá menor ----------------
BPM = 112; BEAT = 60 / BPM
MUS = np.zeros((2, N))
def nfreq(m): return 440 * 2 ** ((m - 69) / 12)
def marimba(m, d=0.5):
    t = tt(d); f = nfreq(m); return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.05)) * np.exp(-t / 0.22) * np.minimum(t / 0.003, 1)
def put(x, t0, g, pan=0.0):
    i = int(t0 * SR)
    if i >= N: return
    x = x[: N - i]; MUS[0, i : i + len(x)] += x * g * (1 - max(0, pan)); MUS[1, i : i + len(x)] += x * g * (1 + min(0, pan))
CH = [(45, [57, 60, 64]), (41, [53, 57, 60]), (48, [55, 60, 64]), (43, [55, 59, 62])]  # Am F C G
bar, beats = 0, int(DUR / BEAT) + 4
for b in range(beats):
    t0 = b * BEAT; bass, tri = CH[(b // 4) % 4]
    if b % 2 == 0: put(np.sin(2 * np.pi * nfreq(bass - 12 + (12 if b % 4 == 2 else 0)) * tt(0.45)) * np.exp(-tt(0.45) / 0.2), t0, 0.5)
    for e in range(2):  # colcheias arpejadas
        n = tri[(b * 2 + e) % 3] + (12 if (b % 8) >= 4 and e == 1 else 0)
        put(marimba(n), t0 + e * BEAT / 2, 0.32, (-0.3 if e == 0 else 0.3))
    put(hp(noise(0.05), 6000) * env(0.05, 0.001, 0.015), t0 + BEAT / 2, 0.22)
    if b % 2 == 1: put(bp(noise(0.12), 1500, 6000) * env(0.12, 0.002, 0.05), t0, 0.28)
MUS *= 0.55

def save(path, x):
    x = np.clip(x, -1, 1); w = wave.open(path, "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((x.T * 32767).astype("<i2").tobytes()); w.close()
pk = np.abs(SFX).max(); SFX *= 0.89 / max(pk, 1e-6)
pm = np.abs(MUS).max(); MUS *= 0.5 / max(pm, 1e-6)
save(f"{OUT}/sfx.wav", SFX); save(f"{OUT}/music.wav", MUS)
print("ok", f"{DUR:.2f}s", "sfx peak", round(float(pk), 2), "music peak", round(float(pm), 2))
