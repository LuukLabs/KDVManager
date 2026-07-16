import { useTranslation } from "react-i18next";
import { Box, Typography, Button, Stack } from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

/**
 * Full-screen lock shown when the tenant's 30-day trial has expired. The rest of
 * the app is unreachable (and the backend rejects calls with HTTP 402), so this
 * offers the paths forward: contact us to subscribe, or sign out.
 */
const TrialExpiredScreen: React.FC = () => {
  const { t } = useTranslation();
  const { logout } = useAuth0();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        p: 3,
        gap: 2,
      }}
    >
      <LockOutlinedIcon color="action" sx={{ fontSize: 64 }} />
      <Typography variant="h4" component="h1">
        {t("Your free trial has ended")}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520 }}>
        {t(
          "Your 30-day trial has ended. Subscribe to keep managing your daycare with KDVManager.",
        )}
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
        <Button variant="contained" href="mailto:admin@kdvmanager.nl?subject=KDVManager%20subscription">
          {t("Contact us to subscribe")}
        </Button>
        <Button variant="outlined" onClick={() => void logout()}>
          {t("Sign out")}
        </Button>
      </Stack>
    </Box>
  );
};

export default TrialExpiredScreen;
