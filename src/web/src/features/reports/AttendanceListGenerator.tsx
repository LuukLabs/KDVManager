import React, { useState } from "react";
import {
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Container,
  type SelectChangeEvent,
  CircularProgress,
} from "@mui/material";
import { Grid } from "@mui/system";
import dayjs from "dayjs";
import "dayjs/locale/nl";
import { AttendanceListPrint } from "./AttendanceListPrint";
import { useGetGroupsWithScheduling } from "@api/endpoints/attendance/attendance";
import { useTranslation } from "react-i18next";

// Dutch month names
const DUTCH_MONTHS = [
  "Januari",
  "Februari",
  "Maart",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Augustus",
  "September",
  "Oktober",
  "November",
  "December",
];

// Dutch day names
const DUTCH_DAYS = [
  { value: 0, label: "Zondag" },
  { value: 1, label: "Maandag" },
  { value: 2, label: "Dinsdag" },
  { value: 3, label: "Woensdag" },
  { value: 4, label: "Donderdag" },
  { value: 5, label: "Vrijdag" },
  { value: 6, label: "Zaterdag" },
];

export const AttendanceListGenerator: React.FC = () => {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState<number>(dayjs().month() + 1);
  const [selectedGroup, setSelectedGroup] = useState<number>(-1);
  const [selectedDay, setSelectedDay] = useState<number>(1); // Default to Monday
  const [showPrint, setShowPrint] = useState<boolean>(false);

  // Generate years (current year +/- 2 years)
  const years = Array.from({ length: 5 }, (_, i) => dayjs().year() - 2 + i);

  // Get groups with scheduling from API
  const startDate = dayjs().year(selectedYear).month(selectedMonth - 1).startOf('month').toISOString();
  const endDate = dayjs().year(selectedYear).month(selectedMonth - 1).endOf('month').toISOString();
  
  const { data: groupsData, isLoading: groupsLoading } = useGetGroupsWithScheduling({
    startDate,
    endDate,
  });

  const groups = groupsData || [];

  const handleYearChange = (event: SelectChangeEvent<number>) => {
    setSelectedYear(event.target.value as number);
  };

  const handleMonthChange = (event: SelectChangeEvent<number>) => {
    setSelectedMonth(event.target.value as number);
  };

  const handleGroupChange = (event: SelectChangeEvent<number>) => {
    setSelectedGroup(event.target.value as number);
  };

  const handleDayChange = (event: SelectChangeEvent<number>) => {
    setSelectedDay(event.target.value as number);
  };

  const handleGenerate = () => {
    setShowPrint(true);
  };

  const handleClosePrint = () => {
    setShowPrint(false);
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {t("Attendance List Generator")}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>{t("Year")}</InputLabel>
              <Select value={selectedYear} label={t("Year")} onChange={handleYearChange}>
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>{t("Month")}</InputLabel>
              <Select value={selectedMonth} label={t("Month")} onChange={handleMonthChange}>
                {DUTCH_MONTHS.map((month, index) => (
                  <MenuItem key={index + 1} value={index + 1}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>{t("Day")}</InputLabel>
              <Select value={selectedDay} label={t("Day")} onChange={handleDayChange}>
                {DUTCH_DAYS.map((day) => (
                  <MenuItem key={day.value} value={day.value}>
                    {day.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>{t("Group")}</InputLabel>
              <Select 
                value={selectedGroup} 
                label={t("Group")} 
                onChange={handleGroupChange}
                disabled={groupsLoading}
              >
                {groups.map((group) => (
                  <MenuItem key={group.groupNumber} value={group.groupNumber}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerate}
              disabled={selectedGroup === null || groupsLoading}
              fullWidth
            >
              {groupsLoading ? <CircularProgress size={24} /> : t("Generate")}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {showPrint && (
        <AttendanceListPrint
          year={selectedYear}
          month={selectedMonth}
          dayOfWeek={selectedDay}
          groupId={selectedGroup}
          onClose={handleClosePrint}
        />
      )}
    </Container>
  );
};

export default AttendanceListGenerator;
