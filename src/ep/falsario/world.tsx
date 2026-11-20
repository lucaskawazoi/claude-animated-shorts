// Mundo do E16: Han van Meegeren. Estações ao longo de x (chão das salas y=0.3, fundo z=-6, frente aberta z=2):
// salão de Göring (-36) · tribunal (-62) e praça (-62, z=12) · ateliê com cavalete (-2), mesa da baquelita (4), forno (9),
// mesa do cilindro (13) · feira (26, z=6) · galeria dos peritos: críticos (38), teste do álcool (44), Bredius (50).
// Sem símbolos políticos: Göring é um boneco de farda cinza-azul, sem insígnia.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Sph, V3, clamp, ease, lerp, prog, rnd } from "../../toy/kit";
import { Clouds, Ground, GroundPal, Hills, Puffs, Sky, Trees } from "../../toy/scenery";
import { Crowd, Worker, poseOf, PoseName } from "../../toy/worker";
import { T } from "./cues";

const PI = Math.PI;
export const Y = 0.3;
const WOOD = "#9a6a3a", PLASTER = "#f1e6d2", BRICK = "#a8472f", GOLD = "#d9a83a";
const GROUND: GroundPal = { base: "#86c94e", patch: ["#7cc046", "#93d35c", "#80c24a"], blade: "#58a832", flowers: ["#ffe14a", "#ffffff", "#ff7aa8"], x: [-90, 80], z: [-40, 50], nBlades: 420 };
export const ST = { hall: -36, court: -62, easel: -2, table: 4, oven: 9, roll: 13, market: 26, critics: 38, test: 44, bredius: 50 };

// ---------------------------------------------------------------- texturas dos quadros (desenhadas no canvas)
const canvasTex = (draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, w = 192, h = 224) => {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h; draw(cv.getContext("2d")!, w, h);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return tx;
};
const drawVermeer = (g: CanvasRenderingContext2D, w: number, h: number) => {
  // interior holandês: parede clara, janela à esquerda, mulher de casaco amarelo e saia azul, jarra branca na mesa
  const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "#d9cfa8"); gr.addColorStop(1, "#6e6448"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = "#e9f0e4"; g.fillRect(10, 18, 44, 86); g.strokeStyle = "#5b4a30"; g.lineWidth = 3; g.strokeRect(10, 18, 44, 86); g.beginPath(); g.moveTo(32, 18); g.lineTo(32, 104); g.moveTo(10, 60); g.lineTo(54, 60); g.stroke();
  g.fillStyle = "#3a3324"; g.fillRect(0, 150, w, h - 150);
  g.fillStyle = "#6a3a22"; g.fillRect(14, 140, 92, 40);                                // mesa
  g.fillStyle = "#f4f1e6"; g.beginPath(); g.ellipse(46, 128, 11, 16, 0, 0, PI * 2); g.fill(); // jarra
  g.fillStyle = "#2f4f9f"; g.beginPath(); g.moveTo(96, 120); g.lineTo(150, 120); g.lineTo(162, 210); g.lineTo(86, 210); g.closePath(); g.fill(); // saia azul
  g.fillStyle = "#e2b93b"; g.fillRect(100, 74, 46, 52);                                 // casaco amarelo
  g.fillStyle = "#e7c09a"; g.beginPath(); g.arc(122, 58, 15, 0, PI * 2); g.fill();      // rosto
  g.fillStyle = "#f6f3ea"; g.beginPath(); g.arc(122, 50, 17, PI, 0); g.fill();          // touca branca
  g.fillStyle = "#e7c09a"; g.fillRect(84, 100, 22, 9);                                  // braço
  const lg = g.createRadialGradient(40, 60, 4, 40, 60, 150); lg.addColorStop(0, "rgba(255,250,220,0.35)"); lg.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = lg; g.fillRect(0, 0, w, h);
};
const drawOld = (g: CanvasRenderingContext2D, w: number, h: number) => {
  // quadro barato do séc. XVII: cena escura e marrom, verniz amarelado
  g.fillStyle = "#4a3420"; g.fillRect(0, 0, w, h);
  g.fillStyle = "#7a5530"; g.beginPath(); g.ellipse(70, 120, 30, 60, 0.1, 0, PI * 2); g.fill(); g.beginPath(); g.ellipse(130, 130, 26, 54, -0.1, 0, PI * 2); g.fill();
  g.fillStyle = "#b08a50"; g.beginPath(); g.arc(70, 66, 14, 0, PI * 2); g.fill(); g.beginPath(); g.arc(130, 82, 13, 0, PI * 2); g.fill();
  g.fillStyle = "rgba(200,160,60,0.25)"; g.fillRect(0, 0, w, h);
};
const drawMine = (g: CanvasRenderingContext2D, w: number, h: number) => {
  // o estilo dele que os críticos desprezam: pôr do sol rosa e um cervo
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#ff8ab3"); gr.addColorStop(0.6, "#ffd36b"); gr.addColorStop(1, "#5fae5f"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = "#ffef9a"; g.beginPath(); g.arc(w / 2, 120, 26, 0, PI * 2); g.fill();
  g.fillStyle = "#8a5a32"; g.fillRect(70, 150, 52, 24); g.fillRect(74, 172, 6, 22); g.fillRect(112, 172, 6, 22); g.fillRect(114, 128, 10, 26);
};
const drawCracks = (g: CanvasRenderingContext2D, w: number, h: number) => {
  g.clearRect(0, 0, w, h); g.strokeStyle = "#ffffff"; g.lineWidth = 1.1;
  for (let k = 0; k < 70; k++) {
    let x = rnd(k) * w, y = rnd(k + 99) * h, a = rnd(k + 7) * PI * 2; g.beginPath(); g.moveTo(x, y);
    for (let s = 0; s < 6; s++) { a += (rnd(k * 13 + s) - 0.5) * 1.6; x += Math.cos(a) * 12; y += Math.sin(a) * 12; g.lineTo(x, y); }
    g.stroke();
  }
};
const drawSmear = (g: CanvasRenderingContext2D, w: number, h: number) => {
  g.clearRect(0, 0, w, h); g.fillStyle = "#ffffff";
  for (let k = 0; k < 18; k++) { g.globalAlpha = 0.5; g.beginPath(); g.ellipse(w * 0.55 + k * 2, h * 0.45 + (k % 3) * 4, 30, 7, 0.4, 0, PI * 2); g.fill(); }
};
const useTex = () => useMemo(() => ({
  vermeer: canvasTex(drawVermeer), old: canvasTex(drawOld), mine: canvasTex(drawMine), cracks: canvasTex(drawCracks, 256, 300), smear: canvasTex(drawSmear),
}), []);
type Tex = ReturnType<typeof useTex>;

