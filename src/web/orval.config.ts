import { defineConfig } from "orval";

const useMutatorAxios = {
  path: "src/api/mutator/useExecuteAxios.ts",
  name: "useExecuteAxios",
};

const useMutatorAxiosPaginated = {
  path: "src/api/mutator/useExecuteAxiosPaginated.ts",
  name: "useExecuteAxiosPaginated",
};

const queryPaginated = {
  mutator: useMutatorAxiosPaginated,
  query: {
    useQuery: true,
  },
};

const config: ReturnType<typeof defineConfig> = {
  crm: {
    output: {
      mode: "tags-split",
      target: "src/crm/api/endpoints",
      schemas: "src/crm/api/models",
      client: "react-query",
      prettier: true,
      override: {
        mutator: useMutatorAxios,
        operations: {
          GetAllChildren: queryPaginated,
        },
      },
    },
    input: {
      target: "https://api.kdvmanager.nl/crm/swagger/v1/swagger.json",
    },
  },
  scheduling: {
    output: {
      mode: "tags-split",
      target: "src/scheduling/api/endpoints",
      schemas: "src/scheduling/api/models",
      client: "react-query",
      prettier: true,
      override: {
        mutator: useMutatorAxios,
        operations: {
          ListGroups: queryPaginated,
        },
      },
    },
    input: {
      target: "https://api.kdvmanager.nl/scheduling/swagger/v1/swagger.json",
    },
  },
};

export default config;
