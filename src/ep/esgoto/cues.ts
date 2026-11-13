// MEP11 — Para onde vai a descarga (esgoto). Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { DURATION_S, WINS, find, words } from "../../toy/cues";

const z = (n: number) => find("zerou ainda", n, 0.05), an = (n: number) => find("ainda nao", n, 0.03);
export const T = {
  cem: find("de cada cem"), metade: find("so metade"), sua: find("a sua descarga"), viagem: find("faz uma viagem"),
  descarga: find("voce da a descarga"), desce: find("o esgoto desce"), rede: find("essa e a rede"),
  soque1: find("so que chega", 0, 0.1), vale: find("num vale"), morro: find("esgoto nao sobe morro"),
  z1: z(0), a1: an(0),
  bomba: find("uma bomba gigante"), empurra: find("que empurra"), pracima: find("pra cima"), eleva: find("essa e a elevatoria"),
  mas2: find("mas o esgoto chega", 0, 0.1), pano: find("pano"), plastico: find("plastico e areia"), areia: find("e areia"),
  z2: z(1), a2: an(1),
  grade: find("entao ele passa"), segura: find("segura o que e grande"), canal: find("um canal onde"), afundaA: find("a areia afunda"), gradeT: find("essa e a grade"), mas3: find("mas ainda sobra", 0, 0.1),
  z3: z(2), a3: an(2),
  tanque: find("ai a agua fica"), pesado: find("o que e pesado"), lodo: find("vira lodo"), prim: find("esse e o decantador primario"), soque4: find("so que sobra sujeira dissolvida", 0, 0.1),
  z4: z(3), a4: an(3),
  bact: find("ai vem as bacterias"), adoram: find("que adoram"), sopra: find("voce sopra ar"), comem: find("elas comem"), aer: find("esse e o tanque de aeracao"), demais: find("so que agora tem", 0, 0.1),
  z5: z(4), a5: an(4),
  outro: find("em outro tanque"), afundam: find("as bacterias afundam"), limpa: find("sai agua"), rio: find("volta pro rio"), sec: find("esse e o decantador secundario"), montanha: find("so que sobra uma montanha", 0, 0.1),
  z6: z(5), a6: an(5),
  dig: find("ai o lodo vai"), semar: find("sem ar"), outras: find("outras bacterias"), biogas: find("soltam biogas"), energia: find("pode virar energia"), digT: find("esse e o digestor"), adubo: find("o que sobra pode virar adubo"),
  agoraSim: find("agora sim"), zerou: find("sim zerou"), vaso: find("do vaso ao rio"), manda: find("manda pra quem"),
  end: DURATION_S,
};

/** cortes secos: um onde a HISTÓRIA vira (cada estação, cada problema, cada «Zerou?», cada surpresa), em segundos, quantizados ao quadro */
const q = (x: number) => Math.round(x * 30) / 30;
export const CUTS10: number[] = [
  T.sua, T.descarga, T.desce, T.rede, T.soque1, T.morro, T.bomba, T.pracima, T.eleva - 0.07, T.mas2, T.z2, T.grade, T.segura, T.canal, T.gradeT, T.z3, T.tanque, T.lodo, T.prim, T.z4,
  T.bact, T.adoram, T.sopra, T.comem, T.aer, T.demais, T.z5, T.outro, T.limpa, T.rio, T.sec, T.montanha, T.z6, T.dig, T.semar, T.outras, T.biogas, T.energia, T.digT, T.adubo, T.agoraSim, T.vaso, T.manda,
].map(q);
export { WINS };

const S: [string, number, number][] = [];
for (const c of CUTS10) S.push(["whoosh", c - 0.22, -12]);
for (const [a, b] of [[T.z1, T.a1], [T.z2, T.a2], [T.z3, T.a3], [T.z4, T.a4], [T.z5, T.a5], [T.z6, T.a6]]) S.push(["pop", a + 0.02, -10], ["buzzer", b + 0.03, -9], ["stamp", b + 0.03, -11]);
for (const a of [T.soque1, T.mas2, T.mas3, T.soque4, T.demais, T.montanha]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.rede, T.eleva, T.gradeT, T.prim, T.aer, T.sec, T.digT]) S.push(["ding", a + 0.05, -9]);
S.push(["pop", T.cem + 0.2, -12], ["pop", T.cem + 1.0, -12], ["thud", T.metade, -11],
  ["gush", T.descarga + 0.5, -9], ["drain", T.desce, -11], ["pop", T.rede + 0.2, -10],
  ["mud", T.vale + 0.3, -12], ["thud", T.morro + 0.7, -11],
  ["spring", T.bomba + 0.4, -10], ["gush", T.empurra, -10], ["pop", T.pracima, -11],
  ["squelch", T.pano, -12], ["splash", T.plastico, -12], ["gravel", T.areia, -12],
  ["clank", T.segura + 0.4, -11], ["drag", T.canal, -13], ["sink", T.afundaA, -12],
  ["slide", T.pesado, -12], ["sink", T.lodo, -12],
  ["pop", T.bact + 0.3, -11], ["pop", T.bact + 0.8, -11], ["gush", T.sopra, -12], ["squelch", T.comem, -12], ["pop", T.demais + 0.4, -10], ["pop", T.demais + 0.8, -10],
  ["sink", T.afundam, -12], ["stream", T.limpa, -12], ["splash", T.rio + 0.7, -9],
  ["mud", T.dig, -12], ["creak", T.semar, -13], ["fire", T.biogas + 0.6, -11], ["chime", T.energia + 0.9, -9], ["pop", T.energia + 1.4, -11],
  ["slam", T.adubo + 0.5, -10], ["slam", T.adubo + 1.0, -10],
  ["fanfare", T.agoraSim - 0.05, -6], ["confetti", T.zerou, -10]);
export const SFX = S;
