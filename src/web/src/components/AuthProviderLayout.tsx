import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthProviderWithNavigate from "./AuthProviderWithNavigate";
import MainNavbar from "./MainNavbar";
import { Outlet } from "react-router-dom";
import NiceModal from "@ebay/nice-modal-react";

const queryClient = new QueryClient();

function AuthProviderLayout() {
  return (
    <AuthProviderWithNavigate>
      <QueryClientProvider client={queryClient}>
        <NiceModal.Provider>
          <MainNavbar>
            <Outlet />
          </MainNavbar>
        </NiceModal.Provider>
      </QueryClientProvider>
    </AuthProviderWithNavigate>
  );
}

export default AuthProviderLayout;
