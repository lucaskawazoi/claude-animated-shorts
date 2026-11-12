// E3 — El Coliseo (ecos-del-tiempo, Shorts). Câmera, operário, painel e luz deste episódio.
import React from "react";
import { K, Shot } from "../../toy/cam";
import { CUTS, WINS } from "../../toy/cues";
import type { Episode } from "../../toy/episode";
import { FONT, HudData, count, pop, stroke, win } from "../../toy/hud";
import { V3 } from "../../toy/kit";
import type { WorkerState } from "../../toy/story";
import { COSTUMES } from "../../toy/worker";
import { SFX, T } from "./cues";
import { World } from "./world";
import { EXPOSURE } from "./exposure";

const [C1, C2, C3, C4, C5, C6, C7] = CUTS;
const W3 = WINS[3], W6 = WINS[6], W10 = WINS[10];

const SHOTS: Shot[] = [
  { name: "gancho: o Coliseu cheio → ⏪ ano 70", t0: 0, keys: [
    K(0, [26.0, 22.0, 30.0], [0.0, 5.0, 0.0], 58, 3), K(T.puertas, [10.0, 6.0, 30.0], [0.0, 6.0, 0.0], 62, -2),
    K(T.roma, [-8.0, 14.0, 32.0], [0.0, 3.0, 0.0], 62, 2), K(C1 - 0.05, [-14.0, 10.0, 28.0], [0.0, 1.0, -6.0], 60, 0)] },
  { name: "lago de Nero", t0: C1, keys: [
    K(C1, [1.5, 2.6, -9.0], [-0.5, 2.8, -15.0], 60, 2), K(T.nero - 0.4, [2.5, 3.6, -6.0], [0.0, 2.4, -15.0], 60, -1), K(T.lago, [3.0, 5.0, 23.0], [0.0, 1.5, -8.0], 60, -1),
    K(T.p1, [9.0, 3.6, 18.0], [3.0, 0.6, 7.0], 54, 2), K(T.b1, [9.5, 4.0, 19.0], [3.0, 1.0, 5.0], 56, 0), K(C2 - 0.05, [10.0, 4.5, 19.5], [3.0, 1.0, 5.0], 56, 1)] },
  { name: "esvazia o lago → anel de concreto", t0: C2, keys: [
    K(C2, [-6.0, 2.2, 9.0], [0.0, 0.2, 0.0], 50, -3), K(W3, [-5.6, 2.6, 9.4], [0.0, 0.2, 0.0], 50, -2),
    K(W3 + 0.6, [18.0, 20.0, 26.0], [0.0, 0.0, 0.0], 60, 4), K(T.doce, [16.0, 18.0, 24.0], [0.0, 0.0, 0.0], 60, 0),
    K(T.cimientos, [12.0, 16.0, 22.0], [0.0, 0.5, 0.0], 58, 1), K(T.p2, [10.0, 12.0, 22.0], [0.0, 1.0, 0.0], 60, -1), K(C3 - 0.05, [8.0, 11.0, 22.0], [0.0, 1.0, 0.0], 60, 0)] },
  { name: "pilares e arcos sobem", t0: C3, keys: [
    K(C3, [30.0, 8.0, 28.0], [0.0, 5.0, 0.0], 58, 1), K(T.arcos, [26.0, 10.0, 30.0], [0.0, 6.0, 0.0], 60, 0),
    K(T.reparten + 1.5, [20.0, 6.0, 30.0], [0.0, 6.0, 0.0], 62, -1), K(C4 - 0.05, [16.0, 5.0, 30.0], [0.0, 6.0, 0.0], 62, 0)] },
  { name: "atasco na porta → 76 portas", t0: C4, keys: [
    K(C4, [5.0, 3.0, 23.0], [0.0, 1.2, 12.0], 56, 2), K(T.b3, [6.0, 4.0, 24.0], [0.0, 1.5, 11.0], 58, -1),
    K(T.c3, [14.0, 8.0, 28.0], [0.0, 3.0, 0.0], 60, 1), K(W6, [17.0, 9.0, 28.0], [0.0, 4.0, 0.0], 60, 0), K(C5 - 0.02, [18.0, 9.0, 28.0], [0.0, 4.0, 0.0], 60, 0)] },
  { name: "arquibancada enche → sol → velário → inauguração", t0: C5, keys: [
    K(C5, [1.0, 14.0, 6.5], [-3.0, 5.0, -4.0], 62, -2), K(T.vomitorios, [0.0, 14.5, 5.5], [-3.0, 6.0, -4.0], 62, 1),
    K(T.p4, [4.0, 17.0, 8.0], [0.0, 10.0, -2.0], 64, 0), K(T.toldo, [18.0, 22.0, 22.0], [0.0, 12.0, 0.0], 60, 2),
    K(T.marineros, [14.0, 15.5, 16.0], [6.0, 13.0, -4.0], 58, -1), K(T.esteVelario, [22.0, 24.0, 26.0], [0.0, 12.0, 0.0], 60, 1),
    K(C6 - 0.05, [26.0, 18.0, 30.0], [0.0, 8.0, 0.0], 60, 0)] },
  { name: "arena → Domiciano escava", t0: C6, keys: [
    K(C6, [0.5, 42.0, 5.0], [0.0, 0.0, 0.0], 60, 0), K(T.cienDias, [1.0, 36.0, 6.0], [0.0, 0.0, 0.0], 60, 2), K(T.b5, [1.0, 12.0, 6.0], [0.0, 1.4, 0.0], 58, -1),
    K(T.domiciano, [2.0, 7.0, 4.0], [0.0, 0.6, 0.6], 58, 1), K(C7 - 0.05, [2.0, 6.6, 3.8], [0.0, 0.6, 0.8], 58, 0)] },
  { name: "elevador e leão → hoje: ruína", t0: C7, keys: [
    K(C7, [2.6, 3.4, 5.2], [0.0, 1.2, 1.6], 54, 2), K(T.hipogeo, [3.0, 4.8, 5.8], [-0.5, 1.0, 0.8], 58, -1), K(T.hoy - 0.45, [3.2, 5.0, 6.0], [-0.5, 1.0, 0.8], 58, 0), K(T.hoy - 0.1, [3.0, 16.0, 7.0], [0.0, 2.0, 0.0], 60, 0),
    K(T.hoy + 0.5, [24.0, 14.0, 30.0], [0.0, 6.0, 0.0], 60, 1), K(T.terremotos, [26.0, 12.0, 28.0], [0.0, 6.0, 0.0], 60, -2),
    K(W10, [20.0, 10.0, 31.0], [0.0, 6.0, 0.0], 62, 0), K(W10 + 0.7, [-6.0, 8.0, 34.0], [0.0, 6.0, 0.0], 62, 0), K(T.end, [-10.0, 8.0, 33.0], [0.0, 6.0, 0.0], 62, 0)] },
];
const DYN = [4.2, 0.7, 5.0, 2.4, 0.15, 0.3, 3.6, 3.8, 0.3, 1.3, 0.08];

