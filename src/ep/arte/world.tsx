// Mundo do episódio «arte» (Mundo em Peças, MEP20, série «A conta por trás»): uma galeria de brinquedo.
// Na parede, um quadro de um artista que ninguém conhece com a plaquinha de R$ 1.000.000. A graça é por insinuação: na hora
// da «lavagem» a tela do quadro vira a porta redonda de uma máquina de lavar e gira; moedas sujas entram de um saco e saem
// brilhando, com um recibo. Depois: o gráfico de preço do artista (o pico que destoa), o comprador com uma caixa na cabeça,
// a maleta de dinheiro vivo, o alarme do COAF na parede, e um depósito de caixas fechadas (porto franco) longe dali.
// Nada aqui ensina a lavar: o mundo mostra por que é difícil ver e o que acende o alarme.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Quad, Sph, V3, clamp, ease, lerp, outBack, prog, rnd } from "../../toy/kit";
import { Clouds, Hills, Sky } from "../../toy/scenery";
import { T } from "./cues";
import { COSTUMES, Worker, poseOf } from "../../toy/worker";

const BUYER = { ...COSTUMES.mep, top: "#5d6670", bottom: "#2b2f36", hat: "none" as const, hatC: "#000" };

const PI = Math.PI;
const Y0 = 0.2; // topo do piso da galeria
export const PAINT: V3 = [0, 3.7, -5.75]; // centro do quadro na parede do fundo
export const PW = 4.4, PH = 3.3; // tamanho da tela
export const SIDE: V3 = [2.6, Y0, 0.6]; // onde o operário fala
export const BAG: V3 = [-4.6, Y0, -3.2]; // o saco de moedas sujas
export const STACK: V3 = [4.6, Y0, -3.2]; // a pilha limpa + recibo
export const CHART: V3 = [-6.5, Y0, 1.5]; // o pedestal com o gráfico de preços do artista
export const BUY: V3 = [5.6, Y0, 1.8]; // o comprador de caixa na cabeça
export const ALARM: V3 = [-11.6, 6.6, -2.5]; // a sirene do COAF na parede esquerda
export const OBRA: V3 = [8.5, Y0, -2.8]; // a bombinha de gasolina num pedestal (lembrança do vídeo do posto)
export const WH: V3 = [80, 0, -40]; // o depósito de caixas (porto franco), longe da galeria

const pk = (t: number, t0: number, d = 0.4) => (t < t0 ? 0 : outBack(prog(t, t0, t0 + d)));
const arc = (a: V3, b: V3, u: number, h: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + h * Math.sin(u * PI), lerp(a[2], b[2], u)];
const Coin: React.FC<{ p: V3; s?: number; spin?: number; dirty?: number }> = ({ p, s = 1, spin = 0, dirty = 0 }) => (
  <Cyl rt={0.3 * s} h={0.08 * s} p={p} r={[PI / 2 + spin, spin * 0.7, 0]} c={dirty > 0.5 ? "#6e5232" : "#ffcf2a"}
    o={dirty > 0.5 ? { rough: 1 } : { metal: 0.6, emissive: "#a87a00", ei: 0.4 }} seg={12} cast={false} />
);

/** textura de texto em canvas (placa de preço, etiquetas) */
const useTextTex = (lines: [string, string, number][], w = 512, h = 160, bg = "#f7f3e8") => useMemo(() => {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const g = cv.getContext("2d")!; g.fillStyle = bg; g.fillRect(0, 0, w, h); g.textAlign = "center"; g.textBaseline = "middle";
  lines.forEach(([txt, col, px], i) => { g.fillStyle = col; g.font = `bold ${px}px Arial, sans-serif`; g.fillText(txt, w / 2, (h * (i + 0.5)) / lines.length + 4); });
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}, []); // eslint-disable-line react-hooks/exhaustive-deps
const TextPlane: React.FC<{ lines: [string, string, number][]; p: V3; w: number; h: number; r?: V3; bg?: string; glow?: number }> = ({ lines, p, w, h, r, bg, glow = 0.35 }) => {
  const tex = useTextTex(lines, 512, Math.round((512 * h) / w), bg);
  const m = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, emissive: "#ffffff", emissiveMap: tex, emissiveIntensity: glow }), [tex, glow]);
  return <mesh position={p} rotation={r} material={m}><planeGeometry args={[w, h]} /></mesh>;
};

