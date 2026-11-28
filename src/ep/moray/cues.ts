// E21 — Moray: o buraco que a terra abriu sozinha, 12 anéis, 2 nascentes e o filtro de rochas. Pontos da história = palavras ditas
// (sem React: a mixagem lê este arquivo). ⚠️ words.json é ESTIMADO até a voz existir: nenhum segundo literal aqui, só find()/endOf().
import { CUTS, DURATION_S, WINS, endOf, find } from "../../toy/cues";

const ci = (n: number) => find("con ingenio", n, 0.05);
export const T = {
  // gancho
  crater: find("esto parece"), pero0: find("pero no lo cavo", 0, 0.1), cavo: find("lo cavo"), sola0: find("la tierra se hundio", 0, 0.1), hundio: find("se hundio"), sola: find("hundio sola"),
  incas: find("y los incas", 0, 0.1), convirtieron: find("convirtieron"), jardin: find("un jardin"), terrazas: find("terrazas redondas"), redondasEnd: endOf("terrazas redondas"),
  sinmaq: find("sin una sola maquina", 0, 0.1), maquina: find("maquina"),
  // contexto
  moray: find("moray cerca", 0, 0.1), cusco: find("del cusco"), siglo: find("siglo quince"), sigloEnd: endOf("siglo quince"),
  altura: find("a mas de tres", 0, 0.1), tresmil: find("tres mil cuatrocientos"), metros34: endOf("cuatrocientos metros"),
  suelo: find("el suelo es", 0, 0.1), caliza: find("caliza"), yeso: find("yeso"),
  disuelve: find("el agua disuelve", 0, 0.1), roca: find("la roca"), dentro: find("por dentro"), dentroEnd: endOf("por dentro"),
  undia: find("y un dia", 0, 0.1), terreno: find("el terreno"), derrumba: find("se derrumba"), hueco: find("hacia el hueco"), huecoEnd: endOf("hacia el hueco"),
  quedan: find("quedan hoyos"), hoyos: find("hoyos enormes"), hondo: find("el mas hondo", 0, 0.1), treinta: find("unos treinta"), treintaEnd: endOf("treinta metros"),
  // problema 1 + solução 1
  p1: find("pero en una pared", 0, 0.1), lluvia: find("la lluvia"), lleva: find("se lleva la tierra"), llevaEnd: endOf("se lleva la tierra"),
  b1: find("como siembras", 0, 0.1), pared: find("la pared de un hoyo"), c1: ci(0),
  muros: find("muros de piedra"), circulos: find("en circulos"), circulosEnd: endOf("en circulos"),
  pordentro: find("y por dentro", 0, 0.1), relleno: find("relleno de tierra"), rellenoEnd: endOf("relleno de tierra"),
  doce: find("doce anillos", 0, 0.1), doceEnd: endOf("doce anillos"), uno: find("uno dentro del otro"), plano: find("cada uno plano"), planoEnd: endOf("cada uno plano"),
  baja: find("y se baja", 0, 0.1), piedras: find("piedras que sobresalen"), sobresalen: find("sobresalen"), muro36: endOf("del muro"),
  terraza: find("esta es la terraza", 0, 0.1),
  // problema 2 + solução 2
  p2: find("pero alla arriba", 0, 0.1), rio: find("no hay un rio"), dos: find("dos manantiales"), solo2: find("solo dos manantiales"),
  b2: find("como riegas", 0, 0.1), c2: ci(1), canales: find("canales que llevan"), borde: find("hasta el borde"), bordeEnd: endOf("hasta el borde"),
  caidas: find("y caidas talladas", 0, 0.1), roca2: find("en la roca"), bajan: find("la bajan"), circulo: find("de un circulo"), siguiente: find("al siguiente"), siguienteEnd: endOf("al siguiente"),
  riego: find("este es el riego", 0, 0.1),
  // problema 3 + solução 3
  p3: find("pero toda esa agua", 0, 0.1), alfondo: find("baja al fondo"), hoyo: find("y un hoyo sin salida", 0, 0.1), olla: find("como una olla"), ollaEnd: endOf("como una olla"),
  b3: find("a donde va", 0, 0.1), c3: ci(2), pusieron: find("pusieron un filtro"), filtro: find("un filtro de rocas"), grandes: find("rocas grandes"), grandesEnd: endOf("rocas grandes"),
  cuela: find("se cuela"), hacia: find("hacia la tierra"), asi: find("asi el hoyo"), inunda: find("no se inunda"), inundaEnd: endOf("no se inunda"),
  drenaje: find("este es el drenaje", 0, 0.1),
  // giro
  giro: find("y aqui viene el giro", 0, 0.1), fama: find("la fama dice"), lab: find("un laboratorio"), labEnd: endOf("un laboratorio"),
  donde: find("donde cada anillo"), clima: find("un clima distinto"), climaEnd: endOf("un clima distinto"),
  hip: find("es solo una hipotesis", 0, 0.1), hipEnd: endOf("una hipotesis"),
  equipo: find("un equipo de ingenieros", 0, 0.1), anos: find("durante anos"), noenc: find("y no encontro pruebas", 0, 0.1), pruebas: find("pruebas"),
  paraellos: find("para ellos", 0, 0.1), lugar: find("un lugar de ceremonias"), cerem: find("ceremonias"),
  manda: find("mandaselo", 0, 0.1), end: DURATION_S,
};
/** o filtro: 7 rochas grandes caem uma a uma de «pusieron» até o fim de «rocas grandes» (fração do trecho entre frases, nunca segundos soltos); caem em ROCK_FALL s */
export const ROCKS_N = 7, ROCK_FALL = 0.45;
export const ROCK_T = (k: number) => T.pusieron + (T.grandesEnd - ROCK_FALL - 0.1 - T.pusieron) * (k / (ROCKS_N - 1));
/** «muros de piedra»: o plano de cima só entra quando a 1.ª pedra do círculo começa a cair (antes, a parede íngreme com o construtor grande) */
export const TOP1 = Math.max(CUTS[2] + 0.5, T.c1 + 0.15);
export { CUTS, WINS };
const [C1, C2, C3, C4, C5, C6, C7] = CUTS;

