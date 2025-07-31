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

export default i18n;
