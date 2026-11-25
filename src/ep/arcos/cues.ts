// E20 — Los Arcos de Querétaro: o pântano das 18 nascentes, os 74 arcos sobre o lodo, a caixa de água no alto e o plano
// barato que deixava a Cruz sem água. Pontos da história = palavras ditas (sem React: a mixagem lê este arquivo).
import { CUTS, DURATION_S, WINS, find } from "../../toy/cues";

const ci = (n: number) => find("con ingenio", n, 0.05);
export const T = {
  llevaron: find("llevaron agua"), alto0: find("lo mas alto de una"), ciudad0: find("una ciudad"), sin0: find("sin una sola"), bomba: find("bomba"),
  llevan: find("y llevan"), trescientos: find("casi trescientos"), pie: find("en pie"),
  queretaro: find("queretaro"), mexico: find("mexico"), m1726: find("mil setecientos"),
  cuenta: find("cuenta la leyenda"), leyenda: find("leyenda"), marques0: find("un marques"), amor: find("por amor"), monja: find("una monja"),
  papeles: find("los papeles"), romantico: find("menos romantico"), rio: find("el rio"), sucio: find("sucio"), talleres: find("talleres de lana"),
  lana: find("lana"), gente: find("la gente enferma"), enferma: find("enferma"), hay: find("hay que traer"), lejos: find("de lejos"),
  sinmot: find("sin motores"), motores: find("motores"),
  p1: find("pero el mejor", 0, 0.1), manantial: find("manantial da"), poca: find("poca agua"), estancada: find("estancada"), pantano0: find("es un pantano"),
  b1: find("como sacas", 0, 0.1), c1: ci(0), cavan: find("cavan en el fondo"), encuentran: find("encuentran"), d18: find("dieciocho"),
  manantiales: find("manantiales pequenos"), encierran: find("los encierran"), muros: find("muros de piedra"), ahora: find("y ahora brota"),
  brota1: find("brota", 0), cuatro: find("unas cuatro veces"), alberca: find("esta es la alberca"),
  p2: find("pero antes", 0, 0.1), valle: find("un valle"), otro: find("otro pantano"), alfondo: find("al fondo"), enterrado0: find("un canal enterrado"),
  ensuciarse: find("ensuciarse"),
  b2: find("como cruzas", 0, 0.1), lodo: find("el lodo"), c2: ci(1), encima: find("por encima"), setenta: find("setenta y cuatro"),
  arcos74: find("cuatro arcos"), altos: find("los mas altos"), veinte: find("veinte metros"), cimientos: find("con cimientos"), suelo: find("suelo firme"),
  arriba: find("arriba el canal"), cruza: find("cruza"), km: find("un kilometro"), plano: find("casi plano"), estosArcos: find("estos son los arcos"),
  p3: find("pero toda", 0, 0.1), llega: find("llega a un"), punto: find("un solo punto"), alto2: find("en lo mas alto"),
  b3: find("como la repartes", 0, 0.1), c3: ci(2), caja0: find("una caja de agua"), cima0: find("en la cima"), tubos: find("tubos de barro"),
  cuesta: find("cuesta abajo"), fuentes: find("en las fuentes"), brota2: find("brota hacia arriba"), nunca: find("pero nunca"), lacaja: find("que la caja"),
  cajaAgua: find("esta es la caja"),
  giro: find("y aqui viene"), primer: find("el primer plan"), barato: find("mas barato"), arcos8: find("arcos de ocho"), ocho: find("ocho metros"),
  veintemil: find("veinte mil"), pesos: find("pesos"),
  p4: find("pero dejaba", 0, 0.1), sinagua: find("sin agua la cima"), cima2: find("la cima donde"), convento: find("convento"), cruz: find("la cruz"),
  asi: find("asi que"), tres: find("tres veces"), obra: find("la obra acabo"), seis: find("seis veces"), planeado: find("lo planeado"),
  pago: find("el marques pago"), dos: find("dos terceras"), partes: find("partes"),
  manda: find("mandaselo"), presupuesto: find("presupuesto"),
  end: DURATION_S,
};
export { CUTS, WINS };
const [C1, C2, C3, C4, C5, C6, C7] = CUTS;

