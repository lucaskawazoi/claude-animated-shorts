// E19 — La Torre Latinoamericana (ecos-del-tiempo, Shorts; tema nº 2 do radar). Câmera, Zeevaert, painel e luz deste episódio.
// Ritmo («Sim 66»): 3 aberturas (PROPS open a|b|c), corte duro a cada ~2–3 s (7 da régua + extras), algo sempre se mexendo,
// tentativas que dão errado com ✖ (a torre ingênua que afunda na gelatina, o prédio rígido que cai, o sismógrafo que não há).
// O operário do episódio é Leonardo Zeevaert (terno, chapéu, o lenço vermelho do canal); o irmão Adolfo aparece na prancheta.
import { getInputProps } from "remotion";
import { CamState, K, Key, Shot, keyed } from "../../toy/cam";
import { CUTS, WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { HudData, count } from "../../toy/hud";
import { V3 } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { SFX, T } from "./cues";
import { ANGEL, BA, NP, REC, SC, World, ZEE } from "./world";
import { EXPOSURE } from "./exposure";

const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
type Open = "a" | "b" | "c";
export const OPEN_DEFAULT: Open = "a";
let OPEN: Open | null = null;
export const openOf = (): Open => {
  if (OPEN) return OPEN;
  try { const o = (getInputProps() as { open?: string }).open; OPEN = o === "a" || o === "b" || o === "c" ? o : OPEN_DEFAULT; } catch { OPEN = OPEN_DEFAULT; }
  return OPEN;
};
const DYN = [3.6, 2.4, 4.6, 3.0, 2.0, 2.2, 3.2, 3.4, 2.2, 2.6, 0.3];
const dynAt = (t: number) => { let d = DYN[0]; WINS.forEach((w, i) => { if (t >= w) d = DYN[i]; }); return d; };
const steady = (c: CamState, t: number): CamState => {
  // ponytail: balanço proporcional à distância da câmera (plano fechado com 3 m de balanço tirava o objeto do quadro)
  const d = dynAt(t) * Math.min(1, Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]) / 18);
  return { ...c, pos: [c.pos[0] - d * 0.7 * Math.sin(t * 0.9 + 9), c.pos[1] - d * 0.2 * Math.sin(t * 1.3 + 4), c.pos[2]], look: [c.look[0] - d * 0.3 * Math.sin(t * 1.1 + 3), c.look[1], c.look[2]] };
};
const shot = (name: string, t0: number, keys: Key[]): Shot => ({ name, t0, keys, fn: (t) => steady(keyed(keys, t), t) });
const hold = (c: number, pos: V3, look: V3, fov = 54, roll = 0) => [K(c - 0.42, pos, look, fov, roll), K(c - 0.02, pos, look, fov, roll)];
const at = (o: V3, d: V3): V3 => [o[0] + d[0], o[1] + d[1], o[2] + d[2]];

const OPEN_KEYS: Record<Open, Key[]> = {
  // a) (PADRÃO) colado no mastro vermelho e branco lá em cima, recua até a torre inteira sobre a cidade
  a: [K(0, [6, 28.5, 10.5], [0, 25.5, 1], 52, 1.2), K(1.2, [9, 22, 20], [0, 18, 1], 56, -0.4), K(T.barro0 - 0.05, [14, 14, 32], [0, 11, 1], 58, 0)],
  // b) do chão da calçada, olhando para cima pela fachada de vidro
  b: [K(0, [2, 1.2, 9], [0, 16, 1], 64, 0.8), K(1.4, [5, 2, 13], [0, 14, 1], 62, -0.4), K(T.barro0 - 0.05, [8, 4, 20], [0, 12, 1], 60, 0)],
  // c) do alto da cidade, com os vulcões, mergulhando na torre
  c: [K(0, [-40, 50, 80], [0, 6, 0], 50, 1), K(1.4, [-20, 30, 50], [0, 10, 0], 54, -0.5), K(T.barro0 - 0.05, [-8, 18, 34], [0, 11, 1], 56, 0)],
};
const openCam = (t: number) => steady(keyed(OPEN_KEYS[openOf()], t), t);