// ---------------------------------------------------------------- a sala: piso de madeira, paredes brancas, spots
const Room: React.FC<{ t: number }> = ({ t }) => {
  const red = t > T.alarme && t < T.agoraSim ? 0.5 + 0.5 * Math.sin((t - T.alarme) * 9) : 0;
  return (
    <>
      <Box s={[900, 0.2, 600]} p={[0, -0.1, 0]} c="#86c95a" cast={false} />
      <Box s={[26, Y0, 18]} p={[0, Y0 / 2, 0]} c="#c8935a" />
      {Array.from({ length: 13 }, (_, i) => <Box key={i} s={[0.05, 0.01, 18]} p={[-12 + i * 2, Y0 + 0.005, 0]} c="#a87644" cast={false} />)}
      <Box s={[26, 9, 0.5]} p={[0, 4.5, -6.25]} c="#f5f3ee" />
      <Box s={[0.5, 9, 18]} p={[-12.75, 4.5, 0]} c="#efece6" />
      <Box s={[26, 0.25, 0.55]} p={[0, 0.3, -5.95]} c="#2b2f36" cast={false} />
      {/* trilho de spots */}
      <Box s={[22, 0.15, 0.15]} p={[0, 8.6, -3.5]} c="#2b2f36" cast={false} />
      {[-6, 0, 6].map((x) => <G key={x} p={[x, 8.3, -3.5]}><Cyl rt={0.18} rb={0.3} h={0.6} r={[0.7, 0, 0]} c="#2b2f36" seg={10} /></G>)}
      {/* a sirene do COAF: apagada até o alarme, depois pisca vermelho */}
      <G p={ALARM}>
        <Box s={[0.3, 0.8, 0.8]} p={[0.15, -0.5, 0]} c="#3a3f45" />
        <Sph rad={0.75} ps={0} pl={PI / 2} p={[0.45, 0, 0]} r={[0, 0, -PI / 2]} c={red > 0.2 ? "#ff2a2a" : "#8a2020"} o={{ emissive: "#ff1a1a", ei: 2.2 * red, opacity: 0.95 }} />
        {/* raios da sirene quando liga */}
        {red > 0.2 ? [0.5, 1.3, 2.1, 2.9].map((a, k) => <Box key={k} s={[0.08, 0.6, 0.08]} p={[0.9 + 0.75 * Math.cos(a - PI / 2) * 0, 1.15 * Math.cos(a), 1.15 * Math.sin(a) - 0.6]} r={[a, 0, 0]} c="#ff4a4a" o={{ emissive: "#ff2a2a", ei: 2 * red }} cast={false} />) : null}
        {/* placa «COAF» embaixo: sem ela a sirene vira só uma bola vermelha */}
        <TextPlane lines={[["COAF", "#ffffff", 120]]} p={[0.36, -0.1, -1.9]} r={[0, PI / 2, 0]} w={1.5} h={0.5} bg="#14202b" glow={0.5} />
      </G>
      {/* bancos e uma planta: cara de galeria */}
      <Box s={[3, 0.5, 1]} p={[0, Y0 + 0.25, 3.5]} c="#3a3f45" />
      <Cyl rt={0.45} rb={0.35} h={0.8} p={[-10.5, Y0 + 0.4, -4.8]} c="#e8e3d8" seg={12} />
      <Cone rad={0.9} h={2.4} p={[-10.5, Y0 + 2, -4.8]} c="#3fae2c" seg={7} o={{ flat: true }} />
      {/* outros quadros menores na parede esquerda */}
      {[[-12.45, 3.6, -1.5, "#3d7be0"], [-12.45, 3.6, 2.5, "#e58a17"]].map(([x, y, z, c], i) => (
        <G key={i} p={[x as number, y as number, z as number]} r={[0, PI / 2, 0]}>
          <Box s={[2.2, 1.7, 0.12]} c="#c9a24a" /><Box s={[1.9, 1.4, 0.14]} p={[0, 0, 0.02]} c="#f4efe2" />
          <Sph rad={0.45} p={[0, 0, 0.12]} sc={[1, 1, 0.1]} c={c as string} />
        </G>
      ))}
    </>
  );
};

