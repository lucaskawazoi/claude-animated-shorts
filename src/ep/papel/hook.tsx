// MEP13 — as três aberturas (0 a OPEN_END): A folha que amassa e vira eucalipto, B tronco serrado (SplitLog, em stations1), C caderno cujas linhas viram fileiras de árvore.
import React from "react";
import { Box, Cyl, G, Sph, V3, clamp, ease, lerp, prog, rnd } from "../../toy/kit";
import { Puffs } from "../../toy/scenery";
import { OPEN_END, openId } from "./opening";
import { COLX, Euca, ROWZ } from "./stations1";
import { PI, Spray, mixc, pk } from "./parts";
import { Log } from "./stations1";

export const DESK: V3 = [0, 0, 34];
export const OpenA: React.FC<{ t: number }> = ({ t }) => {
  if (openId() !== "A" || t > OPEN_END + 0.1) return null;
  const crumple = ease(t, 0.0, 0.55), hop = t > 0.55 && t < 1.15 ? Math.sin(prog(t, 0.55, 1.15) * PI) * 7 : 0, ball = t < 0.9 ? 1 : 1 - ease(t, 0.9, 1.25), tree = pk(t, 0.85, 1.4);
  const deskK = 1 - ease(t, 2.3, 2.9), wob = 0.2 * Math.sin(t * 38) * (1 - ease(t, 0.3, 0.6));
  return (
    <G p={DESK}>
      <G sc={Math.max(0.001, deskK)}>
        <Box s={[14, 0.7, 9]} p={[0, 3.0, 0]} c="#b8864e" />
        {[[-6, -3.4], [6, -3.4], [-6, 3.4], [6, 3.4]].map(([x, z], i) => <Box key={i} s={[0.8, 3, 0.8]} p={[x, 1.5, z]} c="#8a5f32" />)}
        <Box s={[2.4, 0.5, 1.6]} p={[5, 3.5, 2]} c="#2f6fb0" r={[0, 0.3, 0]} /><Cyl rt={0.3} h={2.4} p={[-5, 3.8, 3]} r={[0, 0, PI / 2]} c="#ffd400" seg={6} />
      </G>
      {/* a folha: lisa, amassa em bola, quica e abre */}
      <Box s={[5.2, 0.14, 7.2]} p={[0, 3.45, 0]} sc={[1 - 0.85 * crumple, 1, 1 - 0.85 * crumple]} r={[0, wob, 0]} c="#ffffff" vis={crumple < 0.98} />
      <Sph rad={1.9} p={[0, 3.4 + 1.9 * crumple + hop, 0]} sc={Math.max(0.001, crumple * ball * (1 + 0.1 * Math.sin(t * 30)))} c="#ffffff" ws={7} hs={5} o={{ flat: true }} r={[t * 4, t * 3, 0]} />
      <Spray t={t} t0={0.5} t1={0.7} p={[0, 4, 0]} dir={[0, 1, 0]} spread={1.0} n={18} spd={9} g={-14} life={0.9} size={0.45} cols={["#ffffff", "#e8eef4"]} />
      <Spray t={t} t0={1.1} t1={1.3} p={[0, 4, 0]} dir={[0, 1, 0]} spread={0.9} n={22} spd={11} g={-14} life={1.0} size={0.45} cols={["#ffffff", "#62b995", "#4aa081"]} />
      {/* o eucalipto que nasce da folha */}
      <Euca p={[0, 3.3 * deskK, 0]} g={t > 2.9 ? 0 : tree * 1.45} i={3} />
    </G>
  );
};

// caderno: página gigante pautada; as linhas viram fileiras de eucalipto (as árvores nascem nas pautas)
export const OpenC: React.FC<{ t: number }> = ({ t }) => {
  if (openId() !== "C" || t > OPEN_END + 0.1) return null;
  const sink = ease(t, 2.5, 3.0);
  return (
    <G p={[0, 0.2 - 0.9 * sink, 0]}>
      <Box s={[96, 0.3, 66]} p={[0, 0.15, -26]} c="#fffef8" />
      {ROWZ.map((z, r) => <Box key={r} s={[96, 0.12, 0.45]} p={[0, 0.35, z]} c={mixc("#4a9be0", "#2fe06a", clamp(prog(t, 0.0 + r * 0.25, 0.3 + r * 0.25)))} cast={false} o={{ emissive: "#2fe06a", ei: 0.5 * (1 - prog(t, 0.3 + r * 0.42, 0.9 + r * 0.42)) }} />)}
      {Array.from({ length: 5 }, (_, r) => <Box key={r} s={[96, 0.1, 0.25]} p={[0, 0.34, -12.5 - r * 9]} c="#a8c8ee" cast={false} />)}
      {/* uma tora cai na página no segundo 1 e quica */}
      {(() => { const f = prog(t, 0.75, 1.2), y = 1.3 + 26 * (1 - f * f) + (t > 1.2 ? 1.6 * Math.abs(Math.sin((t - 1.2) * 11)) * Math.exp(-(t - 1.2) * 4) : 0); return t > 0.7 ? <Log p={[-5, y, -19]} len={9} rad={1.1} r={[0.3 * (1 - f), 0.5 * (1 - f), PI / 2]} /> : null; })()}
      <Spray t={t} t0={1.2} t1={1.3} p={[-5, 1.0, -19]} dir={[0, 1, 0.3]} spread={1.0} n={22} spd={9} g={-16} life={0.9} size={0.55} cols={["#ffffff", "#e8e0d0", "#6b4a2a"]} shape="sph" floor={0.4} />
      <Box s={[0.5, 0.12, 66]} p={[-44, 0.36, -26]} c="#e0262b" cast={false} />
      {Array.from({ length: 12 }, (_, i) => <G key={i} p={[-47.5, 0.8, -52 + i * 5.4]}><Cyl rt={0.9} h={3.4} r={[PI / 2, 0, 0]} c="#59626b" seg={8} cast={false} /></G>)}
      <Box s={[3.2, 0.1, 5]} p={[30, 0.4, -50]} c="#ffd400" r={[0, 0.4, 0]} cast={false} />
      {/* a floresta corre para cima da câmera: mais duas fileiras nascem na página, perto */}
      {[-1, 5].map((z, r) => COLX.map((x, c) => <Euca key={`${r}${c}`} p={[x, 0.3, z]} g={pk(t, 1.9 + r * 0.4 + Math.abs(c - 4) * 0.04, 0.5)} i={c + r} />))}
    </G>
  );
};
