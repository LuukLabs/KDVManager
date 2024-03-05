import Toolbar from "@mui/material/Toolbar";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import GroupsTable from "../../features/groups/GroupsTable";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import NiceModal from "@ebay/nice-modal-react";
import { AddGroupDialog } from "../../features/groups/AddGroupDialog";

const ListGroupsPage = () => {
  const onAddGroupClickHandler = () => NiceModal.show(AddGroupDialog);

  return (
    <>
      <Container>
        <Toolbar>
          <Button variant="contained" onClick={onAddGroupClickHandler} startIcon={<AddIcon />}>
            Groep
          </Button>
        </Toolbar>
        <Paper>
          <GroupsTable />
        </Paper>
      </Container>
    </>
  );
};

export const Component = ListGroupsPage;
