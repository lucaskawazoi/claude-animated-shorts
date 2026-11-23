// E18 — La Sagrada Família (ecos-del-tiempo, Shorts; tema do radar). Câmera, Gaudí, painel e luz deste episódio.
// Ritmo («Sim 66»): 3 aberturas (PROPS open a|b|c), corte duro a cada ~2–4 s (7 da régua + extras), algo sempre se mexendo,
// tentativas que dão errado com ✖ (a coluna reta que tomba, o fogo de 1936 que quebra as maquetas).
// Gaudí (o operário deste episódio) some em 1926: depois dele, quem trabalha é outra gente (multidão do mundo).
import React from "react";
import { getInputProps } from "remotion";
import { CamState, K, Key, Shot, keyed } from "../../toy/cam";
import { CUTS, WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { HudData, count } from "../../toy/hud";
import { V3, ease } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { SFX, T } from "./cues";
import { CD, CM, CNC, DB, GAUDI, GU, NP, TAPE, TW, World, yearAt } from "./world";
import { EXPOSURE } from "./exposure";

const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
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
const steady = (c: CamState, t: number): CamState => {
  const d = dynAt(t);
  return { ...c, pos: [c.pos[0] - d * 0.7 * Math.sin(t * 0.9 + 9), c.pos[1] - d * 0.2 * Math.sin(t * 1.3 + 4), c.pos[2]], look: [c.look[0] - d * 0.3 * Math.sin(t * 1.1 + 3), c.look[1], c.look[2]] };
};
const shot = (name: string, t0: number, keys: Key[]): Shot => ({ name, t0, keys, fn: (t) => steady(keyed(keys, t), t) });
const hold = (c: number, pos: V3, look: V3, fov = 54, roll = 0) => [K(c - 0.42, pos, look, fov, roll), K(c - 0.02, pos, look, fov, roll)];
const at = (o: V3, d: V3): V3 => [o[0] + d[0], o[1] + d[1], o[2] + d[2]];

const OPEN_KEYS: Record<Open, Key[]> = {
  // a) (PADRÃO) colado na cruz e no guindaste lá em cima, recua até a basílica inteira
  a: [K(0, [5, 33.5, 8], [0, 32, 0], 50, 1.2), K(1.2, [11, 27, 24], [0, 24, 0], 56, -0.4), K(T.todavia - 0.05, [17, 20, 40], [2, 15, 0], 58, 0)],
  // b) do chão da praça, olhando para cima entre as torres da Natividade
  b: [K(0, [0, 1.4, 13], [0, 14, 6], 62, 0.8), K(1.4, [-4, 3, 20], [0, 16, 3], 60, -0.4), K(T.todavia - 0.05, [-8, 6, 30], [0, 16, 1], 58, 0)],
  // c) do alto do Eixample (quarteirões octogonais), mergulhando na obra
  c: [K(0, [-46, 64, 86], [0, 8, 0], 50, 1), K(1.4, [-26, 38, 58], [0, 12, 0], 54, -0.5), K(T.todavia - 0.05, [-12, 22, 40], [0, 14, 0], 56, 0)],
};
const openCam = (t: number) => steady(keyed(OPEN_KEYS[openOf()], t), t);

const SHOTS: Shot[] = [
  { name: "abertura a|b|c: 144 años en obras", t0: 0, keys: OPEN_KEYS.a, fn: openCam },
  shot("«todavía no la terminan»: a Glória em tocos, andaime e guindaste", T.todavia, [
    K(T.todavia, [29, 9, 7], [14.8, 5, 0], 54, -1.5), K(T.porque - 0.05, [23, 13, 17], [14.8, 8, 0], 56, 0)]),
  shot("«¿por qué tarda tanto?»: o guindaste balançando a pedra, de trás", T.porque, [
    K(T.porque, [16, 20, -24], [3, 22, -3], 56, 1.5), K(T.barcelona - 0.05, [12, 22, -26], [2, 23, -3], 56, 0)]),
  shot("Barcelona, 1883: o Eixample de cima e a obra que volta a ser cripta", T.barcelona, [
    K(T.barcelona, [30, 44, 62], [0, 6, 0], 56, -1.5), K(T.antoni - 0.05, [12, 16, 32], [-3, 1, 3], 54, 0)]),
  shot("Antoni Gaudí, 31 años, na cripta", T.antoni, [
    K(T.antoni, [-1, 2.3, 12.5], [-2.6, 1.3, 6], 50, 1), ...hold(C1, [-1.4, 2.2, 11.8], [-2.6, 1.3, 6], 50, 0)]),
  shot("toma una obra: o outro arquiteto entrega o rolo e vai embora", C1, [
    K(C1, [-2.4, 4.6, 13.5], [-2.2, 1.0, 5.2], 54, -1.5), K(T.otro, [-1.2, 4.4, 13.2], [-1.4, 1.0, 5.6], 54, 0.5), K(T.nohay - 0.05, [0.4, 4.0, 13.0], [0, 1.0, 6.4], 54, 0)]),
  shot("sem computadores nem máquinas (✖)", T.nohay, [
    K(T.nohay, at(NP, [4, 2.6, 6]), at(NP, [0, 0.8, 0]), 52, -1.5), K(T.papel - 0.05, at(NP, [1.5, 2.2, 6.6]), at(NP, [0, 0.8, 0]), 52, 0)]),
  shot("papel, gesso, cordas e pedra, de lado", T.papel, [
    K(T.papel, at(NP, [-3.0, 1.7, 5.4]), at(NP, [-1.0, 0.3, 0.6]), 50, 1.5), K(T.cuerdas0, at(NP, [-3.2, 1.7, 4.4]), at(NP, [0, 0.5, 0.6]), 50, -0.5), K(T.quiere - 0.05, at(NP, [-2.2, 2.0, 5.2]), at(NP, [0.4, 0.5, 0.6]), 50, 0)]),
  shot("columnas inclinadas: a coluna cresce torta", T.quiere, [
    K(T.quiere, at(CD, [-5, 3.2, 7]), at(CD, [0, 2.4, 0]), 54, -1.5), ...hold(C2, at(CD, [-3.6, 3.0, 7.4]), at(CD, [0.4, 2.6, 0]), 54, 0)]),
  shot("como árboles; e a coluna reta tomba ✖", C2, [
    K(C2, at(CD, [1.0, 11.0, 3.5]), at(CD, [0.3, 0.5, 0]), 54, 1.5), K(T.casi - 0.1, at(CD, [2.6, 7.0, 6.5]), at(CD, [-1.2, 1.4, 0]), 54, -0.5), K(T.b1 - 0.05, at(CD, [3, 2.2, 7.2]), at(CD, [-2.4, 1.2, 0.4]), 54, 0)]),
  shot("«¿cómo calculas una forma…?»: Gaudí diante da coluna caída", T.b1, [
    K(T.b1, at(CD, [-2.2, 2.0, 3.0]), at(CD, [-1.8, 2.1, -1.6]), 48, -1), K(T.c1 - 0.05, at(CD, [-1.5, 1.9, 3.2]), at(CD, [-1.8, 2.1, -1.6]), 48, 0)]),
  shot("«con ingenio»: outra igreja, entre pinheiros, e o barracão", T.c1, [
    K(T.c1, at(GU, [19, 3.5, 11]), at(GU, [13, 3.2, -3]), 54, 1.5), K(T.otra + 0.3, at(GU, [6, 5.5, 10]), at(GU, [0, 5.6, 0]), 54, -0.5), K(T.cuelga - 0.05, at(GU, [3, 5.4, 9.6]), at(GU, [0, 5.8, 0]), 54, 0)]),
  shot("cuelga cuerdas: os saquitos caem e as cordas cedem", T.cuelga, [
    K(T.cuelga, at(GU, [2, 5.5, 9]), at(GU, [0, 6.0, 0]), 54, -1.5), ...hold(C3, at(GU, [1.4, 5.0, 8.6]), at(GU, [0, 5.4, 0]), 54, 0)]),
  shot("cada corda acha a curva do peso (verde)", C3, [
    K(C3, at(GU, [-7, 4.6, 5.6]), at(GU, [0, 5.4, 0]), 52, 1.5), K(T.tira, at(GU, [-5.5, 4.2, 6.6]), at(GU, [0, 5.4, 0]), 52, -0.5), K(T.vuelta - 0.05, at(GU, [-4.4, 4.4, 7.4]), at(GU, [0, 5.2, 0]), 52, 0)]),
  shot("dale la vuelta: a maquete gira inteira", T.vuelta, [
    K(T.vuelta, at(GU, [0, 4.6, 12.5]), at(GU, [0, 4.4, 0]), 54, -1.5), K(T.apretando - 0.05, at(GU, [1.2, 4.2, 11.5]), at(GU, [0, 4.2, 0]), 54, 0)]),
  shot("a pedra só apertando (ouro) até o chão", T.apretando, [
    K(T.apretando, at(GU, [4.4, 3.2, 6.2]), at(GU, [1.2, 3.6, 0]), 50, 1.5), K(T.p2 - 0.05, at(GU, [3.6, 3.4, 6.8]), at(GU, [0.6, 3.8, 0]), 50, 0)]),
  shot("custa muitíssimo: esmolas na caixa e a barra do custo quase vazia", T.p2, [
    K(T.p2, at(DB, [2.2, 2.2, 5.6]), at(DB, [0.6, 1.5, 0]), 54, -1.5), K(T.limosnas, at(DB, [1.8, 3.0, 6.6]), at(DB, [1.1, 2.6, 0]), 56, 0.5), K(T.sabe - 0.05, at(DB, [1.6, 3.8, 7.6]), at(DB, [1.4, 3.6, 0]), 58, 0)]),
  shot("ele não verá terminada: o tempo corre até 1926", T.sabe, [
    K(T.sabe, [-7, 8, 27], [0, 7, 4], 58, 1.5), ...hold(C4, [-5, 10, 28], [0, 8, 4], 58, 0)]),
  shot("1926: uma torre pronta, o resto andaime (de cima)", C4, [
    K(C4, [22, 30, 22], [0, 6, 3], 54, -1.5), K(T.b2 - 0.05, [20, 29, 24], [0, 6, 3], 54, 0)]),
  shot("«Solución»: o ateliê, as maquetas de gesso surgem", T.b2, [
    K(T.b2, at(TW, [5.4, 3.4, 5.6]), at(TW, [-0.4, 1.4, 0]), 54, 1.5), K(T.cadaParte, at(TW, [4.6, 3.2, 6.2]), at(TW, [-0.6, 1.4, 0]), 54, -0.5), K(T.otros - 0.05, at(TW, [4.0, 3.0, 6.6]), at(TW, [-0.6, 1.4, 0]), 54, 0)]),
  shot("para que otros sigan: o aprendiz leva uma maqueta", T.otros, [
    K(T.otros, at(TW, [8.5, 2.8, 9.5]), at(TW, [3.5, 1.4, 2]), 52, -1.5), K(T.atribuye - 0.05, at(TW, [12, 2.6, 7.5]), at(TW, [7.5, 1.4, 3]), 52, 0)]),
  shot("se le atribuye una frase: Gaudí na praça", T.atribuye, [
    K(T.atribuye, [-5.8, 2.2, 13.6], [-7.5, 1.5, 9.2], 48, 1), K(T.cliente - 0.35, [-8.4, 2.4, 13.0], [-7.5, 1.6, 9.2], 48, -0.5), ...hold(C5, [-8.8, 2.4, 12.9], [-7.5, 1.5, 9.2], 48, 0)]),
  shot("«el cliente era Dios»: de baixo, as torres e os raios", C5, [
    K(C5, [-4.5, 1.3, 17], [0, 14, 4], 62, -3), K(T.dios, [0.5, 1.5, 16.2], [0, 20, 2], 62, 1.5), K(T.p3 - 0.05, [3.5, 1.8, 15.4], [0, 23, 1], 62, 3)]),
  shot("julio de 1936: a mesa das maquetas, janelas esquentando", T.p3, [
    K(T.p3, at(TW, [-3, 3.8, 8.5]), at(TW, [0, 2.4, -0.5]), 54, 1.5), K(T.guerra - 0.05, at(TW, [-2.4, 3.4, 8.0]), at(TW, [0, 2.2, -0.5]), 54, 0)]),
  shot("a guerra: a mesa treme, janelas laranja, o fogo chega", T.guerra, [
    K(T.guerra, at(TW, [4.6, 2.6, 5.6]), at(TW, [-0.4, 2.0, -1.2]), 54, -1.5), K(T.queman, at(TW, [-2.2, 4.4, 9.6]), at(TW, [0, 3.4, -1]), 56, -0.5), K(T.rompen - 0.05, at(TW, [-1.6, 4.6, 10.4]), at(TW, [0, 3.6, -1]), 56, 0)]),
  shot("as maquetas quebram ✖ (de perto)", T.rompen, [
    K(T.rompen, at(TW, [3.2, 2.2, 4.6]), at(TW, [0.8, 1.2, 0.4]), 50, -1.5), K(T.b3 - 0.05, at(TW, [2.6, 2.4, 5.0]), at(TW, [0.6, 0.9, 1]), 50, 0)]),
  shot("«¿cómo sigues sin los planos?»: os pedaços no chão (de cima)", T.b3, [
    K(T.b3, at(TW, [0.5, 7.5, 6.5]), at(TW, [0, 0.4, 1.6]), 52, 1), K(T.c3 - 0.05, at(TW, [-0.5, 7.0, 6.8]), at(TW, [0, 0.4, 1.6]), 52, 0)]),
  shot("«con ingenio»: juntam os pedaços, um a um", T.c3, [
    K(T.c3, at(TW, [-4.5, 2.6, 6.2]), at(TW, [-1, 1.2, 0.8]), 52, -1.5), K(T.fotos - 0.05, at(TW, [-2.4, 2.4, 6.6]), at(TW, [0.5, 1.3, 0.5]), 52, 0)]),
  shot("e fotos velhas (flash): as maquetas de novo", T.fotos, [
    K(T.fotos, at(TW, [6.4, 2.4, 4.6]), at(TW, [3.4, 1.8, 0.2]), 50, 1.5), K(T.armar, at(TW, [5.0, 2.8, 6.0]), at(TW, [1.4, 1.6, 0]), 54, -0.5), K(T.formas - 0.05, at(TW, [2.4, 2.8, 6.6]), at(TW, [0, 1.6, 0]), 54, 0)]),
  shot("formas tão difíceis: a basílica cresce de 1939 a hoje", T.formas, [
    K(T.formas, [26, 18, 38], [3, 9, 0], 56, -1.5), ...hold(C6, [24, 19, 40], [3, 10, 0], 56, 0)]),
  shot("computador: tela de código e a árvore em arame cresce", C6, [
    K(C6, at(CM, [1.6, 2.7, 4.6]), at(CM, [0.2, 1.7, 0]), 50, 1.5), K(T.compus - 0.05, at(CM, [0.9, 2.9, 5.2]), at(CM, [0.5, 2.0, 0]), 52, 0)]),
  shot("programas de avião: de lado, o aviãozinho cruza", T.compus, [
    K(T.compus, at(CM, [4.6, 2.2, 3.4]), at(CM, [0.7, 2.0, 0.2]), 54, -1.5), K(T.aviones, at(CM, [3.0, 2.8, 4.6]), at(CM, [0.4, 2.6, 1.2]), 56, 0.5), K(T.maquinas2 - 0.05, at(CM, [0.5, 3.2, 6.6]), at(CM, [0.6, 2.8, 0.6]), 56, 0)]),
  shot("a máquina que corta a pedra", T.maquinas2, [
    K(T.maquinas2, at(CNC, [3.6, 2.8, 4.2]), at(CNC, [0, 1.4, 0]), 50, -1.5), K(T.giro - 0.05, at(CNC, [2.4, 3.0, 4.8]), at(CNC, [0, 1.4, 0]), 50, 0)]),
  shot("o giro: a torre de Jesus sem a cruz, o guindaste com ela", T.giro, [
    K(T.giro, [17, 31, 30], [2, 27, 0], 56, -8), K(T.m2026, [14, 32, 26], [1, 29, 0], 54, 0), ...hold(C7, [13, 32.5, 24], [1, 30, 0], 54, 0)]),
  shot("pusieron la cruz: ela desce e encaixa (de perto)", C7, [
    K(C7, [6.5, 34.5, 9.5], [0, 33, 0], 52, 1.5), K(T.jesus, [5.5, 33.5, 10.5], [0, 32.5, 0], 54, -0.5), K(T.metros - 0.05, [11, 37, 19], [0, 31.5, 0], 54, 0.4)]),
  shot("172,5 metros: a régua sobe do chão ao topo", T.metros, [
    K(T.metros, [-30, 6, 30], [-6, 6, 2], 58, -1.5), K(T.metros + 1.6, [-30, 22, 32], [-4, 24, 0], 60, 0.5), K(T.hoy - 0.05, [-31, 24, 33], [-3, 24, 0], 60, 0)]),
  shot("a igreja mais alta do mundo, sobre o Eixample", T.hoy, [
    K(T.hoy, [44, 34, 66], [0, 16, 0], 56, 1.5), K(T.inauguraron - 0.05, [36, 38, 70], [0, 17, 0], 56, 0)]),
  shot("a inauguração em junho: multidão, fogos e a estátua de Gaudí", T.inauguraron, [
    K(T.inauguraron, [3, 4.5, 30], [0, 10.5, 8], 66, -1.5), K(T.cien, [5, 5.5, 30], [2, 11, 8], 66, 0.5), K(T.manda - 0.05, [7, 6, 30.5], [3, 12, 8], 64, 0)]),
  shot("final: a basílica inteira, ainda com guindastes", T.manda, [
    K(T.manda, [0, 22, 42], [0, 15, 0], 58, -1), K(T.end, [12, 36, 66], [0, 15, 0], 56, 0)]),
];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, scale: 1.05, ...o });
const G0: V3 = [-3, 0.1, 6];
const WORKER: [number, WorkerState][] = [
  [0, S(G0, 0, "present", { scale: 0 })],
  [T.antoni, S(G0, 0.4, "present")],
  [T.toma + 0.3, S(G0, 0.6, "read", { prop: "scroll" })],
  [T.nohay, S(at(NP, [0.2, 0.1, -1.7]), 0, "point")],
  [T.maquinas - 0.1, S(at(NP, [0.2, 0.1, -1.7]), 0.2, "alarm")],
  [T.papel, S(at(NP, [0.2, 0.1, -1.7]), 0, "point")],
  [T.cuerdas0, S(at(NP, [0.2, 0.1, -1.7]), -0.3, "pull")],
  [T.piedra0 + 0.2, S(at(NP, [1.4, 0.1, -0.6]), -0.5, "chisel", { prop: "hammer" })],
  [T.quiere, S(at(CD, [-1.2, 0.1, -1.6]), 0.3, "point")],
  [T.casi + 0.3, S(at(CD, [-1.2, 0.1, -1.6]), 0.1, "alarm")],
  [T.b1, S(at(CD, [-1.8, 0.1, -1.6]), 0, "think")],
  [T.c1, S(at(GU, [0, 0.4, -2.6]), 0, "cheer")],
  [T.otra, S(at(GU, [0, 0.4, -2.6]), 0, "point")],
  [T.cuelga, S(at(GU, [0, 0.4, -2.6]), 0, "pull")],
  [T.vuelta, S(at(GU, [0, 0.4, -2.6]), 0, "cheer")],
  [T.apretando, S(at(GU, [-1.5, 0.4, -2.6]), 0.2, "point")],
  [T.p2, S(at(DB, [-1.6, 0.1, -1.4]), 0.3, "alarm")],
  [T.limosnas, S(at(DB, [-1.6, 0.1, -1.4]), 0.3, "present")],
  [T.sabe, S([-7.5, 0.1, 9.5], 0.2, "read", { prop: "scroll" })],
  [T.b2, S(at(TW, [-1.2, 0.1, -1.3]), 0, "present")],
  [T.otros, S(at(TW, [-1.2, 0.1, -1.3]), 0.5, "point")],
  [T.atribuye, S([-7.5, 0.1, 9.2], 0.3, "present")],
  [T.prisa, S([-7.5, 0.1, 9.2], 0.1, "read")],
  [T.p3 - 0.05, S([-7.5, 0.1, 9.2], 0.1, "read", { scale: 0 })],
];

