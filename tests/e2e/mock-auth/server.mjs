/**
 * Zero-dependency mock OIDC provider for e2e tests.
 *
 * Stands in for Auth0 so the full stack (SPA, Envoy JWT filter, .NET APIs) can run
 * without external dependencies or secrets. Every /authorize request is auto-approved
 * as a fixed test user belonging to a fixed tenant.
 *
 * Supported flows:
 *  - authorization_code (+PKCE params accepted, not verified) via 302 redirect
 *  - silent auth via response_mode=web_message (auth0-spa-js iframe checkSession)
 *  - refresh_token grant (auth0-spa-js useRefreshTokens)
 *  - client_credentials grant (test data seeding from Playwright)
 *  - /v2/logout and /oidc/logout redirects
 *  - /.well-known/openid-configuration and /.well-known/jwks.json
 *
 * The issuer is the browser-facing URL (http://localhost:5300/) while backend
 * containers reach this server as http://mock-auth:5300 — the discovery document
 * derives its jwks_uri from the request Host header so both work.
 */
import http from "node:http";
import crypto from "node:crypto";

const PORT = Number(process.env.PORT ?? 5300);
const ISSUER = (process.env.MOCK_AUTH_ISSUER ?? "http://localhost:5300/").replace(/\/?$/, "/");
const TENANT_ID = process.env.E2E_TENANT_ID ?? "b1aebd35-9ab8-4f7e-9b3d-7d7f0d20a1c5";
const API_AUDIENCE = "https://api.kdvmanager.nl/";
const KID = "e2e-mock-key-1";
const TOKEN_TTL_SECONDS = 86400;

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
const publicJwk = publicKey.export({ format: "jwk" });

