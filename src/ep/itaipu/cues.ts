// MEP5 — Itaipu. Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const z = (n: number) => find("zerou ainda", n, 0.05), an = (n: number) => find("ainda nao", n, 0.03);
export const T = {
  mw: find("catorze mil megawatts"), turbinas: find("vinte turbinas"), rio0: find("e um rio que nao"), voce: find("voce quer tirar"), parana: find("do rio parana"), fronteira: find("na fronteira"),
  mas: find("mas nao da", 0, 0.1), cava: find("entao voce cava"), dois: find("dois quilometros"), desvia: find("e desvia o rio"), esseCanal: find("esse e o canal de desvio"),
  z1: z(0), a1: an(0),
  leito: find("no leito seco"), paredao: find("levanta um paredao"), cento: find("cento e noventa"), predio: find("um predio de"), essaBarragem: find("essa e a barragem"),
  z2: z(1), a2: an(1),
  esquenta: find("concreto esquenta", 0, 0.1), racha: find("racha por dentro"), volta: find("entao volta tudo"),
  gela: find("ai voce gela"), gelo: find("fabrica de frio"), semTrincar: find("sem trincar"),
  z3: z(2), a3: an(2),
  p3: find("o lago enche", 0, 0.1), lampada: find("acende lampada"),
  tubos: find("abre tubos"), despenca: find("a agua despenca"), gira: find("gira a turbina"), gerador: find("e o gerador"), casaForca: find("essa e a casa de forca"),
  z4: z(3), a4: an(3),
  p4: find("vem uma chuvarada", 0, 0.1), ameaca: find("o lago ameaca"), escorregador: find("um escorregador"), vertedouro: find("esse e o vertedouro"), quarenta: find("quarenta vezes"), iguacu: find("cataratas do iguacu"),
  z5: z(4), a5: an(4),
  p5: find("os peixes", 0, 0.1), batem: find("batem no paredao"), soPraEles: find("um rio so pra eles"), dez: find("dez quilometros"), piracema: find("esse e o canal da piracema"),
  agoraSim: find("agora sim"), itaipu: find("voce construiu itaipu"), milhoes: find("milhoes de casas"), manda: find("manda pra quem"),
  end: DURATION_S,
};
export { CUTS, WINS };

// efeitos (nome do arquivo em som/el/, instante, ganho dB). A mixagem abaixa os efeitos 7 dB sob a voz.
const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const w of [WINS[3], WINS[6], WINS[10]]) S.push(["whoosh", w - 0.25, -13]);
for (const [a, b] of [[T.z1, T.a1], [T.z2, T.a2], [T.z3, T.a3], [T.z4, T.a4], [T.z5, T.a5]]) S.push(["pop", a + 0.02, -10], ["buzzer", b + 0.03, -9], ["stamp", b + 0.03, -11]);
for (const a of [T.mas, T.esquenta, T.p3, T.p4, T.p5]) S.push(["alert", a + 0.05, -12]);
S.push(["rewind", T.volta - 0.05, -12]);
for (const a of [T.esseCanal, T.essaBarragem, T.semTrincar, T.casaForca, T.vertedouro, T.piracema]) S.push(["ding", a + 0.05, -9]);
for (const a of [T.mw, T.turbinas, T.dois, T.cento, T.quarenta, T.dez]) S.push(["pop", a, -12]);
S.push(["river", 0.2, -15], ["dig", T.cava + 0.2, -11], ["landslide", T.cava + 1.0, -15], ["splash", T.desvia + 0.3, -11], ["river", T.desvia + 0.5, -13],
  ["concrete", T.paredao, -11], ["stone", T.cento, -13], ["sizzle", T.esquenta + 0.2, -12], ["crack", T.racha + 0.1, -9],
  ["clank", T.gela + 0.2, -13], ["pour", T.gelo, -12], ["fill", T.p3 + 0.1, -12], ["waterfall", T.despenca, -11], ["train", T.gira + 0.1, -14],
  ["rain", T.p4, -10], ["rain", T.p4 + 2.6, -12], ["waterfall", T.vertedouro + 0.1, -9], ["splash", T.batem, -11], ["splash", T.batem + 0.6, -13], ["stream", T.soPraEles + 0.3, -13],
  ["fanfare", T.agoraSim - 0.05, -6], ["confetti", T.itaipu, -10], ["cheer", T.milhoes, -13]);
export const SFX = S;
