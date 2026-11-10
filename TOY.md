# Branch `pt-toy-game` — explicador 3D de brinquedo com cara de jogo (português)

Adaptação do fork para o estilo "mundo de brinquedo + painel de jogo" (ver a skill `toy-game-explainer` do my-hub, que é a fonte de verdade das regras, medições e decisões).

- `src/toy/` — o motor: `cues.ts` (pontos da história = palavras ditas), `story.ts` (planos de câmera com corte duro + deslizes, operário), `stations.tsx` (usina), `scenery.tsx`,
  `worker.tsx`, `hud.tsx` (contadores, títulos amarelos, ⚠, ⏪, recompensa, legenda por palavra), `exposure.ts` (curva de luz).
- `scripts/` — `render.mjs` (WebGL por software com `gl: swangle`, sem GPU), `sheet.py`, `audio_toy.py` (SFX e música sintetizados), `mux.sh` (mix a −14 LUFS), `motion_proxy.py`,
  `exposure_fit.py`, `verify_final.py`, `review_page.py`.
- As imagens de referência de outro canal (`references/frames`, `references/sheets`) foram removidas desta branch. `templates/` e `SKILL.md` do fork original seguem como estavam.
- Primeiro vídeo: usina de cana (roteiro, voz e vídeo em `my-hub/videos/toy-game-explainer-v1/`). Para outro tema: novo `roteiro.txt` → voz → `src/toy/words.json` → estações e planos.
