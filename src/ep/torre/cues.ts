// E19 — La Torre Latinoamericana: sobre o barro de um lago, três terremotos. Pontos da história = palavras ditas (sem React:
// a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const ci = (n: number) => find("con ingenio", n, 0.05);
export const T = {
  torre0: find("esta torre"), pisos: find("cuarenta y cuatro"), barro0: find("el barro de un lago"), lago0: find("lago", 0), aguantado: find("aguanto"),
  tres: find("tres terremotos"), sigue: find("y sigue"),
  ciudad: find("ciudad de mexico"), m1948: find("mil novecientos cuarenta"), hubo: find("aqui hubo"), debajo: find("y debajo"), blando: find("tan blando"),
  agua0: find("casi todo agua"), bellas: find("el palacio"), cruzando: find("cruzando la calle"), hundido: find("se hundio"), metros0: find("dos metros"),
  mientras: find("mientras lo"),
  nohay: find("y en mexico todavia"), compu: find("computadora"), papel: find("hay papel"), lapiz0: find("lapiz", 0), hermanos: find("dos hermanos"),
  zeevaert: find("los zeevaert"),
  p1: find("pero si pones", 0, 0.1), torreAsi: find("una torre asi"), hunde: find("se hunde"), cuchara: find("una cuchara"), gelatina: find("gelatina", 0),
  b1: find("como la apoyas", 0, 0.1), suelo: find("el suelo no"), c1: ci(0), clavan: find("clavan"), c361: find("trescientos sesenta"),
  pilotes0: find("pilotes de concreto"), hasta: find("hasta una capa"), arena: find("arena firme"), treinta: find("mas de treinta"), estos: find("estos son los pilotes"),
  p2: find("pero aun asi", 0, 0.1), pesa: find("pesa demasiado"),
  b2: find("solucion", 0, 0.1), cavan: find("debajo cavan"), m13: find("trece metros"), sacan: find("y sacan"), miles: find("miles de toneladas"),
  tierra: find("de tierra"), ese: find("ese peso"), compensa: find("compensa"), torre3: find("de la torre"), flota: find("flota en parte"),
  barco: find("un barco"), cajon: find("este es el cajon"),
  p4: find("pero en mexico tiembla", 0, 0.1), tiembla: find("tiembla"), agranda: find("agranda el temblor"), plato: find("un plato"),
  b4: find("como aguantas", 0, 0.1), c4: ci(1), esqueleto0: find("un esqueleto"), flexible: find("flexible"), mece: find("se mece"),
  romperse: find("sin romperse"), cana: find("una cana"), esqueleto: find("este es el esqueleto"),
  giro: find("y aqui viene"), m1957: find("mil novecientos cincuenta"), ciudad2: find("la ciudad no"), aparato: find("ni un aparato"),
  fuerte: find("terremoto fuerte"), midio: find("lo midio"), lapiz: find("con un lapiz"), dejaron: find("le dejaron"), dibujaba: find("que dibujaba"),
  sacudida: find("cada sacudida"), tiro: find("tiro el angel"), intacta: find("la torre intacta"), m1985: find("mil novecientos ochenta"),
  cayeron: find("cayeron cientos"), ella: find("y ella siguio"), m2017: find("dos mil diecisiete"), otra: find("otra vez"),
  manda: find("mandaselo"), piso: find("un piso alto"),
  end: DURATION_S,
};
export { CUTS, WINS };

/** cortes duros extras (um a cada ~2–4 s), longe dos 7 da régua */
export const XCUTS = [T.barro0, T.aguantado, T.sigue, T.ciudad, T.debajo, T.bellas, T.hundido, T.nohay, T.papel, T.hermanos, T.p1, T.hunde, T.c1,
  T.pilotes0, T.arena, T.estos, T.p2, T.b2, T.sacan, T.ese, T.flota, T.p4, T.agranda, T.plato, T.b4, T.c4, T.mece, T.cana, T.esqueleto, T.giro,
  T.m1957, T.midio, T.lapiz, T.dibujaba, T.intacta, T.m1985, T.ella, T.m2017, T.manda];
/** pilote i: instante em que o martelo começa a cravá-lo (7 na face, de «clavan» até antes de «arena firme») */
export const PILE_T = (i: number) => T.clavan + 0.15 + i * ((T.arena - T.clavan - 0.4) / 7);
/** a corrente de terra: bloco i sai do cajón e voa DIRT_FLY s até o prato da balança; o último cai em «compensa» */
export const DIRT_N = 24, DIRT_FLY = 1.1;
export const DIRT_T = (i: number) => T.cavan + 0.2 + i * ((T.compensa - DIRT_FLY - T.cavan - 0.2) / (DIRT_N - 1));

const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const x of XCUTS) S.push(["whoosh", x - 0.2, -16]);
for (const [a, c] of [[T.b1, T.c1], [T.b4, T.c4]]) S.push(["stamp", a + 0.05, -8], ["strike", a + 0.32, -12], ["chime", c + 0.04, -7]);
S.push(["chime", T.b2 + 0.5, -9]);
for (const a of [T.p1, T.p2, T.p4]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.b1, T.b2, T.b4]) S.push(["rewind", a - 0.05, -13]);
// gancho: a torre, o barro debaixo, os três terremotos
S.push(["tl-steel", 0.1, -13], ["ss-rise", T.pisos, -13], ["mud", T.barro0 + 0.1, -11], ["tl-wobble", T.lago0, -12],
  ["quake", T.aguantado, -9], ["tl-sway", T.aguantado + 0.3, -10], ["pop", T.tres, -12], ["ding", T.sigue + 0.2, -9]);
