import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Collapse,
  alpha,
  useTheme,
  Stack,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";

type EditableCardProps = {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  editChildren?: React.ReactNode;
  onSave?: () => void;
  onCancel?: () => void;
  isEditing?: boolean;
  onEditToggle?: (editing: boolean) => void;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  actions?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
};

export const EditableCard: React.FC<EditableCardProps> = ({
  title,
  icon,
  children,
  editChildren,
  onSave,
  onCancel,
  isEditing = false,
  onEditToggle,
  collapsible = false,
  defaultExpanded = true,
  actions,
  loading = false,
  disabled = false,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleEditToggle = () => {
    if (onEditToggle) {
      onEditToggle(!isEditing);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleExpandToggle = () => {
    if (collapsible) {
      setExpanded(!expanded);
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: isEditing ? `2px solid ${theme.palette.primary.main}` : "1px solid",
        borderColor: isEditing ? "primary.main" : "divider",
        backgroundColor: isEditing ? alpha(theme.palette.primary.main, 0.02) : "background.paper",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: 2,
        },
      }}
    >
      {/* Card Header */}
      <Box
        sx={{
          p: { xs: 1.75, sm: 2, md: 2.5 },
          borderBottom: "1px solid",
          borderBottomColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: collapsible ? "pointer" : "default",
        }}
        onClick={collapsible ? handleExpandToggle : undefined}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {icon}
          <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {actions}

          {/* Edit Controls */}
          {isEditing ? (
            <Stack direction="row" spacing={1}>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                color="primary"
                disabled={loading}
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                <SaveIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
                color="error"
                disabled={loading}
                sx={{
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.error.main, 0.2),
                  },
                }}
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            </Stack>
          ) : (
            onEditToggle && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditToggle();
                }}
                disabled={disabled || loading}
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )
          )}

          {/* Expand/Collapse Icon */}
          {collapsible && (
            <IconButton
              sx={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Card Content */}
      <Collapse in={expanded} timeout={300}>
  <CardContent sx={{ p: { xs: 2, sm: 2.25, md: 2.5 } }}>
          {isEditing && editChildren ? editChildren : children}
        </CardContent>
      </Collapse>
    </Card>
  );
};
