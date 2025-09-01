import i18next from "i18next";
import { type Auth0ContextInterface } from "@auth0/auth0-react";
import { redirect, type LoaderFunction } from "react-router-dom";

// Auth0 configuration
export const authConfig = {
  domain: import.meta.env.VITE_APP_AUTH0_DOMAIN!,
  clientId: import.meta.env.VITE_APP_AUTH0_CLIENT_ID!,
  audience: import.meta.env.VITE_APP_AUTH0_AUDIENCE ?? "https://api.kdvmanager.nl/",
  redirectUri: `${window.location.origin}/auth/callback`,
};

export const validateAuthConfig = () => {
  if (!authConfig.domain || !authConfig.clientId) {
    throw new Error(i18next.t("auth.errors.missingConfig", "Auth0 configuration is missing domain or clientId"));
  }
  if (!authConfig.audience) {
    console.warn(i18next.t("auth.warnings.audienceMissing", "Auth0 audience is not set, using default: ") + authConfig.audience);
  }
};

// Global Auth0 client instance (from @auth0/auth0-react)
let auth0Client: Auth0ContextInterface | null = null;

export const getAuth0Client = () => auth0Client;
export const setAuth0Client = (client: Auth0ContextInterface) => {
  auth0Client = client;
};

// Token getter for API calls
export const getAuthToken = async (): Promise<string | null> => {
  if (!auth0Client) return null;

  try {
    const isAuthenticated = await auth0Client.isAuthenticated;
    if (!isAuthenticated) return null;

    return await auth0Client.getAccessTokenSilently({
      authorizationParams: { audience: authConfig.audience },
    });
  } catch (error) {
    console.error("Failed to get token:", error);
    return null;
  }
};

// Auth loader for protected routes
export const requireAuth: LoaderFunction = async ({ request }) => {
  if (!auth0Client) {
    console.error("Auth0 client is not initialized");
    const url = new URL(request.url);
    console.log(
      "requireauth url",
      `/auth/login?returnTo=${encodeURIComponent(url.pathname + url.search)}`,
    );
    throw redirect(`/auth/login?returnTo=${encodeURIComponent(url.pathname + url.search)}`);
  }

  const isAuthenticated = await auth0Client.isAuthenticated;

  if (!isAuthenticated) {
    const url = new URL(request.url);
    throw redirect(`/auth/login?returnTo=${encodeURIComponent(url.pathname + url.search)}`);
  }

  return null;
};

// Wrapper to add auth to existing loaders
export const withAuth = (loader: LoaderFunction): LoaderFunction => {
  return async (args) => {
    await requireAuth(args);
    return loader(args);
  };
};
