// Mundo do MEP11 (Mundo em Peças): o caminho da descarga, da casa ao rio, numa cadeia de brinquedo em corte.
// Eixo x = caminho do esgoto. Cidade e casa (x -70..10) → rede coletora no corte do chão (z=10.7) → vale (x 58..96) com a
// elevatória → platô da estação (y=12): grade (150) → canal de areia (185) → decantador primário (232) → aeração (292) →
// decantador secundário (338) → rio (352+) e digestor (395) → gerador (420) → adubo (445).
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cone, Cyl, G, Pipe, Sph, V3, clamp, ease, fract, lerp, outBack, prog, rnd } from "../../toy/kit";
import { Clouds, Hills, Sky } from "../../toy/scenery";
import { T } from "./cues";
import { OPEN_END, openId } from "./opening";

const PI = Math.PI;
export const PY = 12; // altura do platô da estação
const BROWN = "#8a5222", BROWN2 = "#5e3716", CLEAN = "#5ec8ff", STEEL = "#8d98a3", CONC = "#c4c9cc", CONC2 = "#a2aab0", DARK = "#2b2f36", GLASS = "#bfe6ff", WHITE = "#f6f8fa";
const PASTEL = ["#ffd9a0", "#ffb3a7", "#b8e0ff", "#d6f0b0", "#f6c1e8", "#fff0a0", "#c8d4ff", "#ffcf8a"];

const pk = (t: number, t0: number, d = 0.4) => (t < t0 ? 0 : outBack(prog(t, t0, t0 + d)));
const spr = (t: number, t0: number, a = 0.3, k = 6, w = 20) => (t < t0 ? 0 : a * Math.exp(-k * (t - t0)) * Math.sin(w * (t - t0)));
const mixc = (a: string, b: string, u: number) => { const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return "#" + A.map((x, i) => Math.round(lerp(x, B[i], clamp(u))).toString(16).padStart(2, "0")).join(""); };
const glass = (o = 0.2) => ({ opacity: o, depthWrite: false, side: "double" as const });

// ---------------------------------------------------------------- terreno em corte (a face do corte fica em z=+10)
const PROFILE: [number, number][] = [[-90, -70], [-90, 0], [30, 0], [44, -12], [56, -26], [84, -26], [108, 12], [480, 12], [480, -70]];
export const surf = (x: number) => { for (let i = 1; i < PROFILE.length; i++) { const [x0, y0] = PROFILE[i - 1], [x1, y1] = PROFILE[i]; if (x >= x0 && x <= x1 && x1 > x0) return lerp(y0, y1, (x - x0) / (x1 - x0)); } return 0; };
const bandGeo = (d: number, th: number) => { const top = PROFILE.slice(1, -1), sh = new THREE.Shape([...top.map(([x, y]) => new THREE.Vector2(x, y - d)), ...[...top].reverse().map(([x, y]) => new THREE.Vector2(x, y - d - th))]); const g = new THREE.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: false, curveSegments: 1 }); g.translate(0, 0, 10.0); return g; };
const bands = [bandGeo(4, 0.7), bandGeo(10, 1.0), bandGeo(18, 0.8), bandGeo(30, 1.2)];
const bandMats = [new THREE.MeshStandardMaterial({ color: "#c9a874", roughness: 0.95 }), new THREE.MeshStandardMaterial({ color: "#ecd7ae", roughness: 0.95 })];
const Terrain: React.FC = () => {
  const geo = useMemo(() => {
    const sh = new THREE.Shape(PROFILE.map(([x, y]) => new THREE.Vector2(x, y)));
    const g = new THREE.ExtrudeGeometry(sh, { depth: 70, bevelEnabled: false, curveSegments: 1 });
    g.translate(0, 0, -60); return g;
  }, []);
  const mats = useMemo(() => [new THREE.MeshStandardMaterial({ color: "#dcc08f", roughness: 0.95 }), new THREE.MeshStandardMaterial({ color: "#7cc94a", roughness: 0.9 })], []);
  return (
    <>
      <mesh geometry={geo} material={mats} receiveShadow />
      {/* camadas da terra na face do corte, acompanhando o relevo */}
      {bands.map((g, i) => <mesh key={i} geometry={g} material={bandMats[i % 2]} />)}
      {[[-30, -9, 1.6], [20, -17, 1.2], [110, -22, 2], [200, -9, 1.6], [300, -20, 1.4], [400, -8, 1.8]].map(([x, y, r], i) => <Sph key={i} rad={r} p={[x, y, 10.3]} sc={[1, 0.7, 0.4]} c="#8a8f94" cast={false} ws={7} hs={5} />)}
    </>
  );
};

// ---------------------------------------------------------------- fluxo de bolhas marrons dentro de um cano
const Flow: React.FC<{ pts: V3[]; t: number; t0: number; t1?: number; spd?: number; gap?: number; rad?: number; c?: string; junk?: boolean }> = ({ pts, t, t0, t1 = 1e9, spd = 10, gap = 3.2, rad = 0.62, c = BROWN, junk = false }) => {
  if (t < t0 || t > t1) return null;
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]));
  const L = cum[cum.length - 1], n = Math.ceil(L / gap) + 1, P = n * gap, front = (t - t0) * spd;
  return (
    <G>
      {Array.from({ length: n }, (_, i) => {
        const raw = front - i * gap; if (raw < 0) return null;
        const s = raw % P; if (s > L) return null;
        let k = 0; while (k < pts.length - 2 && s > cum[k + 1]) k++;
        const u = (s - cum[k]) / Math.max(1e-6, cum[k + 1] - cum[k]), a = pts[k], b = pts[k + 1];
        const p: V3 = [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)], sz = Math.min(1, s / 1.2) * Math.min(1, (L - s) / 1.2 + 0.2);
        if (junk) {
          const kind = i % 3;
          if (kind === 0) return <Box key={i} s={[1.5, 0.12, 1.2]} p={p} r={[t * 2 + i, t * 1.7, i]} sc={sz} c={i % 2 ? "#e0262b" : "#3d7be0"} cast={false} />; // pano
          if (kind === 1) return <G key={i} p={p} r={[0.4, t * 2 + i, 1.2]} sc={sz}><Cyl rt={0.28} h={1.1} c="#bfe6ff" seg={8} o={{ opacity: 0.8 }} cast={false} /><Cyl rt={0.14} h={0.25} p={[0, 0.65, 0]} c="#e0262b" seg={6} cast={false} /></G>; // garrafa
          return <Sph key={i} rad={0.38} p={p} sc={sz} c="#f0c850" ws={6} hs={4} cast={false} />; // areia
        }
        return <Sph key={i} rad={rad} p={p} sc={sz * (1 + 0.1 * Math.sin(t * 9 + i))} c={c} ws={8} hs={6} cast={false} o={{ rough: 0.3 }} />;
      })}
    </G>
  );
};
const Duct: React.FC<{ a: V3; b: V3; rad?: number; o?: number }> = ({ a, b, rad = 0.95, o = 0.6 }) => <Pipe a={a} b={b} rad={rad} c={GLASS} o={{ opacity: o, depthWrite: false }} seg={10} cast={false} />;
const Flange: React.FC<{ p: V3; r?: V3; rad?: number; lit?: number }> = ({ p, r, rad = 1.15, lit = 0 }) => <Cyl rt={rad} h={0.4} p={p} r={r} c={mixc(STEEL, "#2fe06a", lit)} seg={10} o={lit > 0.05 ? { emissive: "#2cff6a", ei: lit * 0.8 } : undefined} cast={false} />;

