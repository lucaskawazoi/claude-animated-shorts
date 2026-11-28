// E21 — Moray (ecos-del-tiempo, Shorts). Câmera, o construtor inca, painel e luz deste episódio.
// Ritmo («Sim 66»): 3 aberturas (PROPS open a|b|c), corte duro a cada ~2 s (7 da régua + extras), algo sempre se mexendo,
// ✖ em cada tentativa que falha (a pá, a escavadeira, a terra que a chuva leva, o «río» que não há, a água sem saída, o laboratório sem provas).
// ⚠️ voz estimada: todo instante vem de T (frases ditas), nunca em segundos soltos.
import React from "react";
import { getInputProps } from "remotion";
import { CamState, K, Key, Shot, keyed } from "../../toy/cam";
import { WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { HudData } from "../../toy/hud";
import { V3, lerp, prog } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import type { Costume } from "../../toy/worker";
import { C1, C2, C3, C4, C5, C6, C7, RING_T, SFX, T } from "./cues";
import { EXPOSURE } from "./exposure";
import { AW, DEPTH, DIO, FLOOR, INCA, LAB, N, P, PC, RT, SHV, EXC, STONE_A, STONE_RING, World, hillY, rIn, rOut, yT } from "./world";

type Open = "a" | "b" | "c";
export const OPEN_DEFAULT: Open = "a";
let OPEN: Open | null = null;
export const openOf = (): Open => {
  if (OPEN) return OPEN;
  try { const o = (getInputProps() as { open?: string }).open; OPEN = o === "a" || o === "b" || o === "c" ? o : OPEN_DEFAULT; } catch { OPEN = OPEN_DEFAULT; }
  return OPEN;
};
const DYN = [3.6, 2.4, 4.6, 3.0, 2.0, 2.2, 3.2, 3.4, 2.2, 2.6, 0.3];
const dynAt = (t: number) => { let d = DYN[0]; WINS.forEach((w, i) => { if (t >= w) d = DYN[i]; }); return d; };
/** balanço grande escalado pela DISTÂNCIA ao assunto: plano fechado quase parado, plano aberto balança (cópia do arcos) */
const steady = (c: CamState, t: number): CamState => {
  const dist = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]);
  const d = dynAt(t) * Math.min(1, dist / 18);
  return { ...c, pos: [c.pos[0] - d * 0.7 * Math.sin(t * 0.9 + 9), c.pos[1] - d * 0.2 * Math.sin(t * 1.3 + 4), c.pos[2]], look: [c.look[0] - d * 0.3 * Math.sin(t * 1.1 + 3), c.look[1], c.look[2]] };
};
const shot = (name: string, t0: number, keys: Key[]): Shot => ({ name, t0, keys, fn: (t) => steady(keyed(keys, t), t) });
const hold = (c: number, pos: V3, look: V3, fov = 54, roll = 0) => [K(c - 0.42, pos, look, fov, roll), K(c - 0.02, pos, look, fov, roll)];
const DY = DIO[1];
const dd = (x: number, y: number, z: number): V3 => [DIO[0] + x, DY + y, DIO[2] + z];   // ponto no diorama (corte) do céu
const pp = (a: number, r: number, y: number) => P(a, r, y);
const ringPt = (i: number, a: number, dy = 0) => P(a, (rIn(i) + rOut(i)) / 2, yT(i) + dy);
const ac = (i: number) => Math.PI + 0.9 * (i + 1);
/** a câmera olha a queda que leva a água do anel i ao i+1, de dentro da tigela */
const casc = (i: number): { pos: V3; look: V3 } => ({ pos: P(ac(i) + 0.16, rIn(i) - 7.5, yT(i) + 4), look: P(ac(i), rIn(i), yT(i) - 0.8) });

const OPEN_KEYS: Record<Open, Key[]> = {
  // a) (PADRÃO) alto, a tigela pronta vista de longe, desce girando
  a: [K(0, [46, 128, 98], [0, -8, 0], 54, 2), K(T.pero0 - 0.05, [-24, 114, 86], [0, -8, 0], 54, 0)],
  // b) do fundo plano, olhando para cima pelos anéis, sobe para fora do buraco
  b: [K(0, [3, -17, 7], [0, -8, -32], 72, 1.2), K(0.8, [0, -9, 12], [0, -6, -44], 68, -0.5), K(T.pero0 - 0.05, [-30, 50, 98], [0, -6, 0], 56, 0)],
  // c) mergulho do céu
  c: [K(0, [-96, 160, 176], [0, 0, 0], 52, 2), K(T.pero0 - 0.05, [-34, 78, 100], [0, -8, 0], 56, 0)],
};
const openCam = (t: number) => steady(keyed(OPEN_KEYS[openOf()], t), t);

