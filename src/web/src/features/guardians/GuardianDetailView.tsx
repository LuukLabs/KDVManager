/* eslint-disable i18next/no-literal-string */
import { Box, Typography, Grid, Chip, Button, Alert, CircularProgress, Stack } from "@mui/material";
import { Add, Phone, Email } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { type GuardianDetailVM } from "@api/models/guardianDetailVM";
import {
  useGetGuardianChildren,
  useUnlinkGuardianFromChild,
} from "@api/endpoints/guardians/guardians";
import { getRelationshipLabel, getRelationshipColor } from "@utils/guardianRelationshipTypes";
import { GuardianHeader } from "../../components/guardian/GuardianHeader";
import { AccentSection } from "../../components/layout/AccentSection";
import { LinkedEntityList } from "../../components/linked/LinkedEntityList";

type GuardianDetailViewProps = {
  guardian: GuardianDetailVM;
  isLoading?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onLinkChild?: () => void;
};

export const GuardianDetailView = ({
  guardian,
  isLoading = false,
  onEdit,
  onDelete,
  onLinkChild,
}: GuardianDetailViewProps) => {
  const navigate = useNavigate();
  const [unlinkingChild, setUnlinkingChild] = useState<string | null>(null);

  const {
    data: children = [],
    isLoading: childrenLoading,
    refetch: refetchChildren,
  } = useGetGuardianChildren(guardian.id ?? "");
  const unlinkMutation = useUnlinkGuardianFromChild();

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("nl-NL");
  };

  const handleUnlinkChild = async (childId: string) => {
    setUnlinkingChild(childId);
    try {
      await unlinkMutation.mutateAsync({ childId, guardianId: guardian.id ?? "" });
      await refetchChildren();
    } catch {
      // Intentionally swallow error (could surface toast notification later)
    } finally {
      setUnlinkingChild(null);
    }
  };

  return (
    <Box>
      <GuardianHeader
        givenName={guardian.givenName}
        familyName={guardian.familyName}
        email={guardian.email ?? undefined}
        phone={guardian.phoneNumbers?.[0]?.number}
        onEdit={onEdit ?? (() => navigate(`/guardians/${guardian.id}/edit`))}
        onDelete={onDelete}
        onLinkChild={onLinkChild}
        loading={isLoading}
      />
      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <AccentSection borderColor="secondary.main" variant="subtle" padding="normal">
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Given Name
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {guardian.givenName}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Family Name
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {guardian.familyName}
                </Typography>
              </Grid>
              {guardian.dateOfBirth && (
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Date of Birth
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formatDate(guardian.dateOfBirth)}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </AccentSection>
        </Grid>
        {/* Contact */}
        <Grid size={{ xs: 12, md: 6 }}>
          <AccentSection borderColor="secondary.main" variant="subtle" padding="normal">
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Contact
            </Typography>
            <Stack spacing={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Email fontSize="small" color="action" />
                <Typography variant="body1" fontWeight={500}>
                  {guardian.email}
                </Typography>
              </Box>
              {guardian.phoneNumbers && guardian.phoneNumbers.length > 0 ? (
                guardian.phoneNumbers.map((p) => (
                  <Box key={p.id} display="flex" alignItems="center" gap={1}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body1" fontWeight={500}>
                      {p.number}
                    </Typography>
                    <Chip label={p.type} size="small" variant="outlined" />
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No phone numbers
                </Typography>
              )}
            </Stack>
          </AccentSection>
        </Grid>
        {/* Children */}
        <Grid size={{ xs: 12 }}>
          <AccentSection borderColor="secondary.main" variant="outlined" padding="normal">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600}>
                Children
              </Typography>
              <Button variant="outlined" startIcon={<Add />} onClick={onLinkChild} size="small">
                Link Child
              </Button>
            </Box>
            {childrenLoading ? (
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
                    ...(c.isArchived
                      ? [{ label: "Archived", color: "warning", variant: "filled" as const }]
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
                emptyContent={<Alert severity="info">No children linked to this guardian</Alert>}
              />
            )}
          </AccentSection>
        </Grid>
      </Grid>
    </Box>
  );
};
