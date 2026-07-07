import { IconButton, Tooltip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Edit as EditIcon } from "@mui/icons-material";
import NiceModal from "@ebay/nice-modal-react";
import { useTranslation } from "react-i18next";
import { type TimeSlotListVM } from "@api/scheduling/models/timeSlotListVM";
import EditTimeSlotDialog from "./EditTimeSlotDialog";

type EditTimeSlotButtonProps = {
  timeSlot: TimeSlotListVM;
};

const EditTimeSlotButton = ({ timeSlot }: EditTimeSlotButtonProps) => {
  const { t } = useTranslation();

  const handleEdit = () => {
    void NiceModal.show(EditTimeSlotDialog, { timeSlot });
  };

  return (
    <Tooltip title={t("Edit") as string} arrow>
      <IconButton
        size="small"
        onClick={handleEdit}
        sx={(theme) => ({
          color: "primary.main",
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            transform: "scale(1.1)",
          },
          transition: "all 0.2s ease-in-out",
        })}
      >
        <EditIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Tooltip>
  );
};

export default EditTimeSlotButton;
