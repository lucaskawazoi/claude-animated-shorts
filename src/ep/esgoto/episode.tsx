// MEP11 — Para onde vai a descarga (Mundo em Peças, 3D de brinquedo). Câmera, operário, painel e luz.
// 11 planos nos 10 cortes secos da régua (cada um ancorado numa palavra), câmera sempre em movimento (spline, sem paradas).
import type { Shot } from "../../toy/cam";
import { CamState } from "../../toy/cam";
import type { Episode } from "../../toy/episode";
import { HudData, count } from "../../toy/hud";
import { V3, lerp, prog, sstep } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { COSTUMES } from "../../toy/worker";
import { CUTS10, SFX, T } from "./cues";
import { OPEN_END, openId } from "./opening";
import { PY, World, duckPos, surf } from "./world";
export { OPENING } from "./opening";


// ---- câmera por spline (velocidade contínua: nada de para-e-anda entre chaves)
type K = [number, V3, V3, number?, number?]; // t, pos, look, fov, roll
const spl = (ks: K[]) => (t: number): CamState => {
  const n = ks.length, tt = Math.min(Math.max(t, ks[0][0]), ks[n - 1][0]);
  let i = 0; for (let k = 0; k < n - 1; k++) if (tt >= ks[k][0]) i = k;
  const j = Math.min(n - 1, i + 1), a = ks[i], b = ks[j], dt = Math.max(1e-6, b[0] - a[0]), u = Math.min(1, Math.max(0, (tt - a[0]) / dt));
  const vec = (k: K): number[] => [...k[1], ...k[2], k[3] ?? 56, k[4] ?? 0];
  const tan = (k: number) => { const p = ks[Math.max(0, k - 1)], q = ks[Math.min(n - 1, k + 1)], d = Math.max(1e-6, q[0] - p[0]), A = vec(p), B = vec(q); return A.map((_, m) => (B[m] - A[m]) / d); };
  const P0 = vec(a), P1 = vec(b), m0 = tan(i), m1 = tan(j), u2 = u * u, u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
  const r = P0.map((_, m) => h00 * P0[m] + h10 * dt * m0[m] + h01 * P1[m] + h11 * dt * m1[m]);
  return { pos: [r[0], r[1], r[2]], look: [r[3], r[4], r[5]], fov: r[6], roll: r[7] };
};
const mix = (a: CamState, b: CamState, u: number): CamState => ({ pos: [lerp(a.pos[0], b.pos[0], u), lerp(a.pos[1], b.pos[1], u), lerp(a.pos[2], b.pos[2], u)], look: [lerp(a.look[0], b.look[0], u), lerp(a.look[1], b.look[1], u), lerp(a.look[2], b.look[2], u)], fov: lerp(a.fov, b.fov, u), roll: lerp(a.roll, b.roll, u) });
const y = (v: number) => v + PY;

// ---- as três aberturas (0 a OPEN_END): mesma voz, três ganchos; no fim as três caem no mesmo plano do mapa
const CITY0: K = [OPEN_END, [-17, 84, 76], [-17, 0, -20], 56, 0];
const cityKeys: K[] = [
  CITY0,
  [5.0, [-30, 52, 46], [-28, 0, -8], 52, -2],
  [6.6, [-34, 40, 40], [-34, 0, -2], 50, 2],
  [T.sua - 0.04, [-34, 40, 40], [-34, 0, -2], 50, 2],
];
const camCity = spl(cityKeys);
const openA = (t: number): CamState => { const u = sstep(prog(t, 0, OPEN_END)); return { pos: [lerp(-17, -17, u), lerp(150, 84, u), lerp(-12, 76, u)], look: [-17, 0, lerp(-22, -18, u)], fov: lerp(62, 56, u), roll: 22 * (1 - u) }; };
const openBr = (t: number): CamState => {
  if (t < 0.75) { const u = t / 0.75; return { pos: [-65.4 + 2 - 1.5 * u, 6.5 - 1.6 * u, 19 - 4 * u], look: [-65.4, 2.6, 8.4], fov: lerp(52, 44, u), roll: 8 * (1 - u) }; }
  const d = duckPos(t), ahead = t > 1.25 && t < 2.4 ? 6 : 0, up = t > 2.35 ? 1 : 0;
  return { pos: [d[0] - 3 + ahead, d[1] + 2 + up * 2, 22], look: [d[0] + ahead * 0.6, d[1], ZPC], fov: 52, roll: t < 1.25 ? 0 : 6 * Math.sin(t * 9) };
};
const ZPC = 10.7;
const openC = (t: number): CamState => { const u = sstep(prog(t, 0, 2.9)), th = -1.3 * (1 - u), r = lerp(30, 70, u), h = lerp(4, 52, u); return { pos: [-17 + Math.sin(th) * r, h, -22 + Math.cos(th) * r], look: [-17, lerp(20, 0.5, u), lerp(-22, -18, u)], fov: lerp(66, 56, u), roll: 9 * (1 - u) * Math.sin(t * 5 + 1) + 8 * (1 - u) };
};
const camS1 = (t: number): CamState => {
  const o = openId(), op = o === "A" ? openA : o === "B" ? openBr : openC;
  if (t >= OPEN_END) return camCity(t);
  return mix(op(t), camCity(OPEN_END), sstep(prog(t, OPEN_END - 0.7, OPEN_END)));
};