/** cortes duros extras (começo de cada plano fora da régua), um a cada ~2–3 s; o episode.tsx tem os mesmos planos */
export const XCUTS = [T.pero0, T.sola0, T.incas, T.sinmaq, T.altura, T.suelo, T.disuelve, T.quedan, T.hondo, T.p1, T.b1, TOP1, T.pordentro, T.doce, T.plano, T.terraza,
  T.solo2, T.b2, T.c2, T.bajan, T.riego, T.p3, T.hoyo, T.b3, T.c3, T.cuela, T.drenaje, T.giro, T.donde, T.equipo, T.noenc, T.paraellos, T.manda].filter((x) => !CUTS.some((c) => Math.abs(c - x) < 0.5));

/** os 12 anéis aparecem de cima para baixo: o i-ésimo começa em RING_T(i, a, b) (fração do trecho entre duas frases, nunca segundos soltos) */
export const RING_T = (i: number, a: number, b: number, dur = 0.35) => a + (b - a - dur) * (i / 11);

const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const x of XCUTS) S.push(["whoosh", x - 0.2, -17]);
for (const [a, c] of [[T.b1, T.c1], [T.b2, T.c2], [T.b3, T.c3]]) S.push(["stamp", a + 0.05, -8], ["strike", a + 0.32, -12], ["chime", c + 0.04, -7]);
for (const a of [T.p1, T.p2, T.p3]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.moray, T.b1, T.b2, T.b3]) S.push(["rewind", a - 0.05, -13]);
// gancho: pá com ✖, o chão afunda sozinho, anéis nascem, escavadeira com ✖
S.push(["wind", 0.1, -16], ["pop", T.pero0 + 0.15, -11], ["strike", T.pero0 + 0.55, -11], ["buzzer", T.pero0 + 0.65, -15],
  ["quake", T.hundio - 0.1, -12], ["sandfall", T.hundio + 0.1, -12], ["thud", T.hundio + 0.85, -10], ["ss-rise", T.incas + 0.05, -11]);