const DISC: V3 = at(REC, [0.3, 1.07, 0.3]);
const SHOTS: Shot[] = [
  { name: "abertura a|b|c: a torre de 44 andares", t0: 0, keys: OPEN_KEYS.a, fn: openCam },
  shot("«sobre el barro de un lago»: a rua abre, o barro com água debaixo da torre", T.barro0, [
    K(T.barro0, [7, 2, 19], [0, -1, 2], 62, -1.5), K(T.aguantado - 0.05, [5, 0.5, 17], [0, -2.2, 3], 62, 0)]),
  shot("«aguantó tres terremotos»: a cidade treme, a torre balança", T.aguantado, [
    K(T.aguantado, [26, 12, 38], [0, 10, 0], 56, 1.5), K(T.sigue - 0.05, [22, 14, 36], [0, 11, 0], 56, -1)]),
  shot("«y sigue en pie»: de baixo, girando", T.sigue, [
    K(T.sigue, [6, 1.2, 9], [0, 14, 1], 66, -1), K(T.ciudad - 0.05, [2, 1.2, 10], [0, 15, 1], 66, 1)]),
  shot("Ciudad de México, 1948 (⏪): a cidade sem a torre, os vulcões", T.ciudad, [
    K(T.ciudad, [46, 38, 74], [0, 8, -4], 52, -1.5), ...hold(C1, [34, 27, 56], [0, 5, -6], 52, 0)]),
  shot("«aquí hubo un lago»: a água sobe, canoas", C1, [
    K(C1, [8, 7, 26], [0, 0, 4], 56, 1.5), K(T.debajo - 0.05, [2, 5, 22], [0, 0, 4], 56, 0)]),
  shot("«y debajo queda un barro… casi todo agua»: dentro do buraco, o barro treme", T.debajo, [
    K(T.debajo, [3, -2, 12], [0, -3.4, 4], 56, -1.5), K(T.blando, [1.5, -3, 10], [0, -3.4, 4], 52, 0.5), K(T.bellas - 0.05, [-1, -3.5, 9], [0, -3.6, 4], 50, 0)]),
  shot("Bellas Artes, cruzando la calle", T.bellas, [
    K(T.bellas, [-1, 5, 14], [-13, 2, -6], 56, 1.5), K(T.hundido - 0.05, [-3, 4.5, 12], [-14, 2, -6], 56, 0)]),
  shot("«se hundió casi dos metros»: de baixo, o palácio desce, régua e andaimes", T.hundido, [
    K(T.hundido, [-6, 1.0, 4], [-13, 0.3, -4], 54, -1.5), K(T.nohay - 0.05, [-7.5, 1.4, 5.5], [-14, 0.2, -4], 54, 0)]),
  shot("«y en México todavía no hay…»: a prancheta perto da Alameda", T.nohay, [
    K(T.nohay, [-14, 5, 22], [-22, 1, 12], 56, 1.5), ...hold(C2, [-15, 4.5, 21], [-22, 1, 12], 56, 0)]),
  shot("«ni una computadora» ✖", C2, [
    K(C2, at(NP, [0.2, 2.3, 3.6]), at(NP, [-0.9, 1.6, 0.1]), 52, -1.5), K(T.papel - 0.05, at(NP, [0.5, 2.2, 3.3]), at(NP, [-0.8, 1.6, 0.1]), 52, 0)]),
  shot("«hay papel, lápiz»: as folhas caem, o lápis risca", T.papel, [
    K(T.papel, at(NP, [2.4, 3.4, 2.6]), at(NP, [0.6, 1.4, -0.4]), 52, 1.5), K(T.hermanos - 0.05, at(NP, [2.6, 3.2, 2.8]), at(NP, [0.7, 1.4, -0.4]), 52, 0)]),
  shot("«dos hermanos ingenieros: los Zeevaert»", T.hermanos, [
    K(T.hermanos, at(NP, [1.5, 2.4, 5.5]), at(NP, [1.2, 1.5, -1.2]), 54, -1), K(T.p1 - 0.05, at(NP, [0.5, 2.2, 4.5]), at(NP, [1.0, 1.6, -1.2]), 52, 0)]),
  shot("«si pones una torre así sobre ese barro»: a torre cai do céu no corte", T.p1, [
    K(T.p1, [2, 4, 17.5], [0, 3.5, 2], 64, 1.5), K(T.hunde - 0.05, [1, 2.5, 17], [0, 1, 2], 64, 0)]),
  shot("«se hunde como una cuchara en gelatina» ✖", T.hunde, [
    K(T.hunde, [5, -0.5, 15], [0, -1, 3], 58, -1.5), ...hold(C3, [3.5, -1, 14], [0, -1.8, 3], 58, 0)]),
  shot("«¿cómo la apoyas…?»: Zeevaert pensando na beira do buraco", C3, [
    K(C3, [-2.5, 2.0, 8.5], [-4.6, 1.4, 3.0], 48, 1), K(T.c1 - 0.05, [-3, 1.9, 8.2], [-4.6, 1.4, 3.0], 48, 0)]),
  shot("«con ingenio: clavan»: o bate-estaca na face", T.c1, [
    K(T.c1, [4, 1.5, 11], [0, 0.5, 4], 58, -1.5), K(T.pilotes0 - 0.05, [2.5, 1, 10.5], [-0.5, 0, 4], 58, 0)]),
  shot("«pilotes de concreto»: descem pelo barro", T.pilotes0, [
    K(T.pilotes0, [-3, -2.5, 10], [0, -3.2, 4], 56, 1.5), K(T.arena - 0.05, [-1.5, -3.5, 9.5], [0.5, -4.2, 4], 56, 0)]),
  shot("«arena firme, a más de treinta metros»: a capa dura brilha", T.arena, [
    K(T.arena, [3, -6.5, 9], [0, -5.8, 4], 54, -1.5), K(T.estos - 0.05, [2.6, -3.2, 13.5], [1.6, -3.4, 4], 58, 0)]),
  shot("«estos son los pilotes»: a face inteira e a torre começando", T.estos, [
    K(T.estos, [5, 0, 17.5], [0, -2, 3], 64, 1.5), K(T.p2 - 0.05, [3.5, 0.5, 17], [0, -1.5, 3], 64, 0)]),
  shot("«pesa demasiado»: setas vermelhas apertando o barro", T.p2, [
    K(T.p2, [1, 1.5, 12], [0, -0.6, 4], 56, -1.5), K(T.b2 - 0.05, [0, 2, 12.5], [0, 0, 4], 56, 0)]),
  shot("«Solución»: Zeevaert na beira", T.b2, [
    K(T.b2, [-2.6, 2.2, 8], [-4.6, 1.4, 3], 50, 1), ...hold(C4, [-3, 2.1, 7.8], [-4.6, 1.4, 3], 50, 0)]),
  shot("«cavan un cajón de trece metros»: a terra some da face, a caixa aparece", C4, [
    K(C4, [3, 0.5, 11], [0, -1.2, 4], 56, -1.5), K(T.sacan - 0.05, [1.5, 0, 10.5], [0, -1.2, 4], 56, 0)]),
  shot("«sacan miles de toneladas de tierra»: os blocos voam para a balança", T.sacan, [
    K(T.sacan, [2.5, 3.5, 16], [1.5, 1, 4], 62, 1.5), K(T.ese - 0.05, [3.5, 3, 15.5], [2.5, 1.5, 4], 62, 0)]),
  shot("«compensa buena parte»: a balança quase equilibra", T.ese, [
    K(T.ese, at(SC, [1.2, 4.4, 10.5]), at(SC, [0, 2.2, 0]), 64, -1.5), K(T.flota - 0.05, at(SC, [0.2, 4.0, 10]), at(SC, [0, 2.4, 0]), 64, 0)]),
  shot("«flota en parte, como un barco»: a torre e o cajón balançam, o barquinho", T.flota, [
    K(T.flota, [-1.5, 2.6, 17.5], [-2.6, 0.3, 4], 64, 1.5), ...hold(C5, [-2.4, 2.3, 16.5], [-2.8, 0.2, 4], 64, 0)]),
  shot("«este es el cajón»: o U de concreto de perto", C5, [
    K(C5, [0, -1, 9.5], [0, -1.3, 4], 56, -1.5), K(T.p4 - 0.05, [-1, -0.8, 10], [0, -1.3, 4], 56, 0)]),
  shot("«pero en México tiembla»: o corte inteiro treme", T.p4, [
    K(T.p4, [2, 2, 18], [0, -1.5, 3], 62, 1.5), K(T.agranda - 0.05, [0, 1.5, 17], [0, -2, 3], 62, 0)]),
  shot("«agranda el temblor»: as setas crescem de baixo para cima", T.agranda, [
    K(T.agranda, [-6, -3.5, 10], [-9, -3.2, 4], 56, -1.5), K(T.plato - 0.05, [-7, -3, 10.5], [-9, -2.8, 4], 56, 0)]),
  shot("«como un plato de gelatina»: o prédio de tijolo cai ✖", T.plato, [
    K(T.plato, [-2.5, 3.2, 12], [-5.9, 1.8, 2.2], 54, 1.5), K(T.b4 - 0.05, [-3, 3, 11.5], [-5.9, 1.4, 2.2], 54, 0)]),
  shot("«¿cómo aguantas eso?»: Zeevaert entre a poeira e a torre", T.b4, [
    K(T.b4, [-1.5, 2.2, 8.5], [-3.5, 1.5, 3.4], 50, -1), K(T.c4 - 0.05, [-1.8, 2.0, 8.3], [-3.5, 1.5, 3.4], 50, 0)]),
  shot("«un esqueleto de acero flexible»: subindo pelas vigas", T.c4, [
    K(T.c4, [8, 4, 17], [0, 7, 1], 60, 1.5), K(T.mece - 0.05, [7, 9, 17], [0, 11, 1], 60, 0)]),
  shot("«se mece sin romperse»: a torre inteira balança", T.mece, [
    K(T.mece, [16, 11, 30], [0, 11, 1], 58, -1.5), K(T.cana - 0.05, [15, 11, 29], [0, 11, 1], 58, 0)]),
  shot("«como una caña»: o junco dobra junto", T.cana, [
    K(T.cana, [-17, 6, 18], [-6, 6, 1], 58, 1.5), K(T.esqueleto - 0.05, [-16, 6.5, 19], [-5, 7, 1], 58, 0)]),
  shot("«este es el esqueleto»: o vidro fecha a torre", T.esqueleto, [
    K(T.esqueleto, [12, 14, 30], [0, 12, 1], 58, -1.5), K(T.giro - 0.05, [10, 15, 30], [0, 13, 1], 58, 0)]),
  shot("o giro: chicote até o topo, 1957", T.giro, [
    K(T.giro, [6, 25, 12], [0, 24, 1], 56, -8), K(T.m1957 - 0.05, [4, 27, 10], [0, 26, 1], 54, 0)]),
  shot("1957: o Anjo da Independência de pé, inteiro; a cidade começa a tremer", T.m1957, [
    K(T.m1957, at(ANGEL, [-9, 8, 17]), at(ANGEL, [0, 9.2, 0]), 66, 1.5), ...hold(C6, at(ANGEL, [-12, 8, 13]), at(ANGEL, [0, 9.2, 0]), 66, 0)]),
  shot("«ni un aparato para medir»: o sismógrafo que não há ✖", C6, [
    K(C6, at(NP, [3.0, 3.4, 5.2]), at(NP, [-0.2, 1.6, 0]), 54, 1.5), K(T.midio - 0.05, at(NP, [1.7, 2.4, 3.0]), at(NP, [0.3, 1.4, 0]), 50, 0)]),
  shot("«lo midió la torre»: o andar com o aparelho", T.midio, [
    K(T.midio, at(REC, [3.6, 3.6, 8.0]), at(REC, [0.2, 1.6, -0.4]), 56, -1.5), K(T.lapiz - 0.05, at(REC, [2.0, 2.7, 4.2]), at(REC, [0.3, 1.3, 0]), 54, 0)]),
  shot("«con un lápiz»: o disco gira, o lápis desenha (de cima)", T.lapiz, [
    K(T.lapiz, at(DISC, [0.5, 2.3, 1.3]), DISC, 50, 1.5), K(T.dibujaba - 0.05, at(DISC, [0.3, 1.9, 1.5]), DISC, 46, 0)]),
  shot("«que dibujaba cada sacudida»: o lápis treme, o traço cresce", T.dibujaba, [
    K(T.dibujaba, at(DISC, [1.1, 1.1, 1.7]), at(DISC, [0.3, 0.03, 0]), 46, -1.5), ...hold(C7, at(DISC, [0.75, 1.5, 1.05]), at(DISC, [0.28, 0.0, 0.05]), 48, 0)]),
  shot("«tiró el Ángel»: o anjo dourado cai; a torre atrás", C7, [
    K(C7, at(ANGEL, [12, 7, -9]), at(ANGEL, [1, 9, 0]), 70, 1.5), K(T.intacta - 0.05, at(ANGEL, [10.5, 5.5, -8]), at(ANGEL, [1.8, 6, 0.6]), 70, 0)]),
  shot("«la torre, intacta» ✔", T.intacta, [
    K(T.intacta, [12, 7, 21], [0, 12, 1], 58, -1.5), K(T.m1985 - 0.05, [2, 9, 24], [0, 13, 1], 58, 0)]),
  shot("1985: os prédios em volta caem", T.m1985, [
    K(T.m1985, [0.6, 1.7, 20], [0, 11, 0], 72, 1.5), K(T.ella - 0.05, [-0.4, 2.0, 19.5], [0, 11.5, 0], 72, 0)]),
  shot("«y ella siguió en pie»: de baixo", T.ella, [
    K(T.ella, [5, 3, 19], [0, 10, 1], 64, -1.5), K(T.m2017 - 0.05, [3.5, 8, 20], [0, 12, 1], 64, 0)]),
  shot("2017, otra vez: volta em torno", T.m2017, [
    K(T.m2017, [5, 1.8, 11], [-0.6, 4.5, 2.5], 66, 1.5), K(T.manda - 0.05, [6.5, 2.4, 12.5], [-0.4, 6, 2.5], 66, 0)]),
  shot("final: do mastro até a cidade inteira", T.manda, [
    K(T.manda, [6, 22, 14], [0, 20, 1], 56, -1), K(T.end, [16, 26, 46], [0, 15, 1], 56, 0)]),
];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, scale: 1.05, ...o });
const EDGE: V3 = [-4.6, 0.1, 3.0], EDGE2: V3 = [-3.5, 0.1, 3.4], DESKP: V3 = at(NP, [-0.4, 0.1, -1.4]);
const WORKER: [number, WorkerState][] = [
  [0, S(EDGE, 0, "present", { scale: 0 })],
  [T.debajo, S(EDGE, 0.3, "point")],
  [T.bellas, S([-8.5, 0.1, -2.5], -2.0, "point")],
  [T.hundido, S([-8.5, 0.1, -2.5], -2.0, "alarm")],
  [T.nohay, S(DESKP, 0, "present")],
  [T.compu + 0.3, S(DESKP, 0, "alarm")],
  [T.papel, S(DESKP, 0.2, "read")],
  [T.zeevaert, S(DESKP, 0.3, "present")],
  [T.p1, S(EDGE, 0.4, "point")],
  [T.hunde, S(EDGE, 0.4, "alarm")],
  [C3, S(EDGE, 0.3, "think")],
  [T.suelo, S(EDGE, 0.3, "alarm", { follow: (t) => [EDGE[0], 0.1 - 0.5 * Math.sin(Math.PI * Math.min(1, Math.max(0, (t - T.suelo) / 0.9))), EDGE[2]] })],
  [T.c1, S(EDGE, 0.3, "cheer")],
  [T.clavan, S([-3.6, 0.1, 3.2], 0.5, "point")],
  [T.p2, S(EDGE, 0.3, "alarm")],
  [T.b2, S(EDGE, 0.3, "present")],
  [T.sacan, S(at(SC, [-3.1, 0.1, -1.4]), 0.4, "point", { follow: () => at(SC, [-3.1, 0.1, -1.4]) })], // follow = salta, não atravessa o quadro
  [T.compensa, S(at(SC, [-3.1, 0.1, -1.4]), 0.4, "cheer")],
  [T.flota, S([-3.4, 0.1, 3.4], 0.4, "present")],
  [T.cajon, S([-3.4, 0.1, 3.4], 0.4, "cheer")],
  [T.tiembla, S(EDGE2, -1.2, "point")],
  [T.b4, S(EDGE2, 0.4, "think")],
  [T.c4, S(EDGE2, 1.0, "point")],
  [T.mece, S(EDGE2, 0.6, "cheer")],
  [C6, S(at(NP, [-0.8, 0.1, -1.3]), 0, "alarm")],
  [T.midio, S(at(REC, [-1.6, 0.11, -0.4]), 0.5, "read", { follow: () => at(REC, [-1.6, 0.11, -0.4]) })],
  [C7, S(at(REC, [-1.6, 0.11, -0.4]), 0.5, "read", { scale: 0 })],
  [T.manda, S([3.6, 0.1, 5.4], -0.2, "present")],
];

