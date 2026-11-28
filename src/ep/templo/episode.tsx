// E22 — El Templo Mayor de Tenochtitlan (ecos-del-tiempo, Shorts). Câmera, o mexica, painel e luz deste episódio.
// Ritmo («Sim 66»): 3 aberturas (open a|b|c), corte duro a cada ~2–3 s (7 da régua + extras), algo sempre se mexendo,
// ✖ em cada problema/tentativa que falha (sem rocha, guindaste, bloco afundando, pirâmide inclinada, a ilha sem ponte).
// O personagem é um mestre de obras mexica (tilma branca, o lenço vermelho do canal). Tempo = palavras (find/endOf), nunca segundo literal.
import React from "react";
import { getInputProps } from "remotion";
import { CamState, K, Key, Shot, keyed } from "../../toy/cam";
import { WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { FONT, HudData, pop, stroke, win } from "../../toy/hud";
import { V3 } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { C1, C2, C3, C4, C5, C6, C7, SFX, T, TW } from "./cues";
import { BAL_P, MAP_P, MEX, MOD, MODEL, NB, PILE_X, PLAZA, SHORE, STONE_P0, World } from "./world";
import { EXPOSURE } from "./exposure";

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
/** a câmera na mão (story.ts) balança até 0,7·DYN; aqui o balanço grande é escalado pela DISTÂNCIA ao assunto: plano fechado
 *  quase parado, plano aberto com o balanço inteiro (cópia do steady() do arcos). */
const steady = (c: CamState, t: number): CamState => {
  const dist = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]);
  const d = dynAt(t) * Math.min(1, dist / 18);
  return { ...c, pos: [c.pos[0] - d * 0.7 * Math.sin(t * 0.9 + 9), c.pos[1] - d * 0.2 * Math.sin(t * 1.3 + 4), c.pos[2]], look: [c.look[0] - d * 0.3 * Math.sin(t * 1.1 + 3), c.look[1], c.look[2]] };
};
const shot = (name: string, t0: number, keys: Key[]): Shot => ({ name, t0, keys, fn: (t) => steady(keyed(keys, t), t) });
const hold = (c: number, pos: V3, look: V3, fov = 56, roll = 0) => [K(c - 0.42, pos, look, fov, roll), K(c - 0.02, pos, look, fov, roll)];

const OPEN_KEYS: Record<Open, Key[]> = {
  // a) (PADRÃO) de frente e de cima: o templo se abre ao meio e mostra outra pirâmide por dentro
  a: [K(0, [15, 9, 28], [0, 4, 0], 58, 1.2), K(1.6, [9, 6, 22], [0, 4, 0], 60, -0.6), K(T.ydentro - 0.05, [8, 5.5, 21], [0, 4, 0], 60, 0)],
  // b) do fundo do fosso, olhando para cima: o barro e a pirâmide
  b: [K(0, [-10, -6, 13], [0, 1.5, 0], 64, 0.8), K(1.4, [4, -1, 16], [0, 4, 0], 60, -0.4), K(T.ydentro - 0.05, [8, 5.5, 21], [0, 4, 0], 60, 0)],
  // c) do alto, mergulhando na ilha até o corte
  c: [K(0, [0, 80, 40], [0, 0, 0], 50, 1), K(1.4, [4, 30, 26], [0, 3, 0], 54, -0.5), K(T.ydentro - 0.05, [8, 5.5, 21], [0, 4, 0], 60, 0)],
};
const openCam = (t: number) => steady(keyed(OPEN_KEYS[openOf()], t), t);

