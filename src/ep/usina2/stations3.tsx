// MEP14 — a conta (barras de etanol e açúcar, cubos de cana e bagaço), a vinhaça (tanque, tambores, mosca, potássio, caminhão-tanque, biodigestor) e os faróis do fim.
import React from "react";
import { Box, Cone, Cyl, G, Pipe, Sph, V3, clamp, ease, fract, lerp, prog, rnd } from "../../toy/kit";
import { Puffs } from "../../toy/scenery";
import { Flow, PI, STEEL, Spray, mixc, pk } from "../papel/parts";
import { T } from "./anchors";
import { BRICK, CANE_C, CutTank, Drum, Sack, Shell, Truck } from "./kit2";
import { L } from "./layout";

// ---------------------------------------------------------------- a conta: caminhão de 1 t de cana, destilaria (85 L) × usina média (40 L + 66 kg), bagaço indo para a caldeira
const Jerry: React.FC<{ p: V3; k: number; c?: string }> = ({ p, k, c = "#33c46a" }) => (
  <G p={p} sc={Math.max(0.001, k)}>
    <Box s={[0.95, 1.15, 0.6]} p={[0, 0.58, 0]} c={c} o={{ rough: 0.4 }} /><Box s={[0.28, 0.22, 0.28]} p={[0.22, 1.25, 0]} c="#ffd400" cast={false} />
    <Box s={[0.4, 0.12, 0.14]} p={[-0.18, 1.2, 0]} c="#2a2f36" cast={false} /><Box s={[0.55, 0.4, 0.03]} p={[0, 0.5, 0.31]} c="#ffffff" cast={false} />
  </G>
);
const Stick: React.FC<{ t: number; t0: number; from: V3; to: V3 }> = ({ t, t0, from, to }) => {
  const u = prog(t, t0, t0 + 0.9); if (u <= 0 || u >= 1) return null;
  return <G>{[0, 1, 2, 3, 4].map((i) => { const v = clamp(u * 1.3 - i * 0.06); return <Cyl key={i} rt={0.2} h={2.4} p={[lerp(from[0], to[0], v) + (i - 2) * 0.35, lerp(from[1], to[1], v) + 5 * Math.sin(v * PI), lerp(from[2], to[2], v)]} r={[0, 0, PI / 2 + v * 3]} c={CANE_C} seg={6} cast={false} />; })}</G>;
};
export const CONTA_A = 292, CONTA_B = 322;
export const Conta: React.FC<{ t: number }> = ({ t }) => {
  const [, , z] = L.conta, xa = CONTA_A, xb = CONTA_B;
  const tA = lerp(xa - 26, xa - 2, ease(t, T.conta - 0.4, T.conta + 0.9)) - 30 * ease(t, T.oitenta + 0.3, T.oitenta + 1.3);
  const tB = lerp(xb - 28, xb - 2, ease(t, T.media - 0.5, T.media + 0.7)) - 32 * ease(t, T.quarenta - 0.9, T.quarenta - 0.2);
  const showA = t > T.conta - 0.5 && t < T.oitenta + 1.4, showB = t > T.media - 0.6 && t < T.quarenta - 0.1;
  const flame = 0.85 + 0.15 * Math.sin(t * 23);
  return (
    <G>
      <Box s={[16, 0.2, 16]} p={[xa, 0.1, z + 1]} c="#c4c9cc" cast={false} /><Box s={[18, 0.2, 16]} p={[xb, 0.1, z + 1]} c="#c4c9cc" cast={false} />
      {/* A: destilaria só de etanol */}
      <Shell p={[xa, 0, z - 1]} w={9} d={5} h={4.5} wall="#cfe0ee" side="#9fb7cf" roof="#2f86ff" />
      <Cyl rt={1.0} h={9} p={[xa + 6, 4.5, z - 2]} c="#d0dae1" seg={16} /><Sph rad={1.0} ps={0} pl={PI / 2} p={[xa + 6, 9, z - 2]} c="#9fb2c0" ws={14} hs={6} />
      <Box s={[3.2, 2, 0.2]} p={[xa - 5, 5.2, z + 1]} c="#2f86ff" /><Cyl rt={0.14} h={4.2} p={[xa - 5, 2.1, z + 1]} c="#59626b" seg={6} />
      <Sph rad={0.55} p={[xa - 5, 5.2, z + 1.18]} sc={[0.8, 1.1, 0.4]} c="#ffffff" ws={8} hs={6} cast={false} />
      {Array.from({ length: 17 }, (_, i) => <Jerry key={i} p={[xa - 3.4 + (i % 6) * 1.3, 0.2, z + 3.4 + Math.floor(i / 6) * 1.1]} k={pk(t, T.oitenta + 0.15 + i * 0.075, 0.3)} />)}
      {/* B: usina média, açúcar e álcool */}
      <Shell p={[xb, 0, z - 1]} w={11} d={5} h={4.5} wall="#f0e6d8" side={BRICK} roof="#ff7a1a" />
      <Cyl rt={0.7} rb={0.9} h={11} p={[xb + 6.5, 5.5, z - 2]} c="#f2f2f2" seg={14} />{[3, 6.5, 10].map((y, i) => <Cyl key={i} rt={0.8} h={1.2} p={[xb + 6.5, y, z - 2]} c="#e2392f" seg={14} cast={false} />)}
      <Puffs t={t} p={[xb + 6.5, 11.4, z - 2]} n={6} period={3.4} rise={5} size={1.2} c="#f4f6f8" drift={[1.6, 0, 0.4]} />
      {Array.from({ length: 8 }, (_, i) => <Jerry key={i} p={[xb - 5.8 + (i % 4) * 1.3, 0.2, z + 3.4 + Math.floor(i / 4) * 1.1]} k={pk(t, T.quarenta - 0.2 + i * 0.1, 0.3)} />)}
      {Array.from({ length: 13 }, (_, i) => <Sack key={i} p={[xb + 0.2 + (i % 5) * 1.2, 0.2, z + 3.4 + Math.floor(i / 5) * 1.1]} sc={pk(t, T.sessenta - 0.1 + i * 0.07, 0.3) * 0.9} />)}
      {/* caminhão com 1 t de cana */}
      {showA ? <Truck p={[tA, 0, z + 9]} kind="cane" t={t} /> : null}
      {showB ? <Truck p={[tB, 0, z + 9]} kind="cane" t={t} /> : null}
      <Stick t={t} t0={T.oitenta - 0.5} from={[xa - 2, 2.4, z + 9]} to={[xa, 3, z - 1]} />
      <Stick t={t} t0={T.media + 0.9} from={[xb - 2, 2.4, z + 9]} to={[xb, 3, z - 1]} />
      <Cone rad={0.35} h={1.0 * flame} seg={6} p={[xb - 2, 1.2, z + 1.6]} c="#ffd24a" o={{ emissive: "#ffb000", ei: 2.4 }} sc={ease(t, T.media + 1.5, T.media + 2.2)} cast={false} />
    </G>
  );
};
export const Bagaco: React.FC<{ t: number }> = ({ t }) => {
  const [x, , z] = L.bagaco, c = ease(t, T.ja - 0.1, T.ja + 0.8), conv = ease(t, T.quinhentas - 0.3, T.quinhentas + 0.4), b = ease(t, T.quinhentas, T.cento + 0.8), fire = ease(t, T.cento - 0.5, T.cento + 0.8), flick = 0.85 + 0.15 * Math.sin(t * 23);
  return (
    <G>
      <Box s={[44, 0.2, 18]} p={[x, 0.1, z + 1]} c="#c4c9cc" cast={false} />
      {/* monte de cana: 500 t/h */}
      <G p={[x - 15, 0, z + 1]} sc={Math.max(0.001, c)}>
        {[[0, 0, 0, 4.2], [-3, 0, 1, 3.0], [3, 0, 1.2, 3.0], [0.4, 2.6, 0, 3.0]].map(([a, b2, d, r], i) => <Sph key={i} rad={r} p={[a, b2 + r * 0.55, d]} sc={[1.2, 0.8, 1.1]} c={i % 2 ? "#a8c830" : CANE_C} ws={10} hs={7} o={{ flat: true }} />)}
        {Array.from({ length: 12 }, (_, i) => <Cyl key={i} rt={0.18} h={3} p={[(rnd(i) - 0.5) * 8, 1.5 + rnd(i + 3) * 3, 3 + rnd(i + 6)]} r={[0, rnd(i + 8) * 3, PI / 2 + (rnd(i + 5) - 0.5)]} c="#8fb81a" seg={6} cast={false} />)}
      </G>
      {/* moenda pequena e esteira até a caldeira */}
      <Box s={[5, 3, 3.4]} p={[x - 7, 1.7, z + 1]} c="#a9c0d3" /><Cyl rt={0.9} h={3.6} p={[x - 7, 3.2, z + 1.2]} r={[PI / 2, 0, 0]} c="#7e8d99" seg={14} cast={false} />
      <G p={[x + 1.2, 3.1, z + 1]} r={[0, 0, Math.atan2(2.6, 11)]}><Box s={[12, 0.25, 1.6]} c="#3b4650" /></G>
      <Flow pts={[[x - 4, 2.2, z + 1], [x + 6.5, 4.3, z + 1]]} t={t} t0={T.quinhentas - 0.2} spd={6} gap={1.0} rad={0.32} c="#d6b86a" box />
      {/* monte de bagaço: ~140 t/h */}
      <G p={[x + 2, 0, z + 5.6]} sc={Math.max(0.001, b)}>
        {[[0, 0, 0, 2.3], [-1.6, 0, 0.5, 1.6], [1.6, 0, 0.5, 1.5]].map(([a, b2, d, r], i) => <Sph key={i} rad={r} p={[a, b2 + r * 0.5, d]} sc={[1.2, 0.8, 1.1]} c="#d6b86a" ws={10} hs={7} o={{ rough: 1 }} />)}
      </G>
      {/* caldeira que recebe o bagaço */}
      <Shell p={[x + 14, 0, z - 0.5]} w={9} d={6} h={6} wall="#e6dcd4" side={BRICK} roof="#7e4a3a" />
      <Cyl rt={1.8} h={5} p={[x + 14, 2.9, z - 1.4]} c="#c9d3da" seg={20} o={{ metal: 0.3 }} /><Box s={[2.4, 1.6, 0.4]} p={[x + 14, 1.2, z + 1.4]} c="#2a2c30" /><Box s={[1.7, 1.1, 0.1]} p={[x + 14, 1.2, z + 1.65]} c="#ff7a18" o={{ emissive: "#ff5a00", ei: 0.1 + 2.2 * fire }} cast={false} />
      <Cone rad={0.6} h={1.4 * flick} seg={6} p={[x + 13.6, 1.0 + 0.7 * flick, z + 1.7]} c="#ffd24a" o={{ emissive: "#ffb000", ei: 2.6 }} sc={Math.max(0.001, fire)} cast={false} />
      <Cyl rt={0.8} rb={1.0} h={14} p={[x + 18, 7, z - 3]} c="#f2f2f2" seg={14} />{[3, 7, 11].map((y, i) => <Cyl key={i} rt={0.9} h={1.3} p={[x + 18, y, z - 3]} c="#e2392f" seg={14} cast={false} />)}
      <Puffs t={t} p={[x + 18, 14.4, z - 3]} n={7} period={3.4} rise={6} size={1.5} c="#f4f6f8" on={fire} drift={[2, 0, 0.4]} />
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
  const fly = ease(t, T.cheira + 0.3, T.cheira + 0.8) * (1 - ease(t, T.porIsso2 + 0.2, T.porIsso2 + 0.9));
  return (
    <G>
      <Cyl rt={1} h={0.12} p={[px, 0.1, pz]} sc={[Math.max(0.01, k * 5.5), 1, Math.max(0.01, k * 3.6)]} c="#1a0e06" seg={24} o={{ rough: 0.15 }} cast={false} />
      <Puffs t={t} p={[px, 0.8, pz]} n={6} period={2.2} rise={4} size={0.5} c="#9fd84a" on={ease(t, T.cheira - 0.2, T.cheira + 0.4) * (1 - ease(t, T.mosca - 0.2, T.mosca + 0.3))} drift={[0, 0, -0.8]} />
      {fly > 0.02 ? Array.from({ length: 9 }, (_, i) => {
        const a = t * (3 + rnd(i) * 2) + i * 1.7, rr = 1.6 + rnd(i + 3) * 2.6, y = 1.8 + rnd(i + 9) * 2.4 + 0.4 * Math.sin(t * 7 + i);
        return (
          <G key={i} p={[px + Math.cos(a) * rr, y, pz + Math.sin(a) * rr * 0.8]} r={[0, -a, 0]} sc={Math.max(0.001, fly) * 0.9}>
            <Sph rad={0.3} c="#14181c" sc={[1.3, 1, 1]} ws={8} hs={6} cast={false} /><Sph rad={0.22} c="#2a2f36" p={[0.38, 0.03, 0]} ws={8} hs={6} cast={false} /><Sph rad={0.1} c="#ff2020" p={[0.5, 0.12, 0.14]} ws={6} hs={4} cast={false} o={{ emissive: "#ff2020", ei: 0.8 }} /><Sph rad={0.1} c="#ff2020" p={[0.5, 0.12, -0.14]} ws={6} hs={4} cast={false} o={{ emissive: "#ff2020", ei: 0.8 }} />
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
  const truckX = lerp(x - 14, x + 44, ease(t, T.compacta - 0.6, T.caminhao + 1.6));
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
