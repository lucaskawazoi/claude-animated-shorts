// E8 — Catedral gótica (Notre-Dame de París). Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const ci = (n: number) => find("con ingenio", n, 0.05);
export const T = {
  quienes: find("quienes pusieron"), primera: find("primera piedra"), nunca: find("nunca la vieron"), vitrales0: find("vitrales enormes"),
  paris: find("paris"), nohay: find("no hay motores"), acero0: find("vigas de acero"), compu: find("computadoras"),
  piedra: find("piedra madera"), madera: find("madera hierro"), hierro: find("hierro y musculo"), musculo: find("musculo"),
  quieren: find("quieren una catedral"), altisima: find("altisima"), luz: find("llena de luz"),
  p1: find("pero un techo", 0, 0.1), empuja: find("empuja las paredes"), fuera1: find("hacia fuera"), por: find("por eso"), gruesos: find("muros gruesos"), pequenas: find("ventanas pequenas"),
  b1: find("como subes tan alto", 0, 0.1), pesoR: find("el peso abra"), abra: find("abra las paredes"), c1: ci(0), arco: find("un arco en punta"), forma: find("su forma"), manda0: find("manda el peso"), abajo: find("mas hacia abajo"), pilaresA: find("hacia los pilares"), menos: find("empuja menos"), lados: find("los lados"), ojival: find("este es el arco ojival"),
  p2: find("pero la boveda de piedra", 0, 0.1), pesando: find("sigue pesando"), toneladas: find("toneladas"), muro: find("todo el muro"),
  b2: find("solucion nervios", 0, 0.1), c2: find("nervios de piedra"), nervios: find("nervios de piedra"), cruzan: find("se cruzan"), techo2: find("en el techo"), cae: find("cae solo"), pilares: find("pocos pilares"), mesa: find("una mesa"), patas: find("sus patas"), cruceria: find("esta es la boveda"),
  p3: find("pero alla arriba", 0, 0.1), empujando: find("sigue empujando"),
  b3: find("como la frenas", 0, 0.1), c3: ci(1), brazos: find("brazos de piedra"), sostienen: find("que apoyan"), lejos: find("desde lejos"), llevan: find("y llevan"), mano: find("ese empuje"), suelo: find("el suelo"), arbotantes: find("estos son los arbotantes"),
  p4: find("pero hay que subir", 0, 0.1), enormes: find("piedras enormes"), treinta: find("treinta metros"),
  b4: find("como las subes", 0, 0.1), c4: ci(2), rueda: find("una rueda de madera"), hombres: find("hombres caminando"), paso: find("cada paso"), eje: find("girar el eje"), cuerda: find("enrolla la cuerda"),
  grande: find("mucho mas grande"), eje2: find("que el eje"), fuerza: find("la fuerza"), multiplica: find("se multiplica"), grua: find("esta es la grua"),
  p5: find("pero adentro", 0, 0.1), oscuro: find("sigue oscuro"),
  b5: find("como el muro", 0, 0.1), c5: find("se puede abrir"), como: find("como el muro"), yaNo: find("ya no carga"), abrir: find("se puede abrir"), vidrio: find("vidrio tenido"), tenido: find("tenido con"), oxidos: find("oxidos de metal"), plomo: find("tiras de plomo"), roseton: find("el roseton"), trece: find("casi trece metros"), vitralesT: find("estos son los vitrales"),
  y2019: find("en dos mil diecinueve"), incendio: find("un incendio"), destruyo: find("destruyo el techo"), rehacer: find("para rehacerlo"), carpinteros: find("los carpinteros"), labrar: find("a labrar"), hacha: find("a hacha"), ochocientos: find("hace ochocientos"),
  manda: find("mandaselo"),
  end: DURATION_S,
};
export { CUTS, WINS };
/** ritmo do machado: golpes em labrar, labrar+P e hacha (o som «axe» cai nesses instantes) */
export const AXE_P = (T.hacha - T.labrar) / 2;

const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const w of [WINS[3], WINS[6], WINS[10]]) S.push(["whoosh", w - 0.25, -13]);
for (const a of [T.c2, T.c5]) S.push(["chime", a, -9]);
for (const [a, c] of [[T.b1, T.c1], [T.b3, T.c3], [T.b4, T.c4]]) S.push(["stamp", a + 0.05, -8], ["strike", a + 0.32, -12], ["chime", c + 0.04, -7]);
for (const a of [T.p1, T.p2, T.p3, T.p4, T.p5]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.paris, T.b2, T.b3, T.b4, T.b5]) S.push(["rewind", a - 0.05, -13]);
for (const a of [T.ojival, T.cruceria, T.arbotantes, T.grua, T.vitralesT]) S.push(["ding", a + 0.05, -9]);
for (const a of [0.05, T.nunca, T.vitrales0, T.trece, T.piedra, T.madera, T.hierro, T.musculo, T.mesa]) S.push(["pop", a, -11]);
S.push(["bells", 0.0, -12], ["stone", T.primera + 0.25, -11], ["glass", T.vitrales0 + 0.2, -12], ["chime", T.luz, -12],
  ["crack", T.empuja + 0.5, -10], ["stone", T.gruesos, -11],
  ["thud", T.pesoR + 0.25, -10], ["crack", T.abra + 0.1, -9], ["stone", T.arco, -11], ["thud", T.forma + 0.3, -11],
  ["thud", T.pesando - 0.15, -8], ["crack", T.toneladas + 0.25, -10], ["crumble", T.muro, -12],
  ["stone", T.nervios, -12], ["stone", T.cruzan, -12], ["slide", T.cae + 0.3, -12], ["crack", T.empujando, -10],
  ["stone", T.brazos, -10], ["thud", T.sostienen, -10], ["thud", T.suelo, -11],
  ["drag", T.enormes, -12], ["wheel", T.rueda, -10], ["wheel", T.paso, -11], ["creak", T.cuerda, -11], ["thud", T.grua - 0.3, -10], ["buzzer", T.oscuro, -13],
  ["glass", T.vidrio, -10], ["glass", T.plomo, -12], ["glass", T.roseton + 0.3, -10],
  ["blaze", T.incendio, -9], ["crumble", T.destruyo, -9], ["axe", T.labrar - AXE_P, -13], ["axe", T.labrar, -9], ["axe", T.labrar + AXE_P, -10], ["axe", T.hacha, -9], ["axe", T.hacha + AXE_P, -12],
  ["bells", T.ochocientos, -11], ["fanfare", T.manda - 0.2, -11]);
export const SFX = S;
