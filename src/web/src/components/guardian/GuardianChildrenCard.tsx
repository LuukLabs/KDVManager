import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { People as PeopleIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  useGetGuardianChildren,
  useUnlinkGuardianFromChild,
} from "@api/endpoints/guardians/guardians";
import { getRelationshipLabel, getRelationshipColor } from "@utils/guardianRelationshipTypes";
import { formatDate } from "../../utils/formatDate";
import { EditableCard } from "../cards/EditableCard";
import { LinkedEntityList } from "../linked/LinkedEntityList";

type GuardianChildrenCardProps = {
  guardianId: string;
};

export const GuardianChildrenCard: React.FC<GuardianChildrenCardProps> = ({ guardianId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [unlinkingChild, setUnlinkingChild] = useState<string | null>(null);
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any | null>(null); // TODO: type with generated child type when available

  const {
    data: children = [],
    isLoading: childrenLoading,
    refetch: refetchChildren,
  } = useGetGuardianChildren(guardianId);
  const unlinkMutation = useUnlinkGuardianFromChild();

  const handleUnlinkChild = async (childId: string) => {
    setUnlinkingChild(childId);
    try {
      await unlinkMutation.mutateAsync({ childId, guardianId });
      await refetchChildren();
    } catch {
      // Intentionally swallow error (could surface toast notification later)
    } finally {
      setUnlinkingChild(null);
      setUnlinkDialogOpen(false);
      setSelectedChild(null);
    }
  };

  // Linking children has been removed; no actions displayed.
  const cardActions = undefined;

  const content = childrenLoading ? (
    <Box display="flex" justifyContent="center" p={2}>
      <CircularProgress size={28} />
    </Box>
  ) : (
    <LinkedEntityList
      items={children.map((c) => ({
        id: c.childId ?? c.fullName,
        primaryText: c.fullName,
        chips: [
          {
            label: getRelationshipLabel(c.relationshipType),
            variant: "outlined" as const,
            color: getRelationshipColor(c.relationshipType) as any,
          },
          ...(c.isPrimaryContact
            ? [{ label: "Primary", color: "primary", variant: "filled" as const }]
            : []),
          ...(c.isEmergencyContact
            ? [{ label: "Emergency", color: "error", variant: "filled" as const }]
            : []),
        ],
        secondaryLines: [
          `Born: ${formatDate(c.dateOfBirth)}${c.age ? ` (${c.age} years old)` : ""}`,
          c.cid ? `CID: ${c.cid}` : "",
        ].filter(Boolean),
        navigateTo: c.childId ? `/children/${c.childId}` : undefined,
        unlinkDisabled: unlinkingChild === c.childId,
      }))}
      onNavigate={(path) => navigate(path)}
      onUnlink={(id) => {
        const match = children.find((c) => c.childId === id);
        if (match?.childId) {
          setSelectedChild(match);
          setUnlinkDialogOpen(true);
        }
      }}
      unlinkLoadingId={unlinkingChild}
      emptyContent={<Alert severity="info">{t("No children linked to this guardian")}</Alert>}
    />
  );

  return (
    <EditableCard
      title={t("Children")}
      icon={<PeopleIcon color="primary" />}
      actions={cardActions}
      collapsible={false}
    >
      {content}
      <Dialog open={unlinkDialogOpen} onClose={() => setUnlinkDialogOpen(false)}>
        <DialogTitle>{t("Unlink Child")}</DialogTitle>
        <DialogContent>
          <Typography>
            {t(
              "Are you sure you want to unlink {{name}} from this guardian? This action can be reversed by linking them again.",
              { name: selectedChild?.fullName },
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnlinkDialogOpen(false)}>{t("Cancel")}</Button>
          <Button
            onClick={() => {
              if (selectedChild?.childId) handleUnlinkChild(selectedChild.childId);
            }}
            color="error"
            disabled={unlinkMutation.isPending}
          >
            {unlinkMutation.isPending ? t("Unlinking...") : t("Unlink")}
          </Button>
        </DialogActions>
      </Dialog>
    </EditableCard>
  );
};
