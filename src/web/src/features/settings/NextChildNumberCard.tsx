import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import NumbersIcon from "@mui/icons-material/Numbers";
import { useGetNextChildNumber } from "@api/endpoints/children/children";
import { Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";

export const NextChildNumberCard: React.FC = () => {
  const { t } = useTranslation();
  const { data: nextChildNumber, isLoading, error } = useGetNextChildNumber();

  return (
    <Card sx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      <CardContent sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
        <Box display="flex" alignItems="center">
          <NumbersIcon fontSize="large" />
          <Box ml={2}>
            <Typography variant="h5" component="div">
              {t("Next Child Number")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isLoading ? (
                <Skeleton width={40} />
              ) : error ? (
                t("Error loading")
              ) : (
                `#${nextChildNumber}`
              )}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