for (let i = 0; i < 12; i += 2) S.push(["pop", RING_T(i, T.incas, T.redondasEnd) + 0.05, -14 - (i % 4)]);
S.push(["ding", T.redondasEnd, -10], ["pop", T.maquina - 0.3, -12], ["tl-pump", T.maquina - 0.2, -14], ["strike", T.maquina + 0.15, -11], ["buzzer", T.maquina + 0.3, -15]);
// ⏪ Moray, altitude, o chão de caliza e gesso, a água que dissolve, o desabamento
S.push(["ss-ffwd", T.moray + 0.05, -12], ["crumble", T.moray + 0.35, -15], ["pop", T.siglo + 0.1, -12], ["wind", T.altura, -14], ["ss-rise", T.tresmil, -11], ["ding", T.metros34 - 0.1, -10],
  ["stone", T.caliza, -12], ["ss-shimmer", T.yeso, -12], ["rain", T.disuelve - 0.05, -13], ["drip", T.disuelve + 0.2, -11], ["vn-bubbles", T.roca, -12], ["drip", T.dentro, -11],
  ["quake", T.terreno - 0.05, -11], ["crumble", T.derrumba - 0.05, -9], ["sandfall", T.derrumba + 0.2, -12], ["thud", T.derrumba + 0.55, -9], ["sink", T.hueco - 0.1, -13]);
// 3–4 hoyos, a régua de fundura
S.push(["thud", C2 + 0.05, -11], ["sandfall", C2 + 0.1, -13], ["pop", T.hoyos - 0.05, -12], ["slide", T.hondo, -14], ["ss-rise", T.treinta, -12], ["ding", T.treintaEnd - 0.2, -10]);
// problema 1: chuva leva a terra da parede (✖)
S.push(["rain", T.p1 + 0.2, -11], ["sandfall", T.lluvia + 0.1, -11], ["slide", T.lluvia + 0.3, -13], ["gravel", T.lleva, -12], ["gravel", T.lleva + 0.3, -14], ["buzzer", T.lleva + 0.5, -14]);
// solução 1: muros em círculo, aterro, 12 anéis, pedras que saem do muro, título
S.push(["drain", T.c1 + 0.15, -12], ["stone", T.muros, -11], ["stone", T.muros + 0.45, -12], ["stone", T.muros + 0.9, -13], ["ss-bricks", T.circulos, -11],
  ["dig", T.pordentro + 0.1, -11], ["gravel", T.relleno, -12], ["gravel", T.relleno + 0.4, -14], ["dig", T.relleno + 0.5, -12], ["ding", T.rellenoEnd, -10]);
