// E13 — Puente Q'eswachaka (braço «ritmo»). Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const ci = (n: number) => find("con ingenio", n, 0.05);
export const T = {
  // gancho
  puente: find("un puente colgante"), treinta: find("unos treinta metros"), hierba0: find("hierba trenzada"), vuelven: find("vuelven a tejer"),
  cadaAno0: find("cada ano", 0), quinientos: find("quinientos"), andes: find("los andes"), incas: find("de los incas"),
  // o cânion vazio
  nohay: find("no hay acero"), acero: find("acero ni"), cables: find("ni cables"), motores: find("ni motores"),
  solo: find("solo hierba"), manos: find("manos y mucha"), gente: find("mucha gente"), camino: find("y el camino"), cruzar: find("tiene que cruzar"),
  rio: find("el rio apurimac"), fondo: find("el fondo de"), canon: find("de un canon", 0),
  // 1: as sogas
  b1: find("como cruzas", 0, 0.1), c1: ci(0), puna: find("hierba de la puna"), qoya: find("la qoya"), torcida: find("torcida en"),
  finos: find("cordones finos"), casi: find("casi cien"), trenzados: find("trenzados en"), cadaSoga: find("en cada soga"),
  gruesa: find("gruesa como"), pierna: find("una pierna"), unCordon: find("un cordon solo"), rompe: find("se rompe"), cienJuntos: find("cien juntos"),
  noo: find("no estas son"), sogas: find("estas son las sogas"),
  // 2: os anclajes
  p1: find("pero las sogas", 0, 0.1), tensas: find("quedar tensas"), orilla: find("de una orilla"), otra: find("a la otra"),
  s2: find("solucion", 0, 0.1), amarran: find("las amarran"), piedras: find("grandes piedras"), cadaOrilla: find("en cada orilla"),
  decenas: find("decenas de personas"), tiran: find("tiran a la vez"), tensarlas: find("hasta tensarlas"), anclajes: find("estos son los anclajes"),
  // 3: o piso
  p2: find("pero sobre sogas", 0, 0.1), redondas: find("sogas redondas"), caminar: find("puede caminar"),
  s3: find("solucion", 1, 0.1), deAbajo: find("de abajo"), tejen: find("tejen un piso"), ramas: find("de ramas"), esteras: find("y esteras"),
  dos: find("dos sogas mas"), arriba: find("mas arriba"), barandas: find("de barandas"), estePiso: find("este es el piso"),
  // 4: a renovação
  p3: find("pero la hierba", 0, 0.1), pudre: find("se pudre con"), lluvia: find("la lluvia"), sol: find("y el sol"),
  b4: find("como mantienes", 0, 0.1), c4: ci(1), noLo: find("no lo mantienes"), rehaces: find("lo rehaces"),
  cadaAno1: find("cada ano", 1), cuatro: find("cuatro comunidades"), nuevo: find("tejen uno nuevo"), tres: find("tres dias"),
  viejo: find("y el viejo"), sueltan: find("lo sueltan"), alRio: find("al rio"), renovacion: find("esta es la renovacion"),
  // desfecho
  giro: find("aqui viene el giro"), trece: find("dos mil trece"), unesco: find("la unesco"), patrimonio: find("patrimonio de la"),
  algo: find("algo que no"), tocar: find("puede tocar"), costumbre: find("la costumbre"), rehacerlo: find("de rehacerlo"),
  manda: find("mandaselo"),
  end: DURATION_S,
};
export { CUTS, WINS };
const fr = (x: number) => Math.round(x * 30) / 30;
/** cortes duros EXTRA (pedido do Lucas 13/11 03h10: um corte a cada ~4–5 s), nas viradas de frase, ≥1,5 s dos cortes da régua */
export const XC = [T.cadaAno0 + 0.04, T.camino, T.torcida, T.p1, T.decenas, find("sobre las sogas"), T.estePiso, T.p3, T.cadaAno1, find("y aqui viene"), T.algo].map(fr);
/** mais 6 (pré-crítica de ritmo, 13/11): o abismo, o escorregão na soga frouxa, os anclajes, as barandas, o velho despencando, o tecer de perto */
export const XN = [T.rio, T.orilla, T.anclajes, T.dos, T.noLo, T.nuevo].map(fr);

