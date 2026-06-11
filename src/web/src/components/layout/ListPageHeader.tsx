import { type ReactNode, useId } from "react";
import { styled, alpha } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Fade from "@mui/material/Fade";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/CloseRounded";
import { useTranslation } from "react-i18next";

const HeaderPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2, 2, 1.5),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.12)}, ${alpha(theme.palette.background.paper, 0.9)})`,
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
    "&:hover": { boxShadow: theme.shadows[1] },
    "&.Mui-focused": {
      boxShadow: theme.shadows[2],
      background: alpha(theme.palette.background.paper, 0.9),
    },
  },
}));

export type ListPageHeaderProps = {
  title: string;
  description?: string;
  /** Primary action, e.g. an "Add …" button. */
  action?: ReactNode;
  /** Current (committed) search value; enables the search row when defined together with onSearchChange. */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Accessible label for the search input; falls back to the placeholder. */
  searchLabel?: string;
};

/**
 * Gradient page header for list/overview pages: title, description, primary
 * action and an optional search row with an active-filter chip.
 * The active filter is announced to screen readers via a polite status region.
 */
export const ListPageHeader = ({
  title,
  description,
  action,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchLabel,
}: ListPageHeaderProps) => {
  const { t } = useTranslation();
  const headingId = useId();
  const hasSearch = !!searchValue?.trim();
  const showSearch = searchValue !== undefined && onSearchChange !== undefined;

  return (
    <HeaderPaper elevation={0} role="region" aria-labelledby={headingId}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
          alignItems: { sm: "center" },
        }}
      >
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography id={headingId} variant="h5" component="h1">
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              {description}
            </Typography>
          )}
        </Box>
        {action}
      </Box>
      {showSearch && (
        <>
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
              alignItems: { xs: "flex-start", sm: "center" },
            }}
          >
            <SearchField
              size="small"
              fullWidth
              aria-label={searchLabel ?? searchPlaceholder}
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <Fade in={hasSearch} unmountOnExit>
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          edge="end"
                          aria-label={t("Clear search", { ns: "common" })}
                          onClick={() => onSearchChange("")}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    </Fade>
                  ),
                },
              }}
            />
            <Box role="status" aria-live="polite">
              {hasSearch && (
                <Chip
                  label={`${t("Filter")}: ${searchValue}`}
                  onDelete={() => onSearchChange("")}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
          <Divider flexItem sx={{ mt: 1 }} />
        </>
      )}
    </HeaderPaper>
  );
};
