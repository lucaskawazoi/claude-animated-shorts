// E20 — Los Arcos de Querétaro (ecos-del-tiempo, Shorts). Câmera, o marquês, painel e luz deste episódio.
// Ritmo («Sim 66»): 3 aberturas (PROPS open a|b|c), corte duro a cada ~2 s (7 da régua + extras), algo sempre se mexendo,
// ✖ em cada tentativa que falha (a bomba que não há, o pântano, o canal enterrado que se suja, os cântaros vazios, a Cruz sem água).
// O personagem é o marquês Juan Antonio de Urrutia (casaca verde, peruca branca, o lenço vermelho do canal).
import React from "react";
import { getInputProps } from "remotion";
import { CamState, K, Key, Shot, keyed } from "../../toy/cam";
import { WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { FONT, HudData, pop, win } from "../../toy/hud";
import { V3 } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import type { Costume } from "../../toy/worker";
import { C1, C2, C3, C4, C5, C6, C7, SFX, T } from "./cues";
import { AL, CARRY, CS, F1, FZ, GX1, H, HS, LEG, OB, SCR, SICK, WLC, World, ZG, gH, rideX } from "./world";
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
 *  quase parado, plano aberto com o balanço inteiro. (O steady() do torre tirava o balanço do plano aberto e deixava no fechado:
 *  o sinal ficou invertido em relação ao comentário dele.) */
const steady = (c: CamState, t: number): CamState => {
  const dist = Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]);
  const d = dynAt(t) * Math.min(1, dist / 18); // ponytail: balanço ∝ distância (ângulo constante); plano fechado quase parado, plano aberto balança
  return { ...c, pos: [c.pos[0] - d * 0.7 * Math.sin(t * 0.9 + 9), c.pos[1] - d * 0.2 * Math.sin(t * 1.3 + 4), c.pos[2]], look: [c.look[0] - d * 0.3 * Math.sin(t * 1.1 + 3), c.look[1], c.look[2]] };
};
const shot = (name: string, t0: number, keys: Key[]): Shot => ({ name, t0, keys, fn: (t) => steady(keyed(keys, t), t) });
const hold = (c: number, pos: V3, look: V3, fov = 54, roll = 0) => [K(c - 0.42, pos, look, fov, roll), K(c - 0.02, pos, look, fov, roll)];
const at = (o: V3, d: V3): V3 => [o[0] + d[0], o[1] + d[1], o[2] + d[2]];
const A0 = AL[0];

const OPEN_KEYS: Record<Open, Key[]> = {
  // a) (PADRÃO) colado na água que corre no alto dos arcos, recua até a arcaria inteira e o morro da Cruz
  a: [K(0, [40, H + 3.2, 0.4], [52, H + 0.4, 0], 50, 1.2), K(2.3, [99, H + 2.6, 0.4], [113, H - 0.4, 0], 52, 0), K(2.7, [103, H + 3.2, 1.5], [113.5, H - 0.6, 0], 52, -0.6), K(T.sin0 - 0.05, [100, H + 7, 14], [114, H - 1, 0], 54, 0)],
  // b) do chão do vale, olhando para cima por um arco alto
  b: [K(0, [1.5, 0.9, 5], [0, 8.5, 0], 64, 0.8), K(1.4, [6, 3, 14], [12, 8, 0], 60, -0.4), K(T.sin0 - 0.05, [40, H + 8, 32], [104, H, -2], 56, 0)],
  // c) do alto, mergulhando ao longo da arcaria até a cidade no morro
  c: [K(0, [-120, 60, 90], [0, 0, 0], 50, 1), K(1.4, [-40, 32, 56], [40, 6, 0], 54, -0.5), K(T.sin0 - 0.05, [36, H + 10, 36], [104, H, -2], 56, 0)],
};
const openCam = (t: number) => steady(keyed(OPEN_KEYS[openOf()], t), t);
const MQ: V3 = [116, HS, 3.4]; // o marquês no cume, à direita da caixa (fora da linha câmera → caixa)

