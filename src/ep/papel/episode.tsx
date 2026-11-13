// MEP13 — Do eucalipto ao papel (Mundo em Peças, 3D de brinquedo). Câmera, operário, painel e luz.
// 72 planos em cortes secos onde a história vira (cada estação, cada «Zerou? Ainda não», cada surpresa); câmera sempre andando.
import React from "react";
import type { Shot } from "../../toy/cam";
import { CamState } from "../../toy/cam";
import type { Episode } from "../../toy/episode";
import { FONT, HudData, count, pop, stroke, win } from "../../toy/hud";
import { V3, ease, lerp, prog, sstep } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { COSTUMES } from "../../toy/worker";
import { CUTS10, SFX, T } from "./cues";
import { OPEN_END, openId } from "./opening";
import { ROWS } from "./shots";
import { World } from "./world";
export { OPENING } from "./opening";

const mixS = (a: CamState, b: CamState, u: number): CamState => ({ pos: [lerp(a.pos[0], b.pos[0], u), lerp(a.pos[1], b.pos[1], u), lerp(a.pos[2], b.pos[2], u)], look: [lerp(a.look[0], b.look[0], u), lerp(a.look[1], b.look[1], u), lerp(a.look[2], b.look[2], u)], fov: lerp(a.fov, b.fov, u), roll: lerp(a.roll, b.roll, u) });

// ---- as três aberturas (0 a OPEN_END), com movimento no quadro 1
const openA = (t: number): CamState => {
  const p = prog(t, 0, OPEN_END), o = sstep(prog(t, 0, 1.2)), u = sstep(prog(t, 0.35, 2.7)), w = sstep(prog(t, 1.8, 3.0));
  return { pos: [lerp(lerp(5, -9, o), -26, u), lerp(lerp(7.5, 10, o), 32, u), lerp(lerp(41, 47, o), 86, u)], look: [0, lerp(4.2, 8, u), lerp(34, -8, w)], fov: lerp(50, 58, u), roll: 22 * (1 - p) * (1 - p) };
};
const openB = (t: number): CamState => { const p = prog(t, 0, OPEN_END), th = lerp(-0.8, 0.55, p), R = lerp(20, 17, p), h = lerp(13, 19, sstep(p)); return { pos: [-14 + Math.sin(th) * R, h, 32 + Math.cos(th) * R], look: [-14, lerp(4, 8.5, p), 33], fov: 56, roll: 14 * (1 - p) + 3 * Math.sin(t * 5) * (1 - p) }; };
const openC = (t: number): CamState => {
  const d = prog(t, 0, 0.7), u = sstep(prog(t, 0.7, 2.9));
  const p0: V3 = [lerp(-14, -8, d), lerp(2.2, 3.5, d), lerp(-16, -10, d)], l0: V3 = [lerp(-11, -9, d), 5.5, -26], p1: V3 = [4, 26, 40], l1: V3 = [0, 5, -24];
  return { pos: [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u), lerp(p0[2], p1[2], u)], look: [lerp(l0[0], l1[0], u), lerp(l0[1], l1[1], u), lerp(l0[2], l1[2], u)], fov: lerp(64, 60, u), roll: 14 * (1 - u) + 4 * Math.sin(t * 6) * (1 - u) };
};
const camS1 = (t: number): CamState => { const o = openId(); return (o === "A" ? openA : o === "B" ? openB : openC)(Math.min(t, OPEN_END)); };

