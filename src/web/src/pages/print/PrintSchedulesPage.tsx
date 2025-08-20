import { useState, useMemo } from "react";
// PDF libs (lazy loaded when user clicks PDF)
// We will dynamic import to avoid adding to initial bundle
import { useTranslation } from "react-i18next";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import dayjs from "dayjs";
import { useListGroups } from "@api/endpoints/groups/groups";
// import { useListChildren } from "@api/endpoints/children/children";
import { useGetPrintSchedules } from "@api/endpoints/schedules/schedules";
import type { PrintGroupWeekdayPageVM } from "@api/models/printGroupWeekdayPageVM";
import type { PrintCellVM } from "@api/models/printCellVM";

type Filters = {
  month: number;
  year: number;
  groupIds: string[];
  submitted: boolean;
};

const currentYear = dayjs().year();
const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
const months = Array.from({ length: 12 }, (_, i) => i + 1);

export const PrintSchedulesPage = () => {
  const { data: groupsData } = useListGroups();
  const groups = groupsData?.value ?? [];

  const [filters, setFilters] = useState<Filters>({
    month: dayjs().month() + 1,
    year: currentYear,
    groupIds: [],
    submitted: false,
  });

  const { t } = useTranslation();

  const queryParams = useMemo(() => {
    if (!filters.submitted) return undefined;
    return {
      month: filters.month,
      year: filters.year,
      // new multi-select support (backend will also accept single groupId for backward compatibility)
      groupIds: filters.groupIds.length ? filters.groupIds : undefined,
    } as any; // cast until regenerated typings
  }, [filters]);

  const { data, isFetching } = useGetPrintSchedules(queryParams, {
    query: { staleTime: 5 * 60 * 1000 },
  });

  const handleGenerate = () => setFilters((f) => ({ ...f, submitted: true }));

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 2, mb: 3 }} className="print-controls">
        <Typography variant="h5" gutterBottom>
          {t("Print Attendance Schedules")}
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <FormControl sx={{ minWidth: 140 }} size="small">
            <InputLabel id="month-label">{t("Month")}</InputLabel>
            <Select
              labelId="month-label"
              value={filters.month}
              label={t("Month")}
              onChange={(e) => setFilters((f) => ({ ...f, month: Number(e.target.value) }))}
            >
              {months.map((m) => (
                <MenuItem key={m} value={m}>
                  {dayjs()
                    .month(m - 1)
                    .format("MMMM")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel id="year-label">{t("Year")}</InputLabel>
            <Select
              labelId="year-label"
              value={filters.year}
              label={t("Year")}
              onChange={(e) => setFilters((f) => ({ ...f, year: Number(e.target.value) }))}
            >
              {years.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 240 }} size="small">
            <InputLabel id="groups-label">{t("Groups")}</InputLabel>
            <Select
              multiple
              labelId="groups-label"
              value={filters.groupIds}
              onChange={(e) => setFilters((f) => ({ ...f, groupIds: e.target.value as string[] }))}
              input={<OutlinedInput label={t("Groups")} />}
              renderValue={(selected) =>
                selected.length === 0
                  ? t("All")
                  : groups
                      .filter((g) => selected.includes(g.id!))
                      .map((g) => g.name)
                      .join(", ")
              }
            >
              <MenuItem value="__ALL__" disabled>
                {t("All groups (select none)")}
              </MenuItem>
              {groups.map((g) => (
                <MenuItem key={g.id} value={g.id!}>
                  <Checkbox checked={filters.groupIds.includes(g.id!)} />
                  <ListItemText primary={g.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={handleGenerate}>
              {t("Generate")}
            </Button>
            {data && (
              <>
                <Button variant="outlined" onClick={() => window.print()}>
                  {t("Print")}
                </Button>
              </>
            )}
          </Stack>
        </Stack>
      </Paper>

      {isFetching && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={20} />
          <Typography>{t("Loading...")}</Typography>
        </Box>
      )}

      <Box className="print-container" sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {(data?.groups ?? []).map((group: any) =>
          (group.pages ?? []).map((page: PrintGroupWeekdayPageVM) => (
            <PrintPage
              key={group.id + page.weekday}
              groupName={group.name}
              month={data.month}
              year={data.year}
              page={page}
            />
          )),
        )}
      </Box>
    </Box>
  );
};

const cellStyles = (cell?: PrintCellVM): React.CSSProperties => {
  if (!cell) {
    return {
      border: "1px solid #000",
      minWidth: 70,
      height: 34,
      position: "relative",
      fontSize: 11,
      padding: 1,
      textAlign: "center",
      background: "#000",
      color: "#fff",
    };
  }
  const base: React.CSSProperties = {
    border: "1px solid #000",
    minWidth: 70,
    height: 34,
    position: "relative",
    fontSize: 10,
    padding: 1,
    textAlign: "center",
  };
  switch (cell.status) {
    case "absence":
      return { ...base, background: "#FFE8B3" };
    case "closed":
      return {
        ...base,
        background: "#DDD",
        backgroundImage: "repeating-linear-gradient(45deg,#ccc,#ccc 4px,#ddd 4px,#ddd 8px)",
      };
    default:
      return base;
  }
};

const PrintPage = ({
  groupName,
  month,
  year,
  page,
}: {
  groupName: string;
  month: string;
  year: number;
  page: PrintGroupWeekdayPageVM;
}) => {
  const { t } = useTranslation();
  const dates: string[] = page.dates ?? [];
  const children = page.children ?? [];
  // Convert weekday (number or string) to localized day name
  let weekdayLabel = page.weekday;
  if (typeof weekdayLabel === "number") {
    // DayOfWeek: 0=Sunday, 1=Monday, ...
    weekdayLabel = dayjs().day(page.weekday).format("dddd");
  } else if (typeof weekdayLabel === "string" && !isNaN(Number(weekdayLabel))) {
    weekdayLabel = dayjs().day(Number(page.weekday)).format("dddd");
  }
  weekdayLabel = t(weekdayLabel);

  return (
    <Paper className="print-page" sx={{ p: 1.5, mb: 3, breakAfter: "page" }}>
      <Typography variant="h6" gutterBottom>
        {t("{{groupName}}, {{weekday}}, {{month}} {{year}}", {
          groupName,
          weekday: weekdayLabel,
          month,
          year,
        })}
      </Typography>
      <Box
        component="table"
        sx={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed" }}
      >
        <thead>
          <tr>
            <th style={{ ...headerCellStyle, width: 160 }}>{t("Child")}</th>
            {dates.map((d: string) => (
              <th key={d} style={headerCellStyle}>
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children.map((ch: any) => (
            <tr key={ch.id}>
              <td style={{ ...nameCellStyle }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <span>
                    {ch.givenName || ch.familyName
                      ? `${ch.givenName ?? ""} ${ch.familyName ?? ""}`.trim()
                      : (ch.name ?? t("Child") + ` ${ch.id?.substring(0, 8)}`)}
                  </span>
                  {ch.dateOfBirth && (
                    <span style={{ fontSize: 9, opacity: 0.75 }}>
                      {dayjs(ch.dateOfBirth).format("DD-MM-YYYY")}
                    </span>
                  )}
                </div>
              </td>
              {dates.map((d: string) => {
                const key = d.split("T")[0];
                const cell = ch.schedule ? ch.schedule[key] : undefined;
                const showTime = cell?.startTime && cell.endTime;
                return (
                  <td key={d} style={cellStyles(cell)}>
                    {showTime ? `${cell!.startTime}-${cell!.endTime}` : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </Box>
      <Legend />
    </Paper>
  );
};

const headerCellStyle: React.CSSProperties = {
  border: "1px solid #000",
  padding: 3,
  fontSize: 10,
  background: "#f5f5f5",
};
const nameCellStyle: React.CSSProperties = {
  border: "1px solid #000",
  padding: "2px 3px",
  fontSize: 10,
  fontWeight: 500,
};

const Legend = () => {
  const { t } = useTranslation();
  return (
    <Box sx={{ mt: 2, fontSize: 11 }}>
      <Typography variant="subtitle2" gutterBottom>
        {t("Legend")}
      </Typography>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <LegendItem label={t("Scheduled")} boxStyle={{}} />
        <LegendItem label={t("Absence")} boxStyle={{ background: "#FFE8B3" }} />
        <LegendItem
          label={t("Closed")}
          boxStyle={{
            background: "#DDD",
            backgroundImage: "repeating-linear-gradient(45deg,#ccc,#ccc 4px,#ddd 4px,#ddd 8px)",
          }}
        />
        <LegendItem label={t("No planning")} boxStyle={{ background: "#000", color: "#fff" }} />
      </Box>
    </Box>
  );
};

const LegendItem = ({ label, boxStyle }: { label: string; boxStyle: React.CSSProperties }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Box sx={{ width: 20, height: 14, border: "1px solid #000", ...boxStyle }} />
    <Typography variant="caption">{label}</Typography>
  </Box>
);

export const Component = PrintSchedulesPage;

// Print media styles
const style = document.createElement("style");
style.innerHTML = `@media print { 
  body { -webkit-print-color-adjust: exact; background:#fff; }
  .app-header, header, nav, .MuiAppBar-root, .app-navbar, .app-breadcrumbs, .print-controls { display: none !important; }
  .print-page { page-break-after: always; box-shadow:none !important; }
  .print-page { padding:4mm !important; }
  .print-page table th, .print-page table td { line-height:1.05; }
  @page { size: A4 portrait; margin: 6mm 8mm; }
}`;
document.head.appendChild(style);
