import { useState } from "react";
import Button from "@mui/material/Button";
import { ApiError } from "@api/errors/types";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { FormPageLayout } from "@components/layout/FormPageLayout";
import { WaitlistEntryForm } from "@features/waitlist/WaitlistEntryForm";
import {
  getWaitlistEntry,
  updateWaitlistEntry,
  waitlistEntryQueryKey,
} from "@features/waitlist/waitlist.api";
import { statusLabel } from "@features/waitlist/waitlist.labels";
import type { CreateWaitlistEntry } from "@features/waitlist/waitlist.types";

const WaitlistEntryPage = () => {
  const { id = "" } = useParams();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [conflict, setConflict] = useState(false);
  const {
    data: entry,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: waitlistEntryQueryKey(id),
    queryFn: () => getWaitlistEntry(id),
    refetchOnWindowFocus: false,
  });
  const handleSubmit = async (values: CreateWaitlistEntry) => {
    try {
      await updateWaitlistEntry(id, values, entry!.revision);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setConflict(true);
        throw new Error(
          t("This request was changed by another planner. Reload it before saving again."),
          { cause: error },
        );
      }
      throw error;
    }
    setConflict(false);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["waitlist"] }),
      queryClient.invalidateQueries({ queryKey: waitlistEntryQueryKey(id) }),
    ]);
    enqueueSnackbar(t("Request saved"), { variant: "success" });
  };
  return (
    <FormPageLayout title={entry?.fullName ?? t("Waitlist request")}>
      {isLoading ? (
        <CircularProgress aria-label={t("Loading waitlist")} />
      ) : isError || !entry ? (
        <Alert severity="error">{t("Could not load waitlist request")}</Alert>
      ) : (
        <Stack spacing={3}>
          {conflict && (
            <Button
              onClick={async () => {
                const result = await refetch();
                if (!result.isError) setConflict(false);
              }}
            >
              {t("Reload request and discard unsaved changes")}
            </Button>
          )}
          <WaitlistEntryForm key={entry.revision} entry={entry} onSubmit={handleSubmit} />
          <Typography variant="h6">{t("Status history")}</Typography>
          {entry.statusHistory.length === 0 ? (
            <Typography color="text.secondary">
              {t("No recorded status changes. Earlier changes are not available.")}
            </Typography>
          ) : (
            entry.statusHistory.map((change, index) => (
              <Typography key={index}>
                {statusLabel(change.previousStatus, t)} → {statusLabel(change.status, t)}
                <br />
                {t("Changed by {{actor}} on {{date}}", {
                  actor: change.changedBy,
                  date: new Date(change.changedAt).toLocaleString(),
                })}
              </Typography>
            ))
          )}
        </Stack>
      )}
    </FormPageLayout>
  );
};
export const Component = WaitlistEntryPage;
