#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
repo='https://github.com/raihanirvana/rental-ps'
cli="${RENDER_CLI:-$(command -v render || true)}"
if [[ -z "$cli" && -x "$HOME/.local/bin/render" ]]; then
  cli="$HOME/.local/bin/render"
fi
if [[ -z "$cli" || ! -x "$cli" ]]; then
  echo 'Pasang Render CLI: https://render.com/docs/cli' >&2
  exit 1
fi
if [[ "${1:-}" == '--login' ]]; then
  exec "$cli" login
fi
if [[ $# -gt 1 || ( $# -eq 1 && "$1" != '--create' ) ]]; then
  echo 'Pemakaian: bash scripts/deploy-render.sh [--login|--create]' >&2
  exit 1
fi

# Pilih hanya repo rental-ps dengan paket Free; tidak menerima ID service POS.
services="$("$cli" services --output json)"
service_id="$(SERVICES_JSON="$services" TARGET_REPO="$repo" node --input-type=module <<'JS'
const services = JSON.parse(process.env.SERVICES_JSON);
const requested = process.env.RENDER_SERVICE_ID;
const matches = services.map((entry) => entry.service).filter((service) => {
  const sameRepo = service.repo?.replace(/\.git$/, '') === process.env.TARGET_REPO;
  return sameRepo && service.branch === 'master' && (!requested || service.id === requested);
});
if (matches.length > 1 || (requested && matches.length !== 1)) {
  throw new Error('Service ambigu/tidak sesuai repo. Periksa RENDER_SERVICE_ID.');
}
if (matches[0] && matches[0].serviceDetails?.plan !== 'free') {
  throw new Error('Script hanya mengizinkan service Free. Tidak mengubah paket hosting.');
}
process.stdout.write(matches[0]?.id ?? '');
JS
)"

if [[ "${1:-}" == '--create' ]]; then
  if [[ -n "$service_id" ]]; then
    echo "Service rental-ps sudah ada: $service_id. Jalankan tanpa --create." >&2
    exit 1
  fi
  # Tidak membuat disk/database terpisah. PORT disediakan oleh Render.
  exec "$cli" services create --name sesi-play --type web_service --runtime node \
    --repo "$repo" --branch master --plan free --region singapore --num-instances 1 \
    --build-command 'npm ci --include=dev && npm run check' --start-command 'npm start' \
    --health-check-path /api/health --auto-deploy=false \
    --env-var NODE_VERSION=22.20.0 --env-var NODE_ENV=production --env-var HOST=0.0.0.0 \
    --env-var TRUST_PROXY=1 --env-var DATABASE_PATH=./data/sesi-play.sqlite \
    --output json --confirm
fi
if [[ -z "$service_id" ]]; then
  echo 'Belum ada service rental-ps. Jalankan dengan --create sekali saja.' >&2
  exit 1
fi
exec "$cli" deploys create "$service_id" --wait --output json --confirm
