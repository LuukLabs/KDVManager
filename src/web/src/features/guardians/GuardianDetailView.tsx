/* eslint-disable i18next/no-literal-string */
import { Box, Typography, Grid, Chip, Button, IconButton, List, ListItem, ListItemText, Alert, CircularProgress, Tooltip, Stack } from "@mui/material";
import { Add, Phone, Email, LinkOff } from "@mui/icons-material";
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
          <AccentSection borderColor="secondary.main">
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Given Name
                </Typography>
                <Typography variant="body1" fontWeight={500}>{guardian.givenName}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Family Name
                </Typography>
                <Typography variant="body1" fontWeight={500}>{guardian.familyName}</Typography>
              </Grid>
              {guardian.dateOfBirth && (
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Date of Birth
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>{formatDate(guardian.dateOfBirth)}</Typography>
                </Grid>
              )}
            </Grid>
          </AccentSection>
        </Grid>
        {/* Contact */}
        <Grid size={{ xs: 12, md: 6 }}>
          <AccentSection borderColor="secondary.main">
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Contact
            </Typography>
            <Stack spacing={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Email fontSize="small" color="action" />
                <Typography variant="body1" fontWeight={500}>{guardian.email}</Typography>
              </Box>
              {guardian.phoneNumbers && guardian.phoneNumbers.length > 0 ? (
                guardian.phoneNumbers.map((p) => (
                  <Box key={p.id} display="flex" alignItems="center" gap={1}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body1" fontWeight={500}>{p.number}</Typography>
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
          <AccentSection borderColor="secondary.main">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600}>Children</Typography>
              <Button variant="outlined" startIcon={<Add />} onClick={onLinkChild} size="small">
                Link Child
              </Button>
            </Box>
            {childrenLoading ? (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={28} />
              </Box>
            ) : children.length === 0 ? (
              <Alert severity="info">No children linked to this guardian</Alert>
            ) : (
              <List disablePadding>
                {children.map((child) => (
                  <ListItem
                    key={child.childId}
                    divider
                    component={child.childId ? "button" : "div"}
                    onClick={() => child.childId && navigate(`/children/${child.childId}`)}
                    sx={{
                      cursor: child.childId ? "pointer" : "default",
                      border: "none",
                      background: "none",
                      width: "100%",
                      textAlign: "left",
                      px: 0,
                      py: 1,
                    }}
                    disableGutters
                    secondaryAction={
                      <Tooltip title="Unlink child">
                        <span>
                          <IconButton
                            edge="end"
                            color="warning"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (child.childId) {
                                handleUnlinkChild(child.childId);
                              }
                            }}
                            disabled={unlinkingChild === child.childId || !child.childId}
                            size="small"
                            aria-label="Unlink child"
                          >
                            <LinkOff fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    }
                    {...(child.childId ? { type: "button", tabIndex: 0 } : {})}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                          <Typography variant="body1" fontWeight={500}>{child.fullName}</Typography>
                          <Chip
                            label={getRelationshipLabel(child.relationshipType)}
                            size="small"
                            color={getRelationshipColor(child.relationshipType) as any}
                            variant="outlined"
                          />
                          {child.isPrimaryContact && (
                            <Chip label="Primary" size="small" color="primary" />
                          )}
                          {child.isEmergencyContact && (
                            <Chip label="Emergency" size="small" color="error" />
                          )}
                          {child.isArchived && (
                            <Chip label="Archived" size="small" color="warning" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Born: {formatDate(child.dateOfBirth)} {child.age && `(${child.age} years old)`}
                          </Typography>
                          {child.cid && (
                            <Typography variant="body2" color="text.secondary">
                              CID: {child.cid}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </AccentSection>
        </Grid>
      </Grid>
    </Box>
  );
};
