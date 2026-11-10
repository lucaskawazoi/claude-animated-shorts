#!/usr/bin/env bash
# Testa se a régua (dissect) enxerga cada um dos 7 cortes duros de um episódio: renderiza 1 s em volta de cada corte
# (escala 0,5) e mede com a mesma função da dissect. ~3-5 min. Uso: ./cutclips.sh <slug>
set -euo pipefail
./ep.sh "$1" >/dev/null
C=$(bun -e 'import {CUTS} from "./src/toy/cues"; console.log(CUTS.join(","))')
mkdir -p out/cuts_$1
for c in ${C//,/ }; do
  a=$(python3 -c "print(round($c*30)-15)"); b=$(python3 -c "print(round($c*30)+15)")
  REMOTION_TMP=${REMOTION_TMP:-/tmp/rem} node scripts/render.mjs video out/cuts_$1/c_$c.mp4 0.5 23 $a-$b 2>&1 | grep -q "^done"
  r=$(cd ../../videos/ecos-shorts && uv run -q --with numpy --with pillow python -I cortes.py ../../repos/claude-animated-shorts/out/cuts_$1/c_$c.mp4 0.5 2>&1 | tail -1)
  echo "corte $c: $r"
done
