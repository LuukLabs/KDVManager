import React from "react";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import ChildrenTable from "../../features/children/ChildrenTable";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles({
  // This group of buttons will be aligned to the right
  rightToolbar: {
    marginLeft: "auto",
    marginRight: -12,
  },
});

export const IndexChildPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const onAddChildClickHandler = () => navigate("/children/new");

  return (
    <Container>
      <Toolbar>
        <section className={classes.rightToolbar}>
          <Button
            variant="contained"
            onClick={onAddChildClickHandler}
            startIcon={<AddIcon />}
          >
            Kind
          </Button>
        </section>
      </Toolbar>
      <Paper>
        <ChildrenTable />
      </Paper>
    </Container>
  );
};
