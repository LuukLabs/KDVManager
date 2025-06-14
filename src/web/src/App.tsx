import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ErrorPage from "./components/ErrorPage";
import MainLayout from "./components/AuthProviderLayout";
import { type TFunction } from "i18next";

const router = (t: TFunction<"translation", undefined>) =>
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
          path: "home",
          lazy: () => import("./pages/HomePage"),
        },
        {
          path: "children/:childId",
          lazy: () => import("./pages/children/UpdateChildPage"),
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

  return <RouterProvider router={router(t)} />;
}

export default App;
