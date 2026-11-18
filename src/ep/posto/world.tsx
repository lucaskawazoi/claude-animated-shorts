// Mundo do episódio «posto» (Mundo em Peças, MEP19): um posto de brinquedo e, ao lado da bomba, um LITRO gigante de vidro
// que se monta em fatias, uma por dono do preço (escala: 1 real = U unidades de altura). Ao fundo, de onde vem cada fatia:
// o cavalo de pau e a refinaria (esquerda), o canavial e a usina (direita), a base da distribuidora (fim da estrada).
// O posto fica em volta da origem; a estrada corre em x na frente dele (z ≈ 14); a câmera olha quase sempre para −z.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Pipe, Sph, V3, clamp, ease, lerp, outBack, prog, rnd } from "../../toy/kit";
import { Clouds, Hills, Puffs, Sky } from "../../toy/scenery";
import { IN, T, VAL } from "./cues";

const PI = Math.PI;
const Y0 = 0.2; // topo do piso do posto
export const LIT: V3 = [-5.5, Y0, 4.5]; // o litro gigante
export const U = 0.85, LR = 1.5, LB = 0.35; // altura por real, raio, fundo do litro
const COLS = ["#e58a17", "#8fd14f", "#e0262b", "#6b1010", "#3d7be0", "#ffd400"];
export const sliceY = (i: number) => LIT[1] + LB + U * VAL.slice(0, i).reduce((a, b) => a + b, 0);
export const LIT_TOP = sliceY(6);
export const SIDE: V3 = [1.6, Y0, 3.2]; // onde o operário fala com o chefe
export const PUMP: V3 = [0, Y0, -1];
export const CAR_X = 2.9;
export const ROAD_Z = 14;
export const MAQ: V3 = [-2.4, Y0, 2.6]; // a maquininha do cartão (num pedestal)
export const CAL: V3 = [4.2, 2.4, -9.42]; // o calendário na parede da loja
export const LID: V3 = [-11, Y0 + 0.01, 8]; // boca do tanque subterrâneo
export const JACK: V3 = [-28, 0, -32], REF: V3 = [-46, 0, -60], USINA: V3 = [42, 0, -56], CANE: V3 = [30, 0, -34], BASE: V3 = [-84, 0, 2];
export const HOLE: V3 = [7.5, 0.13, ROAD_Z + 1.5]; // o remendo na estrada (o buraco do vídeo anterior)

const pk = (t: number, t0: number, d = 0.4) => (t < t0 ? 0 : outBack(prog(t, t0, t0 + d)));
const arc = (a: V3, b: V3, u: number, h: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + h * Math.sin(u * PI), lerp(a[2], b[2], u)];
const Coin: React.FC<{ p: V3; s?: number; spin?: number }> = ({ p, s = 1, spin = 0 }) => (
  <Cyl rt={0.36 * s} h={0.09 * s} p={p} r={[PI / 2 + spin, spin * 0.7, 0]} c="#ffcf2a" o={{ metal: 0.6, emissive: "#a87a00", ei: 0.35 }} seg={14} cast={false} />
);

/** texto numa placa (textura de canvas, fonte do sistema: não depende do carregamento da fonte do painel) */
const useText = (lines: [string, string, number][], w = 256, h = 256, bg = "#ffffff") => useMemo(() => {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const g = cv.getContext("2d")!; g.fillStyle = bg; g.fillRect(0, 0, w, h); g.textAlign = "center"; g.textBaseline = "middle";
  lines.forEach(([txt, col, y], i) => { g.fillStyle = col; g.font = `bold ${i === 0 && lines.length > 1 ? Math.round(h * 0.2) : Math.round(h * 0.55)}px Arial, sans-serif`; g.fillText(txt, w / 2, y * h); });
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return tx;
}, [lines, w, h, bg]);
const Sign: React.FC<{ tex: THREE.Texture; p: V3; r?: V3; w: number; h: number; glow?: number }> = ({ tex, p, r, w, h, glow = 0 }) => {
  const m = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, emissive: "#ffffff", emissiveMap: tex, emissiveIntensity: glow }), [tex, glow]);
  return <mesh position={p} rotation={r} material={m}><planeGeometry args={[w, h]} /></mesh>;
};

