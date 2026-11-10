// Tempo do vídeo = palavras ditas. src/words.json é a cópia das palavras do episódio atual (ep.sh troca o episódio).
// A imagem reage 0-3 quadros ANTES da palavra: as âncoras saem com essa folga (lead).
import wordsRaw from "../words.json";

export const FPS = 30;
export type Word = { text: string; start: number; end: number };
export const words: Word[] = wordsRaw as Word[];
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, "");
const toks = words.map((w) => norm(w.text));
const at = (phrase: string, nth: number) => {
  const q = norm(phrase).split(" ").filter(Boolean);
  let seen = 0;
  for (let i = 0; i + q.length <= toks.length; i++) if (q.every((w, j) => toks[i + j] === w)) { if (seen === nth) return [i, q.length]; seen++; }
  throw new Error(`âncora não achada: "${phrase}" #${nth}`); // nada de âncora silenciosa
};
/** início (s) da n-ésima ocorrência de uma frase */
export const find = (phrase: string, nth = 0, lead = 0.07) => Math.max(0, words[at(phrase, nth)[0]].start - lead);
/** fim (s) da n-ésima ocorrência de uma frase */
export const endOf = (phrase: string, nth = 0) => { const [i, n] = at(phrase, nth); return words[i + n - 1].end; };

export const DURATION_S = words[words.length - 1].end + 0.5;
export const TOTAL_FRAMES = Math.ceil(DURATION_S * FPS);

// Régua (dissect do reel de referência, 96,733 s): planos e cortes duros, escalados à duração deste episódio.
// A dissect compara o instante RELATIVO de cada corte duro (tolerância ≈1,5% da duração) e o movimento por plano em ranking.
export const REF_DUR = 96.733;
const REF_STARTS = [0, 10.867, 21.933, 23.467, 31.967, 45.033, 53.267, 54.233, 71.867, 81.5, 93.133];
const REF_HARD = [10.867, 21.933, 31.967, 45.033, 54.233, 71.867, 81.5];
export const sc = (x: number) => (x * DURATION_S) / REF_DUR;
/** os 7 cortes duros, em segundos deste vídeo (quantizados ao quadro) */
export const CUTS = REF_HARD.map((x) => Math.round(sc(x) * FPS) / FPS);
/** início das 11 janelas de plano da referência (7 cortes + 3 passagens contínuas), em segundos deste vídeo */
export const WINS = REF_STARTS.map(sc);
