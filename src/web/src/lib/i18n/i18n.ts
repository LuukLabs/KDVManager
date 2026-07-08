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

// Keep the document language in sync with i18n so it matches the rendered
// content (WCAG 3.1.1 Language of Page). index.html ships lang="en" but the
// app renders Dutch; without this the two disagree.
const syncDocumentLang = (language: string) => {
  if (typeof document !== "undefined" && language) {
    document.documentElement.lang = language;
  }
};
syncDocumentLang(i18n.resolvedLanguage ?? i18n.language);
i18n.on("languageChanged", syncDocumentLang);

export default i18n;
