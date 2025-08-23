import Toolbar, { type ToolbarProps } from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { ChildrenTable } from "../../features/children/ChildrenTable";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { useChildrenListState } from "@hooks/useChildrenListState";
import { useState, useEffect } from "react";

const StyledToolbar = styled(Toolbar)<ToolbarProps>(() => ({
  marginLeft: "auto",
  marginRight: -12,
}));

const IndexChildPage = () => {
  const { t } = useTranslation();
  const { state, setSearch } = useChildrenListState();
  const [searchInput, setSearchInput] = useState(state.search);

  // Debounce search input (300ms)
  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput !== state.search) setSearch(searchInput);
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput, state.search, setSearch]);

  return (
    <Paper>
      <StyledToolbar>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: "100%" }}>
          <TextField
            size="small"
            fullWidth
            placeholder={t("Search") + "..."}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Box flexGrow={1} />
          <Button
            variant="contained"
            component={Link}
            to="new"
            startIcon={<AddIcon />}
            sx={{ alignSelf: { xs: "stretch", sm: "auto" } }}
          >
            {t("Child")}
          </Button>
        </Stack>
      </StyledToolbar>
      <ChildrenTable />
    </Paper>
  );
};

export const Component = IndexChildPage;