// ---------------------------------------------------------------- chão, estrada (com o remendo do buraco), posto, loja
const Ground: React.FC<{ t: number }> = ({ t }) => {
  const lamps = ease(t, T.luz, T.luz + 0.3);
  const patch = 0.25 + 0.75 * ease(t, T.buraco, T.buraco + 0.4) * (1 - ease(t, T.quemPaga + 0.3, T.quemPaga + 0.8));
  return (
    <>
      <Box s={[900, 0.2, 600]} p={[0, -0.1, 0]} c="#79c64c" cast={false} />
      <Box s={[400, 0.12, 8]} p={[0, 0.06, ROAD_Z]} c="#3a3d42" cast={false} />
      {Array.from({ length: 60 }, (_, i) => <Box key={i} s={[2.2, 0.02, 0.22]} p={[-150 + i * 5, 0.13, ROAD_Z]} c="#f4f1e6" cast={false} />)}
      {/* o remendo do buraco (MEP18): quadrado escuro de contorno amarelo, aceso na lembrança */}
      <Box s={[2.6, 0.02, 2.2]} p={HOLE} c="#1b1c1f" cast={false} />
      {[[0, 1.1, 2.7, 0.1], [0, -1.1, 2.7, 0.1], [1.33, 0, 0.1, 2.3], [-1.33, 0, 0.1, 2.3]].map(([x, z, w, d], k) => <Box key={k} s={[w, 0.025, d]} p={[HOLE[0] + x, HOLE[1] + 0.005, HOLE[2] + z]} c="#ffd400" o={{ emissive: "#ffd400", ei: patch }} cast={false} />)}
      {/* piso do posto e a faixa de entrada */}
      <Box s={[28, Y0, 21]} p={[0, Y0 / 2, -0.5]} c="#d9dde1" />
      {Array.from({ length: 8 }, (_, i) => <Box key={i} s={[0.12, 0.01, 21]} p={[-14 + i * 4, Y0 + 0.005, -0.5]} c="#c4c9ce" cast={false} />)}
      {/* cobertura: branca com faixa laranja; luzes por baixo acendem na «luz» */}
      <G p={[0, 0, -1]}>
        {[-6, 6].flatMap((x) => [-4.2, 2.2].map((z) => <G key={`${x}${z}`}><Cyl rt={0.32} h={6} p={[x, Y0 + 3, z]} c="#f4f6f8" seg={12} /><Cyl rt={0.42} h={0.8} p={[x, Y0 + 0.4, z]} c="#ff7a1a" seg={12} /></G>))}
        <Box s={[16, 0.7, 10]} p={[0, 6.55, -1]} c="#f4f6f8" />
        <Box s={[16.1, 0.32, 10.1]} p={[0, 6.32, -1]} c="#ff7a1a" />
        {[-4, 4].flatMap((x) => [-3, 1].map((z) => <Box key={`${x}${z}`} s={[3, 0.06, 1.2]} p={[x, 6.17, z]} c={lamps > 0.5 ? "#fffbe0" : "#cfd3d6"} o={{ emissive: "#fff6c8", ei: 1.6 * lamps }} cast={false} />))}
      </G>
      {/* ilha e bomba */}
      <Box s={[1.6, 0.3, 5.2]} p={[PUMP[0], Y0 + 0.15, PUMP[2]]} c="#c9cdd1" />
      {[-1, 1].map((s) => <Box key={s} s={[0.08, 0.32, 5.2]} p={[s * 0.82, Y0 + 0.16, PUMP[2]]} c="#ffd400" cast={false} />)}
      <G p={[PUMP[0], Y0 + 0.3, PUMP[2]]}>
        <Box s={[1.0, 2.5, 1.6]} p={[0, 1.25, 0]} c="#f4f6f8" />
        <Box s={[1.08, 0.5, 1.68]} p={[0, 2.6, 0]} c="#ff7a1a" />
        {[-1, 1].map((s) => <G key={s}><Box s={[0.04, 0.6, 1.1]} p={[s * 0.52, 1.85, 0]} c="#14202b" cast={false} />{[0, 1, 2].map((k) => <Box key={k} s={[0.03, 0.09, 0.8 - k * 0.2]} p={[s * 0.545, 2.02 - k * 0.17, 0]} c="#5cff7a" o={{ emissive: "#5cff7a", ei: 0.9 }} cast={false} />)}</G>)}
        <Box s={[0.16, 0.5, 0.16]} p={[0.58, 1.0, 0.45]} c="#2b2f36" />
      </G>
      {/* loja de conveniência */}
      <G p={[0, Y0, -12]}>
        <Box s={[12, 3.6, 5]} p={[0, 1.8, 0]} c="#fff1d6" />
        <Box s={[12.2, 0.9, 5.2]} p={[0, 3.9, 0]} c="#ff7a1a" />
        <Box s={[2.2, 2.6, 0.1]} p={[-1.5, 1.3, 2.52]} c="#bfe6ff" o={{ opacity: 0.85 }} />
        <Box s={[3.2, 1.6, 0.1]} p={[-4.6, 1.8, 2.52]} c="#bfe6ff" o={{ opacity: 0.85 }} />
        <Box s={[0.5, 1.6, 0.1]} p={[1.2, 1.8, 2.52]} c="#bfe6ff" o={{ opacity: 0.85 }} />
      </G>
      {/* totem com o preço (só cores; o número vai no painel) */}
      <G p={[12.5, Y0, 9.5]}>
        <Cyl rt={0.25} h={7} p={[0, 3.5, 0]} c="#9aa3ab" seg={10} />
        <Box s={[3, 3.4, 0.4]} p={[0, 6.6, 0]} c="#ff7a1a" />
        {[0, 1, 2].map((k) => <Box key={k} s={[2.4, 0.6, 0.05]} p={[0, 7.6 - k * 0.95, 0.23]} c="#14202b" cast={false} />)}
        {[0, 1, 2].map((k) => <Box key={k} s={[1.2, 0.3, 0.03]} p={[0.35, 7.6 - k * 0.95, 0.27]} c="#ffd400" o={{ emissive: "#ffd400", ei: 0.8 }} cast={false} />)}
      </G>
      {/* boca do tanque subterrâneo */}
      <Cyl rt={0.55} h={0.05} p={LID} c="#5a6068" seg={16} />
      {/* árvores em volta */}
      {[[-18, -6], [18, -4], [-20, -16], [20, -18], [16, 6], [-24, 2], [26, 8], [-30, -10]].map(([x, z], i) => (
        <G key={i} p={[x, 0, z]} sc={1.3 + 0.3 * rnd(i)}><Cyl rt={0.25} h={1.8} p={[0, 0.9, 0]} c="#7a4a2a" seg={6} /><Cone rad={1.6} h={2.6} p={[0, 2.9, 0]} c={i % 2 ? "#3fae2c" : "#58c63a"} seg={6} o={{ flat: true }} /></G>
      ))}
    </>
  );
};