// ---------------------------------------------------------------- casinha e cidade
const Toilet: React.FC<{ p: V3; sc?: number; f: number; t: number; duck?: boolean }> = ({ p, sc = 1, f, t, duck = false }) => {
  const u = t - f, on = u > 0, down = on ? ease(u, 0.3, 1.0) * (1 - ease(u, 1.9, 2.8)) : 0, swirl = on && u < 2.4 ? 16 * (1 - Math.exp(-u * 1.5)) * Math.exp(-u * 0.8) + u * 3 : 0, hb = on ? 1 - Math.exp(-u * 5) : 0;
  const press = on && u < 0.5 ? Math.sin(prog(u, 0, 0.5) * PI) : 0, tank = spr(t, f, 0.05, 6, 30);
  const du = duck ? prog(u, 0.05, 0.62) : 1, dx = (1 - du) * 0, dy = lerp(5.2, 2.0, du) + Math.sin(du * PI) * 1.6, dz = lerp(-1.4, 0.2, du);
  return (
    <G p={p} sc={sc}>
      <Cyl rt={1.0} rb={1.3} h={1.0} p={[0, 0.5, 0]} c={WHITE} seg={14} />
      <Cyl rt={1.6} rb={1.05} h={1.3} p={[0, 1.65, 0.1]} c={WHITE} seg={16} o={{ side: "double", rough: 0.3 }} />
      <Cyl rt={1.62} h={0.22} p={[0, 2.3, 0.1]} c="#e3ecf4" seg={16} />
      <Cyl rt={1.15} h={0.06} p={[0, 2.18 - 0.95 * down, 0.1]} c={mixc(CLEAN, "#3aa8e0", down)} seg={16} o={{ opacity: 0.95 }} cast={false} />
      {on && u < 2.4 ? [0, 1, 2].map((k) => <Box key={k} s={[1.1, 0.07, 0.22]} p={[0, 2.26 - 0.95 * down, 0.1]} r={[0, swirl + k * 2.1, 0]} sc={[1, 1, 1]} c="#ffffff" cast={false} />) : null}
      <Box s={[3.0, 2.4, 1.1]} p={[0, 3.1 + tank, -1.55]} c={WHITE} />
      <Box s={[3.2, 0.2, 1.3]} p={[0, 4.4 + tank, -1.55]} c="#e3ecf4" />
      <Box s={[0.5, 0.18, 0.3]} p={[-1.0, 3.4, -0.95]} r={[0, 0, -press * 0.7]} c={STEEL} />
      <G p={[0, 2.4, -0.75]} r={[-1.75, 0, 0]}><Cyl rt={1.45} h={0.12} c="#9fd4ff" seg={16} /></G>
      {duck ? <G p={[dx, dy, dz]} r={[0, du * 9, 0]} sc={Math.max(0.001, 1 - ease(u, 0.55, 0.68))}>
        <Sph rad={0.55} c="#ffd400" sc={[1.1, 0.8, 1]} ws={10} hs={8} cast={false} /><Sph rad={0.34} c="#ffd400" p={[0, 0.5, 0.35]} ws={8} hs={6} cast={false} /><Box s={[0.34, 0.12, 0.3]} p={[0, 0.5, 0.7]} c="#ff8a10" cast={false} />
      </G> : null}
      {duck === false && sc > 3 && on && u > 0.1 && u < 1.6 ? <Cyl rt={1.2} rb={1.6} h={14 * Math.sin(prog(u, 0.1, 1.6) * PI)} p={[0, 2.4 + 7 * Math.sin(prog(u, 0.1, 1.6) * PI), 0.1]} c="#9fe4ff" seg={14} o={{ opacity: 0.55, depthWrite: false, emissive: "#9fe4ff", ei: 0.4 }} cast={false} /> : null}
      {on && u < 1.6 ? <Cyl rt={1.3 + u * 1.8} h={0.05} p={[0, 2.4, 0.1]} c="#ffffff" seg={20} o={{ opacity: 0.5 * (1 - u / 1.6), depthWrite: false }} cast={false} /> : null}
      {hb > 0 ? null : null}
    </G>
  );
};

const House: React.FC<{ p: V3; i: number; t: number; open: string; big?: boolean }> = ({ p, i, t, open }) => {
  const rk = RK[i];
  const tl = rk >= 55 ? 1e9 : open === "A" ? 0.25 + (rk / 55) * 2.1 : open === "B" ? 2.45 + (rk / 55) * 0.7 : 1.9 + (DIST[i] / MAXD) * 1.0;
  const u = ease(t, tl, tl + 0.3), bounce = pk(t, tl, 0.35), half = rk % 2 === 1 ? ease(t, T.metade + 0.1 + (rk % 7) * 0.07, T.metade + 0.45 + (rk % 7) * 0.07) : 0;
  const you = i === 90, beacon = you ? ease(t, T.sua - 0.2, T.sua + 0.2) * (1 - ease(t, T.descarga + 1.5, T.descarga + 2)) : 0;
  const roof = mixc(mixc("#7d8794", "#2fcf6a", u), "#e8892b", half), s = 1 + 0.25 * Math.sin(Math.min(1, bounce) * PI) * (u > 0 ? 1 : 0);
  const hide = open === "C" && DIST[i] < 12.5 && t < OPEN_END - 0.4;
  return (
    <G p={p} sc={hide ? 0.001 : s}>
      <Box s={[4.2, 3.0, 4.2]} p={[0, 1.5, 0]} c={PASTEL[i % PASTEL.length]} />
      <Cone rad={3.4} h={2.2} seg={4} p={[0, 4.1, 0]} r={[0, PI / 4, 0]} c={roof} o={{ flat: true }} />
      <Box s={[1.0, 1.0, 0.1]} p={[-0.9, 1.7, 2.12]} c={u > 0.4 ? "#fff1a0" : "#556070"} o={u > 0.4 ? { emissive: "#ffd84a", ei: 1.1 } : undefined} cast={false} />
      <Box s={[0.9, 1.7, 0.1]} p={[1.0, 0.85, 2.12]} c="#8a5a32" cast={false} />
      {beacon > 0.01 ? <><Cyl rt={0.5} rb={2.6} h={30} p={[0, 16, 0]} c="#ffe14a" o={{ opacity: 0.35 * beacon, emissive: "#ffd400", ei: 0.8, depthWrite: false }} cast={false} seg={10} /><G p={[0, 9 + Math.sin(t * 6), 0]} sc={beacon * 1.4}><Cone rad={1.4} h={2.4} seg={4} r={[PI, 0, 0]} c="#ffd400" o={{ emissive: "#ffd400", ei: 1 }} cast={false} /></G></> : null}
    </G>
  );
};
const CX = -17, CZ = -22;
const hp = (i: number): V3 => [CX + ((i % 10) - 4.5) * 6, 0.1, CZ + (Math.floor(i / 10) - 4.5) * 6];
const ORD = Array.from({ length: 100 }, (_, i) => i).sort((a, b) => rnd(a * 1.31 + 5.7) - rnd(b * 1.31 + 5.7));
const RK: number[] = new Array(100); ORD.forEach((idx, r) => (RK[idx] = r));
{ const you = RK[90]; if (you >= 55) { const sw = ORD.findIndex((idx) => RK[idx] === 3); RK[ORD[sw]] = you; RK[90] = 3; } }
const DIST = Array.from({ length: 100 }, (_, i) => Math.hypot(hp(i)[0] - CX, hp(i)[2] - CZ)), MAXD = Math.max(...DIST);

const BigHouse: React.FC<{ t: number }> = ({ t }) => {
  const f = t < 8 && openId() === "B" ? 0.12 : T.descarga + 0.55, sh = spr(t, f, 0.06, 6, 32);
  return (
    <G p={[-62, 0, 2]}>
      <Box s={[17, 0.6, 13]} p={[0, 0.3, 4]} c="#e8d9bd" />
      <Box s={[17, 9.5, 0.6]} p={[0, 5.3, -2.2]} c="#7fd0d8" />
      {[-1, 1].map((s) => <Box key={s} s={[0.6, 9.5, 12.6]} p={[s * 8.5, 5.3, 3.8]} c="#ffd9a0" />)}
      {Array.from({ length: 5 }, (_, k) => <Box key={k} s={[16.4, 0.1, 0.1]} p={[0, 2 + k * 1.8, -1.85]} c="#6fbac2" cast={false} />)}
      <Cone rad={13.5} h={5} seg={4} p={[0, 12.3, 2]} r={[0, PI / 4, 0]} sc={[1, 1, 0.9]} c="#e0262b" o={{ flat: true }} />
      <Box s={[3.4, 2.8, 0.15]} p={[3.6, 6.2, -1.8]} c={GLASS} o={{ opacity: 0.8 }} cast={false} /><Box s={[3.0, 2.4, 0.2]} p={[3.6, 6.2, -1.7]} c="#9fd8ff" cast={false} />
      <Box s={[1.6, 2.2, 0.15]} p={[-5.6, 4.6, -1.8]} c="#ffe28a" cast={false} /><Sph rad={0.45} c="#e0262b" p={[-5.6, 4.4, -1.6]} cast={false} ws={8} hs={6} />
      <Toilet p={[-3.4, 0.6, 6.3]} f={f} t={t} duck sc={1.05} />
      <Box s={[1.1, 0.12, 1.1]} p={[6.2, 3.6, -1.6]} c="#ffffff" cast={false} />
      <G p={[0, sh, 0]} />
    </G>
  );
};