// ---------------------------------------------------------------- o quadro: tela abstrata que vira a porta da máquina de lavar
const WASH0 = () => T.lava, WASH1 = () => T.limpo + 1.4;
const Painting: React.FC<{ t: number }> = ({ t }) => {
  const w0 = WASH0(), w1 = WASH1();
  const door = ease(t, w0 - 0.2, w0 + 0.35) * (1 - ease(t, w1, w1 + 0.4)); // 0 = tela, 1 = porta redonda
  const spin = t < w0 ? 0 : (Math.min(t, w1) - w0) * 7 * door;
  const wob = door > 0.1 ? Math.sin(t * 22) * 0.025 * door : 0;
  const glow = ease(t, T.hook, T.hook + 0.3);
  return (
    <G p={[PAINT[0] + wob, PAINT[1], PAINT[2]]}>
      {/* moldura dourada */}
      <Box s={[PW + 0.5, PH + 0.5, 0.2]} c="#d4a63a" o={{ metal: 0.5, rough: 0.4 }} />
      <Box s={[PW, PH, 0.22]} p={[0, 0, 0.02]} c="#f6f1e4" />
      {/* a obra: três formas e um rabisco (o «artista que ninguém conhece») — gira junto quando vira tambor */}
      <G p={[0, 0, 0.14]} r={[0, 0, spin]} sc={1 - 0.35 * door}>
        <Box s={[1.5, 1.5, 0.04]} p={[-0.9, 0.35, 0]} r={[0, 0, 0.18]} c="#e0262b" />
        <Cyl rt={0.75} h={0.04} p={[0.95, -0.25, 0.01]} r={[PI / 2, 0, 0]} c="#2f6fe0" seg={24} />
        <Box s={[3.2, 0.14, 0.04]} p={[0.1, -1.05, 0.02]} r={[0, 0, -0.12]} c="#ffcf1a" />
        <Box s={[0.12, 1.6, 0.04]} p={[1.6, 0.7, 0.02]} r={[0, 0, 0.4]} c="#1c1c1c" />
      </G>
      {/* a porta da máquina: anel cromado + vidro + espuma; só aparece na lavagem */}
      <G p={[0, 0, 0.2]} sc={Math.max(0.001, door)} vis={door > 0.01}>
        <Cyl rt={1.45} h={0.18} r={[PI / 2, 0, 0]} c="#c8ced4" o={{ metal: 0.8, rough: 0.25 }} seg={32} open />
        <Cyl rt={1.3} h={0.05} p={[0, 0, 0.02]} r={[PI / 2, 0, 0]} c="#bfe6ff" o={{ opacity: 0.45 }} seg={32} cast={false} />
        {Array.from({ length: 9 }, (_, i) => { const a = spin * 1.3 + (i * 2 * PI) / 9; const rr = 0.55 + 0.35 * rnd(i); return <Sph key={i} rad={0.16 + 0.08 * rnd(i + 3)} p={[Math.cos(a) * rr, Math.sin(a) * rr, -0.05]} c="#ffffff" o={{ opacity: 0.85 }} cast={false} />; })}
        {Array.from({ length: 6 }, (_, i) => { const a = -spin * 0.9 + (i * 2 * PI) / 6; return <Coin key={i} p={[Math.cos(a) * 0.7, Math.sin(a) * 0.7, -0.08]} s={0.8} spin={a} dirty={t < (w0 + w1) / 2 ? 1 : 0} />; })}
      </G>
      {/* luz de spot sobre o quadro */}
      <Quad w={PW + 2.4} h={PH + 2.4} p={[0, 0, -0.01]} c="#fff6d8" o={{ opacity: 0.35 * glow, emissive: "#fff6d8", ei: 0.6 }} />
      {/* a plaquinha do preço */}
      <G p={[2.9, -1.6, 0.12]}>
        <G vis={!(t > T.semTabela && t < T.vale)}><TextPlane lines={[["SEM TÍTULO, 2026", "#555555", 30], ["R$ 1.000.000", "#14202b", 64]]} p={[0, 0, 0]} w={1.6} h={0.55} /></G>
        <G vis={t > T.semTabela && t < T.vale}><TextPlane lines={[["SEM TÍTULO, 2026", "#555555", 30], ["R$ ?", "#b01818", 72]]} p={[0, 0, 0.001]} w={1.6} h={0.55} /></G>
      </G>
    </G>
  );
};

