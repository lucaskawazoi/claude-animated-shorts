// E13 — Puente Q'eswachaka (ecos-del-tiempo, Shorts; braço «ritmo»). Câmera, operário, painel e luz deste episódio.
// Ritmo: 1º quadro já em ação (cruzando a ponte balançando), chicote em todas as janelas da régua, câmera sempre andando,
// duas tentativas que dão errado com ✖ (o cordão sozinho arrebenta; o operário escorrega das sogas redondas).
import React from "react";
import { CamState, K, Key, Shot, keyed } from "../../toy/cam";
import { CUTS, WINS, find } from "../../toy/cues";
import { getInputProps } from "remotion";
import type { Episode } from "../../toy/episode";
import { FONT, HudData, count, pop, stroke, win } from "../../toy/hud";
import { V3, ease, lerp, prog, sstep, vlerp } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { SFX, T, XC } from "./cues";
import { COMM_HEX, H, PONCHO, World, X0, cordsAt, deckAt, mainB, newB, ropeP, tug } from "./world";
import { EXPOSURE } from "./exposure";

const PI = Math.PI;
const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
const W3 = WINS[3], W6 = WINS[6], W10 = WINS[10];
const [X1, X2, X3, X4, X5, X6, X7, X8, X9, X10, X11] = XC;

// dinamismo por janela (todas altas menos a última; a ordem segue a da referência: 7 e 3 as mais agitadas, 11 a mais calma)
const DYN = [3.6, 2.6, 4.5, 2.4, 2.2, 2.6, 4.8, 3.0, 2.4, 2.8, 0.1];
const dynAt = (t: number) => { let d = DYN[0]; WINS.forEach((w, i) => { if (t >= w) d = DYN[i]; }); return d; };
/** tira a deriva lenta da câmera na mão (story.ts) e deixa o tremor rápido: o enquadramento fica onde as chaves mandam */
const desway = (t: number, c: CamState): CamState => {
  const d = dynAt(t);
  return { ...c, pos: [c.pos[0] - d * 0.7 * Math.sin(t * 0.9 + 9), c.pos[1] - d * 0.2 * Math.sin(t * 1.3 + 4), c.pos[2]], look: [c.look[0] - d * 0.3 * Math.sin(t * 1.1 + 3), c.look[1], c.look[2]] };
};
const steady = (keys: Key[]) => (t: number): CamState => desway(t, keyed(keys, t));
const shot = (name: string, t0: number, keys: Key[]): Shot => ({ name, t0, keys, fn: steady(keys) });
/** fim de plano: 0,4 s parado antes do corte (a régua precisa ver a troca) */
const hold = (c: number, pos: V3, look: V3, fov = 56, roll = 0) => [K(c - 0.42, pos, look, fov, roll), K(c - 0.02, pos, look, fov, roll)];

