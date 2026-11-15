// MEP14 — peças comuns da usina parte 2: prédio aberto, tanque em corte com camadas, caminhão genérico, saco, tambor.
import React from "react";
import { Box, Cone, Cyl, G, Quad, Sph, V3, ease, lerp } from "../../toy/kit";
import { CONC, PI } from "../papel/parts";

export const CANE_C = "#b4d43c", BRICK = "#b9573d", AMB = "#e8a41c";

/** prédio de brinquedo com a frente aberta para a câmera (+z) */
export const Shell: React.FC<{ p: V3; w: number; d: number; h: number; wall: string; side?: string; roof?: string }> = ({ p, w, d, h, wall, side, roof }) => (
  <G p={p}>
    <Box s={[w + 0.8, 0.25, d + 0.8]} p={[0, 0.12, 0]} c={CONC} cast={false} />
    <Box s={[w, h, 0.3]} p={[0, h / 2 + 0.25, -d / 2]} c={wall} />
    <Box s={[0.3, h, d]} p={[-w / 2, h / 2 + 0.25, 0]} c={side ?? wall} /><Box s={[0.3, h, d]} p={[w / 2, h / 2 + 0.25, 0]} c={side ?? wall} />
    {roof ? <Box s={[w + 0.6, 0.45, d + 0.6]} p={[0, h + 0.45, 0]} c={roof} /> : null}
  </G>
);

export type Layer = { h: number; c: string; face: string; o?: { emissive?: string; ei?: number } };
/** tanque com corte em cunha virado para a câmera (+z): casca aberta, camadas de líquido com faces de corte */
export const CutTank: React.FC<{ p: V3; r: number; h: number; layers: Layer[]; wall?: string; cut?: number; lip?: string }> = ({ p, r, h, layers, wall = "#d5dade", cut = PI / 2, lip = "#9aa4aa" }) => {
  const half = cut / 2, ts = half, tl = PI * 2 - cut;
  let y = 0.3;
  return (
    <G p={p}>
      <Cyl rt={r} h={0.3} p={[0, 0.15, 0]} c={wall} seg={32} />
      <Cyl rt={r} h={h} p={[0, h / 2, 0]} c={wall} seg={32} open ts={ts} tl={tl} o={{ side: "double" }} />
      <Cyl rt={r + 0.08} h={0.22} p={[0, h, 0]} c={lip} seg={32} open ts={ts} tl={tl} o={{ side: "double" }} />
      <Cyl rt={r + 0.08} h={0.22} p={[0, h * 0.45, 0]} c={lip} seg={32} open ts={ts} tl={tl} o={{ side: "double" }} />
      {layers.map((ly, k) => {
        const lh = Math.max(0.001, ly.h), yc = y + lh / 2; y += lh;
        return (
          <G key={k}>
            <Cyl rt={r * 0.97} h={lh} p={[0, yc, 0]} c={ly.c} seg={32} ts={ts} tl={tl} o={{ rough: 0.3, ...(ly.o ?? {}) }} cast={false} />
            {[-half, half].map((a, i) => <Quad key={i} w={r * 0.97} h={lh} p={[Math.sin(a) * r * 0.485, yc, Math.cos(a) * r * 0.485]} r={[0, a - PI / 2, 0]} c={ly.face} o={ly.o} />)}
          </G>
        );
      })}
    </G>
  );
};

