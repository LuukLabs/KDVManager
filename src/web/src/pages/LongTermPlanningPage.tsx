import React from "react";
const PALETTE = { error: "error.main", warn: "warning.main", success: "success.main" } as const; // palette tokens (not user-facing)
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Tooltip,
  Chip,
  Stack,
  Divider,
  FormControlLabel,
  Switch,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import BlockIcon from "@mui/icons-material/Block";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useListGroups } from "@api/endpoints/groups/groups";
import { useGetLongTermPlanning } from "@api/endpoints/schedules/schedules";
import type { PlanningDayVM } from "@api/models/planningDayVM";
import type { PlanningTimeBlockVM } from "@api/models/planningTimeBlockVM";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

// Remove local heuristic; backend provides enriched metrics (capacity/spots) optionally.
type AggregatedDay = PlanningDayVM & { timeBlocks: PlanningTimeBlockVM[] };

type DayStats = {
  date: string;
  maxUtilization: number;
  anyUnsolvable: boolean;
  addableNow: number;
  addablePlusOne: number;
};

const RANGE_DAYS = 28; // 4 week horizon

const LongTermPlanningPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStart = searchParams.get("startDate") ? dayjs(searchParams.get("startDate")) : dayjs().startOf("week");
  const initialGroup = searchParams.get("groupId") ?? "";
  const initialView = (searchParams.get("view") as "current" | "with-supervisor") ?? "current";
  const initialShowAges = searchParams.get("age") === "1";

  const [startDate, setStartDate] = React.useState(dayjs(initialStart));
  const [groupId, setGroupId] = React.useState<string>(initialGroup);
  const [viewMode, setViewMode] = React.useState<"current" | "with-supervisor">(initialView);
  const [showAgeDetails, setShowAgeDetails] = React.useState<boolean>(initialShowAges);
  const [selectedDay, setSelectedDay] = React.useState<string | null>(null);

  const { data: groups } = useListGroups(undefined, {});

  // Persist to URL when filters change
  React.useEffect(() => {
    const params: Record<string, string> = {
      startDate: startDate.format("YYYY-MM-DD"),
      view: viewMode,
    };
    if (groupId) params.groupId = groupId;
    if (showAgeDetails) params.age = "1"; else if (searchParams.get("age")) params.age = "0"; // explicit 0 clears toggle for sharing link
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, groupId, viewMode, showAgeDetails]);
  const planningQuery = useGetLongTermPlanning({
    ...(groupId ? { groupId } : {}),
    startDate: startDate.format("YYYY-MM-DD"),
    days: RANGE_DAYS,
  });

  const loading = planningQuery.isLoading;

  const days: AggregatedDay[] = React.useMemo(() => {
    const raw = planningQuery.data?.daysData ?? [];
    return raw.map((d) => ({
      ...d,
      timeBlocks: (d.timeBlocks ?? []).map((tb) => ({
        ...tb,
        // Fallbacks if backend not yet sending these optional fields (defensive):
        capacityCurrent: tb.capacityCurrent ?? tb.totalChildren,
        capacityWithExtraSupervisor:
          tb.capacityWithExtraSupervisor ??
          tb.totalChildren +
            Math.round(tb.totalChildren / Math.max(tb.requiredProfessionals || 1, 1)),
        spotsCurrent: tb.spotsCurrent ?? 0,
        spotsWithExtraSupervisor:
          tb.spotsWithExtraSupervisor ?? (tb.capacityWithExtraSupervisor ?? 0) - tb.totalChildren,
      })),
    }));
  }, [planningQuery.data]);

  // Ensure a selected day (default first loaded day)
  React.useEffect(() => {
    if (!selectedDay && days.length > 0) {
      setSelectedDay(days[0].date);
    }
  }, [days, selectedDay]);

  const dayStats: DayStats[] = React.useMemo(() => {
    return days.map((d) => {
      let maxUtil = 0;
      let anyUnsolvable = false;
      let addableNow = 0;
      let addablePlusOne = 0;
      d.timeBlocks.forEach((tb) => {
        const capacity = viewMode === "current" ? tb.capacityCurrent : tb.capacityWithExtraSupervisor;
        const safeCapacity = capacity ?? 0;
        const util = safeCapacity > 0 ? tb.totalChildren / safeCapacity : 0;
        if (util > maxUtil) maxUtil = util;
        if (tb.originalHasSolution === false) anyUnsolvable = true;
        const ageAddOptions = tb.ageAddOptions ?? [];
        addableNow += ageAddOptions.filter((o) => o.canAddWithCurrentStaff).length;
        addablePlusOne += ageAddOptions.filter(
          (o) => !o.canAddWithCurrentStaff && o.canAddWithOneExtraStaff,
        ).length;
      });
      return { date: d.date, maxUtilization: maxUtil, anyUnsolvable, addableNow, addablePlusOne };
    });
  }, [days, viewMode]);

  const selectedDayData = React.useMemo(
    () => days.find((d) => d.date === selectedDay) ?? null,
    [days, selectedDay],
  );

  return (
    <Box display="flex" flexDirection="column" gap={2} py={2}>
      <Typography variant="h4">{t("Long Term Planning")}</Typography>
  <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
        <DatePicker
          label={t("Start Week")}
          value={startDate}
          onChange={(d) => d && setStartDate(d.startOf("week"))}
        />
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="group-select-label">{t("Group")}</InputLabel>
          <Select label={t("Group")} value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            <MenuItem value="">
              <em>{t("All Groups (aggregate later)")}</em>
            </MenuItem>
            {groups?.value?.map((g) => (
              <MenuItem key={g.id} value={g.id}>
                {g.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <ToggleButtonGroup
          exclusive
          value={viewMode}
          onChange={(_, v) => v && setViewMode(v)}
          size="small"
        >
          <ToggleButton value="current">{t("Current")}</ToggleButton>
          <ToggleButton value="with-supervisor">{t("With +1 Supervisor")}</ToggleButton>
        </ToggleButtonGroup>
        <FormControlLabel
          control={<Switch size="small" checked={showAgeDetails} onChange={(e) => setShowAgeDetails(e.target.checked)} />}
          label={t("Age details")}
        />
      </Box>
      {loading && (
        <Typography variant="body2" color="text.secondary">
          {t("Loading summaries...")}
        </Typography>
      )}
      {/* Heatmap overview */}
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          {t("Overview (max utilization per day)")}
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {dayStats.map((ds) => {
            const color = ds.anyUnsolvable
              ? PALETTE.error
              : ds.maxUtilization >= 1
                ? PALETTE.error
                : ds.maxUtilization >= 0.85
                  ? PALETTE.warn
                  : PALETTE.success;
            const isSelected = ds.date === selectedDay;
            const label = dayjs(ds.date).format("ddd DD");
            const aria = [
              label,
              t("max utilization"), `${Math.round(ds.maxUtilization * 100)}%`,
              ds.anyUnsolvable ? t("unsolvable block present") : "",
              ds.addableNow ? `${ds.addableNow} ${t("age groups addable now")}` : "",
              ds.addablePlusOne ? `${ds.addablePlusOne} ${t("age groups addable with +1")}` : "",
              isSelected ? t("selected") : "",
            ].filter(Boolean).join(", ");
            return (
              <Tooltip
                key={ds.date}
                title={
                  `${label}\n${t("Max util:")} ${Math.round(ds.maxUtilization * 100)}%` +
                  (ds.anyUnsolvable ? `\n${t("Unsolvable time block present")}` : "") +
                  (ds.addableNow ? `\n${ds.addableNow} ${t("addable now")}` : "") +
                  (ds.addablePlusOne ? `\n${ds.addablePlusOne} ${t("addable with +1")}` : "")
                }
              >
                <Box
                  role="button"
                  tabIndex={0}
                  aria-label={aria}
                  onClick={() => setSelectedDay(ds.date)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedDay(ds.date);
                    }
                  }}
                  sx={{
                    position: "relative",
                    width: 62,
                    height: 62,
                    borderRadius: 1,
                    bgcolor: color,
                    color: "common.white",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    outline: isSelected ? (theme) => `2px solid ${theme.palette.primary.contrastText}` : "none",
                    boxShadow: isSelected ? 3 : 1,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {label}
                  </Typography>
                  <Typography variant="caption" sx={{ lineHeight: 1 }}>
                    {Math.round(ds.maxUtilization * 100)}%
                  </Typography>
                  <Box sx={{ position: "absolute", bottom: 2, display: "flex", gap: 0.5 }}>
                    {ds.anyUnsolvable && <BlockIcon fontSize="inherit" sx={{ fontSize: 14 }} />}
                    {ds.addableNow > 0 && <CheckCircleOutlineIcon fontSize="inherit" sx={{ fontSize: 14 }} />}
                    {ds.addablePlusOne > 0 && <AddCircleOutlineIcon fontSize="inherit" sx={{ fontSize: 14 }} />}
                  </Box>
                </Box>
              </Tooltip>
            );
          })}
          {dayStats.length === 0 && !loading && (
            <Typography variant="body2" color="text.secondary">
              {t("No data")}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Timeline for selected day */}
      <Divider />
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          {selectedDay ? dayjs(selectedDay).format("dddd DD MMMM") : t("Day timeline")}
        </Typography>
        {!selectedDayData && (
          <Typography variant="body2" color="text.secondary">
            {t("Select a day to view details")}
          </Typography>
        )}
        {selectedDayData && (
          <Paper sx={{ p: 1.5 }}>
            <Stack spacing={1}>
              {selectedDayData.timeBlocks.length === 0 && (
                <Typography variant="caption" color="text.secondary">
                  {t("No time blocks")}
                </Typography>
              )}
              {selectedDayData.timeBlocks.map((tb) => {
                const spots = viewMode === "current" ? tb.spotsCurrent : tb.spotsWithExtraSupervisor;
                const capacity = viewMode === "current" ? tb.capacityCurrent : tb.capacityWithExtraSupervisor;
                const safeCapacity = capacity ?? 0;
                const utilization = safeCapacity > 0 ? tb.totalChildren / safeCapacity : 0;
                const colorKey =
                  utilization >= 1
                    ? (t("error.main") as string)
                    : utilization >= 0.85
                      ? (t("warning.main") as string)
                      : (t("success.main") as string);
                const ageAddOptions = tb.ageAddOptions ?? [];
                const addableCurrent = ageAddOptions.filter((o) => o.canAddWithCurrentStaff).length;
                const addableWithExtra = ageAddOptions.filter(
                  (o) => !o.canAddWithCurrentStaff && o.canAddWithOneExtraStaff,
                ).length;
                const unsolvable = tb.originalHasSolution === false;
                const ageTooltipLines = ageAddOptions.map((o) => {
                  const status = o.canAddWithCurrentStaff
                    ? t("addable now")
                    : o.canAddWithOneExtraStaff
                      ? t("addable with +1")
                      : t("blocked");
                  return `${o.ageRange}: ${status}`;
                });
                const tooltip = [
                  `${tb.timeSlotName ?? `${tb.startTime}-${tb.endTime}`}`,
                  `${tb.totalChildren} ${t("children")}`,
                  `${tb.requiredProfessionals} ${t("professionals")}`,
                  unsolvable ? t("No valid staffing solution currently") : "",
                  ageTooltipLines.join(" | "),
                ]
                  .filter(Boolean)
                  .join(" \n");
                return (
                  <Tooltip key={tb.startTime + tb.endTime} title={tooltip}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box flexGrow={1}>
                        <Box component="span" sx={{ fontSize: 12 }}>
                          {tb.timeSlotName ?? `${tb.startTime}-${tb.endTime}`}
                        </Box>
                        <Box
                          component="div"
                          sx={{
                            position: "relative",
                            height: 10,
                            bgcolor: "grey.300",
                            borderRadius: 1,
                            mt: 0.5,
                          }}
                        >
                          <Box
                            sx={{
                              position: "absolute",
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: `${Math.min(utilization, 1) * 100}%`,
                              bgcolor: colorKey,
                              borderRadius: 1,
                            }}
                          />
                        </Box>
                        {showAgeDetails && (
                          <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap">
                            {unsolvable && (
                              <Chip
                                size="small"
                                icon={<BlockIcon fontSize="inherit" />}
                                label={t("unsolvable")}
                                aria-label={t("unsolvable staffing for this block")}
                                color="error"
                                variant="outlined"
                              />
                            )}
                            {addableCurrent > 0 && (
                              <Chip
                                size="small"
                                icon={<CheckCircleOutlineIcon fontSize="inherit" />}
                                label={`${addableCurrent}${t("x now")}`}
                                aria-label={t("age groups addable now", { count: addableCurrent })}
                                color="success"
                              />
                            )}
                            {addableWithExtra > 0 && (
                              <Chip
                                size="small"
                                icon={<AddCircleOutlineIcon fontSize="inherit" />}
                                label={`${addableWithExtra}${t("x +1")}`}
                                aria-label={t("age groups addable with +1 staff", { count: addableWithExtra })}
                                color="warning"
                              />
                            )}
                          </Stack>
                        )}
                      </Box>
                      <Box sx={{ fontSize: 11, textAlign: "right", minWidth: 54 }}>
                        {spots && spots > 0 ? `+${spots}` : t("Full")}
                      </Box>
                    </Box>
                  </Tooltip>
                );
              })}
            </Stack>
          </Paper>
        )}
      </Box>
      <Divider sx={{ my: 1 }} />
      <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
        <Typography variant="caption">{t("Legend:")}</Typography>
        <Chip size="small" icon={<BlockIcon fontSize="inherit" />} label={t("unsolvable")} color="error" variant="outlined" />
        <Chip size="small" icon={<CheckCircleOutlineIcon fontSize="inherit" />} label={t("1x now") + " = " + t("one age group can be added now")} color="success" />
        <Chip size="small" icon={<AddCircleOutlineIcon fontSize="inherit" />} label={t("1x +1") + " = " + t("one age group addable with +1 staff")} color="warning" />
      </Box>
      <Typography variant="caption" color="text.secondary">
        {t(
          "Backend-driven metrics. Capacity and spot calculations provided by server; client applies light fallbacks if optional fields missing.",
        )}
      </Typography>
    </Box>
  );
};

export default LongTermPlanningPage;

export const Component = LongTermPlanningPage; // for lazy routing
