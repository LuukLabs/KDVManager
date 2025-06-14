import { Box, Paper, Typography, CircularProgress } from "@mui/material";
import { type Dayjs } from "dayjs";
import { useGetSchedulesByDate } from "@api/endpoints/schedules/schedules";
import ChildCard from "./ChildCard";
import { useTranslation } from "react-i18next";

type Group = {
  id: string;
  name: string;
};

type GroupColumnProps = {
  group: Group;
  selectedDate: Dayjs;
};

const GroupColumn = ({ group, selectedDate }: GroupColumnProps) => {
  const { t } = useTranslation();
  const { data: schedules, isLoading } = useGetSchedulesByDate({
    Date: selectedDate.format("YYYY-MM-DD"),
    GroupId: group.id,
  });

  return (
    <Paper sx={{ p: 2, height: "fit-content" }}>
      <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
        {group.name}
      </Typography>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {schedules && schedules.length > 0 ? (
            schedules.map((schedule) => (
              <ChildCard key={schedule.scheduleId} childId={schedule.childId} schedule={schedule} />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
              {t("No schedules for this date")}
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default GroupColumn;
