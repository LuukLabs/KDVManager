import { Box, IconButton, Chip } from "@mui/material";
import { CheckCircle, Cancel, Help } from "@mui/icons-material";
import { useState } from "react";

export type AttendanceState = "present" | "absent" | "unknown";

type AttendanceControlProps = {
  initialState?: AttendanceState;
  onStateChange?: (state: AttendanceState) => void;
  size?: "small" | "medium";
};

const AttendanceControl = ({
  initialState = "unknown",
  onStateChange,
  size = "small",
}: AttendanceControlProps) => {
  const [attendanceState, setAttendanceState] = useState<AttendanceState>(initialState);

  const handleStateChange = (newState: AttendanceState) => {
    setAttendanceState(newState);
    onStateChange?.(newState);
  };

  const getAttendanceConfig = (state: AttendanceState) => {
    switch (state) {
      case "present":
        return {
          label: "Present",
          color: "success" as const,
          icon: <CheckCircle sx={{ fontSize: size === "small" ? 14 : 16 }} />,
        };
      case "absent":
        return {
          label: "Absent",
          color: "error" as const,
          icon: <Cancel sx={{ fontSize: size === "small" ? 14 : 16 }} />,
        };
      case "unknown":
      default:
        return {
          label: "Unknown",
          color: "default" as const,
          icon: <Help sx={{ fontSize: size === "small" ? 14 : 16 }} />,
        };
    }
  };

  const attendanceConfig = getAttendanceConfig(attendanceState);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Chip
        icon={attendanceConfig.icon}
        label={attendanceConfig.label}
        color={attendanceConfig.color}
        size={size}
        sx={{ fontWeight: 500, minWidth: 80 }}
      />
      <Box sx={{ display: "flex", gap: 0.25 }}>
        <IconButton
          size="small"
          color="success"
          onClick={() => handleStateChange("present")}
          sx={{
            width: 24,
            height: 24,
            bgcolor: attendanceState === "present" ? "success.100" : "transparent",
            "&:hover": { bgcolor: "success.100" },
          }}
        >
          <CheckCircle sx={{ fontSize: 14 }} />
        </IconButton>
        <IconButton
          size="small"
          color="error"
          onClick={() => handleStateChange("absent")}
          sx={{
            width: 24,
            height: 24,
            bgcolor: attendanceState === "absent" ? "error.100" : "transparent",
            "&:hover": { bgcolor: "error.100" },
          }}
        >
          <Cancel sx={{ fontSize: 14 }} />
        </IconButton>
        <IconButton
          size="small"
          color="default"
          onClick={() => handleStateChange("unknown")}
          sx={{
            width: 24,
            height: 24,
            bgcolor: attendanceState === "unknown" ? "grey.100" : "transparent",
            "&:hover": { bgcolor: "grey.100" },
          }}
        >
          <Help sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default AttendanceControl;
