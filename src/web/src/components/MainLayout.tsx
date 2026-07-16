import MainNavbar from "./MainNavbar";
import TenantGuard from "./TenantGuard";
import TrialGuard from "./TrialGuard";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <TenantGuard>
      <TrialGuard>
        <MainNavbar>
          <Outlet />
        </MainNavbar>
      </TrialGuard>
    </TenantGuard>
  );
}

export default MainLayout;
