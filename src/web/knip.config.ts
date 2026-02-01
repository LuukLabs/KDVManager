import type { KnipConfig } from "knip";

const config: KnipConfig = {
  workspaces: {
    ".": {
      // Application entry points (explicit is less noisy than a broad glob)
      entry: ["src/index.tsx", "orval.config.ts"],

      // Point to the TypeScript project files used to resolve imports (explicit relative paths)
      project: ["**/*.ts", "**/*.tsx"],

      // ESlint configuration (keeps eslint-aware checks enabled)
      eslint: {
        config: ["eslint.config.ts"],
        entry: ["eslint.config.ts"],
      },

      // TypeScript compiler options file(s)
      typescript: {
        config: ["tsconfig.app.json"],
      },

      paths: {
        "@/*": ["src/*"],
        "@api/*": ["src/api/*"],
        "@providers/*": ["src/providers/*"],
        "@components/*": ["src/components/*"],
        "@pages/*": ["src/pages/*"],
        "@features/*": ["src/features/*"],
        "@hooks/*": ["src/hooks/*"],
        "@lib/*": ["src/lib/*"],
        "@utils/*": ["src/utils/*"],
      },

      // Avoid false positives from generated files, public assets and node modules
      ignore: ["src/pages/**", "src/api/**", "dist/**", "node_modules/**", "public/**"],
    },
  },
};
export default config;