// ---------------------------------------------------------------- o dinheiro: entra sujo do saco, sai limpo com recibo
const Money: React.FC<{ t: number }> = ({ t }) => {
  const w0 = WASH0(), w1 = WASH1();
  const mouth: V3 = [PAINT[0], PAINT[1], PAINT[2] + 0.4];
  const bagIn = pk(t, T.sujo - 0.4) * (1 - ease(t, T.limpo + 2.5, T.limpo + 3));
  const stackN = Math.floor(clamp((t - T.limpo) / 0.12, 0, 12));
  const receipt = pk(t, T.recibo, 0.5) * (1 - ease(t, T.litro - 0.2, T.litro));
  return (
    <>
      {/* o saco (marrom, encardido) */}
      <G p={BAG} sc={Math.max(0.001, bagIn)} vis={bagIn > 0.01}>
        <Sph rad={0.9} p={[0, 0.85, 0]} sc={[1, 1.1, 1]} c="#7a5a36" o={{ rough: 1 }} />
        <Cyl rt={0.25} rb={0.4} h={0.4} p={[0, 1.9, 0]} c="#6a4c2c" seg={10} />
        {[0, 1, 2].map((k) => <Sph key={k} rad={0.18} p={[0.5 - k * 0.45, 0.6 + 0.3 * k, 0.75]} c="#4a3420" cast={false} />)}
      </G>
      {/* moedas sujas voando para o quadro */}
      {t > T.sujo && t < w0 + 1.2 ? Array.from({ length: 10 }, (_, i) => {
        const t0 = T.sujo + i * 0.16, u = clamp((t - t0) / 0.7); if (u <= 0 || u >= 1) return null;
        return <Coin key={i} p={arc([BAG[0], 2.2, BAG[2]], mouth, u, 1.6)} spin={u * 8 + i} dirty={1} />;
      }) : null}
      {/* moedas limpas saindo para a pilha */}
      {t > T.limpo && t < w1 + 0.8 ? Array.from({ length: 12 }, (_, i) => {
        const t0 = T.limpo + i * 0.12, u = clamp((t - t0) / 0.6); if (u <= 0 || u >= 1) return null;
        return <Coin key={i} p={arc(mouth, [STACK[0], STACK[1] + 0.1 + i * 0.09, STACK[2]], u, 1.4)} spin={u * 7 + i} />;
      }) : null}
      <G p={STACK} vis={t > T.limpo && t < T.litro}>
        {Array.from({ length: stackN }, (_, i) => <Coin key={i} p={[0.02 * Math.sin(i), 0.1 + i * 0.09, 0]} spin={-PI / 2 + 0.05 * i} />)}
      </G>
      {/* o recibo: papel branco que sobe ao lado da pilha */}
      <G p={[STACK[0] - 1.2, Y0 + 1.5, STACK[2] + 0.6]} sc={Math.max(0.001, receipt)} vis={receipt > 0.01} r={[0, -0.3, 0.06 * Math.sin(t * 3)]}>
        <TextPlane lines={[["RECIBO", "#14202b", 56], ["1 QUADRO", "#444444", 40], ["R$ 1.000.000", "#0b7a35", 48]]} p={[0, 0, 0]} w={1.5} h={1.6} bg="#ffffff" glow={0.5} />
      </G>
    </>
  );
};

// ---------------------------------------------------------------- o gráfico de preços do artista: 4 vendas pequenas e o pico
const Chart: React.FC<{ t: number }> = ({ t }) => {
  const H = [0.35, 0.42, 0.38, 0.5]; // ≈ R$ 3 mil cada (régua de brinquedo)
  const up = ease(t, T.pico, T.pico + 0.9); // a 5ª coluna sobe até o teto
  return (
    <G p={CHART}>
      <Box s={[3.6, 1.0, 1.6]} p={[0, 0.5, 0]} c="#2b2f36" />
      {H.map((h, i) => <Box key={i} s={[0.5, h, 0.5]} p={[-1.3 + i * 0.62, 1.0 + h / 2, 0]} c="#8fd14f" />)}
      <Box s={[0.5, 0.05 + 6.0 * up, 0.5]} p={[1.18, 1.0 + (0.05 + 6.0 * up) / 2, 0]} c="#e0262b" o={{ emissive: "#ff2a2a", ei: 0.5 * up }} />
      {/* a régua: uma linha no nível das vendas normais */}
      <Box s={[3.4, 0.04, 0.04]} p={[0, 1.55, 0.3]} c="#ffffff" cast={false} />
    </G>
  );
};

// ---------------------------------------------------------------- o comprador: caixa de papelão na cabeça, maleta de dinheiro vivo
const Buyer: React.FC<{ t: number }> = ({ t }) => {
  const inn = ease(t, T.comprador - 0.5, T.comprador + 0.2);
  const bag = pk(t, T.vivo, 0.4);
  const p: V3 = [lerp(BUY[0] + 4, BUY[0], inn), BUY[1], BUY[2]];
  return (
    <G vis={t > T.comprador - 0.6}>
      <Worker p={p} yaw={-0.9} pose={poseOf(inn < 1 ? "walk" : "idle", t)} t={t} c={BUYER} mustache={false} />
      {/* a caixa na cabeça, com um «?» */}
      <G p={[p[0], p[1] + 1.95, p[2]]} r={[0, -0.9, 0]}>
        <Box s={[0.85, 0.75, 0.85]} c="#c89a5c" />
        <TextPlane lines={[["?", "#3a2300", 120]]} p={[0, 0, 0.43]} w={0.6} h={0.6} bg="#c89a5c" glow={0.2} />
      </G>
      {/* maleta aberta com notas verdes */}
      <G p={[p[0] - 0.9, Y0 + 0.4, p[2] + 0.6]} sc={Math.max(0.001, bag)} vis={bag > 0.01} r={[0, -0.6, 0]}>
        <Box s={[1.2, 0.3, 0.8]} c="#3a2b24" />
        {[0, 1, 2, 3].map((k) => <Box key={k} s={[0.5, 0.06, 0.28]} p={[-0.28 + (k % 2) * 0.56, 0.18 + Math.floor(k / 2) * 0.06, 0]} c="#3fae5c" cast={false} />)}
        <Box s={[1.2, 0.8, 0.06]} p={[0, 0.55, -0.42]} r={[-0.25, 0, 0]} c="#3a2b24" />
      </G>
    </G>
  );
};

