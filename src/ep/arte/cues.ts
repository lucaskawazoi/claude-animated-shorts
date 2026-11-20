// Episódio «arte» (MEP20, «A conta por trás») — «Uns sessenta bilhões de dólares por ano… um quadro de um milhão de reais pode servir pra lavar dinheiro».
// Roteiro do gerador conta-pt, escolhido às cegas entre 3 (e17-arte/escolha/critico.md). Fatos: e17-arte/FONTES.md § 0.
// Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { DURATION_S, WINS, find } from "../../toy/cues";

const z = (n: number) => find("resolveu ainda", n, 0.05), an = (n: number) => find("ainda nao", n, 0.03);
export const T = {
  hook: 0, mundo: find("e quanto o mundo"), segundo: find("segundo o relatorio"), umQuadro: find("e um quadro de"), lava: find("pode servir"),
  chefe: find("chefe", 0, 0.1), como: find("como um quadro"), recibo: find("lava dinheiro"), deixa: find("deixa comigo"),
  litro: find("o litro de"), semTabela: find("o quadro nao tem"), vale: find("vale o que"), gafi: find("e o gafi"), diz: find("diz que e"),
  dificulta: find("que dificulta"),
  z1: z(0), a1: an(0),
  muita: find("muita venda"), dono: find("o dono de"), obra: find("e a obra"), caixas: find("em genebra"), estimam: find("estimam"),
  semImposto: find("sem imposto"),
  z2: z(1), a2: an(1),
  como2: find("como pegam"), pelo: find("pelo que nao"), preco: find("preco muito"), pago: find("pago em"), por: find("por um comprador"),
  brasil: find("no brasil"), coaf: find("avisar o coaf"), dez: find("dez mil"),
  agoraSim: find("agora sim"), resolvido: find("sim resolvido"),
  voce: find("voce pagaria"), comenta: find("comenta ai"), manda: find("e manda"),
  end: DURATION_S,
  // derivados do mundo (a lavagem por insinuação, o comprador, o alarme)
  sujo: 0, limpo: 0, comprador: 0, vivo: 0, pico: 0, alarme: 0,
};
T.sujo = T.lava + 0.1; T.limpo = T.como; T.comprador = T.muita; T.vivo = T.pago; T.pico = T.preco; T.alarme = T.coaf;

/** cortes secos onde a história vira, quantizados ao quadro. Ritmo calmo: nenhum plano abaixo de 0,8 s. */
const q = (x: number) => Math.round(x * 30) / 30;
export const CUTS10: number[] = [
  T.mundo, T.segundo, T.umQuadro, T.lava, T.chefe, T.como, T.deixa, T.litro, T.semTabela, T.vale, T.gafi, T.diz, T.dificulta, T.z1,
  T.muita, T.dono, T.obra, T.caixas, T.semImposto, T.z2,
  T.como2, T.pelo, T.preco, T.pago, T.por, T.brasil, T.coaf, T.dez, T.agoraSim, T.voce, T.comenta,
].map(q);
export { WINS };

const S: [string, number, number][] = [];
for (const c of CUTS10) S.push(["whoosh", c - 0.22, -15]);
for (const [a, b] of [[T.z1, T.a1], [T.z2, T.a2]]) S.push(["pop", a + 0.02, -10], ["buzzer", b + 0.03, -9], ["stamp", b + 0.03, -11]);
S.push(
  ["coins", 0.15, -12], ["chime", 0.6, -14], ["ding", T.segundo + 0.15, -13], ["clank", T.umQuadro + 0.3, -13], ["chime", T.umQuadro + 1.1, -12],
  // a lavagem: o quadro vira porta de máquina, gira, borbulha; moedas entram e saem; o recibo sai
  ["spin", T.lava, -12], ["bubbles", T.lava + 0.3, -14], ["coins", T.sujo + 0.2, -14], ["coins", T.sujo + 0.9, -15],
  ["alert", T.chefe + 0.05, -14], ["coins", T.limpo + 0.1, -12], ["coins", T.limpo + 0.7, -13], ["paper", T.recibo + 0.05, -10], ["ding", T.recibo + 0.4, -12],
  ["tick", T.litro + 0.5, -13], ["buzz", T.semTabela + 0.5, -14], ["chime", T.vale + 0.1, -13],
  ["paper", T.gafi + 0.15, -12], ["ding", T.gafi + 0.5, -13], ["thud", T.dificulta + 0.4, -12],
  ["slide", T.muita + 0.1, -15], ["pop", T.dono + 0.5, -12], ["thud", T.obra + 0.6, -12], ["drag", T.caixas + 0.1, -13], ["wind", T.caixas + 0.3, -18],
  ["thud", T.caixas + 0.8, -13], ["tick", T.estimam + 0.3, -13], ["ding", T.semImposto + 0.2, -12],
  ["alert", T.pelo + 0.1, -13], ["slide", T.preco + 0.05, -12], ["spring", T.preco + 0.8, -12], ["clank", T.pago + 0.2, -12], ["coins", T.pago + 0.4, -13],
  ["pop", T.por + 0.4, -12], ["alert", T.coaf + 0.1, -8], ["alert", T.coaf + 0.9, -10], ["tick", T.dez + 0.2, -13],
  ["fanfare", T.agoraSim + 0.25, -7], ["confetti", T.resolvido + 0.1, -10], ["pop", T.voce + 0.15, -11], ["pop", T.comenta + 0.1, -12],
);
export const SFX = S;
