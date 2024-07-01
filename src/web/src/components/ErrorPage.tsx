import { useTranslation } from "react-i18next";
import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const { t } = useTranslation();
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error-page">
      <h1>{t("Oops!")}</h1>
      <p>{t("Sorry, an unexpected error has occurred.")}</p>
      <p>
        <i>{t("Not found")}</i>
      </p>
    </div>
  );
}
