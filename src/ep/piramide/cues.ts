// E1 — La Gran Pirámide. Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const b = (n: number) => find("sin motores", n, 0.1), ci = (n: number) => find("con ingenio", n, 0.05);
export const T = {
  bloques: find("dos millones"), toneladas: find("dos toneladas"), motor: find("ni un solo motor"),
  egipto: find("egipto"), keops: find("el faraon keops"), piedra: find("la piedra sale"), como: find("pero como mueves"),
  b1: b(0), c1: ci(0), trineo1: find("un trineo de madera"), equipo: find("un equipo"), esteTrineo: find("este es el trineo"),
  p1: find("pero hay un problema", 0, 0.1), hunde: find("se hunde"), amontona: find("se amontona"), muro: find("como un muro"),
  b2: b(1), c2: ci(1), agua: find("uno va delante"), echando: find("echando agua"), mojada: find("la arena mojada"), mitad: find("hasta la mitad"), pintado: find("esta pintado"), fisicos: find("dos mil catorce"), comprobaron: find("lo comprobaron"),
  p2: find("pero la piedra blanca", 0, 0.1), tura: find("esta en tura"), nilo: find("del nilo"),
  b3: b(2), c3: ci(2), crecida: find("esperan la crecida"), sube: find("el rio sube"), canales: find("llena los canales"), barcos: find("los barcos llegan"), puerto: find("este es el puerto"), merer: find("un inspector"), diario: find("su diario"), papiro: find("el papiro escrito"),
  p3: find("pero la piramide crece", 0, 0.1), subir: find("tienen que subir"), metros: find("ciento cuarenta y seis"),
  b4: b(3), c4: ci(3), rampas: find("rampas de tierra"), rampa: find("esta es la rampa"), misterio: find("su forma exacta"),
  p4: find("pero son diez mil", 0, 0.1), hambre: find("tienen hambre"),
  b5: b(4), c5: ci(4), ciudad: find("levantan una ciudad"), panaderias: find("con panaderias"), vacas: find("veintiuna vacas"), ovejas: find("veintitres ovejas"), esclavos: find("no eran esclavos"), tumbas: find("tenian sus tumbas"),
  veinte: find("veinte anos despues"), terminada: find("obra terminada"), alto: find("el edificio mas alto"), cuatroMil: find("casi cuatro mil"),
  todo: find("y todo sin"), manda: find("mandaselo"),
  end: DURATION_S,
};
export { CUTS, WINS };

// efeitos (nome do arquivo em som/el/, instante, ganho dB). A mixagem abaixa os efeitos 7 dB sob a voz.
const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const w of [WINS[3], WINS[6], WINS[10]]) S.push(["whoosh", w - 0.25, -13]);
for (const [a, c] of [[T.b1, T.c1], [T.b2, T.c2], [T.b3, T.c3], [T.b4, T.c4], [T.b5, T.c5]]) { S.push(["stamp", a + 0.05, -8], ["strike", a + 0.32, -12], ["chime", c + 0.04, -7]); }
for (const a of [T.como, T.p1, T.p2, T.p3, T.p4]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.b2, T.b3, T.b4, T.b5]) S.push(["rewind", a - 0.05, -13]);
for (const a of [T.esteTrineo, T.mojada, T.puerto, T.rampa, T.ciudad]) S.push(["ding", a + 0.05, -9]);
for (const a of [T.bloques + 0.05, T.toneladas, T.egipto, T.mitad, T.papiro, T.p4 + 0.4, T.vacas, T.ovejas]) S.push(["pop", a, -11]);
S.push(["chisel", CUTS[0] + 0.1, -14], ["thud", T.trineo1 + 0.35, -9], ["drag", T.equipo, -13], ["buzzer", T.hunde, -11], ["sink", T.hunde + 0.1, -10],
  ["pour", T.echando, -10], ["drag", T.mojada + 0.3, -15], ["river", T.sube, -9], ["creak", T.barcos, -13], ["scroll", T.diario, -10],
  ["stone", T.p3 + 0.3, -10], ["stone", T.rampas + 0.4, -12], ["crowd", CUTS[5] + 0.2, -17], ["fire", T.panaderias, -14], ["moo", T.vacas + 0.3, -11], ["baa", T.ovejas + 0.3, -12],
  ["fanfare", T.terminada - 0.05, -6], ["confetti", T.alto, -10], ["whoosh", T.tumbas - 0.3, -13]);
export const SFX = S;
