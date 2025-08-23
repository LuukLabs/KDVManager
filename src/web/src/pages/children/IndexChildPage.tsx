import Toolbar, { type ToolbarProps } from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { ChildrenTable } from "../../features/children/ChildrenTable";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";

const StyledToolbar = styled(Toolbar)<ToolbarProps>(() => ({
  marginLeft: "auto",
  marginRight: -12,
}));

const IndexChildPage = () => {
  const { t } = useTranslation();

  return (
    <Paper>
      <StyledToolbar>
        <Box display="flex" flexGrow={1} />
        <Button variant="contained" component={Link} to="new" startIcon={<AddIcon />}>
          {t("Child")}
        </Button>
      </StyledToolbar>
      <ChildrenTable />
    </Paper>
  );
};

export const Component = IndexChildPage;
