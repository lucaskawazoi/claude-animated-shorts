// O obreiro de época (assinatura do canal ecos-del-tiempo): a mesma cabeça grande de brinquedo, bigode e LENÇO VERMELHO
// no pescoço em todo episódio; a roupa muda com a época (Costume). Braços com cotovelo; poses são só números.
import React from "react";
import { Box, Cone, Cyl, G, Sph, V3, lerp } from "./kit";

export type PoseName = "idle" | "point" | "alarm" | "think" | "cheer" | "present" | "pull" | "pour" | "read" | "belly" | "walk" | "chisel";
export type Prop = "jar" | "scroll" | "hammer" | "none";
type Arm = { rx: number; rz: number; el: number };
export type Pose = { l: Arm; r: Arm; hx: number; hy: number; hz: number; lean: number; hop: number };
const A = (rx: number, rz: number, el = 0): Arm => ({ rx, rz, el });

export const poseOf = (n: PoseName, t: number): Pose => {
  const s = Math.sin(t * 5.2), s2 = Math.sin(t * 9.5), s3 = Math.sin(t * 3.1);
  switch (n) {
    case "point": return { l: A(0.05, -0.12), r: A(-1.45 + s * 0.05, 0.28, -0.1), hx: 0, hy: -0.35, hz: 0, lean: 0.06, hop: 0 };
    case "present": return { l: A(-0.9, -0.5, -0.5), r: A(-0.9 + s * 0.04, 0.5, -0.5), hx: 0, hy: 0, hz: 0.04 * s3, lean: 0.0, hop: 0.02 * Math.abs(s) };
    case "alarm": return { l: A(0, -2.55 + s2 * 0.07, -0.2), r: A(0, 2.55 - s2 * 0.07, -0.2), hx: -0.18, hy: 0, hz: s2 * 0.05, lean: -0.05, hop: 0.07 * Math.abs(s2) };
    case "think": return { l: A(0.05, -0.1), r: A(-2.2, 0.35, -1.9), hx: 0.1, hy: 0.25, hz: -0.1, lean: 0, hop: 0 };
    case "cheer": return { l: A(0, -2.8 + s * 0.15, 0), r: A(0, 2.8 - s * 0.15, 0), hx: -0.2, hy: 0, hz: 0, lean: 0, hop: 0.18 * Math.abs(Math.sin(t * 6.5)) };
    case "pull": return { l: A(-1.25 + s * 0.12, -0.15, -0.35), r: A(-1.25 - s * 0.12, 0.15, -0.35), hx: -0.25, hy: 0, hz: 0, lean: 0.32, hop: 0.03 * Math.abs(s2) };
    case "pour": return { l: A(-1.1, -0.25, -0.6), r: A(-1.0, 0.25, -0.7), hx: 0.25, hy: 0, hz: 0, lean: 0, hop: 0 };
    case "read": return { l: A(-1.0, -0.35, -1.0), r: A(-1.0, 0.35, -1.0), hx: 0.3, hy: 0.05 * s3, hz: 0, lean: 0, hop: 0 };
    case "belly": return { l: A(-0.55, -0.1, -1.6), r: A(-0.55, 0.1, -1.6), hx: 0.15, hy: 0.15 * s3, hz: 0.06 * s, lean: 0, hop: 0.01 * Math.abs(s) };
    case "walk": return { l: A(0.5 * Math.sin(t * 8), -0.1), r: A(-0.5 * Math.sin(t * 8), 0.1), hx: 0, hy: 0, hz: 0, lean: 0.04, hop: 0.08 * Math.abs(Math.sin(t * 8)) };
    case "chisel": return { l: A(-0.9, -0.2, -0.6), r: A(-1.9 + 0.7 * Math.abs(Math.sin(t * 6)), 0.2, -0.5), hx: 0.35, hy: 0, hz: 0, lean: 0.15, hop: 0 };
    default: return { l: A(0.12 + s * 0.04, -0.12), r: A(0.12 - s * 0.04, 0.12), hx: 0, hy: 0.05 * s3, hz: 0, lean: 0, hop: 0.012 * Math.abs(s) };
  }
};
export const blendPose = (a: Pose, b: Pose, u: number): Pose => ({
  l: { rx: lerp(a.l.rx, b.l.rx, u), rz: lerp(a.l.rz, b.l.rz, u), el: lerp(a.l.el, b.l.el, u) },
  r: { rx: lerp(a.r.rx, b.r.rx, u), rz: lerp(a.r.rz, b.r.rz, u), el: lerp(a.r.el, b.r.el, u) },
  hx: lerp(a.hx, b.hx, u), hy: lerp(a.hy, b.hy, u), hz: lerp(a.hz, b.hz, u), lean: lerp(a.lean, b.lean, u), hop: lerp(a.hop, b.hop, u),
});

