import { MOCK_AUTH_URL } from "./config";

let cachedToken: string | null = null;

/**
 * Mint an API access token from the mock auth server (client_credentials grant).
 * Used for seeding/cleaning test data directly against the APIs.
 */
export async function getApiToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  const response = await fetch(`${MOCK_AUTH_URL}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: "e2e-seeder",
      audience: "https://api.kdvmanager.nl/",
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to get API token from mock-auth: ${response.status}`);
  }
  const body = (await response.json()) as { access_token: string };
  cachedToken = body.access_token;
  return cachedToken;
}