const SHOTS: Shot[] = [
  { name: "abertura a|b|c: a tigela pronta («parece un cráter»)", t0: 0, keys: OPEN_KEYS.a, fn: openCam },
  shot("«pero no lo cavó nadie»: a pá fincada na borda leva ✖", T.pero0, [
    K(T.pero0, [...pp(1.98, RT + 22, 12)] as V3, [SHV[0], 6, SHV[2]], 56, -1.5), K(T.sola0 - 0.05, [...pp(1.9, RT + 13, 9)] as V3, [SHV[0], 6.5, SHV[2]], 56, 0)]),
  shot("«la tierra se hundió sola»: o remendo de chão afunda, poeira", T.sola0, [
    K(T.sola0, [10, 54, 110], [0, -4, 0], 56, -1), K(T.incas - 0.05, [-6, 42, 98], [0, -12, 0], 56, 0)]),
  shot("«los incas lo convirtieron en un jardín de terrazas redondas»: os anéis nascem de cima para baixo", T.incas, [
    K(T.incas, [-72, 80, 72], [0, -6, 0], 56, 2), K(T.jardin, [-30, 62, 100], [0, -8, 0], 54, 0), K(T.sinmaq - 0.05, [30, 40, 62], [0, -12, 0], 56, 0)]),
  shot("«sin una sola máquina»: a escavadeira de brinquedo leva ✖; ⏪ os anéis somem atrás", T.sinmaq, [
    K(T.sinmaq, [...pp(2.5, RT + 26, 18)] as V3, [EXC[0], 4, EXC[2]], 58, -2), ...hold(C1, [...pp(2.45, RT + 20, 14)] as V3, [EXC[0], 5, EXC[2]], 56, 0)]),
  shot("«Moray, cerca del Cusco, siglo quince»: a tigela nua, o morro e as montanhas", C1, [
    K(C1, [-70, 8, 96], [8, 12, -50], 60, 1.5), K(T.altura - 0.05, [-52, 10, 86], [10, 12, -52], 60, 0)]),
  shot("«más de tres mil cuatrocientos metros»: a régua de altura ao pé das montanhas", T.altura, [
    K(T.altura, [30, 5, 22], [54, 20, -30], 62, 1.5), K(T.suelo - 0.05, [36, 10, 16], [54, 30, -30], 62, 0)]),
  shot("«el suelo es de caliza y yeso»: o corte do solo em duas camadas", T.suelo, [
    K(T.suelo, [3, DY - 4, 50], [0, DY - 5, 0], 56, 1.5), K(T.disuelve - 0.05, [0, DY - 5, 42], [0, DY - 5, 0], 56, 0)]),
  shot("«el agua disuelve la roca por dentro… se derrumba»: chuva, cavidade que cresce, o teto cai", T.disuelve, [
    K(T.disuelve, [0, DY - 2, 50], [0, DY - 3, 0], 56, -1.5), K(T.terreno, [0, DY - 6, 42], [0, DY - 6, 0], 56, 0), ...hold(C2, [-3, DY - 7, 38], [0, DY - 7, 0], 56, 0)]),
  shot("«hacia el hueco»: de cima, o poço C acaba de afundar, poeira", C2, [
    K(C2, [44, 36, 78], [74, -3, 30], 56, 1.5), K(T.quedan - 0.05, [40, 30, 72], [74, -3, 30], 56, 0)]),
  shot("«quedan hoyos enormes»: de longe, a tigela e os outros 3 buracos", T.quedan, [
    K(T.quedan, [0, 140, 270], [0, -8, 34], 60, -1.5), K(T.hondo - 0.05, [14, 130, 255], [0, -8, 34], 60, 0)]),
  shot("«el más hondo de unos treinta metros»: a régua de fundura no centro", T.hondo, [
    K(T.hondo, [14, 12, 56], [0, -9, 0], 58, 1.5), K(T.p1 - 0.05, [6, 7, 47], [0, -9, 2], 58, 0)]),
  shot("«pero en una pared así, la lluvia se lleva la tierra»: de baixo, a parede nua, a chuva, os torrões que descem ✖", T.p1, [
    K(T.p1, [-5, -17, 4], [24, -8, 0], 62, 2), K(T.lluvia, [-2, -16, 2], [26, -6, 0], 62, -1), K(T.b1 - 0.05, [0, -15, 1], [24, -10, 0], 60, 0)]),
  shot("«¿cómo siembras en la pared de un hoyo?»: o construtor pensa na borda", T.b1, [
    K(T.b1, pp(1.2, RT + 9, 3.2), pp(0.95, RT - 3, 2.2), 54, 1.5), ...hold(C3, pp(1.18, RT + 8, 3), pp(0.95, RT - 3, 2.2), 54, 0)]),
  shot("«con ingenio: muros de piedra en círculos»: do alto, de cima para dentro do buraco nu; o muro de pedra cerca o buraco", C3, [
    K(C3, [0, 80, 12], [0, -20, 0], 60, 2), K(T.c1, [-4, 68, 34], [0, -10, 0], 58, 0), K(T.muros, [-9, 64, 44], [0, -10, 0], 58, 0), K(T.pordentro - 0.05, [-5, 60, 54], [0, -10, 0], 58, 0)]),
  shot("«y por dentro, relleno de tierra»: o corte do muro, o aterro sobe até ficar plano", T.pordentro, [
    K(T.pordentro, [-5, DY - 3, 36], [-4.6, DY - 4.6, 0], 56, -1.5), K(T.relleno, [-5, DY - 4, 31], [-4.6, DY - 5, 0], 56, 0), K(T.doce - 0.05, [-4.6, DY - 4.6, 27], [-4.6, DY - 5, 0], 56, 0)]),
  shot("«doce anillos, uno dentro del otro»: os 12 anéis nascem de cima para baixo", T.doce, [
    K(T.doce, [70, 80, -62], [0, -8, 0], 56, -2), K(T.plano - 0.05, [48, 70, -40], [0, -8, 0], 56, 0)]),
  { name: "«cada uno plano» (bola e nível) → «se baja por piedras que sobresalen»: o construtor desce os degraus", t0: T.plano, keys: [], fn: (t) => steady(keyed([
    K(T.plano, pp(4.5, 15.5, yT(7) + 3.2), pp(4.68, 22.8, yT(6) + 0.4), 58, 1.5), K(T.baja - 0.1, pp(4.48, 15.2, yT(7) + 3.0), pp(4.62, 22.8, yT(6) + 0.4), 58, 0),
    K(T.baja + 0.35, pp(STONE_A - 0.2, rIn(STONE_RING) - 6.5, yT(7) + 3.4), pp(STONE_A, rIn(STONE_RING), yT(6) - 0.9), 56, 0), K(T.terraza - 0.05, pp(STONE_A - 0.24, rIn(STONE_RING) - 6.2, yT(7) + 3.0), pp(STONE_A, rIn(STONE_RING) - 0.5, yT(6) - 1.0), 56, 0)], t), t) },
  shot("«esta es la terraza»: a tigela pronta, título", T.terraza, [
    K(T.terraza, [-72, 62, 72], [0, -8, 0], 56, -1.5), ...hold(C4, [-58, 56, 82], [0, -8, 0], 56, 0)]),
  shot("«pero allá arriba no hay un río»: a vala seca e a placa RÍO leva ✖, o morro ao fundo", C4, [
    K(C4, [-24, 7, -58], [-29, 6, -96], 58, 1.5), K(T.solo2 - 0.05, [-27, 5, -76], [-30, 6, -98], 56, 0)]),
  shot("«solo dos manantiales» / «¿cómo riegas cada anillo?»: as duas nascentes borbulham, o construtor pensa", T.solo2, [
    K(T.solo2, [0, 26, -92], [0, 12, -130], 56, 1.5), K(T.b2, [3, 25, -94], [0, 12, -129], 54, 0), K(T.c2 - 0.05, [-4, 24, -95], [0, 12, -129], 54, 0)]),
  shot("«canales que llevan el agua hasta el borde»: a câmera segue o canal das nascentes à borda", T.c2, [
    K(T.c2, [10, 26, -112], [0, 12, -131], 56, -1.5), K(T.borde, [12, 18, -62], [0, 2, -82], 56, 0), ...hold(C5, [10, 12, -32], [0, 1, -46], 56, 0)]),
  { name: "«caídas talladas en la roca… de un círculo al siguiente»: a câmera acompanha a água de queda em queda", t0: C5, keys: [], fn: (t) => {
    const wt = (i: number) => RING_T(i, T.caidas, T.siguienteEnd, 0.3) + 0.3;   // a câmera chega a cada queda quando ela acaba de se formar e fica nela 0,3 s
    const ks: Key[] = []; let last = C5 - 0.01;
    for (const i of [1, 4, 7, 10]) { const q = casc(i), t0 = Math.max(wt(i), last + 0.05); ks.push(K(t0, q.pos, q.look, 56, i === 1 ? 1.5 : 0), K(i === 10 ? T.riego - 0.05 : t0 + 0.3, q.pos, q.look, 56, 0)); last = t0 + 0.3; }
    ks[0] = K(C5, casc(1).pos, casc(1).look, 56, 1.5);
    return steady(keyed(ks, t), t); } },
  shot("«este es el riego»: a tigela viva, título", T.riego, [
    K(T.riego, [62, 82, 72], [0, -8, 0], 56, -1.5), K(T.p3 - 0.05, [50, 72, 84], [0, -8, 0], 56, 0)]),
  shot("«toda esa agua baja al fondo»: no fundo, a água junta", T.p3, [
    K(T.p3, [12, FLOOR + 3.4, 8.5], [-2, FLOOR + 0.6, -2], 62, 1.5), K(T.hoyo - 0.05, [10, FLOOR + 5, 6], [-1, FLOOR + 0.8, -1], 60, 0)]),
  shot("«un hoyo sin salida se llenaría como una olla»: a água hipotética sobe, ✖", T.hoyo, [
    K(T.hoyo, [-30, 72, 84], [0, -10, 0], 56, -1.5), K(T.b3 - 0.05, [20, 58, 96], [0, -12, 0], 56, 0)]),
  shot("«¿a dónde va el agua?»: a mesma tigela cheia, uma volta para o espectador adivinhar", T.b3, [
    K(T.b3, [-52, 64, 82], [0, -12, 0], 56, -1.5), K(T.c3 - 0.05, [-40, 60, 88], [0, -12, 0], 56, 0)]),
  shot("«en el fondo pusieron un filtro de rocas grandes»: CORTE do fundo: o poço abre, 7 rochas grandes caem uma a uma e a água sobe sobre elas", T.c3, [
    K(T.c3, dd(5, 4.5, 25), dd(-0.5, -2.5, -1), 58, 1.5), K(T.pusieron, dd(3, 3, 21), dd(0, -3, -1), 58, 0), K(T.cuela - 0.05, dd(-1, 1.5, 20), dd(0, -3.4, -1), 58, 0)]),
  shot("«el agua se cuela hacia la tierra»: no corte, o nível baixa, a água escorre entre as rochas e escurece o solo embaixo", T.cuela, [
    K(T.cuela, dd(0, -3, 25), dd(0, -5, -1), 58, -1.5), ...hold(C6, dd(0, -5.5, 21), dd(0, -6.5, -1), 58, 0)]),
  shot("«así el hoyo no se inunda»: de fora, o fundo verde e seco, ✔", C6, [
    K(C6, [-40, 46, 62], [0, -14, 0], 58, 1.5), K(T.drenaje - 0.05, [-30, 40, 72], [0, -14, 0], 58, 0)]),
  shot("«este es el drenaje»: a tigela inteira, título", T.drenaje, [
    K(T.drenaje, [52, 64, 62], [0, -8, 0], 56, -1.5), K(T.giro - 0.05, [44, 60, 70], [0, -8, 0], 56, 0)]),
  shot("«y aquí viene el giro»: chicote até a placa «laboratorio» na borda", T.giro, [
    K(T.giro, [0, 92, 102], [0, -8, 0], 56, -8), K(T.giro + 0.5, [72, 42, 62], [34, 4, 8], 56, 5), K(T.fama + 0.2, [76, 9, 17], [47, 6, 0], 56, 0), K(T.donde - 0.05, [62, 6.5, 6], [47, 6.5, 0], 54, 0)]),
  shot("«cada anillo imitaba un clima distinto»: os anéis mudam de cor", T.donde, [
    K(T.donde, [0, 70, 98], [0, -8, 0], 56, -1.5), ...hold(C7, [8, 62, 92], [0, -8, 0], 56, 0)]),
  shot("«es solo una hipótesis»: de dentro, anéis coloridos e a placa carimbada na borda", C7, [
    K(C7, [6, -9, -3], [46, 5.5, -2], 62, 1.5), K(T.hip, [10, -8.5, -2], [47, 6, -1], 56, 0), K(T.equipo - 0.05, [16, -8, -1], [47, 6.5, 0], 54, 0)]),
  shot("«un equipo de ingenieros estudió el sitio durante años»: tripés, trena, medindo a borda", T.equipo, [
    K(T.equipo, [48, 10, 50], [28, 3, 29], 58, 1.5), K(T.anos, [44, 8, 41], [28, 3, 29], 58, 0), K(T.noenc - 0.05, [40, 6, 46], [29, 3, 28], 56, 0)]),
  shot("«y no encontró pruebas»: a placa leva ✖ e cai", T.noenc, [
    K(T.noenc, [62, 4, -14], [47, 6, 0], 56, -1.5), K(T.paraellos - 0.05, [60, 5, -12], [47, 5, 0], 56, 0)]),
  shot("«era más bien un lugar de ceremonias»: as figuras chegam à pedra, o sol no alto, as cores voltam ao verde", T.paraellos, [
    K(T.paraellos, [-10, 8, 82], [0, 12, 40], 62, 1.5), K(T.lugar, [-4, 5, 68], [0, 8, 44], 58, 0), K(T.manda - 0.05, [2, 4, 64], [0, 6, 46], 56, 0)]),
  shot("final: a tigela viva sob o cartão da recompensa", T.manda, [
    K(T.manda, [-44, 70, 168], [0, 6, -20], 54, -1), K(T.end, [44, 74, 172], [0, 6, -20], 54, 0)]),
];

