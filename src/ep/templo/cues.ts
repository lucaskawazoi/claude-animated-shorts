// E22 — El Templo Mayor de Tenochtitlan: pirâmides aninhadas sobre o lodo do lago. Pontos da história = palavras ditas
// (sem React: a mixagem lê este arquivo). Nenhum segundo literal: tudo sai de find()/endOf() — a voz real troca words.json.
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const ci = (n: number) => find("con ingenio", n, 0.05);
export const T = {
  // gancho
  dentro: find("dentro de esta"), hayotra: find("hay otra"), ydentro: find("y dentro de esa"), deesa: find("de esa"), otra2: find("esa otra"), todas: find("todas sobre"),
  barro0: find("el barro"), lago0: find("un lago"),
  // contexto
  tenoch: find("tenochtitlan"), mexico: find("mexico"), siglo: find("siglo catorce"), mexicas: find("los mexicas"), isla: find("isla del lago"),
  nohay: find("no hay roca"), roca: find("roca firme"), solo: find("solo lodo"), quieren: find("y quieren"), templo: find("templo mayor"),
  sinmot: find("un solo motor"), motor: find("solo motor"),
  // problema 1 + solução 1
  pero1: find("pero el lodo", 0, 0.1), lodo: find("el lodo"), peso: find("aguanta peso"),
  como1: find("como levantas", 0, 0.1), c1: ci(0), clavan: find("clavan estacas"), madera: find("de madera"), rellenan: find("rellenan con"), tezontle: find("con tezontle"),
  piedra: find("una piedra volcanica"), huecos: find("llena de huecos"), casi: find("casi la mitad"), mitad: find("la mitad"), basalto: find("el basalto"),
  esta: find("esta es la cimentacion"), cimen: find("cimentacion"),
  // problema 2 + solução 2
  pero2: find("pero aun asi", 0, 0.1), hunde: find("se hunde"), noparejo: find("no parejo"), escal: find("la escalinata"), pesa: find("pesa mas"), inclina: find("se inclina"),
  como2: find("como la corriges", 0, 0.1), c2: ci(1), entierran: find("la entierran"), rellenan2: find("rellenan encima"), nivelan: find("nivelan"),
  construyen: find("y construyen"), alrededor: find("alrededor"), cada: find("cada capa aprieta"), suelo: find("el suelo para"), centro: find("el centro se hunde"),
  menos: find("cada vez menos"), asi: find("asi crece"),
  // problema 3 + solução 3
  pero3: find("pero cada capa", 0, 0.1), montanas: find("montanas de piedra"), pPiedra: find("de piedra madera"), pMadera: find("madera y cal"), pCal: find("y cal"),
  como3: find("como las llevas", 0, 0.1), isla3: find("a una isla"), c3: ci(2), canoa0: find("en canoa"), cuestas: find("a cuestas"), kilos: find("veintitres kilos"),
  canoa1: find("en canoa mil"), mil: find("mil doscientos"), pueblos: find("los pueblos vecinos"), remando: find("remando"), estas: find("estas son las canoas"),
  // giro
  giro: find("y aqui viene"), nola: find("no la ampliaron"), hundia: find("se hundia"), mayoria: find("la mayoria"), estren: find("se estrenaban"),
  someter: find("someter"), pueblo: find("a un pueblo vecino"), templo2: find("el templo crecia"), ritmo: find("al mismo ritmo"), imperio: find("el imperio"),
  enmenos: find("en menos de dos"), siete: find("siete capas"), arriba: find("y arriba"), gemelos: find("templos gemelos"), huitz: find("huitzilopochtli"), tlaloc: find("de tlaloc"),
  m1521: find("mil quinientos"), espanoles: find("los espanoles"), arras: find("arrasaron"), constr: find("construyeron encima"),
  m1978: find("mil novecientos"), obreros: find("unos obreros"), cavaban: find("cavaban un pozo"), toparon: find("toparon con"), diosa: find("una diosa"),
  asi2: find("asi empezo"), excav: find("la excavacion"), manda: find("mandaselo"), casa: find("ampliar la casa"),
  end: DURATION_S,
};
export { CUTS, WINS };
const [C1, C2, C3, C4, C5, C6, C7] = CUTS;

