import { useId, type ReactNode } from "react";
import { Box, Paper, Typography, Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { type Dayjs } from "dayjs";
import ChildCard from "./ChildCard";
import GroupSummary from "./GroupSummary";
import type { DagdeelRow, GroupBoard } from "@features/attendance/types";

type GroupColumnProps = {
  board: GroupBoard;
  selectedDate: Dayjs;
  isClosed?: boolean;
  isLoading?: boolean;
  /**
   * Renders per-row controls into each card's action slot. Unused today, which
   * is what keeps the board read-only; a presence control arrives through here.
   */
  renderRowActions?: (row: DagdeelRow) => ReactNode;
};

const RosterSkeleton = () => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
    {[0, 1, 2, 3].map((i) => (
      <Skeleton key={i} variant="rounded" animation="wave" height={54} />
    ))}
  </Box>
);

const GroupColumn = ({
  board,
  selectedDate,
  isClosed = false,
  isLoading = false,
  renderRowActions,
}: GroupColumnProps) => {
  const { t } = useTranslation();
  const headingId = useId();

  return (
    <Paper
      variant="outlined"
      component="section"
      aria-labelledby={headingId}
      sx={{
        p: 1.5,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        maxHeight: "100%",
      }}
    >
      {/* Sticky so the group name survives scrolling to child fifteen. */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          backgroundColor: "background.paper",
          pb: 1,
          mb: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography id={headingId} component="h2" variant="h6" sx={{ color: "text.primary" }}>
          {board.groupName}
        </Typography>
      </Box>

      {/* The BKR summary is about who is expected, which a closure makes moot. */}
      {!isClosed && (
        <GroupSummary
          groupId={board.groupId}
          selectedDate={selectedDate}
          absentCount={board.countsByStatus.reportedAbsent}
        />
      )}

      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        {isLoading ? (
          <RosterSkeleton />
        ) : board.rows.length > 0 ? (
          <Box
            component="ul"
            sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1 }}
          >
            {board.rows.map((row) => (
              <Box component="li" key={row.key}>
                <ChildCard row={row} actions={renderRowActions?.(row)} />
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: "text.secondary", py: 1 }}>
            {t("No schedules for this date")}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default GroupColumn;
