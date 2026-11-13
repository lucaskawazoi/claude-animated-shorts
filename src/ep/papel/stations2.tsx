// MEP13 — segunda metade: máquina de papel (outra fábrica), caldeira de recuperação, turbina, rede elétrica, cidade, caldeira da casca, volta dos químicos.
import React from "react";
import { Box, Cone, Cyl, G, Pipe, Sph, V3, clamp, ease, fract, lerp, prog, rnd } from "../../toy/kit";
import { Puffs } from "../../toy/scenery";
import { T } from "./anchors";
import { BKX, DX, WPX } from "./stations1";
import { AMBER, BARK, DARK, Duct, Flow, GLASS, Lamp, PASTEL, PI, RED, Spray, STEEL, STEEL2, Torus, Win, YEL, lit, mixc, pk } from "./parts";

export const PMX = 366, BOX = 220, BOZ = -50, TUX = 258, PYX = 280, TNX = 356;

// ---------------------------------------------------------------- o caminhão de fardos de polpa que leva a polpa para a outra fábrica
export const BaleTruck: React.FC<{ t: number }> = ({ t }) => {
  const x = lerp(WPX + 14, PMX - 20, ease(t, T.ai4 - 0.3, T.tela + 0.3)), mv = t > T.ai4 - 0.3 && t < T.tela + 0.3, wr = mv ? t * 9 : 0;
  return (
    <G p={[x, 0, 16]} vis={t > T.z4 + 1 && t < T.rolos + 0.5}>
      <Box s={[17, 0.7, 6]} p={[-3.5, 1.6, 0]} c="#2f3a46" /><Box s={[5, 4.6, 5.6]} p={[8, 3.4, 0]} c="#2f6fb0" /><Box s={[0.2, 2.2, 4.8]} p={[10.55, 4.0, 0]} c="#9fd8ff" cast={false} />
      {[-9, -4, 8].map((wx) => [-1, 1].map((s) => <G key={`${wx}${s}`} p={[wx, 1.15, s * 2.9]} r={[wr, 0, 0]}><Cyl rt={1.15} h={0.8} r={[PI / 2, 0, 0]} c="#1c2026" seg={12} /><Box s={[0.2, 0.2, 0.9]} p={[0, 0.7, 0]} c="#c3cbd3" cast={false} /></G>))}
      {[0, 1, 2].map((i) => [0, 1].map((k) => [0, 1].map((l) => <Box key={`${i}${k}${l}`} s={[4.2, 2.6, 2.6]} p={[-9 + i * 4.6, 3.3 + k * 2.7, -1.5 + l * 3]} c="#fafaf5" />)))}
    </G>
  );
};

