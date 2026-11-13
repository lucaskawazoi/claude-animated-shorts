// E7 — Faro de Alejandría. Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const ci = (n: number) => find("con ingenio", n, 0.05);
export const T = {
  treinta: find("treinta pisos"), construido: find("construido"), nombre: find("su nombre lo usas"),
  alejandria: find("alejandria"), hace: find("hace unos"), nohay: find("no hay motores"), costa: find("la costa es plana"), rocas: find("rocas escondidas"), barcos: find("los barcos no"),
  b1: find("como marcas", 0, 0.1), c1: ci(0), torre: find("una torre gigante"), isla: find("la isla de faros"), pilotos: find("los pilotos"), torreT: find("esta es la torre"),
  p2: find("pero la isla esta separada", 0, 0.1), mar: find("por el mar"),
  b2: find("solucion un dique", 0, 0.1), c2: find("un dique"), dique: find("un dique de piedra"), kilometro: find("un kilometro"), une: find("que une la isla"), puertos: find("dos puertos"), hepta: find("este es el heptastadion"),
  p3: find("pero una torre tan alta", 0, 0.1), viento: find("el viento"), peso: find("su propio peso"),
  b3: find("como la sostienes", 0, 0.1), c3: ci(1), tres: find("tres pisos"), abajo: find("uno cuadrado"), medio: find("uno octogonal"), arriba: find("uno redondo"), estrecho: find("mas estrecho"), rodea: find("viento rodea"), pisosT: find("estos son los tres pisos"),
  p4: find("pero de noche", 0, 0.1), nadie: find("nadie ve"),
  b4: find("como la ves", 0, 0.1), c4: ci(2), fuego: find("un fuego encendido"), cima: find("en la cima"), lejos: find("desde muy lejos"), fuegoT: find("este es el fuego"),
  p5: find("pero hay que subir", 0, 0.1), cien: find("cien metros"), noches: find("todas las noches"),
  b5: find("como lo subes", 0, 0.1), c5: ci(3), dentro: find("por dentro"), rampa: find("una rampa ancha"), viajero: find("un viajero arabe"), jinetes: find("dos jinetes"), rampaT: find("esta es la rampa"),
  terremotos: find("varios terremotos"), peor: find("el peor"), ruinas: find("en ruinas"), piedras: find("con sus piedras"), fortaleza: find("una fortaleza"), pie: find("sigue en pie"),
  nombre2: find("le dejo su nombre"), faros: find("todos los faros"), manda: find("mandaselo"),
  end: DURATION_S,
};
export { CUTS, WINS };
/** o casco bate na rocha escondida (efeito de batida) */
export const IMPACT = T.barcos + 0.4;
/** o feixe de lenha sobe pela corda até o alto (crítico da v2: «hay que subir combustible» só mostrava toras no chão) */
export const HOIST: [number, number] = [T.p5 + 0.65, T.b5 - 0.2];

const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const w of [WINS[3], WINS[6], WINS[10]]) S.push(["whoosh", w - 0.25, -13]);
for (const a of [T.c2]) S.push(["chime", a, -9]);
for (const [a, c] of [[T.b1, T.c1], [T.b3, T.c3], [T.b4, T.c4], [T.b5, T.c5]]) S.push(["stamp", a + 0.05, -8], ["strike", a + 0.32, -12], ["chime", c + 0.04, -7]);
for (const a of [T.p2, T.p3, T.p4, T.p5]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.alejandria, T.b2, T.b3, T.b4, T.b5]) S.push(["rewind", a - 0.05, -13]);
for (const a of [T.torreT, T.hepta, T.pisosT, T.fuegoT, T.rampaT]) S.push(["ding", a + 0.05, -9]);
for (const a of [T.treinta, T.construido, T.nombre, T.kilometro, T.puertos, T.cien]) S.push(["pop", a, -11]);
S.push(["waves", 0.0, -14], ["gulls", 1.0, -16], ["waves", T.costa, -12], ["buzzer", T.rocas + 0.3, -13], ["shipcrash", T.barcos + 0.4, -9],
  ["stone", T.torre, -10], ["clack", T.dique, -12], ["clack", T.dique + 0.6, -12], ["clack", T.dique + 1.2, -12], ["creak", T.puertos, -12],
  ["wind", T.viento - 0.3, -9], ["crack", T.peso, -10], ["stone", T.abajo, -11], ["stone", T.medio, -11], ["stone", T.arriba, -11],
  ["buzzer", T.nadie + 0.3, -14], ["fireup", T.fuego, -8], ["fire", T.cima, -11], ["waves", T.lejos, -13], ["hooves", T.jinetes - 0.3, -11],
  ["quake", T.terremotos, -7], ["crumble", T.ruinas - 0.4, -8], ["stone", T.fortaleza, -10], ["fanfare", T.faros - 0.2, -9], ["gulls", T.manda, -15],
  ["splash", IMPACT + 0.04, -11], ["sail", WINS[3] + 0.3, -15], ["wind", T.rodea - 0.3, -11], ["vn-rope", HOIST[0], -12], ["creak", HOIST[0] + 1.2, -13]);
export const SFX = S;
