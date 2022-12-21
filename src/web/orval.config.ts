import { defineConfig } from "orval";

const mutatorAxios = {
  path: "src/api/mutator/executeAxios.ts",
  name: "executeAxios",
};

const mutatorAxiosPaginated = {
  path: "src/api/mutator/executeAxiosPaginated.ts",
  name: "executeAxiosPaginated",
};

const queryPaginated = {
  mutator: mutatorAxiosPaginated,
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
        mutator: mutatorAxios,
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
