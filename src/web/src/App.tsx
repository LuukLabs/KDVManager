import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ErrorPage from "./components/ErrorPage";
import MainLayout from "./components/AuthProviderLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    handle: {
      crumb: () => "Home",
    },
    children: [
      {
        path: "children/:childId",
        lazy: () => import("./pages/children/UpdateChildPage"),
      },
      {
        path: "children",
        lazy: () => import("./pages/children/IndexChildPage"),
        handle: {
          crumb: () => "Children",
        },
      },
      {
        path: "people",
        lazy: () => import("./pages/people/IndexPersonPage"),
        handle: {
          crumb: () => "People",
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
          crumb: () => "Groups",
        },
      },
      {
        path: "settings",
        handle: {
          crumb: () => "Settings",
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
              crumb: () => "Scheduling",
            },
          },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
