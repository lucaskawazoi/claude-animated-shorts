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
import { V3, lerp, prog, sstep } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import type { Costume } from "../../toy/worker";
import { C1, C2, C3, C4, C5, C6, C7, RING_T, SFX, T } from "./cues";
import { EXPOSURE } from "./exposure";
import { AW, DEPTH, DIO, FLOOR, FR, INCA, LAB, N, P, PB, PC, RB, RT, SHV, EXC, STONE_A, STONE_RING, World, engCam, hillY, rIn, rOut, yT } from "./world";

type Open = "a" | "b" | "c";
export const OPEN_DEFAULT: Open = "a";
let OPEN: Open | null = null;
export const openOf = (): Open => {
  if (OPEN) return OPEN;
  try { const o = (getInputProps() as { open?: string }).open; OPEN = o === "a" || o === "b" || o === "c" ? o : OPEN_DEFAULT; } catch { OPEN = OPEN_DEFAULT; }
  return OPEN;
};
/** interpola em coordenadas polares em torno do eixo da tigela (ângulo, raio, altura): a câmera dá a volta por dentro em vez de atravessar o centro em linha reta */
const polLerp = (a: V3, b: V3, u: number): V3 => {
  const aa = Math.atan2(a[0], a[2]), d0 = Math.atan2(b[0], b[2]) - aa, d = Math.atan2(Math.sin(d0), Math.cos(d0));
  return P(aa + d * u, lerp(Math.hypot(a[0], a[2]), Math.hypot(b[0], b[2]), u), lerp(a[1], b[1], u));
};
const keyedPolar = (keys: Key[], t: number): CamState => {
  let i = 0; for (let k = 0; k < keys.length - 1; k++) if (t >= keys[k].t) i = k;
  const a = keys[i], b = keys[i + 1] ?? a, u = sstep(prog(t, a.t, b.t));
  return { pos: polLerp(a.pos, b.pos, u), look: polLerp(a.look, b.look, u), fov: lerp(a.fov ?? 60, b.fov ?? 60, u), roll: lerp(a.roll ?? 0, b.roll ?? 0, u) };
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
  shot("«Moray, cerca del Cusco, siglo quince»: voo rápido sobre os picos até a tigela nua; lhamas e o chasqui cruzam", C1, [
    K(C1, [-190, 70, -250], [-40, 0, -60], 62, 3), K(C1 + 0.9, [-72, 8, 94], [8, 12, -50], 60, 0), K(T.altura - 0.05, [-56, 9, 88], [10, 12, -52], 60, 0)]),
  shot("«más de tres mil cuatrocientos metros»: a régua de altura ao pé das montanhas", T.altura, [
    K(T.altura, [30, 5, 22], [54, 20, -30], 62, 1.5), K(T.suelo - 0.05, [36, 10, 16], [54, 30, -30], 62, 0)]),
  shot("«el suelo es de caliza y yeso»: o corte do solo em duas camadas", T.suelo, [
    K(T.suelo, [3, DY - 4, 50], [0, DY - 5, 0], 56, 1.5), K(T.disuelve - 0.05, [0, DY - 5, 42], [0, DY - 5, 0], 56, 0)]),
  shot("«el agua disuelve la roca por dentro… se derrumba»: chuva, cavidade que cresce, o teto cai", T.disuelve, [
    K(T.disuelve, [0, DY - 2, 50], [0, DY - 3, 0], 56, -1.5), K(T.terreno, [0, DY - 6, 42], [0, DY - 6, 0], 56, 0), ...hold(C2, [-3, DY - 7, 38], [0, DY - 7, 0], 56, 0)]),
  shot("«hacia el hueco»: de cima, o poço C acaba de afundar, poeira", C2, [
    K(C2, [44, 36, 78], [74, -3, 30], 56, 1.5), K(T.quedan - 0.05, [40, 30, 72], [74, -3, 30], 56, 0)]),
  shot("«quedan hoyos enormes»: dolly de longe até um buraco, um obreiro minúsculo na borda dá a escala", T.quedan, [
    K(T.quedan, [0, 90, 190], [-60, -4, 30], 60, -1.5), K(T.hoyos + 0.1, [-30, 30, 90], [-66, -3, 24], 58, 0), K(T.hondo - 0.05, [-37, 8, 53], [-64, -2, 21], 58, 0)]),
  shot("«el más hondo de unos treinta metros»: a régua de fundura no centro", T.hondo, [
    K(T.hondo, [14, 12, 56], [0, -9, 0], 58, 1.5), K(T.p1 - 0.05, [6, 7, 47], [0, -9, 2], 58, 0)]),
  shot("«pero en una pared así, la lluvia se lleva la tierra»: de baixo, a parede nua, a chuva, os torrões que descem ✖", T.p1, [
    K(T.p1, [-5, -17, 4], [24, -8, 0], 62, 2), K(T.lluvia, [-2, -16, 2], [26, -6, 0], 62, -1), K(T.b1 - 0.05, [0, -15, 1], [24, -10, 0], 60, 0)]),
  shot("«¿cómo siembras en la pared de un hoyo?»: a parede nua e íngreme de lado, o construtor minúsculo ao pé, a terra ainda desmorona", T.b1, [
    K(T.b1, [-9, FLOOR + 4.2, -14], [22, -11, 0], 62, 1.5), ...hold(C3, [-8, FLOOR + 4.8, -12], [23, -10, 0], 62, 0)]),
  shot("«con ingenio: muros de piedra en círculos»: do alto, de cima para dentro do buraco nu; o muro de pedra cerca o buraco", C3, [
    K(C3, [0, 80, 12], [0, -20, 0], 60, 2), K(T.c1, [-4, 68, 34], [0, -10, 0], 58, 0), K(T.muros, [-9, 64, 44], [0, -10, 0], 58, 0), K(T.pordentro - 0.05, [-5, 60, 54], [0, -10, 0], 58, 0)]),
  shot("«y por dentro, relleno de tierra»: o corte do muro, o aterro sobe até ficar plano", T.pordentro, [
    K(T.pordentro, [-5, DY - 3, 36], [-4.6, DY - 4.6, 0], 56, -1.5), K(T.relleno, [-5, DY - 4, 31], [-4.6, DY - 5, 0], 56, 0), K(T.doce - 0.05, [-4.6, DY - 4.6, 27], [-4.6, DY - 5, 0], 56, 0)]),
  shot("«doce anillos, uno dentro del otro»: os 12 anéis nascem de cima para baixo", T.doce, [
    K(T.doce, [70, 80, -62], [0, -8, 0], 56, -2), K(T.plano - 0.05, [48, 70, -40], [0, -8, 0], 56, 0)]),
  { name: "«cada uno plano» (bola e nível) → «se baja por piedras que sobresalen»: a câmera acompanha o construtor degrau a degrau", t0: T.plano, keys: [], fn: (t) => {
    const base = keyed([
      K(T.plano, pp(4.5, 15.5, yT(7) + 3.2), pp(4.68, 22.8, yT(6) + 0.4), 58, 1.5), K(T.baja - 0.1, pp(4.48, 15.2, yT(7) + 3.0), pp(4.62, 22.8, yT(6) + 0.4), 58, 0)], t);
    if (t < T.baja - 0.1) return steady(base, t);
    const w0 = stairs(t - 0.2), w1 = stairs(t), w2 = stairs(t + 0.2), w: V3 = [(w0[0] + w1[0] + w2[0]) / 3, (w0[1] + w1[1] + w2[1]) / 3, (w0[2] + w1[2] + w2[2]) / 3];
    const s0 = stairs(WP_T0), a = Math.atan2(w[0], w[2]), a0 = Math.atan2(s0[0], s0[2]), r = Math.hypot(w[0], w[2]), fp = P(lerp(a0, a, 0.65) - 0.1, r - 8.4, s0[1] + 3.0 + (w[1] - s0[1]) * 0.3), fl: V3 = [w[0], w[1] + 1.0, w[2]], u = sstep(prog(t, T.baja - 0.1, T.baja + 0.3));
    const m = (x: V3, y: V3): V3 => [lerp(x[0], y[0], u), lerp(x[1], y[1], u), lerp(x[2], y[2], u)];
    return steady({ pos: m(base.pos, fp), look: m(base.look, fl), fov: lerp(base.fov, 60, u), roll: 0 }, t); } },
  shot("«esta es la terraza»: a tigela pronta, título", T.terraza, [
    K(T.terraza, [-72, 62, 72], [0, -8, 0], 56, -1.5), ...hold(C4, [-58, 56, 82], [0, -8, 0], 56, 0)]),
  shot("«pero allá arriba no hay un río»: a vala seca e a placa RÍO leva ✖, o morro ao fundo", C4, [
    K(C4, [-24, 7, -58], [-29, 6, -96], 58, 1.5), K(T.solo2 - 0.05, [-27, 5, -76], [-30, 6, -98], 56, 0)]),
  shot("«solo dos manantiales»: as duas nascentes borbulham e o fio corre um trecho e some na terra seca", T.solo2, [
    K(T.solo2, [2, 38, -78], [0, 8, -122], 58, 1.5), K(T.b2 - 0.05, [-2, 34, -81], [0, 8, -121], 56, 0)]),
  shot("«¿cómo riegas cada anillo?»: terra seca, plantas murchas, os anéis secos lá embaixo, o construtor pensa", T.b2, [
    K(T.b2, [9, 14, -62], [0, -5, -26], 60, -1.5), K(T.c2 - 0.05, [5, 12.5, -59], [0, -6, -26], 58, 0)]),
  shot("«canales que llevan el agua hasta el borde»: a câmera segue o canal das nascentes à borda", T.c2, [
    K(T.c2, [10, 26, -112], [0, 12, -131], 56, -1.5), K(T.borde, [12, 18, -62], [0, 2, -82], 56, 0), ...hold(C5, [10, 12, -32], [0, 1, -46], 56, 0)]),
  { name: "«caídas talladas en la roca… de un círculo al siguiente»: a câmera acompanha a água de queda em queda", t0: C5, keys: [], fn: (t) => {
    const wt = (i: number) => RING_T(i, T.caidas, T.siguienteEnd, 0.3) + 0.3;   // a câmera chega a cada queda quando ela acaba de se formar e fica nela 0,3 s
    const ks: Key[] = []; let last = C5 - 0.01;
    for (const i of [1, 4, 7, 10]) { const q = casc(i), t0 = Math.max(wt(i), last + 0.05); ks.push(K(t0, q.pos, q.look, 56, i === 1 ? 1.5 : 0), K(i === 10 ? T.riego - 0.05 : t0 + 0.3, q.pos, q.look, 56, 0)); last = t0 + 0.3; }
    ks[0] = K(C5, casc(1).pos, casc(1).look, 56, 1.5);
    const cs = steady(keyedPolar(ks, t), t), v: V3 = [cs.pos[0] - cs.look[0], cs.pos[1] - cs.look[1], cs.pos[2] - cs.look[2]], dl = Math.hypot(...v);
    if (dl >= 8) return cs;   // a câmera nunca atravessa o plano do anel ao ir de uma queda à outra: distância mínima ao alvo
    const q: V3 = dl < 0.01 ? [0, 0.4, 1] : v, ql = Math.hypot(...q);
    return { ...cs, pos: [cs.look[0] + (q[0] / ql) * 8, cs.look[1] + (q[1] / ql) * 8, cs.look[2] + (q[2] / ql) * 8] }; } },
  shot("«este es el riego»: a tigela viva, título", T.riego, [
    K(T.riego, [62, 82, 72], [0, -8, 0], 56, -1.5), K(T.p3 - 0.05, [50, 72, 84], [0, -8, 0], 56, 0)]),
  shot("«toda esa agua baja al fondo»: no fundo, a água junta", T.p3, [
    K(T.p3, [12, FLOOR + 3.4, 8.5], [-2, FLOOR + 0.6, -2], 62, 1.5), K(T.hoyo - 0.05, [10, FLOOR + 5, 6], [-1, FLOOR + 0.8, -1], 60, 0)]),
  shot("«un hoyo sin salida se llenaría como una olla»: a água hipotética sobe anel a anel até a borda, ✖ grande", T.hoyo, [
    K(T.hoyo, [10, 56, 44], [0, -12, 0], 58, -1.5), K(T.olla + 0.2, [-26, 80, 82], [0, -8, 0], 56, 0), K(T.b3 - 0.05, [-30, 84, 86], [0, -6, 0], 56, 0)]),
  shot("«¿a dónde va el agua?»: bem rente à água da tigela cheia, a água balança, um ¿? gigante salta", T.b3, [
    K(T.b3, [-30, 9, 56], [0, 3, 0], 58, -1.5), K(T.c3 - 0.05, [-24, 10, 50], [0, 4, 0], 56, 0)]),
  shot("«en el fondo pusieron un filtro de rocas grandes»: CORTE do fundo: o poço abre, 7 rochas grandes caem uma a uma e a água sobe sobre elas", T.c3, [
    K(T.c3, dd(5, 4.5, 25), dd(-0.5, -2.5, -1), 58, 1.5), K(T.pusieron, dd(3, 3, 21), dd(0, -3, -1), 58, 0), K(T.cuela - 0.05, dd(-1, 1.5, 20), dd(0, -3.4, -1), 58, 0)]),
  shot("«el agua se cuela hacia la tierra»: no corte, o nível baixa, a água escorre entre as rochas e escurece o solo embaixo", T.cuela, [
    K(T.cuela, dd(0, -3, 25), dd(0, -5, -1), 58, -1.5), ...hold(C6, dd(0, -5.5, 21), dd(0, -6.5, -1), 58, 0)]),
  shot("«así el hoyo no se inunda»: de dentro da tigela, a calha despeja água que some no fundo verde, ✔ grande", C6, [
    K(C6, P(0.35, 15.5, FLOOR + 9.5), P(Math.PI, FR + 0.8, FLOOR + 3.2), 58, 1.5), K(T.drenaje - 0.05, P(0.1, 13.5, FLOOR + 10.5), P(Math.PI, FR + 1.2, FLOOR + 2.5), 56, 0)]),
  shot("«este es el drenaje»: a tigela inteira, título", T.drenaje, [
    K(T.drenaje, [52, 64, 62], [0, -8, 0], 56, -1.5), K(T.giro - 0.05, [44, 60, 70], [0, -8, 0], 56, 0)]),
  shot("«y aquí viene el giro»: chicote até a placa «laboratorio» na borda", T.giro, [
    K(T.giro, [0, 92, 102], [0, -8, 0], 56, -8), K(T.giro + 0.5, [72, 42, 62], [34, 4, 8], 56, 5), K(T.fama + 0.2, [76, 9, 17], [47, 6, 0], 56, 0), K(T.donde - 0.05, [62, 6.5, 6], [47, 6.5, 0], 54, 0)]),
  shot("«cada anillo imitaba un clima distinto»: os anéis mudam de cor", T.donde, [
    K(T.donde, [0, 70, 98], [0, -8, 0], 56, -1.5), ...hold(C7, [8, 62, 92], [0, -8, 0], 56, 0)]),
  shot("«es solo una hipótesis»: de dentro, anéis coloridos e a placa carimbada na borda", C7, [
    K(C7, [6, -9, -3], [46, 5.5, -2], 62, 1.5), K(T.hip, [10, -8.5, -2], [47, 6, -1], 56, 0), K(T.equipo - 0.05, [16, -8, -1], [47, 6.5, 0], 54, 0)]),
  { name: "«un equipo de ingenieros estudió el sitio durante años»: de perto, 3 engenheiros andam na borda cravando estacas e lendo a trena; o sol cruza o céu 3 vezes", t0: T.equipo, keys: [],
    fn: (t) => { const c = engCam(t); return steady({ pos: c.pos, look: c.look, fov: c.fov, roll: lerp(1.5, 0, prog(t, T.equipo, T.equipo + 0.3)) }, t); } },
  shot("«y no encontró pruebas»: a placa leva ✖ e cai", T.noenc, [
    K(T.noenc, [62, 4, -14], [47, 6, 0], 56, -1.5), K(T.paraellos - 0.05, [60, 5, -12], [47, 5, 0], 56, 0)]),
  shot("«era más bien un lugar de ceremonias»: as figuras chegam à pedra, o sol no alto, as cores voltam ao verde", T.paraellos, [
    K(T.paraellos, [-10, 8, 82], [0, 12, 40], 62, 1.5), K(T.lugar, [-4, 5, 68], [0, 8, 44], 58, 0), K(T.manda - 0.05, [2, 4, 64], [0, 6, 46], 56, 0)]),
  shot("final: a tigela viva sob o cartão da recompensa: água corre, lhamas e figuras em volta", T.manda, [
    K(T.manda, [-60, 50, 134], [0, 8, -8], 56, -1), K(T.manda + 1.9, [0, 38, 118], [0, 6, -8], 56, 0.5), K(T.end, [58, 52, 136], [0, 8, -8], 56, -0.5)]),
];

