// MEP13 — cortes e efeitos (a mixagem lê este arquivo; sem React). Os cortes saem da tabela de planos em shots.ts.
import { WINS } from "../../toy/cues";
import { T } from "./anchors";
import { ROWS } from "./shots";
export { T, WINS };

const q = (x: number) => Math.round(x * 30) / 30;
/** cortes secos: um onde a HISTÓRIA vira (cada estação, cada «Zerou? Ainda não», cada surpresa) — um por plano da tabela */
export const CUTS10: number[] = ROWS.slice(1).map((r) => q(r[0]));


const S: [string, number, number][] = [];
for (const c of CUTS10) S.push(["whoosh", c - 0.22, -12]);
for (const [a, b] of [[T.z1, T.a1], [T.z2, T.a2], [T.z3, T.a3], [T.z4, T.a4], [T.z5, T.a5]]) S.push(["pop", a + 0.02, -10], ["buzzer", b + 0.03, -9], ["stamp", b + 0.03, -11]);
for (const a of [T.soque1, T.soque2, T.soque3, T.mas4, T.soque5]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.descT, T.picT, T.digT, T.torT, T.maqT, T.calT]) S.push(["ding", a + 0.05, -9]);
S.push(["thud", T.metade, -11], ["pop", T.nem, -11], ["pop", T.sete + 0.3, -12], ["thud", T.tora + 0.5, -10], ["slam", T.arranca + 0.3, -10], ["clank", T.lascas, -11], ["gravel", T.lascas + 0.4, -12],
  ["gush", T.quente, -11], ["gush", T.quim, -11], ["spring", T.cola, -10], ["pop", T.soltam, -11], ["splash", T.lavada, -11], ["stream", T.clar, -12], ["splash", T.folha, -10],
  ["gush", T.tela, -12], ["slam", T.rolos + 0.3, -10], ["fire", T.cilin, -12], ["slide", T.bobina, -11], ["mud", T.caldo, -12],
  ["fire", T.queima, -9], ["gush", T.fogo, -12], ["chime", T.energia + 0.5, -9], ["pop", T.vender, -11], ["fire", T.comb, -12], ["gush", T.maior, -11],
  ["fanfare", T.agoraSim - 0.05, -6], ["confetti", T.zerou, -10]);
export const SFX = S;
