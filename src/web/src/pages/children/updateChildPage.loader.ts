import i18next from "i18next";
import { type LoaderFunctionArgs } from "react-router-dom";
import { type QueryClient } from "@tanstack/react-query";
import { getGetChildByIdQueryOptions } from "@api/endpoints/children/children";

export const updateChildPageLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    if (!params.childId) {
      const msg = i18next.t("child.errors.idRequired", "Child ID is required");
      throw new Response(msg, { status: 400 });
    }

    const queryOptions = getGetChildByIdQueryOptions(params.childId);
    return await queryClient.ensureQueryData(queryOptions);
  };
