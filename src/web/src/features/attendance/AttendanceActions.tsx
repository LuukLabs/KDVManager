import { Button, Chip, Stack } from "@mui/material";
import { Login } from "@mui/icons-material";
import dayjs, { type Dayjs } from "dayjs";
import { useMutation } from "@tanstack/react-query";
import { executeFetch } from "@api/mutator/executeFetch";

type Props = { childId: string; date: Dayjs };

/** Deliberately small daily action surface; server timestamps and tenant/user identity remain authoritative. */
export const AttendanceActions = ({ childId, date }: Props) => {
  const mutation = useMutation({
    mutationFn: () =>
      executeFetch(`/scheduling/v1/attendance/children/${childId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: date.format("YYYY-MM-DD"),
          checkedInAt: dayjs().toISOString(),
          checkedOutAt: null,
        }),
      }),
  });

  return (
    <Stack direction="row" spacing={0.5} onClick={(event) => event.stopPropagation()}>
      <Button size="small" startIcon={<Login />} disabled={mutation.isPending} onClick={() => mutation.mutate()}>
        In
      </Button>
      {mutation.isError && <Chip size="small" color="error" label="Mislukt" />}
    </Stack>
  );
};
