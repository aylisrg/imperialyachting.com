#!/usr/bin/env bash
# usage: make-clip.sh <youtube-id> <start_s> <duration_s> <name> [role] [crop] [poster_offset]
# role: hero|section|fleet|people (default section); crop: ffmpeg crop expr w:h:x:y (optional, e.g. split-screen source)
set -euo pipefail
ID=$1; START=$2; DUR=$3; NAME=$4; ROLE=${5:-section}; CROP=${6:-}; POFF=${7:-1}
ROOT=$(cd "$(dirname "$0")/.." && pwd); SRC_DIR=${SRC_DIR:-$ROOT/../video/src}; OUT=$ROOT/clips
mkdir -p "$SRC_DIR" "$OUT"
SRC="$SRC_DIR/$ID.mp4"
if [ ! -s "$SRC" ]; then
  yt-dlp -q --no-warnings -f "bv*[height<=1080][ext=mp4]/bv*[ext=mp4]" -o "$SRC" "https://youtu.be/$ID" \
   || { echo "download failed for $ID (YouTube may require sign-in from this IP); put the file at $SRC manually" >&2; exit 1; }
fi
XF=0.5   # loop crossfade seconds
PRE=${CROP:+crop=$CROP,}
# seamless loop: body = [start+XF, start+XF+DUR], last XF seconds crossfade into head [start, start+XF]
enc() { # $1 width  $2 codec-args...  $3 ext
  local W=$1; shift; local EXT=$1; shift
  ffmpeg -nostdin -v error -y -ss "$START" -t "$(python3 -c "print($DUR+$XF)")" -i "$SRC" -an -filter_complex \
   "[0:v]${PRE}scale=$W:-2:flags=lanczos,eq=saturation=1.1,fps=30,split[a][b];[a]trim=$XF:$(python3 -c "print($DUR+$XF)"),setpts=PTS-STARTPTS,fps=30[body];[b]trim=0:$XF,setpts=PTS-STARTPTS,fps=30[head];[body][head]xfade=transition=fade:duration=$XF:offset=$(python3 -c "print($DUR-$XF)"),format=yuv420p[v]" \
   -map "[v]" "$@" "$OUT/$NAME-$W.$EXT"
}
for W in 1920 960; do
  enc $W mp4 -c:v libx264 -profile:v main -preset slow -crf ${CRF_MP4:-26} -movflags +faststart
  enc $W webm -c:v libvpx-vp9 -b:v 0 -crf ${CRF_WEBM:-38} -deadline good -cpu-used 4 -row-mt 1
done
ffmpeg -nostdin -v error -y -ss "$(python3 -c "print($START+$XF+$POFF)")" -i "$SRC" -frames:v 1 -vf "${PRE}scale=1920:-2:flags=lanczos,eq=saturation=1.1" -q:v 4 "$OUT/$NAME.jpg"
python3 - "$ROOT/content/clips.json" "$NAME" "$ID" "$START" "$DUR" "$ROLE" "$CROP" <<'PY'
import json,sys,os
f,name,vid,start,dur,role,crop=sys.argv[1:]
d=json.load(open(f)) if os.path.exists(f) else []
d=[c for c in d if c["id"]!=name]
d.append({"id":name,"source":vid,"start":float(start),"duration":float(dur),"role":role,"crop":crop or None,"poster":f"clips/{name}.jpg"})
json.dump(d,open(f,"w"),indent=2)
PY
ls -la "$OUT/$NAME"-* | awk '{print $5, $9}'
