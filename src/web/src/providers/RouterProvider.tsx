import {
  RouterProvider as ReactRouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { type TFunction } from "i18next";
import { updateChildPageLoader } from "@pages/children/updateChildPage.loader";
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
                  lazy: () => import("@pages/children/UpdateChildPage"),
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
                },
              ],
            },
            {
              path: "people",
              lazy: () => import("@pages/people/IndexPersonPage"),
              handle: {
                crumb: () => {
                  return t("People");
                },
              },
            },
            {
              path: "settings",
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