/** posição da câmera no instante t (para os ✖ e os cartazes virarem para ela) */
const camPos = (t: number): V3 => { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x.t0) s = x; return (s.fn ? s.fn(t) : keyed(s.keys, t)).pos; };
const WorldC: React.FC<{ t: number }> = ({ t }) => <World t={t} cam={camPos(t)} />;

export const BUILDER: Costume = INCA;
const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, scale: 1.3, ...o });
const fix = (p: V3): Partial<WorkerState> => ({ follow: () => p });
const hid = S([0, -50, 0], 0, "idle", { scale: 0 });
const W_B1 = P(AW + 0.05, RB + 1.8, FLOOR + 0.02), Y_B1 = AW;   // ao pé da parede nua, de frente para ela
const W_PBR: V3 = [PB.x + PB.R + 1, 0, PB.z - 6], Y_PBR = Math.atan2(-17, 6);   // na borda do buraco B, para a escala
const W_DRY: V3 = [10, 0, -48];
const W_BP = pp(0.0, 0, 0);
const W_SPR: V3 = [0, hillY(0, -127), -127];   // em cima do morro (antes estava enterrado até o peito: só a cabeça aparecia)
const W_PIT: V3 = dd(-6.3, 0, -1.5);   // ao lado do poço, no corte do filtro
// o caminho pelos degraus: tread 6 → pedra 1 → 2 → 3 → tread 7 (as pedras ficam em STONE_A + k·0.05, 0,5 abaixo da borda cada uma)
const stepPt = (k: number): V3 => pp(STONE_A + k * 0.05, rIn(STONE_RING) - (k === 0 ? -0.9 : k === 4 ? 1.0 : 0.15), k === 0 ? yT(6) : k === 4 ? yT(7) : yT(6) - 0.37 - 0.5 * (k - 1));
const WP_T0 = T.baja + 0.05, WP_T1 = T.muro36 - 0.05;   // um degrau a cada ≈0,55 s, do «baja» ao fim de «del muro»
const WP: [number, V3][] = [0, 1, 2, 3, 4].map((k): [number, V3] => [lerp(WP_T0, WP_T1, k / 4), stepPt(k)]);
const stairs = (t: number): V3 => {
  let i = 0; for (let k = 0; k < WP.length; k++) if (t >= WP[k][0]) i = k;
  const a = WP[i], b = WP[Math.min(i + 1, WP.length - 1)], u = i === WP.length - 1 ? 1 : Math.min(1, Math.max(0, (t - a[0]) / (b[0] - a[0]) / 0.7));
  const hop = u > 0 && u < 1 ? 0.25 * Math.sin(u * Math.PI) : 0;
  return [lerp(a[1][0], b[1][0], u), lerp(a[1][1], b[1][1], u) + hop, lerp(a[1][2], b[1][2], u)];
};
const YS = STONE_A + Math.PI, YW = STONE_A + 2.36;   // YW: andando de lado, de três quartos para a câmera
const WORKER: [number, WorkerState][] = [
  [0, hid],
  [T.quedan, S(W_PBR, Y_PBR, "point", { scale: 2.0, ...fix(W_PBR) })],
  [T.hondo, hid],
  [T.b1, S(W_B1, Y_B1, "think", { scale: 1.5, ...fix(W_B1) })],
  [T.b1 + 0.75, S(W_B1, Y_B1, "point", { scale: 1.5, ...fix(W_B1) })],
  [C3, hid],
  [T.baja, S(stepPt(0), YW, "walk", { scale: 1.3, follow: stairs })],
  [T.muro36 + 0.3, S(stepPt(4), YW, "cheer", { scale: 1.3, follow: stairs })],
  [T.terraza, hid],
  [T.solo2, S(W_SPR, Math.PI, "point", { scale: 2.6, ...fix(W_SPR) })],
  [T.b2, S(W_DRY, Math.PI, "think", { scale: 1.6, ...fix(W_DRY) })],
  [T.c2, hid],
  [T.c3, S(W_PIT, Math.PI / 2, "chisel", { scale: 1.15, ...fix(W_PIT) })],
  [T.pusieron + 0.2, S(W_PIT, Math.PI / 2, "point", { scale: 1.15, ...fix(W_PIT) })],
  [T.cuela + 0.6, S(W_PIT, Math.PI / 2, "cheer", { scale: 1.15, ...fix(W_PIT) })],
  [C6, hid],
];
void W_BP;

