import React, { useState, useEffect, useCallback } from "react";
import { Box, Tabs, Tab, useTheme, useMediaQuery, Fade, Divider, Paper } from "@mui/material";
import { Person as PersonIcon, Schedule as ScheduleIcon } from "@mui/icons-material";
import { useParams, useLoaderData, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetChildById } from "@api/endpoints/children/children";
import { type updateChildPageLoader } from "./updateChildPage.loader";
import { ChildHeader } from "../../components/child/ChildHeader";
import { GeneralInformationTab } from "./tabs/GeneralInformationTab";
import { PlanningTab } from "./tabs/PlanningTab";

type TabPanelProps = {
  children?: React.ReactNode;
  index: number;
  value: number;
};

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`child-tabpanel-${index}`}
      aria-labelledby={`child-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Fade in={value === index} timeout={200}>
          <Box>{children}</Box>
        </Fade>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `child-tab-${index}`,
    "aria-controls": `child-tabpanel-${index}`,
  };
}

const UpdateChildPageModernTabs = () => {
  const { childId } = useParams() as { childId: string };
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const loaderData = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof updateChildPageLoader>>
  >;

  const { data: child } = useGetChildById(childId, {
    query: { initialData: loaderData },
  });

  // Determine active tab from URL
  const getActiveTab = useCallback(() => {
    const path = location.pathname;
    if (path.includes("/planning")) return 1;
    return 0; // Default to general information
  }, [location.pathname]);

  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Update tab when URL changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname, getActiveTab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);

    // Update URL based on tab
    const basePath = `/children/${childId}`;
    if (newValue === 0) {
      navigate(basePath);
    } else if (newValue === 1) {
      navigate(`${basePath}/planning`);
    }
  };

  if (!child) {
    return null;
  }

  return (
    <Box
      sx={{
        pb: 6, // space for potential bottom elements future
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2, mx: { xs: -2, md: 0 } }}>
        {/* Stretch header edge-to-edge on mobile by negative margin compensating for Container padding in layout */}
        <ChildHeader
          firstName={child.givenName}
          lastName={child.familyName}
          dateOfBirth={child.dateOfBirth}
          cid={child.cid ?? undefined}
          isArchived={!!child.archivedAt}
          archivedAt={child.archivedAt ?? undefined}
        />
      </Box>

      {/* Sticky Tabs (segmented) */}
      <Paper
        elevation={0}
        sx={{
          position: { xs: "sticky", md: "static" },
            top: { xs: 64 + 40, md: 0 }, // app bar approx + breadcrumbs row height
          zIndex: 5,
          backgroundColor: "background.default",
          borderRadius: 8,
          px: { xs: 1, md: 2 },
          mb: 2,
          border: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? "fullWidth" : "standard"}
          sx={{
            minHeight: 48,
            flex: 1,
            "& .MuiTab-root": {
              minHeight: 48,
              fontSize: { xs: "0.8rem", md: "0.95rem" },
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 6,
              mx: { xs: 0.25, md: 0.5 },
              py: { xs: 1, md: 1.25 },
              "&.Mui-selected": {
                color: "primary.contrastText",
                backgroundColor: "primary.main",
              },
            },
            "& .MuiTabs-flexContainer": {
              gap: { xs: 0.5, md: 1 },
            },
            "& .MuiTabs-indicator": {
              display: "none",
            },
          }}
        >
          <Tab
            icon={<PersonIcon fontSize="small" />}
            iconPosition={isMobile ? "start" : "start"}
            label={t("General")}
            {...a11yProps(0)}
          />
          <Tab
            icon={<ScheduleIcon fontSize="small" />}
            iconPosition={isMobile ? "start" : "start"}
            label={t("Planning")}
            {...a11yProps(1)}
          />
        </Tabs>
      </Paper>

      <Divider sx={{ mb: 2, display: { xs: "none", md: "block" } }} />

      {/* Content Panels */}
      <Box sx={{ px: { xs: 0, md: 0 } }}>
        <CustomTabPanel value={activeTab} index={0}>
          <Box sx={{ p: { xs: 0.5, sm: 1.5, md: 0 } }}>
            <GeneralInformationTab child={child} />
          </Box>
        </CustomTabPanel>
        <CustomTabPanel value={activeTab} index={1}>
          <Box sx={{ p: { xs: 0.5, sm: 1.5, md: 0 } }}>
            <PlanningTab childId={childId} />
          </Box>
        </CustomTabPanel>
      </Box>
    </Box>
  );
};

export const Component = UpdateChildPageModernTabs;
