import type { ReactNode } from "react";
import { Card, Typography, Box, Avatar, CardActionArea, Chip, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getCategoricalColor } from "@lib/categoricalColor";
import type { DagdeelRow, DagdeelStatus } from "@features/attendance/types";

type ChildCardProps = {
  row: DagdeelRow;
  /**
   * Opens the child's dossier. Bound to the identity block only — never to the
   * whole card, so `actions` can hold real controls without nesting a button
   * inside a button.
   */
  onOpenChild?: (childId: string) => void;
  /**
   * Rendered as a sibling of the action area. Undefined today: the board is
   * read-only until attendance lands, and this is where its check-in control
   * goes.
   */
  actions?: ReactNode;
};

/** Which statuses are worth a chip. `expected` is the unremarkable case. */
const STATUS_LABEL: Record<DagdeelStatus, string | null> = {
  expected: null,
  // Stated once in the page header, so a per-row chip would only repeat it N times.
  closed: null,
  reportedAbsent: "Reported absent",
  arrived: "Arrived",
  departed: "Picked up",
  noShow: "Did not arrive",
};

const formatTime = (time: string) => (time ? time.slice(0, 5) : "");

/** Age · time slot · reason. A separator is punctuation, not copy. */
const joinDetails = (parts: (string | null | undefined)[]) =>
  // eslint-disable-next-line i18next/no-literal-string
  parts.filter((part): part is string => !!part).join(" · ");

/** "Jane Doe" → "JD"; a single name → its initial; nothing → "?". */
const getInitials = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
};

const ChildCard = ({ row, onOpenChild, actions }: ChildCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();

  const fullName = row.childFullName || t("Unknown Child");
  const statusColor = theme.customColors.status[row.status];
  const statusLabel = STATUS_LABEL[row.status];
  const isMuted = row.status === "reportedAbsent" || row.status === "closed";

  // Consistent color based on child ID (shared hash, see lib/categoricalColor).
  const avatarColor = getCategoricalColor(row.childId, theme);

  const handleOpen = () => {
    if (onOpenChild) {
      onOpenChild(row.childId);
      return;
    }
    navigate(`/children/${row.childId}`);
  };

  // The planned window is what was agreed, the actual window what happened.
  // Until attendance exists, only the planned pair is ever present.
  const hasActual = !!row.actualStart;

  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: "4px solid",
        borderLeftColor: statusColor,
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
        <CardActionArea
          onClick={handleOpen}
          aria-label={t("Open the record of {{name}}", { name: fullName })}
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            gap: 1,
            flex: "1 1 11rem",
            width: "auto",
            minWidth: 0,
            p: 1,
            "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.06) },
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: avatarColor,
              color: theme.palette.getContrastText(avatarColor),
              fontSize: "0.85rem",
              fontWeight: "bold",
              flexShrink: 0,
            }}
          >
            {getInitials(fullName)}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            {/* A child's name is a label, not a section heading — MUI maps
                subtitle2 to <h6>, which would put forty flat headings into the
                document outline on a full day. */}
            <Typography
              component="p"
              variant="subtitle2"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                lineHeight: 1.25,
                color: isMuted ? "text.secondary" : "text.primary",
              }}
            >
              {fullName}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8125rem" }}>
              {joinDetails([
                typeof row.age === "number" ? t("{{age}} year", { age: row.age }) : t("N/A"),
                row.timeSlotName === "" ? t("No time slot") : row.timeSlotName,
                row.absenceReason,
              ])}
            </Typography>
          </Box>
        </CardActionArea>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            flexWrap: "wrap",
            justifyContent: "flex-end",
            pr: 1,
            py: 0.5,
          }}
        >
          <Box sx={{ textAlign: "right" }}>
            {hasActual && (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  color: statusColor,
                  lineHeight: 1.3,
                  whiteSpace: "nowrap",
                }}
              >
                {formatTime(row.actualStart ?? "")}
                {row.actualEnd ? ` – ${formatTime(row.actualEnd)}` : ""}
              </Typography>
            )}
            <Typography
              variant="body2"
              sx={{
                fontVariantNumeric: "tabular-nums",
                fontSize: "0.8125rem",
                color: hasActual || isMuted ? "text.secondary" : "text.primary",
                lineHeight: 1.3,
                whiteSpace: "nowrap",
              }}
            >
              {formatTime(row.plannedStart)}
              {" – "}
              {formatTime(row.plannedEnd)}
            </Typography>
          </Box>

          {statusLabel && (
            <Chip
              label={t(statusLabel)}
              size="small"
              variant="outlined"
              sx={{
                color: statusColor,
                borderColor: alpha(statusColor, 0.5),
                fontSize: "0.8125rem",
                height: 24,
              }}
            />
          )}

          {actions}
        </Box>
      </Box>
    </Card>
  );
};

export default ChildCard;