const SH = SHORE;
const SHOTS: Shot[] = [
  { name: "abertura a|b|c: o templo se abre, outra pirâmide por dentro", t0: 0, keys: OPEN_KEYS.a, fn: openCam },
  shot("«y dentro de esa, otra»: a face do corte, as capas aninhadas", T.ydentro, [
    K(T.ydentro, [0, 5, 25], [0, 4, 0], 58, 1.5), K(T.todas - 0.05, [-3, 4.5, 22], [0, 4, 0], 58, 0)]),
  shot("«todas sobre el barro de un lago»: a câmera desce até o lodo e a água", T.todas, [
    K(T.todas, [2, 4, 15], [0, 3, 0], 60, -1.5), K(T.barro0, [-3, -5, 15], [0, -4, 0], 64, 0), K(T.lago0 + 0.1, [22, -3.5, 15], [34, -3, 0], 64, 0), K(T.tenoch - 0.05, [24, -3.5, 15], [34, -3, 0], 64, 0)]),
  shot("⏪ Tenochtitlan, século XIV: a ilha vista de longe e de cima, cercada de água, canoas em volta", T.tenoch, [
    K(T.tenoch, [-78, 84, -150], [0, 0, 6], 58, -1.5), K(T.mexicas - 0.05, [-58, 66, -128], [0, 0, 8], 58, 0)]),
  shot("«los mexicas viven en una isla del lago»: outro ângulo afastado, o anel de água e as canoas", T.mexicas, [
    K(T.mexicas, [44, 54, -132], [0, 0, 3], 66, 1.5), K(C1 - 0.02, [36, 44, -112], [0, 0, 5], 66, 0)]),
  shot("«no hay roca firme, solo lodo»: o corte da ilha, a rocha ✖", C1, [
    K(C1, [2, -2, 13], [-4, -5.5, 2], 60, -1.5), K(T.quieren - 0.05, [-1, -4, 12], [-4, -6.5, 3], 58, 0)]),
  shot("«quieren levantar el Templo Mayor»: o contorno fantasma na ilha", T.quieren, [
    K(T.quieren, [-30, 11, 40], [0, 3.4, 0], 60, 1.5), K(T.sinmot - 0.05, [-26, 10, 36], [0, 3.4, 0], 60, 0)]),
  shot("«sin un solo motor»: o guindaste de brinquedo ✖", T.sinmot, [
    K(T.sinmot, [-8, 3, 16], [-17, 3, 6], 56, -1.5), K(T.pero1 - 0.05, [-9, 4, 17], [-17, 3.6, 6], 56, 0)]),
  shot("«pero el lodo no aguanta peso»: o bloco afunda ✖", T.pero1, [
    K(T.pero1, [7, 3, 10], [3, 1.5, 0], 56, 1.5), K(T.como1 - 0.05, [6, 0.4, 9], [3, -0.8, 0], 56, 0)]),
  shot("«¿cómo levantas una pirámide sobre barro?»: o mestre pensa na beira", T.como1, [
    K(T.como1, [6, 2.5, 10], [-1, 0.5, 0], 56, 1.5), K(T.c1 - 0.15, [2.4, 1.7, 8.2], [-1.4, -0.1, 0], 56, 0), K(T.clavan - 0.05, [-0.4, 1.2, 8.8], [-1.5, -1.1, 0], 54, 0)]),
  shot("«clavan estacas de madera»: as estacas descem a marretadas", T.clavan, [
    K(T.clavan, [-1, 1.4, 13], [0, -1.5, 0], 54, 1.5), ...hold(C2, [2, 0.8, 13], [1, -1.8, 0], 54, 0)]),
  shot("«rellenan con tezontle»: as pedras vermelhas enchem entre as estacas", C2, [
    K(C2, [-3, 10, 9], [-2, -3.5, 0.5], 56, -1.5), K(T.piedra - 0.05, [3, 8, 11], [2, -3, 0.5], 56, 0)]),
  shot("«una piedra volcánica llena de huecos»: a pedra em close", T.piedra, [
    K(T.piedra, [STONE_P0[0] - 4, 2.6, STONE_P0[2] + 6], [STONE_P0[0], 1.9, STONE_P0[2]], 50, 1.5), K(T.casi - 0.05, [STONE_P0[0] - 2, 2.4, STONE_P0[2] + 5.4], [STONE_P0[0], 2.0, STONE_P0[2]], 48, 0)]),
  shot("«casi la mitad de pesada que el basalto»: a balança", T.casi, [
    K(T.casi, [BAL_P[0] - 3, 3.0, BAL_P[2] + 9], [BAL_P[0], 2.7, BAL_P[2]], 52, -1.5), K(T.esta - 0.05, [BAL_P[0] + 2, 3.0, BAL_P[2] + 9], [BAL_P[0], 2.6, BAL_P[2]], 52, 0)]),
  shot("«esta es la cimentación»: a base pronta e a primeira pirâmide sobe", T.esta, [
    K(T.esta, [8, 3, 19], [0, -1, 0], 58, 1.5), K(T.pero2 - 0.05, [5, 3.5, 17], [0, 0.5, 0], 58, 0)]),
  shot("«pero aun así se hunde, y no parejo»: afunda torto", T.pero2, [
    K(T.pero2, [0, 2.5, 14], [0, 1.2, 0], 56, -1.5), ...hold(C3, [-3, 1.5, 12], [0, 1.0, 0], 56, 0)]),
  shot("«la escalinata pesa más, y la pirámide se inclina»: o nível mostra ✖", C3, [
    K(C3, [-10, 13, 9], [0, 1.5, -1], 56, -1.5), K(C3 + 0.9, [-9, 5, 11], [0, 2.2, 0], 56, 0), K(T.como2 - 0.05, [-6, 3, 11], [0, 2.4, 0], 56, 0)]),
  shot("«¿cómo la corriges? con ingenio: la entierran»: o aterro cobre a pirâmide", T.como2, [
    K(T.como2, [7, 3.4, 14], [0, 2, 0], 56, 1.5), K(T.rellenan2 - 0.05, [5, 4, 13], [0, 2.4, 0], 56, 0)]),
  shot("«rellenan encima, nivelan»: o topo plano e o nível", T.rellenan2, [
    K(T.rellenan2, [3, 6.5, 10], [0, 4.2, 0], 54, -1.5), K(T.construyen - 0.05, [1, 6.2, 9.5], [0, 4.2, 0], 54, 0)]),
  shot("«y construyen otra más grande alrededor»: a capa maior sobe em volta", T.construyen, [
    K(T.construyen, [14, 4, 19], [0, 2, 0], 58, 1.5), K(T.cada - 0.05, [10, 5, 17], [0, 2.5, 0], 58, 0)]),
  shot("«cada capa aprieta el suelo»: o lodo escurece e aperta", T.cada, [
    K(T.cada, [-2.5, 0.5, 14.5], [0, 0.4, 0], 74, -1.5), K(C4 - 0.02, [2, 0.2, 13.5], [0, 0.4, 0], 72, 0)]),
  shot("«el centro se hunde cada vez menos»: as setas encolhem", C4, [
    K(C4, [0, 0.8, 15], [0, -2, 0], 64, 1.5), K(T.asi - 0.05, [0, 1.2, 15.4], [0, -1.5, 0], 64, 0)]),
  shot("«así crece la pirámide»: as capas empilhadas", T.asi, [
    K(T.asi, [14, 5, 24], [0, 3, 0], 56, -1.5), K(T.pero3 - 0.05, [-8, 4, 22], [0, 3.2, 0], 56, 0)]),
  shot("«montañas de piedra, madera y cal»: as pilhas GRANDES na margem de lá, a câmera as varre uma a uma", T.pero3, [
    K(T.pero3, [PILE_X[0] - 3, 6, SH - 16], [PILE_X[0], 2.8, SH + 8], 58, 1.5), K(T.pPiedra, [PILE_X[0] + 1, 5.5, SH - 15], [PILE_X[0], 2.8, SH + 8], 56, 0.4),
    K(T.pMadera + 0.1, [PILE_X[1], 5.5, SH - 15], [PILE_X[1], 2.8, SH + 8], 56, 0), K(T.pCal + 0.15, [PILE_X[2] - 1, 5.5, SH - 15], [PILE_X[2], 2.8, SH + 8], 56, -0.3), K(T.como3 - 0.05, [PILE_X[2] - 1, 5.8, SH - 16], [PILE_X[2] - 1, 2.8, SH + 8], 58, 0)]),
  shot("«¿cómo las llevas a una isla?»: a margem, a água e a ilha", T.como3, [
    K(T.como3, [10, 22, SH + 24], [-1, 0, 56], 56, -1), K(T.c3 - 0.05, [8, 20, SH + 21], [-1, 0, 52], 56, 0)]),
  shot("«con ingenio: en canoa»: as canoas surgem na mesma água", T.c3, [
    K(T.c3, [-17, 2.4, SH - 3], [-11, 1.4, 55], 58, 1.5), K(C5 - 0.02, [-9, 2.5, SH - 5], [-3, 1.3, 53], 56, 0)]),
  shot("«a cuestas, una persona carga veintitrés kilos»: o carregador", C5, [
    K(C5, [-14, 2.5, SH - 8], [-9.5, 1.9, SH + 4], 54, -1.5), K(T.canoa1 - 0.05, [-6, 2.7, SH - 8], [0.8, 1.9, SH + 4], 54, 0)]),
  shot("«en canoa, mil doscientos»: a canoa cheia de pedra", T.canoa1, [
    K(T.canoa1, [-4, 1.8, 60], [8, 1.2, 46], 54, 1.5), K(T.pueblos - 0.05, [1, 2.4, 62], [7, 1.3, 46], 54, 0)]),
  shot("«los pueblos vecinos llegan remando»: canoas de todos os lados", T.pueblos, [
    K(T.pueblos, [0, 26, SH + 30], [0, 0, 40], 56, -1.5), K(T.estas - 0.05, [0, 16, SH + 8], [0, 0, 44], 56, 0)]),
  shot("«estas son las canoas»: as canoas atracadas", T.estas, [
    K(T.estas, [24, 3.5, SH - 4], [0, 1.4, 46], 60, 1.5), K(TW.giro - 0.05, [16, 4.5, SH - 6], [-4, 1.4, 46], 60, 0)]),
  shot("«y aquí viene el giro»: chicote até o templo", TW.giro, [
    K(TW.giro, [30, 12, 34], [0, 4, 0], 60, -8), K(TW.giro + 0.5, [16, 8, 26], [0, 4, 0], 58, 5), K(TW.nola - 0.05, [12, 7, 24], [0, 4.5, 0], 56, 0)]),
  shot("«no la ampliaron solo porque se hundía»: a seta de afundar e «NO SOLO»", TW.nola, [
    K(TW.nola, [0, 2.6, 22], [0, 1.6, 0], 58, 1.5), K(TW.may - 0.05, [-4, 3.0, 20], [0, 1.4, 0], 58, 0)]),
  shot("«la mayoría… se estrenaban tras someter»: os guerreiros marcham sobre o pueblo vecino, o povo se ajoelha, o estandarte cai", TW.may, [
    K(TW.may, [30, 6, 10], [36, 2.0, -11], 60, -1.5), K(Math.min(Math.max(T.someter - 0.15, TW.may + 0.4), TW.pueblo - 0.3), [40, 7.5, 15], [49, 1.8, -10], 62, 0), K(TW.pueblo - 0.05, [42, 7.2, 13], [50, 1.0, -10], 60, 0)]),
  shot("«a un pueblo vecino»: uma capa nova sobe e os guerreiros voltam vitoriosos", TW.pueblo, [
    K(TW.pueblo, [34, 9, 22], [4, 4, -3], 58, 1.5), K(C6 - 0.02, [32, 9.5, 24], [5, 4.5, -3], 58, 0)]),
  shot("«el templo crecía al mismo ritmo que el imperio»: o mapa cresce junto", C6, [
    K(C6, [8, 14, 40], [7, 4, 0], 60, -1.5), K(T.enmenos - 0.05, [6, 15, 38], [6, 4.2, 0], 60, 0)]),
  shot("«en menos de dos siglos, siete capas»: o corte com as 7 capas", T.enmenos, [
    K(T.enmenos, [0, 5.5, 30], [0, 4, 0], 60, 1.5), K(T.arriba - 0.05, [-2, 5, 27], [0, 4.2, 0], 58, 0)]),
  shot("«y arriba, dos templos gemelos»: a câmera sobe pela escadaria até os dois templos", T.arriba, [
    K(T.arriba, [-30, 3, 3], [-4, 3, 0], 60, -1.5), K(T.huitz, [-22, 12, 6], [0, 8, 0], 58, 0), K(T.m1521 - 0.05, [-15, 13, 9], [0, 8.5, 0], 56, 0)]),
  shot("«en 1521, los españoles»: os soldados marcham", T.m1521, [
    K(T.m1521, [-36, 10, 36], [-12, 2, 12], 56, 1.5), K(C7 - 0.02, [-33, 10, 34], [-10, 2, 12], 56, 0)]),
  shot("«lo arrasaron y construyeron encima»: o templo cai, a igreja sobe", C7, [
    K(C7, [22, 10, 30], [0, 3, 0], 58, -1.5), K(T.m1978 - 0.05, [16, 9, 28], [0, 3.5, 0], 58, 0)]),
  shot("«y en 1978»: a rua moderna", T.m1978, [
    K(T.m1978, [MOD[0] - 14, MOD[1] + 8, MOD[2] + 26], [MOD[0], MOD[1] + 0, MOD[2] + 2], 56, 1.5), K(T.cavaban - 0.05, [MOD[0] - 8, MOD[1] + 6, MOD[2] + 22], [MOD[0], MOD[1] + 0, MOD[2] + 2], 56, 0)]),
  shot("«unos obreros de la luz cavaban un pozo»: o poço desce", T.cavaban, [
    K(T.cavaban, [MOD[0] - 2, MOD[1] + 9, MOD[2] + 11], [MOD[0], MOD[1] + -1.5, MOD[2]], 56, -1.5), K(T.toparon - 0.05, [MOD[0] - 4, MOD[1] + 8, MOD[2] + 10], [MOD[0], MOD[1] + -3, MOD[2]], 56, 0)]),
  shot("«toparon con una diosa de piedra a sus pies»: de cima do poço", T.toparon, [
    K(T.toparon, [MOD[0] + 3, MOD[1] + 10, MOD[2] + 4], [MOD[0], MOD[1] + -5, MOD[2]], 54, 1.5), K(T.asi2 - 0.05, [MOD[0] + 0.5, MOD[1] + 12, MOD[2] + 1.2], [MOD[0], MOD[1] + -6, MOD[2]], 50, 0)]),
  shot("«así empezó la excavación»: o poço se alarga e mostra as capas", T.asi2, [
    K(T.asi2, [MOD[0] + 10, MOD[1] + 10, MOD[2] + 12], [MOD[0], MOD[1] + -5, MOD[2]], 58, -1.5), K(T.manda - 0.05, [MOD[0] + 14, MOD[1] + 16, MOD[2] + 16], [MOD[0], MOD[1] + -4, MOD[2]], 58, 0)]),
  shot("final: a maquete das 7 capas com a recompensa por cima", T.manda, [
    K(T.manda, [MODEL[0], 8, MODEL[2] + 31], [MODEL[0], 11.5, MODEL[2]], 56, -1), K(T.end, [MODEL[0] + 3, 9, MODEL[2] + 33], [MODEL[0], 11.5, MODEL[2]], 54, 0)]),
];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, scale: 1.25, ...o });
const fix = (p: V3): Partial<WorkerState> => ({ follow: () => p });
const yawTo = (a: V3, b: V3) => Math.atan2(b[0] - a[0], b[2] - a[2]);
const HID = (p: V3 = [0, 0, -3]): WorkerState => S(p, 0, "idle", { scale: 0, ...fix(p) });
const W_G: V3 = [-8.5, 0, 8], W_TOP: V3 = [-9.6, 0, -2.4], W_B: V3 = [-4, 0, -2.2], W_PZ: V3 = [PLAZA[0] + 2.6, 0, PLAZA[2] - 3.4], W_SH: V3 = [24, 0, SH + 4];
const WORKER: [number, WorkerState][] = [
  [0, HID()],
  [T.quieren, S(W_G, yawTo(W_G, [0, 0, 0]), "point", fix(W_G))],
  [T.sinmot, S([-11, 0, 9], yawTo([-11, 0, 9], [-17, 0, 6]), "alarm", fix([-11, 0, 9]))],
  [T.pero1, S([-1, 0, -2.2], 0.2, "alarm", fix([-1, 0, -2.2]))],
  [T.como1, S(W_B, 0.2, "think", fix(W_B))],
  [T.c1, S(W_B, 0.2, "cheer")],
  [T.clavan, S(W_TOP, 0.3, "point", fix(W_TOP))],
  [C2, S(W_TOP, 0.3, "present")],
  [T.piedra, S(W_PZ, yawTo(W_PZ, STONE_P0), "present", fix(W_PZ))],
  [T.esta, S([-6.5, 0, -2.6], 0.2, "present", fix([-6.5, 0, -2.6]))],
  [T.pero2, S([-6.5, 0, -2.6], 0.2, "alarm")],
  [C3, S([-8.4, 0, -2.4], 0.4, "alarm", fix([-8.4, 0, -2.4]))],
  [T.como2, S([-8, 0, -2.3], 0.3, "think", fix([-8, 0, -2.3]))],
  [T.c2, S([-8, 0, -2.3], 0.3, "cheer")],
  [T.rellenan2, S([-8, 0, -2.3], 0.3, "point")],
  [T.construyen, S([-8.4, 0, -2.2], 0.3, "present", fix([-8.4, 0, -2.2]))],
  [T.asi, S([-9.4, 0, -2.4], 0.3, "cheer", fix([-9.4, 0, -2.4]))],
  [T.pero3, S(W_SH, 0.2, "alarm", fix(W_SH))],
  [T.como3, S([5, 0, SH + 12], 3.0, "think", fix([5, 0, SH + 12]))],
  [T.c3, HID([0, 0, -3])],
  [TW.giro, S([-9.4, 0, -3], 0.3, "cheer", fix([-9.4, 0, -3]))],
  [TW.nola, S([-9.4, 0, -3], 0.3, "point")],
  [TW.may, HID([0, 0, -3])],
];

