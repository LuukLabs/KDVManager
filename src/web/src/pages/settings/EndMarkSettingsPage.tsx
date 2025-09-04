import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { EndMarkSettingsCard } from "../../features/settings/EndMarkSettingsCard";

const EndMarkSettingsPage = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg">
      <Box display="flex" flexDirection="column" gap={3}>
        <Typography variant="h4" component="h1">
          {t("EndMark Automation Settings")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("Configure automatic EndMark creation for children based on their birth dates.")}
        </Typography>

        <EndMarkSettingsCard />
      </Box>
    </Container>
  );
};

export const Component = EndMarkSettingsPage;
