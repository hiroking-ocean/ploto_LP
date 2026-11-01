#!/usr/bin/env bash
# Ploto local API client for bash environments (Git Bash, WSL, etc.)
set -euo pipefail

if [ -z "${PLOTO_API_URL:-}" ] || [ -z "${PLOTO_API_TOKEN:-}" ]; then
  echo "Error: PLOTO_API_URL or PLOTO_API_TOKEN is not set. Launch this from Ploto's terminal or export the variables." >&2
  exit 1
fi

METHOD="${1:-context}"
PARAMS="${2:-{}}"

# Generate a request ID if uuidgen or /proc/sys/kernel/random/uuid is unavailable
if command -v uuidgen >/dev/null 2>&1; then
  REQUEST_ID="$(uuidgen)"
elif [ -f /proc/sys/kernel/random/uuid ]; then
  REQUEST_ID="$(cat /proc/sys/kernel/random/uuid)"
else
  REQUEST_ID="req-$$-$(date +%s%N 2>/dev/null || date +%s)-$RANDOM"
fi

# Build JSON payload
PAYLOAD="{\"id\":\"$REQUEST_ID\",\"method\":\"$METHOD\",\"params\":$PARAMS}"

# Execute request to loopback API
curl -sS -X POST "$PLOTO_API_URL" \
  -H "Authorization: Bearer $PLOTO_API_TOKEN" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$PAYLOAD"
echo ""