/** posição da câmera no instante t (para os ✖ e os cartazes virarem para ela) */
const camPos = (t: number): V3 => { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x.t0) s = x; return (s.fn ? s.fn(t) : keyed(s.keys, t)).pos; };
const WorldC: React.FC<{ t: number }> = ({ t }) => <World t={t} cam={camPos(t)} />;

export const BUILDER: Costume = INCA;
const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, scale: 1.3, ...o });
const fix = (p: V3): Partial<WorkerState> => ({ follow: () => p });
const hid = S([0, -50, 0], 0, "idle", { scale: 0 });
const W_B1 = pp(1.0, RT + 0.8, 0.02), Y_B1 = 1.0 + Math.PI;
const W_BP = pp(0.0, 0, 0);
const W_SPR: V3 = [0, hillY(0, -127), -127];   // em cima do morro (antes estava enterrado até o peito: só a cabeça aparecia)
const W_PIT: V3 = dd(-6.3, 0, -1.5);   // ao lado do poço, no corte do filtro
// o caminho pelos degraus: tread 6 → pedra 1 → 2 → 3 → tread 7 (as pedras ficam em STONE_A + k·0.05, 0,5 abaixo da borda cada uma)
const stepPt = (k: number): V3 => pp(STONE_A + k * 0.05, rIn(STONE_RING) - (k === 0 ? -0.9 : k === 4 ? 1.0 : 0.15), k === 0 ? yT(6) : k === 4 ? yT(7) : yT(6) - 0.37 - 0.5 * (k - 1));
const WP: [number, V3][] = [[T.baja + 0.05, stepPt(0)], [T.piedras + 0.25, stepPt(1)], [T.sobresalen - 0.05, stepPt(2)], [T.sobresalen + 0.5, stepPt(3)], [T.muro36 + 0.15, stepPt(4)]];
const stairs = (t: number): V3 => {
  let i = 0; for (let k = 0; k < WP.length; k++) if (t >= WP[k][0]) i = k;
  const a = WP[i], b = WP[Math.min(i + 1, WP.length - 1)], u = i === WP.length - 1 ? 1 : Math.min(1, Math.max(0, (t - a[0]) / (b[0] - a[0]) / 0.45));
  const hop = u > 0 && u < 1 ? 0.25 * Math.sin(u * Math.PI) : 0;
  return [lerp(a[1][0], b[1][0], u), lerp(a[1][1], b[1][1], u) + hop, lerp(a[1][2], b[1][2], u)];
};
const YS = STONE_A + Math.PI;
const WORKER: [number, WorkerState][] = [
  [0, hid],
  [T.b1, S(W_B1, Y_B1, "think", fix(W_B1))],
  [C3, hid],
  [T.baja, S(stepPt(0), YS, "present", { scale: 1.15, follow: stairs })],
  [T.sobresalen - 0.05, S(stepPt(0), YS, "walk", { scale: 1.15, follow: stairs })],
  [T.muro36 + 0.3, S(stepPt(4), YS, "cheer", { scale: 1.15, follow: stairs })],
  [T.terraza, hid],
  [T.solo2, S(W_SPR, Math.PI, "point", { scale: 2.6, ...fix(W_SPR) })],
  [T.b2, S(W_SPR, Math.PI, "think", { scale: 2.6, ...fix(W_SPR) })],
  [T.c2, hid],
  [T.c3, S(W_PIT, Math.PI / 2, "chisel", { scale: 1.15, ...fix(W_PIT) })],
  [T.pusieron + 0.2, S(W_PIT, Math.PI / 2, "point", { scale: 1.15, ...fix(W_PIT) })],
  [T.cuela + 0.6, S(W_PIT, Math.PI / 2, "cheer", { scale: 1.15, ...fix(W_PIT) })],
  [C6, hid],
];
void W_BP;

