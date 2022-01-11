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
      target: "http://docs.lvh.me/services/childmanagment/swagger/v1/swagger.json",
    },
  },
};

export default config;