/** estrelinhas do final: só na faixa de baixo (y 720–1290), nunca atrás do cartão de texto no alto */
const Sparks: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.manda) return null;
  const cols = ["#ffd400", "#5cff7a", "#4ab8ff", "#ff6bb5", "#ffffff"];
  return <div style={{ position: "absolute", inset: 0 }}>{Array.from({ length: 18 }, (_, i) => {
    const u = ((t - T.manda) * 0.55 + i / 18) % 1, x = 40 + ((i * 163) % 960), y = 1290 - u * 570;
    return <span key={i} style={{ position: "absolute", left: x, top: y, fontSize: 46 + (i % 3) * 12, color: cols[i % 5], opacity: Math.sin(Math.PI * u), textShadow: "0 0 0 #1c1208, 2px 2px 0 #1c1208" }}>★</span>;
  })}</div>;
};

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
  reward: { a: T.manda, len: T.end - T.manda, top: "MORAY · SIGLO XV", big: () => "12 ANILLOS", sub: "LA TIERRA SE HUNDIÓ SOLA", stars: false },
  Extra: Sparks,
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: BUILDER, HUD: hud, World: WorldC, SFX, EXPOSURE,
  ENV: { bg: "#ffe9c6", fog: "#fff2dc", fogNear: 250, fogFar: 820, hemiSky: "#fff6e4", hemiGround: "#d6c49a", hemiI: 1.25, sun: "#fff0d0", sunI: 2.6 },
};
export { T };
void [AW, DEPTH, LAB, N, SHV, EXC, C1, C2, C3, C4, C5, C6, C7, prog, ringPt];
