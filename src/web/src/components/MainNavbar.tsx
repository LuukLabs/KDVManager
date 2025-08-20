import * as React from "react";
import { Box, MenuItem } from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { AppBar } from "@mui/material";
import { useTranslation } from "react-i18next";
import AccountMenu from "./AccountMenu";
import RouterBreadcrumbs from "./RouterBreadcrumbs";

type MainNavbarProps = {
  children: React.ReactNode;
};

const MainNavbar: React.FC<MainNavbarProps> = ({ children }: MainNavbarProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);

  // Define navigation items for better maintainability
  const navigationItems = [
    { key: "schedule", label: t("Schedule Overview"), path: "/schedule" },
    { key: "children", label: t("Children"), path: "/children" },
    { key: "guardians", label: t("Guardians"), path: "/guardians" },
    { key: "print", label: t("Print Schedules"), path: "/print-schedules" },
  ];

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleCloseNavMenu();
  };

  return (
    <>
      <AppBar position="static" className="app-navbar">
        <Container maxWidth={false}>
          <Toolbar disableGutters>
            <Box
              component="img"
              src="/favicon-32x32.png"
              alt={t("KDVManager")}
              sx={{
                display: { xs: "none", md: "flex" },
                mr: 1,
                width: 32,
                height: 32,
              }}
            />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              {t("KDVManager")}
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label={t("account of current user")}
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: "block", md: "none" },
                }}
              >
                {navigationItems.map((item) => (
                  <MenuItem key={item.key} onClick={() => handleNavigation(item.path)}>
                    <Typography textAlign="center">{item.label}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <Box
              component="img"
              src="/favicon-32x32.png"
              alt={t("KDVManager")}
              sx={{
                display: { xs: "flex", md: "none" },
                mr: 1,
                width: 24,
                height: 24,
              }}
            />
            <Typography
              variant="h5"
              noWrap
              component="a"
              href=""
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              {t("KDVManager")}
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.key}
                  sx={{ my: 2, color: "white", display: "block" }}
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
            <AccountMenu />
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth={false}>
        <Box display="flex" alignItems="center" marginY={1} className="app-breadcrumbs">
          <RouterBreadcrumbs />
        </Box>
        {children}
      </Container>
    </>
  );
};

export default MainNavbar;
