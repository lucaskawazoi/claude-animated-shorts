// MEP14 — a conta (barras de etanol e açúcar, cubos de cana e bagaço), a vinhaça (tanque, tambores, mosca, potássio, caminhão-tanque, biodigestor) e os faróis do fim.
import React from "react";
import { Box, Cone, Cyl, G, Pipe, Sph, V3, clamp, ease, fract, lerp, prog, rnd } from "../../toy/kit";
import { Puffs } from "../../toy/scenery";
import { Flow, PI, STEEL, Spray, mixc, pk } from "../papel/parts";
import { T } from "./anchors";
import { CANE_C, CutTank, Drum, Sack, Truck } from "./kit2";
import { L } from "./layout";

// ---------------------------------------------------------------- a conta
export const Conta: React.FC<{ t: number }> = ({ t }) => {
  const [x, , z] = L.conta;
  const b1 = ease(t, T.oitenta - 0.1, T.oitenta + 1.2), b2 = ease(t, T.media, T.media + 1.0), b3 = ease(t, T.media + 0.5, T.media + 1.6);
  const dim = 1 - 0.35 * ease(t, T.media, T.media + 0.4);
  return (
    <G>
      <Box s={[34, 0.4, 13]} p={[x, 0.2, z]} c="#e6edf2" /><Box s={[34.4, 0.25, 13.4]} p={[x, 0.08, z]} c="#2f86ff" cast={false} />
      {/* 85 L/t: destilaria (barra única verde) */}
      <G p={[x - 11, 0.4, z]} sc={b1 > 0.01 ? 1 : 0.001}>
        <Box s={[5, 6.0 * b1 + 0.01, 5]} p={[0, 3.0 * b1, 0]} c="#33c46a" o={{ emissive: "#33c46a", ei: 0.15 * dim }} />
        <Drum p={[0, 6.0 * b1, 0]} c="#33c46a" sc={Math.max(0.001, b1) * 1.2} />
      </G>
      {/* média do Centro-Sul: ~40 L de etanol + 66 kg de açúcar */}
      <G p={[x + 2, 0.4, z]} sc={b2 > 0.01 ? 1 : 0.001}>
        <Box s={[5, 2.8 * b2 + 0.01, 5]} p={[0, 1.4 * b2, 0]} c="#33c46a" />
        <Drum p={[0, 2.8 * b2, 0]} c="#33c46a" sc={Math.max(0.001, b2) * 1.3} />
      </G>
      <G p={[x + 10, 0.4, z]} sc={b3 > 0.01 ? 1 : 0.001}>
        <Box s={[5, 4.6 * b3 + 0.01, 5]} p={[0, 2.3 * b3, 0]} c="#ffffff" o={{ rough: 0.5 }} />
        <Sack p={[0, 4.6 * b3, 0]} sc={Math.max(0.001, b3) * 1.8} />
      </G>
    </G>
  );
};
export const Bagaco: React.FC<{ t: number }> = ({ t }) => {
  const [x, , z] = L.bagaco, c = ease(t, T.ja - 0.1, T.ja + 0.7), b = ease(t, T.cento - 0.8, T.cento + 0.6);
  const s1 = 7, s2 = 7 * Math.cbrt(0.28);
  return (
    <G>
      <Box s={[26, 0.4, 12]} p={[x, 0.2, z]} c="#e6edf2" /><Box s={[26.4, 0.25, 12.4]} p={[x, 0.08, z]} c="#2f86ff" cast={false} />
      {/* cubo de cana: 500 t/h */}
      <G p={[x - 6.5, 0.4, z]} sc={Math.max(0.001, c)}>
        <Box s={[s1, s1, s1]} p={[0, s1 / 2, 0]} c={CANE_C} o={{ flat: true }} />
        {Array.from({ length: 7 }, (_, i) => <Cyl key={i} rt={0.2} h={s1 + 0.3} p={[-3 + i, s1 / 2, s1 / 2 + 0.05]} r={[PI / 2, 0, 0]} c="#7fa81a" seg={6} cast={false} />)}
      </G>
      <Box s={[4, 0.25, 1.4]} p={[x - 1.5, 3.2, z]} c="#3b4650" />
      <Flow pts={[[x - 3, 3.5, z], [x + 1, 3.5, z]]} t={t} t0={T.quinhentas} t1={T.cento + 1} spd={5} gap={1.0} rad={0.3} c={CANE_C} box />
      {/* cubo de bagaço: ~140 t/h */}
      <G p={[x + 6, 0.4, z]} sc={Math.max(0.001, b)}>
        <Box s={[s2, s2, s2]} p={[0, s2 / 2, 0]} c="#d6b86a" o={{ rough: 1 }} />
        {Array.from({ length: 14 }, (_, i) => <Box key={i} s={[0.7, 0.08, 0.08]} p={[(rnd(i) - 0.5) * s2, rnd(i + 3) * s2, s2 / 2 + 0.05]} r={[0, 0, rnd(i + 7) * 3]} c="#8d6a2b" cast={false} />)}
      </G>
    </G>
  );
};

