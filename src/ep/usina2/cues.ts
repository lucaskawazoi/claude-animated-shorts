// MEP14 — cortes e efeitos (a mixagem lê este arquivo; sem React).
import { endOf } from "../../toy/cues";
import { T } from "./anchors";
import { ROWS } from "./shots";
export { T };
const q = (x: number) => Math.round(x * 30) / 30;
export const CUTS14: number[] = ROWS.slice(1).map((r) => q(r[0]));


const S: [string, number, number][] = [];
for (const c of CUTS14) S.push(["whoosh", c - 0.22, -22]);
S.push(["pop", T.comentarios + 0.1, -12], ["stamp", T.faltou - 0.05, -11], ["ding", T.parte - 0.1, -10], ["giro", T.na - 0.1, -17], ["pour", T.caldo - 0.1, -16],
  ["slide", T.limpo - 0.5, -16], ["clank", T.filtro - 0.3, -14], ["thud", T.torta - 0.22, -13], ["gravel", T.adubo + 0.9, -15],
  ["alert", T.prob1 + 0.0, -12], ["chime", T.deixa1 + 0.05, -11], ["steam", T.ferve + 0.03, -12], ["drip", endOf("vira xarope") + 0.05, -14],
  ["ding", endOf("o evaporador") + 0.05, -10], ["ding", endOf("no cozedor") + 0.05, -10], ["click", endOf("e cristaliza") - 0.2, -14],
  ["spin", T.gira + 0.0, -16], ["ding", endOf("a centrifuga") + 0.02, -10], ["drip", endOf("escorre o melaco") + 0.08, -14], ["alert", T.prob2 + 0.0, -12], ["chime", T.deixa2 + 0.05, -11],
  ["fill", T.dorna - 0.35, -16], ["bubbles", T.come - 0.1, -14], ["pop", T.levedura + 0.4, -13], ["ding", endOf("e destilaria") + 0.05, -10], ["fire", T.quem - 0.3, -16],
  ["coins", endOf("oitenta e cinco") + 0.05, -14], ["ding", endOf("sessenta e seis") + 0.1, -12], ["chime", T.cento + 0.95, -10],
  ["squelch", T.vinhaca - 0.3, -15], ["pop", endOf("dez a treze") + 0.45, -14], ["buzz", T.mosca - 0.05, -14], ["stream", T.porIsso2 + 0.1, -16], ["buzzer", T.nao + 0.05, -13],
  ["stone", T.petr - 0.5, -15], ["creak", T.compacta - 0.4, -15], ["thud", endOf("caminhaotanque") + 0.05, -13], ["bubbles", T.biogas - 0.05, -15], ["chime", endOf("com ela") + 0.05, -11],
  ["fanfare", T.parabens - 0.05, -7], ["confetti", T.parabens + 0.6, -11], ["cheer", T.parabens + 0.9, -17], ["pop", T.completa + 0.1, -13], ["chime", T.completa + 0.55, -12], ["chime", T.completa + 1.0, -12], ["ding", T.que, -11]);
export const SFX: [string, number, number][] = S.sort((a, b) => a[1] - b[1]);
