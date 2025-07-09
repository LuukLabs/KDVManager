import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
  Paper,
} from "@mui/material";
import { Print as PrintIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { type ChildScheduleListVM } from "@api/models/childScheduleListVM";
import { PrintableSchedule } from "./PrintableSchedule";

type PrintScheduleDialogProps = {
  open: boolean;
  onClose: () => void;
  schedules: ChildScheduleListVM[];
  childName?: string;
};

export const PrintScheduleDialog: React.FC<PrintScheduleDialogProps> = ({
  open,
  onClose,
  schedules,
  childName,
}) => {
  const { t } = useTranslation();
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);

  const selectedSchedule = schedules.find((s) => s.id === selectedScheduleId);

  const handlePrint = () => {
    if (selectedSchedule) {
      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Schedule Print</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                background: white;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 20px 0; 
              }
              th, td { 
                border: 1px solid #000; 
                padding: 8px; 
                text-align: left; 
              }
              th { 
                background-color: #f5f5f5; 
                font-weight: bold; 
                border-bottom: 2px solid #000; 
              }
              .total-row { 
                background-color: #f5f5f5; 
                font-weight: bold; 
                border-top: 2px solid #000; 
              }
              .header { 
                margin-bottom: 20px; 
              }
              .footer { 
                margin-top: 20px; 
                text-align: right; 
                font-size: 0.8em; 
                color: #666; 
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div id="print-content"></div>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              };
            </script>
          </body>
          </html>
        `);

        // Render the printable schedule into the print window
        const printContent = printWindow.document.getElementById("print-content");
        if (printContent) {
          printContent.innerHTML = generatePrintHTML(selectedSchedule, childName);
        }
        
        printWindow.document.close();
      }
    }
  };

  const generatePrintHTML = (schedule: ChildScheduleListVM, childName?: string): string => {
    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString('nl-NL');
    };

    const formatTime = (time: string) => {
      return time.slice(0, 5);
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
      const start = new Date(`1970-01-01T${startTime}`);
      const end = new Date(`1970-01-01T${endTime}`);
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    };

    const calculateDaysInPeriod = (startDate: string, endDate: string | null, dayOfWeek: number): number => {
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      
      let count = 0;
      let current = new Date(start);
      
      // Find the first occurrence of the day of the week
      while (current.getDay() !== dayOfWeek && current < end) {
        current.setDate(current.getDate() + 1);
      }
      
      // Count all occurrences of this day in the period
      while (current <= end) {
        count++;
        current.setDate(current.getDate() + 7);
      }
      
      return count;
    };

    const sortedRules = [...(schedule.scheduleRules || [])].sort((a, b) => {
      const dayA = a.day as number;
      const dayB = b.day as number;
      return dayA - dayB;
    });

    let grandTotal = 0;
    const rows = sortedRules.map((rule) => {
      const hoursPerDay = rule.startTime && rule.endTime ? calculateHours(rule.startTime, rule.endTime) : 0;
      const daysInPeriod = calculateDaysInPeriod(
        schedule.startDate || "", 
        schedule.endDate || null, 
        rule.day as number
      );
      const totalHours = hoursPerDay * daysInPeriod;
      grandTotal += totalHours;

      return `
        <tr>
          <td>${DAY_NAMES_NL[rule.day as keyof typeof DAY_NAMES_NL]}</td>
          <td>${rule.startTime && rule.endTime 
            ? `${formatTime(rule.startTime)} - ${formatTime(rule.endTime)}`
            : '-'
          }</td>
          <td>${hoursPerDay.toFixed(2)}</td>
          <td>${daysInPeriod}</td>
          <td>${rule.groupName || '-'}</td>
          <td>${totalHours.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="header">
        ${childName ? `<h2>Schema voor ${childName}</h2>` : ''}
        <h3>Van ${formatDate(schedule.startDate || "")} t/m ${schedule.endDate ? formatDate(schedule.endDate) : 'Onbepaald'}</h3>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Weekdag</th>
            <th>Tijd</th>
            <th>Uren</th>
            <th>Dagen</th>
            <th>Groep</th>
            <th>Totaal</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr class="total-row">
            <td colspan="5"><strong>Totaal</strong></td>
            <td><strong>${grandTotal.toFixed(2)}</strong></td>
          </tr>
        </tbody>
      </table>
      
      <div class="footer">
        Geprint op: ${new Date().toLocaleString('nl-NL')}
      </div>
    `;
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleSelectSchedule = (scheduleId: string) => {
    setSelectedScheduleId(scheduleId);
    setShowPreview(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PrintIcon />
          <Typography variant="h6">{t("Print Schedule")}</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>{t("Select Schedule")}</InputLabel>
            <Select
              value={selectedScheduleId}
              onChange={(e) => handleSelectSchedule(e.target.value)}
              label={t("Select Schedule")}
            >
              {schedules.map((schedule) => (
                <MenuItem key={schedule.id} value={schedule.id}>
                  {t("Schedule")}: {new Date(schedule.startDate || "").toLocaleDateString('nl-NL')} - {" "}
                  {schedule.endDate 
                    ? new Date(schedule.endDate).toLocaleDateString('nl-NL')
                    : t("Ongoing")
                  }
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {selectedSchedule && (
          <Box>
            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handlePreview}
                disabled={showPreview}
              >
                {t("Preview")}
              </Button>
            </Box>

            {showPreview && (
              <Box>
                <Divider sx={{ mb: 2 }} />
                <Paper elevation={2} sx={{ p: 2, maxHeight: '400px', overflow: 'auto' }}>
                  <PrintableSchedule 
                    schedule={selectedSchedule} 
                    childName={childName}
                  />
                </Paper>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          {t("Cancel")}
        </Button>
        <Button
          onClick={handlePrint}
          variant="contained"
          disabled={!selectedSchedule}
          startIcon={<PrintIcon />}
        >
          {t("Print")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
