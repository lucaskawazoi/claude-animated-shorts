// Tempo, palavras e paleta. Tudo no vídeo é função do tempo t (s), e todo evento é preso a uma palavra da narração:
// trocar a voz retemporiza o vídeo inteiro sem mexer no resto.
import words from './words.json';

export const FPS = 30;
export const WORDS = words as { text: string; start: number; end: number }[];
export const W = (i: number) => WORDS[i].start;
export const WE = (i: number) => WORDS[i].end;
export const DURATION = Math.ceil((WORDS[WORDS.length - 1].end + 1.1) * FPS);

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lin = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const smooth = (t: number, a: number, b: number) => { const x = lin(t, a, b); return x * x * (3 - 2 * x); };
export const smoother = (t: number, a: number, b: number) => { const x = lin(t, a, b); return x * x * x * (x * (x * 6 - 15) + 10); };
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
// pop de jogo: 0 -> 1 com passada de 18% e volta (backOut), em d segundos
export const pop = (t: number, t0: number, d = 0.35) => {
  const x = lin(t, t0, t0 + d); const c = 2.2;
  return x <= 0 ? 0 : 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};
// queda com quique (peça de construção caindo no lugar): devolve deslocamento em y (>=0)
export const drop = (t: number, t0: number, h = 6, d = 0.45) => {
  const x = lin(t, t0, t0 + d);
  if (x >= 1) { const b = lin(t, t0 + d, t0 + d + 0.25); return b >= 1 ? 0 : Math.sin(b * Math.PI) * h * 0.06; }
  return h * (1 - x * x);
};
export const seeded = (s: number) => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

// Tomadas: [início em s, nome]. Cada corte cai 0,1 s antes da primeira palavra da tomada.
import shotDefs from './shots.json';
// shots.json (a mixagem lê o mesmo arquivo):
// - beats: os trechos da história [palavra, deslocamento s, nome] — quem está em cena, o que acontece;
// - cuts: os cortes secos de câmera (s). Entre cortes a câmera desliza de um beat a outro sem cortar, como a referência
//   (tomadas de ~10 s). Os cortes caem nos mesmos pontos relativos dos cortes da referência (dissect check).
export const SHOTS: [number, string][] = (shotDefs.beats as [number | null, number, string][]).map(([i, d, n]) => [(i === null ? 0 : W(i)) + d, n]);
export const CUTS: number[] = shotDefs.cuts;
export const nextCut = (t: number) => CUTS.find(c => c > t + 1e-3) ?? Infinity;
export const shotAt = (t: number) => { let k = 0; for (let i = 0; i < SHOTS.length; i++) if (t >= SHOTS[i][0]) k = i; return k; };
export const shotName = (t: number) => SHOTS[shotAt(t)][1];
export const shotStart = (name: string) => SHOTS.find(s => s[1] === name)![0];
export const shotEnd = (name: string) => { const i = SHOTS.findIndex(s => s[1] === name); return i + 1 < SHOTS.length ? SHOTS[i + 1][0] : DURATION / FPS; };

export const C = {
  grass: '#6fcf4a', grassTop: '#7ddb55', grassDark: '#57b33a', dirt: '#8a5a32', dirtDark: '#5e3b22', dirtLight: '#b07a46',
  concrete: '#cfd3d4', concreteDark: '#a3a9ac', water: '#3ea7e6', waterDeep: '#2b89cc', foam: '#eaf7ff', sand: '#ecd79c',
  hullRed: '#d9483b', hullNavy: '#27406e', deck: '#f3f3f0', gate: '#f08a24', rail: '#6b6f73', mule: '#2fae66',
  helmet: '#ffcc1f', vest: '#ff7a1a', shirt: '#2f6fd6', pants: '#24345c', skin: '#f2c29b', hair: '#5a3a22', boot: '#3a2a1f',
  sky: '#8fd0ff', skyLow: '#e6f4ff', trunk: '#8b5a2b', leaf: '#3fae49', leafLight: '#5ccf55', rock: '#9aa0a6',
};
export const CONTAINERS = ['#f2a541', '#2fa4e7', '#e84a5f', '#3ec27e', '#f7d046', '#8e6cf0'];

// Geografia do mundo de brinquedo (unidades ~ metros de brinquedo)
export const SEA = 0, LAND = 4, LAKE = 3.6, VALLEY = 2.4;
export const STEP_X = [-15, -10, -5, 0];          // limites x das 3 câmaras (degraus)
export const OLD_Z = 0, OLD_W = 2.2, NEW_Z = 7.6, NEW_W = 3.2;
