// E14 — Santa Sofía. Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const ci = (n: number) => find("con ingenio", n, 0.05);
export const T = {
  // gancho
  construida: find("construida"), seis0: find("seis anos"), una: find("una cupula de mas"), treinta: find("treinta metros"), flotar0: find("parece flotar", 0),
  yfue: find("y fue la iglesia"), grande: find("mas grande del mundo"), quinientos0: find("quinientos anos"),
  constantinopla: find("constantinopla", 0), ano532: find("ano quinientos treinta"),
  // o canteiro vazio
  nohay: find("no hay motores"), acero: find("ni acero"), hormigon: find("ni hormigon"),
  solo: find("solo ladrillo"), ladrillo: find("ladrillo piedra"), piedra: find("piedra mortero"), mortero: find("mortero y"), miles: find("miles de obreros"),
  emperador: find("y el emperador"), justiniano: find("justiniano"), quiere: find("quiere una"), cupula0: find("cupula redonda gigante"), gigante: find("gigante"),
  planta: find("planta cuadrada"), cuadrada: find("cuadrada"),
  // 1: o círculo sobre o quadrado → pechinas
  p1: find("pero un circulo", 0, 0.1), apoya: find("se apoya"), bien: find("bien sobre"), esquinas: find("en las esquinas"), huecos: find("quedan huecos"),
  b1: find("como pones", 0, 0.1), cuatroPilares: find("cuatro pilares"), c1: ci(0),
  entre: find("entre arco"), arco: find("arco y arco"), triangulos: find("cuatro triangulos"), curvos: find("curvos"), pasan: find("que pasan"),
  cuadrado: find("del cuadrado"), alCirculo: find("al circulo"), pechinas: find("estas son las pechinas"),
  // 2: o empuxo → semicúpulas e contrafortes
  p2: find("pero una cupula tan", 0, 0.1), empuja: find("empuja hacia afuera"), afuera: find("afuera"), abre: find("abre los arcos"),
  s2: find("solucion", 0, 0.1), dosLados: find("a dos lados"), medias: find("medias cupulas"), apoyan: find("la apoyan"), hombros: find("como hombros"),
  otrosDos: find("a los otros dos"), contrafuertes: find("contrafuertes"), macizos: find("macizos"), porFuera: find("por fuera"),
  empuje: find("el empuje baja"), baja0: find("baja por ellos"), suelo: find("hasta el suelo"), semicupulas: find("estas son las semicupulas"),
  // 3: o escuro → 40 janelas
  p3: find("pero una cupula de ladrillo", 0, 0.1), oscura: find("es oscura"), dentro: find("por dentro"),
  b2: find("como la llenas", 0, 0.1), luz0: find("de luz sin"), electricidad: find("electricidad"), c2: ci(1),
  cuarenta: find("cuarenta ventanas"), base: find("en la base"), junto: find("una junto a otra"), otra: find("a otra"),
  entra: find("la luz entra"), debajo: find("por debajo"), flotar1: find("parece flotar", 1), anillo: find("un anillo de luz"), ventanas: find("estas son las ventanas"),
  // 4: o terremoto → cúpula nova
  p4: find("pero constantinopla", 0, 0.1), tiembla: find("tiembla"), ano558: find("en el ano"), terremoto: find("tras un terremoto"),
  cae: find("la cupula se vino"), vino: find("se vino abajo"),
  b3: find("como la rehaces", 0, 0.1), caer: find("vuelva a caer"), c3: ci(2),
  levantan: find("la levantan"), seis1: find("seis metros"), alta: find("mas alta"), curva: find("mas curva"),
  asi: find("asi el peso"), baja1: find("baja mas recto"), recto: find("recto"), menos: find("empuja menos"), lados: find("hacia los lados"),
  nueva: find("esta es la cupula nueva"),
  // desfecho
  giro: find("y el giro"), iglesia: find("fue iglesia"), novecientos: find("novecientos"), mezquita0: find("mezquita casi"), quinientos1: find("casi quinientos"),
  museo: find("museo"), hoy: find("y hoy otra vez"), mezquita1: find("vez mezquita"),
  su: find("y su cupula"), reparada: find("reparada"), varias: find("varias veces"), sigue: find("sigue arriba"),
  manda: find("mandaselo"),
  end: DURATION_S,
};
export { CUTS, WINS };
const fr = (x: number) => Math.round(x * 30) / 30;
/** cortes duros EXTRA (ritmo do lote 3: um corte a cada ~4–5 s; os 7 da régua continuam), nas viradas de frase, ≥1,5 s dos cortes da régua */
export const XC = [T.una - 0.02, T.yfue - 0.02, T.emperador - 0.02, T.b1 + 0.03, T.p2 + 0.03, T.dosLados - 0.02, T.p3 + 0.03,
  T.cuarenta - 0.02, T.entra - 0.02, T.p4 + 0.03, T.levantan - 0.05, T.giro - 0.02, T.museo - 0.04, T.su - 0.02].map(fr);

// tempos derivados que o mundo e o painel compartilham
export const NWIN = 40;
/** instante em que a janela k (0..39) acende: «cuarenta ventanas … una junto a otra» */
export const winAt = (k: number) => T.cuarenta + 0.1 + (k * (T.otra + 0.25 - T.cuarenta - 0.1)) / (NWIN - 1);
/** a tentativa que dá errado: a cúpula pousa nas 4 cristas, balança, tomba na quina vazia e cai (✖) */
export const LAND = T.apoya + 0.05, TIP0 = T.huecos + 0.05, CRASH = T.huecos + 0.55;
/** o colapso de 558 */
export const FALL0 = T.cae + 0.05, FALL1 = T.cae + 0.75;