/** cortes duros extras: o início de cada plano que não é um dos 7 da régua */
export const XCUTS = [T.ydentro, T.todas, T.tenoch, T.mexicas, T.quieren, T.sinmot, T.pero1, T.como1, T.clavan, T.piedra, T.casi, T.esta, T.pero2, T.como2, T.rellenan2,
  T.construyen, T.cada, T.asi, T.pero3, T.como3, T.c3, T.canoa1, T.pueblos, T.estas, T.giro, T.nola, T.mayoria, T.pueblo, T.enmenos, T.arriba, T.m1521,
  T.m1978, T.cavaban, T.toparon, T.asi2, T.manda];

const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const x of XCUTS) S.push(["whoosh", x - 0.2, -16]);
for (const [a, c] of [[T.como1, T.c1], [T.como2, T.c2], [T.como3, T.c3]]) S.push(["stamp", a + 0.05, -8], ["strike", a + 0.32, -12], ["chime", c + 0.04, -7]);
for (const a of [T.pero1, T.pero2, T.pero3]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.tenoch, T.como1, T.como2, T.como3]) S.push(["rewind", a - 0.05, -13]);
// gancho: a pirâmide abre, outra dentro, outra dentro; o barro e a água embaixo
S.push(["crack", T.dentro + 0.1, -11], ["slide", T.dentro + 0.25, -12], ["ss-shimmer", T.hayotra, -12], ["slide", T.ydentro + 0.05, -12], ["ss-shimmer", T.deesa + 0.3, -12],
  ["thud", T.todas - 0.3, -13], ["mud", T.barro0, -11], ["waves", T.lago0, -13], ["ding", T.lago0 + 0.3, -11]);
// ⏪ Tenochtitlan: ilha, canoas, lodo (sem rocha ✖), o fantasma do templo, o guindaste ✖
S.push(["ss-ffwd", T.tenoch + 0.05, -12], ["pop", T.siglo + 0.1, -12], ["waves", T.mexicas, -14], ["gulls", T.isla, -14], ["squelch", C1 + 0.3, -10], ["pop", T.roca + 0.1, -12],
  ["buzzer", T.roca + 0.5, -14], ["mud", T.solo, -11], ["ss-shimmer", T.templo - 0.1, -12], ["pop", T.sinmot + 0.05, -11], ["tl-rivet", T.sinmot + 0.25, -13],
  ["strike", T.motor + 0.3, -11], ["buzzer", T.motor + 0.45, -14]);
// problema 1: o bloco afunda no lodo ✖
S.push(["thud", T.lodo - 0.1, -9], ["squelch", T.lodo + 0.25, -10], ["sink", T.peso - 0.1, -11], ["buzzer", T.peso + 0.35, -14]);
// estacas, tezontle, pedra de buracos, balança, cimentação
S.push(["dig", T.c1 + 0.1, -12]);
for (let k = 0; k < 9; k++) S.push(["vn-pilehit", T.clavan + 0.05 + k * 0.075, -13 - (k % 2)]);
for (let k = 0; k < 6; k++) S.push(["gravel", T.rellenan + 0.2 + k * 0.33, -13]);
S.push(["stone", T.tezontle + 0.1, -11], ["ding", T.piedra + 0.35, -9], ["pop", T.huecos + 0.1, -12], ["sh-click", T.casi + 0.1, -12], ["sh-tip", T.mitad + 0.1, -11],
  ["thud", T.basalto + 0.25, -11], ["ding", T.basalto + 0.5, -9], ["chime", T.cimen + 0.1, -9], ["ss-rise", T.esta + 0.1, -12]);
// problema 2: afunda e inclina ✖
S.push(["sink", T.hunde, -11], ["creak", T.noparejo - 0.05, -11], ["tl-wobble", T.escal + 0.2, -12], ["creak", T.inclina - 0.4, -10], ["buzzer", T.inclina + 0.4, -14]);
// solução 2: enterram, nivelam, camada maior, o chão aperta, setas menores
S.push(["sandfall", T.entierran + 0.1, -11], ["sandfall", T.entierran + 0.6, -12], ["gravel", T.rellenan2 + 0.1, -11], ["sh-tamp", T.nivelan + 0.05, -11], ["ding", T.nivelan + 0.4, -9],
  ["ss-rise", T.construyen + 0.1, -10], ["ss-bricks", T.construyen + 0.3, -12], ["ss-shimmer", T.alrededor + 0.2, -11], ["ss-rise", T.cada + 0.15, -11],
  ["thud", T.suelo - 0.1, -11], ["concrete", T.suelo + 0.2, -13]);
