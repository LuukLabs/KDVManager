import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Fade,
  Card,
  CardContent,
} from "@mui/material";
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
    <Container
      maxWidth={false}
      sx={{
        py: { xs: 2, md: 3 },
        px: { xs: 2, md: 4 },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <ChildHeader
          firstName={child.givenName}
          lastName={child.familyName}
          dateOfBirth={child.dateOfBirth}
          cid={child.cid ?? undefined}
          isArchived={!!child.archivedAt}
          archivedAt={child.archivedAt ?? undefined}
        />
      </Box>

      {/* Main Card with Integrated Tabs */}
      <Card
        sx={{
          borderRadius: { xs: 2, md: 3 },
          boxShadow: (theme) => theme.shadows[2],
        }}
      >
        {/* Tabs Header */}
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? "fullWidth" : "standard"}
            sx={{
              px: { xs: 2, md: 3 },
              "& .MuiTab-root": {
                minHeight: { xs: 48, md: 64 },
                fontSize: { xs: "0.875rem", md: "1rem" },
                fontWeight: 600,
                textTransform: "none",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
                "&.Mui-selected": {
                  color: "primary.main",
                },
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            <Tab
              icon={<PersonIcon />}
              iconPosition={isMobile ? "top" : "start"}
              label={t("General Information")}
              {...a11yProps(0)}
            />
            <Tab
              icon={<ScheduleIcon />}
              iconPosition={isMobile ? "top" : "start"}
              label={t("Planning & Schedule")}
              {...a11yProps(1)}
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <CardContent
          sx={{
            p: 0,
            "&:last-child": { pb: 0 },
          }}
        >
          <CustomTabPanel value={activeTab} index={0}>
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <GeneralInformationTab child={child} />
            </Box>
          </CustomTabPanel>

          <CustomTabPanel value={activeTab} index={1}>
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <PlanningTab childId={childId} />
            </Box>
          </CustomTabPanel>
        </CardContent>
      </Card>
    </Container>
  );
};

export const Component = UpdateChildPageModernTabs;
