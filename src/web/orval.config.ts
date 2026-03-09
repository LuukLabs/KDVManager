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
  crm: {
    output: {
      mode: "tags-split",
      target: "src/api/crm/endpoints",
      schemas: "src/api/crm/models",
      client: "react-query",
      clean: true,
      prettier: true,
      indexFiles: false,
      baseUrl: "/crm",
      override: {
        mutator: mutatorFetch,
        operations: {
          ListChildren: queryPaginated,
          ListGuardians: queryPaginated,
        },
      },
    },
    input: {
      target: "http://localhost:5200/crm/openapi/v1.json",
    },
  },
  scheduling: {
    output: {
      mode: "tags-split",
      target: "src/api/scheduling/endpoints",
      schemas: "src/api/scheduling/models",
      client: "react-query",
      clean: true,
      prettier: true,
      indexFiles: false,
      baseUrl: "/scheduling",
      override: {
        mutator: mutatorFetch,
        operations: {
          ListGroups: queryPaginated,
          ListTimeSlots: queryPaginated,
          GetAllPeople: queryPaginated,
        },
      },
    },
    input: {
      target: "http://localhost:5200/scheduling/swagger/v1/swagger.json",
    },
  },
};

export default config;
