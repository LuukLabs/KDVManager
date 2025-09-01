import i18next from "i18next";
import { type LoaderFunctionArgs } from "react-router-dom";
import { type QueryClient } from "@tanstack/react-query";
import { getGetGuardianByIdQueryOptions } from "@api/endpoints/guardians/guardians";

export const guardianDetailPageLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    if (!params.guardianId) {
      const msg = i18next.t("guardian.errors.idRequired", "Guardian ID is required");
      throw new Response(msg, { status: 400 });
    }
    const queryOptions = getGetGuardianByIdQueryOptions(params.guardianId);
    return await queryClient.ensureQueryData(queryOptions);
  };