// ---------------------------------------------------------------- calendário (o federal «zerado até 9 de dezembro»)
const CAL_LINES: [string, string, number][] = [["DEZEMBRO", "#e0262b", 0.18], ["9", "#14202b", 0.62]];
const Calendar: React.FC<{ t: number }> = ({ t }) => {
  const tex = useText(CAL_LINES, 256, 320);
  const ring = pk(t, T.dez, 0.35);
  return (
    <G p={CAL}>
      <Box s={[1.5, 1.85, 0.06]} c="#e0262b" />
      <Sign tex={tex} p={[0, -0.08, 0.04]} w={1.34} h={1.6} glow={0.15} />
      {ring > 0.01 ? <mesh position={[0, -0.18, 0.08]} scale={ring}><torusGeometry args={[0.42, 0.05, 8, 28]} /><meshStandardMaterial color="#e0262b" emissive="#e0262b" emissiveIntensity={0.5} /></mesh> : null}
    </G>
  );
};

// ---------------------------------------------------------------- o litro: vidro, fatias que caem, a fatia do posto que se reparte
const goldLeft = (t: number) => 1 - 0.18 * ease(t, T.frentista, T.frentista + 0.5) - 0.14 * ease(t, T.luz, T.luz + 0.5) - 0.16 * ease(t, T.aluguel, T.aluguel + 0.5) - 0.12 * ease(t, T.maquininha + 0.3, T.maquininha + 0.8);
const Liter: React.FC<{ t: number }> = ({ t }) => {
  const show = pk(t, T.bora, 0.5);
  if (show < 0.01) return null;
  const H = U * 6.6 + LB;
  return (
    <G p={[LIT[0], LIT[1], LIT[2]]} sc={[show, show, show]}>
      <Cyl rt={LR + 0.25} h={0.3} p={[0, 0.15, 0]} c="#9aa3ab" seg={28} />
      {VAL.map((v, i) => {
        const fall = t < IN[i] ? 0 : outBack(prog(t, IN[i], IN[i] + 0.5)), h = U * v * (i === 5 ? goldLeft(t) : 1), y = sliceY(i) - LIT[1] + h / 2;
        return fall <= 0 ? null : <Cyl key={i} rt={LR - 0.08} h={Math.max(0.02, h)} p={[0, y + 6 * (1 - Math.min(1, fall)), 0]} c={COLS[i]} seg={28} o={{ rough: 0.4, emissive: COLS[i], ei: 0.12 }} />;
      })}
      {/* vidro e gargalo */}
      <Cyl rt={LR} h={H} p={[0, H / 2 + 0.3, 0]} c="#dff4ff" seg={32} open o={{ opacity: 0.28, side: "double", depthWrite: false, rough: 0.1 }} cast={false} />
      {/* o gargalo e a tampa só entram quando o litro fecha (a última fatia, a do posto) */}
      {t > T.fatia + 0.4 ? <G p={[0, H + 0.3, 0]} sc={[1, pk(t, T.fatia + 0.4, 0.4), 1]}>
        <Cone rad={LR} h={0.9} seg={32} p={[0, 0.45, 0]} c="#dff4ff" o={{ opacity: 0.28, depthWrite: false, rough: 0.1 }} cast={false} />
        <Cyl rt={0.42} h={0.5} p={[0, 1.05, 0]} c="#e0262b" seg={18} />
      </G> : null}
      {/* marcas de cada real, na frente do vidro */}
      {Array.from({ length: 6 }, (_, k) => <Box key={k} s={[0.5, 0.05, 0.05]} p={[0, LB + U * (k + 1) + 0.3, LR + 0.02]} c="#ffffff" cast={false} />)}
    </G>
  );
};

