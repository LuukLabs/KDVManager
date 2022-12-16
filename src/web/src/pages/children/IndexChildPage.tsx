import { Link } from "@mui/material";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/system/Unstable_Grid";
import React from "react";
import ChildrenTable from "../../features/children/ChildrenTable";

export const IndexChildPage = () => {
  return (
    <Grid>
      <Card>
        <ChildrenTable />
      </Card>
    </Grid>
  );
};
