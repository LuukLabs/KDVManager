import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import NiceModal from "@ebay/nice-modal-react";
import { useTranslation } from "react-i18next";
import { ClosurePeriodsTable } from "../../features/closurePeriods/ClosurePeriodsTable";
import { AddClosurePeriodDialog } from "../../features/closurePeriods/AddClosurePeriodDialog";
import { ListPageHeader } from "@components/layout/ListPageHeader";

const ClosurePeriodsSettingsPage = () => {
  const { t } = useTranslation();

  const onAddClickHandler = () => {
    void NiceModal.show(AddClosurePeriodDialog);
  };

  return (
    <Stack spacing={2} sx={{ pb: 2 }}>
      <ListPageHeader
        title={t("Closure periods")}
        description={t("Plan the days and periods the daycare is closed.")}
        action={
          <Button
            variant="contained"
            onClick={onAddClickHandler}
            startIcon={<AddIcon />}
            sx={{ alignSelf: { xs: "stretch", sm: "flex-start" }, minWidth: { sm: 160 } }}
          >
            {t("Add Closure Period")}
          </Button>
        }
      />
      <Paper elevation={0} sx={{ p: { xs: 1, sm: 2 }, borderRadius: 3 }}>
        <ClosurePeriodsTable />
      </Paper>
    </Stack>
  );
};

export const Component = ClosurePeriodsSettingsPage;
