#!/usr/bin/env bash
# Mede a luz de um episódio em quadros soltos (1 por segundo, sem exposição) e grava src/ep/<slug>/exposure.ts.
#   ./lum.sh <slug>
set -euo pipefail
./ep.sh "$1" >/dev/null
D=$(bun -e 'import {DURATION_S} from "./src/toy/cues"; console.log(DURATION_S)')
F=$(python3 -c "print(','.join(str(int(t*30)+15) for t in range(0, int($D))))")
rm -rf "out/lum_$1" && mkdir -p "out/lum_$1"
PROPS='{"exposure":false}' REMOTION_TMP=${REMOTION_TMP:-/tmp/rem} node scripts/render.mjs still "out/lum_$1/x_" "$F" 0.12 2>&1 | grep -iv "webgl\|^still" || true
uv run -q --with pillow --with numpy python3 scripts/exposure_from_stills.py "out/lum_$1/x_" ../../videos/ecos-shorts/_ref/ref-dissect "$D" "src/ep/$1/exposure.ts"