const Stamp2: React.FC<{ t: number }> = ({ t }) => {
  const a = T.hundia + 0.12, b = TW.may - 0.12, k = win(t, a, b, 0.12); if (k <= 0) return null;
  const s = 1.7 - 0.7 * pop(t, a, 0.2);
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: 590, display: "flex", justifyContent: "center", opacity: k }}>
      <div style={{ transform: `rotate(-7deg) scale(${s})`, padding: "4px 36px 12px", border: "10px solid #d0262b", borderRadius: 22, background: "#fff4e0d0" }}>
        <span style={{ fontFamily: FONT, fontSize: 116, color: "#d0262b", letterSpacing: 6 }}>NO SOLO</span>
      </div>
    </div>
  );
};

/** cartão final do E22 (cópia do painel padrão, com as estrelas só na faixa livre entre o cartão e o templo: nunca sobre o texto) */
const Card: React.FC<{ t: number }> = ({ t }) => {
  const k = win(t, T.manda, T.end, 0.25); if (k <= 0) return null;
  const s = pop(t, T.manda, 0.45), cols = ["#ffd400", "#5cff7a", "#4ab8ff", "#ff6bb5", "#ffffff"];
  return (
    <>
      <div style={{ position: "absolute", left: 0, width: 1080, top: 300, display: "flex", flexDirection: "column", alignItems: "center", opacity: k, transform: `scale(${s})` }}>
        <span style={{ fontFamily: FONT, fontSize: 56, color: "#fff", ...stroke(10) }}>TEMPLO MAYOR · SIGLO XIV</span>
        <span style={{ fontFamily: FONT, fontSize: 150, color: "#5cff7a", lineHeight: 1, ...stroke(16, "#05381a") }}>7 CAPAS</span>
        <span style={{ fontFamily: FONT, fontSize: 72, color: "#ffd400", lineHeight: 1.1, textAlign: "center", ...stroke(12, "#3a2300") }}>SOBRE EL BARRO DEL LAGO</span>
      </div>
      {Array.from({ length: 14 }, (_, i) => {
        const u = Math.min(1, Math.max(0, (t - T.manda - 0.04 * i) / 1.6)), ang = (i / 14) * Math.PI * 2;
        return <span key={i} style={{ position: "absolute", top: 860 + Math.sin(ang) * 170 * u - 27, left: 540 + Math.cos(ang) * 470 * u - 27, fontFamily: FONT, fontSize: 54, color: cols[i % 5], opacity: k * (1 - u * 0.85), ...stroke(5, "#1c1208") }}>★</span>;
      })}
    </>
  );
};
const Extras: React.FC<{ t: number }> = ({ t }) => <><Stamp2 t={t} /><Card t={t} /></>;

