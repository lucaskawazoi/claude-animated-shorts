// E15 — Angkor Wat. Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const ci = (n: number) => find("con ingenio", n, 0.05);
export const T = {
  // gancho
  monumento: find("el monumento"), grande: find("mas grande del mundo"), mundo: find("del mundo"),
  millones0: find("millones de bloques", 0), piedra0: find("de piedra"), todo0: find("y todo apoyado"), arena0: find("sobre arena"),
  camboya: find("camboya", 0), hace: find("hace casi"), novecientos: find("novecientos"),
  nohay: find("no hay motores"), gruas: find("ni gruas"), camiones: find("ni camiones"),
  solo: find("solo piedra"), piedra: find("piedra madera"), madera: find("madera cuerda"), cuerda: find("cuerda y miles"), manos: find("miles de manos"),
  rey: find("el rey"), sury: find("suryavarman"), quiere: find("quiere un templo"), templo: find("un templo con"), montana: find("montana sagrada"), sagrada: find("sagrada"),
  p1: find("pero la piedra", 0, 0.1), treinta: find("treinta kilometros"), kulen: find("monte kulen"),
  // 1: os canais
  b1: find("como traes", 0, 0.1), sinCam: find("sin camiones"), c1: ci(0), agua: find("por agua"),
  segun1: find("segun los arqueologos"), viajan: find("viajan en balsas"), balsas: find("balsas"), canales0: find("por canales"), rios: find("y rios"),
  cerca: find("cerca de la obra"), estosCanales: find("estos son los canales"),
  // 2: o fosso
  p2: find("pero el suelo", 0, 0.1), arena1: find("es arena"), bajo: find("bajo tanto peso"), mover: find("se podria mover"),
  b2: find("como la mantienes", 0, 0.1), sinHorm: find("sin hormigon"), c2: ci(1), foso0: find("un foso"), doscientos: find("doscientos metros"),
  ancho: find("de ancho"), alrededor: find("alrededor de todo"),
  segun2: find("segun los expertos"), agua2: find("el agua mantiene"), humeda: find("humeda"), arenaSuelo: find("la arena del suelo"),
  todoAno: find("todo el ano"), asi: find("y asi sigue"), firme: find("sigue firme"), esteFoso: find("este es el foso"),
  // 3: o recheio
  p3: find("pero la arenisca", 0, 0.1), lejos: find("muy lejos"), tanGrande: find("tan grande"), necesita: find("necesita muchisima"),
  sol: find("solucion", 0, 0.1), noSeVe: find("lo que no se ve"), laterita: find("laterita"), rojiza: find("una piedra rojiza"),
  corta: find("se corta"), blanda: find("blanda"), endurece: find("se endurece"), aire: find("al aire"),
  tallada: find("la arenisca tallada"), seVe: find("para lo que se ve"), esteRelleno: find("este es el relleno"),
  // 4: os buracos
  p4: find("pero hay que subir", 0, 0.1), tonelada: find("una tonelada"), alto: find("lo alto de las torres"),
  prob: find("lo mas probable", 0, 0.05), tallan: find("tallan agujeros"), pequenos: find("agujeros pequenos"),
  donde: find("donde meten"), meten: find("meten estacas"), estacas: find("estacas de madera"), atarlos: find("para atarlos"), cuerdas: find("con cuerdas"),
  subirlos: find("y subirlos"), todavia: find("todavia se ven"), estosAg: find("estos son los agujeros"),
  // desfecho
  giro: find("y el giro"), nunca: find("nunca quedo"), abandonado: find("abandonado"), monjes: find("los monjes"), siglo: find("siglo tras siglo"),
  hoy: find("y hoy"), bandera: find("la bandera"),
  manda: find("mandaselo"), castillos: find("castillos de arena"), playa: find("la playa"),
  end: DURATION_S,
};
export { CUTS, WINS };
const fr = (x: number) => Math.round(x * 30) / 30;
/** cortes duros EXTRA (ritmo do lote 3: um corte a cada ~4 s; os 7 da régua continuam), nas viradas de frase, todos ≥1,5 s de um corte da régua */
export const XC = [T.millones0, T.camboya, T.rey, T.segun1, T.p2, T.foso0, T.asi, T.sol, T.rojiza, T.tallada, T.donde, T.giro, T.hoy].map(fr);
const X13 = XC[12];

// tempos derivados que o mundo e o painel compartilham
/** a tentativa que dá errado: a torre na areia seca afunda e entorta (✖); no «¿Cómo la mantienes?» volta de ré */
export const SINK0 = T.mover - 0.08, SINK1 = T.mover + 0.5;
/** o fosso enche a partir da bacia do canal (lado oeste) e corre em volta do templo */
export const FILL0 = T.foso0 + 0.25, FILL1 = T.alrededor + 0.45;
/** o bloco sobe na roldana */
export const LIFT0 = T.subirlos + 0.05, LIFT1 = CUTS[6] + 0.35;

