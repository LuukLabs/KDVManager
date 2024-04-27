import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./components/ErrorPage";
import MainNavbar from "./components/MainNavbar";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainNavbar />,
    errorElement: <ErrorPage />,
    children: [
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
  return (
    <React.Fragment>
      <RouterProvider router={router} />
    </React.Fragment>
  );
}

export default App;
