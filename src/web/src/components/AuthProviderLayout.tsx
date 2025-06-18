import AuthProviderWithNavigate from "./AuthProviderWithNavigate";
import AuthInject from "./AuthInject";
import MainNavbar from "./MainNavbar";
import EnhancedLoadingIndicator from "./EnhancedLoadingIndicator";
import { Outlet } from "react-router-dom";
import NiceModal from "@ebay/nice-modal-react";

function AuthProviderLayout() {
  return (
    <AuthProviderWithNavigate>
      <AuthInject />
      <EnhancedLoadingIndicator />
      <NiceModal.Provider>
        <MainNavbar>
          <Outlet />
        </MainNavbar>
      </NiceModal.Provider>
    </AuthProviderWithNavigate>
  );
}

export default AuthProviderLayout;