// ---------------------------------------------------------------- rede coletora (no corte do chão, z=10.7)
const ZP = 10.7, YM = -3.4;
const LATX = Array.from({ length: 10 }, (_, i) => -44 + i * 6);
const MAIN: V3[] = [[-65.4, YM, ZP], [-58, YM, ZP], [30, YM, ZP], [44, -15.4, ZP], [56, -29.4, ZP], [60, -29.4, ZP]];
const Network: React.FC<{ t: number }> = ({ t }) => {
  const pulse = ease(t, T.rede - 0.1, T.rede + 0.6) * (1 - ease(t, T.rede + 1.8, T.rede + 2.6));
  const wave = (x: number) => clamp(1 - Math.abs(((t - T.rede) * 55 + (-62)) - x) / 14) * (t > T.rede - 0.1 && t < T.rede + 2.6 ? 1 : 0);
  return (
    <G>
      <Pipe a={[-65.4, 0.2, ZP]} b={[-65.4, YM, ZP]} rad={0.95} c={GLASS} o={{ opacity: 0.4, depthWrite: false }} cast={false} />
      <Duct a={MAIN[0]} b={MAIN[1]} /><Duct a={MAIN[1]} b={MAIN[2]} /><Duct a={MAIN[2]} b={MAIN[3]} /><Duct a={MAIN[3]} b={MAIN[4]} /><Duct a={MAIN[4]} b={MAIN[5]} />
      {LATX.map((x, i) => <G key={i}>
        <Pipe a={[x, 0.1, ZP]} b={[x, YM, ZP]} rad={0.7} c={mixc(GLASS, "#2fe06a", wave(x))} o={{ opacity: 0.5, emissive: "#2cff6a", ei: wave(x) * 0.9, depthWrite: false }} cast={false} seg={8} />
        <Cyl rt={0.9} h={0.3} p={[x, 0.15, ZP]} c={mixc("#6b727a", "#ffe14a", wave(x))} seg={10} cast={false} o={wave(x) > 0.05 ? { emissive: "#ffd400", ei: wave(x) } : undefined} />
      </G>)}
      {[-62, -30, 0, 28].map((x, i) => <Flange key={i} p={[x, YM, ZP]} r={[0, 0, PI / 2]} lit={pulse * 0.6} />)}
      {/* rua em cima da rede */}
      <Box s={[100, 0.12, 4.4]} p={[-20, 0.06, 7.4]} c="#6b727a" cast={false} />
      {Array.from({ length: 14 }, (_, i) => <Box key={i} s={[2.2, 0.14, 0.3]} p={[-66 + i * 7.2, 0.1, 7.4]} c="#ffe14a" cast={false} />)}
      <Flow pts={[[-65.4, 0.4, ZP], [-65.4, YM, ZP], ...MAIN.slice(1)]} t={t} t0={T.descarga + 1.1} spd={26} gap={3.4} />
    </G>
  );
};

// ---------------------------------------------------------------- vale e elevatória
const VY = -26, PX = 75, RISER: V3[] = [[79, -15.5, 3], [110, 14.6, 3]];
const Valley: React.FC<{ t: number }> = ({ t }) => {
  const fill = ease(t, T.vale - 0.4, T.z1 - 0.3), drain = ease(t, T.empurra, T.pracima + 0.3), L = Math.max(0.15, 13 * fill * (1 - 0.8 * drain) * (0.3 + 0.7 * fill) + 0.2);
  const xl = 56 - L * 0.857, xr = 69.6, W = xr - xl;
  const slosh = Math.sin(t * 5) * 0.12 * (fill > 0.05 ? 1 : 0);
  const climb = t > T.morro && t < T.z1 + 0.5 ? 1 : 0;
  return (
    <G>
      <Box s={[W, L, 54]} p={[(xl + xr) / 2, VY + L / 2 + slosh * 0.3, -17.5]} c={BROWN} o={{ opacity: 0.93 }} cast={false} />
      <Box s={[W, 0.14, 54]} p={[(xl + xr) / 2, VY + L + slosh * 0.3, -17.5]} c="#b87a3a" cast={false} />
      {/* tenta subir o morro e escorrega de volta */}
      {climb ? Array.from({ length: 6 }, (_, i) => { const ph = fract((t - T.morro) * 0.9 + i / 6), x = 86 + ph * 20, up = Math.sin(ph * PI); return <Sph key={i} rad={0.8} p={[x, surf(x) + 0.7 + up * 0.5, 3 + (i % 3)]} sc={Math.sin(ph * PI) + 0.01} c={BROWN} ws={8} hs={6} cast={false} />; }) : null}
      {t > T.morro && t < T.z1 + 1 ? <G p={[95, surf(95) + 3.5 + 0.4 * Math.sin(t * 7), 4]} sc={pk(t, T.morro + 0.15, 0.3) * 1.4}>
        <Cyl rt={0.3} h={1.2} p={[0, 1.2, 0]} c="#2b1a00" seg={6} /><Cone rad={1.5} h={1.6} seg={3} c="#ffc400" p={[0, 2.5, 0]} cast={false} o={{ emissive: "#ffc400", ei: 0.4 }} />
        <Box s={[0.3, 1.0, 0.2]} p={[0, 2.4, 0.9]} c="#2b1a00" cast={false} />
      </G> : null}
      {/* o cano principal sobe para dentro do vale e despeja */}
      <Pipe a={[60, -29.4, ZP]} b={[60, VY + 2.4, ZP]} rad={0.95} c={GLASS} o={{ opacity: 0.6, depthWrite: false }} cast={false} />
      <Flow pts={[[60, -29.4, ZP], [60, VY + 2.2, ZP]]} t={t} t0={T.vale - 0.6} t1={T.pracima + 1} spd={9} gap={2.4} />
      {t > T.vale && t < T.pracima ? <Cyl rt={1.0 + 0.3 * Math.sin(t * 12)} h={0.05} p={[60, VY + L + 0.2, ZP - 0.5]} c="#e5c08a" seg={10} o={{ opacity: 0.7 }} cast={false} /> : null}
    </G>
  );
};

