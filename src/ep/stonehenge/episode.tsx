// E12 — Stonehenge (ecos-del-tiempo, Shorts). Câmera, operário, painel e luz deste episódio.
import React from "react";
import { K, Shot } from "../../toy/cam";
import { CUTS, WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { FONT, HudData, count, pop, stroke, win } from "../../toy/hud";
import { V3, ease, lerp, prog } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { FALL0, FALL1, NSTEP, RUN0, RUN1, SFX, SLIDE0, T, TS, XCUTS, stepAt } from "./cues";
import { Open, OPEN } from "./open";
import { CX, HERO_RY, HL as H, HL1, NEO, PEBBLE, RUN_B, SOFA, TS_OP, World, dawn, dragZ, pushX, pushY, runP, toeX } from "./world";
import { EXPOSURE } from "./exposure";

const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
const W3 = WINS[3], W6 = WINS[6], W10 = WINS[10];
const [X1, X2, X3, X4, X5, X6, X7, X8, X9, X10, X11, X12, X13, X14] = XCUTS;

/** as três aberturas (0 → «algunas»), cada uma já em ação no quadro 0 */
const OPENING: Record<Open, Shot> = {
  a: { name: "abertura a: os dintéis caem do céu em onda sobre o círculo pronto", t0: 0, keys: [
    K(0, [2.0, 1.1, -0.4], [0.0, 6.4, 5.4], 64, 3), K(0.42, [1.8, 1.3, -0.8], [0.0, 6.2, 5.4], 64, -2.5),
    K(1.1, [4.5, 4.2, -3.6], [0.0, 4.0, 5.0], 62, 2), K(X1 - 0.04, [8.0, 8.5, -9.0], [0.0, 2.4, 2.0], 58, -1)] },
  b: { name: "abertura b: a pedra no trenó vem para a câmera entre as duas filas que puxam", t0: 0, keys: [
    K(0, [1.1, 1.9, 38.2], [0.0, 1.1, 27.5], 56, 2.5), K(0.8, [0.7, 2.0, 38.8], [0.0, 1.2, 28.5], 56, -1.5),
    K(1.45, [0.9, 2.4, 39.6], [0.0, 1.4, 29.6], 56, 1), K(X1 - 0.04, [1.6, 6.2, 41.6], [0.0, 2.4, 22.0], 58, 0)] },
  c: { name: "abertura c: o operário empurra sozinho um pilar de 30 t em pé, escorrega e voa para trás (✖)", t0: 0, keys: [
    // push-in com tranco nos 10 primeiros quadros; acompanha o voo; no fim sobe e mostra o círculo
    K(0, [CX - 2.6, 2.6, 39.6], [CX - 0.3, 1.5, 27.0], 46, 2.5), K(0.1, [CX - 2.5, 2.45, 39.1], [CX - 0.25, 1.45, 27.0], 46, -2),
    K(0.2, [CX - 2.4, 2.55, 38.6], [CX - 0.35, 1.4, 27.0], 46, 1.5), K(0.33, [CX - 2.35, 2.4, 38.1], [CX - 0.3, 1.4, 27.0], 46, -0.5),
    K(0.9, [CX - 2.2, 2.4, 37.8], [CX - 0.4, 1.4, 27.0], 46, 0.5), K(1.3, [CX - 2.8, 2.3, 37.9], [CX - 1.4, 1.3, 27.0], 46, 2),
    K(1.8, [CX - 3.0, 2.4, 37.8], [CX - 1.6, 1.4, 27.0], 46, -0.5), K(X1 - 0.04, [CX - 1.5, 5.5, 40.5], [CX + 2.5, 2.2, 18.0], 52, 0)] },
};

// ritmo: corte duro a cada ~4 s (régua + XCUTS), chicote na entrada de todo plano (a câmera chega andando e rolando)
const SHOTS: Shot[] = [
  OPENING[OPEN],
  { name: "de cima: pedras azuis trazidas de +200 km, sem rodas", t0: X1, keys: [
    K(X1, [5.5, 6.5, -9.5], [0.0, 2.4, 0.0], 58, 3), K(X1 + 0.45, [8.0, 9.5, -11.5], [0.0, 1.8, 0.0], 58, -0.5),
    K(T.doscientos, [12.0, 13.0, -13.0], [0.0, 1.5, 0.0], 58, 1.5), K(T.rueda, [16.0, 15.0, -4.0], [0.0, 1.5, 0.0], 58, -0.5),
    K(X2 - 0.05, [16.5, 16.5, 3.0], [0.0, 1.0, 0.0], 58, 0.5)] },
  { name: "de baixo, de fora: ⏪ Inglaterra há 4500 anos, tudo afunda → o operário corre da planície vazia até a câmera", t0: X2, keys: [
    K(X2, [-15.5, 1.7, -12.4], [0.0, 2.6, 0.0], 56, -3), K(X2 + 0.45, [-14.4, 2.1, -11.4], [0.0, 2.3, 0.0], 56, 0.5),
    K(RUN0, [-14.0, 2.2, -11.2], [-2.5, 1.4, 0.5], 56, -0.5), K(RUN0 + 0.9, [-13.8, 2.1, -11.4], [-6.5, 1.3, -3.5], 56, 1.5),
    K(C1 - 0.05, [-13.6, 2.0, -11.6], [-9.9, 1.5, -5.9], 54, -1)] },
  { name: "acampamento: madeira, corda, pedra, gente", t0: C1, keys: [
    K(C1, H(-40.9, 3.0, 6.4), H(-34.6, 0.9, 1.8), 56, 3), K(C1 + 0.45, H(-40.4, 3.2, 6.0), H(-34.6, 0.8, 1.8), 56, -0.5),
    K(T.gruas + 0.9, H(-40.0, 3.0, 6.2), H(-33.8, 0.9, 1.6), 56, 1), K(T.madera, H(-39.6, 2.6, 6.0), H(-30.5, 1.2, 0.5), 56, 0.5), K(T.gente, H(-40.5, 2.9, 6.6), H(-32.0, 1.2, 0.0), 58, -0.5),
    K(X3 - 0.05, H(-41.0, 3.4, 7.0), H(-31.0, 1.4, -0.5), 58, 0)] },
  { name: "de trás do acampamento: o círculo fantasma → empurram e a pedra não sai do lugar (✖)", t0: X3, keys: [
    K(X3, H(-47.5, 7.0, 3.0), H(-12.0, 2.0, -6.0), 56, -3), K(X3 + 0.45, H(-46.5, 7.8, 3.6), H(-10.0, 2.2, -7.0), 56, 0.5),
    K(T.circulo + 0.9, H(-44.0, 8.6, 5.5), H(-8.0, 2.5, -9.0), 56, -0.5), K(T.b1 + 0.4, H(-34.8, 2.6, 7.4), H(-34.4, 0.9, 0.0), 56, 1),
    K(C2 - 0.05, H(-34.2, 2.3, 6.9), H(-34.3, 0.9, 0.0), 56, 0)] },
  { name: "de cima: a pedra pula no trenó", t0: C2, keys: [
    K(C2, H(-31.6, 7.0, -3.6), H(-33.0, 0.3, 0.0), 54, -3), K(W3, H(-31.9, 6.8, -3.9), H(-33.0, 0.3, 0.0), 54, -2),
    K(W3 + 0.6, H(-15.0, 5.2, 0.4), H(-30.0, 0.2, 0.4), 52, 4), K(T.trineo, H(-14.6, 5.0, 0.4), H(-30.0, 0.3, 0.4), 52, 0.5),
    K(X4 - 0.05, H(-13.6, 4.8, 0.4), H(-29.0, 0.3, 0.4), 52, -0.5)] },
  { name: "rente ao chão: desliza sobre troncos-trilho → centenas na corda", t0: X4, keys: [
    K(X4, H(-23.0, 1.6, -6.2), H(-30.0, 0.5, -0.6), 54, 3), K(X4 + 0.45, H(-23.6, 1.9, -6.4), H(-29.0, 0.4, -0.4), 54, -0.5),
    K(T.troncos, H(-25.6, 5.2, -10.6), H(-27.6, 0.2, 0.4), 54, 0.5), K(T.rieles + 0.2, H(-24.4, 5.8, -10.0), H(-21.8, 0.2, 0.6), 54, -0.5),
    K(X14 - 0.05, H(-25.0, 6.2, -10.2), H(-21.5, 0.3, 0.8), 54, 0)] },
  { name: "de frente, na fila: centenas na corda, caras de esforço → um escorrega e vai arrastado de costas (✖)", t0: X14, keys: [
    K(X14, H(-12.0, 4.8, 0.4), H(-19.8, -0.2, 1.5), 54, -3), K(X14 + 0.45, H(-11.6, 5.0, 0.6), H(-19.4, -0.2, 1.5), 54, 0.5),
    K(T.tiran, H(-11.3, 5.0, 0.6), H(-19.0, -0.2, 1.5), 54, -0.5), K(C3 - 0.05, H(-10.8, 5.1, 0.6), H(-18.4, -0.2, 1.5), 54, 0)] },
  { name: "de fora, no canteiro: chega deitada → o fantasma em pé", t0: C3, keys: [
    K(C3, H(-12.8, 3.8, 9.4), H(-11.5, 0.9, 0.0), 56, 3), K(C3 + 0.45, H(-11.8, 4.0, 8.9), H(-10.4, 0.9, 0.0), 56, -0.5),
    K(T.acostada + 0.3, H(-6.4, 6.0, 11.6), H(-3.2, 0.6, 0.0), 62, 0.5), K(T.depie, H(-5.0, 6.2, 11.4), H(-2.2, 1.4, 0.0), 60, -0.5),
    K(X5 - 0.05, H(-4.2, 5.6, 10.0), H(-1.8, 1.9, 0.0), 58, 0)] },
  { name: "corte em seção (fechado): ⏪ cavam o buraco com a parede em rampa", t0: X5, keys: [
    K(X5, H(-4.6, -0.3, 10.4), H(-3.4, 0.9, 0.0), 48, -3), K(X5 + 0.45, H(-3.6, -0.32, 10.0), H(-2.6, 0.8, 0.0), 48, 0.5),
    K(T.cavan, H(-2.0, -0.32, 9.6), H(-1.2, 0.5, 0.0), 48, -0.5), K(T.rampa + 0.6, H(-2.3, -0.32, 9.4), H(-1.6, 0.4, 0.0), 48, 0.5),
    K(X6 - 0.05, H(-2.7, -0.32, 9.6), H(-2.0, 0.4, 0.0), 48, 0)] },
  { name: "de fora, 3/4 de cima: empurram a pedra → a ponta tomba na borda e cai no buraco", t0: X6, keys: [
    K(X6, H(-15.6, 4.4, 1.4), H(-3.0, 0.0, -0.3), 58, 3), K(X6 + 0.45, H(-15.0, 4.2, 1.2), H(-3.0, 0.0, -0.3), 58, -0.5),
    K(T.punta - 0.2, H(-12.0, 4.0, 1.4), H(-2.0, -0.3, -0.2), 58, 0.5),
    // chicote para o lado (3/4 de cima, de fora): a ponta passa a borda e tomba na rampa — de trás, a própria pedra escondia isso
    K(T.punta + 0.12, H(-5.6, 4.9, 5.8), H(-1.6, -0.4, 0.0), 58, 2.5), K(T.cae + 0.3, H(-4.8, 4.5, 5.4), H(-1.2, -0.6, 0.0), 58, -0.5),
    K(C4 - 0.05, H(-4.4, 4.6, 5.6), H(-1.0, -0.5, 0.0), 58, 0)] },
  { name: "de fora: endireitam com cordas → enchem o buraco com pedras e terra", t0: C4, keys: [
    K(C4, H(-4.4, 7.0, 13.4), H(2.4, 1.8, 0.8), 58, 3), K(C4 + 0.45, H(-3.5, 7.6, 12.5), H(2.4, 1.8, 0.8), 58, -0.5),
    K(T.tirando + 0.8, H(-3.0, 7.8, 12.8), H(2.2, 1.9, 0.8), 58, 0.5), K(T.rellenan + 0.2, H(-4.2, 5.2, 4.8), H(-1.2, -0.3, 0.0), 54, -0.5),
    K(T.apretadas + 0.3, H(-3.8, 4.8, 4.2), H(-1.3, -0.2, 0.0), 54, 0.5), K(X7 - 0.05, H(-3.5, 4.6, 4.0), H(-1.3, -0.2, 0.0), 54, 0)] },
  { name: "baixo e largo: o hoyo → dois pilares e o dintel deitado", t0: X7, keys: [
    K(X7, H(-7.0, 1.8, 9.4), H(0.5, 1.8, 0.0), 60, -3), K(X7 + 0.45, H(-6.2, 2.3, 8.8), H(0.5, 1.9, 0.0), 60, 0.5),
    K(T.p2 + 0.4, [0.0, 3.0, 19.5], [0.0, 2.6, 10.0], 58, -0.5), K(W6, [0.2, 3.2, 19.0], [0.0, 2.6, 10.0], 58, 0),
    K(W6 + 0.4, [1.6, 7.0, 15.2], [0.0, 0.4, 11.4], 56, 3), K(C5 - 0.02, [1.4, 7.0, 15.0], [0.0, 0.4, 11.4], 56, 2)] },
  { name: "a altura: +4 m → ⏪ «lo más probable» (HIPÓTESIS)", t0: C5, keys: [
    K(C5, [-6.6, 2.0, 19.4], [-0.6, 2.2, 10.8], 58, -3), K(C5 + 0.45, [-5.8, 2.4, 18.6], [-0.6, 2.2, 10.8], 58, 0.5),
    K(T.metros + 0.6, [-5.4, 2.6, 18.2], [0.3, 2.2, 10.8], 58, -0.5), K(X8 - 0.05, [-4.4, 3.6, 17.2], [0.3, 2.5, 10.8], 58, 0.5)] },
  { name: "alavancas de perto: um lado, um tronco → o outro lado, outro tronco", t0: X8, keys: [
    K(X8, [-8.8, 1.5, 17.4], [-2.4, 1.2, 11.6], 54, 3), K(X8 + 0.45, [-8.0, 2.2, 19.0], [-2.4, 1.2, 11.6], 56, -0.5),
    K(T.tronco1 + 0.4, [-7.6, 2.0, 18.4], [-2.0, 1.0, 11.6], 56, 0.5), K(T.otroLado, [7.6, 2.2, 18.6], [2.2, 1.2, 11.6], 56, 3),
    K(T.otroTronco + 0.3, [7.2, 2.0, 18.0], [2.0, 1.0, 11.6], 56, -0.5), K(X9 - 0.05, [6.6, 2.3, 18.2], [1.4, 1.4, 11.5], 56, 0)] },
  { name: "do alto: capa a capa a torre sobe → esta é a torre → solta lá em cima", t0: X9, keys: [
    K(X9, [-5.2, 7.8, 16.6], [0.0, 2.0, 11.2], 58, 3), K(X9 + 0.45, [-4.4, 7.0, 17.4], [0.0, 2.2, 11.2], 58, -0.5),
    K(TS - 0.3, [-7.6, 5.3, 20.2], [-2.6, 1.5, 11.8], 58, 1), K(TS + 1.5, [-7.0, 5.6, 20.0], [-2.2, 2.2, 11.6], 58, -0.5),
    K(T.estaTorre, [3.5, 5.6, 19.2], [0.0, 3.4, 11.0], 58, -0.5),
    K(T.p3, [4.0, 6.2, 17.5], [0.0, 4.6, 10.6], 56, 0.5), K(C6 - 0.05, [4.2, 6.5, 17.2], [0.0, 4.6, 10.6], 56, 0)] },
  { name: "de cima, por dentro: o dintel solto cai e quica (✖) → ⏪ volta → talham", t0: C6, keys: [
    K(C6, [1.4, 10.2, 3.6], [0.0, 4.3, 10.6], 56, 3), K(C6 + 0.45, [0.6, 9.6, 4.0], [0.0, 4.3, 10.6], 56, -0.5),
    K(FALL0, [0.5, 9.4, 4.2], [0.3, 3.2, 9.0], 56, 0.5), K(FALL1 + 0.15, [0.6, 8.8, 3.8], [1.0, 1.0, 7.8], 58, -0.5),
    K(T.b4 + 0.5, [0.5, 8.0, 4.6], [0.0, 4.3, 10.6], 56, 0.5), K(T.tallan + 0.4, [0.8, 7.0, 4.8], [0.0, 4.3, 10.2], 56, -0.5),
    K(X10 - 0.05, [1.2, 7.4, 4.4], [0.0, 4.3, 10.2], 56, 0)] },
  { name: "close de lado: o saliente do pilar e o buraco do dintel → ¡clic!", t0: X10, keys: [
    K(X10, [-2.4, 5.0, 6.6], [0.0, 4.4, 9.9], 46, -3), K(X10 + 0.45, [-1.8, 4.9, 6.2], [0.0, 4.4, 9.9], 48, 0.5),
    K(T.saliente, [-1.0, 4.75, 5.8], [0.0, 4.3, 10.0], 50, -0.5), K(T.encima, [0.2, 4.7, 5.6], [0.0, 4.5, 10.0], 52, 0.5),
    K(T.encaja + 0.1, [0.4, 4.6, 5.8], [0.0, 4.4, 10.0], 52, 0), K(C7 - 0.05, [0.6, 4.7, 6.0], [0.0, 4.4, 10.0], 52, -0.5)] },
  { name: "de fora, do alto: juntas de carpinteiro → o círculo se completa", t0: C7, keys: [
    K(C7, [4.0, 11.2, 17.4], [0.0, 4.0, 10.0], 54, -3), K(C7 + 0.45, [3.0, 10.5, 16.5], [0.0, 4.0, 10.0], 54, 0.5),
    K(T.juntas - 0.3, [5.0, 13.0, 20.0], [0.0, 3.0, 8.0], 58, -0.5), K(X11 - 0.05, [3.5, 15.0, 21.0], [0.0, 2.0, 4.0], 58, 0)] },
  { name: "atrás do operário: o círculo mira o nordeste, ele aponta e ergue os braços para a aurora", t0: X11, keys: [
    K(X11, [1.6, 3.6, 0.6], [-1.6, 2.0, -9.0], 56, 3), K(X11 + 0.45, [1.2, 3.0, 0.0], [-1.6, 2.0, -9.0], 56, -0.5),
    K(T.largo, [1.0, 2.6, -0.8], [-1.8, 2.0, -9.5], 54, 0.5), K(X12 - 0.05, [0.7, 2.5, -1.6], [-2.0, 2.0, -9.5], 54, 0)] },
  { name: "do centro, rente ao chão, NO eixo: o sol nasce no vão, no fim da linha tracejada (sem operário)", t0: X12, keys: [
    K(X12, [0.0, 1.7, 2.6], [0.0, 1.9, -30.0], 50, 2), K(X12 + 0.45, [0.0, 1.55, 1.8], [0.0, 1.8, -30.0], 50, -0.5),
    K(X13 - 0.05, [0.0, 1.35, 0.2], [0.0, 1.9, -30.0], 50, 0)] },
  { name: "o operário de frente: ¿para qué? → mándaselo → o sofá cai do céu e nem ele se mexe", t0: X13, keys: [
    K(X13, [0.6, 1.9, 0.6], [-2.1, 2.4, -6.4], 50, -3), K(X13 + 0.45, [0.3, 1.8, 0.1], [-2.1, 2.4, -6.4], 50, 0.5),
    K(W10, [-0.1, 1.8, -0.6], [-2.2, 2.3, -6.4], 50, -0.5), K(W10 + 0.5, [0.6, 3.2, 0.2], [-2.8, 1.9, -6.0], 52, 1.5),
    K(T.end, [0.8, 3.5, 0.8], [-2.8, 1.9, -6.0], 52, 0)] },
];
// sem janela parada: a câmera na mão anda sempre (a seção, com a câmera sob o chão, e o close das juntas ficam baixos)
// (janela 9 baixa: no plano do sol a câmera tem de ficar NO eixo, senão o sol cai atrás de um pilar)
const DYN = [0.8, 2.0, 4.0, 2.4, 0.35, 1.6, 3.6, 3.0, 0.9, 0.15, 0.3];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const camp = H(-29.0, 0, -0.9), sec = H(-5.0, 0, -1.8), rope = H(3.9, 0, 2.6), lever: V3 = [-4.95, 0, 11.7];
const OPEN_W: Record<Open, [number, WorkerState][]> = {
  a: [[0, S([-1.5, 0, 4.0], 2.6, "alarm")]],
  b: [[0, S([0, 1.75, 21.6], 0, "cheer", { follow: (t) => [0, 1.75, dragZ(t) - 2.0] })]],
  c: [[0, S([CX - 1.1, 0, 27], Math.PI / 2, "pull", { follow: (t) => [pushX(t), pushY(t), 27] })],
    [0.93, S([CX - 1.1, 0, 27], Math.PI / 2, "alarm", { follow: (t) => [pushX(t), pushY(t), 27] })],
    [PEBBLE, S([CX - 1.1, 0, 27], 0.6, "think", { follow: (t) => [pushX(t), 0, 27] })]],
};
const dodge = (t: number): V3 => { const u = ease(t, T.caer - 0.1, T.caer + 0.3); return [lerp(1.8, 3.4, u), 0.6 * Math.sin(Math.PI * prog(t, T.caer - 0.1, T.caer + 0.3)), lerp(7.2, 7.6, u)]; };
const WORKER: [number, WorkerState][] = [
  ...OPEN_W[OPEN],
  [T.algunas - 0.01, S([-1.5, 0, 4.0], 2.6, "present")],
  [T.algunas + 0.3, S([-1.5, 0, 4.0], 2.6, "point")],
  [T.inglaterra, S([-3.0, 0, -0.5], -2.45, "alarm")],
  [RUN0, S(RUN_B, -2.45, "walk", { follow: runP })], // (p = onde a corrida termina: o próximo item não anda)
  [RUN1, S(RUN_B, -2.43, "present")],
  [C1, S(camp, -1.13, "present")],
  [T.madera, S(camp, 0.35, "point")],
  [T.piedra, S(camp, -1.6, "point")],
  [T.gente, S(camp, -1.13, "cheer")],
  [T.levantar, S(camp, 1.77, "point")],
  [T.b1, S(camp, -1.13, "think")],
  [C2, S(H(-30.0, 0, 2.6), HERO_RY - 0.4, "cheer")],
  [T.trineo, S(H(-29.2, 0, -1.4), HERO_RY - 0.8, "point")],
  [SLIDE0, S(H(-29.2, 0, -1.4), HERO_RY + Math.PI / 2, "walk", { follow: (t) => H(toeX(t) + 1.0, 0, -1.4) })],
  [C3, S(sec, HERO_RY, "present")],
  [T.p1, S(sec, HERO_RY, "alarm")],
  [T.b2, S(sec, HERO_RY, "think")],
  [T.c2, S(sec, HERO_RY, "cheer")],
  [T.rampa, S(sec, HERO_RY + 1.3, "point")],
  [T.cae, S(sec, HERO_RY, "cheer")],
  [C4, S(rope, HERO_RY + Math.PI / 2, "pull")],
  [T.tirando + 0.9, S(rope, HERO_RY - 0.6, "cheer")],
  [T.esteHoyo, S(rope, HERO_RY - 0.6, "present")],
  [T.p2, S(rope, HERO_RY - 0.6, "alarm")],
  [C5, S([-2.7, 0, 11.0], -0.43, "present")],
  [T.altura, S([-2.7, 0, 11.0], -0.43, "point")],
  [T.b3, S([-2.7, 0, 11.0], 0.9, "alarm")],
  [T.c3, S([-2.7, 0, 11.0], -0.43, "think")],
  [T.palancas, S(lever, Math.PI / 2, "point")],
  [T.levantan, S(lever, Math.PI / 2, "pull")],
  [T.tronco1 + 0.3, S(lever, 0.5, "cheer")],
  [T.capa, S(TS_OP, 0.8, "cheer")],
  [TS - 0.05, S(TS_OP, 1.6, "alarm")], // o tronco que escapa da torre bate na cabeça dele
  [TS + 0.35, S(TS_OP, 0.3, "think")],
  [TS + 1.45, S(TS_OP, 0.8, "cheer")],
  [T.p3, S(TS_OP, 0.8, "alarm")],
  [C6, S([1.8, 0, 7.2], Math.PI - 0.2, "point")],
  [T.caer - 0.1, S([3.4, 0, 7.6], -2.2, "alarm", { follow: dodge })], // (p = onde o pulo termina: o próximo item não anda)
  [T.caer + 0.3, S([3.4, 0, 7.6], -2.6, "alarm")],
  [T.b4, S([1.8, 0, 7.2], Math.PI - 0.2, "point")],
  [C7, S([-2.3, 0, -6.4], Math.PI, "idle", { scale: 0 })],
  [T.giro, S([-2.3, 0, -6.4], Math.PI + 0.2, "point")],
  [T.largo - 0.1, S([-2.3, 0, -6.4], Math.PI + 0.2, "cheer")],
  [X12, S([-2.3, 0, -6.4], Math.PI + 0.2, "cheer", { scale: 0 })],
  [X13, S([-2.3, 0, -6.4], 0.35, "think")],
  [T.manda, S([-2.3, 0, -6.4], 0.42, "cheer")],
  [T.sofa - 0.05, S([-2.3, 0, -6.4], -0.5, "alarm")],
  [T.sofa + 0.35, S([SOFA[0] + 1.05, 0, SOFA[2] - 0.75], -0.94, "pull")],
];

/** bordão «SIN X» → «¡CON INGENIO!»: igual ao do motor, mas o amarelo entra abaixo do carimbo cinza (o crítico: um cobria o outro) */
const STAMPS: [number, number, string][] = [[T.b1, T.c1, "SIN RUEDAS"], [T.b2, T.c2, "SIN GRÚA"], [T.b3, T.c3, "SIN GRÚA"]];
const StampLo: React.FC<{ t: number; a: number; b: number; label: string }> = ({ t, a, b, label }) => {
  const k = win(t, a, b + 1.5, 0.15); if (k <= 0) return null;
  const s1 = pop(t, a, 0.25), strike = ease(t, a + 0.3, a + 0.55), s2 = pop(t, b, 0.3), shake = t > b ? Math.sin((t - b) * 30) * 6 * (1 - prog(t, b, b + 0.5)) : 0;
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: 560, height: 420, opacity: k }}>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 0, display: "flex", justifyContent: "center", transform: `rotate(-4deg) scale(${s1 * (t > b ? 0.86 : 1)})`, opacity: t > b ? 0.8 : 1 }}>
        <div style={{ position: "relative", padding: "6px 30px 10px", border: "8px solid #5b6670", borderRadius: 18, background: "#d9dee2e6" }}>
          <span style={{ fontFamily: FONT, fontSize: 70, color: "#5b6670", letterSpacing: 3 }}>{label}</span>
          <div style={{ position: "absolute", left: -12, top: "48%", height: 16, width: `${104 * strike}%`, background: "#e0262b", borderRadius: 8, transform: "rotate(-8deg)", transformOrigin: "left center" }} />
        </div>
      </div>
      {t >= b ? (
        <div style={{ position: "absolute", left: 0, width: 1080, top: 150, display: "flex", justifyContent: "center", transform: `rotate(${3 + shake * 0.2}deg) scale(${s2})` }}>
          <span style={{ fontFamily: FONT, fontSize: 124, color: "#ffd400", lineHeight: 1, ...stroke(16, "#3a2300") }}>¡CON INGENIO!</span>
        </div>) : null}
    </div>
  );
};
// (os ícones pequenos ao lado das pílulas saíram: motor, roda e grua aparecem grandes no mundo e levam um ✖ 3D)
const HAVE: [number, string][] = [[T.madera, "MADERA"], [T.cuerda, "CUERDA"], [T.piedra, "PIEDRA"], [T.gente, "MUCHA GENTE"]];
const steps = (t: number) => { let n = 0; for (let k = 1; k <= NSTEP; k++) if (t >= stepAt(k)) n++; return n; };
const hyp = (t: number) => Math.max(win(t, T.prob1, T.esteTrineo - 0.1, 0.2), win(t, T.c3, T.estaTorre - 0.1, 0.2));
const hud: HudData = {
  pills: [
    { a: T.treinta, b: T.algunas - 0.1, label: "PIEDRAS DE HASTA", value: (t) => `${count(t, T.treinta, T.treinta + 0.8, 0, 30)} t`, y: 440 },
    { a: T.doscientos, b: T.rueda - 0.1, label: "DISTANCIA", value: () => "+200 km", y: 440, tone: "gold" },
    { a: T.rueda, b: T.inglaterra - 0.1, label: "RUEDAS", value: () => "0", y: 440, tone: "red" },
    { a: T.inglaterra, b: T.nohay - 0.1, label: "HACE", value: (t) => `~${count(t, T.inglaterra + 0.2, RUN1 - 0.2, 0, 4500).replace(/\./g, "")} AÑOS`, y: 440, tone: "gold" },
    { a: T.nohay, b: T.madera - 0.15, label: "MOTORES", value: () => "0", y: 250, tone: "red" },
    { a: T.ruedas, b: T.madera - 0.15, label: "RUEDAS", value: () => "0", y: 345, tone: "red" },
    { a: T.gruas, b: T.madera - 0.15, label: "GRÚAS", value: () => "0", y: 440, tone: "red" },
    { a: T.madera, b: T.levantar - 0.1, label: "TIENEN", value: (t) => HAVE.filter(([a]) => t >= a - 0.1).slice(-1)[0]?.[1] ?? "", y: 440, tone: "green" },
    { a: T.circulo, b: T.b1 - 0.1, label: "MISIÓN", value: () => "CÍRCULO", y: 440, tone: "gold" },
    { a: T.cientos, b: T.esteTrineo - 0.1, label: "PERSONAS", value: () => "~10 POR TONELADA", y: 440 },
    { a: T.rampa, b: T.empujan + 0.5, label: "PARED", value: () => "EN RAMPA", y: 440 },
    { a: T.piedras, b: T.esteHoyo - 0.1, label: "RELLENO", value: (t) => (t < T.tierra - 0.05 ? "PIEDRAS" : t < T.apretadas - 0.05 ? "TIERRA" : "¡APRETADO!"), y: 440, tone: "green" },
    { a: T.altura, b: T.b3 - 0.1, label: "ALTURA", value: (t) => `+${count(t, T.altura, T.metros + 0.5, 0, 4)} m`, y: 440, tone: "red" },
    { a: T.tronco1, b: T.estaTorre - 0.1, label: "CAPAS", value: (t) => `${Math.ceil(steps(t) / 2)}`, y: 440, tone: "green" },
    { a: T.saliente, b: T.encima - 0.1, label: "PILAR", value: () => "SALIENTE", y: 440, tone: "green" },
    { a: T.hueco, b: T.encaja + 0.4, label: "DINTEL", value: () => "HUECO", y: 440, tone: "green" },
    { a: T.largo, b: T.nadie - 0.1, label: "SOLSTICIO", value: () => "DE VERANO", y: 440, tone: "gold" },
  ],
  titles: [
    { a: T.esteTrineo, text: "TRINEO" }, { a: T.esteHoyo, text: "HOYO" }, { a: T.estaTorre, text: "TORRE DE TRONCOS", len: 1.5 },
    { a: T.juntas, text: "JUNTAS DE CARPINTERO", len: 1.6 },
  ],
  alerts: [T.p1, T.p2, T.p3],
  rewinds: [T.inglaterra, T.b2, T.b3, T.b4],
  crosses: [...(OPEN === "c" ? [[1.0, T.algunas - 0.05] as [number, number]] : []), [T.toneladas + 0.5, C2 - 0.1], [HL1 + 0.05, T.c3 - 0.1], [FALL0 + 0.1, T.b4 - 0.1]],
  stamps: [], // o carimbo do bordão é o local (StampLo): o «¡CON INGENIO!» entra ABAIXO do cinza, sem cobri-lo
  reward: { a: T.manda - 0.1, len: T.end - T.manda + 0.1, top: "LEVANTADO HACE", big: () => "~4500 AÑOS", sub: "SIN UN SOLO MOTOR" },
  Extra: ({ t }) => {
    const map = win(t, T.algunas, T.rueda - 0.1, 0.2), wheel = win(t, T.rueda, T.inglaterra - 0.05, 0.15), h = hyp(t);
    const clic = win(t, T.encaja, T.encaja + 0.55, 0.1), mueble = win(t, T.mueble, T.juntas - 0.1, 0.15), q = win(t, X13, T.manda - 0.2, 0.2);
    const route = prog(t, T.algunas + 0.2, T.doscientos + 0.4);
    return (
      <>
        {STAMPS.map(([a, b, l]) => <StampLo key={a} t={t} a={a} b={b} label={l} />)}
        {map > 0 ? (
          <div style={{ position: "absolute", left: 0, width: 1080, top: 600, display: "flex", justifyContent: "center", opacity: map, transform: `scale(${pop(t, T.algunas, 0.3)}) rotate(-2deg)` }}>
            <div style={{ position: "relative", width: 560, height: 400, borderRadius: 34, background: "#bfe3f5", border: "8px solid #14202b", boxShadow: "0 10px 0 #00000055", overflow: "hidden" }}>
              <svg viewBox="0 0 320 230" width="560" height="400" style={{ position: "absolute", left: 0, top: 0 }}>
                <path d="M60 12 L112 26 L150 8 L196 0 L262 2 L272 40 L302 66 L292 108 L312 128 L300 160 L250 172 L200 178 L150 184 L110 194 L70 204 L18 222 L40 192 L76 172 L98 154 L62 146 L28 128 L40 96 L72 82 L52 46 Z" fill="#8fd16a" stroke="#2f5a22" strokeWidth="4" strokeLinejoin="round" />
                <path d="M44 118 Q104 128 170 152" fill="none" stroke="#14202b" strokeWidth="9" strokeLinecap="round" strokeDasharray="0.1 18" pathLength={130} strokeDashoffset={0} style={{ opacity: route > 0 ? 1 : 0 }} />
                <path d="M44 118 Q104 128 170 152" fill="none" stroke="#ff4a3a" strokeWidth="6" strokeLinecap="round" pathLength={1} strokeDasharray={`${route} 1`} />
                <circle cx="44" cy="118" r="9" fill="#5ab8ff" stroke="#14202b" strokeWidth="4" />
                <path d="M170 136 L175 148 L188 148 L178 156 L182 169 L170 161 L158 169 L162 156 L152 148 L165 148 Z" fill="#ffd400" stroke="#14202b" strokeWidth="3" />
              </svg>
              <span style={{ position: "absolute", left: 22, top: 222, fontFamily: FONT, fontSize: 34, color: "#14202b" }}>GALES</span>
              <span style={{ position: "absolute", left: 250, top: 300, fontFamily: FONT, fontSize: 34, color: "#14202b" }}>STONEHENGE</span>
              <span style={{ position: "absolute", left: 150, top: 26, fontFamily: FONT, fontSize: 62, color: "#fff", opacity: route > 0.6 ? 1 : 0, ...stroke(9) }}>+200 km</span>
            </div>
          </div>) : null}
        {wheel > 0 ? (
          <div style={{ position: "absolute", left: 0, width: 1080, top: 640, display: "flex", justifyContent: "center", opacity: wheel, transform: `scale(${pop(t, T.rueda, 0.3)})` }}>
            <svg viewBox="0 0 120 120" width="300" height="300">
              <circle cx="60" cy="60" r="40" fill="none" stroke="#8a5a2e" strokeWidth="11" /><circle cx="60" cy="60" r="8" fill="#8a5a2e" />
              {[0, 45, 90, 135].map((a) => <line key={a} x1={60 - 40 * Math.cos((a * Math.PI) / 180)} y1={60 - 40 * Math.sin((a * Math.PI) / 180)} x2={60 + 40 * Math.cos((a * Math.PI) / 180)} y2={60 + 40 * Math.sin((a * Math.PI) / 180)} stroke="#8a5a2e" strokeWidth="6" />)}
              <path d="M16 16 L104 104 M104 16 L16 104" stroke="#14202b" strokeWidth="18" strokeLinecap="round" /><path d="M16 16 L104 104 M104 16 L16 104" stroke="#ff2d2d" strokeWidth="11" strokeLinecap="round" />
            </svg>
          </div>) : null}
        {h > 0 ? (
          <div style={{ position: "absolute", left: 0, width: 1080, top: 300, display: "flex", justifyContent: "center", opacity: h, transform: `rotate(${-3 + Math.sin(t * 2.5) * 1.5}deg)` }}>
            <div style={{ padding: "6px 30px 10px", borderRadius: 40, background: "#4b2a7ae6", border: "5px solid #ffffff55", boxShadow: "0 7px 0 #00000055", display: "flex", alignItems: "baseline", gap: 14 }}>
              <span style={{ fontFamily: FONT, fontSize: 52, color: "#ffe27a" }}>?</span>
              <span style={{ fontFamily: FONT, fontSize: 52, color: "#fff", letterSpacing: 3 }}>HIPÓTESIS</span>
            </div>
          </div>) : null}
        {clic > 0 ? (
          <div style={{ position: "absolute", left: 0, width: 1080, top: 720, display: "flex", justifyContent: "center", opacity: clic, transform: `rotate(-6deg) scale(${pop(t, T.encaja, 0.25)})` }}>
            <span style={{ fontFamily: FONT, fontSize: 150, color: "#fff", ...stroke(16, "#14202b") }}>¡CLIC!</span>
          </div>) : null}
        {mueble > 0 ? (
          <div style={{ position: "absolute", left: 0, width: 1080, top: 640, display: "flex", justifyContent: "center", opacity: mueble, transform: `rotate(4deg) scale(${pop(t, T.mueble, 0.3)})` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 34px", borderRadius: 30, background: "#f4e2c0", border: "7px solid #6b3f22", boxShadow: "0 9px 0 #00000055" }}>
              <svg viewBox="0 0 100 100" width="150" height="150">
                <rect x="14" y="30" width="72" height="16" rx="3" fill="#b07a40" stroke="#4a2a12" strokeWidth="4" />
                <rect x="22" y="46" width="12" height="46" fill="#9a6a3a" stroke="#4a2a12" strokeWidth="4" /><rect x="66" y="46" width="12" height="46" fill="#9a6a3a" stroke="#4a2a12" strokeWidth="4" />
                <rect x="25" y="24" width="6" height="12" fill="#ffd400" stroke="#4a2a12" strokeWidth="2" /><rect x="69" y="24" width="6" height="12" fill="#ffd400" stroke="#4a2a12" strokeWidth="2" />
              </svg>
              <span style={{ fontFamily: FONT, fontSize: 64, color: "#4a2a12", lineHeight: 1 }}>COMO UN MUEBLE</span>
            </div>
          </div>) : null}
        {q > 0 ? (
          <div style={{ position: "absolute", left: 0, width: 1080, top: 640, display: "flex", justifyContent: "center", opacity: q, transform: `scale(${pop(t, X13, 0.35)})` }}>
            <span style={{ fontFamily: FONT, fontSize: 120, color: "#ffd400", ...stroke(14, "#3a2300") }}>¿PARA QUÉ?</span>
            {[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ position: "absolute", left: 120 + i * 190, top: -80 - 40 * Math.sin(t * 2 + i * 1.7), fontFamily: FONT, fontSize: 70 + (i % 2) * 24, color: "#fff", opacity: 0.85, ...stroke(8) }}>?</span>)}
          </div>) : null}
      </>
    );
  },
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: NEO, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#eef3fa", fogNear: 140, fogFar: 560, hemiSky: "#f3f7ff", hemiGround: "#9fcf6a", hemiI: 1.2, sun: "#fff2d6", sunI: 2.6 },
  // o nascer do sol: escurece em 1,6 s (nunca abaixo de 0,73) e volta quando o sol sai
  LIGHT: (t) => 1 - 0.27 * dawn(t),
};
