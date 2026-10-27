#!/usr/bin/env bash
# ============================================================
# run-test.sh — generic model-builder batch runner
#
# Self-contained: clone this repo, put your instructions in
# prompt.txt, one model per line in models.txt, then:
#   ./run-test.sh                       # all models in models.txt
#   ./run-test.sh --dry                 # preview everything, zero quota
#   ./run-test.sh --models models-dashain.txt
#   ./run-test.sh --prompt prompt-dashain.txt --models models-dashain.txt
#
# models.txt — one line per run ("Name|provider/model" or plain
# "provider/model", # comments and blank lines are skipped):
#   Dashain GLM5.3 flash free|opencode/glm-5.3-flash-free
#   opencode/deepseek-v4.1-flash-free    → folder "deepseek-v4.1-flash-free"
#
# Each model builds inside its own fresh folder under Projects/.
# Output: Projects/<folder name>/, a summary in
# Projects/last-batch-report.txt, a terminal summary, and a desktop
# notification when notify-send is available. One failed model never
# stops the batch — every model gets its turn.
# ============================================================
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
PROJECTS="$SCRIPT_DIR/Projects"
PROMPT="$SCRIPT_DIR/prompt.txt"
MODELS="$SCRIPT_DIR/models.txt"
DRY=0

usage() { echo "usage: run-test.sh [--dry] [--prompt FILE] [--models FILE]"; }

# ---- argument parsing (boring on purpose) -------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry)    DRY=1; shift ;;
    --prompt) [[ $# -ge 2 && -n "${2:-}" ]] || { echo "❌ --prompt needs a file argument"; exit 1; }
              PROMPT="$2"; shift 2 ;;
    --models) [[ $# -ge 2 && -n "${2:-}" ]] || { echo "❌ --models needs a file argument"; exit 1; }
              MODELS="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "❌ unknown argument: $1"; usage; exit 1 ;;
  esac
done

# Resolve relative --prompt/--models paths against this folder.
[[ -f "$PROMPT" ]] || PROMPT="$SCRIPT_DIR/$(basename "$PROMPT")"
[[ -f "$PROMPT" ]] || { echo "❌ prompt file not found: $PROMPT"; exit 1; }
[[ -f "$MODELS" ]] || MODELS="$SCRIPT_DIR/$(basename "$MODELS")"
[[ -f "$MODELS" ]] || { echo "❌ models file not found: $MODELS"; exit 1; }

INSTRUCTIONS=$(cat "$PROMPT")                          # read the prompt once
mkdir -p "$PROJECTS"
REPORT="$PROJECTS/last-batch-report.txt"
: > "$REPORT"
printf 'batch report — prompt: %s — models: %s — %s\n\n' \
  "$(basename "$PROMPT")" "$(basename "$MODELS")" "$(date '+%F %T')" >> "$REPORT"

ok=0; fail=0

notify_desktop() {  # best-effort popup; harmless when absent
  command -v notify-send >/dev/null 2>&1 &&
    notify-send "Model batch finished" "$1 ok, $2 failed — see Projects/last-batch-report.txt" || true
}

record() { echo "$1"; echo "$1" >> "$REPORT"; }

# ---- run every model, one line at a time --------------------
# Default `read` trims surrounding whitespace; CRLF clones stay safe.
while read -r line; do
  [[ -z "$line" || "$line" == '#'* ]] && continue
  line=${line%$'\r'}

  if [[ "$line" == *"|"* ]]; then
    bname=${line%%|*}; bmodel=${line#*|}
  else
    bname=${line##*/}; bmodel="$line"                 # derive folder from model slug
  fi
  bname=${bname//\//-}                                # keep folder names single-level
  echo "── test: $bname ($bmodel)"

  dir="$PROJECTS/$bname"
  if (( DRY )); then
    echo "DRY: mkdir '$dir' && opencode run --model '$bmodel' --auto <$(basename "$PROMPT")> --title '$bname'"
    record "DRY   $bname ($bmodel)"
    continue
  fi

  mkdir -p "$dir"
  status="ok"
  if (cd "$dir" && opencode run --model "$bmodel" --auto "$INSTRUCTIONS" --title "$bname"); then
    nfiles=$(find "$dir" -maxdepth 1 -type f | wc -l)
    (( nfiles > 0 )) || { status="no output files"; fail=$((fail + 1)); }
  else
    status="run failed"
    fail=$((fail + 1))
  fi
  [[ "$status" == "ok" ]] && ok=$((ok + 1))
  record "$status  $bname ($bmodel)"
done < "$MODELS"

# ---- summary ------------------------------------------------
if (( DRY )); then
  echo "══ dry run done — nothing was executed"
else
  record ""
  record "result: $ok ok, $fail failed ($(date '+%F %T'))"
  echo "══ batch complete: $ok ok, $fail failed → $REPORT"
  notify_desktop "$ok" "$fail"
fi
