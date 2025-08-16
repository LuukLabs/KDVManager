import React from "react";
import { Box, Typography, Skeleton } from "@mui/material";

type FieldDisplayProps = {
  label: string;
  value?: string | null;
  loading?: boolean;
  placeholder?: string;
};

export const FieldDisplay: React.FC<FieldDisplayProps> = ({
  label,
  value,
  loading = false,
  placeholder = "Not specified",
}) => {
  if (loading) {
    return (
      <Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 500,
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            mb: 0.5,
            display: "block",
          }}
        >
          {label}
        </Typography>
        <Skeleton width="80%" height={24} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 500,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          mb: 0.5,
          display: "block",
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: value ? "text.primary" : "text.secondary",
          fontStyle: value ? "normal" : "italic",
        }}
      >
        {value ?? placeholder}
      </Typography>
    </Box>
  );
};
