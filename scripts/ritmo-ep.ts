// Ritmo do episódio atual: duração de cada plano (corte a corte) e o piso calmo do canal (mediana ≥ 1,3 s, nenhum < 0,8 s).
// Uso: bun scripts/ritmo-ep.ts  (lê src/ep/current.ts; não renderiza nada)
import { EP } from "../src/ep/current";
import { DURATION_S } from "../src/toy/cues";

const t0s = EP.SHOTS.map((s) => s.t0).sort((a, b) => a - b);
const d = t0s.map((t, i) => (t0s[i + 1] ?? DURATION_S) - t);
const sorted = [...d].sort((a, b) => a - b), med = sorted[Math.floor(sorted.length / 2)];
EP.SHOTS.forEach((s, i) => console.log(`${String(i).padStart(2)} ${s.t0.toFixed(2).padStart(6)} ${d[i].toFixed(2).padStart(5)}  ${s.name}`));
const ok = med >= 1.3 && Math.min(...d) >= 0.8;
console.log(`planos ${d.length} · mediana ${med.toFixed(2)} s · menor ${Math.min(...d).toFixed(2)} s · duração ${DURATION_S.toFixed(1)} s · ${ok ? "PASSA" : "NÃO PASSA"} no piso calmo`);
if (!ok) process.exit(1);
