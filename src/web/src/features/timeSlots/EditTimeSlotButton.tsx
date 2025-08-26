import { IconButton, Tooltip } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import NiceModal from "@ebay/nice-modal-react";
import { useTranslation } from "react-i18next";
import { type TimeSlotListVM } from "@api/models/timeSlotListVM";
import { EditTimeSlotDialog } from "./EditTimeSlotDialog";

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
        sx={{
          color: "primary.main",
          "&:hover": {
            backgroundColor: "primary.50",
            transform: "scale(1.1)",
          },
          transition: "all 0.2s ease-in-out",
        }}
      >
        <EditIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Tooltip>
  );
};

export default EditTimeSlotButton;
