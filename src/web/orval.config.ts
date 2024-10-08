import { type defineConfig } from "orval";

const useMutatorFetch = {
  path: "src/api/mutator/useExecuteFetch.ts",
  name: "useExecuteFetch",
};

const useMutatorFetchPaginated = {
  path: "src/api/mutator/useExecuteFetchPaginated.ts",
  name: "useExecuteFetchPaginated",
};

const queryPaginated = {
  mutator: useMutatorFetchPaginated,
  query: {
    useQuery: true,
    useInfiniteQueryParam: "PageNumber",
  },
};

const config: ReturnType<typeof defineConfig> = {
  kdvmanager: {
    output: {
      mode: "tags-split",
      target: "src/api/endpoints",
      schemas: "src/api/models",
      client: "react-query",
      prettier: true,
      indexFiles: false,
      override: {
        mutator: useMutatorFetch,
        operations: {
          GetAllChildren: queryPaginated,
          ListGroups: queryPaginated,
          ListTimeSlots: queryPaginated,
          GetAllPeople: queryPaginated,
        },
      },
    },
    input: {
      target: "./output.openapi.json",
    },
  },
};

export default config;
