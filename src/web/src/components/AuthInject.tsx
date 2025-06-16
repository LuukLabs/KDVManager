import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { authInterceptor } from "../api/interceptors/authInterceptor";

function AuthInject() {
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const getToken = async () => {
      return await getAccessTokenSilently({
        authorizationParams: {
          audience: "https://api.kdvmanager.nl/",
        },
      });
    };

    authInterceptor.setAuthGetter(getToken);

    return () => authInterceptor.setAuthGetter(undefined);
  }, [getAccessTokenSilently]);

  return null;
}

export default AuthInject;
