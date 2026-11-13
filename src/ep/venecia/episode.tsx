// E11 — Venecia sobre pilotes (ecos-del-tiempo, Shorts). Câmera, operário, painel e luz deste episódio.
// Ritmo (decisão do Lucas 13/11): 1º quadro já em ação em cada uma das 3 aberturas (PROPS open a|b|c), corte duro a cada
// ~4–5 s (os 7 da régua + 12 extras, todos a ≥1,5 s dos da régua), chicote em toda janela da régua, DYN alto em todas menos
// a última, e duas tentativas que dão errado com ✖ (a casa no barro, a estaca no ar) + a muda que murcha.
import React from "react";
import { CamState, K, Key, Shot, keyed } from "../../toy/cam";
import { CUTS, WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { FONT, HudData, count, pop, stroke, win } from "../../toy/hud";
import { V3, ease, lerp, prog } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import type { Costume } from "../../toy/worker";
import { Open, SFX, T } from "./cues";
import { IMPACT, POLE2_X, TOP, World, gondolaAt, gondolaStern, malletAt, openOf, pilesDriven, raftAt } from "./world";
import { EXPOSURE } from "./exposure";

const PI = Math.PI;
const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
const W3 = WINS[3], W6 = WINS[6], W10 = WINS[10];
const PX2 = POLE2_X;
// dinamismo por janela da régua (todas altas menos a última). A ordem segue a referência: janelas 2, 0, 7, 6 as mais agitadas.
const DYN = [4.6, 2.2, 5.2, 3.0, 1.8, 2.0, 3.4, 3.6, 2.0, 2.6, 0.1];
const dynAt = (t: number) => { let d = DYN[0]; WINS.forEach((w, i) => { if (t >= w) d = DYN[i]; }); return d; };
/** tira a deriva lenta da câmera na mão (story.ts) e deixa só o tremor rápido: o enquadramento fica onde as chaves mandam */
const steady = (c: CamState, t: number): CamState => {
  const d = dynAt(t);
  return { ...c, pos: [c.pos[0] - d * 0.7 * Math.sin(t * 0.9 + 9), c.pos[1] - d * 0.2 * Math.sin(t * 1.3 + 4), c.pos[2]], look: [c.look[0] - d * 0.3 * Math.sin(t * 1.1 + 3), c.look[1], c.look[2]] };
};
const shot = (name: string, t0: number, keys: Key[]): Shot => ({ name, t0, keys, fn: (t) => steady(keyed(keys, t), t) });
/** fim de plano antes de um corte da régua: 0,4 s parado (a régua precisa ver a troca) */
const hold = (c: number, pos: V3, look: V3, fov = 54, roll = 0) => [K(c - 0.42, pos, look, fov, roll), K(c - 0.02, pos, look, fov, roll)];

// ---------------------------------------------------------------- as três aberturas (0 → «debajo»), todas em ação no quadro 0
const OPEN_KEYS: Record<Open, Key[]> = {
  // a) construção-relâmpago: rente à face do barro, os pilotes caem em rajada e as casas pipocam; a câmera sobe até a cidade
  a: [K(0, [-3.8, 1.4, 13.6], [-2.4, 0.5, 3.0], 56, 1), K(0.9, [-1.0, 1.8, 13.4], [0.0, 1.3, 3.0], 58, -1),
    K(1.7, [5.0, 7.6, 18.6], [1.0, 2.6, 0.0], 58, 1), K(T.debajo - 0.05, [5.4, 8.0, 19.0], [1.0, 2.4, 0.0], 58, 0)],
  // b) do campanário à água: o sino balança e os pombos saem voando; mergulho pelo lado leste da ilha até a linha d'água,
  //    a góndola passa raspando a câmera
  b: [K(0, [8.8, 12.4, -3.0], [5.6, 10.9, -5.6], 50, 2), K(0.7, [10.4, 7.0, 0.5], [5.0, 6.0, -2.0], 54, -2),
    K(1.4, [10.6, 2.6, 6.0], [3.0, 1.8, 4.0], 56, 1), K(T.debajo - 0.05, [9.6, 1.6, 10.5], [1.0, 1.2, 4.0], 56, 0)],
  // c) a cidade cai do céu: a ilha inteira, com os pilotes pendurados, despenca na laguna (splash e tremor)
  c: [K(0, [10.0, 7.0, 24.0], [0.0, 6.0, -2.0], 58, 1), K(0.5, [9.4, 6.0, 22.5], [0.0, 2.0, -2.0], 58, -1),
    K(1.6, [6.0, 4.4, 17.0], [0.0, 2.0, -2.0], 56, 1), K(T.debajo - 0.05, [4.4, 3.2, 14.6], [0.0, 1.6, -1.5], 56, 0)],
};
const openCam = (t: number) => {
  const v = openOf(), c = keyed(OPEN_KEYS[v], t);
  if (v === "c" && t > IMPACT - 0.02) { const k = 1 - prog(t, IMPACT, IMPACT + 0.7); c.pos = [c.pos[0] + 0.3 * k * Math.sin(t * 71), c.pos[1] + 0.25 * k * Math.sin(t * 83), c.pos[2]]; }
  return steady(c, t);
};

const SHOTS: Shot[] = [
  { name: "abertura a|b|c: «una ciudad entera sobre el agua»", t0: 0, keys: OPEN_KEYS.a, fn: openCam },
  shot("debajo: a floresta de pilotes na face do barro, onda de brilho contando «millones»", T.debajo, [
    K(T.debajo, [1.4, -1.0, 12.6], [1.0, -2.0, 3.0], 54, 2), K(T.debajo + 0.45, [0.2, -1.6, 12.2], [0.4, -2.2, 3.0], 54, -0.5),
    K(T.clavados, [-1.6, -2.2, 11.6], [-1.2, -2.6, 3.0], 54, 0.5), K(T.siguen - 0.05, [-3.4, -2.0, 11.4], [-2.6, -2.4, 3.0], 54, 0)]),
  shot("a cidade de longe, sinos → ⏪ «Venecia, hace más de mil años»: a ilha vazia", T.siguen, [
    K(T.siguen, [12.0, 7.5, 19.0], [1.0, 1.5, -1.0], 58, -2), K(T.siguen + 0.45, [9.6, 5.4, 16.4], [1.0, 1.5, -1.0], 58, 0.5),
    K(T.venecia + 0.3, [7.5, 6.5, 15.5], [0.0, 0.5, -1.0], 58, 0.9), ...hold(C1, [-2.5, 11.0, 18.5], [0.0, 0.0, -1.5], 58, -0.5)]),
  shot("ilha vazia de lado: sem motores → madeira, pedra, tijolo e braços", C1, [
    K(C1, [-16.0, 4.2, 5.0], [-2.5, 0.8, 0.5], 54, 2.2), K(C1 + 0.45, [-12.0, 3.6, 6.6], [-2.4, 1.9, 1.0], 54, -0.5),
    K(T.hormigon, [-11.8, 3.8, 7.2], [-2.4, 2.0, 1.1], 52, 0.5), K(T.madera, [-11.4, 4.0, 8.4], [-2.4, 2.1, 1.2], 50, -0.5),
    K(T.brazos, [-9.0, 3.6, 9.4], [-2.0, 2.2, 0.8], 48, 0.5), K(T.p1 - 0.05, [-8.4, 3.4, 9.8], [-1.8, 2.2, 0.8], 48, 0)]),
  shot("do fundo do buraco: a face de barro → «blando» treme → a casa pousa e afunda (✖)", T.p1, [
    K(T.p1, [4.6, -2.4, 12.0], [3.6, -1.6, 3.0], 52, -1.5), K(T.p1 + 0.45, [4.2, -1.8, 12.4], [3.6, -1.2, 3.0], 52, 0.5),
    K(T.blando - 0.3, [3.6, 0.6, 12.8], [3.8, -0.2, 2.0], 52, -0.5), K(T.blando + 0.3, [3.4, 1.4, 13.0], [3.8, 0.0, 1.5], 52, 0.5),
    K(T.pones, [2.8, 2.4, 14.0], [3.8, 1.0, 2.0], 54, -0.5), K(T.hunde, [4.6, 1.0, 12.8], [4.0, 0.0, 3.0], 52, 0.5),
    ...hold(C2, [4.8, 0.6, 12.4], [4.0, -0.6, 3.0], 52, 0)]),
  shot("de cima: a casa some no barro → chicote para a face: o mazo crava os pilotes de ponta, um colado no outro", C2, [
    K(C2, [7.0, 12.5, -1.0], [5.0, 0.0, 1.4], 52, 3), K(C2 + 0.4, [5.8, 11.0, 0.2], [4.6, 0.0, 1.6], 52, -1.8), K(W3, [5.2, 10.4, 0.8], [4.4, 0.0, 1.8], 52, 0),
    K(W3 + 0.6, [1.4, 1.2, 12.6], [2.6, 1.0, 3.0], 56, 2.2), K(T.clavan, [2.4, 1.6, 12.0], [2.0, 1.2, 3.0], 56, -0.5),
    K(T.punta, [3.4, 0.6, 9.2], [1.9, 0.3, 3.0], 52, 0.5), K(T.pegado + 0.3, [2.6, 1.2, 10.6], [2.3, 0.6, 3.0], 54, -0.5),
    K(T.golpe - 0.05, [2.2, 1.6, 11.4], [2.6, 1.0, 3.0], 56, 0)]),
  shot("close no mazo: rajada de batidas → setas do barro apertado → a casa cai nos pilotes e não cede", T.golpe, [
    K(T.golpe, [-1.6, 3.8, 10.2], [2.6, 2.4, 3.0], 52, -2), K(T.golpe + 0.4, [-1.0, 3.8, 10.4], [3.0, 2.8, 3.0], 52, 0.5),
    K(T.mazo + 0.5, [0.0, 4.0, 10.6], [3.6, 3.2, 3.0], 52, -0.5), K(T.mazo + 1.0, [1.0, 3.6, 10.8], [4.0, 2.8, 3.0], 52, 0.5),
    K(T.apretado - 0.15, [3.5, -0.9, 14.0], [3.4, -2.0, 3.0], 56, 0.5), K(T.apretado + 0.6, [3.4, -1.2, 14.8], [3.4, -2.2, 3.0], 58, -0.5), K(T.cede - 0.1, [6.0, 0.4, 13.4], [3.6, 0.0, 2.0], 54, 0),
    K(T.cede + 0.35, [9.6, 4.4, 12.2], [3.5, 1.8, 1.5], 54, 0.5), K(T.pilotes + 0.3, [8.8, 3.6, 10.4], [3.5, 1.6, 1.5], 52, 0),
    ...hold(C3, [8.6, 3.4, 9.8], [3.5, 1.6, 1.5], 52, 0)]),
  shot("de cima: a laguna sem árvores — a muda que o operário planta murcha e cai", C3, [
    K(C3, [1.5, 20.0, 5.0], [-5.0, 0.0, -9.0], 58, -2.5), K(C3 + 0.45, [-1.0, 19.0, 3.0], [-5.0, 0.0, -9.0], 58, 0.5),
    K(T.p2 + 0.2, [-3.0, 12.0, -1.0], [-6.0, 0.4, -11.2], 56, -0.5), K(T.arboles - 0.1, [-3.6, 6.4, -6.6], [-6.6, 0.6, -12.0], 54, 0.5),
    K(T.arboles + 0.6, [-3.7, 6.2, -6.8], [-6.6, 0.5, -12.0], 54, -0.5), K(T.faltan + 0.3, [-3.8, 15.0, -2.0], [-6.0, 0.0, -13.0], 58, 0.5),
    K(T.b2 - 0.05, [-4.0, 16.6, -3.0], [-6.0, 0.0, -14.0], 58, 0)]),
  shot("⏪ os Alpes de longe («sin camiones») → mergulho até o bosque: as árvores caem", T.b2, [
    K(T.b2, [-1.0, 11.0, -17.0], [-12.0, 10.0, -70.0], 56, 2), K(T.b2 + 0.45, [-3.0, 9.6, -19.5], [-12.0, 9.0, -70.0], 56, -0.5),
    K(T.c2, [-5.0, 8.4, -23.0], [-13.0, 6.0, -62.0], 54, 0.5), K(T.talan - 0.15, [-6.6, 5.0, -35.0], [-11.4, 1.8, -43.4], 50, -0.5),
    K(T.talan + 0.7, [-7.0, 4.6, -36.2], [-11.4, 1.6, -43.4], 50, 0.5), K(T.alpes + 0.4, [-7.4, 4.4, -36.8], [-11.6, 1.4, -43.4], 50, -0.5),
    K(T.atan - 0.05, [-7.6, 4.3, -37.0], [-11.8, 1.2, -43.6], 50, 0)]),
  shot("rente ao rio: os troncos viram balsa → a balsa dispara rio abaixo, a câmera corre atrás", T.atan, [
    K(T.atan, [-7.6, 3.4, -34.4], [-13.2, 0.6, -42.4], 50, -2), K(T.atan + 0.4, [-7.8, 3.4, -34.8], [-13.4, 0.6, -42.6], 50, 0.5),
    K(T.balsas + 0.2, [-7.9, 3.4, -35.0], [-13.6, 0.6, -42.8], 50, -0.5), K(T.bajan + 0.5, [-6.0, 4.6, -36.0], [-12.8, 0.5, -38.5], 52, 0.5),
    K(T.hasta, [-5.4, 5.2, -33.0], [-11.8, 0.4, -31.5], 54, -0.5), ...hold(C4, [-5.0, 5.6, -30.5], [-10.7, 0.4, -24.6], 54, 0)]),
  shot("do lado oeste: o rio leva a balsa até a laguna (o operário de barriga para cima)", C4, [
    K(C4, [-20.0, 8.0, -30.0], [-10.4, 0.4, -23.6], 54, -2.2), K(C4 + 0.45, [-18.4, 6.0, -27.0], [-10.0, 0.4, -22.4], 54, 0.5),
    K(T.rio + 0.8, [-17.4, 5.6, -24.0], [-9.6, 0.4, -20.6], 54, -0.5), K(T.flotantes, [-16.4, 5.4, -21.0], [-8.8, 0.4, -18.4], 54, 0.5),
    K(T.p3 - 0.05, [-16.0, 5.4, -19.6], [-8.4, 0.4, -17.0], 54, 0)]),
  shot("do lado leste da estaca: ela apodrece e desmancha (✖), o operário cai → chicote para a ilha", T.p3, [
    K(T.p3, [-1.6, 3.8, -20.6], [-8.0, 1.2, -16.0], 54, 2), K(T.p3 + 0.45, [-1.6, 3.6, -21.4], [-8.2, 1.0, -16.2], 54, -0.5),
    K(T.pudre, [-1.8, 3.4, -21.2], [-8.4, 0.8, -16.4], 54, 0.5), K(W6, [-1.9, 3.3, -21.1], [-8.4, 0.2, -16.4], 54, -0.5),
    ...hold(C5, [-2.6, 2.6, -19.0], [2.0, 0.0, -6.0], 54, 3)]),
  shot("a face: estaca podre em cima, inteira embaixo → hongos → O₂", C5, [
    K(C5, [12.6, -1.0, 10.8], [PX2 - 0.2, -2.3, 3.0], 52, -2.2), K(C5 + 0.45, [10.8, -1.4, 9.8], [PX2 - 0.1, -2.0, 3.0], 52, 0.5),
    K(T.hongos, [11.0, 0.6, 9.6], [PX2, 0.4, 3.0], 52, -0.5), K(T.oxigeno, [8.8, 0.9, 10.0], [PX2, 0.5, 3.0], 54, 0.5),
    K(T.abajo - 0.05, [8.4, 1.0, 10.4], [PX2 - 0.2, 0.3, 3.0], 54, 0)]),
  shot("lá embaixo, no barro: O₂ riscado, bactérias devagar → todos os pilotes inteiros", T.abajo, [
    K(T.abajo, [10.4, -3.9, 7.6], [PX2 - 0.1, -3.2, 3.0], 46, 2), K(T.abajo + 0.4, [10.6, -3.4, 8.4], [PX2 - 0.1, -3.0, 3.0], 48, -0.5),
    K(T.casiNoHay + 0.3, [10.8, -2.8, 9.4], [PX2 - 0.2, -2.8, 3.0], 50, 0.5), K(T.bacterias, [9.6, -2.6, 8.0], [PX2 - 0.4, -2.8, 3.0], 46, -0.5),
    K(T.despacio, [9.0, -2.8, 7.8], [PX2 - 0.6, -2.9, 3.0], 46, 0.5), K(T.duran, [6.8, -1.6, 14.8], [6.8, -2.4, 3.0], 54, -0.5),
    K(T.p4 - 0.05, [6.4, -1.4, 15.2], [6.6, -2.3, 3.0], 54, 0)]),
  shot("a casa de tijolo: a água salgada sobe e os tijolos se desfazem", T.p4, [
    K(T.p4, [-0.6, 2.8, 11.8], [3.5, 1.2, 3.0], 52, -2), K(T.p4 + 0.45, [0.0, 2.4, 11.4], [3.5, 1.2, 3.0], 52, 0.5),
    K(T.sube, [0.8, 1.6, 10.8], [3.5, 0.9, 3.0], 52, -0.5), K(T.deshaciendo, [3.0, 0.8, 9.6], [3.5, 0.9, 3.0], 50, 0.5),
    K(T.b4, [4.4, 1.4, 10.6], [3.5, 1.2, 3.0], 52, -0.5), K(T.b4 + 0.9, [5.2, 2.0, 11.0], [3.5, 1.4, 3.0], 54, 0.5),
    ...hold(C6, [5.4, 2.2, 11.2], [3.5, 1.4, 3.0], 54, 0)]),
  shot("de cima-frente: a casa sobe, a Ístria entra, a casa desce, a pedra brilha", C6, [
    K(C6, [7.6, 10.4, 9.6], [3.5, 0.6, 2.4], 52, -2.7), K(C6 + 0.45, [5.6, 9.0, 8.8], [3.5, 0.8, 2.6], 52, 0.5),
    K(T.entre, [4.6, 7.2, 9.0], [3.5, 1.0, 2.8], 52, -0.5), K(T.ponen, [7.0, 3.0, 9.4], [3.8, 0.8, 2.8], 50, 0.5),
    K(T.blanca, [6.4, 1.8, 9.2], [3.6, 0.6, 3.0], 48, -0.5), K(T.cerrada - 0.05, [6.2, 1.6, 9.4], [3.6, 0.6, 3.0], 48, 0)]),
  shot("de baixo: a água salgada sobe e para na pedra branca", T.cerrada, [
    K(T.cerrada, [2.0, -1.6, 8.2], [3.5, 0.0, 3.0], 50, 2), K(T.cerrada + 0.45, [2.4, -1.2, 8.6], [3.5, 0.1, 3.0], 50, -0.5),
    K(T.noentra, [3.0, -0.7, 9.4], [3.5, 0.2, 3.0], 50, 0.5), K(T.estaIstria, [4.4, 0.9, 9.8], [3.5, 1.0, 3.0], 54, -0.5),
    ...hold(C7, [4.2, 1.3, 10.4], [3.5, 1.3, 3.0], 54, 0)]),
  shot("hoje, de cima: a cidade inteira, maré alta entrando pelas 3 bocas", C7, [
    K(C7, [6.0, 70.0, 40.0], [0.0, 0.0, 14.0], 58, 5), K(C7 + 0.5, [1.0, 66.0, 41.0], [0.0, 0.0, 14.5], 58, -3),
    K(T.giro + 0.3, [-2.0, 63.0, 43.0], [0.0, 0.0, 15.0], 58, 2.5), K(T.hoy + 0.4, [-2.0, 59.0, 47.0], [0.0, 0.0, 16.5], 58, -0.5),
    K(T.mareas + 0.3, [-1.0, 56.0, 50.0], [0.0, 0.0, 18.0], 58, 0.5), K(T.levanta - 0.05, [0.0, 54.0, 52.0], [0.0, 0.0, 19.0], 58, 0)]),
  shot("de dentro da laguna: as comportas amarelas sobem na boca oeste → chicote: as 3 bocas em fila", T.levanta, [
    K(T.levanta, [-12.0, 2.8, 20.0], [-14.0, 0.8, 29.6], 50, -2), K(T.levanta + 0.45, [-12.6, 2.1, 21.6], [-14.0, 0.9, 29.6], 50, 0.5),
    K(T.compuertas + 0.4, [-12.9, 1.8, 22.4], [-14.0, 1.0, 29.6], 50, -0.5), K(T.entradas, [26.0, 12.0, 38.0], [-2.0, 0.0, 28.0], 56, 0.5),
    K(T.esas - 0.05, [24.5, 11.4, 37.2], [-2.0, 0.0, 28.0], 56, 0)]),
  shot("os compressores: «esas sí funcionan con motores» → chicote para a cidade", T.esas, [
    K(T.esas, [11.6, 6.0, 34.4], [6.5, 3.4, 28.2], 50, 2), K(T.esas + 0.4, [11.0, 5.6, 33.8], [6.5, 3.4, 28.2], 50, -0.5),
    K(T.motores2 + 0.3, [10.2, 5.2, 33.0], [6.5, 3.2, 28.2], 48, 0.5), K(W10, [10.0, 5.0, 32.8], [6.5, 3.2, 28.2], 48, 0),
    K(W10 + 0.5, [0.5, 20.0, 34.0], [0.0, 3.0, 3.0], 58, 1.4), K(T.end, [-1.0, 19.0, 33.0], [0.0, 3.0, 2.5], 58, 0)]),
];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const onRaft = (t: number): V3 => { const r = raftAt(t); return [r.p[0] - 0.3, r.p[1] + 0.22, r.p[2] - 0.4]; };
const onGondola = (t: number): V3 => { const g = gondolaAt(t), s = gondolaStern(t); return [g[0] + s[0], g[1] + 0.25, g[2] + s[2]]; };
const toMallet = (t: number): V3 => { const u = ease(t, T.clavan - 0.3, T.clavan + 0.3); return [lerp(0.9, malletAt(t).x - 2.6, u), TOP, -0.6]; };
const fall = (t: number): V3 => { const a = onRaft(T.pudre + 0.12), u = ease(t, T.pudre + 0.12, T.pudre + 0.55); return [a[0] - 0.8 * u, a[1] + 0.7 * Math.sin(Math.PI * u) - 2.8 * u * u, a[2] - 0.6 * u]; };
// no gancho o gondoleiro olha para onde a góndola vai (na abertura b ela cruza o quadro de lado); na c ele leva um susto
const W0 = S([-9.8, 0.3, -13], 0.4, "present", { follow: onGondola, scale: 1.0 });
Object.defineProperties(W0, {
  yaw: { enumerable: true, get: () => (openOf() === "b" ? PI / 2 : 0.4) },
  pose: { enumerable: true, get: () => (openOf() === "c" ? "alarm" : "present") },
});
const BAR: V3 = [-7.6, 0.12, -12.3];   // a barena da muda
const WORKER: [number, WorkerState][] = [
  [0, W0],
  [T.debajo, S([-9.8, 0.3, -9], 0.4, "present", { follow: onGondola, scale: 1.0 })],
  [T.siguen, S([-9.8, 0.3, -9], 0.4, "cheer", { follow: onGondola, scale: 1.0 })],
  [C1 - 0.1, S([-0.4, TOP, -0.6], -1.0, "present", { scale: 0 })],
  [C1, S([-0.4, TOP, -0.6], -1.0, "present")],
  [T.hormigon, S([-0.4, TOP, -0.6], -1.0, "think")],
  [T.madera, S([-0.4, TOP, -0.6], -1.2, "point")],
  [T.brazos, S([-0.4, TOP, -0.6], -1.0, "cheer")],
  [T.p1, S([0.9, TOP, -0.6], 0.6, "think")],
  [T.hunde, S([0.9, TOP, -0.6], 0.6, "alarm")],
  [T.b1, S([0.9, TOP, -0.6], 0.6, "think")],
  [T.c1, S([0.9, TOP, -0.6], 0.6, "cheer")],
  [T.clavan - 0.3, S([3.2, TOP, -0.6], 1.0, "pull", { follow: toMallet })],
  [T.cede - 0.4, S([2.5, TOP, -0.6], 1.4, "pull", { follow: toMallet })],
  [T.cede, S([7.6, TOP, -1.4], -0.5, "cheer")],
  [T.pilotes, S([7.6, TOP, -1.4], -0.5, "point")],
  [C3, S(BAR, 0.6, "think")],
  [T.p2 + 0.2, S(BAR, 0.9, "present")],
  [T.arboles + 0.2, S(BAR, 0.9, "alarm")],
  [T.faltan, S(BAR, 0.6, "think")],
  [T.b2, S([-9.4, 0.35, -44.4], -1.4, "think")],
  [T.c2, S([-9.4, 0.35, -44.4], -1.4, "cheer")],
  [T.talan - 0.25, S([-9.4, 0.35, -44.4], -1.4, "chisel", { prop: "hammer" })],
  [T.atan, S([-10.6, 0.35, -43.6], -1.4, "pull")],
  [T.bajan, S([-13.9, 0.6, -43], 0.2, "cheer", { follow: onRaft })],
  [C4, S([-10.5, 0.4, -24], 0.3, "present", { follow: onRaft })],
  [T.rio, S([-10, 0.3, -21], 0.3, "belly", { follow: onRaft })],
  [T.flotantes, S([-9, 0.3, -18], 0.3, "point", { follow: onRaft })],
  [T.p3, S([-8.5, 0.3, -17], 0.6, "pull", { follow: onRaft })],
  [T.pudre + 0.12, S([-8.5, 0.3, -17], 0.6, "alarm", { follow: fall })],
  [T.pudre + 0.62, S([7.6, TOP, 0.8], 0, "idle", { follow: fall, scale: 0 })],
  [C5, S([7.6, TOP, 0.8], -0.6, "point")],
  [T.oxigeno, S([7.6, TOP, 0.8], -0.6, "think")],
  [T.duran, S([7.6, TOP, 0.8], -0.4, "cheer")],
  [T.p4, S([6.3, TOP, 0.9], -0.3, "alarm")],
  [T.b4, S([6.3, TOP, 0.9], -0.3, "think")],
  [C6, S([6.5, TOP, 1.0], -0.9, "pull")],
  [T.blanca, S([6.5, TOP, 1.0], -0.6, "point")],
  [T.estaIstria, S([6.5, TOP, 1.0], -0.4, "cheer")],
  [C7, S([8.6, 0.8, 27.0], 0.3, "present")],
  [T.mareas, S([8.6, 0.8, 27.0], 0.3, "alarm")],
  [T.compuertas, S([8.6, 0.8, 27.0], -0.6, "point")],
  [T.esas, S([8.6, 0.8, 27.0], 0.6, "think")],
  [T.manda, S([8.6, 0.8, 27.0], 0.3, "cheer")],
];

// roupa: veneziano medieval (túnica azul até o joelho, calça vermelha, gorro de feltro); lenço vermelho e bigode são do motor
const VENECIANO: Costume = { skin: "#e0aa82", top: "#2f5fa8", bottom: "#a8322a", kilt: "#2f5fa8", kiltLen: 0.62, hat: "cap", hatC: "#7a2a4a", boot: "#3a2b24", belt: "#d4a64a", sleeves: true };

const hud: HudData = {
  pills: [
    { a: T.ciudad + 0.1, b: T.millones - 0.1, label: "UNA CIUDAD", value: () => "SOBRE EL AGUA", y: 440, tone: "gold" },
    { a: T.millones, b: T.siguen - 0.1, label: "TRONCOS", value: (t) => `+${count(t, T.millones, T.millones + 1.0, 0, 1000000)}`, y: 440 },
    { a: T.siguen, b: T.venecia - 0.1, label: "SIGUEN AHÍ", value: () => "SIGLOS", y: 440, tone: "gold" },
    { a: T.venecia, b: T.nohay - 0.1, label: "HACE", value: () => "+1000 AÑOS", y: 440, tone: "gold" },
    { a: T.nohay, b: T.p1 - 0.1, label: "MOTORES", value: () => "0", y: 440, tone: "red" },
    { a: T.hormigon, b: T.p1 - 0.1, label: "HORMIGÓN", value: () => "0", y: 550, tone: "red" },
    { a: T.acero, b: T.p1 - 0.1, label: "ACERO", value: () => "0", y: 660, tone: "red" },
    { a: T.blando, b: T.b1 - 0.1, label: "FONDO", value: () => "BARRO BLANDO", y: 440, tone: "red" },
    { a: T.clavan + 0.3, b: T.pilotes - 0.1, label: "PILOTES", value: (t) => `${pilesDriven(t)}`, y: 440 },
    { a: T.apretado, b: T.p2 - 0.1, label: "BARRO", value: () => "APRETADO", y: 550, tone: "green" },
    { a: T.arboles, b: T.b2 - 0.1, label: "ÁRBOLES", value: () => "0", y: 440, tone: "red" },
    { a: T.faltan, b: T.b2 - 0.1, label: "HACEN FALTA", value: () => "MILLONES", y: 550, tone: "red" },
    { a: T.bajan, b: T.rio - 0.1, label: "RÍO", value: () => "PIAVE", y: 440 },
    { a: T.rio, b: T.p3 - 0.1, label: "MOTOR", value: () => "EL RÍO", y: 440, tone: "green" },
    { a: T.pudre, b: T.b3 - 0.1, label: "MADERA", value: () => "SE PUDRE", y: 440, tone: "red" },
    { a: T.oxigeno, b: T.abajo - 0.1, label: "HONGOS", value: () => "NECESITAN OXÍGENO", y: 440 },
    { a: T.casiNoHay, b: T.bacterias - 0.1, label: "OXÍGENO ABAJO", value: () => "CASI 0", y: 440, tone: "green" },
    { a: T.bacterias, b: T.duran - 0.1, label: "BACTERIAS", value: () => "MUY DESPACIO", y: 440, tone: "green" },
    { a: T.duran, b: T.p4 - 0.1, label: "DURAN", value: () => "SIGLOS", y: 440, tone: "gold" },
    { a: T.sube, b: T.b4 - 0.1, label: "AGUA SALADA", value: () => "SUBE", y: 440, tone: "red" },
    { a: T.deshaciendo, b: T.b4 - 0.1, label: "LADRILLOS", value: () => "SE DESHACEN", y: 550, tone: "red" },
    { a: T.noentra, b: T.estaIstria + 0.8, label: "AGUA QUE ENTRA", value: () => "CASI 0", y: 440, tone: "green" },
    { a: T.hoy, b: T.levanta - 0.1, label: "HOY", value: () => "MAREAS ALTAS", y: 440, tone: "red" },
    { a: T.compuertas, b: T.esas - 0.1, label: "COMPUERTAS", value: (t) => count(t, T.compuertas, T.compuertas + 0.9, 0, 78), y: 440, tone: "green" },
    { a: T.entradas, b: T.esas - 0.1, label: "ENTRADAS", value: () => "3", y: 550 },
    { a: T.motores2, b: T.manda - 0.1, label: "MOTORES", value: () => "SÍ", y: 440, tone: "red" },
  ],
  titles: [
    { a: T.pilotes, text: "PILOTES", len: 0.72 }, { a: T.flotantes, text: "TRONCOS FLOTANTES", len: 2.1 }, { a: T.casiNoHay, text: "SIN OXÍGENO", len: 2.4 },
    { a: T.estaIstria, text: "PIEDRA DE ISTRIA", len: 1.3 }, { a: T.giro, text: "¡EL GIRO!", len: 1.4 }, { a: T.compuertas, text: "MOSE", len: 2.4 },
  ],
  alerts: [T.p1, T.p2, T.p3, T.p4],
  rewinds: [T.venecia, T.b1, T.b2, T.b3, T.b4],
  crosses: [[T.hunde, T.hunde + 0.95], [T.pudre, T.pudre + 0.8]],
  stamps: [[T.b1, T.c1, "SIN HORMIGÓN"], [T.b2, T.c2, "SIN CAMIONES"], [T.b4, T.c3, "SIN CEMENTO"]],
  reward: { a: T.manda, len: T.end - T.manda, top: "VENECIA", big: (t) => `+${count(t, T.manda, T.manda + 1.2, 0, 1000)} AÑOS`, sub: "SOBRE PILOTES SIN MOTOR" },
  Extra: ({ t }) => {
    const ok = win(t, T.cede + 0.1, T.pilotes - 0.05, 0.12), sm = win(t, T.esas, T.manda - 0.1, 0.15), hit = t >= T.motores2;
    return (
      <>
        {/* «ya no cede»: o contrário do ✖ da casa que afundou */}
        {ok > 0 ? (
          <div style={{ position: "absolute", left: 1080 / 2 - 110, top: 120, width: 220, height: 220, opacity: ok, transform: `scale(${pop(t, T.cede + 0.1, 0.3)})` }}>
            <svg viewBox="0 0 100 100" width="220" height="220"><path d="M16 54 L40 78 L86 24" fill="none" stroke="#14202b" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 54 L40 78 L86 24" fill="none" stroke="#3ee06a" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>) : null}
        {/* a ironia do giro: o carimbo do canal «SIN MOTORES» leva um tranco do «¡CON MOTORES!» vermelho */}
        {sm > 0 ? (
          <div style={{ position: "absolute", left: 0, width: 1080, top: 600, height: 320, opacity: sm }}>
            <div style={{ position: "absolute", left: 0, width: 1080, top: 0, display: "flex", justifyContent: "center", transform: `rotate(${hit ? -14 : -4}deg) translateX(${hit ? -60 : 0}px) scale(${pop(t, T.esas, 0.25) * (hit ? 0.8 : 1)})`, opacity: hit ? 0.55 : 1 }}>
              <div style={{ padding: "6px 30px 10px", border: "8px solid #5b6670", borderRadius: 18, background: "#d9dee2e6" }}><span style={{ fontFamily: FONT, fontSize: 70, color: "#5b6670", letterSpacing: 3 }}>SIN MOTORES</span></div>
            </div>
            {hit ? (
              <div style={{ position: "absolute", left: 0, width: 1080, top: 110, display: "flex", justifyContent: "center", alignItems: "center", gap: 18, transform: `rotate(4deg) scale(${pop(t, T.motores2, 0.3)})` }}>
                <svg viewBox="0 0 100 100" width="120" height="120" style={{ transform: `rotate(${(t - T.motores2) * 240}deg)` }}>
                  <path d="M50 8 l7 12 l13 -4 l1 14 l13 5 l-6 12 l9 10 l-12 7 l2 14 l-14 0 l-6 12 l-11 -8 l-11 8 l-6 -12 l-14 0 l2 -14 l-12 -7 l9 -10 l-6 -12 l13 -5 l1 -14 l13 4 Z" fill="#ff7a1a" stroke="#3a1400" strokeWidth="5" strokeLinejoin="round" />
                  <circle cx="50" cy="54" r="14" fill="#3a1400" />
                </svg>
                <div style={{ padding: "8px 34px 12px", border: "10px solid #b3121a", borderRadius: 20, background: "#ffe1d9ee" }}><span style={{ fontFamily: FONT, fontSize: 104, color: "#d0121c", lineHeight: 1, ...stroke(4, "#5a0006") }}>¡CON MOTORES!</span></div>
              </div>) : null}
          </div>) : null}
      </>
    );
  },
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: VENECIANO, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#eaf3f8", fogNear: 150, fogFar: 600, hemiSky: "#f2f7ff", hemiGround: "#a88a62", hemiI: 1.25, sun: "#fff2d6", sunI: 2.6 },
};
