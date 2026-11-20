// E16 — Han van Meegeren, o falsário que vendeu um «Vermeer» a Göring. Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const ci = (n: number) => find("con ingenio", n, 0.05);
export const T = {
  este: find("este vermeer"), mano: find("mano derecha"), hitler: find("hitler"),
  pero0: find("pero lo pinto", 0, 0.1), vivo: find("holandes vivo"), cocio: find("lo cocio"), horno0: find("el horno de su casa"),
  holanda: find("holanda anos"), treinta: find("anos treinta"),
  criticos: find("los criticos"), desprecian: find("desprecian"), han: find("han van meegeren"), vengarse: find("decide vengarse"),
  falso0: find("vermeer falso"), expertos0: find("los expertos juren"), juren: find("juren verdadero"),
  p1: find("pero un vermeer", 0, 0.1), trescientos: find("casi trescientos"), nota: find("se nota"),
  b1: find("como consigues", 0, 0.1), tela: find("una tela de"), c1: ci(0), compra: find("compra un cuadro"), barato: find("barato"),
  siglo: find("del siglo"), quita: find("le quita"), pomez: find("piedra pomez"), pinta: find("pinta encima"),
  p2: find("pero el oleo", 0, 0.1), decadas: find("tarda decadas"), endurecerse: find("endurecerse"), prueban: find("lo prueban"),
  alcohol: find("con alcohol"), ablanda: find("se ablanda"), nueva: find("es nueva"),
  b2: find("como envejeces", 0, 0.1), horas: find("en horas"), c2: ci(1), mezcla: find("mezcla los colores"), baquelita: find("baquelita"),
  plastico: find("un plastico"), hornea: find("hornea el cuadro"), cien: find("unos cien grados"), sale: find("sale dura"),
  dura: find("como la de un vermeer"), alcohol2: find("el alcohol ya"), yano: find("ya no la ablanda"),
  p3: find("pero un cuadro viejo", 0, 0.1), grietas: find("lleno de grietas"), liso: find("esta liso"),
  b3: find("solucion", 0, 0.1), enrolla: find("enrolla la tela"), cilindro: find("un cilindro"), agrieta: find("se agrieta"),
  frota: find("frota tinta"), china: find("tinta china"), sucias: find("sucias de siglos"),
  funciona: find("funciona"), experto: find("el mayor experto"), llama: find("lo llama"), maestra: find("obra maestra"),
  guerra: find("en plena guerra"), goring: find("goring paga"), otro: find("otro de sus"), cien2: find("mas de cien"),
  robados: find("muchos robados"), sucio: find("arte sucio"), artefalso: find("arte falso"),
  giro: find("viene el giro"), terminar: find("al terminar"), arrestan: find("lo arrestan"), tesoro: find("un tesoro nacional"),
  nazis: find("a los nazis"), vida: find("costarle la vida"),
  salvarse: find("para salvarse"), confiesa: find("confiesa"), esfalso: find("es falso lo"), pinteyo: find("lo pinte yo"),
  nadie: find("nadie le cree"), asique: find("asi que pinta"), otroV: find("otro vermeer delante"), testigos: find("de testigos"),
  traidor: find("de traidor"), heroe: find("a heroe"), hombre: find("el hombre que"), estafo: find("estafo a goring"),
  manda: find("mandaselo"), original: find("un original"),
  end: DURATION_S,
};
/** cortes extras do pré-crítico (instantes de palavra, fora dos 7 da régua) */
export const X = { h2: T.treinta + 0.4, nota: T.nota, mezcla: T.mezcla, sucias: T.sucias, vida: T.vida - 0.35, mkt2: T.c1 };
export { CUTS, WINS };

/** cortes duros extras (um a cada ~3–5 s), longe dos 7 da régua */
export const XCUTS = [T.pero0, T.holanda, X.h2, T.expertos0, T.p1, X.nota, T.siglo, T.b2, X.mezcla, T.hornea, T.p3, T.b3, T.frota, X.sucias, T.funciona, T.guerra, T.giro, T.arrestan, X.vida, T.asique, T.traidor, WINS[10]];