const Pump: React.FC<{ t: number }> = ({ t }) => {
  const rise = pk(t, T.bomba, 0.55), run = ease(t, T.empurra - 0.3, T.empurra + 0.5), bulge = run * (0.5 + 0.5 * Math.sin(t * 8)), ang = t * 9 * run;
  const x = PX, y0 = VY;
  const nSeg = 8, A = RISER[0], B = RISER[1];
  return (
    <G>
      <G p={[x, y0, 0]} sc={[1, Math.max(0.001, rise), 1]} vis={rise > 0.02}>
        <Box s={[10, 7.5, 8]} p={[0, 3.75, 0]} c="#ffd400" />
        <Box s={[10.6, 0.7, 8.6]} p={[0, 7.8, 0]} c="#e0262b" />
        <Box s={[10.6, 0.4, 8.6]} p={[0, 0.2, 0]} c={STEEL} />
        {/* janela com a hélice girando */}
        <Cyl rt={3.0} h={0.4} p={[0, 4.4, 4.05]} r={[PI / 2, 0, 0]} c="#2b2f36" seg={18} />
        <Cyl rt={2.6} h={0.2} p={[0, 4.4, 4.28]} r={[PI / 2, 0, 0]} c="#8fb8d0" seg={18} o={{ opacity: 0.7 }} cast={false} />
        <G p={[0, 4.4, 4.2]} r={[0, 0, ang]}>{[0, 1, 2, 3].map((k) => <Box key={k} s={[0.55, 4.6, 0.25]} r={[0, 0, k * PI / 4]} c="#e8eef2" cast={false} />)}</G>
        <Sph rad={0.7} c="#2b2f36" p={[0, 4.4, 4.5]} cast={false} ws={8} hs={6} />
      </G>
      {/* câmara que incha em cima da casa e o cano de subida em gomos */}
      <Sph rad={3.4} p={[x + 1, y0 + 10.4, 0]} sc={[rise * (1 + 0.4 * bulge), rise * (1 + 0.5 * bulge), rise * (1 + 0.4 * bulge)]} c="#e0262b" ws={14} hs={10} o={{ rough: 0.35 }} />
      <Duct a={[66, VY + 1.4, 3]} b={[71, VY + 1.4, 3]} rad={0.9} />
      <Flow pts={[[64, VY + 1.2, 3], [72, VY + 1.2, 3], [76, VY + 4, 3], [79, -15.5, 3]]} t={t} t0={T.empurra - 0.2} spd={9} gap={2.2} />
      {Array.from({ length: nSeg }, (_, i) => {
        const a: V3 = [lerp(A[0], B[0], i / nSeg), lerp(A[1], B[1], i / nSeg), 3], b: V3 = [lerp(A[0], B[0], (i + 1) / nSeg), lerp(A[1], B[1], (i + 1) / nSeg), 3];
        const w = run * Math.max(0, Math.sin((t - T.empurra) * 9 - i * 1.1)), s = 1 + 0.55 * w;
        const m: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 3];
        return <G key={i}><Sph rad={1.3} p={m} sc={[s, s, s]} c={mixc(GLASS, "#ffd9a0", w)} o={{ opacity: 0.55, depthWrite: false }} cast={false} ws={10} hs={8} /><Duct a={a} b={b} rad={1.05} /></G>;
      })}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => { const u = i / 7 + 0.07, p: V3 = [lerp(A[0], B[0], u), lerp(A[1], B[1], u), 3]; const gy = surf(p[0]); return <Box key={i} s={[0.6, p[1] - gy, 0.6]} p={[p[0], (p[1] + gy) / 2, 3]} c="#6b727a" cast={false} />; })}
      <Duct a={B} b={[142, PY + 2.3, 3]} rad={1.05} />
      <Flow pts={[[64, VY + 1.2, 3], [72, VY + 1.2, 3], [76, VY + 4, 3], [79, -15.5, 3], [110, 14.6, 3], [142, PY + 2.3, 3], [154, PY + 2.3, -2]]} t={t} t0={T.empurra} t1={T.mas3 + 14} spd={20} gap={3.0} />
      <Flow pts={[[62, VY + 1.2, 3], [72, VY + 1.2, 3], [76, VY + 4, 3], [79, -15.5, 3], [110, 14.6, 3], [142, PY + 2.3, 3], [154, PY + 2.3, -2]]} t={t} t0={T.mas2 - 0.2} t1={T.mas3 + 14} spd={14} gap={2.2} junk />
      {t > T.empurra && t < T.eleva + 2 ? <Sph rad={1} p={[x + 1, y0 + 14.6 + 1.5 * Math.abs(Math.sin(t * 9)), 0]} sc={0.9 * run} c="#d5eaf5" o={{ opacity: 0.8 }} cast={false} ws={8} hs={6} /> : null}
    </G>
  );
};
// lixo flutuando na boca da elevatória (pano, plástico, areia) no instante da fala
const PoolJunk: React.FC<{ t: number }> = ({ t }) => {
  const u = ease(t, T.mas2 - 0.1, T.mas2 + 0.4) * (1 - ease(t, T.mas3 - 1, T.mas3 - 0.2));
  if (u <= 0.01) return null;
  return <G>{Array.from({ length: 8 }, (_, i) => { const x = 58 + (i % 4) * 3 + 0.4 * Math.sin(t * 2 + i), z = -4 + Math.floor(i / 4) * 6 + 2, y = VY + 13 * 0.55 + 0.2 * Math.sin(t * 4 + i); const k = i % 3; return k === 0 ? <Box key={i} s={[1.8, 0.1, 1.4]} p={[x, y, z]} r={[0.1, t * 0.5 + i, 0.1]} sc={u} c={i % 2 ? "#e0262b" : "#3d7be0"} cast={false} /> : k === 1 ? <G key={i} p={[x, y + 0.3, z]} r={[0.2, t * 0.8 + i, 1.4]} sc={u}><Cyl rt={0.4} h={1.6} c="#bfe6ff" seg={8} o={{ opacity: 0.8 }} cast={false} /><Cyl rt={0.2} h={0.3} p={[0, 0.9, 0]} c="#e0262b" seg={6} cast={false} /></G> : <Sph key={i} rad={0.6} p={[x, y, z]} sc={[u, u * 0.4, u]} c="#f0c850" ws={6} hs={4} cast={false} />; })}</G>;
};

