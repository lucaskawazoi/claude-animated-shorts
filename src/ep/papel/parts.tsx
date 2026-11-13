// MEP13 — peças comuns do mundo da celulose: cores, rajadas de partículas, fluxos em cano, luzes.
import React from "react";
import { Box, Cyl, G, Pipe, Sph, V3, clamp, ease, fract, lerp, outBack, prog, rnd } from "../../toy/kit";

export const PI = Math.PI;
export const STEEL = "#8d98a3", STEEL2 = "#c3cbd3", CONC = "#c4c9cc", DARK = "#2b2f36", GLASS = "#bfe6ff", WHITE = "#f6f8fa", RED = "#e0262b", YEL = "#ffd400";
export const BARK = "#6b4a2a", BARK2 = "#4a3220", WOOD = "#ecd9a8", WOOD2 = "#d9b877", AMBER = "#ffb21a", PULP = "#8a5a2c", PASTEL = ["#ffd9a0", "#ffb3a7", "#b8e0ff", "#d6f0b0", "#f6c1e8", "#fff0a0", "#c8d4ff", "#ffcf8a"];

export const pk = (t: number, t0: number, d = 0.4) => (t < t0 ? 0 : outBack(prog(t, t0, t0 + d)));
export const mixc = (a: string, b: string, u: number) => { const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return "#" + A.map((x, i) => Math.round(lerp(x, B[i], clamp(u))).toString(16).padStart(2, "0")).join(""); };
export const lit = (t: number, a: number, d = 0.4) => ease(t, a, a + d);

/** rajada de partículas em arco (cascas, lascas, gotas, faíscas): emissão em laço entre t0 e t1 */
export const Spray: React.FC<{ t: number; t0: number; t1: number; p: V3; dir: V3; spread?: number; n?: number; spd?: number; g?: number; life?: number; size?: number; cols: string[]; shape?: "box" | "sph"; floor?: number; seed?: number }> = ({ t, t0, t1, p, dir, spread = 0.5, n = 20, spd = 10, g = -20, life = 1.4, size = 0.4, cols, shape = "box", floor = -1e9, seed = 0 }) => {
  if (t < t0 || t > t1 + life) return null;
  const dl = Math.hypot(...dir) || 1;
  return (
    <G>
      {Array.from({ length: n }, (_, i) => {
        const ph = (i / n) * life, raw = t - t0 - ph; if (raw < 0) return null;
        const k = Math.floor(raw / life), age = raw - k * life; if (t0 + ph + k * life > t1) return null;
        const r1 = rnd(i * 3.1 + k * 7.7 + seed), r2 = rnd(i * 5.3 + k * 2.9 + seed + 1), r3 = rnd(i * 1.7 + k * 4.1 + seed + 2);
        const vx = dir[0] / dl + (r1 - 0.5) * 2 * spread, vy = dir[1] / dl + (r2 - 0.5) * 2 * spread, vz = dir[2] / dl + (r3 - 0.5) * 2 * spread;
        const sp = spd * (0.6 + 0.8 * r2), x = p[0] + vx * sp * age, y = Math.max(floor, p[1] + vy * sp * age + 0.5 * g * age * age), z = p[2] + vz * sp * age;
        const s = size * (0.6 + 0.8 * r3) * (1 - 0.35 * age / life), c = cols[i % cols.length];
        return shape === "box" ? <Box key={i} s={[s * 1.5, s * 0.35, s]} p={[x, y, z]} r={[age * 9 + i, age * 7, i]} c={c} cast={false} /> : <Sph key={i} rad={s} p={[x, y, z]} c={c} ws={6} hs={4} cast={false} />;
      })}
    </G>
  );
};

/** bolinhas que andam por um caminho de pontos (fluxo num cano); kind box = pedaços */
export const Flow: React.FC<{ pts: V3[]; t: number; t0: number; t1?: number; spd?: number; gap?: number; rad?: number; c?: string; c2?: string; box?: boolean; glow?: boolean }> = ({ pts, t, t0, t1 = 1e9, spd = 10, gap = 3, rad = 0.6, c = PULP, c2, box = false, glow = false }) => {
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
        const p: V3 = [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)], sz = Math.min(1, s / 1.2) * Math.min(1, (L - s) / 1.2 + 0.2) * (1 + 0.1 * Math.sin(t * 9 + i));
        const col = c2 && i % 2 ? c2 : c, o = glow ? { emissive: col, ei: 0.7 } : { rough: 0.3 };
        return box ? <Box key={i} s={[rad * 1.6, rad * 0.9, rad * 1.2]} p={p} r={[t * 2 + i, t + i, 0]} sc={sz} c={col} cast={false} o={o} /> : <Sph key={i} rad={rad} p={p} sc={sz} c={col} ws={8} hs={6} cast={false} o={o} />;
      })}
    </G>
  );
};
export const Duct: React.FC<{ a: V3; b: V3; rad?: number; o?: number; c?: string }> = ({ a, b, rad = 0.95, o = 0.55, c = GLASS }) => <Pipe a={a} b={b} rad={rad} c={c} o={{ opacity: o, depthWrite: false }} seg={10} cast={false} />;
export const Steel: React.FC<{ a: V3; b: V3; rad?: number }> = ({ a, b, rad = 0.7 }) => <Pipe a={a} b={b} rad={rad} c={STEEL} cast={false} />;

/** janela quadrada que acende (emissiva) */
export const Win: React.FC<{ p: V3; s?: V3; on: number }> = ({ p, s = [2.2, 2.2, 0.2], on }) => <Box s={s} p={p} c={on > 0.4 ? "#fff1a0" : "#566170"} o={on > 0.4 ? { emissive: "#ffd84a", ei: 1.3 } : undefined} cast={false} />;
export const Lamp: React.FC<{ p: V3; on: number }> = ({ p, on }) => (
  <G p={p}>
    <Cyl rt={0.18} h={6} p={[0, 3, 0]} c="#59626b" seg={6} cast={false} />
    <Sph rad={0.7} p={[0, 6.4, 0]} c={on > 0.4 ? "#fff1a0" : "#8a929a"} ws={8} hs={6} cast={false} o={on > 0.4 ? { emissive: "#ffd84a", ei: 1.5 } : undefined} />
    {on > 0.4 ? <Sph rad={2.2} p={[0, 6.4, 0]} c="#fff1a0" ws={8} hs={6} cast={false} o={{ opacity: 0.18, depthWrite: false, emissive: "#ffd84a", ei: 0.6 }} /> : null}
  </G>
);

/** bobina de fibras/aro de torus */
export const Torus: React.FC<{ p: V3; r?: V3; rad: number; tube: number; arc?: number; c: string; o?: { emissive?: string; ei?: number; opacity?: number } }> = ({ p, r, rad, tube, arc = PI * 2, c, o }) => (
  <mesh position={p} rotation={r}><torusGeometry args={[rad, tube, 8, 28, arc]} /><meshStandardMaterial color={c} emissive={o?.emissive ?? "#000000"} emissiveIntensity={o?.ei ?? 1} transparent={o?.opacity !== undefined} opacity={o?.opacity ?? 1} roughness={0.5} /></mesh>
);
export { fract };
