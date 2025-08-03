import { type defineConfig } from "orval";

const mutatorFetch = {
  path: "src/api/mutator/executeFetch.ts",
  name: "executeFetch",
};

const mutatorFetchPaginated = {
  path: "src/api/mutator/executeFetchPaginated.ts",
  name: "executeFetchPaginated",
};

const queryPaginated = {
  mutator: mutatorFetchPaginated,
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
      indexFiles: false,
      prettier: false,
      override: {
        mutator: mutatorFetch,
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
