import React from "react";
import { Box, Typography, Avatar, Stack, Button, useTheme, useMediaQuery, alpha } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Person as PersonIcon, Edit, Delete, Link as LinkIcon } from "@mui/icons-material";

export type GuardianHeaderProps = {
  givenName?: string;
  familyName?: string;
  email?: string;
  phone?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onLinkChild?: () => void;
  loading?: boolean;
};

export const GuardianHeader: React.FC<GuardianHeaderProps> = ({
  givenName,
  familyName,
  email,
  phone,
  onEdit,
  onDelete,
  onLinkChild,
  loading = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const initials = (givenName?.[0] ?? "?") + (familyName?.[0] ?? "");
  const fullName = [givenName ?? '', familyName ?? ''].filter(Boolean).join(" ") || t("Unknown Guardian");

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
        color: "white",
        p: { xs: 2, sm: 2.5, md: 3 },
        borderRadius: { xs: 0, md: 3 },
        mb: { xs: 2, md: 3 },
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 20% 80%, ${alpha("#fff", 0.12)} 0%, transparent 55%), radial-gradient(circle at 80% 20%, ${alpha("#fff", 0.07)} 0%, transparent 55%)`,
          pointerEvents: "none",
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: isMobile ? "flex-start" : "center",
            gap: 2,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            <Avatar
              sx={{
                width: { xs: 56, md: 64 },
                height: { xs: 56, md: 64 },
                bgcolor: alpha("#fff", 0.25),
                color: "secondary.main",
                fontSize: { xs: "1.35rem", md: "1.5rem" },
                fontWeight: "bold",
                border: '2px solid rgba(255,255,255,0.3)'
              }}
            >
              {loading ? <PersonIcon /> : initials.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  lineHeight: 1.15,
                  fontSize: isMobile ? "1.55rem" : "2rem",
                }}
              >
                {fullName}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  opacity: 0.9,
                  fontSize: { xs: ".85rem", sm: ".9rem", md: "1rem" },
                  mb: 1,
                  fontWeight: 500,
                  letterSpacing: 0.3,
                }}
              >
                {email || phone ? [email, phone].filter(Boolean).join(" • ") : t("Guardian Record")}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1} sx={{ mt: isMobile ? 1 : 0 }}>
            {onLinkChild && (
              <Button
                variant="outlined"
                startIcon={<LinkIcon />}
                onClick={onLinkChild}
                disabled={loading}
                sx={{
                  borderColor: alpha("#fff", 0.5),
                  color: "white",
                  '&:hover': { borderColor: 'white', backgroundColor: alpha("#fff",0.1) },
                }}
              >
                {t("Link Child")}
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={onEdit}
                disabled={loading}
                sx={{
                  borderColor: alpha("#fff", 0.5),
                  color: "white",
                  '&:hover': { borderColor: 'white', backgroundColor: alpha("#fff",0.1) },
                }}
              >
                {t("Edit")}
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={onDelete}
                disabled={loading}
                sx={{
                  borderColor: alpha(theme.palette.error.main, 0.7),
                  color: theme.palette.error.main,
                  '&:hover': { borderColor: theme.palette.error.main, backgroundColor: alpha(theme.palette.error.main,0.1) },
                }}
              >
                {t("Delete")}
              </Button>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};
