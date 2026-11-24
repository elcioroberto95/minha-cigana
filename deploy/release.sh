#!/usr/bin/env bash
set -euo pipefail

export CIGANA_RELEASE="${1:?Informe o SHA do commit}"
[[ "$CIGANA_RELEASE" =~ ^[0-9a-f]{40}$ ]]
cd "$(dirname "$0")/.."

compose=(docker compose --env-file /etc/cigana/compose.env -f compose.yaml -f compose.vps.yaml)
"${compose[@]}" build api
"${compose[@]}" up -d --wait --wait-timeout 90 postgres ollama

model_hash="$(sha256sum Modelfile | cut -d ' ' -f 1)"
model_marker=/opt/cigana/model.sha256
if [[ ! -f "$model_marker" || "$(cat "$model_marker")" != "$model_hash" ]] ||
   ! "${compose[@]}" exec -T ollama ollama show esmeralda >/dev/null 2>&1; then
  "${compose[@]}" cp Modelfile ollama:/tmp/esmeralda.Modelfile
  "${compose[@]}" exec -T ollama ollama create esmeralda -f /tmp/esmeralda.Modelfile
  printf '%s\n' "$model_hash" > "$model_marker"
fi

"${compose[@]}" run --rm --no-deps api node scripts/migrate.mjs
previous_image="$(docker ps --filter label=com.docker.compose.project=minha-cigana \
  --filter health=healthy --filter label=com.docker.compose.service=api --format '{{.Image}}')"
if ! "${compose[@]}" up -d --no-deps --wait --wait-timeout 75 api; then
  "${compose[@]}" logs --tail 60 api >&2 || true
  if [[ "$previous_image" == cigana-api:* && "$previous_image" != "cigana-api:$CIGANA_RELEASE" ]]; then
    CIGANA_RELEASE="${previous_image#cigana-api:}" "${compose[@]}" up -d --no-deps --wait --wait-timeout 75 api
  fi
  exit 1
fi
curl --fail --silent --show-error http://127.0.0.1:3000/health
printf '\n'

if [[ -f /etc/cigana/public.env ]]; then
  bash deploy/publish-web.sh "$CIGANA_RELEASE"
fi
