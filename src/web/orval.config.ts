import { defineConfig } from "orval";

const mutatorAxios = {
  path: "src/api/mutator/executeAxios.ts",
  name: "executeAxios",
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
      },
    },
    input: {
      target: "./openapi.json",
    },
  },
};

export default config;
