import { describe, expect, it, vi } from "vitest";
import { type Auth0ContextInterface } from "@auth0/auth0-react";
import { type LoaderFunctionArgs } from "react-router-dom";
import {
  consumePostLoginReturnTo,
  DEFAULT_AUTHENTICATED_ROUTE,
  getAuthToken,
  loginPath,
  requireAuth,
  sanitizeReturnTo,
  setAuth0Client,
  setPostLoginReturnTo,
} from "./auth";

const fakeClient = (overrides: Partial<Auth0ContextInterface>): Auth0ContextInterface =>
  ({
    isLoading: false,
    isAuthenticated: false,
    getAccessTokenSilently: vi.fn(),
    ...overrides,
  }) as unknown as Auth0ContextInterface;

const loaderArgs = (url: string) =>
  ({ request: new Request(url), params: {} }) as unknown as LoaderFunctionArgs;

describe("sanitizeReturnTo", () => {
  it("falls back to the default route for missing values", () => {
    expect(sanitizeReturnTo(null)).toBe(DEFAULT_AUTHENTICATED_ROUTE);
    expect(sanitizeReturnTo(undefined)).toBe(DEFAULT_AUTHENTICATED_ROUTE);
    expect(sanitizeReturnTo("")).toBe(DEFAULT_AUTHENTICATED_ROUTE);
  });

  it("rejects absolute and protocol-relative URLs (open redirect)", () => {
    expect(sanitizeReturnTo("https://evil.example")).toBe(DEFAULT_AUTHENTICATED_ROUTE);
    expect(sanitizeReturnTo("//evil.example")).toBe(DEFAULT_AUTHENTICATED_ROUTE);
    expect(sanitizeReturnTo("/\\evil.example")).toBe(DEFAULT_AUTHENTICATED_ROUTE);
  });

  it("keeps in-app paths including query strings", () => {
    expect(sanitizeReturnTo("/children?page=2")).toBe("/children?page=2");
    expect(sanitizeReturnTo("/settings/groups")).toBe("/settings/groups");
  });
});

describe("loginPath", () => {
  it("encodes the returnTo destination", () => {
    expect(loginPath("/children?page=2")).toBe("/auth/login?returnTo=%2Fchildren%3Fpage%3D2");
    expect(loginPath()).toBe("/auth/login");
  });
});

describe("requireAuth", () => {
  it("redirects unauthenticated users to login with the original destination", async () => {
    setAuth0Client(fakeClient({ isAuthenticated: false }));

    const result = await Promise.resolve()
      .then(() => requireAuth(loaderArgs("https://app.test/children?page=2")))
      .catch((thrown: unknown) => thrown);

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get("Location")).toBe(
      "/auth/login?returnTo=%2Fchildren%3Fpage%3D2",
    );
  });

  it("passes for authenticated users", async () => {
    setAuth0Client(fakeClient({ isAuthenticated: true }));

    await expect(requireAuth(loaderArgs("https://app.test/children"))).resolves.toBeNull();
  });
});

describe("getAuthToken", () => {
  it("returns the access token for authenticated users", async () => {
    const getAccessTokenSilently = vi.fn().mockResolvedValue("access-token");
    setAuth0Client(fakeClient({ isAuthenticated: true, getAccessTokenSilently }));

    await expect(getAuthToken()).resolves.toBe("access-token");
    expect(getAccessTokenSilently).toHaveBeenCalledOnce();
  });

  it("returns null when unauthenticated", async () => {
    setAuth0Client(fakeClient({ isAuthenticated: false }));

    await expect(getAuthToken()).resolves.toBeNull();
  });

  it("returns null when the token cannot be acquired", async () => {
    const getAccessTokenSilently = vi.fn().mockRejectedValue(new Error("login_required"));
    setAuth0Client(fakeClient({ isAuthenticated: true, getAccessTokenSilently }));

    await expect(getAuthToken()).resolves.toBeNull();
  });
});

describe("post-login returnTo handoff", () => {
  it("hands the destination over exactly once", () => {
    setPostLoginReturnTo("/guardians");

    expect(consumePostLoginReturnTo()).toBe("/guardians");
    expect(consumePostLoginReturnTo()).toBeNull();
  });
});
