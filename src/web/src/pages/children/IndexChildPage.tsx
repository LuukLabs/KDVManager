import Toolbar, { type ToolbarProps } from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { ChildrenTable } from "../../features/children/ChildrenTable";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

const StyledToolbar = styled(Toolbar)<ToolbarProps>(() => ({
  marginLeft: "auto",
  marginRight: -12,
}));

const IndexChildPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const onAddChildClickHandler = () => {
    navigate("/children/new");
  };

  return (
    <>
      <StyledToolbar>
        <Button variant="contained" onClick={onAddChildClickHandler} startIcon={<AddIcon />}>
          {t("Child")}
        </Button>
      </StyledToolbar>
      <Paper>
        <ChildrenTable />
      </Paper>
    </>
  );
};

export const Component = IndexChildPage;