/** cortes duros extras (um a cada ~2–3 s), longe dos 7 da régua */
export const XCUTS = [T.sin0, T.llevan, T.queretaro, T.marques0, T.papeles, T.rio, T.hay, T.p1, T.estancada, T.b1, T.c1, T.encierran, T.ahora,
  T.alberca, T.p2, T.otro, T.enterrado0, T.b2, T.setenta, T.altos, T.cimientos, T.estosArcos, T.p3, T.alto2, T.b3, T.c3, T.tubos, T.fuentes,
  T.nunca, T.giro, T.primer, T.arcos8, T.convento, T.asi, T.obra, T.pago, T.manda];
/** as 18 nascentes: a k-ésima borbulha em SPRING_T(k), de «dieciocho» até o fim de «pequeños» */
export const SPRING_T = (k: number) => T.d18 + 0.04 + k * 0.05;
/** arco i (0..73) sai do chão em ARCH_T(i): a onda corre da esquerda para a direita durante «setenta y cuatro arcos» */
export const ARCH_T = (i: number) => T.setenta + 0.05 + i * (1.05 / 74);
/** sapata j (das 11 na face do corte) desce de «cimientos» até «firme» */
export const FOOT_T = (j: number) => T.cimientos + 0.15 + j * 0.09;
/** pilha de moedas k (0..5): uma a uma em «acabó costando más de seis veces» */
export const COIN_T = (k: number) => T.obra + 0.25 + k * 0.22;

const S: [string, number, number][] = [];
for (const c of CUTS) S.push(["whoosh", c - 0.22, -12]);
for (const x of XCUTS) S.push(["whoosh", x - 0.2, -16]);
for (const [a, c] of [[T.b1, T.c1], [T.b2, T.c2], [T.b3, T.c3]]) S.push(["stamp", a + 0.05, -8], ["strike", a + 0.32, -12], ["chime", c + 0.04, -7]);
for (const a of [T.p1, T.p2, T.p3]) S.push(["alert", a + 0.05, -12]);
for (const a of [T.queretaro, T.b1, T.b2, T.b3]) S.push(["rewind", a - 0.05, -13]);
// gancho: água correndo no alto dos arcos, a cidade no morro; a bomba que não existe (✖); de pé desde 1735
S.push(["stream", 0.05, -12], ["fountain", T.ciudad0, -15], ["pop", T.bomba - 0.15, -11], ["tl-pump", T.bomba, -13], ["strike", T.bomba + 0.4, -11],
  ["buzzer", T.bomba + 0.55, -14], ["ak-birds", T.llevan + 0.2, -14], ["ding", T.trescientos + 0.3, -10]);
// ⏪ 1726: os arcos somem de trás para a frente
S.push(["ss-ffwd", T.queretaro + 0.05, -12], ["crumble", T.queretaro + 0.4, -15], ["pop", T.m1726 + 0.1, -12]);
// a lenda: sinos do convento, carimbo, corações; os papéis: o rolo abre e o coração racha
S.push(["bells", C1 + 0.1, -18], ["stamp", T.leyenda + 0.02, -9], ["ar-hearts", T.amor, -10], ["pop", T.amor + 0.35, -13], ["pop", T.monja + 0.1, -13],
  ["scroll", T.papeles + 0.05, -10], ["paper", T.papeles + 0.5, -13], ["crack", T.romantico + 0.15, -11], ["sad", T.romantico + 0.4, -13]);
// o rio sujo pelas tinas de tinta; a gente doente
S.push(["river", T.rio, -13], ["pour", T.rio + 0.3, -12], ["pour", T.sucio + 0.2, -13], ["vn-glub", T.talleres + 0.2, -13], ["ar-tummy", T.gente + 0.1, -9],
  ["ar-tummy", T.enferma + 0.35, -12]);