// ---------------------------------------------------------------- grade e canal de areia
const Grade: React.FC<{ t: number }> = ({ t }) => {
  const GX = 156, rake = ease(t, T.segura + 0.4, T.segura + 1.5), dump = ease(t, T.segura + 1.5, T.segura + 2.2), catchU = (i: number) => ease(t, 28.5 + i * 0.5, 32.4 + i * 0.12);
  const piled = Array.from({ length: 6 }, (_, i) => i);
  const rakeY = lerp(0.8, 5.2, rake) * (1 - dump) + dump * 5.2, rakeX = lerp(GX - 0.6, GX + 1.6, dump);
  return (
    <G p={[0, PY, 0]}>
      {/* canal de concreto */}
      <Box s={[66, 0.6, 8]} p={[173, 0.3, -2]} c={CONC} />
      <Box s={[66, 3.2, 0.5]} p={[173, 1.6, -6.2]} c={CONC2} />
      <Box s={[66, 3.2, 0.3]} p={[173, 1.6, 2.2]} c={GLASS} o={{ opacity: 0.18, depthWrite: false }} cast={false} />
      <Box s={[66, 1.7, 7.4]} p={[173, 1.35, -2]} c={BROWN} o={{ opacity: 0.88 }} cast={false} />
      {/* a grade: barras inclinadas */}
      <G p={[GX, 0, -2]} r={[0, 0, -0.35]}>
        {Array.from({ length: 11 }, (_, i) => <Box key={i} s={[0.22, 4.6, 0.3]} p={[0, 2.5, -3.3 + i * 0.66]} c="#e7b312" />)}
        <Box s={[0.4, 0.4, 7.6]} p={[0, 4.9, -2.0 + 2.0]} c={STEEL} cast={false} />
      </G>
      {/* o que a grade segura: pano, plástico, garrafas */}
      {piled.map((i) => { const u = catchU(i), x = lerp(143, GX - 0.9, u), z = -2 + (i - 2.5) * 1.15, stack = Math.max(0, (u - 0.85) / 0.15) * (1 - dump); const kind = i % 3, lift = rake * (1 - dump) * 3.2, dx = dump * 3, dy = -dump * 3.5 + (dump > 0 ? Math.sin(dump * PI) * 4 : 0); if (u < 0.01 || (dump >= 1)) return null; const y = 1.8 + stack * 0.6 + lift + dy, X = x + dx * 1.6;
        return kind === 0 ? <Box key={i} s={[1.9, 0.14, 1.5]} p={[X, y, z]} r={[0.2, t * 3 + i, 0.2]} c={i % 2 ? "#e0262b" : "#3d7be0"} cast={false} /> : kind === 1 ? <G key={i} p={[X, y, z]} r={[0.5, t * 2 + i, 1.0]}><Cyl rt={0.36} h={1.5} c="#bfe6ff" seg={8} o={{ opacity: 0.8 }} cast={false} /><Cyl rt={0.18} h={0.3} p={[0, 0.85, 0]} c="#e0262b" seg={6} cast={false} /></G> : <Sph key={i} rad={0.8} p={[X, y, z]} sc={[1.2, 0.7, 1]} c="#f4f4f4" ws={8} hs={6} cast={false} />; })}
      {/* rastelo que levanta tudo e joga na caçamba */}
      <G p={[rakeX, rakeY, -2]}>
        <Box s={[0.5, 0.5, 7.6]} c="#2b2f36" /><Box s={[0.3, 2.8, 0.3]} p={[0.3, 1.4, 3.6]} c={STEEL} /><Box s={[0.3, 2.8, 0.3]} p={[0.3, 1.4, -3.6]} c={STEEL} />
        {Array.from({ length: 8 }, (_, k) => <Box key={k} s={[0.2, 1.1, 0.14]} p={[0, -0.8, -3.2 + k * 0.92]} r={[0, 0, 0.3]} c="#d0d6dc" cast={false} />)}
      </G>
      <Box s={[5, 2.4, 4]} p={[GX + 5, 1.2, 4.5]} c="#3d9a4d" /><Box s={[5.2, 0.3, 4.2]} p={[GX + 5, 2.5, 4.5]} c="#2d7a3b" cast={false} />
      {Array.from({ length: 6 }, (_, i) => { const u = pk(t, T.segura + 2.0 + i * 0.12, 0.3); return u > 0 ? <Sph key={i} rad={0.8} p={[GX + 3.8 + (i % 3) * 1.2, 2.9 + Math.floor(i / 3) * 0.4, 4.0 + (i % 2)]} sc={[u, u * 0.7, u]} c={["#e0262b", "#3d7be0", "#f4f4f4"][i % 3]} cast={false} ws={8} hs={6} /> : null; })}
      {t > T.segura + 2.0 && t < T.segura + 2.8 ? <Sph rad={1} p={[GX + 5, 3.3 + 1.4 * (t - T.segura - 2.0) * 3, 4.5]} sc={0.9} c="#ffffff" o={{ opacity: 0.6 }} cast={false} ws={8} hs={6} /> : null}
      {/* canal de areia: parede de vidro e grãos afundando */}
      <Box s={[26, 4.4, 8]} p={[188, 2.2, -2]} c={GLASS} o={{ opacity: 0.16, depthWrite: false }} cast={false} />
      <Box s={[25, 3.2, 7.4]} p={[188, 1.9, -2]} c="#b88a55" o={{ opacity: 0.7 }} cast={false} />
      {Array.from({ length: 34 }, (_, i) => {
        const tt = T.canal + 0.1 + rnd(i) * 1.6, d = prog(t, tt, tt + 1.6 + rnd(i + 5) * 0.8), x = 178 + (i % 17) * 1.35 + rnd(i + 2) * 0.5, z = -4.6 + rnd(i + 3) * 5.2;
        if (d <= 0) return t > T.canal - 0.1 && t < tt ? <Sph key={i} rad={0.3} p={[x, 3.4, z]} c="#f0c850" ws={5} hs={4} cast={false} /> : null;
        return <Sph key={i} rad={0.32} p={[x, lerp(3.4, 0.7 + (i % 4) * 0.12, ease(d, 0, 1)), z]} c="#f0c850" ws={5} hs={4} cast={false} />;
      })}
      <Box s={[24, 0.3, 7]} p={[188, 0.7, -2]} c="#f0c850" cast={false} sc={[1, 1 + 2.2 * ease(t, T.canal + 1, T.gradeT + 1.5), 1]} />
      <Flow pts={[[143, 1.3, -2], [205, 1.3, -2]]} t={t} t0={29.0} t1={T.tanque + 1} spd={7} gap={3.6} rad={0.85} c={BROWN} />
      <Pipe a={[205, 1.4, -2]} b={[214, 1.4, -4]} rad={0.9} c={GLASS} o={{ opacity: 0.4, depthWrite: false }} cast={false} />
    </G>
  );
};

// ---------------------------------------------------------------- decantadores redondos
const RoundTank: React.FC<{ x: number; t: number; z?: number; kind: "prim" | "sec" }> = ({ x, t, z = -8, kind }) => {
  const prim = kind === "prim", R = 13;
  const clear = prim ? ease(t, T.tanque + 0.5, T.prim + 0.5) : ease(t, T.afundam, T.limpa + 0.8);
  const water = prim ? mixc("#9a6430", "#d9b27a", clear) : mixc("#c7b07a", "#9fe4ff", clear);
  const sink0 = prim ? T.pesado - 0.6 : T.afundam, mount = prim ? ease(t, T.lodo, T.prim + 1.5) : ease(t, T.montanha - 0.2, T.montanha + 1.1);
  const ang = t * 0.5;
  return (
    <G p={[x, PY, z]}>
      <Cyl rt={R + 0.6} h={0.6} p={[0, 0.3, 0]} c={CONC} seg={28} />
      <Cyl rt={R} h={3.4} p={[0, 2.3, 0]} c={GLASS} seg={28} o={{ opacity: 0.2, depthWrite: false, side: "double" }} cast={false} />
      <Cyl rt={R - 0.3} h={2.5} p={[0, 1.9, 0]} c={water} seg={28} o={{ opacity: 0.6, depthWrite: false }} cast={false} />
      <Cyl rt={R + 0.35} h={0.45} p={[0, 4.1, 0]} c={CONC2} seg={28} open o={{ side: "double" }} cast={false} />
      {/* lodo no fundo */}
      <Cone rad={R - 1.5} h={0.8 + 3.2 * mount} p={[0, 0.6 + (0.4 + 1.6 * mount), 0]} c={prim ? BROWN2 : "#5a3a1c"} seg={20} cast={false} sc={[1, 1, 1]} />
      <Cone rad={R - 2} h={1.4 + 3.8 * mount} p={[0, 0.7 + (0.7 + 1.9 * mount), 0]} c={prim ? "#5a3a1c" : "#47301a"} seg={12} cast={false} sc={[0.6 * mount + 0.01, 1, 0.6 * mount + 0.01]} />
      {/* ponte raspadora */}
      <G p={[0, 4.7, 0]} r={[0, ang, 0]}><Box s={[2 * R + 1.2, 0.4, 0.9]} c="#e7b312" /><Box s={[0.5, 2.0, 0.5]} p={[R * 0.4, -1, 0]} c={STEEL} cast={false} /></G>
      <Cyl rt={0.9} h={1.1} p={[0, 4.6, 0]} c={STEEL} seg={10} cast={false} />
      {prim ? Array.from({ length: 34 }, (_, i) => { const t0 = T.tanque + 0.5 + rnd(i) * 3.0, d = prog(t, t0, t0 + 1.5 + rnd(i + 3)), r = rnd(i + 1) * (R - 3), a = rnd(i + 2) * 6.28; if (t < T.tanque) return null; const y = d <= 0 ? 3.0 : lerp(3.0, 1.2 + 0.9 * mount * (1 - r / R), ease(d, 0, 1)); return <Box key={i} s={[0.7, 0.7, 0.7]} p={[Math.cos(a + ang * 0.15) * r, y, Math.sin(a) * r]} r={[i, i * 2, 0]} sc={d >= 1 ? 0.01 : 1} c={BROWN2} cast={false} />; }) : null}
      {!prim ? Array.from({ length: 26 }, (_, i) => { const t0 = T.afundam - 0.2 + rnd(i) * 1.4, d = prog(t, t0, t0 + 1.6), r = rnd(i + 1) * (R - 3), a = rnd(i + 2) * 6.28; if (t < T.outro) return null; const y = lerp(3.2, 1.1 + 0.6 * mount, ease(d, 0, 1)); return <Sph key={i} rad={0.55} p={[Math.cos(a) * r, y, Math.sin(a) * r]} sc={[1, 0.8, 1]} c="#5fc760" ws={7} hs={5} cast={false} />; }) : null}
      {/* rim de saída: a água sobe pela borda */}
      {!prim ? <Box s={[3, 0.3, 2]} p={[R + 0.4, 3.8, 0]} c={mixc("#c7b07a", "#9fe4ff", clear)} cast={false} /> : null}
    </G>
  );
};

