// Mundo do E17: os puquios de Nasca. Um planalto de deserto com a FRENTE CORTADA (z=2) como maquete: por cima o leito seco
// do rio; na face, as camadas (areia, silte, cascalho com água escondida) e a galeria do puquio correndo ao longo de x
// (-30 → 33), que sai num estanque (cocha, x≈38) e rega os campos (x 46–70). A vala aberta fica no meio (x -1,2…1,2);
// os ojos (funis) ficam sobre a galeria em x = -18, -6, 0 (o do corte, com rampa em espiral), 6, 18.
import React, { useMemo } from "react";
import { Box, Cone, Cyl, G, Sph, V3, clamp, ease, lerp, prog, rnd } from "../../toy/kit";
import { Clouds, Hills, Puffs, Sky } from "../../toy/scenery";
import { Crowd, Worker, poseOf, PoseName } from "../../toy/worker";
import { CUTS } from "../../toy/cues";
import { T } from "./cues";

const PI = Math.PI;
const SAND = "#e6c98f", SAND2 = "#d9b877", SILT = "#c79a63", GRAVEL = "#9a8a76", ROCK = "#7c6a58", STONE = "#a89a86", LOG = "#7a4e2a";
export const FACE = 2, CH = { y0: -4.6, y1: -3.0, x0: -30, x1: 33 }, SLOT = { x0: -1.2, x1: 1.2 };
export const OJOS = [-18, -6, 0, 6, 18];
export const COCHA: V3 = [38, 0, -2];

/** o planalto com a face em camadas (o chão de baixo, na frente do corte, fica em y=-7) */
const Plateau: React.FC = () => (
  <G>
    <Box s={[180, 7, 72]} p={[0, -3.5, FACE - 36]} c={SAND2} />
    <Box s={[180, 0.12, 72]} p={[0, 0.02, FACE - 36]} c={SAND} cast={false} />
    {/* faixas da face: areia, silte, cascalho (o aquífero), rocha */}
    <Box s={[180, 1.6, 0.05]} p={[0, -0.8, FACE + 0.01]} c={SAND} cast={false} />
    <Box s={[180, 1.4, 0.05]} p={[0, -2.3, FACE + 0.01]} c={SILT} cast={false} />
    <Box s={[180, 2.0, 0.05]} p={[0, -4.0, FACE + 0.01]} c={GRAVEL} cast={false} />
    <Box s={[180, 2.0, 0.05]} p={[0, -6.0, FACE + 0.01]} c={ROCK} cast={false} />
    {Array.from({ length: 160 }, (_, i) => <Box key={i} s={[0.18, 0.12, 0.04]} p={[-80 + rnd(i) * 160, -3.1 - rnd(i + 7) * 1.8, FACE + 0.04]} c={rnd(i + 3) > 0.5 ? "#b8aa94" : "#6f6252"} cast={false} />)}
    {/* o chão de baixo, diante do corte */}
    <Box s={[180, 0.4, 60]} p={[0, -7.2, FACE + 30]} c={SAND2} />
  </G>
);
/** o leito seco: faixa de cascalho rachado em cima, ao longo da galeria */
const DryBed: React.FC<{ t: number }> = ({ t }) => (
  <G>
    <Box s={[80, 0.06, 5]} p={[-10, 0.08, -1.5]} c="#cbb38a" cast={false} />
    {Array.from({ length: 50 }, (_, i) => <Box key={i} s={[1.2 + rnd(i) * 1.4, 0.03, 0.08]} p={[-48 + rnd(i + 1) * 76, 0.12, -3.8 + rnd(i + 2) * 4.6]} r={[0, rnd(i + 5) * PI, 0]} c="#9a7f5a" cast={false} />)}
    {/* poça que seca no gancho */}
    <Cyl rt={2.2 * (1 - ease(t, T.llueve, T.rio0))} h={0.05} p={[-10, 0.1, -1.6]} c="#6fb6e8" seg={20} vis={t < T.rio0 + 0.2} />
    {/* bola de mato seco rolando */}
    <G p={[-26 + ((t * 2.4) % 40), 0.6, -2.4]} r={[0, 0, -t * 4]}><Sph rad={0.55} c="#a8885a" ws={7} hs={5} o={{ flat: true }} /></G>
  </G>
);

