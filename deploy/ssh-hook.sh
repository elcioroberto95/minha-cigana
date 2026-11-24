#!/usr/bin/env bash
set -euo pipefail

sha="${SSH_ORIGINAL_COMMAND:-}"
if [[ ! "$sha" =~ ^[0-9a-f]{40}$ ]]; then
  echo 'Informe o SHA de main.' >&2
  exit 1
fi

base=/opt/cigana
exec 9>"$base/deploy.lock"
flock 9
repo="$base/source"
if [[ ! -d "$repo/.git" ]]; then
  git clone --no-checkout --single-branch --branch main \
    https://github.com/elcioroberto95/minha-cigana.git "$repo"
fi
git -C "$repo" fetch --no-tags origin main
if [[ "$sha" != "$(git -C "$repo" rev-parse FETCH_HEAD)" ]]; then
  echo 'O SHA solicitado precisa ser a revisao atual de main.' >&2
  exit 1
fi
git -C "$repo" checkout --detach "$sha"
exec bash "$repo/deploy/release.sh" "$sha"
