// E6 — Gran Muralla. Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const ci = (n: number) => find("con ingenio", n, 0.05);
export const T = {
  luna: find("desde la luna"), veinte: find("veinte mil kilometros"), arroz0: find("pegada con arroz"),
  china: find("china"), nohay: find("no hay motores"), jinetes: find("los jinetes"), llanura: find("una llanura"),
  b1: find("como levantas", 0, 0.1), c1: ci(0), cajon: find("dos tablas"), tierra: find("tierra humeda"), mazo: find("con mazos"), capa: find("capa tras capa"), apisonada: find("esta es la tierra apisonada"),
  p1: find("pero la lluvia", 0, 0.1), siglo: find("siglo tras siglo"),
  b2: find("siglos despues", 0, 0.1), c2: find("la dinastia ming"), ming: find("la dinastia ming"), fuegoH: find("el fuego del horno"), hornos: find("los hornos"), ladrillo: find("este es el ladrillo"),
  p2: find("pero si un horno", 0, 0.1), cae: find("el muro se cae"), culpa: find("de quien es la culpa"),
  b3: find("solucion muchos", 0, 0.1), c3: find("muchos ladrillos"), grabado: find("llevan grabados"), responde: find("quien responde"), sello: find("este es el sello"),
  p3: find("pero la cal sola", 0, 0.1), hielo: find("con el hielo"),
  b4: find("como la haces", 0, 0.1), c4: ci(1), arroz: find("arroz glutinoso"), cal: find("mezclan con la cal"), dura: find("mas compacta"), argamasa: find("esta es la argamasa"),
  p4: find("pero un muro tan largo", 0, 0.1), mensajero: find("un mensajero"), dias: find("tarda dias"),
  b5: find("como avisas", 0, 0.1), c5: ci(2), torres: find("torres a la vista"), humo: find("humo de dia"), fuego: find("fuego de noche"), canon: find("el numero de canonazos"), enemigos: find("cuantos enemigos"), senales: find("estas son las torres"),
  giro: find("y aqui viene el giro"), manchues: find("los manchues"), sin: find("sin romperla"), general: find("un general ming"), abrio: find("les abrio la puerta"),
  manda: find("mandaselo"),
  end: DURATION_S,
};
export { CUTS, WINS };

const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const w of [WINS[3], WINS[6], WINS[10]]) S.push(["whoosh", w - 0.25, -13]);
for (const [a, c] of [[T.b1, T.c1], [T.b4, T.c4], [T.b5, T.c5]]) S.push(["stamp", a + 0.05, -8], ["strike", a + 0.32, -12], ["chime", c + 0.04, -7]);
for (const a of [T.c2, T.c3]) S.push(["chime", a, -9]);
for (const a of [T.p1, T.p2, T.p3, T.p4]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.china, T.b2, T.b3, T.b4, T.b5]) S.push(["rewind", a - 0.05, -13]);
for (const a of [T.apisonada, T.ladrillo, T.sello, T.argamasa, T.senales]) S.push(["ding", a + 0.05, -9]);
for (const a of [T.luna + 0.05, T.veinte, T.arroz0]) S.push(["pop", a, -11]);
S.push(["hooves", T.jinetes - 0.2, -10], ["buzzer", T.llanura + 0.4, -13],
  ["thud", T.mazo, -10], ["thud", T.mazo + 0.62, -11], ["thud", T.capa, -10], ["thud", T.capa + 0.62, -11],
  ["rain", T.p1 - 0.1, -10], ["mud", T.siglo, -12], ["fire", T.hornos, -12], ["crumble", T.cae - 0.2, -8], ["buzzer", T.culpa, -13],
  ["stamp", T.grabado - 0.12, -8], ["crack", T.hielo - 0.3, -9], ["ice", T.hielo, -12], ["bubble", T.arroz, -12],
  ["hooves", T.mensajero, -14], ["buzzer", T.dias, -14], ["smoke", T.humo, -13], ["fire", T.fuego, -12],
  ["cannon", T.canon + 0.25, -9], ["cannon", T.canon + 0.75, -10], ["cannon", T.canon + 1.25, -9],
  ["gong", T.giro, -9], ["hooves", T.manchues, -10], ["creak", T.abrio - 0.1, -9], ["hooves", T.abrio + 0.8, -10], ["fanfare", T.manda - 0.2, -10]);
export const SFX = S;
