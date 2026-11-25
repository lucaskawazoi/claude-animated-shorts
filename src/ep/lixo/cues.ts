// Episódio «lixo» (MEP23, tema 1 do radar): «Toda semana o caminhão de lixo passa na sua rua, e lá dentro tem uma parede que anda».
// Roteiro escolhido às cegas entre 2 (e18-lixo/escolha/critico.md). Fatos: e18-lixo/FONTES.md § 0.
// Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { DURATION_S, WINS, find } from "../../toy/cues";

const z = (n: number) => find("resolveu ainda", n, 0.05), an = (n: number) => find("ainda nao", n, 0.03);
export const T = {
  hook: 0, parede0: find("tem uma parede que anda", 0), bora: find("bora montar"),
  monta: find("primeiro o chassi"), cabine: find("e a cabine"), caixa: find("depois a caixa"), boca: find("e atras a boca"), coletor: find("onde o coletor"),
  chefe: find("chefe tem"), ar: find("quase tudo ar"), duas: find("em duas ruas"), deixa1: find("deixa comigo", 0), pa: find("uma pa desce"), quinze: find("quinze segundos"),
  z1: z(0), a1: an(0),
  contra: find("empurra contra"), parede: find("tem uma parede que anda", 1), colada: find("ela comeca colada"), recua: find("recua um"), metro: find("um metro cubico"),
  z2: z(1), a2: an(1),
  encheu: find("a caixa encheu"), aterro: find("no aterro"), deVolta: find("anda de volta"),
  z3: z(2), a3: an(2),
  apodrece: find("o lixo apodrece"), manta: find("embaixo tem"), tratamento: find("vai pra tratamento"), gas: find("e o gas vira"), luz: find("vira luz"), usina: find("bagaco da usina"),
  agoraSim: find("agora sim"), resolvido: find("sim resolvido"),
  conta: find("e a conta"), brasil: find("o brasil jogou"), quatro: find("quatro em cada"), prazo: find("o prazo pra"), servico: find("o servico do lixo"), paga: find("quem paga"), duzentos: find("duzentos e vinte"),
  onde: find("e esse lixo todo"), voce: find("que dia o caminhao"), comenta: find("comenta ai"),
  end: DURATION_S,
  // derivados do mundo
  cabe: 0, fimPa: 0, lixao: 0,
};
T.cabe = T.metro; T.fimPa = T.encheu; T.lixao = T.quatro;

/** cortes secos onde a história vira, quantizados ao quadro. Ritmo calmo: nenhum plano abaixo de 0,8 s. */
const q = (x: number) => Math.round(x * 30) / 30;
export const CUTS10: number[] = [
  T.parede0, T.bora, T.monta, T.boca, T.chefe, T.ar, T.pa, T.z1,
  T.contra, T.parede, T.colada, T.recua, T.metro, T.z2,
  T.encheu, T.aterro, T.deVolta, T.z3,
  T.apodrece, T.manta, T.tratamento, T.gas, T.agoraSim,
  T.conta, T.brasil, T.quatro, T.prazo, T.servico, T.onde, T.voce,
].map(q);
export { WINS };

const S: [string, number, number][] = [];
for (const c of CUTS10) S.push(["whoosh", c - 0.22, -15]);
for (const [a, b] of [[T.z1, T.a1], [T.z2, T.a2], [T.z3, T.a3]]) S.push(["pop", a + 0.02, -10], ["buzzer", b + 0.03, -9], ["stamp", b + 0.03, -11]);
// a pá: um rangido hidráulico por ciclo enquanto compacta (1,5 s), mais baixo depois do primeiro
for (let t = T.pa; t < T.fimPa - 0.3; t += 1.5) S.push(["drag", t + 0.1, t < T.pa + 2 ? -13 : -19]);
S.push(
  ["chime", 0.4, -14], ["ding", T.parede0 + 0.2, -13],
  ["clank", T.monta + 0.1, -12], ["clank", T.cabine + 0.1, -12], ["clank", T.caixa + 0.1, -12], ["clank", T.boca + 0.1, -12],
  ["buzz", T.ar + 0.4, -14], ["thud", T.duas + 0.3, -13], ["tick", T.quinze + 0.2, -13],
  ["ding", T.parede + 0.2, -12], ["slide", T.recua + 0.1, -13], ["thud", T.metro + 0.6, -12],
  ["alert", T.encheu + 0.1, -13], ["spring", T.aterro + 0.6, -13], ["slide", T.deVolta + 0.2, -11], ["thud", T.deVolta + 1.4, -12], ["thud", T.deVolta + 2.0, -13],
  ["bubbles", T.apodrece + 0.3, -15], ["ding", T.manta + 0.2, -13], ["wind", T.gas, -17], ["chime", T.luz + 0.1, -11],
  ["fanfare", T.agoraSim + 0.25, -7], ["confetti", T.resolvido + 0.1, -10],
  ["coins", T.conta + 0.1, -13], ["tick", T.brasil + 0.4, -13], ["alert", T.quatro + 0.2, -13], ["paper", T.prazo + 0.2, -12], ["ding", T.duzentos + 0.3, -12], ["coins", T.paga + 0.2, -12],
  ["wind", T.onde + 0.1, -16], ["pop", T.voce + 0.15, -11], ["pop", T.comenta + 0.1, -12],
);
export const SFX = S;