// ---------------------------------------------------------------- cavalo de pau, oleoduto e refinaria (fatia da gasolina pura)
const Refinery: React.FC<{ t: number }> = ({ t }) => {
  const nod = Math.sin(t * 2.4) * 0.35, flow = t > T.petroleo - 0.2 && t < T.essa + 0.8;
  return (
    <>
      <G p={JACK}>
        <Box s={[4, 0.4, 2]} p={[0, 0.2, 0]} c="#5a6068" />
        <Box s={[0.5, 3.2, 0.5]} p={[0, 1.8, 0]} c="#3a3f45" />
        <G p={[0, 3.4, 0]} r={[0, 0, nod]}>
          <Box s={[6, 0.45, 0.5]} c="#e0262b" />
          <Box s={[0.8, 1.4, 0.7]} p={[3.1, -0.4, 0]} c="#2b2f36" />
          <Cyl rt={0.06} h={3} p={[3.3, -1.7, 0]} c="#2b2f36" seg={6} />
        </G>
        <Box s={[1.2, 1.2, 1.2]} p={[-2.6, 0.8, 0]} c="#3a3f45" />
      </G>
      <Pipe a={[JACK[0] - 2, 0.4, JACK[2]]} b={[REF[0] + 6, 0.4, REF[2] + 6]} rad={0.35} c="#7f868d" />
      {flow ? Array.from({ length: 10 }, (_, k) => { const u = ((t - T.petroleo) * 0.6 + k / 10) % 1; return <Sph key={k} rad={0.32} p={[lerp(JACK[0] - 2, REF[0] + 6, u), 0.85, lerp(JACK[2], REF[2] + 6, u)]} c="#1c1410" ws={8} hs={6} cast={false} />; }) : null}
      <G p={REF}>
        {[[-6, 0, 3, 14], [-2, -4, 2.2, 18], [3, 0, 2.6, 12]].map(([x, z, r, h], i) => (
          <G key={i} p={[x, 0, z]}><Cyl rt={r} h={h} p={[0, h / 2, 0]} c="#c9cdd1" seg={16} />{[0.3, 0.6, 0.85].map((f) => <Cyl key={f} rt={r + 0.12} h={0.35} p={[0, h * f, 0]} c="#ff7a1a" seg={16} cast={false} />)}</G>
        ))}
        {[[8, 6], [14, 6], [8, 12], [14, 12]].map(([x, z], i) => <G key={i} p={[x, 0, z]}><Cyl rt={2.6} h={3.4} p={[0, 1.7, 0]} c="#f4f6f8" seg={20} /><Cyl rt={2.6} h={0.2} p={[0, 3.45, 0]} c="#c9cdd1" seg={20} /></G>)}
        <Cyl rt={0.5} h={22} p={[-11, 11, -2]} c="#9aa3ab" seg={10} />
        <Puffs t={t} p={[-11, 22.4, -2]} n={7} period={0.9} rise={2.4} size={0.9} c="#ff9a1a" />
        <Puffs t={t} p={[-2, 18.5, -4]} n={6} period={3.2} rise={7} size={1.6} c="#f4f6f8" drift={[2, 0, 0]} />
      </G>
    </>
  );
};

