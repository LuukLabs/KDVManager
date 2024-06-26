import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ErrorPage from "./components/ErrorPage";
import MainLayout from "./components/AuthProviderLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "children/:childId",
        lazy: () => import("./pages/children/UpdateChildPage"),
      },
      {
        path: "children",
        lazy: () => import("./pages/children/IndexChildPage"),
      },
      {
        path: "people",
        lazy: () => import("./pages/people/IndexPersonPage"),
      },
      {
        path: "children/new",
        lazy: () => import("./pages/children/NewChildPage"),
      },
      {
        path: "groups",
        lazy: () => import("./pages/groups/ListGroupsPage"),
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
