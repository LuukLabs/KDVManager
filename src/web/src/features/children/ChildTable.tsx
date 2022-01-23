import React, { useState } from "react";
import { ColumnType } from "antd/es/table";
import { Table } from "antd";
import { ChildListVM } from "../../api/models";

import { Link } from "react-router-dom";
import { useGetAllChildren } from "../../api/endpoints/children/children";

const columns: ColumnType<ChildListVM>[] = [
  {
    title: "Full name",
    render: (child: ChildListVM) => (
      <Link to={`/children/${child.id}`}>{child.fullName}</Link>
    ),
  },
  {
    title: "DateOfBirth",
    dataIndex: "dateOfBirth",
  },
];

const ChildTable = () => {
  const [pagination, setPagination] = useState({ pageSize: 5, page: 1 });
  const { data: children, isLoading } = useGetAllChildren();

  return (
    <Table<ChildListVM>
      rowKey="id"
      loading={isLoading}
      columns={columns}
      dataSource={children}
    />
  );
};

export default ChildTable;
