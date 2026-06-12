import { useState } from "react";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import { AdministratorsTable } from "@features/administrators/AdministratorsTable";
import { InviteAdministratorDialog } from "@features/administrators/InviteAdministratorDialog";

const AdministratorsPage = () => {
  const { t } = useTranslation();
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <Stack spacing={2} sx={{ pb: 2 }}>
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1.5,
            alignItems: { sm: "center" },
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {t("Administrators")}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              {t("Invite and manage administrators who can access this organization.")}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setInviteOpen(true)}
            sx={{ alignSelf: { xs: "stretch", sm: "flex-start" }, minWidth: { sm: 180 } }}
          >
            {t("Invite administrator")}
          </Button>
        </Box>
        <Divider flexItem sx={{ mt: 2 }} />
      </Paper>
      <Paper elevation={0} sx={{ p: { xs: 1, sm: 2 }, borderRadius: 3 }}>
        <AdministratorsTable />
      </Paper>
      <InviteAdministratorDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </Stack>
  );
};

export const Component = AdministratorsPage;
