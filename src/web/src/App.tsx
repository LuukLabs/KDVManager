import React from "react";
import { Breadcrumb, Layout, Menu } from "antd";
import { Content, Header } from "antd/lib/layout/layout";
import { Routes, Route } from "react-router-dom";
import { IndexChildPage } from "./pages/children/IndexChildPage";
import { SingleChildPage } from "./pages/children/SingleChildPage";

function App() {
  return (
    <div className="App">
      <Layout>
        <Header className="header">
          <div className="logo" />
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["2"]}>
            <Menu.Item key="1">Home</Menu.Item>
            <Menu.Item key="2">Children</Menu.Item>
          </Menu>
        </Header>
        <Layout style={{ padding: "0 24px 24px" }}>
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <Routes>
              <Route path="children/:childId" element={<SingleChildPage />} />
              <Route path="children" element={<IndexChildPage />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}

export default App;
