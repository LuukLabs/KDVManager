#!/usr/bin/env bash
# Copy the current production certificate (app + api) from the cluster to the VM,
# so the VM can be tested with the real hostnames before DNS changes
# (TLS_MODE=manual). Run locally (needs kubectl + ssh access to the VM).
#
#   ./copy-certs.sh <vm-ip>
set -euo pipefail
VM=${1:?usage: copy-certs.sh <vm-ip>}

umask 077
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

kubectl -n kdvmanager-prod get secret kdvmanager-nl-tls -o jsonpath='{.data.tls\.crt}' | base64 -d > "$TMP/tls.crt"
kubectl -n kdvmanager-prod get secret kdvmanager-nl-tls -o jsonpath='{.data.tls\.key}' | base64 -d > "$TMP/tls.key"
openssl x509 -in "$TMP/tls.crt" -noout -subject -enddate -ext subjectAltName

scp -q "$TMP/tls.crt" "$TMP/tls.key" "deploy@$VM:/opt/kdvmanager/certs/"
ssh "deploy@$VM" 'chmod 600 /opt/kdvmanager/certs/tls.key && chmod 644 /opt/kdvmanager/certs/tls.crt'
echo "Certificate copied to $VM:/opt/kdvmanager/certs"
