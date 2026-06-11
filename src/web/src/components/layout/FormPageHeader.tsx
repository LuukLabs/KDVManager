import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { styled, alpha } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useTranslation } from "react-i18next";

const HeaderPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2, 2),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.15)}, ${alpha(theme.palette.background.paper, 0.9)})`,
  backdropFilter: "blur(6px)",
  boxShadow: theme.shadows[1],
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(2.5, 3),
  },
}));

export type FormPageHeaderProps = {
  title: string;
  subtitle?: string;
  /** Route to navigate to via the back button; omit to hide the button. */
  backTo?: string;
  /** Optional content rendered at the end of the header (e.g. a status chip). */
  action?: ReactNode;
};

/**
 * Page header for create/edit form pages, visually aligned with the
 * gradient headers used on the list pages.
 */
export const FormPageHeader = ({ title, subtitle, backTo, action }: FormPageHeaderProps) => {
  const { t } = useTranslation();

  return (
    <HeaderPaper elevation={0} role="region" aria-label={title}>
      {backTo && (
        <Tooltip title={t("Back", { ns: "common" })}>
          <IconButton
            component={Link}
            to={backTo}
            aria-label={t("Back", { ns: "common" })}
            sx={(theme) => ({
              backgroundColor: alpha(theme.palette.background.paper, 0.7),
              border: 1,
              borderColor: "divider",
              "&:hover": { backgroundColor: theme.palette.background.paper },
            })}
          >
            <ArrowBackRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </HeaderPaper>
  );
};
