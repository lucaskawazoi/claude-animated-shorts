// E16 — Han van Meegeren, o falsário (ecos-del-tiempo, Shorts). Câmera, pintor, painel e luz deste episódio.
// Ritmo («Sim 66»): 3 aberturas (PROPS open a|b|c), corte duro a cada ~3–5 s (7 da régua + extras), algo sempre se mexendo,
// tentativas que dão errado com ✖ (a pintura que amolece no álcool, o quadro liso, ninguém acredita na confissão).
import React from "react";
import { getInputProps } from "remotion";
import { CamState, K, Key, Shot, keyed } from "../../toy/cam";
import { CUTS, WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { FONT, HudData, count, pop, stroke, win } from "../../toy/hud";
import { V3 } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import type { Costume } from "../../toy/worker";
import { SFX, T, X } from "./cues";
import { ST, World, Y } from "./world";
import { EXPOSURE } from "./exposure";

const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
const W10 = WINS[10];
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
/** tira a deriva lenta da câmera na mão e deixa só o tremor: o enquadramento fica onde as chaves mandam */
const steady = (c: CamState, t: number): CamState => {
  const d = dynAt(t);
  return { ...c, pos: [c.pos[0] - d * 0.7 * Math.sin(t * 0.9 + 9), c.pos[1] - d * 0.2 * Math.sin(t * 1.3 + 4), c.pos[2]], look: [c.look[0] - d * 0.3 * Math.sin(t * 1.1 + 3), c.look[1], c.look[2]] };
};
const shot = (name: string, t0: number, keys: Key[]): Shot => ({ name, t0, keys, fn: (t) => steady(keyed(keys, t), t) });
/** fim de plano antes de um corte da régua: 0,4 s parado (a régua precisa ver a troca) */
const hold = (c: number, pos: V3, look: V3, fov = 54, roll = 0) => [K(c - 0.42, pos, look, fov, roll), K(c - 0.02, pos, look, fov, roll)];
const H = ST.hall, CT = ST.court;

// ---------------------------------------------------------------- três aberturas (0 → «pero lo pintó»), todas em ação no quadro 0
const OPEN_KEYS: Record<Open, Key[]> = {
  // a) entrando no salão: Göring (de farda cinza, sem insígnia) aponta o «Vermeer» no cavalete
  // a) (PADRÃO) começa colado no rosto do «Vermeer» e recua rápido: Göring ao lado, apresentando, pula de alegria e ri
  a: [K(0, [H - 2.3, 2.5, 0.3], [H - 2.6, 2.45, -2.4], 46, 1.2), K(0.9, [H - 2.0, 3.2, 4.6], [H - 1.4, 2.3, -1.6], 54, -0.6), K(T.pero0 - 0.05, [H - 3.0, 3.4, 5.6], [H - 1.0, 2.2, -1.4], 54, 0)],
  // b) do rosto da pintura para trás, revelando o dono
  b: [K(0, [H - 2.4, 2.6, 0.4], [H - 2.5, 2.5, -2.4], 50, 0), K(1.8, [H - 0.5, 3.4, 4.6], [H - 1.0, 2.2, -2.0], 56, 1), K(T.pero0 - 0.05, [H + 2.0, 4.0, 7.0], [H - 0.5, 2.0, -2.0], 58, 0)],
  // c) mergulho de cima do salão até o quadro
  c: [K(0, [H, 11, 6], [H - 0.5, 1.5, -2], 58, 0), K(1.5, [H + 3, 4.5, 6], [H - 0.5, 2.2, -2], 54, 1), K(T.pero0 - 0.05, [H + 3.5, 3.6, 4.8], [H - 0.5, 2.4, -2.2], 52, 0)],
};
const openCam = (t: number) => steady(keyed(OPEN_KEYS[openOf()], t), t);

const SHOTS: Shot[] = [
  { name: "abertura a|b|c: o «Vermeer» de Göring", t0: 0, keys: OPEN_KEYS.a, fn: openCam },
  shot("a cozinha: o quadro sai do forno, com vapor", T.pero0, [
    K(T.pero0, [ST.oven + 2.6, 3.2, 5.6], [ST.oven - 1.2, 1.7, -2.6], 54, -1.5), K(T.cocio, [ST.oven + 1.8, 3.0, 4.6], [ST.oven - 1.4, 1.7, -2.6], 52, 0.5),
    K(T.horno0 + 0.6, [ST.oven + 0.2, 2.8, 3.4], [ST.oven - 1.8, 1.8, -2.4], 52, 0), K(T.holanda - 0.05, [ST.oven - 0.4, 3.0, 3.6], [ST.oven - 2.2, 1.8, -2.0], 54, 0)]),
  shot("Holanda, anos 30: o barco cruza o canal, casas e moinho", T.holanda, [
    K(T.holanda, [-6, 4.6, 17.5], [-13.5, 3.2, 4], 58, 1), K(X.h2 - 0.05, [-7.5, 4.8, 17.2], [-14.5, 3.4, 3], 58, -0.5)]),
  shot("Holanda: da margem, o barco passa e o passante atravessa", X.h2, [
    K(X.h2, [-4.0, 1.7, 16.6], [-14, 2.6, 8], 54, 1.5), K(C1 - 0.5, [-5.5, 1.9, 16.2], [-18, 2.8, 7], 54, -0.5), ...hold(C1, [-5.8, 1.9, 16.0], [-19, 2.8, 6.5], 54, 0)]),
  shot("os críticos desprezam o quadro dele; ele quer vingança", C1, [
    K(C1, [ST.critics, 3.2, 5.5], [ST.critics, 2.2, -2.5], 52, -1.5), K(T.desprecian, [ST.critics - 0.6, 3.0, 4.6], [ST.critics, 2.3, -2.6], 50, 0.5),
    K(T.vengarse, [ST.critics + 2.2, 3.2, 5.0], [ST.critics + 0.5, 2.4, -3], 52, 0), K(T.expertos0 - 0.05, [ST.critics + 2.6, 3.3, 5.3], [ST.critics + 0.5, 2.4, -3], 52, 0)]),
  shot("os peritos juram: verdadeiro!", T.expertos0, [
    K(T.expertos0, [ST.critics - 2.5, 2.6, 3.6], [ST.critics + 0.4, 1.8, -1.2], 50, 2), K(T.p1 - 0.05, [ST.critics - 1.8, 2.8, 4.4], [ST.critics + 0.4, 1.9, -1.2], 52, 0)]),
  shot("um Vermeer de verdade tem 300 anos: as rachaduras de perto", T.p1, [
    K(T.p1, [ST.bredius, 2.8, 2.2], [ST.bredius, 2.5, -3.6], 46, -1), K(T.trescientos, [ST.bredius - 0.6, 2.6, 1.0], [ST.bredius, 2.5, -3.6], 40, 0.5),
    K(X.nota - 0.05, [ST.bredius - 0.8, 2.5, 0.2], [ST.bredius, 2.5, -3.6], 36, 0)]),
  shot("«se nota»: o perito vê as rachaduras e se assusta", X.nota, [
    K(X.nota, [ST.bredius + 2.4, 3.0, 4.0], [ST.bredius - 1.2, 2.3, -2.0], 52, 1.5), ...hold(C2, [ST.bredius + 1.6, 2.9, 3.4], [ST.bredius - 1.2, 2.3, -2.0], 48, 0)]),
  shot("a feira: um quadro barato do séc. XVII", C2, [
    K(C2, [ST.market + 1.2, 4.2, 13.5], [ST.market - 2.0, 2.2, 2.5], 56, -2), K(T.c1, [ST.market + 0.8, 3.6, 12], [ST.market - 2.0, 2.4, 2.8], 52, 0.5),
    K(T.compra, [ST.market + 0.2, 3.3, 11], [ST.market - 2.0, 2.5, 3.0], 50, 0), K(T.siglo - 0.05, [ST.market, 3.2, 10.2], [ST.market - 2.0, 2.6, 3.0], 48, 0)]),
  shot("o cavalete: pedra-pomes tira a tinta velha, o pincel pinta o Vermeer", T.siglo, [
    K(T.siglo, [ST.easel + 1.8, 2.8, 2.6], [ST.easel, 2.5, -2.4], 46, -1.5), K(T.quita, [ST.easel + 0.8, 2.7, 1.8], [ST.easel, 2.5, -2.4], 44, 0.5),
    K(T.pinta, [ST.easel - 0.8, 2.9, 2.0], [ST.easel, 2.5, -2.4], 46, -0.5), ...hold(C3, [ST.easel - 1.2, 3.0, 2.4], [ST.easel, 2.5, -2.4], 48, 0)]),
  shot("o teste do álcool: a tinta nova amolece ✖", C3, [
    K(C3, [ST.test + 2.5, 3.0, 3.6], [ST.test, 2.4, -2.4], 50, -1.5), K(T.prueban, [ST.test + 1.2, 2.7, 2.2], [ST.test, 2.4, -2.4], 44, 0.5),
    K(T.ablanda, [ST.test + 0.6, 2.6, 1.4], [ST.test, 2.4, -2.4], 40, 0), K(T.b2 - 0.05, [ST.test + 0.4, 2.6, 1.2], [ST.test, 2.4, -2.4], 40, 0)]),
  shot("a mesa: baquelita na tinta", T.b2, [
    K(T.b2, [ST.table + 2.4, 3.6, 3.4], [ST.table, 1.6, -3.2], 48, -1.5), K(X.mezcla - 0.05, [ST.table + 1.4, 3.3, 2.4], [ST.table - 0.2, 1.6, -3.2], 46, 0.5)]),
  shot("a tigela de tinta: o pincel mexe, o frasco de baquelita derrama", X.mezcla, [
    K(X.mezcla, [ST.table - 1.8, 3.3, 1.8], [ST.table - 0.4, 2.0, -3.1], 48, -1.5), K(T.baquelita, [ST.table - 0.4, 3.4, 2.2], [ST.table, 2.0, -3.1], 46, 0.5),
    K(T.hornea - 0.05, [ST.table + 0.8, 3.5, 2.4], [ST.table + 0.4, 2.0, -3.1], 48, 0)]),
  shot("o quadro voa do cavalete para o forno", T.hornea, [
    K(T.hornea, [ST.easel + 2.6, 3.6, 7], [ST.easel + 1.6, 2.4, -2.5], 58, 1), K(T.hornea + 0.5, [ST.table + 1.0, 3.8, 7.5], [ST.table + 2, 2.4, -3.2], 58, 0),
    ...hold(C4, [ST.oven - 4.6, 2.7, 2.6], [ST.oven - 2.4, 1.9, -2.2], 50, 0)]),
  shot("o forno a 100 °C → sai duro, o álcool não tira nada ✔", C4, [
    K(C4, [ST.oven + 1.8, 3.1, 3.8], [ST.oven - 0.2, 2.0, -3.6], 48, -1.5), K(T.sale, [ST.oven + 0.4, 2.4, 1.6], [ST.oven - 1, 1.7, -2.6], 46, 0.5),
    K(T.alcohol2, [ST.oven - 1.4, 2.5, 2.0], [ST.oven - 3.6, 1.9, -1.0], 40, 0), K(T.p3 - 0.05, [ST.oven - 1.6, 2.5, 1.8], [ST.oven - 3.6, 1.9, -1.0], 38, 0)]),
  shot("a lupa: quadro velho tem rachaduras, o dele é liso ✖", T.p3, [
    K(T.p3, [ST.roll, 5.0, 1.8], [ST.roll, 1.4, -2.6], 46, -1), K(T.liso, [ST.roll - 0.5, 4.6, 1.4], [ST.roll, 1.4, -2.6], 42, 0.5), K(T.b3 - 0.05, [ST.roll - 0.6, 4.5, 1.2], [ST.roll, 1.4, -2.6], 42, 0)]),
  shot("«Solución»: o pintor pega o rolo", T.b3, [
    K(T.b3, [ST.roll + 2.4, 3.4, 2.6], [ST.roll, 1.4, -2.8], 50, 1.5), ...hold(C5, [ST.roll + 2.2, 3.2, 2.2], [ST.roll, 1.4, -2.8], 48, 0)]),  // dentro da sala (x<16)
  shot("enrola no cilindro: a tinta dura racha", C5, [
    K(C5, [ST.roll - 2.2, 5.2, 2.4], [ST.roll, 1.4, -2.8], 48, -1.5), K(T.agrieta, [ST.roll - 1.0, 5.4, 1.8], [ST.roll, 1.4, -2.7], 46, 0.5), K(T.frota - 0.05, [ST.roll - 0.8, 5.4, 1.6], [ST.roll, 1.4, -2.7], 46, 0)]),
  shot("tinta da China nas rachaduras", T.frota, [
    K(T.frota, [ST.roll + 1.6, 3.3, -0.4], [ST.roll, 1.4, -2.4], 38, 1.5), K(X.sucias - 0.05, [ST.roll + 0.4, 3.0, -0.6], [ST.roll, 1.4, -2.4], 34, 0)]),
  shot("as rachaduras sujas de séculos, o pintor ao fundo", X.sucias, [
    K(X.sucias, [ST.roll - 1.8, 3.4, 1.2], [ST.roll + 0.2, 1.8, -3.2], 46, -1.5), K(T.funciona - 0.05, [ST.roll - 1.2, 3.2, 0.8], [ST.roll + 0.2, 1.9, -3.2], 44, 0)]),
  shot("Bredius e a lupa: obra-prima!", T.funciona, [
    K(T.funciona, [ST.bredius + 2.4, 4.3, 6.4], [ST.bredius - 0.4, 2.2, -3.0], 50, 1.5), K(T.llama, [ST.bredius + 0.6, 4.1, 6.2], [ST.bredius - 0.9, 2.3, -3.0], 48, 0),
    K(T.maestra, [ST.bredius + 0.2, 4.0, 6.0], [ST.bredius - 1.2, 2.3, -2.6], 48, 0.5), K(T.guerra - 0.05, [ST.bredius - 0.2, 3.9, 5.8], [ST.bredius - 1.4, 2.3, -2.6], 48, 0)]),
  shot("Göring paga com mais de cem quadros, muitos roubados", T.guerra, [
    K(T.guerra, [H + 6, 5, 8], [H, 2.5, -3], 56, -1.5), K(T.otro, [H + 5, 4.6, 7], [H + 1, 2.4, -2.4], 54, 0.5), K(T.cien2, [H + 6.2, 4.4, 6.4], [H + 5, 2, -1], 54, 0),
    K(T.robados, [H + 6.5, 3.6, 5.2], [H + 7, 1.6, 0.6], 50, 0), ...hold(C6, [H + 6.6, 3.5, 5.0], [H + 7, 1.6, 0.6], 50, 0)]),
  shot("a balança: arte sujo por arte falso", C6, [
    K(C6, [H - 7, 3.8, 9.5], [H - 7, 2.4, 0.4], 54, -1.5), K(T.artefalso, [H - 7.5, 3.6, 8.6], [H - 7, 2.4, 0.4], 52, 0.5), K(T.giro - 0.05, [H - 7.6, 3.6, 8.4], [H - 7, 2.4, 0.4], 52, 0)]),
  shot("o giro: a polícia entra", T.giro, [
    K(T.giro, [CT + 5, 5, 10], [CT + 2, 2, -1.5], 56, -8), K(T.terminar, [CT + 4.6, 4.2, 8.4], [CT + 3, 1.8, 0], 54, 0), K(T.arrestan - 0.05, [CT + 4.2, 3.6, 7], [CT + 4, 1.8, 0], 52, 0)]),
  shot("preso: traição, pena de morte possível; o martelo", T.arrestan, [
    K(T.arrestan, [CT + 3.4, 4.8, 8.0], [CT + 4.2, 1.8, 0.8], 52, 1.5), K(T.tesoro, [CT + 3.8, 4.4, 6.6], [CT + 4.2, 2.0, 0.8], 46, 0), K(X.vida - 0.05, [CT + 3.8, 4.2, 6.2], [CT + 4.2, 2.0, 0.8], 46, 0)]),
  shot("o martelo do juiz: pena de morte possível", X.vida, [
    K(X.vida, [CT - 1.8, 3.4, 3.2], [CT + 0.8, 2.4, -4.2], 44, -1.5), ...hold(C7, [CT + 1.6, 3.3, 3.6], [CT, 2.2, -4], 48, 0)]),
  shot("a confissão: «é falso, eu pintei» → ninguém acredita ✖", C7, [
    K(C7, [CT + 5.8, 3.0, 4.6], [CT + 3.0, 2.2, -0.6], 48, -1.5), K(T.pinteyo, [CT + 5.2, 3.0, 4.2], [CT + 2.8, 2.2, -0.8], 48, 0.5),
    K(T.nadie, [CT + 1, 3.4, 1.0], [CT, 2.6, -4.6], 46, 0), K(T.asique - 0.05, [CT + 0.8, 3.4, 0.8], [CT, 2.6, -4.6], 46, 0)]),
  shot("pinta outro Vermeer diante dos guardas", T.asique, [
    K(T.asique, [CT + 1.2, 3.0, 5.2], [CT + 1.0, 2.2, -1.4], 50, 1.5), K(T.testigos, [CT + 1.6, 3.2, 5.8], [CT + 1.6, 2.1, -1.2], 54, 0), K(T.traidor - 0.05, [CT + 1.8, 3.2, 6.2], [CT + 1.8, 2.1, -1.2], 56, 0)]),
  shot("de traidor a herói: a praça", T.traidor, [
    K(T.traidor, [CT, 4.4, 20], [CT, 2.4, 10.5], 54, 1), K(T.heroe, [CT + 1.6, 3.6, 18], [CT, 2.5, 11], 50, 0.5), K(W10 - 0.05, [CT + 2.0, 3.6, 18.2], [CT, 2.5, 11], 50, 0)]),
  shot("«mándaselo»: o herói de perto, a praça em festa", W10, [
    K(W10, [CT - 3.0, 2.6, 16.2], [CT, 2.7, 11.2], 48, -1.5), K(W10 + 1.2, [CT - 1.2, 3.0, 15.4], [CT, 2.7, 11.2], 44, 0.5), K(T.end, [CT + 1.2, 3.2, 15.0], [CT, 2.7, 11.2], 42, 0)]),
];

const PAINTER: Costume = { skin: "#e8b48c", top: "#4a5a7a", bottom: "#2a2a30", kilt: "#4a5a7a", kiltLen: 0.6, hat: "cap", hatC: "#1e1e24", boot: "#1a1a1a", belt: "#8a6a4a", sleeves: true };
const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, scale: 1.05, ...o });
const OVEN: V3 = [ST.oven - 2.4, Y, -1.4], GAL: V3 = [ST.critics + 3.4, Y, -1.0], MKT: V3 = [ST.market - 2.7, 0, 4.4], EAS: V3 = [ST.easel + 1.5, Y, -1.4];
const TAB: V3 = [ST.table + 0.6, Y, -4.8], ROLL: V3 = [ST.roll, Y, -4.6], COURT: V3 = [CT + 3.2, Y, 0.4];
const WORKER: [number, WorkerState][] = [
  [0, S(OVEN, 0.9, "pull", { scale: 0 })],
  [T.pero0, S(OVEN, 0.9, "pull")],
  [T.cocio + 1.4, S(OVEN, 0.5, "cheer")],
  [C1, S(GAL, -0.6, "read")],
  [T.desprecian, S(GAL, -0.6, "alarm")],
  [T.vengarse, S(GAL, -0.4, "point")],
  [T.juren, S(GAL, -0.4, "cheer")],
  [T.p1, S([ST.bredius - 2.2, Y, -1.0], 0.6, "read")],
  [T.nota, S([ST.bredius - 2.2, Y, -1.0], 0.6, "alarm")],
  [C2, S(MKT, 2.5, "read")],
  [T.c1, S(MKT, 2.6, "cheer")],
  [T.compra, S([ST.market - 2.4, 0, 4.5], 2.8, "present")],
  [T.siglo, S(EAS, -0.9, "present")],
  [T.quita, S(EAS, -0.9, "chisel")],
  [T.pinta, S(EAS, -0.9, "point")],
  [C3, S([ST.test - 1.8, Y, -1.0], 0.7, "read")],
  [T.ablanda, S([ST.test - 1.8, Y, -1.0], 0.7, "alarm")],
  [T.b2, S(TAB, 0, "read")],
  [T.c2, S(TAB, 0, "cheer")],
  [T.mezcla, S(TAB, 0, "pour", { prop: "jar" })],
  [T.hornea, S(OVEN, 1.0, "pull")],
  [T.sale, S([ST.oven - 5.0, Y, -2.4], 0.6, "present")],
  [T.yano, S([ST.oven - 5.0, Y, -2.4], 0.4, "cheer")],
  [T.p3, S(ROLL, 0, "read")],
  [T.liso, S(ROLL, 0, "alarm")],
  [T.b3, S(ROLL, 0, "cheer")],
  [T.enrolla, S(ROLL, 0, "pull")],
  [T.frota, S(ROLL, 0, "chisel")],
  [T.sucias, S(ROLL, 0, "cheer")],
  [T.funciona, S([ST.bredius + 3.8, Y, -2.2], -0.6, "cheer")],
  [T.guerra, S([H + 3.4, Y, -0.2], -1.4, "present")],
  [T.robados, S([H + 3.4, Y, -0.2], -1.2, "cheer")],
  [T.giro, S(COURT, 0.3, "alarm")],
  [C7, S(COURT, -0.6, "present")],
  [T.nadie, S(COURT, -0.6, "read")],
  [T.asique, S([CT + 1.6, Y, -1.0], -1.2, "chisel")],
  [T.testigos, S([CT + 1.6, Y, -1.0], -1.0, "point")],
  [T.traidor, S([CT, 0, 11.6], 0, "cheer")],
];