// ---------------------------------------------------------------- canavial e usina (fatia do etanol)
const Usina: React.FC<{ t: number }> = ({ t }) => {
  const cane = useMemo(() => {
    const n = 360, m = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.1, 1, 5), new THREE.MeshStandardMaterial({ color: "#5fae2e", flatShading: true }), n), d = new THREE.Object3D();
    for (let i = 0; i < n; i++) { const h = 2.2 + rnd(i * 3) * 1.2; d.position.set(CANE[0] - 14 + (i % 30) * 0.95 + rnd(i) * 0.4, h / 2, CANE[2] - 6 + Math.floor(i / 30) * 1.0 + rnd(i * 7) * 0.3); d.scale.set(1, h, 1); d.rotation.z = (rnd(i * 5) - 0.5) * 0.2; d.updateMatrix(); m.setMatrixAt(i, d.matrix); }
    m.castShadow = false; return m;
  }, []);
  const sway = Math.sin(t * 1.6) * 0.03;
  return (
    <>
      <G r={[0, 0, sway]}><primitive object={cane} /></G>
      <Box s={[30, 0.1, 13]} p={[CANE[0], 0.05, CANE[2] - 0.5]} c="#8a5a2b" cast={false} />
      <G p={USINA}>
        <Box s={[14, 7, 9]} p={[0, 3.5, 0]} c="#e8e0cf" />
        <Box s={[14.2, 1, 9.2]} p={[0, 7.2, 0]} c="#8fd14f" />
        <Cyl rt={0.9} rb={1.2} h={16} p={[-4, 8, -2]} c="#b9b2a4" seg={12} />
        <Puffs t={t} p={[-4, 16.5, -2]} n={7} period={3.5} rise={9} size={2} c="#ffffff" drift={[3, 0, 0]} />
        {[0, 1].map((k) => <G key={k} p={[10 + k * 5.5, 0, 2]}><Cyl rt={2.2} h={6} p={[0, 3, 0]} c="#f4f6f8" seg={18} /><Cyl rt={2.25} h={0.4} p={[0, 4.2, 0]} c="#8fd14f" seg={18} cast={false} /></G>)}
      </G>
    </>
  );
};

// ---------------------------------------------------------------- o carimbo do imposto (ICMS bate; o federal só encosta e volta: zerado)
const Stamp: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.imposto || t > T.z2) return null;
  const hit = T.icmsN + 0.15, fz = T.zerado + 0.25;
  // desce até bater na fatia do ICMS, sobe; desce de novo no federal e para no ar, volta com mola
  let y = LIT_TOP + 9;
  const topICMS = sliceY(3) + 0.9, topFed = sliceY(4) + 0.9;
  // aparece no alto em «o imposto», paira sobre o litro e bate no «um e cinquenta e sete»
  if (t < hit) y = t < T.icmsN - 0.25 ? lerp(LIT_TOP + 9, LIT_TOP + 2.5, ease(t, T.imposto, T.deixa2 + 0.4)) + 0.15 * Math.sin(t * 5) : lerp(LIT_TOP + 2.5, topICMS, ease(t, T.icmsN - 0.25, hit));
  else if (t < T.mesmo) y = lerp(topICMS, LIT_TOP + 4, ease(t, hit + 0.25, hit + 0.9));
  else if (t < fz) y = lerp(LIT_TOP + 4, topFed + 0.6, ease(t, T.federal + 0.2, fz));
  else y = topFed + 0.6 + (LIT_TOP + 9 - topFed) * ease(t, fz + 0.1, fz + 1.1) + 0.5 * Math.sin((t - fz) * 16) * Math.exp(-4 * (t - fz));
  const squash = t > hit && t < hit + 0.2 ? 1 - 0.25 * Math.sin(prog(t, hit, hit + 0.2) * PI) : 1;
  return (
    <G p={[LIT[0], y, LIT[2]]} sc={[1, squash, 1]}>
      {/* redondo e mais estreito que o vidro: desce por dentro do litro */}
      <Cyl rt={1.25} h={0.9} c="#8a5a32" seg={24} />
      <Cyl rt={1.2} h={0.3} p={[0, -0.6, 0]} c="#e0262b" seg={24} />
      <Cyl rt={0.35} h={2.4} p={[0, 1.6, 0]} c="#6b4423" seg={12} />
      <Sph rad={0.8} p={[0, 3.1, 0]} c="#e0262b" ws={14} hs={10} />
    </G>
  );
};