for (let k = 0; k < 3; k++) S.push(["ding", T.centro + 0.15 + k * 0.45, -11 - k * 2]);
S.push(["ss-rise", T.asi + 0.05, -10], ["chime", T.asi + 0.3, -9]);
// problema 3 e solução 3: pilhas na margem, ilha, canoas
S.push(["stone", T.pPiedra + 0.05, -11], ["sh-log", T.pMadera + 0.0, -11], ["sandfall", T.pCal + 0.0, -12], ["buzzer", T.isla3 + 0.4, -14], ["waves", T.como3 + 0.4, -14],
  ["splash", T.c3 + 0.1, -10], ["vn-tide", T.canoa0 + 0.1, -12], ["sail", T.canoa0 + 0.3, -15], ["fs-steps", T.cuestas + 0.1, -11], ["ding", T.kilos + 0.45, -10],
  ["stone", T.canoa1 + 0.1, -11], ["ding", T.mil + 0.5, -9], ["vn-rope", T.pueblos + 0.1, -13], ["waves", T.pueblos + 0.4, -12], ["splash", T.remando, -11],
  ["cheer", T.estas, -14], ["chime", T.estas + 0.35, -9]);
// giro: o afundamento, o pueblo vizinho cai, capa nova, mapa, 7 capas, templos gêmeos
S.push(["giro", T.giro - 0.05, -8], ["sink", T.nola + 0.1, -12], ["stamp", T.hundia + 0.3, -9], ["fs-steps", T.mayoria + 0.1, -12], ["ak-flag", T.someter + 0.1, -11],
  ["thud", T.someter + 0.55, -10], ["ss-rise", T.pueblo + 0.1, -9], ["ss-bricks", T.pueblo + 0.3, -12], ["cheer", T.pueblo + 0.5, -15], ["ss-shimmer", T.templo2 + 0.1, -12],
  ["ss-rise", T.ritmo, -10], ["ding", T.imperio + 0.1, -10], ["slide", T.enmenos + 0.05, -12], ["ss-shimmer", T.enmenos + 0.5, -11], ["fanfare", T.siete + 0.15, -12],
  ["wind", T.arriba + 0.1, -15], ["gong", T.huitz + 0.1, -12], ["chime", T.tlaloc + 0.05, -10], ["rain", T.tlaloc + 0.3, -18]);
// 1521: os espanhóis arrasam, constroem; 1978: a obra da luz, o poço, a deusa; a escavação
S.push(["pop", T.m1521 + 0.1, -12], ["cannon", T.arras - 0.1, -11], ["quake", T.arras + 0.05, -9], ["crumble", T.arras + 0.2, -10], ["ss-domecrash", T.arras + 0.4, -12],
  ["ss-rise", T.constr + 0.1, -10], ["bells", T.constr + 0.45, -14], ["pop", T.m1978 + 0.1, -12], ["crowd", T.m1978 + 0.4, -22], ["dig", T.cavaban + 0.05, -10],
  ["dig", T.cavaban + 0.5, -12], ["gravel", T.cavaban + 0.3, -13], ["thud", T.toparon + 0.05, -11], ["ss-shimmer", T.diosa, -10], ["gong", T.diosa + 0.3, -10],
  ["ding", T.diosa + 0.7, -9], ["dig", T.asi2 + 0.1, -12], ["ss-rise", T.excav - 0.1, -11], ["ss-shimmer", T.excav + 0.2, -11],
  ["fanfare", T.manda - 0.1, -9], ["confetti", T.manda + 0.2, -12], ["coins", T.manda + 0.5, -15], ["ss-shimmer", T.manda + 0.7, -13]);
export const SFX = S;
export { C1, C2, C3, C4, C5, C6, C7 };
