import { Button, Chip, Stack } from "@mui/material";
import { Login } from "@mui/icons-material";
import dayjs, { type Dayjs } from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { executeFetch } from "@api/mutator/executeFetch";

type Props = { childId: string; date: Dayjs };

/** Deliberately small daily action surface; server timestamps and tenant/user identity remain authoritative. */
export const AttendanceActions = ({ childId, date }: Props) => {
  const queryClient = useQueryClient();
  const queryKey = ["attendance", childId, date.format("YYYY-MM-DD")];
  const attendance = useQuery({
    queryKey,
    queryFn: () => executeFetch<{ checkedInAt: string | null; checkedOutAt: string | null }>(
      `/scheduling/v1/attendance/children/${childId}?date=${date.format("YYYY-MM-DD")}`, { method: "GET" },
    ),
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: (checkedOut: boolean) =>
      executeFetch(`/scheduling/v1/attendance/children/${childId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: date.format("YYYY-MM-DD"),
          checkedInAt: attendance.data?.checkedInAt ?? dayjs().toISOString(),
          checkedOutAt: checkedOut ? dayjs().toISOString() : null,
        }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return (
    <Stack direction="row" spacing={0.5} onClick={(event) => event.stopPropagation()}>
      {!attendance.data?.checkedInAt && <Button size="small" startIcon={<Login />} disabled={mutation.isPending} onClick={() => mutation.mutate(false)}>
        In
      </Button>}
      {attendance.data?.checkedInAt && !attendance.data.checkedOutAt && <Button size="small" disabled={mutation.isPending} onClick={() => mutation.mutate(true)}>Uit</Button>}
      {attendance.data?.checkedOutAt && <Chip size="small" color="success" label="Uitgecheckt" />}
      {mutation.isError && <Chip size="small" color="error" label="Mislukt" />}
    </Stack>
  );
};
