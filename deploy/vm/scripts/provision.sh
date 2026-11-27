#!/usr/bin/env bash
# Create the KDVManager VM next to the existing cluster. Run locally (needs doctl).
# Nothing here touches the running cluster or DNS.
#
#   ./provision.sh ~/.ssh/id_ed25519.pub 203.0.113.10
#                  └ your public key       └ your public IP (SSH allow-list)
set -euo pipefail

PUBKEY_FILE=${1:?usage: provision.sh <ssh-public-key-file> <admin-ip>}
ADMIN_IP=${2:?usage: provision.sh <ssh-public-key-file> <admin-ip>}
NAME=${NAME:-kdvmanager-vm}
REGION=ams3
SIZE=${SIZE:-s-1vcpu-2gb}
IMAGE=ubuntu-24-04-x64
TAG=kdvmanager-vm
HERE=$(cd "$(dirname "$0")/.." && pwd)

VPC_ID=$(doctl kubernetes cluster get k8s-kdvmanage-ams3 -o json | jq -r '.[0].vpc_uuid')
DB_ID=$(doctl databases list --format ID,Name --no-header | awk '$2=="db-kdvmanager-ams3"{print $1}')
[ -n "$VPC_ID" ] && [ -n "$DB_ID" ] || { echo "could not resolve VPC or database" >&2; exit 1; }

USER_DATA=$(mktemp)
trap 'rm -f "$USER_DATA"' EXIT
sed "s|__SSH_PUBLIC_KEY__|$(cat "$PUBKEY_FILE")|" "$HERE/cloud-init.yaml" > "$USER_DATA"

echo "Creating droplet $NAME ($SIZE) in $REGION, VPC $VPC_ID"
doctl compute droplet create "$NAME" \
  --region "$REGION" --size "$SIZE" --image "$IMAGE" \
  --vpc-uuid "$VPC_ID" --tag-names "$TAG" \
  --enable-backups --enable-monitoring \
  --user-data-file "$USER_DATA" --wait \
  --format ID,Name,PublicIPv4,PrivateIPv4

DROPLET_ID=$(doctl compute droplet list --tag-name "$TAG" --format ID --no-header | head -1)

echo "Creating cloud firewall (SSH only from $ADMIN_IP)"
doctl compute firewall create --name "$NAME-fw" --tag-names "$TAG" \
  --inbound-rules "protocol:tcp,ports:22,address:$ADMIN_IP/32 protocol:tcp,ports:80,address:0.0.0.0/0,address:::/0 protocol:tcp,ports:443,address:0.0.0.0/0,address:::/0 protocol:udp,ports:443,address:0.0.0.0/0,address:::/0" \
  --outbound-rules "protocol:tcp,ports:all,address:0.0.0.0/0,address:::/0 protocol:udp,ports:all,address:0.0.0.0/0,address:::/0 protocol:icmp,address:0.0.0.0/0,address:::/0" \
  --format ID,Name,Status

echo "Allowing the droplet to reach the managed database (existing rules are kept)"
doctl databases firewalls append "$DB_ID" --rule "droplet:$DROPLET_ID"

echo
echo "Done. cloud-init needs ~3 minutes; then: ssh deploy@$(doctl compute droplet get "$DROPLET_ID" --format PublicIPv4 --no-header)"