/** qual abertura (os 2,5 s do começo): PROPS='{"open":"a"}' no render; padrão "b" (escolhida pelo crítico em 13/11; o render final não passa PROPS) */
const openV = () => { try { return ((getInputProps() as { open?: string }).open ?? "b") as "a" | "b" | "c"; } catch { return "b"; } };
const OPEN_END = 3.15;
// as três aberturas terminam no mesmo close da baranda trançada («hecho de hierba trenzada»), daí seguem juntas
const HOOK_TAIL: Key[] = [K(OPEN_END, [-1.2, H + 0.8, 2.6], [2.2, H + 0.0, 0.7], 48, -1), K(X1, [0.4, H + 1.6, 4.4], [3.0, H - 0.2, 0.4], 52, 2)];
const OPENINGS: Record<"a" | "c", Key[]> = {
  // a) «cruzando»: câmera de lado e atrás do operário que atravessa a ponte balançando
  a: [K(0, [-12.5, H + 3.4, 8.0], [-7.6, H + 0.6, 0], 56, 7), K(0.8, [-9.6, H + 2.4, 6.8], [-5.8, H + 0.6, 0], 56, -3), K(1.9, [-6.4, H + 1.6, 5.2], [-2.6, H + 0.5, 0.2], 52, 2)],
  // c) «corriendo»: primeira pessoa no corredor da ponte, entre as barandas, atrás do operário que corre
  c: [K(0, [-14.6, H + 3.2, 0.0], [-5.0, H + 1.0, 0.0], 64, 6), K(1.6, [-10.2, H + 2.6, 0.0], [-1.0, H + 0.6, 0.0], 64, -6), K(2.5, [-4.6, H + 1.0, 0.3], [-2.0, H + 0.6, 0.74], 54, 3), K(2.85, [-3.0, H + 1.2, 0.3], [-0.5, H + 0.4, 0.74], 50, 0)],
};
// b) «desde el río» (a escolhida): quadro 0 rasante na água que corre, a ponte já no alto do quadro; sobe o cânion sem
// parar (sem chave no meio: cada chave de keyed() é uma parada) e sai acima do tabuleiro, por fora da baranda, balançando
// com a ponte. Do alto a baranda passa SOB os pés do operário (altura/afastamento > 1,1/0,74 = 1,49), então nunca o cobre;
// em «trenzada» chega mais perto da corda; segue andando para +x, o mesmo sentido do plano seguinte.
const B_UP = 2.15, TRZ = find("trenzada");
const bCam = (t: number): CamState => {
  const w = walkMain(-8.5, 3.5, 0, X1)(t);
  const k = ease(t, TRZ - 0.3, TRZ + 0.25), back = ease(t, TRZ + 0.6, X1);
  const zc = lerp(3.0, 2.5, k) + back, a = lerp(5.4, 4.5, k) + back * 2.2; // a/zc ≥ 1,8 sempre
  const fp: V3 = [w[0] + 0.1, w[1] + a, w[2] + zc], fl: V3 = [w[0] + 0.35, w[1] + lerp(0.9, 0.55, k), w[2] + lerp(0.1, 0.35, k)];
  const fov = lerp(54, 50, k) + back * 4, roll = lerp(-2, 1.5, k);
  if (t >= B_UP) return { pos: fp, look: fl, fov, roll };
  const u = t / B_UP, uz = 1 - (1 - u) ** 2, uy = sstep(u), ux = sstep(Math.min(1, u * 1.4));
  const aim: V3 = [lerp(-1.5, w[0] + 0.35, ux), lerp(7.0, w[1] + 0.6, ease(t, 0, 1.0)), 0.3];
  return { pos: [lerp(-0.6, fp[0], ux), lerp(1.2, fp[1], uy), lerp(16, fp[2], uz)], look: vlerp(aim, fl, sstep(prog(t, 1.0, B_UP))), fov: lerp(64, fov, uy), roll: lerp(5, roll, uy) };
};
/** tira parte do tremor rápido de lado (story.ts): no quadro vertical, de perto, ele jogava o operário para fora da borda */
const calm = (t: number, c: CamState, f: number): CamState => {
  const d = dynAt(t) * f, n = (q: number, ph: number) => Math.sin(t * q + ph);
  return { ...c, pos: [c.pos[0] - d * (0.12 * n(2.3, 0) + 0.07 * n(5.1, 1)), c.pos[1], c.pos[2] - d * 0.1 * n(2.7, 4)], look: [c.look[0] - d * 0.09 * n(2.9, 5), c.look[1], c.look[2]] };
};
const hookCam = (t: number): CamState => {
  const v = openV();
  if (v === "b") return calm(t, desway(t, bCam(t)), 0.6 * ease(t, 1.4, 2.0));
  const c = steady([...OPENINGS[v], ...HOOK_TAIL])(t);
  if (v === "c" && t < OPEN_END) { const b = mainB(t), u = (c.pos[0] + X0) / (2 * X0); c.pos = [c.pos[0], c.pos[1], c.pos[2] + b.sway * Math.sin(t * 2.2) * 4 * u * (1 - u)]; } // a câmera balança com a ponte
  return c;
};