const hud: HudData = {
  pills: [
    { a: T.mano, b: T.pero0 - 0.1, label: "LO COMPRÓ", value: () => "GÖRING", y: 440 },
    { a: T.vivo, b: T.horno0 - 0.1, label: "PINTOR", value: () => "VIVO", y: 440, tone: "red" },
    { a: T.horno0, b: T.holanda - 0.1, label: "HORNO", value: () => "DE CASA", y: 440, tone: "gold" },
    { a: T.holanda, b: T.criticos - 0.1, label: "HOLANDA", value: () => "AÑOS 30", y: 440, tone: "gold" },
    { a: T.desprecian, b: T.vengarse - 0.1, label: "CRÍTICOS", value: () => "EN CONTRA", y: 440, tone: "red" },
    { a: T.trescientos, b: T.b1 - 0.1, label: "UN VERMEER", value: (t) => `${count(t, T.trescientos, T.trescientos + 1, 0, 300)} AÑOS`, y: 440, tone: "gold" },
    { a: T.barato, b: T.quita - 0.1, label: "SIGLO XVII", value: () => "BARATO", y: 440, tone: "green" },
    { a: T.pomez, b: T.pinta, label: "PIEDRA", value: () => "PÓMEZ", y: 440 },
    { a: T.decadas, b: T.prueban - 0.1, label: "EL ÓLEO TARDA", value: () => "DÉCADAS", y: 440, tone: "red" },
    { a: T.alcohol, b: T.b2 - 0.1, label: "PRUEBA", value: () => "ALCOHOL", y: 440 },
    { a: T.baquelita, b: T.hornea - 0.1, label: "BAQUELITA", value: () => "PLÁSTICO", y: 440, tone: "gold" },
    { a: C4, b: T.dura, label: "HORNO", value: (t) => `${count(t, C4, C4 + 0.8, 20, 100)} °C`, y: 440, tone: "red" },
    { a: T.grietas, b: T.liso - 0.1, label: "UN CUADRO VIEJO", value: () => "GRIETAS", y: 440 },
    { a: T.liso, b: T.b3 - 0.1, label: "EL SUYO", value: () => "LISO", y: 440, tone: "red" },
    { a: T.china, b: T.funciona - 0.1, label: "TINTA", value: () => "CHINA", y: 440 },
    { a: T.experto, b: T.guerra - 0.1, label: "BREDIUS", value: () => "1937", y: 440, tone: "gold" },
    { a: T.cien2, b: T.robados - 0.1, label: "CUADROS", value: (t) => `+${count(t, T.cien2, T.cien2 + 0.8, 0, 100)}`, y: 440, tone: "gold" },
    { a: T.robados, b: T.sucio - 0.1, label: "MUCHOS", value: () => "ROBADOS", y: 440, tone: "red" },
    { a: T.tesoro, b: T.vida - 0.1, label: "VENDER UN", value: () => "TESORO", y: 440, tone: "red" },
    { a: T.vida, b: T.salvarse - 0.1, label: "PENA POSIBLE", value: () => "MUERTE", y: 440, tone: "red" },
    { a: T.testigos, b: T.traidor - 0.1, label: "TESTIGOS", value: () => "MIRANDO", y: 440 },
    { a: T.traidor, b: T.hombre - 0.1, label: "TRAIDOR →", value: () => "HÉROE", y: 440, tone: "green" },
  ],
  titles: [
    { a: T.falso0, text: "VERMEER FALSO" }, { a: T.pinta + 0.6, text: "TELA DEL SIGLO XVII" }, { a: T.sale, text: "PINTURA DURA" },
    { a: T.sucias, text: "GRIETAS DE SIGLOS" }, { a: T.maestra, text: "¡OBRA MAESTRA!" }, { a: T.sucio, text: "ARTE SUCIO POR ARTE FALSO", len: 1.6 },
    { a: T.giro, text: "¡EL GIRO!", len: 1.1 },
  ],
  alerts: [T.p1, T.p2, T.p3],
  rewinds: [T.b1, T.b2, T.b3],
  crosses: [[T.ablanda, T.b2 - 0.1], [T.liso, T.b3 - 0.1], [T.nadie, T.asique - 0.1]],
  stamps: [[T.b1, T.c1, "SIN MÁQUINA DEL TIEMPO"], [T.b2, T.c2, "SIN ESPERAR 300 AÑOS"]],
  reward: { a: T.hombre, len: T.end - T.hombre, top: "ENCUESTA DE 1947", big: () => "N.º 2", sub: "MÁS POPULAR DE HOLANDA" },
  Extra: ({ t }) => {
    const k = win(t, T.esfalso - 0.05, T.nadie - 0.1, 0.2); if (k <= 0) return null;
    return (
      <div style={{ position: "absolute", left: 0, width: 1080, top: 700, display: "flex", justifyContent: "center", opacity: k, transform: `scale(${pop(t, T.esfalso - 0.05, 0.3)})` }}>
        <div style={{ background: "#fff", borderRadius: 48, padding: "26px 44px", border: "8px solid #1c1208", boxShadow: "0 10px 0 #00000055" }}>
          <span style={{ fontFamily: FONT, fontSize: 64, color: "#1c1208" }}>{t < T.pinteyo ? "¡ES FALSO!" : "¡ES FALSO! ¡LO PINTÉ YO!"}</span>
        </div>
      </div>
    );
  },
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: PAINTER, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#eef3fa", fogNear: 120, fogFar: 520, hemiSky: "#fff6e4", hemiGround: "#b98a58", hemiI: 1.25, sun: "#fff0d0", sunI: 2.5 },
};
export { stroke };