/** a água escondida no cascalho: gotinhas azuis andando para +x na face (aparecem a partir do gancho) */
const Aquifer: React.FC<{ t: number; on: number }> = ({ t, on }) => (
  <G vis={on > 0.01}>
    {Array.from({ length: 70 }, (_, i) => {
      const x = -60 + ((rnd(i) * 120 + t * (1.6 + rnd(i + 2))) % 120), y = -3.2 - rnd(i + 9) * 1.6;
      return <Box key={i} s={[0.4, 0.12, 0.05]} p={[x, y, FACE + 0.07]} c="#4fb0ff" o={{ emissive: "#2a8fff", ei: 0.6 }} sc={on} cast={false} />;
    })}
  </G>
);

/** o rio escondido no cascalho (gancho): faixa azul brilhante com riscos de espuma correndo, até a vala cobri-la */
const HiddenRiver: React.FC<{ t: number; on: number }> = ({ t, on }) => (
  <G vis={on > 0.02 && t < T.cavan - 0.1}>
    <Box s={[70, 0.6, 0.06]} p={[-8, -4.0, FACE + 0.06]} c="#3fa2f0" o={{ emissive: "#1f7fe0", ei: 0.7 }} sc={on} cast={false} />
    {Array.from({ length: 24 }, (_, i) => { const x = -40 + ((rnd(i) * 70 + t * 3.2) % 70); return <Box key={i} s={[0.9, 0.08, 0.04]} p={[x, -3.92 - (i % 3) * 0.14, FACE + 0.1]} c="#e6f6ff" cast={false} />; })}
  </G>
);

/** a galeria ao longo de x na face: vala aberta (zanja) → desaba → forrada de pedra → lajes e troncos → coberta;
 *  depois se enche de barro; os ojos a limpam; a água corre (mais rápido com o vento) até a cocha */
