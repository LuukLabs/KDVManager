import React from "react";
import Toolbar from "@mui/material/Toolbar";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import makeStyles from "@mui/styles/makeStyles";
import GroupsTable from "../../features/groups/GroupsTable";
import MainNavbar from "../../components/MainNavbar";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import { FormContainer, TextFieldElement, useForm } from "react-hook-form-mui";
import {
  getListGroupsQueryKey,
  useAddGroup,
} from "../../api/endpoints/groups/groups";
import { AddGroupCommand } from "../../api/models";
import { useQueryClient } from "react-query";

const useStyles = makeStyles({
  // This group of buttons will be aligned to the right
  rightToolbar: {
    marginLeft: "auto",
    marginRight: -12,
  },
});

export const ListGroupsPage = () => {
  const classes = useStyles();
  const queryClient = useQueryClient();
  const { mutate } = useAddGroup();

  const [open, setOpen] = React.useState(false);

  const onAddGroupClickHandler = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
  };

  const formContext = useForm<AddGroupCommand>();

  const { handleSubmit, reset } = formContext;

  const onSubmit = (data: AddGroupCommand) => {
    mutate({ data: data }, { onSuccess: onSuccess });
  };

  const onSuccess = () => {
    queryClient.invalidateQueries(getListGroupsQueryKey());
    reset();
    setOpen(false);
  };

  return (
    <>
      <MainNavbar />
      <Container>
        <Toolbar>
          <section className={classes.rightToolbar}>
            <Button
              variant="contained"
              onClick={onAddGroupClickHandler}
              startIcon={<AddIcon />}
            >
              Groep
            </Button>
          </section>
        </Toolbar>
        <Paper>
          <GroupsTable />
        </Paper>
      </Container>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Groep toevoegen</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To add a group, please enter the group name here.
          </DialogContentText>
          <FormContainer
            formContext={formContext}
            handleSubmit={handleSubmit(onSubmit)}
          >
            <TextFieldElement
              autoFocus
              name="name"
              label="Naam"
              margin="dense"
              variant="standard"
              required
              fullWidth
            />
          </FormContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)}>Toevoegen</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