const SHOTS: Shot[] = [
  { name: "abertura (a/b/c) → close da baranda trançada", t0: 0, keys: [...OPENINGS.a, ...HOOK_TAIL], fn: hookCam },
  shot("a ponte inteira com gente nas margens → +500 anos → os Andes", X1, [
    K(X1, [10.0, H + 8.0, 19.0], [0.0, H - 1.5, 0], 58, -4), K(X1 + 0.5, [12.5, H + 8.6, 19.6], [0.0, H - 1.5, 0], 58, 1),
    K(T.quinientos + 0.4, [15.0, H + 9.6, 20.4], [-1.0, H - 1.0, 0], 58, -2), K(T.andes + 0.6, [15.5, H + 10.5, 20.5], [-6.0, H + 14.0, -70.0], 60, 3),
    ...hold(C1, [15.7, H + 10.6, 20.7], [-6.0, H + 14.0, -70.0], 60, 3)]),
  shot("cânion vazio: sem aço, sem cabos → só capim e gente", C1, [
    K(C1, [-26.0, H + 9.0, 4.0], [-6.0, H - 0.5, 0.5], 58, -5), K(C1 + 0.45, [-23.5, H + 7.6, 2.4], [-4.5, H - 2.0, 0.5], 56, 1),
    K(T.motores + 0.3, [-22.5, H + 7.2, 2.0], [-3.5, H - 2.5, 0.5], 56, -1),
    K(T.solo + 0.6, [-19.0, H + 2.8, 2.8], [-30.0, H + 0.8, 8.5], 56, 2), K(X2, [-19.6, H + 2.6, 3.4], [-30.0, H + 0.9, 8.0], 56, -1)]),
  shot("o caminho inca até a borda → o arco que cruza → o rio lá no fundo", X2, [
    K(X2, [-31.0, H + 8.0, 9.4], [-6.0, H - 1.0, 0.0], 58, 3), K(T.cruzar, [-26.5, H + 7.0, 8.4], [0.0, H - 2.0, 0.0], 58, -1),
    K(T.fondo + 0.2, [-13.0, H + 6.0, 6.2], [-2.0, 2.0, 2.0], 58, 2), ...hold(C2, [-11.0, H + 5.4, 6.0], [-1.6, 0.8, 2.0], 58, 1)]),
  shot("capim da puna ao vento → chicote → arranca o tufo", C2, [
    K(C2, [-29.5, H + 0.9, 13.5], [-26.6, H + 0.8, 6.0], 52, -6), K(C2 + 0.45, [-28.4, H + 1.2, 12.0], [-26.0, H + 0.9, 5.4], 52, 2),
    K(W3 - 0.05, [-27.6, H + 1.3, 11.0], [-25.8, H + 0.9, 5.0], 52, 0), K(W3 + 0.45, [-22.4, H + 2.9, 9.8], [-26.0, H + 1.1, 2.8], 54, 4),
    K(T.puna + 0.3, [-22.8, H + 2.6, 9.2], [-26.0, H + 1.0, 2.8], 52, -1), K(X3, [-23.4, H + 2.3, 8.6], [-26.0, H + 1.1, 2.6], 50, 1)]),
  shot("de cima: torce um cordão → ~90 cordões → de ponta: o feixe gira e vira soga", X3, [
    K(X3, [-25.8, H + 6.4, 7.6], [-26.9, H + 1.3, 3.4], 54, -3), K(T.finos + 0.3, [-22.8, H + 4.6, 7.8], [-25.4, H + 1.4, 3.7], 54, 1),
    K(T.casi + 0.2, [-18.6, H + 2.5, 6.8], [-24.2, H + 1.5, 4.0], 54, -1), K(T.trenzados, [-18.9, H + 2.2, 6.2], [-24.4, H + 1.5, 4.0], 52, 0),
    ...hold(C3, [-19.0, H + 2.15, 6.1], [-24.4, H + 1.5, 4.0], 52, 0)]),
  shot("soga da grossura de uma perna → 1 cordão arrebenta ✖ → a soga aguenta → 6 rolos", C3, [
    K(C3, [-29.6, H + 0.8, 10.6], [-24.3, H + 1.1, 8.6], 50, 5), K(C3 + 0.45, [-29.5, H + 1.0, 9.6], [-24.3, H + 0.95, 8.6], 50, -1),
    K(T.pierna + 0.45, [-29.7, H + 1.2, 9.2], [-24.3, H + 0.9, 8.6], 50, 1),
    K(T.rompe - 0.15, [-29.6, H + 2.4, 10.4], [-24.5, H + 2.0, 13.4], 52, 2), K(T.rompe + 0.5, [-29.9, H + 2.0, 10.0], [-24.5, H + 1.4, 13.4], 50, -2),
    K(T.noo, [-30.0, H + 2.2, 10.8], [-24.5, H + 1.9, 14.4], 50, 1), K(T.sogas + 0.45, [-33.0, H + 6.5, 6.0], [-25.0, H + 0.4, -3.8], 56, -2),
    K(X4, [-32.4, H + 6.7, 5.4], [-24.4, H + 0.5, -3.4], 56, 1)]),
  shot("as sogas voam e ficam frouxas de margem a margem", X4, [
    K(X4, [-21.0, H + 9.0, 14.0], [-2.0, H - 4.0, 0.0], 58, -3), K(T.tensas, [-17.0, H + 8.6, 16.0], [0.0, H - 4.0, 0.0], 58, 1),
    K(T.otra + 0.3, [-8.0, H + 8.5, 19.0], [9.0, H - 2.0, 0.0], 58, 1), ...hold(C4, [-7.6, H + 8.4, 19.2], [9.4, H - 2.0, 0.0], 58, 0)]),
  shot("close: a soga dá voltas na pedra grande", C4, [
    K(C4, [-14.6, H + 3.8, 6.2], [-19.4, H + 0.9, 0.2], 54, -5), K(C4 + 0.45, [-15.4, H + 3.2, 5.0], [-19.6, H + 0.9, 0.0], 52, 1),
    K(X5, [-16.2, H + 2.8, 4.2], [-19.6, H + 0.85, 0.0], 50, -1)]),
  shot("atrás da fila: decenas puxam a la vez → a barriga some → anclajes → sogas redondas", X5, [
    K(X5, [-37.0, H + 4.4, 2.2], [-14.0, H - 1.0, -0.2], 58, 4), K(X5 + 0.5, [-36.0, H + 3.8, 1.9], [-14.0, H - 1.0, -0.2], 56, -2),
    K(T.tensarlas + 0.4, [-35.4, H + 3.5, 2.1], [-13.0, H - 1.2, -0.2], 56, 1), K(T.anclajes + 0.5, [-24.2, H + 3.0, 4.6], [-19.0, H + 0.9, 0.0], 52, -1),
    K(W6 - 0.05, [-18.5, H + 3.4, 4.0], [-12.0, H - 0.4, 0.0], 54, 0), K(W6 + 0.3, [-16.6, H + 2.6, 2.6], [-2.0, H - 1.6, 0.0], 56, 4),
    K(C5 - 0.02, [-16.65, H + 2.6, 2.62], [-2.0, H - 1.6, 0.0], 56, 4)]),
  shot("de baixo: em cima das sogas redondas, escorrega e fica pendurado ✖", C5, [
    K(C5, [-5.6, H - 6.8, 8.6], [-9.6, H - 0.2, 0.0], 54, -5), K(C5 + 0.45, [-6.4, H - 6.2, 8.0], [-9.6, H - 0.4, 0.0], 52, 1),
    K(T.caminar + 0.6, [-6.8, H - 6.6, 8.2], [-9.6, H - 1.6, 0.0], 52, -1), K(X6, [-7.4, H - 5.6, 8.4], [-9.8, H - 1.2, 0.0], 52, 1)]),
  shot("de cima: ramos em onda, esteras, barandas sobem", X6, [
    K(X6, [-21.0, H + 6.0, 12.5], [0.0, H - 1.5, 0.0], 58, -3), K(T.tejen, [-19.5, H + 5.2, 11.5], [0.0, H - 1.5, 0.0], 56, 0),
    K(T.esteras + 0.6, [-17.2, H + 4.6, 10.6], [2.0, H - 1.5, 0.0], 54, -1), K(T.barandas + 0.4, [-12.5, H + 3.6, 9.0], [2.0, H - 0.8, 0.0], 54, 1),
    K(X7, [-11.5, H + 3.4, 8.6], [2.5, H - 0.8, 0.0], 54, 0)]),
  shot("no piso pronto, atrás do operário que atravessa", X7, [
    K(X7, [-17.2, H + 2.4, -1.8], [-4.0, H + 0.2, 0.3], 58, 3), K(X8, [-15.4, H + 2.0, -1.2], [-2.0, H - 0.2, 0.3], 56, -1)]),
  shot("de baixo: chuva e sol, a palha apodrece e cai", X8, [
    K(X8, [-9.5, H - 4.4, 10.5], [-1.0, H - 0.9, 0.0], 56, -2), K(T.b4 + 0.3, [-7.2, H - 3.2, 11.2], [0.0, H - 1.2, 0.0], 54, 1),
    ...hold(C6, [-6.6, H - 3.0, 11.4], [0.4, H - 1.3, 0.0], 54, 0)]),
  shot("a ponte podre vista do alto do cânion → a nova começa", C6, [
    K(C6, [-8.0, H + 10.0, 26.0], [1.0, H - 3.5, -1.0], 58, -5), K(C6 + 0.45, [-6.5, H + 8.6, 24.0], [0.5, H - 3.0, -1.0], 58, 1),
    K(T.c4 + 0.3, [-4.5, H + 6.5, 20.0], [0.0, H - 2.5, -1.0], 56, 2), K(X9, [-3.0, H + 7.5, 21.5], [0.0, H - 2.5, -1.7], 58, -1)]),
  shot("atrás das comunidades: 4 cores tecem a nova em 3 dias", X9, [
    K(X9, [-29.0, H + 4.8, -12.0], [2.0, H - 1.5, -1.5], 58, 3), K(T.tres, [-27.0, H + 4.2, -10.5], [1.0, H - 1.5, -1.5], 56, -1),
    ...hold(C7, [-26.6, H + 4.1, -10.2], [1.0, H - 1.6, -1.5], 56, 0)]),
  shot("de dentro do cânion: a velha cai no rio → sobe para a nova", C7, [
    K(C7, [2.5, 5.5, 24.0], [0.0, 12.0, -1.0], 60, 5), K(C7 + 0.45, [1.5, 6.5, 22.0], [0.0, 11.5, -1.0], 58, -1),
    K(T.alRio + 0.3, [1.2, 6.0, 21.0], [0.0, 5.0, 0.0], 58, 1), K(X10, [0.5, 9.5, 19.0], [0.0, H - 1.0, -3.4], 58, 0)]),
  shot("da outra margem: gente cruzando a nova → giro → UNESCO", X10, [
    K(X10, [27.0, H + 5.5, -15.0], [0.0, H - 2.0, -3.4], 58, 5), K(X10 + 0.45, [25.0, H + 4.6, -13.5], [0.0, H - 1.5, -3.4], 56, -1),
    K(X11, [21.0, H + 6.5, -2.0], [0.0, H - 1.4, -3.4], 58, -2)]),
  shot("close no operário na nova → a costumbre → os Andes", X11, [
    K(X11, [6.0, H + 2.2, 4.5], [1.5, H - 0.4, -3.4], 54, 3), K(T.costumbre + 0.6, [10.0, H + 6.0, 12.0], [0.0, H - 1.2, -3.4], 58, 0),
    K(W10, [10.4, H + 6.4, 12.6], [0.0, H - 1.2, -3.4], 58, 0), K(W10 + 0.6, [11.0, H + 8.5, 15.5], [-8.0, H + 4.0, -40.0], 60, 3),
    K(T.end, [11.4, H + 8.8, 16.5], [-8.0, H + 4.2, -40.0], 60, 0)]),
];

