import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog, { type DialogProps } from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Today as TodayIcon } from "@mui/icons-material";
import { muiDialogV5, useModal } from "@ebay/nice-modal-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import {
  Form,
  FormDatePicker,
  FormErrorAlert,
  FormSection,
  applyServerValidationErrors,
  getServerValidationMessage,
  isoDateTransform,
  saveFailedMessage,
} from "@components/forms";
import { useGetChildById } from "@api/crm/endpoints/children/children";
import { useListGroups } from "@api/scheduling/endpoints/groups/groups";
import { useListTimeSlots } from "@api/scheduling/endpoints/time-slots/time-slots";
import {
  getGetChildSchedulesQueryKey,
  getGetSchedulesByDateQueryKey,
  useAddSchedule,
  useGetChildSchedules,
} from "@api/scheduling/endpoints/schedules/schedules";
import type { ChildScheduleListVMScheduleRule } from "@api/scheduling/models/childScheduleListVMScheduleRule";
import {
  blocksToRules,
  canonicaliseRules,
  emptyBlock,
  rulesToBlocks,
  type ScheduleFormValues,
} from "./scheduleBlocks";
import type { GroupOption, SlotOption } from "./scheduleFormUtils";
import { ScheduleBlocksField, type LookupState } from "./ScheduleBlocksField";
import { ScheduleChangeSummary } from "./ScheduleChangeSummary";
import { ScheduleStatusLine } from "./ScheduleStatusLine";
import { ScheduleWeekOverview } from "./ScheduleWeekOverview";
import { useUpdateSchedule } from "./useUpdateSchedule";

/** The server caps a page at 100; the default of 25 silently truncates. */
const LOOKUP_PAGE_SIZE = 100;
/** How far a start date may sit from today, in years. */
const START_DATE_RANGE_YEARS = 2;
const DATE_DISPLAY_FORMAT = "DD-MM-YYYY";

const TITLE_ID = "child-schedule-dialog-title";
const DESCRIPTION_ID = "child-schedule-dialog-description";

export type ScheduleToEdit = {
  id: string;
  startDate: string;
  scheduleRules: ChildScheduleListVMScheduleRule[];
};

export type ChildScheduleDialogProps =
  | { mode: "add"; childId: string; schedule?: undefined }
  | { mode: "edit"; childId: string; schedule: ScheduleToEdit };

/**
 * The one planning editor, shared by Add and Edit.
 *
 * A planning is authored as an ordered list of planningsregels, where one row is
 * `{ timeSlotId, groupId, days[] }`. On submit each row fans out to one wire
 * rule per day, so `AddScheduleCommand` and the full-replacement PUT are
 * untouched.
 *
 * Every subcomponent lives at module scope: nothing is declared in this render
 * body, which is what makes focus survive a selection.
 */
