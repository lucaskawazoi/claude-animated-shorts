// Episódio «posto» (MEP19) — você paga uns R$ 6,50 no litro; quanto fica pro posto? O litro se monta peça por peça.
// Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo). Números: e16-posto/FONTES.md (ANP, 08–14/11/2026).
import { DURATION_S, WINS, find } from "../../toy/cues";

const z = (n: number) => find("resolveu ainda", n, 0.05), an = (n: number) => find("ainda nao", n, 0.03);
const prob = (n: number) => find("chefe", n, 0.1), deixa = (n: number) => find("deixa comigo", n);
export const T = {
  seis: find("seis e meio"), quanto: find("quanto disso"), chuta: find("chuta ai"), bora: find("e bora"), peca: find("peca por peca"),
  primeiro: find("primeiro"), petroleo: find("o petroleo"), refinaria: find("pra refinaria"), pura: find("gasolina pura"), essa: find("essa peca"), dois: find("uns dois"),
  prob1: prob(0), tanque: find("pura pro tanque"), deixa1: deixa(0), misturar: find("manda misturar"), trinta: find("trinta e dois"), cana: find("alcool de cana"), mais1: find("mais um e"),
  z1: z(0), a1: an(0),
  prob2: prob(1), imposto: find("o imposto"), deixa2: deixa(1), icmsN: find("um e cinquenta"), icms: find("de icms"), mesmo: find("o mesmo valor"), federal: find("e o federal"), zerado: find("ta zerado"), ate: find("ate nove"), dez: find("de dezembro"),
  z2: z(1), a2: an(1),
  prob3: prob(2), base: find("na base"), longe: find("o posto ta longe"), deixa3: deixa(2), caminhao: find("o caminhao"), busca: find("busca entrega"), entrega: find("entrega e"), fica: find("e fica com"), cinquenta: find("uns cinquenta"),
  z3: z(2), a3: an(2),
  prob4: prob(3), falta: find("falta o posto"), deixa4: deixa(3), bomba: find("bomba frentista"), cheio: find("tanque cheio"),
  agoraSim: find("agora sim"), resolvido: find("sim resolvido"),
  sobrou: find("pro posto sobrou"), fatia: find("essa fatia"), umReal: find("mais ou menos"),
  conta: find("e a conta"), desse: find("desse real"), frentista: find("o frentista"), luz: find("a luz"), aluguel: find("o aluguel"), maquininha: find("a maquininha"),
  medio: find("um posto medio"), vende: find("vende uns"), dia: find("por dia"), entram: find("entram uns"), ficam: find("ficam uns"), tudo: find("tudo isso"),
  buraco: find("que nem no"), quemPaga: find("quem paga"), voce: find("e voce"), chute: find("chuta desse"), dono: find("pro dono"), comenta: find("comenta ai"),
  end: DURATION_S,
};

/** valores do litro (R$/L, ANP, Brasil, 08–14/11/2026; o posto = revenda − distribuição, ANP ago–set; distribuidora = 1,53 − 1,00) */
export const VAL = [2.17, 1.15, 1.57, 0.06, 0.53, 1.0];
/** quando cada fatia cai no litro (gasolina pura, etanol, ICMS, federal, distribuidora, posto) */
export const IN = [T.essa, T.cana, T.icmsN + 0.15, T.zerado + 0.25, T.entrega + 0.2, T.fatia];

/** cortes secos: um onde a HISTÓRIA vira, quantizados ao quadro. Ritmo calmo: nenhum plano abaixo de 0,8 s. */
const q = (x: number) => Math.round(x * 30) / 30;
export const CUTS10: number[] = [
  T.quanto, T.bora, T.primeiro, T.refinaria, T.essa,
  T.prob1, T.deixa1, T.trinta, T.mais1, T.z1,
  T.prob2, T.icmsN, T.mesmo, T.federal, T.ate, T.z2,
  T.prob3, T.longe, T.caminhao, T.entrega, T.z3,
  T.prob4, T.bomba, T.agoraSim, T.fatia,
  T.conta, T.frentista, T.maquininha, T.medio, T.entram, T.ficam, T.buraco, T.quemPaga, T.chute,
].map(q);
export { WINS };

const S: [string, number, number][] = [];
for (const c of CUTS10) S.push(["whoosh", c - 0.22, -15]);
for (const [a, b] of [[T.z1, T.a1], [T.z2, T.a2], [T.z3, T.a3]]) S.push(["pop", a + 0.02, -10], ["buzzer", b + 0.03, -9], ["stamp", b + 0.03, -11]);
for (const a of [T.prob1, T.prob2, T.prob3, T.prob4]) S.push(["alert", a + 0.05, -12]);
// cada fatia que cai no litro: baque + plim (a do federal, fininha, só um clique)
IN.forEach((a, i) => (i === 3 ? S.push(["click", a, -11]) : S.push(["thud", a + 0.32, -11], ["ding", a + 0.4, -12])));
S.push(
  ["horn", 0.9, -16], ["slide", 2.2, -15], ["tick", T.seis + 0.1, -13], ["tick", T.seis + 0.35, -13], ["pop", T.bora + 0.15, -11],
  ["giro", T.petroleo, -15], ["pour", T.refinaria + 0.3, -14], ["fire", T.refinaria + 0.2, -15], ["steam", T.pura, -16],
  ["wind", T.misturar - 0.2, -18], ["steam", T.misturar + 0.4, -16], ["pour", T.trinta + 0.3, -14],
  ["whoosh", T.deixa2 + 0.2, -13], ["slam", T.icmsN + 0.15, -9], ["paper", T.mesmo + 0.2, -15], ["spring", T.zerado + 0.1, -12], ["paper", T.ate + 0.15, -12], ["tick", T.dez + 0.1, -12],
  ["train", T.caminhao - 0.3, -20], ["horn", T.caminhao + 0.3, -13], ["beep", T.entrega - 0.3, -15], ["beep", T.entrega + 0.3, -15], ["fill", T.entrega + 0.5, -13],
  ["clank", T.bomba + 0.2, -12], ["fill", T.bomba + 0.6, -13], ["chime", T.cheio + 0.2, -11],
  ["fanfare", T.agoraSim + 0.25, -7], ["confetti", T.resolvido + 0.1, -10], ["slide", T.agoraSim + 0.8, -15],
  ["coins", T.frentista + 0.1, -13], ["chime", T.luz + 0.1, -13], ["coins", T.aluguel + 0.1, -14], ["click", T.maquininha + 0.35, -10], ["click", T.maquininha + 0.7, -10], ["coins", T.maquininha + 0.4, -14],
  ["horn", T.vende, -18], ["slide", T.medio + 0.5, -16], ["coins", T.entram + 0.1, -12], ["coins", T.entram + 0.6, -13], ["whoosh", T.ficam + 0.2, -12], ["coins", T.ficam + 0.4, -14],
  ["thud", T.buraco + 0.6, -12], ["coins", T.quemPaga, -13], ["pop", T.chute + 0.2, -11],
);
export const SFX = S;
