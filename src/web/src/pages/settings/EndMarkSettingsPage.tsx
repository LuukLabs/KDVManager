import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import { useTranslation } from "react-i18next";
import { EndMarkSettingsCard } from "../../features/settings/EndMarkSettingsCard";
import { ListPageHeader } from "@components/layout/ListPageHeader";

const EndMarkSettingsPage = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={2} sx={{ pb: 2 }}>
        <ListPageHeader
          title={t("EndMark Automation Settings")}
          description={t(
            "Configure automatic EndMark creation for children based on their birth dates.",
          )}
        />
        <EndMarkSettingsCard />
      </Stack>
    </Container>
  );
};

export const Component = EndMarkSettingsPage;
