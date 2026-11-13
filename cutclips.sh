#!/usr/bin/env bash
# Testa se a régua (dissect) enxerga cada um dos 7 cortes duros de um episódio: renderiza 1 s em volta de cada corte
# (escala 0,5) e mede com a mesma função da dissect. ~3-5 min. Uso: ./cutclips.sh <slug>
set -euo pipefail
export EP="$1"   # cada render usa este episódio (scripts/render.mjs), sem trocar o atual
C=$(python3 -c "import json;w=json.load(open('src/ep/$1/words.json'));D=w[-1]['end']+0.5;print(','.join(str(round(x*D/96.733*30)/30) for x in [10.867,21.933,31.967,45.033,54.233,71.867,81.5]))")
mkdir -p out/cuts_$1
for c in ${C//,/ }; do
  a=$(python3 -c "print(round($c*30)-15)"); b=$(python3 -c "print(round($c*30)+15)")
  # ponytail: 10 min por clipe; um Chrome travado já segurou isto 80 min (12/11)
  if ! REMOTION_TMP=${REMOTION_TMP:-/tmp/rem} timeout 600 node scripts/render.mjs video out/cuts_$1/c_$c.mp4 0.5 23 $a-$b 2>&1 | grep -q "^done"; then
    echo "corte $c: render falhou ou travou"; continue
  fi
  r=$(cd ../../videos/ecos-shorts && uv run -q --with numpy --with pillow python -I cortes.py ../../repos/claude-animated-shorts/out/cuts_$1/c_$c.mp4 0.5 2>&1 | tail -1)
  echo "corte $c: $r"
done
