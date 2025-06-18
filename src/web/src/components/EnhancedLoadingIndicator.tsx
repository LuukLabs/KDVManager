import { Box, LinearProgress, Backdrop, Typography } from "@mui/material";
import { useNavigation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import LoadingAnimation from "./LoadingAnimation";

const EnhancedLoadingIndicator = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [showBackdrop, setShowBackdrop] = useState(false);

  const isLoading = navigation.state === "loading";
  const isSubmitting = navigation.state === "submitting";

  // Show backdrop for longer loading times
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isLoading) {
      timer = setTimeout(() => {
        setShowBackdrop(true);
      }, 500); // Show backdrop after 500ms of loading
    } else {
      setShowBackdrop(false);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isLoading]);

  if (!isLoading && !isSubmitting) {
    return null;
  }

  return (
    <>
      {/* Top loading bar - always show for any loading */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
        }}
      >
        <LinearProgress color={isSubmitting ? "secondary" : "primary"} />
      </Box>

      {/* Backdrop for longer loading times */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: 9998,
          flexDirection: "column",
          gap: 2,
        }}
        open={showBackdrop}
      >
        <LoadingAnimation />
        <Typography variant="h6">{t("loading...")}</Typography>
      </Backdrop>
    </>
  );
};

export default EnhancedLoadingIndicator;