// 1948: o lago, o barro quase todo água, Bellas Artes afunda
S.push(["ss-ffwd", T.ciudad - 0.1, -12], ["pop", T.m1948 + 0.5, -12], ["waves", T.hubo, -11], ["splash", T.hubo + 0.4, -13], ["mud", T.debajo + 0.1, -11],
  ["tl-wobble", T.blando, -9], ["drip", T.agua0, -11], ["bubble", T.agua0 + 0.3, -12], ["pop", T.bellas + 0.1, -12], ["sink", T.hundido, -9],
  ["creak", T.hundido + 0.3, -11], ["slide", T.metros0, -12], ["chisel", T.mientras, -14]);
// sem computador (✖): papel, lápis e os dois irmãos
S.push(["sg-beeps", T.compu - 0.2, -11], ["strike", T.compu + 0.4, -11], ["paper", T.papel + 0.1, -10], ["paper", T.papel + 0.35, -12],
  ["quill", T.lapiz0, -11], ["pop", T.hermanos + 0.05, -11], ["pop", T.zeevaert + 0.05, -12]);
// a torre ingênua cai na gelatina e afunda (✖)
S.push(["whoosh", T.torreAsi - 0.1, -12], ["thud", T.torreAsi + 0.35, -9], ["squelch", T.hunde, -9], ["tl-wobble", T.hunde + 0.3, -9],
  ["creak", T.cuchara, -11], ["strike", T.gelatina + 0.05, -10], ["buzzer", T.gelatina + 0.35, -13]);
// os pilotes: o bate-estaca crava, cada um bate na capa dura (brilho), a contagem até 361
for (let i = 0; i < 7; i++) S.push(["vn-pilehit", PILE_T(i), -11 - (i % 2)], ["vn-pilehit", PILE_T(i) + 0.17, -13]);
S.push(["wheel", T.c361, -14], ["ding", T.arena + 0.1, -10], ["ss-shimmer", T.arena + 0.3, -12], ["ss-rise", T.treinta, -12], ["ding", T.estos + 0.6, -9]);
// pesa demais: setas vermelhas
S.push(["creak", T.pesa, -10], ["thud", T.pesa + 0.4, -11]);
// «el suelo no aguanta»: Zeevaert afunda até a canela
S.push(["squelch", T.suelo + 0.05, -11]);
// v2: estaca que afunda em «blando»; pré-tremor de 1957; prédios de 1985 em panqueca; a janela de 2017
S.push(["squelch", T.blando, -10], ["quake", T.m1957 + 0.6, -14]);
for (let j = 0; j < 4; j++) S.push(["thud", T.cayeron - 0.1 + j * 0.28 + 0.25, -10 - (j % 2)]);
S.push(["pop", T.otra - 0.05, -11], ["sg-shatter", T.otra + 0.5, -10]);
// o cajón: a terra sai para a balança, equilíbrio, flutua como barco
S.push(["dig", T.cavan, -10]);
for (let i = 0; i < DIRT_N; i += 3) S.push(["gravel", DIRT_T(i) + DIRT_FLY, -14 - (i % 2)]);
S.push(["concrete", T.sacan, -12], ["clack", T.compensa, -10], ["ding", T.compensa + 0.5, -9], ["pop", T.torre3, -12], ["bubble", T.flota, -11], ["splash", T.barco, -12],
  ["ding", T.cajon + 0.4, -9]);
// terremoto: o barro balança, o tremor cresce, o prédio rígido cai (✖)
S.push(["quake", T.tiembla, -8], ["tl-wobble", T.tiembla + 0.4, -11], ["tl-sway", T.agranda, -10], ["crumble", T.plato, -8], ["thud", T.plato + 0.6, -10],
  ["strike", T.plato + 0.5, -12]);
// o esqueleto de aço que se mece como uma caña
S.push(["tl-steel", T.esqueleto0, -10], ["tl-rivet", T.flexible, -11], ["quake", T.mece - 0.2, -11], ["tl-sway", T.mece, -9], ["wind", T.cana, -13],
  ["ding", T.esqueleto + 0.4, -9]);
// o giro: 1957, nenhum aparato (✖), o lápis da torre desenha o tremor, o Anjo cai, a torre sem danos; 1985; 2017
S.push(["giro", T.giro - 0.05, -8], ["pop", T.m1957 + 0.4, -11], ["sg-beeps", T.aparato, -12], ["strike", T.aparato + 0.35, -11], ["clack", T.fuerte + 0.32, -10], ["thud", T.fuerte + 0.75, -11],
  ["wheel", T.midio, -12], ["quill", T.lapiz + 0.2, -10], ["quake", T.dibujaba - 0.3, -10], ["quill", T.dibujaba + 0.1, -10], ["quill", T.sacudida, -11],
  ["tl-angel", T.tiro + 0.2, -7], ["ding", T.intacta + 0.3, -9],
  ["quake", T.m1985, -8], ["crumble", T.cayeron, -9], ["ss-domecrash", T.cayeron + 0.4, -11], ["crowd", T.cayeron + 0.8, -15], ["ding", T.ella + 0.3, -9],
  ["quake", T.m2017, -9], ["tl-sway", T.m2017 + 0.3, -11], ["ding", T.otra + 0.2, -9],
  ["fanfare", T.manda - 0.1, -9], ["confetti", T.manda + 0.2, -12]);
export const SFX = S;
