// E10 — Galeón de Manila (ecos-del-tiempo, Shorts). Câmera, operário, painel e luz deste episódio.
// Pré-crítica de 13/11 (defeitos que reprovaram o E6): cada verbo de solução e cada «Pero…» tem um plano de perto (<~5 s)
// em que a coisa acontece; 13 cortes duros extras (X, todos a ≥1,5 s dos 7 da régua); contadores sem números intermediários;
// operário fora da linha câmera→assunto; o desfecho (o último galeão soltando as velas) grande, no centro, sem letreiro por cima.
import React from "react";
import { CamState, K, Key, Shot, keyed } from "../../toy/cam";
import { CUTS, WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { FONT, HudData, pop, stroke, win } from "../../toy/hud";
import { V3, ease, prog } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { COSTUMES } from "../../toy/worker";
import { AXE, BITE, SFX, T, X } from "./cues";
import { LOG, MKT, SEA_SCENE, World, dusk, shipOnRoute } from "./world";
import { EXPOSURE } from "./exposure";

const PI = Math.PI;
const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
const W10 = WINS[10];
const [SX, , SZ] = SEA_SCENE;
const DYN = [4.2, 0.7, 5.0, 2.4, 0.15, 0.3, 3.6, 3.8, 0.3, 1.3, 0.08];
const dynAt = (t: number) => { let d = DYN[0]; WINS.forEach((w, i) => { if (t >= w) d = DYN[i]; }); return d; };
/** tira a deriva lenta da câmera na mão (story.ts) e deixa só o tremor rápido: o close fica onde as chaves mandam */
const steady = (c: CamState, t: number): CamState => {
  const d = dynAt(t);
  return { ...c, pos: [c.pos[0] - d * 0.7 * Math.sin(t * 0.9 + 9), c.pos[1] - d * 0.2 * Math.sin(t * 1.3 + 4), c.pos[2]], look: [c.look[0] - d * 0.3 * Math.sin(t * 1.1 + 3), c.look[1], c.look[2]] };
};
const shot = (name: string, t0: number, keys: Key[]): Shot => ({ name, t0, keys, fn: (t) => steady(keyed(keys, t), t) });
/** fim de plano antes de um corte da régua: 0,4 s parado (a régua precisa ver a troca) */
const hold = (c: number, pos: V3, look: V3, fov = 54, roll = 0) => [K(c - 0.42, pos, look, fov, roll), K(c - 0.02, pos, look, fov, roll)];

const SHOTS: Shot[] = [
  shot("gancho: o galeão no mapa, o segundo no «a veces dos», sobe para os três continentes", 0, [
    K(0, [14, 5, -24], [4, 3, -36], 52, 6), K(T.veces, [1, 16, -14], [2, 1, -39], 54, -3), K(T.veces + 0.5, [1.5, 18, -12], [2, 1, -39], 54, -1),
    K(T.tres + 0.3, [5, 142, 37], [5, 0, -4], 58, 0), K(X.cebu - 0.02, [5, 138, 35], [5, 0, -4], 58, 0)]),
  shot("⏪ Cebu 1565: o galeão chega empurrado pelo vento (setas para o oeste)", X.cebu, [
    K(X.cebu, [-1.5, 5.0, 25], [-6, 2.2, 10], 54, 2), K(T.nohay, [-3, 5.4, 24.5], [-8, 2.2, 10], 54, 0), ...hold(C1, [-4.8, 5.8, 24], [-10, 2.2, 10], 54, 0)]),
  shot("vira para a América e tenta voltar", C1, [
    K(C1, [3.5, 4.6, 2.0], [-9, 2.0, 10], 52, -2), K(T.volver, [3.0, 4.4, 2.6], [-8.5, 2.0, 10], 52, 0), K(X.cruz - 0.02, [2.6, 4.3, 3.0], [-8, 2.0, 10], 52, 0)]),
  shot("mapa: três galeões saem rumo à América e o vento dos trópicos os gira e devolve", X.cruz, [
    K(X.cruz, [8, 84, 64], [8, 0, 12], 56, 0), K(X.viento - 0.02, [6, 79, 59], [6, 0, 12], 56, 0)]),
  shot("o vento contra bate na proa e o empurra de popa → ✖ → o frade Urdaneta no convés", X.viento, [
    K(X.viento, [-17, 3.4, 21.5], [-8.5, 3, 10], 54, 3), K(T.contra, [-17.5, 3.6, 21], [-10.5, 3, 10], 54, 0), K(T.b1 + 0.3, [-17.5, 3.8, 20.5], [-11.5, 3, 10], 54, 0),
    K(T.b1 + 1.25, [-15.2, 3.8, 15.8], [-11.6, 3.6, 10.4], 48, 0), ...hold(C2, [-14.6, 3.7, 15.2], [-11.6, 3.7, 10.5], 46, 0)]),
  shot("mapa: o barco sobe ao norte até a altura do Japão", C2, [
    K(C2, [-14, 92, 20], [-14, 0, -12], 58, 0), K(T.japon + 0.4, [-11, 84, 4], [-11, 0, -27], 58, 0), K(X.vientos - 0.02, [-9, 82, 0], [-9, 0, -30], 58, 0)]),
  { name: "seguindo o barco: setas do vento oeste e a Kuroshio o empurram para o leste", t0: X.vientos, keys: [K(X.vientos, [0, 44, 0], [0, 0, 0])],
    fn: (t) => { const a = shipOnRoute(Math.min(t, C3 - 0.42)); return steady({ pos: [a.p[0] + 3, 44, a.p[2] + 21], look: [a.p[0] + 4, 0, a.p[2] - 3], fov: 56, roll: 0 }, t); } },
  shot("o mapa inteiro: a ruta del tornaviaje fechada", C3, [K(C3, [6, 128, 42], [6, 0, -6], 58, 0), K(X.p2 - 0.02, [6, 120, 39], [6, 0, -6], 58, 0)]),
  shot("mar aberto: sol e lua correndo, os meses riscados na vela", X.p2, [
    K(X.p2, [SX + 9, 3.8, SZ + 10], [SX, 3.0, SZ], 54, 2), K(T.seisW, [SX + 10, 4.6, SZ + 11.5], [SX, 3.2, SZ], 54, 0),
    K(T.abierto + 0.2, [SX + 14, 10, SZ + 17], [SX, 1.6, SZ], 56, 0), K(X.b2 - 0.02, [SX + 17, 15, SZ + 21], [SX, 0.6, SZ], 56, 0)]),
  shot("estaleiro em Filipinas: o cavername enorme subindo", X.b2, [
    K(X.b2, [-14.6, 4.6, -1.6], [-22.4, 1.8, -9], 54, 2), K(T.filipinas, [-15.6, 5.2, -1.2], [-22.6, 1.8, -9], 54, 0), K(X.maderas - 0.02, [-16.8, 5.6, -1.0], [-22.8, 1.6, -9], 54, 0)]),
  shot("o machado quica no molave (faíscas)", X.maderas, [
    K(X.maderas, [LOG[0] + 2.0, 3.7, LOG[2] + 3.8], [LOG[0], 1.75, LOG[2] - 0.5], 50, -2), ...hold(C4, [LOG[0] + 1.3, 3.5, LOG[2] + 3.5], [LOG[0], 1.75, LOG[2] - 0.5], 48, 0)]),
  shot("tempestade: ondas e chuva, o casco aguenta → este es el galeón", C4, [
    K(C4, [SX + 11, 3.0, SZ + 9], [SX, 2.6, SZ], 54, 3), K(T.galeonT, [SX + 9, 4.0, SZ + 11], [SX, 3.0, SZ], 54, 0), K(X.p3 - 0.02, [SX + 4.5, 5.2, SZ + 13.5], [SX, 3.4, SZ], 54, 0)]),
  shot("sem rios nem portos: o barril vazio virado", X.p3, [
    K(X.p3, [SX + 13, 9, SZ + 14], [SX + 1.5, 1.8, SZ], 56, 2), K(T.agua, [SX + 7.0, 3.6, SZ + 6.2], [SX + 2.6, 2.2, SZ + 0.3], 52, 0),
    ...hold(C5, [SX + 6.2, 3.3, SZ + 5.7], [SX + 2.8, 2.2, SZ + 0.4], 50, 0)]),
  shot("porão em corte: miles de tinajas bajo cubierta", C5, [
    K(C5, [SX - 2.4, 1.25, SZ + 5.5], [SX - 0.3, 0.9, SZ], 54, -2), K(T.miles - 0.4, [SX - 1.4, 1.3, SZ + 5.0], [SX + 0.3, 0.85, SZ], 52, 0),
    K(T.bajo - 0.5, [SX + 0.2, 1.35, SZ + 4.9], [SX + 1.4, 0.85, SZ], 52, 0), K(X.colgadas - 0.02, [SX + 0.8, 1.45, SZ + 5.0], [SX + 2.0, 0.9, SZ], 52, 0)]),
  shot("tinajas colgadas de las jarcias; o chubasco as enche", X.colgadas, [
    K(X.colgadas, [SX - 3.4, 6.9, SZ + 5.4], [SX + 0.6, 4.4, SZ + 0.6], 54, 2), K(T.chubasco + 0.5, [SX - 2.6, 6.6, SZ + 4.8], [SX + 0.8, 4.3, SZ + 1.0], 52, 0),
    K(T.tinajasT, [SX - 3.8, 7.0, SZ + 6.6], [SX + 0.6, 4.2, SZ], 54, 0), K(X.p4 - 0.02, [SX - 6, 7.6, SZ + 9.5], [SX + 0.4, 3.6, SZ], 56, 0)]),
  shot("mercado de Manila: o caixote europeu volta, a prata entra", X.p4, [
    K(X.p4, [MKT.x - 1.8, 3.0, MKT.z + 6.8], [MKT.x + 1.0, 1.4, MKT.z + 0.2], 54, 2), K(T.plata0, [MKT.x - 1.2, 2.8, MKT.z + 6.1], [MKT.x + 0.9, 1.4, MKT.z + 0.4], 52, 0),
    K(X.b4 - 0.02, [MKT.x - 1.0, 2.7, MKT.z + 5.9], [MKT.x + 0.9, 1.4, MKT.z + 0.4], 52, 0)]),
  shot("mina de prata: veios, mineiros, o carrinho", X.b4, [
    K(X.b4, [44.6, 2.5, 16.0], [47, 1.9, 8.6], 56, 2), K(T.potosi, [44.0, 2.6, 15.6], [46.0, 1.6, 8.9], 56, 0), ...hold(C6, [43.6, 2.6, 15.4], [45.2, 1.4, 9.2], 54, 0)]),
  shot("cunhagem: o cunho cai, a moeda vai à balança, peso fijo", C6, [
    K(C6, [45.5, 3.4, 9.8], [40.4, 1.6, 5.3], 52, -2), K(X.medio - 0.02, [45.0, 3.2, 9.4], [40.4, 1.6, 5.3], 50, 0)]),
  shot("moedas voando a meio mundo → real de a ocho", X.medio, [K(X.medio, [-2, 150, 46], [-2, 0, -2], 58, 0), K(X.p5 - 0.02, [-2, 140, 42], [-2, 0, -2], 58, 0)]),
  shot("o galeão carregado de prata e seda vira alvo; o inimigo vem do horizonte", X.p5, [
    K(X.p5, [-5.5, 12, 10], [-8, 1.5, 1.4], 54, 2), K(T.p5 + 1.5, [-6, 13, 10.5], [-8, 1.5, 1.2], 54, 0), K(T.blanco + 0.2, [-7.5, 19, 12], [-8, 0, -2.5], 56, 0),
    ...hold(C7, [-8, 22, 12.5], [-8, 0, -3.5], 56, 0)]),
  shot("1743: o navio britânico atira, aborda, troca a bandeira e leva a prata", C7, [
    K(C7, [5, 11, 15], [-7.3, 1.5, -0.4], 58, 2), K(T.capturo, [4.4, 10.6, 15.4], [-7.3, 1.5, -0.4], 58, 0), K(T.millon, [3.8, 10.8, 15.8], [-7.3, 2.0, -0.4], 58, 0),
    K(X.ultimo - 0.02, [3.4, 11, 16.2], [-7.3, 2.0, -0.4], 58, 0)]),
  shot("1815: o último galeão solta as velas e sai do quadro a toda vela", X.ultimo, [
    K(X.ultimo, [-7.5, 5.2, 15], [-15, 2.6, -1.4], 54, 2), K(T.zarpo + 0.5, [-6.5, 5.2, 15.5], [-12.5, 2.6, -1.4], 54, 0), K(X.hist - 0.02, [-4.5, 5.3, 15.5], [-8, 2.6, -1.4], 54, 0)]),
  shot("mapa: o último galeão, grande, cruza o Pacífico; as rotas acendem; as caixas da China caem na América", X.hist, [
    K(X.hist, [-3, 96, 46], [-3, 0, -8], 58, 0), K(T.mundial, [11, 106, 42], [11, 0, -16], 58, 0), K(W10, [17, 110, 40], [17, 0, -19], 58, 0), K(T.end, [17, 104, 38], [17, 0, -19], 60, 6)]),
];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const hid = (p: V3): WorkerState => S(p, 0, "idle", { scale: 0 }); // escondido já no lugar seguinte (não desliza do nada)
const CEBU_W: V3 = [-19.4, 0.75, 11.2], CASTLE: V3 = [SX - 3.2, 3.3, SZ + 0.3], DECK: V3 = [SX - 2.6, 1.62, SZ + 0.6], STALL: V3 = [MKT.x + 3.2, 0.7, MKT.z + 1.3];
const MINT_W: V3 = [39.7, 0.7, 7.5], ONCOV: V3 = [-11.6, 2.75, 0.84], BEACH: V3 = [-21.4, 0.35, 0.4];
const WORKER: [number, WorkerState][] = [
  [0, hid([0, 0, 0])],
  [X.cebu, S(CEBU_W, -1.2, "present")], [T.viento, S(CEBU_W, -1.2, "alarm")], [T.b1, S(CEBU_W, -1.2, "cheer")],
  [C2, hid(CASTLE)],
  [X.p2, S(CASTLE, 0.8, "think")],
  [X.b2, S([LOG[0], 1.0, LOG[2] - 1.0], -PI / 2, "point", { scale: 1.0 })],
  [X.maderas, S([LOG[0], 1.0, LOG[2] - 1.0], 0, "chisel", { prop: "hammer", scale: 1.0 })],
  [AXE[2] + 0.04, S([LOG[0], 1.0, LOG[2] - 1.0], 0, "alarm", { prop: "none", scale: 1.0 })], // o machado quicou e voou
  [C4, hid(CASTLE)],
  [X.p3, S(CASTLE, 0.8, "alarm")],
  [C5, S(DECK, 0.6, "point")], [X.colgadas, S(DECK, 0.6, "think")], [T.tinajasT, S(DECK, 0.6, "cheer")],
  [X.p4, S(STALL, -PI / 2, "present")], [T.europeos + 0.4, S(STALL, -PI / 2, "alarm")], [T.plata0, S(STALL, -PI / 2, "point")],
  [X.b4, hid(MINT_W)],
  [C6, S(MINT_W, 0.95, "pull", { scale: 1.0 })],
  [X.medio, hid(ONCOV)],
  [X.p5, S(ONCOV, 0.4, "think")], [T.blanco, S(ONCOV, 0.4, "alarm")], [T.millon, S(ONCOV, 0.4, "think")],
  [X.ultimo, S(BEACH, 0.9, "present")], [T.zarpo, S(BEACH, 0.9, "cheer")],
  [T.historiadores + 0.5, hid(BEACH)],
];

const hud: HudData = {
  pills: [
    { a: 0.05, b: T.un - 0.1, label: "RUTA", value: () => "250 AÑOS", y: 440, tone: "gold" },
    { a: T.un, b: T.unio - 0.1, label: "BARCOS", value: (t) => (t < T.veces - 0.05 ? "1 AL AÑO" : "1 O 2 AL AÑO"), y: 440 },
    { a: T.mil, b: T.nohay - 0.1, label: "AÑO", value: () => "1565", y: 440, tone: "gold" },
    { a: T.nohay, b: T.ningun - 0.1, label: "MOTORES", value: () => "0 · SOLO VELA", y: 440, tone: "red" },
    { a: T.volver, b: T.contra - 0.1, label: "VUELTAS A AMÉRICA", value: () => "0", y: 440, tone: "red" },
    { a: T.contra, b: T.b1 - 0.1, label: "VIENTO", value: () => "EN CONTRA", y: 440, tone: "red" },
    { a: T.fraile, b: T.japon - 0.1, label: "FRAILE Y MARINO", value: () => "URDANETA", y: 440 },
    { a: T.japon, b: T.tornaT, label: "RUMBO", value: (t) => (t < T.vientos - 0.1 ? "NORTE" : "ESTE"), y: 440, tone: "green" },
    { a: T.cuatroW, b: T.b2 - 0.1, label: "MESES", value: (t) => (t < T.seisW - 0.05 ? (t < T.cincoW - 0.05 ? "4" : "5") : "6"), y: 440, tone: "red" },
    { a: T.maderas, b: C4 - 0.05, label: "MADERA", value: () => "MOLAVE", y: 440, tone: "green" },
    { a: T.agua, b: T.b3 - 0.1, label: "AGUA", value: () => "SIN PUERTOS", y: 440, tone: "red" },
    { a: T.miles, b: T.tinajasT, label: "TINAJAS", value: () => "MILES", y: 440, tone: "green" },
    { a: T.europeos, b: T.plata0 - 0.1, label: "PRODUCTOS EUROPEOS", value: () => "NO", y: 440, tone: "red" },
    { a: T.plata0, b: T.b4 - 0.1, label: "CHINA QUIERE", value: () => "PLATA", y: 440, tone: "green" },
    { a: T.mexico, b: T.acunada - 0.1, label: "PLATA", value: (t) => (t < T.potosi - 0.1 ? "MÉXICO" : "MÉXICO + POTOSÍ"), y: 440, tone: "gold" },
    { a: T.acunada + 0.12, b: T.medio - 0.1, label: "MONEDA", value: () => "PESO FIJO", y: 440, tone: "gold" },
    { a: T.y1743, b: T.capturo - 0.1, label: "AÑO", value: () => "1743", y: 440, tone: "red" },
    { a: T.millon, b: T.ultimo - 0.1, label: "PESOS DE PLATA", value: () => "+1.000.000", y: 440, tone: "red" },
    { a: T.y1815, b: T.historiadores - 0.1, label: "ÚLTIMO GALEÓN", value: () => "1815", y: 440 },
  ],
  titles: [{ a: T.tornaT, text: "TORNAVIAJE" }, { a: T.galeonT, text: "EL GALEÓN" }, { a: T.tinajasT, text: "TINAJAS" }, { a: T.realT, text: "REAL DE A OCHO" }],
  alerts: [T.ningun, T.p2, T.p3, T.p4, T.p5],
  rewinds: [T.cebu, T.b2, T.b3, T.b4],
  crosses: [[T.nohay + 0.32, T.nohay + 1.0], [T.contra, T.b1 - 0.1], [T.agua, T.b3 - 0.1], [T.europeos + 0.2, T.plata0 - 0.1]],
  stamps: [[T.b1, T.c1, "VIENTO EN CONTRA"], [T.b3, T.c3, "SIN PUERTOS"]],
  reward: { a: T.mundial, len: 2.45, top: "COMERCIO MUNDIAL", big: () => "250 AÑOS", sub: "SIN UN SOLO MOTOR" }, // curto: o fim é o galeão e as caixas
  Extra: ({ t }) => {
    const hull = win(t, C4 + 0.3, T.galeonT - 0.05, 0.2), dip = ease(t, T.olasW + 0.06, T.olasW + 0.2) * (1 - ease(t, T.olasW + 0.5, T.olasW + 0.85)), hit = Math.min(1, Math.abs(Math.sin(t * 5.6)) + dip);
    const flip = Math.cos((1 - ease(t, T.realT, T.realT + 0.45)) * 4 * PI), bit = t >= BITE, jaw = prog(t, BITE - 0.2, BITE) * (1 - prog(t, BITE + 0.05, BITE + 0.3)), jolt = bit ? Math.sin((t - BITE) * 40) * 12 * (1 - prog(t, BITE, BITE + 0.45)) : 0;
    return (
      <>
        {win(t, T.unio, T.cebu - 0.1, 0.2) > 0 ? (
          <div style={{ position: "absolute", left: 0, width: 1080, top: 640, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: win(t, T.unio, T.cebu - 0.1, 0.2) }}>
            {["ASIA", "AMÉRICA", "EUROPA"].map((w, i) => <span key={w} style={{ fontFamily: FONT, fontSize: 78, color: ["#ffd84a", "#7fe0a0", "#7fc8ff"][i], ...stroke(11), transform: `scale(${pop(t, T.tres - 0.2 + i * 0.18, 0.3)})` }}>{w}</span>)}
          </div>) : null}
        {/* «aguantan meses de olas y tormentas»: a barra do casco treme a cada onda; na onda grande quase cede (vermelha, «!!») e volta cheia */}
        {hull > 0 ? (
          <div style={{ position: "absolute", left: 0, width: 1080, top: 440, display: "flex", justifyContent: "center", opacity: hull, transform: `scale(${pop(t, C4 + 0.3, 0.3)}) translateX(${Math.sin(t * 31) * 12 * hit}px) rotate(${Math.sin(t * 23) * 2.5 * hit}deg)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "10px 30px 14px", borderRadius: 60, background: "#0f4a2ae6", border: "4px solid #ffffff33", boxShadow: "0 8px 0 #00000055" }}>
              <span style={{ fontFamily: FONT, fontSize: 38, color: "#cfe6ff", letterSpacing: 2 }}>CASCO</span>
              <div style={{ width: 300, height: 40, borderRadius: 20, background: "#0a2a18", border: "4px solid #ffffff55", overflow: "hidden" }}><div style={{ width: `${100 - 60 * dip}%`, height: "100%", background: dip > 0.3 ? "linear-gradient(#ff8a7a, #e0262b)" : "linear-gradient(#7dff9a, #2fd060)" }} /></div>
              <span style={{ fontFamily: FONT, fontSize: 56, color: dip > 0.3 ? "#ff6a5a" : "#fff", lineHeight: 1, minWidth: 120, textAlign: "center" }}>{dip > 0.3 ? "!!" : "100%"}</span>
            </div>
          </div>) : null}
        {/* o real de a ocho: entra girando como moeda jogada e leva uma mordida (o mercador testando a prata) */}
        {win(t, T.realT, T.p5 - 0.1, 0.2) > 0 ? (
          <div style={{ position: "absolute", left: 0, width: 1080, top: 590, display: "flex", justifyContent: "center", opacity: win(t, T.realT, T.p5 - 0.1, 0.2), transform: `translateX(${jolt}px) scale(${pop(t, T.realT, 0.35)}) scaleX(${Math.abs(flip) < 0.05 ? 0.05 : flip})` }}>
            <svg viewBox="-20 -20 160 160" width="400" height="400">
              <defs><mask id="galeon-bite"><rect x="-20" y="-20" width="160" height="160" fill="#fff" />{bit ? <><circle cx="108" cy="30" r="15" fill="#000" /><circle cx="118" cy="50" r="13" fill="#000" /><circle cx="95" cy="15" r="12" fill="#000" /></> : null}</mask></defs>
              <g mask="url(#galeon-bite)">
                <circle cx="60" cy="60" r="54" fill="#dfe4ea" stroke="#2a2a2a" strokeWidth="5" /><circle cx="60" cy="60" r="44" fill="none" stroke="#9aa3ad" strokeWidth="3" />
                <rect x="26" y="34" width="9" height="52" fill="#9aa3ad" /><rect x="85" y="34" width="9" height="52" fill="#9aa3ad" />
                <text x="60" y="76" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize="44" fill="#4a5058">8</text>
              </g>
              {jaw > 0 ? <g>
                <path transform={`translate(0 ${-26 * (1 - jaw)})`} d="M86 18 L138 18 L138 30 L132 40 L126 30 L120 40 L114 30 L108 40 L102 30 L96 40 L90 30 L86 30 Z" fill="#fff" stroke="#2a2a2a" strokeWidth="3" strokeLinejoin="round" />
                <path transform={`translate(0 ${26 * (1 - jaw)})`} d="M86 62 L138 62 L138 50 L132 40 L126 50 L120 40 L114 50 L108 40 L102 50 L96 40 L90 50 L86 50 Z" fill="#fff" stroke="#2a2a2a" strokeWidth="3" strokeLinejoin="round" />
              </g> : null}
              {bit && t < BITE + 0.5 ? Array.from({ length: 7 }, (_, i) => { const u = prog(t, BITE, BITE + 0.5), a = -1.1 + i * 0.32; return <rect key={i} x={108 + Math.cos(a) * 40 * u} y={36 + Math.sin(a) * 40 * u + 30 * u * u} width="6" height="6" fill="#c8ced6" stroke="#2a2a2a" strokeWidth="1.5" />; }) : null}
            </svg>
          </div>) : null}
      </>
    );
  },
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.marinero, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#eef4f6", fogNear: 160, fogFar: 700, hemiSky: "#f2f7ff", hemiGround: "#a8d0e4", hemiI: 1.6, sun: "#fff2d6", sunI: 2.6 },
  LIGHT: (t) => 1 - 0.3 * dusk(t),
};
