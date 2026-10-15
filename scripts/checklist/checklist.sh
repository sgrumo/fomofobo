#!/usr/bin/env bash

set -euo pipefail

config_path=""

while [[ $# -gt 0 ]]; do
    case "$1" in
    --config)
        config_path="$2"
        shift 2
        ;;
    *)
        echo "Unknown argument: $1"
        exit 1
        ;;
    esac
done

if [ -z "$config_path" ]; then
    echo "Usage: checklist.sh --config <config.json>"
    exit 1
fi

lock_dir="/tmp/checklist-running.lock"
lock_stale_minutes=30
logged_waiting=0

while ! mkdir "$lock_dir" 2>/dev/null; do
    owner=$(cat "$lock_dir/pid" 2>/dev/null || true)
    if [ -z "$owner" ] || ! kill -0 "$owner" 2>/dev/null ||
        [ -n "$(find "$lock_dir" -maxdepth 0 -mmin +"$lock_stale_minutes" 2>/dev/null)" ]; then
        echo "🧹 Removing a stale lock at $lock_dir"
        rm -rf "$lock_dir"
        continue
    fi
    if [ "$logged_waiting" -eq 0 ]; then
        echo "⏳ Another checklist run is in progress, waiting for it to finish..."
        logged_waiting=1
    fi
    wait_time=$(awk -v r="$RANDOM" 'BEGIN { srand(r); printf "%.3f", 4 + rand() * 2 }')
    sleep "$wait_time"
done

echo $$ >"$lock_dir/pid"
trap 'rm -rf "$lock_dir"' EXIT INT TERM HUP

json=$(cat "$config_path")
count=$(echo "$json" | jq 'length')

# Agent mode: compact, log-to-file output. Mirror of configs/agent/is-agent.ts.
if [ "${AGENT:-}" != "true" ] &&
    [ -z "${AI_AGENT:-}${CLAUDECODE:-}${CLAUDE_CODE:-}${CURSOR_AGENT:-}${CODEX_SANDBOX:-}${CODEX_THREAD_ID:-}${GEMINI_CLI:-}${COPILOT_CLI:-}" ]; then
    export FORCE_COLOR=1
    for ((i = 0; i < count; i++)); do
        command=$(echo "$json" | jq -r ".[$i].command")
        eval "$command"
    done
    exit 0
fi

export FORCE_COLOR=0
failed=0

log_file="$(git rev-parse --show-toplevel 2>/dev/null || pwd)/.ignored/checklist.log"
mkdir -p "$(dirname "$log_file")"
: >"$log_file"

for ((i = 0; i < count; i++)); do
    label=$(echo "$json" | jq -r ".[$i].label")
    command=$(echo "$json" | jq -r ".[$i].command")

    printf "⏳ %s running..." "$label"

    output=$(eval "$command" 2>&1) && exit_code=0 || exit_code=$?

    printf "\r\033[2K"

    output_clean=$(printf '%s' "$output" | sed -E $'s/\x1b\\[[?0-9;]*[a-zA-Z]//g; s/\x1b\\][^\x07]*\x07//g')

    {
        printf '=== %s ===\n' "$label"
        printf '$ %s\n' "$command"
        printf '%s\n' "$output_clean"
        printf '[exit %d]\n\n' "$exit_code"
    } >>"$log_file"

    if [ "$exit_code" -eq 0 ]; then
        echo "✅ $label"
    else
        echo "❌ $label"
        echo "$output"
        echo ""
        echo "Full log: $log_file"
        failed=1
        break
    fi
done

if [ "$failed" -eq 0 ]; then
    echo ""
    echo "✅ All checks passed"
else
    exit 1
fi
