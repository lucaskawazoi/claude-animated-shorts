// E10 — Galeón de Manila. Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const ci = (n: number) => find("con ingenio", n, 0.05);
export const T = {
  un: find("un barco al ano"), veces: find("a veces dos"), unio: find("y unio"), tres: find("tres continentes"),
  cebu: find("cebu"), mil: find("mil quinientos"), nohay: find("no hay motores"), ningun: find("ningun barco"), volver: find("volver a america"), viento: find("el viento sopla"), contra: find("en contra"),
  b1: find("como vuelves", 0, 0.1), c1: ci(0), fraile: find("el fraile"), urdaneta: find("andres de urdaneta"), norte: find("hacia el norte"), japon: find("altura de japon"), vientos: find("los vientos"), corriente: find("una corriente"), este: find("hacia el este"), tornaT: find("esta es la ruta"),
  p2: find("pero el viaje", 0, 0.1), cuatro: find("dura cuatro"), seis: find("hasta seis meses"), abierto: find("mar abierto"),
  b2: find("solucion barcos", 0, 0.1), c2: find("barcos enormes"), barcos: find("barcos enormes"), filipinas: find("en filipinas"), maderas: find("maderas tropicales"), molave: find("como el molave"), galeonT: find("este es el galeon"),
  p3: find("pero en medio", 0, 0.1), rios: find("no hay rios"), agua: find("para cargar agua"),
  b3: find("como bebes", 0, 0.1), c3: ci(1), miles: find("miles de tinajas"), bajo: find("bajo cubierta"), colgadas: find("otras colgadas"), chubasco: find("cada chubasco"), tinajasT: find("estas son las tinajas"),
  p4: find("pero los mercaderes", 0, 0.1), europeos: find("productos europeos"), plata0: find("quieren plata"),
  b4: find("solucion plata", 0, 0.1), c4: find("plata de las minas"), minas: find("plata de las minas"), mexico: find("mexico"), potosi: find("potosi"), acunada: find("acunada en monedas"), medio: find("medio mundo"), realT: find("este es el real"),
  p5: find("pero un barco cargado", 0, 0.1), blanco: find("un blanco"), y1743: find("setecientos cuarenta"), guerra: find("barco de guerra"), capturo: find("capturo el galeon"), millon: find("un millon"),
  ultimo: find("el ultimo galeon"), y1815: find("ochocientos quince"), historiadores: find("para muchos historiadores"), mundial: find("comercio mundial"),
  manda: find("mandaselo"),
  end: DURATION_S,
};
export { CUTS, WINS };

const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const w of [WINS[3], WINS[6], WINS[10]]) S.push(["whoosh", w - 0.25, -13]);
for (const a of [T.c2, T.c4]) S.push(["chime", a, -9]);
for (const [a, c] of [[T.b1, T.c1], [T.b3, T.c3]]) S.push(["stamp", a + 0.05, -8], ["strike", a + 0.32, -12], ["chime", c + 0.04, -7]);
for (const a of [T.ningun, T.p2, T.p3, T.p4, T.p5]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.cebu, T.b2, T.b3, T.b4]) S.push(["rewind", a - 0.05, -13]);
for (const a of [T.tornaT, T.galeonT, T.tinajasT, T.realT]) S.push(["ding", a + 0.05, -9]);
for (const a of [0.05, T.un, T.veces, T.tres, T.cuatro, T.seis]) S.push(["pop", a, -11]);
S.push(["waves", 0.0, -14], ["gulls", 0.8, -16], ["creak", T.cebu + 0.3, -13], ["wind", T.viento - 0.2, -8], ["buzzer", T.contra + 0.2, -13],
  ["sail", T.norte, -11], ["wind", T.vientos, -12], ["stream", T.corriente, -12], ["waves", T.abierto, -12],
  ["axe", T.barcos, -11], ["thud", T.maderas, -11], ["axe", T.molave, -11], ["buzzer", T.agua, -13],
  ["clack", T.miles, -11], ["clack", T.miles + 0.5, -12], ["rain", T.chubasco - 0.3, -10], ["splash", T.chubasco + 0.6, -12],
  ["buzzer", T.europeos + 0.3, -13], ["coins", T.plata0, -9], ["dig", T.minas, -12], ["coins", T.acunada, -9], ["coins", T.medio, -11],
  ["cannon", T.capturo - 0.4, -8], ["cannon", T.capturo + 0.1, -9], ["cannon", T.capturo + 0.6, -10], ["coins", T.millon, -9],
  ["sad", T.y1815, -14], ["fanfare", T.mundial - 0.1, -9], ["gulls", T.manda, -15]);
export const SFX = S;
