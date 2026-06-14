import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";

void i18n
  .use(initReactI18next)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`../../locales/${language}/${namespace}.json`),
    ),
  )
  .init({
    lng: "nl",
    fallbackLng: "en",
    ns: ["common", "translation"],
    interpolation: {
      escapeValue: false,
    },
    debug: !import.meta.env.PROD,
  });

// WCAG 3.1.1 (Language of Page): keep the document's lang attribute in sync
// with the active language so assistive tech announces content correctly.
const syncDocumentLang = (lng: string) => {
  if (typeof document !== "undefined" && lng) {
    document.documentElement.lang = lng;
  }
};
syncDocumentLang(i18n.language);
i18n.on("languageChanged", syncDocumentLang);

export default i18n;
