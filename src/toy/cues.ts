// Pontos da história = momentos em que palavras específicas são ditas (tempos por palavra do ElevenLabs).
// A imagem reage 0-3 quadros ANTES da palavra: as âncoras abaixo já saem com essa folga (LEAD).
import wordsRaw from "./words.json";

export const FPS = 30;
export type Word = { text: string; start: number; end: number };
export const words: Word[] = (wordsRaw as Word[]);
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, "");
const toks = words.map((w) => norm(w.text));

/** início (s) da n-ésima ocorrência de uma frase; falha alto se não achar (nada de âncora silenciosa) */
export const find = (phrase: string, nth = 0, lead = 0.07): number => {
  const q = norm(phrase).split(" ").filter(Boolean);
  let seen = 0;
  for (let i = 0; i + q.length <= toks.length; i++) {
    if (q.every((w, j) => toks[i + j] === w)) { if (seen === nth) return Math.max(0, words[i].start - lead); seen++; }
  }
  throw new Error(`âncora não achada: "${phrase}" #${nth}`);
};
export const endOf = (phrase: string, nth = 0): number => {
  const q = norm(phrase).split(" ").filter(Boolean);
  let seen = 0;
  for (let i = 0; i + q.length <= toks.length; i++) {
    if (q.every((w, j) => toks[i + j] === w)) { if (seen === nth) return words[i + q.length - 1].end; seen++; }
  }
  throw new Error(`âncora não achada: "${phrase}" #${nth}`);
};

export const DURATION_S = words[words.length - 1].end + 0.5;
export const TOTAL_FRAMES = Math.ceil(DURATION_S * FPS);

export const T = {
  oitenta: find("oitenta e cinco"), etanol: find("de etanol"), resto: find("e o resto"), quinhentas: find("quinhentas"), cemT: find("cem toneladas"), porHora: find("por hora", 1),
  moenda: find("a moenda"), caldoDoce: find("o caldo doce"), bagaco: find("e sai o bagaco"), montanha: find("uma montanha"),
  p1: find("tem um probleminha", 0, 0.1),
  d1: find("deixa comigo", 0, 0.1), joga: find("joga o bagaco"), fogo: find("o fogo faz vapor"), turbina: find("gira a turbina"), energia: find("propria energia"), essaCaldeira: find("essa e a caldeira"),
  maisCaldo: find("mas o caldo"), garapa: find("com garapa"), p2: find("tem um probleminha", 1, 0.1),
  d2: find("deixa comigo", 1, 0.1), levedura: find("entra a levedura"), devora: find("ela devora"), essaDorna: find("essa e a dorna"), nove: find("nove por cento"), restoAgua: find("o resto e agua"), p3: find("tem um probleminha", 2, 0.1),
  d3: find("deixa comigo", 2, 0.1), coluna: find("numa coluna"), ferve: find("o alcool ferve"), viraEtanol: find("vira etanol"), essaDestilaria: find("essa e a destilaria"), enche: find("o caminhao enche"), vinhaca: find("a vinhaca"), dez: find("mais de dez litros"), p4: find("tem um probleminha", 3, 0.1),
  d4: find("deixa comigo", 3, 0.1), potassio: find("cheia de potassio"), adubo: find("ou seja"), canais: find("canais levam"), canaNova: find("a cana nova"), essaFert: find("essa e a fertirrigacao"),
  eoBagaco: find("e o bagaco que sobrou"), gera: find("gera tanta energia"), vende: find("vende o resto"), cidade: find("uma cidade de cem mil casas"), casas: find("cem mil casas"), parabens: find("parabens chefe"), construiu: find("voce construiu"), manda: find("manda pra quem"),
  abastece: find("abastece o carro"), aquece: find("esquenta o vinho"), preto: find("caldo preto"), sobe: find("sobe"), esfria: find("esfria"),
  end: DURATION_S,
};
