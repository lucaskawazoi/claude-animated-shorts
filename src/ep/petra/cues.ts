// E9 — Petra. Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const b = (n: number) => find("sin motores", n, 0.1), ci = (n: number) => find("con ingenio", n, 0.05);
export const T = {
  casi: find("casi sin lluvia"), veinte: find("veinte mil personas"), petra: find("petra"), hace: find("hace unos"), nabateos: find("los nabateos"), incienso: find("del incienso"),
  p1: find("pero cuando llueve", 0, 0.1), agua1: find("el agua baja"), riada: find("una riada"), arrasa: find("lo arrasa todo"),
  b1: b(0), c1: ci(0), presa: find("una presa"), tunel: find("un tunel"), noventa: find("casi noventa metros"), manda: find("manda la riada"), camino: find("otro camino"), tunelT: find("este es el tunel"),
  p2: find("pero si el agua", 0, 0.1), pierde: find("se pierde"),
  b2: b(1), c2: ci(1), canales: find("canales tallados"), tubos: find("tubos de barro"), llevan: find("que llevan el agua"), ciudad: find("hasta la ciudad"), canalesT: find("estos son los canales"),
  p3: find("pero el agua llega", 0, 0.1), arena: find("con arena"),
  b3: b(2), c3: ci(2), estanques: find("pequenos estanques"), detiene: find("se detiene"), fondo: find("se va al fondo"), limpia: find("sigue limpia"), decantadores: find("estos son los decantadores"),
  p4: find("pero en verano", 0, 0.1), meses: find("no llueve en meses"),
  b4: b(3), c4: ci(3), cisternas: find("cientos de cisternas"), guardan: find("que guardan"), invierno: find("todo el invierno"), cisternasT: find("estas son las cisternas"),
  p5: find("pero una fachada", 0, 0.1), suelo: find("desde el suelo"),
  b5: b(4), c5: ci(4), tallar: find("tallar la fachada"), arriba: find("de arriba hacia abajo"), roca: find("la roca que todavia"), piso: find("sirve de piso"), tesoro: find("nacio el tesoro"), cuarenta: find("casi cuarenta metros"), fachadaT: find("esta es la fachada"),
  y363: find("trescientos sesenta y tres"), terremoto: find("un terremoto"), rompio: find("rompio cisternas"), suagua: find("sin su agua"), comercio: find("el comercio"), vaciando: find("se fue vaciando"), siglo: find("siglo tras siglo"),
  mandaselo: find("mandaselo"),
  end: DURATION_S,
};
export { CUTS, WINS };

const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const w of [WINS[3], WINS[6], WINS[10]]) S.push(["whoosh", w - 0.25, -13]);
for (const [a, c] of [[T.b1, T.c1], [T.b2, T.c2], [T.b3, T.c3], [T.b4, T.c4], [T.b5, T.c5]]) S.push(["stamp", a + 0.05, -8], ["strike", a + 0.32, -12], ["chime", c + 0.04, -7]);
for (const a of [T.p1, T.p2, T.p3, T.p4, T.p5]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.petra, T.b2, T.b3, T.b4, T.b5]) S.push(["rewind", a - 0.05, -13]);
for (const a of [T.tunelT, T.canalesT, T.decantadores, T.cisternasT, T.fachadaT]) S.push(["ding", a + 0.05, -9]);
for (const a of [T.casi, T.veinte, T.noventa, T.cuarenta]) S.push(["pop", a, -11]);
S.push(["wind", 0.0, -13], ["camel", T.nabateos + 0.3, -11], ["flood", T.agua1, -7], ["buzzer", T.arrasa + 0.3, -13],
  ["stone", T.presa, -10], ["dig", T.tunel, -11], ["flood", T.manda, -10], ["sink", T.pierde, -11],
  ["chisel", T.canales, -12], ["clack", T.tubos, -12], ["stream", T.llevan, -11], ["sandfall", T.arena, -11],
  ["splash", T.detiene, -12], ["sandfall", T.fondo, -12], ["drip", T.limpia, -12], ["wind", T.meses, -11],
  ["dig", T.cisternas, -12], ["rain", T.guardan, -12], ["splash", T.invierno, -12], ["buzzer", T.suelo + 0.2, -13],
  ["chisel", T.arriba, -10], ["chisel", T.piso, -11], ["fanfare", T.cuarenta, -10],
  ["quake", T.terremoto, -7], ["crack", T.rompio, -9], ["camel", T.comercio, -13], ["wind", T.vaciando, -11], ["sad", T.siglo, -13]);
export const SFX = S;
