---
description: "Use when modifying Kubernetes manifests, Kustomize overlays, ArgoCD configs, Envoy gateway, or deployment infrastructure."
applyTo: "deploy/k8s/**"
---
# Kubernetes / Deployment Conventions

- All manifests managed via **Kustomize** — do not use raw kubectl apply
- ArgoCD syncs from this repo; changes here trigger deployments
- EF Core migrations run as init containers (crm-migrator, scheduling-migrator)
- Images tagged `linux-main` (branch pointer) and `linux-<sha>` (content-addressed)
- Use the `update-kustomize-images.sh` script or GitHub Actions workflow to update image tags
- Secrets managed via SealedSecrets in `deploy/k8s/infrastructure/secrets/`