// ---------------------------------------------------------------- bactérias
const Bact: React.FC<{ p: V3; s?: number; t: number; ph?: number; c?: string; mouth?: number }> = ({ p, s = 1, t, ph = 0, c = "#5fd35f", mouth = 0 }) => {
  const b = 1 + 0.09 * Math.sin(t * 6 + ph);
  return (
    <G p={p} sc={s * b}>
      <Sph rad={1.3} c={c} sc={[1, 0.9, 1]} ws={10} hs={8} cast={false} o={{ rough: 0.4 }} />
      <Sph rad={0.26} c="#1c1208" p={[-0.5, 0.35, 1.12]} ws={6} hs={5} cast={false} /><Sph rad={0.26} c="#1c1208" p={[0.5, 0.35, 1.12]} ws={6} hs={5} cast={false} />
      <Box s={[0.7, 0.14 + 0.34 * mouth, 0.1]} p={[0, -0.3, 1.24]} c="#3a1a10" cast={false} />
    </G>
  );
};
const Aeration: React.FC<{ t: number }> = ({ t }) => {
  const X0 = 292, air = ease(t, T.sopra, T.sopra + 0.7), N = 46;
  const born = (i: number) => (i < 5 ? T.bact + 0.15 + i * 0.28 : 57.4 + ((i - 5) / (N - 5)) ** 0.8 * (T.demais + 1.4 - 57.4));
  const eat = ease(t, T.comem - 0.2, T.comem + 1.5), crowd = ease(t, T.demais - 0.2, T.demais + 1.2);
  return (
    <G p={[X0, PY, -3]}>
      <Box s={[36, 0.6, 15]} p={[0, 0.3, 0]} c={CONC} />
      <Box s={[34, 4.6, 14]} p={[0, 2.9, 0]} c={GLASS} o={{ opacity: 0.16, depthWrite: false }} cast={false} />
      <Box s={[33.4, 3.9, 13.4]} p={[0, 2.5, 0]} c={mixc("#9a6430", "#c9a36a", ease(t, T.sopra + 0.5, T.comem + 1.5))} o={{ opacity: 0.55, depthWrite: false }} cast={false} />
      <Box s={[34.6, 0.5, 14.6]} p={[0, 5.2, 0]} c={CONC2} o={{ opacity: 0.0 }} cast={false} vis={false} />
      {[-1, 1].map((s) => <Box key={s} s={[35, 0.5, 0.5]} p={[0, 5.3, s * 7.2]} c={CONC2} cast={false} />)}
      {[-1, 1].map((s) => <Box key={s} s={[0.5, 0.5, 14.6]} p={[s * 17.4, 5.3, 0]} c={CONC2} cast={false} />)}
      {/* soprador e canos de ar */}
      <G p={[22, 0, 1]} sc={1 + 0.06 * Math.sin(t * 20) * air}><Box s={[5, 4.4, 5]} p={[0, 2.2, 0]} c="#3d7be0" /><Cyl rt={1.4} h={0.4} p={[0, 4.6, 0]} c={STEEL} seg={12} cast={false} /><Cyl rt={1.0} h={5.5} p={[-3.2, 4.5, 0]} r={[0, 0, PI / 2]} c={STEEL} seg={10} cast={false} /></G>
      {Array.from({ length: 10 }, (_, c) => <G key={c}>
        <Cyl rt={0.5} h={0.3} p={[-14.5 + c * 3.2, 0.9, 3]} c={STEEL} seg={8} cast={false} />
        {air > 0.02 ? Array.from({ length: 5 }, (_, k) => { const u = fract(t * 0.7 + k / 5 + rnd(c) ), y = 1 + u * 3.8; return <Sph key={k} rad={0.32 * (0.6 + u * 0.6)} p={[-14.5 + c * 3.2 + Math.sin(u * 14 + c) * 0.3, y, 3 + Math.cos(u * 11 + k) * 0.3]} sc={air} c="#ffffff" o={{ opacity: 0.7, depthWrite: false }} cast={false} ws={6} hs={5} />; }) : null}
      </G>)}
      {/* sujeira miúda que as bactérias comem */}
      {Array.from({ length: 56 }, (_, i) => { const e = 1 - ease(t, T.comem + rnd(i) * 1.4, T.comem + 0.4 + rnd(i) * 1.4); if (e <= 0.01 || t < T.sopra - 1.5) return null; return <Sph key={i} rad={0.3} p={[-15 + rnd(i + 1) * 30 + Math.sin(t + i) * 0.4, 0.8 + rnd(i + 2) * 3.2, -5 + rnd(i + 3) * 10]} sc={e} c={BROWN2} ws={5} hs={4} cast={false} />; })}
      {Array.from({ length: N }, (_, i) => { const b = born(i), u = t < b ? 0 : (i < 5 ? 1 : pk(t, b, 0.4)); if (u <= 0.01) return null;
        const drop = i < 5 ? 1 - ease(t, b, b + 0.7) : 0, hx = -14 + ((i * 7) % 29) + Math.sin(t * 0.8 + i) * 0.9, hy = 1.7 + (i % 4) * 0.7 + Math.sin(t * 1.5 + i * 2) * 0.35 + drop * 7, hz = -5 + ((i * 3) % 11) * 0.95 + Math.cos(t * 0.9 + i) * 0.7;
        const squeeze = 1 - crowd * 0.0; return <Bact key={i} p={[hx, hy, hz + (i % 2 ? 3 : -1)]} s={0.85 * u * squeeze * (1 + 0.08 * Math.sin(t * 6 + i))} t={t} ph={i} mouth={eat * (0.5 + 0.5 * Math.sin(t * 9 + i)) * (1 - crowd)} c={i % 3 === 0 ? "#6fe06a" : "#58c658"} />; })}
      {/* chegada das bactérias de um cano alto */}
      <Pipe a={[-12, 9, 0]} b={[-12, 5.2, 0]} rad={0.8} c={GLASS} o={{ opacity: 0.4, depthWrite: false }} cast={false} />
    </G>
  );
};

// ---------------------------------------------------------------- rio e peixe
const River: React.FC<{ t: number }> = ({ t }) => {
  const clean = ease(t, T.limpa, T.limpa + 1.5);
  const jump = (t0: number, x0: number, h: number) => { const u = prog(t, t0, t0 + 1.1); if (u <= 0 || u >= 1) return null; const x = x0 + u * 9, y = 0.4 + h * Math.sin(u * PI), pitch = -Math.cos(u * PI) * 1.0; return <G p={[x, y, 6.5]} r={[0, 0, pitch]}><Sph rad={1.1} sc={[1.7, 0.85, 0.8]} c="#ff8a10" ws={10} hs={8} cast={false} /><Cone rad={0.7} h={1.3} p={[-1.9, 0, 0]} r={[0, 0, PI / 2]} seg={4} c="#ff6a00" cast={false} /><Sph rad={0.18} p={[1.0, 0.25, 0.65]} c="#1c1208" cast={false} ws={6} hs={4} /></G>; };
  return (
    <G p={[0, PY, 0]}>
      <Box s={[130, 0.5, 8]} p={[418, 0.28, 6.2]} c="#c9a36a" cast={false} />
      <Box s={[130, 0.3, 6.6]} p={[418, 0.55, 6.2]} c={mixc("#7fa8c8", CLEAN, 0.7)} cast={false} />
      {Array.from({ length: 14 }, (_, i) => <Box key={i} s={[3.2, 0.06, 0.25]} p={[356 + ((i * 9.4 + t * 6) % 120), 0.74, 4.4 + (i % 3) * 1.8]} c="#ffffff" cast={false} />)}
      {/* a água limpa que sai do decantador entra no rio */}
      <Duct a={[351.5, 3.0, -8]} b={[357, 0.9, 3]} rad={0.9} />
      <Flow pts={[[351.5, 3.0, -8], [353, 2.6, -8], [357, 1.0, 3], [358, 0.6, 5]]} t={t} t0={T.limpa} spd={6} gap={2.4} c="#8fdcff" rad={0.7} />
      {t > T.rio ? <Cyl rt={2 + 3 * clean} h={0.06} p={[360, 0.75, 5.5]} c="#a8e4ff" seg={16} o={{ opacity: 0.4 }} cast={false} /> : null}
      {jump(T.rio + 0.55, 364, 5.2)}{jump(T.rio + 1.6, 370, 3.6)}
      {/* respingos */}
      {[T.rio + 0.55, T.rio + 1.6].map((t0, k) => t > t0 && t < t0 + 1.4 ? Array.from({ length: 8 }, (_, i) => { const d = t - t0, ang = i * 0.8; return <Sph key={`${k}${i}`} rad={0.28} p={[(k ? 370 : 364) + Math.cos(ang) * d * 4, 0.7 + 3 * d - 5 * d * d, 6.5 + Math.sin(ang) * d * 2]} c="#bfeaff" cast={false} ws={5} hs={4} sc={d < 1.1 ? 1 : 0.01} />; }) : null)}
    </G>
  );
};

