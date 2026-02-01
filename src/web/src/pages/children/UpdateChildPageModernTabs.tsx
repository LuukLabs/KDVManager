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
        pb: { xs: 8, md: 6 }, // More bottom padding on mobile for better scrolling
      }}
    >
      {/* Header */}
      <Box sx={{ mb: { xs: 1, md: 2 }, mx: { xs: -2, md: 0 } }}>
        {/* Stretch header edge-to-edge on mobile by negative margin compensating for Container padding in layout */}
        <ChildHeader
          firstName={child.givenName}
          lastName={child.familyName}
          dateOfBirth={child.dateOfBirth}
          cid={child.cid ?? undefined}
          isActive={child.isActive}
          lastActiveDate={child.lastActiveDate}
        />
      </Box>

      {/* Sticky Tabs (segmented) */}
      <Paper
        elevation={isMobile ? 2 : 0}
        sx={{
          position: { xs: "sticky", md: "static" },
          top: { xs: 0, md: 0 }, // Simple 0 for mobile to stick to top
          zIndex: 100, // Higher z-index to ensure it stays above content
          backgroundColor: "background.default",
          backdropFilter: { xs: "blur(8px)", md: "none" }, // Subtle backdrop blur on mobile when sticky
          borderRadius: { xs: 0, md: 2 }, // Sharp corners on mobile for better edge-to-edge feel
          px: { xs: 0, md: 2 },
          mx: { xs: -2, md: 0 }, // Stretch edge-to-edge on mobile
          mb: { xs: 0, md: 2 },
          borderColor: "divider",
          borderBottom: { xs: 1, md: 0 }, // Bottom border on mobile for separation
          borderBottomColor: { xs: "divider", md: "transparent" },
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          // Add shadow when sticky on mobile for better visual separation
          boxShadow: {
            xs: "0 2px 8px rgba(0,0,0,0.1)",
            md: "none",
          },
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? "fullWidth" : "standard"}
          sx={{
            minHeight: { xs: 56, md: 48 }, // Larger touch target on mobile
            flex: 1,
            "& .MuiTab-root": {
              minHeight: { xs: 56, md: 48 }, // 56px minimum touch target for mobile
              fontSize: { xs: "0.875rem", md: "0.95rem" },
              fontWeight: 600,
              textTransform: "none",
              borderRadius: { xs: 0, md: 3 }, // No border radius on mobile
              mx: { xs: 0, md: 0.5 },
              py: { xs: 1.5, md: 1.25 }, // More vertical padding on mobile
              minWidth: { xs: "auto", md: 120 }, // Auto width on mobile, min width on desktop
              "&.Mui-selected": {
                color: "primary.contrastText",
                backgroundColor: "primary.main",
                fontWeight: 700, // Bolder text for selected state
              },
              "&:not(.Mui-selected)": {
                "&:hover": {
                  backgroundColor: { xs: "transparent", md: "action.hover" }, // No hover on mobile
                },
              },
            },
            "& .MuiTabs-flexContainer": {
              gap: { xs: 0, md: 1 }, // No gap on mobile for full-width effect
            },
            "& .MuiTabs-indicator": {
              display: "none",
            },
          }}
        >
          <Tab
            icon={<PersonIcon fontSize="small" />}
            iconPosition="start"
            label={t("General")}
            {...a11yProps(0)}
          />
          <Tab
            icon={<ScheduleIcon fontSize="small" />}
            iconPosition="start"
            label={t("Planning")}
            {...a11yProps(1)}
          />
        </Tabs>
      </Paper>

      <Divider sx={{ mb: 2, mt: { xs: 2, md: 0 }, display: { xs: "none", md: "block" } }} />

      {/* Content Panels */}
      <Box sx={{ px: { xs: 0, md: 0 }, mt: { xs: 2, md: 0 } }}>
        <CustomTabPanel value={activeTab} index={0}>
          <Box sx={{ p: { sm: 1.5, md: 0 } }}>
            <GeneralInformationTab child={child} />
          </Box>
        </CustomTabPanel>
        <CustomTabPanel value={activeTab} index={1}>
          <Box sx={{ p: { sm: 1.5, md: 0 } }}>
            <PlanningTab childId={childId} />
          </Box>
        </CustomTabPanel>
      </Box>
    </Box>
  );
};

export const Component = UpdateChildPageModernTabs;
