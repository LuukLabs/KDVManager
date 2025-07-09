import React from "react";
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper } from "@mui/material";
import { type ChildScheduleListVM } from "@api/models/childScheduleListVM";
import { type ChildScheduleListVMScheduleRule } from "@api/models/childScheduleListVMScheduleRule";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

type PrintableScheduleProps = {
  schedule: ChildScheduleListVM;
  childName?: string;
};

const DAY_NAMES_NL = {
  0: "Zondag",
  1: "Maandag", 
  2: "Dinsdag",
  3: "Woensdag",
  4: "Donderdag",
  5: "Vrijdag",
  6: "Zaterdag"
};

const calculateHours = (startTime: string, endTime: string): number => {
  const start = dayjs(`1970-01-01T${startTime}`);
  const end = dayjs(`1970-01-01T${endTime}`);
  return end.diff(start, 'hour', true);
};

const calculateDaysInPeriod = (startDate: string, endDate: string | null, dayOfWeek: number): number => {
  const start = dayjs(startDate);
  const end = endDate ? dayjs(endDate) : dayjs().add(1, 'year');
  
  let count = 0;
  let current = start;
  
  // Find the first occurrence of the day of the week
  while (current.day() !== dayOfWeek && current.isBefore(end)) {
    current = current.add(1, 'day');
  }
  
  // Count all occurrences of this day in the period
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    count++;
    current = current.add(7, 'days');
  }
  
  return count;
};

export const PrintableSchedule: React.FC<PrintableScheduleProps> = ({ schedule, childName }) => {
  const { t } = useTranslation();

  const formatDate = (date: string) => {
    return dayjs(date).format('DD-MM-YYYY');
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // Remove seconds
  };

  const calculateTotalHours = (rule: ChildScheduleListVMScheduleRule): number => {
    if (!rule.startTime || !rule.endTime || !schedule.startDate) return 0;
    
    const hoursPerDay = calculateHours(rule.startTime, rule.endTime);
    const daysInPeriod = calculateDaysInPeriod(
      schedule.startDate, 
      schedule.endDate || null, 
      rule.day as number
    );
    
    return hoursPerDay * daysInPeriod;
  };

  const sortedRules = [...(schedule.scheduleRules || [])].sort((a, b) => {
    const dayA = a.day as number;
    const dayB = b.day as number;
    return dayA - dayB;
  });

  const grandTotal = sortedRules.reduce((total, rule) => {
    return total + calculateTotalHours(rule);
  }, 0);

  return (
    <Paper 
      sx={{ 
        p: 3, 
        backgroundColor: 'white',
        '@media print': {
          boxShadow: 'none',
          border: 'none'
        }
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        {childName && (
          <Typography variant="h5" gutterBottom>
            {t("Schedule for")} {childName}
          </Typography>
        )}
        <Typography variant="h6" gutterBottom>
          {t("Van")} {formatDate(schedule.startDate || "")} {t("t/m")} {schedule.endDate ? formatDate(schedule.endDate) : t("Onbepaald")}
        </Typography>
      </Box>

      {/* Schedule Table */}
      <Table size="small" sx={{ border: '1px solid #000' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', borderBottom: '2px solid #000', borderRight: '1px solid #000' }}>
              {t("Weekdag")}
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', borderBottom: '2px solid #000', borderRight: '1px solid #000' }}>
              {t("Tijd")}
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', borderBottom: '2px solid #000', borderRight: '1px solid #000' }}>
              {t("Uren")}
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', borderBottom: '2px solid #000', borderRight: '1px solid #000' }}>
              {t("Dagen")}
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', borderBottom: '2px solid #000', borderRight: '1px solid #000' }}>
              {t("Groep")}
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', borderBottom: '2px solid #000' }}>
              {t("Totaal")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRules.map((rule, index) => {
            const hoursPerDay = rule.startTime && rule.endTime ? calculateHours(rule.startTime, rule.endTime) : 0;
            const daysInPeriod = calculateDaysInPeriod(
              schedule.startDate || "", 
              schedule.endDate || null, 
              rule.day as number
            );
            const totalHours = calculateTotalHours(rule);

            return (
              <TableRow key={index}>
                <TableCell sx={{ borderRight: '1px solid #000' }}>
                  {DAY_NAMES_NL[rule.day as keyof typeof DAY_NAMES_NL]}
                </TableCell>
                <TableCell sx={{ borderRight: '1px solid #000' }}>
                  {rule.startTime && rule.endTime 
                    ? `${formatTime(rule.startTime)} - ${formatTime(rule.endTime)}`
                    : '-'
                  }
                </TableCell>
                <TableCell sx={{ borderRight: '1px solid #000' }}>
                  {hoursPerDay.toFixed(2)}
                </TableCell>
                <TableCell sx={{ borderRight: '1px solid #000' }}>
                  {daysInPeriod}
                </TableCell>
                <TableCell sx={{ borderRight: '1px solid #000' }}>
                  {rule.groupName || '-'}
                </TableCell>
                <TableCell>
                  {totalHours.toFixed(2)}
                </TableCell>
              </TableRow>
            );
          })}
          
          {/* Total Row */}
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 'bold', borderTop: '2px solid #000', borderRight: '1px solid #000' }} colSpan={5}>
              {t("Totaal")}
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', borderTop: '2px solid #000' }}>
              {grandTotal.toFixed(2)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* Footer with timestamp */}
      <Box sx={{ mt: 3, textAlign: 'right' }}>
        <Typography variant="caption" color="text.secondary">
          {t("Geprint op")}: {dayjs().format('DD-MM-YYYY HH:mm')}
        </Typography>
      </Box>
    </Paper>
  );
};
