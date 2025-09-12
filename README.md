# KDVManager

This repository contains the KDVManager platform (microservices + frontend) and Kubernetes deployment manifests.

## Deployment Image Tag Automation

Per-service build workflows (e.g. `web.yml`, `crm-api.yml`, `scheduling-api.yml`) build and push two tags for each image:

- `linux-main` (branch tag – stable moving pointer)
- `linux-<short-sha>` (immutable content tag for GitOps)

The branch tag remains for local and ad-hoc reference; the short SHA tag is what Kubernetes deploys via kustomize manifests.

The workflow `update-kustomize-images` (`.github/workflows/deploy-update-images.yml`) executes on pushes to `main` that affect service code. Instead of pushing directly to `main`, it now opens an automated pull request that:

1. Detects which services changed (path based).
2. Computes the short SHA (`linux-<short-sha>`).
3. Runs `kustomize edit set image` for only impacted application kustomizations under `deploy/k8s/applications/*/`.
4. Creates/updates a PR bumping `kustomization.yaml` image tags.

ArgoCD then syncs after the PR is merged, giving an approval gate and audit trail.

### Script

`scripts/update-kustomize-images.sh` encapsulates the image update logic. Environment variables:
- `CHANGED_ONLY` (default `true`) – limit updates to impacted services.
- `BASE_REF` (default `origin/main`) – comparison base ref when not supplying explicit list.
- `CHANGED_FILE_LIST` – optional newline-separated files list to override diff detection.

### Adding a New Service

1. Ensure the service is added to `docker-compose.yml` with image pattern `${REGISTRY}/<name>:${PLATFORM:-linux}-${TAG}`.
2. Add its Kubernetes manifests under `deploy/k8s/applications/<service>/` and list images in `kustomization.yaml`.
3. Append a mapping row in `scripts/update-kustomize-images.sh` `MAPPINGS` array.
4. Create a GitHub Actions workflow (copy an existing one) to build & push the image on `main`.

### Future Enhancements
- Use ArgoCD Image Updater to eliminate PR churn (if desired).
- Generate SBOM + provenance (SLSA) during builds.
- Add staging/prod overlays and promote via tag promotion rather than manifest edits.

## Local Development
See `src/web/README.md` and service-specific docs.