const S: [string, number, number][] = [];
for (const c of [...CUTS, ...XC, ...XN]) S.push(["whoosh", c - 0.22, -12]);
// braço ritmo: chicote em TODAS as janelas da régua (as 3 passagens contínuas e o pouso de cada corte)
for (const w of [WINS[3], WINS[6], WINS[10]]) S.push(["whoosh", w - 0.25, -13]);
for (const [a, c] of [[T.b1, T.c1], [T.b4, T.c4]]) S.push(["stamp", a + 0.05, -8], ["strike", a + 0.32, -12], ["chime", c + 0.04, -7]);
for (const a of [T.s2, T.s3]) S.push(["chime", a, -9]);
for (const a of [T.canon, T.p1, T.p2]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.andes, T.cienJuntos, T.s3, T.b4]) S.push(["rewind", a - 0.05, -13]);
for (const a of [T.sogas, T.anclajes, T.estePiso, T.renovacion]) S.push(["ding", a + 0.05, -9]);
for (const a of [T.treinta, T.cadaAno0, T.quinientos, T.acero, T.cables, T.motores, T.cuatro, T.trece]) S.push(["pop", a, -11]);
S.push(
  ["wind", 0.0, -15], ["creak", 0.3, -13], ["river", 0.0, -17], ["creak", T.vuelven, -14],
  ["llama", T.solo + 0.6, -15], ["crowd", T.gente, -17], ["river", T.fondo - 0.2, -12],
  ["qe-rustle", T.puna + 0.15, -9], ["qe-twist", T.torcida, -9], ["qe-twist", T.casi + 0.1, -11], ["qe-twist", T.trenzados, -8],
  ["qe-pling", T.rompe + 0.05, -6], ["thud", T.rompe + 0.42, -9], ["qe-taut", T.cienJuntos + 0.1, -9], ["qe-boing", T.noo, -13],
  ["drag", T.p1 + 0.2, -12], ["creak", T.orilla, -12],
  ["drag", CUTS[3] + 0.1, -11], ["qe-heave", T.tiran, -8], ["qe-taut", T.tensarlas + 0.35, -8],
  ["qe-slip", T.caminar - 0.15, -7], ["qe-boing", T.caminar + 0.55, -10],
  ["qe-weave", T.ramas - 0.3, -9], ["qe-weave", T.esteras, -10], ["qe-taut", T.barandas, -12], ["cheer", T.estePiso + 0.3, -14],
  ["rain", T.lluvia - 0.3, -10], ["sizzle", T.sol, -14], ["creak", T.b4, -10], ["crack", T.b4 + 1.0, -14],
  ["qe-taut", T.rehaces, -10], ["crowd", T.cuatro, -14], ["qe-weave", T.nuevo, -10], ["qe-weave", T.tres, -11],
  ["qe-bigsplash", T.alRio + 0.05, -6],
  // gags da pré-crítica de ritmo: aço/cabo/motor jogados no cânion, a pedrinha, o escorregão, a perna no piso podre, o velho despencando, a cama elástica
  ["clack", T.acero + 0.33, -10], ["clack", T.cables + 0.33, -10], ["clack", T.motores + 0.33, -9], ["splash", T.motores + 2.0, -20],
  ["stone", T.fondo - 0.12, -10], ["splash", T.fondo + 1.3, -15],
  ["thud", T.sogas + 0.25, -11], ["thud", T.sogas + 0.6, -12],
  ["slide", T.orilla + 0.25, -8], ["sad", T.otra, -9], ["qe-boing", T.otra + 0.3, -11],
  ["crack", T.pudre + 0.02, -6], ["thud", T.pudre + 0.12, -10], ["sad", T.pudre + 0.35, -12],
  ["crumble", T.noLo + 0.05, -8], ["splash", T.noLo + 1.75, -14], ["drag", T.rehaces - 0.1, -11],
  ["qe-boing", T.manda + 0.02, -7], ["creak", T.manda + 0.6, -11], ["qe-boing", T.manda + 0.64, -9], ["cheer", T.manda + 0.35, -14],
  ["fanfare", T.renovacion - 0.1, -9], ["cheer", T.renovacion + 0.3, -12], ["gong", T.unesco, -11], ["confetti", T.costumbre, -10], ["wind", T.manda, -16],
);
export const SFX = S;
