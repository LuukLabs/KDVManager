import { useTranslation } from "react-i18next";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import { ClosurePeriodsTable } from "../../features/closurePeriods/ClosurePeriodsTable";
import NiceModal from "@ebay/nice-modal-react";
import { AddClosurePeriodDialog } from "../../features/closurePeriods/AddClosurePeriodDialog";

const ClosurePeriodsSettingsPage = () => {
  const { t } = useTranslation();

  const onAddClickHandler = () => {
    NiceModal.show(AddClosurePeriodDialog);
  };

  return (
    <NiceModal.Provider>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {t("Closure Periods")}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            {t("Manage closure periods for scheduling.")}
          </Typography>
        </Box>
        <Button variant="contained" onClick={onAddClickHandler} startIcon={<AddIcon />}>
          {t("Add Closure Period")}
        </Button>
      </Box>
      <Paper>
        <ClosurePeriodsTable />
      </Paper>
    </NiceModal.Provider>
  );
};

export const Component = ClosurePeriodsSettingsPage;
