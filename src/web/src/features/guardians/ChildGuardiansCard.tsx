import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ChildGuardianVM } from "../../api/models/childGuardianVM";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Add, Delete, Phone, Email, Edit, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { LinkExistingGuardianDialog } from "./LinkExistingGuardianDialog";
import {
  useGetChildGuardians,
  useUnlinkGuardianFromChild,
} from "@api/endpoints/guardians/guardians";
import { getRelationshipLabel, getRelationshipColor } from "@utils/guardianRelationshipTypes";

// Type definitions (to be replaced with generated API types)
// Using generated ChildGuardianVM type from API client

type ChildGuardiansCardProps = {
  childId: string;
  isLoading?: boolean;
  onUnlinkGuardian?: (guardianId: string) => Promise<void>;
  onLinkGuardian?: (data: any) => Promise<void>;
  onRefresh?: () => void;
};

export const ChildGuardiansCard = ({
  childId,
  isLoading: externalLoading = false,
  onRefresh,
}: ChildGuardiansCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
  const [selectedGuardian, setSelectedGuardian] = useState<ChildGuardianVM | null>(null);

  const { data: guardians = [], isLoading, refetch } = useGetChildGuardians(childId);
  const unlinkMutation = useUnlinkGuardianFromChild();

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleViewGuardian = (guardianId: string) => {
    navigate(`/guardians/${guardianId}`);
  };

  const handleEditGuardian = (guardianId: string) => {
    navigate(`/guardians/${guardianId}/edit`);
  };

  const handleUnlinkClick = (guardian: ChildGuardianVM) => {
    if (!guardian.guardianId) return;
    setSelectedGuardian(guardian);
    setUnlinkDialogOpen(true);
  };

  const handleUnlinkConfirm = async () => {
    if (!selectedGuardian) return;

    try {
      await unlinkMutation.mutateAsync({ childId, guardianId: selectedGuardian.guardianId! });
      refetch();
      if (onRefresh) onRefresh();
      setUnlinkDialogOpen(false);
      setSelectedGuardian(null);
    } catch (error) {
      console.error("Failed to unlink guardian:", error);
    }
  };

  const handleLinkSuccess = () => {
    refetch();
    if (onRefresh) onRefresh();
    setLinkDialogOpen(false);
  };

  const loading = isLoading || externalLoading;

  return (
    <>
      <Card
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderLeftWidth: { xs: 4, md: 6 },
          borderLeftColor: 'primary.main',
          borderRadius: 3,
          background: (theme) => `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">{t("Guardians")}</Typography>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setLinkDialogOpen(true)}
                size="small"
                disabled={loading}
              >
                {t("Link Guardian")}
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate("/guardians/new")}
                size="small"
              >
                {t("New Guardian")}
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={24} />
            </Box>
          ) : guardians.length === 0 ? (
            <Alert severity="info">
              {t(
                "No guardians linked to this child. You can link existing guardians or create new ones.",
              )}
            </Alert>
          ) : (
            <List disablePadding>
              {guardians.map((guardian, index) => (
                <ListItem
                  key={guardian.guardianId}
                  divider={index < guardians.length - 1}
                  sx={{ px: 0 }}
                >
                  <Box display="flex" alignItems="center" width="100%">
                    {/* Avatar */}
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        mr: 2,
                        width: 48,
                        height: 48,
                      }}
                    >
                      {getInitials(guardian.fullName)}
                    </Avatar>

                    {/* Main Content */}
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {guardian.fullName}
                        </Typography>
                        <Chip
                          label={getRelationshipLabel(guardian.relationshipType)}
                          size="small"
                          color={getRelationshipColor(guardian.relationshipType) as any}
                          variant="outlined"
                        />
                        {guardian.isPrimaryContact && (
                          <Chip
                            label={t("Primary")}
                            size="small"
                            color="primary"
                            variant="filled"
                          />
                        )}
                        {guardian.isEmergencyContact && (
                          <Chip
                            label={t("Emergency")}
                            size="small"
                            color="error"
                            variant="filled"
                          />
                        )}
                      </Box>

                      {/* Contact Info */}
                      <Box display="flex" flexWrap="wrap" gap={2} mb={1}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Phone fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {guardian.phoneNumber}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Email fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {guardian.email}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box display="flex" flexDirection="column" gap={0.5} ml={2}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() =>
                          guardian.guardianId && handleViewGuardian(guardian.guardianId)
                        }
                        title={t("View Details")}
                        disabled={!guardian.guardianId}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() =>
                          guardian.guardianId && handleEditGuardian(guardian.guardianId)
                        }
                        title={t("Edit Guardian")}
                        disabled={!guardian.guardianId}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => guardian.guardianId && handleUnlinkClick(guardian)}
                        title={t("Unlink Guardian")}
                        disabled={unlinkMutation.isPending || !guardian.guardianId}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Link Existing Guardian Dialog */}
      <LinkExistingGuardianDialog
        open={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        childId={childId}
        onSuccess={handleLinkSuccess}
      />

      {/* Unlink Confirmation Dialog */}
      <Dialog open={unlinkDialogOpen} onClose={() => setUnlinkDialogOpen(false)}>
        <DialogTitle>{t("Unlink Guardian")}</DialogTitle>
        <DialogContent>
          <Typography>
            {t(
              "Are you sure you want to unlink {{name}} from this child? This action can be reversed by linking them again.",
              { name: selectedGuardian?.fullName },
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnlinkDialogOpen(false)}>{t("Cancel")}</Button>
          <Button onClick={handleUnlinkConfirm} color="error" disabled={unlinkMutation.isPending}>
            {unlinkMutation.isPending ? t("Unlinking...") : t("Unlink")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
