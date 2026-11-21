// E17 — Os puquios de Nasca. Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const ci = (n: number) => find("con ingenio", n, 0.05);
export const T = {
  desierto: find("un desierto"), llueve: find("nunca llueve"), rio0: find("un rio corre"), bajo0: find("bajo tierra"),
  construyeron: find("lo construyeron"), nasca0: find("los nasca"), mil500: find("mil quinientos"), todavia0: find("y todavia funciona"),
  nascaPeru: find("nasca peru"), nohay: find("no hay bombas"), bombas: find("bombas"), tubos: find("ni tubos"), motores: find("ni motores"),
  piedra: find("solo piedra"), tierra: find("tierra troncos"), troncos: find("troncos y manos"), manos: find("y manos"),
  superficie: find("de la superficie"), seco: find("ano seco"),
  b1: find("como encuentras", 0, 0.1), c1: ci(0), cavan: find("cavan hasta"), grava: find("la grava"), cauce: find("el cauce"),
  sigue: find("sigue corriendo"), escondida: find("escondida"), recogen: find("la recogen"), zanja: find("una zanja", 0),
  p2: find("pero una zanja", 0, 0.1), derrumba: find("se derrumba"), sol: find("el sol del"), bebe: find("se bebe"),
  b2: find("como la proteges", 0, 0.1), c2: ci(1), forran: find("forran las paredes"), conPiedra: find("con piedra"),
  tapan: find("la tapan"), losas: find("losas"), troncos2: find("losas y troncos"), cubren: find("la cubren"),
  oscuras: find("a oscuras"), noToca: find("no la toca"), puquio: find("este es el puquio"),
  p3: find("pero bajo tierra", 0, 0.1), llena: find("se llena"), barro: find("barro y arena"), alguien: find("alguien tiene"), limpiarlo: find("a limpiarlo"),
  b3: find("solucion", 0, 0.1), cada: find("cada tantos"), abren: find("abren un pozo"), embudo: find("de embudo"), rampa: find("con rampa"),
  espiral: find("en espiral"), bajan: find("por ahi bajan"), ojos: find("estos son los ojos"),
  hipotesis: find("una hipotesis"), viento: find("el viento"), entra: find("entra por los ojos"), empujar: find("empujar el agua"),
  final: find("al final"), sale: find("sale a un"), cocha: find("la cocha"), riega: find("riega los campos"),
  giro: find("viene el giro"), mil: find("mas de mil"), agricultores: find("los agricultores"), usan: find("todavia usan"),
  cadaAno: find("cada ano bajan"), aMano: find("a mano"),
  manda: find("mandaselo"),
  end: DURATION_S,
};
export { CUTS, WINS };

/** cortes duros extras (um a cada ~3–5 s), longe dos 7 da régua */
export const XCUTS = [T.construyeron, T.todavia0, T.superficie, T.cavan, T.p2, T.b2, T.cubren, T.p3, T.b3, T.rampa, T.hipotesis, T.final, T.giro, T.cadaAno, T.manda, T.c1, T.riega, T.usan, T.piedra - 0.1, T.oscuras - 0.4, T.ojos + 0.7, 18.0];
export const OJO_T = (i: number) => T.abren + i * 0.25;

const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const x of XCUTS) S.push(["whoosh", x - 0.2, -16]);
for (const [a, c] of [[T.b1, T.c1], [T.b2, T.c2]]) S.push(["stamp", a + 0.05, -8], ["strike", a + 0.32, -12], ["chime", c + 0.04, -7]);
S.push(["chime", T.b3 + 0.5, -9]);
for (const a of [T.seco, T.p2, T.p3]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.b1, T.b2, T.b3]) S.push(["rewind", a - 0.05, -13]);
for (const a of [T.puquio, T.ojos]) S.push(["ding", a + 0.05, -9]);
// gancho: vento do deserto, a poça seca, a água corre sob a terra; construtores; a cocha cheia
S.push(["wind", 0.0, -15], ["sizzle", T.llueve, -14], ["stream", T.rio0, -11], ["vn-bubbles", T.bajo0, -13],
  ["chisel", T.construyeron + 0.2, -13], ["stone", T.nasca0, -12], ["pop", T.mil500, -11], ["splash", T.todavia0 + 0.1, -11], ["ak-birds", T.todavia0 + 0.5, -15]);
// premissa: bomba, cano e motor aparecem e somem riscados; pedra, terra, troncos, mãos
S.push(["pop", T.bombas, -12], ["strike", T.tubos - 0.1, -11], ["pop", T.tubos, -13], ["strike", T.motores - 0.1, -11], ["pop", T.motores, -13], ["strike", T.piedra - 0.1, -11],
  ["stone", T.piedra, -10], ["gravel", T.tierra, -11], ["sh-log", T.troncos, -11], ["cheer", T.manos, -12], ["wind", T.superficie, -14], ["drag", T.seco, -14]);
// cavar até a água escondida; a vala
S.push(["dig", T.cavan, -10], ["dig", T.cavan + 0.5, -12], ["gravel", T.grava, -11], ["stream", T.sigue, -10], ["drip", T.escondida, -12], ["dig", T.recogen, -12], ["river", T.zanja, -12]);
// desaba, o sol bebe a água ✖
S.push(["crumble", T.derrumba, -8], ["sandfall", T.derrumba + 0.3, -11], ["buzzer", T.derrumba + 0.5, -13], ["sizzle", T.sol, -10], ["smoke", T.bebe, -13]);
// forra de pedra, lajes, troncos, terra; o sol não toca ✔
for (let k = 0; k < 6; k++) S.push(["stone", T.forran + k * 0.22, -13 - (k % 2)]);
S.push(["thud", T.losas, -10], ["thud", T.losas + 0.3, -12], ["sh-log", T.troncos2, -10], ["sandfall", T.cubren, -10], ["sh-tamp", T.cubren + 0.6, -11], ["glass", T.noToca, -13], ["ding", T.noToca + 0.3, -11]);
// barro enchendo ✖; os ojos se abrem; descer pela rampa
S.push(["mud", T.llena, -9], ["squelch", T.barro + 0.2, -11], ["buzzer", T.alguien, -13]);
for (let i = 0; i < 5; i++) S.push(["pop", OJO_T(i), -12 - (i % 2)]);
S.push(["dig", T.embudo, -12], ["slide", T.rampa + 0.2, -12], ["fs-steps", T.bajan, -13], ["squelch", T.bajan + 0.5, -12], ["fanfare", T.ojos, -13]);
// o vento entra pelos ojos e empurra a água; a cocha; os campos
S.push(["wind", T.viento, -9], ["wind", T.entra + 0.4, -11], ["stream", T.empujar, -9], ["waterfall", T.sale, -10], ["splash", T.cocha, -10],
  ["pour", T.riega, -12], ["pop", T.riega + 0.4, -13], ["pop", T.riega + 0.8, -14], ["ak-birds", T.riega + 1.0, -14]);
// o giro: os agricultores de hoje; baldes de barro subindo pela rampa
S.push(["giro", T.giro - 0.05, -8], ["cheer", T.agricultores, -10], ["crowd", T.usan, -14], ["dig", T.cadaAno, -11], ["squelch", T.cadaAno + 0.4, -13],
  ["fanfare", T.manda - 0.1, -9], ["confetti", T.manda + 0.2, -12]);
export const SFX = S;
