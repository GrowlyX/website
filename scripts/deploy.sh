#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# scripts/deploy.sh — build the image, push it to the in-cluster registry, and
# install/upgrade the Growly website Helm chart. No ArgoCD.
#
# Idempotent. Safe to re-run.
#
# Usage:
#   ./scripts/deploy.sh                    # build + push + helm upgrade
#   ./scripts/deploy.sh --tag 20260101-abc # pin/override image tag
#   ./scripts/deploy.sh --skip-build       # reuse existing tag, helm only
#   ./scripts/deploy.sh --dry-run          # helm render only (still builds)
#
# Environment overrides:
#   RELEASE           default: growly-website
#   NAMESPACE         default: growly-system
#   MONGO_SECRET      default: growly-mongodb-credentials
#   MONGO_USER        default: growly
#   REGISTRY_NS       default: registry
#   REGISTRY_SVC      default: internal-registry-docker-registry
#   REGISTRY_PORT     default: 5000
#   IMAGE_NAME        default: growly-website
# -----------------------------------------------------------------------------
set -euo pipefail

RELEASE="${RELEASE:-growly-website}"
NAMESPACE="${NAMESPACE:-growly-system}"
MONGO_SECRET="${MONGO_SECRET:-growly-mongodb-credentials}"
MONGO_USER="${MONGO_USER:-growly}"
REGISTRY_NS="${REGISTRY_NS:-registry}"
REGISTRY_SVC="${REGISTRY_SVC:-internal-registry-docker-registry}"
REGISTRY_PORT="${REGISTRY_PORT:-5000}"
IMAGE_NAME="${IMAGE_NAME:-growly-website}"

IMAGE_TAG=""
SKIP_BUILD=""
DRY_RUN=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tag)        IMAGE_TAG="$2"; shift 2 ;;
    --skip-build) SKIP_BUILD=1; shift ;;
    --dry-run)    DRY_RUN="--dry-run"; shift ;;
    -h|--help)    sed -n '2,24p' "$0"; exit 0 ;;
    *)            echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "${IMAGE_TAG}" ]]; then
  IMAGE_TAG="$(date -u +%Y%m%d%H%M%S)-$(git rev-parse --short HEAD 2>/dev/null || echo local)"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CHART_DIR="${REPO_ROOT}/charts/website"

LOCAL_REGISTRY="127.0.0.1:${REGISTRY_PORT}"
LOCAL_IMAGE="${LOCAL_REGISTRY}/${IMAGE_NAME}"

PF_PID=""
cleanup() {
  if [[ -n "${PF_PID}" ]] && kill -0 "${PF_PID}" 2>/dev/null; then
    kill "${PF_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo "==> Verifying cluster connectivity"
kubectl cluster-info >/dev/null

echo "==> Ensuring namespace ${NAMESPACE}"
kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -

echo "==> Ensuring ${MONGO_SECRET} (random password generated on first run)"
if ! kubectl -n "${NAMESPACE}" get secret "${MONGO_SECRET}" >/dev/null 2>&1; then
  MONGO_PASS="$(openssl rand -hex 24)"
  kubectl -n "${NAMESPACE}" create secret generic "${MONGO_SECRET}" \
    --from-literal=username="${MONGO_USER}" \
    --from-literal=password="${MONGO_PASS}"
  echo "    created ${MONGO_SECRET}"
else
  echo "    ${MONGO_SECRET} already exists, leaving as-is"
fi

if [[ -z "${SKIP_BUILD}" ]]; then
  command -v docker >/dev/null || { echo "error: docker not found on PATH" >&2; exit 1; }

  echo "==> Port-forwarding ${REGISTRY_SVC}.${REGISTRY_NS}:${REGISTRY_PORT} -> ${LOCAL_REGISTRY}"
  kubectl -n "${REGISTRY_NS}" port-forward "svc/${REGISTRY_SVC}" "${REGISTRY_PORT}:${REGISTRY_PORT}" >/dev/null 2>&1 &
  PF_PID=$!

  for i in {1..30}; do
    if curl -fsS "http://${LOCAL_REGISTRY}/v2/" >/dev/null 2>&1; then
      echo "    registry reachable"
      break
    fi
    if ! kill -0 "${PF_PID}" 2>/dev/null; then
      echo "error: port-forward exited before registry became reachable" >&2
      exit 1
    fi
    sleep 1
  done

  if ! curl -fsS "http://${LOCAL_REGISTRY}/v2/" >/dev/null 2>&1; then
    echo "error: registry not reachable at ${LOCAL_REGISTRY}" >&2
    exit 1
  fi

  echo "==> docker build ${LOCAL_IMAGE}:${IMAGE_TAG}"
  docker build \
    -t "${LOCAL_IMAGE}:${IMAGE_TAG}" \
    -t "${LOCAL_IMAGE}:latest" \
    "${REPO_ROOT}"

  echo "==> docker push ${LOCAL_IMAGE}:${IMAGE_TAG}"
  docker push "${LOCAL_IMAGE}:${IMAGE_TAG}"
  docker push "${LOCAL_IMAGE}:latest"

  kill "${PF_PID}" 2>/dev/null || true
  PF_PID=""
else
  echo "==> Skipping build (--skip-build)"
fi

echo "==> helm upgrade --install ${RELEASE} (tag=${IMAGE_TAG})"
helm upgrade --install "${RELEASE}" "${CHART_DIR}" \
  --namespace "${NAMESPACE}" \
  --set image.tag="${IMAGE_TAG}" \
  ${DRY_RUN}

echo
echo "Done. Watch rollout with:"
echo "  kubectl -n ${NAMESPACE} rollout status deploy/website"
echo
echo "Reminder: add an ingress entry to breezy-iac/charts/cloudflare-tunnel/values.yaml:"
echo "  - hostname: growly.gg"
echo "    service: http://website.${NAMESPACE}.svc.cluster.local:3000"