const S = (p: V3, yaw: number, pose: WorkerState["pose"], o: Partial<WorkerState> = {}): WorkerState => ({ p, yaw, pose, ...o });
const WORKER: [number, WorkerState][] = [
  [0, S([4.0, 0, 17.0], 0.3, "present", { scale: 0 })],
  [C1, S([4.5, 0, 14.5], 0.4, "present")],
  [T.nero, S([4.5, 0, 14.5], -0.3, "point")],
  [T.p1, S([4.5, 0, 14.5], 0.3, "alarm")],
  [T.b1, S([4.5, 0, 14.5], 0.3, "cheer")],
  [C3, S([16.0, 0, 18.0], 0.6, "present")],
  [T.reparten + 1.2, S([16.0, 0, 18.0], 0.6, "cheer")],
  [C4, S([2.6, 0, 15.2], 0.2, "alarm")],
  [T.b3, S([2.6, 0, 15.2], 0.2, "think")],
  [T.setenta, S([2.6, 0, 15.2], -0.5, "point")],
  [C5, S([-8.8, 12.0, 5.6], 0.9, "present")],
  [T.p4, S([-8.8, 12.0, 5.6], 0.9, "alarm")],
  [T.b4, S([-8.8, 12.0, 5.6], 0.9, "cheer")],
  [C6, S([-1.6, 1.4, -1.0], 0.2, "present")],
  [T.p5, S([-1.6, 1.4, -1.0], 0.2, "think")],
  [T.domiciano, S([-2.6, 1.4, -1.6], 0.5, "point")],
  [C7, S([-3.0, 0.05, 1.0], 0.9, "point")],
  [T.suben + 0.4, S([-3.0, 0.05, 1.0], 0.9, "cheer")],
  [T.hoy, S([6.0, 0, 15.5], 0.2, "present")],
  [T.sigue, S([6.0, 0, 15.5], 0.2, "cheer")],
];

