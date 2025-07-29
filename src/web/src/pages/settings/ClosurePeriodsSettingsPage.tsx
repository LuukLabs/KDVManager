import { useTranslation } from "react-i18next";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
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
      <Paper>
        <Toolbar>
          <Box display="flex" flexGrow={1} />
          <Button variant="contained" onClick={onAddClickHandler} startIcon={<AddIcon />}>
            {t("Add Closure Period")}
          </Button>
        </Toolbar>
        <ClosurePeriodsTable />
      </Paper>
    </NiceModal.Provider>
  );
};

export const Component = ClosurePeriodsSettingsPage;
