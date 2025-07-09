import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ErrorPage from "./components/ErrorPage";
import MainLayout from "./components/AuthProviderLayout";
import { type TFunction } from "i18next";
import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import { updateChildPageLoader } from "./pages/children/updateChildPage.loader";

const router = (queryClient: QueryClient, t: TFunction<"translation", undefined>) =>
  createBrowserRouter([
    {
      path: "/",
      element: <MainLayout />,
      errorElement: <ErrorPage />,
      handle: {
        crumb: () => {
          return t("Home");
        },
      },
      children: [
        {
          index: true,
          element: <Navigate to="/schedule" replace />,
        },
        {
          path: "schedule",
          lazy: () => import("./pages/ScheduleOverviewPage"),
          handle: {
            crumb: () => {
              return t("Schedule Overview");
            },
          },
        },
        {
          path: "children/:childId",
          lazy: () => import("./pages/children/UpdateChildPage"),
          loader: updateChildPageLoader(queryClient),
          handle: {
            crumb: (data: any) => {
              return data?.firstName && data?.lastName 
                ? `${data.firstName} ${data.lastName}`
                : t("Child");
            },
          },
        },
        {
          path: "children",
          lazy: () => import("./pages/children/IndexChildPage"),
          handle: {
            crumb: () => {
              return t("Children");
            },
          },
        },
        {
          path: "people",
          lazy: () => import("./pages/people/IndexPersonPage"),
          handle: {
            crumb: () => {
              return t("People");
            },
          },
        },
        {
          path: "children/new",
          lazy: () => import("./pages/children/NewChildPage"),
        },
        {
          path: "groups",
          lazy: () => import("./pages/groups/ListGroupsPage"),
          handle: {
            crumb: () => {
              return t("Groups");
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
              lazy: () => import("./pages/settings/SettingsPage"),
            },
            {
              path: "scheduling",
              lazy: () => import("./pages/settings/SchedulingSettingsPage"),
              handle: {
                crumb: () => {
                  return t("Scheduling");
                },
              },
            },
          ],
        },
      ],
    },
  ]);

function App() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return <RouterProvider router={router(queryClient, t)} />;
}

export default App;
