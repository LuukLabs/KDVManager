import Alert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import { FormPageLayout } from "@components/layout/FormPageLayout";
import { WaitlistEntryForm } from "@features/waitlist/WaitlistEntryForm";
import {
  createWaitlistEntry,
  waitlistQueryKey,
} from "@features/waitlist/waitlist.api";
import type { CreateWaitlistEntry } from "@features/waitlist/waitlist.types";

const NewWaitlistEntryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (entry: CreateWaitlistEntry) => {
    await createWaitlistEntry(entry);
    void queryClient.invalidateQueries({ queryKey: waitlistQueryKey(false) });
    enqueueSnackbar(t("Added to waitlist"), { variant: "success" });
    navigate("/waitlist");
  };

  return (
    <FormPageLayout title={t("Add waitlist request")}>
      <Alert severity="info" sx={{ mb: 3 }}>
        {t("A waitlist request is not a placement. Review availability before marking a child as placed.")}
      </Alert>
      <WaitlistEntryForm onSubmit={handleSubmit} />
    </FormPageLayout>
  );
};

export const Component = NewWaitlistEntryPage;
