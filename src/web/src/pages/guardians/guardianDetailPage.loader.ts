import { type LoaderFunctionArgs } from "react-router-dom";
import { type QueryClient } from "@tanstack/react-query";
import { getGetGuardianByIdQueryOptions } from "@api/endpoints/guardians/guardians";

export const guardianDetailPageLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    if (!params.guardianId) {
      throw new Response("Guardian ID is required", { status: 400 });
    }
    const queryOptions = getGetGuardianByIdQueryOptions(params.guardianId);
    return await queryClient.ensureQueryData(queryOptions);
  };
