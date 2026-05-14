// Synchronous, dependency-light i18next bootstrap for tests. We deliberately
// avoid the resourcesToBackend dynamic-import setup used by the app so each
// worker pays a fixed, tiny cost instead of resolving locale files on demand.
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    ns: ["common", "translation"],
    defaultNS: "translation",
    resources: {
      en: {
        common: {
          Save: "Save",
          "This field is required": "This field is required",
        },
        translation: {},
      },
    },
    interpolation: { escapeValue: false },
    // Silences the locize banner in CI logs.
    debug: false,
  });
}
