import { useState, useMemo } from "react";
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
import { useListChildren } from "@api/endpoints/children/children";
import { useGetPrintSchedules } from "@api/endpoints/schedules/schedules";
import { type PrintGroupWeekdayPageVM, type PrintCellVM } from "@api/models/printSchedulesVM";

type Filters = {
  month: number;
  year: number;
  groupIds: string[];
  submitted: boolean;
}

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

  // Fetch all children (paged) with large page size to map names; adjust if backend supports bulk
  const { data: childrenData } = useListChildren({ pageNumber: 1, pageSize: 100 }, { query: { staleTime: 5*60*1000 } });
  const childNameMap = useMemo(() => {
    const map: Record<string,string> = {};
    const items = (childrenData?.value ?? []) as any[];
    items.forEach(c => {
      const given = c.givenName || c.firstName || "";
      const family = c.familyName || c.lastName || "";
      const full = (given + " " + family).trim() || `Child ${c.id?.substring(0,8)}`;
      if(c.id) map[c.id] = full;
    });
    return map;
  }, [childrenData]);

  const queryParams = useMemo(() => {
    if (!filters.submitted) return undefined;
    // backend currently supports single groupId (optional) or all
    return {
      month: filters.month,
      year: filters.year,
      groupId: filters.groupIds.length === 1 ? filters.groupIds[0] : undefined,
    };
  }, [filters]);

  const { data, isFetching } = useGetPrintSchedules(queryParams, {
    query: { staleTime: 5 * 60 * 1000 },
  });

  const handleGenerate = () => setFilters((f) => ({ ...f, submitted: true }));

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Print Attendance Schedules
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <FormControl sx={{ minWidth: 140 }} size="small">
            <InputLabel id="month-label">Month</InputLabel>
            <Select
              labelId="month-label"
              value={filters.month}
              label="Month"
              onChange={(e) => setFilters((f) => ({ ...f, month: Number(e.target.value) }))}
            >
              {months.map((m) => (
                <MenuItem key={m} value={m}>
                  {dayjs().month(m - 1).format("MMMM")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel id="year-label">Year</InputLabel>
            <Select
              labelId="year-label"
              value={filters.year}
              label="Year"
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
            <InputLabel id="groups-label">Groups</InputLabel>
            <Select
              multiple
              labelId="groups-label"
              value={filters.groupIds}
              onChange={(e) => setFilters((f) => ({ ...f, groupIds: e.target.value as string[] }))}
              input={<OutlinedInput label="Groups" />}
              renderValue={(selected) =>
                selected.length === 0
                  ? "All"
                  : groups
                      .filter((g) => selected.includes(g.id!))
                      .map((g) => g.name)
                      .join(", ")
              }
            >
              <MenuItem value="__ALL__" disabled>
                All groups (select none)
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
              Generate
            </Button>
            {data && (
              <Button variant="outlined" onClick={() => window.print()}>
                Print
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {isFetching && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={20} />
          <Typography>Loading...</Typography>
        </Box>
      )}

      {data?.groups.map((group) =>
          group.pages.map((page) => (
            <PrintPage
              key={group.id + page.weekday}
              groupName={group.name}
              month={data.month}
              year={data.year}
              page={page}
              childNameMap={childNameMap}
            />
          )),
        )}
    </Box>
  );
};

const cellStyles = (cell?: PrintCellVM): React.CSSProperties => {
  if (!cell) {
    return {
      border: "1px solid #000",
      minWidth: 70,
      height: 42,
      position: "relative",
      fontSize: 11,
      padding: 2,
      textAlign: "center",
    };
  }
  const base: React.CSSProperties = {
    border: "1px solid #000",
    minWidth: 70,
    height: 42,
    position: "relative",
    fontSize: 11,
    padding: 2,
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
  childNameMap,
}: {
  groupName: string;
  month: string;
  year: number;
  page: PrintGroupWeekdayPageVM;
  childNameMap: Record<string, string>;
}) => {
  return (
    <Paper className="print-page" sx={{ p: 2, mb: 4, breakAfter: "page" }}>
      <Typography
        variant="h6"
        gutterBottom
      >{`Group ${groupName}, ${page.weekday}, ${month} ${year}`}</Typography>
      <Box
        component="table"
        sx={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed" }}
      >
        <thead>
          <tr>
            <th style={{ ...headerCellStyle, width: 180 }}>Child</th>
            {page.dates.map((d) => (
              <th key={d} style={headerCellStyle}>
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {page.children.map((ch) => (
            <tr key={ch.id}>
              <td style={{ ...nameCellStyle }}>{childNameMap[ch.id] || ch.name}</td>
              {page.dates.map((d) => {
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
  padding: 4,
  fontSize: 11,
  background: "#f5f5f5",
};
const nameCellStyle: React.CSSProperties = {
  border: "1px solid #000",
  padding: "2px 4px",
  fontSize: 11,
  fontWeight: 500,
};

const Legend = () => (
  <Box sx={{ mt: 2, fontSize: 11 }}>
    <Typography variant="subtitle2" gutterBottom>
      Legend
    </Typography>
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      <LegendItem label="Scheduled" boxStyle={{}} />
      <LegendItem label="Absence" boxStyle={{ background: "#FFE8B3" }} />
      <LegendItem
        label="Closed"
        boxStyle={{
          background: "#DDD",
          backgroundImage: "repeating-linear-gradient(45deg,#ccc,#ccc 4px,#ddd 4px,#ddd 8px)",
        }}
      />
    </Box>
  </Box>
);

const LegendItem = ({ label, boxStyle }: { label: string; boxStyle: React.CSSProperties }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Box sx={{ width: 20, height: 14, border: "1px solid #000", ...boxStyle }} />
    <Typography variant="caption">{label}</Typography>
  </Box>
);

export const Component = PrintSchedulesPage;

// Print media styles
const style = document.createElement("style");
style.innerHTML = `@media print { body { -webkit-print-color-adjust: exact; }
  .print-page { page-break-after: always; }
  @page { size: A4 landscape; margin: 10mm; }
}`;
document.head.appendChild(style);