const SHOTS: Shot[] = [
  { name: "abertura a|b|c: a água no alto dos arcos, a cidade no morro", t0: 0, keys: OPEN_KEYS.a, fn: openCam },
  shot("«sin una sola bomba de agua»: a bomba de brinquedo pula e leva ✖", T.sin0, [
    K(T.sin0, [99, H + 3.2, 12], [109, H + 0.6, 1.5], 56, -1.5), K(T.llevan - 0.05, [101, H + 2.6, 11], [108, H + 1.0, 2], 54, 0)]),
  shot("«casi trescientos años en pie»: de baixo, os arcos altos e os pássaros", T.llevan, [
    K(T.llevan, [9, 1.1, 15], [0, 7, 0], 62, 1.5), K(T.queretaro - 0.05, [-7, 1.6, 14], [0, 7.5, 0], 62, 0)]),
  shot("⏪ Querétaro, 1726: os arcos somem de trás para a frente", T.queretaro, [
    K(T.queretaro, [30, 34, 86], [25, 4, 0], 52, -1.5), K(C1 - 0.4, [6, 20, 62], [14, 2, 0], 52, 0), K(C1 - 0.02, [5, 19.5, 61], [14, 2, 0], 52, 0)]),
  shot("«cuenta la leyenda»: o convento das Capuchinas, a monja na janela", C1, [
    K(C1, at(LEG, [7, 3.4, 11]), at(LEG, [0.6, 2.5, 0]), 54, 1.5), K(T.marques0 - 0.05, at(LEG, [5.5, 3.0, 9]), at(LEG, [0.8, 2.5, 0]), 52, 0)]),
  shot("«un marqués… por amor a una monja»: corações", T.marques0, [
    K(T.marques0, at(LEG, [4.6, 2.6, 7.4]), at(LEG, [1.4, 2.6, 0.8]), 50, -1.5), K(T.papeles - 0.05, at(LEG, [3.8, 3.0, 7.8]), at(LEG, [1.6, 3.0, 1.0]), 52, 0)]),
  shot("«los papeles»: o rolo abre, o coração racha", T.papeles, [
    K(T.papeles, at(SCR, [1.2, 3.3, 3.4]), at(SCR, [0.1, 1.35, -0.2]), 50, 1.5), K(T.rio - 0.05, at(SCR, [0.6, 3.6, 3.2]), at(SCR, [0.2, 1.45, -0.2]), 52, 0)]),
  shot("«el río está sucio… talleres de lana… la gente enferma»", T.rio, [
    K(T.rio, at(OB, [2, 5.5, 19]), at(OB, [0, 1.0, 2]), 56, -1.5), K(T.gente - 0.05, at(OB, [9, 4.2, 16]), at(OB, [8, 1.2, 2]), 56, 0.5),
    K(T.hay - 0.05, at(SICK, [2, 2.2, 6.5]), at(SICK, [0.4, 1.4, 0]), 54, 0)]),
  shot("«traer agua limpia de lejos»: a rota pontilhada", T.hay, [
    K(T.hay, [-218, 40, 24], [0, 0, -4], 52, 1.5), ...hold(C2, [-212, 37, 22], [10, 0, -4], 52, 0)]),
  shot("«sin motores»: na nascente, a bomba leva ✖", C2, [
    K(C2, [A0 - 13, H + 6, 22], [A0 + 5, H, 1], 56, -1.5), K(T.p1 - 0.05, [A0 - 10, H + 5, 21], [A0 + 6, H, 1], 56, 0)]),
  shot("«el mejor manantial da poca agua»: o fio que escapa", T.p1, [
    K(T.p1, [A0 + 10, H + 4.5, 15], [A0 + 2.5, H, 2], 56, 1.5), K(T.estancada - 0.05, [A0 + 8.6, H + 3.6, 13], [A0 + 2.6, H, 2.2], 56, 0)]),
  shot("«y estancada: es un pantano» ✖", T.estancada, [
    K(T.estancada, [A0 - 3.5, H + 2.4, 9.5], [A0, H - 0.2, 1.8], 54, -1.5), K(T.b1 - 0.05, [A0 - 1.5, H + 2.0, 9], [A0 + 0.5, H - 0.2, 2], 54, 0)]),
  shot("«¿cómo sacas agua limpia…?»: o marquês pensando na beira", T.b1, [
    K(T.b1, [A0 + 10.5, H + 2.6, 12], [A0 + 6.2, H + 2.6, 5.2], 52, 1.5), K(T.c1 - 0.05, [A0 + 10, H + 2.5, 11.5], [A0 + 6.2, H + 2.6, 5.2], 52, 0)]),
  shot("«con ingenio: cavan en el fondo»: o corte do pântano", T.c1, [
    K(T.c1, [A0 + 1.5, H + 7, 22], [A0, H - 1.5, 1], 56, -1.5), K(T.cavan, [A0 + 1, H + 5.5, 19], [A0, H + 0.3, 1], 56, 0.5),
    ...hold(C3, [A0 - 1.5, H + 2.6, 17], [A0, H - 0.6, 0], 56, 0)]), // céu no alto antes do corte: o C3 (de cima, sem céu) precisa mudar a imagem
  shot("«dieciocho manantiales pequeños»: o fundo de perto", C3, [
    K(C3, [A0 + 0.5, H + 12, 8.4], [A0, 4.25, -0.6], 54, 1.5), K(T.encierran - 0.05, [A0 + 0.2, H + 11, 7.6], [A0, 4.25, -0.6], 54, 0)]),
  shot("«los encierran con muros de piedra»: os muros sobem, a água limpa enche", T.encierran, [
    K(T.encierran, [A0 + 7, H + 5.5, 13], [A0 + 0.8, H - 1.5, 0], 56, -1.5), K(T.ahora - 0.05, [A0 + 5, H + 6, 13.5], [A0 + 0.8, H - 1, 0], 56, 0)]),
  shot("«brota unas cuatro veces más agua»: o canal enche", T.ahora, [
    K(T.ahora, [A0 + 15, H + 3.6, 7.5], [A0 + 7, H + 0.4, 0], 54, 1.5), K(T.alberca - 0.05, [A0 + 16, H + 3.2, 6], [A0 + 9, H + 0.4, 0], 54, 0)]),
  shot("«esta es la alberca»: em volta, de cima", T.alberca, [
    K(T.alberca, [A0 - 7, H + 8, 15], [A0, H, 2.5], 54, -1.5), K(T.p2 - 0.05, [A0 + 5, H + 8.5, 15.5], [A0 + 1, H, 2.5], 54, 0)]),
  shot("«un valle con otro pantano al fondo»: da beira do planalto", T.p2, [
    K(T.p2, [-62, H + 2.5, 22], [0, -2, 4], 52, 1.5), K(T.otro - 0.05, [-7.6, 2.5, 17.1], [4, 0.2, 3], 54, 0)]),
  shot("«otro pantano»: o lodo borbulha, moscas", T.otro, [
    K(T.otro, [-7, 2.4, 17], [4, 0.2, 3], 54, -1.5), K(T.enterrado0 - 0.05, [1.8, 1.1, 11], [5, 0.0, 2], 54, 0)]),
  shot("«un canal enterrado podía ensuciarse» ✖: o corte do vale", T.enterrado0, [
    K(T.enterrado0, [3.5, -0.4, FZ + 10.5], [0, -1.8, FZ], 56, 1.5), K(T.b2 - 0.05, [1.5, -0.9, FZ + 9.5], [-0.5, -1.7, FZ], 54, 0)]),
  shot("«¿cómo cruzas sin tocar el lodo?»: o marquês na beira do vale", T.b2, [
    K(T.b2, [-28.5, 2.4, 17], [-24, 2.6, 9], 52, -1.5), ...hold(C4, [-28, 2.3, 16.6], [-24, 2.6, 9], 52, 0)]),
  shot("«…sin tocar el lodo? Con ingenio»: o canal deitado no lodo, de longe", C4, [
    K(C4, [-62, 17, 44], [18, 3, -4], 54, 1.5), K(T.encima - 0.05, [-60, 16, 44], [20, 4, -4], 54, 0)]),
  shot("«por encima»: de perto, o canal sai do lodo e sobe (a câmera acompanha)", T.encima, [
    K(T.encima, [-4, 1.6, 13], [6, 2.4, 0], 60, -1.5), K(T.setenta - 0.05, [-3, 2.2, 12.5], [6, 6.2, 0], 60, 0)]),
  shot("«setenta y cuatro arcos»: a onda de arcos sai do chão", T.setenta, [
    K(T.setenta, [-46, 13, 40], [24, 4.5, -2], 54, -1.5), K(T.altos - 0.05, [-40, 12, 42], [30, 4.5, -2], 54, 0)]),
  shot("«los más altos de más de veinte metros»: a régua no pilar do meio", T.altos, [
    K(T.altos, [5.5, 0.8, 11], [0, 6.5, 0], 62, 1.5), K(T.cimientos - 0.05, [4.5, 1.0, 12], [0, 7, 0], 62, 0)]),
  shot("«cimientos hasta el suelo firme»: o corte, as sapatas descem; sobe pelo pilar", T.cimientos, [
    K(T.cimientos, [-2, 2.5, FZ + 11.2], [0, -3.8, FZ], 56, -1.5), K(T.arriba, [-0.5, 2.0, FZ + 10.8], [0, -3.2, FZ], 56, 0),
    K(T.arriba + 0.5, [1.5, 3.5, FZ + 8], [0, 6, 0], 58, 0), ...hold(C5, [2.5, H + 2.8, 9], [6, H + 0.8, 0], 58, 0)]),
  { name: "«arriba, el canal cruza más de un kilómetro casi plano»: em cima da água, o nível", t0: C5, keys: [],
    fn: (t) => steady({ pos: [rideX(t), H + 1.7, 0], look: [rideX(t) + 10, H + 0.55, 0], fov: 60, roll: 0 }, t) },
  shot("«estos son los arcos»", T.estosArcos, [
    K(T.estosArcos, [50, 12, 46], [-4, 6, 0], 52, -1.5), K(T.p3 - 0.05, [30, 18, 58], [-16, 6, 0], 52, 0)]),
  shot("«toda el agua llega a un solo punto»: o fim do canal no cume", T.p3, [
    K(T.p3, [110.5, H + 3.6, 5], [113.2, H - 0.2, 0], 50, 1.5), K(T.alto2 - 0.05, [88, 8, 46], [114, 9, 2], 54, 0)]),
  shot("«en lo más alto»: embaixo, os cântaros vazios ✖", T.alto2, [
    K(T.alto2, at(F1, [3.5, 3.2, 8.5]), at(F1, [-0.5, 1.8, 0]), 54, -1.5), K(T.b3 - 0.05, at(F1, [2, 3.0, 8]), at(F1, [-0.5, 2.2, -1]), 54, 0)]),
  shot("«¿cómo la repartes a toda la ciudad?»: o marquês no cume", T.b3, [
    K(T.b3, [112, H + 1.8, 10.5], at(MQ, [0, 2.6, 0]), 52, 1.5), K(T.c3 - 0.05, [106, H + 5.5, 20], at(MQ, [0, 1.6, 0]), 54, 0)]),
  shot("«una caja de agua en la cima»: a caixa sobe e enche", T.c3, [
    K(T.c3, [106, H + 4.2, 8.5], [113, H + 0.2, 0], 54, -1.5), K(T.tubos - 0.05, [107, H + 4.6, 9], [113, H + 0.4, 0], 54, 0)]),
  shot("«tubos de barro cuesta abajo»: a vala, os tubos e a água neles", T.tubos, [
    K(T.tubos, [109, H + 7, -3], [121, 3.5, 18], 56, 1.5), K(T.fuentes - 0.05, [110, H + 6, -1], [123, 2.5, 21], 56, 0)]),
  shot("«en las fuentes, el agua brota hacia arriba»", T.fuentes, [
    K(T.fuentes, at(F1, [-1.8, 2.6, 6.2]), at(F1, [0, 1.6, 0]), 54, -1.5), K(T.nunca - 0.05, at(F1, [-1.2, 2.9, 6.8]), at(F1, [0, 2.1, 0]), 54, 0)]),
  shot("«pero nunca más alto que la caja»: a linha da caixa e o jato que para nela", T.nunca, [
    K(T.nunca, [124, 7.5, 42], [118, 6.5, 10], 58, 1.5), ...hold(C6, [123.6, 7.7, 41.4], [118, 6.6, 10], 58, 0)]),
  shot("«…que la caja. Esta es la caja de agua»: de perto e abrindo", C6, [
    K(C6, [107.8, H + 2.8, 6.2], [113.5, H + 0.8, 0], 50, -1.5), K(C6 + 0.3, [107.4, H + 3.0, 6.8], [113.5, H + 0.8, 0], 50, 0), K(C6 + 0.9, [80, 11, 31.8], [118.5, 8.2, 10.6], 60, 0), K(T.giro - 0.05, [83.6, 10.8, 30], [118.5, 8.2, 10.6], 60, 0)]), // de lado, perpendicular à linha caixa→fonte: a linha fica reta // de lado, na altura do cume: a caixa lá em cima, a cidade embaixo
  shot("«y aquí viene el giro»: chicote para o vale", T.giro, [
    K(T.giro, [100, H + 9, 30], [115, H - 1, 6], 54, -8), K(T.giro + 0.5, [66, 15, 56], [40, 4, 10], 56, 6), K(T.primer - 0.05, [30, 12, 64], [5, 3, 10], 54, 0)]),
  shot("«el primer plan era más barato»: os arcos reais afundam, o fantasma sobe", T.primer, [
    K(T.primer, [12, 7.5, 48], [2, 2.6, 12], 54, 1.5), K(T.arcos8 - 0.05, [6, 7, 47], [0, 2.6, 12], 54, 0)]),
  shot("«arcos de ocho metros… veinte mil pesos»: a régua do fantasma", T.arcos8, [
    K(T.arcos8, [4.6, 1.5, 26.6], [0.6, 1.1, ZG], 54, -1.5), K(T.ocho + 0.35, [4.4, 2.9, 26.4], [0.7, 2.6, ZG], 54, 0),
    K(T.veintemil - 0.1, [4.3, 2.6, 26.6], [0.9, 2.0, ZG], 54, 0), ...hold(C7, [3.8, 2.8, 26], [0.8, 2.0, ZG], 54, 0)]),
  shot("«pero dejaba sin agua la cima»: a água do fantasma para na encosta", C7, [
    K(C7, [84, 6.5, 32], [GX1 + 1, 4.0, ZG], 54, 1.5), K(T.sinagua + 0.25, [86, 7, 33], [GX1 + 2, 4.5, ZG - 2], 54, 0), K(T.convento - 0.05, [88, 9, 34], [116, HS + 2, -2], 54, 0)]),
  shot("«donde estaba el convento de la Cruz» ✖", T.convento, [
    K(T.convento, [110, H + 3.5, 13], [120.1, HS + 2.2, 0.6], 58, -1.5), K(T.asi - 0.05, [111, H + 3.8, 13.5], [120.4, HS + 2.4, 0.4], 58, 0)]),
  shot("«así que los hicieron casi tres veces más altos»", T.asi, [
    K(T.asi, [74, 1.3, 21], [77.5, 3.0, 0], 60, 1.5), K(T.tres + 0.4, [74.3, 1.5, 21], [78, 5.0, 0], 60, 0), K(T.obra - 0.05, [76, 8, 22], [119.5, HS + 3, -3.4], 58, 0)]),
  shot("«costando más de seis veces lo planeado»: as pilhas de moedas", T.obra, [
    K(T.obra, at(CS, [-10, 5.2, 9]), at(CS, [-1, 1.0, -0.4]), 58, -1.5), K(T.pago - 0.05, at(CS, [-9.2, 5.6, 9.6]), at(CS, [-0.8, 1.1, -0.4]), 58, 0)]),
  shot("«el marqués pagó dos terceras partes»", T.pago, [
    K(T.pago, at(CS, [-0.9, 23, 0.6]), at(CS, [-0.9, 0, -0.8]), 50, 0), K(T.manda - 0.05, at(CS, [-0.9, 22, 0.5]), at(CS, [-0.9, 0, -0.8]), 50, 0)]),
  shot("final: a arcaria com a água correndo", T.manda, [
    K(T.manda, [22, H + 8, 20], [-8, H - 1.5, 0], 54, -1), K(T.end, [28, H + 9.5, 26], [-12, H - 1.5, 0], 54, 0)]),
];

