#!/usr/bin/env bash
# cues-json.sh <slug> <saida.json>: exporta {DURATION_S, SFX} de um episódio SEM trocar o atual (ep.sh mexe em src/words.json,
# o que quebra episódios montados em paralelo). Copia só o mínimo da árvore: toy/cues.ts + words.json + ep/<slug>/cues.ts.
# ponytail: exige que src/ep/<slug>/cues.ts importe só de ../../toy/cues (é assim em todos os episódios).
set -euo pipefail
cd "$(dirname "$0")"; D=$(mktemp -d)
mkdir -p "$D/src/toy" "$D/src/ep/$1"
cp src/toy/cues.ts "$D/src/toy/"; cp "src/ep/$1/words.json" "$D/src/words.json"; cp "src/ep/$1/cues.ts" "$D/src/ep/$1/"
(cd "$D" && ~/.local/bin/bun -e "import {SFX} from './src/ep/$1/cues'; import {DURATION_S} from './src/toy/cues'; console.log(JSON.stringify({DURATION_S, SFX}))") > "$2"
rm -rf "$D"
