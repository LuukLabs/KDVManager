import { IconButton, Tooltip } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

type ViewGuardianButtonProps = {
  id: string;
};

export const ViewGuardianButton = ({ id }: ViewGuardianButtonProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleView = () => {
    navigate(`/guardians/${id}`);
  };

  return (
    <Tooltip title={t("View Guardian Details")}>
      <IconButton onClick={handleView}>
        <EditIcon />
      </IconButton>
    </Tooltip>
  );
};
