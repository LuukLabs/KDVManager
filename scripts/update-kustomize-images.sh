#!/usr/bin/env bash
set -euo pipefail

# Updates kustomization image tags for services.
# Tag strategy: linux-<short-sha>
# Assumes images already pushed by respective build workflows.
#
# When CHANGED_ONLY=true and BASE_SHA points to a valid commit, only services
# whose source paths changed between BASE_SHA and the current SHA are updated.
# The path lists below must stay in sync with the `paths` filters of the build
# workflows, so a tag is never set for an image that was not built.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."
K8S_APPS_DIR="$ROOT_DIR/deploy/k8s/applications"
GIT_SHA=${GITHUB_SHA:-$(git rev-parse HEAD)}
SHORT_SHA=${GIT_SHA:0:7}
TAG="linux-${SHORT_SHA}"
CHANGED_ONLY=${CHANGED_ONLY:-false}
BASE_SHA=${BASE_SHA:-}

# Map logical service identifiers to kustomize subfolders, image names and
# source path prefixes. Format: folder|image1,image2|path1,path2
# Migrators share same tag as api builds.
MAPPINGS=(
  "web|ghcr.io/luuklabs/kdvmanager/web|src/web/,.github/workflows/web.yml"
  "crm|ghcr.io/luuklabs/kdvmanager/crm.api,ghcr.io/luuklabs/kdvmanager/crm.migrator|src/Services/CRM/,src/Shared/,.github/workflows/crm-api.yml,.github/workflows/crm-migrator.yml"
  "scheduling|ghcr.io/luuklabs/kdvmanager/scheduling.api,ghcr.io/luuklabs/kdvmanager/scheduling.migrator|src/Services/Scheduling/,src/Shared/,.github/workflows/scheduling-api.yml,.github/workflows/scheduling-migrator.yml"
  "tenantmanagement|ghcr.io/luuklabs/kdvmanager/tenantmanagement.api,ghcr.io/luuklabs/kdvmanager/tenantmanagement.migrator|src/Services/TenantManagement/,src/Shared/,.github/workflows/tenantmanagement-api.yml,.github/workflows/tenantmanagement-migrator.yml"
)

# Path prefixes that affect every image build.
SHARED_PATHS="src/docker-compose.yml,.github/workflows/composite/"

CHANGED_FILES=""
if [[ "$CHANGED_ONLY" == "true" ]]; then
  if [[ -z "$BASE_SHA" || "$BASE_SHA" =~ ^0+$ ]] || ! git -C "$ROOT_DIR" cat-file -e "${BASE_SHA}^{commit}" 2>/dev/null; then
    echo "CHANGED_ONLY requested but base commit '${BASE_SHA}' unavailable; updating all services"
    CHANGED_ONLY=false
  else
    CHANGED_FILES=$(git -C "$ROOT_DIR" diff --name-only "$BASE_SHA" "$GIT_SHA")
    echo "Changed files since ${BASE_SHA:0:7}:"
    echo "$CHANGED_FILES"
  fi
fi

paths_changed() {
  local prefix file
  for prefix in "$@"; do
    while IFS= read -r file; do
      [[ -n "$file" && "$file" == "$prefix"* ]] && return 0
    done <<< "$CHANGED_FILES"
  done
  return 1
}

for mapping in "${MAPPINGS[@]}"; do
  folder="$(cut -d'|' -f1 <<< "$mapping")"
  images_csv="$(cut -d'|' -f2 <<< "$mapping")"
  paths_csv="$(cut -d'|' -f3 <<< "$mapping"),$SHARED_PATHS"
  kustomization_dir="$K8S_APPS_DIR/$folder"
  if [[ ! -f "$kustomization_dir/kustomization.yaml" ]]; then
    echo "Missing kustomization for $folder, skipping"; continue
  fi
  IFS=',' read -r -a service_paths <<< "$paths_csv"
  if [[ "$CHANGED_ONLY" == "true" ]] && ! paths_changed "${service_paths[@]}"; then
    echo "No changes for $folder since ${BASE_SHA:0:7}; skipping"
    continue
  fi
  IFS=',' read -r -a images <<< "$images_csv"
  for img in "${images[@]}"; do
    echo "Setting $img:$TAG in $folder"
    (cd "$kustomization_dir" && kustomize edit set image "$img=$img:$TAG")
  done
  # Show result for audit
  echo "Updated $kustomization_dir/kustomization.yaml:" && grep -A2 'images:' "$kustomization_dir/kustomization.yaml" || true
done

echo "Done updating image tags to $TAG"