const hud: HudData = {
  pills: [
    { a: T.moray, b: T.altura - 0.1, label: "MORAY · CUSCO ·", value: () => "SIGLO XV", tone: "gold" },
    { a: T.tresmil, b: T.suelo - 0.1, label: "ALTURA", value: () => "+3.400 m", tone: "green" },
    { a: T.caliza, b: T.undia - 0.05, label: "", value: () => "CALIZA", tone: "gold" },
    { a: T.yeso, b: T.undia - 0.05, label: "", value: () => "YESO", tone: "dark", y: 580 },
    { a: T.treinta, b: T.p1 - 0.1, label: "EL MÁS HONDO", value: () => "≈30 m", tone: "gold" },
    { a: T.doce, b: T.piedras, label: "", value: () => "12 ANILLOS", tone: "green" },
    { a: T.dos, b: T.b2 - 0.1, label: "", value: () => "2 MANANTIALES", tone: "green" },
    { a: T.fama + 0.2, b: T.paraellos - 0.1, label: "LA FAMA DICE", value: () => "HIPÓTESIS", tone: "gold" },
  ],
  titles: [{ a: T.terraza, text: "TERRAZA" }, { a: T.riego, text: "RIEGO" }, { a: T.drenaje, text: "DRENAJE" }, { a: T.giro, text: "¡EL GIRO!", len: 1.1 }],
  alerts: [T.p1, T.p2, T.p3],
  rewinds: [T.moray, T.b1, T.b2, T.b3],
  crosses: [], // os ✖ são do mundo
  stamps: [[T.b1, T.c1, "PARED EMPINADA"], [T.b2, T.c2, "SIN RÍO"], [T.b3, T.c3, "SIN SALIDA"]],
  reward: { a: T.manda, len: T.end - T.manda, top: "MORAY · SIGLO XV", big: () => "12 ANILLOS", sub: "LA TIERRA SE HUNDIÓ SOLA" },
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: BUILDER, HUD: hud, World: WorldC, SFX, EXPOSURE,
  ENV: { bg: "#ffe9c6", fog: "#fff2dc", fogNear: 250, fogFar: 820, hemiSky: "#fff6e4", hemiGround: "#d6c49a", hemiI: 1.25, sun: "#fff0d0", sunI: 2.6 },
};
export { T };
void [AW, DEPTH, LAB, N, SHV, EXC, C1, C2, C3, C4, C5, C6, C7, prog, ringPt];
