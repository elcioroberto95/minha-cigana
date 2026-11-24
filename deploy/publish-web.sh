#!/usr/bin/env bash
set -euo pipefail

release="${1:?Informe o SHA do commit}"
[[ "$release" =~ ^[0-9a-f]{40}$ ]]
cd "$(dirname "$0")/.."
. /etc/cigana/public.env
: "${CIGANA_PUBLIC_IP:?Configure o IP publico}"
root=/opt/cigana/web
destination="$root/$release"
if [[ ! -f "$destination/index.html" ]]; then
  docker build --file deploy/web.Dockerfile --tag "cigana-web:$release" \
    --build-arg "EXPO_PUBLIC_API_URL=https://$CIGANA_PUBLIC_IP" .
  container="$(docker create "cigana-web:$release")"
  trap 'docker rm "$container" >/dev/null' EXIT
  install -d -m 0755 "$destination"
  docker cp "$container:/web/." "$destination/"
fi
test -f "$destination/index.html"
ln -sfn "$release" "$root/next"
mv -Tf "$root/next" "$root/current"
