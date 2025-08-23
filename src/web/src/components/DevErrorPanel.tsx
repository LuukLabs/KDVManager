import { Collapse, IconButton, Stack, Typography, Box, Divider, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useState } from "react";
import { ApiError } from "@api/errors/types";
import { useTranslation } from "react-i18next";

type DevErrorPanelProps = {
  error: Error | ApiError;
};

export const DevErrorPanel = ({ error }: DevErrorPanelProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const handleCopy = async () => {
    try {
      const payload = JSON.stringify(
        {
          name: error.name,
          message: error.message,
          ...(error instanceof ApiError
            ? {
                status: error.status,
                code: error.code,
                type: error.type,
                details: error.details,
                rawBody: error.rawBody,
              }
            : {}),
          stack: error.stack,
        },
        null,
        2,
      );
      await navigator.clipboard.writeText(payload);
    } catch {
      /* ignore */
    }
  };

  return (
    <Box
      sx={{
        mt: 3,
        p: 2,
        bgcolor: (theme) => theme.palette.background.paper,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        fontFamily: "monospace",
        boxShadow: 1,
        maxWidth: 800,
        width: "100%",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="body2" fontWeight={600} color="error.main">
          {t("devError.title", "Dev Error")}
        </Typography>
        <Divider flexItem orientation="vertical" />
        <Typography variant="caption" sx={{ flexGrow: 1, wordBreak: "break-word" }}>
          {error.message}
        </Typography>
        <Tooltip title={open ? t("devError.collapse", "Collapse") : t("devError.expand", "Expand")}>
          <IconButton
            size="small"
            onClick={() => setOpen((o) => !o)}
            aria-label={t("devError.toggleDetails", "toggle-details")}
          >
            {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title={t("devError.copyJson", "Copy details as JSON")}>
          <IconButton
            size="small"
            onClick={handleCopy}
            aria-label={t("devError.copyAria", "copy-error-json")}
          >
            <ContentCopyIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Divider sx={{ my: 1 }} />
        <Box component="pre" sx={{ m: 0, whiteSpace: "pre-wrap", fontSize: 12, lineHeight: 1.4 }}>
          {error.stack}
        </Box>
        {error instanceof ApiError && error.rawBody && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="overline" display="block" gutterBottom>
              {t("devError.rawResponse", "Raw Response")}
            </Typography>
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 1,
                bgcolor: (theme) => theme.palette.action.hover,
                borderRadius: 1,
                whiteSpace: "pre-wrap",
                fontSize: 12,
              }}
            >
              {error.rawBody}
            </Box>
          </Box>
        )}
      </Collapse>
    </Box>
  );
};

export default DevErrorPanel;
