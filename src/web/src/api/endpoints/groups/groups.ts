/**
 * Generated by orval v6.31.0 🍺
 * Do not edit manually.
 * KDVManager CRM API
 * OpenAPI spec version: v1
 */
import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  MutationFunction,
  QueryFunction,
  QueryKey,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { useCallback } from "react";
import type { AddGroupCommand } from "../../models/addGroupCommand";
import type { GroupListVM } from "../../models/groupListVM";
import type { ListGroupsParams } from "../../models/listGroupsParams";
import type { ProblemDetails } from "../../models/problemDetails";
import type { UnprocessableEntityResponse } from "../../models/unprocessableEntityResponse";
import { useExecuteFetchPaginated } from "../../mutator/useExecuteFetchPaginated";
import { useExecuteFetch } from "../../mutator/useExecuteFetch";

export const useListGroupsHook = () => {
  const listGroups = useExecuteFetchPaginated<GroupListVM[]>();

  return useCallback(
    (params?: ListGroupsParams, signal?: AbortSignal) => {
      return listGroups({ url: `/scheduling/v1/groups`, method: "GET", params, signal });
    },
    [listGroups],
  );
};

export const getListGroupsQueryKey = (params?: ListGroupsParams) => {
  return [`/scheduling/v1/groups`, ...(params ? [params] : [])] as const;
};

export const useListGroupsQueryOptions = <
  TData = Awaited<ReturnType<ReturnType<typeof useListGroupsHook>>>,
  TError = unknown,
>(
  params?: ListGroupsParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<ReturnType<typeof useListGroupsHook>>>, TError, TData>
    >;
  },
) => {
  const { query: queryOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getListGroupsQueryKey(params);

  const listGroups = useListGroupsHook();

  const queryFn: QueryFunction<Awaited<ReturnType<ReturnType<typeof useListGroupsHook>>>> = ({
    signal,
  }) => listGroups(params, signal);

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<ReturnType<typeof useListGroupsHook>>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type ListGroupsQueryResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof useListGroupsHook>>>
>;
export type ListGroupsQueryError = unknown;

export const useListGroups = <
  TData = Awaited<ReturnType<ReturnType<typeof useListGroupsHook>>>,
  TError = unknown,
>(
  params?: ListGroupsParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<ReturnType<typeof useListGroupsHook>>>, TError, TData>
    >;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const queryOptions = useListGroupsQueryOptions(params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };

  query.queryKey = queryOptions.queryKey;

  return query;
};

export const useAddGroupHook = () => {
  const addGroup = useExecuteFetch<string>();

  return useCallback(
    (addGroupCommand: AddGroupCommand) => {
      return addGroup({
        url: `/scheduling/v1/groups`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: addGroupCommand,
      });
    },
    [addGroup],
  );
};

export const useAddGroupMutationOptions = <
  TError = UnprocessableEntityResponse,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<ReturnType<typeof useAddGroupHook>>>,
    TError,
    { data: AddGroupCommand },
    TContext
  >;
}): UseMutationOptions<
  Awaited<ReturnType<ReturnType<typeof useAddGroupHook>>>,
  TError,
  { data: AddGroupCommand },
  TContext
> => {
  const { mutation: mutationOptions } = options ?? {};

  const addGroup = useAddGroupHook();

  const mutationFn: MutationFunction<
    Awaited<ReturnType<ReturnType<typeof useAddGroupHook>>>,
    { data: AddGroupCommand }
  > = (props) => {
    const { data } = props ?? {};

    return addGroup(data);
  };

  return { mutationFn, ...mutationOptions };
};

export type AddGroupMutationResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof useAddGroupHook>>>
>;
export type AddGroupMutationBody = AddGroupCommand;
export type AddGroupMutationError = UnprocessableEntityResponse;

export const useAddGroup = <TError = UnprocessableEntityResponse, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<ReturnType<typeof useAddGroupHook>>>,
    TError,
    { data: AddGroupCommand },
    TContext
  >;
}): UseMutationResult<
  Awaited<ReturnType<ReturnType<typeof useAddGroupHook>>>,
  TError,
  { data: AddGroupCommand },
  TContext
> => {
  const mutationOptions = useAddGroupMutationOptions(options);

  return useMutation(mutationOptions);
};
export const useDeleteGroupHook = () => {
  const deleteGroup = useExecuteFetch<void>();

  return useCallback(
    (id: string) => {
      return deleteGroup({ url: `/scheduling/v1/groups/${id}`, method: "DELETE" });
    },
    [deleteGroup],
  );
};

export const useDeleteGroupMutationOptions = <
  TError = ProblemDetails,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<ReturnType<typeof useDeleteGroupHook>>>,
    TError,
    { id: string },
    TContext
  >;
}): UseMutationOptions<
  Awaited<ReturnType<ReturnType<typeof useDeleteGroupHook>>>,
  TError,
  { id: string },
  TContext
> => {
  const { mutation: mutationOptions } = options ?? {};

  const deleteGroup = useDeleteGroupHook();

  const mutationFn: MutationFunction<
    Awaited<ReturnType<ReturnType<typeof useDeleteGroupHook>>>,
    { id: string }
  > = (props) => {
    const { id } = props ?? {};

    return deleteGroup(id);
  };

  return { mutationFn, ...mutationOptions };
};

export type DeleteGroupMutationResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof useDeleteGroupHook>>>
>;

export type DeleteGroupMutationError = ProblemDetails;

export const useDeleteGroup = <TError = ProblemDetails, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<ReturnType<typeof useDeleteGroupHook>>>,
    TError,
    { id: string },
    TContext
  >;
}): UseMutationResult<
  Awaited<ReturnType<ReturnType<typeof useDeleteGroupHook>>>,
  TError,
  { id: string },
  TContext
> => {
  const mutationOptions = useDeleteGroupMutationOptions(options);

  return useMutation(mutationOptions);
};
