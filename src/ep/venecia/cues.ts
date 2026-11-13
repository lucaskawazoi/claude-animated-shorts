// E11 — Venecia sobre pilotes. Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const ci = (n: number) => find("con ingenio", n, 0.05);
export const T = {
  ciudad: find("una ciudad entera"), debajo: find("debajo"), millones: find("millones de troncos"), clavados: find("clavados en el barro"),
  siguen: find("siguen ahi"), siglos0: find("despues de siglos"), venecia: find("venecia hace"),
  nohay: find("no hay motores"), hormigon: find("ni hormigon"), acero: find("ni acero"),
  madera: find("madera"), piedra: find("piedra"), ladrillo: find("ladrillo"), brazos: find("brazos"),
  p1: find("y el fondo", 0, 0.1), blando: find("blando"), pones: find("pones una casa"), encima: find("encima"), hunde: find("se hunde"),
  b1: find("como construyes", 0, 0.1), c1: ci(0), clavan: find("clavan troncos"), punta: find("punta"), pegado: find("uno pegado"),
  golpe: find("a golpe de mazo"), mazo: find("mazo"), apretado: find("apretado"), cede: find("ya no cede"), pilotes: find("estos son los pilotes"),
  p2: find("pero en la laguna", 0, 0.1), arboles: find("crecen arboles"), faltan: find("hacen falta"),
  b2: find("como los traes", 0, 0.1), c2: ci(1), talan: find("los talan"), alpes: find("los alpes"), atan: find("los atan"), balsas: find("en balsas"),
  bajan: find("los bajan"), hasta: find("hasta la laguna"), rio: find("el rio hace"), flotantes: find("estos son los troncos"),
  p3: find("pero la madera", 0, 0.1), pudre: find("se pudre"),
  b3: find("solucion", 0, 0.1), noen: find("no en este barro"), hongos: find("los hongos"), oxigeno: find("necesitan oxigeno"),
  abajo: find("ahi abajo"), casiNoHay: find("casi no hay"), bacterias: find("unas bacterias"), despacio: find("muy despacio"), duran: find("duran siglos"),
  p4: find("pero el agua salada", 0, 0.1), sube: find("sube por"), deshaciendo: find("deshaciendo"),
  b4: find("como la frenas", 0, 0.1), c3: ci(2), entre: find("entre los troncos"), ponen: find("ponen piedra"), blanca: find("blanca"),
  cerrada: find("tan cerrada"), noentra: find("casi no entra"), estaIstria: find("esta es la piedra"),
  giro: find("viene el giro"), hoy: find("hoy para"), mareas: find("mareas altas"), levanta: find("venecia levanta"), compuertas: find("compuertas gigantes"),
  entradas: find("las entradas"), esas: find("esas si"), motores2: find("funcionan con motores"),
  manda: find("mandaselo"),
  end: DURATION_S,
};
export { CUTS, WINS };

/** as três aberturas (0 → «debajo»): PROPS='{"open":"b"}' no render; o som da mixagem segue OPEN_DEFAULT */
export type Open = "a" | "b" | "c";
export const OPEN_DEFAULT = "c" as Open;   // escolhida pelo crítico (13/11)
/** cortes duros extras (um a cada ~4–5 s), todos a ≥1,5 s dos 7 da régua */
export const XCUTS = [T.debajo, T.siguen, T.p1, T.golpe, T.b2, T.atan, T.p3, T.abajo, T.p4, T.cerrada, T.levanta, T.esas];

// ---------------------------------------------------------------- cravação dos 7 pilotes da casa de demonstração (plano 3)
// cada pilote: instante em que aparece (cai de ponta no barro) e as batidas do mazo; cada batida crava 1/n do comprimento.
// as duas primeiras devagar («clavan troncos de punta», «uno pegado al otro»), as fortes no «golpe» e no «mazo», o resto em rajada.
export const DRIVE: { a: number; hits: number[] }[] = [
  { a: T.clavan - 0.05, hits: [T.punta + 0.12, T.pegado - 0.03] },
  { a: T.pegado + 0.02, hits: [T.pegado + 0.3, T.golpe - 0.18, T.golpe + 0.19] },
  { a: T.golpe + 0.22, hits: [T.mazo + 0.07, T.mazo + 0.31] },
  { a: T.mazo + 0.31, hits: [T.mazo + 0.49, T.mazo + 0.65] },
  { a: T.mazo + 0.63, hits: [T.mazo + 0.81, T.mazo + 0.97] },
  { a: T.mazo + 0.95, hits: [T.mazo + 1.13, T.mazo + 1.29] },
  { a: T.mazo + 1.27, hits: [T.mazo + 1.45, T.mazo + 1.61] },
];
export const HITS = DRIVE.flatMap((d, i) => d.hits.map((h, k) => ({ t: h, i, f: (k + 1) / d.hits.length })));

