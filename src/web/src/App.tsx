import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./components/ErrorPage";
import MainNavbar from "./components/MainNavbar";
import { IndexChildPage } from "./pages/children/IndexChildPage";
import { NewChildPage } from "./pages/children/NewChildPage";
import { ListGroupsPage } from "./pages/groups/ListGroupsPage";
import { IndexPersonPage } from "./pages/people/IndexPersonPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainNavbar />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "children/",
        element: <IndexChildPage />,
      },
      {
        path: "people/",
        element: <IndexPersonPage />,
      },
      {
        path: "children/new",
        element: <NewChildPage />,
      },
      {
        path: "groups/",
        element: <ListGroupsPage />,
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
