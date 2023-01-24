import Paper from "@mui/material/Paper";
import Container from "@mui/material/Container";
import makeStyles from "@mui/styles/makeStyles";
import Toolbar from "@mui/material/Toolbar";
import { PeopleTable } from "../../features/people/PeopleTable";

const useStyles = makeStyles({
  // This group of buttons will be aligned to the right
  rightToolbar: {
    marginLeft: "auto",
    marginRight: -12,
  },
});

export const IndexPersonPage = () => {
  const classes = useStyles();

  return (
    <>
      <Container>
        <Toolbar>
          <section className={classes.rightToolbar}></section>
        </Toolbar>
        <Paper>
          <PeopleTable />
        </Paper>
      </Container>
    </>
  );
};
