// Mundo do E9: Petra de brinquedo. O Siq (desfiladeiro) corre em x de -50 a 0 (largura 5, z ±2,5); abre-se na praça do
// Tesouro (x 0..14) e a fachada está esculpida na falésia leste (face em x=16). O uádi chega pelo sul até a entrada do Siq
// (x=-50); a represa fecha o Siq e o túnel atravessa o maciço norte. Canal na parede sul, tubos de barro na norte,
// decantador no chão do Siq (x=-24), cisternas na falésia sul da praça, cidade ao sul (z 18..50).
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Pipe, Sph, V3, clamp, ease, fract, lerp, mat, rnd, pipeXf } from "../../toy/kit";
import { Clouds, Puffs, Sky } from "../../toy/scenery";
import { COSTUMES, Crowd, PoseName, Worker, poseOf } from "../../toy/worker";
import { T } from "./cues";

const PI = Math.PI;
export const built = (t: number) => t < T.petra - 0.12;
const SAND = "#e8c48a", R1 = "#cf7a62", R2 = "#c06a54", R3 = "#e09476", WATER = "#3f9ad8", MUD = "#a8784a";
const STRATA = ["#f0b890", "#a85040", "#e8c0a0", "#b8604a"];
const quake = (t: number) => (t > T.terremoto - 0.2 && t < T.suagua ? 1 - ease(t, T.rompio + 0.5, T.suagua) : 0);

// ---------------------------------------------------------------- falésias
const Cliffs: React.FC = () => {
  const segs = useMemo(() => {
    const out: { p: V3; s: V3; c: string }[] = [];
    for (let i = 0; i < 26; i++) for (const sd of [-1, 1]) { const x = -50 + i * 2 + 1, h = lerp(14, 22, rnd(i * 7 + (sd > 0 ? 1 : 2))), w = lerp(5, 7, rnd(i * 3 + sd)); out.push({ p: [x, h / 2, sd * (2.5 + w / 2 + (rnd(i + sd * 9) - 0.5) * 0.4)], s: [2.3, h, w], c: [R1, R2, R3][(i + (sd > 0 ? 0 : 1)) % 3] }); }
    return out;
  }, []);
  return (
    <G>
      {segs.map((q, i) => <Box key={i} s={q.s} p={q.p} c={q.c} />)}
      {/* estratos do arenito na face de dentro do Siq: textura que a régua (e o olho) usa para ver o movimento */}
      {segs.map((q, i) => { const sd = q.p[2] > 0 ? 1 : -1, zf = q.p[2] - sd * (q.s[2] / 2 + 0.03); return [0.18, 0.34, 0.52, 0.71, 0.86].map((f, j) => <Box key={i + "-" + j} s={[2.34, 0.28 + 0.25 * rnd(i * 5 + j), 0.06]} p={[q.p[0], q.s[1] * f, zf]} c={STRATA[(i + j) % 4]} cast={false} />); })}
      {[0.2, 0.4, 0.6, 0.8].map((f, j) => <Box key={"n" + j} s={[16.1, 0.5, 0.06]} p={[7, 22 * f, -9.97]} c={STRATA[j % 4]} cast={false} />)}
      {[0.25, 0.5, 0.75].map((f, j) => <Box key={"c" + j} s={[12.1, 0.45, 0.06]} p={[3, 14 * f + 4.5, 6.96]} c={STRATA[(j + 1) % 4]} cast={false} vis={false} />)}
      {/* maciços em volta da praça; falésia leste com a fachada */}
      <Box s={[14, 28, 30]} p={[23, 14, 0]} c={R1} />
      <Box s={[16, 22, 12]} p={[7, 11, -16]} c={R2} />
      <Box s={[12, 14, 10]} p={[3, 7, 12]} c={R3} /><Box s={[8, 16, 10]} p={[16, 8, 13]} c={R2} />
      <Box s={[22, 18, 28]} p={[-61, 9, -17]} c={R2} />
      {[[-30, -36, 18, 20], [-6, -38, 22, 24], [30, -30, 20, 26], [50, 10, 18, 22], [-80, 0, 20, 18], [40, 60, 24, 20], [-30, 50, 20, 18]].map(([x, z, r, h], i) => <Cone key={i} rad={r} h={h} seg={7} p={[x, h / 2, z]} c={[R1, R2, R3][i % 3]} o={{ flat: true }} />)}
    </G>
  );
};
const Ground: React.FC = () => (
  <G>
    <mesh rotation={[-PI / 2, 0, 0]} receiveShadow material={mat(SAND)}><planeGeometry args={[600, 600]} /></mesh>
    {/* leito seco do uádi chegando pelo sul */}
    <mesh position={[-51, 0.02, 24]} rotation={[-PI / 2, 0, 0]} material={mat("#d9b27a")}><planeGeometry args={[6, 50]} /></mesh>
    <mesh position={[-24, 0.02, 0]} rotation={[-PI / 2, 0, 0]} material={mat("#dcb683")}><planeGeometry args={[52, 5]} /></mesh>
  </G>
);

