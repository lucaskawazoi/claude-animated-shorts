// Mapa de batidas do episódio atual (./ep.sh <slug>): âncoras em ordem de tempo, com os cortes e janelas da régua no meio.
import { T } from "../src/ep/current-cues";
import { CUTS, WINS, DURATION_S } from "../src/toy/cues";
const ev: [number, string][] = Object.entries(T).map(([k, v]) => [v as number, k]);
CUTS.forEach((c, i) => ev.push([c, `══ CORTE ${i + 1}`]));
[3, 6, 10].forEach((i) => ev.push([WINS[i], `── W${i}`]));
ev.sort((a, b) => a[0] - b[0]);
console.log(`dur ${DURATION_S.toFixed(2)}\n` + ev.map(([t, k]) => `${t.toFixed(2).padStart(6)} ${k}`).join("\n"));
