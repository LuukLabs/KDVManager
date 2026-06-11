import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import NiceModal from "@ebay/nice-modal-react";
import { useTranslation } from "react-i18next";
import GroupsTable from "../../features/groups/GroupsTable";
import { AddGroupDialog } from "../../features/groups/AddGroupDialog";
import { ListPageHeader } from "@components/layout/ListPageHeader";

const ListGroupsPage = () => {
  const { t } = useTranslation();

  const onAddGroupClickHandler = () => void NiceModal.show(AddGroupDialog);

  return (
    <Stack spacing={2} sx={{ pb: 2 }}>
      <ListPageHeader
        title={t("Groups")}
        description={t("Manage the groups children can be assigned to.")}
        action={
          <Button
            variant="contained"
            onClick={onAddGroupClickHandler}
            startIcon={<AddIcon />}
            sx={{ alignSelf: { xs: "stretch", sm: "flex-start" }, minWidth: { sm: 160 } }}
          >
            {t("Add group")}
          </Button>
        }
      />
      <Paper elevation={0} sx={{ p: { xs: 1, sm: 2 }, borderRadius: 3 }}>
        <GroupsTable />
      </Paper>
    </Stack>
  );
};

export const Component = ListGroupsPage;