export const Gallery: React.FC<{ t: number }> = ({ t }) => {
  const dig = ease(t, T.cavan, T.recogen + 0.6);                 // a vala aparece da esquerda para a direita
  const open = t > T.cavan && t < T.cubren + 0.5;                 // a fenda vertical aberta até a superfície (meio)
  const collapse = ease(t, T.derrumba, T.derrumba + 0.7) * (1 - ease(t, T.b2, T.b2 + 0.3));
  const evap = ease(t, T.sol, T.bebe + 0.6) * (1 - ease(t, T.b2, T.b2 + 0.3));
  const wall = ease(t, T.forran, T.conPiedra + 0.5), slab = ease(t, T.tapan, T.losas + 0.4), logs = ease(t, T.troncos2, T.troncos2 + 0.5);
  const fill = ease(t, T.cubren, T.cubren + 0.8);
  const mud = ease(t, T.llena, T.barro + 0.8) * (1 - ease(t, T.bajan + 0.2, T.ojos + 0.4));
  const wind = ease(t, T.entra, T.empujar + 0.4) * (1 - ease(t, T.final + 0.4, T.final + 0.9));
  const len = CH.x1 - CH.x0, xs = CH.x0 + len * dig;
  const water = t < T.cavan ? 0 : 1 - 0.75 * evap;
  const flowV = 2.2 + 3.5 * wind;
  const cx = (CH.x0 + xs) / 2, w = Math.max(0.01, xs - CH.x0);
  return (
    <G vis={t > T.cavan - 0.1}>
      {/* o vão escuro da galeria e a fenda aberta no meio */}
      <Box s={[w, CH.y1 - CH.y0, 0.06]} p={[cx, (CH.y0 + CH.y1) / 2, FACE + 0.09]} c="#3a2c20" cast={false} />
      <Box s={[SLOT.x1 - SLOT.x0, -CH.y1, 0.06]} p={[0, CH.y1 / 2, FACE + 0.09]} c="#3a2c20" cast={false} vis={open && fill < 0.99} />
      {/* a vala na superfície (faixa escura ao longo de x) enquanto está aberta */}
      <Box s={[w, 0.05, 1.4]} p={[cx, 0.13, FACE - 0.8]} c="#4a3828" cast={false} vis={open && fill < 0.5} />
      {/* água correndo na galeria */}
      <Box s={[w, 0.5 * water, 0.07]} p={[cx, CH.y0 + 0.25 * water, FACE + 0.1]} c="#3fa2f0" o={{ emissive: "#1f7fe0", ei: 0.4 }} cast={false} vis={water > 0.02} />
      {Array.from({ length: 36 }, (_, i) => { const x = CH.x0 + ((rnd(i) * len + t * flowV) % len); return x < xs ? <Box key={i} s={[0.5, 0.08, 0.04]} p={[x, CH.y0 + 0.3, FACE + 0.14]} c="#dff2ff" cast={false} /> : null; })}
      {/* desabamento: blocos de areia caem na fenda */}
      {Array.from({ length: 10 }, (_, i) => { const f = clamp(collapse * 1.4 - i * 0.04); return <Box key={i} s={[0.5, 0.4, 0.3]} p={[-0.9 + (i % 5) * 0.45, lerp(-0.3, CH.y0 + 0.3 + Math.floor(i / 5) * 0.4, f), FACE + 0.16]} r={[0, 0, i]} c={SILT} vis={collapse > 0.02 && fill < 0.2} />; })}
      {/* o sol bebe a água: vapor saindo da fenda */}
      <Puffs t={t} p={[0, 0.2, FACE + 0.2]} n={6} period={1.4} rise={3} size={0.5} on={evap} c="#ffffff" drift={[0.2, 0, 0]} />
      {/* forro de pedra nas paredes e no fundo, pedra por pedra da esquerda para a direita */}
      {Array.from({ length: 64 }, (_, i) => { const x = CH.x0 + 0.5 + i * (len / 64), k = clamp(wall * 70 - i); return <G key={i} vis={k > 0.01}>
        <Box s={[0.9, 0.35, 0.12]} p={[x, CH.y1 - 0.18 + (1 - k) * 0.8, FACE + 0.17]} c={i % 2 ? STONE : "#968874"} />
        <Box s={[0.9, 0.3, 0.12]} p={[x, CH.y0 - 0.1, FACE + 0.17]} c={i % 2 ? "#968874" : STONE} /></G>; })}
      {/* lajes e troncos por cima */}
      {Array.from({ length: 30 }, (_, i) => { const x = CH.x0 + 1 + i * (len / 30), k = clamp(slab * 32 - i); return <Box key={i} s={[1.9, 0.22, 0.16]} p={[x, CH.y1 + 0.12 + (1 - k) * 3, FACE + 0.18]} c="#8f8574" vis={k > 0.01} />; })}
      {Array.from({ length: 16 }, (_, i) => { const x = CH.x0 + 2 + i * (len / 16), k = clamp(logs * 18 - i); return <Cyl key={i} rt={0.13} h={1.8} p={[x, CH.y1 + 0.32 + (1 - k) * 3, FACE + 0.2]} r={[0, 0, PI / 2]} c={LOG} seg={7} vis={k > 0.01} />; })}
      {/* terra cobrindo a fenda (sobe do topo das lajes até a superfície) */}
      <Box s={[SLOT.x1 - SLOT.x0 + 0.02, -CH.y1 * fill, 0.08]} p={[0, CH.y1 + (-CH.y1 * fill) / 2, FACE + 0.12]} c={SAND2} cast={false} vis={fill > 0.01} />
      {/* raio de sol que bate na terra e volta (✔) */}
      <Box s={[0.12, 3, 0.05]} p={[0.4, 1.5 + 2 * (1 - ease(t, T.oscuras, T.noToca)), FACE + 0.3]} r={[0, 0, 0.3]} c="#fff3a0" o={{ emissive: "#ffd400", ei: 1.4 }} vis={t > T.oscuras - 0.2 && t < T.puquio} cast={false} />
      {/* barro e areia enchendo a galeria */}
      <Box s={[len, (CH.y1 - CH.y0 - 0.2) * mud, 0.06]} p={[(CH.x0 + CH.x1) / 2, CH.y0 + ((CH.y1 - CH.y0 - 0.2) * mud) / 2, FACE + 0.15]} c="#8a6a40" cast={false} vis={mud > 0.01} />
      {/* vento: riscos brancos descendo pelos ojos e correndo na galeria */}
      {Array.from({ length: 45 }, (_, i) => { const u = (t * 1.1 + rnd(i)) % 1, o = OJOS[i % OJOS.length]; return <Box key={i} s={[1.3, 0.13, 0.06]} p={[o + Math.sin(u * 9 + i) * 1.6 * (1 - u) + u * 3, 3.4 - u * 7.2, FACE + 0.3 - (i % 3) * 0.9]} r={[0, 0, u * 6]} c="#ffffff" o={{ emissive: "#ffffff", ei: 0.5, opacity: 0.9 }} vis={wind > 0.05} cast={false} />; })}
    </G>
  );
};

