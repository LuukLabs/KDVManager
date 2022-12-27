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
  portal: {
    output: {
      mode: "tags-split",
      target: "src/api/endpoints",
      schemas: "src/api/models",
      client: "react-query",
      prettier: true,
      override: {
        mutator: useMutatorAxios,
        operations: {
          GetAllChildren: queryPaginated,
          ListGroups: queryPaginated,
        },
      },
    },
    input: {
      target: "./openapi.json",
    },
  },
};

export default config;