// ---------------------------------------------------------------- base da distribuidora e o caminhão-tanque
const truckX = (t: number) => lerp(BASE[0] + 8, -8.5, ease(t, T.longe + 0.3, T.entrega - 0.1)); // sai da base no «o posto tá longe»
const Base: React.FC = () => (
  <G p={BASE}>
    {[[-6, -6], [2, -6], [-6, -14], [2, -14]].map(([x, z], i) => <G key={i} p={[x, 0, z]}><Cyl rt={3} h={5} p={[0, 2.5, 0]} c="#f4f6f8" seg={20} /><Cyl rt={3.05} h={0.5} p={[0, 3.6, 0]} c="#3d7be0" seg={20} cast={false} /></G>)}
    <Box s={[18, 0.15, 14]} p={[-2, 0.08, -9]} c="#c9cdd1" cast={false} />
  </G>
);
const Truck: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.prob3 - 0.2 || t > T.prob4) return null;
  const x = truckX(t), moving = t < T.entrega - 0.1, hose = ease(t, T.entrega - 0.05, T.entrega + 0.3);
  return (
    <>
      <G p={[x, 0.95, ROAD_Z - 1.8]}>
        <Box s={[2.6, 2.4, 2.6]} p={[1.0, 1.0, 0]} c="#e0262b" />
        <Box s={[0.1, 1.0, 2.2]} p={[2.32, 1.5, 0]} c="#bfe6ff" o={{ opacity: 0.8 }} cast={false} />
        <Box s={[7, 0.4, 2.4]} p={[-3.6, -0.1, 0]} c="#3a3f45" />
        <Cyl rt={1.3} h={6.6} r={[0, 0, PI / 2]} p={[-3.7, 1.3, 0]} c="#f4f6f8" seg={20} o={{ metal: 0.2, rough: 0.4 }} />
        <Cyl rt={1.33} h={0.5} r={[0, 0, PI / 2]} p={[-3.7, 1.3, 0]} c="#3d7be0" seg={20} cast={false} />
        {[1.2, -2.2, -5.6].flatMap((xx) => [-1, 1].map((s) => <Cyl key={`${xx}${s}`} rt={0.6} h={0.5} r={[PI / 2, 0, 0]} p={[xx, -0.4, s * 1.25]} c="#1d1e21" seg={14} />))}
        {moving ? <Puffs t={t} p={[-7.4, -0.3, 0.6]} n={5} period={0.8} rise={1.2} size={0.4} c="#c9cdd1" drift={[-1.5, 0, 0]} /> : null}
      </G>
      {hose > 0.01 ? <Pipe a={[x - 3.7, 0.6, ROAD_Z - 1.8 - 1.3]} b={[lerp(x - 3.7, LID[0], hose), LID[1] + 0.25, lerp(ROAD_Z - 3.1, LID[2], hose)]} rad={0.14} c="#2b2f36" /> : null}
    </>
  );
};