export const ChildScheduleDialog = ({ mode, childId, schedule }: ChildScheduleDialogProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const modal = useModal();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const addMutation = useAddSchedule();
  const updateMutation = useUpdateSchedule();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const errorAlertRef = useRef<HTMLDivElement | null>(null);

  const timeSlotsQuery = useListTimeSlots({ pageNumber: 1, pageSize: LOOKUP_PAGE_SIZE }, {});
  const groupsQuery = useListGroups({ pageNumber: 1, pageSize: LOOKUP_PAGE_SIZE }, {});
  const { data: child } = useGetChildById(childId);
  const childSchedulesQuery = useGetChildSchedules({ childId });

  const slots = useMemo<SlotOption[]>(
    () =>
      (timeSlotsQuery.data ?? [])
        .filter((slot) => Boolean(slot.id) && Boolean(slot.name))
        .map((slot) => ({
          id: slot.id!,
          name: slot.name!,
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
    [timeSlotsQuery.data],
  );
  const groups = useMemo<GroupOption[]>(
    () =>
      (groupsQuery.data ?? [])
        .filter((group) => Boolean(group.id) && Boolean(group.name))
        .map((group) => ({ id: group.id!, name: group.name! })),
    [groupsQuery.data],
  );

  const lookupState: LookupState =
    timeSlotsQuery.isError || groupsQuery.isError
      ? "error"
      : timeSlotsQuery.isPending || groupsQuery.isPending
        ? "pending"
        : "ready";
  const truncated =
    timeSlotsQuery.data?.length === LOOKUP_PAGE_SIZE ||
    groupsQuery.data?.length === LOOKUP_PAGE_SIZE;

  const handleRetryLookups = useCallback(() => {
    void timeSlotsQuery.refetch();
    void groupsQuery.refetch();
  }, [timeSlotsQuery, groupsQuery]);

  const defaultValues = useMemo<ScheduleFormValues>(() => {
    if (mode === "edit") {
      const blocks = rulesToBlocks(schedule.scheduleRules);
      return {
        startDate: schedule.startDate,
        blocks: blocks.length > 0 ? blocks : [emptyBlock()],
      };
    }
    return { startDate: "", blocks: [emptyBlock()] };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial values only; useForm reads them once
  }, []);

  const formContext = useForm<ScheduleFormValues>({ mode: "onChange", defaultValues });
  const {
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    getValues,
    formState: { isValid, isDirty, isSubmitting },
  } = formContext;

  // Only the three wire fields, stably sorted: that projection is what makes
  // the diff (and `isDirty`) meaningful, because the list VM also carries
  // timeSlotName/startTime/endTime/groupName.
  const initialRules = useMemo(
    () => (mode === "edit" ? canonicaliseRules(schedule.scheduleRules) : []),
    [mode, schedule],
  );

  const today = useMemo(() => dayjs().startOf("day"), []);
  const minDate = useMemo(() => today.subtract(START_DATE_RANGE_YEARS, "year"), [today]);
  const maxDate = useMemo(() => today.add(START_DATE_RANGE_YEARS, "year"), [today]);

  const startDate = useWatch({ control, name: "startDate" });
  const startDateInPast = Boolean(startDate) && dayjs(startDate).isBefore(today, "day");

  const childName = child ? `${child.givenName} ${child.familyName}` : null;

  // Add mode only: the schedule that is active today, so its rules can be
  // copied into the draft.
  const copyableRules = useMemo<ChildScheduleListVMScheduleRule[] | null>(() => {
    if (mode !== "add") return null;
    const todayIso = today.format("YYYY-MM-DD");
    const active = (childSchedulesQuery.data ?? []).find(
      (candidate) =>
        Boolean(candidate.startDate) &&
        candidate.startDate! <= todayIso &&
        (!candidate.endDate || candidate.endDate >= todayIso),
    );
    return active?.scheduleRules ?? null;
  }, [mode, today, childSchedulesQuery.data]);

  // Spec: a lone time slot or group is pre-selected, but only while the form is
  // untouched and written with `shouldDirty: false`, so a late-arriving query
  // can neither clobber a fast typist nor falsely enable submit.
  useEffect(() => {
    if (isDirty || isSubmitting) return;
    if (slots.length !== 1 && groups.length !== 1) return;
    getValues("blocks").forEach((block, index) => {
      if (slots.length === 1 && !block.timeSlotId) {
        setValue(`blocks.${index}.timeSlotId`, slots[0].id, { shouldDirty: false });
      }
      if (groups.length === 1 && !block.groupId) {
        setValue(`blocks.${index}.groupId`, groups[0].id, { shouldDirty: false });
      }
    });
  }, [slots, groups, isDirty, isSubmitting, getValues, setValue]);

  useEffect(() => {
    if (submitError) errorAlertRef.current?.scrollIntoView({ block: "nearest" });
  }, [submitError]);

  const gateClosed =
    !isDirty || lookupState !== "ready" || slots.length === 0 || groups.length === 0;
  const submitDisabled = gateClosed || !isValid || isSubmitting;

  const handleCancel = useCallback(() => {
    modal.remove();
    reset();
  }, [modal, reset]);

  // Only `open` is taken from nice-modal's helper: MUI 9 no longer consumes
  // `TransitionProps` (it would land on the DOM as a stray attribute) and it
  // ignores the helper's `onExited`, so hiding the modal would leave the
  // abandoned draft mounted and resurrect it on reopen. Remove it outright
  // instead. MUI 9 also dropped `disableEscapeKeyDown`, so the
  // while-submitting guard lives here rather than on the Dialog.
  const handleDialogClose = useCallback<NonNullable<DialogProps["onClose"]>>(
    (_event, reason) => {
      if (isSubmitting) return;
      if (reason === "backdropClick" && isDirty) return;
      modal.remove();
    },
    [isSubmitting, isDirty, modal],
  );

  const onMutateSuccess = useCallback(() => {
    // Enqueue before unmounting this NiceModal. The snackbar provider is
    // outside the dialog, but removing the dialog first made the feedback
    // unreliable in the production build.
    enqueueSnackbar(
      mode === "add" ? t("Schedule added successfully") : t("Schedule updated successfully"),
      { variant: "success" },
    );
    void queryClient.invalidateQueries({ queryKey: getGetChildSchedulesQueryKey({ childId }) });
    // The by-date overview is keyed per date, so invalidate the whole family.
    void queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === getGetSchedulesByDateQueryKey()[0],
    });
    modal.remove();
    reset();
  }, [enqueueSnackbar, mode, t, queryClient, childId, modal, reset]);

  const onMutateError = useCallback(
    (error: unknown) => {
      const handled = applyServerValidationErrors(error, setError, {
        fields: ["startDate"],
        translateTitle: (title) => t(title, title),
      });
      if (handled) return;
      setSubmitError(
        getServerValidationMessage(error, (title) => t(title, title)) ?? saveFailedMessage(t),
      );
    },
    [setError, t],
  );

  const onSubmit: SubmitHandler<ScheduleFormValues> = async (data) => {
    // Enter anywhere in the form reaches this through the hidden submit button,
    // so the gate is re-checked here rather than trusted to the button state.
    if (gateClosed || isSubmitting) return;
    setSubmitError(null);
    const scheduleRules = blocksToRules(data.blocks);
    try {
      if (mode === "edit") {
        await updateMutation.mutateAsync({
          id: schedule.id,
          data: { startDate: data.startDate, scheduleRules },
        });
      } else {
        await addMutation.mutateAsync({
          data: { childId, startDate: data.startDate, scheduleRules },
        });
      }
    } catch (error) {
      // Wrapped so a rejected mutation can never surface as an unhandled
      // promise rejection.
      onMutateError(error);
      return;
    }
    onMutateSuccess();
  };

  return (
    <Form formContext={formContext}>
      <Dialog
        open={muiDialogV5(modal).open}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        aria-labelledby={TITLE_ID}
        aria-describedby={DESCRIPTION_ID}
      >
        <DialogTitle id={TITLE_ID}>
          {mode === "add" ? t("Add Schedule") : t("Edit Schedule")}
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText id={DESCRIPTION_ID} sx={{ mb: 2 }}>
            {childName && (
              <Box component="span" sx={{ display: "block" }}>
                {t("Schedule for {{name}}", { name: childName })}
              </Box>
            )}
            <Box component="span" sx={{ display: "block" }}>
              {t("A schedule applies from a start date and repeats every week.")}
            </Box>
          </DialogContentText>

          <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
            <Stack sx={{ gap: 3 }}>
              <FormSection
                title={t("Schedule Period")}
                description={t("Select the start date for this schedule")}
                icon={<TodayIcon aria-hidden="true" />}
              >
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormDatePicker<ScheduleFormValues>
                    name="startDate"
                    label={t("Start Date")}
                    required
                    autoFocus
                    disabled={isSubmitting}
                    minDate={minDate}
                    maxDate={maxDate}
                    helperText={t("The schedule repeats every week from this date.")}
                    transform={isoDateTransform}
                    rules={{
                      required: t("This field is required", { ns: "common" }),
                      validate: (value: unknown) => {
                        if (typeof value !== "string" || value.length === 0) return true;
                        const parsed = dayjs(value);
                        if (parsed.isBefore(minDate, "day") || parsed.isAfter(maxDate, "day")) {
                          return t("Choose a start date between {{from}} and {{to}}", {
                            from: minDate.format(DATE_DISPLAY_FORMAT),
                            to: maxDate.format(DATE_DISPLAY_FORMAT),
                          });
                        }
                        return true;
                      },
                    }}
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                  {startDateInPast && (
                    <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                      {t("This start date is in the past.")}
                    </Typography>
                  )}
                </Grid>
              </FormSection>

              <ScheduleBlocksField
                mode={mode}
                slots={slots}
                groups={groups}
                lookupState={lookupState}
                truncated={truncated}
                onRetryLookups={handleRetryLookups}
                copyableRules={copyableRules}
                onNotice={setNotice}
                disabled={isSubmitting}
              />

              <ScheduleWeekOverview slots={slots} groups={groups} />

              {mode === "edit" && (
                <ScheduleChangeSummary initialRules={initialRules} slots={slots} groups={groups} />
              )}
            </Stack>
            {/* Makes Enter submit through handleSubmit and the same gate. Kept
                out of the accessibility tree so no locator sees a second
                "Planning aanmaken" button. */}
            <Box
              component="button"
              type="submit"
              tabIndex={-1}
              disabled={submitDisabled}
              sx={{ display: "none" }}
            />
          </Box>
        </DialogContent>

        <Box ref={errorAlertRef}>
          <FormErrorAlert
            message={submitError}
            onClose={() => setSubmitError(null)}
            sx={{ mx: 3, mt: 2 }}
          />
        </Box>

        <DialogActions
          sx={{
            gap: 2,
            alignItems: { xs: "stretch", sm: "flex-end" },
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <ScheduleStatusLine
            mode={mode}
            slots={slots}
            groups={groups}
            lookupState={lookupState}
            notice={notice}
          />
          {mode === "edit" && (
            <Button
              variant="text"
              onClick={() => {
                reset();
                // Clear any transient notice; it described a draft that no
                // longer exists.
                setNotice(null);
              }}
              disabled={!isDirty || isSubmitting}
            >
              {t("Reset to saved schedule")}
            </Button>
          )}
          <Button variant="outlined" onClick={handleCancel}>
            {t("Cancel", { ns: "common" })}
          </Button>
          <Button
            variant="contained"
            disabled={submitDisabled}
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            {mode === "add" ? t("Create Schedule") : t("Update Schedule")}
          </Button>
        </DialogActions>
      </Dialog>
    </Form>
  );
};
