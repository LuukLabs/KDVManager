import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

interface ChildHeaderProps {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  group?: string;
  cid?: string;
  isArchived?: boolean;
  archivedAt?: string;
  onEdit?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  loading?: boolean;
  editMode?: boolean;
}

export const ChildHeader: React.FC<ChildHeaderProps> = ({
  firstName,
  lastName,
  dateOfBirth,
  group,
  cid,
  isArchived,
  archivedAt,
  onEdit,
  onArchive,
  onDelete,
  loading = false,
  editMode = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const getFullName = () => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    return "Unknown Child";
  };

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return "?";
  };

  const calculateAge = () => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return `${age - 1} years`;
    }
    return `${age} years`;
  };

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: "white",
        p: 3,
        borderRadius: 3,
        mb: 3,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 80%, ${alpha("#fff", 0.1)} 0%, transparent 50%), 
                       radial-gradient(circle at 80% 20%, ${alpha("#fff", 0.05)} 0%, transparent 50%)`,
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
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: alpha("#fff", 0.2),
                color: "primary.main",
                fontSize: "1.5rem",
                fontWeight: "bold",
              }}
            >
              {loading ? <PersonIcon /> : getInitials()}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  fontSize: isMobile ? "1.75rem" : "2rem",
                }}
              >
                {getFullName()}
              </Typography>
              
              <Typography
                variant="subtitle1"
                sx={{
                  opacity: 0.9,
                  fontSize: "1rem",
                  mb: 1,
                }}
              >
                Child Record {group && `• Group: ${group}`}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  label={calculateAge()}
                  size="small"
                  sx={{
                    backgroundColor: alpha("#fff", 0.2),
                    color: "white",
                    "& .MuiChip-label": { fontWeight: 600 },
                  }}
                />
                {isArchived && (
                  <Chip
                    label={`Archived${archivedAt ? ` on ${new Date(archivedAt).toLocaleDateString()}` : ""}`}
                    size="small"
                    sx={{
                      backgroundColor: theme.palette.warning.main,
                      color: "white",
                      "& .MuiChip-label": { fontWeight: 600 },
                    }}
                  />
                )}
              </Stack>
            </Box>
          </Box>

          {/* Actions */}
          {!editMode && (
            <Stack
              direction={isMobile ? "row" : "row"}
              spacing={1}
              sx={{ mt: isMobile ? 2 : 0 }}
            >
              {onEdit && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={onEdit}
                  disabled={loading}
                  sx={{
                    borderColor: alpha("#fff", 0.5),
                    color: "white",
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: alpha("#fff", 0.1),
                    },
                  }}
                >
                  Edit
                </Button>
              )}
              
              {onArchive && !isArchived && (
                <Button
                  variant="outlined"
                  startIcon={<ArchiveIcon />}
                  onClick={onArchive}
                  disabled={loading}
                  sx={{
                    borderColor: alpha(theme.palette.warning.main, 0.7),
                    color: theme.palette.warning.main,
                    "&:hover": {
                      borderColor: theme.palette.warning.main,
                      backgroundColor: alpha(theme.palette.warning.main, 0.1),
                    },
                  }}
                >
                  Archive
                </Button>
              )}
              
              {onDelete && (
                <Button
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={onDelete}
                  disabled={loading}
                  sx={{
                    borderColor: alpha(theme.palette.error.main, 0.7),
                    color: theme.palette.error.main,
                    "&:hover": {
                      borderColor: theme.palette.error.main,
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                    },
                  }}
                >
                  Delete
                </Button>
              )}
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
};
