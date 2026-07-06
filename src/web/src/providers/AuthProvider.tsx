import { useEffect, type PropsWithChildren } from "react";
import { Auth0Provider, useAuth0, type AppState } from "@auth0/auth0-react";
import {
  authConfig,
  setAuth0Client,
  setPostLoginReturnTo,
  validateAuthConfig,
} from "@lib/auth/auth";

type AuthProviderProps = PropsWithChildren;

/**
 * Mirrors every Auth0 context update into the module-level auth bridge so
 * non-React code (route loaders, the API fetch mutators) can wait for the SDK
 * to finish initialising and read the current session state.
 */
const AuthBridge = () => {
  const auth0 = useAuth0();

  useEffect(() => {
    setAuth0Client(auth0);
  }, [auth0]);

  return null;
};

const onRedirectCallback = (appState?: AppState) => {
  setPostLoginReturnTo(typeof appState?.returnTo === "string" ? appState.returnTo : null);
};

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  validateAuthConfig();

  return (
    <Auth0Provider
      domain={authConfig.domain}
      clientId={authConfig.clientId}
      authorizationParams={{
        audience: authConfig.audience,
        redirect_uri: authConfig.redirectUri,
      }}
      // Persist tokens so the session survives hard refreshes and new tabs;
      // with memory-only caching every reload depended on iframe silent auth,
      // which third-party-cookie blocking makes unreliable.
      cacheLocation="localstorage"
      useRefreshTokens={true}
      useRefreshTokensFallback={true}
      onRedirectCallback={onRedirectCallback}
    >
      <AuthBridge />
      {children}
    </Auth0Provider>
  );
};

export default AuthProvider;
