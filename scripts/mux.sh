#!/usr/bin/env bash
# Mix final: voz (comprimida) + efeitos + cama musical (18 dB abaixo da voz, como a referência) → -14 LUFS, colado ao vídeo mudo.
# Uso: scripts/mux.sh <voz.mp3> <video-mudo.mp4> <saida.mp4> [dir-out=out]
set -euo pipefail
VOZ="$1"; VID="$2"; SAI="$3"; OUT="${4:-out}"
DUR=$(python3 -c "import json;print(json.load(open('$OUT/cues.json'))['DURATION_S'])")
SFXG="${SFXG:-0.38}"; MUSG="${MUSG:-0.125}"
ffmpeg -y -loglevel error -i "$VOZ" -i "$OUT/sfx.wav" -i "$OUT/music.wav" -filter_complex \
"[0:a]aresample=48000,aformat=channel_layouts=stereo,highpass=f=80,acompressor=threshold=0.1:ratio=3:attack=5:release=100,apad=whole_dur=$DUR[v];
 [1:a]volume=$SFXG[s]; [2:a]volume=$MUSG[m];
 [v][s][m]amix=inputs=3:normalize=0:duration=longest,loudnorm=I=-14:TP=-1.5:LRA=7,atrim=0:$DUR[out]" -map "[out]" -ar 48000 "$OUT/mix.wav"
ffmpeg -y -loglevel error -i "$VID" -i "$OUT/mix.wav" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest "$SAI"
echo "ok $SAI"
