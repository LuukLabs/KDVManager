import Toolbar from "@mui/material/Toolbar";
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
      <Toolbar>
        <Button variant="contained" onClick={onAddGroupClickHandler} startIcon={<AddIcon />}>
          {t("Group")}
        </Button>
      </Toolbar>
      <Paper>
        <GroupsTable />
      </Paper>
    </>
  );
};

export const Component = ListGroupsPage;
