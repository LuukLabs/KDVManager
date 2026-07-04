import { useEffect, useId, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { styled, alpha } from "@mui/material/styles";
import Toolbar, { type ToolbarProps } from "@mui/material/Toolbar";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/CloseRounded";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Fade from "@mui/material/Fade";
import Divider from "@mui/material/Divider";

const StyledToolbar = styled(Toolbar)<ToolbarProps>(({ theme }) => ({
  padding: 0,
  gap: theme.spacing(1.5),
  flexWrap: "wrap",
  alignItems: "flex-start",
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

type ListPageSearch = {
  /** The currently applied search term (from the list state). */
  value: string;
  /** Called with the debounced input value. */
  onSearch: (value: string) => void;
  placeholder: string;
  label: string;
};

type ListPageSearchToolbarProps = {
  search: ListPageSearch;
};

const SEARCH_DEBOUNCE_MS = 300;

const ListPageSearchToolbar = ({ search }: ListPageSearchToolbarProps) => {
  const { t } = useTranslation();
  const { value, onSearch } = search;
  const [input, setInput] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (input !== value) onSearch(input);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [input, value, onSearch]);

  const hasSearch = !!value.trim();

  return (
    <StyledToolbar disableGutters>
      <SearchField
        size="small"
        fullWidth
        aria-label={search.label}
        placeholder={search.placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        slotProps={{
          input: {
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
                  onClick={() => setInput("")}
                >
                  <ClearIcon fontSize="small" />
                </InputAdornment>
              </Fade>
            ),
          },
        }}
      />
      {hasSearch && (
        <Chip
          label={t("Filter") + ": " + value}
          onDelete={() => setInput("")}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ ml: { xs: 0, sm: 1 } }}
        />
      )}
    </StyledToolbar>
  );
};

type ListPageAddButtonProps = {
  label: string;
  /** Route to navigate to (rendered as a link), e.g. "new". */
  to?: string;
  /** Click handler, e.g. to open a create dialog. */
  onClick?: () => void;
};

/**
 * The primary "Add …" action of a list page, styled consistently across
 * pages. Pass either `to` (link) or `onClick` (dialog).
 */
export const ListPageAddButton = ({ label, to, onClick }: ListPageAddButtonProps) => (
  <Button
    variant="contained"
    startIcon={<AddIcon />}
    sx={{ width: { xs: "100%", sm: "auto" }, minWidth: { sm: 160 } }}
    {...(to ? { component: RouterLink, to } : { onClick })}
  >
    {label}
  </Button>
);

type ListPageLayoutProps = {
  title: string;
  description?: string;
  /** Primary page action, e.g. an "Add …" button. */
  action?: ReactNode;
  /** When set, renders the debounced search toolbar in the header. */
  search?: ListPageSearch;
  children: ReactNode;
};

/**
 * Shared shell for list pages: a header with title, description and primary
 * action, an optional search toolbar, and a content surface for the table.
 * Use this for every list/overview page so they all look and behave the same.
 */
export const ListPageLayout = ({
  title,
  description,
  action,
  search,
  children,
}: ListPageLayoutProps) => {
  const headingId = useId();

  return (
    <Stack spacing={2} sx={{ pb: 2 }}>
      <HeaderPaper elevation={0} role="region" aria-labelledby={headingId}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1.5,
            alignItems: { sm: "center" },
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography id={headingId} variant="h5" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                {description}
              </Typography>
            )}
          </Box>
          {action && (
            <Box sx={{ alignSelf: { xs: "stretch", sm: "flex-start" }, display: "flex" }}>
              {action}
            </Box>
          )}
        </Box>
        {search && <ListPageSearchToolbar search={search} />}
        <Divider flexItem sx={{ mt: 1 }} />
      </HeaderPaper>
      <Paper elevation={0} sx={{ p: { xs: 1, sm: 2 }, borderRadius: 3 }}>
        {children}
      </Paper>
    </Stack>
  );
};
