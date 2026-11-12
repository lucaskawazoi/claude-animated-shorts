// Cavalo de brinquedo com cavaleiro opcional (frente = +x local); galopa com as pernas em tesoura.
import React from "react";
import { Box, Cyl, G, Sph, V3 } from "./kit";

export const Horse: React.FC<{ p: V3; yaw: number; t: number; c?: string; rider?: string; speed?: number }> = ({ p, yaw, t, c = "#7a4a2a", rider = "#5a3a2a", speed = 14 }) => {
  const g = Math.sin(t * speed);
  return (
    <G p={[p[0], p[1] + Math.abs(g) * 0.14, p[2]]} r={[0, yaw, 0]}>
      <Box s={[1.7, 0.75, 0.62]} p={[0, 1.25, 0]} c={c} />
      <Box s={[0.36, 0.95, 0.36]} p={[0.85, 1.75, 0]} r={[0, 0, -0.55]} c={c} />
      <Box s={[0.72, 0.32, 0.32]} p={[1.2, 2.12, 0]} c={c} /><Box s={[0.12, 0.3, 0.1]} p={[0.95, 2.4, 0.08]} c={c} />
      <Box s={[0.7, 0.14, 0.12]} p={[-1.05, 1.35, 0]} r={[0, 0, 0.7 + 0.2 * g]} c="#2a1a12" />
      {[[0.65, 0.22], [0.65, -0.22], [-0.65, 0.22], [-0.65, -0.22]].map(([x, z], i) => <G key={i} p={[x, 0.95, z]} r={[0, 0, (i % 2 ? 1 : -1) * (i < 2 ? 1 : -1) * 0.55 * g]}><Box s={[0.16, 0.95, 0.16]} p={[0, -0.45, 0]} c={c} /></G>)}
      {rider ? <G p={[-0.1, 1.65, 0]}>
        <Cyl rt={0.24} rb={0.3} h={0.75} p={[0, 0.4, 0]} c={rider} seg={10} /><Sph rad={0.24} p={[0.04, 1.0, 0]} c="#d9a878" ws={10} hs={8} />
        <Cyl rt={0.26} rb={0.3} h={0.22} p={[0.0, 1.22, 0]} c="#3a2a1a" seg={10} />
        <Box s={[0.08, 0.08, 0.7]} p={[0.25, 0.55, 0.3]} c="#2a1a12" />
      </G> : null}
    </G>
  );
};
