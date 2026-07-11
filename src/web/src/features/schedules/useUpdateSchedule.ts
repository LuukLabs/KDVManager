import { useMutation } from "@tanstack/react-query";
import type { AddScheduleCommand } from "@api/scheduling/models/addScheduleCommand";
import { executeFetch } from "@api/mutator/executeFetch";

type UpdateScheduleRequest = Pick<AddScheduleCommand, "startDate" | "scheduleRules">;

type UpdateScheduleVariables = {
  id: string;
  data: UpdateScheduleRequest;
};

const updateSchedule = async ({ id, data }: UpdateScheduleVariables): Promise<string> =>
  executeFetch<string>(`/scheduling/v1/schedules/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

/**
 * Owns the scheduling update contract rather than patching Orval output. The
 * endpoint is deliberately kept here until the checked-in OpenAPI document is
 * regenerated from an API build that contains UpdateSchedule.
 */
export const useUpdateSchedule = () =>
  useMutation({
    mutationKey: ["schedules", "update"],
    mutationFn: updateSchedule,
  });
