import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  styled,
  CircularProgress,
} from "@mui/material";
import dayjs from "dayjs";
import { useGetAttendanceList } from "@api/endpoints/attendance/attendance";
import { useTranslation } from "react-i18next";

type AttendanceListPrintProps = {
  year: number;
  month: number;
  dayOfWeek: number;
  groupId: number;
  onClose: () => void;
};

// Styled components for print layout
const PrintDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    maxWidth: "210mm",
    width: "210mm",
    height: "297mm",
    margin: 0,
    padding: theme.spacing(2),
    "@media print": {
      width: "210mm",
      height: "297mm",
      margin: 0,
      padding: "15mm",
      boxShadow: "none",
    },
  },
}));

const PrintHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
}));

const AttendanceCell = styled(TableCell)({
  width: "20px",
  textAlign: "center",
  backgroundColor: "#e0e0e0",
  "&.scheduled": {
    backgroundColor: "transparent",
  },
});

export const AttendanceListPrint: React.FC<AttendanceListPrintProps> = ({
  year,
  month,
  dayOfWeek,
  groupId,
  onClose,
}) => {
  const { t } = useTranslation();
  
  // Use the real API to fetch attendance data
  const { data: attendanceData, isLoading: loading, error } = useGetAttendanceList({
    year,
    month,
    dayOfWeek,
    groupId,
  });

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Dialog open={true} maxWidth="sm" fullWidth>
        <DialogContent sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !attendanceData) {
    return (
      <Dialog open={true} maxWidth="sm" fullWidth>
        <DialogContent sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <Typography color="error">{t("Error loading data")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="outlined">
            {t("Close")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <PrintDialog open={true} onClose={onClose} maxWidth={false}>
      <DialogContent sx={{ p: 3 }}>
        <PrintHeader>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {attendanceData.groupName}
          </Typography>
          <Box textAlign="right">
            <Typography variant="body1">
              <strong>{t("Day")}:</strong> {attendanceData.dayName}
            </Typography>
            <Typography variant="body1">
              <strong>{t("Month")}:</strong> {attendanceData.monthName}
            </Typography>
          </Box>
        </PrintHeader>

        <Box mb={2}>
          <Typography variant="body1">
            <strong>{t("Morning Staff")}:</strong> __________________
            <span style={{ marginLeft: "40px" }}>
              <strong>{t("Afternoon Staff")}:</strong> __________________
            </span>
          </Typography>
        </Box>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("ID")}</TableCell>
                <TableCell>{t("Name")}</TableCell>
                <TableCell align="center">{t("Date of birth")}</TableCell>
                <TableCell align="center">{t("Age")}</TableCell>
                <TableCell align="center">{t("Start time")}</TableCell>
                <TableCell align="center">{t("End time")}</TableCell>
                {attendanceData.dates?.map((dateStr: string, index: number) => (
                  <TableCell key={index} align="center">
                    {dayjs(dateStr).format("DD-MM")}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceData.children?.map((child: any) => (
                <TableRow key={child.childId}>
                  <TableCell align="right">{child.childId}</TableCell>
                  <TableCell>{child.fullName}</TableCell>
                  <TableCell align="center">
                    {dayjs(child.dateOfBirth).format("DD-MM-YYYY")}
                  </TableCell>
                  <TableCell align="center">{child.age}</TableCell>
                  <TableCell align="center">{child.beginTime}</TableCell>
                  <TableCell align="center">{child.endTime}</TableCell>
                  {attendanceData.dates?.map((dateStr: string, dateIndex: number) => {
                    const schedule = child.schedules?.find((s: any) =>
                      dayjs(s.date).isSame(dateStr, 'day'),
                    );
                    return (
                      <AttendanceCell
                        key={dateIndex}
                        className={schedule?.isScheduled ? "scheduled" : ""}
                      >
                        {/* Empty cell for manual marking */}
                      </AttendanceCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined">
          {t("Close")}
        </Button>
        <Button onClick={handlePrint} variant="contained" color="primary">
          {t("Print")}
        </Button>
      </DialogActions>
    </PrintDialog>
  );
};

export default AttendanceListPrint;
