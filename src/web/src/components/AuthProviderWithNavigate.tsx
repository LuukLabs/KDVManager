import { Auth0Provider, type AppState } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

type AuthProviderWithNavigateProps = {
  children: React.ReactNode;
};

const AuthProviderWithNavigate: React.FC<AuthProviderWithNavigateProps> = ({ children }) => {
  const navigate = useNavigate();

  const domain = (import.meta.env.VITE_APP_AUTH0_DOMAIN as string) || "";
  const clientId = (import.meta.env.VITE_APP_AUTH0_CLIENT_ID as string) || "";

  const onRedirectCallback = (appState?: AppState) => {
    navigate(appState?.returnTo ?? window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        audience: "https://api.kdvmanager.nl/",
        redirect_uri: window.location.origin,
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export default AuthProviderWithNavigate;