// ---------------------------------------------------------------- carros: o do gancho (abastece e sai), o da conta, o trânsito
type P = { x: number; z: number; yaw: number };
const carPath = (t: number): P | null => {
  if (t > T.agoraSim + 2.6) return null;
  if (t < 2.4) return { x: CAR_X, z: lerp(26, PUMP[2], ease(t, 0, 2.4)), yaw: 0 };
  if (t < T.agoraSim + 0.4) return { x: CAR_X, z: PUMP[2], yaw: 0 };
  const u = prog(t, T.agoraSim + 0.4, T.agoraSim + 2.6), k = ease(u, 0, 1);
  return k < 0.4 ? { x: CAR_X, z: lerp(PUMP[2], -7, k / 0.4), yaw: 0 } : { x: lerp(CAR_X, 26, (k - 0.4) / 0.6), z: -7, yaw: -PI / 2 * Math.min(1, (k - 0.4) / 0.15) };
};
const CarBody: React.FC<{ p: P; c: string; bob?: number }> = ({ p, c, bob = 0 }) => (
  <G p={[p.x, Y0 + 0.55 + bob, p.z]} r={[0, p.yaw, 0]}>
    <Box s={[2.2, 0.9, 4.2]} p={[0, 0.4, 0]} c={c} />
    <Box s={[1.9, 0.8, 2.2]} p={[0, 1.2, 0.2]} c="#dff2ff" o={{ opacity: 0.85 }} />
    {[-1.4, 1.4].flatMap((zz) => [-1, 1].map((s) => <Cyl key={`${zz}${s}`} rt={0.42} h={0.35} r={[0, 0, PI / 2]} p={[s * 1.1, -0.05, zz]} c="#1d1e21" seg={12} />))}
    <Box s={[0.05, 0.3, 0.3]} p={[-1.12, 0.6, 1.3]} c="#2b2f36" cast={false} />
  </G>
);
const Cars: React.FC<{ t: number }> = ({ t }) => {
  const a = carPath(t), b = t > T.conta - 0.3 ? { x: CAR_X, z: lerp(22, PUMP[2], ease(t, T.conta - 0.3, T.conta + 1.6)), yaw: 0 } : null;
  const traffic = t > T.medio - 0.5 && t < T.buraco - 0.2; // some antes da lembrança do buraco (quadro limpo)
  // a mangueira da bomba até o carro enquanto abastece
  const fill = ease(t, T.bomba, T.bomba + 0.4) * (1 - ease(t, T.agoraSim + 0.1, T.agoraSim + 0.4));
  return (
    <>
      {a ? <CarBody p={a} c="#ff7a1a" /> : null}
      {b ? <CarBody p={b} c="#2fcf6a" /> : null}
      {traffic ? [0, 1, 2, 3].map((k) => { const u = ((t - T.medio) * 0.11 + k * 0.25) % 1, dir = k % 2 ? 1 : -1; return <CarBody key={k} p={{ x: dir * lerp(-60, 60, u), z: ROAD_Z + (dir > 0 ? 2 : -2), yaw: dir > 0 ? -PI / 2 : PI / 2 }} c={["#3d7be0", "#ffd400", "#e0262b", "#f4f6f8"][k]} />; }) : null}
      {fill > 0.01 ? <Pipe a={[PUMP[0] + 0.58, Y0 + 1.3, PUMP[2] + 0.45]} b={[lerp(PUMP[0] + 0.6, CAR_X - 1.15, fill), Y0 + 1.15, lerp(PUMP[2] + 0.45, PUMP[2] + 1.3, fill)]} rad={0.07} c="#14202b" /> : null}
    </>
  );
};

// ---------------------------------------------------------------- a maquininha do cartão (morde a moeda)
const Maquininha: React.FC<{ t: number }> = ({ t }) => {
  const on = pk(t, T.conta, 0.4); if (on < 0.01) return null;
  const bite = t > T.maquininha + 0.2 && t < T.maquininha + 1.2 ? Math.abs(Math.sin((t - T.maquininha - 0.2) * 9)) : 0;
  return (
    <G p={MAQ} sc={on}>
      <Cyl rt={0.35} h={1.2} p={[0, 0.6, 0]} c="#9aa3ab" seg={10} />
      <G p={[0, 1.2, 0]} r={[-0.35, 0.5, 0]} sc={1.6}>
        <Box s={[0.75, 1.1, 0.28]} p={[0, 0.55, 0]} c="#2b2f36" />
        <Box s={[0.6, 0.38, 0.03]} p={[0, 0.8, 0.15]} c="#8fe3a0" o={{ emissive: "#5cff7a", ei: 0.5 }} cast={false} />
        {Array.from({ length: 9 }, (_, k) => <Box key={k} s={[0.14, 0.09, 0.03]} p={[-0.18 + (k % 3) * 0.18, 0.46 - Math.floor(k / 3) * 0.13, 0.15]} c="#e9e4d8" cast={false} />)}
        {/* a «boca»: a tampa da bobina abre e fecha */}
        <G p={[0, 1.1, -0.12]} r={[-0.9 * bite, 0, 0]}><Box s={[0.75, 0.12, 0.3]} p={[0, 0.06, 0.14]} c="#3a3f45" /></G>
      </G>
    </G>
  );
};