for (let i = 0; i < 12; i += 2) S.push(["pop", RING_T(i, T.doce, T.planoEnd) + 0.05, -14 - (i % 4)]);
S.push(["ss-shimmer", T.doce + 0.1, -12], ["ding", T.plano + 0.3, -10], ["fs-steps", T.baja + 0.2, -11], ["stone", T.baja + 0.75, -13], ["fs-steps", T.baja + 1.1, -12], ["stone", T.sobresalen, -12], ["fs-steps", T.sobresalen + 0.5, -11], ["stone", T.muro36 - 0.45, -13], ["chime", T.terraza + 0.35, -9]);
// problema 2: sem rio, 2 nascentes
S.push(["wind", T.p2, -15], ["drip", T.rio - 0.1, -11], ["strike", T.rio + 0.4, -11], ["buzzer", T.rio + 0.55, -14], ["bubble", T.dos, -12], ["bubble", T.dos + 0.25, -13], ["ding", T.solo2 + 0.55, -10]);
// solução 2: canais, água correndo, quedas de anel em anel, título
S.push(["drain", T.c2 + 0.15, -12], ["stone", T.canales, -12], ["stone", T.canales + 0.4, -13], ["stream", T.canales + 0.5, -10], ["splash", T.borde + 0.2, -11], ["vn-fallwater", T.caidas, -12]);
for (let i = 0; i < 12; i += 3) S.push(["splash", RING_T(i, T.caidas, T.siguienteEnd) + 0.1, -13 - (i % 2)]);
S.push(["ding", T.siguienteEnd, -10], ["chime", T.riego + 0.35, -9]);
// problema 3: a água junta no fundo, sobe como numa olla (✖)
S.push(["stream", T.p3 + 0.15, -12], ["vn-glub", T.alfondo + 0.1, -11], ["vn-tide", T.hoyo + 0.1, -11], ["vn-bubbles", T.olla, -12], ["flood", T.hoyo + 0.4, -13], ["buzzer", T.olla + 0.5, -14], ["pop", T.b3 + 0.05, -10]);
// solução 3 (a previsão): cava, rochas caem, a água some pelas frestas, ✔, título
S.push(["drain", T.c3 + 0.15, -12], ["dig", T.c3 + 0.35, -10], ["dig", T.c3 + 0.9, -12], ["gravel", T.c3 + 0.5, -13], ["stone", T.grandesEnd - 0.05, -12], ["stream", T.grandesEnd - 0.35, -12], ["drip", T.cuela, -10], ["vn-fallwater", T.cuela + 0.1, -11], ["drain", T.hacia, -11],
  ["ding", T.inunda - 0.4, -10], ["cheer", T.asi + 0.55, -14], ["chime", T.drenaje + 0.35, -9]);
for (let k = 0; k < ROCKS_N; k++) S.push(["thud", ROCK_T(k) + ROCK_FALL, -9 - (k % 3)]);
// o giro: laboratório (hipótese), anéis que mudam de cor, engenheiros, ✖ e a placa cai, cerimônias
S.push(["giro", T.giro - 0.05, -8], ["pop", T.lab - 0.35, -12], ["glass", T.lab - 0.25, -12], ["bubble", T.fama + 0.5, -14], ["vn-bubbles", T.lab, -12],
  ["ss-shimmer", T.donde, -11], ["ss-shimmer", T.clima, -13], ["stamp", T.hip + 0.05, -8], ["sad", T.hip + 0.3, -17],
  ["sg-shutter", T.equipo + 0.3, -12], ["ding", T.equipo + 0.9, -12], ["sg-shutter", T.anos - 0.2, -14], ["strike", T.noenc + 0.25, -11], ["buzzer", T.noenc + 0.4, -14],
  ["creak", T.noenc + 0.75, -11], ["thud", T.noenc + 1.2, -11], ["ss-shimmer", T.paraellos + 0.1, -13], ["gong", T.lugar + 0.15, -11], ["chime", T.cerem, -10]);
// 2.ª passada: voo sobre os picos, lhamas e chasqui, o fio que some na terra seca, a calha que despeja no fundo
S.push(["llama", C1 + 0.25, -16], ["fs-steps", C1 + 0.5, -12], ["stream", T.dos + 0.1, -13], ["stream", C6 + 0.05, -11], ["splash", C6 + 0.3, -12], ["drain", C6 + 0.6, -12]);
// final: recompensa
S.push(["fanfare", T.manda - 0.1, -9], ["confetti", T.manda + 0.2, -12], ["llama", T.manda + 0.9, -17], ["ding", T.manda + 0.5, -10]);
export const SFX = S;
export { C1, C2, C3, C4, C5, C6, C7 };
