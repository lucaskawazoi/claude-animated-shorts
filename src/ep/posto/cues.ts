// Episódio «posto» v2 (MEP19) — «Dezoito mil reais entram no caixa de um posto por dia. Mas quanto disso fica ali?»
// Roteiro escrito com o gerador conta-pt (script-lab, 228 Shorts reais) e escolhido às cegas por um crítico (18/11).
// Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo). Números: e16-posto/FONTES.md § 0 (ANP).
import { DURATION_S, WINS, find } from "../../toy/cues";

const z = (n: number) => find("resolveu ainda", n, 0.05), an = (n: number) => find("ainda nao", n, 0.03);
export const T = {
  caixa: find("no caixa"), mas: find("mas quanto"), litro: find("o litro esta"), seis: find("uns seis e meio"), segundo: find("segundo a anp"),
  medio: find("e um posto medio"), vende: find("vende uns"), oito1: find("oitocentos litros por"), dois2: find("dois mil e oitocentos litros a"), dezoito2: find("dezoito mil", 1),
  chefe: find("chefe", 0, 0.1), deixa: find("deixa comigo"), naoGanha: find("o posto nao ganha"), paga: find("ele paga"), cobra: find("e cobra"),
  z1: z(0), a1: an(0),
  diferenca: find("a diferenca"), umReal2: find("um real por litro no"), da: find("da uns dois"),
  desse: find("e desse dinheiro"), frentista: find("o frentista"), luz: find("a luz"), aluguel: find("o aluguel"), maquininha: find("a maquininha"),
  lucro: find("e lucro bruto"), antes: find("antes das contas"),
  z2: z(1), a2: an(1),
  pra: find("pra sentir"), tanque: find("num tanque"), voce: find("voce paga"), postoFica: find("e o posto fica"),
  resto: find("o resto"), so: find("o imposto do estado"), postoDist: find("que o posto e a"), juntos: find("distribuidora juntos"),
  agoraSim: find("agora sim"), resolvido: find("sim resolvido"),
  quanto2: find("quanto voce achava"), comenta: find("comenta ai"), manda: find("e manda"), soLucro: find("e so lucro"),
  end: DURATION_S,
};

/** o litro de R$ 6,48 (ANP, 08–14/11/2026): a parte que já tem dono (5,48) e a do posto (1,00); depois os donos do resto */
export const DONO = 5.48, POSTO = 1.0;
export const RESTO = [2.17, 1.15, 1.57, 0.06, 0.53]; // refinaria, etanol (usina), ICMS, federal, distribuidora

/** cortes secos onde a história vira, quantizados ao quadro. Ritmo calmo: nenhum plano abaixo de 0,8 s. */
const q = (x: number) => Math.round(x * 30) / 30;
export const CUTS10: number[] = [
  T.caixa, T.mas, T.litro, T.segundo, T.medio, T.oito1, T.dois2, T.dezoito2,
  T.chefe, T.deixa, T.naoGanha, T.paga, T.cobra, T.z1,
  T.diferenca, T.umReal2, T.da, T.desse, T.frentista, T.luz, T.maquininha, T.lucro, T.z2,
  T.pra, T.voce, T.postoFica, T.resto, T.so, T.postoDist, T.juntos, T.agoraSim, T.quanto2, T.soLucro,
].map(q);
export { WINS };

const S: [string, number, number][] = [];
for (const c of CUTS10) S.push(["whoosh", c - 0.22, -15]);
for (const [a, b] of [[T.z1, T.a1], [T.z2, T.a2]]) S.push(["pop", a + 0.02, -10], ["buzzer", b + 0.03, -9], ["stamp", b + 0.03, -11]);
S.push(
  ["coins", 0.15, -11], ["coins", 0.9, -12], ["coins", 1.8, -13], ["slide", 1.2, -16], ["horn", 2.4, -18], ["pop", T.mas + 0.1, -12],
  ["tick", T.seis + 0.1, -13], ["tick", T.seis + 0.35, -13], ["ding", T.segundo + 0.1, -13],
  ["horn", T.medio + 0.4, -17], ["slide", T.vende, -16], ["coins", T.dois2 + 0.3, -13], ["ding", T.dezoito2 + 0.1, -10],
  ["alert", T.chefe + 0.05, -12], ["train", T.naoGanha - 0.2, -20], ["horn", T.naoGanha + 0.6, -13], ["beep", T.paga - 0.2, -15], ["fill", T.paga + 0.3, -13],
  ["clank", T.cobra + 0.2, -12], ["tick", T.cobra + 0.5, -13],
  ["thud", T.diferenca + 0.35, -11], ["ding", T.diferenca + 0.9, -10], ["ding", T.umReal2 + 0.2, -12], ["whoosh", T.da + 0.2, -12], ["coins", T.da + 0.4, -13],
  ["coins", T.frentista + 0.05, -13], ["chime", T.luz + 0.1, -12], ["coins", T.aluguel + 0.05, -14], ["click", T.maquininha + 0.3, -10], ["click", T.maquininha + 0.65, -10], ["coins", T.maquininha + 0.35, -14],
  ["tick", T.antes + 0.1, -13],
  ["clank", T.tanque + 0.1, -12], ["fill", T.tanque + 0.4, -13], ["tick", T.voce + 0.6, -13], ["coins", T.postoFica + 0.5, -13],
  ["whoosh", T.resto + 0.3, -11], ["pop", T.resto + 0.5, -13], ["pop", T.resto + 0.7, -13], ["pop", T.resto + 0.9, -13],
  ["thud", T.so + 0.4, -10], ["thud", T.postoDist + 0.3, -10],
  ["fanfare", T.agoraSim + 0.25, -7], ["confetti", T.resolvido + 0.1, -10], ["pop", T.quanto2 + 0.15, -11],
);
export const SFX = S;
