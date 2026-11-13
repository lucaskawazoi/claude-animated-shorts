// E12 — Stonehenge. Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const ci = (n: number) => find("con ingenio", n, 0.05);
export const T = {
  treinta: find("treinta toneladas"), algunas: find("algunas traidas"), doscientos: find("doscientos kilometros"), rueda: find("y sin una sola"),
  inglaterra: find("inglaterra"), cuatromil: find("cuatro mil quinientos"),
  nohay: find("no hay motores"), ruedas: find("ni ruedas"), gruas: find("ni gruas"),
  madera: find("madera cuerda"), cuerda: find("cuerda piedra"), piedra: find("piedra y mucha"), gente: find("mucha gente"),
  levantar: find("quieren levantar"), circulo: find("un circulo de piedras"),
  b1: find("como arrastras", 0, 0.1), toneladas: find("tantas toneladas"), c1: ci(0), prob1: find("probablemente"),
  trineo: find("un trineo de madera"), desliza: find("se desliza"), troncos: find("troncos puestos"), rieles: find("como rieles"),
  cientos: find("cientos de personas"), tiran: find("tiran de las cuerdas"), esteTrineo: find("este es el trineo"),
  p1: find("pero la piedra llega", 0, 0.1), acostada: find("llega acostada"), depie: find("quedar de pie"),
  b2: find("como la pones", 0, 0.1), c2: ci(1), cavan: find("cavan un hoyo"), rampa: find("pared en rampa"),
  empujan: find("empujan la piedra"), punta: find("la punta cae"), cae: find("cae dentro"),
  enderezan: find("la enderezan"), tirando: find("tirando de cuerdas"),
  rellenan: find("luego rellenan"), piedras: find("piedras y tierra"), tierra: find("tierra bien"), apretadas: find("bien apretadas"), esteHoyo: find("este es el hoyo"),
  p2: find("pero encima de dos", 0, 0.1), pilares: find("dos pilares"), otra: find("otra piedra acostada"), altura: find("a mas de cuatro"), metros: find("cuatro metros de altura"),
  b3: find("como la subes", 0, 0.1), c3: find("lo mas probable", 0, 0.05), palancas: find("con palancas"), levantan: find("levantan un lado"),
  meten: find("meten un tronco"), tronco1: find("un tronco debajo"), otroLado: find("luego el otro lado"), otroTronco: find("y otro tronco"),
  capa: find("capa a capa"), sube: find("la piedra sube"), torre: find("una torre de madera"), estaTorre: find("esta es la torre"),
  p3: find("pero una piedra suelta", 0, 0.1), arriba: find("alla arriba"), caer: find("puede caer"),
  b4: find("solucion", 0, 0.1), tallan: find("la tallan"), comoMadera: find("como si fuera madera"),
  cada: find("cada pilar"), saliente: find("un saliente arriba"), encima: find("la piedra de encima"), hueco: find("un hueco que"), encaja: find("encaja", 0, 0.03),
  mueble: find("las piezas de un mueble"), juntas: find("estas son las juntas"),
  giro: find("y el giro"), mira: find("mira al sol"), largo: find("el dia mas largo"), sale: find("el sol sale"), alineado: find("alineado con su eje"), eje: find("su eje"),
  nadie: find("aun nadie sabe"), paraque: find("para que lo hicieron"),
  manda: find("mandaselo"),
  end: DURATION_S,
};
export { CUTS, WINS };

/** cortes duros extras (ritmo do lote 3: um corte a cada ~4 s; os 7 da régua continuam), todos a ≥1,5 s de um corte da régua */
export const XCUTS = [T.algunas, T.inglaterra, T.levantar, T.desliza - 0.3, T.b2, T.empujan - 0.1, T.esteHoyo - 0.3,
  T.palancas - 0.05, T.capa - 0.05, T.cada - 0.05, T.giro - 0.05, T.nadie - 0.1];
/** a queda cômica: o dintel solto escorrega dos pilares, cai e quica no chão; no «solución» volta de ré */
export const FALL0 = T.caer - 0.12, FALL1 = T.caer + 0.5;

// tempos derivados que o mundo e o painel compartilham
export const NSTEP = 24; // meios-passos da torre: cada um põe um par de troncos sob UM lado do dintel (ímpar = lado A, par = B)
/** instante em que o par de troncos do passo k entra (k=1..NSTEP); a base (k=0) já está lá */
export const stepAt = (k: number) => {
  if (k <= 0) return 0;
  if (k === 1) return T.tronco1 + 0.25; // «meten un tronco debajo» (lado A)
  if (k === 2) return T.otroTronco + 0.2; // «y otro tronco» (lado B)
  return T.capa + 0.05 + ((k - 3) * (T.torre + 0.35 - T.capa)) / (NSTEP - 3); // «capa a capa»
};

