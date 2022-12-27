/**
 * Generated by orval v6.10.3 🍺
 * Do not edit manually.
 * KDVManager.Services.ChildManagement.Api
 * OpenAPI spec version: 1.0
 */
import { useQuery, useMutation } from "react-query";
import type {
  UseQueryOptions,
  UseMutationOptions,
  QueryFunction,
  MutationFunction,
  UseQueryResult,
  QueryKey,
} from "react-query";
import type {
  GroupListVM,
  ListGroupsParams,
  AddGroupCommand,
} from "../../models";
import { useExecuteAxiosPaginated } from "../../mutator/useExecuteAxiosPaginated";
import { useExecuteAxios } from "../../mutator/useExecuteAxios";

type AwaitedInput<T> = PromiseLike<T> | T;

type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;

export const useListGroupsHook = () => {
  const listGroups = useExecuteAxiosPaginated<GroupListVM[]>();

  return (params?: ListGroupsParams) => {
    return listGroups({ url: `/v1/scheduling/groups`, method: "get", params });
  };
};

export const getListGroupsQueryKey = (params?: ListGroupsParams) => [
  `/v1/scheduling/groups`,
  ...(params ? [params] : []),
];

export type ListGroupsQueryResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof useListGroupsHook>>>
>;
export type ListGroupsQueryError = unknown;

export const useListGroups = <
  TData = Awaited<ReturnType<ReturnType<typeof useListGroupsHook>>>,
  TError = unknown
>(
  params?: ListGroupsParams,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<ReturnType<typeof useListGroupsHook>>>,
      TError,
      TData
    >;
  }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getListGroupsQueryKey(params);

  const listGroups = useListGroupsHook();

  const queryFn: QueryFunction<
    Awaited<ReturnType<ReturnType<typeof useListGroupsHook>>>
  > = () => listGroups(params);

  const query = useQuery<
    Awaited<ReturnType<ReturnType<typeof useListGroupsHook>>>,
    TError,
    TData
  >(queryKey, queryFn, queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  query.queryKey = queryKey;

  return query;
};

export const useAddGroupHook = () => {
  const addGroup = useExecuteAxios<string>();

  return (addGroupCommand: AddGroupCommand) => {
    return addGroup({
      url: `/v1/scheduling/groups`,
      method: "post",
      headers: { "Content-Type": "application/json" },
      data: addGroupCommand,
    });
  };
};

export type AddGroupMutationResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof useAddGroupHook>>>
>;
export type AddGroupMutationBody = AddGroupCommand;
export type AddGroupMutationError = unknown;

export const useAddGroup = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<ReturnType<typeof useAddGroupHook>>>,
    TError,
    { data: AddGroupCommand },
    TContext
  >;
}) => {
  const { mutation: mutationOptions } = options ?? {};

  const addGroup = useAddGroupHook();

  const mutationFn: MutationFunction<
    Awaited<ReturnType<ReturnType<typeof useAddGroupHook>>>,
    { data: AddGroupCommand }
  > = (props) => {
    const { data } = props ?? {};

    return addGroup(data);
  };

  return useMutation<
    Awaited<ReturnType<typeof addGroup>>,
    TError,
    { data: AddGroupCommand },
    TContext
  >(mutationFn, mutationOptions);
};
