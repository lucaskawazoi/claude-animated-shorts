// SHOTS e duração em JSON para a mixagem, a partir de src/shots.json + src/words.json (mesma fonte do vídeo)
import words from './src/words.json' with { type: 'json' };
import defs from './src/shots.json' with { type: 'json' };
const shots = defs.map(([i, d, n]) => [(i === null ? 0 : words[i].start) + d, n]);
console.log(JSON.stringify(shots));