const hud: HudData = {
  pills: [
    { a: T.pisos, b: T.aguantado - 0.1, label: "TORRE", value: () => "44 PISOS", y: 440, tone: "gold" },
    { a: T.aguantado, b: T.ciudad - 0.1, label: "TERREMOTOS", value: (t) => ["1957", "1957 · 1985", "1957 · 1985 · 2017"][Math.min(2, Math.floor((t - T.aguantado) / 0.5))], y: 440, tone: "red" },
    { a: T.m1948, b: T.hubo - 0.1, label: "CIUDAD DE MÉXICO", value: () => "1948", y: 440, tone: "gold" },
    { a: T.hubo, b: T.debajo - 0.1, label: "AQUÍ HUBO", value: () => "UN LAGO", y: 440 },
    { a: T.agua0, b: T.bellas - 0.1, label: "EL BARRO", value: () => "CASI TODO AGUA", y: 440, tone: "red" },
    { a: T.metros0 - 0.1, b: T.nohay - 0.1, label: "BELLAS ARTES", value: () => "−2 m", y: 440, tone: "red" },
    { a: C2, b: T.papel - 0.1, label: "COMPUTADORAS EN MÉXICO", value: () => "0", y: 440, tone: "red" },
    { a: T.hermanos, b: T.p1 - 0.1, label: "INGENIEROS", value: () => "LOS ZEEVAERT", y: 440, tone: "gold" },
    { a: T.c361, b: T.arena - 0.1, label: "PILOTES", value: () => "361", y: 440, tone: "gold" },
    { a: T.arena, b: T.estos - 0.1, label: "A MÁS DE 30 m", value: () => "ARENA FIRME", y: 440, tone: "green" },
    { a: T.pesa, b: T.b2 - 0.1, label: "PESO", value: () => "DEMASIADO", y: 440, tone: "red" },
    { a: T.cavan, b: T.miles + 0.12, label: "CAJÓN", value: (t) => `${count(t, T.cavan, T.cavan + 0.5, 1, 13)} m`, y: 440, tone: "gold" },
    { a: T.miles + 0.15, b: T.ese - 0.1, label: "TIERRA FUERA", value: () => "MILES DE TONELADAS", y: 440, tone: "gold" },
    { a: T.compensa, b: T.flota - 0.1, label: "PESO COMPENSADO", value: () => "BUENA PARTE", y: 440, tone: "green" },
    { a: T.agranda, b: T.b4 - 0.1, label: "EL BARRO", value: () => "AGRANDA EL TEMBLOR", y: 440, tone: "red" },
    { a: T.flexible, b: T.cana - 0.1, label: "ACERO", value: () => "FLEXIBLE", y: 440, tone: "green" },
    { a: T.cana, b: T.giro - 0.1, label: "UN VAIVÉN", value: () => "CADA 3,7 s", y: 440, tone: "green" },
    { a: T.m1957, b: T.aparato - 0.1, label: "AÑO", value: () => "1957", y: 440, tone: "gold" },
    { a: T.aparato, b: T.midio - 0.1, label: "APARATOS PARA SISMO FUERTE", value: () => "0", y: 440, tone: "red" },
    { a: T.midio, b: C7 - 0.05, label: "LO MIDIÓ", value: () => "LA TORRE", y: 440, tone: "green" },
    { a: T.intacta, b: T.m1985 - 0.1, label: "LA TORRE", value: () => "SIN DAÑOS", y: 440, tone: "green" },
    { a: T.m1985, b: T.ella - 0.1, label: "1985", value: () => "CIENTOS DE EDIFICIOS", y: 440, tone: "red" },
    { a: T.ella, b: T.m2017 - 0.1, label: "LA TORRE", value: () => "EN PIE", y: 440, tone: "green" },
    { a: T.m2017, b: T.manda - 0.1, label: "2017", value: () => "OTRA VEZ EN PIE", y: 440, tone: "green" },
  ],
  titles: [{ a: T.estos, text: "PILOTES" }, { a: T.cajon, text: "EL CAJÓN" }, { a: T.esqueleto, text: "ESQUELETO", len: 1.1 }, { a: T.giro, text: "¡EL GIRO!", len: 1.1 }],
  alerts: [T.p1, T.p2, T.p4],
  rewinds: [T.b1, T.b2, T.b4],
  crosses: [[T.gelatina + 0.05, T.b1 - 0.1]], // o ✖ do prédio de tijolo é o do mundo (dois juntos liam «Xx»)
  stamps: [[T.b1, T.c1, "SIN SUELO FIRME"], [T.b4, T.c4, "SIN COMPUTADORAS"]],
  reward: { a: T.manda, len: T.end - T.manda, top: "EN PIE DESDE 1956", big: () => "3", sub: "TERREMOTOS GIGANTES" },
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: ZEE, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#ffe9c6", fog: "#fff2dc", fogNear: 140, fogFar: 560, hemiSky: "#fff6e4", hemiGround: "#d6c49a", hemiI: 1.25, sun: "#fff0d0", sunI: 2.6 },
};
export { BA };
