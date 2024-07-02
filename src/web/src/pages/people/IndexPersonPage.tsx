import Toolbar from "@mui/material/Toolbar";
import { PeopleTable } from "../../features/people/PeopleTable";
import Paper from "@mui/material/Paper";

const IndexPersonPage = () => {
  return (
    <>
      <Toolbar></Toolbar>
      <Paper>
        <PeopleTable />
      </Paper>
    </>
  );
};

export const Component = IndexPersonPage;
