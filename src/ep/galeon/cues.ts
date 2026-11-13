// E10 — Galeón de Manila. Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const ci = (n: number) => find("con ingenio", n, 0.05);
export const T = {
  un: find("un barco al ano"), veces: find("a veces dos"), unio: find("y unio"), tres: find("tres continentes"),
  cebu: find("cebu"), mil: find("mil quinientos"), nohay: find("no hay motores"), ningun: find("ningun barco"), volver: find("volver a america"), viento: find("el viento sopla"), contra: find("en contra"),
  b1: find("como vuelves", 0, 0.1), c1: ci(0), fraile: find("el fraile"), urdaneta: find("andres de urdaneta"), norte: find("hacia el norte"), japon: find("altura de japon"), vientos: find("los vientos"), corriente: find("una corriente"), este: find("hacia el este"), tornaT: find("esta es la ruta"),
  p2: find("pero el viaje", 0, 0.1), cuatro: find("dura cuatro"), seis: find("hasta seis meses"), abierto: find("mar abierto"),
  cuatroW: find("cuatro cinco", 0, 0.03), cincoW: find("cinco hasta", 0, 0.03), seisW: find("seis meses en mar", 0, 0.03), olas: find("de olas"),
  b2: find("solucion barcos", 0, 0.1), c2: find("barcos enormes"), barcos: find("barcos enormes"), filipinas: find("en filipinas"), maderas: find("maderas tropicales"), molave: find("como el molave"), galeonT: find("este es el galeon"),
  p3: find("pero en medio", 0, 0.1), rios: find("no hay rios"), agua: find("para cargar agua"),
  b3: find("como bebes", 0, 0.1), c3: ci(1), miles: find("miles de tinajas"), bajo: find("bajo cubierta"), colgadas: find("otras colgadas"), chubasco: find("cada chubasco"), tinajasT: find("estas son las tinajas"),
  p4: find("pero los mercaderes", 0, 0.1), europeos: find("productos europeos"), plata0: find("quieren plata"),
  b4: find("solucion plata", 0, 0.1), c4: find("plata de las minas"), minas: find("plata de las minas"), mexico: find("mexico"), potosi: find("potosi"), acunada: find("acunada en monedas"), medio: find("medio mundo"), realT: find("este es el real"),
  p5: find("pero un barco cargado", 0, 0.1), blanco: find("un blanco"), y1743: find("setecientos cuarenta"), guerra: find("barco de guerra"), capturo: find("capturo el galeon"), millon: find("un millon"),
  ultimo: find("el ultimo galeon"), zarpo: find("zarpo"), y1815: find("ochocientos quince"), historiadores: find("para muchos historiadores"), mundial: find("comercio mundial"),
  manda: find("mandaselo"),
  cruz: find("cruzando"), porque: find("porque"), olasW: find("olas", 0, 0.03), noQ: find("no quieren"),
  end: DURATION_S,
};
export { CUTS, WINS };
/** cortes duros extras (ritmo: um a cada ~4–5 s), todos a ≥1,5 s dos 7 da régua */
export const X = {
  cebu: T.cebu, viento: T.viento, vientos: T.vientos, p2: T.p2, b2: T.b2, maderas: T.maderas, p3: T.p3,
  colgadas: T.colgadas, p4: T.p4, b4: T.b4, medio: CUTS[5] + 1.57, p5: T.p5, ultimo: T.ultimo,
  // pré-crítica de ritmo (13/11): o mapa das tentativas no «cruzando» e o mapa do último galeão no «historiadores»
  cruz: T.cruz, hist: T.historiadores,
};
/** tinajas do porão: caem uma a uma do «¿Cómo bebes?» até o «bajo cubierta» (progresso linear 0..1) */
export const JARS: [number, number] = [CUTS[4] - 0.45, T.bajo + 0.2]; // já há tinajas caindo no 1º quadro do porão
/** a mordida no real de a ocho (o mercador testa a prata) */
export const BITE = T.realT + 0.72;
/** pacotes que caem na América no «Mándaselo»: lançamento a cada 0,3 s, 1 s de voo */
export const PARCELS = Array.from({ length: 8 }, (_, i) => T.manda + 0.05 + i * 0.3);
/** batidas do machado no molave = mínimos do braço na pose "chisel" (|sen 6t| = 1) */
export const AXE = [72, 73, 74].map((k) => (Math.PI / 2 + k * Math.PI) / 6);
/** golpes da cunhagem (a 1ª no «acuñada», logo depois do corte 6) */
export const MINT = [0, 1, 2].map((k) => CUTS[5] + 0.03 + k * 0.5);

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
  ["rain", T.chubasco - 0.3, -10], ["splash", T.chubasco + 0.6, -12],
  ["buzzer", T.europeos + 0.3, -13], ["coins", T.plata0, -9], ["dig", T.minas, -12], ["coins", T.acunada, -9], ["coins", T.medio, -11],
  ["cannon", T.capturo - 0.4, -8], ["cannon", T.capturo + 0.1, -9], ["cannon", T.capturo + 0.6, -10], ["coins", T.millon, -9],
  ["wind", CUTS[3] + 0.05, -10], ["rain", CUTS[3], -13], ["creak", T.olas - 0.5, -11], ["splash", T.olas + 0.15, -10], ["creak", T.olas + 0.7, -12],
  ["axe", AXE[0], -12], ["axe", AXE[1], -12], ["strike", MINT[0], -11], ["strike", MINT[1], -12], ["strike", MINT[2], -12],
  ["thud", T.p5 + 0.75, -13], ["thud", T.p5 + 1.15, -13], ["sail", T.zarpo, -10],
  ["sad", T.y1815, -14], ["fanfare", T.mundial - 0.1, -9], ["gulls", T.manda, -15]);
// pré-crítica de ritmo (13/11): motor que leva ✖, barcos devolvidos pelo vento no mapa, fogos em Acapulco, machado que voa,
// casco que quase cede, arco-íris, tinajas caindo, prata espirrando da mina, mordida na moeda, pacotes caindo na América
S.push(["pop", T.nohay, -10], ["smoke", T.nohay + 0.1, -15], ["buzzer", T.nohay + 0.32, -12], ["pop", T.nohay + 0.85, -13],
  ["sail", X.cruz + 0.05, -12], ["wind", T.porque - 0.1, -11],
  ["confetti", CUTS[2] + 0.65, -12], ["pop", CUTS[2] + 0.95, -14],
  ["qe-boing", AXE[2] + 0.05, -10], ["crack", T.olasW + 0.05, -11], ["pop", T.olasW + 0.62, -13], ["cheer", T.galeonT + 0.35, -16],
  ["slide", X.p4 + 0.2, -13], ["gravel", T.potosi - 0.05, -12], ["crack", BITE, -10],
  ["whoosh", X.hist - 0.15, -14]);
for (let k = 0; k < 6; k++) S.push(["clack", JARS[0] + 0.45 + k * 0.7, -12]);
for (const a of PARCELS.filter((_, i) => i % 2 === 0)) S.push(["thud", a + 1.0, -14]);
export const SFX = S;