/** roupa da época. top = cor do tronco (= skin se nu), bottom = pernas, kilt = saiote/túnica curta, hat = chapéu */
export type Costume = { skin: string; top: string; bottom: string; kilt?: string; kiltLen?: number; hat: "helmet" | "cloth" | "cap" | "none" | "straw"; hatC: string; boot: string; belt?: string; sleeves?: boolean };
export const COSTUMES: Record<string, Costume> = {
  egypt: { skin: "#b9784b", top: "#b9784b", bottom: "#b9784b", kilt: "#f5f0dc", kiltLen: 0.42, hat: "cloth", hatC: "#f5f0dc", boot: "#8a5a32", belt: "#d4a64a" },
  rome: { skin: "#d39a6c", top: "#c8553d", bottom: "#d39a6c", kilt: "#c8553d", kiltLen: 0.4, hat: "none", hatC: "#000", boot: "#7a4a2a", belt: "#6b4423", sleeves: false },
  inca: { skin: "#a8673f", top: "#d23c3c", bottom: "#a8673f", kilt: "#d23c3c", kiltLen: 0.45, hat: "cap", hatC: "#f2c14e", boot: "#7a4a2a", belt: "#2f7fc0" },
  printer: { skin: "#e0aa82", top: "#f2ede0", bottom: "#3b4a6b", kilt: "#7a5c3e", kiltLen: 0.55, hat: "cap", hatC: "#3b3b3b", boot: "#3a2b24", sleeves: true },
  alejandria: { skin: "#c98a5b", top: "#f2ede0", bottom: "#c98a5b", kilt: "#f2ede0", kiltLen: 0.55, hat: "none", hatC: "#000", boot: "#8a5a32", belt: "#2f6fb0", sleeves: false },
  mason: { skin: "#e0aa82", top: "#6b8e4e", bottom: "#5a4632", kilt: "#6b8e4e", kiltLen: 0.5, hat: "cap", hatC: "#8a6a4a", boot: "#3a2b24", belt: "#3a2a20", sleeves: true },
  nabateo: { skin: "#b9784b", top: "#d9b98a", bottom: "#b9784b", kilt: "#8a3a2a", kiltLen: 0.6, hat: "cloth", hatC: "#f2e6c8", boot: "#7a4a2a", belt: "#2f6fb0", sleeves: true },
  marinero: { skin: "#d39a6c", top: "#f2ede0", bottom: "#2f4f7f", hat: "cap", hatC: "#c8352a", boot: "#3a2b24", belt: "#7a4a2a", sleeves: true },
  fraile: { skin: "#e0aa82", top: "#6b4a2a", bottom: "#6b4a2a", kilt: "#6b4a2a", kiltLen: 0.85, hat: "cloth", hatC: "#5a3a20", boot: "#3a2b24", belt: "#e8dcc0", sleeves: true },
  mercader: { skin: "#e0b07e", top: "#2f6fb0", bottom: "#2f6fb0", kilt: "#2f6fb0", kiltLen: 0.8, hat: "straw", hatC: "#d9b25a", boot: "#2a2420", belt: "#c8352a", sleeves: true },
  ming: { skin: "#e0b07e", top: "#2f5d8a", bottom: "#2a2f3a", hat: "straw", hatC: "#d9b25a", boot: "#2a2420", belt: "#7a4a2a", sleeves: true },
  general: { skin: "#e0b07e", top: "#b23a2a", bottom: "#3a2a20", kilt: "#8a2a1e", kiltLen: 0.5, hat: "helmet", hatC: "#6a6a6a", boot: "#2a2420", belt: "#d4a64a", sleeves: true },
  worker: { skin: "#c98a5b", top: "#ff7a1a", bottom: "#e86a10", hat: "helmet", hatC: "#ffd400", boot: "#3a2b24", sleeves: true },
};

