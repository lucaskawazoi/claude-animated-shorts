// E4 — La imprenta de Gutenberg. Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const ci = (n: number) => find("con ingenio", n, 0.05);
export const T = {
  copista: find("un copista"), anio: find("mas de un ano"), gutenberg: find("gutenberg imprimio"), ciento: find("ciento ochenta"),
  maguncia: find("maguncia"), mil450: find("hacia mil"), nohay: find("no hay motores"), europa: find("en europa"), mano: find("se copian"), letra: find("letra por letra"),
  b1: find("como haces un libro", 0, 0.1), c1: ci(0), separar: find("separar las letras"), piezas: find("piezas de metal"), ordenan: find("se ordenan"), imprimen: find("se imprimen"), usar: find("se desarman"), tipos: find("estos son los tipos"),
  p1: find("pero una biblia", 0, 0.1), miles: find("miles de letras"), iguales: find("todas iguales"),
  b2: find("como haces miles", 0, 0.1), c2: ci(1), molde: find("un molde de mano"), viertes: find("viertes plomo"), enfria: find("se enfria"), sale: find("sale una letra"), esteMolde: find("este es el molde"),
  p2: find("pero la tinta", 0, 0.1), agua: find("hecha con agua"), resbala: find("resbala sobre"),
  b3: find("solucion tinta", 0, 0.1), c3: find("tinta con aceite"), tinta: find("tinta con aceite"), espesa: find("espesa como"), estaTinta: find("esta es la tinta"),
  p3: find("pero hay que apretar", 0, 0.1), parejo: find("fuerte y parejo"), pagina: find("pagina tras pagina"),
  b4: find("como aprietas", 0, 0.1), c4: ci(2), prensa: find("una prensa de tornillo"), uvas: find("exprimian uvas"), rin: find("del rin"), estaPrensa: find("esta es la prensa"),
  p4: find("pero el libro", 0, 0.1), aMano: find("escrito a mano"),
  b5: find("solucion casi trescientos", 0, 0.1), c5: find("casi trescientos"), trescientos: find("casi trescientos"), unidas: find("letras unidas"), imitar: find("para imitar"),
  giro: find("aqui viene el giro"), fortuna: find("costaba una fortuna"), prestado: find("pidio prestado"), juicio: find("en mil cuatrocientos cincuenta y cinco"), fust: find("johann"), gano: find("le gano un juicio"), quedo: find("se quedo con"),
  cambio: find("cambio el mundo"), nada: find("casi no gano nada"), hoy: find("hoy sobreviven"), cuarenta: find("cuarenta y nueve"),
  manda: find("mandaselo"),
  end: DURATION_S,
};
export { CUTS, WINS };

const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const w of [WINS[3], WINS[6], WINS[10]]) S.push(["whoosh", w - 0.25, -13]);
for (const a of [T.c3, T.c5]) S.push(["chime", a, -9]);
for (const [a, c] of [[T.b1, T.c1], [T.b2, T.c2], [T.b4, T.c4]]) S.push(["stamp", a + 0.05, -8], ["strike", a + 0.32, -12], ["chime", c + 0.04, -7]);
for (const a of [T.letra, T.p1, T.p2, T.p3, T.p4]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.b2, T.b3, T.b4, T.b5]) S.push(["rewind", a - 0.05, -13]);
for (const a of [T.tipos, T.esteMolde, T.estaTinta, T.estaPrensa]) S.push(["ding", a + 0.05, -9]);
for (const a of [T.anio, T.ciento, T.mil450, T.miles, T.trescientos, T.juicio, T.cuarenta]) S.push(["pop", a, -11]);
S.push(["quill", 0.2, -14], ["quill", T.letra, -13], ["clack", T.ordenan, -12], ["clack", T.ordenan + 0.25, -13], ["thud", T.imprimen + 0.2, -11],
  ["pourmetal", T.viertes, -10], ["sizzle", T.enfria, -12], ["clack", T.sale + 0.1, -11], ["drip", T.resbala, -11], ["buzzer", T.resbala + 0.4, -13],
  ["squelch", T.tinta + 0.2, -11], ["creak", T.prensa + 0.2, -10], ["thud", T.prensa + 0.9, -10], ["grapes", T.uvas, -11], ["paper", T.estaPrensa + 0.3, -12],
  ["giro", T.giro, -9], ["coins", T.fortuna + 0.2, -10], ["gavel", T.gano, -7], ["sad", T.nada - 0.2, -11], ["fanfare", T.hoy, -8], ["confetti", T.cuarenta + 0.3, -11]);
export const SFX = S;
