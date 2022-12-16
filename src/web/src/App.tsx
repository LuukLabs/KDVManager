import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import React from "react";
import { Routes, Route } from "react-router-dom";
import MainNavbar from "./components/MainNavbar";
import { IndexChildPage } from "./pages/children/IndexChildPage";

function App() {
  return (
    <React.Fragment>
      <MainNavbar />
      <Container maxWidth="xl">
        <Routes>
          <Route path="children" element={<IndexChildPage />} />
        </Routes>
      </Container>
    </React.Fragment>
  );
}

export default App;