// ---------------------------------------------------------------- vinhaça
export const Vinhaca: React.FC<{ t: number }> = ({ t }) => {
  const [x, , z] = L.vin, h = 5.2, r = 3.4, k = ease(t, T.vinhaca, T.vinhaca + 1.0);
  const bub = Array.from({ length: 14 }, (_, i) => { const u = fract(t * 0.6 + rnd(i) * 3); return { p: [x + (rnd(i + 1) - 0.5) * 4, lerp(0.8, 0.3 + 3.4 * k, u), z + 0.4 + rnd(i + 5) * 1.6] as V3, s: 0.12 + rnd(i + 3) * 0.14 }; });
  const acid = ease(t, T.acida - 0.1, T.acida + 0.4);
  const nD = Math.round(lerp(0, 13, ease(t, T.dez - 0.2, T.dez + 1.8)));
  return (
    <G>
      <Box s={[14, 0.2, 9]} p={[x + 1, 0.1, z + 1]} c="#c4c9cc" cast={false} />
      <CutTank p={[x, 0, z]} r={r} h={h} cut={PI / 1.9} layers={[{ h: 3.4 * k, c: "#2a1a10", face: "#1a0e06" }]} />
      {k > 0.3 ? bub.map((b, i) => <Sph key={i} rad={b.s} p={b.p} c={mixc("#5a4a2a", "#c8e04a", acid)} ws={6} hs={4} cast={false} o={{ emissive: "#c8e04a", ei: 0.5 * acid }} />) : null}
      {/* 1 litro de etanol (tambor verde) × 10 a 13 de vinhaça (tambores escuros) */}
      <Drum p={[x + 7.5, 0.2, z + 6.2]} c="#33c46a" sc={Math.max(0.001, pk(t, T.dez - 0.3, 0.4)) * 1.4} />
      {Array.from({ length: 13 }, (_, i) => { const row = Math.floor(i / 5), col = i % 5; return <Drum key={i} p={[x + 10.2 + col * 1.2, 0.2 + row * 0, z + 3.8 + row * 1.35]} c="#2a1a10" sc={Math.max(0.001, pk(t, T.dez + 0.05 + i * 0.12, 0.3)) * 0.95} />; })}
      <G vis={nD > 0}><Box s={[0.1, 0.1, 0.1]} p={[0, -9, 0]} c="#000" /></G>
      {/* canal escuro até a lavoura */}
      <Pipe a={[x + 3.6, 0.8, z + 2.2]} b={[x + 14, 0.8, z + 10]} rad={0.32} c="#333a40" />
      <Flow pts={[[x + 3.6, 0.8, z + 2.2], [x + 14, 0.8, z + 10]]} t={t} t0={T.dez} spd={6} gap={1.0} rad={0.34} c="#1a0e06" />
    </G>
  );
};

export const Puddle: React.FC<{ t: number }> = ({ t }) => {
  const [x, , z] = L.field, k = ease(t, T.mosca - 1.8, T.mosca - 0.6), px = x - 22, pz = z + 11;
  const fly = ease(t, T.mosca - 0.1, T.mosca + 0.4) * (1 - ease(t, T.porIsso2 + 0.2, T.porIsso2 + 0.9));
  return (
    <G>
      <Cyl rt={1} h={0.12} p={[px, 0.1, pz]} sc={[Math.max(0.01, k * 5.5), 1, Math.max(0.01, k * 3.6)]} c="#1a0e06" seg={24} o={{ rough: 0.15 }} cast={false} />
      <Puffs t={t} p={[px, 0.8, pz]} n={6} period={2.2} rise={4} size={0.9} c="#9fd84a" on={ease(t, T.cheira - 0.2, T.cheira + 0.4) * (1 - ease(t, T.mosca + 0.6, T.mosca + 1.2))} drift={[0, 0, -0.8]} />
      {fly > 0.02 ? Array.from({ length: 9 }, (_, i) => {
        const a = t * (3 + rnd(i) * 2) + i * 1.7, rr = 1.6 + rnd(i + 3) * 2.6, y = 1.8 + rnd(i + 9) * 2.4 + 0.4 * Math.sin(t * 7 + i);
        return (
          <G key={i} p={[px + Math.cos(a) * rr, y, pz + Math.sin(a) * rr * 0.8]} r={[0, -a, 0]} sc={Math.max(0.001, fly) * 0.9}>
            <Sph rad={0.28} c="#14181c" ws={8} hs={6} cast={false} /><Sph rad={0.2} c="#14181c" p={[0.28, 0, 0]} ws={8} hs={6} cast={false} />
            <Box s={[0.5, 0.04, 0.34]} p={[0, 0.22, 0.28]} r={[0.5 * Math.sin(t * 60 + i), 0, 0]} c="#e8f4ff" cast={false} /><Box s={[0.5, 0.04, 0.34]} p={[0, 0.22, -0.28]} r={[-0.5 * Math.sin(t * 60 + i), 0, 0]} c="#e8f4ff" cast={false} />
          </G>
        );
      }) : null}
    </G>
  );
};

