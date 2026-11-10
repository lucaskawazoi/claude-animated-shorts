# toy-game — explicador vertical "3D de brinquedo com cara de jogo" (pt-BR)

Adaptação do motor three.js + Remotion deste fork para o estilo de jogo de gestão: mundo low-poly de brinquedo feito só
com primitivas (sem modelos externos), operário recorrente, painel de jogo em DOM (contador, título amarelo, alerta,
⏪, carimbo do bordão, recompensa com confete) e legenda de uma palavra por vez.

Primeiro vídeo: **"Zerou? Ainda não."** — o Canal do Panamá montado peça por peça (91,7 s).

| Arquivo | O que faz |
|---|---|
| `src/words.json` | tempos por palavra da narração (ElevenLabs `with-timestamps`). Tudo no vídeo se prende a uma palavra. |
| `src/shots.json` | tomadas: `[índice da palavra, deslocamento s, nome]` (a mixagem lê o mesmo arquivo) |
| `src/lib.ts` | tempo, curvas (`pop`, `drop`, `smooth`), paleta de brinquedo, geografia do mundo |
| `src/story.ts` | o estado do mundo por tempo: níveis d'água, comportas, navios, escavação, represa, lago |
| `src/models.tsx` | navio porta-contêiner, operário (colete laranja, capacete, bigode), mula, árvore, nuvem, tufos |
| `src/Level.tsx` | a ilha em degraus, o vale que vira lago, o morro do corte, eclusas antigas e novas com piscinas |
| `src/MapSet.tsx` | abertura: o navio dando a volta na América do Sul num mapa de jogo |
| `src/cams.ts` | câmera de jogo por tomada (sempre em movimento, rolagem leve, tremida nos impactos) |
| `src/Hud.tsx` | o painel de jogo e a legenda |
| `stills.sh` | quadros soltos a 0,5 + folha de contato, para checar antes do render completo |

```bash
npm install
./stills.sh out/st 3,10.5,34 # quadros em segundos -> out/st/sheet.jpg
npx remotion bundle src/index.ts --out-dir out/bundle
npx remotion render out/bundle Canal out/video.mp4 --codec h264 --crf 18 --concurrency 6
node dump-shots.mjs > out/shots_only.json   # para a mixagem
```
Render por CPU: `remotion.config.ts` usa `swangle` (WebGL em software); `angle` falha nesta VM sem GPU.