// a abertura escolhida (a mixagem roda no bun: OPEN=b ./cues-json.sh …); no navegador o som não é usado
const OPEN = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.OPEN ?? "c";
/** abertura c: o operário cai sentado (som do baque, poeira no mundo) */
export const SIT_T = 1.3;
const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const c of XC) S.push(["whoosh", c - 0.2, -15]);
for (const w of [WINS[3], WINS[6], WINS[10]]) S.push(["whoosh", w - 0.25, -13]);
if (OPEN === "a") { S.push(["ss-rise", 0.0, -9], ["quake", 0.05, -14]); for (let k = 0; k < 8; k++) S.push(["clack", 0.25 + k * 0.26, -12 - (k % 2) * 2]); }
else if (OPEN === "b") S.push(["stream", 0.0, -11], ["ak-pole", 0.25, -10], ["splash", 0.75, -12], ["whoosh", 1.05, -11], ["gong", 1.75, -10]);
else S.push(["ak-birds", 0.15, -10], ["whoosh", 0.4, -13], ["qe-boing", 0.95, -9], ["thud", SIT_T, -8], ["whoosh", SIT_T + 0.15, -12], ["ak-birds", 1.0, -14]);
for (const [a, c] of [[T.b1, T.c1], [T.b2, T.c2]]) S.push(["stamp", a + 0.05, -8], ["strike", a + 0.32, -12], ["chime", c + 0.04, -7]);
S.push(["chime", T.sol + 0.05, -8], ["chime", T.prob + 0.05, -11]);
for (const a of [T.p1, T.p2, T.p3, T.p4]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.camboya, T.b2, T.asi]) S.push(["rewind", a - 0.05, -13]);
for (const a of [T.estosCanales, T.esteFoso, T.esteRelleno, T.estosAg]) S.push(["ding", a + 0.05, -9]);
for (const a of [OPEN === "c" ? 1.75 : T.grande, T.millones0 + 0.05, T.nohay + 0.05, T.gruas + 0.05, T.camiones + 0.05, T.treinta, T.doscientos, T.tonelada, T.kulen]) S.push(["pop", a, -11]);
S.push(
  ["wind", 0.0, -17], ["sandfall", T.arena0, -11], ["crumble", T.camboya + 0.25, -12],
  ["crowd", T.nohay, -17], ["drag", CUTS[0] + 0.15, -11], ["sh-log", CUTS[0] + 0.9, -13],
  ["pop", T.piedra, -12], ["pop", T.madera, -12], ["pop", T.cuerda, -12], ["crowd", T.manos, -13], ["cheer", T.manos + 0.35, -16],
  ["gong", T.rey + 0.05, -10], ["chime", T.templo + 0.1, -11], ["bells", T.sagrada, -15],
  ["buzzer", T.sinCam + 0.1, -14], ["flood", T.agua - 0.05, -10], ["stream", T.agua + 0.5, -13],
  ["stream", T.segun1, -15], ["ak-pole", T.segun1 + 0.5, -11], ["ak-pole", T.viajan + 0.4, -11], ["ak-pole", T.rios + 0.2, -11], ["creak", T.balsas, -15],
  ["drag", CUTS[2] + 0.2, -11], ["sh-log", CUTS[2] + 0.6, -13],
  ["ak-sandslide", T.arena1, -13], ["thud", T.bajo + 0.1, -10], ["thud", T.bajo + 0.45, -12],
  ["ak-sandslide", SINK0, -8], ["sink", SINK0 + 0.05, -9], ["buzzer", SINK0 + 0.45, -13], ["qe-boing", SINK0 + 0.15, -12], ["thud", SINK1 + 0.2, -11],
  ["flood", FILL0 - 0.1, -9], ["waterfall", FILL0 + 0.7, -14],
  ["drip", T.agua2 + 0.1, -12], ["vn-squish", T.humeda, -12], ["drip", T.humeda + 0.45, -13], ["bubble", T.arenaSuelo, -14], ["clack", T.todoAno, -15], ["clack", T.todoAno + 0.25, -15],
  ["thud", T.asi + 0.25, -10], ["thud", T.asi + 0.6, -12], ["cheer", T.firme + 0.1, -15], ["waves", T.esteFoso, -15],
  ["river", CUTS[4] + 0.1, -16], ["creak", CUTS[4] + 0.4, -14], ["sad", T.necesita + 0.1, -13],
  ["clack", T.laterita, -11], ["clack", T.laterita + 0.2, -13], ["clack", T.laterita + 0.4, -12], ["clack", T.laterita + 0.6, -14],
  ["dig", T.corta - 0.05, -10], ["vn-squish", T.blanda, -8], ["thud", T.blanda + 0.4, -12], ["ak-harden", T.endurece + 0.05, -8], ["wind", T.aire, -15], ["sh-click", T.aire + 0.2, -10],
  ["slide", T.tallada + 0.1, -12], ["clack", T.tallada + 0.55, -12], ["clack", T.tallada + 1.1, -12], ["chime", T.seVe, -12],
  ["creak", CUTS[5] + 0.3, -14], ["wind", CUTS[5] + 0.8, -16],
  ["chisel", T.tallan, -9], ["chisel", T.tallan + 0.4, -11], ["chisel", T.pequenos + 0.3, -11],
  ["ak-peg", T.meten + 0.1, -8], ["ak-peg", T.estacas + 0.25, -9], ["vn-rope", T.atarlos, -10], ["qe-taut", T.cuerdas + 0.1, -10],
  ["qe-heave", T.subirlos - 0.1, -10], ["vn-lift", LIFT0, -9], ["creak", LIFT0 + 0.5, -13],
  ["wind", CUTS[6] + 0.1, -16], ["pop", T.estosAg + 0.2, -13],
  ["giro", T.giro, -9], ["bells", T.monjes, -12], ["whoosh", T.siglo, -14],
  ["clack", T.siglo + 0.15, -15], ["clack", T.siglo + 0.4, -15], ["clack", T.siglo + 0.65, -15], ["clack", T.siglo + 0.9, -15],
  ["ak-flag", X13 + 0.05, -11], ["chime", T.bandera + 0.05, -10],
  ["fanfare", T.manda - 0.15, -8], ["confetti", T.manda + 0.3, -12], ["sandfall", T.castillos, -13], ["waves", T.playa, -15],
);
export const SFX = S;
