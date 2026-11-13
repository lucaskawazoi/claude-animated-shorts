// MEP10 — A latinha que volta para a prateleira. Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const z = (n: number) => find("zerou ainda", n, 0.05), an = (n: number) => find("ainda nao", n, 0.03);
export const T = {
  cem: find("de cada cem"), noventa: find("noventa e sete"), dois: find("isso em dois mil"), viagem: find("veja a viagem"),
  catador: find("o catador junta"), caminhao: find("pro caminhao"), so: find("so que latinha"), ar: find("cheio de ar"),
  z1: z(0), a1: an(0),
  aperta: find("ai voce aperta"), prensa: find("essa e a prensa"), mas: find("mas dentro do fardo", 0, 0.1), ferro: find("ferro plastico"), plastico: find("plastico sujeira"), sujeira: find("sujeira", 0),
  z2: z(1), a2: an(1),
  tritura: find("entao o fardo"), cacos: find("quebra tudo em cacos"), iman: find("um ima puxa"), trit: find("essa e a trituradora"),
  pintados: find("so que os cacos", 0, 0.1), queimaTinta: find("essa tinta queima"),
  z3: z(2), a3: an(2),
  forno: find("ai os cacos passam"), desc: find("esse e o forno descascador"), tintaQ: find("a tinta queima"), calor: find("o calor dela"), combust: find("ate a tinta vira"),
  derretem: find("os cacos limpos"), fusao: find("esse e o forno de fusao"), lingote: find("ele faz um lingote"), tijolao: find("mas lata e fina", 0, 0.1), tijolo2: find("e um tijolao"),
  z4: z(3), a4: an(3),
  rolos: find("ai o lingote"), lamin: find("esse e o laminador"), plana: find("so que chapa e plana", 0, 0.1),
  z5: z(4), a5: an(4),
  discos: find("ai cortam discos"), molde: find("empurram cada disco"), esticam: find("esticam a parede"), maquina: find("essa e a maquina de lata"),
  pintam: find("depois pintam e enchem"), setor: find("o setor diz"), prateleira: find("na prateleira"),
  agoraSim: find("agora sim"), zerou: find("zerou uma"), uma: find("uma lata que quase"), manda: find("manda pra quem"),
  end: DURATION_S,
};
export { CUTS, WINS };

const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const w of [WINS[3], WINS[6], WINS[10]]) S.push(["whoosh", w - 0.25, -13]);
for (const [a, b] of [[T.z1, T.a1], [T.z2, T.a2], [T.z3, T.a3], [T.z4, T.a4], [T.z5, T.a5]]) S.push(["pop", a + 0.02, -10], ["buzzer", b + 0.03, -9], ["stamp", b + 0.03, -11]);
for (const a of [T.so, T.mas, T.pintados, T.tijolao, T.plana]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.prensa, T.trit, T.desc, T.fusao, T.lamin, T.maquina]) S.push(["ding", a + 0.05, -9]);
S.push(["pop", T.noventa, -12], ["pop", T.viagem + 0.5, -12], ["thud", T.viagem + 1.3, -11], ["clank", T.caminhao + 0.4, -12],
  ["spring", T.ar - 0.5, -11], ["pop", T.ar + 0.3, -12], ["slam", T.aperta + 1.7, -8], ["crack", T.aperta + 1.9, -12],
  ["clank", T.ferro, -12], ["pop", T.plastico, -12], ["squelch", T.sujeira, -12],
  ["drag", T.tritura, -13], ["crack", T.cacos, -10], ["strike", T.iman + 0.35, -9], ["click", T.iman + 0.7, -12],
  ["fire", T.pintados + 2.3, -11], ["sizzle", T.queimaTinta + 0.6, -12],
  ["fire", T.forno, -12], ["sizzle", T.tintaQ + 0.3, -12], ["heat", T.calor, -12], ["pop", T.combust, -10], ["fanfare", T.combust + 0.4, -14],
  ["pourmetal", T.derretem + 1.5, -11], ["fire", T.fusao, -12], ["pourmetal", T.lingote, -10], ["thud", T.lingote + 2.8, -9], ["thud", T.tijolo2, -10],
  ["drag", T.rolos + 0.2, -12], ["slam", T.rolos + 1.2, -12], ["slam", T.rolos + 2.4, -12], ["scrape", T.rolos + 2.6, -13],
  ["clack", T.discos + 0.4, -11], ["clack", T.discos + 1.2, -11], ["slam", T.molde + 0.6, -10], ["pop", T.molde + 1.4, -11], ["scrape", T.esticam + 0.2, -12], ["pop", T.esticam + 1.2, -11],
  ["sizzle", T.pintam + 0.1, -13], ["pour", T.pintam + 0.8, -12], ["click", T.pintam + 1.3, -11],
  ["fill", T.setor + 0.2, -13],
  ["fanfare", T.agoraSim - 0.05, -6], ["confetti", T.zerou, -10]);
for (let i = 0; i < 10; i++) S.push(["pop", T.agoraSim - 3.4 + i * 0.36, -12]);
export const SFX = S;
