import { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  InputAdornment,
} from "@mui/material";
import { Add, Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { GuardiansTable } from "@features/guardians/GuardiansTable";
import { useTranslation } from "react-i18next";

const GuardiansPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddGuardian = () => {
    navigate("/guardians/new");
  };

  return (
    <Container maxWidth="lg">
      <Box py={3}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            {t("Guardians")}
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleAddGuardian}>
            {t("Add Guardian")}
          </Button>
        </Box>

        {/* Search and Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              placeholder={t("Search guardians...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
          </Box>
        </Paper>

        {/* Guardians Table */}
        <Paper>
          <GuardiansTable searchTerm={searchTerm} />
        </Paper>
      </Box>
    </Container>
  );
};

export const Component = GuardiansPage;