// [t0, pos0, look0, pos1, look1, fov0, fov1, roll0, roll1, nome] — cada plano é um corte seco com ângulo próprio e câmera sempre andando
type R = [number, V3, V3, V3, V3, number, number, number, number, string];
const ROWS: R[] = [
  [T.sua, [-62, 16, 48], [-62, 4.5, 5], [-62, 9, 34], [-63, 4, 7], 50, 46, 2, -2, "a casa (cutaway), push in"],
  [T.descarga, [-69, 2, 22], [-65.4, 2.5, 8.4], [-62.5, 4.5, 20], [-65.4, 2.2, 8.4], 44, 40, 3, -3, "vaso: a descarga, pato some"],
  [T.desce, [-72, -1, 26], [-58, -3.5, 10], [-40, 0, 28], [-22, -3, 10], 58, 58, 3, -2, "o esgoto desce pelo cano (pan right)"],
  [T.rede, [-16, 5, 48], [-6, -2, 10], [14, 4, 50], [26, -4, 6], 54, 54, 2, -2, "rede coletora: a malha acende (pan right)"],
  [T.soque1, [48, 6, 92], [66, -12, 0], [62, 8, 96], [76, -12, 0], 54, 54, 3, -2, "vale: o esgoto chega e empilha (alto, aberto)"],
  [T.morro, [62, -8, 62], [60, -22, 6], [70, -4, 58], [90, -8, 4], 54, 54, -3, 2, "não sobe morro (baixo, lago)"],
  [T.bomba, [76, -16, 66], [76, -20, 2], [80, -12, 48], [77, -17, 2], 56, 50, 2, -2, "a bomba gigante sobe"],
  [T.pracima, [122, 36, 40], [100, 4, 2], [96, 26, 44], [80, -12, 2], 52, 52, 3, -3, "cano empurra pra cima, de cima (pan left)"],
  [T.eleva - 0.07, [77, -14, 60], [77, -18, 2], [78, -17, 28], [77, -19, 2], 60, 44, 2, 0, "elevatória: push in na bomba"],
  [T.mas2, [58, -14, 36], [60, -22, 2], [64, -18, 30], [66, -22, 2], 50, 50, 3, -3, "pano, plástico e areia no lago"],
  [T.z2, [118, 28, 36], [126, 12, 3], [136, 22, 30], [142, 14, 2], 54, 54, -2, 2, "topo do cano, de cima"],
  [T.grade, [140, y(5), 22], [150, y(2), -2], [150, y(8), 24], [158, y(2), -2], 54, 54, 3, -2, "canal chega na grade"],
  [T.segura, [150, y(7), 22], [156, y(2.5), -1], [158, y(10), 17], [158, y(4), 2], 48, 42, -3, 3, "grade segura o grande, rastelo"],
  [T.canal, [170, y(8), 36], [186, y(2), -2], [200, y(8), 32], [190, y(2), -2], 54, 54, 2, -2, "canal de areia (pan right)"],
  [T.gradeT, [180, y(24), 40], [176, y(1), -1], [166, y(18), 30], [166, y(2), -1], 58, 56, -2, 3, "grade e canal de cima"],
  [T.z3, [184, y(6), 30], [190, y(2), -2], [178, y(4), 24], [180, y(2), -2], 52, 48, 3, -3, "baixo no canal (Zerou?)"],
  [T.tanque, [232, y(36), 30], [232, y(1), -8], [236, y(30), 22], [232, y(0), -8], 56, 56, 2, -2, "decantador: de cima"],
  [T.lodo, [222, y(4), 12], [232, y(2), -8], [232, y(6), 14], [236, y(2), -8], 50, 50, 3, -3, "o pesado afunda e vira lodo (baixo)"],
  [T.prim, [212, y(14), 30], [232, y(2), -8], [252, y(14), 30], [232, y(2), -8], 54, 54, -2, 2, "decantador primário: órbita"],
  [T.z4, [232, y(40), -2], [232, y(0), -8], [234, y(34), -2], [232, y(0), -8], 56, 56, 0, 15, "decantador a prumo (Zerou?)"],
  [T.bact, [262, y(14), 36], [278, y(3), -3], [290, y(12), 30], [292, y(3), -3], 54, 54, 3, -3, "as bactérias chegam (chicote)"],
  [T.adoram, [286, y(4.2), 11], [288, y(3), -2], [291, y(3.6), 10], [291, y(3), -2], 40, 34, 5, -5, "close nas bactérias"],
  [T.sopra, [279, y(10), 25], [284, y(3), -1], [286, y(6), 20], [288, y(3), -1], 50, 50, 3, -2, "sopra ar: bolhas"],
  [T.comem, [298, y(7), 19], [298, y(3), -1], [300, y(5), 16], [300, y(3), -1], 44, 38, -2, 3, "elas comem (close)"],
  [T.aer, [301, y(17), 35], [292, y(3), -3], [284, y(20), 36], [292, y(3), -3], 54, 54, 2, -2, "tanque de aeração, aberto"],
  [T.demais, [292, y(9), 23], [292, y(3), -2], [290, y(6), 19], [292, y(3), -2], 46, 40, -3, 3, "bactéria demais (lotado)"],
  [T.z5, [292, y(40), 0], [292, y(0), -3], [294, y(34), 0], [292, y(0), -3], 56, 56, 0, -12, "aeração a prumo (Zerou?)"],
  [T.outro, [325, y(34), 24], [338, y(1), -8], [340, y(28), 22], [338, y(0), -8], 56, 56, 2, -2, "outro tanque: de cima"],
  [T.limpa, [346, y(8), 26], [352, y(2), -4], [356, y(6), 24], [358, y(2), 2], 50, 50, 3, -3, "água limpa sai pro rio"],
  [T.rio, [366, y(5.5), 29], [367, y(3), 6], [368, y(4), 24], [368, y(4), 6], 44, 40, 3, -3, "rio: o peixe pula"],
  [T.sec, [330, y(18), 40], [340, y(3), -8], [350, y(14), 38], [340, y(3), -8], 54, 54, -2, 2, "decantador secundário aberto"],
  [T.montanha, [324, y(5), 14], [338, y(3), -8], [338, y(8), 18], [338, y(4), -8], 50, 46, 2, -2, "montanha de lodo (baixo)"],
  [T.z6, [338, y(38), -2], [338, y(0), -8], [340, y(32), -2], [338, y(0), -8], 56, 56, 0, 12, "secundário a prumo (Zerou?)"],
  [T.dig, [346, y(8), 30], [356, y(2), 4], [378, y(8), 28], [384, y(2), 4], 54, 54, 2, -2, "lodo vai pro digestor (pan right)"],
  [T.semar, [392, y(26), 30], [395, y(24), -6], [398, y(30), 24], [395, y(24), -6], 50, 46, -3, 3, "tampa fecha: sem ar (alto)"],
  [T.outras, [392, y(14), 16], [395, y(15), 2], [396, y(15), 13], [395, y(15), 2], 40, 34, 3, -3, "janelinha: bactérias e bolhas"],
  [T.biogas, [404, y(14), 32], [410, y(21), -6], [414, y(18), 30], [414, y(19), -6], 50, 50, -2, 2, "biogás sobe pro gasômetro"],
  [T.energia, [430, y(4), 30], [428, y(5), 8], [390, y(6), 30], [380, y(5), 8], 56, 56, 2, -2, "a estação acende (pan left)"],
  [T.digT, [396, y(3), 26], [398, y(8), -3], [398, y(5), 30], [400, y(20), -3], 56, 56, 3, -2, "digestor (tilt up)"],
  [T.adubo, [430, y(5), 26], [440, y(3), 4], [440, y(7), 22], [441, y(3), 4], 46, 46, -2, 2, "o que sobra vira adubo"],
  [T.agoraSim, [401, y(6), 36], [401, y(15), -3], [401, y(8), 41], [401, y(34), -3], 54, 56, 0, 0, "ZEROU! (tilt up pro céu)"],
  [T.vaso, [470, y(14), 46], [442, y(5), -2], [420, y(14), 48], [400, y(5), -2], 54, 54, -2, 2, "do vaso ao rio: plano aberto (pan)"],
  [T.manda, [400, y(16), 52], [382, y(5), -2], [372, y(16), 50], [352, y(5), -2], 54, 54, 2, -2, "fim: pan left"],
];
const linCam = (i: number) => (t: number): CamState => { const r = ROWS[i], t1 = ROWS[i + 1] ? ROWS[i + 1][0] : T.end, u = Math.min(1, Math.max(0, (t - r[0]) / (t1 - r[0]))), L = (a: V3, b: V3): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; return { pos: L(r[1], r[3]), look: L(r[2], r[4]), fov: lerp(r[5], r[6], u), roll: lerp(r[7], r[8], u) }; };
const SHOTS: Shot[] = [
  { name: "gancho (A/B/C) → o mapa da cidade", t0: 0, keys: [], fn: camS1 },
  ...ROWS.map((r, i): Shot => ({ name: r[9], t0: r[0], keys: [], fn: linCam(i) })),
];
// agitação da câmera na mão por janela da régua (mesma ordem de energia dos episódios que passaram na dissect)
const DYN = [3, 2, 3, 3, 1.5, 1.5, 3, 3, 1.5, 1.5, 2];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const g = (x: number, z: number): V3 => [x, surf(x), z];
const WORKER: [number, WorkerState][] = [
  [0, S(g(-58.5, 9.2), -0.3, "present")],
  [T.sua + 0.3, S(g(-58.5, 9.2), -0.9, "point")],
  [T.descarga + 0.3, S(g(-58.5, 9.2), -0.5, "cheer")],
  [T.desce, S(g(-52, 9), 0.2, "present")],
  [T.rede - 0.4, S(g(-8, 9), 0.2, "cheer")],
  [T.soque1, S(g(44, 9), 0.3, "alarm")],
  [T.z1, S(g(44, 9), 0.3, "think")],
  [T.bomba, S([66, -26, 11.5], 0.5, "point")],
  [T.mas2, S([66, -26, 11.5], 0.5, "alarm")],
  [T.grade, S(g(152, 8.6), 0.2, "present")],
  [T.gradeT - 0.3, S(g(176, 8.6), 0.2, "cheer")],
  [T.mas3, S(g(176, 8.6), 0.2, "alarm")],
  [T.z3, S(g(176, 8.6), 0.2, "think")],
  [T.tanque, S(g(222, 8.6), 0.3, "point")],
  [T.prim - 0.2, S(g(222, 8.6), 0.3, "cheer")],
  [T.soque4, S(g(222, 8.6), 0.3, "alarm")],
  [T.z4, S(g(222, 8.6), 0.3, "think")],
  [T.bact, S(g(280, 8.6), 0.3, "point")],
  [T.aer - 0.2, S(g(280, 8.6), 0.3, "cheer")],
  [T.demais, S(g(280, 8.6), 0.3, "alarm")],
  [T.z5, S(g(280, 8.6), 0.3, "think")],
  [T.outro, S(g(326, 8.6), 0.3, "point")],
  [T.sec - 0.2, S(g(326, 8.6), 0.3, "cheer")],
  [T.montanha, S(g(326, 8.6), 0.3, "alarm")],
  [T.z6, S(g(326, 8.6), 0.3, "think")],
  [T.dig, S(g(372, 8.6), 0.3, "point")],
  [T.digT - 0.2, S(g(372, 8.6), 0.3, "cheer")],
  [T.adubo, S(g(404, 8.6), 0.1, "present")],
  [T.agoraSim, S(g(404, 8.6), 0.0, "cheer")],
];