const linCam = (i: number) => (t: number): CamState => { const r = ROWS[i], t1 = ROWS[i + 1] ? ROWS[i + 1][0] : T.end, u = Math.min(1, Math.max(0, (t - r[0]) / (t1 - r[0]))), L = (a: V3, b: V3): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; return { pos: L(r[1], r[3]), look: L(r[2], r[4]), fov: lerp(r[5], r[6], u), roll: lerp(r[7], r[8], u) }; };
const SHOTS: Shot[] = ROWS.map((r, i): Shot => ({ name: r[9], t0: r[0], keys: [], fn: i === 0 ? camS1 : linCam(i) }));
const DYN = [3, 2, 3, 3, 1.5, 1.5, 3, 3, 1.5, 1.5, 2];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const WORKER: [number, WorkerState][] = [
  [0, S([-8, 0, 38], 0, "idle", { scale: 0 })],
  [T.entao - 0.3, S([-8, 0, 38], 0, "think")],
  [T.flor, S([-20, 0, 12], 0.2, "present")],
  [T.tora, S([14, 0, 14], 0.1, "point")],
  [T.cam, S([20, 0, 16], 0.1, "cheer")],
  [T.soque1, S([40, 0, 17], 0.2, "alarm")],
  [T.z1, S([28, 0, 19], 0.2, "present", { follow: (t) => [28 + 0.6 * Math.sin(t * 7) - 0.9 * ease(t, T.a1, T.a1 + 0.3), 0, 19] })],
  [T.ai2, S([84, 0, 14], 0.2, "point")],
  [T.descT, S([88, 0, 15], 0.1, "present")],
  [T.depois, S([130, 0, 11], 0.2, "point")],
  [T.picT, S([140, 0, 13], 0.1, "present")],
  [T.soque2, S([170, 0, 13], 0.2, "alarm")],
  [T.z2, S([172, 0, 12.6], 0.3, "pull", { follow: (t) => [172 - 0.5 * ease(t, T.z2, T.a2) - 0.4 * Math.abs(Math.sin(t * 6)), 0, 12.6] })],
  [T.ai3, S([190, 0, 14], 0.2, "point")],
  [T.digT, S([205, 0, 14], 0.1, "present")],
  [T.soque3, S([232, 0, 12], 0.2, "alarm")],
  [T.z3, S([246, 0, 9], 0.5, "read", { follow: (t) => [246 + 0.3 * Math.sin(t * 5) - 0.8 * ease(t, T.a3, T.a3 + 0.3), 0, 9] })],
  [T.ent2, S([255, 0, 13], 0.2, "point")],
  [T.torT, S([282, 0, 14], 0.1, "present")],
  [T.mas4, S([306, 0, 14], 0.2, "alarm")],
  [T.z4, S([310, 0, 17], 0.9, "alarm", { follow: (t) => [310 - 1.0 * ease(t, T.z4 + 0.5, T.a4 + 0.3), 0, 17 + 0.5 * Math.sin(t * 12)] })],
  [T.ai4, S([330, 0, 20], 0.2, "point")],
  [T.maqT, S([392, 0, 18], 0.1, "present")],
  [T.soque5, S([212, 0, 12], 0.2, "alarm")],
  [T.z5, S([248, 0, -8], 0.2, "belly", { follow: (t) => [248 + 0.25 * Math.sin(t * 22), 0.12 * Math.abs(Math.sin(t * 11)), -8] })],
  [T.ai5, S([232, 0, -26], 0.2, "point")],
  [T.energia, S([232, 0, -26], 0.1, "cheer")],
  [T.varias, S([270, 0, -40], 0.1, "point")],
  [T.vender, S([344, 0, -40], 0.1, "cheer")],
  [T.casca, S([176, 0, -38], 0.2, "point")],
  [T.maior, S([196, 0, -30], 0.2, "point")],
  [T.calT, S([232, 0, -34], 0.1, "present")],
  [T.agoraSim, S([-8, 0, 14], 0.1, "cheer")],
  [T.brasil, S([232, 0, -30], 0.1, "cheer")],
  [T.ton, S([470, 0, 22], 0.1, "cheer")],
  [T.ano, S([232, 0, -30], 0.1, "cheer")],
  [T.mostra, S([-10, 0, 40], 0.0, "present", { prop: "scroll" })],
];

