# KDVManager on a single VM

Cheaper replacement for the DOKS cluster: one DigitalOcean droplet running
Docker Compose, keeping the managed Postgres.

| | Cluster (now) | VM |
|---|---|---|
| Compute | 2 × s-2vcpu-4gb ($48) | 1 × s-1vcpu-2gb ($12) + backups ($2.40) |
| Load balancer | $15 | — (Caddy on the VM) |
| Postgres | $15 | $15 (unchanged) |
| Volumes (SigNoz) | ~$3 | — |
| **Total excl. VAT** | **~$81** | **~$29** |

The VM serves HTTP/1.1, HTTP/2 and HTTP/3 (Caddy), with automatic Let's Encrypt.

## What runs where

```
internet ─▶ caddy :80/:443 ─┬─▶ web            app.kdvmanager.nl
                            └─▶ envoy (JWT)    api.kdvmanager.nl
                                  ├─▶ crm-api        ─┐
                                  └─▶ scheduling-api ─┴─▶ rabbitmq (internal network)
APIs ─▶ managed Postgres over the private VPC
```

## Security

- **Network:** DO Cloud Firewall allows SSH from one admin IP only. Ports 80/443 are open to the world. ufw on the host is a second layer. Only Caddy publishes ports. RabbitMQ sits on an `internal` Docker network with no outside route. The Envoy admin port binds to localhost.
- **Host:**
  - SSH is key-only.
  - Root login is disabled; only the `deploy` user can log in.
  - fail2ban is on.
  - Unattended security upgrades run, with automatic reboot at 04:00. Compose restarts the stack via `kdvmanager.service`.
- **Containers:**
  - Read-only root filesystems.
  - All capabilities dropped except the few nginx and Caddy need.
  - `no-new-privileges`.
  - The .NET services run as UID 1001.
  - Memory limits and log rotation are set.
- **Database:** the VM uses a dedicated user, `kdvmanager_vm`, that owns only the KDVManager databases instead of `doadmin`. The connection uses TLS (`sslmode=require`) over the private VPC.
- **Secrets:** they live only in `/opt/kdvmanager/.env` (chmod 600) and `certs/` on the VM, never in git.
- **Backups:** weekly droplet backups. Daily backups and point-in-time recovery come from the managed Postgres. RabbitMQ only holds transient messages.

## 1. Provision (no impact on production)

```bash
cd deploy/vm/scripts
./provision.sh ~/.ssh/id_ed25519.pub "$(curl -s -4 ifconfig.me)"
```

This creates the droplet in the cluster's VPC with backups and monitoring. It also creates the cloud firewall and adds the droplet to the database's trusted sources. Existing rules are kept.

## 2. Configure

```bash
VM=<droplet public ip>
scp ../docker-compose.yml ../Caddyfile ../envoy.yaml deploy@$VM:/opt/kdvmanager/
scp ../env.example deploy@$VM:/opt/kdvmanager/.env
scp deploy.sh setup-database.sh deploy@$VM:/opt/kdvmanager/
ssh deploy@$VM 'chmod 600 /opt/kdvmanager/.env'

# Dedicated DB user. Put the printed password into POSTGRES_PASSWORD in .env
DB_ID=$(doctl databases list --format ID,Name --no-header | awk '$2=="db-kdvmanager-ams3"{print $1}')
doctl databases user create $DB_ID kdvmanager_vm

./copy-certs.sh $VM        # current prod certificate for testing (TLS_MODE=manual)
ssh deploy@$VM             # edit /opt/kdvmanager/.env: POSTGRES_PASSWORD, RABBITMQ_PASS
```

GHCR images: if the packages are private, run
`echo <read:packages token> | docker login ghcr.io -u <github user> --password-stdin`
on the VM once.

## 3. Test with copies of the data (no impact on production)

On the VM:

```bash
cd /opt/kdvmanager
ADMIN_URL='<doctl databases connection $DB_ID --private --format URI>' ./setup-database.sh staging
./deploy.sh
```

The VM now runs against `KDVManagerCRMDB_staging` and `KDVManagerSchedulingDB_staging`. Writes made while testing never reach production.

To test from your laptop with the real hostnames (Auth0 and CSP work unchanged), add a hosts override temporarily:

```
<VM_IP>  app.kdvmanager.nl api.kdvmanager.nl
```

Then:

```bash
curl -sI --http2 https://app.kdvmanager.nl          # served by Caddy, h2
curl -s -o /dev/null -w '%{http_code}\n' https://api.kdvmanager.nl/crm/   # 401 without token
```

Log in through the browser and click through the app. Remove the hosts entry afterwards. Re-run `setup-database.sh staging` at any time to refresh the copy.

## 4. Cutover (short downtime)

1. **Freeze the cluster:** scale the APIs to 0 to stop writes:
   `kubectl -n kdvmanager-prod scale deploy crm-api scheduling-api --replicas=0`
2. **Database:** on the VM, run `ADMIN_URL=... ./setup-database.sh cutover`. In `.env`, set `CRM_DATABASE=KDVManagerCRMDB` and `SCHEDULING_DATABASE=KDVManagerSchedulingDB`, then run `./deploy.sh`.
3. **DNS at Hostnet:** point `app` and `api` A records to the VM IP. Lower the TTL a day in advance.
4. **TLS:** once DNS has propagated, set `TLS_MODE=auto` and run `./deploy.sh`. Caddy then fetches its own certificates.
5. **Clean up:** after a few days without issues, delete the DOKS cluster and its load balancer, and drop the `*_staging` databases.

**Rollback** (before step 5): point DNS back to 209.38.53.147 and scale the cluster APIs back up. The databases are the same, and doadmin can still use them.

## Updating

Change the `*_TAG` values in `.env` to the new `linux-<sha>` tags, then run `./deploy.sh`.
