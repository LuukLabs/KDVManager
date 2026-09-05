import { useState } from "react";
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

const statusLabel = (status: WaitlistEntryStatus, t: (key: string) => string) =>
  ({
    Waiting: t("Waiting"),
    Offered: t("Offered"),
    Placed: t("Placed"),
    Withdrawn: t("Withdrawn"),
  })[status];

const WaitlistPage = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [includeClosed, setIncludeClosed] = useState(false);
  const queryKey = waitlistQueryKey(includeClosed);
  const { data: entries = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => listWaitlistEntries(includeClosed),
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: WaitlistEntryStatus }) =>
      updateWaitlistEntryStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["waitlist"] });
    },
    onError: () => enqueueSnackbar(t("Could not update waitlist status"), { variant: "error" }),
  });

  return (
    <ListPageLayout
      title={t("Waitlist")}
      description={t("Track childcare requests before a child is placed.")}
      action={<ListPageAddButton label={t("Add request")} to="new" />}
    >
      <Stack spacing={2}>
        <FormControlLabel
          control={
            <Switch
              checked={includeClosed}
              onChange={(event) => setIncludeClosed(event.target.checked)}
            />
          }
          label={t("Show placed and withdrawn requests")}
        />
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress aria-label={t("Loading waitlist")} />
          </Box>
        ) : entries.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3 }}>
            {t("No waitlist requests yet.")}
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small" aria-label={t("Waitlist requests")}>
              <TableHead>
                <TableRow>
                  <TableCell>{t("Child")}</TableCell>
                  <TableCell>{t("Desired start date")}</TableCell>
                  <TableCell>{t("Requested days")}</TableCell>
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
                        {entry.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("Born")}: {formatDate(entry.dateOfBirth)}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(entry.desiredStartDate)}</TableCell>
                    <TableCell>{entry.requestedDays || "–"}</TableCell>
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
                            id: entry.id,
                            status: event.target.value as WaitlistEntryStatus,
                          })
                        }
                        inputProps={{ "aria-label": t("Status for {{name}}", { name: entry.fullName }) }}
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