const ArmPart: React.FC<{ side: 1 | -1; a: Arm; c: Costume; prop?: Prop; t: number }> = ({ side, a, c, prop, t }) => (
  <G p={[side * 0.37, 1.32, 0]} r={[a.rx, 0, a.rz]}>
    <Cyl rt={0.085} h={0.34} p={[0, -0.17, 0]} c={c.sleeves ? c.top : c.skin} seg={8} />
    <G p={[0, -0.34, 0]} r={[a.el * -1, 0, 0]}>
      <Cyl rt={0.075} h={0.3} p={[0, -0.15, 0]} c={c.skin} seg={8} />
      <Sph rad={0.095} p={[0, -0.32, 0]} c={c.skin} ws={10} hs={8} />
      {side === 1 && prop === "jar" ? (
        <G p={[-0.18, -0.42, 0.05]} r={[0, 0, 1.1 + 0.15 * Math.sin(t * 4)]}>
          <Sph rad={0.2} c="#c0703a" ws={10} hs={8} sc={[1, 1.2, 1]} /><Cyl rt={0.08} rb={0.11} h={0.16} p={[0, 0.26, 0]} c="#a85e2e" seg={8} />
        </G>) : null}
      {side === 1 && prop === "scroll" ? (
        <G p={[-0.37, -0.36, 0.12]} r={[0, 0, Math.PI / 2]}>
          <Cyl rt={0.07} h={0.78} c="#f1e3b5" seg={10} /><Box s={[0.6, 0.02, 0.42]} p={[0, 0.0, 0.2]} c="#f6ebc8" cast={false} />
        </G>) : null}
      {side === 1 && prop === "hammer" ? (
        <G p={[0, -0.38, 0.1]} r={[1.4, 0, 0]}><Cyl rt={0.03} h={0.5} p={[0, 0.2, 0]} c="#7a4a2a" seg={6} /><Box s={[0.22, 0.12, 0.12]} p={[0, 0.45, 0]} c="#8a8f94" /></G>) : null}
    </G>
  </G>
);