// ---------------------------------------------------------------- água: faixa que cresce por um caminho, com espuma na frente
const len = (pts: V3[]) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[2] - pts[i][2]), 0);
const Flow: React.FC<{ pts: V3[]; u: number; w: number; c?: string; foam?: boolean; y?: number }> = ({ pts, u, w, c = WATER, foam = true, y = 0.25 }) => {
  if (u <= 0.005) return null;
  const L = len(pts) * u; let acc = 0; const out: React.ReactNode[] = []; let head: V3 | null = null;
  for (let i = 0; i < pts.length - 1 && acc < L; i++) {
    const a = pts[i], b0 = pts[i + 1], sl = Math.hypot(b0[0] - a[0], b0[2] - a[2]), k = Math.min(1, (L - acc) / sl);
    const b: V3 = [lerp(a[0], b0[0], k), 0, lerp(a[2], b0[2], k)], m: V3 = [(a[0] + b[0]) / 2, y, (a[2] + b[2]) / 2];
    const yaw = -Math.atan2(b[2] - a[2], b[0] - a[0]);
    out.push(<Box key={i} s={[sl * k + w * 0.5, 0.3, w]} p={m} r={[0, yaw, 0]} c={c} o={{ rough: 0.25, emissive: "#3a2410", ei: 0.4 }} />);
    out.push(<G key={"f" + i} p={[a[0], y + 0.17, a[2]]} r={[0, yaw, 0]}>{Array.from({ length: Math.max(2, Math.floor(sl * k / 2)) }, (_, j) => <Box key={j} s={[0.9, 0.06, w * (0.3 + 0.4 * rnd(j + i))]} p={[fract(j * 0.37 + i * 0.13 + 0.0) * sl * k, 0, (rnd(j * 3 + i) - 0.5) * w * 0.5]} c="#f4ecdc" cast={false} />)}</G>);
    head = b; acc += sl;
  }
  return <G>{out}{foam && head && u < 0.995 ? <Sph rad={w * 0.55} p={[head[0], y + 0.3, head[2]]} sc={[1, 0.6, 1]} c="#f4fbff" ws={10} hs={6} /> : null}</G>;
};
const FLOOD1: V3[] = [[-51, 0, 30], [-51, 0, 4], [-48, 0, 0], [0, 0, 0], [8, 0, 2]];
const FLOOD2: V3[] = [[-51, 0, 30], [-51, 0, 6], [-55, 0, -2], [-55, 0, -32], [-50, 0, -42]];
const Floods: React.FC<{ t: number }> = ({ t }) => {
  const u1 = ease(t, T.agua1 - 0.2, T.arrasa + 0.2) * (1 - ease(t, T.b1, T.presa)), u2 = ease(t, T.manda - 0.3, T.camino + 0.6) * (1 - ease(t, T.pierde - 0.3, T.b2));
  const dry = ease(t, T.p2 + 0.2, T.pierde + 0.4);
  return (
    <G>
      <Flow pts={FLOOD1} u={u1} w={4.4} c="#a8804e" />
      {u1 > 0.3 ? Array.from({ length: 6 }, (_, i) => { const x = lerp(-48, 4, clamp(u1 * 1.1 - i * 0.06)); return <Box key={i} s={[0.8, 0.4, 0.5]} p={[x - i * 0.8, 0.6 + 0.3 * Math.sin(t * 6 + i), (rnd(i) - 0.5) * 3]} r={[t * 2 + i, i, t]} c="#7a4a2a" />; }) : null}
      <Flow pts={FLOOD2} u={u2} w={3.2} c="#a8804e" />
      {/* a água que se perde no deserto: poça que encolhe */}
      {t > T.p2 - 0.3 && t < T.b2 + 0.4 ? <Sph rad={6} p={[-50, 0.02, -44]} sc={[1.5 * (1 - dry) + 0.01, 0.04, 1.2 * (1 - dry) + 0.01]} c="#8a6a48" ws={16} hs={4} cast={false} /> : null}
    </G>
  );
};
/** represa na boca do Siq e o túnel no maciço norte */
const Dam: React.FC<{ t: number }> = ({ t }) => {
  const k = built(t) ? 1 : ease(t, T.presa - 0.2, T.presa + 0.6), tk = built(t) ? 1 : ease(t, T.tunel - 0.2, T.noventa + 0.4);
  return (
    <G>
      {k > 0.01 ? <Box s={[1.6, 3.2 * k, 6.2]} p={[-48.5, 1.6 * k, 0]} c="#a85848" /> : null}
      {tk > 0.01 ? <G>
        <Box s={[4.6 * tk, 4.6 * tk, 0.2]} p={[-55, 2.3 * tk, -2.85]} c="#2a1a14" cast={false} />
        <Box s={[4.6 * tk, 4.6 * tk, 0.2]} p={[-55, 2.3 * tk, -31.15]} c="#2a1a14" cast={false} />
      </G> : null}
    </G>
  );
};
/** canal escavado na parede sul + tubos de barro cozido na parede norte; água corre para a cidade */
const Channels: React.FC<{ t: number }> = ({ t }) => {
  const ck = built(t) ? 1 : ease(t, T.canales - 0.2, T.canales + 1.2), pk = built(t) ? 1 : ease(t, T.tubos - 0.2, T.tubos + 1.0);
  const flow = built(t) ? 1 : ease(t, T.llevan - 0.3, T.ciudad + 0.6), muddy = ease(t, T.p3, T.arena) * (1 - ease(t, T.limpia - 0.3, T.limpia + 0.4)), broke = ease(t, T.rompio, T.suagua);
  const wc = muddy > 0.5 ? MUD : WATER, L = 54;
  return (
    <G>
      {ck > 0.01 ? <G>
        <Box s={[L * ck, 0.6, 0.7]} p={[-50 + (L * ck) / 2, 1.5, 2.15]} c="#9a4e3e" />
        <Box s={[L * ck * flow * (1 - broke * 0.7), 0.12, 0.42]} p={[-50 + (L * ck * flow * (1 - broke * 0.7)) / 2, 1.82, 2.15]} c={wc} cast={false} o={{ emissive: muddy > 0.5 ? "#000000" : "#1f6fb0", ei: 0.25 }} />
        {flow > 0.1 && broke < 0.5 ? Array.from({ length: 10 }, (_, i) => <Box key={i} s={[0.5, 0.04, 0.2]} p={[-48 + fract(t * 0.25 + i / 10) * L * flow, 1.9, 2.15]} c="#d8f0ff" cast={false} />) : null}
      </G> : null}
      {pk > 0.01 ? Array.from({ length: Math.floor(26 * pk) }, (_, i) => <G key={i} p={[-49 + i * 2, 1.1, -2.2]} r={[0, 0, PI / 2]}><Cyl rt={0.28} h={1.9} c="#c8703a" seg={10} /><Cyl rt={0.33} h={0.2} p={[0, 0.95, 0]} c="#a85a2a" seg={10} /></G>) : null}
      {/* fonte/ninfeu na praça onde a água chega */}
      <G p={[3, 0, 6]}>
        <Box s={[3.2, 0.8, 2.4]} p={[0, 0.4, 0]} c="#c08070" /><Box s={[2.8, 0.1, 2.0]} p={[0, 0.78, 0]} c={WATER} vis={flow > 0.6 && broke < 0.6} cast={false} />
        <Pipe a={[-2.6, 1.8, -3.8]} b={[-0.8, 1.0, -0.6]} rad={0.2} c="#9a4e3e" />
      </G>
    </G>
  );
};
/** decantador: tanque onde a água para e a areia desce */
export const BASIN = { x: 6.5, z: -5 };
const Basin: React.FC<{ t: number }> = ({ t }) => {
  const k = built(t) ? 1 : ease(t, T.estanques - 0.3, T.estanques + 0.5); if (k <= 0.01) return null;
  const sink = ease(t, T.fondo - 0.4, T.limpia), clear = ease(t, T.limpia - 0.3, T.limpia + 0.4);
  const wc = "#" + [0x8a, 0x6a, 0x48].map((v, i) => Math.round(lerp(v, [0x3f, 0x9a, 0xd8][i], clear)).toString(16).padStart(2, "0")).join("");
  return (
    <G p={[BASIN.x, 0, BASIN.z]} sc={[1, Math.max(0.01, k), 1]}>
      <Box s={[3.4, 1.3, 2.0]} p={[0, 0.65, 0]} c="#d0806a" />
      <Pipe a={[-6.5, 1.0, 5]} b={[-1.7, 1.0, 0]} rad={0.2} c="#c8703a" />
      <Box s={[3.0, 0.9, 1.6]} p={[0, 0.85, 0]} c={wc} o={{ opacity: 0.5, rough: 0.3, depthWrite: false }} cast={false} />
      <Box s={[3.0, 0.2 * sink + 0.02, 1.6]} p={[0, 0.42 + 0.1 * sink, 0]} c="#b0884e" cast={false} />
      {Array.from({ length: 14 }, (_, i) => <Sph key={i} rad={0.15} p={[-1.3 + (i % 7) * 0.43, lerp(1.25 - rnd(i) * 0.2, 0.5, clamp(sink * 1.2 - rnd(i + 3) * 0.2)), -0.5 + Math.floor(i / 7) * 0.9]} c="#c89048" cast={false} ws={6} hs={4} vis={clear < 0.95 || sink < 0.98} />)}
      <Box s={[0.5, 0.25, 0.4]} p={[-1.9, 1.15, 0]} c="#9a4e3e" /><Box s={[0.5, 0.25, 0.4]} p={[1.9, 1.15, 0]} c="#9a4e3e" />
    </G>
  );
};
/** cisternas em corte na falésia sul da praça: garrafas escavadas que enchem no inverno */
const Cisterns: React.FC<{ t: number }> = ({ t }) => {
  const k = built(t) ? 1 : ease(t, T.cisternas - 0.3, T.cisternas + 1.2), fill = built(t) ? 0.8 : ease(t, T.guardan, T.invierno + 0.6) * (1 - 0.8 * ease(t, T.rompio, T.suagua + 0.5)), rain = t > T.guardan - 0.3 && t < T.cisternasT + 0.6;
  if (t < T.p4 && !built(t)) return null;
  return (
    <G p={[0, 0, 6.93]}>
      {[-4.2, 0, 4.2].map((x, i) => (
        <G key={i} p={[x + 2, 0, 0]} sc={Math.max(0.01, k)}>
          <Box s={[2.8, 4.4, 0.1]} p={[0, 3.2, 0]} c="#2a1a14" cast={false} />
          <Box s={[0.7, 1.2, 0.1]} p={[0, 6.0, 0]} c="#2a1a14" cast={false} />
          <Box s={[2.6, 4.2 * fill, 0.12]} p={[0, 1.1 + 2.1 * fill, -0.03]} c={WATER} o={{ emissive: "#1f6fb0", ei: 0.35 }} cast={false} />
          {t > T.rompio && t < T.suagua + 1 ? <Box s={[0.08, 3, 0.14]} p={[0.4, 3.2, -0.06]} r={[0, 0, 0.3]} c="#ff3b30" o={{ emissive: "#ff2a1a", ei: 1.2 }} cast={false} /> : null}
        </G>
      ))}
      {rain ? Array.from({ length: 22 }, (_, i) => { const u = fract(t * 1.6 + rnd(i)); return <Box key={i} s={[0.08, 0.8, 0.08]} p={[lerp(-6, 12, rnd(i + 1)), 12 - u * 12, lerp(-8, -1, rnd(i + 2))]} c="#bfe4ff" cast={false} recv={false} o={{ emissive: "#9fd4ff", ei: 0.4, opacity: 0.85, depthWrite: false }} />; }) : null}
    </G>
  );
};
/** fachada do Tesouro: esculpida de cima para baixo; a rocha ainda não cortada serve de piso */
const FX = 16;
const PED = (() => { const s = new THREE.Shape(); s.moveTo(-4.4, 0); s.lineTo(4.4, 0); s.lineTo(0, 2.2); s.closePath(); return new THREE.ExtrudeGeometry(s, { depth: 1.4, bevelEnabled: false }); })();
export const cutY = (t: number) => (built(t) ? 0 : t < T.tallar ? 22 : lerp(22, 0, ease(t, T.tallar, T.cuarenta + 0.2)));
const Treasury: React.FC<{ t: number }> = ({ t }) => {
  const cy = cutY(t), vis = (y0: number) => y0 >= cy - 0.05;
  const COL = "#d98a6a", COL2 = "#c87a5c";
  const cols = [-5, -3, -1, 1, 3, 5];
  const carvers = [-3, 0, 3].map((z, i) => ({ p: [13.4, cy, z] as V3, yaw: PI / 2, pose: "chisel" as PoseName, ph: i * 0.3 }));
  return (
    <G>
      {/* nível de baixo */}
      <Box s={[1.2, 1, 13]} p={[FX - 0.6, 0.5, 0]} c={COL2} vis={vis(0)} />
      {cols.map((z) => <Cyl key={z} rt={0.42} h={7} p={[FX - 1.0, 4.5, z]} c={COL} seg={10} vis={vis(1)} />)}
      <Box s={[1.6, 1.0, 13]} p={[FX - 0.9, 8.5, 0]} c={COL} vis={vis(8)} />
      <G p={[FX - 0.2, 9.0, 0]} r={[0, -PI / 2, 0]} vis={vis(9)}><mesh geometry={PED} material={mat(COL2)} castShadow /></G>
      <Box s={[1.4, 1.0, 1.6]} p={[FX - 0.9, 0.5, 0]} c="#3a2018" vis={vis(0)} />
      <Box s={[0.4, 5.6, 2.2]} p={[FX - 0.2, 3.8, 0]} c="#3a2018" cast={false} vis={vis(1)} />
      {/* nível de cima: tholos central e pavilhões */}
      <Cyl rt={1.8} h={5} p={[FX - 1.6, 13.5, 0]} c={COL} seg={14} vis={vis(11)} />
      {Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * PI + PI / 2; return <Cyl key={i} rt={0.22} h={5} p={[FX - 1.6 + Math.sin(a) * 1.9, 13.5, Math.cos(a) * 1.9]} c={COL2} seg={8} vis={vis(11)} />; })}
      <Cone rad={2.1} h={1.8} seg={14} p={[FX - 1.6, 16.9, 0]} c={COL2} vis={vis(16)} /><Sph rad={0.55} p={[FX - 1.6, 18.2, 0]} c={COL} vis={vis(17.6)} />
      {[-1, 1].map((s) => <G key={s}>
        <Box s={[1.4, 5, 2.4]} p={[FX - 0.9, 13.5, s * 4.6]} c={COL} vis={vis(11)} />
        <Cyl rt={0.3} h={5} p={[FX - 1.7, 13.5, s * 3.6]} c={COL2} seg={8} vis={vis(11)} /><Cyl rt={0.3} h={5} p={[FX - 1.7, 13.5, s * 5.6]} c={COL2} seg={8} vis={vis(11)} />
        <Cone rad={1.7} h={1.2} seg={4} p={[FX - 0.9, 16.6, s * 4.6]} r={[0, PI / 4, 0]} c={COL2} vis={vis(16)} />
      </G>)}
      <Box s={[1.6, 0.8, 13]} p={[FX - 0.9, 10.6, 0]} c={COL2} vis={vis(10)} />
      {/* rocha ainda não cortada: um bloco saliente que desce, com os entalhadores em cima */}
      {cy > 0.05 ? <Box s={[4.2, cy, 13.6]} p={[FX - 2.1, cy / 2, 0]} c={R1} /> : null}
      <Crowd list={carvers} t={t} c={COSTUMES.nabateo} vis={t > T.tallar - 0.2 && t < T.fachadaT} />
      {/* escada curta demais (o problema) */}
      {t > T.p5 && t < T.tallar ? <G p={[FX - 4.6, 0, 3]} r={[0, 0, -0.18]}><Box s={[0.15, 5, 0.15]} p={[0, 2.5, -0.5]} c="#7a4a2a" /><Box s={[0.15, 5, 0.15]} p={[0, 2.5, 0.5]} c="#7a4a2a" />{[0.6, 1.4, 2.2, 3.0, 3.8, 4.6].map((y) => <Box key={y} s={[0.12, 0.12, 1.0]} p={[0, y, 0]} c="#7a4a2a" />)}</G> : null}
    </G>
  );
};
/** camelo de brinquedo (frente = +x local) */
const Camel: React.FC<{ p: V3; yaw: number; t: number; load?: string }> = ({ p, yaw, t, load = "#2f6fb0" }) => {
  const g = Math.sin(t * 6);
  return (
    <G p={p} r={[0, yaw, 0]}>
      <Box s={[1.9, 0.9, 0.75]} p={[0, 2.0, 0]} c="#c9a06a" /><Sph rad={0.55} p={[-0.1, 2.55, 0]} sc={[1.2, 0.9, 1]} c="#c9a06a" />
      <Box s={[0.35, 1.3, 0.35]} p={[1.15, 2.7, 0]} r={[0, 0, -0.35]} c="#c9a06a" /><Box s={[0.75, 0.38, 0.36]} p={[1.5, 3.35, 0]} c="#c9a06a" />
      {[[0.7, 0.25], [0.7, -0.25], [-0.7, 0.25], [-0.7, -0.25]].map(([x, z], i) => <G key={i} p={[x, 1.6, z]} r={[0, 0, (i % 2 ? 1 : -1) * (i < 2 ? 1 : -1) * 0.35 * g]}><Box s={[0.18, 1.6, 0.18]} p={[0, -0.8, 0]} c="#b8905a" /></G>)}
      <Box s={[0.9, 0.6, 1.3]} p={[-0.2, 2.75, 0]} c={load} /><Box s={[0.5, 0.5, 1.5]} p={[0.5, 2.5, 0]} c="#e8d27a" />
    </G>
  );
};
const Caravan: React.FC<{ t: number }> = ({ t }) => {
  const out: React.ReactNode[] = [];
  if (t > T.petra && t < T.p1 + 0.5) { const u = clamp((t - T.petra) / 5); for (let i = 0; i < 4; i++) out.push(<Camel key={"a" + i} p={[lerp(14, -2, u) + i * 2.8, 0, 3 + (i % 2) * 0.8]} yaw={PI} t={t + i * 0.4} load={["#2f6fb0", "#c8553d", "#3f8f3a", "#7a3fc0"][i]} />); }
  if (built(t)) for (let i = 0; i < 3; i++) out.push(<Camel key={"b" + i} p={[6 + i * 2.8, 0, -4]} yaw={PI} t={t + i * 0.4} />);
  if (t > T.suagua - 0.2) { const u = clamp((t - T.comercio + 0.6) / 4); for (let i = 0; i < 4; i++) out.push(<Camel key={"c" + i} p={[lerp(6, -20, u) - i * 2.8, 0, (i % 2) * 0.6 - 0.3]} yaw={PI} t={t + i * 0.4} />); }
  return <G>{out}</G>;
};
/** cidade ao sul: casas, teatro, gente que some no fim */
const City: React.FC<{ t: number }> = ({ t }) => {
  const hs = useMemo(() => Array.from({ length: 34 }, (_, i) => ({ x: lerp(-6, 40, rnd(i * 3 + 1)), z: lerp(20, 50, rnd(i * 3 + 2)), w: lerp(2.6, 4.4, rnd(i + 5)), h: lerp(2, 4, rnd(i + 8)) })), []);
  const empty = ease(t, T.vaciando - 0.5, T.siglo + 0.6), sandK = ease(t, T.vaciando, T.mandaselo);
  const people = Array.from({ length: 10 }, (_, i) => ({ p: [lerp(0, 30, rnd(i + 40)), 0, lerp(16, 34, rnd(i + 50))] as V3, yaw: rnd(i) * 6, pose: (i % 3 ? "walk" : "idle") as PoseName, ph: i * 0.3 }));
  return (
    <G>
      {hs.map((q, i) => <G key={i} p={[q.x, 0, q.z]}><Box s={[q.w, q.h, q.w * 0.9]} p={[0, q.h / 2, 0]} c={i % 3 ? "#d9a57e" : "#e2b894"} /><Box s={[q.w * 0.3, 1.0, 0.1]} p={[0, 0.5, q.w * 0.45 + 0.02]} c="#4a2a1a" cast={false} /></G>)}
      <G p={[22, 0, 44]}>{[0, 1, 2, 3, 4].map((i) => <Cyl key={i} rt={9 - i * 1.3} h={0.8} p={[0, 0.4 + i * 0.8, 0]} ts={PI * 0.5} tl={PI} c={i % 2 ? R3 : R1} seg={20} />)}</G>
      <Crowd list={people} t={t} c={COSTUMES.nabateo} scale={1 - empty * 0.999} vis={empty < 0.99} />
      {sandK > 0.01 ? Array.from({ length: 10 }, (_, i) => <Sph key={i} rad={4} p={[lerp(-4, 30, rnd(i + 70)), 0, lerp(-4, 30, rnd(i + 80))]} sc={[1.6, 0.35 * sandK, 1.2]} c={SAND} cast={false} ws={10} hs={6} />) : null}
    </G>
  );
};
const Sun: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, T.p4, T.meses) * (1 - ease(t, T.b4 + 0.3, T.cisternas)); if (k <= 0.01) return null;
  return <G><Sph rad={7 * k} p={[-10, 120, 40]} c="#ffd34a" cast={false} recv={false} o={{ emissive: "#ffb000", ei: 1.6 }} /><Sph rad={13 * k} p={[-10, 120, 40]} c="#ffe08a" cast={false} recv={false} o={{ emissive: "#ffd34a", ei: 1, opacity: 0.4, depthWrite: false }} /></G>;
};

export const World: React.FC<{ t: number }> = ({ t }) => {
  const q = quake(t), sh: V3 = [q * 0.18 * Math.sin(t * 37), 0, q * 0.15 * Math.sin(t * 29)];
  return (
    <>
      <Sky top="#3a8ee0" mid="#9cd0f2" low="#f6eedc" />
      <Clouds t={t} n={5} y={40} />
      <Ground />
      <G p={sh}>
        <Cliffs /><Dam t={t} /><Channels t={t} /><Basin t={t} /><Cisterns t={t} /><Treasury t={t} />
      </G>
      <Floods t={t} /><Caravan t={t} /><City t={t} /><Sun t={t} />
      <Puffs t={t} p={[-30, 0, 0]} n={8} period={2.5} rise={6} size={2.5} c="#e8d4a8" on={q} drift={[6, 0, 0]} />
    </>
  );
};
