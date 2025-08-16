import { IconButton, Tooltip } from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

type EditGuardianButtonProps = {
  id: string;
};

export const EditGuardianButton = ({ id }: EditGuardianButtonProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleEdit = () => {
    navigate(`/guardians/${id}/edit`);
  };

  return (
    <Tooltip title={t("Edit Guardian")}>
      <IconButton size="small" onClick={handleEdit} color="primary">
        <Edit fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};
