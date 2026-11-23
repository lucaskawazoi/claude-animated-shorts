// E18 — La Sagrada Família: 144 años en obras. Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const ci = (n: number) => find("con ingenio", n, 0.05);
export const T = {
  iglesia0: find("esta iglesia"), c144: find("ciento cuarenta"), obras0: find("en obras"), todavia: find("y todavia no"), terminan: find("la terminan"),
  porque: find("por que tarda", 0, 0.1), tanto: find("tanto"),
  barcelona: find("barcelona"), mil883: find("mil ochocientos"), antoni: find("antoni gaudi"), treinta: find("treinta y un"), toma: find("toma una obra"),
  empezado: find("ya habia empezado"), otro: find("otro arquitecto"),
  nohay: find("no hay computadoras"), compu: find("computadoras", 0), maquinas: find("ni maquinas"), modernas: find("modernas"),
  papel: find("solo papel"), yeso0: find("yeso", 0), cuerdas0: find("cuerdas", 0), piedra0: find("y piedra", 0),
  quiere: find("y el quiere"), columnas: find("columnas inclinadas"), arboles: find("como arboles"), casi: find("casi nadie"), calcular: find("sabe calcular"),
  b1: find("como calculas", 0, 0.1), c1: ci(0), prueba: find("lo prueba"), otra: find("otra iglesia"), cuelga: find("cuelga cuerdas"), saquitos: find("saquitos"),
  cada: find("cada cuerda"), curva: find("la curva por"), tira: find("tira el peso"), vuelta: find("dale la vuelta"), sostiene: find("sostiene la piedra"),
  apretando: find("solo apretando"), doblarse: find("sin doblarse"),
  p2: find("pero una obra", 0, 0.1), cuesta: find("cuesta muchisimo"), paga: find("se paga"), limosnas: find("limosnas"), gente: find("la gente"),
  sabe: find("y el sabe"), vera: find("no la vera"), terminada: find("terminada"),
  b2: find("solucion", 0, 0.1), hace: find("hace maquetas"), cadaParte: find("cada parte"), otros: find("para que otros"), seguir: find("puedan seguir"),
  atribuye: find("se le atribuye"), cliente: find("mi cliente"), prisa: find("tiene prisa"), dios: find("era dios"),
  p3: find("pero en julio", 0, 0.1), m1936: find("mil novecientos"), guerra: find("la guerra"), queman: find("queman su taller"), rompen: find("rompen las maquetas"),
  b3: find("como sigues", 0, 0.1), c3: ci(1), juntan: find("juntan los pedazos"), fotos: find("usan fotos"), volver: find("para volver"), armar: find("a armar"),
  formas: find("y como sus formas"), dificiles: find("tan dificiles"), desde: find("desde fines"), compus: find("usan computadoras"),
  programas: find("programas de"), aviones: find("disenar aviones"), maquinas2: find("y maquinas que"), cortan: find("que cortan"),
  giro: find("y aqui viene"), m2026: find("dos mil veintiseis"), pusieron: find("pusieron la cruz"), alta: find("torre mas alta"), jesus: find("de jesucristo"),
  metros: find("ciento setenta"), medio: find("y medio"), hoy: find("hoy es"), mundo: find("del mundo"),
  inauguraron: find("la inauguraron"), junio: find("en junio"), cien: find("cien anos"), muerte: find("la muerte"),
  manda: find("mandaselo"),
  end: DURATION_S,
};
export { CUTS, WINS };

/** cortes duros extras (um a cada ~3–5 s), longe dos 7 da régua */
export const XCUTS = [T.todavia, T.porque, T.barcelona, T.antoni, T.nohay, T.papel, T.quiere, T.b1, T.c1, T.cuelga, T.vuelta, T.apretando, T.p2, T.sabe,
  T.b2, T.otros, T.atribuye, T.p3, T.guerra, T.rompen, T.b3, T.c3, T.fotos, T.formas, T.compus, T.maquinas2, T.giro, T.metros, T.hoy, T.inauguraron, T.manda];
/** as 5 maquetas de gesso: tempo em que cada uma aparece na mesa */
export const MODEL_T = (i: number) => T.hace + 0.15 + i * 0.32;
/** saquitos: tempo em que cada um cai na corda */
export const BAG_T = (i: number) => T.cuelga + 0.55 + i * 0.16;
/** pedaço i volta ao lugar (montagem um por um) */
export const PIECE_T = (i: number, n: number) => T.juntan + 0.1 + (i / n) * (T.armar + 0.4 - T.juntan);

