// beats (para os efeitos presos à história), cortes e chicotes de câmera, em JSON para a mixagem — mesma fonte do vídeo
import words from './src/words.json' with { type: 'json' };
import defs from './src/shots.json' with { type: 'json' };
const beats = defs.beats.map(([i, d, n]) => [(i === null ? 0 : words[i].start) + d, n]);
console.log(JSON.stringify({ beats, cuts: defs.cuts, whips: defs.whips }));
