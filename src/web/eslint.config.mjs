import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import i18next from "eslint-plugin-i18next";
import { fixupPluginRules } from "@eslint/compat";

export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    // config with just ignores is the replacement for `.eslintignore`
    ignores: ["dist", ".eslintrc.cjs"],
  },
  {
    rules: {
      "no-multiple-empty-lines": ["error", { max: 1, maxBOF: 1 }],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-restricted-imports": [
        "error",
        {
          patterns: ["@mui/*/*/*"],
        },
      ],
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    ...pluginReactConfig,
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    plugins: {
      i18next: fixupPluginRules(i18next),
    },
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
            include: [],
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
            ],
          },
        },
      ],
    },
  },
  {
    files: ["src/api/**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json", "./tsconfig.node.json", "./tsconfig.app.json"],
      },
    },
    rules: {
      "@typescript-eslint/no-invalid-void-type": "off",
      "@typescript-eslint/unified-signatures": "off",
    },
  },
];
