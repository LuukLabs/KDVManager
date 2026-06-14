import MainNavbar from "./MainNavbar";
import TrialGuard from "./TrialGuard";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <TrialGuard>
      <MainNavbar>
        <Outlet />
      </MainNavbar>
    </TrialGuard>
  );
}

export default MainLayout;
