import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import GroupsTable from "../../features/groups/GroupsTable";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import NiceModal from "@ebay/nice-modal-react";
import { AddGroupDialog } from "../../features/groups/AddGroupDialog";
import { useTranslation } from "react-i18next";

const ListGroupsPage = () => {
  const { t } = useTranslation();

  const onAddGroupClickHandler = () => void NiceModal.show(AddGroupDialog);

  return (
    <>
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
            {t("Groups")}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            {t("Manage groups.")}
          </Typography>
        </Box>
        <Button variant="contained" onClick={onAddGroupClickHandler} startIcon={<AddIcon />}>
          {t("Group")}
        </Button>
      </Box>
      <Paper>
        <GroupsTable />
      </Paper>
    </>
  );
};

export const Component = ListGroupsPage;