/** os ojos: funis de pedra sobre a galeria; o do corte (x=0) mostra a rampa em espiral descendo até a água */
const Ojos: React.FC<{ t: number }> = ({ t }) => (
  <G>
    {OJOS.map((x, i) => {
      const k = ease(t, T.abren + i * 0.25, T.abren + i * 0.25 + 0.5);
      if (k <= 0.01) return null;
      return (
        <G key={i} p={[x, 0, FACE - 1.4]} sc={[k, 1, k]}>
          {/* ponytail: o planalto é maciço; o funil é ilusão por cima (anéis que escurecem até o fundo) */}
          {["#c9b896", "#b3a07c", "#9a8664", "#7d6a4e", "#5a4a36", "#2e2418"].map((c, j) => <Cyl key={j} rt={2.5 - j * 0.38} h={0.04} p={[0, 0.07 + j * 0.012, 0]} c={c} seg={22} cast={false} />)}
          {Array.from({ length: 16 }, (_, j) => { const a = (j / 16) * PI * 2; return <Box key={j} s={[0.6, 0.35, 0.45]} p={[Math.cos(a) * 2.55, 0.18, Math.sin(a) * 2.55]} r={[0, -a, 0]} c={j % 2 ? STONE : "#968874"} />; })}
          {(i === 2 || i === 4) && Array.from({ length: 20 }, (_, j) => { const a = j * 0.6, r = 2.2 - j * 0.08; return <Box key={j} s={[0.45, 0.06, 0.35]} p={[Math.cos(a) * r, 0.16, Math.sin(a) * r]} r={[0, -a, 0]} c="#e6d8bc" cast={false} />; })}
        </G>
      );
    })}
    {/* no corte, o ojo do meio aparece como um V na face, com a rampa e o poço até a galeria */}
    <G vis={t > T.abren + 0.5}>
      <Box s={[0.3, 3.4, 0.08]} p={[-1.6, -1.4, FACE + 0.2]} r={[0, 0, -0.45]} c="#cbbb9f" /><Box s={[0.3, 3.4, 0.08]} p={[1.6, -1.4, FACE + 0.2]} r={[0, 0, 0.45]} c="#cbbb9f" />
      {Array.from({ length: 7 }, (_, j) => <Box key={j} s={[1.1, 0.12, 0.1]} p={[(j % 2 ? 0.5 : -0.5), -0.3 - j * 0.42, FACE + 0.22]} r={[0, 0, j % 2 ? 0.35 : -0.35]} c="#e0d2b6" />)}
    </G>
  </G>
);

