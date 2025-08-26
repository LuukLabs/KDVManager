import { useState, useEffect } from "react";
import Toolbar, { type ToolbarProps } from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { GuardiansTable } from "@features/guardians/GuardiansTable";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import { styled, alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/CloseRounded";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Fade from "@mui/material/Fade";
import Divider from "@mui/material/Divider";
import { useGuardiansListState } from "@hooks/useGuardiansListState";

const StyledToolbar = styled(Toolbar)<ToolbarProps>(({ theme }) => ({
  marginLeft: "auto",
  marginRight: -12,
  padding: theme.spacing(1, 2),
  gap: theme.spacing(1.5),
  flexWrap: "wrap",
  alignItems: "flex-start",
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.15)}, ${alpha(theme.palette.background.paper, 0.5)})`,
  [theme.breakpoints.up("sm")]: {
    alignItems: "center",
  },
}));

const HeaderPaper = styled(Paper)(({ theme }) => ({
  // Scale the border radius only if it's a number (MUI theme allows number | string in custom themes)
  borderRadius:
    typeof theme.shape.borderRadius === "number"
      ? theme.shape.borderRadius * 1.25
      : theme.shape.borderRadius,
  padding: theme.spacing(2, 2, 1.5),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.default, 0.6)})`,
  backdropFilter: "blur(6px)",
  boxShadow: theme.shadows[1],
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(2.5, 3, 2),
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    background: alpha(theme.palette.background.paper, 0.6),
    backdropFilter: "blur(4px)",
    transition: theme.transitions.create(["box-shadow", "background-color"]),
    boxShadow: theme.shadows[0],
    "&:hover": { boxShadow: theme.shadows[1] },
    "&.Mui-focused": {
      boxShadow: theme.shadows[2],
      background: alpha(theme.palette.background.paper, 0.9),
    },
  },
}));

const GuardiansPage = () => {
  const { t } = useTranslation();
  const { state, setSearch } = useGuardiansListState();
  const [searchInput, setSearchInput] = useState(state.search);

  // Debounce search input (300ms)
  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput !== state.search) setSearch(searchInput);
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput, state.search, setSearch]);

  const hasSearch = !!state.search.trim();

  return (
    <Stack spacing={2} sx={{ pb: 2 }}>
      <HeaderPaper elevation={0} role="region" aria-labelledby="guardians-heading">
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          gap={1.5}
          alignItems={{ sm: "center" }}
        >
          <Box flexGrow={1}>
            <Typography id="guardians-heading" variant="h5" fontWeight={600} lineHeight={1.2}>
              {t("Guardians")}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {t("Manage and explore the registered guardian records.")}
            </Typography>
          </Box>
          <Button
            variant="contained"
            component={Link}
            to="new"
            startIcon={<AddIcon />}
            sx={{ alignSelf: { xs: "stretch", sm: "flex-start" }, minWidth: { sm: 160 } }}
          >
            {t("Add Guardian")}
          </Button>
        </Box>
        <StyledToolbar disableGutters sx={{ p: 0, background: "transparent", m: 0 }}>
          <SearchField
            size="small"
            fullWidth
            aria-label={t("Search guardians")}
            placeholder={t("Search guardians") + "…"}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <Fade in={hasSearch} unmountOnExit>
                  <InputAdornment
                    position="end"
                    sx={{ cursor: "pointer" }}
                    onClick={() => setSearchInput("")}
                  >
                    <ClearIcon fontSize="small" />
                  </InputAdornment>
                </Fade>
              ),
            }}
          />
          {hasSearch && (
            <Chip
              label={t("Filter") + ": " + state.search}
              onDelete={() => setSearchInput("")}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ ml: { xs: 0, sm: 1 } }}
            />
          )}
        </StyledToolbar>
        <Divider flexItem sx={{ mt: 1 }} />
      </HeaderPaper>
      <Paper elevation={0} sx={{ p: { xs: 1, sm: 2 }, borderRadius: 3 }}>
        <GuardiansTable />
      </Paper>
    </Stack>
  );
};

export const Component = GuardiansPage;