// ---------------------------------------------------------------- operário
const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const FAR: V3 = [999, H, 999];
/** salto no corte: some no instante anterior e reaparece já no lugar (sem deslizar pela tela) */
const tp = (t: number, w: WorkerState): [number, WorkerState][] => [[t - 0.01, { ...w, scale: 0 }], [t, w]];
const walkMain = (x0: number, x1: number, t0: number, t1: number) => (t: number) => deckAt(mainB(t), t, lerp(x0, x1, prog(t, t0, t1)), 0, 0.2);
/** no gancho: anda (a, b) ou corre na frente da câmera (c) */
const hookWalk = (t: number) => openV() === "c" ? deckAt(mainB(t), t, t < 2.6 ? lerp(-9.5, -1.0, t / 2.6) : lerp(-1.0, 2.5, prog(t, 2.6, X1)), 0, 0.2) : walkMain(-8.5, 3.5, 0, X1)(t);
/** em cima das sogas redondas: bambeia, escorrega e fica pendurado pelas mãos (braços para cima) */
const slip = (t: number): V3 => {
  const b = mainB(t), p = ropeP(b, t, (-9.6 + X0) / (2 * X0), 0), d = ease(t, T.caminar, T.caminar + 0.28);
  const bounce = t > T.caminar + 0.28 ? 0.25 * Math.exp(-(t - T.caminar - 0.28) * 5) * Math.sin((t - T.caminar) * 16) : 0;
  return [-9.6 + 0.16 * Math.sin(t * 9) * (1 - d) + 0.25 * d * Math.sin(t * 3), p[1] + 0.13 - d * 2.55 + bounce, p[2]];
};
const puller0 = (t: number): V3 => [-(22.4 + tug(t) * 1.8 + 0.12 * Math.sin(t * 9)), H, -0.36];
const WORKER: [number, WorkerState][] = [
  [0, S(FAR, PI / 2, "walk", { follow: hookWalk })],
  [X1, S(FAR, PI / 2, "walk", { follow: walkMain(3.5, 8.0, X1, C1) })],
  [C1, S([-17.0, H + 0.9, 1.0], PI / 2, "idle")],
  [T.nohay, S([-17.0, H + 0.9, 1.0], PI / 2, "think")],
  [T.solo, S([-17.0, H + 0.9, 1.0], -PI / 2 + 0.4, "point")],
  [T.cruzar, S([-17.0, H + 0.9, 1.0], PI / 2, "point")],
  [T.canon, S([-17.0, H + 0.9, 1.0], PI / 2, "alarm")],
  ...tp(C2, S([-26.0, H, 2.1], 0.2, "present")),
  [T.puna, S([-26.0, H, 2.1], 0.2, "pull")],
  [T.puna + 0.5, S([-28.0, H, 3.0], 0.6, "chisel")],
  [T.casi, S([-28.0, H, 3.0], 0.6, "present")],
  [T.trenzados, S([-28.0, H, 3.0], 0.6, "cheer")],
  ...tp(C3, S([-24.0, H, 8.6], -PI / 2, "present")),
  [T.unCordon, S([-23.0, H, 13.5], -PI / 2 - 0.2, "point")],
  [T.rompe + 0.1, S([-23.0, H, 13.5], -PI / 2 - 0.2, "alarm")],
  [T.noo, S([-23.0, H, 13.5], -PI / 2 - 0.2, "cheer")],
  [T.sogas, S(FAR, 0, "idle", { scale: 0 })],
  [T.p1, S([-17.0, H + 0.9, 1.4], PI / 2 - 0.3, "alarm")],
  [T.s2, S([-17.0, H + 0.9, 1.4], PI / 2 - 0.3, "think")],
  ...tp(C4, S([-21.4, H, 1.9], PI / 2 + 0.5, "chisel")),
  [X5 - 0.02, S(FAR, -PI / 2, "pull", { follow: puller0 })],
  [T.anclajes, S([-21.0, H, -2.6], PI / 2 - 0.6, "present")],
  [T.p2, S([-16.0, H + 0.9, 0.6], PI / 2, "think")],
  [C5 - 0.1, S(FAR, 0, "alarm", { follow: slip })],
  [T.s3, S(FAR, 0, "idle", { scale: 0 })],
  [X7 - 0.05, S(FAR, PI / 2, "walk", { follow: walkMain(-12.5, -3.0, X7, T.p3 + 0.3) })],
  [T.p3 + 0.3, S(FAR, 0.2, "alarm", { follow: walkMain(-3.0, -3.0, 0, 1) })],
  [T.b4, S(FAR, 0.2, "think", { follow: walkMain(-3.0, -3.0, 0, 1) })],
  [C6, S(FAR, 0, "idle", { scale: 0 })],
  [X10, S(FAR, 0.5, "cheer", { follow: (t) => deckAt(newB(t), t, 1.5, 0, 0.2) })],
];