const b64url = (input) =>
  Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const signJwt = (payload) => {
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT", kid: KID }));
  const body = b64url(JSON.stringify(payload));
  const signature = crypto
    .sign("RSA-SHA256", Buffer.from(`${header}.${body}`), privateKey)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${header}.${body}.${signature}`;
};

const now = () => Math.floor(Date.now() / 1000);

const accessToken = (clientId) =>
  signJwt({
    iss: ISSUER,
    sub: "auth0|e2e-test-user",
    aud: [API_AUDIENCE, API_AUDIENCE.replace(/\/$/, "")],
    azp: clientId,
    iat: now(),
    exp: now() + TOKEN_TTL_SECONDS,
    scope: "openid profile email offline_access",
    "https://kdvmanager.nl/tenant": TENANT_ID,
  });

const idToken = (clientId, nonce) =>
  signJwt({
    iss: ISSUER,
    sub: "auth0|e2e-test-user",
    aud: clientId,
    iat: now(),
    exp: now() + TOKEN_TTL_SECONDS,
    ...(nonce ? { nonce } : {}),
    name: "E2E Test User",
    nickname: "e2e",
    email: "e2e@kdvmanager.nl",
    email_verified: true,
    updated_at: new Date().toISOString(),
  });

// code -> { nonce, clientId }
const issuedCodes = new Map();

/** JSON-encode for safe embedding inside a <script> block (no </script> breakout). */
const jsonForScript = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

/** Only redirect within the local e2e stack. */
const isAllowedRedirect = (value) => {
  try {
    const target = new URL(value);
    return ["localhost", "127.0.0.1"].includes(target.hostname);
  } catch {
    return false;
  }
};

const sendJson = (res, status, body, extraHeaders = {}) => {
  res.writeHead(status, { "Content-Type": "application/json", ...extraHeaders });
  res.end(JSON.stringify(body));
};

const readBody = (req) =>
  new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });

const parseBody = (raw, contentType = "") => {
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return Object.fromEntries(new URLSearchParams(raw));
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // CORS for browser calls (token endpoint, jwks) from the SPA origin.
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin ?? "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization, auth0-client");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (url.pathname === "/.well-known/openid-configuration") {
    const self = `http://${req.headers.host}`;
    return sendJson(res, 200, {
      issuer: ISSUER,
      authorization_endpoint: `${ISSUER}authorize`,
      token_endpoint: `${self}/oauth/token`,
      jwks_uri: `${self}/.well-known/jwks.json`,
      userinfo_endpoint: `${self}/userinfo`,
      response_types_supported: ["code"],
      subject_types_supported: ["public"],
      id_token_signing_alg_values_supported: ["RS256"],
    });
  }

  if (url.pathname === "/.well-known/jwks.json") {
    return sendJson(res, 200, {
      keys: [{ kty: "RSA", use: "sig", alg: "RS256", kid: KID, n: publicJwk.n, e: publicJwk.e }],
    });
  }

  if (url.pathname === "/authorize") {
    const clientId = url.searchParams.get("client_id") ?? "e2e-client";
    const redirectUri = url.searchParams.get("redirect_uri");
    const state = url.searchParams.get("state") ?? "";
    const nonce = url.searchParams.get("nonce") ?? undefined;
    const responseMode = url.searchParams.get("response_mode");

    const code = crypto.randomUUID();
    issuedCodes.set(code, { nonce, clientId });

    if (responseMode === "web_message") {
      // Silent auth: auth0-spa-js listens for a postMessage from this iframe.
      res.writeHead(200, { "Content-Type": "text/html" });
      return res.end(`<!DOCTYPE html><html><body><script>
        parent.postMessage({
          type: "authorization_response",
          response: { code: ${jsonForScript(code)}, state: ${jsonForScript(state)} }
        }, "*");
      </script></body></html>`);
    }

    if (!redirectUri || !isAllowedRedirect(redirectUri)) {
      return sendJson(res, 400, { error: "invalid_request" });
    }
    const target = new URL(redirectUri);
    target.searchParams.set("code", code);
    target.searchParams.set("state", state);
    res.writeHead(302, { Location: target.toString() });
    return res.end();
  }

  if (url.pathname === "/oauth/token" && req.method === "POST") {
    const body = parseBody(await readBody(req), req.headers["content-type"]);
    const grantType = body.grant_type;
    const clientId = body.client_id ?? "e2e-client";

    if (grantType === "authorization_code") {
      const stored = issuedCodes.get(body.code);
      issuedCodes.delete(body.code);
      if (!stored) return sendJson(res, 403, { error: "invalid_grant" });
      return sendJson(res, 200, {
        access_token: accessToken(stored.clientId),
        id_token: idToken(stored.clientId, stored.nonce),
        refresh_token: crypto.randomUUID(),
        token_type: "Bearer",
        expires_in: TOKEN_TTL_SECONDS,
        scope: "openid profile email offline_access",
      });
    }

    if (grantType === "refresh_token") {
      return sendJson(res, 200, {
        access_token: accessToken(clientId),
        id_token: idToken(clientId),
        refresh_token: crypto.randomUUID(),
        token_type: "Bearer",
        expires_in: TOKEN_TTL_SECONDS,
        scope: "openid profile email offline_access",
      });
    }

    if (grantType === "client_credentials") {
      return sendJson(res, 200, {
        access_token: accessToken(clientId),
        token_type: "Bearer",
        expires_in: TOKEN_TTL_SECONDS,
      });
    }

    return sendJson(res, 400, { error: "unsupported_grant_type" });
  }

  if (url.pathname === "/userinfo") {
    return sendJson(res, 200, {
      sub: "auth0|e2e-test-user",
      name: "E2E Test User",
      email: "e2e@kdvmanager.nl",
    });
  }

  if (url.pathname === "/v2/logout" || url.pathname === "/oidc/logout") {
    const returnTo = url.searchParams.get("returnTo") ?? url.searchParams.get("post_logout_redirect_uri");
    if (returnTo && isAllowedRedirect(returnTo)) {
      res.writeHead(302, { Location: returnTo });
      return res.end();
    }
    res.writeHead(200);
    return res.end("Logged out");
  }

  if (url.pathname === "/healthz") {
    res.writeHead(200);
    return res.end("ok");
  }

  sendJson(res, 404, { error: "not_found", path: url.pathname });
});

server.listen(PORT, () => {
  console.log(`mock-auth listening on :${PORT} (issuer ${ISSUER}, tenant ${TENANT_ID})`);
});
