// @ts-check

import eslint from "@eslint/js";
import deprecationPlugin from "eslint-plugin-deprecation";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // register all of the plugins up-front
  {
    // note - intentionally uses computed syntax to make it easy to sort the keys
    plugins: {
      ["@typescript-eslint"]: tseslint.plugin,
      ["deprecation"]: deprecationPlugin,
    },
  },
  {
    // config with just ignores is the replacement for `.eslintignore`
    ignores: ["**/node_modules/**", "**/dist/**"],
  },

  // extends ...
  // eslint-disable-next-line
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  // ...tseslint.configs.stylisticTypeChecked,

  // base config
  {
    languageOptions: {
      // globals: {
      //    ...globals.es2020,
      //    ...globals.node,
      // },
      parserOptions: {
        allowAutomaticSingleRunInference: true,
        project: ["./tsconfig.json", "./tsconfig.node.json"],
      },
    },
  },
  {
    files: ["eslint.config.{js,cjs,mjs}"],
    rules: {},
  },
  {
    files: ["src/api/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/prefer-promise-reject-errors": "off",
    },
  },
);
