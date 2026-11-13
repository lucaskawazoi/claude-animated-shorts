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
  manda: find("mandaselo"), sofa: find("el sofa"),
  end: DURATION_S,
};
export { CUTS, WINS };

/** cortes duros extras (ritmo do lote 3: um corte a cada ~4 s; os 7 da régua continuam), todos a ≥1,5 s de um corte da régua */
export const XCUTS = [T.algunas, T.inglaterra, T.levantar, T.desliza - 0.3, T.b2, T.empujan - 0.1, T.esteHoyo - 0.3,
  T.palancas - 0.05, T.capa - 0.05, T.cada - 0.05, T.giro - 0.05, T.sale - 0.2, T.nadie + 0.35, // [11] = o plano do sol no eixo
  T.cientos - 0.2]; // [13] (fora de ordem para não renumerar): de frente para os que puxam, um escorrega
/** pré-crítica de ritmo (13/11): cada trecho parado ganhou um objeto em movimento ou uma piada */
export const RUN0 = T.cuatromil, RUN1 = T.cuatromil + 1.25; // o operário corre até a câmera na planície vazia
export const NOGO = { m: T.nohay + 0.22, w: T.ruedas + 0.17, g: T.gruas + 0.25 }; // motor cai, roda rola, grua brota (cada um leva ✖)
export const PULL0 = T.prob1 - 0.1, SLIDE0 = T.trineo + 0.3; // a multidão já puxa; a pedra anda assim que sobe no trenó
export const FLY_AT = [T.trineo + 0.98, T.rieles, T.cientos + 0.3]; // pouso dos trilhos levados de trás para a frente
export const SLIP = T.cientos + 0.3; // um dos que puxam escorrega e é arrastado de costas (✖)
export const RUL0 = T.esteHoyo - 0.15; // régua de 4 m e dintel-fantasma já no «este es el hoyo»
export const TS = T.sube + 0.12; // um tronco escapa do topo da torre, bate na cabeça do operário e volta (✖)
/** reconferência da v3: o operário pula três vezes para alcançar o topo da régua de 4 m e não chega (✖) */
export const JUMP0 = T.esteHoyo + 0.7, JUMPN = 3, JUMPD = 0.35;
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
const OPEN = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.OPEN ?? "c"; // padrão: c (escolha do crítico, 13/11)
const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const c of XCUTS) S.push(["whoosh", c - 0.2, -15]);
if (OPEN === "a") { S.push(["stone", 0.3, -5], ["quake", 0.32, -11]); for (let k = 0; k < 6; k++) S.push(["stone", 0.6 + k * 0.24, -13 - (k % 2) * 2]); }
else if (OPEN === "b") S.push(["drag", 0.0, -8], ["qe-heave", 0.1, -9], ["qe-taut", 0.05, -12], ["crowd", 0.0, -15], ["sh-log", 0.55, -12], ["sh-log", 1.15, -12], ["sh-log", 1.75, -13]);
else S.push(["qe-heave", 0.0, -8], ["qe-slip", 0.02, -12], ["qe-slip", 0.4, -12], ["qe-slip", 0.68, -11], ["qe-boing", 0.95, -9], ["buzzer", 1.02, -14], ["thud", 1.28, -9], ["qe-pling", 1.75, -8]);
for (const w of [WINS[3], WINS[6], WINS[10]]) S.push(["whoosh", w - 0.25, -13]);
for (const [a, c] of [[T.b1, T.c1], [T.b2, T.c2], [T.b3, T.c3]]) S.push(["stamp", a + 0.05, -8], ["strike", a + 0.32, -12], ["chime", c + 0.04, -7]);
S.push(["chime", T.b4 + 0.05, -8]);
for (const a of [T.p1, T.p2, T.p3]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.inglaterra, T.b2, T.b3, T.b4]) S.push(["rewind", a - 0.05, -13]);
for (const a of [T.esteTrineo, T.esteHoyo, T.estaTorre, T.juntas]) S.push(["ding", a + 0.05, -9]);
for (const a of [T.treinta + 0.05, T.doscientos, T.metros, T.largo]) S.push(["pop", a, -11]);
for (let k = 1; k <= NSTEP; k++) if (k < 3 || k % 3 === 0) S.push(["sh-log", stepAt(k) - 0.05, k < 3 ? -9 : -15]);
S.push(["wind", 0.0, -16], ["sink", T.inglaterra + 0.1, -10], ["crowd", T.gente, -15], ["chime", T.circulo + 0.1, -12],
  ["sh-tip", T.toneladas, -13], ["buzzer", T.toneladas + 0.6, -14], ["thud", T.trineo + 0.25, -9], ["drag", SLIDE0 + 0.05, -10], ["drag", T.tiran, -11], ["qe-heave", T.cientos, -10],
  ["drag", T.esteTrineo - 0.3, -12], ["thud", T.acostada + 0.15, -11],
  ["dig", T.cavan, -9], ["dig", T.cavan + 0.7, -12], ["drag", T.empujan, -10], ["sh-tip", T.punta, -7],
  ["qe-heave", T.enderezan, -9], ["qe-taut", T.enderezan + 0.05, -12], ["stone", T.tirando + 0.5, -12],
  ["gravel", T.piedras, -10], ["dig", T.tierra, -11], ["sh-tamp", T.apretadas - 0.1, -8],
  ["sh-lever", T.levantan, -8], ["sh-lever", T.otroLado + 0.1, -8], ["creak", T.capa, -14], ["creak", T.torre, -14],
  ["stone", T.arriba - 0.3, -12], ["crumble", T.caer - 0.1, -11], ["whoosh", T.caer, -13], ["thud", FALL1, -6], ["qe-boing", FALL1 + 0.2, -10], ["buzzer", FALL1 + 0.05, -13], ["qe-slip", T.caer - 0.05, -12],
  ["chisel", T.tallan, -9], ["chisel", T.comoMadera + 0.3, -11], ["sh-click", T.encaja, -4], ["confetti", T.encaja + 0.1, -16],
  ["giro", T.giro, -9], ["wind", T.mira, -15], ["sh-sunrise", T.sale - 0.4, -8], ["chime", T.eje, -10],
  ["fanfare", T.manda - 0.15, -8], ["confetti", T.manda + 0.3, -12],
  // a tentativa no braço na pergunta da altura (o dintel sobe um palmo e despenca)
  ["qe-heave", T.b3 + 0.1, -10], ["thud", T.b3 + 0.62, -8], ["qe-boing", T.b3 + 0.7, -12], ["buzzer", T.b3 + 0.72, -14],
  // o fim: o sofá cai do céu, ele empurra e nada; confete até o fim da voz
  ["whoosh", T.sofa - 0.45, -14], ["thud", T.sofa, -6], ["qe-boing", T.sofa + 0.1, -11], ["qe-heave", T.sofa + 0.45, -10], ["confetti", T.sofa + 0.2, -12]);