// ---------------------------------------------------------------- o porto franco: um galpão de caixas que não abrem
const Warehouse: React.FC<{ t: number }> = ({ t }) => {
  const lift = ease(t, T.caixas, T.caixas + 1.2);
  return (
    <G p={WH}>
      <Box s={[40, 0.2, 30]} p={[0, 0.1, 0]} c="#b9bec4" />
      <Box s={[40, 10, 0.4]} p={[0, 5, -15]} c="#8d949b" />
      <Box s={[0.4, 10, 30]} p={[-20, 5, 0]} c="#9aa1a8" />
      {Array.from({ length: 6 }, (_, r) => Array.from({ length: 8 }, (_, c) => Array.from({ length: 3 }, (_, k) => {
        const h = 1.4, x = -15 + c * 4.2, z = -11 + r * 3.6, y = 0.2 + h / 2 + k * h * (k ? lift : 1);
        return <G key={`${r}${c}${k}`} vis={k === 0 || lift > 0.02}><Box s={[3, h * 0.95, 2.4]} p={[x, y, z]} c={(r + c + k) % 3 ? "#c8955a" : "#b98447"} />
          <Box s={[3.02, 0.12, 0.3]} p={[x, y + h * 0.3, z + 1.06]} c="#7a5530" cast={false} /></G>;
      })))}
      {/* montanhas nevadas atrás (Genebra) */}
      {[[-30, -60, 18], [0, -70, 24], [30, -62, 20]].map(([x, z, h], i) => <G key={i}><Cone rad={h * 0.9} h={h} p={[x, h / 2, z]} c="#6f8a9e" seg={7} o={{ flat: true }} /><Cone rad={h * 0.32} h={h * 0.36} p={[x, h * 0.82, z]} c="#ffffff" seg={7} o={{ flat: true }} /></G>)}
    </G>
  );
};

// ---------------------------------------------------------------- a bombinha do posto como «obra» num pedestal (o vídeo anterior)
const Obra: React.FC = () => (
  // ponytail: a placa fica virada para +z (a câmera do plano «litro» olha de frente)
  <G p={OBRA}>
    <Box s={[1.4, 1.2, 1.4]} p={[0, 0.6, 0]} c="#f5f3ee" />
    <G p={[0, 1.2, 0]}>
      <Box s={[0.5, 1.2, 0.8]} p={[0, 0.6, 0]} c="#f4f6f8" />
      <Box s={[0.54, 0.25, 0.84]} p={[0, 1.25, 0]} c="#ff7a1a" />
      <Box s={[0.02, 0.3, 0.55]} p={[0.27, 0.85, 0]} c="#14202b" cast={false} />
    </G>
    <G p={[-1.3, 0, 0.3]}>
      <Cyl rt={0.06} h={2.6} p={[0, 1.3, 0]} c="#9aa3ab" seg={8} />
      <Box s={[1.3, 0.75, 0.12]} p={[0, 2.85, 0]} c="#ff7a1a" />
      <TextPlane lines={[["GASOLINA", "#ffffff", 46], ["6,48", "#ffd400", 96]]} p={[0, 2.85, 0.07]} w={1.15} h={0.62} bg="#14202b" glow={0.5} />
    </G>
  </G>
);

export const World: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Sky top="#2f86e8" mid="#7cc0f7" low="#e9f5ff" />
    <Hills c={["#6fbe58", "#7ccb62"]} z={-150} n={30} x0={-120} flat={0.6} />
    <Clouds t={t} n={9} y={36} />
    <Room t={t} />
    <Painting t={t} />
    <Money t={t} />
    <Chart t={t} />
    <Buyer t={t} />
    <Obra />
    <Warehouse t={t} />
  </>
);