const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const x of XCUTS) S.push(["whoosh", x - 0.2, -16]);
for (const [a, c] of [[T.b1, T.c1], [T.b2, T.c2]]) S.push(["stamp", a + 0.05, -8], ["strike", a + 0.32, -12], ["chime", c + 0.04, -7]);
S.push(["chime", T.b3 + 0.6, -9]);
for (const a of [T.p1, T.p2, T.p3]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.b1, T.b2, T.b3]) S.push(["rewind", a - 0.05, -13]);
for (const a of [T.falso0, T.pinta + 0.6, T.sale, T.sucias]) S.push(["ding", a + 0.05, -9]);
for (const a of [T.mano, T.vivo, T.horno0, T.treinta, T.trescientos, T.barato, T.decadas, T.baquelita]) S.push(["pop", a, -12]);
// gancho: Göring aponta, a moldura brilha; o forno abre com vapor
S.push(["fanfare", 0.05, -16], ["coins", 0.6, -14], ["fs-ovendoor", T.cocio + 0.1, -10], ["sizzle", T.cocio + 0.3, -12], ["smoke", T.horno0, -14]);
// Holanda: moinho e canal; críticos vaiam; peritos aplaudem
S.push(["wind", T.holanda, -16], ["gulls", T.holanda + 0.4, -18], ["fs-boo", T.desprecian, -11], ["buzzer", T.desprecian + 0.4, -13], ["cheer", T.juren, -12]);
// 300 anos: a lupa e o estalo das rachaduras
S.push(["crack", T.trescientos + 0.2, -12], ["crack", T.nota, -13]);
// feira: moedas; pedra-pomes raspa; pincel
S.push(["coins", T.compra + 0.2, -11], ["paper", T.compra + 0.8, -13], ["chisel", T.quita, -12], ["chisel", T.quita + 0.5, -13], ["sandfall", T.pomez, -13], ["scroll", T.pinta, -13]);
// teste do álcool: esfrega e mancha ✖
S.push(["squelch", T.prueban + 0.3, -12], ["squelch", T.ablanda, -10], ["buzzer", T.ablanda + 0.2, -12]);
// baquelita: tigela, frasco derramando; forno fecha, esquenta, abre; álcool não tira nada ✔
S.push(["pour", T.baquelita, -11], ["bubble", T.mezcla + 0.3, -13], ["slide", T.hornea + 0.2, -12], ["clack", T.hornea + 1.0, -10], ["fireup", CUTS[3] + 0.05, -10],
  ["sizzle", CUTS[3] + 0.6, -12], ["fs-ovendoor", T.sale - 0.2, -11], ["slide", T.sale + 0.1, -12], ["squelch", T.alcohol2 + 0.2, -14], ["ding", T.yano + 0.2, -10]);
// lupa e liso ✖; cilindro racha; tinta da China
S.push(["glass", T.grietas, -13], ["buzzer", T.liso + 0.3, -12], ["wheel", T.enrolla, -12], ["crack", T.cilindro + 0.3, -10], ["crack", T.agrieta, -9],
  ["crack", T.agrieta + 0.35, -12], ["drip", T.frota, -12], ["mud", T.china, -13]);
// Bredius: obra-prima; Göring: quadros voando, roubados, balança
S.push(["cheer", T.maestra, -10], ["crowd", T.maestra + 0.3, -14]);
for (let k = 0; k < 14; k++) S.push(["whoosh", T.otro + k * 0.2 + 0.1, -20 - (k % 3)]);
S.push(["coins", T.cien2, -12], ["stamp", T.robados + 0.1, -9], ["thud", T.sucio + 0.2, -10], ["clack", T.artefalso, -12]);
// o giro: polícia, martelo, confissão, ninguém acredita, pinta diante dos guardas, a praça
S.push(["giro", T.giro - 0.05, -8], ["fs-steps", T.terminar + 0.2, -12], ["clack", T.arrestan + 0.1, -10], ["gavel", T.vida + 0.15, -7], ["sad", T.vida + 0.4, -14],
  ["pop", T.esfalso, -10], ["crowd", T.nadie, -12], ["buzzer", T.nadie + 0.3, -12], ["scroll", T.otroV, -12], ["scroll", T.otroV + 0.6, -13],
  ["cheer", T.heroe, -9], ["confetti", T.heroe + 0.1, -11], ["fanfare", T.hombre, -9]);
export const SFX = S;