export const MARQ: Costume = { skin: "#e8b48c", top: "#2f5a3a", bottom: "#ece2c8", kilt: "#2f5a3a", kiltLen: 0.55, hat: "cap", hatC: "#f2efe8", boot: "#1a1a1a", belt: "#d4a64a", sleeves: true };
const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, scale: 1.2, ...o });
const fix = (p: V3): Partial<WorkerState> => ({ follow: () => p }); // salta para o lugar (não atravessa cortes nem buracos)
const yawTo = (a: V3, b: V3) => Math.atan2(b[0] - a[0], b[2] - a[2]);
const W_LEG = at(LEG, [2.6, 0, 2.2]), Y_LEG = yawTo(W_LEG, at(LEG, [0.6, 0, 0]));
const W_SC = at(SCR, [0.2, 0, -2.3]), W_RIO = at(OB, [8.8, 0, 2.6]), W_SICK = at(SICK, [3.6, 0, 1.6]);
const W_SW: V3 = [A0 + 7.5, H, 2.2], W_B1: V3 = [A0 + 6.4, H, 5.2], W_OUT: V3 = [A0 + 8.5, H, -1.4];
const W_P2: V3 = [-70.2, gH(-70.2, 22.8), 22.8], W_V1: V3 = [-19, 0, 6], W_V2: V3 = [-24, 0, 9], W_PIER: V3 = [2.4, 0, 1.9], W_V3: V3 = [-19, 0, 5];
const W_F1: V3 = [F1[0] + 1.5, gH(F1[0] + 1.5, F1[2] - 0.2), F1[2] - 0.2], W_F1N: V3 = [F1[0] + 4.6, gH(F1[0] + 4.6, F1[2] + 1.6), F1[2] + 1.6], W_C6: V3 = [116.2, HS, -1.6], W_G: V3 = [14, 0, 23], W_G8: V3 = [-2.4, 0, 20.6];
const W_CONV: V3 = [124.6, gH(124.6, 0.8), 0.8], W_CS = at(CS, [-1.5, 0, -2.4]), W_END: V3 = [10, 0, 8];
const WORKER: [number, WorkerState][] = [
  [0, S(W_LEG, Y_LEG, "present", { scale: 0 })],
  [C1, S(W_LEG, Y_LEG, "present")],
  [T.amor, S(W_LEG, Y_LEG, "cheer")],
  [T.papeles, S(W_SC, 0, "read", fix(W_SC))],
  [T.rio, S(W_RIO, -1.9, "point", fix(W_RIO))],
  [T.sucio, S(W_RIO, -1.9, "alarm")],
  [T.gente, S(W_SICK, -1.2, "alarm", fix(W_SICK))],
  [T.hay, S(W_SW, -2.2, "present", fix(W_SW))],
  [C2, S(W_SW, -2.2, "point")],
  [T.estancada, S(W_SW, -2.2, "alarm")],
  [T.b1, S(W_B1, 0.25, "think", fix(W_B1))],
  [T.c1, S(CARRY, 0, "cheer", fix(CARRY))],
  [T.cavan, S(CARRY, 0, "point")],
  [T.d18, S(CARRY, 0, "cheer")],
  [T.encierran, S(CARRY, 0, "present")],
  [T.ahora, S(W_OUT, 1.1, "point", fix(W_OUT))],
  [T.alberca, S(W_OUT, 0.5, "cheer")],
  [T.p2, S(W_P2, 1.3, "point", fix(W_P2))],
  [T.otro, S(W_P2, 1.3, "alarm")],
  [T.enterrado0, S(W_V1, 1.2, "point", fix(W_V1))],
  [T.b2, S(W_V2, 0.6, "think", fix(W_V2))],
  [T.c2, S(W_V2, 0.6, "cheer")],
  [T.setenta, S(W_V2, 1.0, "point")],
  [T.altos, S(W_PIER, -0.6, "present", fix(W_PIER))],
  [T.cimientos, S(W_V3, 1.0, "point", fix(W_V3))],
  [T.estosArcos, S([-6, 0, 16], 0.3, "cheer", fix([-6, 0, 16]))],
  [T.p3, S(MQ, -0.9, "point", fix(MQ))],
  [T.b3, S(MQ, -0.6, "think")],
  [T.c3, S(MQ, -0.6, "cheer")],
  [T.tubos, S([111, HS, -4.5], 0.9, "point", fix([111, HS, -4.5]))],
  [T.fuentes, S(W_F1, -0.9, "present", fix(W_F1))],
  [T.brota2, S(W_F1, -0.9, "cheer")],
  [T.nunca, S(W_F1N, -1.6, "point", fix(W_F1N))],
  [C6, S(W_C6, -0.82, "present", fix(W_C6))],
  [T.giro, S(W_C6, -0.82, "cheer")],
  [T.primer, S(W_G, -0.4, "read", { prop: "scroll", ...fix(W_G) })],
  [T.arcos8, S(W_G8, 0.6, "present", fix(W_G8))],
  [C7, S(W_CONV, -0.4, "alarm", fix(W_CONV))],
  [T.convento, S(W_CONV, -0.9, "think")],
  [T.asi, S(W_G, -0.4, "cheer", fix(W_G))],
  [T.obra, S(W_CS, -0.5, "alarm", fix(W_CS))],
  [T.pago, S(W_CS, 0, "point")],
  [T.dos, S(W_CS, 0, "present")],
  [T.partes, S(W_CS, 0, "cheer")],
  [T.manda, S(W_END, 0.4, "cheer", { scale: 0, ...fix(W_END) })], // no final só a arcaria (só a cabeça dele aparecia no rodapé)
];

