// Confere a coerência temporal do episódio atual (./ep.sh <slug> antes): planos em ordem, chaves de câmera dentro do próprio
// plano e em ordem, operário em ordem, pílulas com a<b. Uso: bun run scripts/check_ep.ts   (sai 1 se achar problema)
import { EP } from "../src/ep/current";
import { CUTS, DURATION_S } from "../src/toy/cues";
const bad: string[] = [];
const f = (x: number) => x.toFixed(2);
EP.SHOTS.forEach((s, i) => {
  const end = EP.SHOTS[i + 1]?.t0 ?? DURATION_S;
  if (i && s.t0 < EP.SHOTS[i - 1].t0) bad.push(`plano ${i} começa antes do anterior`);
  s.keys.forEach((k, j) => {
    if (j && k.t < s.keys[j - 1].t - 1e-6) bad.push(`plano ${i} «${s.name}»: chave ${j} (${f(k.t)}) antes da chave ${j - 1} (${f(s.keys[j - 1].t)})`);
    if (k.t < s.t0 - 0.06 || k.t > end + 0.06) bad.push(`plano ${i} «${s.name}»: chave ${j} em ${f(k.t)} fora de [${f(s.t0)}, ${f(end)}]`);
  });
});
EP.WORKER.forEach(([t], i) => { if (i && t < EP.WORKER[i - 1][0] - 1e-6) bad.push(`operário: item ${i} (${f(t)}) antes do anterior (${f(EP.WORKER[i - 1][0])})`); });
EP.HUD.pills.forEach((p) => { if (!(p.b > p.a)) bad.push(`pílula ${p.label}: fim ${f(p.b)} não depois do início ${f(p.a)}`); });
const shotT0 = EP.SHOTS.map((s) => s.t0);
CUTS.forEach((c, i) => { if (!shotT0.some((t) => Math.abs(t - c) < 1e-3)) bad.push(`corte ${i + 1} (${f(c)}) sem plano começando nele`); });
console.log(bad.length ? bad.join("\n") : `ok: ${EP.SHOTS.length} planos, duração ${f(DURATION_S)} s`);
process.exit(bad.length ? 1 : 0);