// ---------------------------------------------------------------- digestor, gás, energia e adubo
const Lamp: React.FC<{ p: V3; on: number }> = ({ p, on }) => (
  <G p={p}>
    <Cyl rt={0.2} h={6.4} p={[0, 3.2, 0]} c={STEEL} seg={6} cast={false} />
    <Sph rad={0.8 + 0.25 * on} p={[0, 6.8, 0]} c={on > 0.2 ? "#fff3a0" : "#9aa3ab"} o={on > 0.2 ? { emissive: "#ffe14a", ei: 1.6 } : undefined} cast={false} ws={8} hs={6} />
    {on > 0.2 ? <Cone rad={4.4 * on} h={6.4} seg={10} p={[0, 3.4, 0]} r={[PI, 0, 0]} c="#fff3a0" o={{ opacity: 0.12 * on, depthWrite: false, emissive: "#ffe14a", ei: 0.5 }} cast={false} /> : null}
  </G>
);
const Digester: React.FC<{ t: number }> = ({ t }) => {
  const X0 = 395, Z0 = -6, lid = t < T.semar - 0.25 ? 1 : 1 - ease(t, T.semar - 0.25, T.semar + 0.05), slam = spr(t, T.semar + 0.05, 0.25, 9, 30);
  const gas = ease(t, T.biogas, T.biogas + 2.0), flame = ease(t, T.biogas + 1.5, T.biogas + 2.2), light = ease(t, T.energia + 0.7, T.energia + 1.5);
  const pot = ease(t, T.dig, T.dig + 1.2);
  const bags = Array.from({ length: 10 }, (_, i) => i);
  return (
    <G p={[0, PY, 0]}>
      {/* tubo de lodo vindo do decantador secundário */}
      <Duct a={[338, 1.4, 4.6]} b={[386, 1.4, 4.6]} rad={0.95} />
      <Flow pts={[[338, 1.4, 4.6], [386, 1.4, 4.6], [390, 3, 2]]} t={t} t0={T.dig} t1={T.dig + 9} spd={16} gap={3.0} c="#5a3a1c" rad={0.7} />
      <G p={[X0, 0, Z0]}>
        <Cyl rt={9} h={0.6} p={[0, 0.3, 0]} c={CONC} seg={20} />
        {[0, 1, 2, 3, 4].map((k) => <Box key={k} s={[0.8, 4, 0.8]} p={[Math.cos(k * 1.26) * 5.6, 2.2, Math.sin(k * 1.26) * 5.6]} c={STEEL} cast={false} />)}
        <Cyl rt={7.6} rb={1.8} h={6} p={[0, 7, 0]} c="#aeb8c2" seg={16} o={{ metal: 0.3, rough: 0.4 }} />
        <Sph rad={8.4} p={[0, 15.4, 0]} sc={[1, 1.12, 1]} c="#c9d2da" ws={18} hs={12} o={{ metal: 0.35, rough: 0.35 }} />
        <Cyl rt={8.45} h={0.4} p={[0, 12.8, 0]} c="#5f6a75" seg={18} cast={false} /><Cyl rt={7.5} h={0.4} p={[0, 17.8, 0]} c="#5f6a75" seg={18} cast={false} />
        {/* escotilha de vidro: dentro, lodo e bactérias que soltam bolhas de gás */}
        <Cyl rt={3.2} h={0.5} p={[0, 15, 8.2]} r={[PI / 2, 0, 0]} c="#3a424a" seg={18} />
        <Cyl rt={2.8} h={0.3} p={[0, 15, 8.5]} r={[PI / 2, 0, 0]} c={mixc("#5a3a1c", "#8a5a2c", pot)} seg={18} o={{ opacity: 0.85 }} cast={false} />
        {t > T.outras - 0.3 ? <>
          {Array.from({ length: 3 }, (_, i) => <Bact key={i} p={[-1.4 + i * 1.4, 14.3 + (i % 2) * 1.2 + 0.2 * Math.sin(t * 3 + i), 8.7]} s={0.55 * pk(t, T.outras + i * 0.2, 0.35)} t={t} ph={i} c="#d9c95a" mouth={0.5 + 0.5 * Math.sin(t * 9 + i)} />)}
          {Array.from({ length: 9 }, (_, i) => { const u = fract(t * 0.6 + i / 9); return <Sph key={i} rad={0.28} p={[-2 + (i % 5) * 1, 12.6 + u * 4.4, 8.75]} sc={gas * (1 - u * 0.4) + 0.001} c="#ffffff" o={{ opacity: 0.8 }} cast={false} ws={6} hs={4} />; })}
        </> : null}
        {/* tampa: fecha sem ar */}
        <G p={[0, 23.8 + 6 * lid + slam, 0]}><Cyl rt={2.6} rb={3.2} h={1.0} c="#e0262b" seg={12} /><Cyl rt={0.6} h={0.7} p={[0, 0.8, 0]} c={STEEL} seg={8} cast={false} /></G>
        <Cyl rt={2.2} h={2.0} p={[0, 23.2, 0]} c={STEEL} seg={12} cast={false} />
        {/* gasômetro: infla com o biogás */}
        <Pipe a={[2, 24, 0]} b={[12, 21, 0]} rad={0.6} c={STEEL} cast={false} />
        <Sph rad={5} p={[16, 22, 0]} sc={[0.3 + 0.7 * gas, 0.3 + 0.7 * gas, 0.3 + 0.7 * gas]} c="#fff4c0" ws={14} hs={10} o={{ opacity: 0.9 }} />
        <Pipe a={[16, 18, 0]} b={[24, 6, 2]} rad={0.6} c={STEEL} cast={false} />
        {/* fumacinha de gás saindo do tubo */}
      </G>
      {/* gerador que acende a estação */}
      <G p={[420, 0, -3]}>
        <Box s={[9, 5.6, 6]} p={[0, 2.8, 0]} c="#ffd400" /><Box s={[9.6, 0.6, 6.6]} p={[0, 5.9, 0]} c="#e0262b" />
        <Box s={[6, 2.4, 0.15]} p={[0, 3.2, 3.1]} c={mixc("#4a5560", "#2b2f36", 0)} cast={false} />
        <Cone rad={1.2} h={2.4} seg={3} p={[0, 3.2, 3.25]} r={[0, 0, PI]} c={light > 0.2 ? "#ffe14a" : "#6b727a"} o={light > 0.2 ? { emissive: "#ffd400", ei: 1.2 } : undefined} cast={false} />
        <Cyl rt={0.5} h={7} p={[4.4, 4.5, -2]} c={STEEL} seg={8} cast={false} />
        <G p={[4.4, 8.2, -2]} sc={[flame, flame, flame]}>
          <Cone rad={0.85} h={2.6} seg={7} p={[0, 1.3, 0]} c="#ff4a10" o={{ emissive: "#ff3a08", ei: 1 }} cast={false} sc={[1 + 0.12 * Math.sin(t * 23), 1 + 0.22 * Math.sin(t * 17), 1]} />
          <Cone rad={0.55} h={1.9} seg={7} p={[0.1, 0.9, 0.1]} c="#ff9a1a" o={{ emissive: "#ff8a10", ei: 1.2 }} cast={false} sc={[1, 1 + 0.2 * Math.sin(t * 19 + 1), 1]} />
          <Cone rad={0.3} h={1.1} seg={6} p={[0, 0.55, 0.15]} c="#ffe066" o={{ emissive: "#ffd23a", ei: 1.4 }} cast={false} />
        </G>
      </G>
      {/* postes que acendem em onda, do gerador para trás */}
      {Array.from({ length: 14 }, (_, i) => { const x = 428 - i * 22, on = ease(t, T.energia + 0.9 + i * 0.1, T.energia + 1.15 + i * 0.1); return t > T.energia - 0.2 ? <Lamp key={i} p={[x, 0, 8.5]} on={on} /> : null; })}
      {/* adubo: esteira e sacos */}
      <Box s={[26, 0.5, 3.4]} p={[432, 1.3, 4.2]} c={DARK} />
      {Array.from({ length: 8 }, (_, i) => <Box key={i} s={[0.2, 0.06, 3.2]} p={[419.5 + ((i * 3.2 + t * 4) % 25), 1.6, 4.2]} c="#4a515c" cast={false} />)}
      {bags.map((i) => { const a = T.adubo + 0.1 + i * 0.16, u = pk(t, a, 0.3); if (u <= 0.01) return null; const col = i % 5, row = Math.floor(i / 5); return <G key={i} p={[437 + col * 2.4, 2.4 + row * 1.9 + Math.max(0, 5 * (1 - prog(t, a, a + 0.5)) ** 2), 4.2 + (row ? 0.4 : 0)]} sc={[u, u, u]}><Box s={[2.1, 1.7, 1.4]} c="#e8d6a8" /><Box s={[0.9, 0.9, 0.12]} p={[0, 0, 0.75]} c="#2fa84a" cast={false} /></G>; })}
      <Pipe a={[403, 2, -2]} b={[420, 3, 4]} rad={0.7} c={STEEL} cast={false} />
    </G>
  );
};

