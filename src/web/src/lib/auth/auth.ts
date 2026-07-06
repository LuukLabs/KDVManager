import i18next from "i18next";
import { type Auth0ContextInterface } from "@auth0/auth0-react";
import { redirect, type LoaderFunction } from "react-router-dom";

/** Route users land on after login when no explicit destination is known. */
export const DEFAULT_AUTHENTICATED_ROUTE = "/schedule";

// Auth0 configuration
export const authConfig = {
  domain: import.meta.env.VITE_APP_AUTH0_DOMAIN!,
  clientId: import.meta.env.VITE_APP_AUTH0_CLIENT_ID!,
  audience: import.meta.env.VITE_APP_AUTH0_AUDIENCE ?? "https://api.kdvmanager.nl/",
  redirectUri: `${window.location.origin}/auth/callback`,
};

export const validateAuthConfig = () => {
  if (!authConfig.domain || !authConfig.clientId) {
    throw new Error(
      i18next.t("auth.errors.missingConfig", "Auth0 configuration is missing domain or clientId"),
    );
  }
};

const LOGIN_ROUTE = "/auth/login";

/** Build the login route, optionally carrying the original destination. */
export const loginPath = (returnTo?: string): string => {
  if (!returnTo) return LOGIN_ROUTE;
  return `${LOGIN_ROUTE}?returnTo=${encodeURIComponent(returnTo)}`;
};

/**
 * Restrict a post-login destination to an in-app path so the returnTo value
 * (query parameter / Auth0 appState) cannot be abused as an open redirect.
 */
export const sanitizeReturnTo = (value: string | null | undefined): string => {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return DEFAULT_AUTHENTICATED_ROUTE;
  }
  return value;
};

/*
 * Bridge between the Auth0 React context and non-React code (router loaders,
 * the API fetch mutators). AuthProvider mirrors every context update into the
 * bridge; the `ready` promise resolves once the SDK has finished initialising
 * (isLoading flipped to false), so route loaders can wait for the session to
 * be restored instead of racing the provider's first render.
 */
let auth0Client: Auth0ContextInterface | null = null;
let resolveReady: (() => void) | null = null;
const ready = new Promise<void>((resolve) => {
  resolveReady = resolve;
});

// Safety valve: if the Auth0 SDK never finishes initialising, treat the user
// as unauthenticated instead of blocking navigation forever.
const AUTH_READY_TIMEOUT_MS = 15_000;

export const setAuth0Client = (client: Auth0ContextInterface) => {
  auth0Client = client;
  if (!client.isLoading && resolveReady) {
    resolveReady();
    resolveReady = null;
  }
};

const waitForAuth0Client = async (): Promise<Auth0ContextInterface | null> => {
  if (resolveReady === null) return auth0Client;

  let timer: ReturnType<typeof setTimeout> | undefined;
  await Promise.race([
    ready,
    new Promise<void>((resolve) => {
      timer = setTimeout(resolve, AUTH_READY_TIMEOUT_MS);
    }),
  ]);
  clearTimeout(timer);
  return auth0Client;
};

/**
 * Token getter for API calls. Reads the current bridge snapshot without
 * waiting for SDK initialisation: protected pages only render after
 * {@link requireAuth} has passed, so the session is already restored by the
 * time their data fetches run.
 */
export const getAuthToken = async (): Promise<string | null> => {
  if (!auth0Client?.isAuthenticated) return null;

  try {
    return await auth0Client.getAccessTokenSilently({
      authorizationParams: { audience: authConfig.audience },
    });
  } catch (error) {
    console.error("Failed to acquire access token", error);
    return null;
  }
};

/** Auth loader for protected routes. */
export const requireAuth: LoaderFunction = async ({ request }) => {
  const client = await waitForAuth0Client();

  if (!client?.isAuthenticated) {
    const url = new URL(request.url);
    throw redirect(loginPath(url.pathname + url.search));
  }

  return null;
};

/** Wrapper to add auth to existing loaders. */
export const withAuth = (loader: LoaderFunction): LoaderFunction => {
  return async (args) => {
    await requireAuth(args);
    return loader(args);
  };
};

/*
 * Post-login destination handoff. Auth0Provider's onRedirectCallback receives
 * the appState sent along with loginWithRedirect; the callback page consumes
 * it in the same page load, so a module-level variable is all that's needed
 * (no localStorage round-trip).
 */
let postLoginReturnTo: string | null = null;

export const setPostLoginReturnTo = (returnTo: string | null) => {
  postLoginReturnTo = returnTo;
};

export const consumePostLoginReturnTo = (): string | null => {
  const value = postLoginReturnTo;
  postLoginReturnTo = null;
  return value;
};

let redirectingToLogin = false;

/**
 * Hard-redirect to the login page when the API reports an expired session
 * (401). A full navigation is intentional: the Auth0 SDK state is stale at
 * this point and a fresh document load restarts the login flow cleanly.
 */
export const redirectToLogin = () => {
  if (redirectingToLogin || window.location.pathname.startsWith("/auth/")) return;
  redirectingToLogin = true;
  window.location.assign(loginPath(window.location.pathname + window.location.search));
};