// a abertura escolhida (a mixagem roda no bun: OPEN=b ./cues-json.sh …); no navegador o som não é usado
const OPEN = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.OPEN ?? "a";
const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const c of XC) S.push(["whoosh", c - 0.2, -15]);
for (const w of [WINS[3], WINS[6], WINS[10]]) S.push(["whoosh", w - 0.25, -13]);
if (OPEN === "a") { S.push(["ss-rise", 0.0, -8], ["ss-ffwd", 0.0, -12], ["stone", 0.25, -12], ["stone", 0.5, -12], ["stone", 0.75, -13], ["thud", 1.33, -6], ["quake", 1.34, -12], ["ding", 1.5, -10]); }
else if (OPEN === "b") S.push(["ss-bricks", 0.0, -7], ["clack", 0.2, -12], ["clack", 0.55, -12], ["clack", 0.9, -12], ["sh-click", 1.2, -6], ["cheer", 1.25, -13], ["whoosh", 1.3, -12]);
else S.push(["ss-ffwd", 0.0, -8], ["crowd", 0.0, -12], ["ss-bricks", 0.1, -11], ["qe-slip", 0.95, -10], ["thud", 1.2, -9], ["qe-boing", 1.25, -10], ["stone", 1.3, -12]);
for (const [a, c] of [[T.b1, T.c1], [T.b2, T.c2], [T.b3, T.c3]]) S.push(["stamp", a + 0.05, -8], ["strike", a + 0.32, -12], ["chime", c + 0.04, -7]);
S.push(["chime", T.s2 + 0.03, -8]);
for (const a of [T.p1, T.p2, T.p3, T.p4]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.constantinopla, T.b1, T.s2, T.b3]) S.push(["rewind", a - 0.05, -13]);
for (const a of [T.pechinas, T.semicupulas, T.ventanas, T.nueva]) S.push(["ding", a + 0.05, -9]);
for (const a of [T.seis0, T.treinta, T.quinientos0, T.nohay + 0.05, T.acero + 0.05, T.hormigon + 0.05, T.cuatroPilares, T.ano558, T.seis1, T.novecientos, T.quinientos1]) S.push(["pop", a, -11]);
for (let k = 0; k < NWIN; k += 4) S.push(["qe-pling", winAt(k) - 0.02, -16 - (k % 8 ? 2 : 0)]);
S.push(
  ["wind", 0.0, -17], ["gulls", 4.4, -16], ["bells", T.grande, -15], ["sink", T.constantinopla + 0.1, -10], ["waves", T.ano532, -17],
  ["stone", T.ladrillo, -11], ["stone", T.piedra, -10], ["pour", T.mortero, -13], ["crowd", T.miles, -13],
  ["gong", T.justiniano, -13], ["fanfare", T.emperador + 0.1, -16], ["pop", T.gigante, -10], ["chime", T.cuadrada, -12],
  ["slide", T.p1 + 0.1, -12], ["thud", LAND, -8], ["creak", LAND + 0.3, -11], ["creak", LAND + 0.9, -12], ["buzzer", T.esquinas + 0.1, -14],
  ["qe-slip", TIP0, -9], ["thud", CRASH, -5], ["qe-boing", CRASH + 0.12, -9], ["crumble", CRASH + 0.05, -13], ["buzzer", CRASH + 0.1, -13],
  ["stone", T.cuatroPilares + 0.2, -12], ["chisel", T.entre, -13],
  ["sh-click", T.triangulos + 0.1, -12], ["sh-click", T.triangulos + 0.5, -13], ["clack", T.curvos, -12], ["clack", T.pasan, -12], ["sh-click", T.alCirculo + 0.05, -8],
  ["thud", T.pechinas + 0.35, -8], ["confetti", T.pechinas + 0.4, -16],
  ["creak", T.empuja, -9], ["crack", T.abre, -7], ["crumble", T.abre + 0.3, -13],
  ["drag", T.medias - 0.1, -10], ["stone", T.medias + 0.6, -10], ["drag", T.apoyan, -12], ["sh-click", T.hombros + 0.1, -10],
  ["ss-rise", T.contrafuertes - 0.05, -9], ["thud", T.macizos, -8], ["stone", T.porFuera, -12],
  ["slide", T.empuje, -12], ["thud", T.suelo + 0.25, -7], ["quake", T.suelo + 0.25, -16],
  ["wind", T.p3, -14], ["sad", T.oscura, -13], ["drip", T.dentro + 0.3, -15],
  ["ss-shimmer", T.cuarenta, -8], ["glass", T.otra, -14], ["sizzle", T.entra, -17], ["chime", T.flotar1, -10], ["ss-shimmer", T.anillo - 0.3, -14],
  ["quake", T.tiembla - 0.4, -8], ["crumble", T.terremoto, -12], ["quake", T.terremoto + 0.3, -10],
  ["ss-domecrash", FALL0, -5], ["smoke", FALL0 + 0.5, -13],
  ["creak", T.levantan, -12], ["stone", T.alta, -11], ["sh-click", T.curva + 0.3, -9],
  ["slide", T.baja1, -12], ["pop", T.menos, -11],
  ["fanfare", T.nueva - 0.1, -10], ["confetti", T.nueva + 0.2, -14],
  ["giro", T.giro, -9], ["bells", T.iglesia, -12], ["ss-rise", T.mezquita0 - 0.05, -12], ["chime", T.mezquita0 + 0.6, -12],
  ["paper", T.museo, -10], ["pop", T.museo + 0.05, -10], ["chime", T.hoy + 0.3, -11],
  ["chisel", T.reparada, -11], ["chisel", T.varias + 0.2, -12], ["gulls", T.sigue, -15],
  ["fanfare", T.manda - 0.15, -8], ["confetti", T.manda + 0.3, -12],
);
export const SFX = S;
