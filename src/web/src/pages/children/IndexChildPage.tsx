import Toolbar, { type ToolbarProps } from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { ChildrenTable } from "../../features/children/ChildrenTable";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { useState } from "react";

const StyledToolbar = styled(Toolbar)<ToolbarProps>(() => ({
  marginLeft: "auto",
  marginRight: -12,
}));

const IndexChildPage = () => {
  const { t } = useTranslation();
  const [showArchived, setShowArchived] = useState(false);

  return (
    <Paper>
      <StyledToolbar>
        <Box display="flex" flexGrow={1} />
        <FormControlLabel
          control={
            <Switch
              checked={showArchived}
              onChange={(_, checked) => setShowArchived(checked)}
              color="primary"
            />
          }
          label={t("Show archived")}
          sx={{ mr: 2 }}
        />
        <Button variant="contained" component={Link} to="new" startIcon={<AddIcon />}>
          {t("Child")}
        </Button>
      </StyledToolbar>
      <ChildrenTable showArchived={showArchived} />
    </Paper>
  );
};

export const Component = IndexChildPage;