/** lavoura de cana com solo aberto em corte: medidor de potássio, pedra, caminhão-tanque que compacta */
export const SoilField: React.FC<{ t: number }> = ({ t }) => {
  const [x, , z] = L.field;
  const dose = ease(t, T.porIsso2 + 0.1, T.potassio + 1.0), stone = ease(t, T.petr, T.petr + 0.35) * (1 - ease(t, T.nao, T.nao + 0.35));
  const truckX = lerp(x - 14, x + 44, ease(t, T.compacta - 0.9, T.caminhao + 1.2));
  const press = ease(t, T.compacta, T.caminhao + 0.8);
  const showT = t > T.compacta - 0.9 && t < T.biogas + 0.3;
  const soil = mixc("#7a5233", "#8a8f94", stone);
  return (
    <G>
      <Box s={[56, 0.5, 15]} p={[x + 6, 0.05, z]} c={soil} cast={false} />
      {Array.from({ length: 3 }, (_, r) => Array.from({ length: 13 }, (_, c) => {
        const px = x - 14 + c * 3.6, k = clamp(1 - 0.35 * press * (px < truckX ? 1 : 0));
        return <G key={`${r}${c}`} p={[px, 0.3, z - 4 + r * 4]} sc={[1, k, 1]}>{[0, 1, 2].map((q) => <Cyl key={q} rt={0.2} h={3.2 + q * 0.4} p={[(q - 1) * 0.4, 1.7, 0]} c={CANE_C} seg={6} o={{ flat: true }} cast={false} />)}<Cone rad={0.9} h={1.4} p={[0, 3.7, 0]} c="#4fa22a" seg={6} o={{ flat: true }} cast={false} /></G>;
      }))}
      {/* rodeiras do caminhão */}
      {showT ? <Box s={[Math.max(0.01, truckX - (x - 14)), 0.12, 1.1]} p={[(truckX + x - 14) / 2, 0.02, z + 5.5]} c="#2a1a10" cast={false} /> : null}
      {showT ? <Box s={[Math.max(0.01, truckX - (x - 14)), 0.12, 1.1]} p={[(truckX + x - 14) / 2, 0.02, z + 8.0]} c="#2a1a10" cast={false} /> : null}
      {showT ? <Truck p={[truckX, 0, z + 6.8]} kind="tank" cab="#e2392f" tank="#4a3a2a" t={t} /> : null}
      {showT ? <Puffs t={t} p={[truckX - 3, 0.5, z + 6.8]} n={5} period={0.8} rise={1.4} size={0.6} c="#a08060" drift={[-2, 0, 0]} /> : null}
      {/* medidor de potássio (roxo) com a linha-limite e a placa de pare */}
      <G p={[x + 28, 0, z + 9]} sc={0.6}>
        <Box s={[2.4, 8, 1.2]} p={[0, 4, 0]} c="#2a3138" />
        <Box s={[1.7, 7.2 * 0.82 * dose + 0.01, 0.4]} p={[0, 0.4 + 3.6 * 0.82 * dose, 0.7]} c="#9a4ae0" o={{ emissive: "#8a3ad6", ei: 0.7 }} cast={false} />
        <Box s={[3.2, 0.28, 0.5]} p={[0, 0.4 + 7.2 * 0.82, 0.8]} c="#ff2d2d" o={{ emissive: "#ff2020", ei: 0.9 }} cast={false} />
        <G p={[3.6, 0, 0]} sc={Math.max(0.001, pk(t, T.potassio + 0.1, 0.35))}><Cyl rt={0.12} h={3.6} p={[0, 1.8, 0]} c="#59626b" seg={6} /><Cyl rt={1.4} h={0.2} p={[0, 4.4, 0]} r={[PI / 2, 0, 0]} c="#e0262b" seg={8} /><Box s={[1.8, 0.4, 0.1]} p={[0, 4.4, 0.16]} c="#ffffff" cast={false} /></G>
      </G>
      {/* esguicho de vinhaça sobre o campo enquanto a dose sobe */}
      <Pipe a={[x - 6, 6.5, z - 8]} b={[x + 26, 6.5, z - 8]} rad={0.25} c="#333a40" />
      <Spray t={t} t0={T.porIsso2 + 0.1} t1={T.potassio + 0.9} p={[x + 8, 6.4, z - 8]} dir={[0, -1, 0.7]} spread={0.6} n={30} spd={3} g={-16} life={1.2} size={0.35} cols={["#2a1a10", "#3a2414"]} shape="sph" floor={0.3} seed={5} />
    </G>
  );
};

