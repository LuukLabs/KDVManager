import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthProviderWithNavigate from "./AuthProviderWithNavigate";
import MainNavbar from "./MainNavbar";
import { Outlet } from "react-router-dom";

const queryClient = new QueryClient();

function AuthProviderLayout() {
  return (
    <AuthProviderWithNavigate>
      <QueryClientProvider client={queryClient}>
        <MainNavbar>
          <Outlet />
        </MainNavbar>
      </QueryClientProvider>
    </AuthProviderWithNavigate>
  );
}

export default AuthProviderLayout;
