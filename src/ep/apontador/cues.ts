// Episódio «apontador» (MEP25, tema 10 do radar): «Lápis é redondo. A ponta é um cone.»
// Roteiro com 5 consertos do crítico (e20-apontador/FONTES.md). Fatos: e20-apontador/FONTES.md § 0.
// Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { DURATION_S, WINS, find } from "../../toy/cues";

const z = (n: number) => find("resolveu ainda", n, 0.05), an = (n: number) => find("ainda nao", n, 0.03);
export const T = {
  hook: 0, cone: find("a ponta e um cone"), magica: find("quem faz essa"), bloquinho: find("um bloquinho"), semMotor: find("sem motor"), bora: find("bora montar"),
  monta: find("primeiro o bloco"), furo: find("com um furo"), balanca: find("se o lapis balanca"), quebra: find("a ponta quebra"),
  chefe1: find("chefe tem"), soSegura: find("o furo so segura"), deixa1: find("deixa comigo", 0), cone2: find("vai fechando num cone"), lamina: find("de lado entra"), raspao: find("de raspao"),
  z1: z(0), a1: an(0),
  chefe2: find("chefe a lamina"), ondeRaspa: find("a raspa vai"), deixa2: find("deixa comigo", 1), fenda: find("ao longo da lamina"), gira: find("voce gira o lapis", 0), fita: find("uma fita fina"), sanfona: find("em sanfona"),
  z2: z(1), a2: an(1),
  quebrou: find("a ponta quebrou"), presa: find("ficou presa"), deixa3: find("deixa comigo", 2), furinho: find("no fim do cone"), sair: find("pra ponta quebrada"),
  z3: z(2), a3: an(2),
  diaInteiro: find("e quem aponta"), deixa4: find("deixa comigo", 3), manivela: find("no apontador de manivela"), parado: find("fica parado"), cortadores: find("quem gira sao"),
  agoraSim: find("agora sim"), resolvido: find("sim resolvido"),
  conta: find("e a conta"), desenho: find("esse desenho"), ano: find("mil oitocentos"), nobre: find("de um nobre"),
  fabrica: find("e uma fabrica"), saoCarlos: find("em sao carlos"), bilhoes: find("dois bilhoes"), dez: find("da quase dez"),
  voce: find("voce gira o lapis ou"), comenta: find("comenta ai"),
  end: DURATION_S,
};

/** cortes secos onde a história vira, quantizados ao quadro. Ritmo calmo: nenhum plano abaixo de 0,8 s. */
const q = (x: number) => Math.round(x * 30) / 30;
export const CUTS10: number[] = [
  T.cone, T.bloquinho, T.bora, T.monta, T.balanca, T.chefe1, T.cone2, T.lamina, T.z1,
  T.chefe2, T.fenda, T.gira, T.sanfona, T.z2,
  T.quebrou, T.furinho, T.sair, T.z3,
  T.diaInteiro, T.manivela, T.cortadores, T.agoraSim,
  T.conta, T.desenho, T.fabrica, T.bilhoes, T.dez, T.voce,
].map(q);
export { WINS };

const S: [string, number, number][] = [];
for (const c of CUTS10) S.push(["whoosh", c - 0.22, -15]);
for (const [a, b] of [[T.z1, T.a1], [T.z2, T.a2], [T.z3, T.a3]]) S.push(["pop", a + 0.02, -10], ["buzzer", b + 0.03, -9], ["stamp", b + 0.03, -11]);
// o lápis raspando: um «drag» curto por volta enquanto aponta
for (let t = T.gira + 0.2; t < T.z2 - 0.3; t += 0.9) S.push(["drag", t, t < T.gira + 2 ? -15 : -20]);
for (let t = T.cortadores + 0.1; t < T.agoraSim - 0.2; t += 0.6) S.push(["tick", t, -18]);
S.push(
  ["chime", 0.4, -14], ["ding", T.cone + 0.2, -13], ["pop", T.bloquinho + 0.1, -11],
  ["clank", T.monta + 0.1, -12], ["ding", T.furo + 0.3, -13], ["buzz", T.balanca + 0.3, -14], ["thud", T.quebra + 0.2, -12],
  ["buzz", T.soSegura + 0.3, -14], ["slide", T.cone2 + 0.1, -13], ["clank", T.lamina + 0.2, -11], ["ding", T.raspao + 0.2, -12],
  ["alert", T.ondeRaspa + 0.1, -13], ["ding", T.fenda + 0.3, -12], ["paper", T.fita + 0.2, -12], ["spring", T.sanfona + 0.2, -13],
  ["thud", T.quebrou + 0.2, -12], ["alert", T.presa + 0.1, -13], ["ding", T.furinho + 0.3, -12], ["slide", T.sair + 0.2, -13], ["thud", T.sair + 1.1, -14],
  ["buzz", T.diaInteiro + 0.3, -15], ["clank", T.manivela + 0.2, -12], ["ding", T.parado + 0.2, -13],
  ["fanfare", T.agoraSim + 0.25, -7], ["confetti", T.resolvido + 0.1, -10],
  ["coins", T.conta + 0.1, -13], ["paper", T.ano + 0.2, -12], ["clank", T.fabrica + 0.2, -13], ["tick", T.bilhoes + 0.2, -13], ["coins", T.dez + 0.3, -12],
  ["pop", T.voce + 0.15, -11], ["pop", T.comenta + 0.1, -12],
);
export const SFX = S;
