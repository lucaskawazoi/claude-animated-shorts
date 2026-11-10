// E5 — Machu Picchu. Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const b = (n: number) => find("sin motores", n, 0.1), ci = (n: number) => find("con ingenio", n, 0.05);
export const T = {
  lluvia: find("dos metros de lluvia"), fallas: find("fallas sismicas"), pie: find("sigue en pie"),
  peru: find("peru"), inca: find("el inca"), picos: find("entre dos picos"),
  p1: find("pero la ladera", 0, 0.1), desliza: find("se desliza"),
  b1: b(0), c1: ci(0), escalones: find("escalones gigantes"), terrazas: find("en terrazas planas"), andenes: find("estos son los andenes"),
  p2: find("pero con tanta lluvia", 0, 0.1), abajo: find("se viene abajo"),
  b2: b(1), c2: ci(1), debajo: find("debajo de cada"), tierra: find("tierra luego arena"), arena: find("luego arena"), grava: find("luego grava"), piedras: find("luego piedras"), escurre: find("el agua se escurre"), sesenta: find("sesenta por ciento"), drenaje: find("este es el drenaje"),
  p3: find("pero aqui la tierra", 0, 0.1), tiembla: find("la tierra tiembla"),
  b3: b(2), c3: ci(2), talladas: find("piedras talladas"), muros: find("muros inclinados"), trapecio: find("forma de trapecio"), aguanta: find("mejor aguanta"), silleria: find("esta es la silleria"),
  p4: find("pero cientos", 0, 0.1),
  b4: b(3), c4: ci(3), manantial: find("un manantial"), canal: find("un canal de piedra"), dieciseis: find("dieciseis fuentes"), fuentes: find("estas son las fuentes"),
  p5: find("pero y la piedra", 0, 0.1), carreta: find("ninguna carreta"),
  b5: b(4), c5: ci(4), cantera: find("la cantera esta"), partida: find("viene partida"), labra: find("se labra"),
  siglo: find("un siglo despues"), vacia: find("quedo vacia"), espanoles: find("los espanoles"), intacta: find("casi intacta"),
  manda: find("mandaselo"),
  end: DURATION_S,
};
export { CUTS, WINS };

const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const w of [WINS[3], WINS[6], WINS[10]]) S.push(["whoosh", w - 0.25, -13]);
for (const [a, c] of [[T.b1, T.c1], [T.b2, T.c2], [T.b3, T.c3], [T.b4, T.c4], [T.b5, T.c5]]) S.push(["stamp", a + 0.05, -8], ["strike", a + 0.32, -12], ["chime", c + 0.04, -7]);
for (const a of [T.p1, T.p2, T.p3, T.p4, T.p5]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.peru, T.b2, T.b3, T.b4, T.b5]) S.push(["rewind", a - 0.05, -13]);
for (const a of [T.andenes, T.drenaje, T.silleria, T.fuentes]) S.push(["ding", a + 0.05, -9]);
for (const a of [T.lluvia + 0.05, T.fallas, T.pie, T.sesenta, T.dieciseis]) S.push(["pop", a, -11]);
S.push(["rain", 0.0, -12], ["quake", T.fallas, -12], ["slide", T.desliza - 0.3, -10], ["stone", T.escalones + 0.2, -11], ["stone", T.terrazas, -12], ["rain", T.p2, -11], ["mud", T.abajo - 0.2, -10],
  ["clack", T.tierra, -13], ["clack", T.arena, -13], ["clack", T.grava, -13], ["clack", T.piedras, -12], ["drip", T.escurre, -11],
  ["quake", T.tiembla - 0.3, -8], ["stone", T.talladas, -11], ["stream", T.manantial, -12], ["fountain", T.dieciseis, -11], ["buzzer", T.carreta, -12],
  ["crack", T.partida, -9], ["chisel", T.labra, -12], ["wind", T.siglo, -12], ["buzzer", T.espanoles + 0.5, -14], ["fanfare", T.intacta - 0.1, -8], ["llama", T.peru + 1.0, -14]);
export const SFX = S;