const hud: HudData = {
  pills: [
    { a: T.sete + 0.1, b: T.metade - 0.1, label: "IDADE", value: (t) => `${count(t, T.sete, T.anos + 0.5, 0, 7)} ANOS`, y: 440, hi: true, tone: "green" },
    { a: T.metade + 0.2, b: T.entao - 0.1, label: "METADE", value: () => "NEM VIROU PAPEL", y: 440, hi: true, tone: "red" },
    { a: T.entao, b: T.flor - 0.1, label: "A OUTRA METADE", value: () => "VIROU O QUÊ?", y: 440, hi: true, tone: "gold" },
    { a: T.soque1, b: T.z1 - 0.1, label: "A CASCA", value: () => "SUJA A POLPA", y: 440, hi: true, tone: "red" },
    { a: T.soque2, b: T.z2 - 0.1, label: "AS FIBRAS", value: () => "VÊM COLADAS", y: 440, hi: true, tone: "red" },
    { a: T.soque3, b: T.z3 - 0.1, label: "A MASSA", value: () => "SAI MARROM", y: 440, hi: true, tone: "red" },
    { a: T.mas4, b: T.z4 - 0.1, label: "A POLPA", value: () => "É QUASE SÓ ÁGUA", y: 440, hi: true, tone: "red" },
    { a: T.soque5, b: T.z5 - 0.1, label: "SOBROU", value: () => "LICOR PRETO", y: 440, hi: true, tone: "red" },
    { a: T.energia, b: T.varias - 0.1, label: "ENERGIA", value: () => "DA PRÓPRIA FÁBRICA", y: 440, hi: true, tone: "gold" },
    { a: T.sobra, b: T.casca - 0.1, label: "SOBRA", value: () => "VAI PRA CIDADE", y: 440, hi: true, tone: "gold" },
    { a: T.casca, b: T.maior - 0.1, label: "A CASCA", value: () => "VIRA COMBUSTÍVEL", y: 440, hi: true, tone: "green" },
    { a: T.maior, b: T.calT - 0.1, label: "QUÍMICOS", value: () => "VOLTAM PRO DIGESTOR", y: 440, hi: true, tone: "green" },
  ],
  titles: [
    { a: T.lign, text: "LIGNINA", len: 1.6 }, { a: T.descT, text: "DESCASCADOR" }, { a: T.picT, text: "PICADORA" }, { a: T.digT, text: "DIGESTOR" },
    { a: T.torT, text: "TORRE DE BRANQUEAMENTO", len: 2.4, size: 66 }, { a: T.maqT, text: "MÁQUINA DE PAPEL", len: 2.4, size: 100 }, { a: T.calT, text: "CALDEIRA DE RECUPERAÇÃO", len: 2.2, size: 60 },
  ],
  alerts: [T.soque1, T.soque2, T.soque3, T.mas4, T.soque5],
  rewinds: [],
  crosses: [],
  stamps: [[T.z1, T.a1], [T.z2, T.a2], [T.z3, T.a3], [T.z4, T.a4], [T.z5, T.a5]],
  reward: { a: T.agoraSim, len: 1.75, top: "AGORA SIM:", big: () => "ZEROU!", sub: "DO EUCALIPTO AO PAPEL", bounces: [T.agoraSim + 0.9] },
  Extra: ({ t }) => {
    // cartões que entram e saem, trocando de texto a cada ~2 s (13/11, crítico: o cartão parado por 8 s)
    const cards: { a: number; b: number; top: string; big: string; sub: string; tone: string }[] = [
      { a: T.brasil - 0.05, b: T.ano - 0.2, top: "CELULOSE · BRASIL · 2025", big: `~${count(t, T.brasil + 0.2, T.ton + 1.0, 20, 30)} MILHÕES`, sub: "DE TONELADAS", tone: "#0b7a35" },
      { a: T.ano, b: T.mostra - 0.15, top: "CADA ESTAÇÃO", big: "ZEROU!", sub: "ACENDE O SEU FAROL", tone: "#0b7a35" },
      { a: T.mostra, b: T.end, top: "DO EUCALIPTO AO PAPEL", big: "ZEROU!", sub: "SEM JOGAR NADA FORA", tone: "#0b7a35" },
    ];
    return (
      <>
        {cards.map((c, i) => {
          const k = win(t, c.a, c.b, 0.22); if (k <= 0) return null;
          return (
            <div key={i} style={{ position: "absolute", left: 0, width: 1080, top: 330, display: "flex", justifyContent: "center", opacity: k, transform: `scale(${pop(t, c.a, 0.35) * (0.9 + 0.1 * k)})` }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 42px 16px", borderRadius: 54, background: c.tone, border: "6px solid #ffffff", boxShadow: "0 8px 0 #00000077" }}>
                <span style={{ fontFamily: FONT, fontSize: 44, color: "#d8ffe4", letterSpacing: 2 }}>{c.top}</span>
                <span style={{ fontFamily: FONT, fontSize: 108, color: "#ffffff", lineHeight: 1, ...stroke(7, "#05381a") }}>{c.big}</span>
                <span style={{ fontFamily: FONT, fontSize: 54, color: "#ffd400", lineHeight: 1.1, ...stroke(8, "#3a2300") }}>{c.sub}</span>
              </div>
            </div>
          );
        })}
      </>
    );
  },
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: COSTUMES.mep, HUD: hud, World, SFX, EXPOSURE: [], CUTS: CUTS10,
  ENV: { bg: "#7fb6ee", fog: "#d2e6fa", fogNear: 360, fogFar: 1000, hemiSky: "#e8f2ff", hemiGround: "#6aa84a", hemiI: 1.12, sun: "#fff1d8", sunI: 2.4 },
};