export const Worker: React.FC<{ p: V3; yaw?: number; pose: Pose; scale?: number; t: number; c?: Costume; prop?: Prop; mustache?: boolean }> = ({ p, yaw = 0, pose, scale = 1, t, c = COSTUMES.worker, prop = "none", mustache = true }) => (
  <G p={[p[0], p[1] + pose.hop * scale, p[2]]} r={[0, yaw, 0]} sc={Math.max(scale, 0.001)} vis={scale > 0}>
    <G r={[pose.lean, 0, 0]}>
      {/* pernas e pés */}
      <Cyl rt={0.11} h={0.62} p={[-0.14, 0.45, 0]} c={c.bottom} seg={8} /><Cyl rt={0.11} h={0.62} p={[0.14, 0.45, 0]} c={c.bottom} seg={8} />
      <Box s={[0.2, 0.12, 0.32]} p={[-0.14, 0.06, 0.05]} c={c.boot} /><Box s={[0.2, 0.12, 0.32]} p={[0.14, 0.06, 0.05]} c={c.boot} />
      {/* tronco */}
      <Cyl rt={0.3} rb={0.27} h={0.72} p={[0, 1.02, 0]} c={c.top} seg={12} />
      {c.kilt ? <Cyl rt={0.31} rb={0.42} h={c.kiltLen ?? 0.4} p={[0, 0.86 - (c.kiltLen ?? 0.4) / 2 + 0.06, 0]} c={c.kilt} seg={12} /> : null}
      {c.belt ? <Cyl rt={0.315} h={0.08} p={[0, 0.9, 0]} c={c.belt} seg={12} /> : null}
      {c.hat === "helmet" ? <><Cyl rt={0.305} h={0.07} p={[0, 1.0, 0]} c="#fff3c4" seg={12} /><Cyl rt={0.292} h={0.07} p={[0, 1.18, 0]} c="#fff3c4" seg={12} /></> : null}
      {/* LENÇO VERMELHO: a marca do personagem em todas as épocas */}
      <Cyl rt={0.2} rb={0.27} h={0.12} p={[0, 1.4, 0]} c="#e0262b" seg={12} cast={false} />
      <Cone rad={0.16} h={0.26} seg={3} p={[0, 1.26, 0.2]} r={[Math.PI + 0.25, 0, 0]} c="#e0262b" cast={false} />
      <ArmPart side={-1} a={pose.l} c={c} t={t} /><ArmPart side={1} a={pose.r} c={c} prop={prop} t={t} />
      {/* cabeça */}
      <G p={[0, 1.55, 0]} r={[pose.hx, pose.hy, pose.hz]}>
        <Sph rad={0.31} c={c.skin} ws={16} hs={12} p={[0, 0.2, 0]} />
        <Sph rad={0.045} c="#1c1410" p={[-0.12, 0.22, 0.27]} ws={8} hs={6} /><Sph rad={0.045} c="#1c1410" p={[0.12, 0.22, 0.27]} ws={8} hs={6} />
        <Sph rad={0.018} c="#ffffff" p={[-0.105, 0.24, 0.305]} ws={6} hs={4} cast={false} /><Sph rad={0.018} c="#ffffff" p={[0.135, 0.24, 0.305]} ws={6} hs={4} cast={false} />
        {mustache ? <Box s={[0.26, 0.07, 0.07]} p={[0, 0.1, 0.29]} c="#2a1a12" cast={false} /> : null}
        <Sph rad={0.055} c="#8a4a35" p={[0, 0.17, 0.3]} ws={8} hs={6} cast={false} />
        {c.hat === "helmet" ? <>
          <Sph rad={0.365} c={c.hatC} ps={0} pl={Math.PI * 0.52} p={[0, 0.27, 0]} ws={16} hs={10} o={{ rough: 0.35 }} />
          <Cyl rt={0.4} h={0.035} p={[0, 0.275, 0]} c={c.hatC} seg={18} o={{ rough: 0.35 }} /></> : null}
        {c.hat === "cloth" ? <>
          <Sph rad={0.33} c={c.hatC} ps={0} pl={Math.PI * 0.5} p={[0, 0.25, -0.01]} ws={16} hs={8} />
          <Box s={[0.66, 0.42, 0.22]} p={[0, 0.06, -0.2]} c={c.hatC} r={[0.15, 0, 0]} />
          <Cyl rt={0.335} h={0.05} p={[0, 0.27, 0]} c="#2f6fb0" seg={16} cast={false} /></> : null}
        {c.hat === "cap" ? <Sph rad={0.33} c={c.hatC} ps={0} pl={Math.PI * 0.42} p={[0, 0.27, 0]} ws={16} hs={8} /> : null}
        {c.hat === "straw" ? <><Cyl rt={0.55} h={0.04} p={[0, 0.36, 0]} c={c.hatC} seg={18} /><Cyl rt={0.26} rb={0.3} h={0.22} p={[0, 0.47, 0]} c={c.hatC} seg={14} /></> : null}
        {c.hat === "none" ? <Sph rad={0.32} c="#2a1a12" ps={0} pl={Math.PI * 0.38} p={[0, 0.22, -0.03]} ws={14} hs={8} /> : null}
      </G>
    </G>
  </G>
);

/** multidão barata: o mesmo boneco sem bigode, fase própria, para equipes de puxar/caminhar */
export const Crowd: React.FC<{ list: { p: V3; yaw: number; pose: PoseName; ph: number }[]; t: number; c: Costume; scale?: number; vis?: boolean }> = ({ list, t, c, scale = 1, vis = true }) =>
  !vis ? null : <G>{list.map((m, i) => <Worker key={i} p={m.p} yaw={m.yaw} pose={poseOf(m.pose, t + m.ph)} t={t + m.ph} c={c} scale={scale} mustache={i % 3 === 0} />)}</G>;
