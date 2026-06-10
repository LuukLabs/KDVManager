import { API_URL, MOCK_AUTH_URL, WEB_URL } from "./helpers/config";
import { getApiToken } from "./helpers/auth";

const READY_TIMEOUT_MS = 240_000;
const POLL_INTERVAL_MS = 2_000;

async function waitFor(name: string, probe: () => Promise<boolean>): Promise<void> {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  let lastError = "";
  while (Date.now() < deadline) {
    try {
      if (await probe()) {
        console.log(`[global-setup] ${name} is ready`);
        return;
      }
    } catch (error) {
      lastError = String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  throw new Error(`[global-setup] Timed out waiting for ${name}. Last error: ${lastError}`);
}

/**
 * Wait until the whole stack is up: mock-auth issues tokens, the web app is
 * served, and both APIs answer authenticated requests (which also proves the
 * database migrations have completed and the JWT chain works end to end).
 */
export default async function globalSetup(): Promise<void> {
  await waitFor("mock-auth", async () => (await fetch(`${MOCK_AUTH_URL}/healthz`)).ok);
  await waitFor("web", async () => (await fetch(WEB_URL)).ok);

  const token = await getApiToken();
  const authed = { headers: { Authorization: `Bearer ${token}` } };

  await waitFor("crm-api", async () => {
    const res = await fetch(`${API_URL}/crm/v1/children?pageNumber=1&pageSize=1`, authed);
    return res.ok;
  });
  await waitFor("scheduling-api", async () => {
    const res = await fetch(`${API_URL}/scheduling/v1/groups?pageNumber=1&pageSize=1`, authed);
    return res.ok;
  });
}
