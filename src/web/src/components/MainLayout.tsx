import MainNavbar from "./MainNavbar";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <MainNavbar>
      <Outlet />
    </MainNavbar>
  );
}

export default MainLayout;
