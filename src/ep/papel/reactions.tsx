// MEP13 — as cinco reações do operário aos «Zerou? Ainda não» (dá de ombros, puxa a cola, cheira, leva respingo, tosse) e seus efeitos.
import React from "react";
import { Box, G, Sph, ease, lerp } from "../../toy/kit";
import { Puffs } from "../../toy/scenery";
import { T } from "./anchors";
import { AMBER, BARK, BARK2, Spray } from "./parts";

export const Reactions: React.FC<{ t: number }> = ({ t }) => (
  <G>
    {/* 1: casca caindo no operário que dá de ombros */}
    <Spray t={t} t0={T.z1} t1={T.a1 + 1.5} p={[28, 11, 19]} dir={[0, -1, 0]} spread={0.25} n={16} spd={3} g={-8} life={1.2} size={0.45} cols={[BARK, BARK2, "#8a6a44"]} floor={0.2} seed={4} />
    {/* 2: a lignina gruda na mão e estica até a pilha */}
    {t > T.z2 - 0.1 && t < T.a2 + 1.5 ? <G>
      {[0, 1, 2].map((k) => { const st = 1 + 0.5 * Math.sin(t * 9 + k * 2), a: [number, number, number] = [172.6, 2.7 + 0.2 * k, 12.4], b: [number, number, number] = [175.6 - k * 0.4, 3.2 + 0.5 * k, 7 - k * 0.3], d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], len = Math.hypot(...d) * st;
        return <G key={k} p={[lerp(a[0], b[0], 0.5), lerp(a[1], b[1], 0.5), lerp(a[2], b[2], 0.5)]} r={[Math.atan2(d[1], Math.hypot(d[0], d[2])) * -1, Math.atan2(d[0], d[2]), 0]}><Box s={[0.28, 0.28, len]} c={AMBER} o={{ emissive: "#ff9a10", ei: 0.5 }} cast={false} /><Sph rad={0.55} p={[0, 0, len / 2]} c="#ffcb4a" ws={6} hs={4} cast={false} /></G>; })}
      <Spray t={t} t0={T.z2} t1={T.a2 + 1.4} p={[174, 3.2, 9.5]} dir={[0, -1, 0.3]} spread={0.3} n={8} spd={2} g={-10} life={1.0} size={0.4} cols={[AMBER, "#ffcb4a"]} shape="sph" floor={0.2} />
    </G> : null}
    {/* 3: fedor marrom sobe do tanque */}
    <Puffs t={t} p={[254, 7, 2]} n={7} period={1.7} rise={7} size={1.6} c="#8a5a2c" on={ease(t, T.z3, T.z3 + 0.3) * (1 - ease(t, T.a3 + 1.4, T.a3 + 1.8))} drift={[-3, 0, 2.5]} />
    {/* 4: o respingo da bandeja bate no operário */}
    <Spray t={t} t0={T.z4} t1={T.a4 + 1.4} p={[316, 1.5, 15]} dir={[-1, 0.7, 0.35]} spread={0.4} n={30} spd={9} g={-14} life={1.0} size={0.55} cols={["#2f9bf0", "#9fd8ff", "#ffffff"]} shape="sph" floor={0.3} seed={6} />
    {/* 5: fumaça preta em volta da cabeça que tosse */}
    <Puffs t={t} p={[248, 4.2, -7]} n={6} period={1.2} rise={3} size={1.3} c="#2b2f36" on={ease(t, T.z5, T.z5 + 0.3) * (1 - ease(t, T.a5 + 1.2, T.a5 + 1.6))} drift={[1.2, 0, 1.5]} />
  </G>
);