/** um quadro: base (b) + camada que entra da esquerda (top, revela 0–1) + rachaduras (k) e tinta nelas (ink) + mancha (smear) */
const own = (x: THREE.Texture) => { const c = x.clone(); c.needsUpdate = true; return c; };
const Painting: React.FC<{ tex: Tex; p: V3; r?: V3; w?: number; h?: number; base: THREE.Texture | string; top?: THREE.Texture; reveal?: number;
  cracks?: number; ink?: number; smear?: number; frame?: boolean; vis?: boolean; sc?: number; crop?: number }> =
  ({ tex, p, r = [0, 0, 0], w = 1.6, h = 1.9, base, top, reveal = 0, cracks = 0, ink = 0, smear = 0, frame = true, vis = true, sc = 1, crop = 1 }) => {
    // ponytail: cada quadro tem cópias próprias das texturas (a imagem é a mesma; só repeat/offset mudam por quadro)
    const mats = useMemo(() => ({
      base: typeof base === "string" ? new THREE.MeshStandardMaterial({ color: base, roughness: 0.95 }) : new THREE.MeshStandardMaterial({ map: own(base), roughness: 0.85 }),
      top: top ? new THREE.MeshStandardMaterial({ map: own(top), roughness: 0.6 }) : null,
      crack: new THREE.MeshBasicMaterial({ color: "#3a2a1a", alphaMap: own(tex.cracks), transparent: true, depthWrite: false }),
      ink: new THREE.MeshBasicMaterial({ color: "#050505", alphaMap: own(tex.cracks), transparent: true, depthWrite: false }),
      smear: new THREE.MeshBasicMaterial({ color: "#8a6a3a", alphaMap: own(tex.smear), transparent: true, depthWrite: false }),
    }), [base, top, tex]);
    const cr = clamp(crop, 0.02, 1), hv = h * cr, yv = -h / 2 + hv / 2;
    mats.crack.opacity = clamp(cracks) * 0.6; mats.ink.opacity = clamp(ink) * 0.85; mats.smear.opacity = clamp(smear);
    for (const m of [mats.base, mats.crack, mats.ink, mats.smear]) { const mp = (m.map ?? m.alphaMap) as THREE.Texture | null; if (mp) { mp.repeat.set(1, cr); mp.offset.set(0, 0); } }
    if (mats.top) { mats.top.map!.repeat.set(Math.max(0.001, reveal), cr); mats.top.map!.offset.set(0, 0); }
    return (
      <group position={p} rotation={r} scale={[sc, sc, sc]} visible={vis}>
        <mesh material={mats.base} position={[0, yv, 0]}><planeGeometry args={[w, hv]} /></mesh>
        {mats.top && reveal > 0.001 ? <mesh material={mats.top} position={[-w / 2 + (w * reveal) / 2, yv, 0.005]}><planeGeometry args={[w * reveal, hv]} /></mesh> : null}
        {cracks > 0.01 ? <mesh material={mats.crack} position={[0, yv, 0.01]}><planeGeometry args={[w, hv]} /></mesh> : null}
        {ink > 0.01 ? <mesh material={mats.ink} position={[0, yv, 0.012]}><planeGeometry args={[w, hv]} /></mesh> : null}
        {smear > 0.01 ? <mesh material={mats.smear} position={[0, yv, 0.014]}><planeGeometry args={[w, hv]} /></mesh> : null}
        {frame ? <>
          <Box s={[w + 0.3, 0.15, 0.12]} p={[0, h / 2 + 0.07, 0]} c={GOLD} o={{ metal: 0.5, rough: 0.35 }} /><Box s={[w + 0.3, 0.15, 0.12]} p={[0, -h / 2 - 0.07, 0]} c={GOLD} o={{ metal: 0.5, rough: 0.35 }} />
          <Box s={[0.15, h, 0.12]} p={[-w / 2 - 0.07, 0, 0]} c={GOLD} o={{ metal: 0.5, rough: 0.35 }} /><Box s={[0.15, h, 0.12]} p={[w / 2 + 0.07, 0, 0]} c={GOLD} o={{ metal: 0.5, rough: 0.35 }} />
        </> : null}
      </group>
    );
  };
