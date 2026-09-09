import * as React from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Settings from "@mui/icons-material/Settings";
import AdminPanelSettings from "@mui/icons-material/AdminPanelSettings";
import Login from "@mui/icons-material/Login";
import Logout from "@mui/icons-material/Logout";
import { useAuth0 } from "@auth0/auth0-react";
import { useTranslation } from "react-i18next";
import Stack from "@mui/material/Stack";
import { useNavigate } from "react-router-dom";
import { useMyTenant } from "@lib/tenant/useMyTenant";
import { useIsPlatformAdmin } from "@lib/auth/useIsPlatformAdmin";

export default function AccountMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const navigate = useNavigate();
  const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();
  const { t } = useTranslation();
  const { data: tenant } = useMyTenant();
  const isPlatformAdmin = useIsPlatformAdmin();

  return (
    <React.Fragment>
      <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
        <Tooltip title={t("Account settings")}>
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Avatar alt={user?.name} src={user?.picture} />
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleClose}>
          <Avatar alt={user?.name} src={user?.picture} />
          <Stack>
            <Typography>{user?.name}</Typography>
            <Typography variant="body2">{user?.email}</Typography>
            {tenant?.name ? (
              <Typography variant="body2" color="text.secondary">
                {tenant.name}
              </Typography>
            ) : null}
          </Stack>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => navigate("/settings")}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          {t("Settings")}
        </MenuItem>
        {isPlatformAdmin ? (
          <MenuItem onClick={() => navigate("/admin")}>
            <ListItemIcon>
              <AdminPanelSettings fontSize="small" />
            </ListItemIcon>
            {t("Platform administration")}
          </MenuItem>
        ) : null}
        {isAuthenticated ? (
          <MenuItem
            key="Logout"
            onClick={() => {
              void logout();
            }}
          >
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            <Typography sx={{ textAlign: "center" }}>{t("Logout")}</Typography>
          </MenuItem>
        ) : (
          <MenuItem
            key="Login"
            onClick={() => {
              void loginWithRedirect();
            }}
          >
            <ListItemIcon>
              <Login fontSize="small" />
            </ListItemIcon>
            <Typography sx={{ textAlign: "center" }}>{t("Login")}</Typography>
          </MenuItem>
        )}
      </Menu>
    </React.Fragment>
  );
}
