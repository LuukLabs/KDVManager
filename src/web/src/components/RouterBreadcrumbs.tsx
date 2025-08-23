import * as React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import { Link as RouterLink, type UIMatch } from "react-router-dom";
import { useMatches, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Typography, Box, IconButton, useMediaQuery, Tooltip } from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { useTheme } from "@mui/material/styles";

type Handle = {
  crumb: (data: any) => React.ReactElement;
};

const RouterBreadcrumbs: React.FC = () => {
  const matches = useMatches() as UIMatch<unknown, Handle>[];
  const { t } = useTranslation();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const crumbs = matches
    .filter((m) => Boolean(m.handle?.crumb))
    .map((m) => ({ pathname: m.pathname, element: m.handle!.crumb(m.data) }));

  // On mobile, collapse middle crumbs if more than 3
  let displayCrumbs = crumbs;
  const collapsed = isMobile && crumbs.length > 3;
  if (collapsed) {
    displayCrumbs = [crumbs[0], crumbs[crumbs.length - 2], crumbs[crumbs.length - 1]];
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", minHeight: 40 }}>
      <Breadcrumbs
        aria-label={t("breadcrumb")}
        separator="/"
        maxItems={isMobile ? 4 : undefined}
        itemsAfterCollapse={2}
        sx={{
          "& .MuiBreadcrumbs-li": { display: "flex", alignItems: "center" },
          fontSize: { xs: "0.75rem", sm: "0.85rem" },
        }}
      >
        <Link
          component={RouterLink}
          to="/schedule"
          color={location.pathname === "/schedule" ? "text.primary" : "inherit"}
          underline="none"
          sx={{ display: "inline-flex", alignItems: "center" }}
        >
          <Tooltip title={t("Schedule Overview") || ""} disableInteractive>
            <IconButton size="small" sx={{ p: 0.5 }} aria-label={t("Home")}>
              <HomeRoundedIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Link>
        {collapsed && (
          <MoreHorizRoundedIcon fontSize="small" aria-label={t("Collapsed breadcrumbs") || "..."} />
        )}
        {displayCrumbs.map((c, idx) => {
          const isLast = idx === displayCrumbs.length - 1;
          return isLast ? (
            <Typography key={c.pathname} color="text.primary" sx={{ fontWeight: 500 }}>
              {c.element}
            </Typography>
          ) : (
            <Link
              key={c.pathname}
              component={RouterLink}
              to={c.pathname}
              underline="hover"
              color="inherit"
              sx={{ display: "inline-flex", alignItems: "center" }}
            >
              {c.element}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default RouterBreadcrumbs;
