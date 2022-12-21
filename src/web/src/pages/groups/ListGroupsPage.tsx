import React from "react";
import Toolbar from "@mui/material/Toolbar";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import makeStyles from "@mui/styles/makeStyles";
import GroupsTable from "../../features/groups/GroupsTable";
import MainNavbar from "../../components/MainNavbar";

const useStyles = makeStyles({
  // This group of buttons will be aligned to the right
  rightToolbar: {
    marginLeft: "auto",
    marginRight: -12,
  },
});

export const ListGroupsPage = () => {
  const classes = useStyles();

  return (
    <>
      <MainNavbar />,
      <Container>
        <Toolbar></Toolbar>
        <Paper>
          <GroupsTable />
        </Paper>
      </Container>
    </>
  );
};
