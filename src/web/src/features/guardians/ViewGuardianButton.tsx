import { IconButton, Tooltip } from "@mui/material";
import { Visibility } from "@mui/icons-material";
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
      <IconButton size="small" onClick={handleView} color="primary">
        <Visibility fontSize="small" />
      </IconButton>
    </Tooltip>
  );
};
