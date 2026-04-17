#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# scripts/deploy.sh — bootstrap the Growly website onto the existing breezy
# cluster (reuses ArgoCD, registry, image-updater, and cloudflare-tunnel —
# see README for the growly.gg ingress entry to add to breezy-iac).
#
# Idempotent. Safe to re-run.
#
# Required environment variables:
#   ARGOCD_GITHUB_TOKEN       (optional) PAT — only needed if the ArgoCD repo
#                             secret hasn't been created yet for this repo.
#
# Usage:
#   ./scripts/deploy.sh
# -----------------------------------------------------------------------------
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/GrowlyX/website}"
NAMESPACE="${NAMESPACE:-growly-system}"
MONGO_SECRET="${MONGO_SECRET:-growly-mongodb-credentials}"
MONGO_USER="${MONGO_USER:-growly}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

require() {
  if [[ -z "${!1:-}" ]]; then
    echo "error: ${1} is required" >&2
    exit 1
  fi
}

echo "==> Verifying cluster connectivity"
kubectl cluster-info >/dev/null

echo "==> Ensuring namespace ${NAMESPACE}"
kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -

echo "==> Ensuring ${MONGO_SECRET} (random password generated on first run)"
if ! kubectl -n "${NAMESPACE}" get secret "${MONGO_SECRET}" >/dev/null 2>&1; then
  MONGO_PASS="$(LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 32)"
  kubectl -n "${NAMESPACE}" create secret generic "${MONGO_SECRET}" \
    --from-literal=username="${MONGO_USER}" \
    --from-literal=password="${MONGO_PASS}"
  echo "    created ${MONGO_SECRET}"
else
  echo "    ${MONGO_SECRET} already exists, leaving as-is"
fi

if [[ -n "${ARGOCD_GITHUB_TOKEN:-}" ]]; then
  echo "==> Registering repo with ArgoCD"
  kubectl create secret generic growly-website-repo \
    --namespace argocd \
    --from-literal=type=git \
    --from-literal=url="${REPO_URL}" \
    --from-literal=username=git \
    --from-literal=password="${ARGOCD_GITHUB_TOKEN}" \
    --dry-run=client -o yaml \
  | kubectl label --local -f - argocd.argoproj.io/secret-type=repository -o yaml \
  | kubectl apply -f -
fi

echo "==> Applying ArgoCD Application"
kubectl apply -f "${REPO_ROOT}/argocd/website-app.yaml"

echo
echo "Done. Watch sync with:"
echo "  kubectl -n argocd get application growly-website -w"
echo
echo "Reminder: add an ingress entry to breezy-iac/charts/cloudflare-tunnel/values.yaml:"
echo "  - hostname: growly.gg"
echo "    service: http://website.${NAMESPACE}.svc.cluster.local:3000"
