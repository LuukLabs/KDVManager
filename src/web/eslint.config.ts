import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import type { FlatConfig } from "@typescript-eslint/utils/ts-eslint";
import { globalIgnores } from "eslint/config";
import react from "eslint-plugin-react";
import i18next from "eslint-plugin-i18next";

const config: FlatConfig.ConfigArray = tseslint.config([
  globalIgnores(["dist", "eslint.config.ts", "i18next-parser.config.ts", "orval.config.ts"]),
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      react,
    },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.strict,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        project: "./tsconfig.app.json",
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // Common rules from your previous config
      "no-multiple-empty-lines": ["error", { max: 1, maxBOF: 1 }],
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-misused-promises": "error",
      "no-restricted-imports": ["error", { patterns: ["@mui/*/*/*"] }],
      semi: ["error", "always"],
    },
  },
  {
    ...(i18next.configs["flat/recommended"] as FlatConfig.Config),
    rules: {
      "i18next/no-literal-string": [
        "error",
        {
          mode: "jsx-only",
          "jsx-attributes": {
            include: [
              "label",
              "alt",
              "title",
              "placeholder",
              "aria-description",
              "aria-label",
              "aria-placeholder",
              "aria-roledescription",
              "aria-valuetext",
              "aria-braillelabel",
            ],
            exclude: [],
          },
          "jsx-components": {
            include: ["Chip"],
            exclude: ["Trans", "Auth0Provider", "LocalizationProvider"],
          },
          callees: {
            exclude: [
              "i18n(ext)?",
              "t",
              "require",
              "addEventListener",
              "removeEventListener",
              "postMessage",
              "getElementById",
              "dispatch",
              "commit",
              "includes",
              "indexOf",
              "endsWith",
              "startsWith",
              "navigate",
              "toLocaleDateString",
              "toLocaleString",
              "format",
            ],
          },
        },
      ],
    },
  },
  {
    files: ["src/api/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-invalid-void-type": "off",
      "@typescript-eslint/unified-signatures": "off",
    },
  },
]);

export default config;
