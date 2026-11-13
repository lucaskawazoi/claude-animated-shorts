// E15 — Angkor Wat (ecos-del-tiempo, Shorts). Câmera, operário, painel e luz deste episódio.
// Ritmo do lote 3: corte duro a cada ~4 s (os 7 da régua + 13 extras), chicote na entrada de todo plano, câmera sempre andando,
// uma tentativa que dá errado com ✖ (a torre na areia seca afunda e entorta) e três aberturas por getInputProps().open.
import React from "react";
import { CamState, K, Key, Shot, keyed } from "../../toy/cam";
import { CUTS, WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { FONT, HudData, count, pop, stroke, win } from "../../toy/hud";
import { V3, ease, lerp, prog } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { LIFT0, MOT1, SFX, SINK0, SINK1, SIT_T, T, XC, XR } from "./cues";
import { Open, OPEN } from "./open";
import { BASIN, CORE0, H2, H3, KHMER, LAT0, MC, SEC0, SIT_P, WALL0, WK12, World, raftB, raftX4 } from "./world";
import { EXPOSURE } from "./exposure";

const PI = Math.PI;
const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
const W3 = WINS[3], W6 = WINS[6], W10 = WINS[10];
const [X1, X2, X3, X4, X5, X6, X7, X8, X9, X10, X11, X12, X13] = XC;
const off = (o: V3) => (x: number, y: number, z: number): V3 => [o[0] + x, o[1] + y, o[2] + z];
const SEC = off(SEC0), LAT = off(LAT0), CORE = off(CORE0), WALL = off(WALL0);
/** fim de plano antes de um corte da régua: 0,4 s parado (a régua precisa ver a troca) */
const hold = (c: number, pos: V3, look: V3, fov = 56, roll = 0): Key[] => [K(c - 0.42, pos, look, fov, roll), K(c - 0.02, pos, look, fov, roll)];

/** a balsa do plano X4 desce o canal; a câmera vai ao lado dela, rente à margem */
const raftCam = (t: number): CamState => {
  const r = raftX4(t), yaw = r.yaw, D: V3 = [Math.sin(yaw), 0, Math.cos(yaw)], R: V3 = [Math.cos(yaw), 0, -Math.sin(yaw)];
  const u = ease(t, X4, C3), side = lerp(8.6, 7.0, u), back = lerp(-4.0, 0.5, u), up = lerp(2.2, 3.0, u);
  const pos: V3 = [r.p[0] + R[0] * side + D[0] * back, up, r.p[2] + R[2] * side + D[2] * back];
  const look: V3 = [r.p[0] + D[0] * 1.0, 1.0, r.p[2] + D[2] * 1.0];
  const roll = lerp(3, 0.5, ease(t, X4, X4 + 0.45)) + 0.8 * Math.sin(t * 1.3);
  return { pos, look, fov: 54, roll };
};

/** golpe de câmera: tranco curto que some em ~0,4 s */
const jolt = (t: number, at: number[]) => at.reduce((s, a) => s + (t >= a && t < a + 0.6 ? Math.exp(-(t - a) * 8) * Math.sin((t - a) * 40) : 0), 0);
const X5K: Key[] = [
  K(X5, SEC(0.4, 7.6, 17.4), SEC(2.4, 5.3, 0.0), 56, -3), K(X5 + 0.45, SEC(0.9, 7.1, 16.6), SEC(2.5, 5.2, 0.0), 56, 0.5),
  K(T.bajo, SEC(1.5, 7.4, 15.9), SEC(2.6, 6.0, 0.0), 56, -0.5), K(SINK0, SEC(1.9, 7.0, 15.3), SEC(2.7, 5.5, 0.0), 56, 0.5),
  K(T.b2, SEC(2.4, 6.6, 15.0), SEC(2.8, 5.4, 0.0), 56, -0.5), K(X6 - 0.05, SEC(2.8, 7.6, 15.6), SEC(2.7, 6.8, 0.0), 56, 0)];

/** as três aberturas (0 → X1), cada uma já em ação no quadro 0 */
const OPENING: Record<Open, Shot> = {
  a: { name: "abertura a: a obra se arma sozinha, blocos voando para os terraços que sobem", t0: 0, keys: [
    K(0, [15.0, 9.0, 24.0], [0.0, 3.5, 3.0], 58, 5), K(0.8, [11.0, 9.5, 28.0], [0.0, 5.0, 2.0], 58, -2),
    K(1.6, [5.0, 8.0, 32.5], [0.0, 7.5, 0.0], 58, 2), K(X1 - 0.04, [1.2, 6.2, 34.6], [0.0, 9.5, 0.0], 56, -1)] },
  b: { name: "abertura b: rente à água do fosso, passando a balsa, e sobe por cima do muro até as cinco torres", t0: 0, keys: [
    K(0, [-24.0, 0.5, 31.6], [-8.0, 0.6, 29.0], 62, 5), K(0.9, [-12.0, 0.7, 31.6], [0.0, 1.6, 26.0], 62, -3),
    K(1.6, [-4.0, 4.5, 31.8], [0.0, 7.0, 10.0], 60, 3), K(X1 - 0.04, [-1.2, 8.0, 32.4], [0.0, 9.5, 0.0], 58, 0)] },
  c: { name: "abertura c: do rosto do operário a câmera recua e o templo cresce; ele cai sentado", t0: 0, keys: [
    K(0, [0.8, 1.7, 20.8], [0.0, 1.6, 16.6], 54, 3), K(0.6, [1.6, 3.2, 22.0], [0.0, 2.2, 15.6], 55, -2),
    K(1.05, [5.6, 4.6, 25.6], [1.0, 3.0, 14.0], 57, 1), K(SIT_T + 0.15, [6.4, 4.8, 26.6], [1.0, 2.6, 14.2], 57, 0),
    K(1.75, [13.0, 8.6, 42.0], [0.0, 10.2, 0.0], 58, -1), K(X1 - 0.04, [14.2, 9.0, 44.5], [0.0, 10.5, 0.0], 58, 0)] },
};

const SHOTS: Shot[] = [
  OPENING[OPEN],
  { name: "de lado, perto das torres: milhões de blocos → desce até a base na areia", t0: X1, keys: [
    K(X1, [17.5, 13.5, 13.0], [2.0, 11.5, 2.0], 56, -3), K(X1 + 0.45, [17.0, 12.0, 13.5], [2.0, 10.0, 2.0], 56, 0.5),
    K(T.todo0, [18.5, 5.5, 18.5], [10.0, 2.0, 10.0], 56, -0.5), K(T.arena0, [18.5, 2.6, 19.5], [13.0, 0.3, 12.5], 58, 1),
    K(X2 - 0.05, [18.2, 2.4, 19.2], [13.0, 0.2, 12.5], 58, 0)] },
  { name: "do alto, de frente: ⏪ 900 anos — o templo se desmonta e o fosso escoa", t0: X2, keys: [
    K(X2, [24.0, 26.0, 52.0], [0.0, 5.0, 0.0], 58, 3), K(X2 + 0.45, [22.0, 25.0, 50.0], [0.0, 4.5, 0.0], 58, -0.5),
    K(T.novecientos + 0.3, [16.0, 17.0, 47.0], [0.0, 2.0, 16.0], 58, 0.5), K(T.nohay, [6.5, 7.5, 40.0], [-0.2, 0.8, 29.6], 56, -0.5),
    ...hold(C1, [5.8, 7.0, 39.0], [-0.2, 0.8, 29.6], 56, 0)] },
  { name: "rente ao chão na obra: o bloco nos rolos, pedra, madeira, corda e muita gente", t0: C1, keys: [
    K(C1, [-18.5, 1.7, 31.0], [-6.0, 1.4, 18.5], 56, 3), K(C1 + 0.45, [-17.8, 2.0, 30.0], [-6.0, 1.3, 18.5], 56, -0.5),
    K(T.piedra, [-15.5, 2.3, 28.5], [-3.5, 1.0, 18.0], 56, 0.5), K(T.cuerda, [-14.0, 2.6, 29.5], [-6.0, 0.8, 22.0], 56, -0.5),
    K(T.manos, [-13.5, 3.6, 31.5], [-4.0, 1.2, 21.5], 58, 0.5), K(X3 - 0.05, [-13.0, 4.2, 32.5], [-3.0, 1.4, 21.0], 58, 0)] },
  { name: "atrás do rei: o templo fantasma sobe, a montanha sagrada → olha para o Kulen no horizonte", t0: X3, keys: [
    K(X3, [17.6, 2.3, 41.2], [3.0, 5.5, 3.0], 58, -3), K(X3 + 0.45, [17.2, 2.5, 40.6], [3.0, 5.8, 3.0], 58, 0.5),
    K(T.templo, [16.6, 2.7, 40.2], [2.0, 7.5, 2.0], 58, -0.5), K(T.sagrada + 0.3, [15.5, 3.4, 39.5], [0.0, 11.0, 0.0], 60, 0.5),
    K(T.p1 + 0.3, [13.5, 3.0, 39.0], [-10.0, 6.0, -150.0], 60, -0.5), ...hold(C2, [13.0, 3.2, 38.8], [-12.0, 6.0, -170.0], 60, 0)] },
  { name: "o mapa: templo embaixo, Kulen em cima → chicote até a pedreira → a água desce o canal", t0: C2, keys: [
    K(C2, [-6.0, 205.0, 82.0], [-13.0, 0.0, -34.0], 62, -3), K(C2 + 0.45, [-7.0, 218.0, 76.0], [-13.5, 0.0, -37.0], 62, 0.5),
    K(W3 - 0.02, [-8.0, 230.0, 70.0], [-14.0, 0.0, -40.0], 62, 0), K(W3 + 0.5, [-22.0, 45.0, -68.0], [-12.0, 0.0, -116.0], 56, 4),
    K(T.c1, [-24.0, 40.0, -72.0], [-12.0, 0.0, -116.0], 56, -1), K(T.agua - 0.05, [-26.0, 42.0, -74.0], [-14.0, 0.0, -114.0], 56, 0),
    K(X4 - 0.05, [-34.0, 150.0, 12.0], [-26.0, 0.0, -62.0], 60, 0)] },
  { name: "rente à margem: a balsa com blocos desce o canal (HIPÓTESIS)", t0: X4, keys: [K(X4, [0, 0, 0], [0, 0, 1])], fn: raftCam },
  { name: "do alto, o porto: a fila de balsas chega e o bloco sobe o barranco", t0: C3, keys: [
    K(C3, [-58.0, 13.0, -38.0], [-40.0, 0.0, -19.0], 56, 3), K(C3 + 0.45, [-57.0, 12.0, -36.5], [-40.0, 0.0, -19.5], 56, -0.5),
    K(T.estosCanales, [-56.0, 12.5, -34.0], [-38.0, 0.0, -20.0], 56, 0.5), K(X5 - 0.05, [-55.0, 13.0, -32.5], [-37.0, 0.0, -20.0], 56, 0)] },
  { name: "corte da areia seca: o peso → a torre afunda e entorta (✖) → ⏪ volta, balança no carimbo e firma", t0: X5, keys: X5K, fn: (t) => {
    const c = keyed(X5K, t), j = jolt(t, [T.b2 + 0.06, T.c2]);
    return { ...c, pos: [c.pos[0], c.pos[1] + 0.22 * j, c.pos[2]], fov: c.fov - 1.5 * Math.abs(j), roll: c.roll + 2.5 * j };
  } },
  { name: "do alto: o fosso enche em volta de todo o templo (~200 m)", t0: X6, keys: [
    K(X6, [-40.0, 58.0, 78.0], [0.0, 0.0, -4.0], 58, 3), K(X6 + 0.45, [-37.0, 62.0, 76.0], [0.0, 0.0, -4.0], 58, -0.5),
    K(T.doscientos, [-30.0, 66.0, 74.0], [0.0, 0.0, -2.0], 58, 0.5), ...hold(C4, [-24.0, 70.0, 72.0], [0.0, 0.0, 0.0], 58, 0)] },
  { name: "corte com o fosso: a água entra e a areia fica úmida até debaixo da torre (HIPÓTESIS)", t0: C4, keys: [
    K(C4, SEC(-4.0, 6.5, 15.5), SEC(-1.0, 4.0, 0.0), 56, 3), K(C4 + 0.45, SEC(-3.4, 6.0, 15.0), SEC(-0.8, 3.8, 0.0), 56, -0.5),
    K(T.humeda, SEC(-1.5, 5.6, 14.6), SEC(1.0, 3.6, 0.0), 56, 0.5), K(T.todoAno, SEC(0.5, 6.2, 15.0), SEC(2.5, 4.4, 0.0), 56, -0.5),
    K(X7 - 0.05, SEC(1.2, 6.4, 15.2), SEC(2.8, 4.8, 0.0), 56, 0)] },
  { name: "⏪ de novo, de perto: o peso não move a torre → o fosso → chicote", t0: X7, keys: [
    K(X7, SEC(5.2, 9.8, 11.4), SEC(2.8, 6.8, 0.0), 54, -3), K(X7 + 0.45, SEC(4.6, 9.4, 10.8), SEC(2.6, 6.8, 0.0), 54, 0.5),
    K(T.esteFoso - 0.1, SEC(2.4, 8.8, 11.2), SEC(0.6, 6.2, 0.0), 54, -0.5), K(T.esteFoso + 0.45, SEC(-3.2, 7.6, 12.6), SEC(-5.8, 4.8, 0.0), 54, 0.5),
    K(W6 - 0.02, SEC(-3.6, 7.5, 12.8), SEC(-6.0, 4.8, 0.0), 54, 0), K(W6 + 0.35, SEC(-6.8, 11.6, 9.4), SEC(-6.0, 4.6, -4.0), 58, 4),
    ...hold(C5, SEC(-6.9, 11.7, 9.4), SEC(-6.0, 4.6, -4.0), 58, 4)] },
  { name: "rente à bacia: a fila de balsas some no horizonte → o templo fantasma, enorme", t0: C5, keys: [
    K(C5, [-41.5, 1.6, -12.5], [-44.0, 1.0, -60.0], 56, -3), K(C5 + 0.45, [-41.0, 1.8, -13.0], [-44.0, 1.0, -60.0], 56, 0.5),
    K(T.lejos + 0.3, [-40.5, 2.0, -13.5], [-44.5, 1.2, -70.0], 56, -0.5), K(T.tanGrande, [-40.0, 2.4, -14.0], [-10.0, 8.0, -4.0], 58, 2),
    K(T.necesita, [-41.0, 3.0, -15.5], [-8.0, 9.0, -2.0], 60, -0.5), K(X8 - 0.05, [-42.0, 3.4, -17.0], [-6.0, 9.5, 0.0], 60, 0)] },
  { name: "terraço em corte: o núcleo de laterita, o que não se vê", t0: X8, keys: [
    K(X8, CORE(8.5, 7.5, 10.0), CORE(0.0, 1.5, 0.0), 56, -3), K(X8 + 0.45, CORE(8.0, 7.0, 9.5), CORE(0.0, 1.4, 0.0), 56, 0.5),
    K(T.laterita, CORE(7.2, 6.4, 9.0), CORE(0.0, 1.8, 0.0), 56, -0.5), K(X9 - 0.05, CORE(6.8, 6.0, 8.6), CORE(0.0, 1.8, 0.0), 56, 0)] },
  { name: "no barranco de laterita: a pá entra mole → o bloco sai balançando → endurece ao ar", t0: X9, keys: [
    K(X9, LAT(-2.6, 2.4, 7.5), LAT(0.5, 1.2, 1.4), 54, 3), K(X9 + 0.45, LAT(-2.2, 2.2, 7.0), LAT(0.5, 1.3, 1.5), 54, -0.5),
    K(T.blanda, LAT(-1.4, 2.0, 6.4), LAT(0.4, 1.3, 1.8), 54, 0.5), K(T.endurece, LAT(-1.0, 1.6, 5.8), LAT(0.3, 0.7, 2.4), 52, -0.5),
    K(X10 - 0.05, LAT(-0.6, 1.5, 5.6), LAT(0.3, 0.6, 2.5), 52, 0)] },
  { name: "a pele de arenisca talhada cobre o núcleo → raio-x: o recheio", t0: X10, keys: [
    K(X10, CORE(-1.5, 1.9, 8.2), CORE(0.4, 1.5, 3.4), 54, 3), K(X10 + 0.45, CORE(-1.0, 1.8, 7.8), CORE(0.4, 1.5, 3.4), 54, -0.5),
    K(XR - 0.05, CORE(0.4, 2.3, 8.9), CORE(0.8, 1.4, 2.6), 55, 0.5)] },
  { name: "de cima, de lado: raio-x — a pele de arenisca fica transparente e o recheio de laterita acende", t0: XR, keys: [
    K(XR, CORE(-5.8, 6.0, 10.6), CORE(0.4, 1.4, 0.0), 56, 3), K(XR + 0.45, CORE(-5.4, 5.7, 10.2), CORE(0.4, 1.4, 0.0), 56, -0.5),
    K(T.esteRelleno, CORE(-5.0, 5.5, 10.0), CORE(0.4, 1.4, 0.0), 56, -0.5),
    K(T.p4 + 0.2, CORE(-6.0, 6.0, 10.5), CORE(0.4, 1.6, 0.0), 56, 0.5), ...hold(C6, CORE(-6.2, 6.1, 10.6), CORE(0.4, 1.6, 0.0), 56, 0)] },
  { name: "no terraço de cima: o bloco de 1 t e a torre lá no alto → o cinzel abre os furos (HIPÓTESIS)", t0: C6, keys: [
    K(C6, [7.0, 8.2, 15.0], [0.0, 12.5, 2.0], 58, -3), K(C6 + 0.45, [6.4, 8.6, 14.2], [0.0, 12.8, 2.0], 58, 0.5),
    K(T.alto + 0.3, [5.6, 9.0, 13.0], [0.0, 14.5, 2.0], 58, -0.5), K(T.prob + 0.3, [2.8, 10.6, 8.2], [0.1, 9.7, 4.4], 50, 0.5),
    K(T.pequenos, [1.8, 10.7, 7.4], [0.0, 9.6, 4.6], 46, -0.5), K(X11 - 0.05, [1.5, 10.6, 7.2], [0.0, 9.6, 4.6], 46, 0)] },
  { name: "do outro lado: as estacas entram, as cordas amarram → o bloco sobe até a torre", t0: X11, keys: [
    K(X11, [-2.6, 10.0, 7.0], [0.0, 9.6, 4.6], 48, 3), K(X11 + 0.45, [-2.3, 9.9, 6.8], [0.0, 9.6, 4.6], 48, -0.5),
    K(T.atarlos, [-2.4, 10.4, 7.2], [0.0, 10.1, 4.6], 50, 0.5), K(LIFT0, [-2.8, 11.0, 7.8], [0.0, 10.4, 4.6], 54, -0.5),
    ...hold(C7, [-3.8, 12.6, 9.6], [0.0, 12.4, 4.4], 58, 0.5)] },
  { name: "hoje: o muro gasto, e os furos ainda lá", t0: C7, keys: [
    K(C7, WALL(-1.6, 2.0, 5.2), WALL(0.0, 2.2, 0.5), 56, -3), K(C7 + 0.45, WALL(-1.2, 2.1, 5.0), WALL(0.2, 2.3, 0.5), 56, 0.5),
    K(T.estosAg, WALL(0.4, 2.4, 4.6), WALL(0.9, 2.4, 0.5), 54, -0.5), K(X12 - 0.05, WALL(1.0, 2.6, 4.4), WALL(1.2, 2.4, 0.5), 52, 0)] },
  { name: "o giro: monges na calçada, séculos passando, a selva cresce", t0: X12, keys: [
    K(X12, [7.0, 2.8, 47.5], [0.5, 3.2, 26.0], 56, 3), K(X12 + 0.45, [6.8, 2.9, 47.0], [0.5, 3.3, 26.0], 56, -0.5),
    K(T.monjes, [7.5, 3.0, 45.0], [0.0, 3.0, 22.0], 56, 0.5), K(T.siglo, [8.5, 5.0, 47.0], [0.0, 8.0, 0.0], 58, -0.5),
    K(X13 - 0.05, [10.5, 7.0, 50.0], [0.0, 9.0, 0.0], 60, 0.5)] },
  { name: "a bandeira do Camboja na frente do templo → chicote para o castelo de areia na margem", t0: X13, keys: [
    K(X13, [-1.9, 3.6, 54.0], [-2.6, 3.6, 30.0], 56, -3), K(X13 + 0.45, [-1.8, 3.9, 53.8], [-2.4, 4.6, 30.0], 56, 0.5),
    K(T.bandera, [-1.6, 5.2, 53.4], [-1.4, 8.4, 28.0], 56, -0.5), K(W10 - 0.02, [-1.5, 5.3, 53.0], [-1.3, 8.6, 27.0], 56, 0),
    K(W10 + 0.5, [3.0, 2.3, 42.0], [5.2, 0.8, 37.3], 52, 3), K(T.castillos, [3.4, 2.1, 41.4], [5.2, 0.7, 37.3], 50, 0.5),
    K(T.end, [2.6, 2.8, 42.8], [5.0, 0.9, 37.3], 52, 0)] },
];
// dinamismo por janela da régua (whips nas janelas 3 e 7 da referência; o fim, calmo)
const DYN = [0.9, 1.0, 3.0, 1.1, 0.8, 0.7, 3.2, 0.8, 0.6, 0.9, 0.2];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const OPEN_W: Record<Open, [number, WorkerState][]> = {
  a: [[0, S([-2.4, 0.4, 30.2], 0.5, "cheer")]],
  b: [[0, S([0, 0, 0], PI / 2, "point", { follow: (t) => { const r = raftB(t); return [r[0] + 1.6, -0.35 + 0.4, r[2]]; } })]],
  // pula de susto (0,95) e cai sentado na areia (SIT_T): quadril no chão = pernas enterradas + poeira
  c: [[0, S([0, 0, 16.6], 0, "alarm")], [0.95, S([0, 0, SIT_P[2]], 0, "alarm", { follow: (t) => { const u = prog(t, 0.95, SIT_T); return [0, 0.8 * Math.sin(PI * u) - 0.62 * ease(t, SIT_T - 0.12, SIT_T), lerp(16.6, SIT_P[2], ease(t, 0.95, SIT_T))]; } })],
    [SIT_T, S([0, -0.62, SIT_P[2]], 0, "belly")]],
};
const r4 = (t: number): V3 => { const r = raftX4(t), D: V3 = [Math.sin(r.yaw), 0, Math.cos(r.yaw)]; return [r.p[0] + D[0] * 1.7, 0.36, r.p[2] + D[2] * 1.7]; };
const secHop = (t: number): V3 => { const u = ease(t, SINK0 + 0.05, SINK0 + 0.45); return SEC(lerp(6.0, 7.0, u), 6 + 0.9 * Math.sin(PI * prog(t, SINK0 + 0.05, SINK0 + 0.45)), lerp(0.9, 1.4, u)); };
const secJump = (t: number): V3 => { const u = ease(t, X7 + 0.1, X7 + 0.5); return SEC(lerp(5.7, 4.2, u), lerp(6, 7.4, u) + 0.9 * Math.sin(PI * prog(t, X7 + 0.1, X7 + 0.5)), lerp(1.0, 1.2, u)); };
const WORKER: [number, WorkerState][] = [
  ...OPEN_W[OPEN],
  [X1, S([14.3, 0, 11.2], 0.4, "present")], [T.arena0, S([14.3, 0, 11.2], 0.4, "point")],
  [X2, S([1.0, 0.4, 30.4], 0.4, "alarm")], [T.nohay, S([1.0, 0.4, 30.4], 0.4, "present")], [MOT1, S([1.0, 0.4, 30.4], -0.9, "point")],
  [C1, S([-10.5, 0, 25.5], -0.97, "present")], [T.piedra, S([-10.5, 0, 25.5], 2.42, "point")], [T.cuerda, S([-10.5, 0, 25.5], 0.6, "point")], [T.manos, S([-10.5, 0, 25.5], -0.97, "cheer")],
  [X3, S([8.0, 0, 29.4], -2.88, "present")], [T.templo, S([8.0, 0, 29.4], -2.88, "point")], [T.p1, S([8.0, 0, 29.4], -2.88, "alarm")],
  [C2, S([-8.0, 0.3, -111.0], 0, "cheer", { scale: 2.2 })],
  [X4, S([0, 0, 0], 0, "point", { follow: r4 })], [T.viajan, S([0, 0, 0], 0, "cheer", { follow: r4 })],
  [C3, S([BASIN[0] + 7.0, 0, BASIN[2] + 2.4], -2.2, "cheer")], [T.estosCanales, S([BASIN[0] + 7.0, 0, BASIN[2] + 2.4], -2.2, "present")],
  [X5, S(SEC(6.0, 6, 0.9), -0.4, "present")], [T.bajo, S(SEC(6.0, 6, 0.9), -PI / 2, "point")],
  [SINK0 + 0.05, S(SEC(7.0, 6, 1.4), -PI / 2, "alarm", { follow: secHop })], [SINK0 + 0.45, S(SEC(7.0, 6, 1.4), -PI / 2, "alarm")],
  [T.b2, S(SEC(7.0, 6, 1.4), -0.6, "think")], [T.c2, S(SEC(7.0, 6, 1.4), -0.6, "cheer")],
  [X6, S([1.2, 0.4, 31.0], 2.6, "point")],
  [C4, S(SEC(5.7, 6, 1.0), -PI / 2, "point")], [T.todoAno, S(SEC(5.7, 6, 1.0), -0.3, "present")],
  [X7 + 0.1, S(SEC(4.2, 7.4, 1.2), -0.3, "cheer", { follow: secJump })], [X7 + 0.5, S(SEC(4.2, 7.4, 1.2), -0.3, "cheer")], [T.esteFoso, S(SEC(4.2, 7.4, 1.2), -PI / 2, "point")],
  [C5, S([-44.0, 0.38, -19.6], 0.4, "present")], [T.tanGrande, S([-44.0, 0.38, -19.6], 1.2, "think")],
  [X8, S(CORE(3.75, 0, 2.6), -PI / 2, "chisel", { prop: "hammer" })], [T.laterita - 0.05, S(CORE(5.0, 0, 3.4), -0.9, "alarm")],
  [X9, S(LAT(2.3, 0, 2.9), -1.86, "point")], [T.aire - 0.1, S(LAT(2.3, 0, 2.9), -1.86, "chisel", { prop: "hammer" })],
  [X10, S(CORE(-4.4, 0, 4.6), 0.6, "present")], [T.seVe, S(CORE(-4.4, 0, 4.6), 2.2, "point")], [T.esteRelleno, S(CORE(-4.4, 0, 4.6), 0.6, "cheer")], [T.p4, S(CORE(-4.4, 0, 4.6), 0.6, "alarm")],
  [C6, S([-1.6, H3, 4.0], PI / 2, "point")], [T.tallan - 0.15, S([-1.6, H3, 4.0], PI / 2, "chisel", { prop: "hammer" })],
  [X11, S([1.6, H3, 4.0], -PI / 2, "present")], [T.subirlos, S([1.6, H3, 4.0], -0.6, "cheer")],
  [C7, S(WALL(2.4, 0, 1.6), -2.68, "point")],
  [X12, S(WK12, 0.3, "present")],
  // «y el giro»: ele gira duas voltas e fica tonto até os monges passarem
  ...Array.from({ length: 12 }, (_, k): [number, WorkerState] => [T.giro + 0.15 + k * 0.05, S(WK12, 0.3 + ((k + 1) * PI) / 3, "alarm")]),
  [T.giro + 0.8, S(WK12, 0.3, "think")], [T.monjes, S(WK12, -0.5, "point")], [T.siglo, S(WK12, -0.6, "think")],
  [X13, S([-3.6, 0, 39.1], -1.1, "pull")], [T.bandera + 0.35, S([7.4, 0, 35.6], -1.2, "pour", { prop: "jar" })], [T.manda, S([7.4, 0, 35.6], -0.5, "cheer")],
];
void H2; void MC;

const HAVE: [number, string][] = [[T.piedra, "PIEDRA"], [T.madera, "MADERA"], [T.cuerda, "CUERDA"], [T.manos, "MILES DE MANOS"]];
const MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
const SIGLOS = ["XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];
const hyp = (t: number) => Math.max(win(t, T.segun1, C3 - 0.1, 0.2), win(t, T.segun2, T.esteFoso - 0.1, 0.2), win(t, T.prob, T.todavia - 0.1, 0.2));
const hud: HudData = {
  pills: [
    { a: OPEN === "c" ? 1.75 : T.grande, b: X1 - 0.05, label: "RÉCORD", value: () => "Nº 1 DEL MUNDO", tone: "gold" },
    { a: T.millones0, b: T.todo0 - 0.1, label: "BLOQUES", value: (t) => `+${count(t, T.millones0, T.millones0 + 1.1, 0, 5000000)}` },
    { a: T.todo0, b: X2 - 0.05, label: "APOYADO SOBRE", value: () => "ARENA", tone: "red" },
    { a: T.camboya, b: T.nohay - 0.1, label: "CAMBOYA", value: (t) => `HACE CASI ${count(t, T.camboya, T.novecientos + 0.5, 0, 900)} AÑOS`, tone: "gold" },
    { a: T.nohay, b: T.solo - 0.1, label: "MOTORES", value: () => "0", tone: "red" },
    { a: T.gruas, b: T.solo - 0.1, label: "GRÚAS", value: () => "0", y: 550, tone: "red" },
    { a: T.camiones, b: T.solo - 0.1, label: "CAMIONES", value: () => "0", y: 660, tone: "red" },
    { a: T.solo, b: X3 - 0.1, label: "TIENEN", value: (t) => HAVE.filter(([a]) => t >= a - 0.1).slice(-1)[0]?.[1] ?? "", tone: "green" },
    { a: T.rey, b: T.quiere - 0.1, label: "REY", value: () => "SURYAVARMAN II", tone: "gold" },
    { a: T.quiere, b: T.p1 - 0.1, label: "QUIERE", value: (t) => (t < T.montana - 0.1 ? "UN TEMPLO" : "MONTAÑA SAGRADA"), tone: "gold" },
    { a: T.treinta - 0.2, b: W3 - 0.05, label: "PIEDRA A", value: (t) => `+${count(t, T.treinta - 0.2, T.treinta + 0.5, 0, 30)} km`, tone: "red" },
    { a: T.agua, b: X4 - 0.05, label: "TRANSPORTE", value: () => "POR AGUA", tone: "green" },
    { a: T.balsas, b: C3 - 0.1, label: "VIAJAN EN", value: () => "BALSAS", tone: "green" },
    { a: T.canales0, b: C3 - 0.1, label: "POR", value: () => "CANALES Y RÍOS", y: 550 },
    { a: T.arena1 - 0.05, b: T.bajo - 0.1, label: "SUELO", value: () => "ARENA", tone: "red" },
    { a: T.bajo, b: T.b2 - 0.1, label: "PESO", value: () => "ENORME", tone: "red" },
    { a: T.foso0 + 0.2, b: C4 - 0.1, label: "FOSO", value: (t) => `CASI ${count(t, T.doscientos - 0.15, T.doscientos + 0.6, 0, 200)} m DE ANCHO` },
    { a: T.humeda - 0.1, b: T.todoAno - 0.1, label: "ARENA", value: () => "HÚMEDA", tone: "green" },
    { a: T.todoAno, b: X7 - 0.05, label: "TODO EL AÑO", value: (t) => MESES[Math.min(11, Math.floor(prog(t, T.todoAno, X7 - 0.15) * 12))], tone: "green" },
    { a: T.asi + 0.1, b: T.esteFoso - 0.1, label: "TORRE", value: () => "¡FIRME!", tone: "green" },
    { a: T.p3 + 0.2, b: T.tanGrande - 0.1, label: "ARENISCA A", value: () => "+30 km", tone: "gold" },
    { a: T.tanGrande, b: T.sol - 0.1, label: "NECESITA", value: () => "MUCHÍSIMA", tone: "red" },
    { a: T.noSeVe, b: X9 - 0.05, label: "LO QUE NO SE VE", value: () => "LATERITA", tone: "green" },
    { a: T.rojiza, b: X10 - 0.05, label: "LATERITA", value: (t) => (t < T.blanda - 0.05 ? "ROJIZA" : t < T.endurece ? "BLANDA" : "¡DURA!"), tone: "green" },
    { a: T.tallada, b: T.esteRelleno - 0.1, label: "LO QUE SE VE", value: () => "ARENISCA", tone: "gold" },
    { a: T.tonelada - 0.1, b: T.prob - 0.1, label: "BLOQUE", value: (t) => `${count(t, T.tonelada - 0.1, T.tonelada + 0.4, 0, 1)} TONELADA`, tone: "red" },
    { a: T.pequenos, b: T.donde - 0.05, label: "AGUJEROS", value: () => "3–4 cm" },
    { a: T.estacas, b: T.atarlos - 0.05, label: "ESTACAS", value: () => "DE MADERA", tone: "green" },
    { a: T.cuerdas, b: T.subirlos - 0.05, label: "CUERDAS", value: () => "ATADAS", tone: "green" },
    { a: T.subirlos, b: C7 - 0.05, label: "BLOQUE", value: () => "¡ARRIBA!", tone: "green" },
    { a: T.todavia, b: X12 - 0.1, label: "HOY", value: () => "SE VEN TODAVÍA", tone: "gold" },
    { a: T.nunca, b: T.monjes - 0.1, label: "ABANDONADO", value: () => "NUNCA DEL TODO", tone: "gold" },
    { a: T.monjes, b: T.siglo - 0.1, label: "MONJES", value: () => "SIEMPRE AHÍ", tone: "green" },
    { a: T.siglo, b: X13 - 0.05, label: "SIGLO", value: (t) => SIGLOS[Math.min(9, Math.floor(prog(t, T.siglo, X13 - 0.2) * 10))] },
    { a: T.bandera, b: T.manda - 0.15, label: "EN LA BANDERA", value: () => "DESDE 1863", tone: "gold" },
  ],
  titles: [{ a: T.estosCanales, text: "CANALES" }, { a: T.esteFoso, text: "FOSO" }, { a: T.esteRelleno, text: "RELLENO" }, { a: T.estosAg, text: "AGUJEROS", len: 1.35 }],
  alerts: [T.p1, T.p2, T.p3, T.p4],
  rewinds: [T.camboya, T.b2, T.asi],
  crosses: [[T.motores, C1 - 0.05], [SINK0 + 0.3, T.b2 - 0.05], [T.lejos, T.lejos + 0.85]],
  stamps: [[T.b1, T.c1, "SIN CAMIONES"], [T.b2, T.c2, "SIN HORMIGÓN"]],
  reward: { a: T.manda - 0.1, len: T.end - T.manda + 0.1, top: "EN PIE HACE CASI", big: (t) => `${count(t, T.manda - 0.1, T.manda + 1.1, 0, 900)} AÑOS`, sub: "SOBRE ARENA" },
  Extra: ({ t }) => {
    const h = hyp(t), kulen = win(t, T.kulen - 0.1, W3, 0.15), ank = win(t, C2 + 0.1, W3, 0.15);
    const truck = win(t, T.sinCam, T.c1 + 0.2, 0.12);
    return (
      <>
        {h > 0 ? (
          <div style={{ position: "absolute", left: 0, width: 1080, top: 300, display: "flex", justifyContent: "center", opacity: h, transform: `rotate(${-3 + Math.sin(t * 2.5) * 1.5}deg)` }}>
            <div style={{ padding: "6px 30px 10px", borderRadius: 40, background: "#4b2a7ae6", border: "5px solid #ffffff55", boxShadow: "0 7px 0 #00000055", display: "flex", alignItems: "baseline", gap: 14 }}>
              <span style={{ fontFamily: FONT, fontSize: 52, color: "#ffe27a" }}>?</span>
              <span style={{ fontFamily: FONT, fontSize: 52, color: "#fff", letterSpacing: 3 }}>HIPÓTESIS</span>
            </div>
          </div>) : null}
        {kulen > 0 ? (
          <div style={{ position: "absolute", left: 0, width: 1080, top: KULEN_Y(t), display: "flex", justifyContent: "center", opacity: kulen, transform: `scale(${pop(t, T.kulen - 0.1, 0.3)})` }}>
            <span style={{ fontFamily: FONT, fontSize: 64, color: "#fff", ...stroke(10) }}>▲ MONTE KULEN</span>
          </div>) : null}
        {ank > 0 ? (
          <div style={{ position: "absolute", left: 0, width: 1080, top: ANK_Y(t), display: "flex", justifyContent: "center", opacity: ank, transform: `scale(${pop(t, C2 + 0.1, 0.3)})` }}>
            <span style={{ fontFamily: FONT, fontSize: 64, color: "#ffd400", ...stroke(10, "#3a2300") }}>★ ANGKOR WAT</span>
          </div>) : null}
        {truck > 0 ? (
          <div style={{ position: "absolute", left: 0, width: 1080, top: 900, display: "flex", justifyContent: "center", opacity: truck, transform: `scale(${pop(t, T.sinCam, 0.3)})` }}>
            <svg viewBox="0 0 160 110" width="320" height="220">
              <rect x="10" y="30" width="86" height="46" rx="6" fill="#ffb400" stroke="#14202b" strokeWidth="6" />
              <path d="M96 44 L128 44 L146 62 L146 76 L96 76 Z" fill="#4ab8ff" stroke="#14202b" strokeWidth="6" strokeLinejoin="round" />
              <circle cx="38" cy="84" r="13" fill="#2a2a2a" stroke="#14202b" strokeWidth="5" /><circle cx="124" cy="84" r="13" fill="#2a2a2a" stroke="#14202b" strokeWidth="5" />
              <path d="M22 8 L138 104 M138 8 L22 104" stroke="#14202b" strokeWidth="22" strokeLinecap="round" /><path d="M22 8 L138 104 M138 8 L22 104" stroke="#ff2d2d" strokeWidth="13" strokeLinecap="round" />
            </svg>
          </div>) : null}
      </>
    );
  },
};
// posição dos rótulos do mapa (no alto da tela fica o Kulen; embaixo, o templo) — conferida nas folhas de quadros
const KULEN_Y = (t: number) => lerp(150, 120, prog(t, C2, W3));
const ANK_Y = (t: number) => lerp(990, 960, prog(t, C2, W3));

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: KHMER, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#eaf2f8", fogNear: 220, fogFar: 760, hemiSky: "#f3f7ff", hemiGround: "#d9c58f", hemiI: 1.2, sun: "#fff2d6", sunI: 2.6 },
};
void lerp; void SINK1; void React;
