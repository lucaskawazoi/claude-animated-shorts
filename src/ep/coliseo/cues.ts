// E3 — El Coliseo. Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const b = (n: number) => find("sin motores", n, 0.1), ci = (n: number) => find("con ingenio", n, 0.05);
export const T = {
  espect: find("cincuenta mil espectadores"), diez: find("menos de diez"), puertas: find("ochenta puertas"),
  roma: find("roma ano setenta"), vespasiano: find("el emperador vespasiano"), nero: find("donde neron"), lago: find("su lago privado"),
  p1: find("pero sobre un lago", 0, 0.1),
  b1: b(0), c1: ci(0), vacian: find("vacian el lago"), llenan: find("llenan el hueco"), anillo: find("un anillo"), doce: find("doce metros"), cimientos: find("estos son los cimientos"),
  p2: find("pero encima van", 0, 0.1), cien: find("cien mil metros"),
  b2: b(1), c2: ci(1), pilares: find("pilares de travertino"), arcos: find("arcos y bovedas"), reparten: find("reparten la carga"), estosArcos: find("estos son los arcos"),
  p3: find("pero cincuenta mil personas", 0, 0.1), atasco: find("un atasco gigante"),
  b3: b(2), c3: ci(2), setenta: find("setenta y seis"), ficha: find("en tu ficha"), vomitorios: find("estos son los vomitorios"),
  p4: find("pero el sol", 0, 0.1),
  b4: b(3), c4: ci(3), toldo: find("un toldo gigante"), velario: find("el velario", 0), marineros: find("marineros"), esteVelario: find("este es el velario"),
  ochenta: find("ano ochenta"), inaugura: find("se inaugura"), cienDias: find("cien dias"),
  p5: find("pero el publico", 0, 0.1),
  b5: b(4), c5: ci(4), domiciano: find("el emperador domiciano"), excava: find("excava un sotano"), monta: find("montacargas"), suben: find("que suben animales"), hipogeo: find("este es el hipogeo"),
  hoy: find("hoy le falta"), terremotos: find("terremotos"), cantera: find("como cantera"), sigue: find("pero sigue en pie"),
  manda: find("mandaselo"),
  end: DURATION_S,
};
export { CUTS, WINS };

const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const w of [WINS[3], WINS[6], WINS[10]]) S.push(["whoosh", w - 0.25, -13]);
for (const [a, c] of [[T.b1, T.c1], [T.b2, T.c2], [T.b3, T.c3], [T.b4, T.c4], [T.b5, T.c5]]) S.push(["stamp", a + 0.05, -8], ["strike", a + 0.32, -12], ["chime", c + 0.04, -7]);
for (const a of [T.p1, T.p2, T.p3, T.p4, T.p5]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.roma, T.b2, T.b3, T.b4, T.b5]) S.push(["rewind", a - 0.05, -13]);
for (const a of [T.cimientos, T.estosArcos, T.vomitorios, T.esteVelario, T.hipogeo]) S.push(["ding", a + 0.05, -9]);
for (const a of [T.espect + 0.05, T.diez, T.puertas, T.doce, T.cien, T.setenta, T.cienDias]) S.push(["pop", a, -11]);
S.push(["crowd", 0.1, -16], ["splash", T.p1 + 0.5, -10], ["drain", T.vacian, -9], ["concrete", T.llenan + 0.3, -10], ["stone", T.pilares + 0.2, -10], ["stone", T.arcos + 0.3, -12],
  ["crowd", T.p3, -12], ["buzzer", T.atasco, -12], ["crowd", T.setenta + 0.4, -14], ["sail", T.toldo + 0.3, -10], ["creak", T.marineros, -13],
  ["fanfare", T.inaugura - 0.05, -7], ["cheer", T.inaugura + 0.3, -10], ["dig", T.excava, -11], ["creak", T.monta, -12], ["roar", T.suben + 0.2, -10],
  ["quake", T.terremotos - 0.1, -9], ["stone", T.cantera, -12], ["confetti", T.sigue, -11]);
export const SFX = S;
