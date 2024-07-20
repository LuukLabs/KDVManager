import * as React from "react";
import { Box } from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import AdbIcon from "@mui/icons-material/Adb";
import { useNavigate } from "react-router-dom";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import { AppBar } from "@mui/material";
import { useTranslation } from "react-i18next";
import AccountMenu from "./AccountMenu";
import RouterBreadcrumbs from "./RouterBreadcrumbs";

type MainNavbarProps = {
  children: React.ReactNode;
};

const MainNavbar: React.FC<MainNavbarProps> = ({ children }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
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
                {/* {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))} */}
              </Menu>
            </Box>
            <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
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
              {t("LOGO")}
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              <Button
                sx={{ my: 2, color: "white", display: "block" }}
                onClick={() => {
                  navigate("/children");
                }}
              >
                {t("Children")}
              </Button>
              <Button
                sx={{ my: 2, color: "white", display: "block" }}
                onClick={() => {
                  navigate("/groups");
                }}
              >
                {t("Groups")}
              </Button>
              <Button
                sx={{ my: 2, color: "white", display: "block" }}
                onClick={() => {
                  navigate("/people");
                }}
              >
                {t("People")}
              </Button>
            </Box>
            <AccountMenu />
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="xl">
        <Box display="flex" alignItems="center" marginY={1}>
          <RouterBreadcrumbs />
        </Box>
        {children}
      </Container>
    </>
  );
};
export default withAuthenticationRequired(MainNavbar, {
  onRedirecting: () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        p: 2, // padding for better spacing on small screens
      }}
    >
      <Box
        component="img"
        src="/logo.jpeg"
        sx={{
          maxWidth: { xs: "90%", sm: "70%", md: "80%" }, // responsive width
          maxHeight: { xs: "90%", sm: "70%", md: "80%" }, // responsive width
          height: "auto",
        }}
      />
    </Box>
  ),
});
