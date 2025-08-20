import { Alert, CircularProgress, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { GuardianDetailView } from "../../features/guardians/GuardianDetailView";
import { LinkGuardianToChildDialog } from "../../features/guardians/LinkGuardianToChildDialog";
import {
  useGetGuardianById,
  useDeleteGuardian,
  useLinkGuardianToChild,
} from "@api/endpoints/guardians/guardians";

const GuardianDetailPage = () => {
  const { t } = useTranslation();
  const { guardianId } = useParams<{ guardianId: string }>();
  const navigate = useNavigate();
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  const { data: guardian, isLoading, error } = useGetGuardianById(guardianId!);
  const deleteGuardian = useDeleteGuardian();
  const linkToChild = useLinkGuardianToChild();

  if (!guardianId) {
    return <Alert severity="error">{t("Guardian ID is required")}</Alert>;
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !guardian) {
    return <Alert severity="error">{t("Guardian not found")}</Alert>;
  }

  const handleEdit = () => {
    navigate(`/guardians/${guardianId}/edit`);
  };

  const handleDelete = async () => {
    try {
      await deleteGuardian.mutateAsync({ id: guardianId });
      navigate("/guardians");
    } catch (error) {
      console.error("Failed to delete guardian:", error);
    }
  };

  const handleLinkChild = () => {
    setLinkDialogOpen(true);
  };

  const handleLinkSubmit = async (data: any) => {
    await linkToChild.mutateAsync({
      childId: data.childId,
      guardianId: guardianId,
      data: data.linkGuardianToChildRequest,
    });
    setLinkDialogOpen(false);
    // Refetch guardian data
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mx: { xs: -2, md: 0 } }}>
        <GuardianDetailView
          guardian={guardian}
          isLoading={deleteGuardian.isPending}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onLinkChild={handleLinkChild}
        />
      </Box>
      <LinkGuardianToChildDialog
        open={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        onSubmit={handleLinkSubmit}
        mode="linkToGuardian"
        preselectedGuardianId={guardianId}
        children={[]}
        guardians={[]}
        isLoading={linkToChild.isPending}
      />
    </Box>
  );
};

export const Component = GuardianDetailPage;