// ---------------------------------------------------------------- moedas: a fatia do posto se reparte; o dia de vendas; quem paga
const LITGOLD = (): V3 => [LIT[0], sliceY(5) + 0.5, LIT[2]];
const Money: React.FC<{ t: number }> = ({ t }) => {
  const out: React.ReactNode[] = [];
  const burst = (t0: number, to: V3, n: number, key: string, from: V3 = LITGOLD(), h = 3, dur = 0.9) => {
    for (let k = 0; k < n; k++) { const u = prog(t, t0 + k * 0.07, t0 + k * 0.07 + dur); if (u > 0 && u < 1) out.push(<Coin key={key + k} p={arc(from, [to[0] + (rnd(k) - 0.5), to[1], to[2] + (rnd(k + 9) - 0.5)], u, h)} spin={u * 8} />); }
  };
  burst(T.frentista, [SIDE[0], 2.4, SIDE[2]], 6, "f");
  burst(T.luz, [0, 6, 0], 5, "l", LITGOLD(), 4);
  burst(T.aluguel, [-1.5, 1.4, -9.4], 6, "a", LITGOLD(), 4, 1.1);
  burst(T.maquininha + 0.05, [MAQ[0], 2.5, MAQ[2]], 7, "m", LITGOLD(), 2.2, 0.7);
  // o dia de vendas: pilhas de moedas crescem ao lado da loja; quase tudo vai embora para os donos das outras fatias
  const PILE: V3 = [7.5, Y0, 4.5];
  const grow = ease(t, T.entram, T.entram + 1.2), keep = 1 - 0.85 * ease(t, T.ficam + 0.2, T.ficam + 1.6);
  if (t > T.entram - 0.1 && t < T.chute) {
    const N = 20;
    for (let c = 0; c < N; c++) {
      const hgt = Math.round(10 * grow * (0.6 + 0.4 * rnd(c))), stays = c < Math.ceil(N * 0.15);
      const dest: V3 = [[REF[0], 8, REF[2]], [USINA[0], 8, USINA[2]], [LIT[0], LIT_TOP + 6, LIT[2]], [BASE[0], 6, BASE[2]]][c % 4] as V3;
      const fly = stays ? 0 : clamp((1 - keep) / 0.85 * 1.15 - (c % 5) * 0.05);
      const base: V3 = [PILE[0] + (c % 5) * 0.8 - 1.6, Y0, PILE[2] + Math.floor(c / 5) * 0.8 - 1.2];
      if (fly >= 1) continue;
      const p0 = fly > 0 ? arc(base, dest, fly, 10) : base;
      for (let k = 0; k < hgt; k++) out.push(<Cyl key={`p${c}_${k}`} rt={0.34} h={0.09} p={[p0[0], p0[1] + 0.05 + k * 0.1, p0[2]]} c="#ffcf2a" o={{ metal: 0.6, emissive: "#a87a00", ei: 0.35 }} seg={12} cast={false} />);
    }
  }
  // quem paga é você: moedas saem da janela do carro verde para o litro
  if (t > T.quemPaga - 0.1 && t < T.chute + 0.6) for (let k = 0; k < 10; k++) { const u = ((t - T.quemPaga) * 0.9 + k / 10) % 1; out.push(<Coin key={"q" + k} p={arc([CAR_X - 1.2, Y0 + 1.9, PUMP[2] + 0.6], [LIT[0], LIT_TOP + 0.3, LIT[2]], u, 3)} spin={u * 9} />); }
  return <>{out}</>;
};

// ---------------------------------------------------------------- mundo
export const World: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Sky top="#2f86e8" mid="#7cc0f7" low="#e9f5ff" />
    <Hills c={["#6fbe58", "#7ccb62"]} z={-150} n={30} x0={-120} flat={0.6} />
    <Clouds t={t} n={9} y={36} />
    <Ground t={t} />
    <Calendar t={t} />
    <Refinery t={t} />
    <Usina t={t} />
    <Base />
    <Truck t={t} />
    <Cars t={t} />
    <Liter t={t} />
    <Stamp t={t} />
    <Maquininha t={t} />
    <Money t={t} />
  </>
);