const hud: HudData = {
  pills: [
    { a: T.tenoch, b: T.mexicas - 0.1, label: "TENOCHTITLAN", value: () => "SIGLO XIV", tone: "gold" },
    { a: T.roca, b: T.quieren - 0.1, label: "ROCA FIRME", value: () => "0", tone: "red" },
    { a: T.sinmot, b: T.pero1 - 0.1, label: "MOTORES", value: () => "0", tone: "red" },
    { a: T.casi, b: T.esta - 0.1, label: "", value: () => "TEZONTLE", tone: "red" },
    { a: T.basalto, b: T.esta - 0.1, label: "", value: () => "BASALTO", tone: "dark", y: 548 },
    { a: T.kilos, b: T.canoa1 - 0.1, label: "UNA PERSONA", value: () => "23 kg", tone: "gold" },
    { a: T.mil, b: T.pueblos - 0.1, label: "UNA CANOA", value: () => "1200 kg", tone: "green" },
    { a: T.siete - 0.3, b: T.huitz - 0.1, label: "", value: () => "7 CAPAS", tone: "gold" },
    { a: T.huitz, b: T.m1521 - 0.1, label: "", value: () => "HUITZILOPOCHTLI", tone: "red" },
    { a: T.tlaloc, b: T.m1521 - 0.1, label: "", value: () => "TLÁLOC", tone: "dark", y: 548 },
    { a: T.m1521, b: T.m1978 - 0.15, label: "AÑO", value: () => "1521", tone: "gold" },
    { a: T.m1978, b: T.asi2 - 0.1, label: "AÑO", value: () => "1978", tone: "gold" },
  ],
  titles: [{ a: T.esta, text: "CIMENTACIÓN", len: 1.3 }, { a: T.asi, text: "CAPAS", len: 1.2 }, { a: T.estas, text: "CANOAS", len: 1.1 }, { a: T.giro, text: "¡EL GIRO!", len: 1.1 }],
  alerts: [T.pero1, T.pero2, T.pero3],
  rewinds: [T.tenoch, T.como1, T.como2, T.como3],
  crosses: [],
  stamps: [[T.como1, T.c1, "SOBRE BARRO"], [T.como2, T.c2, "SE INCLINA"], [T.como3, T.c3, "UNA ISLA"]],
  reward: { a: T.manda, len: 0, top: "", big: () => "", sub: "" }, // o cartão final é o Card abaixo (as faíscas do painel padrão cruzavam o texto)
  Extra: Extras,
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: MEX, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#cfe8ff", fog: "#e4f2ff", fogNear: 170, fogFar: 640, hemiSky: "#fff6e4", hemiGround: "#d6c49a", hemiI: 1.25, sun: "#fff0d0", sunI: 2.6 },
};
export { T, MAP_P, NB, BAL_P };
