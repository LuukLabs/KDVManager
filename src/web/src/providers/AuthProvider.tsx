import { useEffect, type PropsWithChildren } from "react";
import { Auth0Provider, useAuth0, type AppState } from "@auth0/auth0-react";
import { authConfig, setAuth0Client, validateAuthConfig } from "@lib/auth/auth";

type AuthProviderProps = PropsWithChildren;

const AuthSetup = () => {
  const auth0 = useAuth0();

  useEffect(() => {
    setAuth0Client(auth0);
  }, [auth0]);

  return null;
};

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Validate config on mount (optional)
  validateAuthConfig();

  const onRedirectCallback = (appState?: AppState) => {
    if (appState) {
      localStorage.setItem("auth_app_state", JSON.stringify(appState));
    }
  };

  return (
    <Auth0Provider
      domain={authConfig.domain}
      clientId={authConfig.clientId}
      authorizationParams={{
        audience: authConfig.audience,
        redirect_uri: authConfig.redirectUri,
      }}
      useRefreshTokens={true}
      onRedirectCallback={onRedirectCallback}
      cacheLocation="memory"
    >
      <AuthSetup />
      {children}
    </Auth0Provider>
  );
};

export default AuthProvider;