const hud: HudData = {
  pills: [
    { a: T.espect, b: T.roma - 0.15, label: "ESPECTADORES", value: (t) => count(t, T.espect, T.espect + 1.2, 0, 50000), y: 440 },
    { a: T.diez, b: T.roma - 0.15, label: "OBRA", value: () => "< 10 AÑOS", y: 550, tone: "gold" },
    { a: T.puertas, b: T.roma - 0.15, label: "PUERTAS", value: () => "80", y: 660 },
    { a: T.roma, b: T.nohay - 0.1, label: "AÑO", value: () => "70 d.C.", y: 440, tone: "gold" },
    { a: T.nohay, b: T.vespasiano - 0.1, label: "MOTORES", value: () => "0", y: 440, tone: "red" },
    { a: T.doce, b: T.cimientos + 1.2, label: "CIMIENTOS", value: () => "12 m", y: 440 },
    { a: T.cien, b: T.b2 - 0.1, label: "PIEDRA", value: (t) => `${count(t, T.cien, T.cien + 0.8, 0, 100000)} m³`, y: 440, tone: "red" },
    { a: T.atasco, b: T.b3 - 0.1, label: "PERSONAS", value: () => "50.000 A LA VEZ", y: 440, tone: "red" },
    { a: T.setenta, b: T.vomitorios, label: "PUERTAS NUMERADAS", value: (t) => count(t, T.setenta, T.ficha, 0, 76), y: 440, tone: "green" },
    { a: T.p4 + 0.3, b: T.b4 - 0.1, label: "SOL", value: () => "QUEMA", y: 440, tone: "red" },
    { a: T.cienDias, b: T.p5 - 0.1, label: "JUEGOS", value: (t) => `${count(t, T.cienDias, T.cienDias + 0.8, 0, 100)} DÍAS`, y: 440, tone: "gold" },
    { a: T.monta, b: T.hipogeo, label: "MONTACARGAS", value: () => "A MANO", y: 440 },
    { a: T.hoy + 0.2, b: T.sigue - 0.1, label: "FACHADA", value: () => "FALTA +50%", y: 440, tone: "red" },
  ],
  titles: [
    { a: T.cimientos, text: "CIMIENTOS" }, { a: T.reparten + 1.2, text: "ARCOS" }, { a: T.vomitorios, text: "VOMITORIOS" },
    { a: T.esteVelario, text: "VELARIO" }, { a: T.inaugura, text: "¡INAUGURADO!", len: 1.9 }, { a: T.hipogeo, text: "HIPOGEO" },
  ],
  alerts: [T.p1, T.p2, T.p3, T.p4, T.p5],
  rewinds: [T.roma, T.b2, T.b3, T.b4, T.b5],
  crosses: [[T.atasco, T.b3 - 0.1]],
  stamps: [[T.b1, T.c1, "SIN BOMBAS A MOTOR"], [T.b2, T.c2, "SIN VIGAS DE ACERO"], [T.b3, T.c3, "SIN ALTAVOCES"], [T.b4, T.c4, "SIN TECHO"], [T.b5, T.c5, "SIN MAGIA"]],
  reward: { a: T.sigue, len: T.end - T.sigue, top: "EN PIE DESDE EL AÑO 80", big: (t) => `${count(t, T.sigue, T.sigue + 1.3, 0, 1946)} AÑOS`, sub: "SIN UN SOLO MOTOR" },
  Extra: ({ t }) => (
    <>
      {/* a tessera: a ficha com o número da tua porta */}
      {win(t, T.ficha, T.vomitorios + 0.5, 0.2) > 0 ? (
        <div style={{ position: "absolute", left: 0, width: 1080, top: 800, display: "flex", justifyContent: "center", opacity: win(t, T.ficha, T.vomitorios + 0.5, 0.2), transform: `rotate(-4deg) scale(${pop(t, T.ficha, 0.3)})` }}>
          <div style={{ padding: "18px 48px", borderRadius: 36, background: "#c98a5a", border: "8px solid #6b3f22", boxShadow: "0 10px 0 #00000055", textAlign: "center" }}>
            <div style={{ fontFamily: FONT, fontSize: 40, color: "#3a2010" }}>TU FICHA</div>
            <div style={{ fontFamily: FONT, fontSize: 92, color: "#fff4dc", lineHeight: 1, ...stroke(8, "#3a2010") }}>PUERTA LII</div>
          </div>
        </div>) : null}
    </>
  ),
};

export const EP: Episode = {
  SHOTS, DYN, WORKER, COSTUME: { ...COSTUMES.rome, top: "#7a4fb0", kilt: "#7a4fb0" }, HUD: hud, World, SFX, EXPOSURE,
  ENV: { bg: "#9fd0ff", fog: "#eef3fa", fogNear: 140, fogFar: 560, hemiSky: "#f3f7ff", hemiGround: "#9fcf6a", hemiI: 1.2, sun: "#fff2d6", sunI: 2.6 },
};
