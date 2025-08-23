import { Alert, CircularProgress, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate, useLoaderData } from "react-router-dom";
import { GuardianHeader } from "../../components/guardian/GuardianHeader";
import { GuardianDetailTab } from "../../features/guardians/GuardianDetailTab";
import { useGetGuardianById, useDeleteGuardian } from "@api/endpoints/guardians/guardians";

const GuardianDetailPage = () => {
  const { t } = useTranslation();
  const { guardianId } = useParams<{ guardianId: string }>();
  const navigate = useNavigate();

  const loaderData = useLoaderData() as any;
  const {
    data: guardian,
    isLoading,
    error,
  } = useGetGuardianById(guardianId!, {
    query: { initialData: loaderData },
  });
  const deleteGuardian = useDeleteGuardian();

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

  const handleDelete = async () => {
    try {
      await deleteGuardian.mutateAsync({ id: guardianId });
      navigate("/guardians");
    } catch (error) {
      console.error("Failed to delete guardian:", error);
    }
  };

  // Linking children to guardian has been removed.

  return (
    <Box
      sx={{
        pb: { xs: 8, md: 6 }, // More bottom padding on mobile for better scrolling
      }}
    >
      {/* Header */}
      <Box sx={{ mb: { xs: 1, md: 2 }, mx: { xs: -2, md: 0 } }}>
        {/* Stretch header edge-to-edge on mobile by negative margin compensating for Container padding in layout */}
        <GuardianHeader
          givenName={guardian.givenName}
          familyName={guardian.familyName}
          email={guardian.email ?? undefined}
          phone={guardian.phoneNumbers?.[0]?.number}
          onDelete={handleDelete}
          loading={deleteGuardian.isPending}
        />
      </Box>

      {/* Content */}
      <Box sx={{ px: { xs: 1, sm: 1.5, md: 0 } }}>
        <GuardianDetailTab guardian={guardian} />
      </Box>

      {/* LinkGuardianToChildDialog removed */}
    </Box>
  );
};

export const Component = GuardianDetailPage;