const Easel: React.FC<{ p: V3 }> = ({ p }) => (
  <G p={p}>
    <Cyl rt={0.06} h={3.2} p={[-0.6, 1.6, 0]} r={[0.08, 0, 0.12]} c={WOOD} seg={6} /><Cyl rt={0.06} h={3.2} p={[0.6, 1.6, 0]} r={[0.08, 0, -0.12]} c={WOOD} seg={6} />
    <Cyl rt={0.06} h={3.0} p={[0, 1.5, -0.6]} r={[-0.35, 0, 0]} c={WOOD} seg={6} /><Box s={[1.6, 0.1, 0.25]} p={[0, 0.85, 0.12]} c={WOOD} />
  </G>
);
const Room: React.FC<{ x0: number; x1: number; wall: string; floor: string; trim?: string }> = ({ x0, x1, wall, floor, trim = "#5a3a22" }) => {
  const cx = (x0 + x1) / 2, w = x1 - x0;
  return (
    <G>
      <Box s={[w, 0.3, 9]} p={[cx, 0.15, -2]} c={floor} />
      <Box s={[w, 6.5, 0.4]} p={[cx, 3.25, -6.5]} c={wall} />
      <Box s={[w, 0.35, 0.12]} p={[cx, 1.2, -6.25]} c={trim} cast={false} />
      <Box s={[0.4, 6.5, 9]} p={[x0, 3.25, -2]} c={wall} /><Box s={[0.4, 6.5, 9]} p={[x1, 3.25, -2]} c={wall} />
      <G p={[cx, 6.6, -4.4]} r={[0.5, 0, 0]}><Box s={[w + 1, 0.3, 5]} c="#8a3a2a" /></G>
    </G>
  );
};
/** casas de canal holandesas (fachada em degraus) */
const DutchRow: React.FC<{ x0: number; n: number; z: number; yaw?: number }> = ({ x0, n, z, yaw = 0 }) => (
  <G r={[0, yaw, 0]}>
    {Array.from({ length: n }, (_, i) => {
      const h = 6 + rnd(i + x0) * 3, c = ["#8a3a2a", "#3f4a5a", "#6b3a2a", "#2f4a3f", "#a8472f"][i % 5];
      return (
        <G key={i} p={[x0 + i * 3.6, 0, z]}>
          <Box s={[3.4, h, 3]} p={[0, h / 2, 0]} c={c} />
          {[0, 1, 2].map((k) => <Box key={k} s={[3.4 - k * 0.9, 0.8, 3]} p={[0, h + 0.4 + k * 0.8, 0]} c={c} />)}
          {[1.8, 3.6, 5.2].filter((y) => y < h - 0.6).map((y, k) => <G key={k}>{[-0.8, 0.8].map((x, j) => <Box key={j} s={[0.8, 1.0, 0.1]} p={[x, y, 1.52]} c="#f4f1e6" cast={false} />)}</G>)}
        </G>
      );
    })}
  </G>
);
const Windmill: React.FC<{ p: V3; t: number }> = ({ p, t }) => (
  <G p={p}>
    <Cyl rt={1.6} rb={2.6} h={9} p={[0, 4.5, 0]} c="#7a5a3a" seg={8} /><Cone rad={2.0} h={2.4} seg={8} p={[0, 10.2, 0]} c="#4a3a2a" />
    <G p={[0, 9.2, 2.1]} r={[0, 0, t * 0.9]}>{[0, 1, 2, 3].map((k) => <G key={k} r={[0, 0, (k * PI) / 2]}><Box s={[0.5, 6.5, 0.08]} p={[0, 3.3, 0]} c="#f2ede0" /></G>)}</G>
  </G>
);
const Canal: React.FC<{ t: number }> = ({ t }) => {
  const bx = -12 + (8.0 - t) * 3.2, bob = Math.sin(t * 3) * 0.05;   // um barco a vela cruza o canal em «Holanda, años treinta»
  const wx = -8 - (t - T.holanda) * 2.6;
  return (
  <G>
    <G p={[bx, 0.32 + bob, 9.6]} r={[0, 0, Math.sin(t * 2.4) * 0.04]} vis={t > T.holanda - 0.5 && t < T.criticos + 0.5}>
      <Box s={[3.2, 0.5, 1.2]} p={[0, 0.1, 0]} c="#5a3a22" /><Box s={[3.6, 0.12, 1.4]} p={[0, 0.38, 0]} c="#c8352a" />
      <Cyl rt={0.06} h={3.2} p={[0.1, 2.0, 0]} c={WOOD} seg={6} /><Box s={[0.05, 2.4, 1.5]} p={[0.1, 2.3, 0]} r={[0, 0, 0.05]} c="#f4f1e6" />
    </G>
    <Worker p={[wx, 0.3, 4.4]} yaw={-PI / 2} pose={poseOf("walk", t)} t={t} c={FOLK[2]} scale={t > T.holanda - 0.5 && t < T.criticos + 0.5 ? 1.1 : 0} />
    <Box s={[120, 0.2, 7]} p={[20, 0.05, 9.5]} c="#3f8fc8" o={{ rough: 0.25, metal: 0.1 }} cast={false} />
    {Array.from({ length: 40 }, (_, i) => <Box key={i} s={[1.2, 0.04, 0.12]} p={[-40 + ((i * 4.3 + t * 1.2) % 120), 0.17, 7 + rnd(i) * 5]} c="#ffffff" cast={false} />)}
    <Box s={[120, 0.5, 0.5]} p={[20, 0.25, 5.9]} c="#8a6a4a" /><Box s={[120, 0.5, 0.5]} p={[20, 0.25, 13.1]} c="#8a6a4a" />
  </G>
  );
};

// ---------------------------------------------------------------- personagens extras
const SUIT = { skin: "#e8b48c", top: "#3a3a44", bottom: "#2a2a30", kilt: "#3a3a44", kiltLen: 0.6, hat: "cap" as const, hatC: "#1a1a1a", boot: "#151515", belt: "#1a1a1a", sleeves: true };
const COAT = { skin: "#e8b48c", top: "#f4f4f0", bottom: "#2a2a30", kilt: "#f4f4f0", kiltLen: 0.75, hat: "none" as const, hatC: "#000", boot: "#151515", sleeves: true };
const GORING = { skin: "#f0c09a", top: "#8fa3b8", bottom: "#8fa3b8", kilt: "#8fa3b8", kiltLen: 0.6, hat: "cap" as const, hatC: "#7f93a8", boot: "#1a1a1a", belt: GOLD, sleeves: true };
const POLICE = { skin: "#e8b48c", top: "#1f2f5a", bottom: "#1f2f5a", kilt: "#1f2f5a", kiltLen: 0.5, hat: "cap" as const, hatC: "#1a2448", boot: "#151515", belt: "#f2d24a", sleeves: true };
const JUDGE = { skin: "#e8b48c", top: "#151515", bottom: "#151515", kilt: "#151515", kiltLen: 0.9, hat: "cap" as const, hatC: "#151515", boot: "#151515", belt: "#f4f4f0", sleeves: true };
const FOLK = [
  { skin: "#e8b48c", top: "#c8352a", bottom: "#2f3f6a", hat: "cap" as const, hatC: "#2a2a2a", boot: "#2a2420", sleeves: true },
  { skin: "#d39a6c", top: "#ff9f1a", bottom: "#3a3a3a", hat: "none" as const, hatC: "#000", boot: "#2a2420", sleeves: true },
  { skin: "#f0c09a", top: "#2f8f5f", bottom: "#2a2a30", hat: "straw" as const, hatC: "#d9b25a", boot: "#2a2420", sleeves: true },
];