const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const x of XCUTS) S.push(["whoosh", x - 0.2, -16]);
for (const [a, c] of [[T.b1, T.c1], [T.b3, T.c3]]) S.push(["stamp", a + 0.05, -8], ["strike", a + 0.32, -12], ["chime", c + 0.04, -7]);
S.push(["chime", T.b2 + 0.5, -9]);
for (const a of [T.calcular, T.p2, T.p3]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.b1, T.b2, T.b3]) S.push(["rewind", a - 0.05, -13]);
// gancho: gruas e marteladas na obra; o relógio de 144 anos; volta para 1883
S.push(["sg-saw", 0.15, -16], ["chisel", 0.9, -14], ["wheel", T.obras0, -14], ["creak", T.todavia, -12], ["buzzer", T.terminan + 0.2, -14],
  ["bells", T.porque, -13], ["ss-ffwd", T.barcelona - 0.1, -12], ["stone", T.mil883 + 0.6, -12], ["pop", T.antoni + 0.1, -11], ["scroll", T.toma, -11], ["fs-steps", T.otro, -14]);
// premissa: computador e máquina aparecem e levam ✖; papel, gesso, cordas, pedra
S.push(["sg-beeps", T.compu, -12], ["strike", T.maquinas - 0.1, -11], ["sh-lever", T.maquinas, -13], ["strike", T.papel - 0.15, -11],
  ["paper", T.papel + 0.15, -10], ["sandfall", T.yeso0, -12], ["vn-rope", T.cuerdas0, -11], ["stone", T.piedra0 + 0.1, -10]);
// colunas inclinadas como árvores; a coluna ingênua tomba ✖
S.push(["ss-rise", T.columnas, -12], ["ak-birds", T.arboles, -15], ["creak", T.casi, -11], ["crumble", T.casi + 0.45, -9], ["thud", T.casi + 0.8, -10]);
// a maquete pendurada: cordas descem, saquitos caem, a curva; vira; pedra só apertando ✔
S.push(["vn-rope", T.cuelga, -10]);
for (let i = 0; i < 6; i++) S.push(["thud", BAG_T(i), -13 - (i % 2)]);
S.push(["qe-taut", T.curva, -11], ["ss-shimmer", T.tira, -12], ["wheel", T.vuelta, -10], ["ss-rise", T.vuelta + 0.3, -12]);
for (let k = 0; k < 5; k++) S.push(["stone", T.sostiene + k * 0.14, -13 - (k % 2)]);
S.push(["vn-compressor", T.apretando, -14], ["ding", T.doblarse + 0.1, -9]);
// custo e esmolas; ele não verá terminada (o tempo corre)
S.push(["coins", T.cuesta, -11], ["coins", T.limosnas, -12], ["pop", T.gente, -13], ["ss-ffwd", T.sabe, -12], ["sad", T.terminada, -13]);
// solução: as maquetas de gesso surgem; o aprendiz leva uma; a frase; o céu
for (let i = 0; i < 5; i++) S.push(["pop", MODEL_T(i), -11 - (i % 2)]);
S.push(["fs-steps", T.otros, -13], ["quill", T.atribuye, -13], ["sh-sunrise", T.prisa + 0.2, -13], ["bells", T.dios, -12]);
// 1936: fogo no ateliê, maquetas quebram ✖
S.push(["gong", T.p3 + 0.1, -14], ["fireup", T.queman, -9], ["fire", T.queman + 0.5, -11], ["sg-shatter", T.rompen + 0.2, -8], ["sg-shatter", T.rompen + 0.55, -11], ["smoke", T.b3, -14]);
// montar de novo: pedaço por pedaço; foto velha (flash)
for (let i = 0; i < 6; i++) S.push(["sh-click", PIECE_T(i, 6), -12 - (i % 2)]);
S.push(["sg-shutter", T.fotos + 0.2, -9], ["ding", T.armar + 0.4, -9]);
// computador, avião, máquina que corta a pedra
S.push(["sg-beeps", T.compus, -11], ["sg-plane", T.aviones - 0.2, -9], ["sg-saw", T.cortan, -9], ["smoke", T.cortan + 0.4, -15]);
// o giro: a cruz sobe e encaixa; a régua de 172,5 m; a festa de junho
S.push(["giro", T.giro - 0.05, -8], ["vn-lift", T.pusieron - 0.3, -11], ["clack", T.pusieron + 0.55, -9], ["ss-shimmer", T.alta, -11], ["ss-rise", T.metros, -11],
  ["fanfare", T.mundo, -12], ["sg-fireworks", T.inauguraron, -10], ["crowd", T.junio, -13], ["bells", T.cien, -12],
  ["fanfare", T.manda - 0.1, -9], ["confetti", T.manda + 0.2, -12]);
export const SFX = S;
