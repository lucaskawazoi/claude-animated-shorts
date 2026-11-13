// E12 — Stonehenge (ecos-del-tiempo, Shorts). Câmera, operário, painel e luz deste episódio.
import React from "react";
import { K, Shot } from "../../toy/cam";
import { CUTS, WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { FONT, HudData, count, pop, stroke, win } from "../../toy/hud";
import { V3, ease, lerp, prog } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { FALL0, FALL1, NSTEP, SFX, T, XCUTS, stepAt } from "./cues";
import { Open, OPEN } from "./open";
import { HERO_RY, HL as H, NEO, World, dawn, dragZ, pushX, pushY } from "./world";
import { EXPOSURE } from "./exposure";

const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
const W3 = WINS[3], W6 = WINS[6], W10 = WINS[10];
const [X1, X2, X3, X4, X5, X6, X7, X8, X9, X10, X11, X12] = XCUTS;

/** as três aberturas (0 → «algunas»), cada uma já em ação no quadro 0 */
const OPENING: Record<Open, Shot> = {
  a: { name: "abertura a: os dintéis caem do céu em onda sobre o círculo pronto", t0: 0, keys: [
    K(0, [2.0, 1.1, -0.4], [0.0, 6.4, 5.4], 64, 3), K(0.42, [1.8, 1.3, -0.8], [0.0, 6.2, 5.4], 64, -2.5),
    K(1.1, [4.5, 4.2, -3.6], [0.0, 4.0, 5.0], 62, 2), K(X1 - 0.04, [8.0, 8.5, -9.0], [0.0, 2.4, 2.0], 58, -1)] },
  b: { name: "abertura b: a pedra no trenó vem para a câmera entre as duas filas que puxam", t0: 0, keys: [
    K(0, [1.1, 1.9, 38.2], [0.0, 1.1, 27.5], 56, 2.5), K(0.8, [0.7, 2.0, 38.8], [0.0, 1.2, 28.5], 56, -1.5),
    K(1.45, [0.9, 2.4, 39.6], [0.0, 1.4, 29.6], 56, 1), K(X1 - 0.04, [1.6, 6.2, 41.6], [0.0, 2.4, 22.0], 58, 0)] },
  c: { name: "abertura c: o operário empurra sozinho um pilar de 30 t em pé, escorrega e voa para trás (✖)", t0: 0, keys: [
    K(0, [-2.2, 1.5, 33.0], [-0.5, 2.3, 27.0], 56, 3), K(1.2, [-2.0, 1.6, 33.4], [-0.6, 2.4, 27.0], 56, -1.5),
    K(1.6, [-3.0, 1.4, 33.0], [-1.8, 1.8, 27.0], 56, 2), K(X1 - 0.04, [-2.0, 5.0, 35.0], [0.0, 2.6, 20.0], 58, 0)] },
};

// ritmo: corte duro a cada ~4 s (régua + XCUTS), chicote na entrada de todo plano (a câmera chega andando e rolando)
const SHOTS: Shot[] = [
  OPENING[OPEN],
  { name: "de cima: pedras azuis trazidas de +200 km, sem rodas", t0: X1, keys: [
    K(X1, [5.5, 6.5, -9.5], [0.0, 2.4, 0.0], 58, 3), K(X1 + 0.45, [8.0, 9.5, -11.5], [0.0, 1.8, 0.0], 58, -0.5),
    K(T.doscientos, [12.0, 13.0, -13.0], [0.0, 1.5, 0.0], 58, 1.5), K(T.rueda, [16.0, 15.0, -4.0], [0.0, 1.5, 0.0], 58, -0.5),
    K(X2 - 0.05, [16.5, 16.5, 3.0], [0.0, 1.0, 0.0], 58, 0.5)] },
  { name: "de baixo, de fora: ⏪ Inglaterra há 4500 anos, tudo afunda e a planície fica vazia", t0: X2, keys: [
    K(X2, [-15.5, 1.7, -12.4], [0.0, 2.6, 0.0], 56, -3), K(X2 + 0.45, [-14.4, 2.1, -11.4], [0.0, 2.3, 0.0], 56, 0.5),
    K(T.cuatromil, [-13.6, 2.9, -10.6], [0.0, 1.6, 0.0], 56, -0.5), K(C1 - 0.05, [-12.0, 6.5, -9.0], [0.0, 0.0, 0.0], 58, 0)] },
  { name: "acampamento: madeira, corda, pedra, gente", t0: C1, keys: [
    K(C1, H(-41.2, 2.0, 6.6), H(-31.5, 1.3, 0.0), 56, 3), K(C1 + 0.45, H(-40.0, 2.4, 5.8), H(-31.5, 1.3, 0.0), 56, -0.5),
    K(T.madera, H(-39.6, 2.6, 6.0), H(-30.5, 1.2, 0.5), 56, 0.5), K(T.gente, H(-40.5, 2.9, 6.6), H(-32.0, 1.2, 0.0), 58, -0.5),
    K(X3 - 0.05, H(-41.0, 3.4, 7.0), H(-31.0, 1.4, -0.5), 58, 0)] },
  { name: "de trás do acampamento: o círculo fantasma → empurram e a pedra não sai do lugar (✖)", t0: X3, keys: [
    K(X3, H(-47.5, 7.0, 3.0), H(-12.0, 2.0, -6.0), 56, -3), K(X3 + 0.45, H(-46.5, 7.8, 3.6), H(-10.0, 2.2, -7.0), 56, 0.5),
    K(T.circulo + 0.9, H(-44.0, 8.6, 5.5), H(-8.0, 2.5, -9.0), 56, -0.5), K(T.b1 + 0.4, H(-34.8, 2.6, 7.4), H(-34.4, 0.9, 0.0), 56, 1),
    K(C2 - 0.05, H(-34.2, 2.3, 6.9), H(-34.3, 0.9, 0.0), 56, 0)] },
  { name: "de cima: a pedra pula no trenó", t0: C2, keys: [
    K(C2, H(-31.6, 7.0, -3.6), H(-33.0, 0.3, 0.0), 54, -3), K(W3, H(-31.9, 6.8, -3.9), H(-33.0, 0.3, 0.0), 54, -2),
    K(W3 + 0.6, H(-26.0, 3.6, -6.5), H(-32.5, 0.8, 0.5), 58, 4), K(T.trineo, H(-27.0, 3.0, -6.2), H(-33.0, 0.8, 0.0), 56, 0),
    K(X4 - 0.05, H(-27.4, 2.8, -6.0), H(-32.6, 0.8, 0.0), 56, -0.5)] },
  { name: "rente ao chão: desliza sobre troncos-trilho → centenas na corda", t0: X4, keys: [
    K(X4, H(-23.0, 1.2, -5.4), H(-30.0, 0.5, -0.6), 54, 3), K(X4 + 0.45, H(-23.6, 1.5, -5.6), H(-29.0, 0.4, -0.4), 54, -0.5),
    K(T.troncos, H(-24.4, 2.4, -4.6), H(-27.0, 0.2, 0.0), 54, 0.5), K(T.rieles + 0.2, H(-24.2, 3.8, -4.6), H(-21.8, 0.2, 0.2), 54, -0.5),
    K(T.cientos, H(-33.5, 6.5, -6.5), H(-21.0, 0.5, 1.5), 58, 1), K(T.tiran, H(-32.0, 7.5, -8.0), H(-19.5, 0.5, 1.5), 58, 0),
    K(C3 - 0.05, H(-31.4, 7.8, -8.4), H(-19.0, 0.5, 1.5), 58, 0.5)] },
  { name: "de fora, no canteiro: chega deitada → o fantasma em pé", t0: C3, keys: [
    K(C3, H(-12.8, 3.8, 9.4), H(-11.5, 0.9, 0.0), 56, 3), K(C3 + 0.45, H(-11.8, 4.0, 8.9), H(-10.4, 0.9, 0.0), 56, -0.5),
    K(T.acostada + 0.3, H(-8.8, 3.8, 8.2), H(-7.2, 0.9, 0.0), 56, 0.5), K(T.depie, H(-5.0, 5.0, 9.6), H(-2.2, 1.6, 0.0), 58, -0.5),
    K(X5 - 0.05, H(-4.2, 5.6, 10.0), H(-1.8, 1.9, 0.0), 58, 0)] },
  { name: "corte em seção (fechado): ⏪ cavam o buraco com a parede em rampa", t0: X5, keys: [
    K(X5, H(-4.6, -0.3, 10.4), H(-3.4, 0.9, 0.0), 48, -3), K(X5 + 0.45, H(-3.6, -0.32, 10.0), H(-2.6, 0.8, 0.0), 48, 0.5),
    K(T.cavan, H(-2.0, -0.32, 9.6), H(-1.2, 0.5, 0.0), 48, -0.5), K(T.rampa + 0.6, H(-2.3, -0.32, 9.4), H(-1.6, 0.4, 0.0), 48, 0.5),
    K(X6 - 0.05, H(-2.7, -0.32, 9.6), H(-2.0, 0.4, 0.0), 48, 0)] },
  { name: "corte em seção (aberto): empurram → a ponta cai dentro", t0: X6, keys: [
    K(X6, H(-7.4, -0.3, 13.8), H(-6.4, 0.9, 0.0), 62, 3), K(X6 + 0.45, H(-6.8, -0.32, 13.4), H(-6.0, 0.9, 0.0), 62, -0.5),
    K(T.punta - 0.3, H(-5.6, -0.32, 12.8), H(-5.0, 0.9, 0.0), 60, 0.5), K(T.punta + 0.25, H(-3.0, -0.32, 11.4), H(-2.4, 0.6, 0.0), 58, -0.5),
    K(C4 - 0.05, H(-2.4, -0.3, 10.8), H(-1.7, 0.6, 0.0), 58, 0)] },
  { name: "de fora: endireitam com cordas → enchem o buraco com pedras e terra", t0: C4, keys: [
    K(C4, H(-4.4, 7.0, 13.4), H(2.4, 1.8, 0.8), 58, 3), K(C4 + 0.45, H(-3.5, 7.6, 12.5), H(2.4, 1.8, 0.8), 58, -0.5),
    K(T.tirando + 0.8, H(-3.0, 7.8, 12.8), H(2.2, 1.9, 0.8), 58, 0.5), K(T.rellenan + 0.2, H(-4.2, 5.2, 4.8), H(-1.2, -0.3, 0.0), 54, -0.5),
    K(T.apretadas + 0.3, H(-3.8, 4.8, 4.2), H(-1.3, -0.2, 0.0), 54, 0.5), K(X7 - 0.05, H(-3.5, 4.6, 4.0), H(-1.3, -0.2, 0.0), 54, 0)] },
  { name: "baixo e largo: o hoyo → dois pilares e o dintel deitado", t0: X7, keys: [
    K(X7, H(-7.0, 1.8, 9.4), H(0.5, 1.8, 0.0), 60, -3), K(X7 + 0.45, H(-6.2, 2.3, 8.8), H(0.5, 1.9, 0.0), 60, 0.5),
    K(T.p2 + 0.4, [0.0, 3.0, 19.5], [0.0, 2.6, 10.0], 58, -0.5), K(W6, [0.2, 3.2, 19.0], [0.0, 2.6, 10.0], 58, 0),
    K(W6 + 0.4, [1.6, 7.0, 15.2], [0.0, 0.4, 11.4], 56, 3), K(C5 - 0.02, [1.4, 7.0, 15.0], [0.0, 0.4, 11.4], 56, 2)] },
  { name: "a altura: +4 m → ⏪ «lo más probable» (HIPÓTESIS)", t0: C5, keys: [
    K(C5, [-6.6, 2.0, 19.4], [0.4, 2.2, 10.8], 58, -3), K(C5 + 0.45, [-5.8, 2.4, 18.6], [0.4, 2.2, 10.8], 58, 0.5),
    K(T.metros + 0.6, [-5.4, 2.6, 18.2], [0.3, 2.2, 10.8], 58, -0.5), K(X8 - 0.05, [-4.4, 3.6, 17.2], [0.3, 2.5, 10.8], 58, 0.5)] },
  { name: "alavancas de perto: um lado, um tronco → o outro lado, outro tronco", t0: X8, keys: [
    K(X8, [-8.8, 1.5, 17.4], [-2.4, 1.2, 11.6], 54, 3), K(X8 + 0.45, [-8.0, 2.2, 19.0], [-2.4, 1.2, 11.6], 56, -0.5),
    K(T.tronco1 + 0.4, [-7.6, 2.0, 18.4], [-2.0, 1.0, 11.6], 56, 0.5), K(T.otroLado, [7.6, 2.2, 18.6], [2.2, 1.2, 11.6], 56, 3),
    K(T.otroTronco + 0.3, [7.2, 2.0, 18.0], [2.0, 1.0, 11.6], 56, -0.5), K(X9 - 0.05, [6.6, 2.3, 18.2], [1.4, 1.4, 11.5], 56, 0)] },
  { name: "do alto: capa a capa a torre sobe → esta é a torre → solta lá em cima", t0: X9, keys: [
    K(X9, [-5.2, 7.8, 16.6], [0.0, 2.0, 11.2], 58, 3), K(X9 + 0.45, [-4.4, 7.0, 17.4], [0.0, 2.2, 11.2], 58, -0.5),
    K(T.torre, [-3.2, 6.4, 18.6], [0.0, 4.0, 11.0], 58, 0.5), K(T.estaTorre, [3.5, 5.6, 19.2], [0.0, 3.4, 11.0], 58, -0.5),
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
  { name: "do centro, rente ao chão: o sol do dia mais longo nasce no eixo", t0: X11, keys: [
    K(X11, [0.0, 5.4, 3.6], [0.0, 3.0, -20.0], 60, 3), K(X11 + 0.45, [0.0, 3.9, 3.1], [0.0, 2.8, -20.0], 60, -0.5),
    K(T.mira + 0.3, [0.0, 2.1, 2.6], [0.0, 2.5, -20.0], 60, 0.5), K(T.alineado, [0.0, 2.2, 2.8], [0.0, 2.4, -20.0], 60, 0),
    K(X12 - 0.05, [0.2, 2.5, 3.0], [0.0, 2.8, -20.0], 60, -0.5)] },
  { name: "o operário: ¿para qué? → chicote para o alto, o círculo ao nascer do sol", t0: X12, keys: [
    K(X12, [-0.5, 1.6, -1.4], [-1.6, 1.7, -7.0], 54, -3), K(X12 + 0.45, [-0.9, 1.7, -1.9], [-1.6, 1.7, -7.0], 54, 0.5),
    K(W10, [-1.3, 1.8, -2.5], [-1.9, 1.6, -6.8], 54, -0.5), K(W10 + 0.5, [-2.6, 8.6, 1.2], [-0.5, 2.0, -8.0], 60, 1.5),
    K(T.end, [-3.0, 10.2, 1.8], [-0.5, 2.0, -8.0], 60, 0)] },
];
// sem janela parada: a câmera na mão anda sempre (a seção, com a câmera sob o chão, e o close das juntas ficam baixos)
const DYN = [0.8, 2.0, 4.0, 2.4, 0.35, 1.6, 3.6, 3.0, 0.9, 1.3, 0.3];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const camp = H(-29.0, 0, -0.9), sec = H(-5.0, 0, -1.8), rope = H(3.9, 0, 2.6), lever: V3 = [-4.95, 0, 11.7];
const OPEN_W: Record<Open, [number, WorkerState][]> = {
  a: [[0, S([-1.5, 0, 4.0], 2.6, "alarm")]],
  b: [[0, S([0, 1.75, 21.6], 0, "cheer", { follow: (t) => [0, 1.75, dragZ(t) - 2.0] })]],
  c: [[0, S([-1.2, 0, 27], Math.PI / 2, "pull", { follow: (t) => [pushX(t), pushY(t), 27] })], [1.25, S([-1.2, 0, 27], Math.PI / 2, "alarm", { follow: (t) => [pushX(t), pushY(t), 27] })]],
};
const dodge = (t: number): V3 => { const u = ease(t, T.caer - 0.1, T.caer + 0.3); return [lerp(1.8, 3.4, u), 0.6 * Math.sin(Math.PI * prog(t, T.caer - 0.1, T.caer + 0.3)), lerp(7.2, 7.6, u)]; };
const WORKER: [number, WorkerState][] = [
  ...OPEN_W[OPEN],
  [T.algunas - 0.01, S([-1.5, 0, 4.0], 2.6, "present")],
  [T.algunas + 0.3, S([-1.5, 0, 4.0], 2.6, "point")],
  [T.inglaterra, S([-1.5, 0, 4.0], 2.6, "alarm")],
  [T.cuatromil, S([-1.5, 0, 4.0], 2.6, "present")],
  [C1, S(camp, -1.13, "present")],
  [T.madera, S(camp, 0.35, "point")],
  [T.piedra, S(camp, -1.6, "point")],
  [T.gente, S(camp, -1.13, "cheer")],
  [T.levantar, S(camp, 1.77, "point")],
  [T.b1, S(camp, -1.13, "think")],
  [C2, S(H(-30.0, 0, 2.6), HERO_RY - 0.4, "cheer")],
  [T.trineo, S(H(-30.0, 0, 2.6), HERO_RY - 0.8, "point")],
  [T.desliza, S(H(-30.0, 0, 2.6), HERO_RY + Math.PI / 2, "walk", { follow: (t) => H(-30.2 + 5.6 * Math.min(1, Math.max(0, (t - T.desliza) / 6.0)) + 0.6, 0, 2.6) })],
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
  [C5, S(lever, 0.6, "present")],
  [T.palancas, S(lever, Math.PI / 2, "point")],
  [T.levantan, S(lever, Math.PI / 2, "pull")],
  [T.tronco1 + 0.3, S(lever, 0.5, "cheer")],
  [T.capa, S([-6.4, 0, 13.6], 0.4, "cheer")],
  [T.p3, S([-6.4, 0, 13.6], 0.4, "alarm")],
  [C6, S([1.8, 0, 7.2], Math.PI - 0.2, "point")],
  [T.caer - 0.1, S([3.4, 0, 7.6], -2.2, "alarm", { follow: dodge })], // (p = onde o pulo termina: o próximo item não anda)
  [T.caer + 0.3, S([3.4, 0, 7.6], -2.6, "alarm")],
  [T.b4, S([1.8, 0, 7.2], Math.PI - 0.2, "point")],
  [C7, S([-2.3, 0, -6.4], Math.PI, "idle", { scale: 0 })],
  [T.giro, S([-2.3, 0, -6.4], Math.PI + 0.2, "point")],
  [T.sale, S([-2.3, 0, -6.4], Math.PI + 0.2, "cheer")],
  [T.nadie, S([-2.3, 0, -6.4], Math.PI - 0.5, "think")],
  [T.manda, S([-2.3, 0, -6.4], 0.24, "cheer")],
];

const HAVE: [number, string][] = [[T.madera, "MADERA"], [T.cuerda, "CUERDA"], [T.piedra, "PIEDRA"], [T.gente, "MUCHA GENTE"]];
const steps = (t: number) => { let n = 0; for (let k = 1; k <= NSTEP; k++) if (t >= stepAt(k)) n++; return n; };
const hyp = (t: number) => Math.max(win(t, T.prob1, T.esteTrineo - 0.1, 0.2), win(t, T.c3, T.estaTorre - 0.1, 0.2));
const hud: HudData = {
  pills: [
    { a: T.treinta, b: T.algunas - 0.1, label: "PIEDRAS DE HASTA", value: (t) => `${count(t, T.treinta, T.treinta + 0.8, 0, 30)} t`, y: 440 },
    { a: T.doscientos, b: T.rueda - 0.1, label: "DISTANCIA", value: () => "+200 km", y: 440, tone: "gold" },
    { a: T.rueda, b: T.inglaterra - 0.1, label: "RUEDAS", value: () => "0", y: 440, tone: "red" },
    { a: T.inglaterra, b: T.nohay - 0.1, label: "HACE", value: () => "~4500 AÑOS", y: 440, tone: "gold" },
    { a: T.nohay, b: T.madera - 0.15, label: "MOTORES", value: () => "0", y: 440, tone: "red" },
    { a: T.ruedas, b: T.madera - 0.15, label: "RUEDAS", value: () => "0", y: 550, tone: "red" },
    { a: T.gruas, b: T.madera - 0.15, label: "GRÚAS", value: () => "0", y: 660, tone: "red" },
    { a: T.madera, b: T.levantar - 0.1, label: "TIENEN", value: (t) => HAVE.filter(([a]) => t >= a - 0.1).slice(-1)[0]?.[1] ?? "", y: 440, tone: "green" },
    { a: T.circulo, b: T.b1 - 0.1, label: "MISIÓN", value: () => "CÍRCULO", y: 440, tone: "gold" },
    { a: T.cientos, b: T.esteTrineo - 0.1, label: "PERSONAS", value: () => "~10 POR TONELADA", y: 440 },
    { a: T.rampa, b: T.empujan + 0.5, label: "PARED", value: () => "EN RAMPA", y: 440 },
    { a: T.piedras, b: T.esteHoyo - 0.1, label: "RELLENO", value: (t) => (t < T.tierra - 0.05 ? "PIEDRAS" : t < T.apretadas - 0.05 ? "TIERRA" : "¡APRETADO!"), y: 440, tone: "green" },
    { a: T.altura, b: T.b3 - 0.1, label: "ALTURA", value: (t) => `+${count(t, T.altura, T.metros + 0.5, 0, 4)} m`, y: 440, tone: "red" },
    { a: T.tronco1, b: T.estaTorre - 0.1, label: "CAPAS", value: (t) => `${steps(t)}`, y: 440, tone: "green" },
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
  crosses: [...(OPEN === "c" ? [[1.3, T.algunas - 0.05] as [number, number]] : []), [T.toneladas + 0.5, C2 - 0.1], [FALL0 + 0.1, T.b4 - 0.1]],
  stamps: [[T.b1, T.c1, "SIN RUEDAS"], [T.b2, T.c2, "SIN GRÚA"], [T.b3, T.c3, "SIN GRÚA"]],
  reward: { a: T.manda - 0.1, len: T.end - T.manda + 0.1, top: "LEVANTADO HACE", big: (t) => `~${count(t, T.manda - 0.1, T.manda + 1.1, 0, 4500)} AÑOS`, sub: "SIN UN SOLO MOTOR" },
  Extra: ({ t }) => {
    const map = win(t, T.algunas, T.rueda - 0.1, 0.2), wheel = win(t, T.rueda, T.inglaterra - 0.05, 0.15), h = hyp(t);
    const clic = win(t, T.encaja, T.encaja + 0.55, 0.1), mueble = win(t, T.mueble, T.juntas - 0.1, 0.15), q = win(t, T.nadie, T.manda - 0.2, 0.2);
    const route = prog(t, T.algunas + 0.2, T.doscientos + 0.4);
    return (
      <>
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
          <div style={{ position: "absolute", left: 0, width: 1080, top: 640, display: "flex", justifyContent: "center", opacity: q, transform: `scale(${pop(t, T.nadie, 0.35)})` }}>
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