const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const w of [WINS[3], WINS[6], WINS[10]]) S.push(["whoosh", w - 0.25, -13]);
for (const x of XCUTS.slice(1)) S.push(["whoosh", x - 0.2, -16]);
for (const [a, c] of [[T.b1, T.c1], [T.b2, T.c2], [T.b4, T.c3]]) S.push(["stamp", a + 0.05, -8], ["strike", a + 0.32, -12], ["chime", c + 0.04, -7]);
S.push(["chime", T.noen, -9]);
for (const a of [T.p1, T.p2, T.p3, T.p4]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.venecia, T.b1, T.b2, T.b3, T.b4]) S.push(["rewind", a - 0.05, -13]);
for (const a of [T.pilotes, T.flotantes, T.estaIstria]) S.push(["ding", a + 0.05, -9]);
for (const a of [T.millones + 0.3, T.siguen, T.hormigon, T.acero, T.faltan, T.compuertas + 0.4]) S.push(["pop", a, -12]);
// gancho, por abertura: a) pilotes caindo em rajada e casas pipocando; b) sinos e pombos do campanário, mergulho até a góndola;
// c) a cidade cai do céu na laguna (splash)
if (OPEN_DEFAULT === "a") { for (let k = 0; k < 6; k++) S.push(["vn-pilehit", 0.02 + k * 0.21, -13 - (k % 2)]); S.push(["pop", 0.15, -12], ["pop", 0.6, -13], ["pop", 0.95, -13], ["gulls", 1.6, -17]); }
if (OPEN_DEFAULT === "b") S.push(["bells", 0.0, -10], ["gulls", 0.25, -13], ["whoosh", 0.75, -13], ["waves", 1.5, -14], ["whoosh", 1.85, -15]);
// c) a ilha cai (whoosh), os pilotes entram na água (splash) e vão sendo cravados (batidas espaçando), a base encosta (thud)
if (OPEN_DEFAULT === "c") S.push(["whoosh", 0.0, -11], ["splash", 0.38, -6], ["vn-pilehit", 0.46, -10], ["vn-pilehit", 0.66, -12], ["vn-pilehit", 0.92, -13],
  ["thud", 1.22, -9], ["waves", 1.0, -12], ["vn-pilehit", 1.5, -15], ["bells", 1.7, -16], ["gulls", 1.95, -17]);
S.push(["waves", 0.0, -17], ["whoosh", T.debajo - 0.2, -14], ["vn-pilehit", T.clavados, -11], ["bells", T.siguen + 0.1, -15]);
// materiais
S.push(["thud", T.madera, -12], ["clack", T.piedra, -12], ["clack", T.ladrillo, -13], ["pop", T.brazos, -10]);
// a casa no barro: pousa, afunda, ✖
S.push(["vn-squish", T.blando, -11], ["thud", T.encima, -10], ["vn-glub", T.hunde - 0.05, -8], ["buzzer", T.hunde + 0.15, -12], ["vn-glub", T.hunde + 1.7, -12]);
// cravação: cada batida do mazo
for (const h of HITS) S.push(["vn-pilehit", h.t, h.t > T.mazo + 0.3 ? -13 : -9]);
S.push(["vn-squish", T.apretado, -12], ["drag", T.cede - 0.35, -15], ["thud", T.cede + 0.2, -9], ["vn-rope", T.clavan + 0.1, -16]);
// troncos dos Alpes
S.push(["pop", T.p2 + 0.35, -14], ["buzzer", T.arboles + 0.3, -13], ["axe", T.talan, -11], ["vn-treefall", T.talan + 0.25, -10], ["axe", T.talan + 0.55, -12], ["vn-treefall", T.alpes + 0.2, -11],
  ["vn-rope", T.atan, -10], ["river", T.bajan, -12], ["stream", CUTS[3], -12], ["splash", T.hasta + 0.2, -12], ["river", T.rio, -13], ["gulls", T.flotantes, -17]);
// a estaca que apodrece e o operário que cai na água
S.push(["vn-rot", T.pudre - 0.05, -8], ["buzzer", T.pudre + 0.15, -12], ["vn-fallwater", T.pudre + 0.35, -9]);
// hongos, oxigênio, bactérias
S.push(["pop", T.hongos + 0.1, -12], ["pop", T.hongos + 0.35, -13], ["vn-bubbles", T.oxigeno, -10], ["strike", T.casiNoHay, -12], ["strike", T.casiNoHay + 0.3, -13],
  ["pop", T.bacterias + 0.2, -15], ["ding", T.duran, -12]);
// água salgada e pedra de Ístria
S.push(["drip", T.sube, -11], ["vn-bubbles", T.sube + 0.4, -13], ["crumble", T.deshaciendo - 0.1, -9], ["vn-lift", T.entre, -10], ["stone", T.ponen + 0.05, -10],
  ["thud", T.ponen + 0.7, -10], ["glass", T.blanca, -12], ["drip", T.cerrada + 0.2, -12], ["pop", T.noentra, -12]);
// o giro: maré alta, comportas do MOSE, motores
S.push(["giro", T.giro - 0.05, -8], ["vn-tide", T.mareas - 0.4, -9], ["waves", T.mareas + 0.6, -12], ["vn-gates", T.levanta + 0.1, -8],
  ["vn-compressor", T.esas, -9], ["stamp", T.motores2 + 0.05, -8], ["fanfare", T.manda - 0.1, -9], ["gulls", T.manda + 0.4, -16]);
export const SFX = S;