// a rota pontilhada de longe; a bomba que não há (✖)
S.push(["quill", T.hay + 0.05, -11], ["ding", T.lejos + 0.35, -11], ["pop", C2 + 0.3, -12], ["tl-pump", T.motores - 0.1, -14], ["strike", T.motores + 0.3, -11]);
// o pântano: pouca água, moscas, bolhas, ✖
S.push(["drip", T.poca, -11], ["ar-flies", T.estancada - 0.1, -10], ["bubble", T.estancada + 0.4, -12], ["mud", T.pantano0, -11], ["buzzer", T.pantano0 + 0.35, -14]);
// cavam, 18 nascentes, muros de pedra, água ×4
S.push(["drain", T.c1 + 0.15, -12], ["dig", T.cavan, -10], ["dig", T.cavan + 0.55, -12]);
for (let k = 0; k < 4; k++) S.push(["gravel", T.cavan + 0.5 + k * 0.3, -15]);
for (let k = 0; k < 18; k += 3) S.push(["bubble", SPRING_T(k), -12 - (k % 2)]);
S.push(["vn-bubbles", T.d18 + 0.3, -11], ["ding", T.manantiales + 0.4, -10], ["ss-bricks", T.encierran, -11], ["stone", T.muros + 0.3, -12],
  ["pour", T.muros + 0.45, -12], ["stream", T.ahora, -11], ["splash", T.brota1 + 0.1, -11], ["ding", T.cuatro + 0.3, -10], ["cheer", T.alberca + 0.1, -14],
  ["ding", T.alberca + 0.45, -9]);
// o vale com lodo; o canal enterrado que se suja (✖)
S.push(["mud", T.otro, -10], ["vn-bubbles", T.otro + 0.4, -13], ["stream", T.enterrado0, -14], ["squelch", T.enterrado0 + 0.5, -11],
  ["vn-glub", T.ensuciarse - 0.3, -11], ["buzzer", T.ensuciarse + 0.4, -13]);
// por cima: o canal sobe, 74 arcos saem do chão, +20 m, cimentos até o firme, o canal plano lá em cima
S.push(["vn-lift", T.encima - 0.05, -11], ["ss-rise", T.setenta, -10], ["ss-bricks", T.setenta + 0.25, -13]);
for (let k = 0; k < 8; k++) S.push(["pop", T.setenta + 0.1 + k * 0.14, -15 - (k % 2)]);
S.push(["ding", T.arcos74 + 0.35, -10], ["slide", T.altos + 0.1, -14], ["ding", T.veinte + 0.3, -10], ["dig", T.cimientos + 0.1, -12]);
for (let j = 0; j < 11; j += 2) S.push(["thud", FOOT_T(j) + 0.42, -12 - (j % 2)]);
S.push(["ss-shimmer", T.suelo, -12], ["wind", T.arriba, -15], ["stream", C5 + 0.05, -10], ["ding", T.plano + 0.1, -10], ["chime", T.estosArcos + 0.3, -9]);
// um só ponto: a água chega lá em cima, os cântaros vazios embaixo (✖)
S.push(["waterfall", T.llega, -14], ["drip", T.alto2 + 0.4, -10], ["sad", T.alto2 + 0.75, -14]);
// a caixa enche, os tubos descem, as fontes brotam até a linha da caixa
S.push(["pour", T.caja0, -11], ["stone", T.caja0 + 0.1, -14], ["clack", T.tubos + 0.1, -12], ["clack", T.tubos + 0.4, -13], ["clack", T.tubos + 0.7, -13],
  ["vn-glub", T.cuesta + 0.2, -12], ["fountain", T.brota2 - 0.1, -9], ["splash", T.brota2 + 0.2, -12], ["ding", T.lacaja + 0.15, -9],
  ["chime", T.cajaAgua + 0.4, -9]);
// o giro: o plano de 1721 (fantasma, 8 m, 20.000 pesos), a Cruz sem água (✖), arcos ×3, custo ×6, o marquês paga 2/3
S.push(["giro", T.giro - 0.05, -8], ["sink", T.primer + 0.1, -11], ["ss-shimmer", T.primer + 0.3, -12], ["slide", T.ocho - 0.1, -14],
  ["coins", T.veintemil + 0.05, -11], ["stream", C7 + 0.1, -13], ["drip", T.sinagua + 0.2, -11], ["buzzer", T.cima2 + 0.3, -13], ["sad", T.cruz, -15],
  ["ss-rise", T.asi + 0.25, -10], ["ding", T.tres + 0.3, -10]);
for (let k = 0; k < 6; k++) S.push(["coins", COIN_T(k), -12 - (k % 2)]);
S.push(["ding", T.seis + 0.3, -10], ["coins", T.dos, -11], ["cheer", T.partes - 0.1, -14],
  ["fanfare", T.manda - 0.1, -9], ["confetti", T.manda + 0.2, -12], ["stream", T.manda + 0.3, -15], ["coins", T.manda + 0.5, -13], ["coins", T.manda + 1.4, -14]);
export const SFX = S;
export { C1, C2, C3, C4, C5, C6, C7 };
