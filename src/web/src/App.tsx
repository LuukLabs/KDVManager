import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { deleteChild, getAllChildren } from "./api/endpoints/children/children";
import ErrorPage from "./components/ErrorPage";
import MainNavbar from "./components/MainNavbar";
import { IndexChildPage } from "./pages/children/IndexChildPage";
import { NewChildPage } from "./pages/children/NewChildPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/children/",
    element: <IndexChildPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/children/new",
    element: <NewChildPage />,
    errorElement: <ErrorPage />,
  },
]);

function App() {
  return (
    <React.Fragment>
      <MainNavbar />
      <RouterProvider router={router} />
    </React.Fragment>
  );
}

export default App;
