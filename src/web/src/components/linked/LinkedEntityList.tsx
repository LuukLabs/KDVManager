import React from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Avatar,
  Tooltip,
  Stack,
  alpha,
  useTheme,
} from "@mui/material";
import { LinkOff } from "@mui/icons-material";

type LinkedEntity = {
  id: string;
  primaryText: string;
  secondaryLines?: string[];
  avatarText?: string;
  chips?: { label: string; color?: any; variant?: "filled" | "outlined" }[];
  navigateTo?: string;
  unlinkDisabled?: boolean;
};

type LinkedEntityListProps = {
  items: LinkedEntity[];
  onNavigate: (path: string) => void;
  onUnlink: (id: string) => void | Promise<void>;
  unlinkLoadingId?: string | null;
  emptyContent?: React.ReactNode;
};
import { useTranslation } from "react-i18next";

export const LinkedEntityList: React.FC<LinkedEntityListProps> = ({
  items,
  onNavigate,
  onUnlink,
  unlinkLoadingId,
  emptyContent,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  if (items.length === 0) {
    return <Box>{emptyContent}</Box>;
  }

  return (
    <Stack spacing={1.25} sx={{ mt: 0.5 }}>
      {items.map((item, idx) => {
        const clickable = !!item.navigateTo;
        return (
          <Box
            key={item.id ?? `item-${idx}`}
            component={clickable ? "button" : "div"}
            onClick={() => clickable && onNavigate(item.navigateTo!)}
            sx={{
              width: "100%",
              textAlign: "left",
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              display: "flex",
              alignItems: "stretch",
              gap: 1.5,
              padding: { xs: 1.25, sm: 1.5 },
              position: "relative",
              cursor: clickable ? "pointer" : "default",
              backgroundColor: "background.paper",
              transition:
                "border-color .25s ease, background-color .25s ease, box-shadow .25s ease",
              "&:hover": clickable
                ? {
                    borderColor: "primary.main",
                    backgroundColor: alpha(theme.palette.primary.main, 0.035),
                    boxShadow: theme.shadows[1],
                  }
                : undefined,
              "&:focus-visible": clickable
                ? {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: 2,
                  }
                : undefined,
            }}
          >
            {item.avatarText && (
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  fontSize: ".95rem",
                  fontWeight: 600,
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                  color: "primary.main",
                  flexShrink: 0,
                }}
              >
                {item.avatarText}
              </Avatar>
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                flexWrap="wrap"
                mb={item.secondaryLines?.length ? 0.5 : 0}
              >
                <Typography
                  variant="body1"
                  fontWeight={600}
                  sx={{ fontSize: { xs: ".95rem", sm: "1rem" } }}
                >
                  {item.primaryText}
                </Typography>
                {item.chips?.map((c, i) => (
                  <Chip
                    key={i}
                    size="small"
                    label={c.label}
                    color={c.color}
                    variant={c.variant ?? "outlined"}
                    sx={{
                      fontWeight: 500,
                      "& .MuiChip-label": { px: 1 },
                    }}
                  />
                ))}
              </Box>
              {item.secondaryLines && item.secondaryLines.length > 0 && (
                <Stack spacing={0.25}>
                  {item.secondaryLines.map((line, i) => (
                    <Typography
                      key={i}
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: ".7rem", sm: ".75rem" } }}
                    >
                      {line}
                    </Typography>
                  ))}
                </Stack>
              )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", pl: 0.5 }}>
              <Tooltip title={t("common.unlink")}>
                <span>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnlink(item.id);
                    }}
                    disabled={(item.unlinkDisabled ?? false) || unlinkLoadingId === item.id}
                    aria-label={t("common.unlink")}
                  >
                    <LinkOff fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
};
