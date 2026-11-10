// O operário recorrente (nosso, não o da referência): macacão laranja com faixas, capacete amarelo, bigode, cabeça grande de brinquedo.
// Braços com cotovelo; as poses são só números, o quadro escolhe e mistura.
import React from "react";
import { Box, Cyl, G, Sph, V3, lerp } from "./kit";

export type PoseName = "idle" | "point" | "alarm" | "think" | "cheer" | "nose" | "wave" | "present";
type Arm = { rx: number; rz: number; el: number };
type Pose = { l: Arm; r: Arm; hx: number; hy: number; hz: number; lean: number; hop: number };
const A = (rx: number, rz: number, el = 0): Arm => ({ rx, rz, el });

export const poseOf = (n: PoseName, t: number): Pose => {
  const s = Math.sin(t * 5.2), s2 = Math.sin(t * 9.5), s3 = Math.sin(t * 3.1);
  switch (n) {
    case "point": return { l: A(0.05, -0.12), r: A(-1.45 + s * 0.05, 0.28, -0.1), hx: 0, hy: -0.35, hz: 0, lean: 0.06, hop: 0 };
    case "present": return { l: A(-0.9, -0.5, -0.5), r: A(-0.9 + s * 0.04, 0.5, -0.5), hx: 0, hy: 0, hz: 0.04 * s3, lean: 0.0, hop: 0.02 * Math.abs(s) };
    case "alarm": return { l: A(0, -2.55 + s2 * 0.07, -0.2), r: A(0, 2.55 - s2 * 0.07, -0.2), hx: -0.18, hy: 0, hz: s2 * 0.05, lean: -0.05, hop: 0.07 * Math.abs(s2) };
    case "think": return { l: A(0.05, -0.1), r: A(-2.2, 0.35, -1.9), hx: 0.1, hy: 0.25, hz: -0.1, lean: 0, hop: 0 };
    case "cheer": return { l: A(0, -2.8 + s * 0.15, 0), r: A(0, 2.8 - s * 0.15, 0), hx: -0.2, hy: 0, hz: 0, lean: 0, hop: 0.18 * Math.abs(Math.sin(t * 6.5)) };
    case "nose": return { l: A(0.05, -0.1), r: A(-2.0, 0.1, -2.0), hx: -0.12, hy: 0.0, hz: 0.12, lean: -0.08, hop: 0.015 * s2 };
    case "wave": return { l: A(0.05, -0.1), r: A(0, 2.4, -0.5 + Math.sin(t * 9) * 0.5), hx: 0, hy: 0.1, hz: 0, lean: 0, hop: 0.02 * Math.abs(s) };
    default: return { l: A(0.12 + s * 0.04, -0.12), r: A(0.12 - s * 0.04, 0.12), hx: 0, hy: 0.05 * s3, hz: 0, lean: 0, hop: 0.012 * Math.abs(s) };
  }
};
export const blendPose = (a: Pose, b: Pose, u: number): Pose => ({
  l: { rx: lerp(a.l.rx, b.l.rx, u), rz: lerp(a.l.rz, b.l.rz, u), el: lerp(a.l.el, b.l.el, u) },
  r: { rx: lerp(a.r.rx, b.r.rx, u), rz: lerp(a.r.rz, b.r.rz, u), el: lerp(a.r.el, b.r.el, u) },
  hx: lerp(a.hx, b.hx, u), hy: lerp(a.hy, b.hy, u), hz: lerp(a.hz, b.hz, u), lean: lerp(a.lean, b.lean, u), hop: lerp(a.hop, b.hop, u),
});

const SUIT = "#ff7a1a", STRIPE = "#fff3c4", SKIN = "#c98a5b", HAT = "#ffd400", BOOT = "#3a2b24", PANT = "#e86a10";

const ArmPart: React.FC<{ side: 1 | -1; a: Arm }> = ({ side, a }) => (
  <G p={[side * 0.37, 1.32, 0]} r={[a.rx, 0, a.rz]}>
    <Cyl rt={0.085} h={0.34} p={[0, -0.17, 0]} c={SUIT} seg={8} />
    <G p={[0, -0.34, 0]} r={[a.el * -1, 0, 0]}>
      <Cyl rt={0.075} h={0.3} p={[0, -0.15, 0]} c={SUIT} seg={8} />
      <Sph rad={0.095} p={[0, -0.32, 0]} c={SKIN} ws={10} hs={8} />
    </G>
  </G>
);

export const Worker: React.FC<{ p: V3; yaw?: number; pose: Pose; scale?: number; t: number }> = ({ p, yaw = 0, pose, scale = 1, t }) => (
  <G p={[p[0], p[1] + pose.hop * scale, p[2]]} r={[0, yaw, pose.lean]} sc={scale}>
    {/* pernas e botas */}
    <Cyl rt={0.11} h={0.62} p={[-0.14, 0.45, 0]} c={PANT} seg={8} /><Cyl rt={0.11} h={0.62} p={[0.14, 0.45, 0]} c={PANT} seg={8} />
    <Box s={[0.2, 0.14, 0.32]} p={[-0.14, 0.07, 0.05]} c={BOOT} /><Box s={[0.2, 0.14, 0.32]} p={[0.14, 0.07, 0.05]} c={BOOT} />
    {/* tronco com faixas refletivas */}
    <Cyl rt={0.3} rb={0.27} h={0.72} p={[0, 1.02, 0]} c={SUIT} seg={12} />
    <Cyl rt={0.305} rb={0.305} h={0.07} p={[0, 1.0, 0]} c={STRIPE} seg={12} o={{ rough: 0.4 }} />
    <Cyl rt={0.292} rb={0.292} h={0.07} p={[0, 1.18, 0]} c={STRIPE} seg={12} o={{ rough: 0.4 }} />
    <ArmPart side={-1} a={pose.l} /><ArmPart side={1} a={pose.r} />
    {/* cabeça */}
    <G p={[0, 1.55, 0]} r={[pose.hx, pose.hy, pose.hz]}>
      <Sph rad={0.31} c={SKIN} ws={16} hs={12} p={[0, 0.2, 0]} />
      <Sph rad={0.045} c="#1c1410" p={[-0.12, 0.22, 0.27]} ws={8} hs={6} /><Sph rad={0.045} c="#1c1410" p={[0.12, 0.22, 0.27]} ws={8} hs={6} />
      <Sph rad={0.018} c="#ffffff" p={[-0.105, 0.24, 0.305]} ws={6} hs={4} cast={false} /><Sph rad={0.018} c="#ffffff" p={[0.135, 0.24, 0.305]} ws={6} hs={4} cast={false} />
      <Box s={[0.26, 0.07, 0.07]} p={[0, 0.1, 0.29]} c="#2a1a12" cast={false} />
      <Sph rad={0.055} c="#a85d45" p={[0, 0.17, 0.3]} ws={8} hs={6} cast={false} />
      {/* capacete */}
      <Sph rad={0.365} c={HAT} ps={0} pl={Math.PI * 0.52} p={[0, 0.27, 0]} ws={16} hs={10} o={{ rough: 0.35 }} />
      <Cyl rt={0.4} h={0.035} p={[0, 0.275, 0]} c={HAT} seg={18} o={{ rough: 0.35 }} />
      <Box s={[0.12, 0.035, 0.46]} p={[0, 0.62, 0]} c="#e8b800" />
    </G>
  </G>
);
