import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import { PeopleTable } from "../../features/people/PeopleTable";
import Paper from "@mui/material/Paper";

export const IndexPersonPage = () => {
  return (
    <>
      <Container>
        <Toolbar></Toolbar>
        <Paper>
          <PeopleTable />
        </Paper>
      </Container>
    </>
  );
};