// ---------------------------------------------------------------- painel
const LEG = (
  <svg viewBox="0 0 220 120" width="330" height="180">
    <circle cx="52" cy="60" r="40" fill="#dcb65a" stroke="#3a2300" strokeWidth="6" />
    {[0, 1, 2, 3, 4, 5].map((k) => <circle key={k} cx={52 + 20 * Math.cos(k)} cy={60 + 20 * Math.sin(k)} r="9" fill="#c99c3e" />)}
    <text x="110" y="76" fontFamily={FONT} fontSize="54" fill="#fff" stroke="#14202b" strokeWidth="4" paintOrder="stroke">≈</text>
    <path d="M168 10 Q190 10 188 40 L186 96 Q196 106 210 110 L160 112 Q164 96 162 40 Q160 10 168 10 Z" fill="#a8673f" stroke="#3a2300" strokeWidth="5" />
  </svg>
);
const SUN = (
  <svg viewBox="0 0 120 120" width="200" height="200">
    {Array.from({ length: 10 }, (_, k) => <path key={k} d="M60 4 L66 24 L54 24 Z" fill="#ffb000" transform={`rotate(${k * 36} 60 60)`} />)}
    <circle cx="60" cy="60" r="30" fill="#ffd400" stroke="#8a4a00" strokeWidth="5" />
  </svg>
);
const HAND = (
  <svg viewBox="0 0 120 120" width="190" height="190">
    <path d="M40 110 L36 60 Q34 50 42 50 Q48 50 48 60 L48 30 Q48 22 55 22 Q62 22 62 30 L62 26 Q62 18 69 18 Q76 18 76 26 L76 32 Q76 25 83 25 Q90 25 90 33 L90 72 Q90 96 74 110 Z" fill="#e0aa82" stroke="#3a2300" strokeWidth="5" strokeLinejoin="round" />
    <path d="M14 14 L106 106 M106 14 L14 106" stroke="#14202b" strokeWidth="20" strokeLinecap="round" /><path d="M14 14 L106 106 M106 14 L14 106" stroke="#ff2d2d" strokeWidth="12" strokeLinecap="round" />
  </svg>
);
const hud: HudData = {
  pills: [
    { a: T.treinta, b: T.hierba0 - 0.1, label: "LARGO", value: () => "~30 m", y: 440 },
    { a: T.hierba0, b: T.vuelven - 0.1, label: "HECHO DE", value: () => "HIERBA", y: 440, tone: "gold" },
    { a: T.cadaAno0, b: T.quinientos - 0.1, label: "SE REHACE", value: () => "CADA AÑO", y: 440, tone: "green" },
    { a: T.quinientos, b: T.andes - 0.1, label: "TRADICIÓN", value: (t) => `+${count(t, T.quinientos, T.quinientos + 0.7, 0, 500)} AÑOS`, y: 440, tone: "gold" },
    { a: T.andes, b: T.nohay - 0.1, label: "ÉPOCA", value: () => "INCA", y: 440, tone: "gold" },
    { a: T.acero, b: T.solo - 0.1, label: "ACERO", value: () => "0", y: 440, tone: "red" },
    { a: T.cables, b: T.solo - 0.1, label: "CABLES", value: () => "0", y: 550, tone: "red" },
    { a: T.motores, b: T.solo - 0.1, label: "MOTORES", value: () => "0", y: 660, tone: "red" },
    { a: T.solo, b: T.camino - 0.1, label: "SOLO", value: () => "HIERBA Y MANOS", y: 440, tone: "green" },
    { a: T.rio, b: T.b1 - 0.1, label: "RÍO", value: () => "APURÍMAC", y: 440 },
    { a: T.qoya, b: T.torcida - 0.1, label: "HIERBA", value: () => "Q'OYA", y: 440, tone: "gold" },
    { a: T.torcida, b: C3 + 0.3, label: "CORDONES", value: (t) => `${cordsAt(t)}`, y: 440, tone: "green" },
    { a: T.gruesa, b: T.unCordon - 0.1, label: "GROSOR", value: () => "UNA PIERNA", y: 440 },
    { a: T.unCordon, b: T.cienJuntos - 0.1, label: "CORDONES", value: () => "1", y: 440, tone: "red" },
    { a: T.cienJuntos, b: T.sogas - 0.1, label: "CORDONES", value: () => "~90", y: 440, tone: "green" },
    { a: T.tensas, b: T.s2 - 0.1, label: "TENSIÓN", value: () => "FLOJA", y: 440, tone: "red" },
    { a: T.decenas, b: T.tiran - 0.05, label: "PERSONAS", value: () => "DECENAS", y: 440 },
    { a: T.tiran, b: T.tensarlas + 0.25, label: "TENSIÓN", value: (t) => (tug(t) < 0.5 ? "FLOJA" : "MEDIA"), y: 440, tone: "red" },
    { a: T.tensarlas + 0.3, b: T.anclajes - 0.1, label: "TENSIÓN", value: () => "TENSA", y: 440, tone: "green" },
    { a: T.redondas, b: T.s3 - 0.1, label: "SOGAS", value: () => "REDONDAS", y: 440, tone: "red" },
    { a: T.ramas, b: T.dos - 0.1, label: "PISO", value: (t) => (t < T.esteras ? "RAMAS" : "RAMAS + ESTERAS"), y: 440, tone: "green" },
    { a: T.dos, b: T.estePiso - 0.1, label: "BARANDAS", value: () => "2", y: 440, tone: "green" },
    { a: T.pudre, b: T.b4 - 0.1, label: "HIERBA", value: () => "SE PUDRE", y: 440, tone: "red" },
    { a: T.cuatro, b: T.tres - 0.1, label: "COMUNIDADES", value: () => "4", y: 440, tone: "gold" },
    { a: T.tres, b: T.viejo + 0.3, label: "DÍAS", value: (t) => count(t, T.tres, T.tres + 0.6, 1, 3), y: 440, tone: "green" },
    { a: T.viejo + 0.3, b: T.renovacion - 0.1, label: "EL VIEJO", value: () => "AL RÍO", y: 440, tone: "red" },
    { a: T.trece, b: T.algo - 0.1, label: "UNESCO", value: () => "2013", y: 440, tone: "gold" },
  ],
  titles: [
    { a: T.sogas, text: "SOGAS" }, { a: T.anclajes, text: "ANCLAJES" }, { a: T.estePiso, text: "PISO" },
    { a: T.renovacion, text: "RENOVACIÓN", len: 1.4 }, { a: T.giro, text: "¡GIRO!", len: 0.95 },
  ],
  alerts: [T.canon, T.p1, T.p2, T.p3],
  rewinds: [T.andes, T.cienJuntos, T.s3, T.b4],
  crosses: [[T.rompe, T.cienJuntos - 0.05], [T.caminar + 0.1, T.s3 - 0.08]],
  stamps: [[T.b1, T.c1, "SIN CABLES DE ACERO"], [T.b4, T.c4, "SIN MATERIAL QUE DURE"]],
  reward: { a: T.costumbre, len: T.end - T.costumbre, top: "PATRIMONIO DE LA HUMANIDAD", big: (t) => `+${count(t, T.costumbre, T.costumbre + 1.1, 0, 500)} AÑOS`, sub: "SIN UN SOLO MOTOR" },
  Extra: ({ t }) => {
    const leg = win(t, T.gruesa, T.unCordon - 0.1, 0.15), sun = win(t, T.sol - 0.05, T.b4 - 0.05, 0.12), dots = win(t, T.cuatro, T.tres - 0.1, 0.15);
    const badge = win(t, T.unesco, T.costumbre - 0.1, 0.2), hand = win(t, T.algo, T.costumbre - 0.1, 0.15);
    return (
      <>
        {leg > 0 ? <div style={{ position: "absolute", left: 0, width: 1080, top: 1450, display: "flex", justifyContent: "center", opacity: leg, transform: `scale(${pop(t, T.gruesa, 0.3)})` }}>{LEG}</div> : null}
        {sun > 0 ? <div style={{ position: "absolute", left: 800, top: 600, opacity: sun, transform: `scale(${pop(t, T.sol - 0.05, 0.3)}) rotate(${(t - T.sol) * 90}deg)` }}>{SUN}</div> : null}
        {dots > 0 ? <div style={{ position: "absolute", left: 0, width: 1080, top: 560, display: "flex", justifyContent: "center", gap: 26, opacity: dots }}>
          {COMM_HEX.map((c, i) => <div key={c} style={{ width: 86, height: 86, borderRadius: 43, background: c, border: "7px solid #14202b", transform: `scale(${pop(t, T.cuatro + i * 0.12, 0.3)})` }} />)}
        </div> : null}
        {badge > 0 ? <div style={{ position: "absolute", left: 0, width: 1080, top: 560, display: "flex", flexDirection: "column", alignItems: "center", opacity: badge, transform: `scale(${pop(t, T.unesco, 0.35)})` }}>
          <div style={{ padding: "8px 40px 12px", borderRadius: 28, background: "#1f5fa8e6", border: "6px solid #ffffff55", boxShadow: "0 8px 0 #00000055" }}>
            <span style={{ fontFamily: FONT, fontSize: 70, color: "#fff", letterSpacing: 6 }}>UNESCO</span>
          </div>
          <span style={{ fontFamily: FONT, fontSize: 56, color: "#ffd400", marginTop: 10, textAlign: "center", ...stroke(9, "#3a2300") }}>{t < T.patrimonio ? "DECLARÓ…" : "PATRIMONIO DE LA HUMANIDAD"}</span>
          {hand > 0 ? <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, opacity: hand, transform: `scale(${pop(t, T.algo, 0.3)})` }}>{HAND}<span style={{ fontFamily: FONT, fontSize: 60, color: "#fff", ...stroke(10) }}>NO SE PUEDE TOCAR</span></div> : null}
        </div> : null}
      </>
    );
  },
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: PONCHO, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#e9f1f6", fogNear: 120, fogFar: 520, hemiSky: "#f2f7ff", hemiGround: "#c9a660", hemiI: 1.2, sun: "#fff2d6", sunI: 2.6 },
};
