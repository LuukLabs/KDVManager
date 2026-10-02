import { ApiError } from "@api/errors/types";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import { statusLabel, weekdayOptions, careTypeLabel } from "@features/waitlist/waitlist.labels";
import type { WaitlistFilters, WaitlistEntry } from "@features/waitlist/waitlist.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { ListPageAddButton, ListPageLayout } from "@components/layout/ListPageLayout";
import { formatDate } from "@utils/formatDate";
import {
  listWaitlistEntries,
  updateWaitlistEntryStatus,
  waitlistQueryKey,
} from "@features/waitlist/waitlist.api";
import { waitlistStatuses, type WaitlistEntryStatus } from "@features/waitlist/waitlist.types";

const WaitlistPage = () => {
  const { t, i18n } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<WaitlistFilters>({
    includeClosed: false,
    location: "",
    startMonth: "",
    status: "",
  });
  const [locationInput, setLocationInput] = useState("");
  const {
    data: entries = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: waitlistQueryKey(filters),
    queryFn: () => listWaitlistEntries(filters),
  });
  const updateStatus = useMutation({
    mutationFn: ({ entry, status }: { entry: WaitlistEntry; status: WaitlistEntryStatus }) =>
      updateWaitlistEntryStatus(entry.id, status, entry.revision),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["waitlist"] });
      void queryClient.invalidateQueries({ queryKey: ["waitlist-entry"] });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey: ["waitlist"] });
        enqueueSnackbar(
          t("This request was changed by another planner. The list has been refreshed."),
          { variant: "warning" },
        );
      } else {
        enqueueSnackbar(t("Could not update waitlist status"), { variant: "error" });
      }
    },
  });

  return (
    <ListPageLayout
      title={t("Waitlist")}
      description={t("Track childcare requests before a child is placed.")}
      action={<ListPageAddButton label={t("Add request")} to="new" />}
    >
      <Stack spacing={2}>
        <Alert severity="info">
          {t(
            "Offers needing follow-up come first, then priority (highest first), then registration date. Preferences require a manual availability check.",
          )}
        </Alert>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            label={t("Preferred location")}
            value={locationInput}
            onChange={(event) => setLocationInput(event.target.value)}
          />
          <Button onClick={() => setFilters({ ...filters, location: locationInput.trim() })}>
            {t("Filter location")}
          </Button>
          <TextField
            label={t("Start month")}
            type="month"
            value={filters.startMonth}
            slotProps={{ inputLabel: { shrink: true } }}
            onChange={(event) => setFilters({ ...filters, startMonth: event.target.value })}
          />
          <TextField
            select
            label={t("Status")}
            value={filters.status}
            sx={{ minWidth: 150 }}
            onChange={(event) =>
              setFilters({ ...filters, status: event.target.value as WaitlistEntryStatus | "" })
            }
          >
            <MenuItem value="">{t("All statuses")}</MenuItem>
            {waitlistStatuses.map((status) => (
              <MenuItem key={status} value={status}>
                {statusLabel(status, t)}
              </MenuItem>
            ))}
          </TextField>
          <Button
            onClick={() => {
              setLocationInput("");
              setFilters({ includeClosed: false, location: "", startMonth: "", status: "" });
            }}
          >
            {t("Clear filters")}
          </Button>
        </Stack>
        <FormControlLabel
          control={
            <Switch
              checked={filters.includeClosed}
              disabled={!!filters.status}
              onChange={(event) => setFilters({ ...filters, includeClosed: event.target.checked })}
            />
          }
          label={t("Show placed and withdrawn requests")}
        />
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress aria-label={t("Loading waitlist")} />
          </Box>
        ) : isError ? (
          <Alert severity="error">{t("Could not load waitlist. Please try again.")}</Alert>
        ) : entries.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3 }}>
            {t("No requests match these filters.")}
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small" aria-label={t("Waitlist requests")}>
              <TableHead>
                <TableRow>
                  <TableCell>{t("Child")}</TableCell>
                  <TableCell>{t("Desired start date")}</TableCell>
                  <TableCell>{t("Requested days")}</TableCell>
                  <TableCell>{t("Placement preferences")}</TableCell>
                  <TableCell>{t("Priority")}</TableCell>
                  <TableCell>{t("Contact")}</TableCell>
                  <TableCell>{t("Registered")}</TableCell>
                  <TableCell>{t("Status")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        <Link component={RouterLink} to={entry.id}>
                          {entry.fullName}
                        </Link>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("Born")}: {formatDate(entry.dateOfBirth)}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(entry.desiredStartDate)}</TableCell>
                    <TableCell>
                      {entry.weekdays.length > 0
                        ? new Intl.ListFormat(i18n.resolvedLanguage, { style: "short" }).format(
                            weekdayOptions(t)
                              .filter((day) => entry.weekdays.includes(day.id))
                              .map((day) => day.label),
                          )
                        : (entry.requestedDays ?? "–")}
                      {entry.startTime && entry.endTime && (
                        <Typography variant="caption" sx={{ display: "block" }}>
                          {entry.startTime.slice(0, 5)}–{entry.endTime.slice(0, 5)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {entry.location ?? t("Not specified")}
                      </Typography>
                      <Typography variant="caption">
                        {entry.careType ? careTypeLabel(entry.careType, t) : ""}
                        {entry.preferredGroup ? ` · ${entry.preferredGroup}` : ""}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {entry.priority}
                        {entry.priorityReason ? ` · ${entry.priorityReason}` : ""}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {entry.priorityExplanation}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{entry.contactName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {entry.contactEmail}
                        {entry.contactPhone ? ` · ${entry.contactPhone}` : ""}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(entry.registeredAt)}</TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={entry.status}
                        disabled={updateStatus.isPending}
                        onChange={(event) =>
                          updateStatus.mutate({
                            entry,
                            status: event.target.value as WaitlistEntryStatus,
                          })
                        }
                        inputProps={{
                          "aria-label": t("Status for {{name}}", { name: entry.fullName }),
                        }}
                      >
                        {waitlistStatuses.map((status) => (
                          <MenuItem key={status} value={status}>
                            {statusLabel(status, t)}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>
    </ListPageLayout>
  );
};

export const Component = WaitlistPage;
