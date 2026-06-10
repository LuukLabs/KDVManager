# KDVManager E2E tests

Playwright end-to-end tests that run against the full stack (web, Envoy
gateway, CRM API, Scheduling API, PostgreSQL, RabbitMQ) in docker compose —
with Auth0 replaced by a tiny local mock OIDC server, so no external services
or secrets are needed.

See `docs/e2e-use-cases.md` for the use-case catalog and coverage map.

## How auth works in e2e

`mock-auth/server.mjs` is a zero-dependency OIDC provider that auto-approves
every login as a fixed test user with the tenant claim the backend expects.

- The web app is built with `VITE_APP_AUTH0_DOMAIN=http://localhost:5300`
  (auth0-spa-js accepts a full URL as domain), so the normal Auth0 SPA flow —
  redirect login, callback, iframe silent auth, refresh tokens, logout — runs
  unmodified against the mock.
- Envoy validates JWTs against the mock's JWKS (`envoy.e2e.yaml`).
- The .NET APIs use `Auth0__Authority=http://mock-auth:5300` (a config-only
  override; production behavior is unchanged).
- Tests seed data straight against the APIs using a `client_credentials` token
  from the mock (see `helpers/api.ts`).

## Running locally

```bash
# 1. Start the stack (from src/). NUGET_GITHUB_TOKEN must be set for the
#    Scheduling service build (private BKRCalculator package).
cd src
docker compose -f docker-compose.yml -f docker-compose.e2e.yml up -d --build \
  mock-auth envoy postgres rabbitmq web \
  crm-migrator crm-api scheduling-migrator scheduling-api

# 2. Run the tests (from tests/e2e). The global setup waits for the stack
#    (including migrations) to become ready.
cd ../tests/e2e
pnpm install
pnpm exec playwright install chromium
pnpm test

# Useful variants
pnpm test:headed          # watch the browser
pnpm test:ui              # Playwright UI mode
pnpm exec playwright test specs/children.spec.ts -g "search"   # one test
pnpm report               # open the HTML report
```

Note: the e2e compose file gives postgres **no volume** — `docker compose
... down` discards all data, which keeps runs reproducible. Don't combine
`docker-compose.e2e.yml` with `docker-compose.override.yml` (the dev
override); use exactly the two files shown above.

## CI

`.github/workflows/e2e.yml` builds the stack images (with GHA layer caching),
starts the stack, and runs the suite. Failure artifacts: Playwright HTML
report + traces, and the docker compose logs.

## Conventions

- Tests run **serially** (`workers: 1`) because they share one tenant/database.
- All test data uses `uniqueName()` so runs never collide; specs clean up
  after themselves via the API (best-effort, `try/catch`).
- The UI is Dutch (`nl`); assert strings from `src/web/src/locales/nl/` —
  `public/locales` is stale, don't use it.
- The dockerized web app is a **production** build: MUI's
  `data-testid="...Icon"` attributes are stripped, so don't rely on
  `getByTestId` for MUI icons; use roles/accessible names or stable structure.
- Children replicate from CRM to Scheduling asynchronously (RabbitMQ);
  anything that needs the child in Scheduling must wait
  (`Api.createSchedule` retries internally).
- New children automatically get a system-generated end mark
  (EndMark automation) — don't assert "no end marks" for a fresh child.
