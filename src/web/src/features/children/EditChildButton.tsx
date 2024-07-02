import IconButton from "@mui/material/IconButton/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

type EditChildButtonProps = {
  id: string;
};

export const EditChildButton: React.FC<EditChildButtonProps> = ({ id }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleOnEditClick = () => {
    navigate(`/children/${id}`);
  };

  return (
    <IconButton
      aria-label={t("edit", { ns: "common", context: "aria-label" })}
      onClick={handleOnEditClick}
    >
      <EditIcon />
    </IconButton>
  );
};