/** a cocha (estanque) que enche e os campos que brotam */
const Fields: React.FC<{ t: number }> = ({ t }) => {
  const hook = t < CUTS[0] ? 1 : 0;
  const lvl = Math.max(hook, ease(t, T.sale, T.cocha + 0.8)), grow = Math.max(hook, ease(t, T.riega, T.riega + 1.4));
  return (
    <G>
      <Cyl rt={4.2} rb={4.4} h={0.9} p={[COCHA[0], 0.45, COCHA[2]]} c="#a89a86" open seg={28} o={{ side: "double" }} />
      <Cyl rt={4.0} h={0.06} p={[COCHA[0], 0.08, COCHA[2]]} c="#8a7050" seg={28} cast={false} />
      <Cyl rt={4.0} h={0.08} p={[COCHA[0], 0.12 + 0.62 * lvl, COCHA[2]]} c="#3fa2f0" o={{ rough: 0.2 }} seg={28} vis={lvl > 0.02} />
      <Box s={[5.8, 0.08, 0.7]} p={[COCHA[0] - 2.6, 0.13, FACE - 1.4]} c="#3fa2f0" o={{ emissive: "#1f7fe0", ei: 0.5 }} vis={t > T.final + 0.1} cast={false} />
      {Array.from({ length: 6 }, (_, r) => <Box key={r} s={[24, 0.08, 0.7]} p={[58, 0.1, -8 + r * 2]} c="#a8805a" cast={false} />)}
      {Array.from({ length: 84 }, (_, i) => { const x = 47 + (i % 14) * 1.7, z = -8 + Math.floor(i / 14) * 2, k = clamp(grow * 1.6 - (i % 14) * 0.04); return <G key={i} p={[x, 0.1, z]} sc={k} vis={k > 0.02}>
        <Cyl rt={0.04} h={1.2} p={[0, 0.6, 0]} c="#3f8f2a" seg={5} /><Cone rad={0.35} h={0.6} seg={5} p={[0, 1.2, 0]} c={i % 3 ? "#58c63a" : "#e8e0c0"} /></G>; })}
      {/* canal de rega da cocha até os campos */}
      <Box s={[8, 0.06, 0.6]} p={[COCHA[0] + 6, 0.1, -2]} c="#3fa2f0" vis={grow > 0.02} cast={false} />
    </G>
  );
};
/** gancho/premissa: bomba, cano de metal e motor aparecem e somem; pedra, terra, troncos chegam */
const Nope: React.FC<{ t: number }> = ({ t }) => {
  const items: [number, number, React.ReactNode][] = [
    [T.bombas, T.tubos, <G><Box s={[1.0, 1.2, 0.8]} p={[0, 0.6, 0]} c="#c8352a" /><Cyl rt={0.1} h={1.4} p={[0.3, 1.6, 0]} c="#6a6a72" seg={8} /></G>],
    [T.tubos, T.motores, <Cyl rt={0.3} h={3.0} r={[0, 0, PI / 2]} p={[0, 0.4, 0]} c="#9aa2aa" o={{ metal: 0.6, rough: 0.3 }} seg={12} />],
    [T.motores, T.piedra, <G><Box s={[1.4, 1.0, 1.0]} p={[0, 0.5, 0]} c="#4a4a52" /><Cyl rt={0.45} h={0.2} p={[0, 1.2, 0]} r={[PI / 2, 0, 0]} c="#ff9f1a" seg={10} /></G>],
  ];
  return (
    <G p={[-10, 0.1, -1.0]}>
      {items.map(([a, b, n], i) => { const k = ease(t, a, a + 0.2) * (1 - ease(t, b - 0.1, b + 0.1)); return <G key={i} p={[-1.6 + i * 1.6, 0, 0]} sc={Math.max(0.001, k)} vis={k > 0.01 && t < T.superficie}>{n}</G>; })}
      <G p={[-1.7, 0, 0]} sc={ease(t, T.piedra, T.piedra + 0.25)} vis={t > T.piedra && t < T.superficie}>{[0, 1, 2].map((j) => <Box key={j} s={[0.7, 0.5, 0.6]} p={[j * 0.5 - 0.5, 0.25 + (j === 1 ? 0.45 : 0), 0]} c={STONE} />)}</G>
      <G p={[0, 0, 0]} sc={ease(t, T.tierra, T.tierra + 0.25)} vis={t > T.tierra && t < T.superficie}><Cone rad={0.9} h={0.9} seg={8} p={[0, 0.45, 0]} c={SILT} /></G>
      <G p={[1.7, 0, 0]} sc={ease(t, T.troncos, T.troncos + 0.25)} vis={t > T.troncos && t < T.superficie}>{[0, 1, 2].map((j) => <Cyl key={j} rt={0.18} h={2.0} p={[0, 0.2 + j * 0.3, j * 0.1 - 0.1]} r={[0, 0, PI / 2]} c={LOG} seg={7} />)}</G>
    </G>
  );
};
/** construtores nasca do gancho («lo construyeron») e agricultores de hoje (o giro) */
const NASCA = { skin: "#a8673f", top: "#efe4c8", bottom: "#a8673f", kilt: "#c8902a", kiltLen: 0.5, hat: "cloth" as const, hatC: "#c8352a", boot: "#7a4a2a", belt: "#2f7fc0", sleeves: false };
const FARM = [
  { skin: "#a8673f", top: "#2f8fd0", bottom: "#3a3a44", hat: "cap" as const, hatC: "#ffd400", boot: "#2a2420", sleeves: true },
  { skin: "#b9784b", top: "#e0503a", bottom: "#2f3f6a", hat: "straw" as const, hatC: "#d9b25a", boot: "#2a2420", sleeves: true },
];
const People: React.FC<{ t: number }> = ({ t }) => {
  const build = t > T.construyeron - 0.2 && t < T.nascaPeru;
  const builders = Array.from({ length: 6 }, (_, i) => ({ p: [-6 + i * 2.2, 0.1, -2.4 + (i % 2) * 1.2] as V3, yaw: 0.3 - (i % 3) * 0.3, pose: (i % 2 ? "chisel" : "pull") as PoseName, ph: i * 0.4 }));
  const farmers = Array.from({ length: 7 }, (_, i) => ({ p: [-3.6 + i * 1.3, 0.1, -3.2 + (i % 2) * 0.8] as V3, yaw: (rnd(i) - 0.5) * 0.6, pose: (t > T.cadaAno ? "pull" : "cheer") as PoseName, ph: i * 0.33 }));
  return (
    <G>
      <Crowd list={builders} t={t} c={NASCA} scale={1.0} vis={build} />
      <Crowd list={farmers} t={t} c={FARM[0]} scale={1.0} vis={t > T.mil - 0.3} />
      {/* baldes de barro subindo pela rampa no giro */}
      {Array.from({ length: 4 }, (_, i) => { const u = ((t - T.cadaAno) * 0.5 + i * 0.25) % 1; return <G key={i} p={[0.8 * Math.cos((1 - u) * 3 * PI), -2.7 + u * 2.7, FACE + 0.5]} vis={t > T.cadaAno}><Cyl rt={0.22} rb={0.17} h={0.35} c="#7a4e2a" seg={8} /></G>; })}
    </G>
  );
};

export const World: React.FC<{ t: number }> = ({ t }) => {
  const aq = ease(t, 1.2, 1.9);
  return (
    <>
      <Sky top="#3f96f0" mid="#9ccff7" low="#fff3dc" />
      <Hills c={["#b08a5a", "#c49a68"]} z={-80} />
      <Clouds t={t} n={4} />
      <Plateau /><DryBed t={t} /><Aquifer t={t} on={aq} /><HiddenRiver t={t} on={aq} /><Gallery t={t} /><Ojos t={t} /><Fields t={t} /><Nope t={t} /><People t={t} />
      {/* huarangos (copa achatada) espalhados */}
      {[[-34, -10], [-22, -18], [12, -14], [26, -9], [44, -16], [72, -12], [-48, -6]].map(([x, z], i) => <G key={i} p={[x, 0, z]}><Cyl rt={0.25} h={2.4} p={[0, 1.2, 0]} c="#6a4a2a" seg={6} /><Cyl rt={2.0} rb={1.6} h={0.8} p={[0, 2.7, 0]} c="#5a8a3a" seg={9} /></G>)}
    </>
  );
};
export { Crowd, Worker, poseOf, Sph, prog };
