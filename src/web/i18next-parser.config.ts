import { type UserConfig } from "i18next-parser";

const config: UserConfig = {
  createOldCatalogs: false,
  defaultNamespace: "translation",
  locales: ["en", "nl"],
  input: ["src/**/*.{js,jsx,ts,tsx}"],
  output: "src/locales/$LOCALE/$NAMESPACE.json",
  indentation: 2,
  sort: true,
  keySeparator: false,
  namespaceSeparator: false,
};

export default config;
