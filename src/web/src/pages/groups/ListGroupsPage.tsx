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

const useStyles = makeStyles({
  // This group of buttons will be aligned to the right
  rightToolbar: {
    marginLeft: "auto",
    marginRight: -12,
  },
});

export const ListGroupsPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const onAddGroupClickHandler = () => navigate("/groups/new");

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
    </>
  );
};
