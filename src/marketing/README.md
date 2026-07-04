# Marketing site (kdvmanager.nl)

Static marketing/sales website served at the apex domain `kdvmanager.nl`.
The "Inloggen" button routes to the app at `https://app.kdvmanager.nl`.

## Contents

- `index.html` — landing page (hero, functies, werkwijze, prijzen, FAQ)
- `brand.html` — brand guidelines (logo, kleuren, typografie, tone of voice)
- `styles.css` — shared design tokens and components
- `favicon.svg` — toy-block logomark
- `nginx/nginx.conf` — production server config (security headers, caching, gzip)

No build step: plain HTML/CSS with a small inline script for scroll reveals and
the month/year pricing toggle. Fonts (Fraunces + Instrument Sans) load from
Google Fonts.

## Local preview

```bash
python3 -m http.server 8123 --directory src/marketing
# http://127.0.0.1:8123
```

Or via Docker:

```bash
docker compose -f src/docker-compose.yml build marketing
docker run --rm -p 8123:80 kdvmanager/marketing:linux-latest
```

## Deployment

Built and pushed by `.github/workflows/marketing.yml` (same tag strategy as the
other services: `linux-main` + `linux-<short-sha>`). Deployed via
`deploy/k8s/applications/marketing/`; the ingress rule for host `kdvmanager.nl`
lives in `deploy/k8s/infrastructure/envoy/ingress.yml`.
