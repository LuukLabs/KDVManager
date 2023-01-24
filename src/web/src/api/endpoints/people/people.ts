/**
 * Generated by orval v6.11.1 🍺
 * Do not edit manually.
 * KDVManager CRM API
 * OpenAPI spec version: v1
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
import type { PersonListVM, GetAllPeopleParams, AddPersonCommand } from "../../models";
import { useExecuteAxiosPaginated } from "../../mutator/useExecuteAxiosPaginated";
import { useExecuteAxios } from "../../mutator/useExecuteAxios";

export const useGetAllPeopleHook = () => {
  const getAllPeople = useExecuteAxiosPaginated<PersonListVM[]>();

  return (params?: GetAllPeopleParams) => {
    return getAllPeople({ url: `/crm/v1/people`, method: "get", params });
  };
};

export const getGetAllPeopleQueryKey = (params?: GetAllPeopleParams) => [
  `/crm/v1/people`,
  ...(params ? [params] : []),
];

export type GetAllPeopleQueryResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof useGetAllPeopleHook>>>
>;
export type GetAllPeopleQueryError = unknown;

export const useGetAllPeople = <
  TData = Awaited<ReturnType<ReturnType<typeof useGetAllPeopleHook>>>,
  TError = unknown
>(
  params?: GetAllPeopleParams,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<ReturnType<typeof useGetAllPeopleHook>>>,
      TError,
      TData
    >;
  }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetAllPeopleQueryKey(params);

  const getAllPeople = useGetAllPeopleHook();

  const queryFn: QueryFunction<Awaited<ReturnType<ReturnType<typeof useGetAllPeopleHook>>>> = () =>
    getAllPeople(params);

  const query = useQuery<
    Awaited<ReturnType<ReturnType<typeof useGetAllPeopleHook>>>,
    TError,
    TData
  >(queryKey, queryFn, queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  query.queryKey = queryKey;

  return query;
};

export const useAddPersonHook = () => {
  const addPerson = useExecuteAxios<string>();

  return (addPersonCommand: AddPersonCommand) => {
    return addPerson({
      url: `/crm/v1/people`,
      method: "post",
      headers: { "Content-Type": "application/json" },
      data: addPersonCommand,
    });
  };
};

export type AddPersonMutationResult = NonNullable<
  Awaited<ReturnType<ReturnType<typeof useAddPersonHook>>>
>;
export type AddPersonMutationBody = AddPersonCommand;
export type AddPersonMutationError = unknown;

export const useAddPerson = <TError = unknown, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<ReturnType<typeof useAddPersonHook>>>,
    TError,
    { data: AddPersonCommand },
    TContext
  >;
}) => {
  const { mutation: mutationOptions } = options ?? {};

  const addPerson = useAddPersonHook();

  const mutationFn: MutationFunction<
    Awaited<ReturnType<ReturnType<typeof useAddPersonHook>>>,
    { data: AddPersonCommand }
  > = (props) => {
    const { data } = props ?? {};

    return addPerson(data);
  };

  return useMutation<
    Awaited<ReturnType<typeof addPerson>>,
    TError,
    { data: AddPersonCommand },
    TContext
  >(mutationFn, mutationOptions);
};