// ---------------------------------------------------------------- máquina de papel: tela que anda, rolos de prensa, cilindros quentes, bobina gigante
export const PaperMachine: React.FC<{ t: number }> = ({ t }) => {
  const on = ease(t, T.outra - 0.3, T.outra + 0.5), reel = lerp(2.4, 6.4, ease(t, T.tela, T.maqT + 1.2)), sp = t * 3.2 * on;
  const dry = (i: number): V3 => [PMX + 56 + i * 8, i % 2 ? 5 : 12.2, 0];
  const links: JSX.Element[] = [];
  for (let i = 0; i < 5; i++) { const a = dry(i), b = dry(i + 1), pa: V3 = [a[0], a[1] + (i % 2 ? 3.7 : -3.7), 0], pb: V3 = [b[0], b[1] + (i % 2 ? -3.7 : 3.7), 0], dx = pb[0] - pa[0], dy = pb[1] - pa[1]; links.push(<Box key={i} s={[Math.hypot(dx, dy), 0.12, 9]} p={[(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2, 0]} r={[0, 0, Math.atan2(dy, dx)]} c="#ffffff" cast={false} />); }
  return (
    <G>
      {/* o prédio da outra fábrica */}
      <Box s={[140, 18, 14]} p={[PMX + 62, 9, -22]} c="#ffd04a" /><Box s={[140, 4.5, 0.4]} p={[PMX + 62, 4.5, -14.8]} c="#2f6fb0" cast={false} />{Array.from({ length: 12 }, (_, i) => <Box key={i} s={[5, 4, 0.3]} p={[PMX + 4 + i * 11.5, 12.5, -14.8]} c="#9fd8ff" cast={false} o={{ emissive: "#9fd8ff", ei: 0.35 }} />)}<Box s={[142, 1.2, 15]} p={[PMX + 62, 18.6, -22]} c="#2f6fb0" />
      {Array.from({ length: 7 }, (_, i) => <Cone key={i} rad={9} h={5} seg={4} p={[PMX - 2 + i * 20, 21.4, -22]} r={[0, PI / 4, 0]} c={RED} o={{ flat: true }} />)}
      <Box s={[14, 22, 10]} p={[PMX - 14, 11, -22]} c="#f6f8fa" /><Box s={[14.8, 1, 10.8]} p={[PMX - 14, 22.4, -22]} c={RED} />
      <Box s={[150, 0.4, 24]} p={[PMX + 62, 0.2, 2]} c="#c4c9cc" cast={false} />
      <Box s={[160, 0.12, 6]} p={[PMX + 50, 0.1, 16]} c="#6b727a" cast={false} />
      {/* caixa de entrada: a polpa aguada jorra sobre a tela */}
      <Box s={[9, 5, 10.5]} p={[PMX, 4.5, 0]} c="#2f6fb0" /><Box s={[9.6, 0.6, 11]} p={[PMX, 7.2, 0]} c="#e0262b" />
      <Cyl rt={0.6} h={4} p={[PMX + 3.5, 3.0, 0]} r={[0, 0, -0.9]} c="#f4f1e6" seg={8} cast={false} vis={on > 0.2} />
      <Spray t={t} t0={T.tela - 0.5} t1={T.end} p={[PMX + 4.8, 3.9, 0]} dir={[1, 0, 0]} spread={0.15} n={14} spd={7} g={-12} life={0.6} size={0.35} cols={["#fafaf5", "#e6f4ff"]} shape="sph" floor={3.6} />
      {/* a tela: malha que anda, polpa que escorre (gotas caem) */}
      <Box s={[27, 0.3, 9.4]} p={[PMX + 18, 3.2, 0]} c="#3a4350" />
      {Array.from({ length: 22 }, (_, i) => <Box key={i} s={[0.28, 0.08, 9.2]} p={[PMX + 5.5 + ((i * 1.2 + sp * 3.5) % 26.4), 3.4, 0]} c="#9aa4ad" cast={false} />)}
      <Box s={[27, 0.3, 8.8]} p={[PMX + 18, 3.65, 0]} c="#f2f0e6" o={{ opacity: 0.35 + 0.65 * ease(t, T.tela + 0.4, T.rolos) }} cast={false} />
      {[0, 27].map((x) => <Cyl key={x} rt={1.4} h={10} p={[PMX + 5 + x, 2.6, 0]} r={[PI / 2, 0, 0]} c={STEEL2} seg={12} />)}
      <Box s={[27, 0.4, 10]} p={[PMX + 18, 0.9, 0]} c="#2f9bf0" o={{ opacity: 0.9 }} cast={false} />
      {Array.from({ length: 9 }, (_, i) => <Box key={i} s={[0.9, 2.6, 0.3]} p={[PMX + 8 + i * 2.6, 1.9 + 0.25 * Math.sin(t * 14 + i * 1.7), 5.3]} sc={[1, on * (0.8 + 0.3 * Math.sin(t * 11 + i)), 1]} c="#4fb4ff" cast={false} o={{ emissive: "#2f9bf0", ei: 0.5 }} />)}
      <Spray t={t} t0={T.tela} t1={T.end} p={[PMX + 18, 3.0, 5.2]} dir={[0, -1, 0.1]} spread={0.55} n={34} spd={3} g={-22} life={0.7} size={0.55} cols={["#2f9bf0", "#7fc8f0", "#ffffff"]} shape="sph" floor={1.0} seed={2} />
      <Spray t={t} t0={T.tela} t1={T.end} p={[PMX + 10, 3.0, 5.2]} dir={[0, -1, 0.1]} spread={0.55} n={20} spd={3} g={-22} life={0.7} size={0.32} cols={["#7fc8f0", "#bfe6ff", "#ffffff"]} shape="sph" floor={1.0} seed={7} />
      {/* rolos de prensa: espremem a água para os lados */}
      {[PMX + 38, PMX + 47].map((x, k) => <G key={x} p={[x, 0, 0]}>
        <Box s={[1.6, 14, 1.6]} p={[-4, 7, 6]} c={DARK} /><Box s={[1.6, 14, 1.6]} p={[-4, 7, -6]} c={DARK} /><Box s={[1.6, 14, 1.6]} p={[4, 7, 6]} c={DARK} /><Box s={[1.6, 14, 1.6]} p={[4, 7, -6]} c={DARK} />
        <G p={[0, 3.4, 0]} r={[0, 0, sp * 2]}><Cyl rt={2.6} h={10} r={[PI / 2, 0, 0]} c="#5f6a75" seg={14} />{[0, 1, 2, 3].map((q) => <Box key={q} s={[0.5, 5.4, 10.2]} r={[0, 0, q * PI / 4]} c="#aab4bd" cast={false} />)}</G>
        <G p={[0, 8.6, 0]} r={[0, 0, -sp * 2]}><Cyl rt={2.6} h={10} r={[PI / 2, 0, 0]} c={RED} seg={14} />{[0, 1, 2, 3].map((q) => <Box key={q} s={[0.5, 5.4, 10.2]} r={[0, 0, q * PI / 4]} c="#ff8a8a" cast={false} />)}</G>
        <Spray t={t} t0={T.rolos} t1={T.end} p={[0, 6.0, 5.4]} dir={[0, 0.2, 1]} spread={0.7} n={26} spd={7} g={-18} life={0.8} size={0.34} cols={["#7fc8f0", "#bfe6ff", "#ffffff"]} shape="sph" floor={0.3} seed={k} />
      </G>)}
      <Box s={[11, 0.12, 9]} p={[PMX + 33, 4.4, 0]} r={[0, 0, 0.12]} c="#ffffff" cast={false} />
      {/* cilindros quentes (secam a folha), com vapor */}
      {Array.from({ length: 6 }, (_, i) => { const d = dry(i), hot = ease(t, T.cilin - 0.2, T.cilin + 0.6); return <G key={i} p={d}>
        <G r={[0, 0, sp * 1.4 * (i % 2 ? 1 : -1)]}>
          <Cyl rt={3.7} h={10} r={[PI / 2, 0, 0]} c={mixc("#c9ced4", "#e8a070", hot)} seg={16} o={{ metal: 0.4, rough: 0.35, emissive: "#ff7a1a", ei: 0.22 * hot }} />
          {[0, 1, 2].map((q) => <Box key={q} s={[0.5, 7.2, 10.2]} r={[0, 0, q * PI / 3]} c="#fff0d0" cast={false} />)}
        </G>
        <Box s={[1.4, d[1] + 1, 1.4]} p={[0, -d[1] / 2 - 0.5, 6.2]} c={DARK} /><Box s={[1.4, d[1] + 1, 1.4]} p={[0, -d[1] / 2 - 0.5, -6.2]} c={DARK} />
        <Puffs t={t} p={[0, 4, 0]} n={4} period={1.6} rise={5} size={1.3} c="#ffffff" on={hot} drift={[0.3, 0, 1]} o={i * 0.17} />
      </G>; })}
      {links}
      <Box s={[16, 0.12, 9]} p={[PMX + 107, 7.6, 0]} r={[0, 0, 0.2]} c="#ffffff" cast={false} />
      {/* bobinas prontas, em pé, chegando uma a uma */}
      {Array.from({ length: 5 }, (_, i) => { const k = pk(t, T.ton + 0.2 + i * 0.28, 0.4); return k > 0.01 ? <G key={i} p={[PMX + 116 + i * 9.5, 4.3, 12]} sc={k}><Cyl rt={4.2} h={8.6} c="#ffffff" seg={18} o={{ rough: 0.9 }} /><Cyl rt={1.0} h={8.8} c="#b9c3cc" seg={8} cast={false} /><Cyl rt={4.25} h={0.5} p={[0, 2.5, 0]} c="#d8dee6" seg={18} cast={false} /></G> : null; })}
      {/* bobinas que rolam para dentro do quadro e param com poeira */}
      {Array.from({ length: 3 }, (_, i) => { const a = T.ton - 0.1 + i * 0.75, u = ease(t, a, a + 1.0), x = lerp(PMX + 190, PMX + 112 - i * 9.5, u); return t > a - 0.05 && t < T.end ? <G key={i} p={[x, 4.2, 21]} r={[0, 0, -(x - PMX) / 4.2]}><G r={[PI / 2, 0, 0]}><Cyl rt={4.2} h={8.6} c="#ffffff" seg={18} o={{ rough: 0.9 }} /><Cyl rt={4.25} h={0.5} p={[0, 3, 0]} c="#cfd6de" seg={18} cast={false} /></G></G> : null; })}
      <Spray t={t} t0={T.ton + 0.9} t1={T.ton + 1.0} p={[PMX + 112, 0.5, 21]} dir={[0, 1, 0.5]} spread={0.8} n={14} spd={6} g={-10} life={0.8} size={0.7} cols={["#e8e0d0", "#ffffff"]} shape="sph" floor={0.3} />
      {/* a bobina gigante */}
      <G p={[PMX + 112, 0, 0]}>
        <Box s={[1.8, 13, 1.8]} p={[0, 6.5, 6.8]} c={DARK} /><Box s={[1.8, 13, 1.8]} p={[0, 6.5, -6.8]} c={DARK} />
        <G p={[0, 7.0, 0]} r={[0, 0, -sp * 1.2]}>
          <Cyl rt={reel} h={10} r={[PI / 2, 0, 0]} c="#ffffff" seg={24} o={{ rough: 0.9 }} />
          {[0, 1, 2, 3, 4, 5].map((q) => <Box key={q} s={[reel * 1.9, 0.28, 10.4]} r={[0, 0, q * PI / 6]} c="#d8dee6" cast={false} />)}
          <Cyl rt={0.9} h={11} r={[PI / 2, 0, 0]} c={STEEL} seg={10} cast={false} />
        </G>
      </G>
    </G>
  );
};

// ---------------------------------------------------------------- caldeira de recuperação
export const Boiler: React.FC<{ t: number }> = ({ t }) => {
  const burn = ease(t, T.queima - 0.3, T.queima + 0.7), flick = (k: number) => 1 + 0.14 * Math.sin(t * 23 + k * 2) + 0.2 * Math.sin(t * 17 + k * 3.7);
  const glow = lit(t, T.queima, 0.8);
  return (
    <G p={[BOX, 0, BOZ]}>
      <Box s={[18, 4, 14]} p={[0, 2, 0]} c={RED} />
      <Box s={[16, 36, 12]} p={[0, 22, 0]} c="#9aa7b5" />
      {[10, 20, 30].map((y) => <Box key={y} s={[16.6, 0.8, 12.6]} p={[0, y + 4, 0]} c="#5f6a75" cast={false} />)}
      <Box s={[10, 12, 0.4]} p={[0, 13, 6.1]} c="#15171c" />
      <Box s={[9, 11, 0.2]} p={[0, 13, 6.35]} c="#ff5a10" o={{ emissive: "#ff4a08", ei: 0.9 * burn }} cast={false} />
      {[-3, -1, 1, 3].map((x, k) => <Cone key={k} rad={1.1} h={7} seg={7} p={[x, 9 + 3.2 * burn * flick(k), 6.6]} sc={[1, burn * flick(k) + 0.001, 1]} c={k % 2 ? "#ff9a1a" : "#ff4a10"} o={{ emissive: k % 2 ? "#ff8a10" : "#ff3a08", ei: 1.2 }} cast={false} />)}
      {[-2, 2].map((x, k) => <Cone key={k} rad={0.6} h={4} seg={6} p={[x, 8 + 1.8 * burn, 6.8]} sc={[1, burn * flick(k + 5) + 0.001, 1]} c="#ffe066" o={{ emissive: "#ffd23a", ei: 1.4 }} cast={false} />)}
      <Pipe a={[0, 22, 6.6]} b={[0, 17.8, 6.6]} rad={0.6} c="#101216" cast={false} />
      <Spray t={t} t0={T.queima - 0.4} t1={T.volta} p={[0, 17.4, 6.6]} dir={[0, -1, 0]} spread={0.22} n={16} spd={2.5} g={-12} life={1.0} size={0.34} cols={["#0b0c10", "#1d2026"]} shape="sph" />
      <Spray t={t} t0={T.queima} t1={T.end} p={[0, 15, 6.7]} dir={[0, 1, 0.4]} spread={0.8} n={14} spd={7} g={-6} life={1.2} size={0.28} cols={["#ffd23a", "#ff9a1a", "#ffe9a0"]} shape="sph" />
      <Cyl rt={2.2} h={16} p={[0, 38.5, 0]} r={[0, 0, PI / 2]} c={RED} seg={14} /><Cyl rt={2.0} h={0.5} p={[8.2, 38.5, 0]} r={[0, 0, PI / 2]} c={STEEL} seg={10} cast={false} />
      <Cyl rt={1.9} h={20} p={[-5, 48, -2]} c="#c3cbd3" seg={12} />
      <Puffs t={t} p={[-5, 58, -2]} n={8} period={2.4} rise={10} size={3} c="#ffffff" on={burn} drift={[2, 0, 0.5]} />
      <Puffs t={t} p={[8.5, 40, 0]} n={5} period={1.5} rise={5} size={1.6} c="#ffffff" on={ease(t, T.fogo - 0.2, T.fogo + 0.5)} drift={[1.5, 0, 0.6]} />
      {[-5, 0, 5].map((x, k) => <Win key={k} p={[x, 28, 6.1]} on={lit(t, T.energia + 0.3 + k * 0.15, 0.3)} />)}
    </G>
  );
};
export const BoilerPipes: React.FC<{ t: number }> = ({ t }) => (
  <G>
    <Duct a={[BKX, 3.4, -20]} b={[BKX, 3.4, -44]} rad={1.0} o={0.5} c="#7d848c" /><Duct a={[BKX, 3.4, -44]} b={[BOX + 9, 10, -46]} rad={1.0} o={0.5} c="#7d848c" />
    <Flow pts={[[BKX, 3.4, -20], [BKX, 3.4, -44], [BOX + 9, 10, -46]]} t={t} t0={T.ai5 - 0.5} spd={11} gap={2.4} rad={0.8} c="#101216" />
    <Pipe a={[BOX + 8.4, 38.5, BOZ]} b={[TUX - 8, 24, BOZ]} rad={1.3} c={STEEL} cast={false} />
    <Flow pts={[[BOX + 8.4, 38.5, BOZ], [TUX - 8, 24, BOZ]]} t={t} t0={T.fogo} spd={16} gap={3.2} rad={1.0} c="#ffffff" />
  </G>
);

// ---------------------------------------------------------------- turbina e gerador
export const Turbine: React.FC<{ t: number }> = ({ t }) => {
  const spin = ease(t, T.turb - 0.3, T.turb + 0.9), ang = t * 15 * spin, on = lit(t, T.turb + 1.2, 0.4);
  return (
    <G p={[TUX, 0, BOZ]}>
      <Box s={[26, 0.8, 16]} p={[0, 0.4, 0]} c={CONC0} />
      <Box s={[26, 16, 0.6]} p={[0, 8.8, -7.7]} c="#9ec8e8" /><Box s={[0.6, 16, 15]} p={[-12.8, 8.8, 0]} c="#9ec8e8" /><Box s={[0.6, 16, 15]} p={[12.8, 8.8, 0]} c="#9ec8e8" />
      <Box s={[27, 1.2, 17]} p={[0, 17.2, 0]} c={RED} />
      <Cyl rt={3.0} h={12} p={[-1, 5.2, -2]} r={[0, 0, PI / 2]} c="#b9c3cc" seg={14} o={{ metal: 0.4 }} />
      {[-5, -2, 1, 4].map((x) => <Cyl key={x} rt={3.4} h={0.6} p={[x, 5.2, -2]} r={[0, 0, PI / 2]} c="#5f6a75" seg={14} cast={false} />)}
      <G p={[-8.2, 5.2, 0.2]}><Cyl rt={4.6} h={0.7} r={[PI / 2, 0, 0]} c="#2b2f36" seg={20} />
        <G p={[0, 0, 0.5]} r={[0, 0, ang]}>{Array.from({ length: 12 }, (_, k) => <Box key={k} s={[4.2, 0.8, 0.3]} p={[Math.cos(k * PI / 6) * 2.4, Math.sin(k * PI / 6) * 2.4, 0]} r={[0, 0, k * PI / 6 + 0.35]} c={k % 2 ? "#f4f7fa" : "#ffd400"} o={{ metal: 0.5 }} cast={false} />)}<Cyl rt={0.9} h={0.8} r={[PI / 2, 0, 0]} c={RED} seg={10} cast={false} /></G>
      </G>
      <Box s={[8, 6.4, 6.4]} p={[8, 3.6, -2]} c={YEL} /><Box s={[8.4, 0.9, 6.8]} p={[8, 7.1, -2]} c={RED} />
      <Cyl rt={0.5} h={3} p={[3.2, 5.2, -2]} r={[0, 0, PI / 2]} c={STEEL} seg={8} cast={false} />
      {[-1, 1].map((s) => <Sph key={s} rad={1.4} p={[s * 6, 15.2, 4]} c={on > 0.4 ? "#fff1a0" : "#8a929a"} ws={8} hs={6} cast={false} o={on > 0.4 ? { emissive: "#ffd84a", ei: 1.6 } : undefined} />)}
      <Puffs t={t} p={[-8, 10, 2]} n={4} period={1.4} rise={4} size={1.2} c="#ffffff" on={spin} drift={[-1, 0, 1.4]} />
    </G>
  );
};
const CONC0 = "#c4c9cc";

// ---------------------------------------------------------------- prédios e postes da fábrica (acendem em onda) e cidade no fim da linha
export const PlantLights: React.FC<{ t: number }> = ({ t }) => (
  <G>
    {Array.from({ length: 9 }, (_, i) => <Lamp key={i} p={[177 + i * 18, 0, -11]} on={lit(t, T.energia + 0.2 + i * 0.12, 0.25)} />)}
    {[196, 74].map((x, i) => { const on = lit(t, T.energia + 0.4 + i * 0.2, 0.3); return <G key={i} p={[x, 0, -30]}><Box s={[16, 10, 8]} p={[0, 5, 0]} c={PASTEL[i % PASTEL.length]} /><Box s={[17, 1, 9]} p={[0, 10.4, 0]} c={RED} />{[-5, 0, 5].map((wx) => [3, 7].map((wy) => <Win key={`${wx}${wy}`} p={[wx, wy, 4.1]} on={on} />))}</G>; })}
  </G>
);
export const Pylons: React.FC<{ t: number }> = ({ t }) => {
  const xs = Array.from({ length: 5 }, (_, i) => PYX + i * 17.5);
  return (
    <G>
      {xs.map((x, i) => <G key={i} p={[x, 0, BOZ - 4]}>
        <Pipe a={[-2.6, 0, 0]} b={[0, 20, 0]} rad={0.35} c={STEEL} cast={false} /><Pipe a={[2.6, 0, 0]} b={[0, 20, 0]} rad={0.35} c={STEEL} cast={false} />
        <Box s={[0.4, 0.4, 9]} p={[0, 19.6, 0]} c="#59626b" /><Box s={[0.4, 0.4, 7]} p={[0, 16.6, 0]} c="#59626b" />
        {[-4, 0, 4].map((z) => <Cyl key={z} rt={0.25} h={1.2} p={[0, 18.9, z]} c="#bfe6ff" seg={6} cast={false} />)}
      </G>)}
      {[-4, 0, 4].map((z) => <Pipe key={z} a={[TUX + 13, 21, BOZ - 4 + z]} b={[xs[4] + 4, 20, BOZ - 4 + z]} rad={0.1} c="#2b2f36" cast={false} seg={4} />)}
      <Flow pts={[[TUX + 13, 20.4, BOZ - 4], [xs[4] + 4, 20.4, BOZ - 4]]} t={t} t0={T.sobra - 0.5} spd={34} gap={10} rad={0.9} c="#ffe14a" glow />
    </G>
  );
};
export const Town: React.FC<{ t: number }> = ({ t }) => (
  <G>
    {Array.from({ length: 20 }, (_, i) => {
      const x = TNX + (i % 5) * 12 + (Math.floor(i / 5) % 2) * 5, z = BOZ - 8 - Math.floor(i / 5) * 9, on = lit(t, T.vender - 0.25 + (x - TNX) * 0.012 + (i % 3) * 0.08, 0.3);
      return <G key={i} p={[x, 0, z]}>
        <Box s={[5, 3.6, 5]} p={[0, 1.8, 0]} c={PASTEL[i % PASTEL.length]} /><Cone rad={4.1} h={2.6} seg={4} p={[0, 4.9, 0]} r={[0, PI / 4, 0]} c={mixc("#9a6b3a", "#e8892b", on)} o={{ flat: true }} />
        <Win p={[-1.0, 2.0, 2.55]} s={[1.3, 1.3, 0.12]} on={on} /><Win p={[1.2, 2.0, 2.55]} s={[1.3, 1.3, 0.12]} on={on} />
        {on > 0.4 ? <Sph rad={3.4} p={[0, 2.4, 2.8]} c="#fff1a0" ws={8} hs={6} cast={false} o={{ opacity: 0.12, depthWrite: false, emissive: "#ffd84a", ei: 0.5 }} /> : null}
      </G>;
    })}
    {Array.from({ length: 6 }, (_, i) => <Lamp key={i} p={[TNX - 4 + i * 12, 0, BOZ - 3]} on={lit(t, T.vender + 0.2 + i * 0.1, 0.25)} />)}
  </G>
);

// ---------------------------------------------------------------- a casca vai para outra caldeira
export const BarkBoiler: React.FC<{ t: number }> = ({ t }) => {
  const on = ease(t, T.casca + 0.3, T.casca + 1.1);
  return (
    <G p={[188, 0, BOZ]}>
      <Box s={[11, 3, 10]} p={[0, 1.5, 0]} c="#8a5a32" /><Box s={[10, 15, 9]} p={[0, 10.5, 0]} c="#b07a4a" /><Box s={[10.6, 0.8, 9.6]} p={[0, 18.2, 0]} c={RED} />
      <Box s={[5.6, 5.6, 0.3]} p={[0, 7, 4.6]} c="#15171c" /><Box s={[4.8, 4.8, 0.2]} p={[0, 7, 4.8]} c="#ff5a10" o={{ emissive: "#ff4a08", ei: 0.9 * on }} cast={false} />
      {[-1.4, 0, 1.4].map((x, k) => <Cone key={k} rad={0.9} h={4} seg={7} p={[x, 6 + 1.8 * on * (1 + 0.2 * Math.sin(t * 21 + k)), 5]} sc={[1, on + 0.001, 1]} c={k === 1 ? "#ffcc33" : "#ff6a10"} o={{ emissive: "#ff8a10", ei: 1.2 }} cast={false} />)}
      <Cyl rt={1.3} h={12} p={[3, 23, -2]} c="#c3cbd3" seg={10} />
      <Puffs t={t} p={[3, 29.5, -2]} n={6} period={2.2} rise={8} size={2.2} c="#d6d3cc" on={on} drift={[1.5, 0, 0.4]} />
      {/* pilha de casca e esteira que leva a casca para dentro */}
      <Sph rad={5.5} p={[-17, 0, 3]} sc={[1.3, 0.55, 1]} c={BARK} ws={9} hs={6} o={{ flat: true }} />
      <Box s={[12, 0.8, 2.4]} p={[-9.5, 4.0, 3]} r={[0, 0, 0.45]} c="#3a4350" />
      {Array.from({ length: 8 }, (_, i) => { const s = (t * 0.7 + i / 8) % 1; return <Box key={i} s={[1.3, 0.5, 1]} p={[lerp(-14, -4, s), lerp(2.3, 6.6, s) + 0.5, 3]} r={[t * 2 + i, i, 0]} c={i % 2 ? BARK : "#8a6a44"} cast={false} />; })}
      <Spray t={t} t0={T.casca + 0.5} t1={T.comb + 1.2} p={[3, 20, -2]} dir={[0, 1, 0]} spread={0.5} n={12} spd={7} g={-4} life={1.2} size={0.3} cols={["#ffcc33", "#ff8a10"]} shape="sph" />
    </G>
  );
};

// ---------------------------------------------------------------- volta dos químicos: cano de retorno e seta em laço
export const ChemLoop: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, T.maior - 0.1, T.maior + 0.5), pts: V3[] = [[BOX - 9, 3, BOZ + 4], [BOX - 15, 3, BOZ + 4], [BOX - 15, 36, BOZ + 4], [BOX - 15, 36, -6], [DX - 2, 34, -1], [DX, 31.6, 0]];
  return (
    <G>
      {pts.slice(1).map((b, i) => <Pipe key={i} a={pts[i]} b={b} rad={0.8} c="#4a9a1a" cast={false} />)}
      <Flow pts={pts} t={t} t0={T.maior - 0.1} spd={22} gap={3} rad={0.65} c="#baf24a" glow />
      {k > 0.01 ? <G p={[BOX - 26, 22, -22]} sc={k * 1.0} r={[0, 0.3, 0]}>
        <G r={[0, 0, t * 1.2]}><Torus p={[0, 0, 0]} rad={6.5} tube={0.9} arc={PI * 1.55} c="#9be82a" o={{ emissive: "#7bd10a", ei: 0.8 }} /><Cone rad={2.0} h={3.6} seg={6} p={[6.5 * Math.cos(PI * 1.55), 6.5 * Math.sin(PI * 1.55), 0]} r={[0, 0, PI * 1.55]} c="#9be82a" o={{ emissive: "#7bd10a", ei: 0.8 }} cast={false} /></G>
      </G> : null}
    </G>
  );
};
