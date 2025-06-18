import { type LoaderFunctionArgs } from "react-router-dom";
import { getGetChildByIdQueryOptions } from "../../api/endpoints/children/children";
import { type QueryClient } from "@tanstack/react-query";

export const updateChildPageLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    if (!params.childId) {
      throw new Response("Child ID is required", { status: 400 });
    }

    const queryOptions = getGetChildByIdQueryOptions(params.childId);
    return await queryClient.ensureQueryData(queryOptions);
  };