const hud: HudData = {
  pills: [
    { a: 0.05, b: T.sua - 0.15, label: "TÊM REDE", value: (t) => `${count(t, 0.3, 2.5, 0, 55)} DE 100`, y: 440 },
    { a: T.metade, b: T.sua - 0.15, label: "TRATADO", value: () => "METADE", y: 560, tone: "red" },
    { a: T.soque1, b: T.z1 - 0.1, label: "O MORRO", value: () => "NÃO SOBE", y: 440, tone: "red" },
    { a: T.mas2, b: T.z2 - 0.1, label: "NO ESGOTO", value: () => "PANO E AREIA", y: 440, tone: "red" },
    { a: T.mas3, b: T.z3 - 0.1, label: "AINDA SOBRA", value: () => "SUJEIRA MIÚDA", y: 440, tone: "red" },
    { a: T.soque4, b: T.z4 - 0.1, label: "AINDA SOBRA", value: () => "DISSOLVIDA", y: 440, tone: "red" },
    { a: T.adoram, b: T.demais - 0.1, label: "BACTÉRIAS", value: (t) => `${count(t, 54.9, 61.5, 4, 48)}`, y: 440, tone: "green" },
    { a: T.demais, b: T.z5 - 0.1, label: "BACTÉRIA", value: () => "DEMAIS", y: 440, tone: "red" },
    { a: T.limpa, b: T.sec - 0.15, label: "ÁGUA", value: () => "MAIS LIMPA", y: 440, tone: "green" },
    { a: T.montanha, b: T.z6 - 0.1, label: "AINDA SOBRA", value: () => "MONTANHA DE LODO", y: 440, tone: "red" },
    { a: T.outras, b: T.digT - 0.15, label: "BIOGÁS", value: () => "VIRA ENERGIA", y: 440, tone: "gold" },
    { a: T.adubo, b: T.agoraSim - 0.1, label: "O QUE SOBRA", value: () => "VIRA ADUBO", y: 440, tone: "green" },
  ],
  titles: [
    { a: T.rede, text: "REDE COLETORA" }, { a: T.eleva, text: "ELEVATÓRIA" }, { a: T.gradeT, text: "GRADE" }, { a: T.prim, text: "DECANTADOR PRIMÁRIO", len: 2.4 },
    { a: T.aer, text: "TANQUE DE AERAÇÃO", len: 2.4 }, { a: T.sec, text: "DECANTADOR SECUNDÁRIO", len: 2.4 }, { a: T.digT, text: "DIGESTOR" },
  ],
  alerts: [T.soque1, T.mas2, T.mas3, T.soque4, T.demais, T.montanha],
  rewinds: [],
  crosses: [],
  stamps: [[T.z1, T.a1], [T.z2, T.a2], [T.z3, T.a3], [T.z4, T.a4], [T.z5, T.a5], [T.z6, T.a6]],
  reward: { a: T.agoraSim, len: T.end - T.agoraSim, top: "AGORA SIM:", big: () => "ZEROU!", sub: "DO VASO AO RIO" },
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.mep, HUD: hud, World, SFX, EXPOSURE: [], CUTS: CUTS10,
  ENV: { bg: "#9fd0ff", fog: "#e6f2ff", fogNear: 330, fogFar: 900, hemiSky: "#eef6ff", hemiGround: "#7cbf4a", hemiI: 1.2, sun: "#fff3dc", sunI: 2.6 },
};
