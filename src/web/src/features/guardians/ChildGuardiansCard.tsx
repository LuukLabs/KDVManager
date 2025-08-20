import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ChildGuardianVM } from "../../api/models/childGuardianVM";
import { Typography, Box, Button, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, useTheme, useMediaQuery } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { LinkExistingGuardianDialog } from "./LinkExistingGuardianDialog";
import { AccentSection } from "../../components/layout/AccentSection";
import {
  useGetChildGuardians,
  useUnlinkGuardianFromChild,
} from "@api/endpoints/guardians/guardians";
import { getRelationshipLabel, getRelationshipColor } from "@utils/guardianRelationshipTypes";
import { LinkedEntityList } from "../../components/linked/LinkedEntityList";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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

  const handleNavigateGuardian = (guardianId: string) => {
    navigate(`/guardians/${guardianId}`);
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
      <AccentSection variant="outlined" borderColor="primary.main" padding="normal">
        <Box>
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems={{ xs: "flex-start", md: "center" }} 
            mb={2}
            flexDirection={{ xs: "column", sm: "row" }}
            gap={{ xs: 2, sm: 1 }}
          >
            <Typography variant="h6">{t("Guardians")}</Typography>
            <Box display="flex" gap={1} flexDirection={{ xs: "column", sm: "row" }} width={{ xs: "100%", sm: "auto" }}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setLinkDialogOpen(true)}
                size={isMobile ? "large" : "small"}
                fullWidth={isMobile}
                disabled={loading}
                sx={{
                  minHeight: { xs: 48, md: "auto" },
                  fontSize: { xs: "1rem", md: "0.875rem" },
                  fontWeight: 600,
                }}
              >
                {t("Link Guardian")}
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
            <LinkedEntityList
              items={guardians.map((g) => ({
                id: g.guardianId ?? g.fullName,
                primaryText: g.fullName,
                avatarText: getInitials(g.fullName),
                chips: [
                  { label: t(getRelationshipLabel(g.relationshipType)), variant: 'outlined' as const, color: getRelationshipColor(g.relationshipType) as any },
                  ...(g.isPrimaryContact ? [{ label: t('Primary'), color: 'primary', variant: 'filled' as const }] : []),
                  ...(g.isEmergencyContact ? [{ label: t('Emergency'), color: 'error', variant: 'filled' as const }] : []),
                ],
                secondaryLines: [
                  [g.phoneNumber, g.email].filter(Boolean).join(' • '),
                ].filter(Boolean),
                navigateTo: g.guardianId ? `/guardians/${g.guardianId}` : undefined,
                unlinkDisabled: unlinkMutation.isPending,
              }))}
              onNavigate={(path) => {
                const idPart = path.split('/').pop();
                handleNavigateGuardian(idPart ?? '');
              }}
              onUnlink={(id) => {
                const match = guardians.find((g) => g.guardianId === id);
                if (match) handleUnlinkClick(match);
              }}
              unlinkLoadingId={unlinkMutation.isPending ? (selectedGuardian?.guardianId ?? null) : null}
              emptyContent={null}
            />
          )}
        </Box>
      </AccentSection>

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
        <DialogActions sx={{ p: { xs: 2, md: 1.5 }, gap: { xs: 1, md: 0.5 } }}>
          <Button 
            onClick={() => setUnlinkDialogOpen(false)}
            size={isMobile ? "large" : "medium"}
            sx={{ 
              minHeight: { xs: 44, md: "auto" },
              px: { xs: 3, md: 2 },
            }}
          >
            {t("Cancel")}
          </Button>
          <Button 
            onClick={handleUnlinkConfirm} 
            color="error" 
            disabled={unlinkMutation.isPending}
            size={isMobile ? "large" : "medium"}
            variant={isMobile ? "contained" : "text"}
            sx={{ 
              minHeight: { xs: 44, md: "auto" },
              px: { xs: 3, md: 2 },
              fontWeight: 600,
            }}
          >
            {unlinkMutation.isPending ? t("Unlinking...") : t("Unlink")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
