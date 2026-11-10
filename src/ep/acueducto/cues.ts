// E2 — El acueducto de Segovia. Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const b = (n: number) => find("sin motores", n, 0.1), ci = (n: number) => find("con ingenio", n, 0.05);
export const T = {
  bloques: find("veinte mil bloques"), cemento: find("ni una gota"), pie: find("dos mil anos en pie"),
  hispania: find("hispania"), roca: find("sobre una roca"), sierra: find("esta en la sierra"), km: find("quince kilometros"), como: find("como la traes"),
  b1: b(0), c1: ci(0), canal: find("un canal con"), sola: find("el agua baja sola"), esteCanal: find("este es el canal"),
  p1: find("pero el agua de la sierra", 0, 0.1), arena: find("trae arena"), tapa: find("el canal se tapa"),
  b2: b(1), c2: ci(1), pileta: find("una pileta"), quieta: find("se queda quieta"), fondo: find("se va al fondo"), limpia: find("sigue el agua limpia"), desarenador: find("este es el desarenador"),
  p2: find("pero justo antes", 0, 0.1), valle: find("hay un valle"), baja: find("si el canal baja"), noSube: find("ya no sube"),
  b3: b(2), c3: ci(2), arcos: find("lo levantan sobre arcos"), ciento: find("ciento sesenta y siete"), alto: find("veintiocho metros de alto"), estosArcos: find("estos son los arcos"),
  p3: find("pero como se sostienen", 0, 0.1),
  b4: b(3), c4: ci(3), cimbra: find("una cimbra"), dovelas: find("las dovelas"), clave: find("la clave", 0), empuja: find("cada piedra empuja"), aprieta: find("se aprieta solo"), estaClave: find("esta es la clave"),
  p4: find("pero cada bloque", 0, 0.1), tonelada: find("una tonelada"), subirlo: find("hay que subirlo"),
  b5: b(4), c5: ci(4), gruas: find("gruas de madera"), mira: find("mira bien"), huecos: find("los huecos"), pinzas: find("las pinzas"),
  llego: find("y el agua llego"), siglo: find("hasta el siglo veinte"),
  todo: find("y todo sin"), manda: find("mandaselo"),
  end: DURATION_S,
};
export { CUTS, WINS };

const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const w of [WINS[3], WINS[6], WINS[10]]) S.push(["whoosh", w - 0.25, -13]);
for (const [a, c] of [[T.b1, T.c1], [T.b2, T.c2], [T.b3, T.c3], [T.b4, T.c4], [T.b5, T.c5]]) S.push(["stamp", a + 0.05, -8], ["strike", a + 0.32, -12], ["chime", c + 0.04, -7]);
for (const a of [T.como, T.p1, T.p2, T.p3, T.p4]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.hispania, T.b2, T.b3, T.b4, T.b5]) S.push(["rewind", a - 0.05, -13]);
for (const a of [T.esteCanal, T.desarenador, T.estosArcos, T.estaClave, T.gruas]) S.push(["ding", a + 0.05, -9]);
for (const a of [T.bloques + 0.05, T.cemento, T.pie, T.km, T.ciento, T.tonelada, T.siglo]) S.push(["pop", a, -11]);
S.push(["stream", T.canal, -12], ["gravel", T.arena, -10], ["buzzer", T.tapa, -12], ["splash", T.pileta + 0.2, -11], ["waterfall", T.valle, -10], ["buzzer", T.noSube, -13],
  ["stone", T.arcos + 0.2, -10], ["stone", T.ciento + 0.6, -12], ["creak", T.cimbra, -13], ["chime", T.clave + 0.35, -9],
  ["creak", T.gruas, -11], ["fountain", T.llego + 0.2, -10], ["cheer", T.llego + 0.6, -13], ["fanfare", T.siglo - 0.05, -7], ["confetti", T.siglo + 0.3, -11]);
for (let k = 0; k < 4; k++) S.push(["clack", T.dovelas + k * 0.28, -12]);
export const SFX = S;
