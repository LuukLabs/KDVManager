import * as React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import { Link as RouterLink, type UIMatch } from "react-router-dom";
import { useMatches } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";

type Handle = {
  crumb: (data: any) => React.ReactElement;
};

const RouterBreadcrumbs: React.FC = () => {
  const matches = useMatches() as UIMatch<unknown, Handle>[];
  const { t } = useTranslation();

  const crumbs = matches
    // Filter out matches that don't have a handle or crumb function
    .filter((match) => Boolean(match.handle?.crumb))
    // Map to an array of elements
    .map((match) => ({
      pathname: match.pathname,
      crumbElement: match.handle!.crumb(match.data),
    }));

  return (
    <Breadcrumbs aria-label={t("breadcrumb")}>
      {crumbs.map((crumb, index) =>
        index === crumbs.length - 1 ? (
          <Typography key={index} color="textPrimary">
            {crumb.crumbElement}
          </Typography>
        ) : (
          <Link
            component={RouterLink}
            key={index}
            underline="hover"
            color="inherit"
            to={crumb.pathname}
          >
            {crumb.crumbElement}
          </Link>
        ),
      )}
    </Breadcrumbs>
  );
};

export default RouterBreadcrumbs;
