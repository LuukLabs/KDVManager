#!/usr/bin/env bash
set -euo pipefail

# Updates kustomization image tags for all services.
# Tag strategy: linux-<short-sha>
# Assumes images already pushed by respective build workflows.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."
K8S_APPS_DIR="$ROOT_DIR/deploy/k8s/applications"
GIT_SHA=${GITHUB_SHA:-$(git rev-parse HEAD)}
SHORT_SHA=${GIT_SHA:0:7}
TAG="linux-${SHORT_SHA}"

# Map logical service identifiers to kustomize subfolders and image names
# Format: folder|image1,image2
# Migrators share same tag as api builds.
MAPPINGS=(
  "web|ghcr.io/luuklabs/kdvmanager/web"
  "crm|ghcr.io/luuklabs/kdvmanager/crm.api,ghcr.io/luuklabs/kdvmanager/crm.migrator"
  "scheduling|ghcr.io/luuklabs/kdvmanager/scheduling.api,ghcr.io/luuklabs/kdvmanager/scheduling.migrator"
)

for mapping in "${MAPPINGS[@]}"; do
  folder="${mapping%%|*}"
  images_csv="${mapping#*|}"
  kustomization_dir="$K8S_APPS_DIR/$folder"
  if [[ ! -f "$kustomization_dir/kustomization.yaml" ]]; then
    echo "Missing kustomization for $folder, skipping"; continue
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
