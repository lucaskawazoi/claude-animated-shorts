// E14 — Santa Sofía (ecos-del-tiempo, Shorts). Câmera, operário, painel e luz deste episódio.
import React from "react";
import { K, Shot } from "../../toy/cam";
import { CUTS, WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { FONT, HudData, count, pop, stroke, win } from "../../toy/hud";
import { V3, ease, prog } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { CRASH, NWIN, SFX, T, TIP0, XC, winAt } from "./cues";
import { Open, OPEN } from "./open";
import { BYZ, DB, H_NEW, World, nLit, runX } from "./world";
import { EXPOSURE } from "./exposure";

const PI = Math.PI;
const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
const W3 = WINS[3], W6 = WINS[6], W10 = WINS[10];
const [X1, X2, X3, X4, X5, X6, X7, X8, X9, X10, X11, X12, X13, X14] = XC;

/** as três aberturas (0 → «una cúpula»), cada uma já em ação no quadro 0 e ligada a «construida en menos de seis años» */
const OPENING: Record<Open, Shot> = {
  a: { name: "abertura a: montagem relâmpago — pilares, arcos, ombros e contrafortes sobem do chão e a cúpula cai do céu (⏩)", t0: 0, keys: [
    K(0, [-14.0, 3.0, 30.0], [0.0, 7.5, 0.0], 60, 3), K(0.45, [-15.2, 3.6, 29.4], [0.0, 7.8, 0.0], 60, -2),
    K(1.1, [-17.0, 5.0, 28.4], [0.0, 8.4, 0.0], 60, 1.5), K(X1 - 0.04, [-18.6, 6.4, 27.4], [0.0, 9.0, 0.0], 60, -1)] },
  b: { name: "abertura b: lá no alto, o operário fecha a cúpula com tijolos que voam da praça; a câmera abre", t0: 0, keys: [
    K(0, [4.4, DB + 9.4, 8.2], [0.0, DB + 3.6, 0.0], 56, 3), K(0.6, [4.0, DB + 9.8, 8.8], [0.0, DB + 3.6, 0.0], 56, -1.5),
    K(1.15, [4.6, DB + 10.2, 9.6], [0.0, DB + 3.4, 0.0], 56, 1), K(X1 - 0.04, [11.0, DB + 11.0, 23.0], [0.0, DB + 1.0, 0.0], 58, 0)] },
  c: { name: "abertura c: a multidão de obreiros carrega tijolos acelerada (⏩) e o operário tropeça com a pilha (✖)", t0: 0, keys: [
    K(0, [-3.0, 1.4, 22.5], [-1.0, 4.0, 4.0], 58, 3), K(0.5, [-2.4, 1.5, 22.2], [-0.5, 4.2, 4.0], 58, -1.5),
    K(1.2, [-1.4, 1.8, 22.0], [0.0, 5.5, 2.0], 58, 1), K(X1 - 0.04, [-0.5, 2.6, 23.0], [0.0, 7.5, 0.0], 58, 0)] },
};

// ritmo: corte duro a cada ~4 s (régua + XC), chicote na entrada de todo plano (a câmera chega andando e rolando)
const SHOTS: Shot[] = [
  OPENING[OPEN],
  { name: "por dentro, do chão: a cúpula de +30 m sobre o anel de luz", t0: X1, keys: [
    K(X1, [0.9, 1.3, 4.5], [-0.6, 9.0, -4.5], 64, -3), K(X1 + 0.45, [0.7, 1.4, 4.3], [-0.5, 9.4, -4.4], 64, 0.5),
    K(T.flotar0, [0.3, 1.5, 4.0], [-0.3, 10.0, -4.2], 64, -0.5), K(X2 - 0.04, [0.0, 1.6, 3.8], [-0.2, 10.4, -4.0], 64, 0)] },
  { name: "de fora, a igreja inteira → ⏪ Constantinopla 532: tudo afunda e a praça fica vazia", t0: X2, keys: [
    K(X2, [-21.0, 7.0, 27.0], [0.0, 9.0, 0.0], 56, 3), K(X2 + 0.45, [-22.0, 7.6, 28.0], [0.0, 9.0, 0.0], 56, -0.5),
    K(T.constantinopla, [-24.0, 9.5, 30.0], [0.0, 8.5, 0.0], 56, 0.5), K(T.ano532, [-26.0, 14.0, 32.0], [0.0, 4.0, 0.0], 56, -0.5),
    K(C1 - 0.05, [-27.0, 16.0, 33.0], [0.0, 2.5, 0.0], 56, 0)] },
  { name: "rente ao chão: sem motor, aço, concreto → tijolo, pedra, argamassa, milhares de obreiros", t0: C1, keys: [
    K(C1, [-14.0, 2.1, 17.6], [-6.5, 1.0, 10.5], 56, 3), K(C1 + 0.45, [-13.2, 2.3, 17.0], [-6.5, 1.0, 10.5], 56, -0.5),
    K(T.solo, [-12.0, 2.4, 16.6], [-6.8, 0.9, 10.4], 56, 0.5), K(T.piedra, [-9.0, 2.6, 16.8], [-4.0, 0.8, 10.6], 56, -0.5),
    K(T.mortero + 0.3, [-5.0, 2.8, 17.0], [0.0, 0.9, 10.8], 56, 0.5), K(T.miles + 0.4, [-1.0, 3.4, 19.0], [5.0, 1.2, 12.0], 58, -0.5),
    K(X3 - 0.05, [0.0, 3.8, 19.5], [6.0, 1.4, 12.0], 58, 0)] },
  { name: "o imperador: a cúpula-fantasma no céu → o quadrado aceso no chão", t0: X3, keys: [
    K(X3, [-0.6, 1.8, 17.4], [-2.4, 3.2, 8.0], 58, -3), K(X3 + 0.45, [-0.9, 2.0, 16.8], [-2.4, 3.4, 8.0], 58, 0.5),
    K(T.cupula0, [-1.0, 2.3, 17.0], [-1.6, 7.0, 2.0], 58, -0.5), K(T.gigante + 0.3, [-1.4, 2.6, 17.4], [-1.0, 9.0, 0.0], 58, 0.5),
    K(T.planta, [2.5, 10.5, 19.0], [0.0, 0.5, 1.5], 58, 1.5), K(C2 - 0.05, [2.8, 12.5, 19.6], [0.0, 0.5, 1.0], 58, 0)] },
  { name: "a cúpula desce, pousa nas 4 cristas → de cima: as quinas vazias → tomba e cai de boca para baixo (✖)", t0: C2, keys: [
    K(C2, [-14.0, 13.0, 24.0], [0.0, 10.5, 0.0], 56, 3), K(C2 + 0.45, [-13.4, 13.6, 23.4], [0.0, 10.8, 0.0], 56, -0.5),
    K(W3, [-12.6, 14.2, 22.6], [0.0, 11.0, 0.0], 56, 0.5), K(W3 + 0.55, [1.0, 30.0, 12.0], [0.0, 9.0, 1.0], 56, 4),
    K(T.esquinas, [0.6, 31.0, 11.0], [0.0, 9.0, 1.0], 56, 0), K(TIP0, [0.4, 31.5, 11.2], [0.0, 8.5, 2.0], 56, -0.5),
    K(X4 - 0.05, [0.2, 32.0, 11.6], [0.0, 6.0, 4.0], 56, 0)] },
  { name: "de baixo, entre os pilares: ⏪ a cúpula volta e flutua → arco e arco → nascem as pechinas", t0: X4, keys: [
    K(X4, [2.8, 1.2, 2.8], [-3.6, 8.0, -3.6], 64, -3), K(X4 + 0.45, [2.6, 1.2, 2.6], [-3.6, 8.3, -3.6], 64, 0.5),
    K(T.cuatroPilares, [2.3, 1.2, 2.4], [-3.6, 8.6, -3.4], 64, -0.5), K(T.entre, [2.0, 1.2, 2.2], [-3.4, 8.6, -3.6], 64, 0.5),
    K(C3 - 0.05, [1.8, 1.2, 2.0], [-3.4, 8.8, -3.4], 64, 0)] },
  { name: "do alto, de fora: as pechinas fecham o círculo → a cúpula assenta no anel", t0: C3, keys: [
    K(C3, [17.5, 16.6, 18.5], [0.0, 8.6, 0.0], 56, 3), K(C3 + 0.45, [17.0, 17.0, 18.0], [0.0, 8.7, 0.0], 56, -0.5),
    K(T.alCirculo, [16.0, 17.4, 17.0], [0.0, 9.0, 0.0], 56, 0.5), K(T.pechinas + 0.5, [16.4, 17.8, 17.4], [0.0, 10.4, 0.0], 56, -0.5),
    K(X5 - 0.05, [16.6, 18.0, 17.6], [0.0, 10.6, 0.0], 56, 0)] },
  { name: "baixo, do sul: a cúpula empurra para fora (setas vermelhas) → os pilares abrem e os arcos racham", t0: X5, keys: [
    K(X5, [-2.6, 8.4, 31.0], [0.0, 9.0, 0.0], 58, -3), K(X5 + 0.45, [-2.2, 8.7, 30.0], [0.0, 9.2, 0.0], 58, 0.5),
    K(T.abre, [-1.6, 9.0, 28.5], [0.0, 9.2, 0.0], 58, -0.5), K(T.s2, [-1.2, 9.2, 27.8], [0.0, 9.3, 0.0], 58, 0.5),
    K(X6 - 0.05, [-1.0, 9.4, 27.4], [0.0, 9.4, 0.0], 58, 0)] },
  { name: "do alto, de sudeste: entram as meias cúpulas (ombros) → sobem os contrafortes", t0: X6, keys: [
    K(X6, [15.0, 15.0, 31.0], [0.0, 7.0, 0.0], 56, 3), K(X6 + 0.45, [14.4, 15.6, 30.2], [0.0, 7.2, 0.0], 56, -0.5),
    K(T.hombros, [13.0, 17.0, 29.0], [0.0, 7.0, 0.0], 56, 0.5), K(T.contrafuertes, [10.0, 27.0, 25.0], [0.0, 3.0, 2.0], 56, -0.5),
    K(C4 - 0.05, [9.0, 29.0, 23.0], [0.0, 3.0, 2.0], 56, 0)] },
  { name: "baixo e largo, de sudoeste: o empuxo desce pelos ombros e contrafortes até o chão", t0: C4, keys: [
    K(C4, [-9.0, 3.2, 37.0], [0.0, 6.5, 0.0], 58, -3), K(C4 + 0.45, [-8.6, 3.4, 36.2], [0.0, 6.5, 0.0], 58, 0.5),
    K(T.suelo, [-7.8, 3.6, 35.0], [0.0, 6.0, 0.0], 58, -0.5), K(T.semicupulas + 0.4, [-7.0, 4.0, 34.0], [0.0, 6.8, 0.0], 58, 0.5),
    K(X7 - 0.05, [-6.8, 4.2, 33.6], [0.0, 7.0, 0.0], 58, 0)] },
  { name: "por dentro, da abside oeste: a cúpula de tijolo escurece → chicote", t0: X7, keys: [
    K(X7, [-8.6, 1.4, 0.9], [3.0, 6.8, -0.3], 62, -3), K(X7 + 0.45, [-8.2, 1.4, 0.8], [3.0, 7.1, -0.3], 62, 0.5),
    K(T.oscura, [-7.6, 1.5, 0.6], [2.6, 7.8, -0.2], 62, -0.5), K(W6, [-7.0, 1.6, 0.5], [2.2, 8.3, -0.1], 62, 0),
    K(W6 + 0.5, [-3.0, 2.2, -1.2], [0.5, 11.0, 2.5], 62, 3), K(C5 - 0.05, [-2.8, 2.3, -1.4], [0.5, 11.2, 2.5], 62, 2)] },
  { name: "o operário olha para cima no escuro: ¿cómo la llenas de luz?", t0: C5, keys: [
    K(C5, [2.6, 1.6, 3.6], [-0.8, 3.8, -2.4], 60, 3), K(C5 + 0.45, [2.4, 1.6, 3.4], [-0.7, 4.1, -2.4], 60, -0.5),
    K(X8 - 0.05, [2.2, 1.7, 3.2], [-0.6, 4.8, -2.4], 60, 0.5)] },
  { name: "da altura da galeria: as 40 janelas acendem uma a uma em volta da base da cúpula", t0: X8, keys: [
    K(X8, [0.6, 8.2, -2.4], [0.0, 11.6, 4.9], 60, 3), K(X8 + 0.45, [0.4, 8.4, -2.2], [-0.5, 11.6, 4.9], 60, -0.5),
    K(T.base, [0.3, 8.6, -1.6], [1.5, 11.6, 4.7], 60, 0.5), K(T.junto, [-0.4, 8.6, -0.4], [4.6, 11.6, 1.8], 60, -0.5),
    K(X9 - 0.05, [-1.0, 8.4, 0.6], [4.8, 11.6, -1.5], 60, 0)] },
  { name: "do centro, olhando para cima: a luz entra por baixo e a cúpula flutua num anel de luz", t0: X9, keys: [
    K(X9, [0.3, 1.0, 0.9], [0.0, 14.0, -1.4], 70, -6), K(X9 + 0.45, [0.3, 1.1, 0.8], [0.0, 14.0, -1.3], 70, 0),
    K(T.flotar1, [0.2, 1.3, 0.7], [0.0, 14.0, -1.2], 66, 8), K(T.ventanas, [0.1, 1.6, 0.6], [0.0, 14.0, -1.0], 64, 16),
    K(X10 - 0.05, [0.1, 1.8, 0.6], [0.0, 14.0, -1.0], 64, 20)] },
  { name: "da rua da cidade: Constantinopla treme (558)", t0: X10, keys: [
    K(X10, [-31.0, 8.0, 33.0], [0.0, 7.5, 0.0], 56, -3), K(X10 + 0.45, [-30.4, 8.3, 32.4], [0.0, 7.6, 0.0], 56, 0.5),
    K(T.ano558, [-29.6, 8.8, 31.6], [0.0, 8.0, 0.0], 56, -0.5), K(C6 - 0.05, [-28.8, 9.4, 30.8], [0.0, 8.4, 0.0], 56, 0)] },
  { name: "do alto, de sudeste: a cúpula cai dentro (poeira) → andaimes no tambor", t0: C6, keys: [
    K(C6, [16.0, 21.0, 17.0], [0.0, 11.0, 0.0], 56, 3), K(C6 + 0.45, [15.4, 21.6, 16.4], [0.0, 11.2, 0.0], 56, -0.5),
    K(T.b3, [14.6, 22.4, 15.6], [0.0, 11.5, 0.0], 56, 0.5), K(T.c3, [13.8, 22.8, 15.0], [0.0, 11.8, 0.0], 56, -0.5),
    K(X11 - 0.05, [13.4, 23.0, 14.6], [0.0, 12.0, 0.0], 56, 0)] },
  { name: "de lado, na altura da cúpula: a nova sobe ~6 m acima do perfil velho; o peso desce mais reto", t0: X11, keys: [
    K(X11, [1.0, 14.6, 29.0], [0.0, 13.6, 0.0], 54, -3), K(X11 + 0.45, [0.6, 14.5, 28.4], [0.0, 13.6, 0.0], 54, 0.5),
    K(T.curva, [0.2, 14.3, 28.0], [0.0, 13.8, 0.0], 54, -0.5), K(T.menos, [-0.2, 14.1, 27.6], [0.0, 13.8, 0.0], 54, 0.5),
    K(C7 - 0.05, [-0.4, 14.0, 27.4], [0.0, 13.8, 0.0], 54, 0)] },
  { name: "baixo, de sudoeste: a cúpula nova inteira", t0: C7, keys: [
    K(C7, [-16.0, 1.6, 33.0], [0.0, 9.0, 0.0], 58, 3), K(C7 + 0.45, [-15.4, 1.8, 32.4], [0.0, 9.2, 0.0], 58, -0.5),
    K(T.nueva, [-14.6, 2.2, 31.4], [0.0, 9.6, 0.0], 58, 0.5), K(X12 - 0.05, [-14.0, 2.6, 30.8], [0.0, 9.8, 0.0], 58, 0)] },
  { name: "do mar: igreja → sobem os minaretes, a cruz vira crescente (mesquita)", t0: X12, keys: [
    K(X12, [10.0, 22.0, 60.0], [0.0, 8.0, 0.0], 52, -3), K(X12 + 0.45, [9.4, 21.0, 58.0], [0.0, 8.0, 0.0], 52, 0.5),
    K(T.mezquita0, [6.0, 19.0, 52.0], [0.0, 9.0, 0.0], 52, -0.5), K(X13 - 0.05, [4.0, 18.0, 48.0], [0.0, 9.5, 0.0], 52, 0)] },
  { name: "na praça: a placa do museu e os turistas → a placa sai: mesquita de novo", t0: X13, keys: [
    K(X13, [6.0, 3.0, 27.0], [0.0, 5.0, 8.0], 56, 3), K(X13 + 0.45, [5.6, 3.1, 26.4], [0.0, 5.2, 8.0], 56, -0.5),
    K(T.hoy + 0.1, [5.2, 4.0, 27.6], [0.0, 9.5, 2.0], 56, 0.5), K(X14 - 0.05, [5.0, 5.2, 30.0], [0.0, 11.5, 0.0], 56, 0)] },
  { name: "em cima da cúpula: reparada várias vezes → chicote para o alto, a cidade e o mar", t0: X14, keys: [
    K(X14, [8.6, 22.6, 13.4], [0.0, 15.0, 0.0], 56, -3), K(X14 + 0.45, [8.2, 23.0, 13.0], [0.0, 15.0, 0.0], 56, 0.5),
    K(T.varias, [7.0, 23.4, 12.0], [0.0, 15.0, 0.5], 56, -0.5), K(W10, [6.6, 23.6, 11.6], [0.0, 15.0, 0.5], 56, 0),
    K(W10 + 0.5, [16.0, 30.0, 36.0], [0.0, 8.0, 0.0], 58, 2), K(T.end, [18.0, 33.0, 40.0], [0.0, 8.0, 0.0], 58, 0)] },
];
// câmera na mão por janela da régua: as de dentro ficam baixas (paredes perto); W2 e W6 as mais agitadas, o fim a mais calma
const DYN = [0.8, 1.6, 3.6, 2.0, 0.5, 1.2, 3.0, 1.0, 2.2, 1.0, 0.3];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const IN = { scale: 1.05 };
const roof: V3 = [0, DB + H_NEW - 0.48, 0];
const OPEN_W: Record<Open, [number, WorkerState][]> = {
  a: [[0, S([7.5, 0, 12.5], -0.6, "alarm")], [1.15, S([7.5, 0, 12.5], -0.6, "cheer")]],
  b: [[0, S(roof, 0.45, "chisel", { prop: "hammer" })], [1.15, S(roof, 0.45, "cheer")]],
  c: [[0, S([-7.5, 0, 15.4], PI / 2, "walk", { follow: (t) => [runX(t), t > 0.95 ? 0.5 * Math.sin(PI * prog(t, 0.95, 1.3)) : 0, 15.4] })],
    [0.95, S([-1.6, 0, 15.4], PI / 2, "alarm", { follow: (t) => [runX(t), t < 1.3 ? 0.5 * Math.sin(PI * prog(t, 0.95, 1.3)) : 0, 15.4] })]],
};
const dome: V3 = [1.95, DB + 3.84, 3.0];
const WORKER: [number, WorkerState][] = [
  ...OPEN_W[OPEN],
  [X1, S([-1.6, 0, 1.4], 0.6, "present", IN)],
  [T.flotar0, S([-1.6, 0, 1.4], 0.6, "cheer", IN)],
  [X2, S([-7.5, 0, 13.0], -0.9, "point")],
  [T.constantinopla, S([-7.5, 0, 13.0], -0.9, "alarm")],
  [C1, S([-6.0, 0, 13.4], -0.9, "present")],
  [T.nohay, S([-6.0, 0, 13.4], -1.9, "point")],
  [T.solo, S([-6.0, 0, 13.4], -0.6, "cheer")],
  [T.miles, S([-6.0, 0, 13.4], 1.2, "point")],
  [X3, S([-0.4, 0, 11.4], -0.6, "present")],
  [T.cupula0, S([-0.4, 0, 11.4], -0.6, "point")],
  [T.planta, S([-0.4, 0, 11.4], -2.6, "think")],
  [C2, S([7.2, 0, 12.8], -2.4, "point")],
  [T.esquinas, S([7.2, 0, 12.8], -2.4, "alarm")],
  [TIP0 + 0.25, S([9.2, 0, 13.6], -2.0, "alarm")],
  [CRASH + 0.2, S([9.2, 0, 13.6], -2.4, "think")],
  [X4, S([1.2, 0, -2.0], 2.2, "think", IN)],
  [T.c1, S([1.2, 0, -2.0], 0.6, "cheer", IN)],
  [T.triangulos, S([1.2, 0, -2.0], -2.4, "point", IN)],
  [C3, S([-7.0, 0, 9.5], 0.9, "point")],
  [T.pechinas, S([-7.0, 0, 9.5], 0.9, "cheer")],
  [X5, S([-4.6, 0, 11.5], 0.4, "present")],
  [T.empuja, S([-4.6, 0, 11.5], -2.6, "point")],
  [T.abre, S([-4.6, 0, 11.5], 0.2, "alarm")],
  [T.s2, S([-4.6, 0, 11.5], 0.2, "cheer")],
  [X6, S([9.5, 0, 9.5], 0.8, "present")],
  [T.medias, S([9.5, 0, 9.5], -1.4, "point")],
  [T.contrafuertes, S([9.5, 0, 9.5], 0.8, "cheer")],
  [C4, S([-10.5, 0, 12.5], -0.8, "point")],
  [T.suelo, S([-10.5, 0, 12.5], -0.8, "cheer")],
  [X7, S([-3.0, 0, 2.6], -1.87, "present", IN)],
  [T.oscura, S([-3.0, 0, 2.6], -1.87, "alarm", IN)],
  [T.b2, S([-3.0, 0, 2.6], -1.87, "think", IN)],
  [C5, S([-0.4, 0, 0.2], 0.68, "think", IN)],
  [T.c2, S([-0.4, 0, 0.2], 0.68, "cheer", IN)],
  [X8, S([0, 0, 0], 0, "idle", { scale: 0 })],
  [X10, S([-12.5, 0, 18.5], -0.95, "alarm")],
  [C6, S([5.5, 0, 13.0], -0.6, "alarm")],
  [T.c3, S([5.5, 0, 13.0], -0.6, "point")],
  [X11, S([0, 0, 0], 0, "idle", { scale: 0 })],
  [C7, S([-6.0, 0, 14.0], -0.7, "cheer")],
  [X12, S([5.0, 0, 15.5], 0.3, "point")],
  [X13, S([4.0, 0, 15.0], 0.4, "present")],
  [T.hoy, S([4.0, 0, 15.0], 0.4, "cheer")],
  [X14, S(dome, 0.58, "chisel", { prop: "hammer" })],
  [T.sigue, S(dome, 0.58, "cheer")],
];

const HAVE: [number, string][] = [[T.ladrillo, "LADRILLO"], [T.piedra, "PIEDRA"], [T.mortero, "MORTERO"], [T.miles, "OBREROS"]];
const ERAS: [number, string, string][] = [[T.iglesia, "IGLESIA", "537"], [T.mezquita0, "MEZQUITA", "1453"], [T.museo, "MUSEO", "1935"], [T.mezquita1, "MEZQUITA", "2020"]];
const hud: HudData = {
  pills: [
    { a: 0, b: X1 - 0.1, label: "CONSTRUIDA EN", value: (t) => `${count(t, 0.05, 1.25, 0, 5.8, 1)} AÑOS`, y: 440, tone: "gold" },
    { a: T.treinta, b: X2 - 0.1, label: "CÚPULA", value: (t) => `+${count(t, T.treinta, T.treinta + 0.6, 0, 30)} m`, y: 440 },
    { a: T.grande, b: T.constantinopla - 0.1, label: "LA IGLESIA MÁS GRANDE", value: () => "N.º 1", y: 440, tone: "gold" },
    { a: T.quinientos0, b: T.constantinopla - 0.1, label: "DURANTE", value: (t) => `+${count(t, T.quinientos0, T.quinientos0 + 0.6, 0, 500)} AÑOS`, y: 550, tone: "gold" },
    { a: T.constantinopla, b: T.nohay - 0.1, label: "CIUDAD", value: () => "CONSTANTINOPLA", y: 440 },
    { a: T.ano532, b: T.nohay - 0.1, label: "AÑO", value: (t) => `${count(t, T.ano532, T.ano532 + 0.8, 0, 532)}`, y: 550, tone: "gold" },
    { a: T.nohay, b: T.solo - 0.15, label: "MOTORES", value: () => "0", y: 440, tone: "red" },
    { a: T.acero, b: T.solo - 0.15, label: "ACERO", value: () => "0", y: 550, tone: "red" },
    { a: T.hormigon, b: T.solo - 0.15, label: "HORMIGÓN", value: () => "0", y: 660, tone: "red" },
    { a: T.ladrillo, b: X3 - 0.1, label: "TIENEN", value: (t) => HAVE.filter(([a]) => t >= a - 0.1).slice(-1)[0]?.[1] ?? "", y: 440, tone: "green" },
    { a: T.miles, b: X3 - 0.1, label: "OBREROS", value: (t) => `+${count(t, T.miles, T.miles + 0.7, 0, 10000)}`, y: 550 },
    { a: T.justiniano, b: T.cupula0 - 0.1, label: "EMPERADOR", value: () => "JUSTINIANO", y: 440, tone: "gold" },
    { a: T.esquinas, b: T.b1 - 0.1, label: "ESQUINAS", value: () => "HUECOS", y: 440, tone: "red" },
    { a: T.cuatroPilares, b: T.c1 - 0.1, label: "PILARES", value: () => "4", y: 440 },
    { a: T.triangulos, b: T.pasan - 0.1, label: "TRIÁNGULOS", value: () => "4", y: 440, tone: "green" },
    { a: T.empuja, b: T.abre - 0.05, label: "EMPUJE", value: () => "HACIA AFUERA", y: 440, tone: "red" },
    { a: T.abre, b: T.s2 - 0.1, label: "ARCOS", value: () => "¡SE ABREN!", y: 440, tone: "red" },
    { a: T.medias, b: C4 - 0.1, label: "MEDIAS CÚPULAS", value: () => "2", y: 440, tone: "green" },
    { a: T.contrafuertes, b: C4 - 0.1, label: "CONTRAFUERTES", value: () => "2", y: 550, tone: "green" },
    { a: T.empuje, b: T.semicupulas - 0.1, label: "EMPUJE", value: () => "AL SUELO", y: 440, tone: "green" },
    { a: T.oscura, b: T.b2 - 0.1, label: "LUZ", value: () => "POCA", y: 440, tone: "red" },
    { a: T.cuarenta, b: T.ventanas - 0.1, label: "VENTANAS", value: (t) => `${nLit(t)}`, y: 440, tone: "green" },
    { a: T.ano558, b: T.cae - 0.1, label: "AÑO", value: () => "558", y: 440, tone: "gold" },
    { a: T.terremoto, b: T.cae - 0.1, label: "TERREMOTO", value: () => "¡CAE!", y: 550, tone: "red" },
    { a: T.seis1, b: T.asi - 0.1, label: "ALTURA", value: (t) => `+${count(t, T.seis1, T.seis1 + 0.7, 0, 6)} m`, y: 440, tone: "green" },
    { a: T.curva, b: T.asi - 0.1, label: "PERFIL", value: () => "MÁS CURVO", y: 550, tone: "green" },
    { a: T.menos, b: T.nueva - 0.1, label: "EMPUJE LATERAL", value: () => "MENOS", y: 440, tone: "green" },
    { a: T.reparada, b: T.manda - 0.1, label: "REPARADA", value: () => "VARIAS VECES", y: 440, tone: "gold" },
  ],
  titles: [
    { a: T.pechinas, text: "PECHINAS" }, { a: T.semicupulas, text: "SEMICÚPULAS" }, { a: T.ventanas, text: "40 VENTANAS" }, { a: T.nueva, text: "CÚPULA NUEVA" },
  ],
  alerts: [T.p1, T.p2, T.p3, T.p4],
  rewinds: [T.constantinopla, T.b1, T.s2, T.b3],
  crosses: [...(OPEN === "c" ? [[1.0, X1 - 0.05] as [number, number]] : []), [TIP0 + 0.25, X4 - 0.05], [T.cae + 0.25, T.b3 - 0.1]],
  stamps: [[T.b1, T.c1, "SIN ACERO"], [T.b2, T.c2, "SIN ELECTRICIDAD"], [T.b3, T.c3, "SIN HORMIGÓN"]],
  reward: { a: T.manda - 0.1, len: T.end - T.manda + 0.1, top: "EN PIE DESDE EL AÑO", big: (t) => `${count(t, T.manda - 0.1, T.manda + 1.1, 0, 537)}`, sub: "SIN UN SOLO MOTOR" },
  Extra: ({ t }) => {
    const ff = OPEN !== "b" ? win(t, 0, X1 - 0.05, 0.1) : 0;
    const cs = win(t, T.cupula0, C2 - 0.1, 0.2), cq = t >= T.planta - 0.05;
    const sc = win(t, T.pasan - 0.1, T.pechinas - 0.05, 0.15), fill = ease(t, T.pasan, T.alCirculo + 0.1);
    const er = win(t, T.iglesia - 0.1, X14 - 0.1, 0.2);
    return (
      <>
        {ff > 0 ? (
          <div style={{ position: "absolute", left: 64, top: 130, opacity: ff, display: "flex", alignItems: "center", gap: 10, transform: `scale(${pop(t, 0, 0.25)})` }}>
            <svg viewBox="0 0 100 60" width="170" height="102"><path d="M8 4 L8 56 L50 30 Z M50 4 L50 56 L92 30 Z" fill="#fff" stroke="#14202b" strokeWidth="5" strokeLinejoin="round" /></svg>
            <span style={{ fontFamily: FONT, fontSize: 60, color: "#fff", ...stroke(9) }}>×1000</span>
          </div>) : null}
        {cs > 0 ? (
          <div style={{ position: "absolute", left: 0, width: 1080, top: 250, display: "flex", justifyContent: "center", opacity: cs, transform: `scale(${pop(t, T.cupula0, 0.3)}) rotate(-3deg)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 30px", borderRadius: 30, background: "#fff4dcee", border: "7px solid #14202b", boxShadow: "0 9px 0 #00000055" }}>
              <svg viewBox="0 0 120 120" width="190" height="190">
                <rect x="20" y="58" width="80" height="52" rx="4" fill={cq ? "#ffd400" : "#d9cdb4"} stroke="#14202b" strokeWidth="6" />
                <path d="M20 58 A40 40 0 0 1 100 58 Z" fill="#8d9fb3" stroke="#14202b" strokeWidth="6" />
              </svg>
              <span style={{ fontFamily: FONT, fontSize: 70, color: "#14202b", lineHeight: 1 }}>{cq ? "¿ENCAJA?" : "CÚPULA"}</span>
            </div>
          </div>) : null}
        {sc > 0 ? (
          <div style={{ position: "absolute", left: 0, width: 1080, top: 250, display: "flex", justifyContent: "center", opacity: sc, transform: `scale(${pop(t, T.pasan - 0.1, 0.3)}) rotate(3deg)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "14px 30px", borderRadius: 30, background: "#fff4dcee", border: "7px solid #14202b", boxShadow: "0 9px 0 #00000055" }}>
              <svg viewBox="0 0 120 120" width="200" height="200">
                <rect x="10" y="10" width="100" height="100" fill="#ffffff" stroke="#14202b" strokeWidth="6" />
                {[[10, 10, 1, 1], [110, 10, -1, 1], [110, 110, -1, -1], [10, 110, 1, -1]].map(([x, y, sx, sy], i) => (
                  <path key={i} d={`M${x} ${y} L${x + sx * 50} ${y} A50 50 0 0 ${sx * sy > 0 ? 0 : 1} ${x} ${y + sy * 50} Z`} fill="#c9683d" stroke="#14202b" strokeWidth="3" opacity={fill > i * 0.2 ? 1 : 0.12} />
                ))}
                <circle cx="60" cy="60" r="50" fill="none" stroke="#ffd400" strokeWidth={fill > 0.95 ? 9 : 4} />
              </svg>
              <span style={{ fontFamily: FONT, fontSize: 76, color: "#14202b", lineHeight: 1 }}>¡ENCAJA!</span>
            </div>
          </div>) : null}
        {er > 0 ? (
          <div style={{ position: "absolute", left: 0, width: 1080, top: 430, display: "flex", justifyContent: "center", gap: 14, opacity: er }}>
            {ERAS.map(([a, name, yr], i) => {
              const on = t >= a - 0.05, now = on && (i === ERAS.length - 1 || t < ERAS[i + 1][0] - 0.05);
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 14px 10px", borderRadius: 26, minWidth: 210,
                  background: now ? "#ffd400" : on ? "#15202bd9" : "#15202b66", border: "4px solid #ffffff55", boxShadow: "0 7px 0 #00000055", transform: `scale(${now ? 1.08 * pop(t, a, 0.3) : 0.94})` }}>
                  <span style={{ fontFamily: FONT, fontSize: 40, color: now ? "#3a2300" : "#fff", lineHeight: 1.05 }}>{name}</span>
                  <span style={{ fontFamily: FONT, fontSize: 34, color: now ? "#3a2300" : "#cfe6ff", lineHeight: 1 }}>{yr}</span>
                </div>
              );
            })}
          </div>) : null}
      </>
    );
  },
};

// interior escuro: escurece em 1,6 s no «oscura» (nunca abaixo de 0,62) e volta em ~2,7 s com as janelas
const dark = (t: number) => (t < X10 ? ease(t, T.oscura - 0.1, T.oscura + 1.5) * (1 - ease(t, winAt(0), winAt(NWIN - 1) + 0.3)) : 0);
export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: BYZ, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#eef3fa", fogNear: 140, fogFar: 600, hemiSky: "#f3f7ff", hemiGround: "#d8b888", hemiI: 1.25, sun: "#fff2d6", sunI: 2.6 },
  LIGHT: (t) => 1 - 0.38 * dark(t),
};