/** carimbo vermelho «LEYENDA» (a lenda da monja, nunca como fato) */
const Leyenda: React.FC<{ t: number }> = ({ t }) => {
  const k = win(t, T.leyenda, T.papeles - 0.08, 0.12); if (k <= 0) return null;
  const s = 1.7 - 0.7 * pop(t, T.leyenda, 0.2);
  return (
    <div style={{ position: "absolute", left: 0, width: 1080, top: 590, display: "flex", justifyContent: "center", opacity: k }}>
      <div style={{ transform: `rotate(-9deg) scale(${s})`, padding: "4px 36px 12px", border: "10px solid #d0262b", borderRadius: 22, background: "#fff4e0d0" }}>
        <span style={{ fontFamily: FONT, fontSize: 116, color: "#d0262b", letterSpacing: 6 }}>LEYENDA</span>
      </div>
    </div>
  );
};

const hud: HudData = {
  pills: [
    { a: T.bomba, b: T.llevan - 0.1, label: "BOMBAS DE AGUA", value: () => "0", tone: "red" },
    { a: T.trescientos, b: T.queretaro - 0.1, label: "EN PIE DESDE", value: () => "1735", tone: "green" },
    { a: T.mexico, b: C1 - 0.1, label: "QUERÉTARO, MÉXICO", value: () => "1726", tone: "gold" },
    { a: T.sucio, b: T.gente - 0.1, label: "EL RÍO", value: () => "SUCIO", tone: "red" },
    { a: T.gente, b: T.hay - 0.1, label: "LA GENTE", value: () => "ENFERMA", tone: "red" },
    { a: T.sinmot, b: T.p1 - 0.1, label: "MOTORES", value: () => "0", tone: "red" },
    { a: T.poca, b: T.estancada - 0.05, label: "EL MANANTIAL", value: () => "POCA AGUA", tone: "red" },
    { a: T.estancada, b: T.b1 - 0.1, label: "AGUA", value: () => "ESTANCADA", tone: "red" },
    { a: T.d18, b: T.encierran - 0.1, label: "ENCUENTRAN", value: () => "18 MANANTIALES", tone: "gold" },
    { a: T.cuatro, b: T.alberca - 0.1, label: "AGUA", value: () => "×4", tone: "green" },
    { a: T.otro, b: T.enterrado0 - 0.1, label: "EN EL VALLE", value: () => "PANTANO", tone: "red" },
    { a: T.ensuciarse, b: T.b2 - 0.1, label: "CANAL ENTERRADO", value: () => "PODÍA ENSUCIARSE", tone: "red" },
    { a: T.setenta, b: T.altos - 0.1, label: "", value: () => "74 ARCOS", tone: "gold" },
    { a: T.veinte, b: T.cimientos - 0.1, label: "LOS MÁS ALTOS", value: () => "+20 m", tone: "gold" },
    { a: T.suelo, b: T.arriba - 0.1, label: "CIMIENTOS HASTA", value: () => "SUELO FIRME", tone: "green" },
    { a: T.km, b: T.estosArcos - 0.1, label: "CASI PLANO", value: () => "+1 km", tone: "green" },
    { a: T.punto, b: T.b3 - 0.1, label: "TODA EL AGUA EN", value: () => "UN SOLO PUNTO", tone: "red" },
    { a: T.tubos, b: T.fuentes - 0.1, label: "TUBOS DE", value: () => "BARRO", tone: "gold" },
    { a: T.nunca, b: T.cajaAgua - 0.1, label: "NUNCA MÁS ALTO", value: () => "QUE LA CAJA", tone: "gold" },
    { a: T.barato, b: T.p4 - 0.1, label: "PLAN DE 1721", value: (t) => (t < T.ocho ? "MÁS BARATO" : t < T.veintemil ? "8 m" : "8 m · 20.000 PESOS"), tone: "gold" },
    { a: T.sinagua, b: T.asi - 0.1, label: "LA CIMA", value: () => "SIN AGUA", tone: "red" },
    { a: T.tres, b: T.obra - 0.1, label: "MÁS ALTOS", value: () => "CASI ×3", tone: "green" },
    { a: T.seis, b: T.pago - 0.1, label: "COSTÓ", value: () => "MÁS DE ×6", tone: "red" },
    { a: T.dos, b: T.manda - 0.1, label: "PAGÓ", value: () => "2/3 EL MARQUÉS", tone: "gold" },
  ],
  titles: [{ a: T.alberca, text: "ALBERCA" }, { a: T.estosArcos, text: "ARCOS" }, { a: T.cajaAgua, text: "CAJA DE AGUA", len: 1.5 }, { a: T.giro, text: "¡EL GIRO!", len: 1.1 }],
  alerts: [T.p1, T.p2, T.p3],
  rewinds: [T.queretaro, T.b1, T.b2, T.b3],
  crosses: [], // os ✖ são do mundo (dois juntos liam «Xx» no torre)
  stamps: [[T.b1, T.c1, "SIN AGUA LIMPIA"], [T.b2, T.c2, "SIN TOCAR EL LODO"], [T.b3, T.c3, "UN SOLO PUNTO"]],
  reward: { a: T.manda, len: T.end - T.manda, top: "74 ARCOS · 1735", big: () => "×6", sub: "SOBRE EL PRESUPUESTO" },
  Extra: Leyenda,
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: MARQ, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#ffe9c6", fog: "#fff2dc", fogNear: 170, fogFar: 620, hemiSky: "#fff6e4", hemiGround: "#d6c49a", hemiI: 1.25, sun: "#fff0d0", sunI: 2.6 },
};
export { T };
