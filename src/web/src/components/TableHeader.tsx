import React, { ReactNode } from "react";
import { Col, Row, Space } from "antd";

type TableHeaderProps = {
  children: ReactNode;
};

export const TableHeader = ({ children }: TableHeaderProps) => (
  <Row justify="end">
    <Col>
      <Space style={{ marginBottom: 16 }}>{children}</Space>
    </Col>
  </Row>
);
