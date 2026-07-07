import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";

export type SectionHeaderProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  /** Rendered at the trailing end of the header (e.g. edit/save controls). */
  actions?: ReactNode;
  onClick?: () => void;
};

/**
 * Icon-avatar + title + description header shared by form sections
 * (`FormSection`) and editable detail cards (`EditableCard`), so create and
 * edit pages read as one visual language.
 */
export const SectionHeader = ({
  title,
  description,
  icon,
  actions,
  onClick,
}: SectionHeaderProps) => (
  <Box
    onClick={onClick}
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 1.5,
      px: { xs: 2, sm: 3 },
      py: 2,
      cursor: onClick ? "pointer" : "default",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
      {icon && (
        <Avatar
          sx={(theme) => ({
            width: 40,
            height: 40,
            color: "primary.main",
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          })}
        >
          {icon}
        </Avatar>
      )}
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {description}
          </Typography>
        )}
      </Box>
    </Box>
    {actions && (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>{actions}</Box>
    )}
  </Box>
);