const hud: HudData = {
  pills: [
    { a: T.c144, b: T.todavia - 0.1, label: "EN OBRAS", value: (t) => `${count(t, T.c144, T.c144 + 0.9, 0, 144)} AÑOS`, y: 440, tone: "gold" },
    { a: T.todavia, b: T.porque - 0.1, label: "TERMINADA", value: () => "TODAVÍA NO", y: 440, tone: "red" },
    { a: T.porque, b: T.barcelona - 0.1, label: "TORRES", value: () => "14 DE 18", y: 440, tone: "gold" },
    { a: T.mil883, b: T.treinta - 0.1, label: "BARCELONA", value: (t) => `${Math.round(yearAt(t))}`, y: 440, tone: "gold" },
    { a: T.treinta, b: T.nohay - 0.1, label: "GAUDÍ", value: () => "31 AÑOS", y: 440 },
    { a: T.nohay, b: T.papel - 0.1, label: "COMPUTADORAS", value: () => "0", y: 440, tone: "red" },
    { a: T.quiere, b: T.b1 - 0.1, label: "COLUMNAS", value: () => "INCLINADAS", y: 440, tone: "gold" },
    { a: T.prueba, b: T.cuelga - 0.1, label: "PRIMERO, OTRA IGLESIA", value: () => "COLONIA GÜELL", y: 440, tone: "gold" },
    { a: T.cada, b: T.vuelta - 0.1, label: "CADA CUERDA", value: () => "LA CURVA DEL PESO", y: 440, tone: "green" },
    { a: T.sostiene, b: T.p2 - 0.1, label: "LA PIEDRA", value: () => "SOLO APRIETA", y: 440, tone: "green" },
    { a: T.limosnas, b: T.sabe - 0.1, label: "SE PAGA CON", value: () => "LIMOSNAS", y: 440, tone: "gold" },
    { a: T.sabe, b: C4 - 0.05, label: "AÑO", value: (t) => `${Math.round(yearAt(t))}`, y: 440, tone: "gold" },
    { a: C4, b: T.b2 - 0.05, label: "AL MORIR GAUDÍ", value: () => "≈ 1/4 HECHA", y: 440, tone: "red" },
    { a: T.cadaParte, b: T.otros - 0.1, label: "MAQUETAS", value: () => "DE YESO", y: 440, tone: "green" },
    { a: T.atribuye, b: C5 - 0.05, label: "SE LE ATRIBUYE", value: () => "«MI CLIENTE NO TIENE PRISA»", y: 440 },
    { a: T.p3, b: T.queman - 0.1, label: "JULIO", value: () => "1936", y: 440, tone: "red" },
    { a: T.queman, b: T.b3 - 0.1, label: "TALLER", value: () => "EN LLAMAS", y: 440, tone: "red" },
    { a: T.juntan, b: T.fotos - 0.1, label: "PEDAZOS", value: () => "UNO A UNO", y: 440, tone: "green" },
    { a: T.fotos, b: T.formas - 0.1, label: "Y", value: () => "FOTOS VIEJAS", y: 440, tone: "gold" },
    { a: T.formas, b: C6 - 0.05, label: "AÑO", value: (t) => `${Math.round(yearAt(t))}`, y: 440, tone: "gold" },
    { a: T.desde, b: T.maquinas2 - 0.1, label: "DESDE", value: () => "FINES DE LOS 80", y: 440, tone: "gold" },
    { a: T.cortan, b: T.giro - 0.1, label: "LA PIEDRA", value: () => "CORTADA A MÁQUINA", y: 440 },
    { a: T.m2026, b: T.metros - 0.1, label: "LA CRUZ", value: () => "FEBRERO 2026", y: 440, tone: "gold" },
    { a: T.metros, b: T.hoy - 0.1, label: "TORRE DE JESUCRISTO", value: (t) => `${count(t, T.metros, T.metros + 1.5, 0, 172.5, 1)} m`, y: 440, tone: "gold" },
    { a: T.hoy, b: T.inauguraron - 0.1, label: "LA IGLESIA", value: () => "MÁS ALTA DEL MUNDO", y: 440, tone: "green" },
    { a: T.junio, b: T.manda - 0.1, label: "10 DE JUNIO", value: () => "1926 → 2026", y: 440, tone: "gold" },
  ],
  titles: [{ a: T.vuelta + 0.15, text: "¡AL REVÉS!", len: 1.2 }, { a: T.hace, text: "MAQUETAS" }, { a: T.giro, text: "¡EL GIRO!", len: 1.1 }],
  alerts: [T.casi, T.p2, T.p3],
  rewinds: [T.b1, T.b2, T.b3],
  crosses: [[T.casi + 0.5, T.b1 - 0.1], [T.rompen + 0.2, T.b3 - 0.1]],
  stamps: [[T.b1, T.c1, "SIN COMPUTADORAS"], [T.b3, T.c3, "SIN PLANOS"]],
  reward: { a: T.manda, len: T.end - T.manda, top: "EN OBRAS DESDE 1882", big: (t) => count(t, T.manda, T.manda + 1, 0, 144), sub: "AÑOS… Y SIGUE" },
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: GAUDI, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#ffe9c6", fog: "#fff2dc", fogNear: 140, fogFar: 560, hemiSky: "#fff6e4", hemiGround: "#d6c49a", hemiI: 1.25, sun: "#fff0d0", sunI: 2.6 },
};