/** caminhão de brinquedo (cabine em +x): carga cana / torta / tanque; yaw = PI para andar em -x */
export const Truck: React.FC<{ p: V3; yaw?: number; kind: "cane" | "torta" | "tank"; cab?: string; tank?: string; tilt?: number; load?: number; t?: number }> = ({ p, yaw = 0, kind, cab = "#e2392f", tank = "#f4f6f8", tilt = 0, load = 1, t = 0 }) => (
  <G p={p} r={[0, yaw, 0]}>
    <Box s={[7, 0.35, 2.5]} p={[0, 0.95, 0]} c="#6b7780" />
    <Box s={[2.1, 1.9, 2.4]} p={[2.6, 2.05, 0]} c={cab} o={{ rough: 0.4 }} />
    <Box s={[0.1, 0.95, 2.0]} p={[3.68, 2.4, 0]} c="#bfe6ff" o={{ rough: 0.15, emissive: "#6fb8ff", ei: 0.25 }} cast={false} />
    <Box s={[1.4, 1.1, 2.3]} p={[4.2, 1.5, 0]} c={cab} o={{ rough: 0.4 }} />
    {[[-2.2], [-0.9], [3.3]].flatMap(([wx], i) => [-1, 1].map((sz) => (
      <G key={`${i}${sz}`} p={[wx, 0.62, sz * 1.25]} r={[PI / 2, 0, 0]}><Cyl rt={0.62} h={0.5} c="#262b2e" seg={14} /><Cyl rt={0.3} h={0.52} c="#cfd6da" seg={10} cast={false} /></G>
    )))}
    {kind === "tank" ? (
      <G><Cyl rt={1.3} h={6.2} p={[-0.7, 2.5, 0]} r={[0, 0, PI / 2]} c={tank} seg={20} o={{ rough: 0.3 }} /><Cyl rt={1.32} h={1.0} p={[-0.7, 2.5, 0]} r={[0, 0, PI / 2]} c="#2f86ff" seg={20} cast={false} /></G>
    ) : (
      <G p={[0, 1.15, -1.25]} r={[-tilt, 0, 0]}>
        <G p={[0, 0, 1.25]}>
          <Box s={[5.6, 0.2, 2.5]} p={[-0.2, 0, 0]} c="#58636b" />
          <Box s={[5.6, 0.95, 0.14]} p={[-0.2, 0.5, 1.2]} c={cab} /><Box s={[5.6, 0.95, 0.14]} p={[-0.2, 0.5, -1.2]} c={cab} />
          <Box s={[0.14, 0.95, 2.5]} p={[-3.0, 0.5, 0]} c={cab} /><Box s={[0.14, 1.5, 2.5]} p={[2.55, 0.75, 0]} c={cab} />
          {kind === "cane" ? (
            <G sc={[1, load, load]} p={[-0.2, 0.15, 0]}>
              {[[0, 0], [0.55, 0], [-0.55, 0], [0.28, 0.46], [-0.28, 0.46], [0, 0.92]].map(([bz, by], k) => Array.from({ length: 4 }, (_, j) => (
                <Cyl key={`${k}${j}`} rt={0.24} h={5.2} p={[0, 0.4 + by + (j % 2) * 0.05, bz * 1.6 + (j - 1.5) * 0.35]} r={[0, 0, PI / 2]} c={CANE_C} seg={6} o={{ flat: true }} />
              )))}
            </G>
          ) : (
            <G sc={[1, Math.max(0.001, load), 1]} p={[-0.2, 0.1, 0]}>
              {[[-1.8, 0.5], [-0.6, 0.7], [0.6, 0.55], [1.8, 0.45]].map(([x, r], i) => <Sph key={i} rad={r + 0.5} p={[x, 0.3, (i % 2 - 0.5) * 0.6]} sc={[1.3, 0.8, 1.2]} c={i % 2 ? "#5a3a1a" : "#6b4a2a"} ws={8} hs={6} o={{ rough: 1 }} />)}
            </G>
          )}
        </G>
      </G>
    )}
  </G>
);

/** saco de açúcar de brinquedo */
export const Sack: React.FC<{ p: V3; r?: V3; c?: string; sc?: number }> = ({ p, r, c = "#ffffff", sc = 1 }) => (
  <G p={p} r={r} sc={Math.max(0.001, sc)}>
    <Box s={[1.5, 0.55, 0.95]} p={[0, 0.28, 0]} c={c} o={{ rough: 0.9 }} /><Box s={[1.3, 0.3, 0.8]} p={[0, 0.7, 0]} c={c} r={[0, 0, 0.04]} o={{ rough: 0.9 }} />
    <Box s={[0.6, 0.12, 0.05]} p={[0, 0.4, 0.5]} c="#2f86ff" cast={false} />
  </G>
);

/** tambor de 200 L */
export const Drum: React.FC<{ p: V3; c: string; sc?: number; r?: V3 }> = ({ p, c, sc = 1, r }) => (
  <G p={p} sc={Math.max(0.001, sc)} r={r}>
    <Cyl rt={0.55} h={1.3} p={[0, 0.65, 0]} c={c} seg={14} o={{ rough: 0.4 }} />
    {[0.25, 0.65, 1.05].map((y, i) => <Cyl key={i} rt={0.575} h={0.07} p={[0, y, 0]} c="#2a2f36" seg={14} cast={false} />)}
  </G>
);
export { lerp, ease, Cone };