// ---------------------------------------------------------------- abertura B: mergulho pelo cano (só nos primeiros segundos)
/** o patinho, sugado pela descarga, viaja pela rede (abertura B): posição por instante */
export const duckPos = (t: number): V3 => {
  if (t < 0.7) return [-65.4, 2.6, 8.4];
  if (t < 1.25) { const u = ease(t, 0.7, 1.25); return [-65.4, lerp(0.2, YM, u), ZP]; }
  if (t < 2.35) { const u = ease(t, 1.25, 2.35); return [lerp(-65.4, -8.4, u), YM, ZP]; }
  if (t < 2.7) { const u = ease(t, 2.35, 2.7); return [-8.4, lerp(YM, 0.4, u), ZP]; }
  const d = t - 2.7; return [-8.4 + 3 * d, 0.4 + 26 * d - 30 * d * d, ZP + 4 * d];
};
const Dive: React.FC<{ t: number }> = ({ t }) => {
  if (t < 0.7 || t > OPEN_END + 0.8) return null;
  const p = duckPos(t), vert = (t >= 0.7 && t < 1.25) || (t >= 2.35 && t < 2.7), fly = Math.max(0, t - 2.7);
  return (
    <G>
      <G p={p} r={[0, 0, vert ? 0 : -0.2]} sc={1.9}>
        <Sph rad={0.55} c="#ffd400" sc={[1.1, 0.8, 1]} ws={10} hs={8} cast={false} /><Sph rad={0.34} c="#ffd400" p={[0.3, 0.5, 0.2]} ws={8} hs={6} cast={false} /><Box s={[0.34, 0.12, 0.3]} p={[0.62, 0.5, 0.2]} c="#ff8a10" cast={false} />
      </G>
      {/* estelas de água atrás do patinho */}
      {Array.from({ length: 6 }, (_, i) => { const q = duckPos(t - 0.06 * (i + 1)); return <Sph key={i} rad={0.55 - i * 0.06} p={[q[0], q[1] + 0.1, q[2]]} c="#8fdcff" o={{ opacity: 0.7 }} cast={false} ws={6} hs={4} />; })}
      {/* tampa do bueiro voa */}
      <G p={[-8.4 + 2 * fly, 0.3 + 18 * fly - 22 * fly * fly, ZP]} r={[fly * 7, 0, fly * 3]} vis={t > 2.6}><Cyl rt={1.9} h={0.3} c="#59626b" seg={14} /></G>
      {/* boca do bueiro acende */}
      {t > 2.3 ? <Cyl rt={1.3} h={0.1} p={[-8.4, 0.2, ZP]} c="#ffd400" seg={12} o={{ emissive: "#ffd400", ei: 1 }} cast={false} /> : null}
    </G>
  );
};
// abertura C: vaso gigante no meio da cidade
const GiantToilet: React.FC<{ t: number }> = ({ t }) => {
  const sc = t < 2.6 ? 6 * (1 + 0.05 * Math.sin(t * 20) * ease(t, 1.3, 1.45)) : 6 * (1 - ease(t, 2.6, 3.0));
  if (sc < 0.02) return null;
  const wave = t > 1.45 && t < 2.9 ? (t - 1.45) * 26 : -1;
  return (
    <G>
      <Toilet p={[CX, 0.1, CZ + 1]} sc={sc} f={1.3} t={t} />
      {wave > 0 ? <Cyl rt={wave} rb={wave + 3} h={0.7} p={[CX, 0.5, CZ]} c="#9fe4ff" seg={36} o={{ opacity: 0.45 * (1 - wave / 40), side: "double", depthWrite: false, emissive: "#9fe4ff", ei: 0.5 }} cast={false} /> : null}
      {t > 1.35 && t < 2.5 ? Array.from({ length: 12 }, (_, i) => { const d = t - 1.35, a = i * 0.52 + 1; return <Sph key={i} rad={0.9} p={[CX + Math.cos(a) * d * 7, 12 + 14 * d - 12 * d * d, CZ + 1 + Math.sin(a) * d * 7]} c="#bfeaff" ws={6} hs={4} cast={false} sc={1 - d * 0.4} />; }) : null}
    </G>
  );
};

// ---------------------------------------------------------------- mundo
export const World: React.FC<{ t: number }> = ({ t }) => {
  const open = openId();
  return (
    <>
      <Sky top="#2f86e8" mid="#7cc0f7" low="#e9f5ff" />
      <Hills c={["#6fbe58", "#7ccb62"]} z={-130} n={34} x0={-100} flat={0.6} />
      <Clouds t={t} n={9} y={34} />
      <Terrain />
      <Box s={[100, 0.12, 60]} p={[-17, 0.06, -22]} c="#d7d9dc" cast={false} />
      {Array.from({ length: 100 }, (_, i) => <House key={i} p={hp(i)} i={i} t={t} open={open} />)}
      {Array.from({ length: 10 }, (_, k) => <Box key={k} s={[0.9, 0.1, 62]} p={[-42 + k * 6 + 3, 0.15, -22]} c="#aab0b6" cast={false} />)}
      <BigHouse t={t} />
      <Network t={t} />
      <Valley t={t} />
      <Pump t={t} />
      <PoolJunk t={t} />
      <Grade t={t} />
      <RoundTank x={232} t={t} kind="prim" />
      <Aeration t={t} />
      <RoundTank x={338} t={t} kind="sec" />
      <River t={t} />
      <Digester t={t} />
      <Pipe a={[205, PY + 1.4, -3]} b={[222, PY + 1.4, -8]} rad={0.7} c={GLASS} o={{ opacity: 0.4, depthWrite: false }} cast={false} />
      <Pipe a={[245, PY + 1.4, -8]} b={[272, PY + 1.4, -4]} rad={0.7} c={GLASS} o={{ opacity: 0.4, depthWrite: false }} cast={false} />
      <Pipe a={[310, PY + 1.4, -4]} b={[326, PY + 1.4, -8]} rad={0.7} c={GLASS} o={{ opacity: 0.4, depthWrite: false }} cast={false} />
      {open === "B" ? <Dive t={t} /> : null}
      {open === "C" ? <GiantToilet t={t} /> : null}
      {[[-70, 0, 20], [-84, 0, -30], [40, 0, -30], [24, 0, 4], [140, PY, -30], [180, PY, -26], [250, PY, -34], [320, PY, -30], [380, PY, -32], [440, PY, -28]].map(([x, y, z], i) => (
        <G key={i} p={[x, y, z]} sc={1.5 + (i % 3) * 0.3}><Cyl rt={0.25} h={1.6} p={[0, 0.8, 0]} c="#7a4a2a" seg={6} /><Cone rad={1.5} h={2.4} p={[0, 2.6, 0]} c="#3fae2c" seg={6} o={{ flat: true }} /><Cone rad={1.1} h={2} p={[0, 3.8, 0]} c="#58c63a" seg={6} o={{ flat: true }} /></G>
      ))}
    </>
  );
};
