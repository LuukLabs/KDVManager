import { useTranslation } from "react-i18next";
import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const { t } = useTranslation();
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error-page">
      <h1>{t("error.oops")}</h1>
      <p>{t("error.unexpected")}</p>
      <p>
        <i>{t("error.notFound")}</i>
      </p>
    </div>
  );
}
