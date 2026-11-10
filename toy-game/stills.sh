#!/usr/bin/env bash
# stills.sh <pasta-saida> <t1,t2,...>  — empacota uma vez e renderiza quadros (em segundos) a 0.5 de escala, depois monta uma folha
set -e
OUT=$1; TS=$2; mkdir -p "$OUT"
export TMPDIR=${TMPDIR:-/tmp}
npx remotion bundle src/index.ts --out-dir out/bundle >/dev/null 2>&1
for t in ${TS//,/ }; do
  f=$(python3 -c "print(round($t*30))")
  npx remotion still out/bundle Canal "$OUT/s_$(printf '%05.1f' $t).jpg" --frame $f --scale 0.5 --image-format jpeg --log=error >/dev/null 2>&1 &
  while [ $(jobs -r | wc -l) -ge 6 ]; do sleep 0.3; done
done
wait
ffmpeg -v error -y -pattern_type glob -i "$OUT/s_*.jpg" -vf "scale=270:480,tile=8x$(( ( $(ls $OUT/s_*.jpg | wc -l) + 7 ) / 8 ))" -frames:v 1 "$OUT/sheet.jpg"
echo "$OUT/sheet.jpg"
