import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { AccessTime, ChildCare, Gavel, SupervisorAccount } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import { type TimeBlockSummary } from "@api/scheduling/models/timeBlockSummary";
import { type BkrAppliedRule } from "@api/scheduling/models/bkrAppliedRule";
import { BkrProfessionalsBasis } from "@api/scheduling/models/bkrProfessionalsBasis";

type TimeBlockDetailsDialogProps = {
  timeBlock: TimeBlockSummary | null;
  onClose: () => void;
};

const BasisExplanation = ({ timeBlock }: { timeBlock: TimeBlockSummary }) => {
  const { t } = useTranslation();
  const { bkr } = timeBlock;
  const rule = bkr.appliedRule;

  if (!bkr.hasSolution) {
    return (
      <Alert severity="error" icon={<SupervisorAccount />}>
        {t(
          "No valid staffing ratio exists for this group composition. The group likely exceeds the maximum group size for these ages.",
        )}
      </Alert>
    );
  }

  switch (bkr.basis) {
    case BkrProfessionalsBasis.GroupSizeMinimum:
      return (
        <Alert severity="info">
          {t(
            "Determined by the group-size minimum: a group of this composition requires at least {{count}} supervisor(s) and the age ratios do not require more.",
            { count: rule?.minProfessionals ?? timeBlock.requiredProfessionals },
          )}
        </Alert>
      );
    case BkrProfessionalsBasis.RatioCalculation:
      return (
        <Alert severity="info">
          {t(
            "Determined by the age ratios: the ages of the children require {{count}} supervisor(s), more than the group-size minimum of {{min}}.",
            { count: timeBlock.requiredProfessionals, min: rule?.minProfessionals },
          )}
        </Alert>
      );
    case BkrProfessionalsBasis.OneChildLessSafeguard:
      return (
        <Alert severity="warning">
          {t(
            "Safeguard applied: with one child fewer, the rules would require more supervisors, so one extra supervisor is added.",
          )}
        </Alert>
      );
    default:
      return (
        <Alert severity="info">
          {t("No children in this time block, so no supervisors are required.")}
        </Alert>
      );
  }
};

const AppliedRuleDetails = ({ rule }: { rule: BkrAppliedRule }) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        mt: 2,
        p: 1.5,
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "grey.50",
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1, color: "text.secondary" }}
      >
        <Gavel sx={{ fontSize: 16 }} />
        {t("Applied BKR rule")}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography variant="body2">
          {t("Age composition {{from}} up to {{to}} years", { from: rule.minAge, to: rule.maxAge })}
        </Typography>
        <Typography variant="body2">
          {t("At most {{count}} children in the group", { count: rule.maxChildren })}
        </Typography>
        <Typography variant="body2">
          {t("At least {{count}} supervisor(s) for this group size", {
            count: rule.minProfessionals,
          })}
        </Typography>
        {rule.constraints.map((constraint, index) => (
          <Typography key={index} variant="body2">
            {t("At most {{count}} of the children aged {{from}} up to {{to}} years", {
              count: constraint.maxChildren,
              from: constraint.minAge,
              to: constraint.maxAge,
            })}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

// "07:30:00" -> "07:30"
const formatTime = (time: string) => time.slice(0, 5);

const TimeBlockDetailsDialog = ({ timeBlock, onClose }: TimeBlockDetailsDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={!!timeBlock}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            boxShadow: 3,
          },
        },
      }}
    >
      {timeBlock && (
        <>
          <DialogTitle
            sx={{
              textAlign: "center",
              pb: 1.5,
              background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
              color: "white",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
              <AccessTime />
              {timeBlock.timeSlotName}
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.85, fontFamily: "monospace" }}>
              {formatTime(timeBlock.startTime)} – {formatTime(timeBlock.endTime)}
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ px: 3, pt: 2, pb: 3 }}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                <Chip
                  icon={<ChildCare />}
                  label={`${timeBlock.totalChildren} ${t("children")}`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<SupervisorAccount />}
                  label={
                    timeBlock.requiredProfessionals != null
                      ? `${timeBlock.requiredProfessionals} ${t("supervisors needed")}`
                      : t("Ratio requirement cannot be met")
                  }
                  color={timeBlock.requiredProfessionals != null ? "secondary" : "error"}
                  variant="outlined"
                />
              </Box>

              <BasisExplanation timeBlock={timeBlock} />
            </Box>

            <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 1 }}>
              {t("Age Group Distribution")}
            </Typography>

            <Table size="small" sx={{ border: "1px solid", borderColor: "divider" }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 600 }}>{t("Age Group")}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {t("Count")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timeBlock.ageGroups?.map((ageGroup, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "&:hover": { backgroundColor: "grey.50" },
                      "&:last-child td": { border: 0 },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <ChildCare sx={{ fontSize: 16, color: "primary.main" }} />
                        {t(ageGroup.ageRange ?? "")}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={ageGroup.childCount}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600, minWidth: 40 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {timeBlock.bkr.appliedRule && <AppliedRuleDetails rule={timeBlock.bkr.appliedRule} />}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5, pt: 0 }}>
            <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
              {t("Close")}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default TimeBlockDetailsDialog;
