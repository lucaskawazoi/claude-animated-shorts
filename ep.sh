#!/usr/bin/env bash
# Troca o episódio atual: ./ep.sh <slug>  (src/ep/<slug>/episode.tsx + words.json)
set -euo pipefail
test -f "src/ep/$1/episode.tsx" && test -f "src/ep/$1/words.json"
cp "src/ep/$1/words.json" src/words.json
printf '// Episódio atual (troque com ./ep.sh <slug>, que também copia as palavras para src/words.json).\nexport { EP } from "./%s/episode";\n' "$1" > src/ep/current.ts
printf 'export { T } from "./%s/cues";\n' "$1" > src/ep/current-cues.ts
echo "episódio: $1"