// ---------------------------------------------------------------- estações
/** o salão de Göring: quadros nas paredes, o «Vermeer» no cavalete, a troca por mais de cem quadros, a balança */
const Hall: React.FC<{ t: number; tex: Tex }> = ({ t, tex }) => {
  const x = ST.hall;
  const wall = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ p: [x - 8.5 + (i % 7) * 2.8, 2.6 + Math.floor(i / 7) * 2.3, -6.2] as V3, c: ["#6b3a2a", "#3a4a2a", "#4a3a5a", "#7a6a3a"][i % 4] })), [x]);
  // a troca: cada quadro da parede voa para a pilha (perto da câmera), um a cada 0,22 s a partir de «Göring paga»
  const fly = (i: number) => ease(t, T.otro + i * 0.2, T.otro + i * 0.2 + 0.5);
  const tiltIn = ease(t, T.sucio, T.artefalso + 0.4);
  const pileN = Math.floor(clamp((t - T.otro) / 0.2, 0, 14));
  const goringPose: PoseName = t < T.pero0 ? "present" : t < T.goring ? "belly" : t < T.robados ? "point" : "cheer";
  return (
    <G>
      <Room x0={x - 11} x1={x + 11} wall="#2f4a3a" floor="#6a4a2a" trim={GOLD} />
      <Box s={[3, 0.04, 8]} p={[x, 0.32, -2]} c="#9a2a2a" cast={false} />
      {wall.map((q, i) => {
        const k = fly(i), to: V3 = [x + 6.5 + (i % 3) * 0.15, Y + 0.2 + Math.floor(i / 1) * 0.12, 0.6];
        const pos: V3 = [lerp(q.p[0], to[0], k), lerp(q.p[1], to[1], k) + Math.sin(k * PI) * 1.6, lerp(q.p[2], to[2], k)];
        return (
          <G key={i} p={pos} r={[-PI / 2 * k, 0, 0]}>
            <Box s={[1.9, 1.5, 0.1]} c={GOLD} o={{ metal: 0.4, rough: 0.4 }} /><Box s={[1.6, 1.2, 0.12]} c={q.c} />
            <Box s={[0.5, 0.25, 0.14]} p={[0.55, -0.45, 0]} c="#d8262b" vis={t > T.robados && i % 3 !== 2} />
          </G>
        );
      })}
      <Easel p={[x - 2.5, Y, -2.6]} />
      <Painting tex={tex} p={[x - 2.5, Y + 2.25, -2.42]} r={[-0.08, 0, 0]} base={tex.vermeer} sc={0.95} />
      <Worker p={[t < T.pero0 ? x - 0.2 : x + 1.6, Y, t < T.pero0 ? -0.9 : -0.6]} yaw={t < T.pero0 ? -0.8 : -0.45} pose={poseOf(goringPose, t)} t={t} c={GORING} scale={1.35} mustache={false} />
      {/* medalhas sem insígnia: só círculos dourados */}
      {/* a balança: pilha de quadros (sujo) contra o Vermeer (falso) */}
      <G p={[x - 7, Y, 0.4]} vis={t > T.sucio - 0.6 && t < T.giro + 0.6}>
        <Cyl rt={0.12} h={3} p={[0, 1.5, 0]} c="#6a6a72" seg={8} /><Cone rad={0.7} h={0.5} seg={8} p={[0, 0.25, 0]} c="#4a4a52" />
        <G p={[0, 3, 0]} r={[0, 0, -0.32 * tiltIn]}>
          <Box s={[4.2, 0.14, 0.14]} c="#6a6a72" />
          <G p={[-2, -0.6, 0]}><Cyl rt={0.9} h={0.08} c="#8a8a92" seg={12} />{[0, 1, 2, 3].map((k) => <Box key={k} s={[1.2, 0.08, 0.9]} p={[0, 0.1 + k * 0.1, 0]} r={[0, k * 0.4, 0]} c={["#3a2a1a", "#5a3a22", "#2a2a1a", "#4a3020"][k]} />)}</G>
          <G p={[2, -0.6, 0]}><Cyl rt={0.9} h={0.08} c="#8a8a92" seg={12} /><Painting tex={tex} p={[0, 0.75, 0]} base={tex.vermeer} sc={0.6} /></G>
        </G>
      </G>
      <Box s={[2.4, 1.3, 1.6]} p={[x + 7.4, Y + 0.65, 1.0]} c="#5a4a3a" vis={pileN > 0} />
    </G>
  );
};
/** o ateliê: cavalete, mesa da baquelita, forno, mesa do cilindro; e a cozinha do gancho (o mesmo forno) */
const Studio: React.FC<{ t: number; tex: Tex }> = ({ t, tex }) => {
  // cavalete: o quadro velho comprado chega no «compra», a pedra-pomes raspa («quita»→«pinta»), o Vermeer entra da esquerda
  const scrape = ease(t, T.quita, T.pinta);
  const paint = ease(t, T.pinta, T.pinta + 1.1);
  const onEasel = t > T.compra + 1.2 && t < T.hornea + 0.2;
  // forno: abre no gancho e no «hornea»/«sale»; aquece até 100 °C entre «hornea» e «sale»
  const doorOpen = (t < T.holanda ? ease(t, T.cocio - 0.3, T.cocio + 0.1) : 0)
    + (ease(t, T.hornea - 0.2, T.hornea + 0.2) - ease(t, T.hornea + 0.9, T.hornea + 1.2)) + (ease(t, T.sale - 0.3, T.sale) - ease(t, T.yano + 0.6, T.yano + 1.0));
  const heat = (ease(t, T.hornea + 1.0, T.sale - 0.3) - ease(t, T.sale, T.sale + 1.5)) + (t < T.holanda ? 1 - ease(t, T.cocio + 1.2, T.cocio + 2.4) : 0);
  // o quadro no forno (entra no «hornea», sai no «sale», vai ao suporte do teste do álcool)
  const into = ease(t, T.hornea, T.hornea + 0.9), out = ease(t, T.sale - 0.2, T.sale + 0.6);
  const ovenP: V3 = [ST.oven, Y + 1.25, -3.9], easelP: V3 = [ST.easel, Y + 2.25, -2.42], standP: V3 = [ST.oven - 3.6, Y + 1.7, -1.0];
  const bakeP: V3 = t < T.sale - 0.2 ? [lerp(easelP[0], ovenP[0], into), lerp(easelP[1], ovenP[1], into) + Math.sin(into * PI) * 1.2, lerp(easelP[2], ovenP[2], into)]
    : [lerp(ovenP[0], standP[0], out), lerp(ovenP[1], standP[1], out) + Math.sin(out * PI) * 0.8, lerp(ovenP[2], standP[2], out)];
  const bakeVis = t > T.hornea && t < T.p3;
  // gancho: o quadro sai do forno da cozinha
  const hook = ease(t, T.cocio + 0.2, T.cocio + 1.4);
  const hookP: V3 = [lerp(ovenP[0], ovenP[0] - 2.2, hook), ovenP[1] + 0.3 * hook, lerp(ovenP[2], -1.4, hook)];
  // mesa: tigela mexendo, frasco de baquelita derramando
  const stir = t > T.mezcla && t < T.hornea ? t * 9 : 0, pour = ease(t, T.baquelita - 0.2, T.baquelita + 0.3) - ease(t, T.plastico + 0.4, T.plastico + 0.8);
  // cilindro: o quadro curva sobre o rolo («enrolla»→«agrieta»), desenrola com rachaduras; trapo com tinta («frota»→«sucias»)
  const roll = ease(t, T.enrolla, T.agrieta) - ease(t, T.agrieta + 0.1, T.agrieta + 0.9);
  const cracks = t > T.agrieta ? 1 : 0, ink = ease(t, T.frota, T.sucias + 0.3);
  const PH = 1.9 * 0.95, Z0 = -1.75, flat = 1 - 0.88 * roll, rollR = 0.18 + 0.3 * roll;   // borda de perto da tela em Z0
  const rag = t > T.frota - 0.2 && t < T.sucias + 0.6 ? Math.sin(t * 14) * 0.45 : 0;
  // teste do álcool depois do forno: cotonete esfrega, nada sai
  const swab2 = t > T.alcohol2 - 0.3 && t < T.yano + 0.9;
  return (
    <G>
      <Room x0={-6} x1={16} wall={PLASTER} floor="#b88a58" />
      <Box s={[2.2, 2.2, 0.12]} p={[3, 3.6, -6.25]} c="#bfe3ff" o={{ emissive: "#dff2ff", ei: 0.35 }} cast={false} />
      {/* cavalete */}
      <Easel p={[ST.easel, Y, -2.6]} />
      <Painting tex={tex} p={easelP} r={[-0.08, 0, 0]} base={scrape > 0.98 ? "#f2eee2" : tex.old} top={tex.vermeer} reveal={paint} vis={onEasel} />
      {/* a pedra-pomes: raspa de lado a lado; a tinta velha some (cobre-se com tela crua) e cai em lascas */}
      <Painting tex={tex} p={[easelP[0], easelP[1], easelP[2] + 0.02]} r={[-0.08, 0, 0]} base="#f2eee2" reveal={0} frame={false} sc={scrape * 0.999 + 0.001} vis={onEasel && scrape > 0.01 && scrape < 0.98 && paint < 0.01} />
      <Box s={[0.55, 0.3, 0.35]} p={[ST.easel + Math.sin(t * 12) * 0.6, easelP[1] - 0.6 + scrape * 1.2, -2.15]} c="#bdbdb5" vis={t > T.quita - 0.1 && t < T.pinta} />
      {Array.from({ length: 14 }, (_, i) => { const ph = (t * 1.3 + rnd(i)) % 1; return <Box key={i} s={[0.08, 0.08, 0.02]} p={[ST.easel - 0.7 + rnd(i + 3) * 1.4, easelP[1] - ph * 2.2, -2.0]} c="#6a4a2a" vis={t > T.quita && t < T.pinta + 0.2} cast={false} />; })}
      {/* pincel: corre junto com a borda do Vermeer que entra */}
      <G p={[ST.easel - 0.8 + paint * 1.6, easelP[1] + Math.sin(t * 16) * 0.5, -2.05]} r={[0, 0, 0.6]} vis={paint > 0.01 && paint < 0.99}>
        <Cyl rt={0.04} h={1.0} c={WOOD} seg={6} /><Cone rad={0.07} h={0.2} p={[0, 0.58, 0]} c="#e2b93b" seg={6} />
      </G>
      {/* mesa da baquelita */}
      <Box s={[3.4, 0.15, 1.8]} p={[ST.table, Y + 1.1, -3.2]} c={WOOD} />
      {[[-1.5, -0.7], [1.5, -0.7], [-1.5, 0.7], [1.5, 0.7]].map(([dx, dz], i) => <Box key={i} s={[0.14, 1.1, 0.14]} p={[ST.table + dx, Y + 0.55, -3.2 + dz]} c={WOOD} />)}
      <Cyl rt={0.45} rb={0.3} h={0.35} p={[ST.table - 0.6, Y + 1.35, -3.0]} c="#e8e2d0" open seg={14} />
      <Cyl rt={0.36} h={0.06} p={[ST.table - 0.6, Y + 1.48, -3.0]} c={t > T.baquelita ? "#c8902a" : "#2f4f9f"} seg={14} />
      <G p={[ST.table - 0.6, Y + 1.6, -3.0]} r={[0.5, stir, 0]}><Cyl rt={0.03} h={0.9} p={[0.15, 0.3, 0]} c={WOOD} seg={5} /></G>
      <G p={[ST.table + 0.6, Y + 1.5, -3.0]} r={[0, 0, 1.6 * pour]}>
        <Cyl rt={0.11} h={0.45} c="#6a3a14" o={{ rough: 0.3 }} seg={10} /><Cyl rt={0.05} h={0.14} p={[0, 0.29, 0]} c="#6a3a14" seg={8} />
      </G>
      <Cyl rt={0.03} h={0.5} p={[ST.table - 0.1, Y + 1.7, -3.0]} c="#c8902a" seg={5} vis={pour > 0.6} />
      {["#2f4f9f", "#e2b93b", "#c8352a", "#f4f1e6"].map((c, i) => <Cone key={i} rad={0.2} h={0.25} seg={8} p={[ST.table + 0.4 + i * 0.35, Y + 1.3, -3.7]} c={c} />)}
      {/* o forno */}
      <G p={[ST.oven, Y, -4.2]}>
        <Box s={[2.6, 2.4, 1.8]} p={[0, 1.2, 0]} c="#2f3036" o={{ rough: 0.5, metal: 0.3 }} />
        <Box s={[2.0, 1.2, 0.1]} p={[0, 1.25, 0.86]} c="#ff7a1a" o={{ emissive: "#ff5a00", ei: 0.3 + 2.2 * clamp(heat) }} cast={false} />
        <G p={[0, 0.65, 0.95]} r={[clamp(doorOpen) * 1.45, 0, 0]}><Box s={[2.1, 1.3, 0.12]} p={[0, 0.65, 0]} c="#3a3b42" o={{ metal: 0.4, rough: 0.4 }} /><Box s={[1.2, 0.12, 0.12]} p={[0, 1.15, 0.12]} c="#c8c8c8" />
          <Box s={[1.5, 0.8, 0.04]} p={[0, 0.55, 0.08]} c="#ff7a1a" o={{ emissive: "#ff5a00", ei: 2.2 * clamp(heat) }} cast={false} vis={heat > 0.1 && doorOpen < 0.3} />
          <Painting tex={tex} p={[0, 0.55, 0.11]} base={tex.vermeer} sc={0.36} frame={false} vis={bakeVis && t < T.sale - 0.2 && doorOpen < 0.3} /></G>
        <Cyl rt={0.25} h={2.4} p={[0.8, 3.6, -0.4]} c="#4a4a50" seg={8} />
        {/* termômetro */}
        <G p={[-1.0, 2.9, 0.6]}><Cyl rt={0.12} h={1.2} c="#f4f4f0" seg={8} /><Cyl rt={0.07} h={1.1 * clamp(heat)} p={[0, -0.55 + 0.55 * clamp(heat), 0.02]} c="#e0282a" seg={8} /><Sph rad={0.16} p={[0, -0.62, 0]} c="#e0282a" /></G>
      </G>
      <Puffs t={t} p={[ST.oven, Y + 2.2, -3.0]} n={8} period={1.6} rise={3} size={0.7} on={clamp(heat * 1.5)} c="#f4f4f4" drift={[0.3, 0, 0.4]} />
      <Painting tex={tex} p={bakeP} r={[-0.1, 0, 0]} base={tex.vermeer} sc={0.8} vis={bakeVis} />
      <Painting tex={tex} p={hookP} r={[-0.1, 0, 0]} base={tex.vermeer} sc={0.8} vis={t < T.holanda} />
      {/* suporte do teste depois do forno + cotonete */}
      <Box s={[0.12, 1.6, 0.12]} p={[standP[0], Y + 0.8, standP[2] - 0.1]} c={WOOD} vis={t > T.sale - 0.3 && t < T.p3} />
      <G p={[standP[0] + 0.5 + Math.sin(t * 15) * 0.25, standP[1] - 0.1, standP[2] + 0.35]} r={[0, 0, 0.9]} vis={swab2}>
        <Cyl rt={0.03} h={0.9} c="#f4f4f0" seg={5} /><Sph rad={0.11} p={[0, 0.5, 0]} c="#ffffff" />
      </G>
      {/* mesa do cilindro */}
      <Box s={[3.6, 0.15, 2.0]} p={[ST.roll, Y + 1.1, -2.8]} c={WOOD} />
      {[[-1.6, -0.8], [1.6, -0.8], [-1.6, 0.8], [1.6, 0.8]].map(([dx, dz], i) => <Box key={i} s={[0.14, 1.1, 0.14]} p={[ST.roll + dx, Y + 0.55, -2.8 + dz]} c={WOOD} />)}
      <G p={[ST.roll, Y + 1.18 + rollR, Z0 - PH * flat]} r={[-roll * 9, 0, PI / 2]}>
        <Cyl rt={rollR} h={1.7} c="#e8dcc0" seg={16} /><Cyl rt={0.08} h={2.6} c="#b07a4a" seg={8} />
      </G>
      <Painting tex={tex} p={[ST.roll, Y + 1.19, Z0 - PH / 2]} r={[-PI / 2, 0, 0]} base={tex.vermeer} cracks={cracks} ink={ink} sc={0.95} crop={flat} frame={false}
        vis={t > T.p3 - 0.2 && t < T.funciona + 0.5} />
      <Box s={[0.6, 0.12, 0.45]} p={[ST.roll + rag, Y + 1.3, -2.6]} c="#1a1a1a" vis={t > T.frota - 0.2 && t < T.sucias + 0.6} />
      {/* a lupa sobre o quadro liso (p3) */}
      <G p={[ST.roll + 0.2 + 0.35 * Math.sin(t * 2), Y + 1.75, -2.5]} vis={t > T.grietas - 0.3 && t < T.b3}>
        <mesh rotation={[PI / 2, 0, 0]}><torusGeometry args={[0.55, 0.07, 8, 24]} /><meshStandardMaterial color="#2a2a2a" /></mesh>
        <Cyl rt={0.07} h={0.9} p={[0.6, -0.45, 0]} r={[0, 0, 0.8]} c="#5a3a22" seg={6} />
      </G>
    </G>
  );
};
/** a feira: o quadro barato do séc. XVII com etiqueta */
const Market: React.FC<{ t: number; tex: Tex }> = ({ t, tex }) => {
  const x = ST.market, z = 3;
  const lift = ease(t, T.compra + 0.2, T.compra + 1.2);
  return (
    <G>
      <Box s={[6, 0.15, 3]} p={[x, 1.2, z]} c={WOOD} />
      {[-2.8, 2.8].map((dx, i) => <Box key={i} s={[0.16, 3.6, 0.16]} p={[x + dx, 1.8, z - 1.3]} c={WOOD} />)}
      <G p={[x, 3.7, z]} r={[0.25, 0, 0]}>{Array.from({ length: 6 }, (_, i) => <Box key={i} s={[1.0, 0.1, 3.4]} p={[-2.5 + i, 0, 0]} c={i % 2 ? "#ffffff" : "#d8262b"} />)}</G>
      {[-1.8, 0, 1.8].map((dx, i) => <Painting key={i} tex={tex} p={[x + dx, 2.3 + (i === 1 ? lift * 1.6 : 0), z - 1.2 + (i === 1 ? lift * 2 : 0)]} r={[-0.15, 0, 0]} base={i === 1 ? tex.old : tex.mine} sc={0.55} vis={i !== 1 || t < T.compra + 1.2} />)}
      <Box s={[0.7, 0.4, 0.05]} p={[x + 0.4, 1.75, z - 1.0]} r={[0, 0, 0.2]} c="#fff6c8" vis={t < T.compra + 0.4} />
      <Worker p={[x + 3.6, Y - 0.3, z - 0.4]} yaw={-0.6} pose={poseOf(t > T.barato ? "present" : "idle", t)} t={t} c={FOLK[2]} scale={1.05} />
      <Box s={[3.4, 2.2, 0.2]} p={[x - 4.5, 1.1, z - 1.6]} c="#c9a24a" />
    </G>
  );
};
/** a galeria: críticos vaiando o quadro dele, o teste do álcool, o Bredius com a lupa */
const Gallery: React.FC<{ t: number; tex: Tex }> = ({ t, tex }) => {
  // teste do álcool no quadro novo: cotonete entra no «prueban», a mancha aparece no «ablanda»
  const smear = ease(t, T.ablanda - 0.1, T.ablanda + 0.5), swab = t > T.prueban - 0.3 && t < T.nueva + 0.8;
  const critics = [0, 1, 2].map((i) => ({ p: [ST.critics - 1.5 + i * 1.5, Y, -0.8 + (i % 2) * 0.6] as V3, yaw: PI - 0.2 + i * 0.2,
    pose: (t > T.desprecian ? (i === 1 ? "alarm" : "think") : "idle") as PoseName, ph: i * 0.7 }));
  const experts = [0, 1, 2].map((i) => ({ p: [ST.critics - 1.6 + i * 1.6, Y, -0.6] as V3, yaw: PI, pose: (t > T.juren ? "cheer" : "think") as PoseName, ph: i }));
  const fans = ([[-4.0, -1.0], [-3.2, -2.4], [-3.0, -0.5]] as [number, number][]).map(([dx, dz], i) => ({ p: [ST.bredius + dx, Y, dz] as V3, yaw: 0.35 - i * 0.2, pose: (t > T.maestra ? "cheer" : "idle") as PoseName, ph: i * 0.37 }));
  const lens = t > T.experto - 0.3 && t < T.guerra;
  return (
    <G>
      <Room x0={32} x1={56} wall="#e9e2d0" floor="#7a5a3a" trim="#8a6a4a" />
      {[34.5, 41, 47].map((x, i) => <Painting key={i} tex={tex} p={[x, 3.2, -6.25]} base={[tex.old, tex.mine, tex.old][i]} sc={0.7} />)}
      {/* o quadro dele, vaiado pelos críticos (depois vira o dos peritos que juram) */}
      <Painting tex={tex} p={[ST.critics, Y + 2.4, -3.6]} base={t < T.falso0 ? tex.mine : tex.vermeer} sc={0.9} />
      <Crowd list={critics} t={t} c={SUIT} scale={1.05} vis={t < T.expertos0} />
      <Crowd list={experts} t={t} c={COAT} scale={1.05} vis={t >= T.expertos0 && t < T.p1 + 1} />
      {/* teste do álcool */}
      <Easel p={[ST.test, Y, -2.6]} />
      <Painting tex={tex} p={[ST.test, Y + 2.25, -2.42]} r={[-0.08, 0, 0]} base={tex.vermeer} smear={smear} />
      <G p={[ST.test + 0.2 + (swab ? Math.sin(t * 14) * 0.3 : 0), Y + 2.1, -1.95]} r={[0, 0, 0.9]} vis={swab}>
        <Cyl rt={0.03} h={0.9} c="#f4f4f0" seg={5} /><Sph rad={0.11} p={[0, 0.5, 0]} c={smear > 0.3 ? "#b08a50" : "#ffffff"} />
      </G>
      <Worker p={[ST.test + 1.6, Y, -1.2]} yaw={-0.7} pose={poseOf(t > T.ablanda ? "alarm" : "point", t)} t={t} c={COAT} scale={1.05} />
      {/* Bredius: a obra-prima no pedestal, a lupa, o público */}
      <Box s={[2.6, 0.9, 1.4]} p={[ST.bredius, Y + 0.45, -3.6]} c="#3a2a1a" />
      <Painting tex={tex} p={[ST.bredius, Y + 2.3, -3.6]} base={tex.vermeer} cracks={1} ink={0.5} sc={1.0} />
      <Worker p={[ST.bredius - 1.8, Y, -1.8]} yaw={0.6} pose={poseOf(t > T.maestra ? "cheer" : t > T.llama ? "present" : "think", t)} t={t} c={{ ...COAT, hat: "none" }} scale={1.1} mustache />
      <G p={[ST.bredius - 0.6 + 0.3 * Math.sin(t * 2.2), Y + 2.4, -2.8]} vis={lens}>
        <mesh><torusGeometry args={[0.45, 0.06, 8, 24]} /><meshStandardMaterial color="#2a2a2a" /></mesh>
        <Cyl rt={0.06} h={0.8} p={[0.5, -0.4, 0]} r={[0, 0, 0.8]} c="#5a3a22" seg={6} />
      </G>
      <Crowd list={fans} t={t} c={FOLK[0]} scale={1.0} vis={t > T.funciona} />
      {Array.from({ length: 6 }, (_, i) => <Cyl key={i} rt={0.05} h={1.0} p={[ST.bredius - 1.25 + i * 0.5, Y + 0.5, -2.2]} c="#c9a24a" seg={6} />)}
      <Box s={[2.6, 0.06, 0.06]} p={[ST.bredius, Y + 0.95, -2.2]} c="#b8202a" />
    </G>
  );
};
/** o tribunal e a praça: a polícia, os juízes que não acreditam, o Vermeer pintado diante dos guardas, o herói */
const Court: React.FC<{ t: number; tex: Tex }> = ({ t, tex }) => {
  const x = ST.court;
  const judges = [0, 1, 2].map((i) => ({ p: [x - 1.6 + i * 1.6, Y + 1.0, -4.6] as V3, yaw: 0, pose: (t > T.nadie && t < T.asique ? "alarm" : "think") as PoseName, ph: i * 0.5 }));
  const guards = [0, 1, 2, 3].map((i) => ({ p: [x + 3.3 + i * 1.2, Y, -0.4 + (i % 2) * 0.7] as V3, yaw: -PI / 2 - 0.4, pose: (t > T.testigos ? "point" : "think") as PoseName, ph: i * 0.6 }));
  const police = [0, 1].map((i) => ({ p: [lerp(x + 9 + i * 0.6, x + 4.7 + i * 0.9, ease(t, T.terminar, T.arrestan + 0.5)), Y, 1.0 + i * 0.9] as V3, yaw: -PI / 2, pose: (t > T.arrestan ? "point" : "walk") as PoseName, ph: i * 0.3 }));
  const paint = ease(t, T.otroV, T.testigos + 1.2);
  const crowd = Array.from({ length: 16 }, (_, i) => ({ p: [x - 6 + (i % 8) * 1.6, 0, 6.2 + Math.floor(i / 8) * 1.5] as V3, yaw: PI + (rnd(i) - 0.5) * 0.6, pose: (t > T.heroe ? "cheer" : "idle") as PoseName, ph: i * 0.29 }));
  const gavel = Math.abs(Math.sin(clamp((t - T.vida + 0.1) * 6, 0, PI)));
  return (
    <G>
      <Room x0={x - 10} x1={x + 10} wall="#d8c8a8" floor="#6a4a2a" trim="#4a3020" />
      <Box s={[7, 1.6, 1.4]} p={[x, Y + 0.8, -4.6]} c="#5a3a22" />
      <Crowd list={judges} t={t} c={JUDGE} scale={1.0} />
      <G p={[x + 2.4, Y + 1.6, -4.0]} r={[0, 0, -0.9 * gavel]}><Cyl rt={0.05} h={0.9} p={[0.45, 0.2, 0]} r={[0, 0, PI / 2]} c={WOOD} seg={6} /><Cyl rt={0.16} h={0.45} p={[0.9, 0.2, 0]} c="#3a2414" seg={8} /></G>
      <Crowd list={police} t={t} c={POLICE} scale={1.05} vis={t > T.terminar - 0.3 && t < T.salvarse} />
      <G vis={t > T.asique - 0.4}><Easel p={[x + 0.5, Y, -1.8]} /></G>
      <Painting tex={tex} p={[x + 0.5, Y + 2.25, -1.62]} r={[-0.08, 0, 0]} base="#f2eee2" top={tex.vermeer} reveal={paint} vis={t > T.asique - 0.4} />
      <G p={[x + 0.5 - 0.8 + paint * 1.6, Y + 2.25 + Math.sin(t * 16) * 0.5, -1.45]} r={[0, 0, 0.6]} vis={paint > 0.01 && paint < 0.99}>
        <Cyl rt={0.04} h={1.0} c={WOOD} seg={6} /><Cone rad={0.07} h={0.2} p={[0, 0.58, 0]} c="#e2b93b" seg={6} />
      </G>
      <Crowd list={guards} t={t} c={POLICE} scale={1.0} vis={t > T.asique - 0.4} />
      <Crowd list={crowd} t={t} c={FOLK[1]} scale={1.0} vis={t > T.traidor - 0.4} />
      {Array.from({ length: 40 }, (_, i) => { const ph = ((t - T.heroe) * 0.6 + rnd(i)) % 1; return <Box key={i} s={[0.18, 0.04, 0.12]} p={[x - 7 + rnd(i + 5) * 14, 7 - ph * 7, 8 + rnd(i + 9) * 4]} r={[t * 3 + i, i, 0]} c={["#ffd400", "#ff3b6b", "#2fb0ff", "#3fd06a"][i % 4]} vis={t > T.heroe} cast={false} />; })}
    </G>
  );
};

export const World: React.FC<{ t: number }> = ({ t }) => {
  const tex = useTex();
  return (
    <>
      <Sky top="#2f86e8" mid="#86c4f5" low="#eef3fa" />
      <Ground g={GROUND} />
      <Hills c={["#5fae3e", "#6fbf48"]} z={-75} />
      <Clouds t={t} n={8} />
      <Canal t={t} />
      <DutchRow x0={-84} n={9} z={-16} /><DutchRow x0={-22} n={9} z={-16} /><DutchRow x0={18} n={11} z={-16} /><DutchRow x0={60} n={6} z={-16} />
      <DutchRow x0={-40} n={14} z={22} />
      <Windmill p={[-24, 0, -30]} t={t} /><Windmill p={[30, 0, -34]} t={t + 1} />
      <Trees spots={[[-21, 0, -9], [20, 0, -8], [58, 0, 3], [-50, 0, 3], [-72, 0, 4]]} />
      <Hall t={t} tex={tex} /><Studio t={t} tex={tex} /><Market t={t} tex={tex} /><Gallery t={t} tex={tex} /><Court t={t} tex={tex} />
    </>
  );
};
export { Crowd, prog };
