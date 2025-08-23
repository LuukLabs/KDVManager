import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress, Alert } from "@mui/material";
import { People as PeopleIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  useGetGuardianChildren,
  useUnlinkGuardianFromChild,
} from "@api/endpoints/guardians/guardians";
import { getRelationshipLabel, getRelationshipColor } from "@utils/guardianRelationshipTypes";
import { EditableCard } from "../cards/EditableCard";
import { LinkedEntityList } from "../linked/LinkedEntityList";

type GuardianChildrenCardProps = {
  guardianId: string;
};

export const GuardianChildrenCard: React.FC<GuardianChildrenCardProps> = ({ guardianId }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [unlinkingChild, setUnlinkingChild] = useState<string | null>(null);

  const {
    data: children = [],
    isLoading: childrenLoading,
    refetch: refetchChildren,
  } = useGetGuardianChildren(guardianId);
  const unlinkMutation = useUnlinkGuardianFromChild();

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("nl-NL");
  };

  const handleUnlinkChild = async (childId: string) => {
    setUnlinkingChild(childId);
    try {
      await unlinkMutation.mutateAsync({ childId, guardianId });
      await refetchChildren();
    } catch {
      // Intentionally swallow error (could surface toast notification later)
    } finally {
      setUnlinkingChild(null);
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
        if (match?.childId) handleUnlinkChild(match.childId);
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
    </EditableCard>
  );
};
