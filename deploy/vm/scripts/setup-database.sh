#!/usr/bin/env bash
# Prepare the managed Postgres for the VM. Run ON THE VM (it can reach the
# private DB hostname). Uses a throwaway postgres:17 container for the clients.
#
#   ADMIN_URL='postgresql://doadmin:...@private-db-...:25060/defaultdb?sslmode=require' \
#     ./setup-database.sh staging      # copy prod DBs to *_staging (safe, repeatable)
#   ADMIN_URL=... ./setup-database.sh cutover   # hand prod DBs to the VM user
#
# Get ADMIN_URL with: doctl databases connection <db-id> --private --format URI
# The app user (POSTGRES_USER in .env) must exist first:
#   doctl databases user create <db-id> kdvmanager_vm
set -euo pipefail
MODE=${1:?usage: setup-database.sh staging|cutover}
: "${ADMIN_URL:?set ADMIN_URL (doadmin connection URI, private host)}"
APP_USER=${APP_USER:-kdvmanager_vm}
DBS=(KDVManagerCRMDB KDVManagerSchedulingDB)

pg() { docker run --rm -i -e PGCONNECT_TIMEOUT=10 postgres:17-alpine "$@"; }
url_for() { echo "$ADMIN_URL" | sed -E "s#/[^/?]+(\?|$)#/$1\1#"; }
psql_admin() { pg psql -v ON_ERROR_STOP=1 -q "$(url_for "$1")" -c "$2"; }

psql_admin defaultdb "GRANT \"$APP_USER\" TO doadmin;" || true

case "$MODE" in
staging)
  for db in "${DBS[@]}"; do
    s="${db}_staging"
    echo "== $db -> $s"
    psql_admin defaultdb "DROP DATABASE IF EXISTS \"$s\" WITH (FORCE);"
    psql_admin defaultdb "CREATE DATABASE \"$s\" OWNER \"$APP_USER\";"
    # --role makes every restored object owned by the app user directly.
    pg sh -c "pg_dump --format=custom --no-owner --no-privileges '$(url_for "$db")' \
      | pg_restore --no-owner --no-privileges --role='$APP_USER' --dbname='$(url_for "$s")'"
  done
  ;;
cutover)
  # Production DBs are owned by doadmin. Hand them and their public-schema
  # objects to the dedicated app user. doadmin stays a member of that role, so
  # the cluster keeps working until it is switched off.
  # (Deliberately NOT "REASSIGN OWNED BY doadmin": that also moves every other
  # database doadmin owns.)
  for db in "${DBS[@]}"; do
    echo "== $db -> owner $APP_USER"
    psql_admin defaultdb "ALTER DATABASE \"$db\" OWNER TO \"$APP_USER\";"
    psql_admin "$db" "DO \$\$
DECLARE r record;
BEGIN
  FOR r IN SELECT format('ALTER %s %I.%I OWNER TO %I',
             CASE c.relkind WHEN 'S' THEN 'SEQUENCE' WHEN 'v' THEN 'VIEW'
                            WHEN 'm' THEN 'MATERIALIZED VIEW' ELSE 'TABLE' END,
             n.nspname, c.relname, '$APP_USER') AS stmt
           FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
           WHERE n.nspname = 'public' AND c.relkind IN ('r','p','v','m','S')
             AND pg_get_userbyid(c.relowner) = 'doadmin'
             AND NOT (c.relkind = 'S' AND EXISTS (SELECT 1 FROM pg_depend d
                      WHERE d.objid = c.oid AND d.deptype IN ('a','i')))
  LOOP EXECUTE r.stmt; END LOOP;
  FOR r IN SELECT format('ALTER ROUTINE %s OWNER TO %I', p.oid::regprocedure, '$APP_USER') AS stmt
           FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
           WHERE n.nspname = 'public' AND pg_get_userbyid(p.proowner) = 'doadmin'
  LOOP EXECUTE r.stmt; END LOOP;
  FOR r IN SELECT format('ALTER TYPE %I.%I OWNER TO %I', n.nspname, t.typname, '$APP_USER') AS stmt
           FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
           WHERE n.nspname = 'public' AND t.typtype IN ('e','d','c')
             AND (t.typtype <> 'c' OR EXISTS (SELECT 1 FROM pg_class c WHERE c.oid = t.typrelid AND c.relkind = 'c'))
             AND pg_get_userbyid(t.typowner) = 'doadmin'
  LOOP EXECUTE r.stmt; END LOOP;
END \$\$;"
  done
  ;;
*) echo "unknown mode $MODE" >&2; exit 1 ;;
esac
echo "Done."