// pré-crítica de ritmo: corrida, motor/roda/grua, multidão, trilhos voando, escorregão, régua, tronco na cabeça
const [m, w, g] = [NOGO.m, NOGO.w, NOGO.g];
S.push(["whoosh", RUN0, -14], ["qe-slip", RUN1 - 0.1, -12],
  ["whoosh", m - 0.3, -14], ["thud", m, -6], ["stamp", m + 0.07, -9], ["buzzer", m + 0.1, -14], ["pop", m + 0.57, -13],
  ["sh-log", w - 0.3, -12], ["stamp", w + 0.08, -9], ["thud", w + 0.36, -10], ["pop", w + 0.48, -13],
  ["qe-boing", g - 0.25, -11], ["stamp", g + 0.07, -9], ["buzzer", g + 0.1, -14], ["pop", g + 0.72, -13],
  ["qe-heave", PULL0 + 0.1, -11], ["qe-taut", PULL0 + 0.05, -12], ["crowd", PULL0, -15],
  ...FLY_AT.flatMap((a): [string, number, number][] => [["whoosh", a - 0.6, -16], ["sh-log", a - 0.02, -11]]),
  ["qe-slip", SLIP, -11], ["thud", SLIP + 0.25, -9], ["qe-boing", SLIP + 0.3, -12], ["stamp", SLIP + 0.3, -10], ["buzzer", SLIP + 0.33, -15],
  ["chime", RUL0, -14], ["pop", RUL0 + 0.05, -13],
  ["qe-slip", TS, -12], ["whoosh", TS + 0.05, -15], ["thud", TS + 0.35, -8], ["qe-boing", TS + 0.38, -10], ["stamp", TS + 0.4, -10], ["buzzer", TS + 0.42, -14],
  ["thud", TS + 0.6, -12], ["rewind", TS + 1.2, -14], ["sh-log", TS + 1.55, -12],
  // reconferência: pula para a régua (✖), a pedra assenta no buraco com pó, o operário sobe na pedra no «piedra»
  ...Array.from({ length: JUMPN }, (_, k): [string, number, number] => ["qe-heave", JUMP0 + k * JUMPD, -13 + k]),
  ["thud", JUMP0 + JUMPN * JUMPD - 0.03, -11], ["stamp", JUMP0 + JUMPN * JUMPD + 0.03, -10], ["buzzer", JUMP0 + JUMPN * JUMPD + 0.06, -14],
  ["thud", T.cae + 0.3, -9], ["qe-boing", T.piedra - 0.2, -12], ["thud", T.piedra + 0.15, -11]);
export const SFX = S;
