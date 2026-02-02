import {
  RouterProvider as ReactRouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { type TFunction } from "i18next";
import { updateChildPageLoader } from "@pages/children/updateChildPage.loader";
import { guardianDetailPageLoader } from "@pages/guardians/guardianDetailPage.loader";
import ErrorPage from "@components/ErrorPage";
import { queryClient } from "@lib/query-client/queryClient";
import MainLayout from "@components/MainLayout";
import { requireAuth, withAuth } from "@lib/auth/auth";
import { Component as CallbackPage } from "@pages/auth/CallbackPage";
import { Component as LoginPage } from "@pages/auth/LoginPage";

const router = (t: TFunction<"translation">) =>
  createBrowserRouter([
    {
      path: "/",
      errorElement: <ErrorPage />,
      children: [
        {
          path: "auth",
          children: [
            {
              path: "login",
              element: <LoginPage />,
            },
            {
              path: "callback",
              element: <CallbackPage />,
            },
          ],
        },
        {
          element: <MainLayout />,
          children: [
            {
              index: true,
              element: <Navigate to="/schedule" replace />,
            },
            {
              path: "schedule",
              loader: requireAuth,
              lazy: () => import("../pages/ScheduleOverviewPage"),
              handle: {
                crumb: () => {
                  return t("Schedule Overview");
                },
              },
            },
            {
              path: "print-schedules",
              loader: requireAuth,
              lazy: () => import("@pages/print/PrintSchedulesPage"),
              handle: {
                crumb: () => t("Print Schedules"),
              },
            },
            {
              path: "print-phone-list",
              loader: requireAuth,
              lazy: () => import("@pages/print/PrintPhoneListPage"),
              handle: {
                crumb: () => t("Phone List"),
              },
            },
            {
              path: "children",
              loader: requireAuth,
              handle: {
                crumb: () => {
                  return t("Children");
                },
              },
              children: [
                {
                  index: true,
                  loader: requireAuth,
                  lazy: () => import("@pages/children/IndexChildPage"),
                },
                {
                  path: ":childId",
                  lazy: () => import("@pages/children/UpdateChildPageModernTabs"),
                  loader: withAuth(updateChildPageLoader(queryClient)),
                  handle: {
                    crumb: (
                      data: Awaited<ReturnType<ReturnType<typeof updateChildPageLoader>>>,
                    ) => {
                      return data?.givenName && data?.familyName
                        ? `${data.givenName} ${data.familyName}`
                        : t("Child");
                    },
                  },
                },
                {
                  path: ":childId/planning",
                  lazy: () => import("@pages/children/UpdateChildPageModernTabs"),
                  loader: withAuth(updateChildPageLoader(queryClient)),
                  handle: {
                    crumb: (
                      data: Awaited<ReturnType<ReturnType<typeof updateChildPageLoader>>>,
                    ) => {
                      return data?.givenName && data?.familyName
                        ? `${data.givenName} ${data.familyName}`
                        : t("Child");
                    },
                  },
                },
                {
                  path: "new",
                  lazy: () => import("@pages/children/NewChildPage"),
                  handle: {
                    crumb: () => t("New Child"),
                  },
                },
              ],
            },
            {
              path: "guardians",
              loader: requireAuth,
              handle: {
                crumb: () => {
                  return t("Guardians");
                },
              },
              children: [
                {
                  index: true,
                  lazy: () => import("@pages/guardians/GuardiansPage"),
                },
                {
                  path: "new",
                  lazy: () => import("@pages/guardians/NewGuardianPage"),
                  handle: {
                    crumb: () => {
                      return t("New Guardian");
                    },
                  },
                },
                {
                  path: ":guardianId",
                  lazy: () => import("@pages/guardians/GuardianDetailPage"),
                  loader: withAuth(guardianDetailPageLoader(queryClient)),
                  handle: {
                    crumb: (data: any) =>
                      data?.givenName && data?.familyName
                        ? `${data.givenName} ${data.familyName}`
                        : t("Guardian"),
                  },
                },
              ],
            },
            {
              path: "settings",
              loader: requireAuth,
              handle: {
                crumb: () => {
                  return t("Settings");
                },
              },
              children: [
                {
                  index: true,
                  lazy: () => import("@pages/settings/SettingsPage"),
                },
                {
                  path: "scheduling",
                  lazy: () => import("@pages/settings/SchedulingSettingsPage"),
                  handle: {
                    crumb: () => {
                      return t("Scheduling");
                    },
                  },
                },
                {
                  path: "groups",
                  lazy: () => import("@pages/groups/ListGroupsPage"),
                  handle: {
                    crumb: () => {
                      return t("Groups");
                    },
                  },
                },
                {
                  path: "closure-periods",
                  lazy: () => import("@pages/settings/ClosurePeriodsSettingsPage"),
                  handle: {
                    crumb: () => {
                      return t("Closure Periods");
                    },
                  },
                },
                {
                  path: "endmark-automation",
                  lazy: () => import("@pages/settings/EndMarkSettingsPage"),
                  handle: {
                    crumb: () => {
                      return t("EndMark Automation");
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ]);

export const RouterProvider = () => {
  const { t } = useTranslation();

  return <ReactRouterProvider router={router(t)} />;
};
