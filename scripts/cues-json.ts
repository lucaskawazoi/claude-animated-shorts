// Lista de efeitos do episódio atual no formato da mixagem do Mundo em Peças: {DURATION_S, SFX: [[nome, t, dB], ...]}.
// Uso: bun scripts/cues-json.ts <saida.json>
import { writeFileSync } from "node:fs";
import { EP } from "../src/ep/current";
import { DURATION_S } from "../src/toy/cues";

const out = process.argv[2];
if (!out) throw new Error("uso: bun scripts/cues-json.ts <saida.json>");
const SFX = [...EP.SFX].sort((a, b) => a[1] - b[1]).map(([n, t, db]) => [n, Math.round(t * 1000) / 1000, db]);
writeFileSync(out, JSON.stringify({ DURATION_S, SFX }));
console.log(`${SFX.length} efeitos, ${DURATION_S.toFixed(2)} s → ${out}`);