// ---------------------------------------------------------------- biodigestor: cúpula verde, gás, lâmpada
export const Bio: React.FC<{ t: number }> = ({ t }) => {
  const [x, , z] = L.bio, on = ease(t, T.biogas - 0.1, T.biogas + 0.7), inflate = 0.7 + 0.3 * on;
  return (
    <G>
      <Box s={[26, 0.25, 16]} p={[x + 2, 0.12, z + 2]} c="#c4c9cc" cast={false} />
      <Cyl rt={5} h={3.4} p={[x, 1.8, z]} c="#c4c9cc" seg={28} />
      <Sph rad={5.1} ps={0} pl={PI / 2} p={[x, 3.5, z]} sc={[1, inflate, 1]} c="#58c46a" ws={28} hs={12} o={{ rough: 0.35, opacity: 0.92 }} />
      <Spray t={t} t0={T.biogas} t1={T.biogas + 2.2} p={[x, 2.8, z + 1]} dir={[0, 1, 0]} spread={0.5} n={20} spd={2.5} g={2} life={1.2} size={0.35} cols={["#ccffd8", "#9fe8b0"]} shape="sph" seed={2} />
      <Pipe a={[x - 5.2, 1.2, z + 1]} b={[x - 12, 1.2, z + 1]} rad={0.3} c="#333a40" />
      <Flow pts={[[x - 12, 1.2, z + 1], [x - 5.2, 1.2, z + 1]]} t={t} t0={T.biogas - 0.4} spd={6} gap={1.1} rad={0.32} c="#1a0e06" />
      <Pipe a={[x, 8.6, z]} b={[x, 11, z]} rad={0.25} c={STEEL} /><Pipe a={[x, 11, z]} b={[x + 9, 11, z]} rad={0.25} c={STEEL} /><Pipe a={[x + 9, 11, z]} b={[x + 9, 4.6, z + 1]} rad={0.25} c={STEEL} />
      <Flow pts={[[x, 8.4, z], [x, 11, z], [x + 9, 11, z], [x + 9, 4.6, z + 1]]} t={t} t0={T.biogas + 0.3} spd={7} gap={1.2} rad={0.28} c="#ccffd8" glow />
      {/* gerador e lâmpada */}
      <Box s={[3.2, 2.8, 3]} p={[x + 9, 1.5, z + 1]} c="#2f7fe0" /><Box s={[1.2, 1.2, 0.1]} p={[x + 9, 1.8, z + 2.55]} c="#ffd400" o={{ emissive: "#ffb000", ei: 0.8 * on }} cast={false} />
      <Cyl rt={0.5} h={0.7} p={[x + 9, 3.2, z + 1]} c="#8b98a2" seg={10} /><Sph rad={1.0} p={[x + 9, 4.4, z + 1]} c={on > 0.4 ? "#fff1a8" : "#dbe6ee"} o={{ emissive: "#ffdc3a", ei: 2.6 * on, rough: 0.2 }} ws={16} hs={12} cast={false} />
    </G>
  );
};

// ---------------------------------------------------------------- faróis: cada estação acende no fim
export const Beacons: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.completa) return null;
  const spots: [number, number][] = [[L.mill[0], L.mill[2]], [L.clar[0], L.clar[2]], [L.filt[0], L.filt[2]], [L.evap[0], L.evap[2]], [L.pan[0], L.pan[2]], [L.cent[0], L.cent[2]], [L.dorna[0], L.dorna[2]], [L.still[0], L.still[2]], [L.vin[0], L.vin[2]], [L.bio[0], L.bio[2]]];
  return (
    <G>
      {spots.map(([x, z], i) => { const k = ease(t, T.completa + 0.1 + i * 0.16, T.completa + 0.5 + i * 0.16); return k > 0.01 ? <G key={i} p={[x, 0, z - 4]}>
        <Cyl rt={1.8} h={70 * k} p={[0, 35 * k, 0]} c="#3cff70" seg={10} cast={false} o={{ opacity: 0.55, depthWrite: false, emissive: "#2cff6a", ei: 1.4 }} />
        <Sph rad={4.5 * k} p={[0, 70 * k, 0]} c="#9bffb0" ws={10} hs={8} cast={false} o={{ emissive: "#2cff6a", ei: 1.4 }} />
      </G> : null; })}
    </G>
  );
};
export { Sack, Cone, prog };