// a abertura escolhida (a mixagem roda no bun: OPEN=b ./cues-json.sh …); no navegador o som não é usado
const OPEN = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.OPEN ?? "a";
const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const c of XCUTS) S.push(["whoosh", c - 0.2, -15]);
if (OPEN === "a") { S.push(["stone", 0.3, -5], ["quake", 0.32, -11]); for (let k = 0; k < 6; k++) S.push(["stone", 0.6 + k * 0.24, -13 - (k % 2) * 2]); }
else if (OPEN === "b") S.push(["drag", 0.0, -8], ["qe-heave", 0.1, -9], ["qe-taut", 0.05, -12], ["crowd", 0.0, -15], ["sh-log", 0.55, -12], ["sh-log", 1.15, -12], ["sh-log", 1.75, -13]);
else S.push(["qe-heave", 0.05, -9], ["qe-slip", 0.38, -12], ["qe-slip", 0.78, -12], ["qe-slip", 1.1, -11], ["qe-boing", 1.28, -9], ["thud", 1.6, -10], ["buzzer", 1.35, -14]);
for (const w of [WINS[3], WINS[6], WINS[10]]) S.push(["whoosh", w - 0.25, -13]);
for (const [a, c] of [[T.b1, T.c1], [T.b2, T.c2], [T.b3, T.c3]]) S.push(["stamp", a + 0.05, -8], ["strike", a + 0.32, -12], ["chime", c + 0.04, -7]);
S.push(["chime", T.b4 + 0.05, -8]);
for (const a of [T.p1, T.p2, T.p3]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.inglaterra, T.b2, T.b3, T.b4]) S.push(["rewind", a - 0.05, -13]);
for (const a of [T.esteTrineo, T.esteHoyo, T.estaTorre, T.juntas]) S.push(["ding", a + 0.05, -9]);
for (const a of [T.treinta + 0.05, T.doscientos, T.nohay + 0.05, T.ruedas + 0.05, T.gruas + 0.05, T.metros, T.largo]) S.push(["pop", a, -11]);
for (let k = 1; k <= NSTEP; k++) if (k < 3 || k % 3 === 0) S.push(["sh-log", stepAt(k) - 0.05, k < 3 ? -9 : -15]);
S.push(["wind", 0.0, -16], ["sink", T.inglaterra + 0.1, -10], ["crowd", T.gente, -15], ["chime", T.circulo + 0.1, -12],
  ["sh-tip", T.toneladas, -13], ["buzzer", T.toneladas + 0.6, -14], ["thud", T.trineo + 0.25, -9], ["drag", T.desliza, -10], ["drag", T.tiran, -11], ["qe-heave", T.cientos, -10],
  ["drag", T.esteTrineo - 0.3, -12], ["thud", T.acostada + 0.15, -11],
  ["dig", T.cavan, -9], ["dig", T.cavan + 0.7, -12], ["drag", T.empujan, -10], ["sh-tip", T.punta, -7],
  ["qe-heave", T.enderezan, -9], ["qe-taut", T.enderezan + 0.05, -12], ["stone", T.tirando + 0.5, -12],
  ["gravel", T.piedras, -10], ["dig", T.tierra, -11], ["sh-tamp", T.apretadas - 0.1, -8],
  ["sh-lever", T.levantan, -8], ["sh-lever", T.otroLado + 0.1, -8], ["creak", T.capa, -14], ["creak", T.torre, -14],
  ["stone", T.arriba - 0.3, -12], ["crumble", T.caer - 0.1, -11], ["whoosh", T.caer, -13], ["thud", FALL1, -6], ["qe-boing", FALL1 + 0.2, -10], ["buzzer", FALL1 + 0.05, -13], ["qe-slip", T.caer - 0.05, -12],
  ["chisel", T.tallan, -9], ["chisel", T.comoMadera + 0.3, -11], ["sh-click", T.encaja, -4], ["confetti", T.encaja + 0.1, -16],
  ["giro", T.giro, -9], ["wind", T.mira, -15], ["sh-sunrise", T.sale - 0.4, -8], ["chime", T.eje, -10],
  ["fanfare", T.manda - 0.15, -8], ["confetti", T.manda + 0.3, -12]);
export const SFX = S;
